import React, { useState } from 'react';
import InventoryList from '../components/inventory/InventoryList';
import InventoryForm from '../components/inventory/InventoryForm';
import LowStockAlerts from '../components/inventory/LowStockAlerts';

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

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'alerts' | 'add'>('list');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditing(false);
    setActiveTab('add'); // Show form in view mode
  };

  const handleItemEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditing(true);
    setActiveTab('add'); // Show form in edit mode
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setActiveTab('add');
  };

  const handleFormSave = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list');
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleFormCancel = () => {
    setActiveTab('list');
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleAlertItemClick = () => {
    // Could fetch the item by ID and select it
    setActiveTab('list');
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #eee' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '2.5rem' }}>Inventory Management</h1>
        <p style={{ margin: '0', color: '#666', fontSize: '1.1rem' }}>Manage your restaurant inventory across all locations</p>
      </div>

      <div style={{ display: 'flex', gap: '2px', marginBottom: '30px', background: '#f8f9fa', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
        <button 
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'list' ? '#007bff' : 'transparent',
            color: activeTab === 'list' ? 'white' : 'inherit',
            cursor: 'pointer',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onClick={() => setActiveTab('list')}
        >
          📦 Inventory List
        </button>
        <button 
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'alerts' ? '#007bff' : 'transparent',
            color: activeTab === 'alerts' ? 'white' : 'inherit',
            cursor: 'pointer',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onClick={() => setActiveTab('alerts')}
        >
          ⚠️ Stock Alerts
        </button>
        <button 
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'add' ? '#007bff' : 'transparent',
            color: activeTab === 'add' ? 'white' : 'inherit',
            cursor: 'pointer',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onClick={handleAddNew}
        >
          ➕ Add Item
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {activeTab === 'list' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <h2 style={{ margin: '0', color: '#333' }}>All Inventory Items</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={triggerRefresh} 
                  style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  🔄 Refresh
                </button>
                <button 
                  onClick={handleAddNew} 
                  style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  ➕ Add New Item
                </button>
              </div>
            </div>
            <InventoryList
              onItemSelect={handleItemSelect}
              onItemEdit={handleItemEdit}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div>
            <LowStockAlerts
              refreshTrigger={refreshTrigger}
              onItemClick={handleAlertItemClick}
            />
          </div>
        )}

        {activeTab === 'add' && (
          <div>
            <InventoryForm
              item={selectedItem}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              isEdit={isEditing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;