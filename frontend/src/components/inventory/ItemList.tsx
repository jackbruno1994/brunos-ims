import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Item } from '../../types/inventory';

const ItemList: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/inventory/items');
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch items', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: Item) => {
        // Implementation for edit functionality
        console.log('Edit item:', item);
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/inventory/items/${id}`);
            console.log('Item deleted successfully');
            fetchItems();
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
                <button 
                    style={{
                        backgroundColor: '#1890ff',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        console.log('Add new item clicked');
                    }}
                >
                    + Add New Item
                </button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>SKU</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Category</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Current Stock</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{item.sku}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{item.name}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{item.category}</td>
                            <td 
                                style={{ 
                                    padding: '12px', 
                                    borderBottom: '1px solid #ddd',
                                    color: item.currentStock <= item.minStock ? 'red' : 'inherit'
                                }}
                            >
                                {item.currentStock}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                                <button 
                                    style={{
                                        marginRight: '8px',
                                        padding: '4px 8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleEdit(item)}
                                >
                                    Edit
                                </button>
                                <button 
                                    style={{
                                        padding: '4px 8px',
                                        border: '1px solid #ff4d4f',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        backgroundColor: '#ff4d4f',
                                        color: 'white'
                                    }}
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                No items found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            
            <div style={{ marginTop: '16px', textAlign: 'center', color: '#666' }}>
                Total {items.length} items
            </div>
        </div>
    );
};

export default ItemList;