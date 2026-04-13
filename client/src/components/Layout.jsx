import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Code2, History, LogOut, Zap, Menu, ChevronRight, Sun, Moon, Shield
} from 'lucide-react'
import { useState, useEffect } from 'react'
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

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    clearAuth()
    toast.success('Signed out')
    navigate('/')
  }

  const isUserAdmin = user?.isAdmin || ['imthiranu@gmail.com', 'goatbotcrowx@gmail.com', 'knowledgetest013@gmail.com'].includes(user?.email)

  const displayedNavItems = isUserAdmin 
    ? [...navItems, { to: '/app/admin', icon: Shield, label: 'Admin Panel' }]
    : navItems

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 bg-[rgba(255,255,255,0.92)] dark:bg-[#0f1117]/95 backdrop-blur-xl border-r border-[#1a1207]/8 dark:border-white/[0.06] ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'}`}
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
          {displayedNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive ? 'bg-[#1a1207] text-white shadow-md dark:bg-white dark:text-[#1a1207]' : 'text-[#6b5c4e] hover:bg-[#1a1207]/5 hover:text-[#1a1207] dark:text-[#a19a91] dark:hover:text-[#f0ece4] dark:hover:bg-white/10'}`}
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={2.5} />
                  <span>{label}</span>
                  {isActive && (
                    <ChevronRight size={14} strokeWidth={3} className="ml-auto opacity-60" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 m-4 bg-white/80 dark:bg-[#13151c] rounded-2xl border border-[#1a1207]/5 dark:border-white/[0.07] shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ff6b35&color=fff`}
              alt={user?.name}
              className="w-10 h-10 rounded-full ring-2 ring-[var(--gradient-hot)]/30"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <p className="text-sm font-bold text-[#1a1207] dark:text-[#e8e9f0] truncate">{user?.name}</p>
                {isUserAdmin && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#ff7845]/10 text-[#ff7845] text-[9px] font-black uppercase tracking-wider border border-[#ff7845]/20">Admin</span>
                )}
              </div>
              <p className="text-xs text-[#6b5c4e] dark:text-[#7b8098] truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2 text-sm font-semibold text-[#6b5c4e] bg-[#f0ece4] hover:bg-[#e4ddd4] transition-colors rounded-xl dark:bg-[#1a1207] dark:text-[#a19a91] dark:hover:bg-[#2a221f]"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors rounded-xl dark:bg-red-500/10 dark:hover:bg-red-500/20"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
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
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 lg:hidden bg-white/80 dark:bg-[#0f1117]/90 backdrop-blur-xl border-b border-[#1a1207]/5 dark:border-white/[0.06]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#1a1207] dark:text-[#e8e9f0] hover:opacity-70 transition-opacity">
            <Menu size={24} />
          </button>
          <span className="font-['Playfair_Display'] font-black text-xl tracking-tight text-[#1a1207] dark:text-[#e8e9f0]">
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
