import React, { useState, useEffect } from "react"
import {
  fetchInnings,
  fetchDeliveries,
  fetchMatchSquad,
  fetchScoringConfig,
  fetchGrounds,
  fetchTeams,
} from "../db.js"
import { reduceInningsState, DEFAULT_CONFIG } from "../scoringEngine.js"

export default function LiveScorecard({ matchId, match: passedMatch, onClose }) {
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState(passedMatch || null)
  const [teams, setTeams] = useState([])
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [squad, setSquad] = useState([])
  const [inningsList, setInningsList] = useState([])
  const [selectedInningsNum, setSelectedInningsNum] = useState(1)
  const [inningsStates, setInningsStates] = useState({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [t, s, cfg, inn] = await Promise.all([
          fetchTeams(),
          fetchMatchSquad(matchId),
          fetchScoringConfig(matchId),
          fetchInnings(matchId),
        ])
        setTeams(t || [])
        setSquad(s || [])
        if (cfg) setConfig(cfg)
        setInningsList(inn || [])

        // For each innings, fetch its deliveries and compute state
        const stateMap = {}
        for (const i of inn || []) {
          const dels = await fetchDeliveries(i.id)
          stateMap[i.innings_number] = reduceInningsState(cfg || DEFAULT_CONFIG, s || [], dels, i)
        }
        setInningsStates(stateMap)

        if (inn && inn.length > 1) {
          setSelectedInningsNum(inn[inn.length - 1].innings_number)
        }
      } catch (err) {
        console.error("LiveScorecard load error:", err)
      }
      setLoading(false)
    }
    load()
  }, [matchId])

  const activeInnings = inningsList.find(i => i.innings_number === selectedInningsNum)
  const activeState = inningsStates[selectedInningsNum]

  const teamA = teams.find(t => t.id === match?.team_a_id) || { name: "Team A" }
  const teamB = teams.find(t => t.id === match?.team_b_id) || { name: "Team B" }

  const battingTeam = teams.find(t => t.id === activeInnings?.batting_team_id) || { name: "Batting Team" }
  const bowlingTeam = teams.find(t => t.id === activeInnings?.bowling_team_id) || { name: "Bowling Team" }

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 16, textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#0F172A" }}>Loading Match Scorecard...</p>
        </div>
      </div>
    )
  }

  const ballsPerOver = Number(config?.balls_per_over || 6)
  const completedOvers = activeState ? Math.floor(activeState.legal_balls / ballsPerOver) : 0
  const remBalls = activeState ? (activeState.legal_balls % ballsPerOver) : 0
  const overStr = `${completedOvers}.${remBalls}`
  const crr = (activeState && activeState.legal_balls > 0)
    ? ((activeState.total_runs / activeState.legal_balls) * ballsPerOver).toFixed(2)
    : "0.00"

  // Batters sorted by batting order
  const battersList = Object.values(activeState?.batter_stats || {})
    .filter(b => b.balls_faced > 0 || b.is_out || b.squad_id === activeState?.striker_id || b.squad_id === activeState?.non_striker_id)
    .sort((a, b) => (a.batting_order || 99) - (b.batting_order || 99))

  // Bowlers sorted by balls bowled
  const bowlersList = Object.values(activeState?.bowler_stats || {})
    .filter(bw => bw.balls_bowled > 0)

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0F172A", zIndex: 10000, display: "flex", flexDirection: "column", color: "#FFFFFF", fontFamily: "var(--font-body)" }}>
      {/* Top Bar */}
      <div style={{ padding: "12px 16px", background: "#0B1329", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: 20, cursor: "pointer" }}>✕</button>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, fontFamily: "var(--font-head)" }}>
              {teamA.name} vs {teamB.name}
            </h3>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Match Scorecard • {config.format || "T20"}</span>
          </div>
        </div>

        {/* Innings Tabs */}
        {inningsList.length > 1 && (
          <div style={{ display: "flex", background: "#1E293B", padding: 3, borderRadius: 8 }}>
            {inningsList.map(inn => (
              <button
                key={inn.id}
                onClick={() => setSelectedInningsNum(inn.innings_number)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: selectedInningsNum === inn.innings_number ? "#166534" : "transparent",
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Inn {inn.innings_number}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Innings Score Banner */}
      <div style={{ background: "linear-gradient(135deg, #166534 0%, #14532D 100%)", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>
              {battingTeam.name} Batting
            </span>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--font-head)", margin: "2px 0" }}>
              {activeState?.total_runs ?? 0}/{activeState?.total_wickets ?? 0}
              <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.85, marginLeft: 8 }}>
                ({overStr} / {activeInnings?.overs_limit} ov)
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "block" }}>CRR</span>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{crr}</span>
          </div>
        </div>

        {activeInnings?.target && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#FEF08A", fontWeight: 700 }}>
            Target: {activeInnings.target} runs
          </div>
        )}
      </div>

      {/* Scorecard Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {/* ── BATTING CARD (FR-9.2) ── */}
        <div style={{ background: "#1E293B", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "10px 14px", background: "#334155", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#CBD5E1" }}>
            <span>Batter</span>
            <span style={{ textAlign: "right" }}>R</span>
            <span style={{ textAlign: "right" }}>B</span>
            <span style={{ textAlign: "right" }}>4s</span>
            <span style={{ textAlign: "right" }}>6s</span>
            <span style={{ textAlign: "right" }}>SR</span>
          </div>

          {battersList.map(b => (
            <div key={b.squad_id} style={{ padding: "10px 14px", borderBottom: "1px solid #334155", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr", alignItems: "center", fontSize: 13 }}>
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

          {/* Extras Breakdown (FR-9.4) */}
          <div style={{ padding: "10px 14px", background: "#0F172A", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94A3B8" }}>
            <span>Extras</span>
            <span style={{ fontWeight: 800, color: "#FFFFFF" }}>
              {activeState?.extras?.total ?? 0} (wd {activeState?.extras?.wide ?? 0}, nb {activeState?.extras?.noball ?? 0}, b {activeState?.extras?.bye ?? 0}, lb {activeState?.extras?.legbye ?? 0})
            </span>
          </div>
        </div>

        {/* ── BOWLING CARD (FR-9.3) ── */}
        <div style={{ background: "#1E293B", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "10px 14px", background: "#334155", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#CBD5E1" }}>
            <span>Bowler</span>
            <span style={{ textAlign: "right" }}>O</span>
            <span style={{ textAlign: "right" }}>M</span>
            <span style={{ textAlign: "right" }}>R</span>
            <span style={{ textAlign: "right" }}>W</span>
            <span style={{ textAlign: "right" }}>Econ</span>
          </div>

          {bowlersList.map(bw => (
            <div key={bw.squad_id} style={{ padding: "10px 14px", borderBottom: "1px solid #334155", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.2fr", alignItems: "center", fontSize: 13 }}>
              <span style={{ fontWeight: 800, color: "#FFFFFF" }}>{bw.name}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{bw.overs_bowled_str}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{bw.maidens}</span>
              <span style={{ textAlign: "right", color: "#94A3B8" }}>{bw.runs_conceded}</span>
              <span style={{ textAlign: "right", fontWeight: 900, color: "#4ADE80", fontSize: 14 }}>{bw.wickets}</span>
              <span style={{ textAlign: "right", color: "#F8FAFC", fontWeight: 700 }}>{bw.economy}</span>
            </div>
          ))}
        </div>

        {/* ── FALL OF WICKETS (FR-9.5) ── */}
        {activeState?.fall_of_wickets && activeState.fall_of_wickets.length > 0 && (
          <div style={{ background: "#1E293B", borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 800, color: "#CBD5E1", textTransform: "uppercase" }}>Fall of Wickets</h4>
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
      </div>
    </div>
  )
}
