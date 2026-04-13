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
        const user = res.data?.user || res.data
        if (!user) throw new Error('No user data in response')
        setAuth(user, token)
        navigate('/app/dashboard')
        toast.success(`Welcome back, ${user.name || 'User'}!`)
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || err?.response?.status || err?.message || 'Network error'
        toast.error(`Auth failed: ${msg}`)
        console.error('[AuthCallback error]', err?.response?.data, err?.message)
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
