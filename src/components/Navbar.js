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

        {/* Menu standard pour version desktop */}
        <ul className="navbar-menu desktop-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              Accueil
            </Link>
          </li>

          <li className="navbar-item">
            <Link to="https://adress-normandie.org/etre-incube-par-katapult/" className="navbar-link" target="_blank" rel="noopener noreferrer">
              Le Programme
            </Link>
          </li>

          {!isAuthenticated && (
            <li className="navbar-item">
              <Link to="/register" className="navbar-link">
                Candidater
              </Link>
            </li>
          )}

          {isAuthenticated && (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link">
                  Tableau de bord
                </Link>
              </li>

{/*               <li className="navbar-item">
                <Link
                  to="/candidatures"
                  className="navbar-link"
                >
                  Mes Candidatures
                </Link>
              </li> */}
              
              {/* Liens spécifiques aux administrateurs */}
              {userRole === 'admin' && (
                <>
                  <li className="navbar-item">
                    <Link
                      to="/admin/candidatures"
                      className="navbar-link"
                    >
                      Gestion Candidatures
                    </Link>
                  </li>
                  <li className="navbar-item">
                    <Link
                      to="/admin/users"
                      className="navbar-link"
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
                  >
                    Évaluations
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        {/* Version desktop des boutons d'authentification */}
        <div className="navbar-auth desktop-only">
          {isAuthenticated ? (
            <>
              <button
                className="navbar-logout-btn-visible"
                onClick={handleLogout}
                title="Se déconnecter"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="logout-text">Déconnexion</span>
              </button>
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

        {/* Contenu mobile avec l'ordre modifié */}
        <div className={`navbar-mobile-content ${mobileMenuOpen ? 'active' : ''}`}>
          {/* Boutons d'authentification en premier pour mobile */}
          <div className="navbar-auth-mobile">
            {isAuthenticated ? (
              <>
                <button
                  className="navbar-logout-btn-visible"
                  onClick={handleLogout}
                  title="Se déconnecter"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span className="logout-text">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-login-btn" onClick={() => setMobileMenuOpen(false)}>
                  Connexion
                </Link>
                <Link to="/register" className="navbar-register-btn" onClick={() => setMobileMenuOpen(false)}>
                  Inscription
                </Link>
              </>
            )}
          </div>
          
          <ul className="navbar-menu mobile-menu">
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                Accueil
              </Link>
            </li>

            <li className="navbar-item">
              <Link to="https://adress-normandie.org/etre-incube-par-katapult/" className="navbar-link" target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 