import apiClient from './apiConfig';

// URLs de l'API
const USERS_URL = '/users';

// Fonction pour transformer les données du format API (snake_case) au format frontend (camelCase)
const transformUserData = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLogin: user.last_login,
    phone: user.phone,
    city: user.city,
    country: user.country,
    profilePicture: user.profile_picture
  };
};

// Fonctions de gestion des utilisateurs
const getAllUsers = async () => {
  try {
    const response = await apiClient.get(`${USERS_URL}?isActive=true`);
    
    // S'assurer que nous renvoyons un tableau
    let users = [];
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        users = response.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        users = response.data.users;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        users = response.data.data;
      } else if (response.data.success && response.data.users && Array.isArray(response.data.users)) {
        users = response.data.users;
      }
    }
    
    // Transformer chaque utilisateur au format attendu par le frontend
    return users.map(transformUserData);
  } catch (error) {
    console.error('Erreur dans getAllUsers:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`${USERS_URL}/${userId}`);
    const userData = response.data && response.data.user ? response.data.user : response.data;
    return transformUserData(userData);
  } catch (error) {
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    // Transformer les données du format frontend au format API
    const apiData = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      phone: userData.phone,
      street: userData.street,
      city: userData.city,
      postal_code: userData.postalCode,
      country: userData.country,
      notification_email: userData.notificationEmail,
      notification_app: userData.notificationApp
    };
    
    const response = await apiClient.post(USERS_URL, apiData);
    return transformUserData(response.data);
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    // Transformer les données du format frontend au format API
    const apiData = {};
    if (userData.firstName !== undefined) apiData.first_name = userData.firstName;
    if (userData.lastName !== undefined) apiData.last_name = userData.lastName;
    if (userData.email !== undefined) apiData.email = userData.email;
    if (userData.password !== undefined) apiData.password = userData.password;
    if (userData.role !== undefined) apiData.role = userData.role;
    if (userData.isActive !== undefined) apiData.is_active = userData.isActive;
    if (userData.phone !== undefined) apiData.phone = userData.phone;
    if (userData.street !== undefined) apiData.street = userData.street;
    if (userData.city !== undefined) apiData.city = userData.city;
    if (userData.postalCode !== undefined) apiData.postal_code = userData.postalCode;
    if (userData.country !== undefined) apiData.country = userData.country;
    if (userData.notificationEmail !== undefined) apiData.notification_email = userData.notificationEmail;
    if (userData.notificationApp !== undefined) apiData.notification_app = userData.notificationApp;
    
    const response = await apiClient.put(`${USERS_URL}/${userId}`, apiData);
    return transformUserData(response.data);
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`${USERS_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtenir tous les rôles disponibles
const getRoles = async () => {
  try {
    const response = await apiClient.get(`${USERS_URL}/roles`);
    
    // S'assurer que nous renvoyons un tableau de rôles
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.roles && Array.isArray(response.data.roles)) {
        return response.data.roles;
      }
    }
    
    // Si aucun format approprié n'est trouvé, renvoyer un tableau par défaut
    return ['candidat', 'evaluateur', 'admin'];
  } catch (error) {
    console.error('Erreur dans getRoles:', error);
    // Renvoyer les rôles par défaut en cas d'erreur
    return ['candidat', 'evaluateur', 'admin'];
  }
};

// Exporter les fonctions du service
const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
};

export default userService; 