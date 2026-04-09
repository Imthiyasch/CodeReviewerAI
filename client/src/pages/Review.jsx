import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Link2, Play, Loader2, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Shield, FileText, Wand2, BarChart3, ArrowLeft, Search, FolderGit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { LANGUAGES, getScoreColor, getScoreLabel, severityConfig } from '../lib/utils'
import ScoreCard from '../components/ScoreCard'
import SyntaxBlock from '../components/SyntaxBlock'

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'bugs', label: 'Bugs', icon: AlertTriangle },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'docs', label: 'Documentation', icon: FileText },
  { id: 'refactored', label: 'Refactored', icon: Wand2 },
]

function BugCard({ bug, index }) {
  const [open, setOpen] = useState(index === 0)
  const cfg = severityConfig[bug.severity] || severityConfig.info
  return (
    <div className={`rounded-2xl overflow-hidden border ${cfg.border} ${cfg.bg} transition-all`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-5 text-left"
      >
        <span className="text-xl mt-0.5" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${cfg.badge}`}>{cfg.label}</span>
            {bug.line && <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/50 text-[#1a1207] border border-[#1a1207]/10">Line {bug.line}</span>}
          </div>
          <span className="text-sm font-bold text-[#1a1207]">{bug.description}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center shrink-0 mt-0.5">
          {open ? <ChevronUp size={16} strokeWidth={3} className="text-[#1a1207]" /> : <ChevronDown size={16} strokeWidth={3} className="text-[#1a1207]" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 border-t border-[#1a1207]/5 pt-4 bg-white/30">
              {bug.fix && (
                <div>
                  <p className="text-xs text-[#1a1207] mb-2 font-bold uppercase tracking-wide">Suggested Fix</p>
                  <SyntaxBlock code={bug.fix} language="javascript" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Review() {
  const { id } = useParams()
  const [inputMode, setInputMode] = useState('code') // 'code' | 'github'
  const [code, setCode] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [repoFiles, setRepoFiles] = useState([])
  const [fetchingTree, setFetchingTree] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  // Load existing review if navigating to /review/:id
  useEffect(() => {
    if (id) {
      api.get(`/api/review/${id}`)
        .then((res) => {
          setResult(res.data)
          setCode(res.data.code || '')
          setLanguage(res.data.language || 'javascript')
          if (res.data.githubUrl) {
            setInputMode('github')
            setGithubUrl(res.data.githubUrl)
          }
        })
        .catch(() => toast.error('Review not found'))
    }
  }, [id])

  const handleFetchTree = async () => {
    if (!githubUrl.trim()) { toast.error('Please enter a GitHub repository URL'); return }
    setFetchingTree(true)
    setRepoFiles([])
    try {
      const { data } = await api.get(`/api/github/tree?url=${encodeURIComponent(githubUrl)}`)
      setRepoFiles(data.files || [])
      toast.success('Repository loaded. Please pick a file to review.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch repository files')
    } finally {
      setFetchingTree(false)
    }
  }

  const handleSubmit = async () => {
    if (inputMode === 'code' && !code.trim()) { toast.error('Please paste some code first'); return }
    if (inputMode === 'github' && !githubUrl.trim()) { toast.error('Please enter or select a GitHub URL'); return }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/review', {
        code: inputMode === 'code' ? code : undefined,
        githubUrl: inputMode === 'github' ? githubUrl : undefined,
        language,
      })
      setResult(data)
      setActiveTab('overview')
      toast.success('Review complete!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Review failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const bugCount = result?.bugs?.length || 0
  const securityCount = result?.security?.length || 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        {id && (
          <Link to="/app/history" className="w-10 h-10 rounded-full bg-white border border-[#1a1207]/10 flex items-center justify-center text-[#1a1207] hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </Link>
        )}
        <div>
          <h1 className="text-4xl font-black text-[#1a1207] font-['Playfair_Display'] tracking-tight">
            {id ? 'Review Details' : 'New Code Review'}
          </h1>
          <p className="text-[#6b5c4e] text-lg mt-1 font-medium">
            {id ? 'Viewing past AI analysis' : 'Paste code or enter a GitHub URL for instant AI analysis'}
          </p>
        </div>
      </div>

      {/* Input section */}
      {!id && (
        <motion.div className="bg-white rounded-3xl p-8 space-y-6 shadow-sm border border-[#1a1207]/5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Input mode toggle */}
          <div className="flex gap-2 p-1.5 rounded-xl w-fit bg-gray-50 border border-[#1a1207]/5">
            {['code', 'github'].map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  inputMode === mode ? 'bg-white text-[#1a1207] shadow-sm' : 'text-[#6b5c4e] hover:text-[#1a1207]'
                }`}
              >
                {mode === 'code' ? <Code2 size={16} strokeWidth={2.5} /> : <Link2 size={16} strokeWidth={2.5} />}
                {mode === 'code' ? 'Paste Code' : 'GitHub Repository'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {inputMode === 'code' ? (
              <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs text-[#6b5c4e] font-bold uppercase tracking-widest">Your Code</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-sm rounded-xl px-4 py-2 text-[#1a1207] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hot)] cursor-pointer bg-gray-50 border border-[#1a1207]/10"
                  >
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <textarea
                  id="code-input"
                  className="w-full bg-[#14110f] text-gray-200 font-mono text-sm p-5 rounded-2xl border border-[#1a1207]/10 focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hot)] shadow-inner"
                  rows={14}
                  placeholder={"// Paste your code here...\nfunction example() {\n  // CR42 will analyse this for bugs, security issues, and more\n}"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                />
              </motion.div>
            ) : (
              <motion.div key="github" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <label className="text-xs text-[#6b5c4e] font-bold uppercase tracking-widest block mb-3">GitHub File or Repository URL</label>
                  <div className="flex gap-3">
                    <input
                      id="github-url-input"
                      type="url"
                      className="flex-1 px-5 py-4 rounded-xl text-base font-medium text-[#1a1207] placeholder-[#6b5c4e]/40 focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hot)] transition-all bg-gray-50 border border-[#1a1207]/10 shadow-inner"
                      placeholder="https://github.com/user/repo   OR   https://github.com/user/repo/blob/main/file.js"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                    <button
                      onClick={handleFetchTree}
                      disabled={fetchingTree}
                      className="px-6 py-4 rounded-xl font-bold bg-[#1a1207] text-white hover:bg-[#2c1e0b] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {fetchingTree ? <Loader2 size={18} className="animate-spin" /> : <FolderGit2 size={18} />}
                      Fetch Repo
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {repoFiles.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-gray-50 border border-[#1a1207]/10 rounded-xl p-4 mt-2">
                        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-white rounded-lg border border-[#1a1207]/5 shadow-sm">
                          <Search size={16} className="text-[#6b5c4e]" />
                          <input 
                            type="text" 
                            placeholder="Search files..." 
                            className="bg-transparent border-none focus:outline-none text-sm font-medium w-full"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                          {repoFiles.filter(f => f.path.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                            <button
                              key={f.path}
                              onClick={() => setGithubUrl(f.url)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${githubUrl === f.url ? 'bg-[#1a1207] text-white shadow-md' : 'text-[#6b5c4e] hover:bg-white hover:text-[#1a1207] border border-transparent hover:border-[#1a1207]/5 shadow-[0_1px_2px_transparent] hover:shadow-sm'}`}
                            >
                              {f.path}
                            </button>
                          ))}
                          {repoFiles.filter(f => f.path.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <div className="py-4 text-center text-sm font-semibold text-[#6b5c4e]/60">No files match your search</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-sm rounded-xl px-4 py-2 text-[#1a1207] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hot)] bg-gray-50 border border-[#1a1207]/10 cursor-pointer"
                  >
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                  <span className="text-xs font-semibold text-[#6b5c4e]">Select language if auto-detect fails</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            id="submit-review-btn"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-white text-lg flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all bg-gradient-to-r from-[var(--gradient-hot)] to-[var(--gradient-warm)]"
          >
            {loading ? (
              <><Loader2 size={24} strokeWidth={3} className="animate-spin" /> Analysing Code…</>
            ) : (
              <><Play size={20} strokeWidth={3} className="fill-white" /> Run AI Review</>
            )}
          </button>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-3xl p-10 space-y-5 border border-[#1a1207]/5 shadow-sm mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-lg font-black text-[#1a1207] font-['Playfair_Display']">Gemini Flash is reviewing your code…</p>
              <p className="text-sm font-semibold text-[#6b5c4e] mt-1">Detecting bugs · Security scanning · Scoring quality</p>
            </div>
          </div>
          {[1,2,3].map(i => <div key={i} className="h-12 border border-[#1a1207]/5 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4"
          >
            {/* Tab bar */}
            <div className="flex gap-2 p-1.5 rounded-xl overflow-x-auto bg-gray-50 border border-[#1a1207]/5 whitespace-nowrap">
              {TABS.map(({ id: tid, label, icon: Icon }) => {
                const count = tid === 'bugs' ? bugCount : tid === 'security' ? securityCount : null
                return (
                  <button
                    key={tid}
                    id={`tab-${tid}`}
                    onClick={() => setActiveTab(tid)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      activeTab === tid ? 'bg-white text-[#1a1207] shadow-sm' : 'text-[#6b5c4e] hover:text-[#1a1207]'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.5} className={activeTab === tid ? 'text-[var(--gradient-hot)]' : ''} />
                    {label}
                    {count > 0 && (
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${activeTab === tid ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#1a1207] text-white'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white rounded-3xl p-8 border border-[#1a1207]/5 shadow-sm">
                      <h3 className="text-xs font-black text-[#6b5c4e]/50 uppercase tracking-widest mb-4">Summary</h3>
                      <p className="text-[#1a1207] text-lg leading-relaxed font-medium">{result.summary}</p>
                    </div>

                    {/* Score cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {[
                        { label: 'Overall', score: result.quality?.score, key: 'score' },
                        { label: 'Readability', score: result.quality?.readability, key: 'readability' },
                        { label: 'Maintainability', score: result.quality?.maintainability, key: 'maintainability' },
                        { label: 'Performance', score: result.quality?.performance, key: 'performance' },
                      ].map((q) => <ScoreCard key={q.key} label={q.label} score={q.score || 0} />)}
                    </div>

                    {/* Suggestions */}
                    {result.suggestions?.length > 0 && (
                      <div className="bg-white rounded-3xl p-8 border border-[#1a1207]/5 shadow-sm">
                        <h3 className="text-xs font-black text-[#6b5c4e]/50 uppercase tracking-widest mb-4">Improvement Suggestions</h3>
                        <ul className="space-y-4">
                          {result.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-[#1a1207] font-medium text-base">
                              <span className="text-[var(--gradient-hot)] mt-0.5 shrink-0 block mx-1">◆</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* BUGS TAB */}
                {activeTab === 'bugs' && (
                  <div className="space-y-4">
                    {bugCount === 0 ? (
                      <div className="bg-white rounded-3xl p-16 text-center border border-[#1a1207]/5 shadow-sm">
                        <div className="text-5xl mb-4">✅</div>
                        <p className="text-xl font-black font-['Playfair_Display'] text-[#1a1207]">No bugs detected!</p>
                        <p className="text-[#6b5c4e] font-medium mt-1">Your code looks completely sound.</p>
                      </div>
                    ) : (
                      result.bugs.map((bug, i) => <BugCard key={i} bug={bug} index={i} />)
                    )}
                  </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                  <div className="space-y-4">
                    {securityCount === 0 ? (
                      <div className="bg-white rounded-3xl p-16 text-center border border-[#1a1207]/5 shadow-sm">
                         <div className="text-5xl mb-4">🛡️</div>
                        <p className="text-xl font-black font-['Playfair_Display'] text-[#1a1207]">No security issues found!</p>
                      </div>
                    ) : (
                      result.security.map((issue, i) => (
                        <div key={i} className="bg-orange-50/50 rounded-2xl p-6 border border-orange-500/30">
                          <div className="flex items-center gap-3 mb-3">
                            <Shield size={20} className="text-orange-500" strokeWidth={2.5} />
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-600">{issue.type}</span>
                            {issue.line && <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white border border-[#1a1207]/10">Line {issue.line}</span>}
                          </div>
                          <p className="text-[#1a1207] font-semibold text-base leading-relaxed">{issue.description}</p>
                          {issue.fix && (
                            <div className="mt-4 p-4 bg-white rounded-xl border border-orange-100">
                              <p className="text-[10px] text-orange-600 mb-1.5 font-black uppercase tracking-widest">Remediation</p>
                              <p className="text-sm font-bold text-[#1a1207]">{issue.fix}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* DOCS TAB */}
                {activeTab === 'docs' && (
                  <div className="bg-white rounded-3xl p-8 border border-[#1a1207]/5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xs font-black text-[#6b5c4e]/50 uppercase tracking-widest">Auto-Generated Documentation</h3>
                      <button
                        onClick={() => copyCode(result.documentation)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#1a1207] bg-gray-50 border border-[#1a1207]/10 hover:bg-gray-100 transition-all shadow-sm"
                      >
                        {copied ? <Check size={14} className="text-[#00ff88]" strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
                        {copied ? 'Copied!' : 'Copy to clipboard'}
                      </button>
                    </div>
                    <pre className="text-sm text-[#1a1207] bg-gray-50 p-6 rounded-2xl border border-[#1a1207]/5 leading-relaxed whitespace-pre-wrap font-mono shadow-inner">
                      {result.documentation || 'Documentation not available.'}
                    </pre>
                  </div>
                )}

                {/* REFACTORED TAB */}
                {activeTab === 'refactored' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-[#1a1207]/5 shadow-sm">
                      <p className="text-sm font-bold text-[#1a1207]">AI-refactored version with integrated suggestions & fixes</p>
                      <button
                        onClick={() => copyCode(result.refactoredCode)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#1a1207] bg-gray-50 border border-[#1a1207]/10 hover:bg-gray-100 transition-all shadow-sm"
                      >
                        {copied ? <Check size={14} className="text-[#00ff88]" strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
                        {copied ? 'Copied!' : 'Copy code'}
                      </button>
                    </div>
                    <SyntaxBlock code={result.refactoredCode || '// No refactored code available'} language={language} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
