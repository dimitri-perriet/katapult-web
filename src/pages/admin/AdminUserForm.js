import React from 'react';
import { Link, useParams } from 'react-router-dom';

const AdminUserForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  return (
    <div className="admin-user-form-container">
      <div className="container">
        <h1>{isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h1>
        <p>Formulaire utilisateur {isEditMode ? `#${id}` : ''} (en développement)</p>
        <Link to="/admin/users" className="btn btn-primary">
          Retour à la liste
        </Link>
      </div>
    </div>
  );
};

export default AdminUserForm; 