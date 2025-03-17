import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, userRole, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img
            src="/assets/images/general/logo_katapult_bc.png"
            alt="Katapult"
            className="navbar-logo-img"
          />
        </Link>

        <div className="navbar-mobile-toggle" onClick={toggleMobileMenu}>
          <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}></span>
        </div>

        <ul className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Accueil
            </Link>
          </li>

          <li className="navbar-item">
            <Link to="https://adress-normandie.org/etre-incube-par-katapult/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Le Programme
            </Link>
          </li>

          {!isAuthenticated && (
            <li className="navbar-item">
              <Link to="/register" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                Candidater
            </Link>
          </li>
          )}

          {isAuthenticated && (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                  Tableau de bord
                </Link>
              </li>

              <li className="navbar-item">
                <Link
                  to="/candidatures"
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mes Candidatures
                </Link>
              </li>
              
              {/* Liens spécifiques aux administrateurs */}
              {userRole === 'admin' && (
                <>
                  <li className="navbar-item">
                    <Link
                      to="/admin/candidatures"
                      className="navbar-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Gestion Candidatures
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link
                      to="/admin/users"
                      className="navbar-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Gestion Utilisateurs
                    </Link>
                  </li>
                </>
              )}
              
              {/* Liens spécifiques aux évaluateurs */}
              {userRole === 'evaluateur' && (
                <li className="navbar-item">
                  <Link
                    to="/evaluations"
                    className="navbar-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Évaluations
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        <div className={`navbar-auth ${mobileMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <div className="navbar-user-info">
                <span className="navbar-user-name">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <div className="navbar-user-dropdown">
                  <Link to="/profile" className="navbar-dropdown-item">
                    Mon profil
                  </Link>
                  <button
                    className="navbar-dropdown-item navbar-logout-btn"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-login-btn">
                Connexion
              </Link>
              <Link to="/register" className="navbar-register-btn">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 