import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

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
}

interface InventoryFormProps {
  item?: InventoryItem | null;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ 
  item, 
  onSave, 
  onCancel, 
  isEdit = false 
}) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    currency: 'USD',
    reorderLevel: 0,
    category: '',
    location: '',
    restaurantId: 'rest-001' // Default restaurant ID
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency,
        reorderLevel: item.reorderLevel,
        category: item.category,
        location: item.location,
        restaurantId: item.restaurantId
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number = value;
    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEdit && item) {
        await apiService.updateInventoryItem(item.id, formData);
      } else {
        await apiService.createInventoryItem(formData);
      }
      
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save inventory item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto' }}>
      <h3>{isEdit ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
      
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label>SKU *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              disabled={isEdit}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div>
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div>
            <label>Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="0"
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div>
            <label>Reorder Level *</label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleInputChange}
              min="0"
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div>
            <label>Unit Price *</label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          
          <div>
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
          
          <div>
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            >
              <option value="">Select category</option>
              <option value="Dry Goods">Dry Goods</option>
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>
          
          <div>
            <label>Location *</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            >
              <option value="">Select location</option>
              <option value="Warehouse A">Warehouse A</option>
              <option value="Warehouse B">Warehouse B</option>
              <option value="Cold Storage">Cold Storage</option>
              <option value="Dry Storage">Dry Storage</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Item' : 'Create Item')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;