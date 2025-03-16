import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="container">
          <h1>L'incubateur normand qui propulse votre projet d'entreprise innovante</h1>
          <p className="hero-text">
            Katapult accompagne les porteurs de projets d'Économie Sociale et Solidaire en Normandie
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Déposer ma candidature
            </Link>
            <Link to="/login" className="btn btn-outlined">
              Accéder à mon espace
            </Link>
          </div>
        </div>
      </div>

      <div className="about-section">
        <div className="container">
          <h2 className="section-title">Un parcours intensif et personnalisé</h2>
          <p className="section-subtitle">
            Le parcours d'incubation Katapult, porté par l'ADRESS, propose un accompagnement intensif et renforcé 
            aux porteurs de projets d'innovation sociale en Normandie.
          </p>
          <div className="about-content">
            <div className="about-text">
              <p>
                Lancé en 2018, Katapult est le premier incubateur du type sur le territoire régional et contribue au 
                développement d'une économie sociale, durable et territoriale.
              </p>
              <p>
                Notre programme d'accompagnement vous permet de bénéficier d'un soutien adapté à votre projet, 
                avec des formations, du mentorat et une mise en réseau efficace pour maximiser vos chances de réussite.
              </p>
              <Link to="/register" className="btn btn-primary">
                Candidater maintenant
              </Link>
            </div>
            <div className="about-image">
              <img src="/assets/images/general/katapult-acconpagnement.png" alt="Accompagnement Katapult" />
            </div>
          </div>
        </div>
      </div>

      <div className="key-points-section">
        <div className="container">
          <h2 className="section-title">Katapult en 7 points clés</h2>
          <div className="key-points-grid">
            <div className="key-point-card">
              <h3>Formations</h3>
              <p>
                Une dizaine de journées de formation animées par des experts de l'innovation sociale sur la posture entrepreneuriale, 
                la proposition de valeurs et le design thinking.
              </p>
            </div>
            <div className="key-point-card">
              <h3>Mentorat</h3>
              <p>
                Une mentor·e, chef·fe d'entreprise expérimenté·e pour vous conseiller, faciliter la mise en réseau et booster votre projet.
              </p>
            </div>
            <div className="key-point-card">
              <h3>Co-développement</h3>
              <p>
                Des séances de co-développement pour résoudre vos problématiques via l'intelligence collective.
              </p>
            </div>
            <div className="key-point-card">
              <h3>Expertise</h3>
              <p>
                Un pack expert vous permettant de mobiliser des heures de conseil sur la comptabilité, le droit des sociétés, la 
                digitalisation ou encore les ressources humaines.
              </p>
            </div>
            <div className="key-point-card">
              <h3>Promotion</h3>
              <p>
                Katapult, c'est aussi une promo pour partager ses expériences et compétences, l'intégration dans la communauté 
                des entrepreneur·es du changement.
              </p>
            </div>
            <div className="key-point-card">
              <h3>Événementiel</h3>
              <p>
                Participez à des événements exclusifs pour développer votre réseau et faire connaître votre projet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 