import React from 'react';
import { Link } from 'react-router-dom';

const EvaluationList = () => {
  return (
    <div className="evaluation-list-container">
      <div className="container">
        <h1>Mes Évaluations</h1>
        <p>Liste des évaluations à compléter (en développement)</p>
        <Link to="/dashboard" className="btn btn-primary">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default EvaluationList; 