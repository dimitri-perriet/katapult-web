import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import authService from '../services/authService';
import './ResetPassword.css'; // Assurez-vous que ce fichier CSS existe ou créez-le

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const initialValues = {
    password: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .required('Le mot de passe est requis'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
      .required('La confirmation du mot de passe est requise'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);

      const response = await authService.resetPassword(token, values.password);
      setSuccessMessage(response.message || 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.');
      
      // Optionnel: Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de la réinitialisation du mot de passe. Le lien peut être invalide ou expiré.'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <div className="reset-password-header">
          <h2>Réinitialiser votre mot de passe</h2>
          <p>Entrez votre nouveau mot de passe ci-dessous.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        {!successMessage && (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="reset-password-form">
                <div className="form-group">
                  <label htmlFor="password">Nouveau mot de passe</label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className="form-control"
                    placeholder="Votre nouveau mot de passe"
                  />
                  <ErrorMessage name="password" component="div" className="form-error" />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary reset-password-btn"
                  disabled={isSubmitting || loading}
                >
                  {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                </button>
              </Form>
            )}
          </Formik>
        )}

        {successMessage && (
          <div className="login-redirect-message">
            <p>
              <Link to="/login" className="btn btn-secondary">
                Aller à la page de connexion
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 