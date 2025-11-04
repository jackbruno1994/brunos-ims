import React, { useState, useEffect } from 'react';

// Placeholder types until database models are implemented
interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

const ItemList: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // TODO: Implement API call once backend database is set up
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            // Placeholder - will implement once database is set up
            setItems([]);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <button 
                    onClick={() => console.log('Add new item - pending database implementation')}
                >
                    Add New Item
                </button>
            </div>
            <div>
                {loading ? (
                    <p>Loading items...</p>
                ) : (
                    <p>
                        Inventory management will be available once database is implemented. 
                        Current items: {items.length}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ItemList;