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
    // Les noms de champs doivent être en camelCase pour correspondre à la validation du backend
    const apiData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: userData.role
    };
    
    // Ajouter uniquement les champs optionnels qui sont définis
    if (userData.phone) apiData.phone = userData.phone;
    if (userData.street) apiData.street = userData.street;
    if (userData.city) apiData.city = userData.city;
    if (userData.postalCode) apiData.postalCode = userData.postalCode;
    if (userData.country) apiData.country = userData.country;
    if (userData.notificationEmail !== undefined) apiData.notificationEmail = userData.notificationEmail;
    if (userData.notificationApp !== undefined) apiData.notificationApp = userData.notificationApp;
    
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
    // Retourner directement les rôles valides sans appeler l'API
    // Cela évitera l'erreur 404 car la route /users/roles n'existe pas dans le backend
    return ['candidat', 'evaluateur', 'admin'];
    
    /* Ancien code qui causait l'erreur 404
    const response = await apiClient.get(`${USERS_URL}/roles`);
    
    // S'assurer que nous renvoyons un tableau de rôles
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.roles && Array.isArray(response.data.roles)) {
        return response.data.roles;
      }
    }
    */
  } catch (error) {
    console.error('Erreur dans getRoles:', error);
    // Renvoyer les rôles par défaut en cas d'erreur
    return ['candidat', 'evaluateur', 'admin'];
  }
};

const exportUsersCSV = async () => {
  try {
    const response = await apiClient.get(`${USERS_URL}/export/csv`, {
      responseType: 'blob', // Important pour gérer la réponse comme un fichier
    });
    // Créer un lien temporaire pour télécharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users.csv'); // Nom du fichier à télécharger
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url); // Nettoyer l'URL de l'objet
  } catch (error) {
    console.error('Erreur lors de l\'exportation CSV des utilisateurs:', error);
    throw error; // Propage l'erreur pour que le composant puisse l'afficher
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
  exportUsersCSV,
};

export default userService; 