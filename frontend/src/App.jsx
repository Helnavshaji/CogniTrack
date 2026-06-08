import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Dashboard from './Dashboard'
import Checkin from './Checkin'
import AlexMascot from './AlexMascot'

const API = "http://localhost:8000"

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -24, scale: 0.98 }}
    transition={{ 
      type: "spring",
      stiffness: 180,
      damping: 24,
      mass: 0.8
    }}
    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}
  >
    {children}
  </motion.div>
)

const parseReport = (reportText) => {
  if (!reportText) return []
  
  const headers = [
    { title: "💬 How you seemed today", key: "seemed", marker: "💬", border: "#BFA2FF" },
    { title: "🌟 What I noticed about you", key: "noticed", marker: "🌟", border: "#00f5d4" },
    { title: "🤝 Real talk from your friend", key: "advice", marker: "🤝", border: "#ff9f1c" },
    { title: "🎯 Your one thing for tomorrow", key: "goal", marker: "🎯", border: "#ff007f" },
    { title: "💙 I'm proud of you", key: "closing", marker: "💙", border: "#9d4edd" }
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
      border: "#BFA2FF"
    })
  }

  return parsed
}

function MainLayout({ userId, currentUser, onSignOut }) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedSessionIdx, setExpandedSessionIdx] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch session history
  const fetchHistory = () => {
    setLoading(true)
    axios.get(`${API}/history/${userId}`)
      .then(res => {
        const fetchedSessions = res.data.sessions || []
        setSessions(fetchedSessions)
        localStorage.setItem(`cognitrack_sessions_${userId}`, JSON.stringify(fetchedSessions))
        setLoading(false)
      })
      .catch(() => {
        const stored = localStorage.getItem(`cognitrack_sessions_${userId}`)
        if (stored) {
          try {
            setSessions(JSON.parse(stored))
          } catch (e) {
            setSessions([])
          }
        } else {
          setSessions([])
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchHistory()
  }, [userId])

  // Filter sessions based on search
  const filteredSessions = sessions.filter(s => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (s.date && s.date.includes(q)) || 
           (s.transcript && s.transcript.toLowerCase().includes(q)) ||
           (s.report && s.report.toLowerCase().includes(q))
  })

  const userInitial = currentUser ? currentUser.charAt(0).toUpperCase() : 'U'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-light)', width: '100%' }}>
      
      {/* LEFT SIDEBAR (Claymorphic Navigation Panels) */}
      <aside style={{
        width: 320,
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        zIndex: 100,
        flexShrink: 0
      }}>
        
        {/* LOGO CARD */}
        <motion.div 
          className="clay-card" 
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          whileHover={{ y: -7, scale: 1.02, boxShadow: "0 18px 30px rgba(157, 123, 255, 0.12)" }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <AlexMascot size={44} state="idle" />
          <div>
            <h1 style={{ 
              fontSize: '1.45rem', 
              color: 'var(--secondary-purple)', 
              fontWeight: 800,
              lineHeight: 1.1 
            }}>
              CogniTrack
            </h1>
            <span style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)', 
              fontWeight: 600,
              letterSpacing: '0.2px'
            }}>
              Your Voice Companion
            </span>
          </div>
        </motion.div>

        {/* COMPANION PROFILE CARD */}
        <motion.div 
          className="clay-card" 
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.2 }}
          whileHover={{ y: -7, scale: 1.02, boxShadow: "0 18px 30px rgba(157, 123, 255, 0.12)" }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: '#FFD6E7',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--secondary-purple)',
            boxShadow: '0 4px 10px rgba(157, 123, 255, 0.1)'
          }}>
            {userInitial}
          </div>
          <div>
            <div style={{ 
              fontSize: '0.62rem', 
              color: 'var(--secondary-purple)', 
              fontWeight: 800, 
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}>
              COMPANION
            </div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Hello, {currentUser}!
            </h3>
          </div>
        </motion.div>

        {/* NAVIGATION BUTTONS CARD */}
        <motion.div 
          className="clay-card" 
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.4 }}
          style={{
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'white',
            flex: 1
          }}
        >
          <motion.div whileHover={{ x: 6, scale: 1.015 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
            <Link 
              to="/" 
              className={`clay-btn-nav ${location.pathname === '/' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: '1.15rem' }}>🎛️</span> Dashboard
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ x: 6, scale: 1.015 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
            <Link 
              to="/checkin" 
              className={`clay-btn-nav ${location.pathname === '/checkin' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: '1.15rem' }}>🎙️</span> Daily Check-In
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 6, scale: 1.015 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
            <Link 
              to="/history" 
              className={`clay-btn-nav ${location.pathname === '/history' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: '1.15rem' }}>🗓️</span> History Logs
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 6, scale: 1.015 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
            <Link 
              to="/reports" 
              className={`clay-btn-nav ${location.pathname === '/reports' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: '1.15rem' }}>📝</span> AI Reports
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 6, scale: 1.015 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
            <Link 
              to="/trends" 
              className={`clay-btn-nav ${location.pathname === '/trends' ? 'active' : ''}`}
              style={{ width: '100%' }}
            >
              <span style={{ fontSize: '1.15rem' }}>📊</span> Trends & Baselines
            </Link>
          </motion.div>


        </motion.div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px 40px 30px 20px', overflowX: 'hidden' }}>
        
        {/* TOP FLOATING NAVIGATION */}
        <header className="clay-card" style={{
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          marginBottom: 30
        }}>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 450 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search check-ins or reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500
              }}
            />
          </div>

          {/* Right Header items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Notification bell */}
            <button className="btn-press" style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-light)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.05rem',
              cursor: 'pointer'
            }}>
              🔔
            </button>
            
            {/* Sign Out Button */}
            <button 
              onClick={onSignOut}
              className="clay-btn-cta" 
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.85rem', 
                backgroundColor: 'white', 
                color: 'var(--text-primary)',
                border: '2px solid var(--bg-light)',
                borderBottom: '4px solid #DDEEFF',
                boxShadow: 'none',
                background: 'white'
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </header>

        {/* DYNAMIC SCREEN ROUTING */}
        <main style={{ flex: 1, minHeight: 0 }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
            <Route 
              path="/" 
              element={
                <PageTransition>
                  <Dashboard sessions={filteredSessions} loading={loading} currentUser={currentUser} />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/checkin" 
              element={
                <PageTransition>
                  <Checkin userId={userId} onRefreshHistory={fetchHistory} currentUser={currentUser} />
                </PageTransition>
              } 
            />

            {/* Timelines Route */}
            <Route 
              path="/history" 
              element={
                <PageTransition>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                      🗓️ History Logs ({filteredSessions.length} listed)
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {filteredSessions.length > 0 ? (
                        [...filteredSessions].reverse().map((s, idx) => (
                          <div key={idx} className="clay-card" style={{ padding: 24, background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <strong style={{ color: 'var(--secondary-purple)', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
                                🗓️ Check-In: {s.date}
                              </strong>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: 12,
                                backgroundColor: s.emotional_valence >= 0 ? 'var(--soft-green)' : 'var(--soft-pink)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: s.emotional_valence >= 0 ? '#1b5e20' : '#b71c1c'
                              }}>
                                {s.emotional_valence >= 0 ? "😊 Calm Breeze" : "😔 Heavy Heart"}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              {/* Dialogue list */}
                              {s.conversation_history && s.conversation_history.length > 0 && (
                                <div style={{ background: 'var(--bg-light)', borderRadius: 16, padding: '12px 16px' }}>
                                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                                    💬 Dialogue Script
                                  </strong>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {s.conversation_history.map((msg, midx) => (
                                      <div key={midx} style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                                        <span style={{ fontWeight: 800, color: msg.role === 'user' ? 'var(--secondary-purple)' : '#BFA2FF' }}>
                                          {msg.role === 'user' ? 'You: ' : 'Alex: '}
                                        </span>
                                        <span style={{ color: 'var(--text-primary)' }}>{msg.content}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Metrics indicators */}
                              <div style={{ display: 'flex', gap: 20, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <div>🗣️ Speech Pace: <strong style={{ color: 'var(--text-primary)' }}>{s.speech_rate_wpm ? s.speech_rate_wpm.toFixed(0) : 0} WPM</strong></div>
                                <div>🧩 Topic Coherence: <strong style={{ color: 'var(--text-primary)' }}>{s.semantic_coherence ? (s.semantic_coherence * 100).toFixed(0) : 0}%</strong></div>
                                <div>🌸 Vocabulary Richness: <strong style={{ color: 'var(--text-primary)' }}>{s.type_token_ratio ? s.type_token_ratio.toFixed(2) : '0.00'}</strong></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="clay-card" style={{ padding: '60px 20px', textAlign: 'center', background: 'white' }}>
                          <AlexMascot size={72} state="idle" style={{ marginBottom: 16 }} />
                          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No check-in logs found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </PageTransition>
              } 
            />

            {/* Reports Route */}
            <Route 
              path="/reports" 
              element={
                <PageTransition>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                      📝 AI Reports History
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {filteredSessions.length > 0 ? (
                        [...filteredSessions].reverse().map((s, idx) => (
                          s.report ? (
                            <div key={idx} className="clay-card" style={{ padding: '36px 30px', background: 'white', display: 'flex', flexDirection: 'column', gap: 20 }}>
                              
                              {/* Letter Header */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                  <h3 style={{ fontSize: '2.2rem', color: 'var(--secondary-purple)', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                                    Today's Letter
                                  </h3>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.5px' }}>
                                    COMPOSED ON {formatReportDate(s.date)}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <div style={{
                                    padding: '6px 12px',
                                    borderRadius: 20,
                                    backgroundColor: s.emotional_valence >= 0 ? '#FFEBEE' : '#FFEBEE', 
                                    color: '#E53E3E',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}>
                                    {s.emotional_valence >= 0 ? "😊 Calm Breeze 🌿" : "😔 Heavy Heart 🌧️"}
                                  </div>
                                  <div style={{
                                    padding: '6px 12px',
                                    borderRadius: 20,
                                    backgroundColor: '#FFFFFF',
                                    border: '2px solid #E2E8F0',
                                    color: 'var(--secondary-purple)',
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.5px'
                                  }}>
                                    WRITTEN BY ALEX
                                  </div>
                                </div>
                              </div>

                              <div style={{ borderBottom: '2px dashed var(--bg-light)' }} />

                              {/* Letter Content */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {parseReport(s.report).map((card) => {
                                  let dotColor = '#BFA2FF' 
                                  let cardBg = '#F6F0FF'
                                  if (card.key === 'noticed') {
                                    dotColor = '#FFF1B8' 
                                    cardBg = '#FFFDF5'
                                  } else if (card.key === 'advice') {
                                    dotColor = '#FFD6E7' 
                                    cardBg = '#FFF5FA'
                                  } else if (card.key === 'goal') {
                                    dotColor = '#D8F5D0' 
                                    cardBg = '#F4FDF2'
                                  } else if (card.key === 'closing') {
                                    dotColor = '#DDEEFF' 
                                    cardBg = '#F5FAFF'
                                  }

                                  if (card.key === 'goal') {
                                    return (
                                      <div key={card.key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.98rem', fontWeight: 800, color: 'var(--secondary-purple)' }}>
                                          <span style={{ color: dotColor, fontSize: '1.2rem' }}>●</span> One Small Goal For Tomorrow
                                        </div>
                                        <div style={{
                                          padding: '16px 20px',
                                          borderRadius: 16,
                                          background: cardBg,
                                          border: '2px solid #D8F5D0',
                                          fontSize: '1rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 12
                                        }}>
                                          <span style={{ fontSize: '1.5rem' }}>🎯</span>
                                          <p style={{ color: '#1b5e20', margin: 0, fontWeight: 700, lineHeight: 1.4 }}>
                                            {card.content}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  }

                                  let cleanTitle = card.title
                                  if (card.key === 'seemed') cleanTitle = "How You Seemed Today"
                                  else if (card.key === 'noticed') cleanTitle = "What I Noticed"
                                  else if (card.key === 'advice') cleanTitle = "Real Talk From Your Friend"
                                  else if (card.key === 'closing') cleanTitle = "Proud of You"

                                  return (
                                    <div key={card.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.98rem', fontWeight: 800, color: 'var(--secondary-purple)' }}>
                                        <span style={{ color: dotColor, fontSize: '1.2rem' }}>●</span> {cleanTitle}
                                      </div>
                                      <div style={{
                                        padding: '16px 20px',
                                        borderRadius: 16,
                                        background: cardBg,
                                        border: '1.5px solid #FFFFFF',
                                        fontSize: '1rem'
                                      }}>
                                        <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.5, margin: 0 }}>
                                          {card.content}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Letter Footer */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 10,
                                borderTop: '2px dashed var(--bg-light)',
                                paddingTop: 20,
                                flexWrap: 'wrap',
                                gap: 16
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <AlexMascot size={44} state="comforting" />
                                  <div>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                                      COMPANION
                                    </span>
                                    <strong style={{ fontSize: '0.98rem', color: 'var(--secondary-purple)' }}>– Alex 💜</strong>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                  <Link to="/history" className="clay-btn-cta" style={{ padding: '8px 16px', fontSize: '0.8rem', backgroundColor: '#EBF8FF', color: '#2B6CB0', border: '1.5px solid #FFFFFF', borderBottom: '3px solid #BEE3F8', boxShadow: 'none', background: '#EBF8FF' }}>
                                    📖 History Timeline
                                  </Link>
                                  <Link to="/checkin" className="clay-btn-cta" style={{ padding: '8px 16px', fontSize: '0.8rem', borderBottomWidth: '3px' }}>
                                    💜 Chat Again
                                  </Link>
                                </div>
                              </div>

                            </div>
                          ) : null
                        ))
                      ) : (
                        <div className="clay-card" style={{ padding: '60px 20px', textAlign: 'center', background: 'white' }}>
                          <AlexMascot size={72} state="idle" style={{ marginBottom: 16 }} />
                          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No reports generated yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </PageTransition>
              } 
            />

            {/* Trends Route */}
            <Route 
              path="/trends" 
              element={
                <PageTransition>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                      📊 Detailed Trends & Baselines
                    </h2>
                    <Dashboard sessions={sessions} loading={loading} currentUser={currentUser} onlyCharts={true} />
                  </div>
                </PageTransition>
              } 
            />
          </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

const formatReportDate = (dateStr) => {
  if (!dateStr) return ""
  try {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      const dt = new Date(year, month, day)
      return dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
    }
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
  } catch (e) {
    return dateStr.toUpperCase()
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true'
  })
  const [currentUser, setCurrentUser] = useState(() => {
    return sessionStorage.getItem('username') || 'helna'
  })
  
  // Auth states
  const [authMode, setAuthMode] = useState("login") // 'login' or 'register'
  const [usernameInput, setUsernameInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("")
  const [authError, setAuthError] = useState("")
  const [authSuccess, setAuthSuccess] = useState("")

  // Fetch local users list
  const getUsers = () => {
    const users = localStorage.getItem('cognitrack_users')
    if (!users) {
      const initialUsers = { "helna": "password123" }
      localStorage.setItem('cognitrack_users', JSON.stringify(initialUsers))
      return initialUsers
    }
    try {
      return JSON.parse(users)
    } catch (e) {
      return {}
    }
  }

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    setAuthError("")
    setAuthSuccess("")

    const username = usernameInput.trim()
    const password = passwordInput

    if (!username || !password) {
      setAuthError("Please fill in all fields!")
      return
    }

    const users = getUsers()

    if (authMode === "login") {
      const existingPassword = users[username.toLowerCase()]
      if (!existingPassword) {
        setAuthError("User does not exist. Please create an account!")
        return
      }
      if (existingPassword !== password) {
        setAuthError("Incorrect password!")
        return
      }

      // Successful Login
      setIsLoggedIn(true)
      setCurrentUser(username)
      sessionStorage.setItem('isLoggedIn', 'true')
      sessionStorage.setItem('username', username)
    } else {
      if (users[username.toLowerCase()]) {
        setAuthError("Username already exists!")
        return
      }
      if (password !== confirmPasswordInput) {
        setAuthError("Passwords do not match!")
        return
      }

      // Successful Registration
      users[username.toLowerCase()] = password
      localStorage.setItem('cognitrack_users', JSON.stringify(users))

      setAuthSuccess("Account created successfully! Logging you in...")
      
      setTimeout(() => {
        setIsLoggedIn(true)
        setCurrentUser(username)
        sessionStorage.setItem('isLoggedIn', 'true')
        sessionStorage.setItem('username', username)
      }, 1000)
    }
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    sessionStorage.removeItem('isLoggedIn')
    sessionStorage.removeItem('username')
    setAuthError("")
    setAuthSuccess("")
    setUsernameInput("")
    setPasswordInput("")
    setConfirmPasswordInput("")
  }

  // WELCOME SCREEN (Auth layout matching Apple/Duolingo clay style)
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-light)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        overflow: 'hidden'
      }}>
        {/* Floating Clouds Background */}
        <div className="bg-clouds">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
        </div>

        {/* Decorative Plant elements drawn in SVGs */}
        <svg style={{ position: 'absolute', left: 40, bottom: 20, width: 150, height: 250, opacity: 0.7 }} viewBox="0 0 100 200">
          <path d="M50,200 Q20,130 50,60" fill="none" stroke="var(--primary-lavender)" strokeWidth="6" strokeLinecap="round" />
          <path d="M50,150 Q10,120 20,100" fill="none" stroke="#D8F5D0" strokeWidth="12" strokeLinecap="round" />
          <path d="M50,110 Q90,90 80,70" fill="none" stroke="#DDEEFF" strokeWidth="12" strokeLinecap="round" />
          <path d="M50,70 Q10,50 30,30" fill="none" stroke="#FFF1B8" strokeWidth="10" strokeLinecap="round" />
        </svg>

        <svg style={{ position: 'absolute', right: 40, top: 40, width: 180, height: 250, opacity: 0.6 }} viewBox="0 0 100 200">
          <path d="M50,0 Q80,70 50,140" fill="none" stroke="var(--primary-lavender)" strokeWidth="5" strokeLinecap="round" />
          <path d="M50,50 Q90,80 80,100" fill="none" stroke="#FFD6E7" strokeWidth="14" strokeLinecap="round" />
          <path d="M50,90 Q10,110 20,130" fill="none" stroke="#D8F5D0" strokeWidth="12" strokeLinecap="round" />
        </svg>

        {/* Welcome Card */}
        <motion.div 
          className="clay-card"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ y: -6, boxShadow: "0 20px 35px rgba(157, 123, 255, 0.12)" }}
          style={{
            width: '100%',
            maxWidth: 440,
            padding: '40px 30px',
            textAlign: 'center',
            backgroundColor: 'white',
            zIndex: 10,
            position: 'relative'
          }}
        >
          {/* Mascot Header */}
          <div style={{ marginBottom: 20 }}>
            <AlexMascot size={110} />
          </div>

          <h2 style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 8,
            fontFamily: 'var(--font-heading)'
          }}>
            {authMode === "login" ? "Welcome Back!" : "Join Us!"}
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 30,
            padding: '0 10px'
          }}>
            {authMode === "login" 
              ? "Sign in to start your friendly Daily Voice Check-in with Alex."
              : "Create an account to start your cognitive and mental health monitoring journey."}
          </p>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {authError && (
              <div style={{
                backgroundColor: 'var(--soft-pink)',
                color: '#b71c1c',
                padding: '12px',
                borderRadius: '16px',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '2px solid #FFD6E7',
                textAlign: 'center'
              }}>
                ⚠️ {authError}
              </div>
            )}
            
            {authSuccess && (
              <div style={{
                backgroundColor: 'var(--soft-green)',
                color: '#1b5e20',
                padding: '12px',
                borderRadius: '16px',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '2px solid #D8F5D0',
                textAlign: 'center'
              }}>
                🎉 {authSuccess}
              </div>
            )}

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, paddingLeft: 6 }}>
                Username
              </label>
              <input 
                type="text" 
                className="clay-input"
                placeholder="e.g. helna"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, paddingLeft: 6 }}>
                Password
              </label>
              <input 
                type="password" 
                className="clay-input"
                placeholder=""
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
              />
            </div>

            {authMode === "register" && (
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, paddingLeft: 6 }}>
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  className="clay-input"
                  placeholder=""
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className="clay-btn-cta"
              style={{ width: '100%', padding: '16px', fontSize: '1rem', marginTop: 10 }}
            >
              {authMode === "login" ? "Sign In ⚡" : "Create Account ✨"}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 24, fontWeight: 600 }}>
            {authMode === "login" ? (
              <>
                Don't have an account?{" "}
                <span 
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setAuthSuccess("");
                  }} 
                  style={{ color: 'var(--secondary-purple)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Create Account
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span 
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthSuccess("");
                  }} 
                  style={{ color: 'var(--secondary-purple)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Sign In
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <Router>
      <MainLayout userId={currentUser.toLowerCase()} currentUser={currentUser} onSignOut={handleSignOut} />
    </Router>
  )
}