import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, TrendingUp, Bug, Shield, ArrowRight, Clock, Zap } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../lib/api'
import { getScoreColor, getScoreLabel, timeAgo, truncate } from '../lib/utils'

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white dark:bg-[#13151c] p-6 rounded-2xl shadow-sm border border-[#1a1207]/5 dark:border-white/[0.07] hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon size={22} style={{ color }} strokeWidth={2.5} />
        </div>
      </div>
      <div className="text-3xl font-black text-[#1a1207] dark:text-[#e8e9f0] mb-1 font-['Playfair_Display']">{value}</div>
      <div className="text-sm font-semibold text-[#6b5c4e] dark:text-[#7b8098]">{label}</div>
    </motion.div>
  )
}

function ScoreBadge({ score }) {
  const color = getScoreColor(score)
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 rounded-full bg-[#1a1207]/5 dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bugsFound: 0, securityIssues: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/api/user/stats'),
          api.get('/api/review/history?limit=5'),
        ])
        setStats(statsRes.data)
        setRecent(historyRes.data.reviews || [])
      } catch (_) {
        // graceful — empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-[#1a1207] dark:text-[#e8e9f0] font-['Playfair_Display'] tracking-tight">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-[#6b5c4e] dark:text-[#7b8098] text-lg mt-2 font-medium">Here's your code review summary</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard icon={Code2} label="Total Reviews" value={loading ? '—' : stats.total} color="#ff7845" delay={0} />
        <StatCard icon={TrendingUp} label="Avg Quality Score" value={loading ? '—' : `${stats.avgScore}/100`} color="#10b981" delay={0.1} />
        <StatCard icon={Bug} label="Bugs Caught" value={loading ? '—' : stats.bugsFound} color="#ef4444" delay={0.2} />
        <StatCard icon={Shield} label="Security Issues" value={loading ? '—' : stats.securityIssues} color="#f59e0b" delay={0.3} />
      </div>

      {/* Quick review CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[#ff6b35]/20"
        style={{ background: 'linear-gradient(135deg, #ff7845 0%, #ff6b35 50%, #c45200 100%)' }}
      >
        <div className="absolute -right-6 -top-10 opacity-20 transform rotate-12 mix-blend-overlay">
          <Zap size={220} />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-black mb-2 font-['Playfair_Display']">Ready to review your code?</h2>
            <p className="text-white/90 font-medium text-lg max-w-lg">Paste your raw code or drop a GitHub Repository URL to get AI-powered results in under 15 seconds.</p>
          </div>
          <Link
            to="/app/review"
            className="bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/30 text-white transition-all px-8 py-4 rounded-2xl font-bold text-md flex items-center justify-center gap-2 shadow-lg self-start lg:self-auto hover:-translate-y-1"
          >
            Start New Review <ArrowRight size={18} strokeWidth={3} />
          </Link>
        </div>
      </motion.div>

      {/* Recent reviews */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1a1207] dark:text-[#e8e9f0] font-['Playfair_Display'] tracking-tight">Recent Activity</h2>
          <Link to="/app/history" className="text-sm font-bold text-[var(--gradient-hot)] hover:text-[#e8673a] transition-colors flex items-center gap-1 bg-white dark:bg-[#13151c] px-4 py-2 rounded-full shadow-sm border border-[#1a1207]/5 dark:border-white/[0.07]">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-[#13151c] rounded-2xl h-24 animate-pulse border border-[#1a1207]/5 dark:border-white/[0.07]" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-white dark:bg-[#13151c] rounded-3xl p-16 text-center border border-[#1a1207]/5 dark:border-white/[0.07] shadow-sm">
            <div className="w-20 h-20 bg-orange-50 dark:bg-[#ff7845]/10 text-[var(--gradient-hot)] rounded-full flex items-center justify-center mx-auto mb-5">
              <Code2 size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-[#1a1207] dark:text-[#e8e9f0] mb-2">No reviews yet</h3>
            <p className="text-[#6b5c4e] dark:text-[#7b8098] mb-6">Submit your first code snippet to see it tracked here.</p>
            <Link to="/app/review" className="bg-gradient-to-r from-[#ff7845] to-[#ff6b35] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 hover:-translate-y-0.5">
              Start Reviewing <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/app/review/${r.id}`}
                  className="bg-white dark:bg-[#13151c] hover:bg-orange-50/30 dark:hover:bg-[#1a1f2e] flex items-center justify-between p-5 rounded-2xl shadow-sm border border-[#1a1207]/5 dark:border-white/[0.07] group transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-[#ff7845]/10 border border-orange-100 dark:border-[#ff7845]/20 flex items-center justify-center shrink-0">
                      <Code2 size={20} className="text-[var(--gradient-hot)]" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex flex-col gap-1">
                      <p className="text-base font-bold text-[#1a1207] dark:text-[#e8e9f0] truncate group-hover:text-[var(--gradient-hot)] transition-colors">
                        {r.githubUrl ? truncate(r.githubUrl, 60) : `${r.language} · ${truncate(r.code, 50)}`}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md bg-[#1a1207]/5 dark:bg-white/10 text-[#6b5c4e] dark:text-[#7b8098] text-xs font-bold uppercase tracking-wider">{r.language}</span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#6b5c4e]/70 dark:text-[#7b8098]/70">
                          <Clock size={12} strokeWidth={2.5} /> {timeAgo(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4 flex items-center gap-4">
                    <ScoreBadge score={r.result?.quality?.score || 0} />
                    <div className="w-8 h-8 rounded-full bg-[#1a1207]/5 dark:bg-white/10 flex items-center justify-center group-hover:bg-[#ff7845] dark:group-hover:bg-[#ff7845] transition-colors">
                      <ArrowRight size={16} strokeWidth={2.5} className="text-[#6b5c4e] dark:text-[#7b8098] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
