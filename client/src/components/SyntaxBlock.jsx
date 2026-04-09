import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function SyntaxBlock({ code = '', language = 'javascript', maxHeight = '400px' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-xl overflow-hidden shadow-md shadow-[#1a1207]/10" style={{ border: '1px solid rgba(26,18,7,0.1)' }}>
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {copied ? <Check size={14} className="text-[#00ff88]" /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <div className="bg-[#14110f]" style={{ maxHeight, overflowY: 'auto' }}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            background: '#080d1a',
            padding: '1rem',
            fontSize: '13px',
            lineHeight: '1.6',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
          lineNumberStyle={{ color: 'rgba(255,255,255,0.15)', minWidth: '2.5em', userSelect: 'none' }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
