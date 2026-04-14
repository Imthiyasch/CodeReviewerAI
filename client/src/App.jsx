import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import React, { useEffect, useState } from 'react'
import api from './lib/api'
import useAuthStore from './store/authStore'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Review from './pages/Review'
import History from './pages/History'
import Admin from './pages/Admin'
import AuthCallback from './pages/AuthCallback'
import Layout from './components/Layout'

const ADMIN_EMAILS = ['imthiranu@gmail.com', 'goatbotcrowx@gmail.com', 'knowledgetest013@gmail.com', 'noorirafi.nr@gmail.com']

function AdminRoute({ children }) {
  const { user, token, setAuth } = useAuthStore()
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!token) { setChecking(false); return }
    api.get('/auth/me')
      .then((res) => {
        const freshUser = res.data?.user
        if (freshUser) {
          setAuth(freshUser, token)
          setIsAdmin(freshUser.isAdmin || ADMIN_EMAILS.includes(freshUser.email))
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [token]) // eslint-disable-line

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0e15]">
        <div className="w-10 h-10 border-2 border-[#ff7845] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return isAdmin ? children : <Navigate to="/app/dashboard" replace />
}

function ProtectedRoute({ children }) {
  const { token, setAuth } = useAuthStore()

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => { if (res.data?.user) setAuth(res.data.user, token) })
        .catch(() => {})
    }
  }, [token]) // eslint-disable-line

  return token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1207',
            color: '#fff',
            border: '1px solid rgba(255,120,69,0.25)',
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
