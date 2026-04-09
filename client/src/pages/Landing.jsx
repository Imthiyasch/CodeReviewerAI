import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, PlayCircle, Bug, Wand2, FileCode2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import RoboHero from '../components/RoboHero'

export default function Landing() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll for Navbar background
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogin = () => {
    if (isAuthenticated) { navigate('/app/dashboard'); return }
    window.location.href = '/auth/google'
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-dark)] overflow-hidden font-sans selection:bg-[var(--gradient-hot)] selection:text-white pb-32">
      
      {/* 1. Navbar */}
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[var(--nav-dark)]/95 backdrop-blur-[12px] py-4 shadow-xl text-white' 
            : 'bg-transparent py-6 text-[var(--text-dark)]'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Geometric Hexagon Logo SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isScrolled ? "text-[var(--gradient-warm)]" : "text-[var(--gradient-hot)]"}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="8 10 12 14 16 10"></polyline>
            </svg>
            <span className="font-bold tracking-tight text-lg">CodeSensei.AI</span>
          </div>

          <div className={`hidden lg:flex gap-10 items-center font-medium text-[14px] tracking-[0.02em] ${isScrolled ? 'text-gray-300' : 'text-[var(--text-dark)]'}`}>
             <a href="#products" className="hover:text-[var(--gradient-hot)] transition-colors">Products ▾</a>
             <a href="#pricing" className="hover:text-[var(--gradient-hot)] transition-colors">Pricing</a>
             <a href="#solutions" className="hover:text-[var(--gradient-hot)] transition-colors">Solutions</a>
             <a href="#resources" className="hover:text-[var(--gradient-hot)] transition-colors">Resources ▾</a>
          </div>

          {/* Nav pills stagger in */}
          <motion.button
             initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
             onClick={handleLogin}
             className="hidden md:inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-300 bg-[var(--pill-bg)] text-[var(--pill-text)] hover:scale-105 hover:bg-black text-[14px]"
             style={isScrolled ? { backgroundColor: 'var(--gradient-hot)', color: 'white' } : {}}
          >
             {isAuthenticated ? 'Dashboard' : 'Get started'} <ArrowUpRight size={16} />
          </motion.button>

        </div>
      </motion.nav>

      {/* 2. Hero Section */}
      <section className="relative w-full min-h-[100vh] pt-32 lg:pt-40 pb-20 flex items-center">
        
        {/* Background Rig */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Radial Center Core */}
          <div className="absolute top-[10%] left-[20%] w-[120%] h-[120%] radial-core opacity-80" 
               style={{ background: 'radial-gradient(ellipse 70% 80% at 65% 55%, var(--hero-bg-start) 0%, #f0a06a 40%, var(--hero-bg-end) 100%)' }} />
          
          {/* Subtle Vertical Stripe Texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
               style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 40px, #000 40px, #000 41px)' }} />

          {/* Noise Overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

          {/* Floating Blobs */}
          <motion.div animate={{ y: [0, -40, 0], x: [0, 20, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute top-[20%] left-[60%] w-[400px] h-[400px] bg-[var(--gradient-soft)] rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
               
          <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute top-[50%] left-[40%] w-[600px] h-[600px] bg-[#fff0e6] rounded-full blur-[120px] opacity-70 mix-blend-overlay" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-4">
          
          {/* Left: Text Column */}
          <div className="w-full lg:w-5/12 flex flex-col items-start pt-10">
            {/* Pill Badge */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--nav-dark)] text-white mb-8 shadow-xl relative overflow-hidden"
            >
               <motion.div 
                 animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
                 className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" 
               />
               <span className="text-xs font-bold uppercase tracking-widest text-[#f0a06a]">Build / Debug / Review</span>
               <ArrowUpRight size={14} className="text-[#f0a06a]" />
            </motion.div>

            <motion.h1 
               initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
               className="font-serif text-5xl sm:text-6xl lg:text-[72px] font-[800] leading-[1.05] tracking-tight mb-8"
            >
              Your intelligent <br />
              AI-agent that <br />
              understands your <br />
              entire codebase <span className="text-[var(--gradient-hot)] italic font-sans font-black pr-2">{'</>'}</span>
            </motion.h1>

            <motion.p 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
               className="text-[var(--text-muted)] text-[16px] leading-[1.7] max-w-[380px] mb-10 font-medium"
            >
              Any code, any language. Turn ideas directly into real products — with a senior dev reviewing 24/7.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
               className="flex flex-col sm:flex-row items-center gap-4"
            >
               <button onClick={handleLogin} className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all duration-300 bg-[var(--pill-bg)] text-[var(--pill-text)] shadow-2xl hover:bg-black w-full sm:w-auto text-[15px]">
                  Get started <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
               </button>
               <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all duration-300 bg-transparent text-[var(--text-dark)] hover:bg-black/5 w-full sm:w-auto text-[15px]">
                  Watch demo <PlayCircle size={20} className="text-[var(--gradient-hot)] transition-transform group-hover:scale-110" />
               </button>
            </motion.div>
          </div>

          {/* Right: Robot Container */}
          <div className="w-full lg:w-7/12 relative flex items-center justify-center min-h-[500px]">
             
             {/* Small Floating Card */}
             <motion.div 
               initial={{ opacity: 0, x: 40 }}
               animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute right-[5%] top-[15%] z-20 hidden md:flex flex-col bg-[var(--card-bg)] backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] max-w-[180px]"
             >
               <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--gradient-hot)] mb-1">Live Demo</span>
               <span className="text-[13px] font-bold text-[var(--text-dark)] leading-tight">Built-in syntax validation</span>
             </motion.div>

             <RoboHero />

             {/* Circular Scroll Down Badge */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: 'spring' }}
               className="absolute right-[10%] bottom-[5%] z-20 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
             >
                <div className="relative w-28 h-28 hidden md:block">
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--text-dark)] animate-spin-slow">
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <path id="scroll-path" d="M 50 10 A 40 40 0 1 1 49.9 10" fill="transparent" />
                      <text width="500">
                        <textPath href="#scroll-path" startOffset="0%" className="fill-[var(--text-dark)]">
                          SCROLL DOWN ↓ SCROLL DOWN ↓ 
                        </textPath>
                      </text>
                    </svg>
                  </div>
                </div>
             </motion.div>

          </div>

        </div>
      </section>

      {/* 3. Stats Bar */}
      <section className="relative z-20 bg-[var(--nav-dark)] text-white w-full py-16 border-y border-white/10">
         <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center font-sans">
            <div className="flex flex-col gap-1 px-4 py-4 md:py-0">
               <span className="text-4xl md:text-5xl font-bold text-[var(--gradient-warm)]">10,000+</span>
               <span className="text-[13px] uppercase tracking-wider text-gray-400 font-medium">Reviews Done</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-4 md:py-0">
               <span className="text-4xl md:text-5xl font-bold text-[var(--gradient-soft)]">50ms</span>
               <span className="text-[13px] uppercase tracking-wider text-gray-400 font-medium">Avg Analysis</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-4 md:py-0">
               <span className="text-4xl md:text-5xl font-bold text-[var(--gradient-warm)]">99.2%</span>
               <span className="text-[13px] uppercase tracking-wider text-gray-400 font-medium">Accuracy Rate</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-4 md:py-0">
               <span className="text-4xl md:text-5xl font-bold text-[var(--gradient-soft)]">15+</span>
               <span className="text-[13px] uppercase tracking-wider text-gray-400 font-medium">Languages</span>
            </div>
         </div>
      </section>

      {/* 4. Features Section */}
      <section className="relative w-full max-w-[1200px] mx-auto px-6 py-32 flex flex-col items-center">
         
         <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            className="font-serif text-4xl md:text-[52px] font-bold text-center text-[var(--text-dark)] leading-tight mb-20"
         >
           Everything a senior dev <br className="hidden md:block" />
           would tell you.
         </motion.h2>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            
            {/* Card 1 */}
            <motion.div 
               initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
               className="group flex flex-col bg-[var(--card-bg)] backdrop-blur-sm border border-black/5 rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,107,53,0.1)] transition-all duration-300"
            >
               <div className="w-12 h-12 rounded-xl bg-[#fff0e6] flex items-center justify-center text-[var(--gradient-hot)] mb-6 group-hover:scale-110 transition-transform">
                  <Bug size={24} />
               </div>
               <h3 className="font-bold text-xl mb-3 text-[var(--text-dark)]">Bug Detection</h3>
               <p className="text-[var(--text-muted)] leading-relaxed font-medium">Find critical logic errors and syntax bugs before your users do.</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
               initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
               className="group flex flex-col bg-[var(--card-bg)] backdrop-blur-sm border border-black/5 rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,107,53,0.1)] transition-all duration-300"
            >
               <div className="w-12 h-12 rounded-xl bg-[#fff0e6] flex items-center justify-center text-[var(--gradient-hot)] mb-6 group-hover:scale-110 transition-transform">
                  <Wand2 size={24} />
               </div>
               <h3 className="font-bold text-xl mb-3 text-[var(--text-dark)]">Smart Fixes</h3>
               <p className="text-[var(--text-muted)] leading-relaxed font-medium">Receive actionable before & after code examples directly in your editor.</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
               initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
               className="group flex flex-col bg-[var(--card-bg)] backdrop-blur-sm border border-black/5 rounded-[20px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(255,107,53,0.1)] transition-all duration-300"
            >
               <div className="w-12 h-12 rounded-xl bg-[#fff0e6] flex items-center justify-center text-[var(--gradient-hot)] mb-6 group-hover:scale-110 transition-transform">
                  <FileCode2 size={24} />
               </div>
               <h3 className="font-bold text-xl mb-3 text-[var(--text-dark)]">Auto Docs</h3>
               <p className="text-[var(--text-muted)] leading-relaxed font-medium">Automatic generation of JSDoc, READMEs, and component prop tables.</p>
            </motion.div>

         </div>
      </section>

    </div>
  )
}
