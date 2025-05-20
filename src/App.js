import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './context/AuthContext';

// Layouts
import Navbar from './components/Navbar';

// Pages publiques
// import Home from './pages/Home'; // Suppression de l'importation de Home
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';

// Pages privées
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CandidatureList from './pages/candidatures/CandidatureList';
import CandidatureForm from './pages/candidatures/CandidatureForm';
import CandidatureDetail from './pages/candidatures/CandidatureDetail';

// Pages administrateur
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCandidatureList from './pages/admin/AdminCandidatureList';
import AdminCandidatureDetail from './pages/admin/AdminCandidatureDetail';
import AdminUserList from './pages/admin/AdminUserList';
import AdminUserForm from './pages/admin/AdminUserForm';
import AdminEmailTemplateList from './pages/admin/AdminEmailTemplateList';
import AdminEmailTemplateEdit from './pages/admin/AdminEmailTemplateEdit';

// Pages évaluateur
import EvaluationList from './pages/evaluations/EvaluationList';
import EvaluationForm from './pages/evaluations/EvaluationForm';

// Routes protégées
import ProtectedRoute from './components/ProtectedRoute';

// Import du nouveau composant de redirection
import RootRedirect from './components/RootRedirect';

// Composant de redirection pour déboguer
const CandidatureFormWrapper = (props) => {
  console.log('CandidatureForm Wrapper appelé avec props:', props);
  return <CandidatureForm {...props} />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Routes protégées pour tous les utilisateurs authentifiés */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/candidatures" element={<CandidatureList />} />
                <Route path="/candidatures/new" element={<CandidatureForm />} />
                <Route path="/candidatures/:id" element={<CandidatureDetail />} />
                <Route path="/candidatures/:id/edit" element={<CandidatureFormWrapper />} />
              </Route>

              {/* Routes protégées pour les administrateurs */}
              <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/candidatures" element={<AdminCandidatureList />} />
                <Route path="/admin/candidatures/:id" element={<AdminCandidatureDetail />} />
                <Route path="/admin/users" element={<AdminUserList />} />
                <Route path="/admin/users/new" element={<AdminUserForm />} />
                <Route path="/admin/users/:id" element={<AdminUserForm />} />
                <Route path="/admin/email-templates" element={<AdminEmailTemplateList />} />
                <Route path="/admin/email-templates/edit/:templateId" element={<AdminEmailTemplateEdit />} />
              </Route>

              {/* Routes protégées pour les évaluateurs */}
              <Route element={<ProtectedRoute requiredRoles={['evaluateur', 'admin']} />}>
                <Route path="/evaluations" element={<EvaluationList />} />
                <Route path="/evaluations/:id" element={<EvaluationForm />} />
              </Route>

              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </Router>
  );
}

export default App; 