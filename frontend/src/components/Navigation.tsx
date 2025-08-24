import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import styled from 'styled-components';

const StyledAppBar = styled(AppBar)`
  margin-bottom: 2rem;
`;

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Bruno's IMS
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{ 
              backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent' 
            }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/restaurants"
            sx={{ 
              backgroundColor: isActive('/restaurants') ? 'rgba(255,255,255,0.1)' : 'transparent' 
            }}
          >
            Restaurants
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/inventory"
            sx={{ 
              backgroundColor: isActive('/inventory') ? 'rgba(255,255,255,0.1)' : 'transparent' 
            }}
          >
            Inventory
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/users"
            sx={{ 
              backgroundColor: isActive('/users') ? 'rgba(255,255,255,0.1)' : 'transparent' 
            }}
          >
            Users
          </Button>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navigation;