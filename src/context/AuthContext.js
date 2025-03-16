import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// Création du contexte
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};

// Fournisseur du contexte
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Charger l'utilisateur à partir du localStorage au montage
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      // Vérifier si le token est toujours valide
      if (authService.isAuthenticated()) {
        setCurrentUser(user);
      } else {
        // Token expiré, déconnecter l'utilisateur
        authService.logout();
      }
    }
    setLoading(false);
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authService.login(email, password);
      setCurrentUser(data);
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors de la connexion'
      );
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      setError(null);
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
      );
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  // Fonction de mot de passe oublié
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const data = await authService.forgotPassword(email);
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors de la demande de réinitialisation'
      );
      throw error;
    }
  };

  // Fonction de réinitialisation de mot de passe
  const resetPassword = async (token, password) => {
    try {
      setError(null);
      const data = await authService.resetPassword(token, password);
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation'
      );
      throw error;
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const data = await authService.updateProfile(userData);
      // Mettre à jour l'utilisateur courant
      const updatedUser = {
        ...currentUser,
        firstName: userData.firstName || currentUser.firstName,
        lastName: userData.lastName || currentUser.lastName,
        email: userData.email || currentUser.email,
      };
      setCurrentUser(updatedUser);
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil'
      );
      throw error;
    }
  };

  // Fonction de changement de mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const data = await authService.changePassword(currentPassword, newPassword);
      return data;
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors du changement de mot de passe'
      );
      throw error;
    }
  };

  // Valeur du contexte
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    userRole: currentUser ? authService.getUserRole() : null,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 