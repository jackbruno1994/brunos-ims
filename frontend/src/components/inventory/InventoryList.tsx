import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import styles from './InventoryList.module.css';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  reorderLevel: number;
  category: string;
  location: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryListProps {
  onItemSelect?: (item: InventoryItem) => void;
  onItemEdit?: (item: InventoryItem) => void;
  refreshTrigger?: number;
}

const InventoryList: React.FC<InventoryListProps> = ({ 
  onItemSelect, 
  onItemEdit, 
  refreshTrigger = 0 
}) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    lowStock: false
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToApply = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== false)
      );
      
      const response = await apiService.getInventoryItems(
        Object.keys(filtersToApply).length > 0 ? filtersToApply : undefined
      );
      
      setItems(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [refreshTrigger, filters]);

  const handleFilterChange = (filterName: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const getStockLevelClass = (item: InventoryItem) => {
    if (item.quantity === 0) return styles.stockCritical;
    if (item.quantity <= item.reorderLevel) return styles.stockLow;
    if (item.quantity <= item.reorderLevel * 1.5) return styles.stockMedium;
    return styles.stockGood;
  };

  const getStockLevelText = (item: InventoryItem) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className={styles.inventoryList}>
        <div className={styles.loading}>Loading inventory items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.inventoryList}>
        <div className={styles.error}>
          Error: {error}
          <button onClick={loadItems} style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inventoryList}>
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label>Category:</label>
            <select 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Dry Goods">Dry Goods</option>
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Location:</label>
            <select 
              value={filters.location} 
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Warehouse A">Warehouse A</option>
              <option value="Warehouse B">Warehouse B</option>
              <option value="Cold Storage">Cold Storage</option>
              <option value="Dry Storage">Dry Storage</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>
              <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
              />
              Low Stock Only
            </label>
          </div>
          
          <button onClick={() => setFilters({ category: '', location: '', lowStock: false })}>
            Clear Filters
          </button>
        </div>
      </div>

      <div className={styles.itemsHeader}>
        <h3>Inventory Items ({items.length})</h3>
        <button onClick={loadItems} className={styles.refreshBtn}>
          Refresh
        </button>
      </div>

      <div className={styles.itemsTable}>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr 
                key={item.id} 
                className={`${styles.itemRow} ${getStockLevelClass(item)}`}
                onClick={() => onItemSelect?.(item)}
              >
                <td>{item.sku}</td>
                <td>
                  <div className={styles.itemName}>
                    <strong>{item.name}</strong>
                    <div className={styles.itemDescription}>{item.description}</div>
                  </div>
                </td>
                <td>{item.category}</td>
                <td>
                  <span className={`${styles.quantity} ${getStockLevelClass(item)}`}>
                    {item.quantity}
                  </span>
                  <div className={styles.reorderLevel}>
                    Reorder: {item.reorderLevel}
                  </div>
                </td>
                <td>{item.currency} {item.unitPrice.toFixed(2)}</td>
                <td>{item.location}</td>
                <td>
                  <span className={`${styles.status} ${getStockLevelClass(item)}`}>
                    {getStockLevelText(item)}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemEdit?.(item);
                      }}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {items.length === 0 && (
          <div className={styles.noItems}>
            No inventory items found.
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;