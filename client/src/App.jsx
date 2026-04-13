import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Review from './pages/Review'
import History from './pages/History'
import Admin from './pages/Admin'
import AuthCallback from './pages/AuthCallback'
import Layout from './components/Layout'

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  return user?.isAdmin ? children : <Navigate to="/app/dashboard" replace />
}

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1526',
            color: '#fff',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login/success" element={<AuthCallback />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="review" element={<Review />} />
          <Route path="review/:id" element={<Review />} />
          <Route path="history" element={<History />} />
          <Route path="admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
