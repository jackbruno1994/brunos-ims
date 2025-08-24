import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

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

  if (loading) return <div>Loading restaurants...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="page-title">Restaurants</h2>
      <div className="card">
        <h3>Restaurant Management</h3>
        <p>Manage all restaurants across different countries.</p>
        
        {restaurants.length === 0 ? (
          <p>No restaurants found. Start by adding your first restaurant.</p>
        ) : (
          <div>
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="card">
                <h4>{restaurant.name}</h4>
                <p><strong>Location:</strong> {restaurant.location}</p>
                <p><strong>Country:</strong> {restaurant.country}</p>
                <p><strong>Status:</strong> <span style={{ 
                  color: restaurant.status === 'active' ? '#28a745' : 
                         restaurant.status === 'inactive' ? '#dc3545' : '#ffc107' 
                }}>{restaurant.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;