import { aColor, initials, birthDateError, maxBirthDateForMinAge } from "../constants.js"
import { Swords, Users as UsersIcon, MapPin, MessageCircle, Inbox, Trophy, Lightbulb, CheckCircle2, CalendarPlus, ArrowLeft, Crown, Shield, Star, Eye, ChevronRight, ChevronDown, Calendar, BarChart3, Zap as SixesIcon, Ban, Target, Search as SearchIcon, Sparkles, Award } from "lucide-react"
export function Logo({ size = 36 }) {
  return (
    <img src="/logo-icon-v4.png" alt="Selected Sports" style={{ height: size, width: "auto", display: "block" }}/>
  )
}
export function LogoFull({ size = 40 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <Logo size={size} />
      <div>
        <div style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontWeight:700, fontSize:size*0.44, letterSpacing:"-0.5px", lineHeight:1.1 }}>Selected</div>
        <div style={{ color:"#B8860B", fontFamily:"var(--font-head)", fontWeight:600, fontSize:size*0.27, letterSpacing:"2.5px", textTransform:"uppercase", lineHeight:1.1 }}>Sports</div>
      </div>
    </div>
  )
}
export function Av({ name, id, sz = 34 }) {
  return (
    <div style={{ width:sz, height:sz, borderRadius:"50%", background:aColor(id), display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*0.3, fontWeight:700, color:"#0F172A", flexShrink:0, letterSpacing:"-0.5px", fontFamily:"var(--font-head)" }}>
      {initials(name)}
    </div>
  )
}
export function CoinIcon({ size = 14, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "inline-block", verticalAlign: "-2px", flexShrink: 0, ...style }}>
      <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="7.2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8"/>
      <path d="M12 7.2v9.6M9.6 9.6h4.8a1.4 1.4 0 0 1 0 2.8h-4.8a1.4 1.4 0 0 0 0 2.8h5" stroke="#78350F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
const TAG_STYLES = {
  green:{ bg:"rgba(25,182,106,0.12)", tx:"rgba(34,197,94,0.15)" }, lime:{ bg:"rgba(132,204,22,0.12)", tx:"#4D7C0F" },
  yellow:{ bg:"rgba(244,180,0,0.12)", tx:"rgba(246,196,83,0.15)" }, red:{ bg:"rgba(229,57,53,0.1)", tx:"rgba(231,76,60,0.15)" },
  blue:{ bg:"rgba(37,95,184,0.1)", tx:"#FFFFFF" }, teal:{ bg:"rgba(20,184,166,0.12)", tx:"#0F766E" },
  orange:{ bg:"rgba(251,146,60,0.12)", tx:"rgba(251,146,60,0.15)" }, purple:{ bg:"rgba(167,139,250,0.12)", tx:"rgba(91,33,182,0.12)" },
  gray:{ bg:"#F8FAF8", tx:"#F8FAF8" },
}
const ROLE_BADGE_CONFIG = {
  founder:   { label: "Founder",   icon: Crown,  bg: "linear-gradient(135deg,#FBBF24,#D4A017)", color: "#FFFFFF" },
  organizer: { label: "Organizer", icon: Shield, bg: "#166534",  color: "#FFFFFF" },
  pro:       { label: "PRO",       icon: Star,   bg: "#FFFFFF",  color: "#2563EB", border: "1.5px solid #2563EB" },
  player:    { label: "Player",    icon: Swords, bg: "#22C55E",  color: "#FFFFFF" },
  guest:     { label: "Guest",     icon: Eye,    bg: "#FFFFFF",  color: "#64748B", border: "1.5px solid #E2E8F0" },
}

export function RoleBadge({ role = "player", size = "md" }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t) }, [])
  const cfg = ROLE_BADGE_CONFIG[role] || ROLE_BADGE_CONFIG.player
  const isSmall = size === "sm"
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: isSmall ? 4 : 6,
      padding: isSmall ? "3px 9px" : "5px 13px", borderRadius: 999,
      background: cfg.bg, color: cfg.color, border: cfg.border || "none",
      fontSize: isSmall ? 10 : 12, fontWeight: 700, fontFamily: "var(--font-body)",
      boxShadow: "0 2px 6px rgba(15,23,42,0.12)", whiteSpace: "nowrap",
      opacity: mounted ? 1 : 0, transform: mounted ? "scale(1)" : "scale(0.95)",
      transition: "opacity 250ms, transform 250ms",
    }}>
      <cfg.icon size={isSmall ? 11 : 13}/>
      {cfg.label}
    </span>
  )
}

