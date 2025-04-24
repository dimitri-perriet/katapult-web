import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiConfig';
import authService from '../../services/authService';

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'brouillon': return 'badge bg-secondary';
      case 'soumise': return 'badge bg-primary';
      case 'en_evaluation': return 'badge bg-info';
      case 'validee': return 'badge bg-success';
      case 'rejetee': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'soumise': return 'Soumise';
      case 'en_evaluation': return 'En évaluation';
      case 'validee': return 'Validée';
      case 'rejetee': return 'Rejetée';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="admin-candidature-list-container py-4">
      <div className="container">
        <h1 className="mb-4">Gestion des Candidatures</h1>
        
        {/* Filtres améliorés */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <i className="bi bi-funnel me-2"></i>
            Filtres
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="status" className="form-label fw-bold">Statut</label>
                <select 
                  id="status" 
                  name="status" 
                  className="form-select form-select-lg"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="soumise">Soumise</option>
                  <option value="en_evaluation">En évaluation</option>
                  <option value="validee">Validée</option>
                  <option value="rejetee">Rejetée</option>
                </select>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="promotion" className="form-label fw-bold">Promotion</label>
                <select 
                  id="promotion" 
                  name="promotion" 
                  className="form-select form-select-lg"
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
        </div>

        <div className="d-flex justify-content-between mb-3">
          <Link to="/admin/dashboard" className="btn btn-secondary btn-lg">
            <i className="bi bi-arrow-left me-1"></i> Retour
          </Link>
          <div className="badge bg-info text-dark fs-5">
            {candidatures.length} candidature(s) trouvée(s)
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : candidatures.length === 0 ? (
          <div className="alert alert-info p-4 fw-bold text-center fs-5" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            Aucune candidature trouvée.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover shadow">
              <thead className="table-dark">
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
                    <td className="fw-bold">{candidature.id}</td>
                    <td>{candidature.projectName || 'Sans nom'}</td>
                    <td>{candidature.applicant}</td>
                    <td>{candidature.email}</td>
                    <td>{candidature.sector || 'Non spécifié'}</td>
                    <td>
                      <span className={getStatusBadgeClass(candidature.status)}>
                        {getStatusLabel(candidature.status)}
                      </span>
                    </td>
                    <td>
                      {candidature.submissionDate 
                        ? new Date(candidature.submissionDate).toLocaleDateString('fr-FR') 
                        : '-'}
                    </td>
                    <td>
                      <Link to={`/admin/candidatures/${candidature.id}`} className="btn btn-sm btn-primary">
                        <i className="bi bi-eye me-1"></i> Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCandidatureList; 