import React from 'react';
import { Link, useParams } from 'react-router-dom';

const AdminCandidatureDetail = () => {
  const { id } = useParams();

  return (
    <div className="admin-candidature-detail-container">
      <div className="container">
        <h1>Détail de la candidature (Admin)</h1>
        <p>Détails de la candidature #{id} (en développement)</p>
        <div className="admin-actions">
          <Link to="/admin/candidatures" className="btn btn-primary">
            Retour à la liste
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminCandidatureDetail; 