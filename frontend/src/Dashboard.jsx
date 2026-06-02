import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"

export default function Dashboard({ sessions, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: "center", color: "var(--text-secondary)" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🧠</div>
        <p style={{ fontSize: 18, fontWeight: 500 }}>Reading your mind logs...</p>
      </div>
    )
  }

  const chartData = sessions.map((s, i) => ({
    day: i + 1,
    ...s,
    speech_rate_wpm: s.speech_rate_wpm ?? 0,
    semantic_coherence: s.semantic_coherence ?? 0,
    emotional_valence: s.emotional_valence ?? 0
  }))

  return (
    <div style={{ padding: "40px 0", maxWidth: 900, margin: "0 auto" }}>
      {/* Historic Stats Chart */}
      <div className="glass" style={{
        borderRadius: 24,
        padding: 30,
        border: "1px solid var(--border-glass)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        <h2 style={{ fontSize: 24, color: "white", marginBottom: 6, fontFamily: "var(--font-heading)" }}>Multivariate Trends 📊</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28, fontFamily: "var(--font-body)" }}>
          Visualizing your speech speed, logical coherence, and emotional tone over sessions.
        </p>

        <div style={{ width: "100%", height: 350 }}>
          {sessions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-secondary)" />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <Tooltip
                  contentStyle={{
                    background: "#16162a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "white"
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line type="monotone" dataKey="speech_rate_wpm" name="Speech Pace (WPM)" stroke="var(--accent-teal)" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="semantic_coherence" name="Coherence (0-1)" stroke="var(--accent-purple)" strokeWidth={3} />
                <Line type="monotone" dataKey="emotional_valence" name="Valence (-1 to 1)" stroke="var(--accent-pink)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
              No check-in history logged yet. Complete a check-in to see your trends!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}