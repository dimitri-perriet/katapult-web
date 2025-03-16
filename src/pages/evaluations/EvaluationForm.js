import React from 'react';
import { Link, useParams } from 'react-router-dom';

const EvaluationForm = () => {
  const { id } = useParams();

  return (
    <div className="evaluation-form-container">
      <div className="container">
        <h1>Évaluation de candidature</h1>
        <p>Formulaire d'évaluation pour la candidature #{id} (en développement)</p>
        <Link to="/evaluations" className="btn btn-primary">
          Retour aux évaluations
        </Link>
      </div>
    </div>
  );
};

export default EvaluationForm; 