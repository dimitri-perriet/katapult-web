import React from 'react';
import { Link, useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  
  return (
    <div className="reset-password-container">
      <div className="container">
        <h1>Réinitialisation du mot de passe</h1>
        <p>Page de réinitialisation de mot de passe pour le token: {token}</p>
        <p>(en développement)</p>
        <Link to="/login" className="btn btn-primary">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword; 