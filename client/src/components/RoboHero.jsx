import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const useMousePosition = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

export default function RoboHero() {
  const { x, y } = useMousePosition()
  
  // Parallax calculations using inner bounds (safe defaults before mount)
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  
  const mappedX = useTransform(useMotionValue(x), [0, windowWidth], [-6, 6])
  const mappedY = useTransform(useMotionValue(y), [0, windowHeight], [3, -3])

  // Typewriter effect state
  const codeLines = [
    '> analyzing auth.js...',
    '● found 2 critical bugs',
    '● score: 8.4/10',
    '> generating docs...',
    '✓ complete'
  ]
  const [linesShown, setLinesShown] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setLinesShown((prev) => {
        if (prev >= codeLines.length) return 1 // Loop
        return prev + 1
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [codeLines.length])

  return (
    <motion.div 
      className="relative w-full h-[500px] flex items-center justify-center pointer-events-auto cursor-pointer"
      whileHover="hover"
      initial="initial"
      style={{ perspective: 1200 }}
    >
      {/* 1. Shadow Ellipse */}
      <motion.div 
        className="absolute bottom-10 w-[240px] h-[30px] rounded-[100%] bg-black/20 blur-xl mix-blend-multiply"
        variants={{
          hover: { scale: 0.9, opacity: 0.4 },
          initial: { scale: 1, opacity: 0.6 }
        }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="relative z-10 w-[300px] h-[380px]"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ rotateY: mappedX, rotateX: mappedY }}
        variants={{
          hover: { y: -16 }, // Small extra bounce
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 300 400" className="overflow-visible drop-shadow-2xl">
          <defs>
            <linearGradient id="roboBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--robo-body)" />
              <stop offset="100%" stopColor="var(--robo-dark)" />
            </linearGradient>
            <linearGradient id="roboMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <clipPath id="headClip">
               <rect x="40" y="40" width="220" height="170" rx="36" />
            </clipPath>
          </defs>

          {/* 5, 6. Legs */}
          <rect x="100" y="320" width="26" height="40" rx="8" fill="url(#roboMetal)" />
          <rect x="174" y="320" width="26" height="40" rx="8" fill="url(#roboMetal)" />
          <rect x="90" y="350" width="46" height="24" rx="12" fill="var(--nav-dark)" />
          <rect x="164" y="350" width="46" height="24" rx="12" fill="var(--nav-dark)" />

          {/* 3. Left Arm Group */}
          <motion.g
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ originX: "60px", originY: "230px" }}
            variants={{ hover: { rotate: 10 } }}
          >
            <rect x="40" y="210" width="30" height="90" rx="15" fill="url(#roboBody)" />
            <rect x="40" y="290" width="30" height="30" rx="15" fill="var(--nav-dark)" />
          </motion.g>

          {/* 4. Right Arm Group */}
          <motion.g
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.25 }}
            style={{ originX: "240px", originY: "230px" }}
            variants={{ hover: { rotate: -10 } }}
          >
            <rect x="230" y="210" width="30" height="90" rx="15" fill="url(#roboBody)" />
            <rect x="230" y="290" width="30" height="30" rx="15" fill="var(--nav-dark)" />
          </motion.g>

          {/* 7. Neck */}
          <rect x="120" y="200" width="60" height="30" fill="url(#roboMetal)" />
          <line x1="120" y1="215" x2="180" y2="215" stroke="#94a3b8" strokeWidth="4" />

          {/* 2. Body */}
          <rect x="70" y="220" width="160" height="110" rx="30" fill="url(#roboBody)" />
          
          {/* 15. Chest Panel */}
          <rect x="100" y="240" width="100" height="40" rx="8" fill="rgba(0,0,0,0.15)" />
          {/* Blinking Indicators staggered */}
          <motion.circle cx="120" cy="260" r="5" fill="#f87171" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
          <motion.circle cx="150" cy="260" r="5" fill="#facc15" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
          <motion.circle cx="180" cy="260" r="5" fill="#4ade80" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />

          {/* 14. Ear Nubs */}
          <circle cx="35" cy="125" r="16" fill="url(#roboBody)" />
          <circle cx="265" cy="125" r="16" fill="url(#roboBody)" />

          {/* 8. Head Container */}
          <g>
            <rect x="40" y="40" width="220" height="170" rx="36" fill="url(#roboBody)" />
            
            {/* 16. Shine Arc Overlay */}
            <path d="M 50 100 Q 80 40 180 45" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="6" strokeLinecap="round" />

            {/* 9. Antenna */}
            <line x1="150" y1="40" x2="150" y2="10" stroke="url(#roboMetal)" strokeWidth="6" strokeLinecap="round" />
            <motion.circle 
              cx="150" cy="8" r="8" fill="var(--robo-screen-glow)" filter="url(#glow)"
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              variants={{ hover: { scale: [1, 1.4, 1], duration: 0.5 } }}
            />

            {/* 10. Screen */}
            <motion.rect 
              x="60" y="60" width="180" height="110" rx="16" fill="var(--robo-screen)"
              variants={{ hover: { fill: "#1e331b" } }}
              transition={{ duration: 0.3 }}
            />

            {/* 11. Typewriter Terminal Text */}
            <g transform="translate(80, 85)" fill="var(--robo-screen-glow)" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="bold">
              {codeLines.slice(0, linesShown).map((line, i) => (
                <text key={i} y={i * 18}>{line}</text>
              ))}
              <motion.rect 
                x="8" y={linesShown * 18 - 18} width="6" height="12" fill="var(--robo-screen-glow)"
                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              />
            </g>

            {/* 12. Blinking Eyes */}
            <motion.g
              animate={{ scaleY: [1, 0.05, 1] }}
              transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3.2 }}
              style={{ originY: "75px" }}
            >
              <rect x="180" y="65" width="24" height="8" rx="4" fill="var(--robo-screen-glow)" filter="url(#glow)" />
              <rect x="195" y="65" width="24" height="8" rx="4" fill="var(--robo-screen-glow)" filter="url(#glow)" />
            </motion.g>

            {/* 13. Speaker Grill (Moved left off screen area slightly, or inside face) */}
            <g transform="translate(190, 150)">
              <rect width="30" height="3" rx="1.5" fill="#4ade80" opacity="0.6"/>
              <rect y="7" width="20" height="3" rx="1.5" fill="#4ade80" opacity="0.6"/>
              <rect y="14" width="25" height="3" rx="1.5" fill="#4ade80" opacity="0.6"/>
            </g>
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}
