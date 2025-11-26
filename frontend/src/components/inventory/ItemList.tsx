import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [sortBy, setSortBy] = useState<'sku' | 'name'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchItems = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEdit = useCallback((item: Item) => {
    // Implementation for edit functionality
    console.log('Edit item:', item);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await axios.delete(`/api/inventory/items/${id}`);
        // Optimized: Update state directly instead of re-fetching all items
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      } catch (err) {
        setError('Failed to delete item');
        console.error(err);
      }
    },
    []
  );

  // Memoize sorted items to prevent unnecessary recalculations
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [items, sortBy]);

  // Memoize paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  if (loading) return <div className="card">Loading items...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          className="button-primary"
          onClick={() => {
            /* Implementation for add new item */
          }}
        >
          + Add New Item
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="sort-select">Sort by: </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'sku' | 'name')}
            style={{ marginLeft: '8px', padding: '4px 8px' }}
          >
            <option value="sku">SKU</option>
            <option value="name">Name</option>
          </select>
        </div>

        {paginatedItems.length === 0 ? (
          <p>No items found. Start by adding your first item.</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>SKU</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Current Stock</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{item.sku}</td>
                      <td style={{ padding: '12px' }}>{item.name}</td>
                      <td style={{ padding: '12px' }}>{item.category}</td>
                      <td
                        style={{
                          padding: '12px',
                          color: item.currentStock <= item.minStock ? 'red' : 'inherit',
                        }}
                      >
                        {item.currentStock}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={{ marginRight: '8px' }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ marginRight: '8px' }}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ marginLeft: '8px' }}
              >
                Next
              </button>
              <span style={{ marginLeft: '16px' }}>Total {sortedItems.length} items</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemList;