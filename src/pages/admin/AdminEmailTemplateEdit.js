import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import emailTemplateService from '../../services/emailTemplateService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminUserList.css';
import './AdminEmailTemplateEdit.css';

const AdminEmailTemplateEdit = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [bodyContent, setBodyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const availablePlaceholders = [
    { name: '{{firstName}}', description: "Prénom de l'utilisateur (ex: Jean)." },
    { name: '{{lastName}}', description: "Nom de famille de l'utilisateur (ex: Dupont)." },
    { name: '{{userEmail}}', description: "Adresse email complète de l'utilisateur (ex: jean.dupont@example.com)." },
    { name: '{{applicationName}}', description: "Nom ou titre de la candidature concernée." },
    { name: '{{applicationStatus}}', description: "Nouveau statut de la candidature (ex: Acceptée, Non retenue, En évaluation)." },
    { name: '{{applicationLink}}', description: "Lien URL direct pour visualiser la candidature." },
    { name: '{{submissionDate}}', description: "Date de soumission initiale de la candidature (format: JJ/MM/AAAA)." },
    { name: '{{adminNotes}}', description: "Notes ou commentaires optionnels de l'administrateur (utilisé par exemple lors d'un rejet ou d'un retour en brouillon)." }
  ];

  // Configuration des modules de ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'], // 'image' retiré pour l'instant pour simplicité
      [{ 'color': [] }, { 'background': [] }], // Sélecteurs de couleur
      // [{ 'font': [] }], // Optionnel: Sélecteur de police
      [{ 'align': [] }], // Options d'alignement
      ['clean'] // Bouton pour retirer le formatage
    ],
  };

  const fetchTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Réinitialiser l'erreur au début du chargement
      const data = await emailTemplateService.getTemplateById(templateId);
      if (data) {
        setTemplate(data);
        setFormData({
          subject: data.subject || '',
          description: data.description || ''
        });
        setBodyContent(data.body || '');
      } else {
        setError('Template non trouvé.');
        toast.error('Impossible de charger le template demandé.');
      }
    } catch (err) {
      console.error('Erreur fetchTemplate:', err);
      setError('Erreur lors du chargement du template.');
      toast.error('Erreur lors du chargement du template.');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleQuillChange = (content) => {
    setBodyContent(content);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await emailTemplateService.updateTemplate(templateId, {
        subject: formData.subject,
        body: bodyContent,
        description: formData.description
      });
      toast.success('Template sauvegardé avec succès !');
      navigate('/admin/email-templates');
    } catch (err) {
      console.error('Erreur handleSubmit updateTemplate:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde du template.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Chargement du template...</div>;
  // Afficher l'erreur même si le template est partiellement chargé, ou si le chargement a échoué avant
  if (error && !template && !loading) return <div className="alert alert-danger">{error} <Link to="/admin/email-templates">Retour à la liste</Link></div>;
  if (!template && !loading) return <div className="alert alert-warning">Template non trouvé. <Link to="/admin/email-templates">Retour à la liste</Link></div>;
  // Si le template est null après le chargement et sans erreur explicite, c'est aussi un cas de template non trouvé.
  if (!template) return <div className="loading">Chargement initial ou template introuvable...</div>; 


  return (
    <div className="admin-dashboard admin-email-template-edit">
      <div className="dashboard-header">
        <h1>Modifier le Template: <span className="template-name-highlight">{template?.name || 'Chargement...'}</span></h1>
        <div className="dashboard-actions">
          <Link to="/admin/email-templates" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Retour à la liste
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger feedback-message">{error}</div>}

      <div className="edit-template-layout">
        <form onSubmit={handleSubmit} className="form-container entity-form template-form">
          <div className="form-section card">
            <h2 className="card-header">Détails du Template</h2>
            <div className="card-body">
              <div className="form-group form-group-name-id">
                <label htmlFor="name">Nom (Identifiant)</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={template.name}
                  readOnly
                  className="form-control-plaintext"
                />
                <small className="form-text text-muted">L'identifiant unique du template, non modifiable.</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="form-control"
                  placeholder="Décrivez brièvement le but et le contexte d'utilisation de ce template..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Sujet de l'Email</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Sujet qui apparaîtra dans l'email..."
                />
              </div>
            </div>
          </div>

          <div className="form-section card">
            <h2 className="card-header">Corps de l'Email (HTML)</h2>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="body">Contenu Principal</label>
                <ReactQuill
                  theme="snow"
                  value={bodyContent}
                  onChange={handleQuillChange}
                  modules={quillModules}
                  className="quill-editor"
                  placeholder="Rédigez le contenu de l'email ici. Utilisez les placeholders listés à droite pour personnaliser le message."
                />
              </div>
            </div>
          </div>

          <div className="form-actions sticky-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || loading}>
              {saving ? (
                <><i className="fas fa-spinner fa-spin"></i> Sauvegarde en cours...</>
              ) : (
                <><i className="fas fa-save"></i> Sauvegarder les modifications</>
              )}
            </button>
            <Link to="/admin/email-templates" className="btn btn-outline-secondary">
              Annuler
            </Link>
          </div>
        </form>

        <aside className="placeholders-sidebar card">
          <h2 className="card-header">Placeholders Disponibles</h2>
          <div className="card-body">
            <p className="text-muted small mb-3">
              Cliquez sur un placeholder pour le copier et collez-le dans le sujet ou le corps de l'email.
            </p>
            <ul className="list-group list-group-flush">
              {availablePlaceholders.map(p => (
                <li key={p.name} className="list-group-item placeholder-item" onClick={() => navigator.clipboard.writeText(p.name).then(() => toast.info(`"${p.name}" copié !`))}>
                  <span className="placeholder-name">{p.name}</span>
                  <p className="placeholder-description">{p.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminEmailTemplateEdit; 