export function Tag({ children, col = "gray" }) {
  const c = TAG_STYLES[col] || TAG_STYLES.gray
  return <span style={{ background:c.bg, color:c.tx, borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:700, whiteSpace:"nowrap", display:"inline-block", fontFamily:"var(--font-head)" }}>{children}</span>
}
export function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style:sx = {} }) {
  const base = { border:"none", borderRadius:10, cursor:disabled?"not-allowed":"pointer", fontWeight:600, fontFamily:"var(--font-body)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, opacity:disabled?0.55:1 }
  const variants = {
    primary:{ background:"linear-gradient(135deg,#166534,#FFFFFF)", color:"#0F172A" },
    green:{ background:"#166534", color:"#0F172A" },
    danger:{ background:"rgba(229,57,53,0.1)", color:"#DC2626", border:"1px solid rgba(229,57,53,0.3)" },
    ghost:{ background:"#F8FAF8", color:"#0F172A" },
    wa:{ background:"rgba(25,182,106,0.12)", color:"#166534", border:"1px solid rgba(25,182,106,0.3)" },
    outline:{ background:"transparent", color:"#166534", border:"1.5px solid #166534" },
    dark:{ background:"#FFFFFF", color:"#0F172A", border:"none" },
  }
  const sizes = { sm:{ padding:"5px 12px", fontSize:12 }, md:{ padding:"9px 18px", fontSize:13 }, lg:{ padding:"12px 24px", fontSize:14 } }
  return <button onClick={disabled?undefined:onClick} style={{ ...base, ...variants[variant], ...sizes[size], ...sx }}>{children}</button>
}
export function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #E2E8F0", borderTopColor:"#166534", animation:"spin 0.7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
export function Card({ children, style:sx = {}, onClick }) {
  return <div onClick={onClick} style={{ background:"#FFFFFF", borderRadius:16, border:"1px solid #E2E8F0", boxShadow:"0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.03)", ...sx }}>{children}</div>
}

// Rounds a number down to a clean threshold and adds "+" (e.g. 187 -> "150+", 43 -> "40+")
function niceRound(n) {
  if (n <= 0) return "0"
  if (n < 10) return String(n)
  if (n < 50) return (Math.floor(n / 10) * 10) + "+"
  if (n < 100) return (Math.floor(n / 25) * 25) + "+"
  if (n < 1000) return (Math.floor(n / 50) * 50) + "+"
  return (Math.floor(n / 500) * 500) + "+"
}
export function StatsBanner({ stats, isMobile }) {
  if (!stats) return null
  const items = [
    { icon: Swords, label: "Matches", value: niceRound(stats.matches) },
    ...(stats.players !== undefined ? [{ icon: UsersIcon, label: "Players", value: niceRound(stats.players) }] : []),
    { icon: MapPin, label: "Grounds", value: niceRound(stats.venues) },
  ]
  return (
    <div style={{ display: "flex", gap: isMobile ? 8 : 12, marginBottom: 16 }}>
      {items.map((it) => (
        <div key={it.label} style={{ flex: 1, background: "#FFFFFF", borderRadius: 14, border: "1.5px solid #E2E8F0", padding: isMobile ? "12px 8px" : "16px 12px", textAlign: "center", boxShadow: "0 1px 4px rgba(37,95,184,0.05)" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom: 4, color:"#166534" }}><it.icon size={isMobile ? 18 : 20}/></div>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)", lineHeight: 1 }}>{it.value}</div>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "#64748B", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}

export function Bell({ count = 0, onClick }) {
  return (
    <button onClick={onClick} style={{ position:"relative", background:"transparent", border:"none", cursor:"pointer", padding:6, display:"flex", alignItems:"center", color:"#0F172A" }}>
      <MessageCircle size={18}/>
      {count > 0 && (
        <span style={{ position:"absolute", top:0, right:0, background:"#DC2626", color:"#0F172A", fontSize:9, fontWeight:800, borderRadius:"50%", minWidth:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", lineHeight:1 }}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  )
}
export function MessageInbox({ messages, onClose, player }) {
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [squadMatchId, setSquadMatchId] = useState(null)
  const [squadRows, setSquadRows] = useState([])
  const [squadLoading, setSquadLoading] = useState(false)
  const sendReply = async () => {
    if (!replyText.trim() || !player) return
    setSending(true)
    try {
      const adminId = await fetchAdminPlayerId()
      if (adminId) {
        await sendDirectMessage(player.id, adminId, replyText.trim())
        setSent(true)
        setReplyText("")
      }
    } catch(e) { alert(e.message) }
    setSending(false)
  }
  // "Squad full" messages carry a hidden [[match:ID]] marker so we can show
  // the real roster instead of just the plain notification text.
  const parseMatchRef = (text) => {
    const match = text.match(/\[\[match:([a-zA-Z0-9-]+)\]\]/)
    return { clean: text.replace(/\[\[match:[a-zA-Z0-9-]+\]\]/, "").trim(), matchId: match ? match[1] : null }
  }
  const openSquad = async (matchId) => {
    setSquadMatchId(matchId)
    setSquadLoading(true)
    try { setSquadRows(await fetchMatchPlayers(matchId)) } catch(e) { alert(e.message) }
    setSquadLoading(false)
  }
  if (squadMatchId) {
    const confirmed = squadRows.filter(r => r.status === "confirmed")
    const waitlist = squadRows.filter(r => r.status === "waitlist")
    return (
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:16, maxWidth:420, width:"100%", maxHeight:"80vh", overflowY:"auto", padding:20, boxShadow:"0 24px 60px rgba(15,23,42,0.35)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <button onClick={()=>setSquadMatchId(null)} style={{ background:"transparent", border:"none", fontSize:13, fontWeight:700, color:"#166534", cursor:"pointer", display:"flex", alignItems:"center", gap:4, padding:0 }}><ArrowLeft size={15}/> Back</button>
            <button onClick={onClose} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#64748B" }}>×</button>
          </div>
          {squadLoading ? <Spinner/> : (
            <>
              <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", marginBottom:10, fontFamily:"var(--font-head)" }}>Confirmed ({confirmed.length})</div>
              <div style={{ marginBottom:18 }}>
                {confirmed.length === 0 ? <div style={{ color:"#94A3B8", fontSize:12 }}>No one confirmed yet.</div> : confirmed.map(r => (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0" }}>
                    <Av name={r.players?.name || "Player"} id={r.player_id} sz={28}/>
                    <span style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{r.players?.name || "Player"}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:"#B8860B", marginBottom:10, fontFamily:"var(--font-head)" }}>Waitlist ({waitlist.length})</div>
              <div>
                {waitlist.length === 0 ? <div style={{ color:"#94A3B8", fontSize:12 }}>No one on the waitlist.</div> : waitlist.map(r => (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0" }}>
                    <Av name={r.players?.name || "Player"} id={r.player_id} sz={28}/>
                    <span style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{r.players?.name || "Player"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:16, maxWidth:420, width:"100%", maxHeight:"80vh", overflowY:"auto", padding:20, boxShadow:"0 24px 60px rgba(15,23,42,0.35)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:16, fontFamily:"var(--font-head)", color:"#0F172A", display:"flex", alignItems:"center", gap:8 }}><Inbox size={18}/> Messages</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#64748B" }}>×</button>
        </div>
        {messages.length === 0 && <div style={{ color:"#64748B", fontSize:13, textAlign:"center", padding:"20px 0" }}>No messages yet.</div>}
        {messages.map(m => {
          const { clean, matchId } = parseMatchRef(m.message)
          return (
            <div key={m.id} onClick={matchId ? ()=>openSquad(matchId) : undefined} style={{ padding:"12px 0", borderBottom:"1px solid #E2E8F0", cursor:matchId?"pointer":"default" }}>
              <div style={{ fontSize:13, color:"#0F172A", lineHeight:1.5 }}>{clean}</div>
              <div style={{ fontSize:11, color:"#64748B", marginTop:5, display:"flex", alignItems:"center", gap:6 }}>
                From {m.sender} · {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
                {matchId && <span style={{ color:"#166534", fontWeight:700, display:"flex", alignItems:"center", gap:2 }}>· View squad <ChevronRight size={11}/></span>}
              </div>
            </div>
          )
        })}
        {player && (
          <div style={{ marginTop:14, paddingTop:14, borderTop:"1.5px solid #E2E8F0" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#0F172A", marginBottom:8 }}>Reply to Admin</div>
            {sent && <div style={{ fontSize:12, color:"#166534", marginBottom:8 }}>✓ Sent! Full conversation is in Direct Messages.</div>}
            <div style={{ display:"flex", gap:8 }}>
              <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter" && sendReply()} placeholder="Type a reply..." style={{ flex:1, padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAF8", color:"#0F172A", fontSize:13, outline:"none", fontFamily:"var(--font-body)" }}/>
              <button onClick={sendReply} disabled={sending} style={{ padding:"9px 14px", borderRadius:9, background:"#166534", border:"none", color:"#0F172A", fontSize:13, cursor:"pointer", fontWeight:600 }}>{sending ? "..." : "Send"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from "react"
import { fetchLeaderboard } from "../db.js"

export function LeaderboardPage({ isMobile, myId }) {
  const POINTS_PER_MATCH = 20
  const [rawRows, setRawRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState("points")
  const [season, setSeason] = useState("all")
  const [seasonOpen, setSeasonOpen] = useState(false)
  const [roleFilter, setRoleFilter] = useState("all")
  const [roleOpen, setRoleOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    fetchLeaderboard().then(r => {
      setRawRows(r)
      setTimeout(() => setRevealed(true), 50)
      if (r.length > 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2200)
      }
    }).catch(e => setLoadError(e.message || String(e))).finally(()=>setLoading(false))
  }, [])

  if (loading) return <Spinner/>

  const seasons = Array.from(new Set(rawRows.map(r => (r.matches?.date || "").slice(0,4)).filter(Boolean))).sort().reverse()

  const filteredRaw = rawRows.filter(r => {
    if (season !== "all" && (r.matches?.date || "").slice(0,4) !== season) return false
    if (roleFilter !== "all" && (r.players?.role || "player") !== roleFilter) return false
    return true
  })

  const map = {}
  filteredRaw.forEach(r => {
    const p = r.players
    if (!p) return
    if (!map[p.id]) {
      map[p.id] = {
        id: p.id,
        name: p.name,
        city: p.city,
        role: p.role,
        profile_image_url: p.profile_image_url,
        matchesPlayed: 0,
        matches: [],
        earliestConfirmedAt: r.created_at
      }
    }
    map[p.id].matchesPlayed++
    if (r.matches) map[p.id].matches.push({ ...r.matches, confirmedAt: r.created_at })
    if (r.created_at && (!map[p.id].earliestConfirmedAt || r.created_at < map[p.id].earliestConfirmedAt)) {
      map[p.id].earliestConfirmedAt = r.created_at
    }
  })

  const allRankedRows = Object.values(map).map(p => ({ ...p, points: p.matchesPlayed * POINTS_PER_MATCH })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (!a.earliestConfirmedAt) return 1
    if (!b.earliestConfirmedAt) return -1
    return new Date(a.earliestConfirmedAt) - new Date(b.earliestConfirmedAt)
  })

  const q = searchQuery.trim().toLowerCase()
  const rows = allRankedRows.filter(p => !q || p.name.toLowerCase().includes(q) || (p.city||"").toLowerCase().includes(q))

  const top3 = allRankedRows.slice(0, 3)
  const rest = q ? rows : allRankedRows.slice(3)
  const myIndex = myId ? allRankedRows.findIndex(p => p.id === myId) : -1

  const medalConfig = {
    1: {
      title: "👑 MVP · CHAMPION",
      border: "2px solid #F59E0B",
      bg: "linear-gradient(180deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.03) 100%)",
      badgeBg: "linear-gradient(135deg, #F59E0B, #D97706)",
      glow: "0 10px 28px rgba(245,158,11,0.28)",
      avatarBorder: "#F59E0B",
      avatarGlow: "0 0 20px rgba(245,158,11,0.4)"
    },
    2: {
      title: "🥈 2ND PLACE",
      border: "1.5px solid #CBD5E1",
      bg: "linear-gradient(180deg, rgba(241,245,249,0.9) 0%, rgba(255,255,255,0.8) 100%)",
      badgeBg: "linear-gradient(135deg, #94A3B8, #64748B)",
      glow: "0 8px 20px rgba(100,116,139,0.15)",
      avatarBorder: "#94A3B8",
      avatarGlow: "none"
    },
    3: {
      title: "🥉 3RD PLACE",
      border: "1.5px solid #FDE68A",
      bg: "linear-gradient(180deg, rgba(254,243,199,0.5) 0%, rgba(255,255,255,0.8) 100%)",
      badgeBg: "linear-gradient(135deg, #D97706, #B45309)",
      glow: "0 8px 20px rgba(180,83,9,0.15)",
      avatarBorder: "#D97706",
      avatarGlow: "none"
    }
  }

  const PodiumSpot = ({ p, rank }) => {
    if (!p) return <div style={{ flex: 1 }} />
    const conf = medalConfig[rank]
    const isWinner = rank === 1

    return (
      <div
        onClick={() => setSelectedPlayer(p)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          opacity: revealed ? 1 : 0,
          transform: revealed ? (isWinner ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)") : "translateY(24px) scale(0.95)",
          transition: `all 350ms cubic-bezier(0.16, 1, 0.3, 1) ${rank === 1 ? 200 : rank === 2 ? 100 : 0}ms`,
          zIndex: isWinner ? 3 : 2
        }}
      >
        {isWinner && (
          <div style={{
            background: conf.badgeBg,
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: 900,
            padding: "4px 12px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 8,
            boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
            letterSpacing: 0.5,
            fontFamily: "var(--font-head)"
          }}>
            <Crown size={12} fill="#FFFFFF"/> MVP · RANK 1
          </div>
        )}

        <div style={{
          position: "relative",
          padding: isWinner ? (isMobile ? "18px 10px 16px" : "24px 16px 20px") : (isMobile ? "14px 8px 12px" : "18px 12px 16px"),
          borderRadius: 20,
          background: conf.bg,
          border: conf.border,
          width: "100%",
          textAlign: "center",
          boxShadow: conf.glow,
          boxSizing: "border-box"
        }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
            <div style={{
              borderRadius: "50%",
              boxShadow: conf.avatarGlow,
              padding: 2,
              background: "#FFFFFF",
              border: `2px solid ${conf.avatarBorder}`
            }}>
              {p.profile_image_url ? (
                <img
                  src={p.profile_image_url}
                  alt={p.name}
                  style={{
                    width: isWinner ? (isMobile ? 54 : 68) : (isMobile ? 42 : 52),
                    height: isWinner ? (isMobile ? 54 : 68) : (isMobile ? 42 : 52),
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: "block"
                  }}
                />
              ) : (
                <Av name={p.name} id={p.id} sz={isWinner ? (isMobile ? 54 : 68) : (isMobile ? 42 : 52)} />
              )}
            </div>
            <div style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: isWinner ? 24 : 20,
              height: isWinner ? 24 : 20,
              borderRadius: "50%",
              background: conf.badgeBg,
              color: "#FFFFFF",
              fontSize: isWinner ? 12 : 10,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #FFFFFF",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
            }}>
              {rank}
            </div>
          </div>

          <div style={{
            fontWeight: 800,
            fontSize: isWinner ? (isMobile ? 13 : 15) : (isMobile ? 12 : 13),
            color: "#0F172A",
            fontFamily: "var(--font-head)",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            {p.name}
          </div>

          <div style={{ marginTop: 4, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
            {p.role && p.role !== "player" ? (
              <RoleBadge role={p.role} size="sm"/>
            ) : (
              <span style={{ fontSize: 9.5, fontWeight: 800, background: "rgba(22,101,52,0.1)", color: "#166534", padding: "1px 6px", borderRadius: 4 }}>PLAYER</span>
            )}
            {p.city && !isMobile && (
              <span style={{ fontSize: 10, color: "#94A3B8" }}>· {p.city}</span>
            )}
          </div>

          <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, fontWeight: 600 }}>
            {p.matchesPlayed} Matches
          </div>

          <div style={{
            fontSize: isWinner ? (isMobile ? 18 : 22) : (isMobile ? 15 : 18),
            fontWeight: 900,
            color: "#166534",
            fontFamily: "var(--font-head)",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3
          }}>
            <span>{p.points}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8" }}>PTS</span>
          </div>
        </div>
      </div>
    )
  }

  const ConfettiPiece = ({ i }) => {
    const colors = ["#F59E0B", "#166534", "#22C55E", "#FBBF24", "#3B82F6"]
    const left = Math.random() * 100
    const delay = Math.random() * 300
    const duration = 1200 + Math.random() * 600
    const rotate = Math.random() * 360
    const color = colors[i % colors.length]
    return (
      <div style={{
        position: "absolute", top: -10, left: left + "%", width: 8, height: 8,
        background: color, borderRadius: i % 2 === 0 ? "50%" : 2,
        animation: `confettiFall ${duration}ms ease-in ${delay}ms forwards`,
        transform: `rotate(${rotate}deg)`,
      }}/>
    )
  }

  const NotYetTracked = ({ label, desc }) => (
    <Card style={{ padding: "44px 20px", textAlign: "center", borderRadius: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F8FAF8", border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Target size={26} color="#94A3B8"/>
      </div>
      <div style={{ fontWeight: 900, fontSize: 16, color: "#0F172A", marginBottom: 6, fontFamily: "var(--font-head)" }}>
        {label} Leaderboard Coming Soon
      </div>
      <div style={{ color: "#64748B", fontSize: 13, maxWidth: 360, margin: "0 auto", lineHeight: 1.5 }}>
        {desc || "Individual batting and bowling statistics will populate automatically once ball-by-ball live match scoring is active."}
      </div>
    </Card>
  )

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(260px) rotate(320deg); }
        }
      `}</style>
      {showConfetti && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 260, overflow: "hidden", pointerEvents: "none", zIndex: 10 }}>
          {Array.from({ length: 36 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
        </div>
      )}

      {/* Modern Header Strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: 16, gap: 12, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(22,101,52,0.1))", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy size={20} color="#D97706" />
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-head)", color: "#0F172A", fontSize: isMobile ? 19 : 22, margin: 0, fontWeight: 900, letterSpacing: "-0.4px" }}>
                Player Leaderboard
              </h2>
              <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 2 }}>
                Official community rankings calculated from verified match appearances (20 PTS / Match)
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls (Role & Season) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: isMobile ? "100%" : "auto", flexWrap: "wrap" }}>
          {/* Season Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => { setSeasonOpen(o => !o); setRoleOpen(false) }}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1.5px solid #E2E8F0",
                background: "#FFFFFF",
                color: "#0F172A",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Calendar size={13} color="#166534"/>
              <span>{season === "all" ? "All Seasons" : `Season ${season}`}</span>
              <ChevronDown size={13} color="#94A3B8"/>
            </button>
            {seasonOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, boxShadow: "0 10px 30px rgba(15,23,42,0.15)", zIndex: 30, minWidth: 140, overflow: "hidden" }}>
                <button type="button" onClick={() => { setSeason("all"); setSeasonOpen(false) }} style={{ width: "100%", padding: "10px 14px", border: "none", background: season === "all" ? "rgba(34,197,94,0.08)" : "none", textAlign: "left", fontSize: 12.5, color: "#0F172A", cursor: "pointer", fontWeight: season === "all" ? 800 : 500 }}>All Seasons</button>
                {seasons.map(s => (
                  <button key={s} type="button" onClick={() => { setSeason(s); setSeasonOpen(false) }} style={{ width: "100%", padding: "10px 14px", border: "none", background: season === s ? "rgba(34,197,94,0.08)" : "none", textAlign: "left", fontSize: 12.5, color: "#0F172A", cursor: "pointer", fontWeight: season === s ? 800 : 500 }}>Season {s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => { setRoleOpen(o => !o); setSeasonOpen(false) }}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1.5px solid #E2E8F0",
                background: "#FFFFFF",
                color: "#0F172A",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <span>{roleFilter === "all" ? "All Players" : roleFilter === "pro" ? "PRO Only" : "Players Only"}</span>
              <ChevronDown size={13} color="#94A3B8"/>
            </button>
            {roleOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, boxShadow: "0 10px 30px rgba(15,23,42,0.15)", zIndex: 30, minWidth: 140, overflow: "hidden" }}>
                {[["all","All Players"],["player","Players Only"],["pro","PRO Only"]].map(([k,label]) => (
                  <button key={k} type="button" onClick={() => { setRoleFilter(k); setRoleOpen(false) }} style={{ width: "100%", padding: "10px 14px", border: "none", background: roleFilter === k ? "rgba(34,197,94,0.08)" : "none", textAlign: "left", fontSize: 12.5, color: "#0F172A", cursor: "pointer", fontWeight: roleFilter === k ? 800 : 500 }}>{label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Row + Live Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 18, flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", width: isMobile ? "100%" : "auto", paddingBottom: 2 }}>
          {[
            ["points", "Points Table", BarChart3],
            ["runs", "Most Runs", Target],
            ["wickets", "Most Wickets", Ban],
            ["sixes", "Most 6s", SixesIcon]
          ].map(([k, label, Icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveTab(k)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: activeTab === k ? "none" : "1.5px solid #E2E8F0",
                background: activeTab === k ? "#166534" : "#FFFFFF",
                color: activeTab === k ? "#FFFFFF" : "#64748B",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: activeTab === k ? "0 2px 8px rgba(22,101,52,0.25)" : "none",
                transition: "all 150ms ease"
              }}
            >
              <Icon size={13}/>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Player Search Bar */}
        {activeTab === "points" && (
          <div style={{ width: isMobile ? "100%" : 240, position: "relative" }}>
            <SearchIcon size={14} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ranked player..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                borderRadius: 999,
                border: "1.5px solid #E2E8F0",
                fontSize: 12,
                outline: "none",
                background: "#FFFFFF",
                boxSizing: "border-box",
                fontFamily: "var(--font-body)"
              }}
            />
          </div>
        )}
      </div>

      {activeTab === "runs" && <NotYetTracked label="Most Runs" desc="Track top batsmen across tournaments once live match scoring is recorded."/>}
      {activeTab === "wickets" && <NotYetTracked label="Most Wickets" desc="Track top wicket-takers across matches once match scorecards are submitted."/>}
      {activeTab === "sixes" && <NotYetTracked label="Most 6s" desc="Track maximum sixes hit per season once live innings balls are captured."/>}

      {activeTab === "points" && (
        loadError ? (
          <div style={{ color: "#EF4444", fontSize: 13, textAlign: "center", padding: "30px 0", background: "rgba(239,68,68,0.06)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.25)" }}>
            ⚠️ Couldn't load the leaderboard: {loadError}
          </div>
        ) : allRankedRows.length === 0 ? (
          <Card style={{ padding: "40px 20px", textAlign: "center", borderRadius: 16 }}>
            <div style={{ fontSize: 14, color: "#64748B" }}>No completed matches recorded yet{season !== "all" ? ` for Season ${season}` : ""}.</div>
          </Card>
        ) : (
          <>
            {/* ── TOP 3 PODIUM (Visible when not actively searching) ── */}
            {!q && top3.length > 0 && (
              <div style={{ display: "flex", alignItems: "stretch", gap: isMobile ? 8 : 14, marginBottom: 22, padding: "0 2px" }}>
                <PodiumSpot p={top3[1]} rank={2}/>
                <PodiumSpot p={top3[0]} rank={1}/>
                <PodiumSpot p={top3[2]} rank={3}/>
              </div>
            )}

            {/* ── RANKINGS LIST / TABLE (Ranks 4+) ── */}
            {rest.length > 0 ? (
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0", background: "#FFFFFF", marginBottom: 20, boxShadow: "0 4px 16px rgba(15,23,42,0.03)" }}>
                {/* Table Header Bar */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  padding: isMobile ? "12px 14px" : "12px 20px",
                  background: "#F8FAF8",
                  borderBottom: "1px solid #E2E8F0",
                  color: "#64748B",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.5
                }}>
                  <div style={{ width: 34 }}>#</div>
                  <div style={{ flex: 1 }}>Player</div>
                  <div style={{ width: 80, textAlign: "center" }}>Role</div>
                  <div style={{ width: 70, textAlign: "center" }}>Matches</div>
                  <div style={{ width: 80, textAlign: "right" }}>Points</div>
                  <div style={{ width: 24 }}/>
                </div>

                {/* Table Rows */}
                {rest.map((p, i) => {
                  const rank = q ? (allRankedRows.findIndex(x => x.id === p.id) + 1) : (i + 4)
                  const isMe = p.id === myId
                  const isTopTen = rank <= 10

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlayer(p)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: isMobile ? "11px 14px" : "12px 20px",
                        background: isMe ? "rgba(34,197,94,0.07)" : "#FFFFFF",
                        borderTop: "1px solid #F1F5F9",
                        cursor: "pointer",
                        transition: "background 150ms ease",
                        position: "relative"
                      }}
                      onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = "#F8FAF8" }}
                      onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = "#FFFFFF" }}
                    >
                      {/* Rank Indicator */}
                      <div style={{ width: 34, flexShrink: 0 }}>
                        {isTopTen ? (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: "#F1F5F9",
                            color: "#0F172A",
                            fontSize: 11,
                            fontWeight: 900,
                            fontFamily: "var(--font-head)"
                          }}>
                            {rank}
                          </span>
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", fontFamily: "var(--font-head)" }}>
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Player Identity (Photo + Name) */}
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        {p.profile_image_url ? (
                          <img
                            src={p.profile_image_url}
                            alt={p.name}
                            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid #E2E8F0" }}
                          />
                        ) : (
                          <Av name={p.name} id={p.id} sz={34}/>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{p.name}</span>
                            {isMe && (
                              <span style={{ background: "#166534", color: "#FFFFFF", fontSize: 9, fontWeight: 900, padding: "1px 6px", borderRadius: 4 }}>
                                YOU
                              </span>
                            )}
                          </div>
                          {p.city && (
                            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                              📍 {p.city}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div style={{ width: 80, textAlign: "center", flexShrink: 0 }}>
                        {p.role && p.role !== "player" ? (
                          <RoleBadge role={p.role} size="sm"/>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 800, background: "rgba(22,101,52,0.08)", color: "#166534", padding: "2px 7px", borderRadius: 4 }}>
                            Player
                          </span>
                        )}
                      </div>

                      {/* Matches Count */}
                      <div style={{ width: 70, textAlign: "center", fontSize: 13, fontWeight: 800, color: "#0F172A", flexShrink: 0 }}>
                        {p.matchesPlayed}
                      </div>

                      {/* Points */}
                      <div style={{ width: 80, textAlign: "right", fontSize: 14, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)", flexShrink: 0 }}>
                        {p.points} <span style={{ fontSize: 9.5, fontWeight: 700, color: "#94A3B8" }}>PTS</span>
                      </div>

                      {/* Chevron */}
                      <div style={{ width: 24, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
                        <ChevronRight size={15} color="#CBD5E1"/>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : q ? (
              <Card style={{ padding: "32px 16px", textAlign: "center", borderRadius: 14 }}>
                <div style={{ fontSize: 13.5, color: "#64748B" }}>No ranked players match "{searchQuery}".</div>
              </Card>
            ) : null}

            {/* ── LOGGED-IN PLAYER HIGHLIGHT CARD ── */}
            {myIndex >= 0 && (
              <div style={{
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "linear-gradient(135deg, rgba(22,101,52,0.08), rgba(22,101,52,0.02))",
                border: "1.5px solid rgba(22,101,52,0.3)",
                borderRadius: 16,
                boxShadow: "0 4px 14px rgba(22,101,52,0.08)"
              }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#166534", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(22,101,52,0.3)" }}>
                  <Award size={20} color="#FFFFFF"/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#166534", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Your Season Ranking
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)", marginTop: 2 }}>
                    Rank #{myIndex + 1} <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>of {allRankedRows.length} players</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)" }}>
                    {allRankedRows[myIndex].points} <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>PTS</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                    {allRankedRows[myIndex].matchesPlayed} matches played
                  </div>
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* ── PLAYER MATCH DETAILS MODAL ── */}
      {selectedPlayer && (
        <div onClick={() => setSelectedPlayer(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: 20, maxWidth: 440, width: "100%", padding: 22, boxShadow: "0 24px 60px rgba(15,23,42,0.3)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {selectedPlayer.profile_image_url ? (
                  <img src={selectedPlayer.profile_image_url} alt={selectedPlayer.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "2px solid #166534" }}/>
                ) : (
                  <Av name={selectedPlayer.name} id={selectedPlayer.id} sz={50}/>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                    {selectedPlayer.name}
                  </h3>
                  <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span>{selectedPlayer.city || "Pune"}</span>
                    <span>·</span>
                    <span style={{ fontWeight: 700, color: "#166534" }}>{selectedPlayer.role || "Player"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94A3B8", padding: 0 }}>×</button>
            </div>

            {/* Metric Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16, background: "#F8FAF8", padding: 12, borderRadius: 12, border: "1px solid #E2E8F0", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Rank</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)", marginTop: 2 }}>
                  #{allRankedRows.findIndex(x => x.id === selectedPlayer.id) + 1}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Matches</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)", marginTop: 2 }}>
                  {selectedPlayer.matchesPlayed}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Points</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)", marginTop: 2 }}>
                  {selectedPlayer.points}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.3 }}>
              Verified Completed Matches ({selectedPlayer.matches?.length || 0})
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: 8, paddingRight: 2, maxHeight: 240 }}>
              {(selectedPlayer.matches || []).map((m, idx) => (
                <div key={idx} style={{ padding: "9px 12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.our_team || "Team"} vs {m.team || "Opponent"}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                      📅 {m.date || "Completed"}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#166534", background: "#DCFCE7", padding: "2px 7px", borderRadius: 6, flexShrink: 0 }}>
                    +20 PTS
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              style={{ width: "100%", padding: "11px", borderRadius: 10, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)", marginTop: 16 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { sendFeedback } from "../db.js"

export function FeedbackButton({ playerId, playerName }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = async () => {
    if (!text.trim()) return
    setSending(true)
    try { await sendFeedback(playerId, playerName, text.trim()); setSent(true); setText("") } catch(e) { alert(e.message) }
    setSending(false)
  }
  return (
    <>
      <button onClick={()=>{ setOpen(true); setSent(false) }} style={{ width:"100%", padding:"11px", borderRadius:10, background:"#FFFFFF", border:"1.5px solid #E2E8F0", color:"#0F172A", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Lightbulb size={16} color="#FBBF24"/> Send Feedback / Idea</button>
      {open && (
        <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:16, maxWidth:420, width:"100%", padding:20, boxShadow:"0 24px 60px rgba(15,23,42,0.35)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontWeight:700, fontSize:16, fontFamily:"var(--font-head)", color:"#0F172A", display:"flex", alignItems:"center", gap:8 }}><Lightbulb size={18} color="#B8860B"/> Feedback / Idea</div>
              <button onClick={()=>setOpen(false)} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#64748B" }}>×</button>
            </div>
            {sent ? (
              <div style={{ color:"#166534", fontSize:13, textAlign:"center", padding:"16px 0", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><CheckCircle2 size={16}/> Thanks! Your feedback was sent.</div>
            ) : (
              <>
                <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="What's not working, or what would make this better?" style={{ width:"100%", padding:"9px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#F8FAF8", color:"#0F172A", fontSize:13, fontFamily:"var(--font-body)", resize:"vertical", marginBottom:12, boxSizing:"border-box" }}/>
                <button onClick={submit} disabled={sending} style={{ width:"100%", padding:"11px", borderRadius:10, background:"#166534", border:"none", color:"#0F172A", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)" }}>{sending ? "Sending..." : "Send"}</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

import { requestProAccess, fetchMyProRequest, cancelProRequest } from "../db.js"

export function ProRequestCard({ player }) {
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  useEffect(() => {
    fetchMyProRequest(player.id).then(setRequest).catch(()=>{}).finally(()=>setLoading(false))
  }, [player.id])
  const submit = async () => {
    setSending(true)
    try { const row = await requestProAccess(player.id); setRequest(row) } catch(e) { alert(e.message) }
    setSending(false)
  }
  const cancel = async () => {
    if (!request?.id) return
    setCancelling(true)
    try { await cancelProRequest(request.id); setRequest(null) } catch(e) { alert(e.message) }
    setCancelling(false)
  }
  if (player.role === "pro" || loading) return null
  const status = request?.status
  return (
    <Card style={{ padding:"16px", marginTop:16 }}>
      <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", marginBottom:8, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><CalendarPlus size={17} color="#166534"/> Schedule Your Own Matches</div>
      <div style={{ fontSize:12, color:"#64748B", marginBottom:12, lineHeight:1.5 }}>Scheduling matches is a Pro feature. Request access below — once approved by your admin, you'll be able to schedule your own matches for 60 days.</div>
      {status === "pending" ? (
        <>
          <div style={{ padding:"10px 12px", background:"rgba(216,176,91,0.1)", borderRadius:10, color:"#B8860B", fontSize:12, fontWeight:700, textAlign:"center", marginBottom:10 }}>⏳ Your request is pending admin approval</div>
          <button onClick={cancel} disabled={cancelling} style={{ width:"100%", padding:"9px", borderRadius:10, background:"transparent", border:"1.5px solid #E2E8F0", color:"#64748B", fontSize:12, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-body)" }}>{cancelling ? "Cancelling..." : "Cancel Request"}</button>
        </>
      ) : (
        <button onClick={submit} disabled={sending} style={{ width:"100%", padding:"11px", borderRadius:10, background:"linear-gradient(135deg,#166534,#FFFFFF)", border:"none", color:"#0F172A", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>{sending ? "Sending..." : status === "rejected" ? "Request Again" : (<><CalendarPlus size={15}/> Request to Schedule Matches</>)}</button>
      )}
    </Card>
  )
}

import { fetchMyConversations, fetchConversation, sendDirectMessage, markConversationRead, countUnreadDirectMessages, fetchMyOrganizers, fetchMyConfirmedPlayers, fetchPlayers, fetchAdminPlayerId, fetchMatchPlayers } from "../db.js"

export function DirectMessagesPanel({ player, onClose }) {
  const [convos, setConvos] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [thread, setThread] = useState([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [candidates, setCandidates] = useState([])

  const loadConvos = async () => {
    setLoading(true)
    try { setConvos(await fetchMyConversations(player.id)) } catch {}
    setLoading(false)
  }
  useEffect(() => { loadConvos() }, [player.id])

  const openThread = async (otherId, otherName) => {
    setActive({ otherId, otherName })
    try {
      const msgs = await fetchConversation(player.id, otherId)
      setThread(msgs)
      await markConversationRead(player.id, otherId)
      loadConvos()
    } catch(e) { alert(e.message) }
  }

  const send = async () => {
    if (!input.trim() || !active) return
    setSending(true)
    try {
      await sendDirectMessage(player.id, active.otherId, input.trim())
      setInput("")
      const msgs = await fetchConversation(player.id, active.otherId)
      setThread(msgs)
    } catch(e) { alert(e.message) }
    setSending(false)
  }

  const openNew = async () => {
    setShowNew(true)
    try {
      let list = []
      if (player.role === "pro") list = await fetchMyConfirmedPlayers(player.id)
      else if (player.role === "admin") list = await fetchPlayers()
      else list = await fetchMyOrganizers(player.id)
      setCandidates(list.filter(p => p.id !== player.id))
    } catch(e) { alert(e.message) }
  }

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:600, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:16, maxWidth:440, width:"100%", maxHeight:"82vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 60px rgba(15,23,42,0.35)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 18px", borderBottom:"1px solid #E2E8F0" }}>
          <div onClick={active ? ()=>setActive(null) : undefined} style={{ fontWeight:700, fontSize:16, fontFamily:"var(--font-head)", color:"#0F172A", cursor:active?"pointer":"default", display:"flex", alignItems:"center", gap:8 }}>
            {active ? (<><ArrowLeft size={16}/> {active.otherName}</>) : (<><MessageCircle size={18}/> Direct Messages</>)}
          </div>
          <button onClick={active ? ()=>setActive(null) : onClose} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#64748B" }}>×</button>
        </div>

        {!active ? (
          <div style={{ overflowY:"auto", flex:1, padding:"12px 14px" }}>
            <button onClick={openNew} style={{ width:"100%", padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#166534,#FFFFFF)", border:"none", color:"#0F172A", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)", marginBottom:12 }}>+ New Message</button>
            {loading ? <div style={{ textAlign:"center", color:"#64748B", fontSize:13, padding:"20px 0" }}>Loading...</div> :
             convos.length === 0 ? <div style={{ textAlign:"center", color:"#64748B", fontSize:13, padding:"20px 0" }}>No conversations yet.</div> :
             convos.map(c => (
              <div key={c.otherId} onClick={()=>openThread(c.otherId, c.otherName)} style={{ padding:"10px 12px", borderRadius:10, border:"1px solid #E2E8F0", marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#0F172A" }}>{c.otherName}</div>
                  <div style={{ fontSize:11, color:"#64748B", maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.lastMessage}</div>
                </div>
                {c.unread > 0 && <span style={{ background:"#DC2626", color:"#0F172A", fontSize:10, fontWeight:800, borderRadius:"50%", minWidth:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{c.unread}</span>}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ overflowY:"auto", flex:1, padding:"14px", display:"flex", flexDirection:"column", gap:8 }}>
              {thread.map((m,i) => {
                const isMe = m.sender_id === player.id
                return (
                  <div key={i} style={{ alignSelf:isMe?"flex-end":"flex-start", maxWidth:"75%" }}>
                    <div style={{ background:isMe?"rgba(37,95,184,0.12)":"#F8FAF8", borderRadius:isMe?"12px 12px 3px 12px":"12px 12px 12px 3px", padding:"9px 12px", fontSize:13, color:"#0F172A" }}>{m.message}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display:"flex", gap:8, padding:"12px 14px", borderTop:"1px solid #E2E8F0" }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()} placeholder="Type a message..." style={{ flex:1, padding:"10px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAF8", color:"#0F172A", fontSize:14, outline:"none", fontFamily:"var(--font-body)" }}/>
              <button onClick={send} disabled={sending} style={{ padding:"10px 16px", borderRadius:9, background:"#166534", border:"none", color:"#0F172A", fontSize:14, cursor:"pointer", fontWeight:600 }}>Send</button>
            </div>
          </>
        )}

        {showNew && (
          <div onClick={()=>setShowNew(false)} style={{ position:"fixed", inset:0, background:"rgba(24,60,115,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700, padding:16 }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:14, maxWidth:340, width:"100%", maxHeight:"70vh", overflowY:"auto", padding:16, boxShadow:"0 24px 60px rgba(15,23,42,0.35)" }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", marginBottom:10, fontFamily:"var(--font-head)" }}>Message who?</div>
              {candidates.length === 0 ? <div style={{ color:"#64748B", fontSize:13, textAlign:"center", padding:"14px 0" }}>No one available to message yet.</div> :
               candidates.map(p => (
                <div key={p.id} onClick={()=>{ setShowNew(false); openThread(p.id, p.name) }} style={{ padding:"9px 10px", borderRadius:8, cursor:"pointer", fontSize:13, color:"#0F172A", borderBottom:"1px solid #F8FAF8" }}>{p.name}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Mandatory profile completion (shared across Player/Pro/Admin portals) ──
import { updatePlayer as _updatePlayerForCompletion, uploadProfilePhoto as _uploadPhotoForCompletion } from "../db.js"
import { PhotoUploadField as _PhotoUploadFieldForCompletion } from "./PhotoCropModal.jsx"

export function isProfileIncomplete(p) {
  if (!p) return false
  return !p.city || !p.birth_date || !p.jersey_number || !p.jersey_size || !p.profile_image_url
}

export function ProfileCompletionModal({ player, onComplete }) {
  const [city, setCity] = useState(player.city || "")
  const [birthDate, setBirthDate] = useState(player.birth_date || "")
  const [jerseyNumber, setJerseyNumber] = useState(player.jersey_number || "")
  const [jerseySize, setJerseySize] = useState(player.jersey_size || "")
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(player.profile_image_url || "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const iS = { width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:15, outline:"none", background:"#F8FAF8", color:"#0F172A", boxSizing:"border-box", fontFamily:"var(--font-body)" }
  const lS = { fontSize:12, color:"#64748B", display:"block", marginBottom:6, fontWeight:600 }

  const submit = async () => {
    setError("")
    if (!city.trim()) { setError("Please enter your city."); return }
    if (!birthDate) { setError("Please enter your date of birth."); return }
    const dobErr = birthDateError(birthDate)
    if (dobErr) { setError(dobErr); return }
    if (!jerseyNumber.trim()) { setError("Please enter your jersey number."); return }
    if (!jerseySize) { setError("Please select your jersey size."); return }
    if (!photoFile && !photoPreview) { setError("Please upload a profile photo."); return }
    setBusy(true)
    try {
      let photoUrl = photoPreview
      if (photoFile) photoUrl = await _uploadPhotoForCompletion(photoFile, player.phone)
      await _updatePlayerForCompletion(player.id, player.name, player.phone, player.pin, city.trim(), {
        birthDate, profileImageUrl: photoUrl, jerseyNumber: jerseyNumber.trim(), jerseySize
      })
      onComplete({ ...player, city: city.trim(), birth_date: birthDate, jersey_number: jerseyNumber.trim(), jersey_size: jerseySize, profile_image_url: photoUrl })
    } catch(e) { setError(e.message) }
    setBusy(false)
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:900, padding:16 }}>
      <div style={{ background:"#FFFFFF", borderRadius:18, padding:"24px 20px", width:400, maxWidth:"100%", maxHeight:"90vh", overflowY:"auto", boxSizing:"border-box" }}>
        <div style={{ fontWeight:800, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)", marginBottom:4 }}>Complete Your Profile</div>
        <div style={{ fontSize:13, color:"#64748B", marginBottom:18 }}>Just a few details before you continue — this only takes a minute.</div>

        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <_PhotoUploadFieldForCompletion photoPreview={photoPreview} onPhotoSaved={(file, dataUrl) => { setPhotoFile(file); setPhotoPreview(dataUrl) }}/>
        </div>

        <label style={lS}>City</label>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Pune" style={{ ...iS, marginBottom:14 }}/>

        <label style={lS}>Date of Birth</label>
        <input value={birthDate} onChange={e => setBirthDate(e.target.value)} type="date" max={maxBirthDateForMinAge()} style={{ ...iS, marginBottom:14 }}/>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          <div>
            <label style={lS}>Jersey Number</label>
            <input value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))} inputMode="numeric" placeholder="e.g. 7" style={iS}/>
          </div>
          <div>
            <label style={lS}>Jersey Size</label>
            <select value={jerseySize} onChange={e => setJerseySize(e.target.value)} style={iS}>
              <option value="">Select</option>
              {["S","M","L","XL","XXL","3XL","4XL","5XL","6XL"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:14 }}>{error}</div>}

        <button onClick={submit} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, fontWeight:800, cursor:busy?"not-allowed":"pointer", opacity:busy?0.6:1, fontFamily:"var(--font-head)" }}>{busy ? "Saving..." : "Save & Continue"}</button>
      </div>
    </div>
  )
}

export function DirectMessagesButton({ player }) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const refresh = () => { countUnreadDirectMessages(player.id).then(setCount).catch(()=>{}) }
  useEffect(() => { refresh() }, [player.id])
  return (
    <>
      <button onClick={()=>setOpen(true)} style={{ position:"relative", width:"100%", padding:"11px", borderRadius:10, background:"#FFFFFF", border:"1.5px solid #E2E8F0", color:"#0F172A", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <MessageCircle size={16}/> Direct Messages{count > 0 ? ` (${count})` : ""}
      </button>
      {open && <DirectMessagesPanel player={player} onClose={()=>{ setOpen(false); refresh() }} />}
    </>
  )
}
