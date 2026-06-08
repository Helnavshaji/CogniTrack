import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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

// HeartCascade Component for session complete transition using Framer Motion
function HeartCascade({ active }) {
  if (!active) return null

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {Array.from({ length: 45 }).map((_, idx) => {
        const left = Math.random() * 100 // 0 to 100vw
        const delay = Math.random() * 1.5 // 0 to 1.5s delay
        const scale = 0.5 + Math.random() * 1.0
        const duration = 2.0 + Math.random() * 1.5 // 2.0 to 3.5s duration
        const emoji = ["❤️", "💖", "💝", "💕", "🤗", "💜", "✨"][idx % 7]
        
        return (
          <motion.span
            key={idx}
            initial={{ y: "110vh", opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{
              y: "-15vh",
              opacity: [0, 0.95, 0.95, 0],
              scale: [0.4, scale, scale, scale * 0.7],
              rotate: [0, idx % 2 === 0 ? 90 : -90, idx % 2 === 0 ? 180 : -180, idx % 2 === 0 ? 360 : -360]
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: "easeInOut"
            }}
            style={{
              position: "absolute",
              left: `${left}%`,
              fontSize: `${scale * 2.2}rem`,
              display: "inline-block"
            }}
          >
            {emoji}
          </motion.span>
        )
      })}
    </div>
  )
}

const offlineQuestions = [
  "Hey there! How has your day been going? Tell me a bit about what you did today.",
  "That sounds interesting. How have your energy levels and mood been throughout the day? Have you felt stressed, relaxed, or somewhere in between?",
  "And how was your sleep last night? Do you feel well-rested today?",
  "Lastly, what is one key thing or goal you'd like to focus on for tomorrow?"
]

