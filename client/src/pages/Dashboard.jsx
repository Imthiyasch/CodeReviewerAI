import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, TrendingUp, Bug, Shield, ArrowRight, Clock, Zap, Sparkles } from 'lucide-react'
import useAuthStore from '../store/authStore'
import api from '../lib/api'
import { getScoreColor, getScoreLabel, timeAgo, truncate } from '../lib/utils'

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative bg-white dark:bg-[#111520] p-6 rounded-2xl shadow-sm border border-[#1a1207]/5 dark:border-white/[0.06] hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden"
    >
      {/* Subtle glow blob in dark mode */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 dark:opacity-20 blur-2xl transition-opacity group-hover:dark:opacity-30"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center ring-1 dark:ring-0"
          style={{ background: color + '18', ringColor: color + '30' }}
        >
          <Icon size={22} style={{ color }} strokeWidth={2.5} />
        </div>
      </div>
      <div className="text-3xl font-black text-[#1a1207] dark:text-[#eef0f8] mb-1 font-['Playfair_Display']">{value}</div>
      <div className="text-sm font-semibold text-[#6b5c4e] dark:text-[#6b7280]">{label}</div>
    </motion.div>
  )
}

function ScoreBadge({ score }) {
  const color = getScoreColor(score)
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-[#1a1207]/8 dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{score}</span>
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
        const timestamp = Date.now()
        const [statsRes, historyRes] = await Promise.all([
          api.get(`/api/user/stats?t=${timestamp}`),
          api.get(`/api/review/history?limit=5&t=${timestamp}`),
        ])
        setStats(statsRes.data)
        setRecent(historyRes.data.reviews || [])
      } catch (_) {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff7845]/10 dark:bg-[#ff7845]/15 border border-[#ff7845]/20 dark:border-[#ff7845]/30 w-fit"
        >
          <Sparkles size={13} className="text-[#ff7845]" />
          <span className="text-xs font-bold text-[#ff7845] uppercase tracking-wider">AI Code Intelligence</span>
        </motion.div>
        <h1 className="text-4xl font-black text-[#1a1207] dark:text-[#eef0f8] font-['Playfair_Display'] tracking-tight">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-[#6b5c4e] dark:text-[#6b7280] text-lg font-medium">Here's your code review intelligence dashboard.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        <StatCard icon={Code2} label="Total Reviews" value={loading ? '—' : stats.total} color="#ff7845" delay={0} />
        <StatCard icon={TrendingUp} label="Avg Quality Score" value={loading ? '—' : `${stats.avgScore}/100`} color="#10b981" delay={0.08} />
        <StatCard icon={Bug} label="Bugs Caught" value={loading ? '—' : stats.bugsFound} color="#f43f5e" delay={0.16} />
        <StatCard icon={Shield} label="Security Issues" value={loading ? '—' : stats.securityIssues} color="#f59e0b" delay={0.24} />
      </div>

      {/* Quick review CTA — glass look in dark mode */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-3xl p-8 relative overflow-hidden text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #ff7845 0%, #e85d25 40%, #b83a10 100%)',
          boxShadow: '0 20px 60px -10px rgba(255, 120, 69, 0.4)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-black/10 blur-2xl" />
          <Zap size={300} className="absolute -right-12 -bottom-12 opacity-[0.07] rotate-12" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-black mb-2 font-['Playfair_Display']">Ready to review your code?</h2>
            <p className="text-white/85 font-medium text-lg max-w-lg leading-relaxed">Paste raw code or a GitHub URL. Get AI-powered insight in under 15 seconds.</p>
          </div>
          <Link
            to="/app/review"
            className="shrink-0 bg-white/15 backdrop-blur-sm hover:bg-white/25 border border-white/30 text-white transition-all px-7 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:-translate-y-0.5"
          >
            Start New Review <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </motion.div>

      {/* Recent reviews */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black text-[#1a1207] dark:text-[#eef0f8] font-['Playfair_Display'] tracking-tight">Recent Activity</h2>
          <Link
            to="/app/history"
            className="text-sm font-bold text-[#ff7845] hover:text-[#e86530] transition-colors flex items-center gap-1 bg-white dark:bg-[#111520] px-4 py-2 rounded-full shadow-sm border border-[#1a1207]/5 dark:border-white/[0.06]"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-[#111520]/80 rounded-2xl h-[72px] animate-pulse border border-[#1a1207]/5 dark:border-white/[0.05]" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-white dark:bg-[#111520] rounded-3xl p-16 text-center border border-[#1a1207]/5 dark:border-white/[0.06] shadow-sm">
            <div className="w-20 h-20 bg-orange-50 dark:bg-[#ff7845]/10 text-[#ff7845] rounded-full flex items-center justify-center mx-auto mb-5">
              <Code2 size={36} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-[#1a1207] dark:text-[#eef0f8] mb-2">No reviews yet</h3>
            <p className="text-[#6b5c4e] dark:text-[#6b7280] mb-6">Submit your first code snippet and let the AI work its magic.</p>
            <Link
              to="/app/review"
              className="bg-gradient-to-r from-[#ff7845] to-[#e85d25] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-orange-500/25 dark:hover:shadow-[#ff7845]/30 hover:shadow-lg transition-all inline-flex items-center gap-2 hover:-translate-y-0.5"
            >
              Start Reviewing <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recent.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, ease: 'easeOut' }}
              >
                <Link
                  to={`/app/review/${r.id}`}
                  className="group bg-white dark:bg-[#111520] hover:bg-orange-50/40 dark:hover:bg-[#161c2e] flex items-center justify-between p-4 rounded-2xl border border-[#1a1207]/5 dark:border-white/[0.06] dark:hover:border-[#ff7845]/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#ff7845]/8 dark:bg-[#ff7845]/12 border border-[#ff7845]/15 dark:border-[#ff7845]/25 flex items-center justify-center shrink-0">
                      <Code2 size={19} className="text-[#ff7845]" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1a1207] dark:text-[#cfd3e0] truncate group-hover:text-[#ff7845] dark:group-hover:text-[#ff7845] transition-colors">
                        {r.githubUrl ? truncate(r.githubUrl, 60) : `${r.language} · ${truncate(r.code, 50)}`}
                      </p>
                      <div className="flex items-center gap-2.5 mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#1a1207]/5 dark:bg-white/[0.07] text-[#6b5c4e] dark:text-[#6b7280] text-[11px] font-bold uppercase tracking-wider">{r.language}</span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#6b5c4e]/60 dark:text-[#6b7280]/70">
                          <Clock size={11} strokeWidth={2.5} /> {timeAgo(r.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4 flex items-center gap-3">
                    <ScoreBadge score={r.result?.quality?.score || 0} />
                    <div className="w-7 h-7 rounded-full bg-[#1a1207]/5 dark:bg-white/[0.07] flex items-center justify-center group-hover:bg-[#ff7845] transition-colors">
                      <ArrowRight size={14} strokeWidth={2.5} className="text-[#6b5c4e] dark:text-[#6b7280] group-hover:text-white transition-colors" />
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
