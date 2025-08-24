import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute>
                    <ProductsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Orders</h1>
                      <p className="mt-4">Orders management coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute roles={['admin', 'manager']}>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Reports</h1>
                      <p className="mt-4">Reports coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/restaurants" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Restaurants</h1>
                      <p className="mt-4">Restaurant management coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Users</h1>
                      <p className="mt-4">User management coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Settings</h1>
                      <p className="mt-4">Settings coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;