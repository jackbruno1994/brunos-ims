import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Item {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  baseUom: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  createdAt: string;
  updatedAt: string;
}

interface StockLevel {
  itemId: string;
  locationId: string;
  quantity: number;
  uom: string;
  lastUpdated: string;
  location: {
    id: string;
    name: string;
    code: string;
  };
}

interface ItemDetailProps {
  itemId: string | null;
  onClose?: () => void;
  onEdit?: (item: Item) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ itemId, onClose, onEdit }) => {
  const [item, setItem] = useState<Item | null>(null);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId]);

  const fetchItemDetails = async () => {
    if (!itemId) return;
    
    try {
      setLoading(true);
      
      // Fetch item details
      const itemResponse = await apiService.inventory.getItemById(itemId);
      setItem(itemResponse.data);
      
      // Fetch stock levels for this item
      const stockResponse = await apiService.inventory.getStockLevels({ itemId });
      setStockLevels(stockResponse.data);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch item details');
      console.error('Error fetching item details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (currentStock: number, minStock: number, reorderPoint: number) => {
    if (currentStock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (currentStock <= minStock) {
      return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    } else if (currentStock <= reorderPoint) {
      return { label: 'Reorder Point', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  if (!itemId) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          Select an item to view details
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Item not found'}
          <button 
            onClick={fetchItemDetails}
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
            <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded">
              SKU: {item.sku}
            </span>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Item Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Item Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{item.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900">{item.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base UOM</label>
                <p className="text-sm text-gray-900">{item.baseUom}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Stock Thresholds</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Stock</label>
                <p className="text-sm text-gray-900">{item.minStock} {item.baseUom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Stock</label>
                <p className="text-sm text-gray-900">{item.maxStock} {item.baseUom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reorder Point</label>
                <p className="text-sm text-gray-900">{item.reorderPoint} {item.baseUom}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Stock Levels</h3>
          {stockLevels.length === 0 ? (
            <div className="text-center py-4 text-gray-500 border rounded-lg">
              No stock levels found for this item
            </div>
          ) : (
            <div className="space-y-3">
              {stockLevels.map((level, index) => {
                const status = getStockStatus(level.quantity, item.minStock, item.reorderPoint);
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{level.location.name}</h4>
                        <p className="text-sm text-gray-600">{level.location.code}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold">{level.quantity} {level.uom}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(level.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span> {new Date(item.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {new Date(item.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;