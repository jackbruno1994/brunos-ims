import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { productsAPI, categoriesAPI } from '../services/api';
import './ProductManagement.css';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    stock: {
      current: '',
      minimum: '',
      maximum: ''
    },
    unit: 'piece' as 'piece' | 'kg' | 'liter' | 'gram' | 'ml' | 'box' | 'pack'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll()
      ]);

      if (productsResponse.success && productsResponse.data.products) {
        setProducts(productsResponse.data.products);
      }
      
      if (categoriesResponse.success && categoriesResponse.data.categories) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        stock: {
          current: parseInt(formData.stock.current),
          minimum: parseInt(formData.stock.minimum),
          maximum: formData.stock.maximum ? parseInt(formData.stock.maximum) : undefined
        }
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
      } else {
        await productsAPI.create(productData);
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      category: typeof product.category === 'string' ? product.category : product.category._id,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: {
        current: product.stock.current.toString(),
        minimum: product.stock.minimum.toString(),
        maximum: product.stock.maximum?.toString() || ''
      },
      unit: product.unit
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsAPI.delete(productId);
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: '',
      price: '',
      cost: '',
      stock: { current: '', minimum: '', maximum: '' },
      unit: 'piece'
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return '#dc3545';
      case 'low-stock': return '#fd7e14';
      default: return '#28a745';
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      <div className="header">
        <h2>Product Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Product
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value as any})}
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="liter">Liter</option>
                    <option value="gram">Gram</option>
                    <option value="ml">Milliliter</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current Stock *</label>
                  <input
                    type="number"
                    value={formData.stock.current}
                    onChange={(e) => setFormData({
                      ...formData, 
                      stock: {...formData.stock, current: e.target.value}
                    })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Stock *</label>
                  <input
                    type="number"
                    value={formData.stock.minimum}
                    onChange={(e) => setFormData({
                      ...formData, 
                      stock: {...formData.stock, minimum: e.target.value}
                    })}
                    required
                  />
                </div>

                <div className="form-group span-2">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No products found. Add your first product to get started.
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product._id}>
                  <td>
                    <div className="product-name">
                      <strong>{product.name}</strong>
                      {product.description && (
                        <small>{product.description}</small>
                      )}
                    </div>
                  </td>
                  <td>{product.sku}</td>
                  <td>
                    {typeof product.category === 'object' 
                      ? product.category.name 
                      : product.category}
                  </td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    {product.stock.current} {product.unit}
                    <small>Min: {product.stock.minimum}</small>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStockStatusColor(product.stockStatus) }}
                    >
                      {product.stockStatus.replace('-', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;