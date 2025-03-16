import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import candidatureService from '../../services/candidatureService';
import './AdminDashboard.css';

// Composant pour afficher une statistique
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <i className={icon}></i>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
};

// Composant de tableau de bord administrateur
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inReview: 0,
    accepted: 0,
    rejected: 0,
  });
  const [recentCandidatures, setRecentCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Charger les statistiques et les candidatures récentes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Récupérer les statistiques des candidatures
        const statsData = await candidatureService.getCandidatureStats();

        // Récupérer les candidatures récentes (10 dernières)
        const candidaturesData = await candidatureService.getAllCandidatures({
          limit: 10,
          sort: 'createdAt',
          order: 'desc',
        });

        // Mettre à jour l'état
        setStats({
          total: statsData.total || 0,
          submitted: statsData.submitted || 0,
          inReview: statsData.inReview || 0,
          accepted: statsData.accepted || 0,
          rejected: statsData.rejected || 0,
        });
        setRecentCandidatures(candidaturesData.candidatures || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            'Une erreur est survenue lors du chargement des données'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Formater la date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord Administrateur</h1>
        <div className="dashboard-actions">
          <Link to="/admin/candidatures" className="btn btn-primary">
            Gérer les candidatures
          </Link>
          <Link to="/admin/users" className="btn btn-secondary">
            Gérer les utilisateurs
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : (
        <>
          <div className="stats-container">
            <StatCard
              title="Total Candidatures"
              value={stats.total}
              icon="fas fa-file-alt"
              color="#607D8B"
            />
            <StatCard
              title="Soumises"
              value={stats.submitted}
              icon="fas fa-paper-plane"
              color="#2196F3"
            />
            <StatCard
              title="En évaluation"
              value={stats.inReview}
              icon="fas fa-clipboard-check"
              color="#FF9800"
            />
            <StatCard
              title="Acceptées"
              value={stats.accepted}
              icon="fas fa-check-circle"
              color="#4CAF50"
            />
            <StatCard
              title="Refusées"
              value={stats.rejected}
              icon="fas fa-times-circle"
              color="#F44336"
            />
          </div>

          <div className="dashboard-section">
            <h2>Candidatures récentes</h2>
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Porteur</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCandidatures.length > 0 ? (
                    recentCandidatures.map((candidature) => (
                      <tr key={candidature._id}>
                        <td>{candidature.projectInfo?.name || 'N/A'}</td>
                        <td>
                          {candidature.user?.firstName} {candidature.user?.lastName}
                        </td>
                        <td>{formatDate(candidature.createdAt)}</td>
                        <td>
                          <span
                            className={`status-badge status-${candidature.status}`}
                          >
                            {candidature.status === 'brouillon'
                              ? 'Brouillon'
                              : candidature.status === 'soumise'
                              ? 'Soumise'
                              : candidature.status === 'en_cours_d_evaluation'
                              ? 'En évaluation'
                              : candidature.status === 'présélectionnée'
                              ? 'Présélectionnée'
                              : candidature.status === 'acceptée'
                              ? 'Acceptée'
                              : candidature.status === 'refusée'
                              ? 'Refusée'
                              : 'Inconnue'}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/admin/candidatures/${candidature._id}`}
                            className="btn-action btn-view"
                            title="Voir détails"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Aucune candidature récente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 