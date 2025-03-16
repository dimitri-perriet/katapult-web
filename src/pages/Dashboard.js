import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import candidatureService from '../services/candidatureService';
import '../assets/css/dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [candidatures, setCandidatures] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    inReview: 0,
    accepted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Dashboard: Début du chargement des données');
        
        // Récupérer toutes les candidatures de l'utilisateur
        console.log('Dashboard: Appel du service candidatureService.getAllCandidatures()');
        const response = await candidatureService.getAllCandidatures();
        console.log('Dashboard: Réponse du service:', response);
        
        if (response && response.candidatures) {
          console.log('Dashboard: Données de candidatures reçues:', response.candidatures);
          setCandidatures(response.candidatures);
          
          // Calculer les statistiques
          calculateStats(response.candidatures);
        } else {
          console.warn('Dashboard: Données de réponse mal structurées ou manquantes');
          setError('Format de données incorrect');
        }
      } catch (error) {
        console.error('Dashboard: Erreur lors de la récupération des données', error);
        console.error('Dashboard: Détails de l\'erreur:', error.response?.data || error.message);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
        console.log('Dashboard: Fin du chargement des données');
      }
    };

    fetchDashboardData();
  }, []);

  // Fonction pour calculer les statistiques
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      draft: 0,
      submitted: 0,
      inReview: 0,
      accepted: 0,
      rejected: 0
    };

    data.forEach(candidature => {
      switch (candidature.status) {
        case 'brouillon':
          stats.draft++;
          break;
        case 'soumise':
          stats.submitted++;
          break;
        case 'en_evaluation':
          stats.inReview++;
          break;
        case 'acceptee':
          stats.accepted++;
          break;
        case 'rejetee':
          stats.rejected++;
          break;
        default:
          break;
      }
    });

    setStats(stats);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'soumise': return 'Soumise';
      case 'en_evaluation': return 'En évaluation';
      case 'acceptee': return 'Acceptée';
      case 'rejetee': return 'Rejetée';
      default: return status;
    }
  };

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'brouillon': return 'status-draft';
      case 'soumise': return 'status-submitted';
      case 'en_evaluation': return 'status-in-review';
      case 'acceptee': return 'status-accepted';
      case 'rejetee': return 'status-rejected';
      default: return '';
    }
  };

  // Fonction pour calculer le pourcentage de complétion
  const calculateCompletionPercentage = (candidature) => {
    return candidatureService.calculateCompletionPercentage(candidature);
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Message de bienvenue */}
        <div className="welcome-banner">
          <h1 className="welcome-title">Bienvenue, {currentUser.firstName} !</h1>
          <p className="welcome-text">
            Bienvenue sur votre espace personnel Katapult. Gérez vos candidatures, suivez leur avancement et créez de nouvelles demandes pour propulser vos projets d'innovation sociale.
          </p>
          <Link to="/candidatures/new" className="welcome-btn">
            Déposer un nouveau projet
          </Link>
        </div>

        {/* En-tête du tableau de bord */}
        <div className="dashboard-header">
          <h1>Tableau de bord</h1>
          <p>Visualisez et gérez vos candidatures au programme Katapult</p>
        </div>

        {/* Cartes des statistiques */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="dashboard-card-icon">
              <i className="fa fa-file-alt"></i>
            </div>
            <h3 className="dashboard-card-title">Total</h3>
            <p className="dashboard-card-value">{stats.total}</p>
            <p className="dashboard-card-subtitle">candidatures</p>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-status-submitted">
              <i className="fa fa-paper-plane"></i>
            </div>
            <h3 className="dashboard-card-title">Soumises</h3>
            <p className="dashboard-card-value">{stats.submitted}</p>
            <p className="dashboard-card-subtitle">en attente de revue</p>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-status-in-review">
              <i className="fa fa-search"></i>
            </div>
            <h3 className="dashboard-card-title">En évaluation</h3>
            <p className="dashboard-card-value">{stats.inReview}</p>
            <p className="dashboard-card-subtitle">en cours d'analyse</p>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-icon dashboard-card-status-accepted">
              <i className="fa fa-check-circle"></i>
            </div>
            <h3 className="dashboard-card-title">Acceptées</h3>
            <p className="dashboard-card-value">{stats.accepted}</p>
            <p className="dashboard-card-subtitle">projets validés</p>
          </div>
        </div>

        {/* Liste des candidatures */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Mes candidatures</h2>
            <div className="dashboard-section-actions">
              <Link to="/candidatures" className="btn btn-secondary">
                Voir toutes
              </Link>
              <Link to="/candidatures/new" className="btn btn-primary">
                Nouvelle candidature
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-3">
              <p>Chargement des candidatures...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : candidatures.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fa fa-file-alt"></i>
              </div>
              <h3 className="empty-state-title">Aucune candidature</h3>
              <p className="empty-state-description">
                Vous n'avez pas encore de candidature. Créez votre première candidature pour
                soumettre votre projet à l'incubateur Katapult.
              </p>
              <Link to="/candidatures/new" className="btn-create-candidature">
                Créer ma première candidature
              </Link>
            </div>
          ) : (
            <div className="candidature-list">
              <table className="candidature-table">
                <thead>
                  <tr>
                    <th>Projet</th>
                    <th>Statut</th>
                    <th>Progression</th>
                    <th>Date de modification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatures.slice(0, 5).map((candidature) => (
                    <tr key={candidature.id}>
                      <td>{candidature.projectName || 'Sans titre'}</td>
                      <td>
                        <span className={`candidature-status ${getStatusClass(candidature.status)}`}>
                          {getStatusText(candidature.status)}
                        </span>
                      </td>
                      <td>
                        <div className="progress-section">
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar"
                              style={{ width: `${calculateCompletionPercentage(candidature)}%` }}
                            ></div>
                          </div>
                          <div className="progress-text">
                            <span>Complétion</span>
                            <span>{calculateCompletionPercentage(candidature)}%</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="candidature-date">
                          {formatDate(candidature.updatedAt)}
                        </span>
                      </td>
                      <td>
                        <div className="candidature-actions">
                          <Link
                            to={`/candidatures/${candidature.id}`}
                            className="action-btn action-btn-view"
                          >
                            Voir
                          </Link>
                          {candidature.status === 'brouillon' && (
                            <Link
                              to={`/candidatures/${candidature.id}/edit`}
                              className="action-btn action-btn-edit"
                            >
                              Modifier
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section des prochaines étapes */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Prochaines étapes</h2>
          </div>
          <div className="steps-content">
            <p>
              L'incubateur Katapult, porté par l'ADRESS, accompagne les porteurs de projets d'innovation sociale en Normandie.
              Pour être incubé par Katapult, voici les étapes à suivre :
            </p>
            <ol>
              <li><strong>Candidature</strong> : Déposez votre projet via le formulaire de candidature</li>
              <li><strong>Évaluation</strong> : Votre projet est évalué par notre comité de sélection</li>
              <li><strong>Entretien</strong> : Si votre projet est présélectionné, vous serez invité à un entretien</li>
              <li><strong>Décision</strong> : Le comité décide des projets intégrant l'incubateur</li>
              <li><strong>Incubation</strong> : Démarrage de l'accompagnement de votre projet</li>
            </ol>
            <p>
              Pour toute question sur le processus de candidature, n'hésitez pas à nous contacter 
              à <a href="mailto:contact@katapult-incubateur.org">contact@katapult-incubateur.org</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 