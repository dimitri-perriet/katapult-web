import axios from 'axios';

// Configuration de base d'Axios
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://padu1468.odns.fr/backend/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  config => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      // Si le token est expiré ou invalide, déconnecter l'utilisateur
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 