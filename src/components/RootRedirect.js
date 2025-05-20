import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RootRedirect = () => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    // Affichez un indicateur de chargement pendant que l'état d'authentification est vérifié
    return <div>Chargement...</div>; 
  }

  if (isAuthenticated) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/register" replace />;
};

export default RootRedirect; 