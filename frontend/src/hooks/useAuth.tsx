import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoginRequest, RegisterRequest } from '@brunos-ims/shared';
import { AuthState, getAuthState, setAuthData, clearAuthData } from '../utils/auth';
import api from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(getAuthState());
  const [loading, setLoading] = useState(false);

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      const response = await api.post('/users/login', data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        setAuthData(token, user);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
        toast.success('Login successful!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      const response = await api.post('/users/register', data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        setAuthData(token, user);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
        });
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};