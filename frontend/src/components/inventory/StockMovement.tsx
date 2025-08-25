import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface StockMovement {
  id: string;
  itemId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  uom: string;
  location: string;
  reference: string;
  notes: string;
  timestamp: string;
  createdBy: string;
  item?: {
    id: string;
    name: string;
    sku: string;
  };
}

interface Location {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'PRODUCTION';
  active: boolean;
}

interface Item {
  id: string;
  name: string;
  sku: string;
  baseUom: string;
}

interface StockMovementProps {
  itemId?: string;
  onMovementAdded?: () => void;
}

const StockMovement: React.FC<StockMovementProps> = ({ itemId, onMovementAdded }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    itemId: itemId || '',
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: '',
    location: '',
    reference: '',
    notes: '',
    createdBy: 'current_user' // In a real app, this would come from auth context
  });

  // Filters
  const [filters, setFilters] = useState({
    itemId: itemId || '',
    location: '',
    type: '',
    limit: 50
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (itemId) {
      setFormData(prev => ({ ...prev, itemId }));
      setFilters(prev => ({ ...prev, itemId }));
    }
  }, [itemId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stock movement history
      const movementsResponse = await apiService.inventory.getStockMovementHistory(filters);
      setMovements(movementsResponse.data);
      
      // Fetch locations and items for dropdowns
      const [locationsResponse, itemsResponse] = await Promise.all([
        apiService.inventory.getLocations({ active: true }),
        apiService.inventory.getItems()
      ]);
      
      setLocations(locationsResponse.data);
      setItems(itemsResponse.data);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiService.inventory.recordStockMovement({
        ...formData,
        quantity: parseFloat(formData.quantity)
      });
      
      // Reset form
      setFormData({
        itemId: itemId || '',
        type: 'IN',
        quantity: '',
        location: '',
        reference: '',
        notes: '',
        createdBy: 'current_user'
      });
      
      setShowForm(false);
      fetchData(); // Refresh the movements list
      
      if (onMovementAdded) {
        onMovementAdded();
      }
    } catch (err) {
      setError('Failed to record stock movement');
      console.error('Error recording movement:', err);
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      case 'ADJUSTMENT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return '↗️';
      case 'OUT':
        return '↙️';
      case 'ADJUSTMENT':
        return '⚖️';
      default:
        return '📦';
    }
  };

  if (loading && movements.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Stock Movements</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showForm ? 'Cancel' : 'Record Movement'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Record Movement Form */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Record Stock Movement</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <select
                  value={formData.itemId}
                  onChange={(e) => handleFormChange('itemId', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.code}>
                      {location.name} ({location.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleFormChange('reference', e.target.value)}
                  placeholder="PO number, transfer ref, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Record Movement
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        {!itemId && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Item</label>
              <select
                value={filters.itemId}
                onChange={(e) => handleFilterChange('itemId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Items</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location.id} value={location.code}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>
          </div>
        )}

        {/* Movements List */}
        <div className="space-y-4">
          {movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No stock movements found
            </div>
          ) : (
            movements.map(movement => (
              <div key={movement.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{getMovementIcon(movement.type)}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getMovementTypeColor(movement.type)}`}>
                        {movement.type}
                      </span>
                      <span className="font-medium text-lg">
                        {movement.type === 'OUT' ? '-' : '+'}{movement.quantity} {movement.uom}
                      </span>
                    </div>
                    
                    {movement.item && (
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{movement.item.name}</span> ({movement.item.sku})
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Location: <span className="font-medium">{movement.location}</span>
                    </div>
                    
                    {movement.reference && (
                      <div className="text-sm text-gray-600 mb-1">
                        Reference: <span className="font-medium">{movement.reference}</span>
                      </div>
                    )}
                    
                    {movement.notes && (
                      <div className="text-sm text-gray-600 mb-1">
                        Notes: {movement.notes}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      By: {movement.createdBy}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    {new Date(movement.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StockMovement;