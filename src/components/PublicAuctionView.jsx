import { useState, useEffect, useRef } from "react"
import { fetchAuctionState, fetchAuctionPlayers, fetchAuctionTeams, fetchAuctionByCode, fetchAuctionSponsors } from "../db.js"
import { Trophy, Gavel, Wallet, Users, CheckCircle2, XCircle } from "lucide-react"

const POLL_MS = 4000

function Header({ auctionMeta }) {
  return (
    <header style={{
      background: "linear-gradient(135deg, #0A2F1D 0%, #14532D 60%, #0F172A 100%)",
      borderBottom: "2px solid rgba(184,134,11,0.35)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      padding: "16px 20px"
    }}>
      <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <img
            src="/logo-full.png?v=1"
            alt="Selected Sports"
            style={{ height: 38, width: "auto", display: "block", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
          />
          <div style={{ borderLeft: "1.5px solid rgba(255,255,255,0.2)", paddingLeft: 12, minWidth: 0 }}>
            <div style={{ color: "#FEF08A", fontSize: 13, fontWeight: 900, fontFamily: "var(--font-head)", letterSpacing: "0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {auctionMeta?.name || "Cricket Auction"}
            </div>
            {auctionMeta?.location && (
              <div style={{ color: "#CBD5E1", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                📍 {auctionMeta.location}
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(220,38,38,0.25)",
          border: "1px solid rgba(239,68,68,0.6)",
          color: "#FECACA",
          padding: "5px 12px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "1px",
          textTransform: "uppercase",
          flexShrink: 0
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block", boxShadow: "0 0 8px #EF4444" }}></span>
          LIVE
        </div>
      </div>
    </header>
  )
}

export default function PublicAuctionView({ auctionCode }) {
  const [auctionMeta, setAuctionMeta] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [state, setState] = useState(null)
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [banner, setBanner] = useState(null)

  const prevPlayerRef = useRef(null)
  const prevSoldCountRef = useRef(null)
  const prevUnsoldCountRef = useRef(null)

  const load = async (resolvedAuctionId) => {
    try {
      const [s, p, t] = await Promise.all([
        fetchAuctionState(resolvedAuctionId),
        fetchAuctionPlayers(resolvedAuctionId),
        fetchAuctionTeams(resolvedAuctionId)
      ])

      const curSold = p.filter(x => x.status === "sold").length
      const curUnsold = p.filter(x => x.status === "unsold").length

      if (prevSoldCountRef.current !== null && curSold > prevSoldCountRef.current) {
        const latestSold = p.filter(x => x.status === "sold" && x.sold_at).sort((a,b) => new Date(b.sold_at) - new Date(a.sold_at))[0]
        if (latestSold) {
          const buyer = t.find(team => team.id === latestSold.sold_team_id)
          setBanner({
            type: "sold",
            playerName: latestSold.name,
            teamName: buyer?.name || "Winner",
            price: latestSold.sold_price
          })
          setTimeout(() => setBanner(b => (b?.playerName === latestSold.name ? null : b)), 7000)
        }
      } else if (prevUnsoldCountRef.current !== null && curUnsold > prevUnsoldCountRef.current) {
        const prevPlayer = prevPlayerRef.current
        if (prevPlayer) {
          setBanner({ type: "unsold", playerName: prevPlayer.name })
          setTimeout(() => setBanner(null), 7000)
        }
      }

      prevSoldCountRef.current = curSold
      prevUnsoldCountRef.current = curUnsold
      const curP = s.current_player_id ? p.find(x => x.id === s.current_player_id) : null
      prevPlayerRef.current = curP

      setState(s)
      setPlayers(p)
      setTeams(t)
      setError("")
    } catch(e) {
      setError("Couldn't load the auction right now.")
    }
    setLoading(false)
  }

  useEffect(() => {
    let interval
    const init = async () => {
      if (auctionCode) {
        try {
          const a = await fetchAuctionByCode(auctionCode)
          if (!a) { setNotFound(true); setLoading(false); return }
          setAuctionMeta(a)
          fetchAuctionSponsors(a.id).then(setSponsors).catch(()=>{})
          await load(a.id)
          interval = setInterval(() => load(a.id), POLL_MS)
        } catch { setNotFound(true); setLoading(false) }
      } else {
        await load(null)
        interval = setInterval(() => load(null), POLL_MS)
      }
    }
    init()
    return () => clearInterval(interval)
  }, [auctionCode])

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0F172A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", color:"#FFFFFF" }}>
      <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:46, marginBottom:16 }}/>
      <div style={{ color:"#94A3B8", fontSize:14 }}>Connecting to live auction broadcast...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:24, textAlign:"center" }}>
      <div>
        <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
        <div style={{ fontWeight:800, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)" }}>Auction not found</div>
        <div style={{ color:"#64748B", fontSize:13, marginTop:4 }}>Please verify the link provided by the tournament organizer.</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:24, textAlign:"center" }}>
      <div style={{ color:"#EF4444", fontSize:14, fontWeight:600 }}>{error}</div>
    </div>
  )

  const currentPlayer = state?.current_player_id ? players.find(p => p.id === state.current_player_id) : null
  const leadingTeam = state?.current_team_id ? teams.find(t => t.id === state.current_team_id) : null
  const soldCount = players.filter(p => p.status === "sold").length
  const unsoldCount = players.filter(p => p.status === "unsold").length
  const registeredCount = players.filter(p => p.status === "registered").length

  return (
    <div style={{ minHeight:"100vh", background:"#0B1320", color:"#0F172A", fontFamily:"var(--font-body)" }}>
      <Header auctionMeta={auctionMeta}/>

      <div style={{ maxWidth:540, margin:"0 auto", padding:"16px 14px 40px" }}>

        {/* Official Tournament Sponsors */}
        {sponsors.length > 0 && (
          <div style={{
            background:"linear-gradient(180deg, #131E30 0%, #0F172A 100%)",
            borderRadius:14,
            border:"1px solid rgba(184,134,11,0.3)",
            padding:"12px 14px",
            marginBottom:16,
            boxShadow:"0 4px 14px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              fontSize:10,
              fontWeight:900,
              color:"#F59E0B",
              letterSpacing:"1.5px",
              textTransform:"uppercase",
              marginBottom:10,
              display:"flex",
              alignItems:"center",
              gap:6
            }}>
              <span>⭐</span> OFFICIAL TOURNAMENT SPONSORS
            </div>
            <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:4 }}>
              {sponsors.map(s => (
                <div key={s.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:90 }}>
                  {s.logo_url ? (
                    <img
                      src={s.logo_url}
                      alt={s.name}
                      style={{
                        width:86,
                        height:64,
                        borderRadius:10,
                        objectFit:"contain",
                        border:"1px solid rgba(255,255,255,0.1)",
                        background:"#FFFFFF",
                        padding:4
                      }}
                    />
                  ) : (
                    <div style={{
                      width:86,
                      height:64,
                      borderRadius:10,
                      background:"rgba(184,134,11,0.15)",
                      border:"1px solid rgba(184,134,11,0.3)",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center"
                    }}>
                      <span style={{ fontSize:22 }}>🏆</span>
                    </div>
                  )}
                  <div style={{
                    fontSize:11,
                    fontWeight:700,
                    color:"#E2E8F0",
                    marginTop:6,
                    textAlign:"center",
                    overflow:"hidden",
                    textOverflow:"ellipsis",
                    whiteSpace:"nowrap",
                    width:"100%"
                  }}>
                    {s.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hammer Notification Banner */}
        {banner && (
          <div style={{
            marginBottom: 16,
            padding: "16px 18px",
            borderRadius: 14,
            background: banner.type === "sold" ? "linear-gradient(135deg, #15803D, #166534)" : "linear-gradient(135deg, #DC2626, #991B1B)",
            color: "#FFFFFF",
            boxShadow: banner.type === "sold" ? "0 8px 24px rgba(22,101,52,0.4)" : "0 8px 24px rgba(220,38,38,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            border: banner.type === "sold" ? "1.5px solid #86EFAC" : "1.5px solid #FCA5A5"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <span style={{ fontSize: 36, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>🔨</span>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: banner.type === "sold" ? "#86EFAC" : "#FECACA"
                }}>
                  {banner.type === "sold" ? "SOLD!" : "UNSOLD"}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, fontFamily: "var(--font-head)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {banner.type === "sold" ? (
                    <span>{banner.playerName} → <strong style={{ color: "#FEF08A" }}>{banner.teamName}</strong> for <strong style={{ color: "#FEF08A" }}>🪙 {Number(banner.price||0).toLocaleString("en-IN")}</strong></span>
                  ) : (
                    <span>{banner.playerName} goes Unsold</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setBanner(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", width: 26, height: 26, borderRadius: "50%", cursor: "pointer", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>✕</button>
          </div>
        )}

        {/* State: Setup */}
        {(!state || state.status === "setup") && (
          <div style={{ background:"#131E30", borderRadius:16, padding:"36px 20px", textAlign:"center", border:"1px solid rgba(255,255,255,0.08)", color:"#FFFFFF" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🏏</div>
            <div style={{ fontWeight:900, fontSize:18, color:"#FFFFFF", fontFamily:"var(--font-head)" }}>Auction Hasn't Started Yet</div>
            <div style={{ fontSize:13, color:"#94A3B8", marginTop:6 }}>The tournament organizer will begin the live bidding soon. This broadcast refreshes automatically.</div>
            <div style={{ marginTop:20, display:"inline-flex", gap:16, background:"rgba(255,255,255,0.05)", padding:"8px 18px", borderRadius:999, fontSize:12, color:"#CBD5E1" }}>
              <span>👥 {players.length} Players</span>
              <span>·</span>
              <span>🏆 {teams.length} Teams</span>
            </div>
          </div>
        )}

        {/* State: Live */}
        {state?.status === "live" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94A3B8", marginBottom:12, padding:"0 4px" }}>
              <span style={{ display:"flex", alignItems:"center", gap:5 }}><Users size={13}/> {registeredCount} left in pool</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><CheckCircle2 size={13} color="#22C55E"/> {soldCount} sold · <XCircle size={13} color="#EF4444"/> {unsoldCount} unsold</span>
            </div>

            {currentPlayer ? (
              <div style={{
                background:"linear-gradient(180deg, #131E30 0%, #0F172A 100%)",
                borderRadius:18,
                padding:"20px 18px",
                border:"2px solid #15803D",
                boxShadow:"0 8px 30px rgba(0,0,0,0.4)",
                marginBottom:20
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <span style={{ background:"rgba(34,197,94,0.18)", color:"#86EFAC", border:"1px solid rgba(34,197,94,0.4)", borderRadius:999, padding:"4px 12px", fontSize:11, fontWeight:900, display:"flex", alignItems:"center", gap:5, letterSpacing:"0.8px" }}>
                    <Gavel size={12}/> ON THE BLOCK
                  </span>
                  {currentPlayer.jersey_number && (
                    <span style={{ color:"#FEF08A", fontSize:12, fontWeight:800, background:"rgba(254,240,138,0.1)", padding:"3px 8px", borderRadius:6 }}>
                      #{currentPlayer.jersey_number}
                    </span>
                  )}
                </div>

                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:16 }}>
                  {currentPlayer.profile_image_url ? (
                    <img
                      src={currentPlayer.profile_image_url}
                      alt={currentPlayer.name}
                      style={{ width:220, height:250, borderRadius:16, objectFit:"cover", border:"3px solid #22C55E", marginBottom:12, boxShadow:"0 8px 24px rgba(0,0,0,0.5)" }}
                    />
                  ) : (
                    <div style={{ width:220, height:250, borderRadius:16, background:"#1E293B", border:"3px solid #22C55E", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                      <div style={{ fontSize:56, fontWeight:900, color:"#22C55E", fontFamily:"var(--font-head)" }}>{(currentPlayer.name||"?")[0]}</div>
                    </div>
                  )}

                  <div style={{ fontWeight:900, fontSize:20, color:"#FFFFFF", fontFamily:"var(--font-head)" }}>{currentPlayer.name}</div>
                  <div style={{ fontSize:13, color:"#94A3B8", marginTop:4, display:"flex", alignItems:"center", gap:6 }}>
                    {currentPlayer.city && <span>{currentPlayer.city} ·</span>}
                    <span style={{ color:"#CBD5E1", fontWeight:600 }}>{currentPlayer.playing_role || "Player"}</span>
                    <span>·</span>
                    <span style={{ color:"#FEF08A", fontWeight:700 }}>Base 🪙 {Number(currentPlayer.base_price || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Broadcast Bid Banner */}
                <div style={{
                  textAlign:"center",
                  padding:"18px",
                  background:"linear-gradient(135deg, rgba(22,101,52,0.3) 0%, rgba(15,23,42,0.6) 100%)",
                  borderRadius:14,
                  border:"1.5px solid rgba(34,197,94,0.3)"
                }}>
                  <div style={{ fontSize:11, color:"#86EFAC", fontWeight:800, textTransform:"uppercase", letterSpacing:"1.2px" }}>
                    CURRENT HIGHEST BID
                  </div>
                  <div style={{ fontSize:36, fontWeight:900, color:"#FEF08A", fontFamily:"var(--font-head)", margin:"4px 0", letterSpacing:"1px" }}>
                    🪙 {Number(state.current_bid || 0).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize:13, color: leadingTeam ? "#86EFAC" : "#94A3B8", fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    {leadingTeam ? (
                      <>
                        <Trophy size={14} color="#F59E0B"/> Leading: <strong style={{ color:"#FFFFFF" }}>{leadingTeam.name}</strong>
                      </>
                    ) : (
                      "Waiting for opening bid..."
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background:"#131E30", borderRadius:16, padding:"28px 18px", textAlign:"center", border:"1px solid rgba(255,255,255,0.08)", marginBottom:20, color:"#FFFFFF" }}>
                <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                <div style={{ fontSize:15, fontWeight:800, color:"#FFFFFF" }}>Between Players</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:4 }}>The auctioneer will place the next player on the block shortly.</div>
              </div>
            )}

            {/* Team Purses & Standings */}
            <div style={{
              background:"#131E30",
              borderRadius:16,
              padding:"18px 16px",
              border:"1px solid rgba(255,255,255,0.08)",
              marginBottom:20
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#FFFFFF", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:6 }}>
                  <Wallet size={15} color="#F59E0B"/> Team Purse Wallets
                </div>
                <span style={{ fontSize:11, color:"#94A3B8" }}>🪙 Coins</span>
              </div>

              <div style={{ display:"grid", gap:8 }}>
                {teams.slice().sort((a,b) => b.purse_remaining - a.purse_remaining).map(t => {
                  const squadCount = players.filter(p => p.sold_team_id === t.id).length
                  const total = t.purse_total || 100000
                  const pct = Math.max(0, Math.min(100, Math.round(((t.purse_remaining || 0) / total) * 100)))
                  const isLead = leadingTeam?.id === t.id

                  return (
                    <div key={t.id} style={{
                      background: isLead ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.03)",
                      borderRadius:10,
                      padding:"10px 12px",
                      border: isLead ? "1.5px solid #22C55E" : "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:13, fontWeight:800, color:"#FFFFFF" }}>{t.name}</span>
                          <span style={{ fontSize:10, color:"#94A3B8", background:"rgba(255,255,255,0.06)", padding:"2px 6px", borderRadius:4 }}>
                            {squadCount} / 10 Squad
                          </span>
                        </div>
                        <span style={{ fontSize:14, fontWeight:900, color:"#FEF08A", fontFamily:"var(--font-head)" }}>
                          🪙 {Number(t.purse_remaining || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div style={{ width:"100%", height:4, background:"rgba(255,255,255,0.08)", borderRadius:999, overflow:"hidden" }}>
                        <div style={{ width:`${pct}%`, height:"100%", background: isLead ? "#22C55E" : "#B8860B", transition:"width 0.4s ease" }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recently Sold Stream */}
            {(() => {
              const recentSold = players.filter(p => p.status === "sold" && p.sold_at).sort((a,b) => new Date(b.sold_at) - new Date(a.sold_at)).slice(0, 5)
              if (recentSold.length === 0) return null

              return (
                <div style={{
                  background:"#131E30",
                  borderRadius:16,
                  padding:"18px 16px",
                  border:"1px solid rgba(255,255,255,0.08)"
                }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#FFFFFF", marginBottom:12, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:6 }}>
                    <span>🔨</span> Recently Sold Players
                  </div>
                  <div style={{ display:"grid", gap:8 }}>
                    {recentSold.map(p => {
                      const team = teams.find(t => t.id === p.sold_team_id)
                      return (
                        <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>
                          {p.profile_image_url ? (
                            <img src={p.profile_image_url} alt={p.name} style={{ width:36, height:36, borderRadius:8, objectFit:"cover", flexShrink:0, border:"1px solid rgba(255,255,255,0.1)" }}/>
                          ) : (
                            <div style={{ width:36, height:36, borderRadius:8, background:"#1E293B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#94A3B8", flexShrink:0 }}>
                              {(p.name||"?")[0]}
                            </div>
                          )}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:800, color:"#FFFFFF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>{team?.name || "—"}</div>
                          </div>
                          <div style={{ fontSize:13, fontWeight:900, color:"#86EFAC", fontFamily:"var(--font-head)", flexShrink:0 }}>
                            🪙 {Number(p.sold_price || 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {/* State: Completed */}
        {state?.status === "completed" && (
          <>
            <div style={{ background:"#131E30", borderRadius:18, padding:"28px 20px", textAlign:"center", border:"1.5px solid rgba(184,134,11,0.4)", marginBottom:20, color:"#FFFFFF" }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🏆</div>
              <div style={{ fontWeight:900, fontSize:20, color:"#FEF08A", fontFamily:"var(--font-head)" }}>Auction Complete</div>
              <div style={{ fontSize:13, color:"#94A3B8", marginTop:4 }}>{soldCount} players sold · {unsoldCount} unsold</div>
            </div>

            <div style={{ fontWeight:800, fontSize:15, color:"#FFFFFF", marginBottom:12, fontFamily:"var(--font-head)" }}>Team Squads</div>

            {teams.map(t => {
              const squad = players.filter(p => p.sold_team_id === t.id)
              return (
                <div key={t.id} style={{ background:"#131E30", borderRadius:14, padding:"14px 16px", marginBottom:12, border:"1px solid rgba(255,255,255,0.08)", color:"#FFFFFF" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:14, color:"#FFFFFF", fontFamily:"var(--font-head)" }}>{t.name}</div>
                      <div style={{ fontSize:11, color:"#94A3B8" }}>{squad.length} players acquired</div>
                    </div>
                    <div style={{ fontSize:12, color:"#FEF08A", fontWeight:700 }}>
                      🪙 {Number(t.purse_remaining||0).toLocaleString("en-IN")} left
                    </div>
                  </div>

                  {squad.length === 0 ? (
                    <div style={{ fontSize:12, color:"#64748B" }}>No players won.</div>
                  ) : (
                    <div style={{ display:"grid", gap:6 }}>
                      {squad.map(p => (
                        <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:"6px 8px", background:"rgba(255,255,255,0.03)", borderRadius:8, color:"#FFFFFF" }}>
                          <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                            {p.profile_image_url ? (
                              <img src={p.profile_image_url} alt={p.name} style={{ width:28, height:28, borderRadius:6, objectFit:"cover" }}/>
                            ) : (
                              <div style={{ width:28, height:28, borderRadius:6, background:"#1E293B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#94A3B8" }}>{(p.name||"?")[0]}</div>
                            )}
                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</span>
                          </span>
                          <span style={{ fontWeight:800, color:"#86EFAC", flexShrink:0 }}>🪙 {Number(p.sold_price||0).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

