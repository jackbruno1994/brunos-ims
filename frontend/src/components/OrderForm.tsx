import React, { useState } from 'react';
import { CreateOrderData } from '../types/order';
import { apiService } from '../services/api';

interface OrderFormProps {
  onOrderCreated?: () => void;
  onCancel?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated, onCancel }) => {
  const [formData, setFormData] = useState<CreateOrderData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    restaurantId: '1', // Default restaurant
    items: [],
    currency: 'USD',
    notes: '',
  });

  const [currentItem, setCurrentItem] = useState({
    menuItemId: '',
    menuItemName: '',
    quantity: 1,
    unitPrice: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateOrderData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (field: keyof typeof currentItem, value: string | number) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addItem = () => {
    if (!currentItem.menuItemId || !currentItem.menuItemName || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      alert('Please fill in all item fields with valid values');
      return;
    }

    const newItem = {
      ...currentItem,
      id: Date.now().toString(), // Simple ID generation
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Reset current item
    setCurrentItem({
      menuItemId: '',
      menuItemName: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.createOrder(formData);
      onOrderCreated?.();
      
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        restaurantId: '1',
        items: [],
        currency: 'USD',
        notes: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Create New Order</h3>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div style={{ marginBottom: '20px' }}>
          <h4>Customer Information</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Customer Name *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Customer Email *
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Customer Phone
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Restaurant ID
            </label>
            <input
              type="text"
              value={formData.restaurantId}
              onChange={(e) => handleInputChange('restaurantId', e.target.value)}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: '20px' }}>
          <h4>Order Items</h4>
          
          {/* Add Item Form */}
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '15px' }}>
            <h5>Add Item</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 100px 100px 100px', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Menu Item ID</label>
                <input
                  type="text"
                  value={currentItem.menuItemId}
                  onChange={(e) => handleItemChange('menuItemId', e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Menu Item Name</label>
                <input
                  type="text"
                  value={currentItem.menuItemName}
                  onChange={(e) => handleItemChange('menuItemName', e.target.value)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => handleItemChange('quantity', parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentItem.unitPrice}
                  onChange={(e) => handleItemChange('unitPrice', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <button
                type="button"
                onClick={addItem}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div>
              <h5>Order Items ({formData.items.length})</h5>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}
                >
                  <div>
                    <strong>{item.menuItemName}</strong> (ID: {item.menuItemId})
                    <br />
                    <small>Qty: {item.quantity} × ${item.unitPrice.toFixed(2)} = ${(item.quantity * item.unitPrice).toFixed(2)}</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
                Total: ${calculateTotalAmount().toFixed(2)} {formData.currency}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Order Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Any special instructions or notes..."
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || formData.items.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;