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
    <div className="admin-candidature-list-container">
      <div className="container">
        <h1 className="my-4">Gestion des Candidatures</h1>
        
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="status">Statut</label>
              <select 
                id="status" 
                name="status" 
                className="form-control"
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
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="promotion">Promotion</label>
              <select 
                id="promotion" 
                name="promotion" 
                className="form-control"
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

        <div className="mb-3">
          <Link to="/admin/dashboard" className="btn btn-primary">
            <i className="bi bi-arrow-left me-1"></i> Retour au tableau de bord
          </Link>
        </div>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : candidatures.length === 0 ? (
          <div className="alert alert-info" role="alert">
            Aucune candidature trouvée.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover border">
              <thead>
                <tr className="table-primary">
                  <th className="text-center" style={{width: '5%'}}>ID</th>
                  <th style={{width: '15%'}}>Projet</th>
                  <th style={{width: '15%'}}>Candidat</th>
                  <th style={{width: '20%'}}>Email</th>
                  <th style={{width: '15%'}}>Secteur</th>
                  <th style={{width: '10%'}}>Statut</th>
                  <th style={{width: '12%'}}>Date de soumission</th>
                  <th className="text-center" style={{width: '8%'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidatures.map(candidature => (
                  <tr key={candidature.id} className="align-middle">
                    <td className="text-center fw-bold">{candidature.id}</td>
                    <td className="fw-bold">{candidature.projectName || 'Sans nom'}</td>
                    <td>{candidature.applicant}</td>
                    <td>
                      <a href={`mailto:${candidature.email}`} className="text-decoration-none">
                        {candidature.email}
                      </a>
                    </td>
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
                    <td className="text-center">
                      <Link 
                        to={`/admin/candidatures/${candidature.id}`} 
                        className="btn btn-sm btn-primary"
                        title="Voir les détails de la candidature"
                      >
                        <i className="bi bi-eye"></i> Voir
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