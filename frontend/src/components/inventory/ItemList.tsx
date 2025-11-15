import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Item {
    id: string;
    sku: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
}

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
            setItems(response.data);
        } catch (err) {
            setError('Failed to fetch items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: Item) => {
        console.log('Edit item:', item);
        // Implementation for edit functionality
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/inventory/items/${id}`);
            alert('Item deleted successfully');
            fetchItems();
        } catch (err) {
            alert('Failed to delete item');
            console.error(err);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '16px' }}>
                <button 
                    onClick={() => console.log('Add new item')}
                >
                    Add New Item
                </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>SKU</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Current Stock</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.sku}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.category}</td>
                            <td 
                                style={{ 
                                    border: '1px solid #ddd', 
                                    padding: '8px',
                                    color: item.currentStock <= item.minStock ? 'red' : 'inherit'
                                }}
                            >
                                {item.currentStock}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button onClick={() => handleEdit(item)} style={{ marginRight: '4px' }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(item.id)} style={{ color: 'red' }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {items.length === 0 && !loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>No items found</div>
            )}
        </div>
    );
};

export default ItemList;