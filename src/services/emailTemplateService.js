import apiClient from './apiConfig';

const TEMPLATES_URL = '/email-templates'; // L'URL de base pour l'API des templates

// Fonction pour transformer les données du template si nécessaire (ex: dates)
// Pour l'instant, les données semblent directes, mais c'est une bonne pratique de l'avoir.
const transformTemplateData = (template) => {
  if (!template) return null;
  return {
    ...template,
    // createdAt: new Date(template.createdAt), // Décommenter si vous voulez des objets Date
    // updatedAt: new Date(template.updatedAt), // Décommenter si vous voulez des objets Date
  };
};

const emailTemplateService = {
  /**
   * Récupérer tous les templates d'email.
   * @returns {Promise<Array>}
   */
  async getAllTemplates() {
    try {
      const response = await apiClient.get(TEMPLATES_URL);
      // L'API retourne { success: true, templates: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.templates)) {
        return response.data.templates.map(transformTemplateData);
      }
      return []; // Retourner un tableau vide en cas de format inattendu
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les templates d\'email:', error);
      throw error;
    }
  },

  /**
   * Récupérer un template d'email par son ID.
   * @param {number} templateId - ID du template.
   * @returns {Promise<Object|null>}
   */
  async getTemplateById(templateId) {
    try {
      const response = await apiClient.get(`${TEMPLATES_URL}/${templateId}`);
      // L'API retourne { success: true, template: {...} }
      if (response.data && response.data.success && response.data.template) {
        return transformTemplateData(response.data.template);
      }
      return null; // Retourner null si le template n'est pas trouvé ou format inattendu
    } catch (error) {
      console.error(`Erreur lors de la récupération du template d\'email ${templateId}:`, error);
      // Gérer spécifiquement les erreurs 404 si l'API les renvoie comme des erreurs HTTP
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Mettre à jour un template d'email.
   * @param {number} templateId - ID du template à mettre à jour.
   * @param {Object} data - Données à mettre à jour (subject, body, description).
   * @returns {Promise<Object>}
   */
  async updateTemplate(templateId, data) {
    try {
      const response = await apiClient.put(`${TEMPLATES_URL}/${templateId}`, data);
      // L'API retourne { success: true, message: '...', template: {...} }
      if (response.data && response.data.success && response.data.template) {
        return transformTemplateData(response.data.template);
      }
      // Si la réponse n'a pas le format attendu mais est un succès, lancez une erreur spécifique
      if (response.data && response.data.success) {
          throw new Error('La mise à jour du template a réussi mais la réponse API est malformée.');
      }
      // Si ce n'est pas un succès, l'intercepteur d'erreur d'apiClient devrait le gérer
      // ou vous pouvez lancer une erreur ici basée sur response.data.message
      throw new Error(response.data?.message || 'Erreur lors de la mise à jour du template.');
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du template d\'email ${templateId}:`, error);
      throw error;
    }
  },
  
  /**
   * Créer un nouveau template d'email.
   * @param {Object} templateData - Données du template (name, subject, body, description).
   * @returns {Promise<Object>}
   */
  async createTemplate(templateData) {
    try {
      const response = await apiClient.post(TEMPLATES_URL, templateData);
      if (response.data && response.data.success && response.data.template) {
        return transformTemplateData(response.data.template);
      }
      throw new Error(response.data?.message || 'Erreur lors de la création du template.');
    } catch (error) {
      console.error('Erreur lors de la création du template d\'email:', error);
      throw error;
    }
  }
};

export default emailTemplateService; 