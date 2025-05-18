import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import candidatureService from '../../services/candidatureService';
import apiClient from '../../services/apiConfig';
import authService from '../../services/authService';
import '../../assets/css/candidature-detail.css';

const AdminCandidatureDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  const [candidature, setCandidature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });
  const [pdfError, setPdfError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Format de date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Récupération des données de la candidature
  useEffect(() => {
    const fetchCandidature = async () => {
      try {
        setLoading(true);
        const response = await candidatureService.getCandidatureById(id);
        
        if (response && response.candidature) {
          
          // Parser les données JSON si elles sont stockées sous forme de chaînes
          const parsedFicheIdentite = typeof response.candidature.fiche_identite === 'string' 
            ? JSON.parse(response.candidature.fiche_identite) 
            : response.candidature.fiche_identite || {};
            
          const parsedProjetUtiliteSociale = typeof response.candidature.projet_utilite_sociale === 'string'
            ? JSON.parse(response.candidature.projet_utilite_sociale)
            : response.candidature.projet_utilite_sociale || {};
            
          const parsedQuiEstConcerne = typeof response.candidature.qui_est_concerne === 'string'
            ? JSON.parse(response.candidature.qui_est_concerne)
            : response.candidature.qui_est_concerne || {};
            
          const parsedModeleEconomique = typeof response.candidature.modele_economique === 'string'
            ? JSON.parse(response.candidature.modele_economique)
            : response.candidature.modele_economique || {};
            
          const parsedPartiesPrenantes = typeof response.candidature.parties_prenantes === 'string'
            ? JSON.parse(response.candidature.parties_prenantes)
            : response.candidature.parties_prenantes || {};
            
          const parsedEquipeProjet = typeof response.candidature.equipe_projet === 'string'
            ? JSON.parse(response.candidature.equipe_projet)
            : response.candidature.equipe_projet || {};
            
          const parsedStructureJuridique = typeof response.candidature.structure_juridique === 'string'
            ? JSON.parse(response.candidature.structure_juridique)
            : response.candidature.structure_juridique || {};
          
          // Transformer les données imbriquées en structure plate pour l'affichage
          const flattenedData = {
            // Valeurs par défaut
            id: response.candidature.id,
            user: response.candidature.user_id,
            status: response.candidature.status,
            created_at: response.candidature.created_at,
            updated_at: response.candidature.updated_at,
            submission_date: response.candidature.submission_date,
            
            // Fiche d'identité
            ...parsedFicheIdentite,
            
            // Projet et utilité sociale
            ...parsedProjetUtiliteSociale,
            
            // Qui est concerné
            ...parsedQuiEstConcerne,
            
            // Modèle économique
            ...parsedModeleEconomique,
            
            // Parties prenantes
            ...parsedPartiesPrenantes,
            
            // Équipe projet
            teamMembers: parsedEquipeProjet?.members || [],
            
            // Personne référente
            referenceLastName: parsedEquipeProjet?.reference?.lastName || '',
            referenceFirstName: parsedEquipeProjet?.reference?.firstName || '',
            referenceDOB: parsedEquipeProjet?.reference?.DOB ? parsedEquipeProjet.reference.DOB.substring(0, 10) : '',
            referenceAddress: parsedEquipeProjet?.reference?.address || '',
            referenceEmail: parsedEquipeProjet?.reference?.email || '',
            referenceTelephone: parsedEquipeProjet?.reference?.telephone || '',
            referenceEmploymentType: parsedEquipeProjet?.reference?.employmentType || '',
            referenceEmploymentDuration: parsedEquipeProjet?.reference?.employmentDuration || '',
            
            // Autres informations d'équipe
            entrepreneurialExperience: parsedEquipeProjet?.entrepreneurialExperience || '',
            inspiringEntrepreneur: parsedEquipeProjet?.inspiringEntrepreneur || '',
            missingTeamSkills: parsedEquipeProjet?.missingTeamSkills || '',
            incubationParticipants: parsedEquipeProjet?.incubationParticipants || '',
            projectRoleLongTerm: parsedEquipeProjet?.projectRoleLongTerm || '',
            
            // Structure juridique
            hasExistingStructure: parsedStructureJuridique?.hasExistingStructure || false,
            structureName: parsedStructureJuridique?.structureName || '',
            structureStatus: parsedStructureJuridique?.structureStatus || '',
            structureCreationDate: parsedStructureJuridique?.structureCreationDate || '',
            structureContext: parsedStructureJuridique?.structureContext || '',
            generated_pdf_url: response.candidature.generated_pdf_url || null
          };
          
          setCandidature(flattenedData);
        } else {
          setError("La candidature n'a pas pu être chargée. Format de réponse non reconnu.");
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de la candidature:', err);
        setError("Erreur lors de la récupération de la candidature.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidature();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!candidature || !candidature.generated_pdf_url) return;

    setPdfLoading(true);
    setPdfError('');
    try {
      const response = await apiClient.get(`/candidatures/${candidature.id}/download-pdf`, {
        headers: authService.authHeader(),
        responseType: 'blob', 
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = `candidature-${candidature.id}.pdf`; 
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+[^\"])"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); 

    } catch (err) {
      console.error("Erreur lors du téléchargement du PDF:", err);
      if (err.response && err.response.data) {
        const errorData = await err.response.data.text();
        try {
            const errorJson = JSON.parse(errorData);
            setPdfError(errorJson.message || "Le téléchargement du PDF a échoué.");
        } catch (parseError) {
            setPdfError("Le téléchargement du PDF a échoué. Réponse d'erreur non standard.");
        }
      } else {
        setPdfError("Le téléchargement du PDF a échoué. Vérifiez votre connexion ou réessayez plus tard.");
      }
    } finally {
      setPdfLoading(false);
    }
  };

  // Fonction pour mettre à jour le statut de la candidature
  const updateCandidatureStatus = async (newStatus) => {
    // Ne rien faire si le statut n'a pas changé
    if (newStatus === candidature.status) {
      setUpdateMessage({ 
        type: 'info', 
        text: 'Le statut n\'a pas été modifié.' 
      });
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateMessage({ type: '', text: '' });

      const response = await apiClient.put(`/candidatures/${id}`, 
        { status: newStatus },
        { headers: authService.authHeader() }
      );

      if (response.data && response.data.success) {
        // Mise à jour du candidature local
        setCandidature(prev => ({ ...prev, status: newStatus }));
        setUpdateMessage({ 
          type: 'success', 
          text: `Le statut a été modifié en "${getStatusText(newStatus)}" avec succès.` 
        });
      } else {
        setUpdateMessage({ 
          type: 'danger', 
          text: 'Erreur lors de la mise à jour du statut.' 
        });
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setUpdateMessage({ 
        type: 'danger', 
        text: 'Erreur lors de la mise à jour du statut: ' + (err.response?.data?.message || err.message) 
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'soumise': return 'Soumise';
      case 'en_evaluation': return 'En évaluation';
      case 'acceptee': return 'Validée';
      case 'rejetee': return 'Rejetée';
      default: return 'Inconnu';
    }
  };

  // Fonction pour obtenir la classe CSS du statut
  const getStatusClass = (status) => {
    switch (status) {
      case 'brouillon': return 'status-draft';
      case 'soumise': return 'status-submitted';
      case 'en_evaluation': return 'status-evaluation';
      case 'acceptee': return 'status-accepted';
      case 'rejetee': return 'status-rejected';
      default: return '';
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'brouillon': return '#6c757d'; // secondary
      case 'soumise': return '#0d6efd'; // primary
      case 'en_evaluation': return '#856404'; // info
      case 'acceptee': return '#198754'; // success
      case 'rejetee': return '#dc3545'; // danger
      default: return '#6c757d'; // secondary
    }
  };

  // Fonction pour obtenir la classe du bouton de statut
  const getStatusButtonClass = (status, currentStatus) => {
    if (status === currentStatus) {
      return `status-button status-button-${status} active`;
    }
    return `status-button status-button-${status}`;
  };

  // Fonction pour obtenir la variante du bouton selon le statut (renommée, mais non utilisée avec la nouvelle approche)
  const getStatusButtonVariant = (status) => {
    switch (status) {
      case 'brouillon': return 'secondary';
      case 'soumise': return 'primary';
      case 'en_evaluation': return 'info';
      case 'acceptee': return 'success';
      case 'rejetee': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="candidature-detail-container">
        <div className="container">
          <p>Chargement des détails de la candidature...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidature-detail-container">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
          <Link to="/admin/candidatures" className="btn btn-primary">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="candidature-detail-container">
      <div className="container">
        <div className="candidature-detail-header">
        <h1>Détail de la candidature (Admin)</h1>
          <div className="meta-info">
            <span className={`candidature-status ${getStatusClass(candidature.status)}`}>
              {getStatusText(candidature.status)}
            </span>
            <div className="date-info">
              <span>Créée le : {formatDate(candidature.created_at)}</span>
              <span>Soumise le : {formatDate(candidature.submission_date)}</span>
              <span>Dernière mise à jour : {formatDate(candidature.updated_at)}</span>
            </div>
          </div>
          
          {/* Gestion du statut avec boutons */}
          <div className="admin-actions mt-3 card">
            <div className="card-body">
              <h3>Modifier le statut de la candidature</h3>
              <div className="status-buttons-container">
                <button 
                  className={getStatusButtonClass('brouillon', candidature.status)}
                  onClick={() => updateCandidatureStatus('brouillon')} 
                  disabled={updateLoading || candidature.status === 'brouillon'}
                  style={{ backgroundColor: candidature.status === 'brouillon' ? getStatusColor('brouillon') : 'transparent', 
                         color: candidature.status === 'brouillon' ? 'white' : getStatusColor('brouillon'),
                         borderColor: getStatusColor('brouillon') }}
                >
                  Brouillon
                </button>
                
                <button 
                  className={getStatusButtonClass('en_evaluation', candidature.status)}
                  onClick={() => updateCandidatureStatus('en_evaluation')} 
                  disabled={updateLoading || candidature.status === 'en_evaluation'}
                  style={{ backgroundColor: candidature.status === 'en_evaluation' ? getStatusColor('en_evaluation') : 'transparent', 
                         color: candidature.status === 'en_evaluation' ? 'white' : getStatusColor('en_evaluation'),
                         borderColor: getStatusColor('en_evaluation') }}
                >
                  En évaluation
                </button>
                
                {/* Boutons d'acceptation et de refus (uniquement visibles en mode évaluation) */}
                {candidature.status === 'en_evaluation' && (
                  <>
                    <button 
                      className="status-button status-button-acceptee"
                      onClick={() => updateCandidatureStatus('acceptee')} 
                      disabled={updateLoading}
                      style={{ backgroundColor: getStatusColor('acceptee'), color: 'white' }}
                    >
                      <i className="bi bi-check-circle me-1"></i> Accepter
                    </button>
                    
                    <button 
                      className="status-button status-button-rejetee"
                      onClick={() => updateCandidatureStatus('rejetee')} 
                      disabled={updateLoading}
                      style={{ backgroundColor: getStatusColor('rejetee'), color: 'white' }}
                    >
                      <i className="bi bi-x-circle me-1"></i> Refuser
                    </button>
                  </>
                )}
              </div>
              
              {updateLoading && (
                <div className="d-flex align-items-center mt-3">
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <span>Mise à jour en cours...</span>
                </div>
              )}
              
              {updateMessage.text && (
                <div className={`alert alert-${updateMessage.type} mt-3 mb-0`} role="alert">
                  {updateMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {candidature && (
          <div className="candidature-detail-content">
            {/* Section 1: Fiche d'identité */}
            <div className="detail-section">
              <h2 className="section-title">1. Fiche d'identité</h2>
              <div className="section-content">
                <div className="detail-item">
                  <span className="detail-label">Nom du projet :</span>
                  <span className="detail-value">{candidature.projectName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Secteur d'activité :</span>
                  <span className="detail-value">{candidature.sector}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Territoire d'implantation :</span>
                  <span className="detail-value">{candidature.territory}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Zone géographique d'intervention :</span>
                  <span className="detail-value">{candidature.interventionZone}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Comment ont-ils connu l'appel à candidatures :</span>
                  <ul className="detail-list">
                    {candidature.referral_boucheOreille && <li>Bouche à oreilles</li>}
                    {candidature.referral_facebook && <li>Facebook</li>}
                    {candidature.referral_linkedin && <li>LinkedIn</li>}
                    {candidature.referral_web && <li>Web</li>}
                    {candidature.referral_tiers && <li>Tiers</li>}
                    {candidature.referral_presse && <li>Presse</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2: Projet et utilité sociale */}
            <div className="detail-section">
              <h2 className="section-title">2. Votre projet et son utilité sociale</h2>
              <div className="section-content">
                <div className="detail-item">
                  <span className="detail-label">Genèse du projet :</span>
                  <div className="detail-text">{candidature.projectGenesis}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Résumé du projet :</span>
                  <div className="detail-text">{candidature.projectSummary}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Problème ciblé :</span>
                  <div className="detail-text">{candidature.problemDescription}</div>
                </div>
              </div>
            </div>

            {/* Section 3: Qui est concerné */}
            <div className="detail-section">
              <h2 className="section-title">3. Qui est concerné ?</h2>
              <div className="section-content">
                <div className="detail-item">
                  <span className="detail-label">Bénéficiaires :</span>
                  <div className="detail-text">{candidature.beneficiaries}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Clients :</span>
                  <div className="detail-text">{candidature.clients}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Quantification :</span>
                  <div className="detail-text">{candidature.clientsQuantification}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Solution proposée :</span>
                  <div className="detail-text">{candidature.proposedSolution}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Différenciation :</span>
                  <div className="detail-text">{candidature.projectDifferentiation}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Indicateurs d'impact :</span>
                  <ul className="detail-list">
                    <li>{candidature.indicator1}</li>
                    <li>{candidature.indicator2}</li>
                    <li>{candidature.indicator3}</li>
                    <li>{candidature.indicator4}</li>
                    <li>{candidature.indicator5}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4: Modèle économique */}
            <div className="detail-section">
              <h2 className="section-title">4. Le modèle économique</h2>
              <div className="section-content">
                <div className="detail-item">
                  <span className="detail-label">Sources de revenus :</span>
                  <div className="detail-text">{candidature.revenueSources}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Création d'emploi :</span>
                  <div className="detail-text">{candidature.employmentCreation}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Viabilité économique :</span>
                  <div className="detail-text">{candidature.economicViability}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Projets de diversification :</span>
                  <div className="detail-text">{candidature.diversification}</div>
                </div>
              </div>
            </div>

            {/* Section 5: Parties prenantes */}
            <div className="detail-section">
              <h2 className="section-title">5. La place des parties prenantes</h2>
              <div className="section-content">
                <div className="detail-item">
                  <span className="detail-label">Partenariats existants :</span>
                  <div className="detail-text">{candidature.existingPartnerships}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Partenariats recherchés :</span>
                  <div className="detail-text">{candidature.desiredPartnerships}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rôle des acteurs :</span>
                  <div className="detail-text">{candidature.stakeholderRole}</div>
                </div>
              </div>
            </div>

            {/* Section 6: L'équipe projet */}
            <div className="detail-section">
              <h2 className="section-title">6. L'équipe projet et parcours d'incubation</h2>
              <div className="section-content">
                <h3>Personne référente</h3>
                <div className="detail-item">
                  <span className="detail-label">Nom complet :</span>
                  <span className="detail-value">{candidature.referenceFirstName} {candidature.referenceLastName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de naissance :</span>
                  <span className="detail-value">{candidature.referenceDOB}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Adresse :</span>
                  <span className="detail-value">{candidature.referenceAddress}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email :</span>
                  <span className="detail-value">{candidature.referenceEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Téléphone :</span>
                  <span className="detail-value">{candidature.referenceTelephone}</span>
                </div>
                
                <h3>Membres de l'équipe</h3>
                {candidature.teamMembers && candidature.teamMembers.length > 0 ? (
                  <div className="team-members-list">
                    {candidature.teamMembers.map((member, index) => (
                      <div className="team-member" key={index}>
                        <div className="detail-item">
                          <span className="detail-label">Nom complet :</span>
                          <span className="detail-value">{member.firstName} {member.lastName}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email :</span>
                          <span className="detail-value">{member.email}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Téléphone :</span>
                          <span className="detail-value">{member.telephone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Aucun membre supplémentaire dans l'équipe.</p>
                )}
                
                {candidature.hasExistingStructure && (
                  <div className="existing-structure">
                    <h3>Structure juridique existante</h3>
                    <div className="detail-item">
                      <span className="detail-label">Nom de la structure :</span>
                      <span className="detail-value">{candidature.structureName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Statut :</span>
                      <span className="detail-value">{candidature.structureStatus}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date de création :</span>
                      <span className="detail-value">{candidature.structureCreationDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Contexte :</span>
                      <span className="detail-value">{candidature.structureContext}</span>
                    </div>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">Expérience entrepreneuriale :</span>
                  <div className="detail-text">{candidature.entrepreneurialExperience}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Entrepreneur inspirant :</span>
                  <div className="detail-text">{candidature.inspiringEntrepreneur}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Compétences manquantes dans l'équipe :</span>
                  <div className="detail-text">{candidature.missingTeamSkills}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Participants à l'incubation :</span>
                  <div className="detail-text">{candidature.incubationParticipants}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Rôle à long terme :</span>
                  <div className="detail-text">{candidature.projectRoleLongTerm}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="actions-container">
          <Link to="/admin/candidatures" className="btn btn-secondary">
            <i className="bi bi-arrow-left"></i> Retour à la liste
          </Link>

          {candidature && candidature.generated_pdf_url && (
            <button 
              onClick={handleDownloadPDF}
              className="btn btn-info"
              disabled={pdfLoading}
              style={{ marginLeft: '10px' }}
            >
              {pdfLoading ? (
                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Chargement...</>
              ) : (
                <><i className="bi bi-cloud-download"></i> Télécharger le PDF</>
              )}
            </button>
          )}
          {pdfError && <div className="alert alert-danger mt-2">{pdfError}</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminCandidatureDetail;

// Ajout du style CSS inline à la fin du fichier
const styles = `
  .status-buttons-container {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  
  .status-button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    border: 1px solid;
    transition: all 0.3s ease;
    min-width: 120px;
    text-align: center;
  }
  
  .status-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .status-button.active {
    font-weight: 600;
  }
`;

// Injecter le CSS dans le document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet); 