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

  // Obtenir la classe CSS du badge de statut
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'brouillon': return 'status-badge status-draft';
      case 'soumise': return 'status-badge status-submitted';
      case 'en_evaluation': return 'status-badge status-review';
      case 'acceptee': return 'status-badge status-accepted';
      case 'rejetee': return 'status-badge status-rejected';
      default: return 'status-badge';
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'soumise': return 'Soumise';
      case 'en_evaluation': return 'En évaluation';
      case 'acceptee': return 'Validée';
      case 'rejetee': return 'Rejetée';
      default: return 'Inconnu';
    }
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

      {/* Ajout de styles CSS en ligne pour les badges de statut */}
      <style>
        {`
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            color: white;
          }
          .status-draft {
            background-color: #6c757d;
          }
          .status-submitted {
            background-color: #0d6efd;
          }
          .status-review {
            background-color: #ffc107;
            color: #212529;
          }
          .status-accepted {
            background-color: #198754;
          }
          .status-rejected {
            background-color: #dc3545;
          }
          .btn-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #f8f9fa;
            color: #0d6efd;
            text-decoration: none;
            transition: all 0.2s;
          }
          .btn-action:hover {
            background-color: #0d6efd;
            color: white;
          }
          .email-link {
            color: #0d6efd;
            text-decoration: none;
          }
          .email-link:hover {
            text-decoration: underline;
          }
        `}
      </style>

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
                    <td><strong>{candidature.projectName || 'Sans nom'}</strong></td>
                    <td>{candidature.applicant}</td>
                    <td>
                      <a href={`mailto:${candidature.email}`} className="email-link">
                        {candidature.email}
                      </a>
                    </td>
                    <td>{candidature.sector || 'Non spécifié'}</td>
                    <td>
                      <span className={getStatusBadgeClass(candidature.status)}>
                        {getStatusLabel(candidature.status)}
                      </span>
                    </td>
                    <td>{formatDate(candidature.submissionDate)}</td>
                    <td>
                      <Link
                        to={`/admin/candidatures/${candidature.id}`}
                        className="btn-action"
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