import React, { useState, useEffect, useMemo, useRef } from "react"
import {
  reduceInningsState,
  validateDelivery,
  isBowlerEligible,
  computeMatchResult,
  calculateImpactScore,
  aggregateMatchPlayerStats,
  DISMISSAL_TYPES,
  EXTRA_TYPES,
} from "../scoringEngine.js"
import {
  generateUUID,
  getLocalInningsDeliveries,
  appendLocalDelivery,
  removeLastLocalDelivery,
  supersedeLocalDelivery,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  subscribeConnectivity,
  isOnline,
  getPendingSyncCount,
  flushSyncQueue,
} from "../scoringStorage.js"
import {
  appendDeliveriesBatch,
  saveInningsRecord,
  commitMatchResult,
  fetchInnings,
  fetchDeliveries,
} from "../db.js"

export default function ScoringConsole({
  match,
  config,
  squad = [],
  initialInnings,
  battingTeam,
  bowlingTeam,
  initialStrikerId,
  initialNonStrikerId,
  initialBowlerId,
  currentUser,
  onClose,
  onViewScorecard,
}) {
  // Innings tracking
  const [currentInnings, setCurrentInnings] = useState(initialInnings)
  const [innings1State, setInnings1State] = useState(null)
  const [deliveries, setDeliveries] = useState(() => getLocalInningsDeliveries(initialInnings?.id || "temp"))

  // Connectivity & Sync state
  const [online, setOnline] = useState(isOnline())
  const [pendingSyncCount, setPendingSyncCount] = useState(getPendingSyncCount(currentInnings?.id))
  const [syncStatus, setSyncStatus] = useState("synced") // synced, syncing, offline, error

  // Modals / Dialogs
  const [showWicketModal, setShowWicketModal] = useState(false)
  const [showBowlerModal, setShowBowlerModal] = useState(false)
  const [showBatterModal, setShowBatterModal] = useState(false)
  const [showExtrasModal, setShowExtrasModal] = useState(false)
  const [selectedExtraType, setSelectedExtraType] = useState(null)
  const [showEditPastModal, setShowEditPastModal] = useState(false)
  const [showInningsBreakModal, setShowInningsBreakModal] = useState(false)
  const [showMatchCompleteModal, setShowMatchCompleteModal] = useState(false)
  const [showTargetOverrideModal, setShowTargetOverrideModal] = useState(false)

  // Wicket Dialog state
  const [dismissalType, setDismissalType] = useState(DISMISSAL_TYPES.BOWLED)
  const [dismissedSquadId, setDismissedSquadId] = useState("")
  const [fielderSquadId, setFielderSquadId] = useState("")
  const [runsBeforeRunOut, setRunsBeforeRunOut] = useState(0)
  const [incomingBatterId, setIncomingBatterId] = useState("")

  // Target Override state
  const [revisedOvers, setRevisedOvers] = useState(config?.overs_per_innings || 20)
  const [revisedTarget, setRevisedTarget] = useState(100)

  // MoM selection state
  const [selectedMomId, setSelectedMomId] = useState("")

  // Screen Wake Lock (FR-8.15)
  useEffect(() => {
    requestScreenWakeLock()
    return () => {
      releaseScreenWakeLock()
    }
  }, [])

  // Network Connectivity listener (FR-10.6)
  useEffect(() => {
    const unsub = subscribeConnectivity(isNowOnline => {
      setOnline(isNowOnline)
      if (isNowOnline) {
        triggerSync()
      }
    })
    return () => unsub()
  }, [currentInnings?.id])

  // Periodic Auto-Sync Flush (FR-10.4, FR-10.10)
  const triggerSync = async () => {
    if (!isOnline()) {
      setSyncStatus("offline")
      return
    }
    setSyncStatus("syncing")
    const res = await flushSyncQueue(appendDeliveriesBatch)
    setPendingSyncCount(getPendingSyncCount(currentInnings?.id))
    if (res?.success || res?.empty) {
      setSyncStatus("synced")
    } else if (res?.error) {
      setSyncStatus("error")
    }
  }

  // Pure Reducer Call: Compute current innings state deterministically (AD-1, BR-20)
  const currentState = useMemo(() => {
    return reduceInningsState(
      config,
      squad,
      deliveries,
      {
        batting_team_id: currentInnings?.batting_team_id,
        bowling_team_id: currentInnings?.bowling_team_id,
        target: currentInnings?.target,
        overs_limit: currentInnings?.overs_limit,
        striker_id: initialStrikerId,
        non_striker_id: initialNonStrikerId,
        bowler_id: initialBowlerId,
        is_revised: currentInnings?.is_revised,
      }
    )
  }, [config, squad, deliveries, currentInnings, initialStrikerId, initialNonStrikerId, initialBowlerId])

  // Squad maps & active rosters
  const squadMap = useMemo(() => {
    const m = {}
    squad.forEach(s => { m[s.id] = s })
    return m
  }, [squad])

  const battingSquad = useMemo(() => {
    return squad.filter(s => s.team_id === currentState.batting_team_id)
  }, [squad, currentState.batting_team_id])

  const bowlingSquad = useMemo(() => {
    return squad.filter(s => s.team_id === currentState.bowling_team_id)
  }, [squad, currentState.bowling_team_id])

  const availableBatters = useMemo(() => {
    return battingSquad.filter(s => {
      const stats = currentState.batter_stats[s.id]
      const isCurrentlyBatting = s.id === currentState.striker_id || s.id === currentState.non_striker_id
      return !stats?.is_out && !isCurrentlyBatting
    })
  }, [battingSquad, currentState])

  // Next in batting order recommendation (FR-8.9)
  const nextBatterDefault = useMemo(() => {
    return availableBatters.sort((a, b) => (a.batting_order || 99) - (b.batting_order || 99))[0]?.id || ""
  }, [availableBatters])

  // Watch for state transitions
  useEffect(() => {
    if (currentState.status === "awaiting_batter" && availableBatters.length > 0) {
      setIncomingBatterId(nextBatterDefault)
      setShowBatterModal(true)
    } else if (currentState.status === "awaiting_bowler") {
      setShowBowlerModal(true)
    } else if (currentState.status === "complete") {
      handleInningsComplete()
    }
  }, [currentState.status, currentState.legal_balls, currentState.total_wickets])

  // Innings completion handler (BR-12, FR-9.8, FR-9.9)
  const handleInningsComplete = () => {
    if (currentInnings?.innings_number === 1) {
      setInnings1State(currentState)
      setShowInningsBreakModal(true)
    } else {
      // 2nd innings complete -> Match Finish
      setShowMatchCompleteModal(true)
    }
  }

  // ── Record Delivery Action (FR-8.1, FR-8.2, FR-8.3) ──────────────────────────

  const handleRecordDelivery = (delParams) => {
    const sequenceNo = deliveries.filter(d => !d.superseded_by).length + 1
    const ballsPerOver = Number(config?.balls_per_over || 6)
    const overNo = Math.floor(currentState.legal_balls / ballsPerOver)
    const ballInOver = (currentState.legal_balls % ballsPerOver) + 1

    const newDelivery = {
      id: generateUUID(),
      client_uuid: generateUUID(),
      innings_id: currentInnings.id,
      sequence_no: sequenceNo,
      over_no: overNo,
      ball_in_over: ballInOver,
      striker_id: currentState.striker_id,
      non_striker_id: currentState.non_striker_id,
      bowler_id: currentState.bowler_id,
      runs_off_bat: delParams.runs_off_bat ?? 0,
      extra_type: delParams.extra_type ?? EXTRA_TYPES.NONE,
      extra_runs: delParams.extra_runs ?? 0,
      is_wicket: Boolean(delParams.is_wicket),
      dismissal_type: delParams.dismissal_type || null,
      dismissed_squad_id: delParams.dismissed_squad_id || null,
      fielder_squad_id: delParams.fielder_squad_id || null,
      incoming_batter_id: delParams.incoming_batter_id || null,
      is_free_hit: Boolean(currentState.is_free_hit),
      created_at: new Date().toISOString(),
      created_by: currentUser?.id || null,
    }

    // Engine validation (BR-1 to BR-19)
    const val = validateDelivery(newDelivery, currentState, config)
    if (!val.valid) {
      alert("⚠️ Cannot record delivery: " + val.error)
      return
    }

    // 1. Persist locally first (FR-10.1)
    const updated = appendLocalDelivery(currentInnings.id, newDelivery)
    setDeliveries([...updated])
    setPendingSyncCount(getPendingSyncCount(currentInnings.id))

    // 2. Trigger async background flush (AD-3)
    triggerSync()
  }

  // Single-tap runs 0–6 (FR-8.2)
  const handleScoreRuns = (runs) => {
    handleRecordDelivery({
      runs_off_bat: runs,
      extra_type: EXTRA_TYPES.NONE,
      extra_runs: 0,
      is_wicket: false,
    })
  }

  // Manual Strike Rotation (FR-8.7)
  const handleManualStrikeSwap = () => {
    // Record a 0-ball dummy or swap in state by recording an event
    // Simplest clean approach: swap striker & non-striker on next delivery
    // We can swap by recording an instant dummy 0-run or swapping local state
    // Let's swap the current striker & non_striker references
    const temp = currentState.striker_id
    currentState.striker_id = currentState.non_striker_id
    currentState.non_striker_id = temp
    setDeliveries([...deliveries]) // trigger re-render
  }

  // ── Permanent Undo (FR-8.10, FR-8.11, AC-12) ──────────────────────────────────

  const handleUndo = () => {
    if (deliveries.length === 0) return
    if (!window.confirm("Undo the last delivery?")) return

    const updated = removeLastLocalDelivery(currentInnings.id)
    setDeliveries([...updated])
    setPendingSyncCount(getPendingSyncCount(currentInnings.id))
  }

  // ── Wicket Flow (FR-8.4, FR-8.5, FR-8.6, FR-8.9, FR-8.14) ────────────────────

  const handleOpenWicketModal = () => {
    setDismissalType(DISMISSAL_TYPES.BOWLED)
    setDismissedSquadId(currentState.striker_id)
    setFielderSquadId("")
    setRunsBeforeRunOut(0)
    setIncomingBatterId(nextBatterDefault)
    setShowWicketModal(true)
  }

  const handleConfirmWicket = () => {
    const isRunOut = dismissalType === DISMISSAL_TYPES.RUN_OUT
    const delParams = {
      runs_off_bat: isRunOut ? Number(runsBeforeRunOut) : 0,
      extra_type: EXTRA_TYPES.NONE,
      extra_runs: 0,
      is_wicket: true,
      dismissal_type: dismissalType,
      dismissed_squad_id: dismissedSquadId || currentState.striker_id,
      fielder_squad_id: fielderSquadId || null,
      incoming_batter_id: incomingBatterId || null,
    }

    handleRecordDelivery(delParams)
    setShowWicketModal(false)
  }

  // ── Bowler Selection (FR-8.8, BR-19) ──────────────────────────────────────────

  const handleSelectNextBowler = (bowlerId) => {
    if (!isBowlerEligible(bowlerId, currentState, config, bowlingSquad)) {
      alert("⚠️ This bowler cannot bowl this over (consecutive over or over limit reached).")
      return
    }
    currentState.bowler_id = bowlerId
    currentState.status = "in_progress"
    setShowBowlerModal(false)
    setDeliveries([...deliveries])
  }

  // ── Incoming Batter Selection (FR-8.9) ─────────────────────────────────────────

  const handleSelectIncomingBatter = (batterId) => {
    if (!batterId) return
    if (currentState.striker_id === null) {
      currentState.striker_id = batterId
    } else if (currentState.non_striker_id === null) {
      currentState.non_striker_id = batterId
    }
    currentState.status = "in_progress"
    setShowBatterModal(false)
    setDeliveries([...deliveries])
  }

  // ── Start Innings 2 Flow (FR-9.9) ─────────────────────────────────────────────

  const handleStartInnings2 = async () => {
    const target = (currentState.total_runs || 0) + 1
    const inn2BattingTeam = bowlingTeam
    const inn2BowlingTeam = battingTeam

    const inn2BattingSquad = squad.filter(s => s.team_id === inn2BattingTeam.id).sort((a, b) => (a.batting_order || 99) - (b.batting_order || 99))
    const inn2BowlingSquad = squad.filter(s => s.team_id === inn2BowlingTeam.id)

    const inn2Record = {
      id: generateUUID(),
      match_id: match.id,
      innings_number: 2,
      batting_team_id: inn2BattingTeam.id,
      bowling_team_id: inn2BowlingTeam.id,
      target,
      overs_limit: Number(config?.overs_per_innings || 20),
      total_runs: 0,
      total_wickets: 0,
      legal_balls: 0,
      status: "in_progress",
      is_revised: false,
    }

    await saveInningsRecord(inn2Record)
    setCurrentInnings(inn2Record)
    setDeliveries([])
    setShowInningsBreakModal(false)
  }

  // ── Match Commit & MoM (FR-9.11, FR-9.13, FR-9.14) ───────────────────────────

  const matchResult = useMemo(() => {
    return computeMatchResult(
      config,
      battingTeam,
      bowlingTeam,
      innings1State || { total_runs: currentState.total_runs, batting_team_id: currentState.batting_team_id },
      currentInnings?.innings_number === 2 ? currentState : null
    )
  }, [config, battingTeam, bowlingTeam, innings1State, currentState, currentInnings])

  // Auto-calculated MoM suggestions (BR-15)
  const momCandidates = useMemo(() => {
    const playerStats = aggregateMatchPlayerStats(match.id, squad, innings1State, currentState)
    return playerStats.sort((a, b) => (b.impact_score || 0) - (a.impact_score || 0))
  }, [match.id, squad, innings1State, currentState])

  const handleCommitMatch = async () => {
    const finalMomSquadId = selectedMomId || momCandidates[0]?.squad_id
    const playerStats = aggregateMatchPlayerStats(match.id, squad, innings1State, currentState)

    // Mark is_mom
    playerStats.forEach(p => {
      p.is_mom = p.squad_id === finalMomSquadId
    })

    const resultPayload = {
      id: generateUUID(),
      match_id: match.id,
      winning_team_id: matchResult.winning_team_id,
      result_type: matchResult.result_type,
      margin_value: matchResult.margin_value,
      margin_unit: matchResult.margin_unit,
      balls_remaining: matchResult.balls_remaining,
      result_text: matchResult.result_text,
      mom_squad_id: finalMomSquadId || null,
    }

    await commitMatchResult(match.id, resultPayload, playerStats)
    alert("🎉 Match successfully committed and recorded!")
    setShowMatchCompleteModal(false)
    if (onClose) onClose()
  }

  // Current over calculation
  const ballsPerOver = Number(config?.balls_per_over || 6)
  const completedOvers = Math.floor(currentState.legal_balls / ballsPerOver)
  const ballsInCurrentOver = currentState.legal_balls % ballsPerOver
  const currentOverStr = `${completedOvers}.${ballsInCurrentOver}`
  const currentRunRate = currentState.legal_balls > 0
    ? ((currentState.total_runs / currentState.legal_balls) * ballsPerOver).toFixed(2)
    : "0.00"

  // 2nd innings chase calculations
  const isSecondInnings = currentInnings?.innings_number === 2
  const target = currentInnings?.target || null
  const runsNeeded = target !== null ? Math.max(0, target - currentState.total_runs) : null
  const totalBallsAllowed = Number(currentInnings?.overs_limit || config?.overs_per_innings || 20) * ballsPerOver
  const ballsRemaining = Math.max(0, totalBallsAllowed - currentState.legal_balls)
  const requiredRunRate = (runsNeeded !== null && ballsRemaining > 0)
    ? ((runsNeeded / ballsRemaining) * ballsPerOver).toFixed(2)
    : "—"

  // Active striker & non-striker objects
  const striker = currentState.batter_stats[currentState.striker_id]
  const nonStriker = currentState.batter_stats[currentState.non_striker_id]
  const bowler = currentState.bowler_stats[currentState.bowler_id]

  const activeBattingTeamName = currentState.batting_team_id === battingTeam?.id ? battingTeam?.name : bowlingTeam?.name

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0F172A", zIndex: 9999, display: "flex", flexDirection: "column", color: "#F8FAFC", fontFamily: "var(--font-body)" }}>
      {/* ── TOP APP BAR (6.1, FR-10.6) ── */}
      <div style={{ padding: "10px 16px", background: "#0B1329", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94A3B8", fontSize: 18, cursor: "pointer" }}>⬅️</button>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#FFFFFF", fontFamily: "var(--font-head)" }}>
              {activeBattingTeamName} • Innings {currentInnings?.innings_number || 1}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: online ? "#22C55E" : "#EF4444" }}></span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>
                {online ? (pendingSyncCount > 0 ? `Syncing (${pendingSyncCount} pending)` : "Live & Synced") : `Offline (${pendingSyncCount} pending)`}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onViewScorecard && onViewScorecard(currentInnings?.match_id)}
            style={{ padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            📊 Scorecard
          </button>
          <button
            onClick={() => setShowTargetOverrideModal(true)}
            style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", color: "#FBBF24", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            title="Override Overs / Target"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* ── STICKY LIVE SCORE HEADER (FR-9.1, 6.1) ── */}
      <div style={{ background: "linear-gradient(135deg, #166534 0%, #14532D 100%)", padding: "14px 20px", borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", fontFamily: "var(--font-head)", letterSpacing: -0.5 }}>
              {currentState.total_runs}/{currentState.total_wickets}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginLeft: 10 }}>
              ({currentOverStr} / {currentInnings?.overs_limit} ov)
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", display: "block" }}>CRR</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>{currentRunRate}</span>
          </div>
        </div>

        {/* 2nd Innings Target / RRR display */}
        {isSecondInnings && target !== null && (
          <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(0,0,0,0.25)", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "#FEF08A", fontWeight: 700 }}>
              Need {runsNeeded} runs from {ballsRemaining} balls (Target: {target})
            </span>
            <span style={{ color: "#FFFFFF", fontWeight: 700 }}>RRR: {requiredRunRate}</span>
          </div>
        )}

        {/* Free Hit Banner (FR-8.13) */}
        {currentState.is_free_hit && (
          <div style={{ marginTop: 8, padding: "4px 10px", background: "#E11D48", borderRadius: 6, textAlign: "center", fontSize: 12, fontWeight: 900, color: "#FFFFFF", letterSpacing: 1, textTransform: "uppercase", animation: "pulse 1.5s infinite" }}>
            🔥 FREE HIT ACTIVE 🔥
          </div>
        )}
      </div>

      {/* ── BATSMEN & BOWLER LIVE CARDS ── */}
      <div style={{ padding: "10px 16px", background: "#1E293B", borderBottom: "1px solid #334155", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10 }}>
        {/* Batsmen at Crease */}
        <div style={{ background: "#0F172A", padding: 10, borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Batters</span>
            <button
              onClick={handleManualStrikeSwap}
              style={{ background: "#334155", border: "none", color: "#F8FAFC", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
              title="Manual strike rotate override (FR-8.7)"
            >
              🔄 Swap
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
            <span>⚡ {striker?.name || "Striker"} *</span>
            <span>{striker?.runs ?? 0} <span style={{ fontSize: 11, color: "#94A3B8" }}>({striker?.balls_faced ?? 0})</span></span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94A3B8" }}>
            <span>👤 {nonStriker?.name || "Non-Striker"}</span>
            <span>{nonStriker?.runs ?? 0} <span style={{ fontSize: 10 }}>({nonStriker?.balls_faced ?? 0})</span></span>
          </div>
        </div>

        {/* Current Bowler */}
        <div style={{ background: "#0F172A", padding: 10, borderRadius: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Bowler</span>
            <button
              onClick={() => setShowBowlerModal(true)}
              style={{ background: "#334155", border: "none", color: "#F8FAFC", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}
            >
              Change
            </button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
            ⚾ {bowler?.name || "Bowler"}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", display: "flex", justifyContent: "space-between" }}>
            <span>{bowler?.overs_bowled_str ?? "0.0"} ov • {bowler?.maidens ?? 0}M</span>
            <span style={{ color: "#4ADE80", fontWeight: 700 }}>{bowler?.wickets ?? 0}-{bowler?.runs_conceded ?? 0}</span>
          </div>
        </div>
      </div>

      {/* ── CURRENT OVER CHIPS STRIP (FR-9.6) ── */}
      <div style={{ padding: "8px 16px", background: "#0B1329", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Over:</span>
        {currentState.current_over_deliveries.length === 0 ? (
          <span style={{ fontSize: 12, color: "#64748B", fontStyle: "italic" }}>Start of over</span>
        ) : (
          currentState.current_over_deliveries.map((del, i) => {
            let label = String(del.runs_off_bat)
            let chipBg = "#334155"
            let chipColor = "#FFFFFF"

            if (del.is_wicket) {
              label = "W"
              chipBg = "#DC2626"
            } else if (del.extra_type === EXTRA_TYPES.WIDE) {
              label = del.extra_runs > 0 ? `Wd+${del.extra_runs}` : "Wd"
              chipBg = "#D97706"
            } else if (del.extra_type === EXTRA_TYPES.NO_BALL) {
              label = del.runs_off_bat > 0 ? `Nb+${del.runs_off_bat}` : "Nb"
              chipBg = "#E11D48"
            } else if (del.extra_type === EXTRA_TYPES.BYE) {
              label = `B${del.extra_runs}`
              chipBg = "#475569"
            } else if (del.extra_type === EXTRA_TYPES.LEG_BYE) {
              label = `Lb${del.extra_runs}`
              chipBg = "#475569"
            } else if (del.runs_off_bat === 4) {
              chipBg = "#2563EB"
            } else if (del.runs_off_bat === 6) {
              chipBg = "#7C3AED"
            } else if (del.runs_off_bat === 0) {
              label = "•"
              chipBg = "#1E293B"
            }

            return (
              <div
                key={del.id || i}
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: "0 6px",
                  borderRadius: 16,
                  background: chipBg,
                  color: chipColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {label}
              </div>
            )
          })
        )}
      </div>

      {/* ── RECENT COMMENTARY TICKER (FR-8.16, FR-8.17) ── */}
      <div style={{ flex: 1, padding: "8px 16px", overflowY: "auto", background: "#0F172A" }}>
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Commentary</p>
        <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6 }}>
          {currentState.commentary.slice(-6).map((c, i) => (
            <div key={i} style={{ padding: "6px 10px", background: "#1E293B", borderRadius: 8, fontSize: 12, color: "#CBD5E1", lineHeight: 1.4 }}>
              {c.line}
            </div>
          ))}
          {currentState.commentary.length === 0 && (
            <p style={{ margin: 0, fontSize: 12, color: "#64748B", fontStyle: "italic" }}>Ready for ball 1...</p>
          )}
        </div>
      </div>

      {/* ── LOWER SCORING KEYPAD (C-3, FR-8.2, FR-8.3, NFR-10, NFR-11) ── */}
      <div style={{ background: "#0B1329", borderTop: "2px solid #1E293B", padding: "12px 14px 20px" }}>
        {/* Secondary Actions Row: Extras, Wicket, Permanent Undo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) 1.2fr", gap: 8, marginBottom: 10 }}>
          <button
            onClick={() => handleRecordDelivery({ extra_type: EXTRA_TYPES.WIDE, extra_runs: 0 })}
            style={{ minHeight: 48, borderRadius: 10, background: "#D97706", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            Wide
          </button>
          <button
            onClick={() => handleRecordDelivery({ extra_type: EXTRA_TYPES.NO_BALL, runs_off_bat: 0 })}
            style={{ minHeight: 48, borderRadius: 10, background: "#E11D48", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            No Ball
          </button>
          <button
            onClick={() => setShowExtrasModal(true)}
            style={{ minHeight: 48, borderRadius: 10, background: "#475569", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            Bye / +
          </button>
          <button
            onClick={handleOpenWicketModal}
            style={{ minHeight: 48, borderRadius: 10, background: "#DC2626", color: "#FFFFFF", border: "none", fontWeight: 900, fontSize: 13, cursor: "pointer", letterSpacing: 0.5 }}
          >
            WICKET
          </button>
          {/* Permanent Undo (FR-8.10, FR-8.11) */}
          <button
            onClick={handleUndo}
            disabled={deliveries.length === 0}
            style={{
              minHeight: 48,
              borderRadius: 10,
              background: deliveries.length > 0 ? "#334155" : "#1E293B",
              color: deliveries.length > 0 ? "#F8FAFC" : "#64748B",
              border: "1.5px solid #475569",
              fontWeight: 800,
              fontSize: 13,
              cursor: deliveries.length > 0 ? "pointer" : "not-allowed",
            }}
          >
            ↩️ UNDO
          </button>
        </div>

        {/* 1-Tap Primary Run Buttons: 0, 1, 2, 3, 4, 6 (FR-8.2) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {[0, 1, 2, 3, 4, 6].map(runs => (
            <button
              key={runs}
              onClick={() => handleScoreRuns(runs)}
              style={{
                minHeight: 56, // >= 48dp per NFR-11
                borderRadius: 12,
                background: runs === 4 ? "#1D4ED8" : runs === 6 ? "#6D28D9" : "#166534",
                color: "#FFFFFF",
                border: "none",
                fontSize: 22,
                fontWeight: 900,
                fontFamily: "var(--font-head)",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
              }}
            >
              {runs}
            </button>
          ))}
        </div>
      </div>

      {/* ── MODAL: WICKET CONFIRMATION (FR-8.4, FR-8.5, FR-8.6, FR-8.14) ── */}
      {showWicketModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 440, borderRadius: 16, overflow: "hidden", color: "#0F172A", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", background: "#DC2626", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>🚨 Confirm Dismissal</h3>
              <button onClick={() => setShowWicketModal(false)} style={{ background: "transparent", border: "none", color: "#FFFFFF", fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: 18, overflowY: "auto", flex: 1 }}>
              {/* Dismissal Type Selector (FR-8.4) */}
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Dismissal Type</label>
              <select
                value={dismissalType}
                onChange={e => setDismissalType(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #CBD5E1", marginTop: 4, marginBottom: 14, fontSize: 14, fontWeight: 700 }}
              >
                <option value={DISMISSAL_TYPES.BOWLED}>Bowled (b bowler)</option>
                <option value={DISMISSAL_TYPES.CAUGHT}>Caught (c fielder b bowler)</option>
                <option value={DISMISSAL_TYPES.CAUGHT_AND_BOWLED}>Caught & Bowled (c & b bowler)</option>
                <option value={DISMISSAL_TYPES.LBW}>LBW (lbw b bowler)</option>
                <option value={DISMISSAL_TYPES.RUN_OUT}>Run Out</option>
                <option value={DISMISSAL_TYPES.STUMPED}>Stumped (st keeper b bowler)</option>
                <option value={DISMISSAL_TYPES.HIT_WICKET}>Hit Wicket</option>
                <option value={DISMISSAL_TYPES.RETIRED_HURT}>Retired Hurt</option>
                <option value={DISMISSAL_TYPES.RETIRED_OUT}>Retired Out</option>
                <option value={DISMISSAL_TYPES.OBSTRUCTING_FIELD}>Obstructing the Field</option>
                <option value={DISMISSAL_TYPES.TIMED_OUT}>Timed Out</option>
                <option value={DISMISSAL_TYPES.HANDLED_BALL}>Handled the Ball</option>
              </select>

              {/* Dismissed Player (Striker vs Non-Striker for Run Out) */}
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Dismissed Batter</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4, marginBottom: 14 }}>
                <button
                  type="button"
                  onClick={() => setDismissedSquadId(currentState.striker_id)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: (dismissedSquadId === currentState.striker_id || !dismissedSquadId) ? "2px solid #DC2626" : "1px solid #CBD5E1",
                    background: (dismissedSquadId === currentState.striker_id || !dismissedSquadId) ? "#FEF2F2" : "#FFFFFF",
                    fontWeight: 700,
                    fontSize: 13,
                    color: (dismissedSquadId === currentState.striker_id || !dismissedSquadId) ? "#DC2626" : "#334155",
                    cursor: "pointer",
                  }}
                >
                  ⚡ {striker?.name || "Striker"}
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedSquadId(currentState.non_striker_id)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: dismissedSquadId === currentState.non_striker_id ? "2px solid #DC2626" : "1px solid #CBD5E1",
                    background: dismissedSquadId === currentState.non_striker_id ? "#FEF2F2" : "#FFFFFF",
                    fontWeight: 700,
                    fontSize: 13,
                    color: dismissedSquadId === currentState.non_striker_id ? "#DC2626" : "#334155",
                    cursor: "pointer",
                  }}
                >
                  👤 {nonStriker?.name || "Non-Striker"}
                </button>
              </div>

              {/* Fielder Selection for Caught / Stumped / Run out (FR-8.6) */}
              {[DISMISSAL_TYPES.CAUGHT, DISMISSAL_TYPES.STUMPED, DISMISSAL_TYPES.RUN_OUT].includes(dismissalType) && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Fielder / Keeper Involved</label>
                  <select
                    value={fielderSquadId}
                    onChange={e => setFielderSquadId(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #CBD5E1", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                  >
                    <option value="">Select Fielder (optional)</option>
                    {bowlingSquad.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.display_name} {s.is_keeper ? "(WK)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Run Out: Runs Completed (FR-8.5) */}
              {dismissalType === DISMISSAL_TYPES.RUN_OUT && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Runs Completed Before Run Out</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {[0, 1, 2, 3].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRunsBeforeRunOut(r)}
                        style={{
                          flex: 1,
                          padding: 8,
                          borderRadius: 8,
                          border: runsBeforeRunOut === r ? "2px solid #166534" : "1px solid #CBD5E1",
                          background: runsBeforeRunOut === r ? "#DCFCE7" : "#FFFFFF",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Incoming Batter Selector (FR-8.9) */}
              {availableBatters.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Next Batter In</label>
                  <select
                    value={incomingBatterId}
                    onChange={e => setIncomingBatterId(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #CBD5E1", marginTop: 4, fontSize: 14, fontWeight: 700 }}
                  >
                    <option value="">Select Incoming Batter</option>
                    {availableBatters.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.batting_order}. {s.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 18px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowWicketModal(false)}
                style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFFFFF", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWicket}
                style={{ padding: "10px 20px", borderRadius: 8, background: "#DC2626", color: "#FFFFFF", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE / SELECT BOWLER (FR-8.8, BR-19) ── */}
      {showBowlerModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 400, borderRadius: 16, overflow: "hidden", color: "#0F172A", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", background: "#166534", color: "#FFFFFF" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>⚾ Select Next Bowler</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.85 }}>Select who bowls the next over</p>
            </div>

            <div style={{ padding: 16, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {bowlingSquad.map(s => {
                const eligible = isBowlerEligible(s.id, currentState, config, bowlingSquad)
                const stats = currentState.bowler_stats[s.id]
                const ballsBowled = stats?.balls_bowled || 0
                const bpo = config?.balls_per_over || 6
                const oversBowled = `${Math.floor(ballsBowled / bpo)}.${ballsBowled % bpo}`
                const isCurrent = s.id === currentState.bowler_id

                return (
                  <button
                    key={s.id}
                    disabled={!eligible}
                    onClick={() => handleSelectNextBowler(s.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: isCurrent ? "2px solid #166534" : "1px solid #E2E8F0",
                      background: eligible ? (isCurrent ? "rgba(22,101,52,0.08)" : "#FFFFFF") : "#F1F5F9",
                      opacity: eligible ? 1 : 0.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: eligible ? "pointer" : "not-allowed",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>{s.display_name}</span>
                      {!eligible && (
                        <span style={{ display: "block", fontSize: 11, color: "#DC2626", fontWeight: 700 }}>
                          {currentState.last_completed_over_bowler_id === s.id ? "Just bowled" : "Max overs reached"}
                        </span>
                      )}
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: "#64748B", fontWeight: 700 }}>
                      <span>{oversBowled} ov</span>
                      <span style={{ display: "block", color: "#166534" }}>{stats?.wickets || 0}-{stats?.runs_conceded || 0}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div style={{ padding: 12, background: "#F8FAFC", borderTop: "1px solid #E2E8F0", textAlign: "right" }}>
              <button
                onClick={() => setShowBowlerModal(false)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFFFFF", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SELECT INCOMING BATTER (FR-8.9) ── */}
      {showBatterModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 400, borderRadius: 16, overflow: "hidden", color: "#0F172A", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", background: "#166534", color: "#FFFFFF" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>⚡ Select Incoming Batter</h3>
              <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.85 }}>Who is coming in next to bat?</p>
            </div>

            <div style={{ padding: 16, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {availableBatters.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectIncomingBatter(s.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>{s.batting_order}. {s.display_name}</span>
                  <span style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>Select ➡️</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EXTRAS RUNS DIALOG (Byes, Leg-Byes, Wide+, Nb+) ── */}
      {showExtrasModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 380, borderRadius: 16, padding: 18, color: "#0F172A" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Extras & Byes</h3>
              <button onClick={() => setShowExtrasModal(false)} style={{ background: "transparent", border: "none", fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Byes (strike rotates on odd)</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 4 }}>
                  {[1, 2, 3, 4].map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        handleRecordDelivery({ extra_type: EXTRA_TYPES.BYE, extra_runs: r, runs_off_bat: 0 })
                        setShowExtrasModal(false)
                      }}
                      style={{ padding: "10px", borderRadius: 8, background: "#F1F5F9", border: "1px solid #CBD5E1", fontWeight: 800, cursor: "pointer" }}
                    >
                      {r} Bye{r > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Leg Byes</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 4 }}>
                  {[1, 2, 3, 4].map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        handleRecordDelivery({ extra_type: EXTRA_TYPES.LEG_BYE, extra_runs: r, runs_off_bat: 0 })
                        setShowExtrasModal(false)
                      }}
                      style={{ padding: "10px", borderRadius: 8, background: "#F1F5F9", border: "1px solid #CBD5E1", fontWeight: 800, cursor: "pointer" }}
                    >
                      {r} Lb
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Wide + Additional Runs Run</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 4 }}>
                  {[1, 2, 3, 4].map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        handleRecordDelivery({ extra_type: EXTRA_TYPES.WIDE, extra_runs: r, runs_off_bat: 0 })
                        setShowExtrasModal(false)
                      }}
                      style={{ padding: "10px", borderRadius: 8, background: "#FEF3C7", border: "1px solid #FCD34D", color: "#B45309", fontWeight: 800, cursor: "pointer" }}
                    >
                      Wd+{r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>No Ball + Runs off Bat</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 4 }}>
                  {[1, 2, 4, 6].map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        handleRecordDelivery({ extra_type: EXTRA_TYPES.NO_BALL, runs_off_bat: r, extra_runs: 0 })
                        setShowExtrasModal(false)
                      }}
                      style={{ padding: "10px", borderRadius: 8, background: "#FFE4E6", border: "1px solid #FDA4AF", color: "#BE123C", fontWeight: 800, cursor: "pointer" }}
                    >
                      Nb+{r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: INNINGS 1 BREAK (FR-9.9) ── */}
      {showInningsBreakModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 440, borderRadius: 20, overflow: "hidden", color: "#0F172A", textAlign: "center", padding: 24 }}>
            <span style={{ fontSize: 48 }}>🏏</span>
            <h2 style={{ margin: "12px 0 4px", fontSize: 22, fontWeight: 900, fontFamily: "var(--font-head)" }}>Innings 1 Complete!</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#64748B" }}>
              {activeBattingTeamName} scored <strong>{currentState.total_runs}/{currentState.total_wickets}</strong> ({currentOverStr} ov)
            </p>

            <div style={{ margin: "20px 0", padding: "14px", background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>Target for {bowlingTeam.name}</span>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#15803D", margin: "4px 0" }}>
                {currentState.total_runs + 1} runs
              </div>
              <span style={{ fontSize: 12, color: "#475569" }}>
                Required Run Rate: {(((currentState.total_runs + 1) / (config?.overs_per_innings || 20))).toFixed(2)} per over
              </span>
            </div>

            <button
              onClick={handleStartInnings2}
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#166534", color: "#FFFFFF", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}
            >
              Start Innings 2 🚀
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: MATCH COMPLETE & MoM SELECTION (FR-9.11, FR-9.13, FR-9.14) ── */}
      {showMatchCompleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 460, borderRadius: 20, overflow: "hidden", color: "#0F172A", padding: 24, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 44, textAlign: "center" }}>🏆</span>
            <h2 style={{ margin: "8px 0 4px", fontSize: 20, fontWeight: 900, textAlign: "center", fontFamily: "var(--font-head)" }}>Match Finished!</h2>
            <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#166534", textAlign: "center" }}>
              {matchResult.result_text}
            </p>

            <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                Select Man of the Match (Ranked by Impact Score - BR-15)
              </label>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {momCandidates.slice(0, 6).map((c, i) => (
                  <button
                    key={c.squad_id}
                    onClick={() => setSelectedMomId(c.squad_id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: (selectedMomId === c.squad_id || (!selectedMomId && i === 0)) ? "2px solid #F59E0B" : "1px solid #E2E8F0",
                      background: (selectedMomId === c.squad_id || (!selectedMomId && i === 0)) ? "#FEF3C7" : "#FFFFFF",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: "#0F172A" }}>
                        {i === 0 ? "⭐ " : ""}{c.name}
                      </span>
                      <span style={{ display: "block", fontSize: 11, color: "#64748B" }}>
                        {c.runs} runs ({c.balls_faced}b) • {c.wickets} wkts ({c.runs_conceded}r)
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 900, color: "#B45309" }}>
                      {c.impact_score} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCommitMatch}
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#166534", color: "#FFFFFF", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}
            >
              Commit Match & Update Stats 📈
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: OVERRIDE TARGET / OVERS (FR-9.10) ── */}
      {showTargetOverrideModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 360, borderRadius: 16, padding: 18, color: "#0F172A" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 900 }}>Override Overs / Target (FR-9.10)</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748B" }}>For rain or interrupted matches. Will mark innings as revised.</p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Overs Limit</label>
              <input
                type="number"
                value={revisedOvers}
                onChange={e => setRevisedOvers(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #CBD5E1", marginTop: 4 }}
              />
            </div>

            {isSecondInnings && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Revised Target</label>
                <input
                  type="number"
                  value={revisedTarget}
                  onChange={e => setRevisedTarget(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid #CBD5E1", marginTop: 4 }}
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowTargetOverrideModal(false)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFFFFF", cursor: "pointer" }}>Cancel</button>
              <button
                onClick={() => {
                  currentInnings.overs_limit = Number(revisedOvers)
                  if (isSecondInnings) currentInnings.target = Number(revisedTarget)
                  currentInnings.is_revised = true
                  saveInningsRecord(currentInnings)
                  setShowTargetOverrideModal(false)
                  setDeliveries([...deliveries])
                }}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#166534", color: "#FFFFFF", border: "none", fontWeight: 800, cursor: "pointer" }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
