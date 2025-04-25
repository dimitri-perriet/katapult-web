import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import './AdminUserForm.css';

const AdminUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidat'
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(isEditMode);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoles();
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const rolesData = await userService.getRoles();
      setRoles(rolesData);
    } catch (err) {
      toast.error('Impossible de charger les rôles disponibles');
      console.error(err);
    }
  };

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const userData = await userService.getUserById(id);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        password: '',
        confirmPassword: '',
        role: userData.role || 'candidat'
      });
    } catch (err) {
      toast.error('Impossible de charger les informations de l\'utilisateur');
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.role) newErrors.role = 'Le rôle est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const dataToSubmit = { ...formData };
      
      // Si en mode édition et mot de passe vide, ne pas l'envoyer
      if (isEditMode && !dataToSubmit.password) {
        delete dataToSubmit.password;
        delete dataToSubmit.confirmPassword;
      } else {
        delete dataToSubmit.confirmPassword;
      }
      
      if (isEditMode) {
        await userService.updateUser(id, dataToSubmit);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await userService.createUser(dataToSubmit);
        toast.success('Utilisateur créé avec succès');
      }
      
      navigate('/admin/users');
    } catch (err) {
      const message = err.response?.data?.message || 'Une erreur est survenue';
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return <div className="container mt-5 text-center">Chargement des données utilisateur...</div>;
  }

  return (
    <div className="admin-user-form-container">
      <div className="container">
        <div className="card shadow">
          <div className="card-header">
            <h1>{isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h1>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="firstName">Prénom</label>
                    <input
                      type="text"
                      className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Prénom"
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="lastName">Nom</label>
                    <input
                      type="text"
                      className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Nom"
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="password">
                      {isEditMode ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mot de passe"
                    />
                    {errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmer le mot de passe"
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="role">Rôle</label>
                <select
                  className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="candidat">Candidat</option>
                      <option value="evaluateur">Évaluateur</option>
                      <option value="admin">Admin</option>
                    </>
                  )}
                </select>
                {errors.role && (
                  <div className="invalid-feedback">{errors.role}</div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <Link to="/admin/users" className="btn btn-secondary ml-2">
                  Annuler
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserForm; 