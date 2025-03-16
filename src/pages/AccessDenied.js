import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
  return (
    <div className="access-denied-container">
      <div className="container text-center">
        <h1>Accès Refusé</h1>
        <p>
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <Link to="/" className="btn btn-primary mt-3">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied; 