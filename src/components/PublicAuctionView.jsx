import { useState, useEffect } from "react"
import { fetchAuctionState, fetchAuctionPlayers, fetchAuctionTeams, fetchAuctionByCode, fetchAuctionSponsors } from "../db.js"
import { Av } from "./ui.jsx"

const POLL_MS = 5000

function Header({ auctionName }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#166534,#0F172A)", padding:"24px 24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:40, width:"auto", display:"block" }}/>
        <div style={{ color:"#B8860B", fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>{auctionName || "Live Auction"}</div>
      </div>
    </div>
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

  const auctionId = auctionMeta?.id || null

  const load = async (resolvedAuctionId) => {
    try {
      const [s, p, t] = await Promise.all([fetchAuctionState(resolvedAuctionId), fetchAuctionPlayers(resolvedAuctionId), fetchAuctionTeams(resolvedAuctionId)])
      setState(s); setPlayers(p); setTeams(t); setError("")
    } catch(e) { setError("Couldn't load the auction right now.") }
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
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)" }}>
      <div style={{ color:"#64748B", fontSize:14 }}>Loading auction...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:24, textAlign:"center" }}>
      <div style={{ color:"#EF4444", fontSize:14 }}>This auction link doesn't match any auction.</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:24, textAlign:"center" }}>
      <div style={{ color:"#EF4444", fontSize:14 }}>{error}</div>
    </div>
  )

  const currentPlayer = state?.current_player_id ? players.find(p => p.id === state.current_player_id) : null
  const leadingTeam = state?.current_team_id ? teams.find(t => t.id === state.current_team_id) : null
  const soldCount = players.filter(p => p.status === "sold").length
  const unsoldCount = players.filter(p => p.status === "unsold").length
  const registeredCount = players.filter(p => p.status === "registered").length

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header auctionName={auctionMeta?.name}/>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 16px 40px" }}>

        {sponsors.length > 0 && (
          <div style={{ display:"flex", gap:10, overflowX:"auto", marginBottom:18, paddingBottom:2 }}>
            {sponsors.map(s => (
              <div key={s.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:64 }}>
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} style={{ width:48, height:48, borderRadius:12, objectFit:"cover" }}/>
                ) : (
                  <div style={{ width:48, height:48, borderRadius:12, background:"rgba(184,134,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:18 }}>⭐</span></div>
                )}
                <div style={{ fontSize:9, color:"#64748B", marginTop:4, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%" }}>{s.name}</div>
              </div>
            ))}
          </div>
        )}

        {(!state || state.status === "setup") && (
          <div style={{ background:"#FFFFFF", borderRadius:16, padding:"32px 20px", textAlign:"center", border:"1px solid #E2E8F0" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🏏</div>
            <div style={{ fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Auction hasn't started yet</div>
            <div style={{ fontSize:13, color:"#64748B", marginTop:6 }}>Check back soon — this page updates automatically.</div>
          </div>
        )}

        {state?.status === "live" && (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#94A3B8", marginBottom:14 }}>
              <span>{registeredCount} left</span><span>{soldCount} sold · {unsoldCount} unsold</span>
            </div>

            {currentPlayer ? (
              <div style={{ background:"#FFFFFF", borderRadius:16, padding:"20px 18px", border:"2px solid #166534", marginBottom:20 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:16 }}>
                  {currentPlayer.profile_image_url ? (
                    <img src={currentPlayer.profile_image_url} alt={currentPlayer.name} style={{ width:180, height:200, borderRadius:16, objectFit:"cover", border:"3px solid #166534", marginBottom:10 }}/>
                  ) : (
                    <Av name={currentPlayer.name} id={currentPlayer.id} sz={120}/>
                  )}
                  <div style={{ fontWeight:900, fontSize:18, color:"#0F172A", fontFamily:"var(--font-head)", marginTop:8 }}>{currentPlayer.name}</div>
                  <div style={{ fontSize:13, color:"#94A3B8", marginTop:2 }}>{currentPlayer.city ? `${currentPlayer.city} · ` : ""}{currentPlayer.playing_role || "—"} · Base ₹{currentPlayer.base_price || 0}</div>
                </div>
                <div style={{ textAlign:"center", padding:"16px", background:"rgba(34,197,94,0.08)", borderRadius:12 }}>
                  <div style={{ fontSize:32, fontWeight:900, color:"#166534", fontFamily:"var(--font-head)" }}>₹{state.current_bid}</div>
                  <div style={{ fontSize:13, color:leadingTeam?"#166534":"#94A3B8", fontWeight:700, marginTop:4 }}>{leadingTeam ? `Leading: ${leadingTeam.name}` : "No bids yet"}</div>
                </div>
              </div>
            ) : (
              <div style={{ background:"#FFFFFF", borderRadius:16, padding:"24px 18px", textAlign:"center", border:"1px solid #E2E8F0", marginBottom:20 }}>
                <div style={{ fontSize:13, color:"#64748B" }}>Between players — the next one is coming up.</div>
              </div>
            )}

            <div style={{ fontWeight:800, fontSize:13, color:"#0F172A", marginBottom:10, fontFamily:"var(--font-head)" }}>Team Purses</div>
            <div style={{ display:"grid", gap:8, marginBottom:20 }}>
              {teams.slice().sort((a,b) => b.purse_remaining - a.purse_remaining).map(t => (
                <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#FFFFFF", borderRadius:10, padding:"10px 14px", border: leadingTeam?.id===t.id ? "1.5px solid #166534" : "1px solid #E2E8F0" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{t.name}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:"#166534", fontFamily:"var(--font-head)" }}>₹{t.purse_remaining}</span>
                </div>
              ))}
            </div>

            {(() => {
              const recentSold = players.filter(p => p.status === "sold" && p.sold_at).sort((a,b) => new Date(b.sold_at) - new Date(a.sold_at)).slice(0, 5)
              if (recentSold.length === 0) return null
              return (
                <div>
                  <div style={{ fontWeight:800, fontSize:13, color:"#0F172A", marginBottom:10, fontFamily:"var(--font-head)" }}>Recently Sold</div>
                  <div style={{ display:"grid", gap:6 }}>
                    {recentSold.map(p => {
                      const team = teams.find(t => t.id === p.sold_team_id)
                      return (
                        <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:9 }}>
                          <Av name={p.name} id={p.id} sz={26}/>
                          <div style={{ flex:1, minWidth:0, fontSize:12, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                          <div style={{ fontSize:11, color:"#94A3B8", flexShrink:0 }}>{team?.name || "—"}</div>
                          <div style={{ fontSize:12, fontWeight:800, color:"#166534", fontFamily:"var(--font-head)", flexShrink:0 }}>₹{p.sold_price}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {state?.status === "completed" && (
          <>
            <div style={{ background:"#FFFFFF", borderRadius:16, padding:"24px 20px", textAlign:"center", border:"1px solid #E2E8F0", marginBottom:16 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🏆</div>
              <div style={{ fontWeight:800, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)" }}>Auction Complete</div>
              <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>{soldCount} sold · {unsoldCount} unsold</div>
            </div>
            {teams.map(t => {
              const squad = players.filter(p => p.sold_team_id === t.id)
              return (
                <div key={t.id} style={{ background:"#FFFFFF", borderRadius:14, padding:"14px 16px", marginBottom:10, border:"1px solid #E2E8F0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{t.name}</div>
                    <div style={{ fontSize:12, color:"#94A3B8" }}>₹{t.purse_remaining} left of ₹{t.purse_total}</div>
                  </div>
                  {squad.length === 0 ? <div style={{ fontSize:12, color:"#94A3B8" }}>No players won.</div> : squad.map(p => (
                    <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:"6px 0", color:"#0F172A" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                        {p.profile_image_url ? (
                          <img src={p.profile_image_url} alt={p.name} style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover" }}/>
                        ) : (
                          <Av name={p.name} id={p.id} sz={26}/>
                        )}
                        {p.name}
                      </span>
                      <span style={{ fontWeight:700, color:"#166534" }}>₹{p.sold_price}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
