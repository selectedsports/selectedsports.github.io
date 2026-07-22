import { aColor, initials } from "../constants.js"
import { Swords, Users as UsersIcon, MapPin, MessageCircle, Inbox, Trophy, Lightbulb, CheckCircle2, CalendarPlus, ArrowLeft } from "lucide-react"
export function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#0B3D2E"/>
      <circle cx="24" cy="24" r="18" fill="#0F5C43"/>
      <g transform="rotate(-28 22 26)">
        <rect x="19.5" y="10" width="5" height="17" rx="2.5" fill="#E3B37A"/>
        <rect x="20.3" y="26" width="3.4" height="9" rx="1.6" fill="#3E2723"/>
      </g>
      <circle cx="32" cy="17" r="6.5" fill="#A6192E" stroke="#7A1122" strokeWidth="0.6"/>
      <path d="M32 11.2 Q34.3 17 32 22.8" stroke="#fff" strokeWidth="0.9" fill="none" opacity="0.85"/>
      <path d="M32 11.2 Q29.7 17 32 22.8" stroke="#fff" strokeWidth="0.9" fill="none" opacity="0.85"/>
    </svg>
  )
}
export function LogoFull({ size = 40 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <Logo size={size} />
      <div>
        <div style={{ color:"#fff", fontFamily:"var(--font-head)", fontWeight:800, fontSize:size*0.44, letterSpacing:"-0.5px", lineHeight:1.1 }}>Selected</div>
        <div style={{ color:"#1D9E75", fontFamily:"var(--font-head)", fontWeight:600, fontSize:size*0.27, letterSpacing:"2.5px", textTransform:"uppercase", lineHeight:1.1 }}>Sports</div>
      </div>
    </div>
  )
}
export function Av({ name, id, sz = 34 }) {
  return (
    <div style={{ width:sz, height:sz, borderRadius:"50%", background:aColor(id), display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*0.3, fontWeight:700, color:"#fff", flexShrink:0, letterSpacing:"-0.5px", fontFamily:"var(--font-head)" }}>
      {initials(name)}
    </div>
  )
}
const TAG_STYLES = {
  green:{ bg:"#DCEEDB", tx:"#1B5E3A" }, lime:{ bg:"#ecfccb", tx:"#3a5c0a" },
  yellow:{ bg:"#F5E6C8", tx:"#7A4F13" }, red:{ bg:"#F5DADD", tx:"#8B1E2E" },
  blue:{ bg:"#dbeafe", tx:"#1e3a8a" }, teal:{ bg:"#ccfbf1", tx:"#134e4a" },
  orange:{ bg:"#ffedd5", tx:"#9a3412" }, purple:{ bg:"#ede9fe", tx:"#4c1d95" },
  gray:{ bg:"#F0EAE0", tx:"#57534E" },
}
export function Tag({ children, col = "gray" }) {
  const c = TAG_STYLES[col] || TAG_STYLES.gray
  return <span style={{ background:c.bg, color:c.tx, borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:700, whiteSpace:"nowrap", display:"inline-block", fontFamily:"var(--font-head)" }}>{children}</span>
}
export function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style:sx = {} }) {
  const base = { border:"none", borderRadius:10, cursor:disabled?"not-allowed":"pointer", fontWeight:600, fontFamily:"var(--font-body)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, opacity:disabled?0.55:1 }
  const variants = {
    primary:{ background:"#0B3D2E", color:"#fff" },
    green:{ background:"#1D9E75", color:"#fff" },
    danger:{ background:"#F5DADD", color:"#8B1E2E", border:"1px solid #E3AEB4" },
    ghost:{ background:"#f3f4f6", color:"#374151" },
    wa:{ background:"#dcfce7", color:"#166534", border:"1px solid #86efac" },
    outline:{ background:"transparent", color:"#0B3D2E", border:"1.5px solid #0B3D2E" },
    dark:{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.18)" },
  }
  const sizes = { sm:{ padding:"5px 12px", fontSize:12 }, md:{ padding:"9px 18px", fontSize:13 }, lg:{ padding:"12px 24px", fontSize:14 } }
  return <button onClick={disabled?undefined:onClick} style={{ ...base, ...variants[variant], ...sizes[size], ...sx }}>{children}</button>
}
export function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #d1fae5", borderTopColor:"#1D9E75", animation:"spin 0.7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
export function Card({ children, style:sx = {}, onClick }) {
  return <div onClick={onClick} style={{ background:"#FFFEFA", borderRadius:16, border:"1.5px solid #EDE4D3", boxShadow:"0 1px 4px rgba(139,30,46,0.04)", ...sx }}>{children}</div>
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
    { icon: MapPin, label: "Venues", value: niceRound(stats.venues) },
  ]
  return (
    <div style={{ display: "flex", gap: isMobile ? 8 : 12, marginBottom: 16 }}>
      {items.map((it) => (
        <div key={it.label} style={{ flex: 1, background: "#fff", borderRadius: 14, border: "1.5px solid #e5e7eb", padding: isMobile ? "12px 8px" : "16px 12px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom: 4, color:"#0B3D2E" }}><it.icon size={isMobile ? 18 : 20}/></div>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#0B3D2E", fontFamily: "var(--font-head)", lineHeight: 1 }}>{it.value}</div>
          <div style={{ fontSize: isMobile ? 10 : 11, color: "#6b7280", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}

export function Bell({ count = 0, onClick }) {
  return (
    <button onClick={onClick} style={{ position:"relative", background:"transparent", border:"none", cursor:"pointer", padding:6, display:"flex", alignItems:"center" }}>
      <MessageCircle size={18}/>
      {count > 0 && (
        <span style={{ position:"absolute", top:0, right:0, background:"#A6192E", color:"#fff", fontSize:9, fontWeight:800, borderRadius:"50%", minWidth:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", lineHeight:1 }}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  )
}
export function MessageInbox({ messages, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFEFA", borderRadius:16, maxWidth:420, width:"100%", maxHeight:"80vh", overflowY:"auto", padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontWeight:800, fontSize:16, fontFamily:"var(--font-head)", color:"#0B3D2E", display:"flex", alignItems:"center", gap:8 }}><Inbox size={18}/> Messages</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af" }}>×</button>
        </div>
        {messages.length === 0 && <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"20px 0" }}>No messages yet.</div>}
        {messages.map(m => (
          <div key={m.id} style={{ padding:"12px 0", borderBottom:"1px solid #EDE4D3" }}>
            <div style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{m.message}</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginTop:5 }}>From {m.sender} · {m.created_at ? new Date(m.created_at).toLocaleString() : ""}</div>
          </div>
        ))}
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
  useEffect(() => {
    fetchLeaderboard().then(setRows).catch(e => setLoadError(e.message || String(e))).finally(()=>setLoading(false))
  }, [])

  if (loading) return <Spinner/>

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)
  const myIndex = myId ? rows.findIndex(p => p.id === myId) : -1
  const medalColors = ["#F5B942", "#B0B7C0", "#C97A3D"]
  const podiumHeights = [64, 46, 34]

  const PodiumSpot = ({ p, rank }) => {
    if (!p) return <div style={{ flex:1 }} />
    const idx = rank - 1
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end" }}>
        <div style={{ position:"relative", marginBottom:8 }}>
          <Av name={p.name} id={p.id} sz={rank===1?(isMobile?52:60):(isMobile?40:46)}/>
          <div style={{ position:"absolute", top:-4, right:-4, width:20, height:20, borderRadius:"50%", background:medalColors[idx], color:"#fff", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff" }}>{rank}</div>
        </div>
        <div style={{ fontWeight:800, fontSize:rank===1?13:12, color:"#0B3D2E", textAlign:"center", fontFamily:"var(--font-head)", lineHeight:1.2, maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
        {p.city && <div style={{ fontSize:10, color:"#9ca3af" }}>{p.city}</div>}
        <div style={{ fontSize:11, color:"#6b7280", marginTop:2, fontWeight:700 }}>{p.matchesPlayed} matches</div>
        <div style={{ width:"100%", maxWidth:84, height:podiumHeights[idx], background:`linear-gradient(180deg, ${medalColors[idx]}22, ${medalColors[idx]}44)`, borderRadius:"10px 10px 0 0", marginTop:8, border:`1.5px solid ${medalColors[idx]}` }} />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontFamily:"var(--font-head)", color:"#0B3D2E", fontSize:isMobile?18:20, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}><Trophy size={isMobile?20:22}/> Leaderboard</h2>
      {loadError ? (
        <div style={{ color:"#A6192E", fontSize:13, textAlign:"center", padding:"30px 0", background:"#F5DADD", borderRadius:12, border:"1px solid #E3AEB4" }}>⚠️ Couldn't load the leaderboard: {loadError}</div>
      ) : rows.length === 0 ? (
        <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"30px 0" }}>No matches played yet.</div>
      ) : (
        <>
          {myIndex >= 0 && (
            <Card style={{ padding:"14px 16px", marginBottom:16, background:"#f0fdf4", border:"1.5px solid #bbf7d0" }}>
              <div style={{ fontSize:10, color:"#065f46", fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>Your Rank</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:10, marginTop:4 }}>
                <div style={{ fontSize:24, fontWeight:900, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>#{myIndex+1}</div>
                <div style={{ fontSize:13, color:"#065f46" }}>{rows[myIndex].matchesPlayed} matches played</div>
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
              <Card key={p.id} style={{ padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12, background:isMe?"#f0fdf4":"#FFFEFA", border:isMe?"1.5px solid #6ee7b7":"1.5px solid #EDE4D3" }}>
                <div style={{ width:26, textAlign:"center", fontSize:13, fontWeight:800, color:"#9ca3af", fontFamily:"var(--font-head)" }}>{rank}</div>
                <Av name={p.name} id={p.id} sz={34}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#111827" }}>{p.name}</div>
                    {isMe && <span style={{ background:"#1D9E75", color:"#fff", fontSize:9, fontWeight:800, padding:"1px 6px", borderRadius:6 }}>YOU</span>}
                  </div>
                  {p.city && <div style={{ fontSize:11, color:"#9ca3af" }}>{p.city}</div>}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:800, fontSize:16, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>{p.matchesPlayed}</div>
                  <div style={{ fontSize:10, color:"#9ca3af", textTransform:"uppercase", letterSpacing:0.5 }}>matches</div>
                </div>
              </Card>
            )
          })}
        </>
      )}
    </div>
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
      <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:8, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><CalendarPlus size={17}/> Schedule Your Own Matches</div>
      <div style={{ fontSize:12, color:"#6b7280", marginBottom:12, lineHeight:1.5 }}>Scheduling matches is a Pro feature. Request access below — once approved by your admin, you'll be able to schedule your own matches for 60 days.</div>
      {status === "pending" ? (
        <>
          <div style={{ padding:"10px 12px", background:"#F5E6C8", borderRadius:10, color:"#7A4F13", fontSize:12, fontWeight:700, textAlign:"center", marginBottom:10 }}>⏳ Your request is pending admin approval</div>
          <button onClick={cancel} disabled={cancelling} style={{ width:"100%", padding:"9px", borderRadius:10, background:"transparent", border:"1.5px solid #e5e7eb", color:"#6b7280", fontSize:12, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-body)" }}>{cancelling ? "Cancelling..." : "Cancel Request"}</button>
        </>
      ) : (
        <button onClick={submit} disabled={sending} style={{ width:"100%", padding:"11px", borderRadius:10, background:"#0B3D2E", border:"none", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>{sending ? "Sending..." : status === "rejected" ? "Request Again" : (<><CalendarPlus size={15}/> Request to Schedule Matches</>)}</button>
      )}
    </Card>
  )
}

import { fetchMyConversations, fetchConversation, sendDirectMessage, markConversationRead, countUnreadDirectMessages, fetchMyOrganizers, fetchMyConfirmedPlayers, fetchPlayers } from "../db.js"

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
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:600, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFEFA", borderRadius:16, maxWidth:440, width:"100%", maxHeight:"82vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 18px", borderBottom:"1px solid #EDE4D3" }}>
          <div onClick={active ? ()=>setActive(null) : undefined} style={{ fontWeight:800, fontSize:16, fontFamily:"var(--font-head)", color:"#0B3D2E", cursor:active?"pointer":"default", display:"flex", alignItems:"center", gap:8 }}>
            {active ? (<><ArrowLeft size={16}/> {active.otherName}</>) : (<><MessageCircle size={18}/> Direct Messages</>)}
          </div>
          <button onClick={active ? ()=>setActive(null) : onClose} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af" }}>×</button>
        </div>

        {!active ? (
          <div style={{ overflowY:"auto", flex:1, padding:"12px 14px" }}>
            <button onClick={openNew} style={{ width:"100%", padding:"10px", borderRadius:10, background:"#0B3D2E", border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)", marginBottom:12 }}>+ New Message</button>
            {loading ? <div style={{ textAlign:"center", color:"#9ca3af", fontSize:13, padding:"20px 0" }}>Loading...</div> :
             convos.length === 0 ? <div style={{ textAlign:"center", color:"#9ca3af", fontSize:13, padding:"20px 0" }}>No conversations yet.</div> :
             convos.map(c => (
              <div key={c.otherId} onClick={()=>openThread(c.otherId, c.otherName)} style={{ padding:"10px 12px", borderRadius:10, border:"1px solid #EDE4D3", marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#111827" }}>{c.otherName}</div>
                  <div style={{ fontSize:11, color:"#9ca3af", maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.lastMessage}</div>
                </div>
                {c.unread > 0 && <span style={{ background:"#A6192E", color:"#fff", fontSize:10, fontWeight:800, borderRadius:"50%", minWidth:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{c.unread}</span>}
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
                    <div style={{ background:isMe?"#d1fae5":"#f3f4f6", borderRadius:isMe?"12px 12px 3px 12px":"12px 12px 12px 3px", padding:"9px 12px", fontSize:13, color:"#111827" }}>{m.message}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display:"flex", gap:8, padding:"12px 14px", borderTop:"1px solid #EDE4D3" }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && send()} placeholder="Type a message..." style={{ flex:1, padding:"10px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", fontFamily:"var(--font-body)" }}/>
              <button onClick={send} disabled={sending} style={{ padding:"10px 16px", borderRadius:9, background:"#1D9E75", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:600 }}>Send</button>
            </div>
          </>
        )}

        {showNew && (
          <div onClick={()=>setShowNew(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:700, padding:16 }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:14, maxWidth:340, width:"100%", maxHeight:"70vh", overflowY:"auto", padding:16 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:10, fontFamily:"var(--font-head)" }}>Message who?</div>
              {candidates.length === 0 ? <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"14px 0" }}>No one available to message yet.</div> :
               candidates.map(p => (
                <div key={p.id} onClick={()=>{ setShowNew(false); openThread(p.id, p.name) }} style={{ padding:"9px 10px", borderRadius:8, cursor:"pointer", fontSize:13, color:"#111827", borderBottom:"1px solid #f3f4f6" }}>{p.name}</div>
              ))}
            </div>
          </div>
        )}
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
      <button onClick={()=>setOpen(true)} style={{ position:"relative", width:"100%", padding:"11px", borderRadius:10, background:"#fff", border:"1.5px solid #EDE4D3", color:"#0B3D2E", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        <MessageCircle size={16}/> Direct Messages{count > 0 ? ` (${count})` : ""}
      </button>
      {open && <DirectMessagesPanel player={player} onClose={()=>{ setOpen(false); refresh() }} />}
    </>
  )
}
