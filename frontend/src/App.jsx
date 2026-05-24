import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateIssue from './pages/CreateIssue';
import MyIssues from './pages/MyIssues';
import IssueDetail from './pages/IssueDetail';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

      {/* Protected routes inside AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/issues" element={<MyIssues />} />
        <Route path="/issues/new" element={
          <ProtectedRoute roles={['student']}>
            <CreateIssue />
          </ProtectedRoute>
        } />
        <Route path="/issues/:ticketId" element={<IssueDetail />} />
        <Route path="/analytics" element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <Analytics />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1b1d21',
              color: '#f5f3ef',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
