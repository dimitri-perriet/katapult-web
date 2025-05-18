import axios from 'axios';

// Configuration de base d'Axios
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/backend/api',
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
      // Vérifier si l'erreur ne provient pas de la page de connexion elle-même
      // ou d'autres routes d'authentification où un 401 est une réponse attendue (comme register, forgot-password etc.)
      const isAuthRoute = error.config.url.includes('/auth/');
      
      if (!isAuthRoute) {
        // Si le token est expiré ou invalide sur une route protégée, déconnecter l'utilisateur
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 