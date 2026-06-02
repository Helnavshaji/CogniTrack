import { useState, useRef, useEffect } from "react"
import axios from "axios"

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
    const confettiColors = ["#ff007f", "#00f5d4", "#ff9f1c", "#9d4edd", "#ffeb3b"]
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

// 3D-Like Animated Avatar showing full postures (sit, lay down, hug, kiss, sideways list, excited, happy)
function ListeningCharacter({ pose, state }) {
  const isRecording = state === "recording"
  const isThinking = state === "analyzing"
  const isSpeaking = state === "question"

  return (
    <div style={{
      position: "relative",
      width: 190,
      height: 190,
      margin: "0 auto 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Particle Overlays based on active Emotion/Posture */}
      {pose === "lying" && (
        <div className="char-overlay">
          <span className="part-zzz p-1">z</span>
          <span className="part-zzz p-2">z</span>
          <span className="part-zzz p-3">Z</span>
        </div>
      )}
      {pose === "hugging" && (
        <div className="char-overlay">
          <span className="part-heart h-1">❤️</span>
          <span className="part-heart h-2">💖</span>
          <span className="part-heart h-3">🤗</span>
        </div>
      )}
      {pose === "kissing" && (
        <div className="char-overlay">
          <span className="part-kiss k-1">💋</span>
          <span className="part-kiss k-2">❤️</span>
          <span className="part-kiss k-3">😘</span>
        </div>
      )}
      {pose === "excited" && (
        <div className="char-overlay">
          <span className="part-star st-1">⭐</span>
          <span className="part-star st-2">✨</span>
          <span className="part-star st-3">🌟</span>
        </div>
      )}
      {pose === "happy" && (
        <div className="char-overlay">
          <span className="part-smile sm-1">😊</span>
          <span className="part-smile sm-2">🍀</span>
        </div>
      )}

      {/* Listening Rings */}
      {isRecording && (
        <>
          <div className="audio-wave-ring ring-1" />
          <div className="audio-wave-ring ring-2" />
        </>
      )}

      {/* Thinking Header Dot Cloud */}
      {isThinking && (
        <div className="thinking-bubble">
          🧠 thinking
          <span className="thinking-dot d-1">.</span>
          <span className="thinking-dot d-2">.</span>
          <span className="thinking-dot d-3">.</span>
        </div>
      )}

      {/* Interactive 3D SVG Canvas */}
      <svg 
        width="145" 
        height="145" 
        viewBox="0 0 100 100" 
        style={{
          zIndex: 2,
          transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          // Lay sideways (70deg rotation) when listening/recording, or lay down (translate/tilt) when tired
          transform: 
            pose === "lying-sideways" ? "rotate(70deg) translate(6px, -6px) scale(1.05)" : 
            pose === "lying" ? "rotate(-12deg) translateY(12px)" : 
            pose === "excited" ? "scale(1.08) translateY(-6px)" : 
            pose === "hugging" ? "scale(1.03)" : "none"
        }}
      >
        <defs>
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd3b6" />
            <stop offset="100%" stopColor="#ffaaa5" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E5128" />
            <stop offset="100%" stopColor="#0B251A" />
          </linearGradient>
          <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f3425" />
            <stop offset="100%" stopColor="#04120C" />
          </linearGradient>
        </defs>

        {/* Back Hair Layer */}
        <circle cx="50" cy="46" r="22" fill="url(#hairGrad)" />

        {/* Dynamic Shoulders/Torso based on Posture */}
        {pose === "lying" ? (
          // Lay down horizontal body
          <path d="M 12,94 Q 50,83 88,94 L 88,100 L 12,100 Z" fill="url(#hoodieGrad)" />
        ) : (
          // Sitting body
          <path d="M 22,90 Q 50,70 78,90 L 74,100 L 26,100 Z" fill="url(#hoodieGrad)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        )}

        {/* Neck */}
        <rect x="46" y="62" width="8" height="14" rx="3" fill="url(#skinGrad)" />

        {/* Animated Arms for Hugging or Waving in Excited state */}
        {pose === "hugging" && (
          <g>
            {/* Left Hugging Arm */}
            <path d="M 25,90 Q 10,70 28,64 Q 38,62 34,78" fill="none" stroke="url(#skinGrad)" strokeWidth="5.5" strokeLinecap="round" />
            {/* Right Hugging Arm */}
            <path d="M 75,90 Q 90,70 72,64 Q 62,62 66,78" fill="none" stroke="url(#skinGrad)" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        )}
        {pose === "excited" && (
          <g>
            {/* Raised left hand */}
            <path d="M 24,88 Q 10,65 18,48 Q 24,42 26,54" fill="none" stroke="url(#skinGrad)" strokeWidth="5.5" strokeLinecap="round" />
            {/* Raised right hand */}
            <path d="M 76,88 Q 90,65 82,48 Q 76,42 74,54" fill="none" stroke="url(#skinGrad)" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        )}

        {/* Head/Face container */}
        <g style={{
          transformOrigin: "50px 52px",
          animation: isThinking ? "tilt-head 2.5s infinite ease-in-out" : "nod-head 4s infinite ease-in-out"
        }}>
          {/* Ears */}
          <circle cx="28" cy="52" r="4.5" fill="url(#skinGrad)" />
          <circle cx="72" cy="52" r="4.5" fill="url(#skinGrad)" />
          {(isRecording || pose === "lying-sideways") && (
            <>
              <circle cx="28" cy="52" r="6" fill="none" stroke="var(--accent-green-bright)" strokeWidth="1.5" style={{ animation: "pulse 1.2s infinite" }} />
              <circle cx="72" cy="52" r="6" fill="none" stroke="var(--accent-green-bright)" strokeWidth="1.5" style={{ animation: "pulse 1.2s infinite" }} />
            </>
          )}

          {/* Face */}
          <circle cx="50" cy="52" r="19" fill="url(#skinGrad)" />

          {/* Hair bangs */}
          <path d="M 31,43 Q 50,22 69,43 Q 59,33 50,43 Q 41,33 31,43 Z" fill="url(#hairGrad)" />

          {/* EYES changing as per pose */}
          {pose === "lying" ? (
            // Lying/sleeping eyes
            <path d="M 37,50 Q 42,53 47,50 M 53,50 Q 58,53 63,50" stroke="#050e0b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : pose === "happy" || pose === "hugging" ? (
            // Curved closed eyes ^ ^
            <path d="M 37,52 Q 42,47 47,52 M 53,52 Q 58,47 63,52" stroke="#050e0b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : pose === "excited" ? (
            // Star twinkling eyes
            <g>
              <text x="36" y="53" fontSize="11" fill="var(--accent-teal)" fontWeight="900">★</text>
              <text x="52" y="53" fontSize="11" fill="var(--accent-teal)" fontWeight="900">★</text>
            </g>
          ) : pose === "kissing" ? (
            // Winking left eye, open right eye
            <g>
              <path d="M 37,52 Q 42,47 47,52" stroke="#050e0b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <circle cx="58" cy="50" r="2.5" fill="#050e0b" />
            </g>
          ) : (
            // Standard eyes with blinking
            <g style={{ animation: "blink 4s infinite" }}>
              <circle cx="43" cy="50" r="2.5" fill="#050e0b" />
              <circle cx="44" cy="49" r="0.8" fill="white" />
              <circle cx="57" cy="50" r="2.5" fill="#050e0b" />
              <circle cx="58" cy="49" r="0.8" fill="white" />
            </g>
          )}

          {/* MOUTH changing as per pose */}
          {isSpeaking ? (
            <ellipse cx="50" cy="61" rx="2.5" ry="3.5" fill="#050e0b" style={{ animation: "speak 0.4s infinite alternate" }} />
          ) : pose === "kissing" ? (
            // Puckered blowing kiss mouth
            <circle cx="50" cy="61" r="3.2" fill="#050e0b" stroke="var(--accent-pink)" strokeWidth="1" />
          ) : pose === "excited" ? (
            // Wide open happy mouth
            <path d="M 45,60 Q 50,69 55,60 Z" fill="#050e0b" />
          ) : pose === "happy" || pose === "hugging" ? (
            // Sweet smile
            <path d="M 44,59 Q 50,65 56,59" stroke="#050e0b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : pose === "lying" ? (
            // Peaceful neutral line
            <line x1="46" y1="61" x2="54" y2="61" stroke="#050e0b" strokeWidth="1.5" strokeLinecap="round" />
          ) : pose === "lying-sideways" ? (
            // Focused attentive listening mouth (open 'o' shape)
            <circle cx="50" cy="61" r="2.2" fill="#050e0b" stroke="var(--accent-teal)" strokeWidth="0.8" />
          ) : (
            // Standard listening line
            <path d="M 46,60 Q 50,62 54,60" stroke="#050e0b" strokeWidth="1.2" fill="none" />
          )}

          {/* Blush */}
          <circle cx="36" cy="57" r="2.5" fill="var(--accent-pink)" opacity="0.4" />
          <circle cx="64" cy="57" r="2.5" fill="var(--accent-pink)" opacity="0.4" />
        </g>
      </svg>
    </div>
  )
}

export default function Checkin({ userId, onRefreshHistory }) {
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
  const [charPose, setCharPose] = useState("sitting") // Reactive Posture state for 3D Toy
  const [expandedReportCards, setExpandedReportCards] = useState({ seemed: true }) // Track report cards accordion state
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Dynamically analyze the tone of user statements and adjust Alex's pose
  const determineAlexPose = (userText) => {
    if (!userText) return "sitting"
    const text = userText.toLowerCase()
    
    // Lying down: sleep, tired, exhausted, bed, nap, dream
    if (text.includes("sleep") || text.includes("tired") || text.includes("exhausted") || text.includes("bed") || text.includes("nap") || text.includes("dream")) {
      return "lying"
    }
    
    // Hug: sad, cry, lonely, hurt, hopeless, depressed, stress, struggle, bad
    if (text.includes("sad") || text.includes("cry") || text.includes("lonely") || text.includes("hurt") || text.includes("hopeless") || text.includes("depressed") || text.includes("struggle") || text.includes("bad")) {
      return "hugging"
    }
    
    // Kiss: love, thank, grateful, appreciate, heart, kiss, sweet
    if (text.includes("love") || text.includes("thank") || text.includes("grateful") || text.includes("appreciate") || text.includes("heart") || text.includes("kiss")) {
      return "kissing"
    }
    
    // Excited: excited, success, won, celebrate, amazing, awesome, great, yes, proud
    if (text.includes("excited") || text.includes("success") || text.includes("won") || text.includes("celebrate") || text.includes("amazing") || text.includes("awesome") || text.includes("great") || text.includes("yes")) {
      return "excited"
    }
    
    // Happy: good, nice, smile, happy, okay, fine, better
    if (text.includes("good") || text.includes("nice") || text.includes("smile") || text.includes("happy") || text.includes("okay") || text.includes("fine") || text.includes("better")) {
      return "happy"
    }
    
    return "sitting"
  }

  // Effect to sync Alex's pose with check-in conversational state
  useEffect(() => {
    if (state === "recording") {
      setCharPose("lying-sideways") // "lay side way listening" when recording
    } else if (state === "analyzing") {
      setCharPose("thinking")
    } else if (state === "question") {
      if (lastTranscript) {
        setCharPose(determineAlexPose(lastTranscript))
      } else {
        setCharPose("sitting")
      }
    }
  }, [state, lastTranscript])

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
      { title: "💬 How you seemed today", key: "seemed", marker: "💬", border: "var(--accent-purple)", glow: "var(--shadow-neon-purple)" },
      { title: "🌟 What I noticed about you", key: "noticed", marker: "🌟", border: "var(--accent-teal)", glow: "var(--shadow-neon-teal)" },
      { title: "🤝 Real talk from your friend", key: "advice", marker: "🤝", border: "var(--accent-orange)", glow: "var(--shadow-neon-orange)" },
      { title: "🎯 Your one thing for tomorrow", key: "goal", marker: "🎯", border: "var(--accent-pink)", glow: "var(--shadow-neon-pink)" },
      { title: "💙 I'm proud of you", key: "closing", marker: "💙", border: "var(--accent-purple)", glow: "var(--shadow-neon-purple)" }
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
          glow: current.glow
        })
      }
    }

    if (parsed.length === 0) {
      parsed.push({
        title: "📝 Alex's Note",
        key: "full",
        content: reportText,
        border: "var(--accent-purple)",
        glow: "var(--shadow-neon-purple)"
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
                fontSize: 15,
                lineHeight: 1.6,
                color: "#E2E8F0"
              }}>
                <span style={{ color: "var(--accent-orange)", fontSize: 18, textShadow: "0 0 10px rgba(255, 159, 28, 0.4)" }}>⚡</span>
                <span>
                  <strong style={{ color: "white", fontWeight: 700 }}>{boldPart}</strong> {restPart}
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
        lineHeight: 1.8, 
        fontSize: 15, 
        color: "#E2E8F0" 
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

  const sentiment = getSentimentEmoji(report, alert)

  return (
    <div style={{ maxWidth: 680, margin: "20px auto 0", padding: "0 20px" }}>
      {/* Dynamic Style Sheet Overlay */}
      <style>{`
        @keyframes neon-pulse-green {
          0%, 100% { box-shadow: 0 0 10px rgba(0, 245, 212, 0.4); border-color: rgba(0, 245, 212, 0.4); }
          50% { box-shadow: 0 0 20px rgba(0, 245, 212, 0.8); border-color: rgba(0, 245, 212, 0.8); }
        }
        @keyframes neon-pulse-orange {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 159, 28, 0.4); border-color: rgba(255, 159, 28, 0.4); }
          50% { box-shadow: 0 0 20px rgba(255, 159, 28, 0.8); border-color: rgba(255, 159, 28, 0.8); }
        }
        .spin-on-hover:hover .emoji-spin {
          animation: spin-fun 0.8s ease-in-out;
        }
        .pulse-btn {
          animation: pulse 2.5s infinite;
        }
        .chat-bubble-in {
          animation: slideInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        /* Character floating particles styling */
        .part-zzz {
          position: absolute;
          font-family: var(--font-heading);
          font-weight: 800;
          color: var(--accent-teal);
          opacity: 0;
          animation: float-up-fade 2.5s infinite linear;
        }
        .part-zzz.p-1 { left: 72%; top: 42%; animation-delay: 0s; font-size: 14px; }
        .part-zzz.p-2 { left: 77%; top: 32%; animation-delay: 0.8s; font-size: 18px; }
        .part-zzz.p-3 { left: 82%; top: 22%; animation-delay: 1.6s; font-size: 24px; }

        .part-heart {
          position: absolute;
          opacity: 0;
          animation: float-up-fade-heart 3s infinite ease-out;
        }
        .part-heart.h-1 { left: 18%; top: 50%; animation-delay: 0s; font-size: 18px; }
        .part-heart.h-2 { left: 78%; top: 45%; animation-delay: 1s; font-size: 22px; }
        .part-heart.h-3 { left: 45%; top: 20%; animation-delay: 1.8s; font-size: 20px; }

        .part-kiss {
          position: absolute;
          opacity: 0;
          animation: float-up-fade-kiss 2.5s infinite ease-out;
        }
        .part-kiss.k-1 { left: 53%; top: 53%; animation-delay: 0s; font-size: 22px; }
        .part-kiss.k-2 { left: 47%; top: 48%; animation-delay: 0.9s; font-size: 18px; }
        .part-kiss.k-3 { left: 51%; top: 38%; animation-delay: 1.7s; font-size: 20px; }

        .part-star {
          position: absolute;
          opacity: 0;
          animation: float-around-star 2.2s infinite ease-in-out;
        }
        .part-star.st-1 { left: 12%; top: 32%; animation-delay: 0s; font-size: 16px; }
        .part-star.st-2 { left: 82%; top: 28%; animation-delay: 0.7s; font-size: 14px; }
        .part-star.st-3 { left: 48%; top: 12%; animation-delay: 1.4s; font-size: 18px; }

        .part-smile {
          position: absolute;
          opacity: 0;
          animation: float-up-fade 2.5s infinite ease-out;
        }
        .part-smile.sm-1 { left: 80%; top: 38%; animation-delay: 0s; font-size: 16px; }
        .part-smile.sm-2 { left: 16%; top: 32%; animation-delay: 1.2s; font-size: 14px; }

        @keyframes float-up-fade {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-50px) translateX(15px) scale(1.1); opacity: 0; }
        }

        @keyframes float-up-fade-heart {
          0% { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 0; }
          25% { opacity: 0.9; }
          100% { transform: translateY(-70px) translateX(-15px) scale(1.2) rotate(15deg); opacity: 0; }
        }

        @keyframes float-up-fade-kiss {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
          30% { opacity: 0.9; }
          100% { transform: translateY(-60px) translateX(20px) scale(1.3) rotate(-20deg); opacity: 0; }
        }

        @keyframes float-around-star {
          0% { transform: translateY(0) rotate(0deg) scale(0.5); opacity: 0; }
          50% { opacity: 1; transform: translateY(-15px) rotate(180deg) scale(1.2); }
          100% { transform: translateY(-30px) rotate(360deg) scale(0.5); opacity: 0; }
        }
      `}</style>

      {error && (
        <div style={{
          background: "rgba(239, 83, 80, 0.15)",
          border: "1px solid rgba(239, 83, 80, 0.4)",
          borderRadius: 16, 
          padding: 16, 
          color: "#F87171",
          marginBottom: 20, 
          fontSize: 15, 
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(239, 83, 80, 0.1)",
          animation: "slideInUp 0.4s ease"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* IDLE */}
      {state === "idle" && (
        <div className="glass" style={{
          borderRadius: 32, 
          padding: '48px 36px',
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)", 
          textAlign: "center",
          border: '1px solid rgba(255, 255, 255, 0.05)',
          animation: 'slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ fontSize: 72, marginBottom: 20, animation: 'floating 4s infinite ease-in-out' }}>💬</div>
          <h2 style={{ 
            fontSize: 32, 
            marginBottom: 16, 
            background: "linear-gradient(90deg, var(--accent-green-bright), var(--accent-teal))", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent",
            fontFamily: "var(--font-heading)"
          }}>
            Hey, I'm Alex!
          </h2>
          <p style={{
            color: "var(--text-secondary)", 
            lineHeight: 1.8, 
            marginBottom: 36, 
            fontSize: 16,
            maxWidth: '90%',
            margin: '0 auto 36px'
          }}>
            Your conversational partner for everyday mind check-ins. Let's do a quick 4-question voice chat. Tap start to connect!
          </p>
          <button 
            onClick={startSession} 
            className="btn-press pulse-btn"
            style={{
              padding: "18px 48px", 
              background: "linear-gradient(135deg, var(--accent-forest) 0%, var(--accent-teal) 100%)",
              color: "white", 
              border: "none", 
              borderRadius: 100,
              fontSize: 18, 
              fontWeight: 800, 
              cursor: "pointer",
              fontFamily: "var(--font-heading)",
              boxShadow: "0 10px 30px rgba(30, 81, 40, 0.4)",
              letterSpacing: '0.5px'
            }}
          >
            Let's Chat 💬
          </button>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, marginTop: 20 }}>
            3–5 minutes · Voice check-in
          </p>
        </div>
      )}

      {/* LOADING */}
      {state === "loading" && (
        <div className="glass" style={{
          borderRadius: 32, 
          padding: 60,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)", 
          textAlign: "center",
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ fontSize: 56, marginBottom: 20, animation: 'morphing 6s infinite linear', width: 80, height: 80, background: 'linear-gradient(135deg, var(--accent-forest), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', borderRadius: '50%' }}>✨</div>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, fontWeight: 500 }}>Connecting with Alex...</p>
        </div>
      )}

      {/* QUESTION + RECORDING + ANALYZING */}
      {(state === "question" || state === "recording" || state === "analyzing") && state !== "done" && state !== "idle" && state !== "loading" && (
        <div>
          {/* Progress Glowing Orbs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
            {[0, 1, 2, 3].map(i => {
              const isCompleted = i < exchangeCount
              const isCurrent = i === exchangeCount
              let animation = "none"
              let border = "1px solid rgba(255,255,255,0.15)"
              let bg = "rgba(255,255,255,0.05)"

              if (isCompleted) {
                animation = "neon-pulse-green 2s infinite"
                bg = "rgba(0, 245, 212, 0.2)"
              } else if (isCurrent) {
                animation = "neon-pulse-orange 2s infinite"
                bg = "rgba(255, 159, 28, 0.2)"
              }

              return (
                <div key={i} style={{
                  height: 18, 
                  width: 18, 
                  borderRadius: "50%",
                  backgroundColor: bg,
                  border,
                  animation,
                  transition: "all 0.4s ease"
                }} />
              )
            })}
          </div>

          {/* DYNAMIC EMOTIONAL 3D CHARACTER */}
          <ListeningCharacter pose={charPose} state={state} />

          {/* Alex question bubble with typewriter */}
          {state !== "analyzing" && question && (
            <div className="glass" style={{
              borderRadius: 28,
              borderBottomLeftRadius: 4,
              padding: 24, 
              boxShadow: "0 15px 40px rgba(0,0,0,0.3)", 
              marginBottom: 24,
              border: "1px solid rgba(0, 245, 212, 0.15)"
            }}>
              <p style={{
                fontSize: 18, 
                lineHeight: 1.7, 
                color: "white",
                margin: 0, 
                fontWeight: 600,
                letterSpacing: '-0.3px'
              }}>
                <TypewriterText text={question} />
              </p>
            </div>
          )}

          {/* Show last transcript as user bubble */}
          {lastTranscript && state === "question" && (
            <div className="chat-bubble-in" style={{
              backgroundColor: "rgba(0, 245, 212, 0.08)",
              borderRadius: 24, 
              borderBottomRightRadius: 4,
              padding: "16px 22px", 
              marginBottom: 24,
              marginLeft: 40, 
              fontSize: 15,
              color: "#E2E8F0", 
              lineHeight: 1.6,
              border: "1px solid rgba(0, 245, 212, 0.2)",
              boxShadow: "0 8px 24px rgba(0, 245, 212, 0.03)"
            }}>
              <div style={{ fontSize: 11, color: "var(--accent-teal)", marginBottom: 6, fontWeight: 700, letterSpacing: '0.8px' }}>
                YOU SAID
              </div>
              "{lastTranscript}"
            </div>
          )}

          {/* RECORD / STOP BUTTONS */}
          {state === "question" && (
            <div style={{ textAlign: "center", paddingTop: 10, marginBottom: 40 }}>
              <button 
                onClick={startRecording} 
                className="btn-press" 
                style={{
                  width: 90, 
                  height: 90, 
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)",
                  border: "none", 
                  fontSize: 34, 
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(0, 245, 212, 0.4)",
                  display: "block", 
                  margin: "0 auto 16px",
                  animation: "pulse 2s infinite"
                }}
              >
                🎙️
              </button>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500 }}>
                Tap the mic to talk with Alex
              </p>
            </div>
          )}

          {state === "recording" && (
            <div style={{ textAlign: "center", paddingTop: 10, marginBottom: 40 }}>
              <div style={{ fontSize: 13, color: "var(--accent-pink)", marginBottom: 10, fontWeight: 700, letterSpacing: '0.5px' }}>
                🔴 LISTENING — {formatTime(recordingTime)}
              </div>
              <button 
                onClick={stopRecording} 
                className="btn-press" 
                style={{
                  width: 90, 
                  height: 90, 
                  borderRadius: "50%",
                  backgroundColor: "#ef5350",
                  border: "none", 
                  fontSize: 30,
                  cursor: "pointer",
                  display: "block", 
                  margin: "0 auto 16px",
                  animation: "ripple 1.5s infinite"
                }}
              >
                ⏹️
              </button>
              <p style={{ color: "#ef5350", fontSize: 14, fontWeight: 600 }}>
                Tap when finished speaking
              </p>
            </div>
          )}

          {/* Previous Conversation History */}
          {history.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <p style={{
                fontSize: 11, 
                color: "var(--text-secondary)",
                textTransform: "uppercase", 
                letterSpacing: "0.15em", 
                marginBottom: 14,
                fontWeight: 700
              }}>
                Our conversation so far
              </p>
              {history.map((h, i) => (
                <div 
                  key={i} 
                  className="chat-bubble-in"
                  style={{
                    padding: "14px 18px", 
                    marginBottom: 12,
                    borderRadius: h.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    fontSize: 14, 
                    lineHeight: 1.6,
                    backgroundColor: h.role === "user" ? "rgba(0, 245, 212, 0.06)" : "rgba(20, 20, 45, 0.4)",
                    color: "white",
                    marginLeft: h.role === "user" ? 50 : 0,
                    marginRight: h.role === "assistant" ? 50 : 0,
                    border: h.role === "user" ? "1px solid rgba(0, 245, 212, 0.12)" : "1px solid rgba(255, 159, 28, 0.12)",
                    boxShadow: h.role === "user" ? "0 4px 15px rgba(0, 245, 212, 0.02)" : "0 4px 15px rgba(255, 159, 28, 0.02)",
                    animationDelay: `${i * 0.05}s`
                  }}
                >
                  <span style={{
                    fontSize: 10, 
                    fontWeight: 800,
                    color: h.role === "user" ? "#00f5d4" : "#ff9f1c",
                    display: "block", 
                    marginBottom: 4,
                    letterSpacing: '0.5px'
                  }}>
                    {h.role === "user" ? "YOU" : "ALEX"}
                  </span>
                  {h.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DONE REPORT */}
      {state === "done" && (
        <div>
          {/* Confetti Explosion */}
          <Confetti />

          {/* Reaction Emoji header card */}
          <div className="glass" style={{
            borderRadius: 32, 
            padding: "36px 24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            textAlign: "center", 
            marginBottom: 24,
            border: "1px solid rgba(255, 255, 255, 0.05)",
            animation: "slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both"
          }}>
            <div style={{ fontSize: 80, marginBottom: 12, animation: "floating 4s infinite ease-in-out" }}>
              {sentiment.emoji}
            </div>
            <h2 style={{ 
              color: "white", 
              fontSize: 26, 
              marginBottom: 6,
              fontFamily: "var(--font-heading)" 
            }}>
              Thanks for checking in!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 500 }}>
              {sentiment.label}
            </p>
          </div>

          {/* Alert Warning Box */}
          {alert && (
            <div style={{
              backgroundColor: "rgba(255, 159, 28, 0.08)", 
              border: "1px solid rgba(255, 159, 28, 0.3)",
              borderRadius: 20, 
              padding: 20, 
              marginBottom: 24,
              animation: "slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both"
            }}>
              <div style={{ fontWeight: 800, color: "var(--accent-orange)", marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontFamily: "var(--font-heading)" }}>
                ⚠️ Mind Insight Notice
              </div>
              <p style={{ color: "#E2E8F0", margin: 0, lineHeight: 1.6, fontSize: 14 }}>
                {alert.summary}. This isn't diagnostic, just a conversational reflection of what you shared.
              </p>
            </div>
          )}

          {/* PARSED REPORT SECTIONS CARDS */}
          {report ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 30 }}>
              {parseReport(report).map((card, idx) => (
                <div 
                  key={card.key} 
                  className="glass" 
                  style={{
                    borderRadius: 24, 
                    padding: 28,
                    boxShadow: `0 10px 30px rgba(0,0,0,0.2), 0 0 20px ${card.glow}`,
                    border: `1px solid ${card.border}`,
                    animation: `slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both`,
                    animationDelay: `${(idx + 1) * 0.15}s`
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
                      color: "white", 
                      margin: 0, 
                      fontSize: 18, 
                      fontWeight: 800,
                      fontFamily: "var(--font-heading)",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      {card.title}
                    </h3>
                    <span style={{ 
                      color: 'white', 
                      fontSize: '1rem', 
                      transform: expandedReportCards[card.key] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      userSelect: 'none'
                    }}>
                      ▼
                    </span>
                  </button>
                  {expandedReportCards[card.key] && (
                    <div style={{ marginTop: 16, animation: 'slideInUp 0.3s ease' }}>
                      {renderCardContent(card.content, card.key)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass" style={{
              borderRadius: 24, 
              padding: 40,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)", 
              marginBottom: 24,
              textAlign: "center", 
              color: "var(--text-secondary)"
            }}>
              Insights could not be parsed.
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: 16,
            animation: "slideInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
            animationDelay: "0.9s",
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
              className="btn-press spin-on-hover"
              style={{
                padding: "16px 0", 
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.04)", 
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)", 
                borderRadius: "24px 8px 24px 8px",
                fontSize: 15, 
                cursor: "pointer", 
                fontWeight: 700,
                fontFamily: "var(--font-heading)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.3s'
              }}
            >
              <span className="emoji-spin" style={{ display: 'inline-block' }}>🔄</span> New Chat
            </button>
            <a 
              href="/" 
              className="btn-press pulse-btn"
              style={{
                padding: "16px 0", 
                flex: 1,
                background: "linear-gradient(135deg, var(--accent-forest) 0%, var(--accent-teal) 100%)",
                color: "white", 
                borderRadius: "8px 24px 8px 24px", 
                fontSize: 15,
                textAlign: "center", 
                textDecoration: "none",
                fontWeight: 800, 
                lineHeight: "1.7",
                fontFamily: "var(--font-heading)",
                boxShadow: "0 6px 20px rgba(30, 81, 40, 0.4)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              See Trends 📊
            </a>
          </div>
        </div>
      )}
    </div>
  )
}