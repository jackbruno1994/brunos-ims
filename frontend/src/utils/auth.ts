import { User } from '@brunos-ims/shared';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const getAuthState = (): AuthState => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    user,
    token,
    isAuthenticated: !!(token && user),
  };
};

export const setAuthData = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const isManager = (user: User | null): boolean => {
  return user?.role === 'manager' || user?.role === 'admin';
};