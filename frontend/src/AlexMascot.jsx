import React from 'react'

export default function AlexMascot({ size = 100, state = "idle", style = {} }) {
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
      {/* SVG Canvas representing a still 3D-style Clay Mascot */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{
          overflow: 'visible'
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

        {/* Head and Hood Outer Rim (Still, no animations) */}
        <g style={{ transformOrigin: '50px 50px' }}>
          {/* Outer Hood */}
          <circle cx="50" cy="46" r="23" fill="url(#hoodieBody)" stroke="#FFFFFF" strokeWidth="1.5" />

          {/* Face Pocket (Inner Hood cut-out) */}
          <path
            d="M 50,25 C 37,25 31,34 31,48 C 31,61 38,67 50,67 C 62,67 69,61 69,48 C 69,34 63,25 50,25 Z"
            fill="url(#faceGrad)"
          />

          {/* Hair details */}
          <path d="M 40,29 Q 50,22 60,29 Q 50,26 40,29 Z" fill="#875FFF" opacity="0.3" />

          {/* EYES (Still, friendly eyes with standard high-lights) */}
          <g>
            {/* Left eye */}
            <circle cx="42" cy="46" r="3" fill="#2C2C4E" />
            <circle cx="43.2" cy="44.8" r="0.9" fill="#FFFFFF" />
            {/* Right eye */}
            <circle cx="58" cy="46" r="3" fill="#2C2C4E" />
            <circle cx="59.2" cy="44.8" r="0.9" fill="#FFFFFF" />
          </g>

          {/* Blushing cheeks */}
          <circle cx="37" cy="52" r="4" fill="url(#blushGrad)" pointerEvents="none" />
          <circle cx="63" cy="52" r="4" fill="url(#blushGrad)" pointerEvents="none" />

          {/* MOUTH (Cute stationary smile) */}
          <path d="M 46,52 Q 50,55 54,52" fill="none" stroke="#2C2C4E" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}
