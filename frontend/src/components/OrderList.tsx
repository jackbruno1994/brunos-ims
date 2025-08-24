import React, { useState, useEffect } from 'react';
import { Order } from '../types/order';
import { apiService } from '../services/api';

interface OrderListProps {
  onOrderSelect?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ onOrderSelect, onEditOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getOrders(page, 10);
      let filteredOrders = response.data;

      // Apply status filter
      if (filterStatus !== 'all') {
        filteredOrders = filteredOrders.filter((order: Order) => order.status === filterStatus);
      }

      // Apply sorting
      filteredOrders.sort((a: Order, b: Order) => {
        if (sortBy === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'totalAmount') {
          return b.totalAmount - a.totalAmount;
        } else if (sortBy === 'customerName') {
          return a.customerName.localeCompare(b.customerName);
        }
        return 0;
      });

      setOrders(filteredOrders);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, filterStatus, sortBy]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await apiService.updateOrder(orderId, { status: newStatus });
      fetchOrders(currentPage); // Refresh the list
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Filter by status:
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label>
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ marginLeft: '5px', padding: '5px' }}
          >
            <option value="createdAt">Date Created</option>
            <option value="totalAmount">Total Amount</option>
            <option value="customerName">Customer Name</option>
          </select>
        </label>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order.id}
              className="card"
              style={{ marginBottom: '10px', cursor: 'pointer' }}
              onClick={() => onOrderSelect?.(order)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4>Order #{order.id}</h4>
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Email:</strong> {order.customerEmail}</p>
                  <p><strong>Total:</strong> {formatCurrency(order.totalAmount, order.currency)}</p>
                  <p><strong>Items:</strong> {order.items.length}</p>
                  <p><strong>Created:</strong> {formatDate(order.createdAt)}</p>
                  {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '10px'
                    }}
                  >
                    {order.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                  <div>
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, e.target.value as Order['status']);
                      }}
                      style={{ padding: '5px', fontSize: '12px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {onEditOrder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditOrder(order);
                      }}
                      style={{
                        marginTop: '5px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                style={{ margin: '0 5px', padding: '5px 10px' }}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                style={{ margin: '0 5px', padding: '5px 10px' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderList;