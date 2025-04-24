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

  // Définition des 8 étapes du formulaire avec numérotation (les chiffres seront affichés dans la navigation)
  const steps = [
    { id: 1, name: "Fiche d'identité", icon: 'fa-id-card' },
    { id: 2, name: "Votre projet et son utilité sociale", icon: 'fa-lightbulb' },
    { id: 3, name: "Qui est concerné ?", icon: 'fa-users' },
    { id: 4, name: "Le modèle économique", icon: 'fa-chart-line' },
    { id: 5, name: "La place des parties prenantes", icon: 'fa-handshake' },
    { id: 6, name: "L'équipe projet et parcours d'incubation", icon: 'fa-user-friends' },
    { id: 7, name: "Documents justificatifs", icon: 'fa-file-upload' },
    { id: 8, name: "Récapitulatif", icon: 'fa-check-circle' }
  ];

  // Valeurs initiales regroupant toutes les questions du PDF, mémorisées pour éviter les recréations à chaque rendu
  const initialValues = useMemo(() => ({
    // Étape 1 : Fiche d'identité
    projectName: '',
    sector: '',
    territory: '',
    interventionZone: '',
    // Provenance de l'appel à candidatures (checkboxes)
    referral_boucheOreille: false,
    referral_facebook: false,
    referral_linkedin: false,
    referral_web: false,
    referral_tiers: false,
    referral_presse: false,

    // Étape 2 : Votre projet et son utilité sociale
    projectGenesis: '',         // "Expliquez la genèse de votre projet (environ 10 lignes)"
    projectSummary: '',         // "Résumez votre projet (10 lignes maximum)"
    problemDescription: '',     // "À quel problème social et/ou environnemental souhaitez-vous répondre ? ... (environ 20 lignes)"

    // Étape 3 : Qui est concerné ?
    beneficiaries: '',          // "Qui seront les bénéficiaires de votre projet ?"
    clients: '',                // "Qui seront les clients (s'ils sont différents des bénéficiaires) ?"
    clientsQuantification: '',  // "Pouvez-vous les quantifier, définir le périmètre géographique touché… ?"
    proposedSolution: '',       // "Quelle solution souhaitez-vous proposer ? Quelle sera votre offre ?"
    projectDifferentiation: '', // "En quoi votre projet est-il différent et/ou complémentaire des solutions existantes ?"
    indicator1: '',
    indicator2: '',
    indicator3: '',
    indicator4: '',
    indicator5: '',

    // Étape 4 : Le modèle économique
    revenueSources: '',         // "Quelles sont les sources de revenus envisagées pour votre projet ? ... "
    employmentCreation: '',     // "Combien d'emplois pensez-vous créer sur les premières années d'activités ? ..."
    economicViability: '',      // "À ce stade, quels sont les éléments vous permettant d'affirmer la viabilité économique du projet ?"
    diversification: '',        // "Quels pourraient être les projets de diversification et de développement économique ..."

    // Étape 5 : La place des parties prenantes
    existingPartnerships: '',   // "Avez-vous déjà établi des contacts ou partenariats pour contribuer au projet ? Si oui, de quelle manière ?"
    desiredPartnerships: '',    // "Quels autres contacts ou partenariats recherchez-vous aujourd'hui ?"
    stakeholderRole: '',        // "Quel rôle voudriez-vous que jouent ces différents acteurs dans le projet à terme ?"

    // Étape 6 : L'équipe projet et parcours d'incubation
    // Personne référente
    referenceLastName: '',
    referenceFirstName: '',
    referenceDOB: '',
    referenceAddress: '',
    referenceEmail: '',
    referenceTelephone: '',
    // Autres personnes impliquées dans le projet
    teamMembers: [],
    // Structure juridique existante
    hasExistingStructure: false,
    structureName: '',
    structureStatus: '',        // Options : Association, Coopérative, Société commerciale de l'ESS, Société commerciale hors ESS, Autre
    structureCreationDate: '',
    structureContext: '',       // "Dans quel cadre la structure candidate-t-elle à l'incubateur ?" (ex: Développement d'une nouvelle activité, Implantation en Normandie, Autre)
    // Statut de la personne référente dans la structure
    referenceEmploymentType: '', // "La personne référente pour le projet est-elle salariée par la structure ou bénévole ?"
    referenceEmploymentDuration: '', // "Depuis combien de temps ?"
    // Expérience entrepreneuriale et complément
    entrepreneurialExperience: '',
    inspiringEntrepreneur: '',
    missingTeamSkills: '',
    incubationParticipants: '',
    projectRoleLongTerm: '',

    // Étape 7 : Documents justificatifs
    document: null,

    // (D'autres champs pourraient être ajoutés pour la suite du parcours si besoin)
  }), []); // Tableau de dépendances vide signifie que cette valeur ne changera jamais

  // Schémas de validation par étape
  const step1ValidationSchema = Yup.object({
    projectName: Yup.string().required('Ce champ est requis'),
    sector: Yup.string().required('Ce champ est requis'),
    territory: Yup.string().required('Ce champ est requis'),
    interventionZone: Yup.string().required('Ce champ est requis'),
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
    economicViability: Yup.string().required('Ce champ est requis'),
    diversification: Yup.string().required('Ce champ est requis'),
  });

  const step5ValidationSchema = Yup.object({
    existingPartnerships: Yup.string().required('Ce champ est requis'),
    desiredPartnerships: Yup.string().required('Ce champ est requis'),
    stakeholderRole: Yup.string().required('Ce champ est requis'),
  });

  const step6ValidationSchema = Yup.object({
    referenceLastName: Yup.string().required('Ce champ est requis'),
    referenceFirstName: Yup.string().required('Ce champ est requis'),
    referenceDOB: Yup.string().required('Ce champ est requis'),
    referenceAddress: Yup.string().required('Ce champ est requis'),
    referenceEmail: Yup.string().email('Email invalide').required('Ce champ est requis'),
    referenceTelephone: Yup.string().required('Ce champ est requis'),
    // Pour les membres de l'équipe (s'ils sont ajoutés)
    teamMembers: Yup.array().of(
      Yup.object().shape({
        lastName: Yup.string().required('Ce champ est requis'),
        firstName: Yup.string().required('Ce champ est requis'),
        email: Yup.string().email('Email invalide').required('Ce champ est requis'),
        telephone: Yup.string().required('Ce champ est requis'),
      })
    )
  });

  // Pour l'étape 7 (Documents justificatifs) : aucun champ requis dans cet exemple
  const step7ValidationSchema = Yup.object({});

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
              structureStatus: parsedStructureJuridique?.structureStatus || '',
              structureCreationDate: parsedStructureJuridique?.structureCreationDate || '',
              structureContext: parsedStructureJuridique?.structureContext || '',
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
    const totalRequiredFields = 30; // ajustez ce nombre selon vos besoins réels
    
    // Compter les champs remplis
    let filledFields = 0;
    
    // Étape 1
    if (data.projectName) filledFields++;
    if (data.sector) filledFields++;
    if (data.territory) filledFields++;
    if (data.interventionZone) filledFields++;
    
    // Étape 2
    if (data.projectGenesis) filledFields++;
    if (data.projectSummary) filledFields++;
    if (data.problemDescription) filledFields++;
    
    // Étape 3
    if (data.beneficiaries) filledFields++;
    if (data.clients) filledFields++;
    if (data.clientsQuantification) filledFields++;
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
    if (data.economicViability) filledFields++;
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
    
    return Math.round((filledFields / totalRequiredFields) * 100);
  };

  // Mettre à jour le pourcentage de complétion à chaque changement d'étape
  useEffect(() => {
    if (candidature) {
      const percentage = calculateCompletionPercentage(candidature);
      setProgressPercentage(percentage);
    }
  }, [currentStep, candidature]);

  // Sauvegarder automatiquement en brouillon quand on arrive à l'étape de récapitulatif
  useEffect(() => {
    if (currentStep === 8 && candidature && !loading) {
      const autoSaveDraft = async () => {
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
              economicViability: formValues.economicViability || '',
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
              members: Array.isArray(formValues.teamMembers) ? formValues.teamMembers : [],
              entrepreneurialExperience: formValues.entrepreneurialExperience || '',
              inspiringEntrepreneur: formValues.inspiringEntrepreneur || '',
              missingTeamSkills: formValues.missingTeamSkills || '',
              incubationParticipants: formValues.incubationParticipants || '',
              projectRoleLongTerm: formValues.projectRoleLongTerm || '',
            },
            
            // Structure juridique
            structure_juridique: {
              hasExistingStructure: !!formValues.hasExistingStructure,
              structureName: formValues.structureName || '',
              structureStatus: formValues.structureStatus || '',
              structureCreationDate: formValues.structureCreationDate || '',
              structureContext: formValues.structureContext || '',
            },
            
            // Conserver les champs supplémentaires qui pourraient être nécessaires
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
              
              // Afficher un message de succès
              setSuccessMessage('Votre candidature a été automatiquement sauvegardée en brouillon.');
              setTimeout(() => {
                setSuccessMessage('');
              }, 5000);
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
    }
  }, [currentStep, candidature, id, isEditMode, loading, navigate, isSubmitted, formikRef]);

  const goToStep = (stepId) => {
    setCurrentStep(stepId);
    window.scrollTo(0, 0);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      // Empêcher toute tentative de soumission si on n'est pas à la dernière étape
      if (currentStep === steps.length - 1) {
        // Si on passe de l'étape 7 à 8, simplement changer d'étape sans soumettre
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
          economicViability: values.economicViability || '',
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
          members: Array.isArray(values.teamMembers) ? values.teamMembers : [],
          entrepreneurialExperience: values.entrepreneurialExperience || '',
          inspiringEntrepreneur: values.inspiringEntrepreneur || '',
          missingTeamSkills: values.missingTeamSkills || '',
          incubationParticipants: values.incubationParticipants || '',
          projectRoleLongTerm: values.projectRoleLongTerm || '',
        },
        
        // Structure juridique
        structure_juridique: {
          hasExistingStructure: !!values.hasExistingStructure,
          structureName: values.structureName || '',
          structureStatus: values.structureStatus || '',
          structureCreationDate: values.structureCreationDate || '',
          structureContext: values.structureContext || '',
        },
        
        // Conserver les champs supplémentaires qui pourraient être nécessaires
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
      // Étape 1: Vérifier que nous sommes bien à l'étape du récapitulatif (étape 8)
      if (currentStep !== 8) {
        setCurrentStep(8); // Rediriger vers le récapitulatif si ce n'est pas déjà le cas
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
            economicViability: values.economicViability || '',
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
            members: Array.isArray(values.teamMembers) ? values.teamMembers : [],
            entrepreneurialExperience: values.entrepreneurialExperience || '',
            inspiringEntrepreneur: values.inspiringEntrepreneur || '',
            missingTeamSkills: values.missingTeamSkills || '',
            incubationParticipants: values.incubationParticipants || '',
            projectRoleLongTerm: values.projectRoleLongTerm || '',
          },
          
          // Structure juridique
          structure_juridique: {
            hasExistingStructure: !!values.hasExistingStructure,
            structureName: values.structureName || '',
            structureStatus: values.structureStatus || '',
            structureCreationDate: values.structureCreationDate || '',
            structureContext: values.structureContext || '',
          },
          
          // Conserver les champs supplémentaires qui pourraient être nécessaires
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
                                    <Field type="checkbox" name="referral_boucheOreille" />
                                    Bouche à oreilles (réseau personnel ou professionnel)
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_facebook" />
                                    Contenu sur Facebook
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_linkedin" />
                                    Contenu sur LinkedIn
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_web" />
                                    Contenu sur le web
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_tiers" />
                                    Information par un tiers (structure d'accompagnement, collectivité…)
                                  </label>
                                </div>
                                <div className="checkbox-group">
                                  <label>
                                    <Field type="checkbox" name="referral_presse" />
                                    Presse / Radio
                                  </label>
                                </div>
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
                                <Field as="textarea" id="projectGenesis" name="projectGenesis" className="form-control" placeholder="Décrivez la genèse de votre projet" rows="5" />
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
                                <Field as="textarea" id="problemDescription" name="problemDescription" className="form-control" placeholder="Description détaillée du problème" rows="8" />
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
                                  Qui seront les bénéficiaires de votre projet ? *
                                </label>
                                <Field as="textarea" id="beneficiaries" name="beneficiaries" className="form-control" placeholder="Décrivez les bénéficiaires" rows="4" />
                                <ErrorMessage name="beneficiaries" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="clients">
                                  Qui seront les clients (s'ils sont différents des bénéficiaires) ? *
                                </label>
                                <Field as="textarea" id="clients" name="clients" className="form-control" placeholder="Décrivez les clients" rows="3" />
                                <ErrorMessage name="clients" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="clientsQuantification">
                                  Pouvez-vous les quantifier, définir le périmètre géographique touché ? *
                                </label>
                                <Field as="textarea" id="clientsQuantification" name="clientsQuantification" className="form-control" placeholder="Quantifiez et décrivez le périmètre" rows="3" />
                                <ErrorMessage name="clientsQuantification" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="proposedSolution">
                                  Quelle solution souhaitez-vous proposer ? Quelle sera votre offre ? *
                                </label>
                                <Field as="textarea" id="proposedSolution" name="proposedSolution" className="form-control" placeholder="Décrivez votre offre" rows="4" />
                                <ErrorMessage name="proposedSolution" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <label htmlFor="projectDifferentiation">
                                  En quoi votre projet est-il différent et/ou complémentaire des solutions existantes ? *
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
                                <Field as="textarea" id="economicViability" name="economicViability" className="form-control" placeholder="Précisez les éléments de viabilité" rows="4" />
                                <ErrorMessage name="economicViability" component="div" className="form-error" />
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
                                <Field as="textarea" id="existingPartnerships" name="existingPartnerships" className="form-control" placeholder="Décrivez vos partenariats existants" rows="4" />
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
                                <Field as="textarea" id="stakeholderRole" name="stakeholderRole" className="form-control" placeholder="Décrivez le rôle des acteurs" rows="4" />
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
                              <div className="form-group">
                                <h3>Personne référente</h3>
                                <label htmlFor="referenceLastName">Nom *</label>
                                <Field type="text" id="referenceLastName" name="referenceLastName" className="form-control" placeholder="Nom" />
                                <ErrorMessage name="referenceLastName" component="div" className="form-error" />
                                <label htmlFor="referenceFirstName">Prénom *</label>
                                <Field type="text" id="referenceFirstName" name="referenceFirstName" className="form-control" placeholder="Prénom" />
                                <ErrorMessage name="referenceFirstName" component="div" className="form-error" />
                                <label htmlFor="referenceDOB">Date de naissance *</label>
                                <Field type="date" id="referenceDOB" name="referenceDOB" className="form-control" />
                                <ErrorMessage name="referenceDOB" component="div" className="form-error" />
                                <label htmlFor="referenceAddress">Adresse *</label>
                                <Field type="text" id="referenceAddress" name="referenceAddress" className="form-control" placeholder="Adresse" />
                                <ErrorMessage name="referenceAddress" component="div" className="form-error" />
                                <label htmlFor="referenceEmail">E-mail *</label>
                                <Field type="email" id="referenceEmail" name="referenceEmail" className="form-control" placeholder="Email" />
                                <ErrorMessage name="referenceEmail" component="div" className="form-error" />
                                <label htmlFor="referenceTelephone">Téléphone *</label>
                                <Field type="text" id="referenceTelephone" name="referenceTelephone" className="form-control" placeholder="Téléphone" />
                                <ErrorMessage name="referenceTelephone" component="div" className="form-error" />
                              </div>
                              <div className="form-group">
                                <h3>Autres personnes impliquées dans le projet</h3>
                                <FieldArray
                                  name="teamMembers"
                                  render={arrayHelpers => (
                                    <div>
                                      {formik.values.teamMembers && formik.values.teamMembers.length > 0 ? (
                                        formik.values.teamMembers.map((member, index) => (
                                          <div key={index} className="team-member">
                                            <label htmlFor={`teamMembers.${index}.lastName`}>Nom *</label>
                                            <Field type="text" id={`teamMembers.${index}.lastName`} name={`teamMembers.${index}.lastName`} className="form-control" placeholder="Nom" />
                                            <ErrorMessage name={`teamMembers.${index}.lastName`} component="div" className="form-error" />
                                            <label htmlFor={`teamMembers.${index}.firstName`}>Prénom *</label>
                                            <Field type="text" id={`teamMembers.${index}.firstName`} name={`teamMembers.${index}.firstName`} className="form-control" placeholder="Prénom" />
                                            <ErrorMessage name={`teamMembers.${index}.firstName`} component="div" className="form-error" />
                                            <label htmlFor={`teamMembers.${index}.email`}>E-mail *</label>
                                            <Field type="email" id={`teamMembers.${index}.email`} name={`teamMembers.${index}.email`} className="form-control" placeholder="Email" />
                                            <ErrorMessage name={`teamMembers.${index}.email`} component="div" className="form-error" />
                                            <label htmlFor={`teamMembers.${index}.telephone`}>Téléphone *</label>
                                            <Field type="text" id={`teamMembers.${index}.telephone`} name={`teamMembers.${index}.telephone`} className="form-control" placeholder="Téléphone" />
                                            <ErrorMessage name={`teamMembers.${index}.telephone`} component="div" className="form-error" />
                                            <button type="button" onClick={() => arrayHelpers.remove(index)} className="btn-remove">
                                              <i className="fa fa-times"></i> Supprimer
                                            </button>
                                          </div>
                                        ))
                                      ) : (
                                        <p>Aucun membre ajouté.</p>
                                      )}
                                      <button type="button" onClick={() => {
                                        arrayHelpers.push({ lastName: '', firstName: '', email: '', telephone: '' });
                                        // Mise à jour de la progression après l'ajout d'un membre
                                        setTimeout(() => {
                                          const percentage = calculateCompletionPercentage(formik.values);
                                          setProgressPercentage(percentage);
                                        }, 100);
                                      }} className="btn-add-more">
                                        <i className="fa fa-plus"></i> Ajouter un membre
                                      </button>
                                    </div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Étape 7 : Documents justificatifs */}
                        {currentStep === 7 && (
                          <div id="step-7">
                            <div className="form-section">
                              <h2 className="form-section-title">7. Documents justificatifs</h2>
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

                        {/* Étape 8 : Récapitulatif */}
                        {currentStep === 8 && (
                          <div id="step-8">
                            <div className="form-section">
                              <h2 className="form-section-title">8. Récapitulatif</h2>
                              <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                                <p><strong>Information :</strong> Votre candidature a été automatiquement sauvegardée en brouillon.</p>
                                <p>Veuillez vérifier attentivement toutes les informations ci-dessous avant de soumettre votre candidature.</p>
                                <p>En cliquant sur "Soumettre ma candidature", votre dossier sera soumis définitivement après votre confirmation. <strong>Une fois soumise, la candidature ne pourra plus être modifiée.</strong></p>
                              </div>
                              <p>Résumé de votre candidature :</p>
                              
                              <div className="recap-container">
                                {/* Étape 1 : Fiche d'identité */}
                                <div className="recap-section">
                                  <h3 className="recap-title">1. Fiche d'identité</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Nom du projet :</span>
                                      <span className="recap-value">{formik.values.projectName}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Secteur d'activité :</span>
                                      <span className="recap-value">{formik.values.sector}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Territoire d'implantation :</span>
                                      <span className="recap-value">{formik.values.territory}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Zone géographique d'intervention :</span>
                                      <span className="recap-value">{formik.values.interventionZone}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Étape 2 : Votre projet et son utilité sociale */}
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

                                {/* Étape 3 : Qui est concerné */}
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
                                      <span className="recap-label">Quantification :</span>
                                      <span className="recap-value">{formik.values.clientsQuantification}</span>
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
                                      <ul className="recap-list">
                                        <li>{formik.values.indicator1}</li>
                                        <li>{formik.values.indicator2}</li>
                                        <li>{formik.values.indicator3}</li>
                                        <li>{formik.values.indicator4}</li>
                                        <li>{formik.values.indicator5}</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                {/* Étape 4 : Le modèle économique */}
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
                                      <span className="recap-label">Viabilité économique :</span>
                                      <span className="recap-value">{formik.values.economicViability}</span>
                                    </div>
                                    <div className="recap-item">
                                      <span className="recap-label">Projets de diversification :</span>
                                      <span className="recap-value">{formik.values.diversification}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Étape 5 : La place des parties prenantes */}
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

                                {/* Étape 6 : L'équipe projet et parcours d'incubation */}
                                <div className="recap-section">
                                  <h3 className="recap-title">6. L'équipe projet et parcours d'incubation</h3>
                                  <div className="recap-content">
                                    <div className="recap-item">
                                      <span className="recap-label">Personne référente :</span>
                                      <div className="recap-subitem">
                                        <span>{formik.values.referenceFirstName} {formik.values.referenceLastName}</span>
                                        <span>Email : {formik.values.referenceEmail}</span>
                                        <span>Téléphone : {formik.values.referenceTelephone}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="recap-item">
                                      <span className="recap-label">Membres de l'équipe :</span>
                                      {formik.values.teamMembers && formik.values.teamMembers.length > 0 ? (
                                        <ul className="recap-list">
                                          {formik.values.teamMembers.map((member, index) => (
                                            <li key={index}>
                                              {member.firstName} {member.lastName} - {member.email}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <span className="recap-value">Aucun membre supplémentaire</span>
                                      )}
                                    </div>

                                    {formik.values.hasExistingStructure && (
                                      <div className="recap-item">
                                        <span className="recap-label">Structure juridique :</span>
                                        <div className="recap-subitem">
                                          <span>Nom : {formik.values.structureName}</span>
                                          <span>Statut : {formik.values.structureStatus}</span>
                                          <span>Date de création : {formik.values.structureCreationDate}</span>
                                        </div>
                                      </div>
                                    )}
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
                            <button type="submit" className="btn-submit">
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