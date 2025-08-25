import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  customerInfo: {
    name: string;
    phone?: string;
    email?: string;
  };
  status: string;
  priority: string;
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  estimatedPrepTime: number;
  createdAt: string;
  updatedAt: string;
}

interface QueueItem {
  orderId: string;
  priority: string;
  estimatedTime: number;
  queuedAt: string;
}

const OrderProcessing: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedRestaurant] = useState("123e4567-e89b-12d3-a456-426614174000");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3001/api';

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001');

    // Join restaurant room for real-time updates
    newSocket.emit('join_restaurant', selectedRestaurant);

    // Listen for real-time events
    newSocket.on('order_created', (order: Order) => {
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('order_status_updated', (data: any) => {
      setOrders(prev => prev.map(order => 
        order.id === data.orderId ? data.order : order
      ));
    });

    newSocket.on('order_queued', (queueItem: QueueItem) => {
      setQueue(prev => [...prev, queueItem]);
    });

    newSocket.on('order_removed_from_queue', (orderId: string) => {
      setQueue(prev => prev.filter(item => item.orderId !== orderId));
    });

    return () => {
      newSocket.close();
    };
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchOrders();
    fetchQueue();
    fetchAnalytics();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/restaurants/${selectedRestaurant}/orders`);
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${API_BASE}/orders/queue?restaurantId=${selectedRestaurant}`);
      if (response.data.success) {
        setQueue(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE}/restaurants/${selectedRestaurant}/analytics/orders`);
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const createTestOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        restaurantId: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID
        customerInfo: {
          name: `Customer ${Math.floor(Math.random() * 1000)}`,
          phone: "1234567890", // Without + sign
          email: "test@example.com"
        },
        type: "dine_in",
        priority: Math.random() > 0.7 ? "high" : "normal",
        items: [{
          id: `item-${Date.now()}`,
          menuItemId: "123e4567-e89b-12d3-a456-426614174001", // Valid UUID
          quantity: Math.floor(Math.random() * 3) + 1,
          unitPrice: 12.99,
          totalPrice: 12.99 * (Math.floor(Math.random() * 3) + 1)
        }],
        subtotal: 12.99,
        tax: 1.04,
        deliveryFee: 0,
        totalAmount: 14.03,
        currency: "USD",
        estimatedPrepTime: Math.floor(Math.random() * 20) + 10,
        source: "pos"
      };

      const response = await axios.post(`${API_BASE}/orders`, orderData);
      if (response.data.success) {
        console.log('Order created successfully');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.patch(`${API_BASE}/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#007bff';
      case 'preparing': return '#fd7e14';
      case 'ready': return '#28a745';
      case 'delivered': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#007bff';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Advanced Order Processing System</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={createTestOrder} 
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : 'Create Test Order'}
        </button>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h3>Analytics Dashboard</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
              <h4>Total Orders</h4>
              <p style={{ fontSize: '24px', color: '#007bff', margin: 0 }}>{analytics.totalOrders}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
              <h4>Avg Order Value</h4>
              <p style={{ fontSize: '24px', color: '#28a745', margin: 0 }}>
                ${analytics.averageOrderValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
              <h4>Avg Processing Time</h4>
              <p style={{ fontSize: '24px', color: '#fd7e14', margin: 0 }}>
                {analytics.averageProcessingTime?.toFixed(1) || '0'} min
              </p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
              <h4>Peak Hours</h4>
              <p style={{ fontSize: '14px', margin: 0 }}>
                {analytics.peakHours?.join(', ') || 'No data'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Orders List */}
        <div>
          <h3>Orders ({orders.length})</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {orders.map(order => (
              <div 
                key={order.id} 
                style={{ 
                  border: '1px solid #dee2e6', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '10px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{order.orderNumber}</h4>
                    <p style={{ margin: '0 0 5px 0', color: '#6c757d' }}>
                      {order.customerInfo.name} • ${order.totalAmount.toFixed(2)}
                    </p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6c757d' }}>
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          backgroundColor: getPriorityColor(order.priority),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      >
                        {order.priority}
                      </span>
                      <span 
                        style={{ 
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '15px',
                          fontSize: '12px'
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          style={{ 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            padding: '5px 10px', 
                            borderRadius: '3px',
                            fontSize: '12px',
                            marginRight: '5px'
                          }}
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          style={{ 
                            backgroundColor: '#fd7e14', 
                            color: 'white', 
                            border: 'none', 
                            padding: '5px 10px', 
                            borderRadius: '3px',
                            fontSize: '12px',
                            marginRight: '5px'
                          }}
                        >
                          Start Prep
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          style={{ 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            padding: '5px 10px', 
                            borderRadius: '3px',
                            fontSize: '12px',
                            marginRight: '5px'
                          }}
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          style={{ 
                            backgroundColor: '#6c757d', 
                            color: 'white', 
                            border: 'none', 
                            padding: '5px 10px', 
                            borderRadius: '3px',
                            fontSize: '12px'
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue */}
        <div>
          <h3>Order Queue ({queue.length})</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {queue.map((item, index) => {
              const order = orders.find(o => o.id === item.orderId);
              return (
                <div 
                  key={item.orderId} 
                  style={{ 
                    border: '1px solid #dee2e6', 
                    borderRadius: '5px', 
                    padding: '10px', 
                    marginBottom: '8px',
                    backgroundColor: index === 0 ? '#e7f3ff' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 3px 0', fontWeight: 'bold' }}>
                        {order?.orderNumber || 'Loading...'}
                      </p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#6c757d' }}>
                        Est: {item.estimatedTime} min
                      </p>
                    </div>
                    <span 
                      style={{ 
                        backgroundColor: getPriorityColor(item.priority),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '10px'
                      }}
                    >
                      {item.priority}
                    </span>
                  </div>
                  {index === 0 && (
                    <div style={{ 
                      marginTop: '5px', 
                      padding: '5px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      borderRadius: '3px', 
                      textAlign: 'center',
                      fontSize: '12px'
                    }}>
                      NOW PROCESSING
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProcessing;