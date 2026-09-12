import React, { useState, useEffect } from "react"
import { fetchPublicScorecard, fetchDeliveries } from "../db.js"
import { reduceInningsState, DEFAULT_CONFIG } from "../scoringEngine.js"

export default function PublicScoreView({ token, onBackHome }) {
  const [loading, setLoading] = useState(true)
  const [scorecardData, setScorecardData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedInningsNum, setSelectedInningsNum] = useState(1)
  const [inningsStates, setInningsStates] = useState({})
  const [showQr, setShowQr] = useState(false)
  const [copied, setCopied] = useState(false)

  const loadData = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const data = await fetchPublicScorecard(token)
      if (!data) {
        setError("This live scorecard link is invalid or has been disabled by the organizer (FR-9.18).")
        setLoading(false)
        return
      }

      setScorecardData(data)
      const stateMap = {}
      for (const inn of data.innings || []) {
        const dels = await fetchDeliveries(inn.id)
        stateMap[inn.innings_number] = reduceInningsState(data.config || DEFAULT_CONFIG, data.squad || [], dels, inn)
      }
      setInningsStates(stateMap)

      if (data.innings && data.innings.length > 0 && isInitial) {
        setSelectedInningsNum(data.innings[data.innings.length - 1].innings_number)
      }
    } catch (err) {
      console.warn("Public scorecard poll error:", err)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  // Initial load + Realtime/Polling loop every 8s (FR-9.16)
  useEffect(() => {
    loadData(true)
    const interval = setInterval(() => {
      loadData(false)
    }, 8000)
    return () => clearInterval(interval)
  }, [token])

  const activeInnings = scorecardData?.innings?.find(i => i.innings_number === selectedInningsNum)
  const activeState = inningsStates[selectedInningsNum]

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `${scorecardData?.team_a?.name} vs ${scorecardData?.team_b?.name} - Live Score`,
        text: `Watch live cricket score on Selected Sports!`,
        url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrintPdf = () => {
    window.print()
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: "#FFFFFF", fontFamily: "var(--font-head)" }}>
        <div>
          <span style={{ fontSize: 40 }}>🏏</span>
          <h3 style={{ marginTop: 12, fontSize: 18 }}>Loading Live Scorecard...</h3>
          <p style={{ fontSize: 12, color: "#94A3B8" }}>Updating live from the ground</p>
        </div>
      </div>
    )
  }

  if (error || !scorecardData) {
    return (
      <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: "#FFFFFF" }}>
        <div style={{ maxWidth: 400, background: "#1E293B", padding: 24, borderRadius: 16 }}>
          <span style={{ fontSize: 36 }}>🔒</span>
          <h3 style={{ margin: "12px 0 6px", fontSize: 18, color: "#F87171" }}>Scorecard Unavailable</h3>
          <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{error || "Match not found."}</p>
          <button
            onClick={() => { if (onBackHome) onBackHome(); else window.location.href = "/" }}
            style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, background: "#166534", color: "#FFFFFF", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            Go to Selected Sports
          </button>
        </div>
      </div>
    )
  }

  const ballsPerOver = Number(scorecardData.config?.balls_per_over || 6)
  const completedOvers = activeState ? Math.floor(activeState.legal_balls / ballsPerOver) : 0
  const remBalls = activeState ? (activeState.legal_balls % ballsPerOver) : 0
  const overStr = `${completedOvers}.${remBalls}`
  const crr = (activeState && activeState.legal_balls > 0)
    ? ((activeState.total_runs / activeState.legal_balls) * ballsPerOver).toFixed(2)
    : "0.00"

  const battingTeamName = activeInnings?.batting_team_id === scorecardData.team_a?.id ? scorecardData.team_a?.name : scorecardData.team_b?.name

  const battersList = Object.values(activeState?.batter_stats || {})
    .filter(b => b.balls_faced > 0 || b.is_out || b.squad_id === activeState?.striker_id || b.squad_id === activeState?.non_striker_id)
    .sort((a, b) => (a.batting_order || 99) - (b.batting_order || 99))

  const bowlersList = Object.values(activeState?.bowler_stats || {})
    .filter(bw => bw.balls_bowled > 0)

  const shareUrl = window.location.href
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#FFFFFF", fontFamily: "var(--font-body)", paddingBottom: 40 }}>
      {/* Top Header with branding */}
      <div style={{ padding: "12px 20px", background: "#0B1329", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🏏</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 900, fontFamily: "var(--font-head)", color: "#FFFFFF" }}>
              Selected Sports Live
            </h1>
            <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }}></span>
              LIVE BALL-BY-BALL
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowQr(prev => !prev)}
            style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            title="Show QR Code (FR-9.20)"
          >
            📱 QR
          </button>
          <button
            onClick={handlePrintPdf}
            style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            title="Download PDF (FR-9.19)"
          >
            📄 PDF
          </button>
          <button
            onClick={handleShare}
            style={{ padding: "6px 14px", borderRadius: 8, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
          >
            {copied ? "✓ Copied" : "📤 Share"}
          </button>
        </div>
      </div>

      {/* QR Code Overlay (FR-9.20) */}
      {showQr && (
        <div style={{ background: "#1E293B", padding: 16, textAlign: "center", borderBottom: "1px solid #334155" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>Scan with mobile camera to view live match</p>
          <img src={qrCodeUrl} alt="Match Scorecard QR" style={{ width: 140, height: 140, borderRadius: 10, background: "#FFFFFF", padding: 6 }} />
        </div>
      )}

      {/* Main Scorecard View */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px" }}>
        {/* Match Title & Ground */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, fontFamily: "var(--font-head)" }}>
            {scorecardData.team_a?.name} vs {scorecardData.team_b?.name}
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>
            📍 {scorecardData.ground_name} • {scorecardData.config?.format || "T20"} Format
          </p>
        </div>

        {/* Live Score Banner */}
        <div style={{ background: "linear-gradient(135deg, #166534 0%, #14532D 100%)", borderRadius: 16, padding: "18px 20px", marginBottom: 16, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>
                {battingTeamName}
              </span>
              <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "var(--font-head)", margin: "2px 0" }}>
                {activeState?.total_runs ?? 0}/{activeState?.total_wickets ?? 0}
                <span style={{ fontSize: 18, fontWeight: 600, opacity: 0.85, marginLeft: 10 }}>
                  ({overStr} / {activeInnings?.overs_limit} ov)
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "block" }}>CRR</span>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{crr}</span>
            </div>
          </div>

          {activeInnings?.target && (
            <div style={{ marginTop: 10, padding: "6px 12px", background: "rgba(0,0,0,0.25)", borderRadius: 8, fontSize: 13, color: "#FEF08A", fontWeight: 700 }}>
              Target: {activeInnings.target} runs
            </div>
          )}

          {scorecardData.result && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#FEF3C7", color: "#B45309", borderRadius: 8, fontSize: 13, fontWeight: 800, textAlign: "center" }}>
              🏆 {scorecardData.result.result_text}
            </div>
          )}
        </div>

        {/* Innings Tabs */}
        {scorecardData.innings?.length > 1 && (
          <div style={{ display: "flex", background: "#1E293B", padding: 4, borderRadius: 10, marginBottom: 14 }}>
            {scorecardData.innings.map(inn => (
              <button
                key={inn.id}
                onClick={() => setSelectedInningsNum(inn.innings_number)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedInningsNum === inn.innings_number ? "#166534" : "transparent",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Innings {inn.innings_number}
              </button>
            ))}
          </div>
        )}

        {/* Batting Card */}
        <div style={{ background: "#1E293B", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "10px 14px", background: "#334155", display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr 1fr 1.2fr", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#CBD5E1" }}>
            <span>Batter</span>
            <span style={{ textAlign: "right" }}>R</span>
            <span style={{ textAlign: "right" }}>B</span>
            <span style={{ textAlign: "right" }}>4s</span>
            <span style={{ textAlign: "right" }}>6s</span>
            <span style={{ textAlign: "right" }}>SR</span>
          </div>

          {battersList.map(b => (
            <div key={b.squad_id} style={{ padding: "10px 14px", borderBottom: "1px solid #334155", display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr 1fr 1.2fr", alignItems: "center", fontSize: 13 }}>
              <div>
                <span style={{ fontWeight: 800, color: "#FFFFFF" }}>{b.name}</span>
                <span style={{ display: "block", fontSize: 11, color: "#94A3B8" }}>{b.dismissal_text}</span>
              </div>
              <span style={{ textAlign: "right", fontWeight: 900, color: "#4ADE80", fontSize: 14 }}>{b.runs}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{b.balls_faced}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{b.fours}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{b.sixes}</span>
              <span style={{ textAlign: "right", color: "#F8FAFC", fontWeight: 700 }}>{b.strike_rate || "—"}</span>
            </div>
          ))}

          <div style={{ padding: "10px 14px", background: "#0F172A", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94A3B8" }}>
            <span>Extras</span>
            <span style={{ fontWeight: 800, color: "#FFFFFF" }}>
              {activeState?.extras?.total ?? 0} (wd {activeState?.extras?.wide ?? 0}, nb {activeState?.extras?.noball ?? 0}, b {activeState?.extras?.bye ?? 0}, lb {activeState?.extras?.legbye ?? 0})
            </span>
          </div>
        </div>

        {/* Bowling Card */}
        <div style={{ background: "#1E293B", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "10px 14px", background: "#334155", display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr 1fr 1.2fr", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#CBD5E1" }}>
            <span>Bowler</span>
            <span style={{ textAlign: "right" }}>O</span>
            <span style={{ textAlign: "right" }}>M</span>
            <span style={{ textAlign: "right" }}>R</span>
            <span style={{ textAlign: "right" }}>W</span>
            <span style={{ textAlign: "right" }}>Econ</span>
          </div>

          {bowlersList.map(bw => (
            <div key={bw.squad_id} style={{ padding: "10px 14px", borderBottom: "1px solid #334155", display: "grid", gridTemplateColumns: "2.2fr 1fr 1fr 1fr 1fr 1.2fr", alignItems: "center", fontSize: 13 }}>
              <span style={{ fontWeight: 800, color: "#FFFFFF" }}>{bw.name}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{bw.overs_bowled_str}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{bw.maidens}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{bw.runs_conceded}</span>
              <span style={{ textAlign: "right", fontWeight: 900, color: "#4ADE80", fontSize: 14 }}>{bw.wickets}</span>
              <span style={{ textAlign: "right", color: "#F8FAFC", fontWeight: 700 }}>{bw.economy}</span>
            </div>
          ))}
        </div>

        {/* Fall of Wickets */}
        {activeState?.fall_of_wickets && activeState.fall_of_wickets.length > 0 && (
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, color: "#CBD5E1", textTransform: "uppercase" }}>Fall of Wickets</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12 }}>
              {activeState.fall_of_wickets.map(f => (
                <div key={f.wicket_no} style={{ background: "#0F172A", padding: "6px 10px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 800, color: "#DC2626" }}>{f.wicket_no}-{f.runs}</span>
                  <span style={{ color: "#94A3B8", marginLeft: 4 }}>({f.batter_name}, {f.over_str} ov)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Commentary Feed */}
        {activeState?.commentary && activeState.commentary.length > 0 && (
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 800, color: "#CBD5E1", textTransform: "uppercase" }}>Over Commentary</h4>
            <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6 }}>
              {activeState.commentary.slice(-10).map((c, i) => (
                <div key={i} style={{ padding: "6px 10px", background: "#0F172A", borderRadius: 8, fontSize: 12, color: "#CBD5E1" }}>
                  {c.line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
