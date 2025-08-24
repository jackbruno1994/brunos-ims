import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { PermissionGate, ProtectedButton } from '../components/RBACComponents';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const Restaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await apiService.getRestaurants();
        setRestaurants(data);
      } catch (err) {
        setError('Failed to fetch restaurants');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleCreateRestaurant = () => {
    alert('Create restaurant functionality would be implemented here');
  };

  const handleEditRestaurant = (id: string) => {
    alert(`Edit restaurant ${id} functionality would be implemented here`);
  };

  if (loading) return <div>Loading restaurants...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="page-title">Restaurants</h2>
      
      <PermissionGate 
        featureGroup="system_administration" 
        permissionType="read"
        fallback={
          <div className="card">
            <h3>Access Denied</h3>
            <p>You don't have permission to view restaurant management.</p>
          </div>
        }
      >
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Restaurant Management</h3>
            <ProtectedButton
              featureGroup="system_administration"
              permissionType="write"
              onClick={handleCreateRestaurant}
              className="login-button"
            >
              + Add Restaurant
            </ProtectedButton>
          </div>
          
          <p>Manage all restaurants across different countries.</p>
          
          {restaurants.length === 0 ? (
            <div className="card">
              <p>No restaurants found. Start by adding your first restaurant.</p>
              <PermissionGate featureGroup="system_administration" permissionType="write">
                <p><em>You have permission to create restaurants.</em></p>
              </PermissionGate>
            </div>
          ) : (
            <div>
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                      <h4>{restaurant.name}</h4>
                      <p><strong>Location:</strong> {restaurant.location}</p>
                      <p><strong>Country:</strong> {restaurant.country}</p>
                      <p><strong>Status:</strong> <span style={{ 
                        color: restaurant.status === 'active' ? '#28a745' : 
                               restaurant.status === 'inactive' ? '#dc3545' : '#ffc107' 
                      }}>{restaurant.status}</span></p>
                    </div>
                    <div>
                      <ProtectedButton
                        featureGroup="system_administration"
                        permissionType="write"
                        onClick={() => handleEditRestaurant(restaurant.id)}
                        className="login-button"
                      >
                        Edit
                      </ProtectedButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ marginTop: '20px' }}>
            <h4>Restaurant Features</h4>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <li>Multi-country restaurant management</li>
              <li>Status tracking (Active, Inactive, Maintenance)</li>
              <li>Location and contact information</li>
              <li>Integration with inventory and user systems</li>
            </ul>
          </div>
        </div>
      </PermissionGate>
    </div>
  );
};

export default Restaurants;