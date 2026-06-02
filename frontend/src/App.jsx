import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './Dashboard'
import Checkin from './Checkin'

const API = "http://localhost:8000"

const parseReport = (reportText) => {
  if (!reportText) return []
  
  const headers = [
    { title: "💬 How you seemed today", key: "seemed", marker: "💬", border: "var(--accent-purple)" },
    { title: "🌟 What I noticed about you", key: "noticed", marker: "🌟", border: "var(--accent-teal)" },
    { title: "🤝 Real talk from your friend", key: "advice", marker: "🤝", border: "var(--accent-orange)" },
    { title: "🎯 Your one thing for tomorrow", key: "goal", marker: "🎯", border: "var(--accent-pink)" },
    { title: "💙 I'm proud of you", key: "closing", marker: "💙", border: "var(--accent-purple)" }
  ]

  let parsed = []
  let text = reportText

  for (let i = 0; i < headers.length; i++) {
    const current = headers[i]
    const next = headers[i + 1]

    let startIndex = text.indexOf(current.marker)
    if (startIndex === -1) {
      const textWithoutEmoji = current.title.substring(2)
      startIndex = text.indexOf(textWithoutEmoji)
    }

    if (startIndex !== -1) {
      let endIndex = text.length
      if (next) {
        let nextIndex = text.indexOf(next.marker)
        if (nextIndex === -1) {
          nextIndex = text.indexOf(next.title.substring(2))
        }
        if (nextIndex !== -1 && nextIndex > startIndex) {
          endIndex = nextIndex
        }
      }

      let content = text.substring(startIndex, endIndex).trim()
      const lines = content.split("\n")
      const titleLine = lines[0]
      const body = lines.slice(1).join("\n").trim()

      parsed.push({
        title: titleLine || current.title,
        key: current.key,
        content: body,
        border: current.border
      })
    }
  }

  if (parsed.length === 0) {
    parsed.push({
      title: "📝 Alex's Note",
      key: "full",
      content: reportText,
      border: "var(--accent-purple)"
    })
  }

  return parsed
}

