import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import candidatureService from '../../services/candidatureService';
import apiClient from '../../services/apiConfig';
import authService from '../../services/authService';
import '../../assets/css/candidature-detail.css';

const CandidatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [candidature, setCandidature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
          console.log('Données brutes reçues de l\'API:', response.candidature);
          
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
          
          const parsedEtatAvancement = typeof response.candidature.etat_avancement === 'string'
            ? JSON.parse(response.candidature.etat_avancement)
            : response.candidature.etat_avancement || {};

          const parsedDocuments = typeof response.candidature.documents_json === 'string'
            ? JSON.parse(response.candidature.documents_json)
            : response.candidature.documents_json || {};
          
          // Transformer les données imbriquées en structure plate pour l'affichage
          const flattenedData = {
            // Valeurs par défaut
            id: response.candidature.id,
            user: response.candidature.user_id,
            status: response.candidature.status,
            created_at: response.candidature.created_at,
            updated_at: response.candidature.updated_at,
            submission_date: response.candidature.submission_date,
            promotion: response.candidature.promotion,
            
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
            structureSiret: parsedStructureJuridique?.structureSiret || '',
            structureStatus: parsedStructureJuridique?.structureStatus || '',
            structureStatusOther: parsedStructureJuridique?.structureStatusOther || '',
            structureCreationDate: parsedStructureJuridique?.structureCreationDate || '',
            structureContext: parsedStructureJuridique?.structureContext || '',
            
            // État d'avancement
            otherSupport: parsedEtatAvancement?.otherSupport || '',
            diagnostic: parsedEtatAvancement?.diagnostic || {},
            collectif: parsedEtatAvancement?.collectif || {},
            experimentation: parsedEtatAvancement?.experimentation || {},
            etudeMarche: parsedEtatAvancement?.etudeMarche || {},
            offre: parsedEtatAvancement?.offre || {},
            chiffrage: parsedEtatAvancement?.chiffrage || {},
            firstRisk: parsedEtatAvancement?.firstRisk || '',
            swot: parsedEtatAvancement?.swot || {},
            weaknessesAndThreatsStrategy: parsedEtatAvancement?.weaknessesAndThreatsStrategy || '',
            creationTimeline: parsedEtatAvancement?.creationTimeline || '',
            readyToTravel: parsedEtatAvancement?.readyToTravel || '',
            readyToCommunicate: parsedEtatAvancement?.readyToCommunicate || '',
            readyToCommit: parsedEtatAvancement?.readyToCommit || '',

            // Documents
            businessPlan: parsedDocuments?.businessPlan || null,
            financialProjections: parsedDocuments?.financialProjections || null,
            additionalDocuments: parsedDocuments?.additionalDocuments || [],

            // Informations équipe projet supplémentaires
            teamPresentation: parsedEquipeProjet?.teamPresentation || '',
            projectMembersRoles: parsedEquipeProjet?.projectMembersRoles || [],
            currentProfessionalSituation: parsedEquipeProjet?.currentProfessionalSituation || '',
            incubationPeriodIncome: parsedEquipeProjet?.incubationPeriodIncome || '',
            weeklyTimeCommitment: parsedEquipeProjet?.weeklyTimeCommitment || '',
            incubatorMotivation: parsedEquipeProjet?.incubatorMotivation || '',
            contributionToIncubator: parsedEquipeProjet?.contributionToIncubator || '',

            // Métadonnées supplémentaires
            completion_percentage: response.candidature.completion_percentage,
            monday_item_id: response.candidature.monday_item_id,
            generated_pdf_url: response.candidature.generated_pdf_url,
            phone: response.candidature.phone,
            
            // Informations utilisateur
            user: response.candidature.user || {},
            isOwner: response.isOwner || false,
            isAdmin: response.isAdmin || false,
            isEvaluator: response.isEvaluator || false,
          };
          
          console.log('Données transformées pour l\'affichage:', flattenedData);
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

  // Fonction pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'brouillon': return 'Brouillon';
      case 'soumise': return 'Soumise';
      case 'en_evaluation': return 'En évaluation';
      case 'acceptee': return 'Acceptée';
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
          <Link to="/candidatures" className="btn btn-primary">Retour à la liste</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="candidature-detail-container">
      <div className="container">
        <div className="candidature-detail-header">
          <h1>Détail de la candidature</h1>
          <div className="meta-info">
            <div className="status-promotion">
              <span className={`candidature-status ${getStatusClass(candidature.status)}`}>
                {getStatusText(candidature.status)}
              </span>
              {candidature.promotion && (
                <span className="promotion">
                  {candidature.promotion}
                </span>
              )}
            </div>
            <div className="date-info">
              <span>Créée le : {formatDate(candidature.created_at)}</span>
              {candidature.submission_date && (
                <span>Soumise le : {formatDate(candidature.submission_date)}</span>
              )}
              <span>Dernière mise à jour : {formatDate(candidature.updated_at)}</span>
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
                  <span className="detail-label">Nom du projet *</span>
                  <div className="detail-value">{candidature.projectName}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Secteur d'activité *</span>
                  <div className="choice-cards-display">
                    <div className="choice-card-display">
                      <div className="choice-card-title">
                        {candidature.sector === 'autre' 
                          ? candidature.sectorOther 
                          : {
                              'economie_circulaire': 'Économie circulaire',
                              'alimentation_durable': 'Alimentation durable',
                              'mobilite': 'Mobilité',
                              'habitat': 'Habitat',
                              'education': 'Éducation',
                              'sante': 'Santé',
                              'numerique': 'Numérique',
                              'culture': 'Culture',
                              'tourisme': 'Tourisme',
                              'sport': 'Sport',
                              'services': 'Services',
                              'commerce': 'Commerce',
                              'energie': 'Énergie',
                              'agriculture': 'Agriculture',
                              'industrie': 'Industrie'
                            }[candidature.sector] || candidature.sector}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Territoire d'implantation *</span>
                  <div className="detail-value">{candidature.territory}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Zone géographique d'intervention *</span>
                  <div className="choice-cards-display">
                    <div className="choice-card-display">
                      <div className="choice-card-title">
                        {{
                          'quartier': 'Quartier',
                          'ville': 'Ville',
                          'agglomeration': 'Agglomération',
                          'departement': 'Département',
                          'region': 'Région',
                          'national': 'National',
                          'international': 'International'
                        }[candidature.interventionZone] || candidature.interventionZone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Comment avez-vous eu connaissance de l'appel à candidatures ? *</span>
                  <div className="detail-list">
                    {candidature.referral_facebook_adress && <li>Page Facebook de l'ADRESS</li>}
                    {candidature.referral_linkedin_adress && <li>Page LinkedIn de l'ADRESS</li>}
                    {candidature.referral_instagram_adress && <li>Page Instagram de l'ADRESS</li>}
                    {candidature.referral_web_adress && <li>Site internet de l'ADRESS</li>}
                    {candidature.referral_mail_adress && <li>Par un mail de l'ADRESS</li>}
                  </div>
                </div>

                {candidature.hasExistingStructure && (
                  <div className="existing-structure">
                    <h3>Structure juridique existante</h3>
                    <div className="existing-structure-grid">
                      <div className="detail-item">
                        <span className="detail-label">Nom de la structure *</span>
                        <div className="detail-value">{candidature.structureName}</div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Numéro SIRET *</span>
                        <div className="detail-value">{candidature.structureSiret}</div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Statut juridique *</span>
                      <div className="choice-cards-display">
                        <div className="choice-card-display">
                          <div className="choice-card-title">
                            {candidature.structureStatus === 'autre' 
                              ? candidature.structureStatusOther 
                              : {
                                  'association': 'Association',
                                  'cooperative': 'Coopérative',
                                  'societe_ess': 'Société commerciale de l\'ESS',
                                  'societe_hors_ess': 'Société commerciale hors ESS'
                                }[candidature.structureStatus] || candidature.structureStatus}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Date de création *</span>
                      <div className="detail-value">
                        {new Date(candidature.structureCreationDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Dans quel cadre la structure candidate-t-elle à l'incubateur ? *</span>
                      <div className="choice-cards-display">
                        <div className="choice-card-display">
                          <div className="choice-card-title">
                            {candidature.structureContext === 'autre' 
                              ? candidature.structureContextOther
                              : {
                                  'nouvelle_activite': 'Développement d\'une nouvelle activité',
                                  'implantation': 'Implantation en Normandie'
                                }[candidature.structureContext] || candidature.structureContext}
                          </div>
                          <div className="choice-card-description">
                            {candidature.structureContext === 'nouvelle_activite' 
                              ? 'Vous souhaitez développer une nouvelle activité au sein de votre structure'
                              : candidature.structureContext === 'implantation'
                                ? 'Vous souhaitez implanter votre activité en Normandie'
                                : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="existing-structure-grid">
                      <div className="detail-item">
                        <span className="detail-label">La personne référente pour le projet est-elle salariée par la structure ou bénévole ? *</span>
                        <div className="detail-value">{candidature.referenceEmploymentType}</div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Depuis combien de temps ? *</span>
                        <div className="detail-value">{candidature.referenceEmploymentDuration}</div>
                      </div>
                    </div>
                  </div>
                )}
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
                      <span className="detail-label">SIRET :</span>
                      <span className="detail-value">{candidature.structureSiret}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Statut :</span>
                      <span className="detail-value">
                        {candidature.structureStatus === 'autre' 
                          ? candidature.structureStatusOther 
                          : candidature.structureStatus}
                      </span>
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
                <div className="detail-item">
                  <span className="detail-label">Présentation de l'équipe :</span>
                  <div className="detail-text">{candidature.teamPresentation}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Situation professionnelle actuelle :</span>
                  <div className="detail-text">{candidature.currentProfessionalSituation}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Revenus pendant la période d'incubation :</span>
                  <div className="detail-text">{candidature.incubationPeriodIncome}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Temps hebdomadaire consacré :</span>
                  <div className="detail-text">{candidature.weeklyTimeCommitment}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Motivation pour l'incubateur :</span>
                  <div className="detail-text">{candidature.incubatorMotivation}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Contribution à l'incubateur :</span>
                  <div className="detail-text">{candidature.contributionToIncubator}</div>
                </div>

                {candidature.projectMembersRoles && candidature.projectMembersRoles.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Rôles des membres du projet</span>
                    <div className="roles-timeline">
                      {candidature.projectMembersRoles.map((member, index) => (
                        <div key={index} className="member-roles">
                          <div className="member-roles-header">
                            <h4>{member.name || 'Membre ' + (index + 1)}</h4>
                          </div>
                          <div className="role-periods">
                            <div className="role-period">
                              <div className="role-period-header">Court terme</div>
                              <div className="role-period-content">
                                <div className="role-field">
                                  <span className="role-label">Type :</span>
                                  <div className="role-value">{member.shortTerm?.type || '-'}</div>
                                </div>
                                <div className="role-field">
                                  <span className="role-label">Détails :</span>
                                  <div className="role-value">{member.shortTerm?.details || '-'}</div>
                                </div>
                              </div>
                            </div>

                            <div className="role-period">
                              <div className="role-period-header">Moyen terme</div>
                              <div className="role-period-content">
                                <div className="role-field">
                                  <span className="role-label">Type :</span>
                                  <div className="role-value">{member.mediumTerm?.type || '-'}</div>
                                </div>
                                <div className="role-field">
                                  <span className="role-label">Détails :</span>
                                  <div className="role-value">{member.mediumTerm?.details || '-'}</div>
                                </div>
                              </div>
                            </div>

                            <div className="role-period">
                              <div className="role-period-header">Long terme</div>
                              <div className="role-period-content">
                                <div className="role-field">
                                  <span className="role-label">Type :</span>
                                  <div className="role-value">{member.longTerm?.type || '-'}</div>
                                </div>
                                <div className="role-field">
                                  <span className="role-label">Détails :</span>
                                  <div className="role-value">{member.longTerm?.details || '-'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 7: État d'avancement */}
            <div className="detail-section">
              <h2 className="section-title">7. État d'avancement</h2>
              <div className="section-content">
                <div className="detail-item">
                  <span className="detail-label">Autres accompagnements :</span>
                  <div className="detail-text">{candidature.otherSupport}</div>
                </div>

                <h3>Diagnostic</h3>
                <div className="detail-item">
                  <span className="detail-label">Statut :</span>
                  <span className="detail-value">{candidature.diagnostic.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Détails :</span>
                  <div className="detail-text">{candidature.diagnostic.details}</div>
                </div>

                <h3>Collectif</h3>
                <div className="detail-item">
                  <span className="detail-label">Statut :</span>
                  <span className="detail-value">{candidature.collectif.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Détails :</span>
                  <div className="detail-text">{candidature.collectif.details}</div>
                </div>

                <h3>Expérimentation</h3>
                <div className="detail-item">
                  <span className="detail-label">Statut :</span>
                  <span className="detail-value">{candidature.experimentation.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Détails :</span>
                  <div className="detail-text">{candidature.experimentation.details}</div>
                </div>

                <h3>Étude de marché</h3>
                <div className="detail-item">
                  <span className="detail-label">Statut :</span>
                  <span className="detail-value">{candidature.etudeMarche.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Détails :</span>
                  <div className="detail-text">{candidature.etudeMarche.details}</div>
                </div>

                <h3>Offre</h3>
                <div className="detail-item">
                  <span className="detail-label">Statut :</span>
                  <span className="detail-value">{candidature.offre.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Détails :</span>
                  <div className="detail-text">{candidature.offre.details}</div>
                </div>

                <h3>Chiffrage</h3>
                <div className="detail-item">
                  <span className="detail-label">Statut :</span>
                  <span className="detail-value">{candidature.chiffrage.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Détails :</span>
                  <div className="detail-text">{candidature.chiffrage.details}</div>
                </div>

                <h3>Analyse SWOT</h3>
                <div className="detail-item">
                  <span className="detail-label">Forces :</span>
                  <div className="detail-text">{candidature.swot.strengths}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Faiblesses :</span>
                  <div className="detail-text">{candidature.swot.weaknesses}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Opportunités :</span>
                  <div className="detail-text">{candidature.swot.opportunities}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Menaces :</span>
                  <div className="detail-text">{candidature.swot.threats}</div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Premier risque identifié :</span>
                  <div className="detail-text">{candidature.firstRisk}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Stratégie face aux faiblesses et menaces :</span>
                  <div className="detail-text">{candidature.weaknessesAndThreatsStrategy}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Calendrier de création :</span>
                  <div className="detail-text">{candidature.creationTimeline}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Prêt à voyager :</span>
                  <div className="detail-text">{candidature.readyToTravel}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Prêt à communiquer :</span>
                  <div className="detail-text">{candidature.readyToCommunicate}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Prêt à s'engager :</span>
                  <div className="detail-text">{candidature.readyToCommit}</div>
                </div>
              </div>
            </div>

            {/* Section 8: Documents */}
            <div className="detail-section">
              <h2 className="section-title">8. Documents</h2>
              <div className="section-content">
                <div className="detail-item">
                  <span className="detail-label">Business Plan :</span>
                  <span className="detail-value">
                    {candidature.businessPlan ? (
                      <a href={candidature.businessPlan} target="_blank" rel="noopener noreferrer">
                        Voir le document
                      </a>
                    ) : 'Non fourni'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Projections financières :</span>
                  <span className="detail-value">
                    {candidature.financialProjections ? (
                      <a href={candidature.financialProjections} target="_blank" rel="noopener noreferrer">
                        Voir le document
                      </a>
                    ) : 'Non fourni'}
                  </span>
                </div>
                {candidature.additionalDocuments && candidature.additionalDocuments.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Documents additionnels :</span>
                    <ul className="detail-list">
                      {candidature.additionalDocuments.map((doc, index) => (
                        <li key={index}>
                          <a href={doc} target="_blank" rel="noopener noreferrer">
                            Document {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="actions-container">
          <Link to="/candidatures" className="btn btn-secondary">
            <i className="fa fa-arrow-left"></i> Retour à la liste
          </Link>
          
          {candidature && candidature.status === 'brouillon' && (
            <Link to={`/candidatures/${id}/edit`} className="btn btn-primary">
              <i className="fa fa-edit"></i> Modifier
            </Link>
          )}

          {candidature && candidature.generated_pdf_url && (
            <button 
              onClick={handleDownloadPDF}
              className="btn btn-info"
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Chargement...</>
              ) : (
                <><i className="fa fa-download"></i> Télécharger le PDF</>
              )}
            </button>
          )}
          {pdfError && <div className="alert alert-danger mt-2">{pdfError}</div>}
        </div>
      </div>
    </div>
  );
};

export default CandidatureDetail; 