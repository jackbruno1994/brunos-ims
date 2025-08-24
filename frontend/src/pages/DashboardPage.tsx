import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLowStockProducts } from '../hooks/useApi';
import Layout from '../components/Layout';
import { Package, AlertTriangle, TrendingUp, Users } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: lowStockData } = useLowStockProducts(user?.restaurantId.toString());

  const lowStockProducts = lowStockData?.data || [];

  const stats = [
    {
      title: 'Total Products',
      value: '150',
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-2%',
    },
    {
      title: 'Monthly Sales',
      value: '$12,450',
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Active Staff',
      value: '8',
      icon: Users,
      color: 'bg-purple-500',
      change: '0%',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <span className={`ml-2 text-sm font-medium ${
                        stat.change.startsWith('+') ? 'text-green-600' : 
                        stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h2 className="text-xl font-semibold text-gray-900 ml-2">Low Stock Alert</h2>
              </div>
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product._id?.toString()} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{product.currentStock} remaining</p>
                      <p className="text-sm text-gray-600">Min: {product.minStockLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-gray-600 mt-4">
                  And {lowStockProducts.length - 5} more items...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Package className="text-blue-500 mb-2" size={24} />
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-sm text-gray-600">Create new inventory item</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <TrendingUp className="text-green-500 mb-2" size={24} />
                <p className="font-medium text-gray-900">Record Sale</p>
                <p className="text-sm text-gray-600">Process a new sale order</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <AlertTriangle className="text-orange-500 mb-2" size={24} />
                <p className="font-medium text-gray-900">Stock Check</p>
                <p className="text-sm text-gray-600">Review inventory levels</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;