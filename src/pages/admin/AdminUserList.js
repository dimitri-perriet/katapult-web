import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import authService from '../../services/authService';
import './AdminUserList.css';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    // Récupérer l'utilisateur courant connecté
    const loggedInUser = authService.getCurrentUser();
    if (loggedInUser && loggedInUser.user) {
      setCurrentUser(loggedInUser.user);
    } else if (loggedInUser) {
      setCurrentUser(loggedInUser);
    }
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      if (Array.isArray(data)) {
        // Filtrer par rôle si le filtre est actif
        const filteredUsers = filters.role 
          ? data.filter(user => user.role === filters.role)
          : data;
        setUsers(filteredUsers);
      } else {
        setUsers([]);
        console.error('Format de données inattendu:', data);
      }
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
      toast.error('Impossible de charger la liste des utilisateurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Empêcher la suppression de son propre compte
    if (currentUser && userId === currentUser.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('Utilisateur supprimé avec succès');
        fetchUsers(); // Rafraîchir la liste
      } catch (err) {
        toast.error('Erreur lors de la suppression de l\'utilisateur');
        console.error(err);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEditRole = (userId) => {
    setEditingUser(userId);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingRole(true);
      await userService.updateUser(userId, { role: newRole });
      toast.success('Rôle modifié avec succès');
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      toast.error('Erreur lors de la modification du rôle');
      console.error(err);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Vérifier si l'utilisateur est l'utilisateur courant
  const isCurrentUser = (userId) => {
    return currentUser && userId === currentUser.id;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Obtenir la classe CSS du badge de rôle
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'status-badge status-accepted';
      case 'evaluateur': return 'status-badge status-review';
      case 'candidat': return 'status-badge status-submitted';
      default: return 'status-badge';
    }
  };

  // Obtenir le libellé du rôle
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'evaluateur': return 'Évaluateur';
      case 'candidat': return 'Candidat';
      default: return role;
    }
  };

  return (
    <div className="admin-dashboard admin-dashboard-gestion-users">
      <div className="dashboard-header">
        <h1>Gestion des Utilisateurs</h1>
        <div className="dashboard-actions">
          <Link to="/admin/users/new" className="btn btn-primary">
            <i className="fas fa-plus"></i> Ajouter un utilisateur
          </Link>
          <Link to="/admin/dashboard" className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Retour au tableau de bord
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-item">
            <label htmlFor="role">Rôle</label>
            <select 
              id="role" 
              name="role" 
              className="filter-select"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="evaluateur">Évaluateur</option>
              <option value="candidat">Candidat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Styles CSS en ligne pour les badges de statut */}
      <style>
        {`
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            color: white;
          }
          .status-draft {
            background-color: #6c757d;
          }
          .status-submitted {
            background-color: #0d6efd;
          }
          .status-review {
            background-color: #ffc107;
            color: #212529;
          }
          .status-accepted {
            background-color: #198754;
          }
          .status-rejected {
            background-color: #dc3545;
          }
          .btn-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #f8f9fa;
            color: #0d6efd;
            text-decoration: none;
            margin-right: 8px;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .btn-action:hover {
            background-color: #0d6efd;
            color: white;
          }
          .btn-action.delete {
            color: #dc3545;
          }
          .btn-action.delete:hover {
            background-color: #dc3545;
            color: white;
          }
          .btn-action:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .btn-action:disabled:hover {
            background-color: #f8f9fa;
            color: #0d6efd;
          }
          .btn-action.delete:disabled:hover {
            background-color: #f8f9fa;
            color: #dc3545;
          }
          .email-link {
            color: #0d6efd;
            text-decoration: none;
          }
          .email-link:hover {
            text-decoration: underline;
          }
          .role-select {
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid #ced4da;
            min-width: 140px;
          }
          .role-edit-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
          }
          .role-edit-actions button {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-save {
            background-color: #198754;
            color: white;
          }
          .btn-save:hover {
            background-color: #146c43;
          }
          .btn-cancel {
            background-color: #6c757d;
            color: white;
          }
          .btn-cancel:hover {
            background-color: #5c636a;
          }
          .user-self {
            position: relative;
          }
          .user-self:after {
            content: '(Vous)';
            margin-left: 5px;
            font-size: 12px;
            color: #6c757d;
            font-style: italic;
          }
        `}
      </style>

      {/* Affichage des utilisateurs */}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading">Chargement des données...</div>
      ) : users.length === 0 ? (
        <div className="alert alert-info">Aucun utilisateur trouvé.</div>
      ) : (
        <div className="dashboard-section">
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className={isCurrentUser(user.id) ? "user-self" : ""}>
                      <strong>{`${user.firstName || ''} ${user.lastName || ''}`}</strong>
                    </td>
                    <td><a href={`mailto:${user.email}`} className="email-link">{user.email}</a></td>
                    <td>
                      {editingUser === user.id ? (
                        <div>
                          <select 
                            className="role-select"
                            defaultValue={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={updatingRole}
                          >
                            <option value="admin">Administrateur</option>
                            <option value="evaluateur">Évaluateur</option>
                            <option value="candidat">Candidat</option>
                          </select>
                          <div className="role-edit-actions">
                            <button 
                              className="btn-cancel"
                              onClick={handleCancelEdit}
                              disabled={updatingRole}
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={getRoleBadgeClass(user.role)}>
                          {getRoleLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {editingUser !== user.id && (
                        <>
                          <button
                            className="btn-action"
                            title={isCurrentUser(user.id) ? "Vous ne pouvez pas modifier votre propre rôle" : "Modifier le rôle"}
                            onClick={() => handleEditRole(user.id)}
                            disabled={isCurrentUser(user.id)}
                          >
                            <i className="fas fa-user-edit"></i>
                          </button>
                          <button
                            className="btn-action delete"
                            title={isCurrentUser(user.id) ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"}
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={isCurrentUser(user.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
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

export default AdminUserList; 