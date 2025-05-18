import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext'; // Bien que forgotPassword soit dans authService, useAuth peut être utilisé pour d'autres hooks si besoin, ou pour la cohérence.
import authService from '../services/authService';
import './ForgotPassword.css'; // Assurez-vous que ce fichier CSS existe ou créez-le

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccessMessage('');
      setLoading(true);
      
      // Utilisation directe de authService.forgotPassword ici
      const response = await authService.forgotPassword(values.email);
      setSuccessMessage(response.message || 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.');

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de la demande de réinitialisation.'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-header">
          <h2>Mot de passe oublié ?</h2>
          <p>Entrez votre adresse email pour recevoir les instructions de réinitialisation.</p>
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
              <Form className="forgot-password-form">
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

                <button
                  type="submit"
                  className="btn btn-primary forgot-password-btn"
                  disabled={isSubmitting || loading}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer les instructions'}
                </button>
              </Form>
            )}
          </Formik>
        )}

        <div className="forgot-password-footer">
          <p>
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link to="/login" className="login-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 