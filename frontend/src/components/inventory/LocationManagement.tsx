import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Location {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'STORE' | 'PRODUCTION';
  active: boolean;
}

const LocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'WAREHOUSE' as 'WAREHOUSE' | 'STORE' | 'PRODUCTION',
    active: true
  });

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    active: ''
  });

  useEffect(() => {
    fetchLocations();
  }, [filters]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.type) params.type = filters.type;
      if (filters.active !== '') params.active = filters.active === 'true';
      
      const response = await apiService.inventory.getLocations(params);
      setLocations(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLocation) {
        // In a real app, we would have an update endpoint
        console.log('Update location:', editingLocation.id, formData);
        // For now, just refresh the list
      } else {
        await apiService.inventory.createLocation(formData);
      }
      
      // Reset form
      setFormData({
        code: '',
        name: '',
        type: 'WAREHOUSE',
        active: true
      });
      
      setShowForm(false);
      setEditingLocation(null);
      fetchLocations();
    } catch (err) {
      setError('Failed to save location');
      console.error('Error saving location:', err);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      code: location.code,
      name: location.name,
      type: location.type,
      active: location.active
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLocation(null);
    setFormData({
      code: '',
      name: '',
      type: 'WAREHOUSE',
      active: true
    });
  };

  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case 'WAREHOUSE':
        return 'bg-blue-100 text-blue-800';
      case 'STORE':
        return 'bg-green-100 text-green-800';
      case 'PRODUCTION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'WAREHOUSE':
        return '🏭';
      case 'STORE':
        return '🏪';
      case 'PRODUCTION':
        return '⚙️';
      default:
        return '📍';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Location Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showForm ? 'Cancel' : 'Add Location'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Add/Edit Location Form */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Code*
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleFormChange('code', e.target.value)}
                  required
                  placeholder="e.g., WH-001, STORE-NYC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name*
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                  placeholder="e.g., Main Warehouse, NYC Store"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Type*
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="STORE">Store</option>
                  <option value="PRODUCTION">Production</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.active ? 'true' : 'false'}
                  onChange={(e) => handleFormChange('active', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  {editingLocation ? 'Update Location' : 'Add Location'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="STORE">Store</option>
              <option value="PRODUCTION">Production</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filters.active}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Locations List */}
        <div className="space-y-4">
          {locations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No locations found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(location => (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getLocationTypeIcon(location.type)}</span>
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getLocationTypeColor(location.type)}`}>
                        {location.type}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        location.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {location.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <div>Code: <span className="font-medium">{location.code}</span></div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleEdit(location)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{locations.length}</div>
              <div className="text-sm text-gray-600">Total Locations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {locations.filter(l => l.type === 'WAREHOUSE').length}
              </div>
              <div className="text-sm text-gray-600">Warehouses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {locations.filter(l => l.type === 'STORE').length}
              </div>
              <div className="text-sm text-gray-600">Stores</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {locations.filter(l => l.type === 'PRODUCTION').length}
              </div>
              <div className="text-sm text-gray-600">Production</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationManagement;