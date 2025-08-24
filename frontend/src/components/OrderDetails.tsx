import React from 'react';
import { Order } from '../types/order';

interface OrderDetailsProps {
  order: Order;
  onClose?: () => void;
  onStatusUpdate?: (orderId: string, status: Order['status']) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onClose, onStatusUpdate }) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <h2>Order Details #{order.id}</h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        )}
      </div>

      {/* Order Status */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Order Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 15px',
              borderRadius: '20px',
              backgroundColor: getStatusColor(order.status),
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {order.status.toUpperCase()}
          </div>
          {onStatusUpdate && (
            <div>
              <label style={{ marginRight: '10px' }}>Update Status:</label>
              <select
                value={order.status}
                onChange={(e) => onStatusUpdate(order.id, e.target.value as Order['status'])}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Customer Information */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Customer Information</h3>
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
          <p><strong>Name:</strong> {order.customerName}</p>
          <p><strong>Email:</strong> {order.customerEmail}</p>
          <p><strong>Phone:</strong> {order.customerPhone || 'Not provided'}</p>
          <p><strong>Restaurant ID:</strong> {order.restaurantId}</p>
        </div>
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Order Items</h3>
        <div style={{ border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Item</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Quantity</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Unit Price</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none' }}>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <strong>{item.menuItemName}</strong>
                      <br />
                      <small style={{ color: '#666' }}>ID: {item.menuItemId}</small>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {formatCurrency(item.unitPrice, order.currency)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(item.totalPrice, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                <td style={{ padding: '15px' }} colSpan={3}>Total Amount:</td>
                <td style={{ padding: '15px', textAlign: 'right', fontSize: '18px' }}>
                  {formatCurrency(order.totalAmount, order.currency)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Order Notes</h3>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{order.notes}</p>
          </div>
        </div>
      )}

      {/* Order Timestamps */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Order History</h3>
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
          <p><strong>Created:</strong> {formatDate(order.createdAt)}</p>
          <p><strong>Last Updated:</strong> {formatDate(order.updatedAt)}</p>
        </div>
      </div>

      {/* Summary */}
      <div style={{ backgroundColor: '#e9ecef', padding: '15px', borderRadius: '5px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Order Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <p><strong>Order ID:</strong> #{order.id}</p>
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>Items Count:</strong> {order.items.length}</p>
          </div>
          <div>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount, order.currency)}</p>
            <p><strong>Currency:</strong> {order.currency}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;