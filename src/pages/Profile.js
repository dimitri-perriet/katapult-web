import React from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="container">
        <h1>Mon Profil</h1>
        <p>Page de profil utilisateur (en développement)</p>
        <Link to="/dashboard" className="btn btn-primary">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default Profile; 