const generateMockReport = (historyList, finalResponse) => {
  const q0 = historyList[1]?.content || "I had a busy day working on some tasks."
  const q1 = historyList[3]?.content || "My mood was okay, but I felt a bit stressed and tired."
  const q2 = historyList[5]?.content || "I didn't sleep very well and feel slightly tired today."
  const q3 = finalResponse || "Try to finish my main project tasks."

  const hasStress = /stress|anxious|worry|overwhelm|pressure|tense|nervous/i.test(q1) || /stress|anxious|worry|overwhelm|pressure/i.test(q0)
  const hasTired = /tired|exhausted|fatigue|sleepy|energy|drained/i.test(q1) || /tired|exhausted|sleep/i.test(q2)
  const hasPoorSleep = /poor|bad|woke up|insomnia|hard to sleep|restless|awake/i.test(q2)
  const hasGoodSleep = /well|good|great|rested|perfect|amazing/i.test(q2)

  // Section 1: How you seemed today
  let seemedStr = `You mentioned that you spent your day: "${q0}". When we talked about your mood and energy, you shared that you felt: "${q1}". It sounds like you had a lot on your plate today, and I appreciate you taking the time to share it with me.`
  if (hasStress && hasTired) {
    seemedStr = `You shared that you were busy with: "${q0}". You also mentioned feeling stressed and tired ("${q1}"). It's completely understandable to feel drained when you're managing so much, and your body is telling you to take a breath.`
  } else if (hasStress) {
    seemedStr = `You shared that you were busy with: "${q0}". You also mentioned feeling stressed ("${q1}"). Carrying that tension makes even simple tasks feel heavier, and it's clear you've been pushing through it today.`
  } else if (hasTired) {
    seemedStr = `You mentioned that you spent your day: "${q0}". You also noted that your energy levels were quite low and you felt tired ("${q1}"). Managing your schedule when you are low on energy takes extra effort, so acknowledge yourself for getting through it.`
  }

  // Section 2: What I noticed about you
  let noticedStr = `I noticed your commitment to your daily routine today, especially when you described working on your goals. Even when energy feels low, you display a high level of self-awareness and honesty in expressing your limits and feelings.`
  if (hasPoorSleep) {
    noticedStr = `I noticed how resilient you are. Even after describing a restless night of sleep ("${q2}"), you still showed up, focused on your tasks, and stayed active. That dedication is really admirable.`
  } else if (hasGoodSleep) {
    noticedStr = `I noticed a lovely sense of balance today. You described sleeping well ("${q2}") and you seem to have a solid handle on structuring your day and acknowledging your accomplishments.`
  }

  // Section 3: Real talk from your friend
  let advice1 = `• You described your day as "${q0.slice(0, 45)}${q0.length > 45 ? '...' : ''}" — make sure you take at least 15 minutes of uninterrupted quiet time tonight to disconnect completely from any screens or work.`
  let advice2 = `• Since you mentioned feeling "${q1.slice(0, 45)}${q1.length > 45 ? '...' : ''}", be extra gentle with yourself. Don't expect 100% productivity when your energy/mood is compromised.`
  let advice3 = `• Regarding sleep ("${q2.slice(0, 45)}${q2.length > 45 ? '...' : ''}"), try to establish a relaxing wind-down routine tonight — maybe some stretching or reading, and turn off your phone 30 minutes before bed.`

  if (hasStress) {
    advice2 = `• You mentioned feeling stressed — remember that you don't have to carry it all at once. Try to delegate or postpone one non-urgent task today to free up mental space.`
  }
  if (!hasPoorSleep && !hasGoodSleep) {
    advice3 = `• You said your sleep was "${q2.slice(0, 45)}${q2.length > 45 ? '...' : ''}" — try tracking your sleep schedule for a few days to see if you can find a consistent bedtime that leaves you feeling more refreshed.`
  }

  const realTalkStr = `${advice1}\n${advice2}\n${advice3}`

  // Section 4: Your one thing for tomorrow
  const oneThingStr = `Tomorrow, just take one small, deliberate step toward your goal: "${q3}". Break it down into the smallest possible action, and do that first thing in the morning.`

  // Section 5: Proud of you
  let proudStr = `I'm proud of you for talking through your day today. Even when things feel chaotic or tiring, taking this time for self-reflection shows how much you value your health and growth. Keep going, friend!`
  if (hasStress) {
    proudStr = `I'm proud of you for being so honest about your stress levels today. Admitting when you're overwhelmed is a strength, not a weakness. You're doing great, and I've got your back!`
  }

  const reportText = `💬 How you seemed today
${seemedStr}

🌟 What I noticed about you
${noticedStr}

🤝 Real talk from your friend
${realTalkStr}

🎯 Your one thing for tomorrow
${oneThingStr}

💙 I'm proud of you
${proudStr}`

  return reportText
}

