import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import ItemList from '../components/inventory/ItemList';
import ItemDetail from '../components/inventory/ItemDetail';
import StockMovement from '../components/inventory/StockMovement';
import LocationManagement from '../components/inventory/LocationManagement';

interface StockAlert {
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  reorderPoint: number;
  alertType: 'LOW_STOCK' | 'REORDER_POINT' | 'OUT_OF_STOCK';
  location: string;
}

interface StockLevel {
  itemId: string;
  locationId: string;
  quantity: number;
  uom: string;
  lastUpdated: string;
  item: {
    id: string;
    name: string;
    sku: string;
    minStock: number;
    reorderPoint: number;
  };
  location: {
    id: string;
    name: string;
    code: string;
  };
}

const InventoryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [alertsResponse, stockResponse] = await Promise.all([
        apiService.inventory.getStockAlerts(),
        apiService.inventory.getStockLevels()
      ]);
      
      setAlerts(alertsResponse.data);
      setStockLevels(stockResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: any) => {
    setSelectedItemId(item.id);
    setActiveTab('items');
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'LOW_STOCK':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'REORDER_POINT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'OUT_OF_STOCK':
        return '🚨';
      case 'LOW_STOCK':
        return '⚠️';
      case 'REORDER_POINT':
        return '📊';
      default:
        return '📦';
    }
  };

  const getLowStockItems = () => {
    return stockLevels.filter(level => 
      level.item && level.quantity <= level.item.reorderPoint
    );
  };

  const getTotalItems = () => {
    const uniqueItems = new Set(stockLevels.map(level => level.itemId));
    return uniqueItems.size;
  };

  const getTotalLocations = () => {
    const uniqueLocations = new Set(stockLevels.map(level => level.locationId));
    return uniqueLocations.size;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-3xl">📦</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{getTotalItems()}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-3xl">📍</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{getTotalLocations()}</div>
              <div className="text-sm text-gray-600">Locations</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-3xl">⚠️</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-600">{getLowStockItems().length}</div>
              <div className="text-sm text-gray-600">Low Stock Items</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-3xl">🚨</div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
              <div className="text-sm text-gray-600">Total Alerts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Alerts</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✅</div>
              <div>No stock alerts - all items are well stocked!</div>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getAlertTypeColor(alert.alertType)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getAlertIcon(alert.alertType)}</span>
                      <div>
                        <div className="font-medium">{alert.itemName}</div>
                        <div className="text-sm opacity-75">
                          Current: {alert.currentStock} | Min: {alert.minStock} | Reorder: {alert.reorderPoint}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{alert.location}</div>
                      <div className="text-sm opacity-75">{alert.alertType.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <div className="text-center py-2">
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all {alerts.length} alerts
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Stock Levels */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Levels Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stockLevels.slice(0, 10).map((level, index) => {
                  const isLowStock = level.item && level.quantity <= level.item.reorderPoint;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {level.item?.name || 'Unknown Item'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {level.item?.sku || 'No SKU'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {level.location?.name || 'Unknown Location'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {level.quantity} {level.uom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isLowStock 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {stockLevels.length > 10 && (
            <div className="text-center py-2 mt-4">
              <button
                onClick={() => setActiveTab('stock')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all stock levels
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'items':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ItemList onItemSelect={handleItemSelect} selectedItemId={selectedItemId || undefined} />
            <ItemDetail itemId={selectedItemId} />
          </div>
        );
      case 'stock':
        return <StockMovement />;
      case 'locations':
        return <LocationManagement />;
      default:
        return renderOverview();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          {error}
          <button 
            onClick={fetchDashboardData}
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your inventory items, stock levels, and locations
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'items', name: 'Items', icon: '📦' },
              { id: 'stock', name: 'Stock Movements', icon: '📈' },
              { id: 'locations', name: 'Locations', icon: '📍' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {renderContent()}
      </div>
    </div>
  );
};

export default InventoryDashboard;