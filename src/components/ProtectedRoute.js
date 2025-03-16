import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Composant pour protéger les routes nécessitant une authentification
const ProtectedRoute = ({ requiredRoles = [] }) => {
  const { isAuthenticated, userRole } = useAuth();

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles sont requis, vérifier si l'utilisateur a le bon rôle
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    // Rediriger vers la page d'accès refusé
    return <Navigate to="/access-denied" replace />;
  }

  // Si tout est correct, afficher le contenu de la route
  return <Outlet />;
};

export default ProtectedRoute; 