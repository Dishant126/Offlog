import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Teams from './pages/Teams'
import TeamDetail from './pages/TeamDetail'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Loader from './components/common/Loader'

function ProtectedPage({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Auth routes — full screen, no layout */}
      <Route path="/login"    element={!user ? <Login />    : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />

      {/* Protected routes — with sidebar + header layout */}
      <Route path="/dashboard" element={user ? <ProtectedPage><Dashboard /></ProtectedPage> : <Navigate to="/login" replace />} />
      <Route path="/teams"     element={user ? <ProtectedPage><Teams /></ProtectedPage>     : <Navigate to="/login" replace />} />
      <Route path="/teams/:teamId" element={user ? <ProtectedPage><TeamDetail /></ProtectedPage> : <Navigate to="/login" replace />} />
      <Route path="/profile"   element={user ? <ProtectedPage><Profile /></ProtectedPage>   : <Navigate to="/login" replace />} />
      <Route path="/admin"     element={
        user?.role === 'ADMIN'
          ? <ProtectedPage><AdminDashboard /></ProtectedPage>
          : user
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
      } />

      {/* Catch-all */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default App
