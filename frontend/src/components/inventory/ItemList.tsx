import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Item } from '../../types/inventory';

// TODO: Install Ant Design UI library or implement custom components
// This is a temporary stub to fix build errors
// See ROADMAP.md Phase 2 for UI implementation plan

const ItemList: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/inventory/items');
            setItems(response.data.items || []);
        } catch (err) {
            setError('Failed to fetch items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (_item: Item) => {
        // TODO: Implement edit functionality
        console.log('Edit functionality not implemented yet');
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/inventory/items/${id}`);
            alert('Item deleted successfully');
            fetchItems();
        } catch (err) {
            alert('Failed to delete item');
            console.error('Error deleting item:', err);
        }
    };

    if (loading) {
        return <div className="loading">Loading items...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="item-list">
            <div style={{ marginBottom: '16px' }}>
                <button 
                    className="btn-primary"
                    onClick={() => console.log('Add new item functionality not implemented yet')}
                >
                    + Add New Item
                </button>
            </div>
            <table className="items-table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Current Stock</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center' }}>
                                No items found. Database implementation pending.
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id}>
                                <td>{item.sku}</td>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td style={{ color: item.currentStock <= item.minStock ? 'red' : 'inherit' }}>
                                    {item.currentStock}
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(item)}>Edit</button>
                                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div style={{ marginTop: '16px' }}>
                Total {items.length} items
            </div>
        </div>
    );
};

export default ItemList;