import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Grid } from '@mui/material';
import { restaurantService, Restaurant } from '../services/api';

const Restaurants: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <Container>
        <Typography>Loading restaurants...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Restaurants
        </Typography>
        <Button variant="contained" color="primary">
          Add Restaurant
        </Button>
      </Box>

      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item xs={12} md={6} lg={4} key={restaurant.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {restaurant.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Country: {restaurant.country}
                </Typography>
                <Typography 
                  color={restaurant.status === 'active' ? 'success.main' : 'warning.main'}
                >
                  Status: {restaurant.status}
                </Typography>
                <Box mt={2}>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                    View Details
                  </Button>
                  <Button size="small" variant="outlined">
                    Edit
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Restaurants;