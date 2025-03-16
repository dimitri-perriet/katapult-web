import React from 'react';
import { Link } from 'react-router-dom';

const AdminCandidatureList = () => {
  return (
    <div className="admin-candidature-list-container">
      <div className="container">
        <h1>Gestion des Candidatures</h1>
        <p>Liste des candidatures (admin) - en développement</p>
        <Link to="/admin/dashboard" className="btn btn-primary">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default AdminCandidatureList; 