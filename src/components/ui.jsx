import { aColor, initials } from "../constants.js"
import { Swords, Users as UsersIcon, MapPin, MessageCircle, Inbox, Trophy, Lightbulb, CheckCircle2, CalendarPlus, ArrowLeft, Crown, Shield, Star, Eye } from "lucide-react"
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
  return <div onClick={onClick} style={{ background:"#FFFFFF", borderRadius:16, border:"1.5px solid #E2E8F0", boxShadow:"0 1px 4px rgba(37,95,184,0.06)", ...sx }}>{children}</div>
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
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:16, maxWidth:420, width:"100%", maxHeight:"80vh", overflowY:"auto", padding:20, boxShadow:"0 24px 60px rgba(15,23,42,0.35)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:16, fontFamily:"var(--font-head)", color:"#0F172A", display:"flex", alignItems:"center", gap:8 }}><Inbox size={18}/> Messages</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#64748B" }}>×</button>
        </div>
        {messages.length === 0 && <div style={{ color:"#64748B", fontSize:13, textAlign:"center", padding:"20px 0" }}>No messages yet.</div>}
        {messages.map(m => (
          <div key={m.id} style={{ padding:"12px 0", borderBottom:"1px solid #E2E8F0" }}>
            <div style={{ fontSize:13, color:"#0F172A", lineHeight:1.5 }}>{m.message}</div>
            <div style={{ fontSize:11, color:"#64748B", marginTop:5 }}>From {m.sender} · {m.created_at ? new Date(m.created_at).toLocaleString() : ""}</div>
          </div>
        ))}
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
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  useEffect(() => {
    fetchLeaderboard().then(r => {
      setRows(r)
      setTimeout(() => setRevealed(true), 50)
      if (r.length > 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2000)
      }
    }).catch(e => setLoadError(e.message || String(e))).finally(()=>setLoading(false))
  }, [])

  if (loading) return <Spinner/>

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)
  const myIndex = myId ? rows.findIndex(p => p.id === myId) : -1
  const medalColors = ["#FBBF24", "#94A3B8", "#B45309"]
  const podiumHeights = [64, 46, 34]
  // Reveal order: 3rd, then 2nd, then 1st (rank index -> stagger delay)
  const revealDelay = { 1: 200, 2: 100, 3: 0 }

  const PodiumSpot = ({ p, rank }) => {
    if (!p) return <div style={{ flex:1 }} />
    const idx = rank - 1
    const isWinner = rank === 1
    return (
      <div style={{
        flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
        transition: `opacity 300ms ease-in-out ${revealDelay[rank]}ms, transform 300ms ease-in-out ${revealDelay[rank]}ms`,
      }}>
        <div style={{ position:"relative", marginBottom:8 }}>
          {isWinner && (
            <div style={{ position:"absolute", top:-14, right:-10, background:"linear-gradient(135deg,#FBBF24,#FBBF24)", color:"#FFFFFF", fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20, display:"flex", alignItems:"center", gap:3, boxShadow:"0 4px 10px rgba(212,160,23,0.4)", zIndex:2 }} title="Most Valuable Player">
              ⭐ MVP
            </div>
          )}
          <div style={{
            borderRadius:"50%",
            boxShadow: isWinner ? "0 0 30px rgba(251,191,36,0.18)" : "none",
          }}>
            <Av name={p.name} id={p.id} sz={rank===1?(isMobile?52:60):(isMobile?40:46)}/>
          </div>
          <div style={{ position:"absolute", bottom:-4, right:-4, width:20, height:20, borderRadius:"50%", background:medalColors[idx], color:"#FFFFFF", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #FFFFFF" }}>{rank}</div>
        </div>
        <div style={{ fontWeight:700, fontSize:rank===1?13:12, color:"#0F172A", textAlign:"center", fontFamily:"var(--font-head)", lineHeight:1.2, maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
        {p.role && p.role !== "player" && <div style={{ marginTop:3 }}><RoleBadge role={p.role} size="sm"/></div>}
        {p.city && <div style={{ fontSize:10, color:"#94A3B8", display:"flex", alignItems:"center", gap:2, marginTop:1 }}><MapPin size={10}/> {p.city}</div>}
        <div style={{ fontSize:11, color:"#475569", marginTop:2, fontWeight:700 }}>{p.matchesPlayed} matches</div>
        <div style={{
          width:"100%", maxWidth:84, height:podiumHeights[idx], marginTop:8, borderRadius:"10px 10px 0 0",
          background: isWinner ? `linear-gradient(180deg, ${medalColors[idx]}22, ${medalColors[idx]}44)` : `linear-gradient(180deg, ${medalColors[idx]}18, ${medalColors[idx]}30)`,
          border: isWinner ? `3px solid ${medalColors[idx]}` : `1.5px solid ${medalColors[idx]}`,
          borderTop: isWinner ? `4px solid #FBBF24` : undefined,
        }} />
      </div>
    )
  }

  const ConfettiPiece = ({ i }) => {
    const colors = ["#FBBF24", "#14532D", "#22C55E", "#FBBF24"]
    const left = Math.random() * 100
    const delay = Math.random() * 300
    const duration = 1200 + Math.random() * 500
    const rotate = Math.random() * 360
    const color = colors[i % colors.length]
    return (
      <div style={{
        position:"absolute", top:-10, left: left + "%", width:7, height:7,
        background:color, borderRadius: i % 2 === 0 ? "50%" : 2,
        animation: `confettiFall ${duration}ms ease-in ${delay}ms forwards`,
        transform: `rotate(${rotate}deg)`,
      }}/>
    )
  }

  return (
    <div style={{ position:"relative" }}>
      <style>{`
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(220px) rotate(280deg); }
        }
      `}</style>
      {showConfetti && (
        <div style={{ position:"absolute", top:0, left:0, right:0, height:240, overflow:"hidden", pointerEvents:"none", zIndex:5 }}>
          {Array.from({length:30}).map((_,i) => <ConfettiPiece key={i} i={i}/>)}
        </div>
      )}
      <h2 style={{ fontFamily:"var(--font-head)", color:"#0F172A", fontSize:isMobile?18:20, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}><Trophy size={isMobile?20:22} color="#B8860B"/> Leaderboard</h2>
      {loadError ? (
        <div style={{ color:"#EF4444", fontSize:13, textAlign:"center", padding:"30px 0", background:"rgba(239,68,68,0.06)", borderRadius:12, border:"1px solid rgba(239,68,68,0.25)" }}>⚠️ Couldn't load the leaderboard: {loadError}</div>
      ) : rows.length === 0 ? (
        <div style={{ color:"#475569", fontSize:13, textAlign:"center", padding:"30px 0" }}>No matches played yet.</div>
      ) : (
        <>
          {myIndex >= 0 && (
            <Card style={{ padding:"14px 16px", marginBottom:16, background:"rgba(21,70,200,0.05)", border:"1.5px solid rgba(21,70,200,0.2)" }}>
              <div style={{ fontSize:10, color:"#14532D", fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>Your Rank</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:10, marginTop:4 }}>
                <div style={{ fontSize:24, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>#{myIndex+1}</div>
                <div style={{ fontSize:13, color:"#14532D" }}>{rows[myIndex].matchesPlayed} matches played</div>
              </div>
            </Card>
          )}

          {top3.length > 0 && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:20, padding:"0 4px" }}>
              <PodiumSpot p={top3[1]} rank={2}/>
              <PodiumSpot p={top3[0]} rank={1}/>
              <PodiumSpot p={top3[2]} rank={3}/>
            </div>
          )}

          {rest.map((p, i) => {
            const rank = i + 4
            const isMe = p.id === myId
            return (
              <Card key={p.id} style={{ padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12, background:isMe?"rgba(21,70,200,0.05)":"#FFFFFF", border:isMe?"1.5px solid rgba(21,70,200,0.2)":"1.5px solid #E5E7EB", cursor:"pointer", transition:"transform 300ms, box-shadow 300ms, border-color 300ms" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(15,23,42,0.08)"; if(!isMe) e.currentTarget.style.borderColor="#14532D" }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; if(!isMe) e.currentTarget.style.borderColor="#E5E7EB" }}>
                <div style={{ width:26, textAlign:"center", fontSize:13, fontWeight:800, color:"#475569", fontFamily:"var(--font-head)" }}>{rank}</div>
                <Av name={p.name} id={p.id} sz={34}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>{p.name}</div>
                    {p.role && p.role !== "player" && <RoleBadge role={p.role} size="sm"/>}
                    {isMe && <span style={{ background:"#14532D", color:"#FFFFFF", fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:6 }}>YOU</span>}
                  </div>
                  {p.city && <div style={{ fontSize:11, color:"#94A3B8", display:"flex", alignItems:"center", gap:3, marginTop:1 }}><MapPin size={10}/> {p.city}</div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>{p.matchesPlayed}</div>
                  <div style={{ fontSize:10, color:"#94A3B8", textTransform:"uppercase", letterSpacing:0.5 }}>matches</div>
                </div>
              </Card>
            )
          })}
        </>
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

import { fetchMyConversations, fetchConversation, sendDirectMessage, markConversationRead, countUnreadDirectMessages, fetchMyOrganizers, fetchMyConfirmedPlayers, fetchPlayers, fetchAdminPlayerId } from "../db.js"

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
        <input value={birthDate} onChange={e => setBirthDate(e.target.value)} type="date" max={new Date().toISOString().split("T")[0]} style={{ ...iS, marginBottom:14 }}/>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          <div>
            <label style={lS}>Jersey Number</label>
            <input value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))} inputMode="numeric" placeholder="e.g. 7" style={iS}/>
          </div>
          <div>
            <label style={lS}>Jersey Size</label>
            <select value={jerseySize} onChange={e => setJerseySize(e.target.value)} style={iS}>
              <option value="">Select</option>
              {["S","M","L","XL","XXL"].map(s => <option key={s} value={s}>{s}</option>)}
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

