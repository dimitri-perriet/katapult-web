import React from 'react';
import { Link } from 'react-router-dom';

const AdminUserList = () => {
  return (
    <div className="admin-user-list-container">
      <div className="container">
        <h1>Gestion des Utilisateurs</h1>
        <p>Liste des utilisateurs (admin) - en développement</p>
        <Link to="/admin/users/new" className="btn btn-primary">
          Ajouter un utilisateur
        </Link>
        <Link to="/admin/dashboard" className="btn btn-secondary ml-2">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default AdminUserList; 