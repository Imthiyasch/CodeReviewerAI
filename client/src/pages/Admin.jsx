import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Code2, AlertTriangle, CheckCircle2, Activity,
  Trash2, RefreshCw, Shield, TrendingUp, Clock
} from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color, bg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-[#111520] rounded-2xl p-6 border border-black/5 dark:border-white/[0.06] shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform"
    >
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity`} style={{ background: color }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={22} style={{ color }} strokeWidth={2.5} />
        </div>
      </div>
      <div className="text-3xl font-black text-[#1a1207] dark:text-white mb-1 font-['Playfair_Display']">
        {value ?? '—'}
      </div>
      <div className="text-sm font-semibold text-[#6b5c4e] dark:text-[#6b7280]">{label}</div>
    </motion.div>
  )
}

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('reviews')
  const [deletingId, setDeletingId] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/admin/stats?t=${Date.now()}`)
      setStats(data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load admin stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return
    setDeletingId(id)
    try {
      await api.delete(`/api/admin/review/${id}`)
      toast.success('Review deleted')
      setStats((s) => ({
        ...s,
        recentReviews: s.recentReviews.filter((r) => r.id !== id),
        totalReviews: s.totalReviews - 1,
      }))
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#ff7845] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#6b5c4e] dark:text-[#6b7280]">Loading admin data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-3">
            <Shield size={13} className="text-red-500" />
            <span className="text-xs font-black text-red-500 uppercase tracking-wider">Admin Access</span>
          </div>
          <h1 className="text-4xl font-black text-[#1a1207] dark:text-white font-['Playfair_Display'] tracking-tight">
            System Administration
          </h1>
          <p className="text-[#6b5c4e] dark:text-[#6b7280] mt-2 font-medium">
            Real-time telemetry and user management dashboard.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#111520] border border-black/5 dark:border-white/[0.06] text-sm font-bold text-[#1a1207] dark:text-white hover:-translate-y-0.5 transition-all shadow-sm"
        >
          <RefreshCw size={15} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="#3b82f6" bg="#eff6ff" delay={0} />
        <StatCard icon={Code2} label="Total Reviews" value={stats?.totalReviews} color="#ff7845" bg="#fff7f5" delay={0.08} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.completedReviews} color="#10b981" bg="#f0fdf4" delay={0.16} />
        <StatCard icon={AlertTriangle} label="Failed" value={stats?.failedReviews} color="#ef4444" bg="#fef2f2" delay={0.24} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-xl w-fit bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
        {[
          { id: 'reviews', label: 'Recent Reviews', icon: Activity },
          { id: 'users', label: 'All Users', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-[#111520] text-[#1a1207] dark:text-white shadow-sm'
                : 'text-[#6b5c4e] dark:text-[#6b7280] hover:text-[#1a1207] dark:hover:text-white'
            }`}
          >
            <Icon size={15} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      {activeTab === 'reviews' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111520] rounded-2xl border border-black/5 dark:border-white/[0.06] shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-black/5 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1a1207] dark:text-white font-['Playfair_Display']">Recent Reviews</h2>
              <p className="text-sm text-[#6b5c4e] dark:text-[#6b7280] mt-0.5">Last 20 code reviews across all users</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#ff7845]/10 text-[#ff7845] text-sm font-bold border border-[#ff7845]/20">
              {stats?.recentReviews?.length ?? 0} entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">User</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">Language</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">Score</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">Date</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentReviews?.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t border-black/5 dark:border-white/[0.04] hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.name || 'U')}&background=ff7845&color=fff`}
                          className="w-8 h-8 rounded-full ring-1 ring-black/10"
                          alt={r.user?.name}
                        />
                        <div>
                          <p className="text-sm font-bold text-[#1a1207] dark:text-white">{r.user?.name}</p>
                          <p className="text-xs text-[#6b5c4e] dark:text-[#6b7280]">{r.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/[0.07] text-xs font-bold text-[#1a1207] dark:text-white uppercase">
                        {r.language}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-[#ff7845]">
                        {r.result?.quality?.score ?? '—'}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        r.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                          : r.status === 'failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#6b5c4e] dark:text-[#6b7280]">
                        <Clock size={12} />
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-40"
                        title="Delete review"
                      >
                        {deletingId === r.id
                          ? <RefreshCw size={13} className="animate-spin" />
                          : <Trash2 size={13} strokeWidth={2.5} />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentReviews || stats.recentReviews.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#6b5c4e] dark:text-[#6b7280] font-medium">
                      No reviews yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#111520] rounded-2xl border border-black/5 dark:border-white/[0.06] shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-black/5 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1a1207] dark:text-white font-['Playfair_Display']">All Users</h2>
              <p className="text-sm text-[#6b5c4e] dark:text-[#6b7280] mt-0.5">Every registered account on the platform</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-500/20">
              {stats?.allUsers?.length ?? 0} users
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">User</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">Role</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[#6b5c4e] dark:text-[#6b7280]">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats?.allUsers?.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-black/5 dark:border-white/[0.04] hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=3b82f6&color=fff`}
                          className="w-9 h-9 rounded-full ring-1 ring-black/10"
                          alt={u.name}
                        />
                        <div>
                          <p className="text-sm font-bold text-[#1a1207] dark:text-white">{u.name}</p>
                          <p className="text-xs text-[#6b5c4e] dark:text-[#6b7280]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {['imthiranu@gmail.com', 'goatbotcrowx@gmail.com', 'knowledgetest013@gmail.com', 'noorirafi.nr@gmail.com'].includes(u.email) ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#ff7845]/10 text-[#ff7845] border border-[#ff7845]/20">Admin</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-black/5 dark:bg-white/[0.07] text-[#6b5c4e] dark:text-[#6b7280]">User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6b5c4e] dark:text-[#6b7280]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
