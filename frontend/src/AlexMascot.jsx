import React from 'react'
import { motion } from 'framer-motion'

export default function AlexMascot({ size = 100, state = "idle", style = {} }) {
  const isListening = state === "listening"
  const isThinking = state === "thinking"
  const isSpeaking = state === "speaking"
  const isComforting = state === "comforting"

  // Render floating particle overlays using Framer Motion for maximum performance and smoothness
  const renderParticles = () => {
    // Generate a set of particles based on state
    let baseList = ["✨", "⭐", "✨", "⭐"] // Ambient particles
    if (isComforting) {
      baseList = ["❤️", "💖", "💜", "💕", "✨", "⭐"]
    } else if (isThinking) {
      baseList = ["⭐", "🌟", "✨", "⭐", "🌟", "✨"]
    } else if (isListening) {
      baseList = ["🎵", "✨", "🎵", "✨", "⭐", "✨"]
    } else if (isSpeaking) {
      baseList = ["✨", "⭐", "✨", "⭐", "✨", "💬"]
    }

    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        {baseList.map((emojiItem, idx) => {
          // Staggered delays and unique paths
          const delay = idx * 0.4
          const leftPositions = [15, 80, 45, 25, 65, 35]
          const left = leftPositions[idx % leftPositions.length]
          
          return (
            <motion.span
              key={idx}
              initial={{ y: 25, x: 0, opacity: 0, scale: 0.4, rotate: 0 }}
              animate={{
                y: -60,
                x: [0, (idx % 2 === 0 ? 12 : -12), (idx % 2 === 0 ? -6 : 6), 0],
                opacity: [0, 0.9, 0.9, 0],
                scale: [0.5, 1.1, 1.1, 0.6],
                rotate: [0, idx % 2 === 0 ? 90 : -90, idx % 2 === 0 ? 180 : -180, idx % 2 === 0 ? 360 : -360]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '30%',
                fontSize: emojiItem === "💬" || emojiItem === "🎵" ? '0.9rem' : '1.1rem',
                display: 'inline-block',
                filter: 'drop-shadow(0 2px 4px rgba(157, 123, 255, 0.15))'
              }}
            >
              {emojiItem}
            </motion.span>
          )
        })}
      </div>
    )
  }

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
      {/* Particle Overlays */}
      {renderParticles()}

      {/* SVG Canvas with soft breathing and bounce animations */}
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          overflow: 'visible',
        }}
        animate={{
          y: isSpeaking ? [0, -2, 0] : [0, -1.5, 0],
          scaleY: [1, 1.018, 1],
          scaleX: [1, 1.008, 1],
          rotate: isListening ? 5 : isThinking ? -3 : 0
        }}
        transition={{
          y: { repeat: Infinity, duration: isSpeaking ? 1.4 : 3.2, ease: "easeInOut" },
          scaleY: { repeat: Infinity, duration: isSpeaking ? 1.4 : 3.2, ease: "easeInOut" },
          scaleX: { repeat: Infinity, duration: isSpeaking ? 1.4 : 3.2, ease: "easeInOut" },
          rotate: { type: "spring", stiffness: 100, damping: 12 }
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
        <motion.g 
          style={{ transformOrigin: '50px 50px' }}
          animate={isListening || isThinking ? {
            rotate: [0, 2.5, -2.5, 0],
            y: [0, 0.5, -0.5, 0]
          } : {
            rotate: 0,
            y: 0
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        >
          {/* Outer Hood */}
          <circle cx="50" cy="46" r="23" fill="url(#hoodieBody)" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Face Pocket (Inner Hood cut-out) */}
          <path
            d="M 50,25 C 37,25 31,34 31,48 C 31,61 38,67 50,67 C 62,67 69,61 69,48 C 69,34 63,25 50,25 Z"
            fill="url(#faceGrad)"
          />

          {/* Hair details */}
          <path d="M 40,29 Q 50,22 60,29 Q 50,26 40,29 Z" fill="#875FFF" opacity="0.3" />

          {/* EYES (Framer Motion Blinking animation) */}
          <motion.g 
            style={{ transformOrigin: '50px 46px' }}
            animate={{
              scaleY: [1, 1, 1, 0.1, 1, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 4.5,
              times: [0, 0.9, 0.93, 0.96, 0.98, 1],
              ease: "easeInOut"
            }}
          >
            {/* Left eye */}
            <circle cx="42" cy="46" r="3" fill="#2C2C4E" />
            <circle cx="43.2" cy="44.8" r="0.9" fill="#FFFFFF" />
            {/* Right eye */}
            <circle cx="58" cy="46" r="3" fill="#2C2C4E" />
            <circle cx="59.2" cy="44.8" r="0.9" fill="#FFFFFF" />
          </motion.g>

          {/* Blushing cheeks */}
          <motion.circle 
            cx="37" 
            cy="52" 
            r="4" 
            fill="url(#blushGrad)" 
            pointerEvents="none" 
            animate={{
              scale: isComforting ? [1, 1.2, 1] : 1,
              opacity: isComforting ? [0.8, 1, 0.8] : 0.8
            }}
            transition={{
              repeat: Infinity,
              duration: 2.0,
              ease: "easeInOut"
            }}
          />
          <motion.circle 
            cx="63" 
            cy="52" 
            r="4" 
            fill="url(#blushGrad)" 
            pointerEvents="none" 
            animate={{
              scale: isComforting ? [1, 1.2, 1] : 1,
              opacity: isComforting ? [0.8, 1, 0.8] : 0.8
            }}
            transition={{
              repeat: Infinity,
              duration: 2.0,
              ease: "easeInOut"
            }}
          />

          {/* MOUTH */}
          {isSpeaking ? (
            // Speaking mouth vertically scaling
            <motion.ellipse 
              cx="50" 
              cy="54" 
              rx="2" 
              ry="3.5" 
              fill="#2C2C4E" 
              style={{ transformOrigin: '50px 54px' }}
              animate={{
                scaleY: [0.4, 1.3, 0.4]
              }}
              transition={{
                repeat: Infinity,
                duration: 0.4,
                ease: "easeInOut"
              }}
            />
          ) : (
            // Warm Smile
            <path d="M 46,52 Q 50,55 54,52" fill="none" stroke="#2C2C4E" strokeWidth="2" strokeLinecap="round" />
          )}
        </motion.g>
      </motion.svg>
    </div>
  )
}
