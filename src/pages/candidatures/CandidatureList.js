import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import candidatureService from '../../services/candidatureService';
import '../../assets/css/candidature-list.css';

const CandidatureList = () => {
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // État pour les filtres et la pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchCandidatures = useCallback(async () => {
    try {
      setLoading(true);
      console.log('CandidatureList: Début du chargement des candidatures');
      
      // Préparer les filtres
      const filters = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      console.log('CandidatureList: Filtres appliqués:', filters);
      const response = await candidatureService.getAllCandidatures(filters);
      console.log('CandidatureList: Réponse du service:', response);
      
      if (response && response.candidatures) {
        console.log('CandidatureList: Candidatures reçues:', response.candidatures);
        setCandidatures(response.candidatures);
        setTotalItems(response.total || response.candidatures.length);
      } else {
        console.warn('CandidatureList: Données de réponse mal structurées ou manquantes');
        setError('Format de données incorrect');
      }
    } catch (error) {
      console.error('CandidatureList: Erreur lors de la récupération des candidatures', error);
      console.error('CandidatureList: Détails de l\'erreur:', error.response?.data || error.message);
      setError('Impossible de charger les candidatures. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
      console.log('CandidatureList: Fin du chargement des candidatures');
    }
  }, [currentPage, itemsPerPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchCandidatures();
  }, [fetchCandidatures]);

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
      case 'rejetee': return 'Non retenue';
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

  // Gestionnaire pour le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gestionnaire pour le changement de filtre de statut
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de filtre
  };

  // Gestionnaire pour le changement d'éléments par page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Réinitialiser à la première page
  };

  // Gestionnaire pour la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCandidatures(); // Actualiser les résultats avec la recherche
  };

  // Fonction pour calculer le pourcentage de complétion
  const calculateCompletionPercentage = (candidature) => {
    return candidatureService.calculateCompletionPercentage(candidature);
  };

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Générer les boutons de pagination
  const renderPaginationButtons = () => {
    const buttons = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(
          <button
            key={i}
            className={`pagination-button ${i === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      } else if (
        i === currentPage - 2 || 
        i === currentPage + 2
      ) {
        buttons.push(
          <span key={i} className="pagination-ellipsis">...</span>
        );
      }
    }
    
    return buttons;
  };

  return (
    <div className="candidature-list-container">
      <div className="container">
        <div className="candidature-list-header">
          <h1>Mes Candidatures</h1>
          <p>Retrouvez toutes vos candidatures au programme Katapult</p>
        </div>

        <div className="candidature-filters">
          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">Statut:</label>
            <select
              id="status-filter"
              className="filter-select"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">Tous les statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="soumise">Soumise</option>
              <option value="en_evaluation">En évaluation</option>
              <option value="acceptee">Acceptée</option>
              <option value="rejetee">Non retenue</option>
            </select>
          </div>

          <form className="search-group" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <i className="fa fa-search"></i>
            </button>
          </form>

          <Link to="/candidatures/new" className="new-candidature-btn">
            <i className="fa fa-plus"></i> Nouvelle candidature
          </Link>
        </div>

        {loading ? (
          <div className="text-center p-3">
            <p>Chargement des candidatures...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : candidatures.length === 0 ? (
          <div className="no-candidatures">
            <div className="no-candidatures-icon">
              <i className="fa fa-file-alt"></i>
            </div>
            <h3 className="no-candidatures-title">Aucune candidature trouvée</h3>
            <p className="no-candidatures-description">
              {statusFilter 
                ? `Vous n'avez pas de candidature avec le statut "${getStatusText(statusFilter).toLowerCase()}".` 
                : "Vous n'avez pas encore de candidature. Créez votre première candidature pour soumettre votre projet à l'incubateur Katapult."}
            </p>
            <Link to="/candidatures/new" className="btn-create-candidature">
              Créer une candidature
            </Link>
          </div>
        ) : (
          <>
            <table className="candidature-list-table">
              <thead>
                <tr>
                  <th>Projet</th>
                  <th>Promotion</th>
                  <th>Statut</th>
                  <th>Progression</th>
                  <th>Date de création</th>
                  <th>Dernière modification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidatures.map((candidature) => (
                  <tr key={candidature.id}>
                    <td>{candidature.projectName || 'Sans titre'}</td>
                    <td>
                      {candidature.promotion && (
                        <span className="promotion">
                          {candidature.promotion}
                        </span>
                      )}
                    </td>
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
                          <span>{calculateCompletionPercentage(candidature)}%</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="candidature-date">
                        {formatDate(candidature.createdAt)}
                      </span>
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

            {totalPages > 1 && (
              <>
                <div className="pagination">
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fa fa-chevron-left"></i>
                  </button>
                  
                  {renderPaginationButtons()}
                  
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fa fa-chevron-right"></i>
                  </button>
                </div>
                
                <div className="pagination-info">
                  <div>
                    Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} à {Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems} candidatures
                  </div>
                  <div>
                    <span>Afficher</span>
                    <select
                      className="pagination-select"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </select>
                    <span>par page</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidatureList; 