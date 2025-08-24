import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import Inventory from './pages/Inventory';
import Users from './pages/Users';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
