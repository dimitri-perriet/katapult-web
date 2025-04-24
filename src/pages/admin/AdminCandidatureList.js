import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiConfig';
import authService from '../../services/authService';
import './AdminDashboard.css'; // Importation du CSS partagé

const AdminCandidatureList = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    promotion: ''
  });

  useEffect(() => {
    fetchCandidatures();
  }, [filters]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/candidatures', {
        headers: authService.authHeader(),
        params: filters
      });
      setCandidatures(response.data.candidatures || []);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des candidatures:', err);
      setError('Impossible de charger les candidatures. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Gestion des Candidatures</h1>
        <div className="dashboard-actions">
          <Link to="/admin/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Retour au tableau de bord
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="status">Statut</label>
            <select 
              id="status" 
              name="status" 
              className="filter-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="soumise">Soumise</option>
              <option value="en_evaluation">En évaluation</option>
              <option value="acceptee">Validée</option>
              <option value="rejetee">Rejetée</option>
            </select>
          </div>
          <div className="filter-item">
            <label htmlFor="promotion">Promotion</label>
            <select 
              id="promotion" 
              name="promotion" 
              className="filter-select"
              value={filters.promotion}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les promotions</option>
              <option value="Katapult 2023">Katapult 2023</option>
              <option value="Katapult 2024">Katapult 2024</option>
            </select>
          </div>
        </div>
      </div>

      {/* Affichage des candidatures */}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : candidatures.length === 0 ? (
        <div className="alert alert-info">Aucune candidature trouvée.</div>
      ) : (
        <div className="dashboard-section">
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Projet</th>
                  <th>Candidat</th>
                  <th>Email</th>
                  <th>Secteur</th>
                  <th>Statut</th>
                  <th>Date de soumission</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidatures.map(candidature => (
                  <tr key={candidature.id}>
                    <td>{candidature.id}</td>
                    <td>{candidature.projectName || 'Sans nom'}</td>
                    <td>{candidature.applicant}</td>
                    <td>
                      <a href={`mailto:${candidature.email}`} className="email-link">
                        {candidature.email}
                      </a>
                    </td>
                    <td>{candidature.sector || 'Non spécifié'}</td>
                    <td>
                      <span className={`status-badge status-${candidature.status}`}>
                        {candidature.status === 'brouillon'
                          ? 'Brouillon'
                          : candidature.status === 'soumise'
                          ? 'Soumise'
                          : candidature.status === 'en_evaluation'
                          ? 'En évaluation'
                          : candidature.status === 'acceptee'
                          ? 'Validée'
                          : candidature.status === 'rejetee'
                          ? 'Rejetée'
                          : 'Inconnue'}
                      </span>
                    </td>
                    <td>{formatDate(candidature.submissionDate)}</td>
                    <td>
                      <Link
                        to={`/admin/candidatures/${candidature.id}`}
                        className="btn-action btn-view"
                        title="Voir détails"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCandidatureList; 