export default function Checkin({ userId, onRefreshHistory, currentUser = "helna" }) {
  const navigate = useNavigate()
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
  const [showHearts, setShowHearts] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typedInput, setTypedInput] = useState("")
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const offlineTranscriptRef = useRef("")

  const startSession = async () => {
    try {
      setError(null)
      setReport(null)
      setAlert(null)
      setLastTranscript("")
      setHistory([])
      setExchangeCount(0)
      setShowHearts(false)
      setIsTyping(false)
      setTypedInput("")
      setState("loading")
      setIsOfflineMode(false)
      
      const res = await axios.post(`${API}/session/start`, null, {
        params: { user_id: userId }
      })
      setSessionId(res.data.session_id)
      setQuestion(res.data.first_question)
      setState("question")
    } catch (e) {
      console.warn("Backend connection failed. Switching to Self-Contained Offline Demo Mode.", e)
      setIsOfflineMode(true)
      setSessionId(`offline_${Date.now()}`)
      setQuestion(offlineQuestions[0])
      setState("question")
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

      // Setup SpeechRecognition for offline transcription
      if (isOfflineMode) {
        offlineTranscriptRef.current = ""
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
          const rec = new SpeechRecognition()
          rec.continuous = true
          rec.interimResults = false
          rec.lang = 'en-US'
          rec.onresult = (event) => {
            let finalStr = ""
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalStr += event.results[i][0].transcript + " "
              }
            }
            offlineTranscriptRef.current += finalStr
          }
          rec.onerror = (e) => {
            console.warn("Speech recognition warning:", e)
          }
          rec.start()
          recognitionRef.current = rec
        }
      }
    } catch (e) {
      setError("Microphone access denied. Please allow microphone in your browser.")
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    mediaRef.current?.stop()
    if (isOfflineMode && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.warn(e)
      }
    }
    setState("analyzing")
  }

  const handleOfflineResponse = (text) => {
    setLastTranscript(text)
    
    // Check for crisis words
    const textLower = text.toLowerCase()
    let offlineAlert = null
    if (textLower.includes("kill") || textLower.includes("suicide") || textLower.includes("end my life") || textLower.includes("self harm")) {
      offlineAlert = "Based on your message, we want to remind you that you are not alone. Please consider reaching out to a professional or a helpline like 988. We care about your safety."
      setAlert(offlineAlert)
    }

    if (exchangeCount === 3) {
      // Complete check-in! Generate report
      const generatedReport = generateMockReport(history, text)
      setReport(generatedReport)
      
      const speech_rate_wpm = Math.floor(Math.random() * 25) + 115
      const semantic_coherence = Number((Math.random() * 0.12 + 0.82).toFixed(2))
      
      // Determine emotional valence
      let valence = 0.2
      const posWords = ['happy', 'glad', 'great', 'good', 'excellent', 'amazing', 'perfect', 'sleep well', 'refreshed', 'rested', 'productive', 'accomplished']
      const negWords = ['sad', 'tired', 'stressed', 'anxious', 'worried', 'bad', 'poor', 'exhausted', 'heavy', 'down', 'depressed', 'insomnia']
      let posCount = 0
      let negCount = 0
      
      const fullText = history.map(h => h.content).join(" ") + " " + text
      const fullTextLower = fullText.toLowerCase()
      posWords.forEach(w => { if (fullTextLower.includes(w)) posCount++ })
      negWords.forEach(w => { if (fullTextLower.includes(w)) negCount++ })
      
      if (posCount > negCount) {
        valence = Number((0.2 + (posCount - negCount) * 0.15).toFixed(2))
      } else if (negCount > posCount) {
        valence = Number((-0.1 - (negCount - posCount) * 0.15).toFixed(2))
      }
      valence = Math.max(-1, Math.min(1, valence))

      const type_token_ratio = Number((Math.random() * 0.1 + 0.62).toFixed(2))
      const energy_variability = Number((Math.random() * 0.6 + 0.8).toFixed(2))

      const mockSession = {
        session_id: sessionId,
        user_id: userId,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        transcript: history.map(h => `${h.role === 'assistant' ? 'Alex' : 'User'}: ${h.content}`).join('\n') + `\nUser: ${text}`,
        report: generatedReport,
        speech_rate_wpm,
        semantic_coherence,
        emotional_valence: valence,
        type_token_ratio,
        energy_variability,
        alert: offlineAlert
      }

      // Save to localStorage
      const stored = localStorage.getItem(`cognitrack_sessions_${userId}`)
      let localSessions = []
      if (stored) {
        try {
          localSessions = JSON.parse(stored)
        } catch (e) {}
      }
      localSessions.push(mockSession)
      localStorage.setItem(`cognitrack_sessions_${userId}`, JSON.stringify(localSessions))

      setState("done")
      setShowHearts(true)
      if (onRefreshHistory) onRefreshHistory()

      setTimeout(() => {
        navigate("/reports")
      }, 3500)
    } else {
      const newHistory = [
        ...history,
        { role: "assistant", content: question },
        { role: "user", content: text }
      ]
      setHistory(newHistory)
      const nextQ = offlineQuestions[exchangeCount + 1]
      setQuestion(nextQ)
      setExchangeCount(c => c + 1)
      setState("question")
    }
  }

  const handleAudioReady = async () => {
    if (isOfflineMode) {
      setTimeout(() => {
        const text = offlineTranscriptRef.current.trim() || "I had a pretty good day, mostly working and trying to stay productive, though I'm a bit tired."
        handleOfflineResponse(text)
      }, 1200)
      return
    }

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
        setShowHearts(true)
        if (onRefreshHistory) onRefreshHistory()
        
        // Redirect automatically after the heart cascade animations
        setTimeout(() => {
          navigate("/reports")
        }, 3500)
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

  const submitTypedResponse = async () => {
    if (!typedInput.trim()) return
    const text = typedInput.trim()
    setTypedInput("")
    setIsTyping(false)
    setState("analyzing")

    if (isOfflineMode) {
      setTimeout(() => {
        handleOfflineResponse(text)
      }, 1000)
      return
    }

    try {
      setError(null)
      const form = new FormData()
      form.append("session_id", sessionId)
      form.append("user_id", userId)
      form.append("question", question)
      form.append("history", JSON.stringify(history))
      form.append("text_response", text)

      const res = await axios.post(`${API}/session/respond`, form)
      const data = res.data

      setLastTranscript(data.transcript)
      if (data.alert) setAlert(data.alert)

      if (data.status === "complete") {
        if (data.report) setReport(data.report)
        setState("done")
        setShowHearts(true)
        if (onRefreshHistory) onRefreshHistory()
        
        setTimeout(() => {
          navigate("/reports")
        }, 3500)
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
      <HeartCascade active={showHearts} />
      
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
          <p style={{ color: "var(--text-secondary)", fontSize: '0.9rem', marginTop: 16, fontWeight: 600 }}>
            3–5 minutes · Voice check-in
          </p>
        </div>
      )}

      {/* LOADING */}
      {state === "loading" && (
        <motion.div 
          className="clay-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            padding: '50px 40px',
            textAlign: "center",
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20
          }}
        >
          <div style={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
              style={{
                position: 'absolute',
                inset: -15,
                borderRadius: '50%',
                border: '4px dashed var(--primary-lavender)',
                opacity: 0.6
              }}
            />
            <AlexMascot size={80} state="thinking" />
          </div>

          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ color: "var(--text-primary)", fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}
          >
            Connecting with Alex...
          </motion.p>

          {/* Skeleton lines representing connection data loading */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '80%', marginTop: 10 }}>
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3], width: ["40%", "70%", "40%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0 }}
              style={{ height: 10, backgroundColor: 'var(--bg-light)', borderRadius: 6, margin: '0 auto' }}
            />
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3], width: ["80%", "50%", "80%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
              style={{ height: 10, backgroundColor: 'var(--bg-light)', borderRadius: 6, margin: '0 auto' }}
            />
          </div>
        </motion.div>
      )}

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
          {isOfflineMode && (
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: '#EBF8FF',
              border: '2px solid #BEE3F8',
              color: '#2B6CB0',
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: -4
            }}>
              🟢 OFFLINE DEMO MODE
            </div>
          )}
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
            <motion.div 
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{
                backgroundColor: 'var(--bg-light)',
                padding: '12px 24px',
                borderRadius: 16,
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--secondary-purple)',
                fontFamily: 'var(--font-heading)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Alex is reflecting<span className="thinking-dot d-1">.</span><span className="thinking-dot d-2">.</span><span className="thinking-dot d-3">.</span>
            </motion.div>
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



          {/* Mic trigger and waveform animations */}
          {state === "question" && !isTyping && (
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
              <p style={{ color: "var(--text-secondary)", fontSize: '0.98rem', fontWeight: 600 }}>
                TAP MIC TO SPEAK RESPONSE
              </p>
              <div style={{ marginTop: 14 }}>
                <button 
                  onClick={() => setIsTyping(true)} 
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--secondary-purple)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                    borderBottom: "1.5px solid var(--secondary-purple)",
                    paddingBottom: 2
                  }}
                >
                  ⌨️ Or click to type your response
                </button>
              </div>
            </div>
          )}

          {state === "question" && isTyping && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <textarea
                className="clay-input"
                placeholder="Type your response here..."
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 90,
                  resize: "none",
                  fontSize: "0.95rem",
                  fontFamily: "var(--font-heading)",
                  lineHeight: 1.5,
                  padding: "12px 18px",
                  borderRadius: 18
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitTypedResponse();
                  }
                }}
              />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", width: "100%" }}>
                <button
                  onClick={() => {
                    setIsTyping(false);
                    setTypedInput("");
                  }}
                  className="clay-btn-cta"
                  style={{
                    backgroundColor: "white",
                    color: "var(--text-primary)",
                    border: "2px solid var(--bg-light)",
                    borderBottom: "4px solid #DDEEFF",
                    boxShadow: "none",
                    background: "white",
                    padding: "8px 16px",
                    fontSize: "0.82rem"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitTypedResponse}
                  className="clay-btn-cta"
                  style={{ padding: "8px 20px", fontSize: "0.82rem" }}
                  disabled={!typedInput.trim()}
                >
                  Send Response ⚡
                </button>
              </div>
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
              
              <p style={{ color: "var(--text-secondary)", fontSize: '0.98rem', fontWeight: 600 }}>
                Tap stop when finished speaking
              </p>
            </div>
          )}


        </div>
      )}

      {/* DONE / SESSION COMPLETED REPORT SCREEN */}
      {state === "done" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <Confetti />

          {/* Welcome reaction card */}
          <motion.div 
            className="clay-card" 
            whileHover={{ y: -5, scale: 1.015, boxShadow: "0 15px 30px rgba(157,123,255,0.08)" }}
            style={{
              padding: "36px 24px",
              textAlign: "center", 
              backgroundColor: 'white'
            }}
          >
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
            <p style={{ color: "var(--text-secondary)", fontSize: '1rem', fontWeight: 600 }}>
              {sentiment.label}
            </p>
          </motion.div>

          {/* Alert Notice Box */}
          {alert && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 22, delay: 0.1 }}
              style={{
                backgroundColor: "var(--cream)", 
                border: "2px dashed var(--primary-lavender)",
                borderRadius: 20, 
                padding: 18
              }}
            >
              <div style={{ fontWeight: 800, color: "var(--secondary-purple)", marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontFamily: "var(--font-heading)" }}>
                ⚠️ Mind Insight Notice
              </div>
              <p style={{ color: "var(--text-primary)", margin: 0, lineHeight: 1.5, fontSize: '0.8rem' }}>
                {alert.summary}. This isn't diagnostic, just a conversational reflection of what you shared.
              </p>
            </motion.div>
          )}

          {/* AI Report Cards */}
          {report ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {parseReport(report).map((card, idx) => (
                <motion.div 
                  key={card.key} 
                  className="clay-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 160, damping: 22, delay: (idx + 1) * 0.1 }}
                  whileHover={{ y: -5, scale: 1.01, boxShadow: "0 15px 30px rgba(157, 123, 255, 0.08)" }}
                  style={{
                    padding: 24,
                    backgroundColor: 'white',
                    borderLeft: `5px solid ${card.border}`,
                    cursor: 'pointer'
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
                    <motion.span 
                      animate={{ rotate: expandedReportCards[card.key] ? 180 : 0 }}
                      style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.8rem', 
                        display: 'inline-block'
                      }}
                    >
                      ▼
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedReportCards[card.key] && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 14 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: 'hidden' }}
                      >
                        {renderCardContent(card.content, card.key)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
            <motion.button 
              onClick={() => {
                setState("idle")
                setAlert(null)
                setReport(null)
                setHistory([])
                setLastTranscript("")
              }} 
              className="clay-btn-cta"
              whileHover={{ y: 2, borderBottomWidth: "2px" }}
              whileTap={{ y: 5, borderBottomWidth: "0px", scale: 0.98 }}
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
            </motion.button>
            <motion.button 
              onClick={() => navigate("/")}
              className="clay-btn-cta"
              whileHover={{ y: 2, borderBottomWidth: "2px" }}
              whileTap={{ y: 5, borderBottomWidth: "0px", scale: 0.98 }}
              style={{ flex: 1 }}
            >
              See Trends 📊
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}