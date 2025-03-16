import jwtDecode from 'jwt-decode';
import apiClient from './apiConfig';

// URLs de l'API
const AUTH_URL = '/auth';

// Fonctions d'authentification
const login = async (email, password) => {
  try {
    const response = await apiClient.post(`${AUTH_URL}/login`, {
      email,
      password,
    });

    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

const register = async (userData) => {
  try {
    const response = await apiClient.post(`${AUTH_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post(`${AUTH_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (token, password) => {
  try {
    const response = await apiClient.post(`${AUTH_URL}/reset-password/${token}`, {
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  return JSON.parse(userStr);
};

const isAuthenticated = () => {
  const user = getCurrentUser();
  if (!user || !user.token) return false;
  
  try {
    const decodedToken = jwtDecode(user.token);
    const currentTime = Date.now() / 1000;
    
    // Vérifier si le token n'est pas expiré
    return decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const getUserRole = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  try {
    const decodedToken = jwtDecode(user.token);
    return decodedToken.role;
  } catch (error) {
    return null;
  }
};

const updateProfile = async (userData) => {
  try {
    const response = await apiClient.put(`${AUTH_URL}/update-details`, userData);
    
    // Mettre à jour les informations utilisateur dans le localStorage
    const user = getCurrentUser();
    const updatedUser = {
      ...user,
      firstName: userData.firstName || user.firstName,
      lastName: userData.lastName || user.lastName,
      email: userData.email || user.email,
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.put(
      `${AUTH_URL}/update-password`,
      {
        currentPassword,
        newPassword,
      }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Vérifiez que cette fonction renvoie bien le token
const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user && user.token) {
    console.log("Token trouvé dans localStorage");
    return { Authorization: `Bearer ${user.token}` };
  } else {
    console.log("Aucun token trouvé dans localStorage");
    return {};
  }
};

// Exporter les fonctions du service
const authService = {
  login,
  register,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  isAuthenticated,
  getUserRole,
  updateProfile,
  changePassword,
  authHeader,
};

export default authService; 