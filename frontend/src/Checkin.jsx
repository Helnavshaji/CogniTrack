import { useState, useRef, useEffect } from "react"
import axios from "axios"
import AlexMascot from "./AlexMascot"

const API = "http://localhost:8000"

// Typewriter Component for Alex's question
function TypewriterText({ text, speed = 20, onComplete }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let index = 0
    setDisplayedText("")
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        if (onComplete) onComplete()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayedText}</span>
}

// Confetti Component for Report Reveal
function Confetti() {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    const confettiColors = ["#BFA2FF", "#FFD6E7", "#DDEEFF", "#FFF1B8", "#D8F5D0"]
    const items = Array.from({ length: 90 }, (_, i) => {
      const angle = Math.random() * 360
      const distance = Math.random() * 200 + 80
      return {
        id: i,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance - 80,
        size: Math.random() * 10 + 6,
        rotation: Math.random() * 720,
        delay: Math.random() * 0.3,
      }
    })
    setPieces(items)
  }, [])

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10 }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: "50%",
            top: "30%",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "3px",
            opacity: 0,
            "--tx": `${p.x}px`,
            "--ty": `${p.y}px`,
            "--rot": `${p.rotation}deg`,
            animation: "explode-confetti 2.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes explode-confetti {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          80% {
            opacity: 0.9;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(var(--rot));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default function Checkin({ userId, onRefreshHistory, currentUser = "helna" }) {
  const [state, setState] = useState("idle")
  const [question, setQuestion] = useState("")
  const [sessionId, setSessionId] = useState(null)
  const [history, setHistory] = useState([])
  const [exchangeCount, setExchangeCount] = useState(0)
  const [alert, setAlert] = useState(null)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [lastTranscript, setLastTranscript] = useState("")
  const [expandedReportCards, setExpandedReportCards] = useState({ seemed: true }) // Track report cards accordion state
  
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const startSession = async () => {
    try {
      setError(null)
      setReport(null)
      setAlert(null)
      setLastTranscript("")
      setHistory([])
      setExchangeCount(0)
      setState("loading")
      const res = await axios.post(`${API}/session/start`, null, {
        params: { user_id: userId }
      })
      setSessionId(res.data.session_id)
      setQuestion(res.data.first_question)
      setState("question")
    } catch (e) {
      setError("Could not connect. Make sure the backend is running.")
      setState("idle")
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = handleAudioReady
      mediaRef.current = recorder
      recorder.start()
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
      setState("recording")
    } catch (e) {
      setError("Microphone access denied. Please allow microphone in your browser.")
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    mediaRef.current?.stop()
    setState("analyzing")
  }

  const handleAudioReady = async () => {
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      const form = new FormData()
      form.append("audio", blob, "response.webm")
      form.append("session_id", sessionId)
      form.append("user_id", userId)
      form.append("question", question)
      form.append("history", JSON.stringify(history))

      const res = await axios.post(`${API}/session/respond`, form)
      const data = res.data

      setLastTranscript(data.transcript)
      if (data.alert) setAlert(data.alert)

      if (data.status === "complete") {
        if (data.report) setReport(data.report)
        setState("done")
        if (onRefreshHistory) onRefreshHistory()
      } else {
        const newHistory = [
          ...history,
          { role: "assistant", content: question },
          { role: "user", content: data.transcript }
        ]
        setHistory(newHistory)
        setQuestion(data.next_question)
        setExchangeCount(c => c + 1)
        setState("question")
      }
    } catch (e) {
      console.error("Error:", e)
      setError("Something went wrong. Please try again.")
      setState("question")
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  const parseReport = (reportText) => {
    if (!reportText) return []
    
    const headers = [
      { title: "💬 How you seemed today", key: "seemed", marker: "💬", border: "var(--primary-lavender)", bg: "var(--bg-light)" },
      { title: "🌟 What I noticed about you", key: "noticed", marker: "🌟", border: "#00f5d4", bg: "#EBF8FF" },
      { title: "🤝 Real talk from your friend", key: "advice", marker: "🤝", border: "#ff9f1c", bg: "var(--cream)" },
      { title: "🎯 Your one thing for tomorrow", key: "goal", marker: "🎯", border: "#ff007f", bg: "#FDF4FF" },
      { title: "💙 I'm proud of you", key: "closing", marker: "💙", border: "var(--primary-lavender)", bg: "var(--bg-light)" }
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
          border: current.border,
          bg: current.bg
        })
      }
    }

    if (parsed.length === 0) {
      parsed.push({
        title: "📝 Alex's Note",
        key: "full",
        content: reportText,
        border: "var(--primary-lavender)",
        bg: "var(--bg-light)"
      })
    }

    return parsed
  }

  const renderCardContent = (content, key) => {
    if (key === "advice") {
      const items = content.split(/\n|•|- /).map(item => item.trim()).filter(Boolean)
      return (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item, idx) => {
            const words = item.split(" ")
            const boldWordsCount = Math.min(2, words.length)
            const boldPart = words.slice(0, boldWordsCount).join(" ")
            const restPart = words.slice(boldWordsCount).join(" ")

            return (
              <li key={idx} style={{ 
                marginBottom: 14, 
                display: "flex", 
                alignItems: "flex-start",
                gap: 10,
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: "var(--text-primary)"
              }}>
                <span style={{ color: "#ff9f1c", fontSize: 16 }}>⚡</span>
                <span>
                  <strong style={{ color: "var(--text-primary)", fontWeight: 700 }}>{boldPart}</strong> {restPart}
                </span>
              </li>
            )
          })}
        </ul>
      )
    }

    return content.split("\n").map((p, idx) => p.trim() && (
      <p key={idx} style={{ 
        marginBottom: 12, 
        lineHeight: 1.7, 
        fontSize: '0.85rem', 
        color: "var(--text-primary)" 
      }}>
        {p}
      </p>
    ))
  }

  const getSentimentEmoji = (reportText, alertData) => {
    const text = ((reportText || "") + " " + (alertData?.summary || "")).toLowerCase()
    if (text.includes("stress") || text.includes("anxi") || text.includes("worry") || text.includes("overwhelmed")) {
      return { emoji: "😅", label: "Stressed, but keeping it real!" }
    }
    if (text.includes("sleep") || text.includes("tired") || text.includes("exhausted") || text.includes("dream")) {
      return { emoji: "😴", label: "Tired mind — take it easy today!" }
    }
    if (text.includes("eat") || text.includes("food") || text.includes("meal")) {
      return { emoji: "😋", label: "Fueling your body right is step one!" }
    }
    if (text.includes("happy") || text.includes("good") || text.includes("great") || text.includes("smile") || text.includes("celebrate")) {
      return { emoji: "🥳", label: "Vibing high today! Absolutely love to see it!" }
    }
    return { emoji: "🤗", label: "Thanks for checking in today, friend!" }
  }

  // Determine Alex's animation state based on check-in state
  let mascotState = "idle"
  if (state === "recording") mascotState = "listening"
  else if (state === "analyzing") mascotState = "thinking"
  else if (state === "question") mascotState = "speaking"
  else if (state === "done") mascotState = "comforting"

  const sentiment = getSentimentEmoji(report, alert)

  return (
    <div style={{ maxWidth: 680, margin: "10px auto 0", padding: "0 10px" }}>
      
      {error && (
        <div className="clay-card" style={{
          backgroundColor: "#FFF5F5",
          border: "3px solid #FFFFFF",
          borderRadius: 20, 
          padding: 16, 
          color: "#E53E3E",
          marginBottom: 20, 
          fontSize: '0.85rem', 
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(229, 62, 62, 0.05)"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* IDLE LANDING */}
      {state === "idle" && (
        <div className="clay-card" style={{
          padding: '48px 36px',
          textAlign: "center",
          backgroundColor: 'white'
        }}>
          <div style={{ marginBottom: 24 }}>
            <AlexMascot size={120} state="idle" />
          </div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: 12, 
            color: 'var(--text-primary)',
            fontFamily: "var(--font-heading)"
          }}>
            Hey, I'm Alex!
          </h2>
          <p style={{
            color: "var(--text-secondary)", 
            lineHeight: 1.7, 
            marginBottom: 30, 
            fontSize: '0.9rem',
            maxWidth: '90%',
            margin: '0 auto 30px'
          }}>
            Your conversational partner for everyday mind check-ins. Let's do a quick 4-question voice check-in together.
          </p>
          <button 
            onClick={startSession} 
            className="clay-btn-cta"
            style={{ padding: '16px 40px', fontSize: '1.05rem' }}
          >
            Let's Chat 💬
          </button>
          <p style={{ color: "var(--text-secondary)", fontSize: '0.72rem', marginTop: 16, fontWeight: 600 }}>
            3–5 minutes · Voice check-in
          </p>
        </div>
      )}

      {/* LOADING */}
      {state === "loading" && (
        <div className="clay-card" style={{
          padding: 60,
          textAlign: "center",
          backgroundColor: 'white'
        }}>
          <div style={{ marginBottom: 24 }}>
            <AlexMascot size={80} state="thinking" />
          </div>
          <p style={{ color: "var(--text-primary)", fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
            Connecting with Alex...
          </p>
        </div>
      )}

      {/* ACTIVE CHECK-IN (QUESTION / RECORDING / PROCESSING) */}
      {(state === "question" || state === "recording" || state === "analyzing") && state !== "done" && state !== "idle" && state !== "loading" && (
        <div className="clay-card" style={{
          padding: '40px 30px',
          backgroundColor: 'white',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24
        }}>
          {/* Progress Indicators */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {[0, 1, 2, 3].map(i => {
              const isCompleted = i < exchangeCount
              const isCurrent = i === exchangeCount
              
              let bg = "rgba(157, 123, 255, 0.15)"
              let border = "2px solid transparent"
              if (isCompleted) {
                bg = "var(--primary-lavender)"
              } else if (isCurrent) {
                bg = "white"
                border = "2px solid var(--secondary-purple)"
              }

              return (
                <div key={i} style={{
                  height: 12, 
                  width: 12, 
                  borderRadius: "50%",
                  backgroundColor: bg,
                  border,
                  transition: "all 0.3s ease"
                }} />
              )
            })}
          </div>

          {/* Mascot */}
          <AlexMascot size={140} state={mascotState} />

          {/* Alex reflects notice */}
          {state === "analyzing" && (
            <div style={{
              backgroundColor: 'var(--bg-light)',
              padding: '12px 24px',
              borderRadius: 16,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--secondary-purple)',
              fontFamily: 'var(--font-heading)'
            }}>
              Alex is reflecting...
            </div>
          )}

          {/* Question bubble */}
          {state !== "analyzing" && question && (
            <div style={{
              background: 'var(--bg-light)',
              border: '3px solid #FFFFFF',
              borderRadius: 24,
              padding: '20px 24px',
              width: '100%',
              boxShadow: 'inset 2px 2px 4px rgba(157, 123, 255, 0.05)'
            }}>
              <p style={{
                fontSize: '1rem', 
                lineHeight: 1.6, 
                color: "var(--text-primary)",
                margin: 0, 
                fontWeight: 600
              }}>
                <TypewriterText text={question} />
              </p>
            </div>
          )}

          {/* Last user statement */}
          {lastTranscript && state === "question" && (
            <div style={{
              backgroundColor: "var(--cream)",
              borderRadius: 20, 
              padding: "14px 20px", 
              width: '90%',
              fontSize: '0.82rem',
              color: "var(--text-primary)", 
              lineHeight: 1.5,
              border: "2px dashed #BFA2FF",
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.62rem', color: "var(--secondary-purple)", marginBottom: 4, fontWeight: 800, letterSpacing: '0.8px' }}>
                YOU SAID
              </div>
              "{lastTranscript}"
            </div>
          )}

          {/* Mic trigger and waveform animations */}
          {state === "question" && (
            <div>
              <button 
                onClick={startRecording} 
                className="btn-press" 
                style={{
                  width: 80, 
                  height: 80, 
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary-lavender) 0%, var(--secondary-purple) 100%)",
                  border: "none", 
                  borderBottom: "5px solid #845ef7",
                  fontSize: 28, 
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(157, 123, 255, 0.25)",
                  display: "block", 
                  margin: "0 auto 10px",
                  outline: 'none'
                }}
              >
                🎙️
              </button>
              <p style={{ color: "var(--text-secondary)", fontSize: '0.8rem', fontWeight: 600 }}>
                Tap the mic to respond
              </p>
            </div>
          )}

          {state === "recording" && (
            <div>
              <div style={{ fontSize: '0.75rem', color: "var(--secondary-purple)", marginBottom: 12, fontWeight: 800, letterSpacing: '0.5px' }}>
                🔴 LISTENING — {formatTime(recordingTime)}
              </div>
              
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="audio-wave-ring ring-1" />
                <div className="audio-wave-ring ring-2" />
                <button 
                  onClick={stopRecording} 
                  className="btn-press" 
                  style={{
                    width: 80, 
                    height: 80, 
                    borderRadius: "50%",
                    backgroundColor: "#ff85a2",
                    border: "none", 
                    borderBottom: "5px solid #f06292",
                    fontSize: 26,
                    cursor: "pointer",
                    zIndex: 5,
                    boxShadow: "0 8px 20px rgba(255, 133, 162, 0.25)",
                    outline: 'none'
                  }}
                >
                  ⏹️
                </button>
              </div>
              
              <p style={{ color: "var(--text-secondary)", fontSize: '0.8rem', fontWeight: 600 }}>
                Tap stop when finished speaking
              </p>
            </div>
          )}

          {/* Conversation history timeline inside panel */}
          {history.length > 0 && (
            <div style={{ width: '100%', borderTop: '2px dashed var(--bg-light)', paddingTop: 20, textAlign: 'left' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Chat Log
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ 
                    padding: '8px 12px', 
                    borderRadius: 14, 
                    fontSize: '0.8rem', 
                    backgroundColor: h.role === 'user' ? 'var(--bg-light)' : 'var(--cream)',
                    alignSelf: h.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}>
                    <strong style={{ fontSize: '0.62rem', color: h.role === 'user' ? 'var(--secondary-purple)' : '#ff9f1c', display: 'block', marginBottom: 2 }}>
                      {h.role === 'user' ? 'YOU' : 'ALEX'}
                    </strong>
                    {h.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DONE / SESSION COMPLETED REPORT SCREEN */}
      {state === "done" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Confetti />

          {/* Welcome reaction card */}
          <div className="clay-card" style={{
            padding: "36px 24px",
            textAlign: "center", 
            backgroundColor: 'white'
          }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>
              {sentiment.emoji}
            </div>
            <h2 style={{ 
              color: "var(--text-primary)", 
              fontSize: '1.45rem', 
              marginBottom: 6,
              fontFamily: "var(--font-heading)",
              fontWeight: 800
            }}>
              Thanks for checking in!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: '0.85rem', fontWeight: 600 }}>
              {sentiment.label}
            </p>
          </div>

          {/* Alert Notice Box */}
          {alert && (
            <div style={{
              backgroundColor: "var(--cream)", 
              border: "2px dashed var(--primary-lavender)",
              borderRadius: 20, 
              padding: 18, 
              animation: "slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both"
            }}>
              <div style={{ fontWeight: 800, color: "var(--secondary-purple)", marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontFamily: "var(--font-heading)" }}>
                ⚠️ Mind Insight Notice
              </div>
              <p style={{ color: "var(--text-primary)", margin: 0, lineHeight: 1.5, fontSize: '0.8rem' }}>
                {alert.summary}. This isn't diagnostic, just a conversational reflection of what you shared.
              </p>
            </div>
          )}

          {/* AI Report Cards */}
          {report ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {parseReport(report).map((card, idx) => (
                <div 
                  key={card.key} 
                  className="clay-card" 
                  style={{
                    padding: 24,
                    backgroundColor: 'white',
                    borderLeft: `5px solid ${card.border}`,
                    animation: `slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both`,
                    animationDelay: `${(idx + 1) * 0.1}s`
                  }}
                >
                  <button 
                    onClick={() => setExpandedReportCards(prev => ({ ...prev, [card.key]: !prev[card.key] }))}
                    className="btn-press"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <h3 style={{ 
                      color: "var(--text-primary)", 
                      margin: 0, 
                      fontSize: '1.05rem', 
                      fontWeight: 800,
                      fontFamily: "var(--font-heading)",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {card.title}
                    </h3>
                    <span style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.8rem', 
                      transform: expandedReportCards[card.key] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}>
                      ▼
                    </span>
                  </button>
                  {expandedReportCards[card.key] && (
                    <div style={{ marginTop: 14, animation: 'slideInUp 0.3s ease' }}>
                      {renderCardContent(card.content, card.key)}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Signed footer */}
              <div style={{ 
                textAlign: 'right', 
                fontSize: '1rem', 
                fontWeight: 800, 
                color: 'var(--secondary-purple)',
                paddingRight: 10,
                marginTop: 4 
              }}>
                – Alex 💜
              </div>
            </div>
          ) : (
            <div className="clay-card" style={{
              padding: 40,
              textAlign: "center", 
              color: "var(--text-secondary)"
            }}>
              Insights could not be parsed.
            </div>
          )}

          {/* Action buttons */}
          <div style={{ 
            display: "flex", 
            gap: 16,
            marginBottom: 40
          }}>
            <button 
              onClick={() => {
                setState("idle")
                setAlert(null)
                setReport(null)
                setHistory([])
                setLastTranscript("")
              }} 
              className="clay-btn-cta"
              style={{
                flex: 1,
                backgroundColor: "white", 
                color: "var(--text-primary)",
                border: "2px solid var(--bg-light)", 
                borderBottom: "4px solid #DDEEFF",
                boxShadow: "none",
                background: 'white'
              }}
            >
              🔄 New Chat
            </button>
            <a 
              href="/" 
              className="clay-btn-cta"
              style={{ flex: 1 }}
            >
              See Trends 📊
            </a>
          </div>
        </div>
      )}
    </div>
  )
}