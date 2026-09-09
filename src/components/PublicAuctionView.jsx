import { useState, useEffect, useRef } from "react"
import { fetchAuctionState, fetchAuctionPlayers, fetchAuctionTeams, fetchAuctionByCode, fetchAuctionSponsors } from "../db.js"
import { Trophy, Gavel, Wallet, Users, CheckCircle2, XCircle, Phone } from "lucide-react"

const POLL_MS = 4000

function ContactBanner() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #064E3B 0%, #0F172A 100%)",
      borderBottom: "2.5px solid #F59E0B",
      color: "#FFFFFF",
      padding: "12px 18px",
      fontSize: 14,
      fontWeight: 700,
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      flexWrap: "wrap",
      boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(245,158,11,0.18)",
        border: "1px solid #F59E0B",
        color: "#FDE047",
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 800,
        letterSpacing: "0.5px",
        textTransform: "uppercase"
      }}>
        <span>📢</span> Want to organize an auction for your tournament?
      </div>
      <div style={{ color: "#F8FAFC", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
        Please contact <strong style={{ color: "#FFFFFF", fontWeight: 900, fontSize: 14 }}>Md Zeeshan</strong>:
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <a
          href="tel:9897439743"
          style={{
            color: "#0F172A",
            background: "#FFFFFF",
            padding: "5px 14px",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 13.5,
            border: "2px solid #FCD34D",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span>📞</span> 9897439743
        </a>
        <a
          href="https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I%20want%20to%20organize%20a%20cricket%20auction%20with%20Selected%20Sports"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "#22C55E",
            color: "#FFFFFF",
            padding: "6px 16px",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 900,
            fontSize: 13,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "1.5px solid #86EFAC",
            boxShadow: "0 2px 10px rgba(34,197,94,0.4)"
          }}
        >
          <span>💬</span> WhatsApp ↗
        </a>
      </div>
    </div>
  )
}

