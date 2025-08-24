import React, { useState } from 'react';
import OrderList from '../components/OrderList';
import OrderForm from '../components/OrderForm';
import OrderDetails from '../components/OrderDetails';
import { Order } from '../types/order';
import { apiService } from '../services/api';

type ViewMode = 'list' | 'create' | 'details';

const Orders: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('details');
  };

  const handleOrderCreated = () => {
    setViewMode('list');
    setRefreshKey(prev => prev + 1); // Force refresh of order list
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await apiService.updateOrder(orderId, { status });
      
      // Update the selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status,
          updatedAt: new Date().toISOString()
        });
      }
      
      setRefreshKey(prev => prev + 1); // Refresh order list
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <OrderForm
            onOrderCreated={handleOrderCreated}
            onCancel={() => setViewMode('list')}
          />
        );
      
      case 'details':
        return selectedOrder ? (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setViewMode('list')}
            onStatusUpdate={handleStatusUpdate}
          />
        ) : (
          <div>No order selected</div>
        );
      
      default:
        return (
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="page-title">Orders Management</h2>
              <button
                onClick={() => setViewMode('create')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + Create New Order
              </button>
            </div>
            
            <div className="card">
              <h3>All Orders</h3>
              <p>Manage and track all customer orders. Click on an order to view details.</p>
              
              <OrderList
                key={refreshKey} // Force re-render when refreshKey changes
                onOrderSelect={handleOrderSelect}
                onEditOrder={handleOrderSelect} // For now, edit just shows details
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {/* Navigation breadcrumb */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <span
          onClick={() => setViewMode('list')}
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          Orders
        </span>
        {viewMode === 'create' && <span> / Create New Order</span>}
        {viewMode === 'details' && selectedOrder && <span> / Order #{selectedOrder.id}</span>}
      </div>

      {renderContent()}
    </div>
  );
};

export default Orders;