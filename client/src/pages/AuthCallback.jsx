import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      toast.error('Authentication failed')
      navigate('/')
      return
    }

    api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setAuth(res.data.user, token)
        toast.success(`Welcome back, ${res.data.user.name}!`)
        navigate('/app/dashboard')
      })
      .catch(() => {
        toast.error('Could not verify your session')
        navigate('/')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Completing sign-in…</p>
      </div>
    </div>
  )
}
