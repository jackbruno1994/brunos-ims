import React, { useState, useEffect, useCallback, memo } from 'react';
import { apiService } from '../services/api';

interface Restaurant {
  id: string;
  name: string;
  location: string;
  country: string;
  status: 'active' | 'inactive' | 'maintenance';
}

// Memoized component for individual restaurant cards
const RestaurantCard = memo(({ restaurant }: { restaurant: Restaurant }) => {
  // Define status colors as constants to avoid recreation
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#28a745';
      case 'inactive':
        return '#dc3545';
      default:
        return '#ffc107';
    }
  };

  return (
    <div className="card">
      <h4>{restaurant.name}</h4>
      <p>
        <strong>Location:</strong> {restaurant.location}
      </p>
      <p>
        <strong>Country:</strong> {restaurant.country}
      </p>
      <p>
        <strong>Status:</strong>{' '}
        <span style={{ color: getStatusColor(restaurant.status) }}>{restaurant.status}</span>
      </p>
    </div>
  );
});

RestaurantCard.displayName = 'RestaurantCard';

const Restaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError('Failed to fetch restaurants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  if (loading) return <div className="card">Loading restaurants...</div>;
  if (error) return <div className="card">Error: {error}</div>;

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
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
