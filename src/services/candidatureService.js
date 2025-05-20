import apiClient from './apiConfig';
import axios from 'axios';
import authService from './authService';

// URL de l'API
const CANDIDATURES_URL = '/candidatures';

// Obtenir toutes les candidatures (avec filtre optionnel)
const getAllCandidatures = async (filters = {}) => {
  try {
    console.log('Appel de getAllCandidatures avec filtres:', filters);
    const response = await apiClient.get(`/users/candidatures`, {
      params: filters,
      headers: authService.authHeader()
    });
    console.log('Réponse candidatures:', response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures", error);
    if (error.response) {
      console.error("Détails de l'erreur:", error.response.data);
      console.error("Status:", error.response.status);
    }
    throw error;
  }
};

// Obtenir toutes les candidatures pour l'admin (pas de filtre utilisateur)
const getAllCandidaturesForAdmin = async (filters = {}) => {
  try {
    console.log('Appel de getAllCandidaturesForAdmin avec filtres:', filters);
    const response = await apiClient.get(CANDIDATURES_URL, {
      params: filters,
      headers: authService.authHeader()
    });
    console.log('Réponse candidatures admin:', response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les candidatures pour admin", error);
    if (error.response) {
      console.error("Détails de l'erreur (admin):", error.response.data);
      console.error("Status (admin):", error.response.status);
    }
    throw error;
  }
};

// Obtenir une candidature par son ID
const getCandidatureById = async (id) => {
  try {
    const response = await apiClient.get(`${CANDIDATURES_URL}/${id}`, {
      headers: authService.authHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Créer une nouvelle candidature
const createCandidature = async (candidatureData) => {
  try {
    const response = await apiClient.post(CANDIDATURES_URL, candidatureData, {
      headers: authService.authHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mettre à jour une candidature existante
const updateCandidature = async (id, candidatureData) => {
  try {
    const response = await apiClient.put(`${CANDIDATURES_URL}/${id}`, candidatureData, {
      headers: authService.authHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Soumettre une candidature
const submitCandidature = async (id) => {
  try {
    const response = await apiClient.post(`${CANDIDATURES_URL}/${id}/submit`, {}, {
      headers: authService.authHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Ajouter une note interne à une candidature
const addInternalNote = async (id, noteContent) => {
  try {
    const response = await apiClient.post(
      `${CANDIDATURES_URL}/${id}/notes`,
      { content: noteContent },
      {
        headers: authService.authHeader()
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Programmer une relance pour une candidature
const scheduleReminder = async (id, reminderData) => {
  try {
    const response = await apiClient.post(
      `${CANDIDATURES_URL}/${id}/reminders`,
      reminderData,
      {
        headers: authService.authHeader()
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Télécharger un document pour une candidature
const uploadDocument = async (id, documentType, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `${CANDIDATURES_URL}/${id}/upload/${documentType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...authService.authHeader()
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Générer un PDF de la candidature
const generatePDF = async (id) => {
  try {
    const response = await apiClient.get(`${CANDIDATURES_URL}/${id}/pdf`, {
      headers: authService.authHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Synchroniser une candidature avec Monday.com
const syncWithMonday = async (id) => {
  try {
    const response = await apiClient.post(`${CANDIDATURES_URL}/${id}/sync-monday`, {}, {
      headers: authService.authHeader()
    });
    return response.data;
  } catch (error) {
    //throw error;
  }
};

// Obtenir des statistiques sur les candidatures
const getCandidatureStats = async () => {
  try {
    console.log('Appel de getCandidatureStats');
    const response = await apiClient.get(`${CANDIDATURES_URL}/stats`, {
      headers: authService.authHeader()
    });
    console.log('Réponse statistiques:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Vérifier si une section est complète
const checkSectionCompletion = (candidature, sectionName) => {
  if (!candidature || !candidature.completedSections) return false;
  return candidature.completedSections[sectionName] === true;
};

// Calculer le pourcentage de complétion d'une candidature
const calculateCompletionPercentage = (candidature) => {
  if (!candidature || !candidature.completedSections) return 0;
  
  const sections = Object.keys(candidature.completedSections);
  const totalSections = sections.length;
  
  // Ne pas compter la structure juridique si elle n'est pas requise
  let sectionsToExclude = 0;
  if (!candidature.existingLegalStructure || !candidature.existingLegalStructure.hasLegalStructure) {
    sectionsToExclude++;
  }
  
  const completedSections = sections.filter(
    (section) => candidature.completedSections[section]
  ).length;
  
  const effectiveTotalSections = totalSections - sectionsToExclude;
  
  return Math.round((completedSections / effectiveTotalSections) * 100);
};

const candidatureService = {
  getAllCandidatures,
  getAllCandidaturesForAdmin,
  getCandidatureById,
  createCandidature,
  updateCandidature,
  submitCandidature,
  addInternalNote,
  scheduleReminder,
  uploadDocument,
  generatePDF,
  syncWithMonday,
  getCandidatureStats,
  checkSectionCompletion,
  calculateCompletionPercentage,
};

export default candidatureService; 