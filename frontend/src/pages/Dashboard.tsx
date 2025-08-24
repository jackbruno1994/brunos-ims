import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import styled from 'styled-components';

const StyledContainer = styled(Container)`
  margin-top: 2rem;
`;

const Dashboard: React.FC = () => {
  return (
    <StyledContainer maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom>
        Bruno's IMS Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Integrated Management System for Multi-Country Restaurant Groups
      </Typography>
      
      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Restaurants
                </Typography>
                <Typography color="text.secondary">
                  Manage restaurant locations across multiple countries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Inventory
                </Typography>
                <Typography color="text.secondary">
                  Track inventory levels and manage supplies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Users
                </Typography>
                <Typography color="text.secondary">
                  Manage staff and user access across locations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </StyledContainer>
  );
};

export default Dashboard;