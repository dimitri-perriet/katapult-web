import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import emailTemplateService from '../../services/emailTemplateService';
import './AdminUserList.css'; // Réutiliser certains styles si applicable, ou créer un nouveau CSS

const AdminEmailTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await emailTemplateService.getAllTemplates();
      setTemplates(data || []);
      setError(null);
    } catch (err) {
      console.error('Erreur fetchTemplates:', err);
      setError('Erreur lors du chargement des templates d\'email.');
      toast.error('Impossible de charger la liste des templates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard admin-dashboard-gestion-templates">
      <div className="dashboard-header">
        <h1>Gestion des Templates d'Email</h1>
        <div className="dashboard-actions">
          {/* Optionnel: Bouton pour créer un nouveau template si l'API le permet facilement */}
          {/* <Link to="/admin/email-templates/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Ajouter un template
          </Link> */}
          <Link to="/admin/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Retour au tableau de bord
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Chargement des templates...</div>
      ) : templates.length === 0 && !error ? (
        <div className="alert alert-info">Aucun template d'email trouvé. Vous devrez peut-être les initialiser via la base de données ou des seeders.</div>
      ) : (
        <div className="dashboard-section">
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom (Identifiant)</th>
                  <th>Sujet</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr key={template.id}>
                    <td>{template.id}</td>
                    <td><strong>{template.name}</strong></td>
                    <td>{template.subject}</td>
                    <td>{template.description || '-'}</td>
                    <td>
                      <Link 
                        to={`/admin/email-templates/edit/${template.id}`}
                        className="btn btn-sm btn-outline-primary"
                        title="Modifier le template"
                      >
                        <i className="fas fa-edit"></i> Modifier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplateList; 