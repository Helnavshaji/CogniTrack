import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import AlexMascot from "./AlexMascot"

export default function Dashboard({ sessions = [], loading, currentUser = "helna", onlyCharts = false }) {
  const navigate = useNavigate()
  const [expandedTimelineIdx, setExpandedTimelineIdx] = useState(null)

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: "center", color: "var(--text-secondary)" }}>
        <AlexMascot size={80} state="thinking" style={{ marginBottom: 20 }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
          Reading your mind logs...
        </p>
      </div>
    )
  }

  // Calculate dynamic stats
  const totalEntries = sessions.length
  const currentStreak = totalEntries > 0 ? `${totalEntries} days` : "0 days"
  
  // Calculate average emotional valence to determine mood
  let avgValence = 0
  if (totalEntries > 0) {
    const sum = sessions.reduce((acc, s) => acc + (s.emotional_valence ?? 0), 0)
    avgValence = sum / totalEntries
  }
  
  let moodVibe = "No data yet 😐"
  if (totalEntries > 0) {
    if (avgValence >= 0.25) moodVibe = "Sunny Day ☀️"
    else if (avgValence >= 0.05) moodVibe = "Calm Breeze 🍃"
    else if (avgValence >= -0.1) moodVibe = "Neutral Vibe 😐"
    else moodVibe = "Heavy Heart 😔"
  }

  const completedCount = Math.min(7, totalEntries)
  const goalPercentage = Math.round((completedCount / 7) * 100)

  // Map database session list for Recharts
  const chartData = sessions.map((s, i) => ({
    day: `Session ${i + 1}`,
    speech_rate_wpm: s.speech_rate_wpm ?? 120,
    semantic_coherence: s.semantic_coherence ? Math.round(s.semantic_coherence * 100) : 85,
    emotional_valence: s.emotional_valence ? Number(s.emotional_valence.toFixed(2)) : 0.2,
    type_token_ratio: s.type_token_ratio ? Number(s.type_token_ratio.toFixed(2)) : 0.65,
    energy_variability: s.energy_variability ? Number(s.energy_variability.toFixed(2)) : 1.2
  }))

  const renderCharts = () => (
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 22 }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 10 }}
    >
      {/* 1. Speech Rate Trend */}
      <motion.div 
        className="clay-card" 
        whileHover={{ y: -6, scale: 1.015, boxShadow: "0 18px 30px rgba(157, 123, 255, 0.1)" }}
        style={{ padding: 20, background: 'white', height: 260 }}
      >
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 14 }}>🗣️ Speech Pace (WPM)</h4>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 123, 255, 0.08)" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
            <Line type="monotone" dataKey="speech_rate_wpm" stroke="var(--secondary-purple)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 2. Emotional Valence Trend */}
      <motion.div 
        className="clay-card" 
        whileHover={{ y: -6, scale: 1.015, boxShadow: "0 18px 30px rgba(157, 123, 255, 0.1)" }}
        style={{ padding: 20, background: 'white', height: 260 }}
      >
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 14 }}>😊 Emotional Valence (-1 to 1)</h4>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 123, 255, 0.08)" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
            <Line type="monotone" dataKey="emotional_valence" stroke="var(--accent-pink)" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 3. Semantic Coherence Trend */}
      <motion.div 
        className="clay-card" 
        whileHover={{ y: -6, scale: 1.015, boxShadow: "0 18px 30px rgba(157, 123, 255, 0.1)" }}
        style={{ padding: 20, background: 'white', height: 260 }}
      >
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 14 }}>🧩 Topic Coherence (%)</h4>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 123, 255, 0.08)" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
            <Line type="monotone" dataKey="semantic_coherence" stroke="#00f5d4" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 4. Vocabulary Richness Trend */}
      <motion.div 
        className="clay-card" 
        whileHover={{ y: -6, scale: 1.015, boxShadow: "0 18px 30px rgba(157, 123, 255, 0.1)" }}
        style={{ padding: 20, background: 'white', height: 260 }}
      >
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 14 }}>🌸 Lexical Richness (TTR)</h4>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 123, 255, 0.08)" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
            <Line type="monotone" dataKey="type_token_ratio" stroke="#ff9f1c" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 5. Energy Variability Trend */}
      <motion.div 
        className="clay-card" 
        whileHover={{ y: -6, scale: 1.015, boxShadow: "0 18px 30px rgba(157, 123, 255, 0.1)" }}
        style={{ padding: 20, background: 'white', height: 260 }}
      >
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 14 }}>⚡ Vocal Energy Variability</h4>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
            <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(157, 123, 255, 0.08)" />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
            <Line type="monotone" dataKey="energy_variability" stroke="#39ff14" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )

  if (onlyCharts) {
    return sessions.length > 0 ? renderCharts() : (
      <div className="clay-card" style={{ padding: 60, textAlign: 'center', background: 'white' }}>
        <AlexMascot size={80} state="idle" style={{ marginBottom: 16 }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          No data logged yet. Complete a check-in to see your trends!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30, paddingBottom: 40 }}>
      
      {/* 1. HERO CHECK-IN BANNER */}
      <motion.div 
        className="clay-card"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        whileHover={{ y: -6, boxShadow: "0 22px 35px rgba(157, 123, 255, 0.12)" }}
        style={{
          padding: '36px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          background: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Sparkles icons on right */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.15, 1] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          style={{ position: 'absolute', right: 30, bottom: 25, opacity: 0.6, fontSize: '2rem', pointerEvents: 'none' }}
        >
          ✨
        </motion.div>
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          style={{ position: 'absolute', right: 70, top: 25, opacity: 0.4, fontSize: '1.2rem', pointerEvents: 'none' }}
        >
          ⭐
        </motion.div>
        
        <AlexMascot size={120} state="idle" />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, zIndex: 5, maxWidth: '75%' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            Good Morning, {currentUser}!
          </h2>
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)', 
            lineHeight: 1.6,
            marginBottom: 8 
          }}>
            How has your energy and emotional balance been feeling? Let's take four quick conversational steps together to check in on your wellness.
          </p>
          <div>
            <motion.button 
              onClick={() => navigate('/checkin')}
              className="clay-btn-cta"
              whileHover={{ y: 2, borderBottomWidth: "2px", boxShadow: "0 4px 10px rgba(157, 123, 255, 0.15)" }}
              whileTap={{ y: 5, borderBottomWidth: "0px", scale: 0.98 }}
            >
              Start Today's Check-In <span style={{ fontSize: '1.1rem' }}>→</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 2. FIVE COLORED STATS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 16
      }}>
        {/* Check-ins card */}
        <motion.div 
          className="clay-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: 0.0 },
            y: { repeat: Infinity, duration: 5.2, ease: "easeInOut", delay: 0.0 }
          }}
          whileHover={{ y: -9, scale: 1.03, boxShadow: "0 15px 25px rgba(157, 123, 255, 0.08)" }}
          whileTap={{ scale: 0.97 }}
          style={{ 
            padding: '24px 20px', 
            backgroundColor: '#EBF8FF', 
            border: '3px solid #FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: 2 }}>📅</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2B6CB0', letterSpacing: '0.5px' }}>CHECK-INS</span>
          <strong style={{ fontSize: '1.6rem', color: '#2B6CB0', fontWeight: 800 }}>{totalEntries}</strong>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Total entries</span>
        </motion.div>

        {/* Streak card */}
        <motion.div 
          className="clay-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: 0.1 },
            y: { repeat: Infinity, duration: 5.6, ease: "easeInOut", delay: 0.1 }
          }}
          whileHover={{ y: -9, scale: 1.03, boxShadow: "0 15px 25px rgba(157, 123, 255, 0.08)" }}
          whileTap={{ scale: 0.97 }}
          style={{ 
            padding: '24px 20px', 
            backgroundColor: '#FFFBEB', 
            border: '3px solid #FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: 2 }}>🔥</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D97706', letterSpacing: '0.5px' }}>STREAK</span>
          <strong style={{ fontSize: '1.6rem', color: '#D97706', fontWeight: 800 }}>{currentStreak}</strong>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Consecutive</span>
        </motion.div>

        {/* Avg Mood card */}
        <motion.div 
          className="clay-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: 0.2 },
            y: { repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.2 }
          }}
          whileHover={{ y: -9, scale: 1.03, boxShadow: "0 15px 25px rgba(157, 123, 255, 0.08)" }}
          whileTap={{ scale: 0.97 }}
          style={{ 
            padding: '24px 20px', 
            backgroundColor: '#FFF5F5', 
            border: '3px solid #FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: 2 }}>😊</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#E53E3E', letterSpacing: '0.5px' }}>AVG MOOD</span>
          <strong style={{ fontSize: '1.15rem', color: '#E53E3E', fontWeight: 800, height: 32, display: 'flex', alignItems: 'center' }}>
            {moodVibe}
          </strong>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Frequent vibe</span>
        </motion.div>

        {/* Completed card */}
        <motion.div 
          className="clay-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: 0.3 },
            y: { repeat: Infinity, duration: 5.4, ease: "easeInOut", delay: 0.3 }
          }}
          whileHover={{ y: -9, scale: 1.03, boxShadow: "0 15px 25px rgba(157, 123, 255, 0.08)" }}
          whileTap={{ scale: 0.97 }}
          style={{ 
            padding: '24px 20px', 
            backgroundColor: '#F0FDF4', 
            border: '3px solid #FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: 2 }}>✅</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', letterSpacing: '0.5px' }}>COMPLETED</span>
          <strong style={{ fontSize: '1.6rem', color: '#166534', fontWeight: 800 }}>{completedCount}/7</strong>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>This week</span>
        </motion.div>

        {/* Weekly Goal card */}
        <motion.div 
          className="clay-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { duration: 0.4, delay: 0.4 },
            y: { repeat: Infinity, duration: 5.0, ease: "easeInOut", delay: 0.4 }
          }}
          whileHover={{ y: -9, scale: 1.03, boxShadow: "0 15px 25px rgba(157, 123, 255, 0.08)" }}
          whileTap={{ scale: 0.97 }}
          style={{ 
            padding: '24px 20px', 
            backgroundColor: '#FDF4FF', 
            border: '3px solid #FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '1.6rem', marginBottom: 2 }}>📈</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#86198F', letterSpacing: '0.5px' }}>WEEKLY GOAL</span>
          <strong style={{ fontSize: '1.6rem', color: '#86198F', fontWeight: 800 }}>{goalPercentage}%</strong>
          <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 10, overflow: 'hidden', marginTop: 2 }}>
            <div style={{ width: `${goalPercentage}%`, height: '100%', backgroundColor: '#86198F', borderRadius: 10 }} />
          </div>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{totalEntries} of 7 target</span>
        </motion.div>
      </div>

      {/* 3. RECENT JOURNAL TIMELINES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Recent Journal Timelines
          </h3>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: 'var(--primary-lavender)',
            color: 'white'
          }}>
            {sessions.length} listed
          </span>
        </div>

        {sessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[...sessions].reverse().slice(0, 3).map((s, idx) => (
              <motion.div 
                key={idx} 
                className="clay-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.01, boxShadow: "0 15px 30px rgba(157, 123, 255, 0.1)" }}
                style={{ padding: 24, background: 'white' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <strong style={{ color: 'var(--secondary-purple)', fontFamily: 'var(--font-heading)' }}>
                    🗓️ Check-In: {s.date}
                  </strong>
                  <motion.button 
                    onClick={() => setExpandedTimelineIdx(expandedTimelineIdx === idx ? null : idx)}
                    className="clay-btn-cta"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: '6px 14px', fontSize: '0.75rem', borderBottomWidth: '3px' }}
                  >
                    {expandedTimelineIdx === idx ? "Hide Details" : "View Details"}
                  </motion.button>
                </div>
                
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                  "{s.transcript && s.transcript.length > 90 ? s.transcript.substring(0, 90) + '...' : s.transcript}"
                </p>

                <AnimatePresence initial={false}>
                  {expandedTimelineIdx === idx && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: '2px dashed var(--bg-light)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Report Preview:</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-light)', padding: 14, borderRadius: 16, whiteSpace: 'pre-line', lineHeight: 1.45 }}>
                          {s.report ? s.report.substring(0, 250) + '...' : "No detailed report text stored."}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State Illustration with Mascot */
          <div className="clay-card" style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16
          }}>
            <AlexMascot size={80} state="idle" />
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontFamily: 'var(--font-heading)'
            }}>
              No check-in entries listed yet. Complete your first voice check-in to start your timeline!
            </p>
          </div>
        )}
      </div>

    </div>
  )
}