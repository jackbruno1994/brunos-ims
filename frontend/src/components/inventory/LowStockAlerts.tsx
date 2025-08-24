import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface InventoryAlert {
  id: string;
  inventoryItemId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  resolvedAt?: string;
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorderLevel: number;
  location: string;
}

interface LowStockAlertsProps {
  refreshTrigger?: number;
  onItemClick?: () => void;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ 
  refreshTrigger = 0, 
  onItemClick 
}) => {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load alerts and low stock items
      const [alertsResponse, lowStockResponse] = await Promise.all([
        apiService.getInventoryAlerts(showUnreadOnly),
        apiService.getLowStockItems()
      ]);
      
      setAlerts(alertsResponse.data || []);
      setLowStockItems(lowStockResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [refreshTrigger, showUnreadOnly]);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await apiService.markAlertAsRead(alertId);
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, isRead: true, resolvedAt: new Date().toISOString() }
          : alert
      ));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading alerts...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
        Error: {error}
        <button onClick={loadAlerts} style={{ marginLeft: '10px' }}>Retry</button>
      </div>
    );
  }

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = lowStockItems.filter(item => item.quantity === 0).length;
  const lowStockCount = lowStockItems.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel).length;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #eee' }}>
        <h3>Stock Alerts</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 15px', borderRadius: '8px', background: '#ffebee', color: '#c62828', minWidth: '80px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{criticalCount}</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Out of Stock</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 15px', borderRadius: '8px', background: '#fff3e0', color: '#e65100', minWidth: '80px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{lowStockCount}</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Low Stock</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 15px', borderRadius: '8px', background: '#e3f2fd', color: '#1565c0', minWidth: '80px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{unreadCount}</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Unread</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          Show unread only
        </label>
        <button 
          onClick={loadAlerts} 
          style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Refresh
        </button>
      </div>

      {/* System Alerts */}
      <div style={{ marginBottom: '30px' }}>
        <h4>System Alerts ({alerts.length})</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>
              {showUnreadOnly ? 'No unread alerts' : 'No alerts found'}
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '15px', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  borderLeft: `4px solid ${alert.severity === 'critical' ? '#dc3545' : alert.severity === 'high' ? '#fd7e14' : '#ffc107'}`, 
                  background: alert.isRead ? 'white' : '#f8f9fa', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                }}
              >
                <div style={{ fontSize: '20px' }}>
                  {alert.alertType === 'out_of_stock' ? '❌' : '⚠️'}
                  {alert.severity === 'critical' ? '🔴' : alert.severity === 'high' ? '🟠' : '🟡'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', marginBottom: '6px' }}>{alert.message}</div>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#666' }}>
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    {alert.resolvedAt && (
                      <span>Resolved: {new Date(alert.resolvedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      style={{ padding: '4px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={onItemClick}
                    style={{ padding: '4px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    View Item
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Low Stock Items */}
      <div>
        <h4>Low Stock Items ({lowStockItems.length})</h4>
        {lowStockItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontStyle: 'italic' }}>
            All items are well stocked! 🎉
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {lowStockItems.map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  padding: '15px', 
                  borderRadius: '8px', 
                  border: `1px solid ${item.quantity === 0 ? '#dc3545' : '#ffc107'}`, 
                  background: item.quantity === 0 ? '#fff5f5' : '#fffbf0', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={onItemClick}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#666' }}>{item.sku}</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    background: item.quantity === 0 ? '#dc3545' : '#ffc107',
                    color: item.quantity === 0 ? 'white' : '#000'
                  }}>
                    {item.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                  </span>
                </div>
                <div style={{ fontWeight: '500', marginBottom: '8px' }}>{item.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#666' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 'bold' }}>Current: {item.quantity}</span>
                    <span>Reorder: {item.reorderLevel}</span>
                  </div>
                  <div>{item.location}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;