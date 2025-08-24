import api from '../utils/api';

export interface Restaurant {
  id: number;
  name: string;
  country: string;
  status: string;
}

export interface InventoryItem {
  id: number;
  item: string;
  quantity: number;
  unit: string;
  restaurant_id: number;
}

export interface User {
  id: number;
  name: string;
  role: string;
  restaurant_id: number;
}

class RestaurantService {
  async getRestaurants(): Promise<Restaurant[]> {
    const response = await api.get('/api/restaurants');
    return response.data.data;
  }

  async getRestaurant(id: number): Promise<Restaurant> {
    const response = await api.get(`/api/restaurants/${id}`);
    return response.data.data;
  }

  async createRestaurant(restaurant: Omit<Restaurant, 'id'>): Promise<Restaurant> {
    const response = await api.post('/api/restaurants', restaurant);
    return response.data.data;
  }
}

class InventoryService {
  async getInventory(): Promise<InventoryItem[]> {
    const response = await api.get('/api/inventory');
    return response.data.data;
  }
}

class UserService {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/api/users');
    return response.data.data;
  }
}

export const restaurantService = new RestaurantService();
export const inventoryService = new InventoryService();
export const userService = new UserService();