import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CloudMartMainPage from './components/MainPage';
import CustomerSupportPage from './components/SupportPage';
import ProductPage from './components/ProductPage';
import AboutPage from './components/AboutPage';
import CartPage from './components/CartPage';
import AdminPage from './components/AdminPage';
import UserProfilePage from './components/UserProfilePage';
import OrdersPage from './components/OrdersPage';
import UserOrdersPage from './components/UserOrdersPage';
import LoginPage from './components/AuthPages/LoginPage';
import RegisterPage from './components/AuthPages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { initializeUser } from './utils/authUtils';

function App() {
  useEffect(() => {
    initializeUser();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<CloudMartMainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/customer-support" element={<CustomerSupportPage />} />
        <Route path="/about" element={<AboutPage />} />  
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <UserOrdersPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <OrdersPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;