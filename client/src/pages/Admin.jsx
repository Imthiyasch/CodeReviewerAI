import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Code2, AlertTriangle, Activity } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => {
        toast.error('Failed to load admin stats')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[var(--gradient-hot)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Total Reviews', value: stats.totalReviews, icon: Code2, color: 'text-[var(--gradient-hot)]' },
    { title: 'Failed Reviews', value: stats.failedReviews, icon: AlertTriangle, color: 'text-red-500' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black font-['Playfair_Display'] text-[var(--text-dark)] flex items-center gap-3">
          <Activity className="text-[var(--gradient-hot)]" />
          System Telemetry
        </h1>
        <p className="text-[var(--text-muted)] mt-2">Internal admin dashboard restricted to authorized personnel.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white border border-[var(--text-dark)]/5 shadow-sm flex items-center justify-between dark:bg-[#1a1207] dark:border-white/10"
          >
            <div>
              <p className="text-sm font-bold text-[var(--text-muted)]">{s.title}</p>
              <p className="text-3xl font-black text-[var(--text-dark)] mt-1">{s.value}</p>
            </div>
            <div className={`p-4 rounded-xl bg-opacity-10 ${s.color.replace('text-', 'bg-')}`}>
              <s.icon className={s.color} size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--text-dark)]/5 shadow-sm overflow-hidden dark:bg-[#1a1207] dark:border-white/10">
        <div className="p-6 border-b border-[var(--text-dark)]/5 dark:border-white/10">
          <h2 className="text-xl font-bold text-[var(--text-dark)]">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--text-dark)]/5 dark:bg-white/5">
                <th className="p-4 text-sm font-bold text-[var(--text-muted)]">User</th>
                <th className="p-4 text-sm font-bold text-[var(--text-muted)]">Language</th>
                <th className="p-4 text-sm font-bold text-[var(--text-muted)]">Status</th>
                <th className="p-4 text-sm font-bold text-[var(--text-muted)]">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReviews.map((r) => (
                <tr key={r.id} className="border-b border-[var(--text-dark)]/5 dark:border-white/10 last:border-0 hover:bg-[var(--text-dark)]/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={r.user.avatar || `https://ui-avatars.com/api/?name=${r.user.name}`} className="w-8 h-8 rounded-full" alt="avatar" />
                      <span className="font-bold text-[var(--text-dark)] text-sm">{r.user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-muted)]">{r.language}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'completed' ? 'bg-green-100 text-green-700' : r.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--text-muted)] whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {stats.recentReviews.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">
                    No recent activity.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
