import express from 'express';

const router = express.Router();

// Example routes for restaurant management system
router.get('/restaurants', (req, res) => {
  res.json({
    message: 'Get all restaurants',
    data: [
      { id: 1, name: 'Bruno\'s Restaurant US', country: 'USA', status: 'active' },
      { id: 2, name: 'Bruno\'s Restaurant CA', country: 'Canada', status: 'active' },
    ]
  });
});

router.get('/restaurants/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: `Get restaurant ${id}`,
    data: { id: parseInt(id), name: `Bruno's Restaurant ${id}`, country: 'USA', status: 'active' }
  });
});

router.post('/restaurants', (req, res) => {
  const { name, country, status } = req.body;
  res.json({
    message: 'Restaurant created',
    data: { id: Date.now(), name, country, status }
  });
});

// Inventory management routes
router.get('/inventory', (req, res) => {
  res.json({
    message: 'Get inventory items',
    data: [
      { id: 1, item: 'Tomatoes', quantity: 100, unit: 'kg', restaurant_id: 1 },
      { id: 2, item: 'Cheese', quantity: 50, unit: 'kg', restaurant_id: 1 },
    ]
  });
});

// User management routes
router.get('/users', (req, res) => {
  res.json({
    message: 'Get all users',
    data: [
      { id: 1, name: 'John Doe', role: 'manager', restaurant_id: 1 },
      { id: 2, name: 'Jane Smith', role: 'staff', restaurant_id: 1 },
    ]
  });
});

export { router };