function Header({ auctionMeta }) {
  return (
    <header style={{
      background: "linear-gradient(135deg, #0A2F1D 0%, #14532D 60%, #0F172A 100%)",
      borderBottom: "2px solid rgba(184,134,11,0.35)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      padding: "16px 20px"
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <img
            src="/logo-full.png?v=1"
            alt="Selected Sports"
            style={{ height: 42, width: "auto", display: "block", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
          />
          <div style={{ borderLeft: "1.5px solid rgba(255,255,255,0.2)", paddingLeft: 14, minWidth: 0 }}>
            <div style={{ color: "#FEF08A", fontSize: 16, fontWeight: 900, fontFamily: "var(--font-head)", letterSpacing: "0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {auctionMeta?.name || "Cricket Auction"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
              {auctionMeta?.organized_by && (
                <div style={{ color: "#86EFAC", fontSize: 11.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                  🛡️ Org by {auctionMeta.organized_by}
                </div>
              )}
              {auctionMeta?.location && (
                <div style={{ color: "#CBD5E1", fontSize: 11.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  📍 {auctionMeta.location}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(220,38,38,0.25)",
          border: "1.5px solid rgba(239,68,68,0.7)",
          color: "#FECACA",
          padding: "6px 14px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          flexShrink: 0,
          boxShadow: "0 0 12px rgba(239,68,68,0.4)"
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block", boxShadow: "0 0 8px #EF4444" }}></span>
          LIVE BROADCAST
        </div>
      </div>
    </header>
  )
}

function PlayerOnTheBlockCard({ currentPlayer, state, leadingTeam, isWide }) {
  if (!currentPlayer) {
    return (
      <div style={{
        background: "#131E30",
        borderRadius: 20,
        padding: "40px 20px",
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.08)",
        marginBottom: 20,
        color: "#FFFFFF",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
      }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#FFFFFF", fontFamily: "var(--font-head)" }}>Between Players</div>
        <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>The auctioneer will call the next player to the block shortly.</div>
      </div>
    )
  }

  const roleIcons = {
    "Batsman": "🏏",
    "Bowler": "🎯",
    "All-rounder": "⚡",
    "Wicket-keeper": "🧤"
  }
  const roleIcon = roleIcons[currentPlayer.playing_role] || "🏏"

  return (
    <div style={{
      background: "linear-gradient(145deg, #0d2319 0%, #0F172A 50%, #131E30 100%)",
      borderRadius: 22,
      padding: isWide ? "28px" : "20px 18px",
      border: "2.5px solid #22C55E",
      boxShadow: "0 16px 45px rgba(0,0,0,0.6), 0 0 35px rgba(34,197,94,0.22)",
      marginBottom: 24,
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Top Status Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <span style={{
          background: "linear-gradient(90deg, rgba(34,197,94,0.25) 0%, rgba(22,101,52,0.4) 100%)",
          color: "#86EFAC",
          border: "1.5px solid rgba(34,197,94,0.5)",
          borderRadius: 999,
          padding: "6px 16px",
          fontSize: 12,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          gap: 7,
          letterSpacing: "1px",
          boxShadow: "0 0 14px rgba(34,197,94,0.3)"
        }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px #22C55E", display: "inline-block" }}></span>
          LIVE ON THE BLOCK
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {currentPlayer.jersey_number && (
            <span style={{ color: "#FEF08A", fontSize: 13, fontWeight: 900, background: "rgba(254,240,138,0.12)", border: "1px solid rgba(254,240,138,0.3)", padding: "4px 12px", borderRadius: 8, fontFamily: "var(--font-head)" }}>
              JERSEY #{currentPlayer.jersey_number}
            </span>
          )}
          {currentPlayer.playing_role && (
            <span style={{ color: "#93C5FD", fontSize: 12, fontWeight: 800, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", padding: "4px 12px", borderRadius: 8 }}>
              {roleIcon} {currentPlayer.playing_role}
            </span>
          )}
        </div>
      </div>

      {/* Main Player Display: Photo + Bio & Scoreboard */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isWide ? "280px 1fr" : "1fr",
        gap: isWide ? 26 : 20,
        alignItems: "center"
      }}>
        {/* Left: Player Photo / Monogram Badge */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {currentPlayer.profile_image_url ? (
            <img
              src={currentPlayer.profile_image_url}
              alt={currentPlayer.name}
              style={{
                width: isWide ? 280 : 240,
                height: isWide ? 310 : 270,
                borderRadius: 18,
                objectFit: "cover",
                border: "3px solid #22C55E",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(34,197,94,0.3)"
              }}
            />
          ) : (
            <div style={{
              width: isWide ? 280 : 240,
              height: isWide ? 310 : 270,
              borderRadius: 18,
              background: "linear-gradient(135deg, #14532D 0%, #064E3B 50%, #0F172A 100%)",
              border: "3px solid #22C55E",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6), inset 0 0 40px rgba(34,197,94,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{ position: "absolute", fontSize: 110, opacity: 0.08, pointerEvents: "none" }}>🏏</div>
              <div style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(34,197,94,0.35) 100%)",
                border: "2.5px solid #FEF08A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 52,
                fontWeight: 900,
                color: "#FEF08A",
                fontFamily: "var(--font-head)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.4)"
              }}>
                {(currentPlayer.name || "?")[0].toUpperCase()}
              </div>
              <div style={{ marginTop: 14, fontSize: 11, fontWeight: 900, color: "#86EFAC", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                SELECTED SPORTS PLAYER
              </div>
            </div>
          )}
        </div>

        {/* Right: Bio & Real-time Bidding Board */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{
              fontWeight: 900,
              fontSize: isWide ? 34 : 26,
              color: "#FFFFFF",
              fontFamily: "var(--font-head)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              lineHeight: 1.15
            }}>
              {currentPlayer.name}
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 8,
              flexWrap: "wrap",
              fontSize: 13,
              color: "#CBD5E1"
            }}>
              {currentPlayer.city && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 6 }}>
                  📍 {currentPlayer.city}
                </span>
              )}
              <span style={{
                background: "rgba(254,240,138,0.15)",
                border: "1px solid rgba(254,240,138,0.3)",
                color: "#FEF08A",
                padding: "3px 10px",
                borderRadius: 6,
                fontWeight: 800
              }}>
                🪙 BASE: {Number(currentPlayer.base_price || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Broadcast Bid Scoreboard */}
          <div style={{
            padding: "20px",
            background: "linear-gradient(135deg, rgba(22,101,52,0.4) 0%, rgba(15,23,42,0.85) 100%)",
            borderRadius: 16,
            border: "1.5px solid rgba(34,197,94,0.45)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              fontSize: 11,
              color: "#86EFAC",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <span>⚡</span> CURRENT HIGHEST BID
            </div>
            <div style={{
              fontSize: isWide ? 44 : 36,
              fontWeight: 900,
              color: "#FEF08A",
              fontFamily: "var(--font-head)",
              margin: "8px 0",
              letterSpacing: "1px",
              textShadow: "0 0 20px rgba(254,240,138,0.3)"
            }}>
              🪙 {Number(state.current_bid || 0).toLocaleString("en-IN")}
            </div>
            <div style={{
              fontSize: 14,
              fontWeight: 800,
              padding: "10px 14px",
              borderRadius: 10,
              background: leadingTeam ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)",
              border: leadingTeam ? "1px solid #22C55E" : "1px solid rgba(255,255,255,0.1)",
              color: leadingTeam ? "#86EFAC" : "#94A3B8",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              {leadingTeam ? (
                <>
                  <Trophy size={16} color="#F59E0B"/>
                  <span>Leading Bidder: <strong style={{ color: "#FFFFFF", fontSize: 15 }}>{leadingTeam.name}</strong></span>
                </>
              ) : (
                <span>⏳ Opening bid starts at 🪙 {Number(currentPlayer.base_price || 0).toLocaleString("en-IN")}</span>
              )}
            </div>
          </div>
        </div>
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
  const [banner, setBanner] = useState(null)
  const [isWide, setIsWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 920 : false)

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 920)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const prevPlayerRef = useRef(null)
  const prevSoldCountRef = useRef(null)
  const prevUnsoldCountRef = useRef(null)

  const load = async (resolvedAuctionId) => {
    try {
      const [s, p, t, sp] = await Promise.all([
        fetchAuctionState(resolvedAuctionId),
        fetchAuctionPlayers(resolvedAuctionId),
        fetchAuctionTeams(resolvedAuctionId),
        resolvedAuctionId ? fetchAuctionSponsors(resolvedAuctionId).catch(() => []) : Promise.resolve([])
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
      if (sp && Array.isArray(sp)) setSponsors(sp)
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
  const registeredCount = players.filter(p => p.status === "registered" && !p.is_captain && p.status !== "captain").length

  return (
    <div style={{ minHeight:"100vh", background:"#080E1A", color:"#0F172A", fontFamily:"var(--font-body)" }}>
      {/* Top Host Announcement Strip */}
      <ContactBanner/>

      {/* Main Broadcast Header */}
      <Header auctionMeta={auctionMeta}/>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: isWide ? "24px 24px 60px" : "16px 14px 40px" }}>

        {/* Official Tournament Sponsors - Large Showcase */}
        {sponsors.length > 0 && (
          <div style={{
            background: "linear-gradient(180deg, #131E30 0%, #0B1320 100%)",
            borderRadius: 18,
            border: "2px solid rgba(245,158,11,0.45)",
            padding: "16px 20px",
            marginBottom: 24,
            boxShadow: "0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.15)"
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#F59E0B",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>⭐</span> OFFICIAL TOURNAMENT SPONSORS
              </span>
              <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "none", letterSpacing: "normal" }}>
                {sponsors.length} Partner{sponsors.length > 1 ? "s" : ""}
              </span>
            </div>
            <div style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
              scrollbarWidth: "thin"
            }}>
              {sponsors.map(s => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                    width: 220,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    padding: "10px",
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  {s.logo_url ? (
                    <div style={{
                      width: "100%",
                      height: 125,
                      borderRadius: 10,
                      background: "#FFFFFF",
                      border: "1.5px solid rgba(245,158,11,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 8,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
                    }}>
                      <img
                        src={s.logo_url}
                        alt={s.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain"
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: "100%",
                      height: 125,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(15,23,42,0.6) 100%)",
                      border: "1.5px solid rgba(245,158,11,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}>
                      <span style={{ fontSize: 36, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>🏆</span>
                      <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>Official Sponsor</span>
                    </div>
                  )}
                  <div style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginTop: 10,
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                    letterSpacing: "0.3px"
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
            marginBottom: 20,
            padding: "16px 20px",
            borderRadius: 16,
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
            <button onClick={() => setBanner(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</button>
          </div>
        )}

        {/* State: Setup */}
        {(!state || state.status === "setup") && (
          <div style={{ background:"#131E30", borderRadius:20, padding:"40px 24px", textAlign:"center", border:"1px solid rgba(255,255,255,0.08)", color:"#FFFFFF", boxShadow:"0 10px 30px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize:44, marginBottom:12 }}>🏏</div>
            <div style={{ fontWeight:900, fontSize:22, color:"#FFFFFF", fontFamily:"var(--font-head)" }}>Auction Hasn't Started Yet</div>
            <div style={{ fontSize:14, color:"#94A3B8", marginTop:6, maxWidth:500, margin:"6px auto 0" }}>The tournament organizer will begin live bidding soon. This screen updates in real time automatically.</div>
            <div style={{ marginTop:24, display:"inline-flex", gap:18, background:"rgba(255,255,255,0.05)", padding:"10px 24px", borderRadius:999, fontSize:13, color:"#CBD5E1", border:"1px solid rgba(255,255,255,0.08)" }}>
              <span>👥 <strong>{players.length}</strong> Players in Pool</span>
              <span>·</span>
              <span>🏆 <strong>{teams.length}</strong> Teams Registered</span>
            </div>
          </div>
        )}

        {/* State: Live */}
        {state?.status === "live" && (
          <div>
            {/* Top Stats Bar */}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#94A3B8", marginBottom:16, padding:"0 4px", fontWeight:600 }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}><Users size={14} color="#86EFAC"/> <strong style={{ color:"#FFFFFF" }}>{registeredCount}</strong> players waiting in pool</span>
              <span style={{ display:"flex", alignItems:"center", gap:8 }}><CheckCircle2 size={14} color="#22C55E"/> <strong style={{ color:"#86EFAC" }}>{soldCount}</strong> sold · <XCircle size={14} color="#EF4444"/> <strong style={{ color:"#FECACA" }}>{unsoldCount}</strong> unsold</span>
            </div>

            {/* Widescreen 2-Column Responsive Layout */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isWide ? "1.4fr 1fr" : "1fr",
              gap: 24,
              alignItems: "start"
            }}>
              {/* Left Column: Player on the Block */}
              <div>
                <PlayerOnTheBlockCard
                  currentPlayer={currentPlayer}
                  state={state}
                  leadingTeam={leadingTeam}
                  isWide={isWide}
                />
              </div>

              {/* Right Column: Team Purses & Recently Sold */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Team Purses & Standings */}
                <div style={{
                  background:"#131E30",
                  borderRadius:18,
                  padding:"20px 18px",
                  border:"1px solid rgba(255,255,255,0.08)",
                  boxShadow:"0 8px 24px rgba(0,0,0,0.3)"
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:"#FFFFFF", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}>
                      <Wallet size={16} color="#F59E0B"/> Team Purse Wallets
                    </div>
                    <span style={{ fontSize:11, color:"#94A3B8", background:"rgba(255,255,255,0.06)", padding:"2px 8px", borderRadius:6 }}>🪙 Coins</span>
                  </div>

                  <div style={{ display:"grid", gap:10 }}>
                    {teams.slice().sort((a,b) => b.purse_remaining - a.purse_remaining).map(t => {
                      const squadCount = players.filter(p => p.sold_team_id === t.id).length
                      const total = t.purse_total || 100000
                      const pct = Math.max(0, Math.min(100, Math.round(((t.purse_remaining || 0) / total) * 100)))
                      const isLead = leadingTeam?.id === t.id

                      return (
                        <div key={t.id} style={{
                          background: isLead ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.03)",
                          borderRadius:12,
                          padding:"12px 14px",
                          border: isLead ? "1.5px solid #22C55E" : "1px solid rgba(255,255,255,0.06)",
                          transition:"border-color 0.2s ease"
                        }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              {t.logo_url ? (
                                <img src={t.logo_url} alt={t.name} style={{ width:24, height:24, borderRadius:6, objectFit:"cover" }} />
                              ) : (
                                <span style={{ width:24, height:24, borderRadius:6, background:"rgba(255,255,255,0.08)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#FEF08A" }}>{t.name?.[0]?.toUpperCase()}</span>
                              )}
                              <span style={{ fontSize:14, fontWeight:800, color:"#FFFFFF" }}>{t.name}</span>
                              <span style={{ fontSize:11, color:"#94A3B8", background:"rgba(255,255,255,0.06)", padding:"2px 8px", borderRadius:4, fontWeight:600 }}>
                                {squadCount} / 9 Squad
                              </span>
                            </div>
                            <span style={{ fontSize:15, fontWeight:900, color:"#FEF08A", fontFamily:"var(--font-head)" }}>
                              🪙 {Number(t.purse_remaining || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div style={{ width:"100%", height:5, background:"rgba(255,255,255,0.08)", borderRadius:999, overflow:"hidden" }}>
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
                      borderRadius:18,
                      padding:"20px 18px",
                      border:"1px solid rgba(255,255,255,0.08)",
                      boxShadow:"0 8px 24px rgba(0,0,0,0.3)"
                    }}>
                      <div style={{ fontWeight:800, fontSize:15, color:"#FFFFFF", marginBottom:14, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:6 }}>
                        <span>🔨</span> Recently Sold Players
                      </div>
                      <div style={{ display:"grid", gap:8 }}>
                        {recentSold.map(p => {
                          const team = teams.find(t => t.id === p.sold_team_id)
                          return (
                            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>
                              {p.profile_image_url ? (
                                <img src={p.profile_image_url} alt={p.name} style={{ width:38, height:38, borderRadius:8, objectFit:"cover", flexShrink:0, border:"1px solid rgba(255,255,255,0.1)" }}/>
                              ) : (
                                <div style={{ width:38, height:38, borderRadius:8, background:"#1E293B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#94A3B8", flexShrink:0 }}>
                                  {(p.name||"?")[0]}
                                </div>
                              )}
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:13, fontWeight:800, color:"#FFFFFF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                                <div style={{ fontSize:11, color:"#94A3B8" }}>{team?.name || "—"}</div>
                              </div>
                              <div style={{ fontSize:14, fontWeight:900, color:"#86EFAC", fontFamily:"var(--font-head)", flexShrink:0 }}>
                                🪙 {Number(p.sold_price || 0).toLocaleString("en-IN")}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* State: Completed */}
        {state?.status === "completed" && (
          <>
            <div style={{ background:"#131E30", borderRadius:20, padding:"36px 24px", textAlign:"center", border:"2px solid rgba(184,134,11,0.45)", marginBottom:28, color:"#FFFFFF", boxShadow:"0 12px 40px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🏆</div>
              <div style={{ fontWeight:900, fontSize:24, color:"#FEF08A", fontFamily:"var(--font-head)" }}>Auction Complete</div>
              <div style={{ fontSize:14, color:"#94A3B8", marginTop:4 }}>{soldCount} players sold · {unsoldCount} unsold</div>
            </div>

            <div style={{ fontWeight:900, fontSize:18, color:"#FFFFFF", marginBottom:16, fontFamily:"var(--font-head)" }}>Official Team Squads</div>

            <div style={{ display: "grid", gridTemplateColumns: isWide ? "1fr 1fr" : "1fr", gap: 16 }}>
              {teams.map(t => {
                const squad = players
                  .filter(p => p.sold_team_id === t.id)
                  .sort((a,b) => (b.is_captain || b.status === "captain" ? 1 : 0) - (a.is_captain || a.status === "captain" ? 1 : 0))
                return (
                  <div key={t.id} style={{ background:"#131E30", borderRadius:16, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.08)", color:"#FFFFFF", boxShadow:"0 6px 20px rgba(0,0,0,0.25)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {t.logo_url ? (
                          <img src={t.logo_url} alt={t.name} style={{ width:36, height:36, borderRadius:8, objectFit:"cover", border:"1px solid rgba(255,255,255,0.15)" }} />
                        ) : (
                          <span style={{ width:36, height:36, borderRadius:8, background:"rgba(255,255,255,0.08)", display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#FEF08A" }}>{t.name?.[0]?.toUpperCase()}</span>
                        )}
                        <div>
                          <div style={{ fontWeight:800, fontSize:16, color:"#FFFFFF", fontFamily:"var(--font-head)" }}>{t.name}</div>
                          <div style={{ fontSize:12, color:"#94A3B8" }}>{squad.length}/9 squad members</div>
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:"#FEF08A", fontWeight:800 }}>
                        🪙 {Number(t.purse_remaining||0).toLocaleString("en-IN")} left
                      </div>
                    </div>

                    {squad.length === 0 ? (
                      <div style={{ fontSize:12, color:"#64748B" }}>No players won yet.</div>
                    ) : (
                      <div style={{ display:"grid", gap:6 }}>
                        {squad.map(p => {
                          const isCap = p.is_captain || p.status === "captain"
                          return (
                            <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:"7px 10px", background:isCap?"rgba(184,134,11,0.14)":"rgba(255,255,255,0.03)", border:isCap?"1px solid rgba(184,134,11,0.35)":"none", borderRadius:8, color:"#FFFFFF" }}>
                              <span style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                                {p.profile_image_url ? (
                                  <img src={p.profile_image_url} alt={p.name} style={{ width:28, height:28, borderRadius:6, objectFit:"cover" }}/>
                                ) : (
                                  <div style={{ width:28, height:28, borderRadius:6, background:"#1E293B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#94A3B8" }}>{(p.name||"?")[0]}</div>
                                )}
                                <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
                                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                                  {isCap && <span style={{ fontSize:9, fontWeight:800, background:"#B8860B", color:"#FFFFFF", padding:"1px 6px", borderRadius:4 }}>👑 CAPTAIN</span>}
                                </span>
                              </span>
                              <span style={{ fontWeight:800, color:isCap?"#FEF08A":"#86EFAC", flexShrink:0 }}>
                                {isCap ? "🪙 0 (Captain)" : `🪙 ${Number(p.sold_price||0).toLocaleString("en-IN")}`}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
