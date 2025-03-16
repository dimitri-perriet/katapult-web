import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import '../assets/css/register.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Schéma de validation
  const validationSchema = Yup.object({
    firstName: Yup.string().required('Le prénom est requis'),
    lastName: Yup.string().required('Le nom est requis'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Le numéro de téléphone doit contenir 10 chiffres')
      .required('Le numéro de téléphone est requis'),
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
      )
      .required('Le mot de passe est requis'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
      .required('La confirmation du mot de passe est requise'),
    organization: Yup.string(),
    acceptTerms: Yup.boolean()
      .oneOf([true], 'Vous devez accepter les conditions d\'utilisation')
  });

  // Valeurs initiales du formulaire
  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
    acceptTerms: false
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      
      // Préparer les données à envoyer
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        organization: values.organization || undefined
      };
      
      // Appel à l'API d'inscription
      await register(userData);
      
      // Redirection vers la page de connexion avec un message de succès
      navigate('/login', { 
        state: { 
          message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' 
        } 
      });
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-header">
          <h2>Créer un compte</h2>
          <p>Inscrivez-vous pour soumettre votre candidature à Katapult</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="register-form">
              <div className="form-section">
                <h3 className="form-section-title">Informations personnelles</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom*</label>
                    <Field
                      type="text"
                      name="firstName"
                      id="firstName"
                      className={`form-control ${errors.firstName && touched.firstName ? 'is-invalid' : ''}`}
                      placeholder="Votre prénom"
                    />
                    <ErrorMessage name="firstName" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Nom*</label>
                    <Field
                      type="text"
                      name="lastName"
                      id="lastName"
                      className={`form-control ${errors.lastName && touched.lastName ? 'is-invalid' : ''}`}
                      placeholder="Votre nom"
                    />
                    <ErrorMessage name="lastName" component="div" className="form-error" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email*</label>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                      placeholder="Votre adresse email"
                    />
                    <ErrorMessage name="email" component="div" className="form-error" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Téléphone*</label>
                    <Field
                      type="tel"
                      name="phone"
                      id="phone"
                      className={`form-control ${errors.phone && touched.phone ? 'is-invalid' : ''}`}
                      placeholder="Votre numéro de téléphone"
                    />
                    <ErrorMessage name="phone" component="div" className="form-error" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="organization">Organisation (optionnel)</label>
                  <Field
                    type="text"
                    name="organization"
                    id="organization"
                    className="form-control"
                    placeholder="Nom de votre organisation si applicable"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Sécurité</h3>
                <div className="form-group">
                  <label htmlFor="password">Mot de passe*</label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                    placeholder="Créez un mot de passe sécurisé"
                  />
                  <ErrorMessage name="password" component="div" className="form-error" />
                  <div className="password-requirements">
                    <p>Votre mot de passe doit contenir :</p>
                    <ul>
                      <li>Au moins 8 caractères</li>
                      <li>Au moins une lettre majuscule</li>
                      <li>Au moins une lettre minuscule</li>
                      <li>Au moins un chiffre</li>
                      <li>Au moins un caractère spécial (@, $, !, %, *, ?, &)</li>
                    </ul>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe*</label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirmer votre mot de passe"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                </div>
              </div>

              <label className="checkbox-container">
                <Field type="checkbox" name="acceptTerms" />
                <span className="checkbox-label">
                  J'accepte les <Link to="/terms">conditions d'utilisation</Link> et la <Link to="/privacy">politique de confidentialité</Link> de Katapult
                </span>
              </label>
              <ErrorMessage name="acceptTerms" component="div" className="form-error" />

              <button
                type="submit"
                className="register-btn"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Inscription en cours...' : 'S\'inscrire'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="register-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="login-link">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 