import { useState, useEffect } from "react"
import { useMobile } from "../hooks/useMobile.js"
import {
  fetchMatches,
  fetchTeams,
  fetchGrounds,
  fetchScoringConfig,
  fetchMatchSquad,
  fetchInnings,
  fetchDeliveries,
  saveScoringConfig,
  saveMatchSquad,
} from "../db.js"
import { reduceInningsState } from "../scoringEngine.js"
import ScoringSetupModal from "./ScoringSetupModal.jsx"
import ScoringConsole from "./ScoringConsole.jsx"
import LiveScorecard from "./LiveScorecard.jsx"
import { LeaderboardPage, Spinner, Tag } from "./ui.jsx"
import {
  Swords, Trophy, ArrowLeft, Play, Eye, Share2, Sparkles,
  CheckCircle2, RefreshCw, Zap, Shield, Plus, Award
} from "lucide-react"

export default function LiveScoringHub({ onBackHome, onLogin }) {
  const isMobile = useMobile()
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all") // "all" | "live" | "completed" | "leaderboard"
  const [toast, setToast] = useState("")

  // Scoring modals state
  const [setupMatch, setSetupMatch] = useState(null)
  const [activeScoringSession, setActiveScoringSession] = useState(null)
  const [scorecardMatch, setScorecardMatch] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [m, t, g] = await Promise.all([
        fetchMatches().catch(() => []),
        fetchTeams().catch(() => []),
        fetchGrounds().catch(() => [])
      ])
      setMatches(m || [])
      setTeams(t || [])
      setGrounds(g || [])
    } catch (err) {
      console.error("Error loading matches for scoring hub:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Start scoring an existing match
  const handleScoreMatch = async (match) => {
    try {
      setLoading(true)
      const config = await fetchScoringConfig(match.id)
      if (!config) {
        // Needs setup wizard
        setSetupMatch(match)
        setLoading(false)
        return
      }
      const [sq, inns] = await Promise.all([
        fetchMatchSquad(match.id),
        fetchInnings(match.id)
      ])

      let currentInn = inns.find(i => i.status === "in_progress") || inns[0]
      if (!currentInn) {
        setSetupMatch(match)
        setLoading(false)
        return
      }

      const teamA = teams.find(t => t.id === match.team_a_id) || { id: match.team_a_id || "a", name: match.our_team || "Team A" }
      const teamB = teams.find(t => t.id === match.team_b_id) || { id: match.team_b_id || "b", name: match.team || "Team B" }

      const battingTeam = currentInn.batting_team_id === teamA.id ? teamA : teamB
      const bowlingTeam = battingTeam.id === teamA.id ? teamB : teamA

      const deliveries = await fetchDeliveries(currentInn.id)
      const state = reduceInningsState(deliveries, config)

      setActiveScoringSession({
        match,
        config,
        squad: sq,
        innings: currentInn,
        battingTeam,
        bowlingTeam,
        strikerId: state.strikerSquadId || sq.find(s => s.team_id === battingTeam.id)?.id,
        nonStrikerId: state.nonStrikerSquadId || sq.filter(s => s.team_id === battingTeam.id)[1]?.id,
        openingBowlerId: state.bowlerSquadId || sq.find(s => s.team_id === bowlingTeam.id)?.id,
      })
    } catch (err) {
      alert("Could not load scoring session: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Match setup with 1 click
  const handleStartQuickDemo = async () => {
    setLoading(true)
    try {
      const demoMatchId = "demo_match_" + Date.now()
      const demoTeamA = { id: "team_alpha", name: "Selected Tigers", short_name: "TIG" }
      const demoTeamB = { id: "team_beta", name: "Warriors XI", short_name: "WAR" }

      const mockMatch = {
        id: demoMatchId,
        team_a_id: demoTeamA.id,
        team_b_id: demoTeamB.id,
        our_team: demoTeamA.name,
        team: demoTeamB.name,
        date: new Date().toISOString().split("T")[0],
        time_slot: "7:00 AM - 9:00 AM",
        ground: "Selected Sports Arena",
        status: "in_progress",
        type: "9v9",
        scoring_token: "demo-" + Math.random().toString(36).substring(2, 9)
      }

      const mockConfig = {
        match_id: demoMatchId,
        format: "custom",
        overs_per_innings: 10,
        balls_per_over: 6,
        players_per_side: 9,
        wide_penalty: 1,
        noball_penalty: 1,
        free_hit_enabled: true,
        lbw_enabled: false,
        batting_first_team_id: demoTeamA.id,
        bowling_first_team_id: demoTeamB.id,
        toss_winner_team_id: demoTeamA.id,
        toss_decision: "bat"
      }

      // Generate 9 players per team
      const squadA = [
        "Ahad Khan", "Zeeshan Ali", "Hamza Tariq", "Bilal Ahmed", "Omar Farooq",
        "Danish Raza", "Usman Ghani", "Saad Malik", "Hassan Shah"
      ].map((name, i) => ({
        id: `sq_a_${i}`,
        match_id: demoMatchId,
        team_id: demoTeamA.id,
        player_name: name,
        jersey_number: i + 1,
        batting_order: i + 1
      }))

      const squadB = [
        "Rohit Verma", "Karan Sharma", "Arjun Nair", "Vikram Rathore", "Siddharth Rao",
        "Deepak Patel", "Rohan Joshi", "Aditya Iyer", "Manoj Tiwari"
      ].map((name, i) => ({
        id: `sq_b_${i}`,
        match_id: demoMatchId,
        team_id: demoTeamB.id,
        player_name: name,
        jersey_number: i + 1,
        batting_order: i + 1
      }))

      const fullSquad = [...squadA, ...squadB]

      const demoInnings = {
        id: "demo_inn_1",
        match_id: demoMatchId,
        innings_number: 1,
        batting_team_id: demoTeamA.id,
        bowling_team_id: demoTeamB.id,
        total_runs: 0,
        total_wickets: 0,
        total_legal_balls: 0,
        status: "in_progress"
      }

      // Save locally to scoring storage
      await saveScoringConfig(demoMatchId, mockConfig)
      await saveMatchSquad(demoMatchId, fullSquad)

      setActiveScoringSession({
        match: mockMatch,
        config: mockConfig,
        squad: fullSquad,
        innings: demoInnings,
        battingTeam: demoTeamA,
        bowlingTeam: demoTeamB,
        strikerId: squadA[0].id,
        nonStrikerId: squadA[1].id,
        openingBowlerId: squadB[0].id
      })
    } catch (e) {
      alert("Error starting demo match: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const copySpectatorLink = (match) => {
    const token = match.scoring_token || match.id
    const url = `${window.location.origin}/#/live-score/${token}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      showToast("📋 Spectator live link copied to clipboard!")
    } else {
      prompt("Copy live scorecard link:", url)
    }
  }

  // Active full screen scoring console
  if (activeScoringSession) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#0F172A", overflowY: "auto" }}>
        <ScoringConsole
          match={activeScoringSession.match}
          config={activeScoringSession.config}
          squad={activeScoringSession.squad}
          initialInnings={activeScoringSession.innings}
          battingTeam={activeScoringSession.battingTeam}
          bowlingTeam={activeScoringSession.bowlingTeam}
          initialStrikerId={activeScoringSession.strikerId}
          initialNonStrikerId={activeScoringSession.nonStrikerId}
          initialBowlerId={activeScoringSession.openingBowlerId}
          currentUser={{ name: "Guest Scorer", role: "admin" }}
          onClose={() => {
            setActiveScoringSession(null)
            loadData()
          }}
          onViewScorecard={() => setScorecardMatch(activeScoringSession.match)}
        />
        {scorecardMatch && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#F8FAF8", width: "100%", maxWidth: 720, maxHeight: "96vh", overflowY: "auto", borderRadius: isMobile ? 0 : 16 }}>
              <LiveScorecard
                matchId={scorecardMatch.id}
                match={scorecardMatch}
                onClose={() => setScorecardMatch(null)}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8FAF8",
      fontFamily: "var(--font-body)",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0F172A",
          color: "#FFFFFF",
          padding: "10px 20px",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          zIndex: 999999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: "#FFFFFF",
        borderBottom: "1.5px solid #E2E8F0",
        padding: isMobile ? "14px 16px" : "18px 28px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBackHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              color: "#64748B",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: 8
            }}
          >
            <ArrowLeft size={18} />
            <span>Home</span>
          </button>
          <div style={{ height: 20, width: 1, background: "#CBD5E1" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🏏</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                Live Cricket Scoring Hub
              </div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                Selected Sports Subsystem
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleStartQuickDemo}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #166534 0%, #15803D 100%)",
              color: "#FFFFFF",
              border: "none",
              padding: isMobile ? "8px 12px" : "9px 16px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(22,101,52,0.25)"
            }}
          >
            <Zap size={15} color="#86EFAC" />
            <span>{isMobile ? "Demo Score" : "⚡ Quick Demo Match"}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        maxWidth: 960,
        width: "100%",
        margin: "0 auto",
        padding: isMobile ? "16px" : "24px 20px"
      }}>

        {/* Feature Hero Card */}
        <div style={{
          background: "linear-gradient(135deg, #166534 0%, #0F5132 100%)",
          borderRadius: 20,
          padding: isMobile ? "20px 16px" : "24px 28px",
          color: "#FFFFFF",
          marginBottom: 24,
          boxShadow: "0 8px 24px rgba(22,101,52,0.25)",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 16
        }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginBottom: 8
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />
              Live Cricket Scoring Platform
            </div>
            <h1 style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 900,
              margin: "0 0 6px",
              fontFamily: "var(--font-head)"
            }}>
              Real-time Ball-by-Ball Match Engine
            </h1>
            <p style={{
              fontSize: 13,
              opacity: 0.9,
              margin: 0,
              maxWidth: 520,
              lineHeight: 1.5
            }}>
              Score matches directly, record legal deliveries, extras, wickets, maidens, and view official multi-metric tournament statistics.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={handleStartQuickDemo}
              style={{
                padding: "12px 20px",
                borderRadius: 12,
                background: "#FFFFFF",
                color: "#166534",
                border: "none",
                fontSize: 13,
                fontWeight: 900,
                fontFamily: "var(--font-head)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              <Play size={16} fill="#166534" />
              <span>Launch Demo Console</span>
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              style={{
                padding: "12px 18px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.3)",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <Trophy size={16} color="#FDE047" />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: "flex",
          gap: 8,
          borderBottom: "1.5px solid #E2E8F0",
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 2
        }}>
          {[
            { id: "all", label: "All Matches", icon: Swords, count: matches.length },
            { id: "live", label: "🔴 In Progress", icon: Play, count: matches.filter(m => m.status === "in_progress").length },
            { id: "completed", label: "Completed Scorecards", icon: CheckCircle2, count: matches.filter(m => m.status === "completed").length },
            { id: "leaderboard", label: "MVP Leaderboard", icon: Award }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 16px",
                borderRadius: "10px 10px 0 0",
                background: activeTab === t.id ? "#FFFFFF" : "transparent",
                border: activeTab === t.id ? "1.5px solid #E2E8F0" : "none",
                borderBottom: activeTab === t.id ? "2px solid #FFFFFF" : "none",
                color: activeTab === t.id ? "#166534" : "#64748B",
                fontSize: 13,
                fontWeight: activeTab === t.id ? 800 : 600,
                cursor: "pointer",
                marginBottom: -2,
                whiteSpace: "nowrap"
              }}
            >
              <t.icon size={15} color={activeTab === t.id ? "#166534" : "#64748B"} />
              <span>{t.label}</span>
              {typeof t.count === "number" && (
                <span style={{
                  background: activeTab === t.id ? "#DCFCE7" : "#F1F5F9",
                  color: activeTab === t.id ? "#166534" : "#64748B",
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: 999
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {activeTab === "leaderboard" ? (
          <div style={{ background: "#FFFFFF", borderRadius: 18, border: "1px solid #E2E8F0", padding: 20 }}>
            <LeaderboardPage />
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spinner />
            <p style={{ color: "#64748B", fontSize: 13, marginTop: 12 }}>Loading cricket fixtures & scorecards...</p>
          </div>
        ) : (
          <div>
            {(() => {
              const filtered = matches.filter(m => {
                if (activeTab === "live") return m.status === "in_progress"
                if (activeTab === "completed") return m.status === "completed"
                return true
              })

              if (filtered.length === 0) {
                return (
                  <div style={{
                    background: "#FFFFFF",
                    border: "1.5px dashed #CBD5E1",
                    borderRadius: 18,
                    padding: "48px 24px",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🏏</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
                      No matches found in this category
                    </div>
                    <p style={{ color: "#64748B", fontSize: 13, maxWidth: 360, margin: "0 auto 20px" }}>
                      You can instantly launch a demo cricket match to test the ball-by-ball scoring console and live scorecard!
                    </p>
                    <button
                      onClick={handleStartQuickDemo}
                      style={{
                        padding: "12px 24px",
                        borderRadius: 12,
                        background: "#166534",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: "pointer"
                      }}
                    >
                      ⚡ Launch Demo Cricket Match
                    </button>
                  </div>
                )
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {filtered.map(m => {
                    const title = m.our_team ? `${m.our_team} vs ${m.team}` : m.team
                    const isLive = m.status === "in_progress"
                    const isDone = m.status === "completed"

                    return (
                      <div
                        key={m.id}
                        style={{
                          background: "#FFFFFF",
                          borderRadius: 16,
                          border: isLive ? "2px solid #22C55E" : "1px solid #E2E8F0",
                          padding: isMobile ? "16px" : "18px 22px",
                          boxShadow: isLive ? "0 4px 18px rgba(34,197,94,0.12)" : "0 2px 8px rgba(15,23,42,0.04)",
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          alignItems: isMobile ? "flex-start" : "center",
                          justifyContent: "space-between",
                          gap: 14
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            {isLive ? (
                              <span style={{
                                background: "#DCFCE7",
                                color: "#166534",
                                border: "1px solid #86EFAC",
                                fontSize: 11,
                                fontWeight: 900,
                                padding: "2px 8px",
                                borderRadius: 6,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
                                LIVE SCORING
                              </span>
                            ) : isDone ? (
                              <span style={{
                                background: "#F1F5F9",
                                color: "#475569",
                                fontSize: 11,
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 6
                              }}>
                                COMPLETED
                              </span>
                            ) : (
                              <span style={{
                                background: "#FEF3C7",
                                color: "#92400E",
                                fontSize: 11,
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 6
                              }}>
                                UPCOMING
                              </span>
                            )}
                            <span style={{ fontSize: 12, color: "#64748B" }}>
                              {m.date ? new Date(m.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "Scheduled"}
                              {m.time_slot ? ` · ${m.time_slot}` : ""}
                            </span>
                          </div>

                          <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                            {title}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                            🏟️ {m.ground || "Ground TBD"} · Format: {m.type || "9v9 Internal"}
                          </div>
                        </div>

                        {/* Action Buttons for Match */}
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: isMobile ? "100%" : "auto",
                          justifyContent: isMobile ? "stretch" : "flex-end",
                          flexWrap: "wrap"
                        }}>
                          <button
                            onClick={() => handleScoreMatch(m)}
                            style={{
                              flex: isMobile ? 1 : "none",
                              padding: "10px 16px",
                              borderRadius: 10,
                              background: "linear-gradient(135deg, #166534 0%, #15803D 100%)",
                              color: "#FFFFFF",
                              border: "none",
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              boxShadow: "0 2px 8px rgba(22,101,52,0.25)"
                            }}
                          >
                            <Play size={15} fill="#FFFFFF" />
                            <span>{isLive ? "Open Console" : "🏏 Score Match"}</span>
                          </button>

                          <button
                            onClick={() => setScorecardMatch(m)}
                            style={{
                              flex: isMobile ? 1 : "none",
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: "#FFFFFF",
                              color: "#166534",
                              border: "1.5px solid #CBD5E1",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6
                            }}
                          >
                            <Eye size={15} color="#166534" />
                            <span>Scorecard</span>
                          </button>

                          <button
                            onClick={() => copySpectatorLink(m)}
                            title="Share Spectator Link"
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              background: "#F8FAFC",
                              color: "#64748B",
                              border: "1px solid #E2E8F0",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}
      </main>

      {/* Setup Modal */}
      {setupMatch && (
        <ScoringSetupModal
          match={setupMatch}
          teams={teams}
          allPlayers={[]}
          onClose={() => setSetupMatch(null)}
          onStartScoring={(sessionData) => {
            setSetupMatch(null)
            setActiveScoringSession({
              match: setupMatch,
              ...sessionData
            })
          }}
        />
      )}

      {/* Scorecard Modal */}
      {scorecardMatch && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#F8FAF8", width: "100%", maxWidth: 720, maxHeight: "96vh", overflowY: "auto", borderRadius: isMobile ? 0 : 16 }}>
            <LiveScorecard
              matchId={scorecardMatch.id}
              match={scorecardMatch}
              onClose={() => setScorecardMatch(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
