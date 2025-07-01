import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/authUtils';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !userIsAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;