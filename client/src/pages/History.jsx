import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Clock, ChevronRight, Search, Filter, Trash2, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { getScoreColor, timeAgo, truncate } from '../lib/utils'

export default function History() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PER_PAGE = 10

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: PER_PAGE,
        ...(search && { search }),
        ...(langFilter && { language: langFilter }),
      })
      const { data } = await api.get(`/api/review/history?${params}`)
      setReviews(data.reviews || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [page, search, langFilter])

  useEffect(() => { loadReviews() }, [loadReviews])

  const deleteReview = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await api.delete(`/api/review/${id}`)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Review deleted')
    } catch {
      toast.error('Could not delete review')
    }
  }

  const pages = Math.ceil(total / PER_PAGE)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-[#1a1207] font-['Playfair_Display'] tracking-tight">Review History</h1>
        <p className="text-[#6b5c4e] text-lg mt-1 font-medium">{total} total reviews</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b5c4e]/50" />
          <input
            id="history-search"
            type="text"
            placeholder="Search your code reviews…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-11 pr-4 py-3 rounded-xl font-medium text-[#1a1207] placeholder-[#6b5c4e]/40 focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hot)] transition-all bg-white border border-[#1a1207]/10 shadow-sm"
          />
        </div>
        <select
          id="history-lang-filter"
          value={langFilter}
          onChange={(e) => { setLangFilter(e.target.value); setPage(1) }}
          className="px-4 py-3 rounded-xl font-bold text-[#1a1207] bg-white border border-[#1a1207]/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hot)] cursor-pointer"
        >
          <option value="">All Languages</option>
          {['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php'].map(l => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-[#1a1207]/5" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#1a1207]/5 shadow-sm mt-8">
          <div className="w-20 h-20 bg-[var(--gradient-soft)]/20 text-[var(--gradient-hot)] rounded-full flex items-center justify-center mx-auto mb-5">
            <Code2 size={36} strokeWidth={2.5} />
          </div>
          <p className="text-xl font-bold text-[#1a1207] mb-2">No reviews found</p>
          <p className="text-[#6b5c4e] mb-6">Try adjusting your search filters or start a new review.</p>
          <Link to="/app/review" className="bg-gradient-to-r from-[var(--gradient-hot)] to-[var(--gradient-warm)] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 hover:-translate-y-0.5">
            Start a Review <ArrowRight size={16} strokeWidth={3} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {reviews.map((r, i) => {
            const score = r.result?.quality?.score || 0
            const color = getScoreColor(score)
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <Link
                  to={`/app/review/${r.id}`}
                  className="bg-white hover:bg-orange-50/50 flex items-center gap-4 p-5 rounded-2xl shadow-sm border border-[#1a1207]/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <Code2 size={20} className="text-[var(--gradient-hot)]" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-[#1a1207] group-hover:text-[var(--gradient-hot)] transition-colors truncate">
                      {r.githubUrl ? truncate(r.githubUrl, 60) : truncate(r.code, 60)}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-[#1a1207]/5 text-[#6b5c4e] text-xs font-bold uppercase tracking-wider">{r.language}</span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#6b5c4e]/70">
                        <Clock size={12} strokeWidth={2.5} /> {timeAgo(r.createdAt)}
                      </span>
                      {r.result?.bugs?.length > 0 && (
                        <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-500 text-xs font-bold uppercase tracking-wider">
                          {r.result.bugs.length} bug{r.result.bugs.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-xl font-black font-['Playfair_Display']" style={{ color }}>{score}</div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-[#6b5c4e]/50 -mt-1">score</div>
                    </div>
                    <button
                      onClick={(e) => deleteReview(r.id, e)}
                      className="p-2.5 rounded-xl text-[#6b5c4e]/30 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[#1a1207]/5 flex items-center justify-center group-hover:bg-[#1a1207] transition-colors">
                      <ChevronRight size={16} strokeWidth={2.5} className="text-[#6b5c4e] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-[#1a1207] border border-[#1a1207]/10 shadow-sm hover:shadow-md disabled:opacity-50 transition-all">
            Previous
          </button>
          <span className="text-sm font-semibold text-[#6b5c4e]">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white text-[#1a1207] border border-[#1a1207]/10 shadow-sm hover:shadow-md disabled:opacity-50 transition-all">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
