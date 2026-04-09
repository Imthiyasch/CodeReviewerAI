import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Code2, History, LogOut, Zap, Menu, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import api from '../lib/api'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/review', icon: Code2, label: 'New Review' },
  { to: '/app/history', icon: History, label: 'History' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    clearAuth()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 bg-[rgba(255,255,255,0.85)] backdrop-blur-xl border-r border-[#1a1207]/5 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--gradient-hot)] to-[var(--gradient-warm)] shadow-md shadow-[#ff6b35]/20">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-['Playfair_Display'] font-black text-2xl tracking-tight text-[#1a1207]">
            CR<span className="text-[var(--gradient-hot)]">42</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive ? 'bg-[#1a1207] text-white shadow-md' : 'text-[#6b5c4e] hover:bg-[#1a1207]/5 hover:text-[#1a1207]'}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} strokeWidth={2.5} />
              <span>{label}</span>
              {({ isActive }) => isActive && (
                <ChevronRight size={14} strokeWidth={3} className="ml-auto opacity-60" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 m-4 bg-white rounded-2xl border border-[#1a1207]/5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff6b35&color=fff`}
              alt={user?.name}
              className="w-10 h-10 rounded-full ring-2 ring-[var(--gradient-hot)]/20"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1a1207] truncate">{user?.name}</p>
              <p className="text-xs text-[#6b5c4e] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors rounded-xl"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#1a1207]/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 lg:hidden bg-white/80 backdrop-blur-xl border-b border-[#1a1207]/5">
          <button onClick={() => setSidebarOpen(true)} className="text-[#1a1207] hover:opacity-70 transition-opacity">
            <Menu size={24} />
          </button>
          <span className="font-['Playfair_Display'] font-black text-xl tracking-tight text-[#1a1207]">
            CR<span className="text-[var(--gradient-hot)]">42</span>
          </span>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
