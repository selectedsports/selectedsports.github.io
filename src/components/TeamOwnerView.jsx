import { useState, useEffect } from "react"
import { fetchAuctionByCode, fetchAuctionTeams, fetchAuctionPlayers } from "../db.js"
import { Av } from "./ui.jsx"
import { exportTeamRosterCsv, exportTeamRosterPdf } from "../constants.js"

const POLL_MS = 5000

function Header({ auctionName, teamName }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#166534,#0F172A)", padding:"24px 24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:40, width:"auto", display:"block" }}/>
        <div style={{ color:"#B8860B", fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>{auctionName || "Auction"}</div>
      </div>
      <h1 style={{ color:"#FFFFFF", fontFamily:"var(--font-head)", fontSize:22, fontWeight:800, margin:0 }}>{teamName || "Your Team"}</h1>
    </div>
  )
}

// A no-login, link-based live view for a team's owner/captain — anyone with
// this link can see their team's purse and purchased players update live
// during the auction, without needing a player account or to sign in at all.
export default function TeamOwnerView({ auctionCode, teamId }) {
  const [auctionMeta, setAuctionMeta] = useState(null)
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = async (auctionId) => {
    try {
      const [teams, p] = await Promise.all([fetchAuctionTeams(auctionId), fetchAuctionPlayers(auctionId)])
      const t = teams.find(x => x.id === teamId)
      if (!t) { setNotFound(true); setLoading(false); return }
      setTeam(t)
      setPlayers(
        p.filter(pl => pl.sold_team_id === teamId)
         .sort((a,b) => (b.is_captain || b.status === "captain" ? 1 : 0) - (a.is_captain || a.status === "captain" ? 1 : 0))
      )
      setError("")
    } catch { setError("Couldn't load your team right now.") }
    setLoading(false)
  }

  useEffect(() => {
    let interval
    const init = async () => {
      try {
        const a = await fetchAuctionByCode(auctionCode)
        if (!a) { setNotFound(true); setLoading(false); return }
        setAuctionMeta(a)
        await load(a.id)
        interval = setInterval(() => load(a.id), POLL_MS)
      } catch { setNotFound(true); setLoading(false) }
    }
    init()
    return () => clearInterval(interval)
  }, [auctionCode, teamId])

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)" }}>
      <div style={{ color:"#64748B", fontSize:14 }}>Loading your team...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:24, textAlign:"center" }}>
      <div style={{ color:"#EF4444", fontSize:14 }}>This team link doesn't match any team in this auction.</div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:24, textAlign:"center" }}>
      <div style={{ color:"#EF4444", fontSize:14 }}>{error}</div>
    </div>
  )

  const spent = (team.purse_total || 0) - (team.purse_remaining || 0)

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header auctionName={auctionMeta?.name} teamName={team.name}/>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 16px 40px" }}>

        <div style={{ fontSize:12, color:"#94A3B8", marginBottom:14 }}>
          {(team.owner_name || team.captain_name) && (
            <>Owner: {team.owner_name || "—"} · Captain: {team.captain_name || "—"}</>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
          <div style={{ background:"#FFFFFF", borderRadius:14, padding:"16px", border:"2px solid #166534", textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:900, color:"#166534", fontFamily:"var(--font-head)" }}>🪙 {Number(team.purse_remaining||0).toLocaleString("en-IN")}</div>
            <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Coins Left</div>
          </div>
          <div style={{ background:"#FFFFFF", borderRadius:14, padding:"16px", border:"1px solid #E2E8F0", textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)" }}>🪙 {Number(spent||0).toLocaleString("en-IN")}</div>
            <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Coins Spent</div>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>Squad Members ({players.length}/9)</div>
          {players.length > 0 && (
            <button
              onClick={() => exportTeamRosterPdf(team, players, auctionMeta?.name)}
              style={{ padding:"6px 12px", borderRadius:8, border:"1.5px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
            >
              <span>📄</span> Export PDF (Roster)
            </button>
          )}
        </div>
        {players.length === 0 ? (
          <div style={{ background:"#FFFFFF", borderRadius:14, padding:"24px 18px", textAlign:"center", border:"1px solid #E2E8F0" }}>
            <div style={{ fontSize:13, color:"#64748B" }}>No players in squad yet — check back as the auction continues.</div>
          </div>
        ) : (
          <div style={{ display:"grid", gap:8 }}>
            {players.map(p => {
              const isCap = p.is_captain || p.status === "captain"
              return (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:isCap?"rgba(184,134,11,0.06)":"#FFFFFF", border:isCap?"1.5px solid rgba(184,134,11,0.3)":"1px solid #E2E8F0", borderRadius:10 }}>
                  {p.profile_image_url ? (
                    <img src={p.profile_image_url} alt={p.name} style={{ width:40, height:40, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
                  ) : (
                    <Av name={p.name} id={p.id} sz={40}/>
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
                      <span>{p.name}</span>
                      {isCap && <span style={{ fontSize:9, fontWeight:800, background:"#B8860B", color:"#FFFFFF", padding:"1px 6px", borderRadius:4 }}>👑 CAPTAIN</span>}
                    </div>
                    <div style={{ fontSize:11, color:"#94A3B8" }}>{p.city ? `${p.city} · ` : ""}{p.playing_role || "—"}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:isCap?"#B8860B":"#166534", fontFamily:"var(--font-head)", flexShrink:0 }}>
                    {isCap ? "🪙 0 (Captain)" : `🪙 ${Number(p.sold_price||0).toLocaleString("en-IN")}`}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginTop:20 }}>This page updates automatically every few seconds.</div>
      </div>
    </div>
  )
}
