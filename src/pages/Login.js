import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupérer l'URL de redirection, sinon rediriger vers le tableau de bord
  const from = location.state?.from?.pathname || '/dashboard';

  // Récupérer un éventuel message de succès après une inscription réussie
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Nettoyer l'historique pour éviter que le message persiste lors des recharges
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Schéma de validation
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
    password: Yup.string()
      .required('Le mot de passe est requis'),
  });

  // Valeurs initiales du formulaire
  const initialValues = {
    email: '',
    password: '',
    rememberMe: false
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);
      
      await login(values.email, values.password);
      
      // Récupérer le rôle de l'utilisateur après la connexion
      const userRole = authService.getUserRole();

      // Redirection conditionnelle
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <h2>Connexion</h2>
          <p>Connectez-vous à votre compte Katapult</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  placeholder="Votre adresse email"
                />
                <ErrorMessage name="email" component="div" className="form-error" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  placeholder="Votre mot de passe"
                />
                <ErrorMessage name="password" component="div" className="form-error" />
              </div>

              <div className="form-group form-remember">
                <label className="checkbox-container">
                  <Field type="checkbox" name="rememberMe" />
                  <span className="checkmark"></span>
                  Se souvenir de moi
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary login-btn"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="login-footer">
          <p>
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="register-link">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 