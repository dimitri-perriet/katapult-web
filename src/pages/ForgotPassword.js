import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="forgot-password-container">
      <div className="container">
        <h1>Récupération de mot de passe</h1>
        <p>Page de récupération de mot de passe (en développement)</p>
        <Link to="/login" className="btn btn-primary">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword; 