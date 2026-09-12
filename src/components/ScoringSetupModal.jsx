import React, { useState, useEffect } from "react"
import {
  fetchScoringConfig,
  saveScoringConfig,
  fetchMatchSquad,
  saveMatchSquad,
  fetchMatchPlayers,
  saveInningsRecord,
} from "../db.js"
import { generateUUID } from "../scoringStorage.js"
import { MATCH_FORMATS, DEFAULT_CONFIG } from "../scoringEngine.js"

export default function ScoringSetupModal({ match, teams = [], players = [], currentUser, onClose, onStartScoring }) {
  const [step, setStep] = useState(1) // 1: Match Config & Toss, 2: Squad Assignment, 3: Select Openers
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Config State
  const [format, setFormat] = useState("T20")
  const [overs, setOvers] = useState(20)
  const [ballsPerOver, setBallsPerOver] = useState(6)
  const [playersPerSide, setPlayersPerSide] = useState(match?.match_type === "internal_9v9" ? 9 : 11)
  const [maxOversPerBowler, setMaxOversPerBowler] = useState(4)
  const [freeHitEnabled, setFreeHitEnabled] = useState(true)
  const [widePenalty, setWidePenalty] = useState(1)
  const [noballPenalty, setNoballPenalty] = useState(1)
  const [byesEnabled, setByesEnabled] = useState(true)
  const [lastManStands, setLastManStands] = useState(false)

  // Toss State
  const teamA = teams.find(t => t.id === match?.team_a_id) || { id: match?.team_a_id || "team_a", name: "Team A" }
  const teamB = teams.find(t => t.id === match?.team_b_id) || { id: match?.team_b_id || "team_b", name: "Team B" }

  const [tossWinner, setTossWinner] = useState(teamA.id)
  const [tossDecision, setTossDecision] = useState("bat") // bat | bowl

  // Squad State
  const [confirmedParticipants, setConfirmedParticipants] = useState([])
  const [teamASquad, setTeamASquad] = useState([])
  const [teamBSquad, setTeamBSquad] = useState([])
  const [walkinName, setWalkinName] = useState("")
  const [walkinTeam, setWalkinTeam] = useState(teamA.id)

  // Openers State
  const [strikerId, setStrikerId] = useState("")
  const [nonStrikerId, setNonStrikerId] = useState("")
  const [openingBowlerId, setOpeningBowlerId] = useState("")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [config, existingSquad, participants] = await Promise.all([
          fetchScoringConfig(match.id),
          fetchMatchSquad(match.id),
          fetchMatchPlayers(match.id),
        ])

        if (config) {
          setFormat(config.format || "T20")
          setOvers(config.overs_per_innings || 20)
          setBallsPerOver(config.balls_per_over || 6)
          setPlayersPerSide(config.players_per_side || (match?.match_type === "internal_9v9" ? 9 : 11))
          setMaxOversPerBowler(config.max_overs_per_bowler || Math.ceil((config.overs_per_innings || 20) / 5))
          setFreeHitEnabled(config.free_hit_enabled ?? true)
          setWidePenalty(config.wide_penalty ?? 1)
          setNoballPenalty(config.noball_penalty ?? 1)
          setByesEnabled(config.byes_enabled ?? true)
          setLastManStands(config.last_man_stands ?? false)
          if (config.toss_winner_team_id) setTossWinner(config.toss_winner_team_id)
          if (config.toss_decision) setTossDecision(config.toss_decision)
        }

        const confirmed = (participants || []).filter(p => p.status === "confirmed")
        setConfirmedParticipants(confirmed)

        if (existingSquad && existingSquad.length > 0) {
          setTeamASquad(existingSquad.filter(s => s.team_id === teamA.id))
          setTeamBSquad(existingSquad.filter(s => s.team_id === teamB.id))
        } else {
          // Pre-populate by dividing confirmed players evenly or by player team
          const initialA = []
          const initialB = []
          confirmed.forEach((part, idx) => {
            const playerObj = players.find(p => p.id === part.player_id)
            const item = {
              id: generateUUID(),
              match_id: match.id,
              player_id: part.player_id,
              display_name: playerObj?.name || `Player ${idx + 1}`,
              is_linked: true,
              batting_order: idx + 1,
              is_captain: false,
              is_keeper: false,
            }
            if (idx % 2 === 0) {
              initialA.push({ ...item, team_id: teamA.id })
            } else {
              initialB.push({ ...item, team_id: teamB.id })
            }
          })
          setTeamASquad(initialA)
          setTeamBSquad(initialB)
        }
      } catch (err) {
        console.error("Setup load error:", err)
      }
      setLoading(false)
    }
    loadData()
  }, [match.id])

  const handleFormatChange = (fmt) => {
    setFormat(fmt)
    const preset = MATCH_FORMATS[fmt]
    if (preset) {
      setOvers(preset.overs)
      setBallsPerOver(preset.ballsPerOver)
      setMaxOversPerBowler(preset.maxOversPerBowler)
    }
  }

  const handleAddWalkin = () => {
    if (!walkinName.trim()) return
    const name = walkinName.trim()
    const matchingPlayer = players.find(p => p.name?.toLowerCase() === name.toLowerCase())

    const newMember = {
      id: generateUUID(),
      match_id: match.id,
      team_id: walkinTeam,
      player_id: matchingPlayer ? matchingPlayer.id : null,
      display_name: matchingPlayer ? matchingPlayer.name : name,
      is_linked: Boolean(matchingPlayer),
      batting_order: 99,
      is_captain: false,
      is_keeper: false,
    }

    if (walkinTeam === teamA.id) {
      setTeamASquad(prev => [...prev, newMember])
    } else {
      setTeamBSquad(prev => [...prev, newMember])
    }
    setWalkinName("")
  }

  const movePlayerToTeam = (squadItem, targetTeamId) => {
    if (targetTeamId === teamA.id) {
      setTeamBSquad(prev => prev.filter(p => p.id !== squadItem.id))
      setTeamASquad(prev => [...prev, { ...squadItem, team_id: teamA.id }])
    } else {
      setTeamASquad(prev => prev.filter(p => p.id !== squadItem.id))
      setTeamBSquad(prev => [...prev, { ...squadItem, team_id: teamB.id }])
    }
  }

  const removeSquadItem = (squadId, teamId) => {
    if (teamId === teamA.id) {
      setTeamASquad(prev => prev.filter(p => p.id !== squadId))
    } else {
      setTeamBSquad(prev => prev.filter(p => p.id !== squadId))
    }
  }

  const toggleCaptain = (squadId, teamId) => {
    if (teamId === teamA.id) {
      setTeamASquad(prev => prev.map(p => ({ ...p, is_captain: p.id === squadId ? !p.is_captain : false })))
    } else {
      setTeamBSquad(prev => prev.map(p => ({ ...p, is_captain: p.id === squadId ? !p.is_captain : false })))
    }
  }

  const toggleKeeper = (squadId, teamId) => {
    if (teamId === teamA.id) {
      setTeamASquad(prev => prev.map(p => ({ ...p, is_keeper: p.id === squadId ? !p.is_keeper : false })))
    } else {
      setTeamBSquad(prev => prev.map(p => ({ ...p, is_keeper: p.id === squadId ? !p.is_keeper : false })))
    }
  }

  // Derive 1st innings batting side from toss (FR-7.5)
  const isTeamABattingFirst = (tossWinner === teamA.id && tossDecision === "bat") ||
                              (tossWinner === teamB.id && tossDecision === "bowl")
  const battingSquad = isTeamABattingFirst ? teamASquad : teamBSquad
  const bowlingSquad = isTeamABattingFirst ? teamBSquad : teamASquad
  const battingTeam = isTeamABattingFirst ? teamA : teamB
  const bowlingTeam = isTeamABattingFirst ? teamB : teamA

  // Validation before step 3
  const handleProceedToOpeners = () => {
    if (teamASquad.length < 2 || teamBSquad.length < 2) {
      setError("Each squad must have at least 2 players to start scoring (FR-7.12).")
      return
    }
    setError("")
    // Default openers from batting order
    if (battingSquad.length >= 2) {
      setStrikerId(battingSquad[0].id)
      setNonStrikerId(battingSquad[1].id)
    }
    if (bowlingSquad.length >= 1) {
      setOpeningBowlerId(bowlingSquad[0].id)
    }
    setStep(3)
  }

  const handleStartInnings = async () => {
    if (!strikerId || !nonStrikerId || !openingBowlerId) {
      setError("Please select opening striker, non-striker, and opening bowler (FR-7.11).")
      return
    }
    if (strikerId === nonStrikerId) {
      setError("Striker and non-striker cannot be the same player.")
      return
    }

    setSaving(true)
    setError("")
    try {
      const configPayload = {
        format,
        overs_per_innings: Number(overs),
        balls_per_over: Number(ballsPerOver),
        players_per_side: Number(playersPerSide),
        max_overs_per_bowler: Number(maxOversPerBowler),
        free_hit_enabled: Boolean(freeHitEnabled),
        wide_penalty: Number(widePenalty),
        noball_penalty: Number(noballPenalty),
        byes_enabled: Boolean(byesEnabled),
        last_man_stands: Boolean(lastManStands),
        toss_winner_team_id: tossWinner,
        toss_decision: tossDecision,
        public_link_enabled: true,
        scoring_status: "live",
      }

      // 1. Save config
      const savedConfig = await saveScoringConfig(match.id, configPayload)

      // 2. Save squads with sequential batting orders
      const finalSquad = [
        ...teamASquad.map((s, idx) => ({ ...s, batting_order: idx + 1 })),
        ...teamBSquad.map((s, idx) => ({ ...s, batting_order: idx + 1 })),
      ]
      await saveMatchSquad(match.id, finalSquad)

      // 3. Create Innings 1 Record
      const innings1 = {
        id: generateUUID(),
        match_id: match.id,
        innings_number: 1,
        batting_team_id: battingTeam.id,
        bowling_team_id: bowlingTeam.id,
        target: null,
        overs_limit: Number(overs),
        total_runs: 0,
        total_wickets: 0,
        legal_balls: 0,
        status: "in_progress",
        is_revised: false,
      }
      await saveInningsRecord(innings1)

      // 4. Trigger Scoring Console
      onStartScoring({
        config: savedConfig,
        squad: finalSquad,
        innings: innings1,
        strikerId,
        nonStrikerId,
        openingBowlerId,
        battingTeam,
        bowlingTeam,
      })
    } catch (err) {
      console.error("Start innings error:", err)
      setError("Failed to initialize match: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 16, textAlign: "center", fontFamily: "var(--font-head)" }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Loading Match Scoring Setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 540, maxHeight: "90vh", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", background: "#166534", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, fontFamily: "var(--font-head)" }}>🏏 Live Scoring Setup</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.85 }}>{teamA.name} vs {teamB.name} • Step {step} of 3</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          {error && (
            <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, color: "#991B1B", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1: Format, Rules & Toss */}
          {step === 1 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>1. Match Format</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8, marginBottom: 18 }}>
                {["T10", "T20", "ODI", "Custom"].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => handleFormatChange(fmt)}
                    style={{
                      padding: "10px 6px",
                      borderRadius: 10,
                      border: format === fmt ? "2px solid #166534" : "1.5px solid #E2E8F0",
                      background: format === fmt ? "rgba(22,101,52,0.08)" : "#FFFFFF",
                      color: format === fmt ? "#166534" : "#334155",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {/* Overs & Players */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Overs / Innings</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={overs}
                    onChange={e => {
                      const v = Number(e.target.value)
                      setOvers(v)
                      setMaxOversPerBowler(Math.ceil(v / 5))
                    }}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Max Overs / Bowler</label>
                  <input
                    type="number"
                    min="1"
                    max={overs}
                    value={maxOversPerBowler}
                    onChange={e => setMaxOversPerBowler(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Players per Side</label>
                  <input
                    type="number"
                    min="5"
                    max="11"
                    value={playersPerSide}
                    onChange={e => setPlayersPerSide(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Balls per Over</label>
                  <input
                    type="number"
                    min="4"
                    max="8"
                    value={ballsPerOver}
                    onChange={e => setBallsPerOver(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Toggles (FR-7.4) */}
              <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>Rules & Extras</label>
              <div style={{ marginTop: 8, marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#1E293B", cursor: "pointer" }}>
                  <input type="checkbox" checked={freeHitEnabled} onChange={e => setFreeHitEnabled(e.target.checked)} />
                  Free hit after No-Ball
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#1E293B", cursor: "pointer" }}>
                  <input type="checkbox" checked={byesEnabled} onChange={e => setByesEnabled(e.target.checked)} />
                  Byes and Leg-byes permitted
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#1E293B", cursor: "pointer" }}>
                  <input type="checkbox" checked={lastManStands} onChange={e => setLastManStands(e.target.checked)} />
                  Last Man Stands (innings ends when all players out)
                </label>
              </div>

              {/* Toss (FR-7.5) */}
              <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>🪙 Match Toss</label>
              <div style={{ background: "#F8FAFC", padding: 14, borderRadius: 12, border: "1px solid #E2E8F0", marginTop: 8, marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#64748B" }}>Who won the toss?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => setTossWinner(teamA.id)}
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: tossWinner === teamA.id ? "2px solid #166534" : "1px solid #CBD5E1",
                      background: tossWinner === teamA.id ? "#FFFFFF" : "transparent",
                      fontWeight: 700,
                      fontSize: 13,
                      color: tossWinner === teamA.id ? "#166534" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🏆 {teamA.name}
                  </button>
                  <button
                    onClick={() => setTossWinner(teamB.id)}
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: tossWinner === teamB.id ? "2px solid #166534" : "1px solid #CBD5E1",
                      background: tossWinner === teamB.id ? "#FFFFFF" : "transparent",
                      fontWeight: 700,
                      fontSize: 13,
                      color: tossWinner === teamB.id ? "#166534" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🏆 {teamB.name}
                  </button>
                </div>

                <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#64748B" }}>Elected to:</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button
                    onClick={() => setTossDecision("bat")}
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: tossDecision === "bat" ? "2px solid #166534" : "1px solid #CBD5E1",
                      background: tossDecision === "bat" ? "#FFFFFF" : "transparent",
                      fontWeight: 700,
                      fontSize: 13,
                      color: tossDecision === "bat" ? "#166534" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    🏏 Bat First
                  </button>
                  <button
                    onClick={() => setTossDecision("bowl")}
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: tossDecision === "bowl" ? "2px solid #166534" : "1px solid #CBD5E1",
                      background: tossDecision === "bowl" ? "#FFFFFF" : "transparent",
                      fontWeight: 700,
                      fontSize: 13,
                      color: tossDecision === "bowl" ? "#166534" : "#475569",
                      cursor: "pointer",
                    }}
                  >
                    ⚾ Bowl First
                  </button>
                </div>

                <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(22,101,52,0.08)", borderRadius: 8, fontSize: 12, color: "#166534", fontWeight: 700 }}>
                  👉 {isTeamABattingFirst ? teamA.name : teamB.name} will bat first in Innings 1.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Squad Management & Walk-ins */}
          {step === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>2. Squad Allocation</label>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{teamASquad.length + teamBSquad.length} Total Players</span>
              </div>

              {/* Add Walk-in player (FR-7.7, FR-7.8) */}
              <div style={{ background: "#F1F5F9", padding: 12, borderRadius: 12, marginBottom: 16 }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#334155" }}>➕ Add Walk-in Player</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Player Name"
                    value={walkinName}
                    onChange={e => setWalkinName(e.target.value)}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                  />
                  <select
                    value={walkinTeam}
                    onChange={e => setWalkinTeam(e.target.value)}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 600 }}
                  >
                    <option value={teamA.id}>{teamA.name}</option>
                    <option value={teamB.id}>{teamB.name}</option>
                  </select>
                  <button
                    onClick={handleAddWalkin}
                    style={{ padding: "8px 14px", borderRadius: 8, background: "#166534", color: "#FFFFFF", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                  >
                    Add
                  </button>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#64748B" }}>
                  💡 Unlinked walk-ins will record stats for this match but won't affect career leaderboards (FR-7.8).
                </p>
              </div>

              {/* Side-by-Side or Stacked Squad Lists */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Team A */}
                <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{teamA.name} ({teamASquad.length})</h4>
                    <span style={{ fontSize: 11, color: teamASquad.length >= 2 ? "#166534" : "#DC2626", fontWeight: 700 }}>
                      {teamASquad.length < 2 ? "Min 2 needed" : "Ready"}
                    </span>
                  </div>
                  {teamASquad.map((s, idx) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: "#F8FAFC", borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#334155" }}>{idx + 1}. {s.display_name}</span>
                        {!s.is_linked && <span style={{ fontSize: 10, background: "#E2E8F0", color: "#64748B", padding: "1px 5px", borderRadius: 4, marginLeft: 6 }}>Walk-in</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => toggleCaptain(s.id, teamA.id)}
                          style={{ border: "none", background: s.is_captain ? "#FEF3C7" : "transparent", color: s.is_captain ? "#B45309" : "#94A3B8", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          title="Captain"
                        >
                          C
                        </button>
                        <button
                          onClick={() => toggleKeeper(s.id, teamA.id)}
                          style={{ border: "none", background: s.is_keeper ? "#E0E7FF" : "transparent", color: s.is_keeper ? "#4338CA" : "#94A3B8", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          title="Wicket Keeper"
                        >
                          WK
                        </button>
                        <button
                          onClick={() => movePlayerToTeam(s, teamB.id)}
                          style={{ border: "none", background: "#E2E8F0", color: "#475569", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          title="Move to Team B"
                        >
                          ➡️
                        </button>
                        <button
                          onClick={() => removeSquadItem(s.id, teamA.id)}
                          style={{ border: "none", background: "transparent", color: "#EF4444", padding: "2px 6px", cursor: "pointer", fontSize: 12 }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Team B */}
                <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{teamB.name} ({teamBSquad.length})</h4>
                    <span style={{ fontSize: 11, color: teamBSquad.length >= 2 ? "#166534" : "#DC2626", fontWeight: 700 }}>
                      {teamBSquad.length < 2 ? "Min 2 needed" : "Ready"}
                    </span>
                  </div>
                  {teamBSquad.map((s, idx) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: "#F8FAFC", borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#334155" }}>{idx + 1}. {s.display_name}</span>
                        {!s.is_linked && <span style={{ fontSize: 10, background: "#E2E8F0", color: "#64748B", padding: "1px 5px", borderRadius: 4, marginLeft: 6 }}>Walk-in</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => toggleCaptain(s.id, teamB.id)}
                          style={{ border: "none", background: s.is_captain ? "#FEF3C7" : "transparent", color: s.is_captain ? "#B45309" : "#94A3B8", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          title="Captain"
                        >
                          C
                        </button>
                        <button
                          onClick={() => toggleKeeper(s.id, teamB.id)}
                          style={{ border: "none", background: s.is_keeper ? "#E0E7FF" : "transparent", color: s.is_keeper ? "#4338CA" : "#94A3B8", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          title="Wicket Keeper"
                        >
                          WK
                        </button>
                        <button
                          onClick={() => movePlayerToTeam(s, teamA.id)}
                          style={{ border: "none", background: "#E2E8F0", color: "#475569", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                          title="Move to Team A"
                        >
                          ⬅️
                        </button>
                        <button
                          onClick={() => removeSquadItem(s.id, teamB.id)}
                          style={{ border: "none", background: "transparent", color: "#EF4444", padding: "2px 6px", cursor: "pointer", fontSize: 12 }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Select Openers (FR-7.11) */}
          {step === 3 && (
            <div>
              <div style={{ background: "rgba(22,101,52,0.08)", padding: 12, borderRadius: 12, marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#166534" }}>
                  🏏 Innings 1: {battingTeam.name} Batting vs {bowlingTeam.name} Bowling
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#475569" }}>
                  Select the opening pair and the opening bowler to begin the match.
                </p>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>⚡ Opening Striker (Facing first ball)</label>
                <select
                  value={strikerId}
                  onChange={e => setStrikerId(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                >
                  <option value="">Select Striker</option>
                  {battingSquad.map(s => (
                    <option key={s.id} value={s.id} disabled={s.id === nonStrikerId}>
                      {s.display_name} {s.is_captain ? "(C)" : ""} {s.is_keeper ? "(WK)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>👤 Non-Striker (Runner)</label>
                <select
                  value={nonStrikerId}
                  onChange={e => setNonStrikerId(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                >
                  <option value="">Select Non-Striker</option>
                  {battingSquad.map(s => (
                    <option key={s.id} value={s.id} disabled={s.id === strikerId}>
                      {s.display_name} {s.is_captain ? "(C)" : ""} {s.is_keeper ? "(WK)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>⚾ Opening Bowler ({bowlingTeam.name})</label>
                <select
                  value={openingBowlerId}
                  onChange={e => setOpeningBowlerId(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                >
                  <option value="">Select Opening Bowler</option>
                  {bowlingSquad.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.display_name} {s.is_captain ? "(C)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC" }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{ padding: "10px 16px", borderRadius: 10, border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancel
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              style={{ padding: "10px 22px", borderRadius: 10, background: "#166534", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-head)" }}
            >
              Next: Squads ➡️
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleProceedToOpeners}
              style={{ padding: "10px 22px", borderRadius: 10, background: "#166534", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-head)" }}
            >
              Next: Openers ➡️
            </button>
          )}

          {step === 3 && (
            <button
              disabled={saving}
              onClick={handleStartInnings}
              style={{ padding: "10px 24px", borderRadius: 10, background: "#166534", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, fontFamily: "var(--font-head)" }}
            >
              {saving ? "Starting..." : "🚀 Start Scoring"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
