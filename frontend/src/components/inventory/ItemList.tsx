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

interface ItemListProps {
  onItemSelect?: (item: Item) => void;
  selectedItemId?: string;
}

const ItemList: React.FC<ItemListProps> = ({ onItemSelect, selectedItemId }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchItems();
  }, [searchTerm, categoryFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await apiService.inventory.getItems(params);
      setItems(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map((item: Item) => item.category))] as string[];
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleItemClick = (item: Item) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <button 
          onClick={fetchItems}
          className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Inventory Items</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {items.length} items
          </span>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Items
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, SKU, or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items found
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedItemId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                        {item.sku}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Category: <span className="font-medium">{item.category}</span></span>
                      <span>UOM: <span className="font-medium">{item.baseUom}</span></span>
                      <span>Min Stock: <span className="font-medium">{item.minStock}</span></span>
                      <span>Reorder Point: <span className="font-medium">{item.reorderPoint}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Created: {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
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

export default ItemList;