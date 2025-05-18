import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import candidatureService from '../../services/candidatureService';
import '../../assets/css/candidature-form.css';

const CandidatureForm = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(!!routeId);
  const [id, setId] = useState(routeId);

  const [currentStep, setCurrentStep] = useState(1);
  const [candidature, setCandidature] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Référence pour accéder aux valeurs Formik dans des fonctions externes
  const formikRef = useRef(null);
  // Référence pour limiter les autosave multiples sur l'étape récapitulative (Étape 9)
  const autoSaveOnceOnStep9Ref = useRef(false);

  const structureContextLabels = {
    nouvelle_activite: 'Développement d\'une nouvelle activité',
    implantation: 'Implantation en Normandie',
    autre: 'Autre'
  };

  // Définition des 8 étapes du formulaire avec numérotation (les chiffres seront affichés dans la navigation)
  const steps = [
    { id: 1, name: "Fiche d'identité", icon: 'fa-id-card' },
    { id: 2, name: "Votre projet et son utilité sociale", icon: 'fa-lightbulb' },
    { id: 3, name: "Qui est concerné ?", icon: 'fa-users' },
    { id: 4, name: "Le modèle économique", icon: 'fa-chart-line' },
    { id: 5, name: "La place des parties prenantes", icon: 'fa-handshake' },
    { id: 6, name: "L'équipe projet et parcours d'incubation", icon: 'fa-user-friends' },
    { id: 7, name: "État d'avancement du projet", icon: 'fa-tasks' },
    { id: 8, name: "Documents justificatifs", icon: 'fa-file-upload' },
    { id: 9, name: "Récapitulatif", icon: 'fa-check-circle' }
  ];

  // Valeurs initiales regroupant toutes les questions du PDF, mémorisées pour éviter les recréations à chaque rendu
  const initialValues = useMemo(() => ({
    // Étape 1 : Fiche d'identité
    projectName: '',
    sector: '',
    sectorOther: '', // Ajouté pour le secteur "Autre"
    territory: '',
    interventionZone: '',
    // Provenance (mis à jour selon le formulaire)
    referral_facebook_adress: false,
    referral_linkedin_adress: false,
    referral_instagram_adress: false,
    referral_web_adress: false,
    referral_mail_adress: false,
    referral_salarie_adress: false,
    referral_medias: false,
    referral_tiers_hors_adress: false,
    // Structure juridique (ajout des champs manquants)
    hasExistingStructure: false,
    structureName: '',
    structureSiret: '', // Ajouté
    structureStatus: '',
    structureStatusOther: '', // Ajouté
    structureCreationDate: '',
    structureContext: '',
    structureContextOther: '', // Ajouté
    referenceEmploymentType: '', // Gardé pour compatibilité ? Ou à intégrer dans projectMembersRoles ? Revérifier la logique d'affichage/sauvegarde
    referenceEmploymentDuration: '', // Gardé pour compatibilité ?

    // Étape 2 : Votre projet et son utilité sociale
    projectGenesis: '',
    projectSummary: '',
    problemDescription: '',

    // Étape 3 : Qui est concerné ?
    beneficiaries: '',
    clients: '',
    // clientsQuantification: '', // Semble intégré dans beneficiaries/clients, supprimé pour éviter confusion
    proposedSolution: '',
    projectDifferentiation: '',
    indicator1: '',
    indicator2: '',
    indicator3: '',
    indicator4: '',
    indicator5: '',

    // Étape 4 : Le modèle économique
    revenueSources: '',
    employmentCreation: '',
    // economicViability: '', // Remplacé par les 5 éléments
    viabilityElement1: '', // Ajouté
    viabilityElement2: '', // Ajouté
    viabilityElement3: '', // Ajouté
    viabilityElement4: '', // Ajouté
    viabilityElement5: '', // Ajouté
    diversification: '',

    // Étape 5 : La place des parties prenantes
    existingPartnerships: '',
    desiredPartnerships: '',
    stakeholderRole: '',

    // Étape 6 : L'équipe projet et parcours d'incubation
    // Personne référente (gardé pour l'instant, voir si pertinent vs projectMembersRoles)
    referenceLastName: '',
    referenceFirstName: '',
    referenceDOB: '',
    referenceAddress: '',
    referenceEmail: '',
    referenceTelephone: '',
    // Anciens teamMembers (gardé pour l'instant)
    teamMembers: [],
    // Nouveaux champs Étape 6
    teamPresentation: '',
    hasEntrepreneurialExperience: false, // Note: utilisé comme booléen
    entrepreneurialExperience: '',
    inspiringEntrepreneur: '',
    missingTeamSkills: '',
    incubationParticipants: '',
    projectMembersRoles: [{ // S'assurer que c'est bien initialisé comme tableau
      name: '',
      shortTerm: { type: '', details: '' },
      mediumTerm: { type: '', details: '' },
      longTerm: { type: '', details: '' }
    }],
    currentProfessionalSituation: '',
    incubationPeriodIncome: '',
    weeklyTimeCommitment: '',
    incubatorMotivation: '',
    contributionToIncubator: '',

    // Étape 7 : État d'avancement du projet
    otherSupport: '',
    diagnostic: { status: '', details: '' },
    collectif: { status: '', details: '' },
    experimentation: { status: '', details: '' },
    etudeMarche: { status: '', details: '' },
    offre: { status: '', details: '' },
    chiffrage: { status: '', details: '' },
    firstRisk: '',
    swot: {
      strengths: '',
      weaknesses: '',
      opportunities: '',
      threats: ''
    },
    weaknessesAndThreatsStrategy: '',
    creationTimeline: '',
    readyToTravel: '', // Devrait être un booléen ou 'oui'/'non'? Actuellement string via radio
    readyToCommunicate: '', // Devrait être un booléen ou 'oui'/'non'? Actuellement string via radio
    readyToCommit: '', // Devrait être un booléen ou 'oui'/'non'? Actuellement string via radio

    // Étape 8 : Documents justificatifs
    document: null, // Pour le fichier unique
    // financialProjections: null, // Supprimé, non présent dans le formulaire
    // additionalDocuments: [], // Supprimé, non présent dans le formulaire

    // Autres champs potentiels (non visibles dans le form actuel mais peut-être utiles ?)
    user: null, // Gardé pour lier à l'utilisateur
    status: 'brouillon', // Statut initial
  }), []); // Tableau de dépendances vide signifie que cette valeur ne changera jamais

  // Schémas de validation par étape
  const step1ValidationSchema = Yup.object({
    projectName: Yup.string().required('Ce champ est requis'),
    sector: Yup.string().required('Ce champ est requis'),
    territory: Yup.string().required('Ce champ est requis'),
    interventionZone: Yup.string().required('Ce champ est requis'),
    // Validation pour les champs de structure si hasExistingStructure est vrai
    hasExistingStructure: Yup.boolean().required('Veuillez indiquer si la structure existe'),
    structureName: Yup.string().when('hasExistingStructure', {
      is: true, then: (schema) => schema.required('Le nom de la structure est requis'), otherwise: (schema) => schema.notRequired()
    }),
    structureSiret: Yup.string().when('hasExistingStructure', {
      is: true, then: (schema) => schema.required('Le SIRET est requis').matches(/^[0-9]{14}$/, 'Le SIRET doit contenir 14 chiffres'), otherwise: (schema) => schema.notRequired()
    }),
    structureStatus: Yup.string().when('hasExistingStructure', {
      is: true, then: (schema) => schema.required('Le statut juridique est requis'), otherwise: (schema) => schema.notRequired()
    }),
    structureStatusOther: Yup.string().when('structureStatus', {
      is: 'autre', then: (schema) => schema.required('Veuillez préciser le statut'), otherwise: (schema) => schema.notRequired()
    }),
    structureCreationDate: Yup.string().when('hasExistingStructure', {
      is: true, then: (schema) => schema.required('La date de création est requise'), otherwise: (schema) => schema.notRequired()
    }),
    structureContext: Yup.string().when('hasExistingStructure', {
      is: true, then: (schema) => schema.required('Le contexte est requis'), otherwise: (schema) => schema.notRequired()
    }),
    structureContextOther: Yup.string().when('structureContext', {
      is: 'autre', then: (schema) => schema.required('Veuillez préciser le contexte'), otherwise: (schema) => schema.notRequired()
    }),
    referenceEmploymentType: Yup.string().when('hasExistingStructure', {
      is: true, then: (schema) => schema.required('Le type d\'emploi est requis'), otherwise: (schema) => schema.notRequired()
    }),
    referenceEmploymentDuration: Yup.string().when('hasExistingStructure', {
      is: true, then: (schema) => schema.required('La durée est requise'), otherwise: (schema) => schema.notRequired()
    }),
  });

  const step2ValidationSchema = Yup.object({
    projectGenesis: Yup.string().required('Ce champ est requis').min(50, 'Veuillez écrire au moins 50 caractères'),
    projectSummary: Yup.string().required('Ce champ est requis').max(500, 'Maximum 10 lignes approximatives'),
    problemDescription: Yup.string().required('Ce champ est requis').min(100, 'Veuillez décrire en détail le problème'),
  });

  const step3ValidationSchema = Yup.object({
    beneficiaries: Yup.string().required('Ce champ est requis'),
    clients: Yup.string().required('Ce champ est requis'),
    clientsQuantification: Yup.string().required('Ce champ est requis'),
    proposedSolution: Yup.string().required('Ce champ est requis'),
    projectDifferentiation: Yup.string().required('Ce champ est requis'),
    indicator1: Yup.string().required('Indicateur requis'),
    indicator2: Yup.string().required('Indicateur requis'),
    indicator3: Yup.string().required('Indicateur requis'),
    indicator4: Yup.string().required('Indicateur requis'),
    indicator5: Yup.string().required('Indicateur requis'),
  });

  const step4ValidationSchema = Yup.object({
    revenueSources: Yup.string().required('Ce champ est requis'),
    employmentCreation: Yup.string().required('Ce champ est requis'),
    // Remplacer la validation de economicViability par les 5 éléments
    viabilityElement1: Yup.string().required('Élément 1 requis'),
    viabilityElement2: Yup.string().notRequired(), // Les autres sont optionnels mais recommandés
    viabilityElement3: Yup.string().notRequired(),
    viabilityElement4: Yup.string().notRequired(),
    viabilityElement5: Yup.string().notRequired(),
    diversification: Yup.string().required('Ce champ est requis'),
  });

  const step5ValidationSchema = Yup.object({
    existingPartnerships: Yup.string().required('Ce champ est requis'),
    desiredPartnerships: Yup.string().required('Ce champ est requis'),
    stakeholderRole: Yup.string().required('Ce champ est requis'),
  });

  const step6ValidationSchema = Yup.object({
    // Ajout validation personne référente
    referenceLastName: Yup.string().required('Ce champ est requis'),
    referenceFirstName: Yup.string().required('Ce champ est requis'),
    referenceDOB: Yup.string().required('Ce champ est requis'), // Changé en string, la validation de date peut être complexe
    referenceAddress: Yup.string().required('Ce champ est requis'),
    referenceEmail: Yup.string().email('Email invalide').required('Ce champ est requis'),
    referenceTelephone: Yup.string().required('Ce champ est requis'),
    // Ajout validation autres membres
    teamMembers: Yup.array().of(
      Yup.object().shape({
        lastName: Yup.string().required('Nom requis'),
        firstName: Yup.string().required('Prénom requis'),
        email: Yup.string().email('Email invalide').required('Email requis'),
        telephone: Yup.string().required('Téléphone requis'),
      })
    ),
    // Validation existante pour les autres champs de l'étape 6
    teamPresentation: Yup.string().required("Veuillez présenter l'équipe."),
    hasEntrepreneurialExperience: Yup.boolean().required('Veuillez indiquer si vous avez une expérience entrepreneuriale.'),
    entrepreneurialExperience: Yup.string().when('hasEntrepreneurialExperience', {
      is: true,
      then: (schema) => schema.required('Veuillez préciser votre expérience.'),
      otherwise: (schema) => schema.notRequired(),
    }),
    inspiringEntrepreneur: Yup.string().required('Ce champ est requis.'),
    missingTeamSkills: Yup.string().required('Ce champ est requis.'),
    incubationParticipants: Yup.string().required('Ce champ est requis.'),
    projectMembersRoles: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Nom et prénom requis'),
        shortTerm: Yup.object().shape({
          type: Yup.string().required('Type requis'),
          details: Yup.string().required('Détails requis'),
        }),
        mediumTerm: Yup.object().shape({
          type: Yup.string().required('Type requis'),
          details: Yup.string().required('Détails requis'),
        }),
        longTerm: Yup.object().shape({
          type: Yup.string().required('Type requis'),
          details: Yup.string().required('Détails requis'),
        }),
      })
    ).min(1, 'Veuillez ajouter au moins un porteur de projet.').typeError('Veuillez ajouter au moins un porteur de projet.'),
    currentProfessionalSituation: Yup.string().required('Ce champ est requis.'),
    incubationPeriodIncome: Yup.string().required('Ce champ est requis.'),
    weeklyTimeCommitment: Yup.string().required('Ce champ est requis.'),
    incubatorMotivation: Yup.string().required('Ce champ est requis.'),
    contributionToIncubator: Yup.string().required('Ce champ est requis.'),
  });

  const step7ValidationSchema = Yup.object({
    otherSupport: Yup.string().notRequired(),
    diagnostic: Yup.object().shape({ status: Yup.string().required('Veuillez sélectionner une option') }),
    collectif: Yup.object().shape({ status: Yup.string().required('Veuillez sélectionner une option') }),
    experimentation: Yup.object().shape({ status: Yup.string().required('Veuillez sélectionner une option') }),
    etudeMarche: Yup.object().shape({ status: Yup.string().required('Veuillez sélectionner une option') }),
    offre: Yup.object().shape({ status: Yup.string().required('Veuillez sélectionner une option') }),
    chiffrage: Yup.object().shape({ status: Yup.string().required('Veuillez sélectionner une option') }),
    firstRisk: Yup.string().required('Ce champ est requis.'),
    swot: Yup.object().shape({
      strengths: Yup.string().required('Forces requises'),
      weaknesses: Yup.string().required('Faiblesses requises'),
      opportunities: Yup.string().required('Opportunités requises'),
      threats: Yup.string().required('Menaces requises'),
    }),
    weaknessesAndThreatsStrategy: Yup.string().required('Ce champ est requis.'),
    creationTimeline: Yup.string().required('Ce champ est requis.'),
    readyToTravel: Yup.string().required('Veuillez sélectionner une option'),
    readyToCommunicate: Yup.string().required('Veuillez sélectionner une option'),
    readyToCommit: Yup.string().required('Veuillez sélectionner une option'),
  });

  const step8ValidationSchema = Yup.object({
    // Validation pour l'étape 8 (Documents justificatifs)
    // Ajustez selon vos besoins si le document est requis ou non
  });

  const getValidationSchema = () => {
    switch (currentStep) {
      case 1:
        return step1ValidationSchema;
      case 2:
        return step2ValidationSchema;
      case 3:
        return step3ValidationSchema;
      case 4:
        return step4ValidationSchema;
      case 5:
        return step5ValidationSchema;
      case 6:
        return step6ValidationSchema;
      case 7:
        return step7ValidationSchema;
      case 8:
        return step8ValidationSchema; // Ajout du schéma pour l'étape 8
      default:
        return Yup.object({});
    }
  };

  // Récupération des données en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchCandidature = async () => {
        try {
          setLoading(true);
          const response = await candidatureService.getCandidatureById(id);
          
          if (response && response.candidature) {
            console.log('Données brutes reçues de l\'API:', response.candidature);
            
            // Vérifier si la candidature est déjà soumise
            if (response.candidature.status === 'soumise') {
              setIsSubmitted(true);
              console.log('Cette candidature est en statut soumise, elle n\'est pas modifiable');
            }
            
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
            
            // Transformer les données imbriquées en structure plate
            const flattenedData = {
              // Valeurs par défaut
              ...initialValues,
              
              // Données de base
              id: response.candidature.id,
              user: response.candidature.user_id,
              status: response.candidature.status,
              
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
              ...(parsedEquipeProjet.members ? { teamMembers: parsedEquipeProjet.members } : { teamMembers: [] }),
              
              // Personne référente
              referenceLastName: parsedEquipeProjet?.reference?.lastName || '',
              referenceFirstName: parsedEquipeProjet?.reference?.firstName || '',
              referenceDOB: parsedEquipeProjet?.reference?.DOB ? parsedEquipeProjet?.reference?.DOB.substring(0, 10) : '',
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
              structureSiret: parsedStructureJuridique?.structureSiret || '', // Ajouté
              structureStatus: parsedStructureJuridique?.structureStatus || '',
              structureStatusOther: parsedStructureJuridique?.structureStatusOther || '', // Ajouté
              structureCreationDate: parsedStructureJuridique?.structureCreationDate ? parsedStructureJuridique.structureCreationDate.substring(0, 10) : '', // Formatage date
              structureContext: parsedStructureJuridique?.structureContext || '',
              structureContextOther: parsedStructureJuridique?.structureContextOther || '', // Ajouté
              
              // Référents (migration depuis l'ancien format si présent)
              referral_facebook_adress: parsedFicheIdentite?.referral_facebook_adress ?? parsedFicheIdentite?.referral_facebook ?? false,
              referral_linkedin_adress: parsedFicheIdentite?.referral_linkedin_adress ?? parsedFicheIdentite?.referral_linkedin ?? false,
              referral_instagram_adress: parsedFicheIdentite?.referral_instagram_adress ?? false,
              referral_web_adress: parsedFicheIdentite?.referral_web_adress ?? parsedFicheIdentite?.referral_web ?? false,
              referral_mail_adress: parsedFicheIdentite?.referral_mail_adress ?? false,
              referral_salarie_adress: parsedFicheIdentite?.referral_salarie_adress ?? false,
              referral_medias: parsedFicheIdentite?.referral_medias ?? parsedFicheIdentite?.referral_presse ?? false,
              referral_tiers_hors_adress: parsedFicheIdentite?.referral_tiers_hors_adress ?? parsedFicheIdentite?.referral_tiers ?? false,
            };
            
            console.log('Données transformées pour le formulaire:', flattenedData);
            setCandidature(flattenedData);
            
            const percentage = response.completionPercentage || calculateCompletionPercentage(flattenedData);
            setProgressPercentage(percentage);
          } else if (response && response.data) {
            // Format de réponse alternatif, déjà plat
            const formattedData = {
              ...response.data,
              // Garantir que teamMembers est un tableau
              teamMembers: Array.isArray(response.data.teamMembers) ? response.data.teamMembers : [],
              // Formatage correct des dates si nécessaire
              referenceDOB: response.data.referenceDOB ? response.data.referenceDOB.substring(0, 10) : '',
              structureCreationDate: response.data.structureCreationDate ? response.data.structureCreationDate.substring(0, 10) : ''
            };
            
            console.log('Données alternatives formatées:', formattedData);
            setCandidature(formattedData);
            const percentage = calculateCompletionPercentage(formattedData);
            setProgressPercentage(percentage);
          } else {
            console.error('Format de réponse non reconnu:', response);
            setError("Format de réponse non reconnu. Contactez l'administrateur.");
          }
        } catch (err) {
          console.error('Erreur lors de la récupération de la candidature:', err);
          setError("Erreur lors de la récupération de la candidature.");
          // En cas d'erreur 404 ou autre, initialiser avec les valeurs par défaut
          if (err.response && err.response.status === 404) {
            console.log("Candidature non trouvée, initialisation d'un nouveau formulaire.");
            setCandidature({ ...initialValues, user: currentUser._id });
          } else {
            // Autre type d'erreur, afficher le message
            setError("Erreur lors de la récupération des données.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchCandidature();
    } else {
      setCandidature({ ...initialValues, user: currentUser._id });
      setLoading(false);
    }
  }, [id, isEditMode, currentUser, initialValues]);

  // Fonction pour calculer le pourcentage de complétion
  const calculateCompletionPercentage = (data) => {
    if (!data) return 0;
    
    // Nombre total de champs requis
    const totalRequiredFields = 50; // Mettre à jour ce nombre total! Recompter précisément tous les champs requis.
                                   // Step 1: 4 base + 1 hasStruct + (7 si hasStruct=true) = 5 à 12
                                   // Step 2: 3
                                   // Step 3: 5 + 5 indicateurs = 10
                                   // Step 4: 3 + 1 viab + 1 div = 5
                                   // Step 5: 3
                                   // Step 6: 1 teamPres + 1 hasExp + (1 si hasExp=true) + 1 inspiring + 1 missing + 1 participants + 1 projectMembers + 1 currentProf + 1 income + 1 time + 1 motiv + 1 contrib = 11 à 12
                                   // Step 7: 6 status + 1 firstRisk + 1 swot + 1 strategy + 1 timeline + 3 ready = 14
                                   // Total Min = 5+3+10+5+3+11+14 = 51
                                   // Total Max = 12+3+10+5+3+12+14 = 59
                                   // Utilisons une moyenne ou un nombre fixe raisonnable. 55 ?
    
    // Compter les champs remplis
    let filledFields = 0;
    
    // Étape 1
    if (data.projectName) filledFields++;
    if (data.sector) filledFields++;
    if (data.territory) filledFields++;
    if (data.interventionZone) filledFields++;
    // Structure (si requise)
    if (typeof data.hasExistingStructure === 'boolean') filledFields++; // Check if defined
    if (data.hasExistingStructure) {
      if (data.structureName) filledFields++;
      if (data.structureSiret) filledFields++;
      if (data.structureStatus) filledFields++;
      if (data.structureCreationDate) filledFields++;
      if (data.structureContext) filledFields++;
      if (data.referenceEmploymentType) filledFields++;
      if (data.referenceEmploymentDuration) filledFields++;
    }
    
    // Étape 2
    if (data.projectGenesis) filledFields++;
    if (data.projectSummary) filledFields++;
    if (data.problemDescription) filledFields++;
    
    // Étape 3
    if (data.beneficiaries) filledFields++;
    if (data.clients) filledFields++;
    if (data.proposedSolution) filledFields++;
    if (data.projectDifferentiation) filledFields++;
    if (data.indicator1) filledFields++;
    if (data.indicator2) filledFields++;
    if (data.indicator3) filledFields++;
    if (data.indicator4) filledFields++;
    if (data.indicator5) filledFields++;
    
    // Étape 4
    if (data.revenueSources) filledFields++;
    if (data.employmentCreation) filledFields++;
    if (data.viabilityElement1) filledFields++; // Au moins le premier est requis
    if (data.diversification) filledFields++;
    
    // Étape 5
    if (data.existingPartnerships) filledFields++;
    if (data.desiredPartnerships) filledFields++;
    if (data.stakeholderRole) filledFields++;
    
    // Étape 6
    if (data.referenceLastName) filledFields++;
    if (data.referenceFirstName) filledFields++;
    if (data.referenceDOB) filledFields++;
    if (data.referenceAddress) filledFields++;
    if (data.referenceEmail) filledFields++;
    if (data.referenceTelephone) filledFields++;
    if (data.teamPresentation) filledFields++;
    if (typeof data.hasEntrepreneurialExperience === 'boolean') filledFields++; // Vérifie si défini
    if (data.hasEntrepreneurialExperience && data.entrepreneurialExperience) filledFields++; // Compte seulement si oui et rempli
    if (data.inspiringEntrepreneur) filledFields++;
    if (data.missingTeamSkills) filledFields++;
    if (data.incubationParticipants) filledFields++;
    if (Array.isArray(data.projectMembersRoles) && data.projectMembersRoles.length > 0) {
       // Check if at least one member has minimal info (name and one type)
       const hasValidMember = data.projectMembersRoles.some(m => m.name && (m.shortTerm?.type || m.mediumTerm?.type || m.longTerm?.type));
       if (hasValidMember) filledFields++;
    }
    if (data.currentProfessionalSituation) filledFields++;
    if (data.incubationPeriodIncome) filledFields++;
    if (data.weeklyTimeCommitment) filledFields++;
    if (data.incubatorMotivation) filledFields++;
    if (data.contributionToIncubator) filledFields++;
    
    // Étape 7
    // Ajouter ici les vérifications pour les champs de l'étape 7
    if (data.diagnostic?.status) filledFields++;
    if (data.collectif?.status) filledFields++;
    if (data.experimentation?.status) filledFields++;
    if (data.etudeMarche?.status) filledFields++;
    if (data.offre?.status) filledFields++;
    if (data.chiffrage?.status) filledFields++;
    if (data.firstRisk) filledFields++;
    if (data.swot?.strengths && data.swot?.weaknesses && data.swot?.opportunities && data.swot?.threats) filledFields++;
    if (data.weaknessesAndThreatsStrategy) filledFields++;
    if (data.creationTimeline) filledFields++;
    if (data.readyToTravel) filledFields++;
    if (data.readyToCommunicate) filledFields++;
    if (data.readyToCommit) filledFields++;
    
    // Étape 8 (si des champs y sont requis)
    // if (data.document) filledFields++;
    
    return Math.round((filledFields / totalRequiredFields) * 100);
  };

  // Mettre à jour le pourcentage de complétion à chaque changement d'étape
  useEffect(() => {
    if (candidature && !formikRef.current) {
      const percentage = calculateCompletionPercentage(candidature);
      setProgressPercentage(percentage);
    } else if (formikRef.current && formikRef.current.values) {
      const percentage = calculateCompletionPercentage(formikRef.current.values);
      setProgressPercentage(percentage);
    }
  }, [currentStep, candidature]);

  // Mettre à jour le pourcentage de complétion à chaque changement d'étape
  useEffect(() => {
    // Seulement si la progression n'est pas déjà définie
    // Cela évite de remettre à zéro lors du changement d'étape
    if (progressPercentage === 0) {
      if (candidature && !formikRef.current) {
        const percentage = calculateCompletionPercentage(candidature);
        setProgressPercentage(percentage);
      } else if (formikRef.current && formikRef.current.values) {
        const percentage = calculateCompletionPercentage(formikRef.current.values);
        setProgressPercentage(percentage);
      }
    }
  }, [currentStep, candidature, progressPercentage]);

  // Sauvegarder automatiquement en brouillon quand on arrive à l'étape de récapitulatif
  useEffect(() => {
    // Réinitialiser le drapeau quand on quitte l'étape 9
    if (currentStep !== 9) {
      if (autoSaveOnceOnStep9Ref.current) {
      }
      autoSaveOnceOnStep9Ref.current = false;
    }

    if (currentStep === 9 && candidature && !loading && !autoSaveOnceOnStep9Ref.current) {
      autoSaveOnceOnStep9Ref.current = true; // Empêche les appels multiples pour cette instance d'arrivée à l'étape 9
      
      const autoSaveDraft = async () => {
        if (!formikRef.current) {
          return;
        }
        try {
          // Vérifier si la candidature est complète et a été soumise
          if (isSubmitted) {
            console.log('Candidature déjà soumise, pas de sauvegarde automatique');
            return;
          }
          
          // Si formikRef n'est pas défini ou ne contient pas de valeurs, on sort
          if (!formikRef.current || !formikRef.current.values) {
            console.log('Formik non initialisé, impossible de sauvegarder automatiquement');
            return;
          }
          
          // Utiliser les valeurs du formulaire Formik au lieu de l'état candidature
          const formValues = formikRef.current.values;
          
          const apiData = {
            status: 'brouillon',
            
            // Fiche d'identité
            fiche_identite: {
              projectName: formValues.projectName || '',
              sector: formValues.sector || '',
              territory: formValues.territory || '',
              interventionZone: formValues.interventionZone || '',
              referral_boucheOreille: !!formValues.referral_boucheOreille,
              referral_facebook: !!formValues.referral_facebook,
              referral_linkedin: !!formValues.referral_linkedin,
              referral_web: !!formValues.referral_web,
              referral_tiers: !!formValues.referral_tiers,
              referral_presse: !!formValues.referral_presse,
            },
            
            // Projet et utilité sociale
            projet_utilite_sociale: {
              projectGenesis: formValues.projectGenesis || '',
              projectSummary: formValues.projectSummary || '',
              problemDescription: formValues.problemDescription || '',
            },
            
            // Qui est concerné
            qui_est_concerne: {
              beneficiaries: formValues.beneficiaries || '',
              clients: formValues.clients || '',
              clientsQuantification: formValues.clientsQuantification || '',
              proposedSolution: formValues.proposedSolution || '',
              projectDifferentiation: formValues.projectDifferentiation || '',
              indicator1: formValues.indicator1 || '',
              indicator2: formValues.indicator2 || '',
              indicator3: formValues.indicator3 || '',
              indicator4: formValues.indicator4 || '',
              indicator5: formValues.indicator5 || '',
            },
            
            // Modèle économique
            modele_economique: {
              revenueSources: formValues.revenueSources || '',
              employmentCreation: formValues.employmentCreation || '',
              viabilityElement1: formValues.viabilityElement1 || '',
              viabilityElement2: formValues.viabilityElement2 || '',
              viabilityElement3: formValues.viabilityElement3 || '',
              viabilityElement4: formValues.viabilityElement4 || '',
              viabilityElement5: formValues.viabilityElement5 || '',
              diversification: formValues.diversification || '',
            },
            
            // Parties prenantes
            parties_prenantes: {
              existingPartnerships: formValues.existingPartnerships || '',
              desiredPartnerships: formValues.desiredPartnerships || '',
              stakeholderRole: formValues.stakeholderRole || '',
            },
            
            // Équipe projet
            equipe_projet: {
              teamPresentation: formValues.teamPresentation || '',
              hasEntrepreneurialExperience: !!formValues.hasEntrepreneurialExperience,
              entrepreneurialExperience: formValues.entrepreneurialExperience || '',
              inspiringEntrepreneur: formValues.inspiringEntrepreneur || '',
              missingTeamSkills: formValues.missingTeamSkills || '',
              incubationParticipants: formValues.incubationParticipants || '',
              projectMembersRoles: Array.isArray(formValues.projectMembersRoles) ? formValues.projectMembersRoles : [],
              currentProfessionalSituation: formValues.currentProfessionalSituation || '',
              incubationPeriodIncome: formValues.incubationPeriodIncome || '',
              weeklyTimeCommitment: formValues.weeklyTimeCommitment || '',
              incubatorMotivation: formValues.incubatorMotivation || '',
              contributionToIncubator: formValues.contributionToIncubator || '',
              reference: {
                lastName: formValues.referenceLastName || '',
                firstName: formValues.referenceFirstName || '',
                DOB: formValues.referenceDOB || '',
                address: formValues.referenceAddress || '',
                email: formValues.referenceEmail || '',
                telephone: formValues.referenceTelephone || '',
                employmentType: formValues.referenceEmploymentType || '',
                employmentDuration: formValues.referenceEmploymentDuration || '',
              },
              teamMembers: Array.isArray(formValues.teamMembers) ? formValues.teamMembers : [],
            },
            
            // État d'avancement du projet
            etat_avancement: {
              otherSupport: formValues.otherSupport || '',
              diagnostic: formValues.diagnostic || { status: '', details: '' },
              collectif: formValues.collectif || { status: '', details: '' },
              experimentation: formValues.experimentation || { status: '', details: '' },
              etudeMarche: formValues.etudeMarche || { status: '', details: '' },
              offre: formValues.offre || { status: '', details: '' },
              chiffrage: formValues.chiffrage || { status: '', details: '' },
              firstRisk: formValues.firstRisk || '',
              swot: formValues.swot || {
                strengths: '',
                weaknesses: '',
                opportunities: '',
                threats: ''
              },
              weaknessesAndThreatsStrategy: formValues.weaknessesAndThreatsStrategy || '',
              creationTimeline: formValues.creationTimeline || '',
              readyToTravel: formValues.readyToTravel || '',
              readyToCommunicate: formValues.readyToCommunicate || '',
              readyToCommit: formValues.readyToCommit || '',
            },
            
            // Documents justificatifs
            documents: {
              businessPlan: formValues.document || null,
              financialProjections: formValues.financialProjections || null,
              additionalDocuments: Array.isArray(formValues.additionalDocuments) ? formValues.additionalDocuments : [],
            },
            
            // Structure juridique
            structure_juridique: {
              hasExistingStructure: !!formValues.hasExistingStructure,
              structureName: formValues.structureName || '',
              structureSiret: formValues.structureSiret || '', // Ajouté
              structureStatus: formValues.structureStatus || '',
              structureStatusOther: formValues.structureStatusOther || '', // Ajouté
              structureCreationDate: formValues.structureCreationDate || '',
              structureContext: formValues.structureContext || '',
              structureContextOther: formValues.structureContextOther || '', // Ajouté
              // Ajout des champs liés à la personne référente SI structure existe
              referenceEmploymentType: formValues.referenceEmploymentType || '',
              referenceEmploymentDuration: formValues.referenceEmploymentDuration || '',
            },
            
            // Métadonnées
            metadata: {
              lastSaved: new Date().toISOString(),
              completionPercentage: calculateCompletionPercentage(formValues),
              currentStep: currentStep,
            },
            
            // ID utilisateur
            user_id: formValues.user || formValues.user_id
          };
          
          console.log('Sauvegarde automatique en brouillon avant le récapitulatif:', apiData);
          
          let response;
          if (isEditMode && id) {
            // Mettre à jour la candidature existante avec le nouveau statut et les données
            response = await candidatureService.updateCandidature(id, apiData);
            console.log('Candidature mise à jour automatiquement en brouillon:', response);
          } else {
            // Créer une nouvelle candidature si nous ne sommes pas en mode édition
            response = await candidatureService.createCandidature(apiData);
            console.log('Nouvelle candidature créée automatiquement en brouillon:', response);
            
            // Récupérer l'ID de la nouvelle candidature
            const candidatureId = response?.data?._id || response?.candidature?.id || response?.id;
            
            if (candidatureId) {
              console.log('ID de la nouvelle candidature:', candidatureId);
              
              // Mettre à jour l'URL sans recharger la page
              window.history.replaceState(null, '', `/candidatures/${candidatureId}/edit`);
              
              // Mettre à jour l'état local pour refléter le mode édition
              setId(candidatureId);
              setIsEditMode(true);
              
              // Afficher un message de succès doux
              setSuccessMessage('Brouillon sauvegardé automatiquement.');
              // Ne pas faire disparaître ce message, car c'est une info utile
              // setTimeout(() => {
              //  setSuccessMessage('');
              // }, 5000);
            } else {
              console.warn('Impossible de déterminer l\'ID de la candidature à partir de la réponse:', response);
            }
          }
        } catch (err) {
          console.error('Erreur lors de la sauvegarde automatique en brouillon:', err);
          // Ne pas afficher d'erreur à l'utilisateur pour la sauvegarde automatique
        }
      };
      
      autoSaveDraft();
    } else if (currentStep === 9 && candidature && !loading && autoSaveOnceOnStep9Ref.current) {
      console.log("[CandidatureForm autoSaveEffect] Step 9 reached, but autoSaveOnceOnStep9Ref is true. Skipping auto-save.");
    }
  }, [currentStep, candidature, id, isEditMode, loading, navigate, isSubmitted, formikRef]); // formikRef ajouté aux dépendances si autoSaveDraft l'utilise

  const goToStep = (stepId) => {
    setCurrentStep(stepId);
    window.scrollTo(0, 0);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      // Empêcher toute tentative de soumission si on n'est pas à la dernière étape
      if (currentStep === steps.length - 1) { // Étape 8 -> 9
        // Si on passe de l'étape 8 à 9, simplement changer d'étape sans soumettre
        console.log('Passage à l\'étape de récapitulatif');
      }
      
      // Mettre à jour le pourcentage de progression lors du passage à l'étape suivante
      if (candidature) {
        const percentage = calculateCompletionPercentage(candidature);
        setProgressPercentage(percentage);
      }
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const saveDraft = async (values) => {
    try {
      console.log('Valeurs brutes du formulaire à sauvegarder:', values);
      
      // S'assurer que toutes les valeurs sont des types de données appropriés (pas des chaînes JSON)
      // Cela évite de sauvegarder des chaînes JSON déjà sérialisées
      
      // Transformer les données plates en structure attendue par l'API
      const apiData = {
        status: 'brouillon',
        
        // Fiche d'identité (si nous connaissons les champs exacts, nous pouvons les filtrer ici)
        fiche_identite: {
          projectName: values.projectName || '',
          sector: values.sector || '',
          territory: values.territory || '',
          interventionZone: values.interventionZone || '',
          referral_boucheOreille: !!values.referral_boucheOreille,
          referral_facebook: !!values.referral_facebook,
          referral_linkedin: !!values.referral_linkedin,
          referral_web: !!values.referral_web,
          referral_tiers: !!values.referral_tiers,
          referral_presse: !!values.referral_presse,
        },
        
        // Projet et utilité sociale
        projet_utilite_sociale: {
          projectGenesis: values.projectGenesis || '',
          projectSummary: values.projectSummary || '',
          problemDescription: values.problemDescription || '',
        },
        
        // Qui est concerné
        qui_est_concerne: {
          beneficiaries: values.beneficiaries || '',
          clients: values.clients || '',
          clientsQuantification: values.clientsQuantification || '',
          proposedSolution: values.proposedSolution || '',
          projectDifferentiation: values.projectDifferentiation || '',
          indicator1: values.indicator1 || '',
          indicator2: values.indicator2 || '',
          indicator3: values.indicator3 || '',
          indicator4: values.indicator4 || '',
          indicator5: values.indicator5 || '',
        },
        
        // Modèle économique
        modele_economique: {
          revenueSources: values.revenueSources || '',
          employmentCreation: values.employmentCreation || '',
          viabilityElement1: values.viabilityElement1 || '',
          viabilityElement2: values.viabilityElement2 || '',
          viabilityElement3: values.viabilityElement3 || '',
          viabilityElement4: values.viabilityElement4 || '',
          viabilityElement5: values.viabilityElement5 || '',
          diversification: values.diversification || '',
        },
        
        // Parties prenantes
        parties_prenantes: {
          existingPartnerships: values.existingPartnerships || '',
          desiredPartnerships: values.desiredPartnerships || '',
          stakeholderRole: values.stakeholderRole || '',
        },
        
        // Équipe projet
        equipe_projet: {
          teamPresentation: values.teamPresentation || '',
          hasEntrepreneurialExperience: !!values.hasEntrepreneurialExperience,
          entrepreneurialExperience: values.entrepreneurialExperience || '',
          inspiringEntrepreneur: values.inspiringEntrepreneur || '',
          missingTeamSkills: values.missingTeamSkills || '',
          incubationParticipants: values.incubationParticipants || '',
          projectMembersRoles: Array.isArray(values.projectMembersRoles) ? values.projectMembersRoles : [],
          currentProfessionalSituation: values.currentProfessionalSituation || '',
          incubationPeriodIncome: values.incubationPeriodIncome || '',
          weeklyTimeCommitment: values.weeklyTimeCommitment || '',
          incubatorMotivation: values.incubatorMotivation || '',
          contributionToIncubator: values.contributionToIncubator || '',
          reference: {
            lastName: values.referenceLastName || '',
            firstName: values.referenceFirstName || '',
            DOB: values.referenceDOB || '',
            address: values.referenceAddress || '',
            email: values.referenceEmail || '',
            telephone: values.referenceTelephone || '',
            employmentType: values.referenceEmploymentType || '',
            employmentDuration: values.referenceEmploymentDuration || '',
          },
          teamMembers: Array.isArray(values.teamMembers) ? values.teamMembers : [],
        },
        
        // État d'avancement du projet
        etat_avancement: {
          otherSupport: values.otherSupport || '',
          diagnostic: values.diagnostic || { status: '', details: '' },
          collectif: values.collectif || { status: '', details: '' },
          experimentation: values.experimentation || { status: '', details: '' },
          etudeMarche: values.etudeMarche || { status: '', details: '' },
          offre: values.offre || { status: '', details: '' },
          chiffrage: values.chiffrage || { status: '', details: '' },
          firstRisk: values.firstRisk || '',
          swot: values.swot || {
            strengths: '',
            weaknesses: '',
            opportunities: '',
            threats: ''
          },
          weaknessesAndThreatsStrategy: values.weaknessesAndThreatsStrategy || '',
          creationTimeline: values.creationTimeline || '',
          readyToTravel: values.readyToTravel || '',
          readyToCommunicate: values.readyToCommunicate || '',
          readyToCommit: values.readyToCommit || '',
        },
        
        // Documents justificatifs
        documents: {
          businessPlan: values.document || null,
          financialProjections: values.financialProjections || null,
          additionalDocuments: Array.isArray(values.additionalDocuments) ? values.additionalDocuments : [],
        },
        
        // Structure juridique
        structure_juridique: {
          hasExistingStructure: !!values.hasExistingStructure,
          structureName: values.structureName || '',
          structureSiret: values.structureSiret || '', // Ajouté
          structureStatus: values.structureStatus || '',
          structureStatusOther: values.structureStatusOther || '', // Ajouté
          structureCreationDate: values.structureCreationDate || '',
          structureContext: values.structureContext || '',
          structureContextOther: values.structureContextOther || '', // Ajouté
          // Ajout des champs liés à la personne référente SI structure existe
          referenceEmploymentType: values.referenceEmploymentType || '',
          referenceEmploymentDuration: values.referenceEmploymentDuration || '',
        },
        
        // Métadonnées
        metadata: {
          lastSaved: new Date().toISOString(),
          completionPercentage: calculateCompletionPercentage(values),
          currentStep: currentStep,
        },
        
        // ID utilisateur
        user_id: values.user || values.user_id
      };
      
      console.log('Données formatées pour l\'API:', apiData);
      
      let response;
      if (isEditMode) {
        response = await candidatureService.updateCandidature(id, apiData);
        console.log('Réponse mise à jour:', response);
      } else {
        response = await candidatureService.createCandidature(apiData);
        console.log('Réponse création:', response);
        
        // Vérifier la structure de la réponse et extraire l'ID en conséquence
        const candidatureId = response?.data?._id || response?.candidature?.id || response?.id;
        
        if (candidatureId) {
          console.log('ID de candidature identifié:', candidatureId);
          navigate(`/candidatures/${candidatureId}/edit`);
        } else {
          console.warn('Impossible de déterminer l\'ID de la candidature à partir de la réponse:', response);
          // La candidature a bien été créée, mais on ne peut pas rediriger vers la page d'édition
          // On reste sur la page actuelle car la candidature a bien été enregistrée en brouillon
        }
      }
      
      // Mettre à jour les données et la progression
      // Garder les valeurs du formulaire pour l'affichage mais s'assurer que les objets sont correctement structurés
      const updatedCandidature = {
        ...values, // Copier les valeurs actuelles du formulaire
        // S'assurer que teamMembers est bien un tableau
        teamMembers: Array.isArray(values.teamMembers) ? values.teamMembers : []
      };
      
      // Mettre à jour l'état avec les nouvelles valeurs structurées
      setCandidature(updatedCandidature);
      
      // Calculer le pourcentage de complétion avec les données mises à jour
      const percentage = calculateCompletionPercentage(updatedCandidature);
      setProgressPercentage(percentage);
      
      // Afficher un message de succès plus détaillé
      const draftSuccessMessage = isEditMode 
        ? 'Brouillon mis à jour avec succès. Vous pouvez continuer à compléter votre candidature ou la soumettre définitivement à l\'étape 8.' 
        : 'Brouillon créé avec succès. Votre candidature a été sauvegardée. Vous pouvez continuer à la compléter ou revenir plus tard.';
      
      // Remplacer l'alert standard par une div de message de succès plus élégante
      setSuccessMessage(draftSuccessMessage);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000); // Le message disparaîtra après 5 secondes
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du brouillon:', err);
      setError("Erreur lors de la sauvegarde du brouillon. Vérifiez la console pour plus de détails.");
    }
  };

  const submitCandidature = async (values) => {
    try {
      // Étape 1: Vérifier que nous sommes bien à l'étape du récapitulatif (étape 9)
      if (currentStep !== 9) { // Changé 8 à 9
        setCurrentStep(9); // Rediriger vers le récapitulatif si ce n'est pas déjà le cas
        return; // On sort immédiatement pour éviter d'afficher l'alerte de confirmation
      }

      // Étape 2: Demander confirmation avant la soumission finale
      if (window.confirm('Vous êtes sur le point de soumettre définitivement votre candidature. Cette action est irréversible. Voulez-vous continuer?')) {
        console.log('Soumission finale de la candidature...');
        
        // Transformer les données plates en structure attendue par l'API
        const submissionData = {
          status: 'soumise', // Statut de soumission finale
          
          // Fiche d'identité
          fiche_identite: {
            projectName: values.projectName || '',
            sector: values.sector || '',
            territory: values.territory || '',
            interventionZone: values.interventionZone || '',
            referral_boucheOreille: !!values.referral_boucheOreille,
            referral_facebook: !!values.referral_facebook,
            referral_linkedin: !!values.referral_linkedin,
            referral_web: !!values.referral_web,
            referral_tiers: !!values.referral_tiers,
            referral_presse: !!values.referral_presse,
          },
          
          // Projet et utilité sociale
          projet_utilite_sociale: {
            projectGenesis: values.projectGenesis || '',
            projectSummary: values.projectSummary || '',
            problemDescription: values.problemDescription || '',
          },
          
          // Qui est concerné
          qui_est_concerne: {
            beneficiaries: values.beneficiaries || '',
            clients: values.clients || '',
            clientsQuantification: values.clientsQuantification || '',
            proposedSolution: values.proposedSolution || '',
            projectDifferentiation: values.projectDifferentiation || '',
            indicator1: values.indicator1 || '',
            indicator2: values.indicator2 || '',
            indicator3: values.indicator3 || '',
            indicator4: values.indicator4 || '',
            indicator5: values.indicator5 || '',
          },
          
          // Modèle économique
          modele_economique: {
            revenueSources: values.revenueSources || '',
            employmentCreation: values.employmentCreation || '',
            viabilityElement1: values.viabilityElement1 || '',
            viabilityElement2: values.viabilityElement2 || '',
            viabilityElement3: values.viabilityElement3 || '',
            viabilityElement4: values.viabilityElement4 || '',
            viabilityElement5: values.viabilityElement5 || '',
            diversification: values.diversification || '',
          },
          
          // Parties prenantes
          parties_prenantes: {
            existingPartnerships: values.existingPartnerships || '',
            desiredPartnerships: values.desiredPartnerships || '',
            stakeholderRole: values.stakeholderRole || '',
          },
          
          // Équipe projet
          equipe_projet: {
            teamPresentation: values.teamPresentation || '',
            hasEntrepreneurialExperience: !!values.hasEntrepreneurialExperience,
            entrepreneurialExperience: values.entrepreneurialExperience || '',
            inspiringEntrepreneur: values.inspiringEntrepreneur || '',
            missingTeamSkills: values.missingTeamSkills || '',
            incubationParticipants: values.incubationParticipants || '',
            projectMembersRoles: Array.isArray(values.projectMembersRoles) ? values.projectMembersRoles : [],
            currentProfessionalSituation: values.currentProfessionalSituation || '',
            incubationPeriodIncome: values.incubationPeriodIncome || '',
            weeklyTimeCommitment: values.weeklyTimeCommitment || '',
            incubatorMotivation: values.incubatorMotivation || '',
            contributionToIncubator: values.contributionToIncubator || '',
            reference: {
              lastName: values.referenceLastName || '',
              firstName: values.referenceFirstName || '',
              DOB: values.referenceDOB || '',
              address: values.referenceAddress || '',
              email: values.referenceEmail || '',
              telephone: values.referenceTelephone || '',
              employmentType: values.referenceEmploymentType || '',
              employmentDuration: values.referenceEmploymentDuration || '',
            },
            teamMembers: Array.isArray(values.teamMembers) ? values.teamMembers : [],
          },
          
          // État d'avancement du projet
          etat_avancement: {
            otherSupport: values.otherSupport || '',
            diagnostic: values.diagnostic || { status: '', details: '' },
            collectif: values.collectif || { status: '', details: '' },
            experimentation: values.experimentation || { status: '', details: '' },
            etudeMarche: values.etudeMarche || { status: '', details: '' },
            offre: values.offre || { status: '', details: '' },
            chiffrage: values.chiffrage || { status: '', details: '' },
            firstRisk: values.firstRisk || '',
            swot: values.swot || {
              strengths: '',
              weaknesses: '',
              opportunities: '',
              threats: ''
            },
            weaknessesAndThreatsStrategy: values.weaknessesAndThreatsStrategy || '',
            creationTimeline: values.creationTimeline || '',
            readyToTravel: values.readyToTravel || '',
            readyToCommunicate: values.readyToCommunicate || '',
            readyToCommit: values.readyToCommit || '',
          },
          
          // Documents justificatifs
          documents: {
            businessPlan: values.document || null,
            financialProjections: values.financialProjections || null,
            additionalDocuments: Array.isArray(values.additionalDocuments) ? values.additionalDocuments : [],
          },
          
          // Structure juridique
          structure_juridique: {
            hasExistingStructure: !!values.hasExistingStructure,
            structureName: values.structureName || '',
            structureSiret: values.structureSiret || '', // Ajouté
            structureStatus: values.structureStatus || '',
            structureStatusOther: values.structureStatusOther || '', // Ajouté
            structureCreationDate: values.structureCreationDate || '',
            structureContext: values.structureContext || '',
            structureContextOther: values.structureContextOther || '', // Ajouté
            // Ajout des champs liés à la personne référente SI structure existe
            referenceEmploymentType: values.referenceEmploymentType || '',
            referenceEmploymentDuration: values.referenceEmploymentDuration || '',
          },
          
          // Métadonnées
          metadata: {
            lastSaved: new Date().toISOString(),
            completionPercentage: calculateCompletionPercentage(values),
            currentStep: currentStep,
          },
          
          // ID utilisateur
          user_id: values.user || values.user_id
        };
        
        console.log('Données de soumission finale:', submissionData);
        
        // Soumettre la candidature avec le statut 'soumise'
        await candidatureService.updateCandidature(id, submissionData);
        navigate('/candidatures', { state: { success: true, message: 'Candidature soumise avec succès !' } });
      }
    } catch (err) {
      console.error('Erreur lors de la soumission de la candidature:', err);
      setError("Erreur lors de la soumission de la candidature. Vérifiez la console pour plus de détails.");
    }
  };

  if (loading) {
    return (
      <div className="candidature-form-container">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="candidature-form-container">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
          <Link to="/candidatures" className="btn btn-primary">Retour</Link>
        </div>
      </div>
    );
  }

  // Si la candidature est soumise, afficher un message et masquer le formulaire d'édition
  if (isSubmitted) {
    return (
      <div className="candidature-form-container">
        <div className="container">
          <div className="candidature-form-header">
            <h1>Candidature soumise</h1>
            <div className="alert alert-info">
              <p>Cette candidature a déjà été soumise. Elle n'est plus modifiable.</p>
              <p>Vous pouvez consulter son contenu ci-dessous.</p>
            </div>
          </div>
          
          {candidature && (
            <div className="recap-container">
              {/* Section 1: Fiche d'identité */}
              <div className="recap-section">
                <h3 className="recap-title">1. Fiche d'identité</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Nom du projet :</span>
                    <span className="recap-value">{candidature.projectName}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Secteur d'activité :</span>
                    <span className="recap-value">{candidature.sector}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Territoire d'implantation :</span>
                    <span className="recap-value">{candidature.territory}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Zone géographique d'intervention :</span>
                    <span className="recap-value">{candidature.interventionZone}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Projet et utilité sociale */}
              <div className="recap-section">
                <h3 className="recap-title">2. Votre projet et son utilité sociale</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Genèse du projet :</span>
                    <span className="recap-value">{candidature.projectGenesis}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Résumé du projet :</span>
                    <span className="recap-value">{candidature.projectSummary}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Problème ciblé :</span>
                    <span className="recap-value">{candidature.problemDescription}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Qui est concerné */}
              <div className="recap-section">
                <h3 className="recap-title">3. Qui est concerné ?</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Bénéficiaires :</span>
                    <span className="recap-value">{candidature.beneficiaries}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Clients :</span>
                    <span className="recap-value">{candidature.clients}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Quantification :</span>
                    <span className="recap-value">{candidature.clientsQuantification}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Solution proposée :</span>
                    <span className="recap-value">{candidature.proposedSolution}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Différenciation :</span>
                    <span className="recap-value">{candidature.projectDifferentiation}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Indicateurs d'impact :</span>
                    <ul className="recap-list">
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
              <div className="recap-section">
                <h3 className="recap-title">4. Le modèle économique</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Sources de revenus :</span>
                    <span className="recap-value">{candidature.revenueSources}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Création d'emploi :</span>
                    <span className="recap-value">{candidature.employmentCreation}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Viabilité économique :</span>
                    <span className="recap-value">{candidature.economicViability}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Projets de diversification :</span>
                    <span className="recap-value">{candidature.diversification}</span>
                  </div>
                </div>
              </div>

              {/* Section 5: Parties prenantes */}
              <div className="recap-section">
                <h3 className="recap-title">5. La place des parties prenantes</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Partenariats existants :</span>
                    <span className="recap-value">{candidature.existingPartnerships}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Partenariats recherchés :</span>
                    <span className="recap-value">{candidature.desiredPartnerships}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Rôle des acteurs :</span>
                    <span className="recap-value">{candidature.stakeholderRole}</span>
                  </div>
                </div>
              </div>

              {/* Section 6: L'équipe projet */}
              <div className="recap-section">
                <h3 className="recap-title">6. L'équipe projet et parcours d'incubation</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Personne référente :</span>
                    <div className="recap-subitem">
                      <span>{candidature.referenceFirstName} {candidature.referenceLastName}</span>
                      <span>Email : {candidature.referenceEmail}</span>
                      <span>Téléphone : {candidature.referenceTelephone}</span>
                    </div>
                  </div>
                  
                  <div className="recap-item">
                    <span className="recap-label">Membres de l'équipe :</span>
                    {candidature.teamMembers && candidature.teamMembers.length > 0 ? (
                      <ul className="recap-list">
                        {candidature.teamMembers.map((member, index) => (
                          <li key={index}>
                            {member.firstName} {member.lastName} - {member.email}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="recap-value">Aucun membre supplémentaire</span>
                    )}
                  </div>
                  
                  {/* Afficher les porteurs de projet */}
                  {Array.isArray(candidature.projectMembersRoles) && candidature.projectMembersRoles && candidature.projectMembersRoles.length > 0 && (
                    <div className="recap-item">
                      <span className="recap-label">Place des porteurs de projet :</span>
                      {candidature.projectMembersRoles.map((member, index) => (
                        <div key={index} className="recap-subitem mb-3 border-bottom pb-3">
                          <strong>{member.name || 'Porteur sans nom'}</strong>
                          <table className="table table-sm table-bordered mt-2">
                            <thead><tr><th>Période</th><th>Type</th><th>Missions</th></tr></thead>
                            <tbody>
                              <tr>
                                <td>Court terme</td>
                                <td>{member.shortTerm && member.shortTerm.type ? member.shortTerm.type : 'Non défini'}</td>
                                <td>{member.shortTerm && member.shortTerm.details ? member.shortTerm.details : 'Non défini'}</td>
                              </tr>
                              <tr>
                                <td>Moyen terme</td>
                                <td>{member.mediumTerm && member.mediumTerm.type ? member.mediumTerm.type : 'Non défini'}</td>
                                <td>{member.mediumTerm && member.mediumTerm.details ? member.mediumTerm.details : 'Non défini'}</td>
                              </tr>
                              <tr>
                                <td>Long terme</td>
                                <td>{member.longTerm && member.longTerm.type ? member.longTerm.type : 'Non défini'}</td>
                                <td>{member.longTerm && member.longTerm.details ? member.longTerm.details : 'Non défini'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 7: État d'avancement */}
              <div className="recap-section">
                <h3 className="recap-title">7. État d'avancement du projet</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Accompagnement(s) autre(s) :</span>
                    <span className="recap-value">{candidature.otherSupport || 'Non renseigné'}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Étapes réalisées :</span>
                    <ul className="recap-list">
                      <li>Diagnostic territorial : {candidature.diagnostic?.status} {candidature.diagnostic?.details && `(${candidature.diagnostic.details})`}</li>
                      <li>Constitution collectif : {candidature.collectif?.status} {candidature.collectif?.details && `(${candidature.collectif.details})`}</li>
                      <li>Expérimentation terrain : {candidature.experimentation?.status} {candidature.experimentation?.details && `(${candidature.experimentation.details})`}</li>
                      <li>Étude de marché : {candidature.etudeMarche?.status} {candidature.etudeMarche?.details && `(${candidature.etudeMarche.details})`}</li>
                      <li>Formalisation offre : {candidature.offre?.status} {candidature.offre?.details && `(${candidature.offre.details})`}</li>
                      <li>Premier chiffrage : {candidature.chiffrage?.status} {candidature.chiffrage?.details && `(${candidature.chiffrage.details})`}</li>
                    </ul>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Premier risque pris :</span>
                    <span className="recap-value">{candidature.firstRisk}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Analyse SWOT :</span>
                    <div className="recap-subitem">
                      <p><strong>Forces :</strong> {candidature.swot?.strengths}</p>
                      <p><strong>Faiblesses :</strong> {candidature.swot?.weaknesses}</p>
                      <p><strong>Opportunités :</strong> {candidature.swot?.opportunities}</p>
                      <p><strong>Menaces :</strong> {candidature.swot?.threats}</p>
                    </div>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Stratégie faiblesses/menaces :</span>
                    <span className="recap-value">{candidature.weaknessesAndThreatsStrategy}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Échéance création / Plan d'action :</span>
                    <span className="recap-value">{candidature.creationTimeline}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Prêt à se déplacer :</span>
                    <span className="recap-value">{candidature.readyToTravel}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Prêt à communiquer :</span>
                    <span className="recap-value">{candidature.readyToCommunicate}</span>
                  </div>
                  <div className="recap-item">
                    <span className="recap-label">Prêt à s'engager :</span>
                    <span className="recap-value">{candidature.readyToCommit}</span>
                  </div>
                </div>
              </div>
              
              {/* Section 8: Documents justificatifs */}
              <div className="recap-section">
                <h3 className="recap-title">8. Documents justificatifs</h3>
                <div className="recap-content">
                  <div className="recap-item">
                    <span className="recap-label">Document(s) :</span>
                    <span className="recap-value">{candidature.document ? candidature.document.name : 'Aucun document'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="buttons-container" style={{ marginTop: '20px' }}>
            <Link to="/candidatures" className="btn btn-primary">
              <i className="fa fa-arrow-left"></i> Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="candidature-form-container">
      <div className="container">
        <div className="candidature-form-header">
          <h1>{isEditMode ? 'Modifier votre candidature' : 'Nouvelle candidature'}</h1>
          <p>
            {isEditMode 
              ? "Complétez votre dossier de candidature pour l'incubateur Katapult."
              : "Déposez votre candidature pour l'incubateur Katapult."}
          </p>
        </div>

        {/* Message de succès après sauvegarde du brouillon */}
        {successMessage && (
          <div className="alert alert-success">
            <i className="fa fa-check-circle"></i> {successMessage}
          </div>
        )}

        {/* Barre de progression */}
        <div className="progress-tracker">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-info">
            <span>Progression</span>
            <span>{progressPercentage}% complété</span>
          </div>
        </div>

        {candidature && (
          <div className="candidature-form-wrapper">
            <div className="row no-gutters">
              {/* Navigation latérale avec numéros d'étape */}
              <div className="col-md-3">
                <div className="form-sidebar">
                  <div className="sidebar-content">
                    <ul className="form-nav">
                      {steps.map(step => (
                        <li key={step.id} className="form-nav-item">
                          <a
                            href={`#step-${step.id}`}
                            className={`form-nav-link ${currentStep === step.id ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); goToStep(step.id); }}
                          >
                            <div className="form-nav-icon">
                              <i className={`fa ${step.icon}`}></i>
                            </div>
                            <span className="form-nav-text">{step.name}</span>
                            <span className="form-nav-status">
                              {currentStep > step.id ? (
                                <i className="fa fa-check-circle"></i>
                              ) : (
                                <span className="step-number">{step.id}</span>
                              )}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contenu du formulaire */}
              <div className="col-md-9">
                <div className="form-content">
                  <Formik
                    innerRef={formikRef}
                    initialValues={candidature || initialValues}
                    validationSchema={getValidationSchema()}
                    enableReinitialize={true}
                    onSubmit={(values) => {
                      // Vérifier strictement que nous sommes à la dernière étape
                      if (currentStep === steps.length) {
                        console.log('Demande de soumission finale à l\'étape', currentStep);
                        submitCandidature(values);
                      } else {
                        // Si nous ne sommes pas à la dernière étape, ne jamais soumettre
                        console.log('Tentative de soumission à l\'étape', currentStep, 'ignorée');
                        nextStep();
                      }
                    }}
                  >
                    {(formik) => (
                      <Form onChange={() => {
                        const percentage = calculateCompletionPercentage(formik.values);
                        setProgressPercentage(percentage);
                      }}>
                        {/* Étape 1 : Fiche d'identité */}
                        {currentStep === 1 && (
                          <div id="step-1">
                            <div className="form-section">
                              <h2 className="form-section-title">1. Fiche d'identité</h2>
                              <div className="form-group">
                                <label htmlFor="projectName">Nom du projet *</label>
                                <Field type="text" id="projectName" name="projectName" className="form-control" placeholder="Nom du projet" />
                                <ErrorMessage name="projectName" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="sector">Secteur d'activité principal *</label>
                                <Field as="select" id="sector" name="sector" className="form-control">
                                  <option value="">Sélectionnez un secteur</option>
                                  <option value="alimentation">Alimentation durable</option>
                                  <option value="economie_circulaire">Économie circulaire</option>
                                  <option value="education">Éducation & Formation</option>
                                  <option value="energie">Énergie</option>
                                  <option value="environnement">Environnement</option>
                                  <option value="habitat">Habitat & Logement</option>
                                  <option value="handicap">Handicap & Accessibilité</option>
                                  <option value="inclusion_sociale">Inclusion sociale</option>
                                  <option value="mobilite">Mobilité durable</option>
                                  <option value="numerique">Numérique</option>
                                  <option value="sante">Santé & Bien-être</option>
                                  <option value="services">Services</option>
                                  <option value="autre">Autre</option>
                                </Field>
                                <ErrorMessage name="sector" component="div" className="form-error" />
                                {formik.values.sector === "autre" && (
                                  <div className="mt-2">
                                    <Field 
                                      type="text" 
                                      name="sectorOther" 
                                      className="form-control" 
                                      placeholder="Précisez le secteur d'activité" 
                                    />
                                    <ErrorMessage name="sectorOther" component="div" className="form-error" />
                                  </div>
                                )}
                              </div>
                              <div className="form-group">
                                <label htmlFor="territory">Territoire d'implantation *</label>
                                <Field type="text" id="territory" name="territory" className="form-control" placeholder="Ville, agglomération, département" />
                                <ErrorMessage name="territory" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="interventionZone">Zone géographique d'intervention *</label>
                                <Field as="select" id="interventionZone" name="interventionZone" className="form-control">
                                  <option value="">Sélectionnez une zone</option>
                                  <option value="quartier">Quartier</option>
                                  <option value="ville">Ville / Village</option>
                                  <option value="agglomeration">Agglomération / Métropole</option>
                                  <option value="departement">Département</option>
                                  <option value="region">Région</option>
                                  <option value="national">National</option>
                                  <option value="international">International</option>
                                </Field>
                                <ErrorMessage name="interventionZone" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label>Comment avez-vous eu connaissance de l'appel à candidatures ?</label>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_facebook_adress" />
                                    Page Facebook de l'ADRESS
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_linkedin_adress" />
                                    Page LinkedIn de l'ADRESS
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_instagram_adress" />
                                    Page Instagram de l'ADRESS
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_web_adress" />
                                    Site internet de l'ADRESS
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_mail_adress" />
                                    Par un mail de l'ADRESS
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_salarie_adress" />
                                    Par un salarié de l'ADRESS
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_medias" />
                                    Par les médias (radio, presse, agenda en ligne)
                                  </label>
                              </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_tiers_hors_adress" />
                                    Information par un tiers hors ADRESS (structure d'accompagnement, collectivité…)
                                  </label>
                            </div>
                          </div>

                              <div className="form-group mt-4">
                                <h3 className="form-subsection-title mb-3">Structure juridique déjà existante</h3>
                                <div className="form-group mb-3">
                                  <label className="mb-2">
                                    Le projet est-il porté par une entreprise déjà en activité ? *
                                  </label>
                                  <div className="choice-cards-container">
                                    <label 
                                      className={`choice-card ${formik.values.hasExistingStructure === true ? 'selected' : ''}`}
                                    >
                                      <Field 
                                        type="radio" 
                                        name="hasExistingStructure" 
                                        value={true}
                                        checked={formik.values.hasExistingStructure === true}
                                        onChange={() => formik.setFieldValue('hasExistingStructure', true)}
                                      />
                                      <div className="choice-card-title">Oui</div>
                                      <div className="choice-card-description">
                                        Le projet est porté par une structure existante déjà en activité
                                      </div>
                                    </label>
                                    <label 
                                      className={`choice-card ${formik.values.hasExistingStructure === false ? 'selected' : ''}`}
                                    >
                                      <Field 
                                        type="radio" 
                                        name="hasExistingStructure" 
                                        value={false}
                                        checked={formik.values.hasExistingStructure === false}
                                        onChange={() => formik.setFieldValue('hasExistingStructure', false)}
                                      />
                                      <div className="choice-card-title">Non</div>
                                      <div className="choice-card-description">
                                        Le projet nécessite la création d'une nouvelle structure
                                      </div>
                                    </label>
                                  </div>
                                  <ErrorMessage name="hasExistingStructure" component="div" className="form-error" />
                                </div>
                                
                                {formik.values.hasExistingStructure && (
                                  <div className="existing-structure-details">
                                    <div className="existing-structure-grid">
                                      <div className="form-group">
                                        <label htmlFor="structureName">
                                          Nom de la structure *
                                        </label>
                                        <Field
                                          type="text"
                                          id="structureName"
                                          name="structureName"
                                          placeholder="Nom de l'entreprise existante"
                                        />
                                        <ErrorMessage name="structureName" component="div" className="form-error" />
                                      </div>
                                      
                                      <div className="form-group">
                                        <label htmlFor="structureSiret">
                                          Numéro de SIRET *
                                        </label>
                                        <Field
                                          type="text"
                                          id="structureSiret"
                                          name="structureSiret"
                                          placeholder="Numéro SIRET de la structure"
                                        />
                                        <ErrorMessage name="structureSiret" component="div" className="form-error" />
                                      </div>
                                    </div>

                                    <div className="form-group">
                                      <label className="mb-2">Statut juridique *</label>
                                      <div className="choice-cards-container">
                                        {[
                                          { value: 'association', label: 'Association' },
                                          { value: 'cooperative', label: 'Coopérative' },
                                          { value: 'societe_ess', label: 'Société commerciale de l\'ESS' },
                                          { value: 'societe_hors_ess', label: 'Société commerciale hors ESS' },
                                          { value: 'autre', label: 'Autre' }
                                        ].map((option) => (
                                          <label 
                                            key={option.value}
                                            className={`choice-card ${formik.values.structureStatus === option.value ? 'selected' : ''}`}
                                          >
                                            <Field
                                              type="radio"
                                              name="structureStatus"
                                              value={option.value}
                                            />
                                            <div className="choice-card-title">{option.label}</div>
                                          </label>
                                        ))}
                                      </div>
                                      {formik.values.structureStatus === "autre" && (
                                        <Field
                                          type="text"
                                          name="structureStatusOther"
                                          placeholder="Précisez..."
                                          className="mt-2"
                                        />
                                      )}
                                      <ErrorMessage name="structureStatus" component="div" className="form-error" />
                                    </div>

                                    <div className="existing-structure-grid">
                                      <div className="form-group">
                                        <label htmlFor="structureCreationDate">
                                          Date de création *
                                        </label>
                                        <Field
                                          type="date"
                                          id="structureCreationDate"
                                          name="structureCreationDate"
                                        />
                                        <ErrorMessage name="structureCreationDate" component="div" className="form-error" />
                                      </div>
                                    </div>

                                    <div className="form-group">
                                      <label className="mb-2">Dans quel cadre la structure candidate-t-elle à l'incubateur ? *</label>
                                      <div className="choice-cards-container">
                                        {[
                                          { value: 'nouvelle_activite', label: 'Développement d\'une nouvelle activité', description: 'Vous souhaitez développer une nouvelle activité au sein de votre structure' },
                                          { value: 'implantation', label: 'Implantation en Normandie', description: 'Vous souhaitez implanter votre activité en Normandie' },
                                          { value: 'autre', label: 'Autre', description: 'Autre contexte' }
                                        ].map((option) => (
                                          <label 
                                            key={option.value}
                                            className={`choice-card ${formik.values.structureContext === option.value ? 'selected' : ''}`}
                                          >
                                            <Field
                                              type="radio"
                                              name="structureContext"
                                              value={option.value}
                                            />
                                            <div className="choice-card-title">{option.label}</div>
                                            <div className="choice-card-description">{option.description}</div>
                                          </label>
                                        ))}
                                      </div>
                                      {formik.values.structureContext === "autre" && (
                                        <Field
                                          type="text"
                                          name="structureContextOther"
                                          placeholder="Précisez..."
                                          className="mt-2"
                                        />
                                      )}
                                      <ErrorMessage name="structureContext" component="div" className="form-error" />
                                    </div>

                                    <div className="existing-structure-grid">
                                      <div className="form-group">
                                        <label htmlFor="referenceEmploymentType">
                                          La personne référente pour le projet est-elle salariée par la structure ou bénévole ? *
                                        </label>
                                        <Field
                                          type="text"
                                          id="referenceEmploymentType"
                                          name="referenceEmploymentType"
                                          placeholder="Ex: Salarié(e), Bénévole..."
                                        />
                                        <ErrorMessage name="referenceEmploymentType" component="div" className="form-error" />
                                      </div>

                                      <div className="form-group">
                                        <label htmlFor="referenceEmploymentDuration">
                                          Depuis combien de temps ? *
                                        </label>
                                        <Field
                                          type="text"
                                          id="referenceEmploymentDuration"
                                          name="referenceEmploymentDuration"
                                          placeholder="Ex: 2 ans, 6 mois..."
                                        />
                                        <ErrorMessage name="referenceEmploymentDuration" component="div" className="form-error" />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 2 : Votre projet et son utilité sociale */}
                        {currentStep === 2 && (
                          <div id="step-2">
                            <div className="form-section">
                              <h2 className="form-section-title">2. Votre projet et son utilité sociale</h2>
                              <div className="form-group">
                                <label htmlFor="projectGenesis">
                                  Expliquez la genèse de votre projet (environ 10 lignes) *
                                </label>
                                <Field as="textarea" id="projectGenesis" name="projectGenesis" className="form-control" placeholder="Décrivez la genèse de votre projet" rows="10" />
                                <ErrorMessage name="projectGenesis" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="projectSummary">
                                  Résumez votre projet (10 lignes maximum) *
                                </label>
                                <Field as="textarea" id="projectSummary" name="projectSummary" className="form-control" placeholder="Résumé du projet" rows="4" />
                                <ErrorMessage name="projectSummary" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="problemDescription">
                                  À quel problème social et/ou environnemental souhaitez-vous répondre ? Décrivez précisément l'ampleur du problème (environ 20 lignes) *
                                </label>
                                <Field as="textarea" id="problemDescription" name="problemDescription" className="form-control" placeholder="Décrivez précisément l'ampleur du problème auquel vous souhaitez apporter une solution, à l'échelle globale mais aussi et surtout précisez le besoin à l'échelle de votre territoire d'intervention. Soyez le plus précis possible (chiffres parlants à l'appui si vous en avez) !" rows="20" />
                                <ErrorMessage name="problemDescription" component="div" className="form-error" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 3 : Qui est concerné ? */}
                        {currentStep === 3 && (
                          <div id="step-3">
                            <div className="form-section">
                              <h2 className="form-section-title">3. Qui est concerné ?</h2>
                              <div className="form-group">
                                <label htmlFor="beneficiaries">
                                  Qui seront les bénéficiaires de votre projet (ceux à qui le projet va profiter) ? *
                                </label>
                                <Field as="textarea" id="beneficiaries" name="beneficiaries" className="form-control" placeholder="Soyez le plus précis possible : les réponses « tout le monde » et « le grand public » sont à proscrire. Pouvez-vous les quantifier, définir le périmètre géographique touché… ?" rows="4" />
                                <ErrorMessage name="beneficiaries" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="clients">
                                  Qui seront les clients (ceux qui vont payer - s'ils sont différents des bénéficiaires) ? *
                                </label>
                                <Field as="textarea" id="clients" name="clients" className="form-control" placeholder="Soyez le plus précis possible : les réponses « tout le monde » et « le grand public » sont à proscrire. Pouvez-vous les quantifier, définir le périmètre géographique touché… ?" rows="3" />
                                <ErrorMessage name="clients" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="proposedSolution">
                                  Quelle solution souhaitez-vous proposer ? Quelle sera votre offre ? *
                                </label>
                                <Field as="textarea" id="proposedSolution" name="proposedSolution" className="form-control" placeholder="Décrivez ce que vous imaginez comme offre, ce que vous pensez proposer à vos clients / bénéficiaires. Vous pouvez imaginer plusieurs phases de développement de l'activité." rows="4" />
                                <ErrorMessage name="proposedSolution" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="projectDifferentiation">
                                  En quoi votre projet est-il différent et/ou complémentaire des solutions existantes sur le territoire considéré ? *
                                </label>
                                <Field as="textarea" id="projectDifferentiation" name="projectDifferentiation" className="form-control" placeholder="Expliquez ce qui rend votre projet unique" rows="4" />
                                <ErrorMessage name="projectDifferentiation" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label>
                                  Quels seraient les premiers indicateurs d'impact social pertinents pour évaluer votre projet ? (Notez 5 indicateurs) *
                                </label>
                                <Field type="text" name="indicator1" className="form-control" placeholder="Indicateur 1" />
                                <ErrorMessage name="indicator1" component="div" className="form-error" />
                                <Field type="text" name="indicator2" className="form-control" placeholder="Indicateur 2" />
                                <ErrorMessage name="indicator2" component="div" className="form-error" />
                                <Field type="text" name="indicator3" className="form-control" placeholder="Indicateur 3" />
                                <ErrorMessage name="indicator3" component="div" className="form-error" />
                                <Field type="text" name="indicator4" className="form-control" placeholder="Indicateur 4" />
                                <ErrorMessage name="indicator4" component="div" className="form-error" />
                                <Field type="text" name="indicator5" className="form-control" placeholder="Indicateur 5" />
                                <ErrorMessage name="indicator5" component="div" className="form-error" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 4 : Le modèle économique */}
                        {currentStep === 4 && (
                          <div id="step-4">
                            <div className="form-section">
                              <h2 className="form-section-title">4. Le modèle économique</h2>
                              <div className="form-group">
                                <label htmlFor="revenueSources">
                                  Quelles sont les sources de revenus envisagées pour votre projet ? 
                                  Concrètement, qu'allez-vous vendre ? Comment imaginez-vous assurer la viabilité économique du projet sur le long terme ? *
                                </label>
                                <Field as="textarea" id="revenueSources" name="revenueSources" className="form-control" placeholder="Décrivez les sources de revenus" rows="4" />
                                <ErrorMessage name="revenueSources" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="employmentCreation">
                                  Combien d'emplois pensez-vous créer sur les premières années d'activités ? 
                                  Sur quels types de postes / missions ? *
                                </label>
                                <Field as="textarea" id="employmentCreation" name="employmentCreation" className="form-control" placeholder="Décrivez le nombre et la nature des emplois" rows="3" />
                                <ErrorMessage name="employmentCreation" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="economicViability">
                                  À ce stade, quels sont les éléments vous permettant d'affirmer la viabilité économique du projet ? *
                                </label>
                                <p className="field-description mt-2">
                                  Citez maximum 5 éléments dont vous disposez sur :
                                  <br />★ L'état du marché (acteurs principaux, volumes, tendances)
                                  <br />★ Vos concurrents directs et indirects. Que proposent-ils ? En quoi votre offre se différencie-t-elle ?
                                  <br />★ Des facteurs réglementaires en votre faveur
                                  <br />★ ...
                                  <br /><br />… qui vous permettent de penser que votre projet peut avoir une place sur le marché.
                                </p>
                                <Field type="text" id="viabilityElement1" name="viabilityElement1" className="form-control mb-2" placeholder="1. ..." />
                                <ErrorMessage name="viabilityElement1" component="div" className="form-error" />
                                
                                <Field type="text" id="viabilityElement2" name="viabilityElement2" className="form-control mb-2" placeholder="2. ..." />
                                <ErrorMessage name="viabilityElement2" component="div" className="form-error" />
                                
                                <Field type="text" id="viabilityElement3" name="viabilityElement3" className="form-control mb-2" placeholder="3. ..." />
                                <ErrorMessage name="viabilityElement3" component="div" className="form-error" />
                                
                                <Field type="text" id="viabilityElement4" name="viabilityElement4" className="form-control mb-2" placeholder="4. ..." />
                                <ErrorMessage name="viabilityElement4" component="div" className="form-error" />
                                
                                <Field type="text" id="viabilityElement5" name="viabilityElement5" className="form-control mb-2" placeholder="5. ..." />
                                <ErrorMessage name="viabilityElement5" component="div" className="form-error" />
                              </div>
                              
                              <div className="form-group">
                                <label htmlFor="diversification">
                                  Quels pourraient être les projets de diversification et de développement économique de l'activité à moyen/long terme ? *
                                </label>
                                <Field as="textarea" id="diversification" name="diversification" className="form-control" placeholder="Décrivez vos projets de diversification" rows="4" />
                                <ErrorMessage name="diversification" component="div" className="form-error" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 5 : La place des parties prenantes */}
                        {currentStep === 5 && (
                          <div id="step-5">
                            <div className="form-section">
                              <h2 className="form-section-title">5. La place des parties prenantes</h2>
                              <div className="form-group">
                                <label htmlFor="existingPartnerships">
                                  Avez-vous déjà établi des contacts ou partenariats pour contribuer au projet ? Si oui, de quelle manière ? *
                                </label>
                                <Field as="textarea" id="existingPartnerships" name="existingPartnerships" className="form-control" placeholder="Ce peut être des futurs clients, bénéficiaires, financeurs, partenaires opérationnels… toute personne qui aurait un intérêt dans votre projet. Par exemple, vous pourriez avoir sollicité une mairie pour obtenir un prêt ponctuel de locaux, des habitants pour vous aider à organiser un événement…" rows="4" />
                                <ErrorMessage name="existingPartnerships" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="desiredPartnerships">
                                  Quels autres contacts ou partenariats recherchez-vous aujourd'hui ? *
                                </label>
                                <Field as="textarea" id="desiredPartnerships" name="desiredPartnerships" className="form-control" placeholder="Décrivez les partenariats recherchés" rows="4" />
                                <ErrorMessage name="desiredPartnerships" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="stakeholderRole">
                                  Quel rôle voudriez-vous que jouent ces différents acteurs dans le projet à terme ? *
                                </label>
                                <Field as="textarea" id="stakeholderRole" name="stakeholderRole" className="form-control" placeholder="Ex: Structuration d'un collectif restreint sur la prise de décisions stratégiques pour le projet, ou au contraire souhait d'une gouvernance très large, impliquant plusieurs des acteurs précités." rows="4" />
                                <ErrorMessage name="stakeholderRole" component="div" className="form-error" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 6 : L'équipe projet et parcours d'incubation */}
                        {currentStep === 6 && (
                          <div id="step-6">
                            <div className="form-section">
                              <h2 className="form-section-title">6. L'équipe projet et parcours d'incubation</h2>
                              
                              {/* Nouvelle section Personne Référente */}
                              <div className="form-subsection">
                                <h3 className="form-subsection-title">Personne référente</h3>
                                <div className="form-group">
                                  <label htmlFor="referenceLastName">Nom *</label>
                                  <Field type="text" id="referenceLastName" name="referenceLastName" className="form-control" placeholder="Nom" />
                                  <ErrorMessage name="referenceLastName" component="div" className="form-error" />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="referenceFirstName">Prénom *</label>
                                  <Field type="text" id="referenceFirstName" name="referenceFirstName" className="form-control" placeholder="Prénom" />
                                  <ErrorMessage name="referenceFirstName" component="div" className="form-error" />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="referenceDOB">Date de naissance *</label>
                                  <Field type="date" id="referenceDOB" name="referenceDOB" className="form-control" />
                                  <ErrorMessage name="referenceDOB" component="div" className="form-error" />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="referenceAddress">Adresse *</label>
                                  <Field type="text" id="referenceAddress" name="referenceAddress" className="form-control" placeholder="Adresse" />
                                  <ErrorMessage name="referenceAddress" component="div" className="form-error" />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="referenceEmail">E-mail *</label>
                                  <Field type="email" id="referenceEmail" name="referenceEmail" className="form-control" placeholder="Email" />
                                  <ErrorMessage name="referenceEmail" component="div" className="form-error" />
                                </div>
                                <div className="form-group">
                                  <label htmlFor="referenceTelephone">Téléphone *</label>
                                  <Field type="text" id="referenceTelephone" name="referenceTelephone" className="form-control" placeholder="Téléphone" />
                                  <ErrorMessage name="referenceTelephone" component="div" className="form-error" />
                                </div>
                              </div>
                              
                              {/* Nouvelle section Autres Personnes Impliquées */}
                              <div className="form-subsection mt-4">
                                <h3 className="form-subsection-title">Autres personnes impliquées dans le projet</h3>
                                <p className="field-description">Qui participeront potentiellement au parcours d'incubation</p>
                                <FieldArray
                                  name="teamMembers"
                                  render={arrayHelpers => (
                                    <div>
                                      {formik.values.teamMembers && formik.values.teamMembers.length > 0 ? (
                                        formik.values.teamMembers.map((member, index) => (
                                          <div key={index} className="team-member-card mb-3 p-3 border rounded">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h4 className="mb-0">Membre {index + 1}</h4>
                                                <button 
                                                  type="button" 
                                                  onClick={() => arrayHelpers.remove(index)} 
                                                  className="btn btn-sm btn-outline-danger"
                                                  title="Supprimer ce membre"
                                                >
                                                  <i className="fa fa-trash-alt"></i> Supprimer
                                                </button>
                                            </div>
                                            <div className="row">
                                              <div className="col-md-6 form-group">
                                                <label htmlFor={`teamMembers.${index}.lastName`}>Nom *</label>
                                                <Field type="text" id={`teamMembers.${index}.lastName`} name={`teamMembers.${index}.lastName`} className="form-control" placeholder="Nom" />
                                                <ErrorMessage name={`teamMembers.${index}.lastName`} component="div" className="form-error" />
                                              </div>
                                              <div className="col-md-6 form-group">
                                                <label htmlFor={`teamMembers.${index}.firstName`}>Prénom *</label>
                                                <Field type="text" id={`teamMembers.${index}.firstName`} name={`teamMembers.${index}.firstName`} className="form-control" placeholder="Prénom" />
                                                <ErrorMessage name={`teamMembers.${index}.firstName`} component="div" className="form-error" />
                                              </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6 form-group">
                                                  <label htmlFor={`teamMembers.${index}.email`}>E-mail *</label>
                                                  <Field type="email" id={`teamMembers.${index}.email`} name={`teamMembers.${index}.email`} className="form-control" placeholder="Email" />
                                                  <ErrorMessage name={`teamMembers.${index}.email`} component="div" className="form-error" />
                                                </div>
                                                <div className="col-md-6 form-group">
                                                  <label htmlFor={`teamMembers.${index}.telephone`}>Téléphone *</label>
                                                  <Field type="text" id={`teamMembers.${index}.telephone`} name={`teamMembers.${index}.telephone`} className="form-control" placeholder="Téléphone" />
                                                  <ErrorMessage name={`teamMembers.${index}.telephone`} component="div" className="form-error" />
                                                </div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="alert alert-light text-center">Aucune autre personne ajoutée.</div>
                                      )}
                                      <button 
                                        type="button" 
                                        onClick={() => arrayHelpers.push({ lastName: '', firstName: '', email: '', telephone: '' })} 
                                        className="btn-add-more mt-2"
                                      >
                                        <i className="fa fa-plus"></i> Ajouter une personne
                                      </button>
                                    </div>
                                  )}
                                />
                              </div>
                              
                              {/* Sections existantes */}
                              <div className="form-subsection mt-4">
                                <h3 className="form-subsection-title">Présentation de l'équipe et expérience</h3>
                                <div className="form-group">
                                  <label htmlFor="teamPresentation">
                                    Présentez-vous succinctement (1 paragraphe par personne réellement impliquée dans le projet, max 8 lignes) *
                                  </label>
                                  <p className="field-description">
                                    Parcours (formation, professionnel et bénévole), compétences et motivations, ainsi que ceux des membres de l'équipe, 
                                    en mettant en évidence vos compétences et atouts pour mener à bien le projet (joindre les CV).
                                  </p>
                                  <Field as="textarea" id="teamPresentation" name="teamPresentation" className="form-control" rows="8" />
                                  <ErrorMessage name="teamPresentation" component="div" className="form-error" />
                                </div>
                                
                                <div className="form-group">
                                  <label className="mb-2">Avez-vous une expérience entrepreneuriale ? *</label>
                                  <div className="radio-button-group">
                                    <label className={`radio-button ${formik.values.hasEntrepreneurialExperience === true ? 'selected' : ''}`}>
                                      <Field
                                        type="radio"
                                        name="hasEntrepreneurialExperience"
                                        checked={formik.values.hasEntrepreneurialExperience === true}
                                        onChange={() => formik.setFieldValue('hasEntrepreneurialExperience', true)}
                                      /> Oui
                                    </label>
                                    <label className={`radio-button ${formik.values.hasEntrepreneurialExperience === false ? 'selected' : ''}`}>
                                      <Field
                                        type="radio"
                                        name="hasEntrepreneurialExperience"
                                        checked={formik.values.hasEntrepreneurialExperience === false}
                                        onChange={() => {
                                          formik.setFieldValue('hasEntrepreneurialExperience', false);
                                          formik.setFieldValue('entrepreneurialExperience', ''); // Reset details if 'No'
                                        }}
                                      /> Non
                                    </label>
                                  </div>
                                  <ErrorMessage name="hasEntrepreneurialExperience" component="div" className="form-error" />

                                  {formik.values.hasEntrepreneurialExperience === true && (
                                    <div className="mt-3">
                                      <label htmlFor="entrepreneurialExperience">Si oui, laquelle ? *</label>
                                      <Field
                                        as="textarea"
                                        id="entrepreneurialExperience"
                                        name="entrepreneurialExperience"
                                        className="form-control"
                                        placeholder="Précisez votre expérience entrepreneuriale"
                                        rows="3"
                                      />
                                      <ErrorMessage name="entrepreneurialExperience" component="div" className="form-error" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="form-group">
                                  <label htmlFor="inspiringEntrepreneur">
                                    Citez un entrepreneur social qui vous inspire particulièrement
                                  </label>
                                  <Field type="text" id="inspiringEntrepreneur" name="inspiringEntrepreneur" className="form-control" />
                                  <ErrorMessage name="inspiringEntrepreneur" component="div" className="form-error" />
                                </div>
                                
                                <div className="form-group">
                                  <label htmlFor="missingTeamSkills">
                                    Quelles sont selon vous les compétences manquantes dans l'équipe pour mener à bien ce projet ? Comment comptez-vous y pallier ?
                                  </label>
                                  <Field as="textarea" id="missingTeamSkills" name="missingTeamSkills" className="form-control" rows="3" />
                                  <ErrorMessage name="missingTeamSkills" component="div" className="form-error" />
                                </div>
                                
                                <div className="form-group">
                                  <label htmlFor="incubationParticipants">
                                    Qui suivra le parcours d'incubation ? Une ou plusieurs personnes ?
                                  </label>
                                  <p className="field-description">
                                    Vous pouvez suivre le parcours, participer aux rdv individuels, événements, formations à plusieurs 
                                    (sauf restrictions ponctuelles dues à certains lieux). L'important est d'assurer une continuité dans 
                                    la construction du projet.
                                  </p>
                                  <Field as="textarea" id="incubationParticipants" name="incubationParticipants" className="form-control" placeholder="★ ... &#10;★ ... &#10;★ ..." rows="4" />
                                  <ErrorMessage name="incubationParticipants" component="div" className="form-error" />
                                </div>
                              </div>
                              
                              <div className="form-subsection mt-4">
                                <h3 className="form-subsection-title mb-3">Place de chacun des membres de l'équipe projet</h3>
                                
                                <div className="form-group">
                                  <label>
                                    Quelle place chaque porteur de projet envisage-t-il au sein du projet court, moyen, long terme ? *
                                  </label>
                                  <p className="field-description mb-3">
                                    De manière individuelle, considérez-vous ce projet comme :
                                    <ul>
                                      <li>Une activité principale rémunérée - Vous espérez vivre de ce projet en tant qu'activité principale, vous n'aurez pas d'autre activité professionnelle à priori</li>
                                      <li>Une activité secondaire rémunérée - Vous espérez en tirer une rémunération mais cela restera une activité secondaire (car vous souhaitez maintenir une autre activité en parallèle)</li>
                                      <li>Une activité bénévole - Vous n'attendez pas de vous rémunérer sur cette activité</li>
                                    </ul>
                                  </p>
                                  
                                  <div className="project-members">
                                    <FieldArray name="projectMembersRoles">
                                      {({ push, remove }) => (
                                        <>
                                          {formik.values.projectMembersRoles && formik.values.projectMembersRoles.length > 0 ? (
                                            <>
                                              {formik.values.projectMembersRoles.map((member, index) => (
                                                <div key={index} className="project-member-card mb-4 p-3 border rounded">
                                                  <div className="project-member-header">
                                                    <h4 className="project-member-title">Porteur de projet {index + 1}</h4>
                                                    {formik.values.projectMembersRoles.length > 1 && (
                                                      <button
                                                        type="button"
                                                        className="project-member-remove"
                                                        onClick={() => remove(index)}
                                                      >
                                                        <i className="fa fa-trash-alt"></i> Retirer
                                                      </button>
                                                    )}
                                                  </div>
                                                  <div className="form-group">
                                                    <label htmlFor={`projectMembersRoles.${index}.name`}>Nom Prénom *</label>
                                                    <Field
                                                      name={`projectMembersRoles.${index}.name`}
                                                      type="text"
                                                      className="form-control"
                                                      placeholder="Nom et Prénom du porteur"
                                                    />
                                                    <ErrorMessage name={`projectMembersRoles.${index}.name`} component="div" className="form-error" />
                                                  </div>
                                                  
                                                  <div className="role-timeline mt-3">
                                                    <label>Rôle et Missions</label>
                                                    <div className="timeline-grid">
                                                      <div className="timeline-header"></div>
                                                      <div className="timeline-header">Court terme (1 an)</div>
                                                      <div className="timeline-header">Moyen terme (3 ans)</div>
                                                      <div className="timeline-header">Long terme (10 ans)</div>

                                                      <div className="timeline-label">Type d'activité *</div>
                                                      <div>
                                                        <Field as="select" name={`projectMembersRoles.${index}.shortTerm.type`} className="form-control">
                                                          <option value="">Sélectionner</option>
                                                          <option value="principale">Principale rémunérée</option>
                                                          <option value="secondaire">Secondaire rémunérée</option>
                                                          <option value="benevole">Bénévole</option>
                                                        </Field>
                                                        <ErrorMessage name={`projectMembersRoles.${index}.shortTerm.type`} component="div" className="form-error" />
                                                      </div>
                                                      <div>
                                                        <Field as="select" name={`projectMembersRoles.${index}.mediumTerm.type`} className="form-control">
                                                          <option value="">Sélectionner</option>
                                                          <option value="principale">Principale rémunérée</option>
                                                          <option value="secondaire">Secondaire rémunérée</option>
                                                          <option value="benevole">Bénévole</option>
                                                        </Field>
                                                        <ErrorMessage name={`projectMembersRoles.${index}.mediumTerm.type`} component="div" className="form-error" />
                                                      </div>
                                                      <div>
                                                        <Field as="select" name={`projectMembersRoles.${index}.longTerm.type`} className="form-control">
                                                          <option value="">Sélectionner</option>
                                                          <option value="principale">Principale rémunérée</option>
                                                          <option value="secondaire">Secondaire rémunérée</option>
                                                          <option value="benevole">Bénévole</option>
                                                        </Field>
                                                        <ErrorMessage name={`projectMembersRoles.${index}.longTerm.type`} component="div" className="form-error" />
                                                      </div>

                                                      <div className="timeline-label">Précisions sur vos missions *</div>
                                                      <div>
                                                        <Field
                                                          as="textarea"
                                                          name={`projectMembersRoles.${index}.shortTerm.details`}
                                                          className="form-control"
                                                          rows="3"
                                                        />
                                                        <ErrorMessage name={`projectMembersRoles.${index}.shortTerm.details`} component="div" className="form-error" />
                                                      </div>
                                                      <div>
                                                        <Field
                                                          as="textarea"
                                                          name={`projectMembersRoles.${index}.mediumTerm.details`}
                                                          className="form-control"
                                                          rows="3"
                                                        />
                                                        <ErrorMessage name={`projectMembersRoles.${index}.mediumTerm.details`} component="div" className="form-error" />
                                                      </div>
                                                      <div>
                                                        <Field
                                                          as="textarea"
                                                          name={`projectMembersRoles.${index}.longTerm.details`}
                                                          className="form-control"
                                                          rows="3"
                                                        />
                                                        <ErrorMessage name={`projectMembersRoles.${index}.longTerm.details`} component="div" className="form-error" />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </>
                                          ) : (
                                            <div className="alert alert-light text-center">
                                              Cliquez sur le bouton ci-dessous pour ajouter le premier porteur de projet.
                                            </div>
                                          )}
                                          <ErrorMessage 
                                            name="projectMembersRoles" 
                                            render={(errorMsg) => (
                                              <div className="form-error mb-2">
                                                {typeof errorMsg === 'string' ? errorMsg : 'Veuillez ajouter au moins un porteur de projet.'}
                                              </div>
                                            )}
                                          />
                                          <button
                                            type="button"
                                            className="btn-add-more mt-2"
                                            onClick={() => push({
                                              name: '',
                                              shortTerm: { type: '', details: '' },
                                              mediumTerm: { type: '', details: '' },
                                              longTerm: { type: '', details: '' }
                                            })}
                                          >
                                            <i className="fa fa-plus"></i> Ajouter un porteur de projet
                                          </button>
                                        </>
                                      )}
                                    </FieldArray>
                                  </div>
                                </div>
                                
                                <div className="form-group mt-4">
                                  <label htmlFor="currentProfessionalSituation">
                                    Quelle est votre situation professionnelle actuelle ? *
                                  </label>
                                  <Field 
                                    as="textarea" 
                                    id="currentProfessionalSituation" 
                                    name="currentProfessionalSituation" 
                                    className="form-control" 
                                    placeholder="Si vous êtes en activité, veuillez préciser le volume horaire dédié à cette activité. Avez-vous des jours particuliers d'indisponibilité ? Si oui lesquels ?" 
                                    rows="3" 
                                  />
                                  <ErrorMessage name="currentProfessionalSituation" component="div" className="form-error" />
                              </div>
                                
                                <div className="form-group">
                                  <label htmlFor="incubationPeriodIncome">
                                    Afin d'adapter au mieux l'accompagnement et de fixer avec vous les objectifs temporels en termes de création, pouvez-vous nous indiquer quels seront vos revenus durant la période d'incubation ? *
                                  </label>
                                  <Field 
                                    as="textarea" 
                                    id="incubationPeriodIncome" 
                                    name="incubationPeriodIncome" 
                                    className="form-control" 
                                    placeholder="Salaire à temps plein /partiel, indemnités pôle emploi, allocations, revenus locatifs, RSA, etc." 
                                    rows="3" 
                                  />
                                  <ErrorMessage name="incubationPeriodIncome" component="div" className="form-error" />
                                </div>
                                
                                <div className="form-group">
                                  <label htmlFor="weeklyTimeCommitment">
                                    Quel volume horaire hebdomadaire pouvez-vous dédier au parcours d'incubation incluant les rendez-vous Katapult, la formalisation du projet et les temps de rencontre partenaires afin de réaliser votre projet ? *
                                  </label>
                                  <Field 
                                    as="textarea" 
                                    id="weeklyTimeCommitment" 
                                    name="weeklyTimeCommitment" 
                                    className="form-control" 
                                    rows="3" 
                                  />
                                  <ErrorMessage name="weeklyTimeCommitment" component="div" className="form-error" />
                                </div>
                              </div>
                              
                              <div className="form-subsection mt-4">
                                <h3 className="form-subsection-title">L'équipe et le parcours d'incubation</h3>
                                
                                <div className="form-group">
                                  <label htmlFor="incubatorMotivation">
                                    Pourquoi souhaitez-vous intégrer l'incubateur de l'ADRESS ? Quels sont vos besoins et vos attentes en termes d'accompagnement ? *
                                  </label>
                                  <Field 
                                    as="textarea" 
                                    id="incubatorMotivation" 
                                    name="incubatorMotivation" 
                                    className="form-control" 
                                    placeholder="Donnez des exemples concrets : Formuler la charte de projet, étoffer l'étude de marché, formaliser le plan de développement commercial, travailler la gouvernance ...." 
                                    rows="4" 
                                  />
                                  <ErrorMessage name="incubatorMotivation" component="div" className="form-error" />
                                </div>
                                
                                <div className="form-group">
                                  <label htmlFor="contributionToIncubator">
                                    Que pouvez-vous apporter à l'incubateur et aux incubés ? *
                                  </label>
                                  <Field 
                                    as="textarea" 
                                    id="contributionToIncubator" 
                                    name="contributionToIncubator" 
                                    className="form-control" 
                                    rows="3" 
                                  />
                                  <ErrorMessage name="contributionToIncubator" component="div" className="form-error" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 7 : État d'avancement du projet */}
                        {currentStep === 7 && (
                          <div id="step-7">
                            <div className="form-section">
                              <h2 className="form-section-title">7. État d'avancement du projet</h2>
                            
                              <div className="form-group">
                                <label htmlFor="otherSupport">
                                  Avez-vous été ou êtes-vous accompagnés par ailleurs ? Si oui, par quel organisme et sur quels sujets ?
                                </label>
                                <Field 
                                  as="textarea" 
                                  id="otherSupport" 
                                  name="otherSupport" 
                                  className="form-control" 
                                  rows="3" 
                                />
                                <ErrorMessage name="otherSupport" component="div" className="form-error" />
                              </div>
                              
                              <div className="form-group">
                                <label className="mb-3">Quelles sont les étapes déjà réalisées ? *</label>
                                <div className="advancement-steps-container">
                                  {[
                                    { name: 'diagnostic', label: 'Diagnostic territorial, étude du besoin social / environnemental' },
                                    { name: 'collectif', label: 'Constitution d\'un collectif moteur' },
                                    { name: 'experimentation', label: 'Expérimentation terrain - 1ers résultats' },
                                    { name: 'etudeMarche', label: 'Etude de marché' },
                                    { name: 'offre', label: 'Formalisation de l\'offre' },
                                    { name: 'chiffrage', label: 'Premier chiffrage' },
                                  ].map(step => (
                                    <div key={step.name} className="advancement-step">
                                      <label className="advancement-step-label">{step.label}</label>
                                      <div className="radio-button-group">
                                        <label className={`radio-button ${formik.values[step.name]?.status === 'oui' ? 'selected' : ''}`}>
                                          <Field type="radio" name={`${step.name}.status`} value="oui" /> Oui
                                        </label>
                                        <label className={`radio-button ${formik.values[step.name]?.status === 'non' ? 'selected' : ''}`}>
                                          <Field type="radio" name={`${step.name}.status`} value="non" /> Non
                                        </label>
                                        <label className={`radio-button ${formik.values[step.name]?.status === 'en_cours' ? 'selected' : ''}`}>
                                          <Field type="radio" name={`${step.name}.status`} value="en_cours" /> En cours
                                        </label>
                                      </div>
                                      <ErrorMessage name={`${step.name}.status`} component="div" className="form-error" />
                                      <Field 
                                        type="text" 
                                        name={`${step.name}.details`} 
                                        className="form-control mt-2" 
                                        placeholder="Précisions si besoin..." 
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="form-group">
                                <label htmlFor="firstRisk">
                                  Quel est le premier risque que vous ayez pris à ce jour pour votre projet ? *
                                </label>
                                <Field 
                                  as="textarea" 
                                  id="firstRisk" 
                                  name="firstRisk" 
                                  className="form-control" 
                                  rows="3" 
                                />
                                <ErrorMessage name="firstRisk" component="div" className="form-error" />
                              </div>
                              
                              <div className="form-group">
                                <label>Quelle analyse faites-vous de votre projet à ce stade ? (Analyse SWOT) *</label>
                                <div className="swot-analysis-grid">
                                  <div className="swot-box swot-strengths">
                                    <label>Forces</label>
                                    <p className="swot-description">Les points forts internes de votre projet</p>
                                    <Field 
                                      as="textarea" 
                                      name="swot.strengths" 
                                      placeholder="Ex: Expertise unique, réseau solide, innovation..."
                                    />
                                    <ErrorMessage name="swot.strengths" component="div" className="form-error" />
                                  </div>
                                  <div className="swot-box swot-weaknesses">
                                    <label>Faiblesses</label>
                                    <p className="swot-description">Les points à améliorer en interne</p>
                                    <Field 
                                      as="textarea" 
                                      name="swot.weaknesses" 
                                      placeholder="Ex: Manque d'expérience, ressources limitées..."
                                    />
                                    <ErrorMessage name="swot.weaknesses" component="div" className="form-error" />
                                  </div>
                                  <div className="swot-box swot-opportunities">
                                    <label>Opportunités</label>
                                    <p className="swot-description">Les facteurs externes favorables</p>
                                    <Field 
                                      as="textarea" 
                                      name="swot.opportunities" 
                                      placeholder="Ex: Marché en croissance, nouveaux besoins..."
                                    />
                                    <ErrorMessage name="swot.opportunities" component="div" className="form-error" />
                                  </div>
                                  <div className="swot-box swot-threats">
                                    <label>Menaces</label>
                                    <p className="swot-description">Les risques externes à anticiper</p>
                                    <Field 
                                      as="textarea" 
                                      name="swot.threats" 
                                      placeholder="Ex: Concurrence, changements réglementaires..."
                                    />
                                    <ErrorMessage name="swot.threats" component="div" className="form-error" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="form-group">
                                <label htmlFor="weaknessesAndThreatsStrategy">
                                  Comment palliez-vous vos faiblesses et contournez-vous les menaces ? *
                                </label>
                                <Field 
                                  as="textarea" 
                                  id="weaknessesAndThreatsStrategy" 
                                  name="weaknessesAndThreatsStrategy" 
                                  className="form-control" 
                                  rows="3" 
                                />
                                <ErrorMessage name="weaknessesAndThreatsStrategy" component="div" className="form-error" />
                              </div>
                              
                              <div className="form-group">
                                <label htmlFor="creationTimeline">
                                  A quelle échéance souhaitez-vous créer ? Pour ce faire, quel est votre plan d'action / calendrier prévisionnel ? *
                                </label>
                                <Field 
                                  as="textarea" 
                                  id="creationTimeline" 
                                  name="creationTimeline" 
                                  className="form-control" 
                                  rows="4" 
                                />
                                <ErrorMessage name="creationTimeline" component="div" className="form-error" />
                              </div>
                              
                              <div className="form-group">
                                <label className="mb-2">
                                  Êtes-vous prêts à vous déplacer en Normandie pour suivre les formations collectives, des événementiels pour présenter votre projet, favoriser la mise en réseau, le développement de votre projet ? *
                                </label>
                                <div className="radio-button-group">
                                   <label className={`radio-button ${formik.values.readyToTravel === 'oui' ? 'selected' : ''}`}>
                                      <Field type="radio" name="readyToTravel" value="oui" /> Oui
                                   </label>
                                   <label className={`radio-button ${formik.values.readyToTravel === 'non' ? 'selected' : ''}`}>
                                      <Field type="radio" name="readyToTravel" value="non" /> Non
                                   </label>
                                </div>
                                <ErrorMessage name="readyToTravel" component="div" className="form-error" />
                              </div>
                              
                              <div className="form-group">
                                <label className="mb-2">
                                  Afin de favoriser le développement du projet, des présentations du projet et des mises en relation auront lieu, êtes-vous prêt à communiquer sur votre projet ? *
                                </label>
                                <div className="radio-button-group">
                                   <label className={`radio-button ${formik.values.readyToCommunicate === 'oui' ? 'selected' : ''}`}>
                                      <Field type="radio" name="readyToCommunicate" value="oui" /> Oui
                                   </label>
                                   <label className={`radio-button ${formik.values.readyToCommunicate === 'non' ? 'selected' : ''}`}>
                                      <Field type="radio" name="readyToCommunicate" value="non" /> Non
                                   </label>
                                </div>
                                <ErrorMessage name="readyToCommunicate" component="div" className="form-error" />
                              </div>
                              
                              <div className="form-group">
                                <label className="mb-2">
                                  Le parcours d'incubation proposé est un accompagnement intensif et renforcé ayant pour objectif de développer la création d'entreprises sociales innovantes, viables et pérennes. Avez-vous bien pris connaissance de l'offre et êtes-vous prêt à vous engager dans un parcours intensif d'un an ? *
                                </label>
                                <div className="radio-button-group">
                                   <label className={`radio-button ${formik.values.readyToCommit === 'oui' ? 'selected' : ''}`}>
                                      <Field type="radio" name="readyToCommit" value="oui" /> Oui
                                   </label>
                                   <label className={`radio-button ${formik.values.readyToCommit === 'non' ? 'selected' : ''}`}>
                                      <Field type="radio" name="readyToCommit" value="non" /> Non
                                   </label>
                                </div>
                                <ErrorMessage name="readyToCommit" component="div" className="form-error" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 8 : Documents justificatifs */}
                        {currentStep === 8 && (
                          <div id="step-8">
                            <div className="form-section">
                              <h2 className="form-section-title">8. Documents justificatifs</h2>
                              <div className="form-group">
                                <label htmlFor="document">
                                  Téléchargez les documents justificatifs pour appuyer votre candidature
                                </label>
                                <input 
                                  id="document" 
                                  name="document" 
                                  type="file" 
                                  onChange={(event) => {
                                    formik.setFieldValue("document", event.currentTarget.files[0]);
                                    // Mise à jour de la progression après l'ajout d'un document
                                    setTimeout(() => {
                                      const percentage = calculateCompletionPercentage(formik.values);
                                      setProgressPercentage(percentage);
                                    }, 100);
                                  }} 
                                  className="form-control-file"
                                />
                                <ErrorMessage name="document" component="div" className="form-error" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 9 : Récapitulatif */}
                        {currentStep === 9 && (
                          <div id="step-9">
                            <div className="form-section">
                              <h2 className="form-section-title">9. Récapitulatif</h2>
                              <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                                <p><strong>Information :</strong> Votre candidature a été automatiquement sauvegardée en brouillon.</p>
                                <p>Veuillez vérifier attentivement toutes les informations ci-dessous avant de soumettre votre candidature.</p>
                                <p>En cliquant sur "Soumettre ma candidature", votre dossier sera soumis définitivement après votre confirmation. <strong>Une fois soumise, la candidature ne pourra plus être modifiée.</strong></p>
                              </div>
                              
                              <div className="recap-container">
                                {/* Section 1: Fiche d'identité */}
                                <div className="recap-section">
                                  <h3 className="recap-title">1. Fiche d'identité</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Nom du projet :</span>
                                      <span className="recap-value">{formik.values.projectName}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Secteur d'activité :</span>
                                      <span className="recap-value">
                                        {formik.values.sector === 'autre' 
                                          ? formik.values.sectorOther 
                                          : formik.values.sector}
                                      </span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Territoire d'implantation :</span>
                                      <span className="recap-value">{formik.values.territory}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Zone géographique d'intervention :</span>
                                      <span className="recap-value">{formik.values.interventionZone}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Comment avez-vous eu connaissance de l'appel à candidatures :</span>
                                      <div className="recap-value">
                                        <ul className="recap-list">
                                          {formik.values.referral_facebook_adress && <li>Page Facebook de l'ADRESS</li>}
                                          {formik.values.referral_linkedin_adress && <li>Page LinkedIn de l'ADRESS</li>}
                                          {formik.values.referral_instagram_adress && <li>Page Instagram de l'ADRESS</li>}
                                          {formik.values.referral_web_adress && <li>Site internet de l'ADRESS</li>}
                                          {formik.values.referral_mail_adress && <li>Par un mail de l'ADRESS</li>}
                                        </ul>
                                      </div>
                                    </div>
                                    {formik.values.hasExistingStructure && (
                                      <div className="recap-item">
                                        <span className="recap-label">Structure existante :</span>
                                        <div className="recap-value">
                                          <p><strong>Nom de la structure :</strong> {formik.values.structureName}</p>
                                          <p><strong>SIRET :</strong> {formik.values.structureSiret}</p>
                                          <p><strong>Statut juridique :</strong> {formik.values.structureStatus === 'autre' ? formik.values.structureStatusOther : formik.values.structureStatus}</p>
                                          <p><strong>Date de création :</strong> {formik.values.structureCreationDate}</p>
                                          <p><strong>Contexte :</strong> {formik.values.structureContext === 'autre' ? formik.values.structureContextOther : formik.values.structureContext}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Section 2: Projet et utilité sociale */}
                                <div className="recap-section">
                                  <h3 className="recap-title">2. Votre projet et son utilité sociale</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Genèse du projet :</span>
                                      <span className="recap-value">{formik.values.projectGenesis}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Résumé du projet :</span>
                                      <span className="recap-value">{formik.values.projectSummary}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Problème ciblé :</span>
                                      <span className="recap-value">{formik.values.problemDescription}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Section 3: Qui est concerné */}
                                <div className="recap-section">
                                  <h3 className="recap-title">3. Qui est concerné ?</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Bénéficiaires :</span>
                                      <span className="recap-value">{formik.values.beneficiaries}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Clients :</span>
                                      <span className="recap-value">{formik.values.clients}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Solution proposée :</span>
                                      <span className="recap-value">{formik.values.proposedSolution}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Différenciation :</span>
                                      <span className="recap-value">{formik.values.projectDifferentiation}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Indicateurs d'impact :</span>
                                      <div className="recap-value">
                                        <ul className="recap-list">
                                          {formik.values.indicator1 && <li>{formik.values.indicator1}</li>}
                                          {formik.values.indicator2 && <li>{formik.values.indicator2}</li>}
                                          {formik.values.indicator3 && <li>{formik.values.indicator3}</li>}
                                          {formik.values.indicator4 && <li>{formik.values.indicator4}</li>}
                                          {formik.values.indicator5 && <li>{formik.values.indicator5}</li>}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Section 4: Le modèle économique */}
                                <div className="recap-section">
                                  <h3 className="recap-title">4. Le modèle économique</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Sources de revenus :</span>
                                      <span className="recap-value">{formik.values.revenueSources}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Création d'emploi :</span>
                                      <span className="recap-value">{formik.values.employmentCreation}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Éléments de viabilité économique :</span>
                                      <div className="recap-value">
                                        <ul className="recap-list">
                                          {formik.values.viabilityElement1 && <li>{formik.values.viabilityElement1}</li>}
                                          {formik.values.viabilityElement2 && <li>{formik.values.viabilityElement2}</li>}
                                          {formik.values.viabilityElement3 && <li>{formik.values.viabilityElement3}</li>}
                                          {formik.values.viabilityElement4 && <li>{formik.values.viabilityElement4}</li>}
                                          {formik.values.viabilityElement5 && <li>{formik.values.viabilityElement5}</li>}
                                        </ul>
                                      </div>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Projets de diversification :</span>
                                      <span className="recap-value">{formik.values.diversification}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Section 5: La place des parties prenantes */}
                                <div className="recap-section">
                                  <h3 className="recap-title">5. La place des parties prenantes</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Partenariats existants :</span>
                                      <span className="recap-value">{formik.values.existingPartnerships}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Partenariats recherchés :</span>
                                      <span className="recap-value">{formik.values.desiredPartnerships}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Rôle des acteurs :</span>
                                      <span className="recap-value">{formik.values.stakeholderRole}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Section 6: L'équipe projet */}
                                <div className="recap-section">
                                  <h3 className="recap-title">6. L'équipe projet et parcours d'incubation</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Personne référente :</span>
                                      <div className="recap-subitem">
                                        <span>{formik.values.referenceFirstName} {formik.values.referenceLastName}</span>
                                        <span>Date de naissance : {formik.values.referenceDOB}</span>
                                        <span>Adresse : {formik.values.referenceAddress}</span>
                                        <span>Email : {formik.values.referenceEmail}</span>
                                        <span>Téléphone : {formik.values.referenceTelephone}</span>
                                        {formik.values.hasExistingStructure && (
                                          <span>Type d'emploi : {formik.values.referenceEmploymentType}</span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="recap-item">
                                      <span className="recap-label">Présentation de l'équipe :</span>
                                      <span className="recap-value">{formik.values.teamPresentation}</span>
                                    </div>

                                    {formik.values.teamMembers && formik.values.teamMembers.length > 0 && (
                                      <div className="recap-item">
                                        <span className="recap-label">Membres de l'équipe :</span>
                                        <div className="recap-value">
                                          {formik.values.teamMembers.map((member, index) => (
                                            <div key={index} className="recap-subitem">
                                              <span>{member.firstName} {member.lastName}</span>
                                              <span>Email : {member.email}</span>
                                              <span>Rôle : {member.role}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="recap-item">
                                      <span className="recap-label">Expérience entrepreneuriale :</span>
                                      <span className="recap-value">
                                        {formik.values.hasEntrepreneurialExperience 
                                          ? `Oui - ${formik.values.entrepreneurialExperience}` 
                                          : 'Non'}
                                      </span>
                                    </div>

                                    <div className="recap-item">
                                      <span className="recap-label">Entrepreneur social inspirant :</span>
                                      <span className="recap-value">{formik.values.inspiringEntrepreneur}</span>
                                    </div>

                                    <div className="recap-item">
                                      <span className="recap-label">Compétences manquantes :</span>
                                      <span className="recap-value">{formik.values.missingTeamSkills}</span>
                                    </div>

                                    <div className="recap-item">
                                      <span className="recap-label">Participants à l'incubation :</span>
                                      <span className="recap-value">{formik.values.incubationParticipants}</span>
                                    </div>

                                    <div className="recap-item">
                                    <span className="recap-label">Place des porteurs de projet :</span>
                                      {Array.isArray(formik.values.projectMembersRoles) && formik.values.projectMembersRoles.length > 0 ? (
                                        <>
                                          {formik.values.projectMembersRoles.map((member, index) => (
                                            <div key={index} className="recap-subitem mb-3 border-bottom pb-3">
                                              <strong>{member.name || 'Porteur sans nom'}</strong>
                                              <table className="table table-sm table-bordered mt-2">
                                                <thead><tr><th>Période</th><th>Type</th><th>Missions</th></tr></thead>
                                                <tbody>
                                                  <tr>
                                                    <td>Court terme</td>
                                                    <td>{member.shortTerm && member.shortTerm.type ? member.shortTerm.type : 'Non défini'}</td>
                                                    <td>{member.shortTerm && member.shortTerm.details ? member.shortTerm.details : 'Non défini'}</td>
                                                  </tr>
                                                  <tr>
                                                    <td>Moyen terme</td>
                                                    <td>{member.mediumTerm && member.mediumTerm.type ? member.mediumTerm.type : 'Non défini'}</td>
                                                    <td>{member.mediumTerm && member.mediumTerm.details ? member.mediumTerm.details : 'Non défini'}</td>
                                                  </tr>
                                                  <tr>
                                                    <td>Long terme</td>
                                                    <td>{member.longTerm && member.longTerm.type ? member.longTerm.type : 'Non défini'}</td>
                                                    <td>{member.longTerm && member.longTerm.details ? member.longTerm.details : 'Non défini'}</td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </div>
                                          ))}
                                        </>
                                      ) : (
                                        <span className="recap-value">Aucun porteur défini</span>
                                      )}
                                      <span className="recap-label">Revenus pendant l'incubation :</span>
                                      <span className="recap-value">{formik.values.incubationPeriodIncome}</span>
                                    </div>

                                    <div className="recap-item">
                                      <span className="recap-label">Motivation pour l'incubateur :</span>
                                      <span className="recap-value">{formik.values.incubatorMotivation}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Section 7: État d'avancement */}
                                <div className="recap-section">
                                    <h3 className="recap-title">7. État d'avancement du projet</h3>
                                    <div className="recap-content">
                                      <div className="recap-item">
                                        <span className="recap-label">Accompagnement(s) autre(s) :</span>
                                        <span className="recap-value">{formik.values.otherSupport || 'Non renseigné'}</span>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Étapes réalisées :</span>
                                        <ul className="recap-list">
                                          <li>Diagnostic territorial : {formik.values.diagnostic?.status} {formik.values.diagnostic?.details && `(${formik.values.diagnostic.details})`}</li>
                                          <li>Constitution collectif : {formik.values.collectif?.status} {formik.values.collectif?.details && `(${formik.values.collectif.details})`}</li>
                                          <li>Expérimentation terrain : {formik.values.experimentation?.status} {formik.values.experimentation?.details && `(${formik.values.experimentation.details})`}</li>
                                          <li>Étude de marché : {formik.values.etudeMarche?.status} {formik.values.etudeMarche?.details && `(${formik.values.etudeMarche.details})`}</li>
                                          <li>Formalisation offre : {formik.values.offre?.status} {formik.values.offre?.details && `(${formik.values.offre.details})`}</li>
                                          <li>Premier chiffrage : {formik.values.chiffrage?.status} {formik.values.chiffrage?.details && `(${formik.values.chiffrage.details})`}</li>
                                        </ul>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Premier risque pris :</span>
                                        <span className="recap-value">{formik.values.firstRisk}</span>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Analyse SWOT :</span>
                                        <div className="recap-subitem">
                                          <p><strong>Forces :</strong> {formik.values.swot?.strengths}</p>
                                          <p><strong>Faiblesses :</strong> {formik.values.swot?.weaknesses}</p>
                                          <p><strong>Opportunités :</strong> {formik.values.swot?.opportunities}</p>
                                          <p><strong>Menaces :</strong> {formik.values.swot?.threats}</p>
                                        </div>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Stratégie faiblesses/menaces :</span>
                                        <span className="recap-value">{formik.values.weaknessesAndThreatsStrategy}</span>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Échéance création / Plan d'action :</span>
                                        <span className="recap-value">{formik.values.creationTimeline}</span>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Prêt à se déplacer :</span>
                                        <span className="recap-value">{formik.values.readyToTravel}</span>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Prêt à communiquer :</span>
                                        <span className="recap-value">{formik.values.readyToCommunicate}</span>
                                      </div>
                                      <div className="recap-item">
                                        <span className="recap-label">Prêt à s'engager :</span>
                                        <span className="recap-value">{formik.values.readyToCommit}</span>
                                      </div>
                                    </div>
                                </div>

                                {/* Section 8: Documents justificatifs */}
                                <div className="recap-section">
                                  <h3 className="recap-title">8. Documents justificatifs</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Document(s) :</span>
                                      <span className="recap-value">
                                        {formik.values.document ? formik.values.document.name : 'Aucun document'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="form-actions">
                          {currentStep > 1 && (
                            <button type="button" onClick={prevStep} className="btn-prev">
                              <i className="fa fa-arrow-left"></i> Précédent
                            </button>
                          )}
                          <button type="button" onClick={() => saveDraft(formik.values)} className="btn-save">
                            <i className="fa fa-save"></i> Enregistrer le brouillon
                          </button>
                          {currentStep < steps.length ? (
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.preventDefault(); // Empêcher toute soumission du formulaire
                                nextStep();
                              }} 
                              className="btn-next"
                            >
                              Suivant <i className="fa fa-arrow-right"></i>
                            </button>
                          ) : (
                            <button 
                              type="button" // Change type to button
                              onClick={() => submitCandidature(formik.values)} // Call submit explicitly
                              className="btn-submit"
                            >
                              <i className="fa fa-paper-plane"></i> Soumettre ma candidature
                            </button>
                          )}
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidatureForm;