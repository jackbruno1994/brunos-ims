import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, Category, ApiResponse, PaginatedResponse } from '@brunos-ims/shared';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Products
export const useProducts = (restaurantId?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['products', restaurantId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (restaurantId) {
        params.append('restaurantId', restaurantId);
      }
      
      const response = await api.get<PaginatedResponse<Product>>(`/products?${params}`);
      return response.data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const response = await api.post<ApiResponse<Product>>('/products', productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to create product';
      toast.error(message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update product';
      toast.error(message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<any>>(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to delete product';
      toast.error(message);
    },
  });
};

// Categories
export const useCategories = (restaurantId?: string) => {
  return useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: async () => {
      const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
      const response = await api.get<PaginatedResponse<Category>>(`/categories${params}`);
      return response.data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: Partial<Category>) => {
      const response = await api.post<ApiResponse<Category>>('/categories', categoryData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to create category';
      toast.error(message);
    },
  });
};

// Low stock products
export const useLowStockProducts = (restaurantId?: string) => {
  return useQuery({
    queryKey: ['products', 'low-stock', restaurantId],
    queryFn: async () => {
      const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
      const response = await api.get<ApiResponse<Product[]>>(`/products/low-stock${params}`);
      return response.data;
    },
  });
};