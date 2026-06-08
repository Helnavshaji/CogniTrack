import React from 'react'

export default function AlexMascot({ size = 100, state = "idle", style = {} }) {
  const isListening = state === "listening"
  const isThinking = state === "thinking"
  const isSpeaking = state === "speaking"
  const isComforting = state === "comforting"

  // Base state classes for animations
  let characterClass = "mascot-idle"
  if (isSpeaking) characterClass = "mascot-speaking"
  if (isThinking) characterClass = "mascot-thinking"
  if (isListening) characterClass = "mascot-listening"

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      {/* Particle Overlay (Hearts or Stars) */}
      {isComforting && (
        <div className="char-overlay">
          <span className="part-heart h-1">❤️</span>
          <span className="part-heart h-2">💖</span>
          <span className="part-heart h-3">🤗</span>
        </div>
      )}
      {isThinking && (
        <div className="char-overlay">
          <span className="part-star st-1">⭐</span>
          <span className="part-star st-2">✨</span>
          <span className="part-star st-3">🌟</span>
        </div>
      )}
      {isListening && (
        <div className="char-overlay">
          <span className="part-zzz p-1">🎵</span>
          <span className="part-zzz p-2">👂</span>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          overflow: 'visible',
          transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isListening ? 'rotate(6deg) scale(1.05)' : isThinking ? 'rotate(-3deg)' : 'none',
          animation: isSpeaking ? 'breathe 1s infinite ease-in-out' : 'breathe 3s infinite ease-in-out'
        }}
      >
        <defs>
          {/* Hoodie 3D Gradients */}
          <radialGradient id="hoodieBody" cx="50%" cy="40%" r="50%" fx="40%" fy="30%">
            <stop offset="0%" stopColor="#D2BAFF" />
            <stop offset="85%" stopColor="#9D7BFF" />
            <stop offset="100%" stopColor="#7B5EE0" />
          </radialGradient>
          <linearGradient id="hoodieEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFA2FF" />
            <stop offset="100%" stopColor="#875FFF" />
          </linearGradient>

          {/* Face 3D Gradients */}
          <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%" fx="45%" fy="35%">
            <stop offset="0%" stopColor="#FFF4ED" />
            <stop offset="80%" stopColor="#FFE1D3" />
            <stop offset="100%" stopColor="#FFC8B3" />
          </radialGradient>

          {/* Blush Gradients */}
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF85A2" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFE1D3" stopOpacity="0" />
          </radialGradient>

          {/* Shadow Gradients */}
          <radialGradient id="dropShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E1C2E" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1E1C2E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Drop Shadow underneath Mascot */}
        <ellipse cx="50" cy="94" rx="26" ry="5" fill="url(#dropShadow)" />

        {/* Hoodie Torso */}
        <path
          d="M 22,86 C 22,70 34,68 50,68 C 66,68 78,70 78,86 C 78,92 72,94 50,94 C 28,94 22,92 22,86 Z"
          fill="url(#hoodieBody)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Drawstrings */}
        <path d="M 45,74 Q 44,84 41,83" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 55,74 Q 56,84 59,83" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Drawstring tips */}
        <circle cx="41" cy="83" r="2" fill="url(#hoodieEdge)" />
        <circle cx="59" cy="83" r="2" fill="url(#hoodieEdge)" />

        {/* Head and Hood Outer Rim */}
        <g style={{
          transformOrigin: '50px 50px',
          animation: isThinking ? 'tilt-head 2.5s infinite ease-in-out' : 'nod-head 4s infinite ease-in-out'
        }}>
          {/* Outer Hood */}
          <circle cx="50" cy="46" r="23" fill="url(#hoodieBody)" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Face Pocket (Inner Hood cut-out) */}
          <path
            d="M 50,25 C 37,25 31,34 31,48 C 31,61 38,67 50,67 C 62,67 69,61 69,48 C 69,34 63,25 50,25 Z"
            fill="url(#faceGrad)"
          />

          {/* Hair details */}
          <path d="M 40,29 Q 50,22 60,29 Q 50,26 40,29 Z" fill="#875FFF" opacity="0.3" />

          {/* EYES */}
          {isListening ? (
            // Curved attentive/wink eyes
            <g>
              <path d="M 39,46 C 41,43 45,43 47,46" fill="none" stroke="#2C2C4E" strokeWidth="3" strokeLinecap="round" />
              <path d="M 53,46 C 55,43 59,43 61,46" fill="none" stroke="#2C2C4E" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : isComforting ? (
            // Smiling eyes ^ ^
            <g>
              <path d="M 38,47 Q 42,42 46,47" fill="none" stroke="#2C2C4E" strokeWidth="3" strokeLinecap="round" />
              <path d="M 54,47 Q 58,42 62,47" fill="none" stroke="#2C2C4E" strokeWidth="3" strokeLinecap="round" />
            </g>
          ) : (
            // Standard blinking eyes
            <g style={{ animation: 'blink 5s infinite' }}>
              {/* Left eye */}
              <circle cx="42" cy="46" r="3" fill="#2C2C4E" />
              <circle cx="43.2" cy="44.8" r="0.9" fill="#FFFFFF" />
              {/* Right eye */}
              <circle cx="58" cy="46" r="3" fill="#2C2C4E" />
              <circle cx="59.2" cy="44.8" r="0.9" fill="#FFFFFF" />
            </g>
          )}

          {/* Blushing cheeks */}
          <circle cx="37" cy="52" r="4" fill="url(#blushGrad)" pointerEvents="none" />
          <circle cx="63" cy="52" r="4" fill="url(#blushGrad)" pointerEvents="none" />

          {/* MOUTH */}
          {isSpeaking ? (
            // Vertically scaling open mouth
            <ellipse cx="50" cy="54" rx="2.5" ry="3.5" fill="#2C2C4E" style={{ animation: 'speak 0.4s infinite alternate' }} />
          ) : isComforting ? (
            // Sweet open smile
            <path d="M 45,52 Q 50,58 55,52 Z" fill="#2C2C4E" />
          ) : isListening ? (
            // Attentive circle o-mouth
            <circle cx="50" cy="54" r="2" fill="#2C2C4E" />
          ) : (
            // Standard smile
            <path d="M 46,52 Q 50,55 54,52" fill="none" stroke="#2C2C4E" strokeWidth="2" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  )
}