function MainLayout({ userId }) {
  const location = useLocation()
  const navigate = useNavigate()
  
  // States
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splash_shown')
  })
  const [splashFade, setSplashFade] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [showSplashButton, setShowSplashButton] = useState(false)
  
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true) // Sidebar toggle state
  const [expandedSessionIdx, setExpandedSessionIdx] = useState(null) // Expandable history logs state

  const fullPrompt = "Hey Bro..How are you? 👋"

  // Fetch session history
  const fetchHistory = () => {
    axios.get(`${API}/history/${userId}`)
      .then(res => {
        setSessions(res.data.sessions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchHistory()
  }, [userId])

  // Typewriter effect for splash screen
  useEffect(() => {
    if (!showSplash) return
    let index = 0
    const interval = setInterval(() => {
      if (index < fullPrompt.length) {
        setTypewriterText(fullPrompt.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, 55)

    const buttonTimer = setTimeout(() => {
      setShowSplashButton(true)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(buttonTimer)
    }
  }, [showSplash])

  const handleEnterApp = () => {
    setSplashFade(true)
    setTimeout(() => {
      setShowSplash(false)
      sessionStorage.setItem('splash_shown', 'true')
      navigate('/checkin') // Go straight to Check-in active mascot
    }, 800)
  }

  if (showSplash) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0D0D1A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: splashFade ? 0 : 1,
        transition: 'opacity 0.8s ease',
        textAlign: 'center',
        padding: 20
      }}>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.5rem',
          fontWeight: 800,
          color: 'white',
          marginBottom: '2rem',
          minHeight: '80px',
          zIndex: 10,
          textShadow: '0 0 20px rgba(157, 78, 221, 0.4)'
        }}>
          {typewriterText}
        </div>
        {showSplashButton && (
          <button
            onClick={handleEnterApp}
            className="btn-press"
            style={{
              padding: '14px 36px',
              backgroundColor: 'var(--accent-purple)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-neon-purple)',
              animation: 'slideInUp 0.5s ease-out both',
              zIndex: 10
            }}
          >
            lets talk
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Background blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Translucent Brain Background Watermark */}
      <div className="brain-bg" style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(420px, 65vw)',
        height: 'min(420px, 65vw)',
        zIndex: -1,
        pointerEvents: 'none',
        animation: 'brain-pulse 8s infinite ease-in-out'
      }}>
        <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: 'var(--accent-purple)', opacity: 0.85 }}>
          <defs>
            <linearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent-purple)" />
              <stop offset="50%" stopColor="var(--accent-pink)" />
              <stop offset="100%" stopColor="var(--accent-teal)" />
            </linearGradient>
          </defs>
          {/* Left Hemisphere Outer Contour */}
          <path d="M 100,35 C 65,35 45,60 45,95 C 45,118 55,134 55,152 C 55,170 72,176 88,162 C 94,157 100,150 100,140" stroke="url(#brainGrad)" />
          {/* Right Hemisphere Outer Contour */}
          <path d="M 100,35 C 135,35 155,60 155,95 C 155,118 145,134 145,152 C 145,170 128,176 112,162 C 106,157 100,150 100,140" stroke="url(#brainGrad)" />
          
          {/* Lobe folding detail curves */}
          <path d="M 68,70 C 62,80 72,90 82,85" stroke="url(#brainGrad)" strokeWidth="1" />
          <path d="M 132,70 C 138,80 128,90 118,85" stroke="url(#brainGrad)" strokeWidth="1" />
          <path d="M 52,100 C 62,95 72,105 68,115" stroke="url(#brainGrad)" strokeWidth="1" />
          <path d="M 148,100 C 138,95 128,105 132,115" stroke="url(#brainGrad)" strokeWidth="1" />
          <path d="M 68,130 C 62,140 78,145 88,135" stroke="url(#brainGrad)" strokeWidth="1" />
          <path d="M 132,130 C 138,140 122,145 112,135" stroke="url(#brainGrad)" strokeWidth="1" />
          
          {/* Internal neural node connection paths */}
          <path d="M 100,50 Q 82,70 78,90 Q 74,110 88,120" stroke="url(#brainGrad)" strokeWidth="0.8" strokeDasharray="3,3" />
          <path d="M 100,50 Q 118,70 122,90 Q 126,110 112,120" stroke="url(#brainGrad)" strokeWidth="0.8" strokeDasharray="3,3" />
        </svg>
      </div>

      {/* Center Website Name Header */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 25,
        transform: 'translateX(-50%)',
        fontSize: '1.6rem',
        fontWeight: 800,
        color: 'white',
        fontFamily: 'var(--font-heading)',
        zIndex: 80,
        textShadow: '0 0 15px rgba(157, 78, 221, 0.4)',
        pointerEvents: 'none'
      }}>
        CogniTrack
      </div>

      {/* Floating Toggle Sidebar Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="btn-press" 
        style={{
          position: 'fixed',
          left: 20,
          top: 20,
          zIndex: 150,
          width: 44,
          height: 44,
          borderRadius: 12,
          border: '1px solid var(--border-glass)',
          background: 'rgba(20, 20, 45, 0.6)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          outline: 'none'
        }}
        title={sidebarOpen ? "Hide Dashboard" : "Show Dashboard"}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Translucent Left Hidable Sidebar */}
      <aside className="glass" style={{
        position: 'fixed',
        left: sidebarOpen ? 20 : -320, // Slide off-screen if closed
        top: 80,
        bottom: 20,
        width: 300,
        borderRadius: 24,
        padding: '30px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid var(--border-glass)',
        zIndex: 100,
        overflow: 'hidden',
        transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link to="/checkin" className="btn-press" style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-pink) 100%)',
            color: 'white',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 700,
            textAlign: 'center',
            display: 'block',
            boxShadow: '0 5px 15px rgba(255, 0, 127, 0.3)',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-heading)'
          }}>
            lets talk 🗣️
          </Link>
          
          <Link to="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 8,
            background: location.pathname === '/' ? 'rgba(255,255,255,0.08)' : 'transparent',
            transition: 'background 0.2s',
            fontFamily: 'var(--font-body)'
          }}>
            Trends 📊
          </Link>
        </nav>

        {/* History Logs */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-body)' }}>
            History Logs
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 4 }}>
            {sessions.length > 0 ? (
              [...sessions].reverse().map((s, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                  <button 
                    onClick={() => setExpandedSessionIdx(expandedSessionIdx === idx ? null : idx)}
                    className="btn-press"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      outline: 'none',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>
                      🗓️ {s.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s.emotional_valence >= 0 ? "😊" : "😔"}
                      <span style={{ 
                        fontSize: '0.65rem', 
                        transform: expandedSessionIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s',
                        color: 'var(--text-secondary)'
                      }}>
                        ▼
                      </span>
                    </span>
                  </button>
                  
                  {expandedSessionIdx === idx && (
                    <div style={{
                      padding: '14px',
                      borderRadius: 12,
                      background: 'rgba(20, 20, 45, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5,
                      animation: 'slideInUp 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12
                    }}>
                      {/* 1. Complete Chat History */}
                      {s.conversation_history && s.conversation_history.length > 0 && (
                        <div>
                          <strong style={{ color: 'var(--accent-teal)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                            💬 Dialogue History
                          </strong>
                          <div style={{
                            maxHeight: '130px',
                            overflowY: 'auto',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            border: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8
                          }}>
                            {s.conversation_history.map((msg, midx) => (
                              <div key={midx} style={{ lineHeight: 1.35 }}>
                                <span style={{ 
                                  fontWeight: 800, 
                                  fontSize: '0.62rem', 
                                  color: msg.role === 'user' ? 'var(--accent-teal)' : 'var(--accent-orange)',
                                  display: 'block',
                                  letterSpacing: '0.3px',
                                  marginBottom: 2
                                }}>
                                  {msg.role === 'user' ? 'YOU' : 'ALEX'}
                                </span>
                                <span style={{ color: '#E2E8F0', fontSize: '0.72rem' }}>
                                  {msg.content}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Personal Report Sections */}
                      {s.report && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <strong style={{ color: 'var(--accent-pink)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                            📝 Personal Report
                          </strong>
                          {parseReport(s.report).map((card) => (
                            <div key={card.key} style={{
                              padding: '8px 10px',
                              borderRadius: 8,
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderLeft: `3px solid ${card.border || 'var(--accent-purple)'}`,
                              fontSize: '0.72rem'
                            }}>
                              <strong style={{ color: 'white', display: 'block', marginBottom: 4 }}>
                                {card.title}
                              </strong>
                              <div style={{ color: '#CBD5E1', whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                                {card.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
                No logs yet.
              </div>
            )}
          </div>
        </div>
      </aside>

      <main style={{
        maxWidth: 800,
        marginLeft: sidebarOpen ? 340 : 'auto',
        marginRight: 'auto',
        padding: '100px 40px 60px',
        position: 'relative',
        zIndex: 10,
        transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard sessions={sessions} loading={loading} />} />
          <Route path="/checkin" element={<Checkin userId={userId} onRefreshHistory={fetchHistory} />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const userId = "user_001"
  return (
    <Router>
      <MainLayout userId={userId} />
    </Router>
  )
}