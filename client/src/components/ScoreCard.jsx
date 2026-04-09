import { motion } from 'framer-motion'
import { getScoreColor, getScoreLabel } from '../lib/utils'

const RADIUS = 40
const CIRC = 2 * Math.PI * RADIUS

export default function ScoreCard({ label, score = 0 }) {
  const color = getScoreColor(score)
  const label2 = getScoreLabel(score)
  const offset = CIRC - (score / 100) * CIRC

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-[#1a1207]/5 hover:-translate-y-1 transition-transform duration-300">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(26,18,7,0.05)" strokeWidth="8" />
          {/* Progress */}
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-[#1a1207] font-['Playfair_Display']">{score}</span>
          <span className="text-xs font-bold text-[#6b5c4e]/50 uppercase tracking-widest mt-0.5">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-bold text-[#1a1207] mt-3">{label}</p>
      <span className="text-xs mt-1 font-bold" style={{ color }}>{label2}</span>
    </div>
  )
}
