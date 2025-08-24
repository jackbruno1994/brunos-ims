import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProducts, useDeleteProduct } from '../hooks/useApi';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { Product } from '@brunos-ims/shared';

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useProducts(user?.restaurantId.toString(), page);
  // const { data: categoriesData } = useCategories(user?.restaurantId.toString());
  // const createProduct = useCreateProduct();
  // const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = productsData?.data || [];
  // const categories = categoriesData?.data || [];

  // TODO: These will be used when implementing the product form
  // const handleCreateProduct = async (productData: Partial<Product>) => {
  //   try {
  //     await createProduct.mutateAsync({
  //       ...productData,
  //       restaurantId: user?.restaurantId,
  //     });
  //     setShowForm(false);
  //   } catch (error) {
  //     // Error handled by mutation
  //   }
  // };

  // const handleUpdateProduct = async (productData: Partial<Product>) => {
  //   if (!editingProduct?._id) return;
    
  //   try {
  //     await updateProduct.mutateAsync({
  //       id: editingProduct._id.toString(),
  //       data: productData,
  //     });
  //     setEditingProduct(null);
  //     setShowForm(false);
  //   } catch (error) {
  //     // Error handled by mutation
  //   }
  // };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(productId);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minStockLevel) {
      return { label: 'Low Stock', color: 'text-red-600 bg-red-100' };
    } else if (product.currentStock <= product.minStockLevel * 1.5) {
      return { label: 'Medium Stock', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { label: 'In Stock', color: 'text-green-600 bg-green-100' };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading products...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your inventory items</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                
                return (
                  <tr key={product._id?.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="text-gray-400 mr-3" size={20} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {/* Category name would need to be populated */}
                      Category
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.currentStock} {product.unit}
                      {product.currentStock <= product.minStockLevel && (
                        <AlertTriangle className="inline ml-2 text-red-500" size={16} />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id!.toString())}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData?.pagination && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {((productsData.pagination.page - 1) * productsData.pagination.limit) + 1} to{' '}
              {Math.min(productsData.pagination.page * productsData.pagination.limit, productsData.pagination.total)} of{' '}
              {productsData.pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= productsData.pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal - Simplified for now */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <p className="text-gray-600 mb-4">
              Product form functionality will be implemented in the next iteration.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProductsPage;