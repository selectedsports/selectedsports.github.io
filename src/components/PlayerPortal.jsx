import { useState, useEffect, useRef } from "react"
import { LogoFull, Av, Tag, Card, Spinner , StatsBanner, Bell, MessageInbox, LeaderboardPage, ProRequestCard} from "./ui.jsx"
import { fetchMatchPlayers, fetchExpenses, fetchPayments, fetchChat, sendMessage, setPlayerStatus, fetchGrounds, fetchOrganizerUpi, confirmPlayerToMatch, subscribeToChat , updatePlayer, fetchContributions, fetchStats, fetchPlayerStats, fetchInboxMessages, countUnreadMessages, markMessagesRead, fetchPlayerGrounds} from "../db.js"
import { fmtDate, dayName } from "../constants.js"
import { supabase } from "../supabase.js"
import { CalendarPage } from "./AdminPortal.jsx"
import { useMobile } from "../hooks/useMobile.js"

// Generate an .ics calendar file for a match with two reminders (evening before + 2h before)
function pad2(n) { return String(n).padStart(2, "0") }
function parseMatchStart(m) {
  // m.date = "YYYY-MM-DD", m.time_slot = "8:00 AM - 10:00 AM" (take the start)
  const startPart = (m.time_slot || "").split("-")[0].trim() // "8:00 AM"
  let [time, ampm] = startPart.split(" ")
  let [hh, mm] = (time || "0:00").split(":").map(Number)
  if (/pm/i.test(ampm) && hh !== 12) hh += 12
  if (/am/i.test(ampm) && hh === 12) hh = 0
  const [y, mo, d] = m.date.split("-").map(Number)
  return new Date(y, mo - 1, d, hh || 0, mm || 0)
}
function parseMatchEnd(m) {
  const parts = (m.time_slot || "").split("-")
  if (parts.length < 2) { const s = parseMatchStart(m); return new Date(s.getTime() + 2 * 3600000) }
  const endPart = parts[1].trim()
  let [time, ampm] = endPart.split(" ")
  let [hh, mm] = (time || "0:00").split(":").map(Number)
  if (/pm/i.test(ampm) && hh !== 12) hh += 12
  if (/am/i.test(ampm) && hh === 12) hh = 0
  const [y, mo, d] = m.date.split("-").map(Number)
  return new Date(y, mo - 1, d, hh || 0, mm || 0)
}
function icsDate(dt) {
  return dt.getFullYear() + pad2(dt.getMonth() + 1) + pad2(dt.getDate()) + "T" + pad2(dt.getHours()) + pad2(dt.getMinutes()) + "00"
}
function makeICS(m) {
  const start = parseMatchStart(m)
  const end = parseMatchEnd(m)
  const uid = "match-" + m.id + "@selectedsports"
  // Reminder 1: evening before at 6 PM. Compute minutes before start.
  const eveningBefore = new Date(start); eveningBefore.setDate(eveningBefore.getDate() - 1); eveningBefore.setHours(18, 0, 0, 0)
  const minsEvening = Math.round((start - eveningBefore) / 60000)
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Selected Sports//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" + icsDate(new Date()),
    "DTSTART:" + icsDate(start),
    "DTEND:" + icsDate(end),
    "SUMMARY:🏏 " + (m.team || "Match"),
    "LOCATION:" + (m.ground || ""),
    "DESCRIPTION:Match confirmed via Selected Sports.",
    // Alarm 1: 2 hours before
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Match in 2 hours", "END:VALARM",
    // Alarm 2: evening before at 6 PM
    "BEGIN:VALARM", "TRIGGER:-PT" + minsEvening + "M", "ACTION:DISPLAY", "DESCRIPTION:Match tomorrow", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ]
  return lines.join("\r\n")
}
function downloadICS(m) {
  const ics = makeICS(m)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = (m.team || "match").replace(/[^a-z0-9]/gi, "_") + ".ics"
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function ppShare(expenses, confirmedCount) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  return confirmedCount > 0 ? Math.round(total / confirmedCount) : 0
}
export default function PlayerPortal({ player, matches, onLogout }) {
  const [myMatches, setMyMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState(null)
  const [detail, setDetail] = useState(null)
  const isMobile = useMobile()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showInbox, setShowInbox] = useState(false)
  const [inboxMsgs, setInboxMsgs] = useState([])
  useEffect(() => { countUnreadMessages(player.id).then(setUnreadCount).catch(()=>{}) }, [player.id])
  const openInbox = async () => {
    try {
      const msgs = await fetchInboxMessages(player.id)
      setInboxMsgs(msgs)
      setShowInbox(true)
      await markMessagesRead(player.id)
      setUnreadCount(0)
    } catch(e) { alert(e.message) }
  }
  const [showBanner, setShowBanner] = useState(true)
  const [stats, setStats] = useState(null)
  useEffect(() => { fetchPlayerStats(player.id).then(setStats).catch(()=>{}) }, [])
  const [tab, setTab] = useState("matches")
  const [contribTotal, setContribTotal] = useState(0)
  const [contribList, setContribList] = useState([])
  const [editing, setEditing] = useState(false)
  const [grounds, setGrounds] = useState([])
  useEffect(() => { fetchGrounds().then(setGrounds).catch(()=>{}) }, [])
  const [myGrounds, setMyGrounds] = useState([])
  useEffect(() => { fetchPlayerGrounds(player.id).then(setMyGrounds).catch(()=>{}) }, [player.id])
  const [pForm, setPForm] = useState({ name: player.name, phone: player.phone || "", pin: player.pin })
  const [pSaving, setPSaving] = useState(false)
  const capFn = (v) => v.replace(/[^a-zA-Z ]/g,"").replace(/\b\w/g, c=>c.toUpperCase())
  useEffect(() => {
    (async () => {
      try { const c = await fetchContributions(player.id); setContribList(c); setContribTotal(c.reduce((s,x)=>s+Number(x.amount),0)) } catch {}
    })()
  }, [player.id])
  const saveProfile = async () => {
    if (!pForm.name.trim()) { alert("Name required"); return }
    if (pForm.pin.length !== 4) { alert("PIN must be 4 digits"); return }
    setPSaving(true)
    try {
      await updatePlayer(player.id, pForm.name.trim(), pForm.phone.replace(/[^0-9]/g,"").slice(-10), pForm.pin, pForm.city.trim())
      alert("Profile updated! Please log out and log in again to see changes.")
      setEditing(false)
    } catch(e) { alert(e.message) }
    setPSaving(false)
  }
  useEffect(() => {
    ;(async () => {
      const results = []
      for (const m of matches) {
        try {
          const mps = await fetchMatchPlayers(m.id)
          const myRow = mps.find(mp => mp.player_id === player.id)
          if (myRow) results.push({ match: m, myStatus: myRow.status, matchPlayers: mps })
        } catch {}
      }
      setMyMatches(results)
      setLoading(false)
      // Browser notification for pending invites
      try {
        const pending = results.filter(r => r.myStatus === "pending")
        if (pending.length > 0 && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Selected Sports", { body: `You have ${pending.length} new match invite${pending.length>1?"s":""}! Tap to respond.`, icon: "/icon-192.svg" })
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(perm => {
              if (perm === "granted" && pending.length > 0) {
                new Notification("Selected Sports", { body: `You have ${pending.length} new match invite${pending.length>1?"s":""}!`, icon: "/icon-192.svg" })
              }
            })
          }
        }
      } catch {}
    })()
  }, [matches, player.id])
  const loadDetail = async (m) => {
    try {
      const [mps, exps, pays, chats, orgUpi] = await Promise.all([fetchMatchPlayers(m.id), fetchExpenses(m.id), fetchPayments(m.id), fetchChat(m.id), fetchOrganizerUpi(m)])
      setDetail({ match: m, matchPlayers: mps, expenses: exps, payments: pays, chat: chats, organizerUpi: orgUpi })
      setSelId(m.id)
    } catch (e) { alert("Error: " + e.message) }
  }
  if (loading) return <div style={{ minHeight:"100vh", background:"#FBF3E7", display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>
  if (selId && detail) return (
    <MatchDetailPlayer detail={detail} player={player} isMobile={isMobile}
      onBack={() => { setSelId(null); setDetail(null) }}
      onRespond={async (action) => { await confirmPlayerToMatch(detail.match.id, player.id, action); alert(action === "confirmed" ? "You're confirmed for this match! ✅" : "Marked as not available."); await loadDetail(detail.match) }}
    />
  )
  return (
    <div style={{ minHeight:"100vh", background:"#FBF3E7", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#0B3D2E", height:54,borderBottom:"3px dashed #A6192E", display:"flex", alignItems:"center", padding:"0 16px", gap:10 }}>
        <div onClick={()=>setTab("matches")} style={{ cursor:"pointer" }}><LogoFull size={28} /></div>
        <div style={{ flex:1 }} />
        <div onClick={()=>setTab("profile")} style={{ cursor:"pointer" }}><Av name={player.name} id={player.id} sz={28} /></div>
        <Bell count={unreadCount} onClick={openInbox} />
        {showInbox && <MessageInbox messages={inboxMsgs} onClose={()=>setShowInbox(false)} />}
        {!isMobile && <span style={{ color:"rgba(255,255,255,0.75)", fontSize:13 }}>{player.name}</span>}
        <button onClick={onLogout} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)" }}>Logout</button>
      </div>
      <div style={{ maxWidth:660, margin:"0 auto", padding:isMobile?"14px 12px":"22px 16px" }}>
        <StatsBanner stats={stats} isMobile={isMobile}/>
        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:16, background:"#fff", borderRadius:10, padding:4, border:"1.5px solid #e5e7eb" }}>
          {[["matches","My Matches"],["calendar","Calendar"],["leaderboard","Leaderboard"]].map(([k,v]) => (
            <button key={k} onClick={()=>setTab(k)} style={{ flex:1, padding:"9px", borderRadius:7, border:"none", background:tab===k?"#0B3D2E":"transparent", color:tab===k?"#fff":"#6b7280", fontSize:13, cursor:"pointer", fontWeight:tab===k?700:500 }}>{v}</button>
          ))}
        </div>

        {tab === "calendar" && (
          <CalendarPage matches={myMatches.map(r => r.match)} teams={[]} grounds={[]} onNavigate={(pg, id) => { const found = myMatches.find(r => r.match.id === id); if (found) loadDetail(found.match) }} isMobile={isMobile}/>
        )}
        {tab === "leaderboard" && <LeaderboardPage isMobile={isMobile} myId={player.id}/>}
        {tab === "profile" && (() => {
          const played = myMatches.filter(r => r.myStatus === "confirmed").length
          const declinedC = myMatches.filter(r => r.myStatus === "declined").length
          const confirmedC = played
          const fmtD = (d) => { try { return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) } catch { return d } }
          return (
            <div>
              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <div style={{ padding:"14px", background:"#f0fdf4", borderRadius:12, border:"1.5px solid #bbf7d0", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#065f46", fontFamily:"var(--font-head)" }}>{played}</div>
                  <div style={{ fontSize:11, color:"#065f46", fontWeight:600 }}>MATCHES PLAYED</div>
                </div>
                <div style={{ padding:"14px", background:"#F5E6C8", borderRadius:12, border:"1.5px solid #E3C888", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#7A4F13", fontFamily:"var(--font-head)" }}>{confirmedC}</div>
                  <div style={{ fontSize:11, color:"#7A4F13", fontWeight:600 }}>CONFIRMED</div>
                </div>
                <div style={{ padding:"14px", background:"#fff5f5", borderRadius:12, border:"1.5px solid #fecaca", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#991b1b", fontFamily:"var(--font-head)" }}>{declinedC}</div>
                  <div style={{ fontSize:11, color:"#991b1b", fontWeight:600 }}>DECLINED</div>
                </div>
                <div style={{ padding:"14px", background:"#fefce8", borderRadius:12, border:"1.5px solid #fde68a", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#78350f", fontFamily:"var(--font-head)" }}>₹{contribTotal}</div>
                  <div style={{ fontSize:11, color:"#78350f", fontWeight:600 }}>CONTRIBUTED</div>
                </div>
              </div>

              {/* Contribution history */}
              {contribList.length > 0 && (
                <Card style={{ padding:"14px 16px", marginBottom:16 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:10, fontFamily:"var(--font-head)" }}>💰 Payment History</div>
                  <div style={{ display:"grid", gap:6 }}>
                    {contribList.map(c => (
                      <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
                        <div>
                          <div style={{ fontSize:13, color:"#374151", fontWeight:600 }}>{c.note || "—"}</div>
                          <div style={{ fontSize:11, color:"#9ca3af" }}>{fmtD(c.date)}</div>
                        </div>
                        <div style={{ fontWeight:800, fontSize:15, color:"#065f46" }}>₹{c.amount}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Profile edit */}
              <Card style={{ padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>👤 My Profile</div>
                  {!editing && <button onClick={()=>{ setPForm({ name:player.name, phone:player.phone||"", pin:player.pin, city:player.city||"" }); setEditing(true) }} style={{ padding:"6px 14px", borderRadius:8, background:"#F5E6C8", border:"1px solid #E3C888", color:"#7A4F13", fontSize:12, cursor:"pointer", fontWeight:700 }}>Edit</button>}
                </div>
                {editing ? (
                  <div style={{ display:"grid", gap:12 }}>
                    <div>
                      <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:5, fontWeight:600 }}>Name</label>
                      <input value={pForm.name} onChange={e=>setPForm({...pForm, name:capFn(e.target.value)})} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:5, fontWeight:600 }}>Phone</label>
                      <input value={pForm.phone} onChange={e=>setPForm({...pForm, phone:e.target.value.replace(/[^0-9]/g,"").slice(0,10)})} type="tel" style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:5, fontWeight:600 }}>City</label>
                      <input value={pForm.city} onChange={e=>setPForm({...pForm, city:e.target.value})} placeholder="e.g. Thane" style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:5, fontWeight:600 }}>PIN (4 digits)</label>
                      <input value={pForm.pin} onChange={e=>setPForm({...pForm, pin:e.target.value.replace(/[^0-9]/g,"").slice(0,4)})} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:18, outline:"none", boxSizing:"border-box", letterSpacing:6, textAlign:"center", WebkitTextSecurity:"disc" }}/>
                    </div>
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={()=>setEditing(false)} style={{ flex:1, padding:"11px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:14, cursor:"pointer" }}>Cancel</button>
                      <button onClick={saveProfile} disabled={pSaving} style={{ flex:2, padding:"11px", borderRadius:9, background:"#0B3D2E", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:800 }}>{pSaving?"Saving...":"Save"}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"grid", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <Av name={player.name} id={player.id} sz={48}/>
                      <div>
                        <div style={{ fontWeight:800, fontSize:16, color:"#0B3D2E" }}>{player.name}</div>
                        <div style={{ fontSize:13, color:"#6b7280" }}>📱 {player.phone || "No phone"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

                <ProRequestCard player={player} />

                <Card style={{ padding:"16px", marginTop:16 }}>
                  <DirectMessagesButton player={player} />
                </Card>

                <Card style={{ padding:"16px", marginTop:16 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:12, fontFamily:"var(--font-head)" }}>📍 Grounds &amp; Venues</div>
                  {myGrounds.length === 0 ? (
                    <div style={{ fontSize:13, color:"#9ca3af" }}>No venues played yet.</div>
                  ) : (
                    <div style={{ display:"grid", gap:8 }}>
                      {myGrounds.map(g => (
                        <div key={g.id} style={{ padding:"10px 12px", background:"#FBF3E7", borderRadius:10, border:"1px solid #EDE4D3" }}>
                          <div style={{ fontWeight:700, fontSize:13, color:"#0B3D2E" }}>{g.name}</div>
                          {g.location && <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>📍 {g.location}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
            </div>
          )
        })()}

        {tab === "matches" && <h2 style={{ margin:"0 0 4px", fontSize:isMobile?17:20, fontWeight:800, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>My Matches</h2>}
        {(() => {
          const pending = myMatches.filter(r => r.myStatus === "pending")
          if (pending.length === 0 || !showBanner) return null
          return (
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"linear-gradient(135deg,#1D9E75,#0F6E56)", borderRadius:14, marginBottom:16, boxShadow:"0 4px 14px rgba(29,158,117,0.3)" }}>
              <div style={{ fontSize:24 }}>🔔</div>
              <div style={{ flex:1 }}>
                <div style={{ color:"#fff", fontWeight:800, fontSize:15, fontFamily:"var(--font-head)" }}>{pending.length} new match invite{pending.length>1?"s":""}!</div>
                <div style={{ color:"rgba(255,255,255,0.85)", fontSize:12, marginTop:2 }}>Tap a match below to confirm your availability</div>
              </div>
              <button onClick={()=>setShowBanner(false)} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", fontSize:18, width:30, height:30, borderRadius:8, cursor:"pointer", flexShrink:0 }}>×</button>
            </div>
          )
        })()}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#d1fae5", borderRadius:10, border:"1px solid #6ee7b7", marginTop:12, marginBottom:18 }}>
          <span style={{ fontSize:14 }}>🔒</span>
          <span style={{ fontSize:12, color:"#065f46", fontWeight:500 }}>You only see matches you have been personally invited to.</span>
        </div>
        {myMatches.length === 0 ? (
          <Card style={{ padding:"40px 24px", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🏏</div>
            <div style={{ fontWeight:700, fontSize:16, color:"#0B3D2E", marginBottom:6, fontFamily:"var(--font-head)" }}>No matches yet</div>
            <div style={{ color:"#6b7280", fontSize:13 }}>When an organizer invites you to a match, it'll show up here.</div>
          </Card>
        ) : myMatches.map(({ match: m, myStatus, matchPlayers }) => {
          return (
            <Card key={m.id} style={{ padding:"16px", marginBottom:12, cursor:"pointer" }} onClick={() => loadDetail(m)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:800, color:"#0B3D2E", fontSize:isMobile?14:15, marginBottom:4, fontFamily:"var(--font-head)" }}>{m.team}</div>
                  <div style={{ color:"#6b7280", fontSize:12, lineHeight:1.8 }}>📅 {fmtDate(m.date)}<br/>⏰ {m.time_slot}<br/>📍 {m.ground}</div>
                  {(() => {
                    const joined = (matchPlayers || []).filter(mp => mp.status === "confirmed").length
                    const cap = m.max_players || 0
                    const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                    const left = Math.max(0, cap - joined)
                    return (
                      <div style={{ marginTop:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"#065f46" }}>👥 {joined}/{cap} joined</span>
                          <span style={{ fontSize:12, fontWeight:600, color:left>0?"#1D9E75":"#991b1b" }}>{left>0?left+" spots left":"Full"}</span>
                        </div>
                        <div style={{ height:8, background:"#e5e7eb", borderRadius:6, overflow:"hidden" }}>
                          <div style={{ width:pct+"%", height:"100%", background:pct>=100?"#1D9E75":"linear-gradient(90deg,#6ee7b7,#1D9E75)", borderRadius:6 }}/>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end", flexShrink:0 }}>
                  <Tag col={m.status === "upcoming" ? "blue" : m.status === "completed" ? "green" : "red"}>{m.status}</Tag>
                  <Tag col={myStatus === "confirmed" ? "green" : myStatus === "waitlist" ? "yellow" : myStatus === "declined" ? "red" : "orange"}>
                    {myStatus === "confirmed" ? "✅ Confirmed" : myStatus === "waitlist" ? "⏳ Waitlist" : myStatus === "declined" ? "❌ Declined" : "⚡ Respond"}
                  </Tag>
                </div>
              </div>
              {m.status === "upcoming" && myStatus === "pending" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }} onClick={e => e.stopPropagation()}>
                  <button onClick={async e => { e.stopPropagation(); await setPlayerStatus(m.id, player.id, "confirmed"); window.location.reload() }} style={{ padding:"12px", borderRadius:10, background:"#1D9E75", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)" }}>✅ Available</button>
                  <button onClick={async e => { e.stopPropagation(); await setPlayerStatus(m.id, player.id, "declined"); window.location.reload() }} style={{ padding:"12px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", color:"#991b1b", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)" }}>❌ Can't Make It</button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
export function MatchDetailPlayer({ detail, player, onBack, onRespond, isMobile }) {
  const { match: m, matchPlayers, expenses, payments, chat, organizerUpi } = detail
  const [msgs, setMsgs] = useState(chat)
  const [input, setInput] = useState("")
  const chatRef = useRef(null)
  useEffect(() => { chatRef.current?.scrollIntoView({ behavior:"smooth" }) }, [msgs])
  const myRow = matchPlayers.find(mp => mp.player_id === player.id)
  const myStatus = myRow?.status || "pending"
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const pp = ppShare(expenses, confirmed.length)
  const myPaid = payments.find(p => p.player_id === player.id)?.paid
  useEffect(() => {
    const ch = subscribeToChat(m.id, msg => setMsgs(prev => [...prev, msg]))
    return () => { supabase.removeChannel(ch) }
  }, [m.id])
  const doSend = async () => {
    if (!input.trim()) return
    try { const msg = await sendMessage(m.id, player.name, input.trim()); setMsgs(prev => [...prev, msg]); setInput("") } catch {}
  }
  return (
    <div style={{ minHeight:"100vh", background:"#FBF3E7", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#0B3D2E", height:54,borderBottom:"3px dashed #A6192E", display:"flex", alignItems:"center", padding:"0 16px", gap:12 }}>
        <div onClick={()=>setTab("matches")} style={{ cursor:"pointer" }}><LogoFull size={28} /></div>
        <div style={{ flex:1 }} />
        <button onClick={onBack} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)" }}>← Back</button>
      </div>
      <div style={{ maxWidth:660, margin:"0 auto", padding:isMobile?"14px 12px":"22px 16px" }}>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#0B3D2E,#0F5C43)", padding:isMobile?"18px 16px":"22px 24px" }}>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginBottom:3 }}>{fmtDate(m.date)}</div>
            <h2 style={{ color:"#fff", fontSize:isMobile?18:20, fontWeight:800, margin:"0 0 4px", fontFamily:"var(--font-head)" }}>{m.team}</h2>
            <div style={{ color:"rgba(255,255,255,0.65)", fontSize:12 }}>⏰ {m.time_slot} · 📍 {m.ground}</div>
            <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
              <Tag col={m.status === "upcoming" ? "blue" : "green"}>{m.status}</Tag>
              <Tag col={myStatus === "confirmed" ? "green" : myStatus === "waitlist" ? "yellow" : myStatus === "declined" ? "red" : "orange"}>
                {myStatus === "confirmed" ? "✅ You are in!" : myStatus === "waitlist" ? "⏳ On waitlist" : myStatus === "declined" ? "❌ Declined" : "⚡ Awaiting response"}
              </Tag>
            </div>
          </div>
          {m.status === "upcoming" && myStatus === "pending" && (
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #f3f4f6", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={() => onRespond("confirmed")} style={{ padding:"13px", borderRadius:10, background:"#1D9E75", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>✅ Available</button>
              <button onClick={() => onRespond("declined")} style={{ padding:"13px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", color:"#991b1b", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)" }}>❌ Can't Make It</button>
            </div>
          )}
          {/* Ground directions */}
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #f3f4f6" }}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.ground)}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", background:"#F5E6C8", borderRadius:10, border:"1px solid #E3C888", textDecoration:"none" }}>
              <span style={{ fontSize:20 }}>📍</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#7A4F13" }}>{m.ground}</div>
                <div style={{ fontSize:11, color:"#3b82f6" }}>Tap for directions in Google Maps</div>
              </div>
              <span style={{ color:"#93c5fd", fontSize:16 }}>↗</span>
            </a>
          </div>

          {myStatus === "confirmed" && (
            <div style={{ padding:"0 16px 16px" }}>
              <button onClick={() => downloadICS(m)} style={{ width:"100%", padding:"13px", borderRadius:10, background:"#F5E6C8", border:"1.5px solid #E3C888", color:"#7A4F13", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                📅 Add to Calendar
              </button>
              <div style={{ fontSize:11, color:"#9ca3af", textAlign:"center", marginTop:6 }}>Get reminders the evening before & 2 hours before</div>
            </div>
          )}
          {/* Who's coming */}
          <div style={{ padding:"16px", borderBottom:"1px solid #f3f4f6" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>👥 Who's Coming ({confirmed.length})</div>
              {confirmed.length > 0 && (
                <button onClick={() => {
                  const header = "🏏 " + m.team + "\n📅 " + fmtDate(m.date) + "\n⏰ " + m.time_slot + "\n📍 " + m.ground + "\n\n"
                  const txt = header + "✅ Confirmed Players (" + confirmed.length + "):\n" + confirmed.map((mp,i) => (i+1) + ". " + (mp.players?.name || "Player")).join("\n")
                  navigator.clipboard.writeText(txt); alert("Copied confirmed list!")
                }} style={{ background:"none", border:"1px solid #d1fae5", color:"#065f46", fontSize:11, fontWeight:700, borderRadius:7, padding:"5px 9px", cursor:"pointer" }}>📋 Copy</button>
              )}
            </div>
            {confirmed.length === 0 ? (
              <div style={{ fontSize:13, color:"#9ca3af", padding:"8px 0" }}>No one has confirmed yet. Be the first!</div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {confirmed.map(mp => (
                  <div key={mp.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px 6px 6px", background:"#f0fdf4", borderRadius:20, border:"1px solid #bbf7d0" }}>
                    <Av name={mp.players?.name || "?"} id={mp.player_id} sz={24}/>
                    <span style={{ fontSize:12, fontWeight:600, color:"#065f46" }}>{mp.players?.name || "Player"}{mp.player_id === player.id ? " (You)" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(() => {
            const waitlisted = matchPlayers.filter(mp => mp.status === "waitlist")
            const declined = matchPlayers.filter(mp => mp.status === "declined")
            return (
              <>
                {waitlisted.length > 0 && (
                  <div style={{ padding:"16px", borderBottom:"1px solid #f3f4f6" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#92400e", fontFamily:"var(--font-head)" }}>⏳ Waitlist ({waitlisted.length})</div>
                      <button onClick={() => {
                        const header = "🏏 " + m.team + "\n📅 " + fmtDate(m.date) + "\n⏰ " + m.time_slot + "\n📍 " + m.ground + "\n\n"
                        const txt = header + "⏳ Waitlist (" + waitlisted.length + "):\n" + waitlisted.map((mp,i) => (i+1) + ". " + (mp.players?.name || "Player")).join("\n")
                        navigator.clipboard.writeText(txt); alert("Copied waitlist!")
                      }} style={{ background:"none", border:"1px solid #fde68a", color:"#92400e", fontSize:11, fontWeight:700, borderRadius:7, padding:"5px 9px", cursor:"pointer" }}>📋 Copy</button>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {waitlisted.map(mp => (
                        <div key={mp.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px 6px 6px", background:"#fffbeb", borderRadius:20, border:"1px solid #fde68a" }}>
                          <Av name={mp.players?.name || "?"} id={mp.player_id} sz={24}/>
                          <span style={{ fontSize:12, fontWeight:600, color:"#92400e" }}>{mp.players?.name || "Player"}{mp.player_id === player.id ? " (You)" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {declined.length > 0 && (
                  <div style={{ padding:"16px", borderBottom:"1px solid #f3f4f6" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#991b1b", fontFamily:"var(--font-head)" }}>❌ Declined ({declined.length})</div>
                      <button onClick={() => {
                        const header = "🏏 " + m.team + "\n📅 " + fmtDate(m.date) + "\n⏰ " + m.time_slot + "\n📍 " + m.ground + "\n\n"
                        const txt = header + "❌ Declined (" + declined.length + "):\n" + declined.map((mp,i) => (i+1) + ". " + (mp.players?.name || "Player")).join("\n")
                        navigator.clipboard.writeText(txt); alert("Copied declined list!")
                      }} style={{ background:"none", border:"1px solid #fecaca", color:"#991b1b", fontSize:11, fontWeight:700, borderRadius:7, padding:"5px 9px", cursor:"pointer" }}>📋 Copy</button>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {declined.map(mp => (
                        <div key={mp.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px 6px 6px", background:"#fff5f5", borderRadius:20, border:"1px solid #fecaca" }}>
                          <Av name={mp.players?.name || "?"} id={mp.player_id} sz={24}/>
                          <span style={{ fontSize:12, fontWeight:600, color:"#991b1b" }}>{mp.players?.name || "Player"}{mp.player_id === player.id ? " (You)" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          {expenses.length > 0 && (
            <div style={{ padding:"16px", borderBottom:"1px solid #f3f4f6" }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:12, fontFamily:"var(--font-head)" }}>💰 Expense Breakdown</div>
              <div style={{ background:"#f9fafb", borderRadius:10, padding:"12px 14px" }}>
                {expenses.map((e, i) => (
                  <div key={e.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i < expenses.length-1 ? "1px solid #e5e7eb" : "none", fontSize:13 }}>
                    <span style={{ color:"#374151" }}>{e.label}</span>
                    <span style={{ color:"#6b7280" }}>₹{e.amount} / {confirmed.length} = <strong style={{ color:"#0B3D2E" }}>₹{Math.round(e.amount/(confirmed.length||1))}</strong></span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:"2px solid #e5e7eb" }}>
                  <span style={{ fontWeight:800, fontSize:14 }}>Your total</span>
                  <span style={{ fontWeight:800, fontSize:17, color:myPaid ? "#1D9E75" : "#c2410c" }}>₹{pp} {myPaid ? "✔ Paid" : "(pending)"}</span>
                </div>
                {!myPaid && pp > 0 && organizerUpi && (
                  <a href={"upi://pay?pa=" + encodeURIComponent(organizerUpi) + "&pn=" + encodeURIComponent("Selected Sports") + "&am=" + pp + "&cu=INR&tn=" + encodeURIComponent("Match payment - " + (m.team || ""))} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:12, padding:"13px", borderRadius:10, background:"#A6192E", color:"#fff", fontSize:14, fontWeight:800, fontFamily:"var(--font-head)", textDecoration:"none" }}>
                    💳 Pay ₹{pp} via UPI
                  </a>
                )}
                {!myPaid && pp > 0 && !organizerUpi && (
                  <div style={{ marginTop:10, fontSize:12, color:"#9ca3af", textAlign:"center" }}>Organizer hasn't added a UPI ID yet — pay them directly.</div>
                )}
              </div>
            </div>
          )}
          <div style={{ padding:"16px" }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:12, fontFamily:"var(--font-head)" }}>💬 Match Chat</div>
            <div style={{ height:isMobile?220:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
              {msgs.length === 0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No messages yet.</p>}
              {msgs.map((msg, i) => {
                const isMe = msg.sender === player.name
                return (
                  <div key={i} style={{ display:"flex", flexDirection:isMe ? "row-reverse" : "row", gap:8, alignItems:"flex-end" }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:msg.sender === "Admin" ? "#1D9E75" : "#185FA5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff", flexShrink:0 }}>
                      {msg.sender === "Admin" ? "AD" : msg.sender.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ maxWidth:"75%" }}>
                      <div style={{ fontSize:10, color:"#9ca3af", marginBottom:2, textAlign:isMe ? "right" : "left" }}>{msg.sender}</div>
                      <div style={{ background:isMe ? "#d1fae5" : "#f3f4f6", borderRadius:isMe ? "12px 12px 3px 12px" : "12px 12px 12px 3px", padding:"9px 12px", fontSize:13, color:"#111827" }}>{msg.message}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatRef}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && doSend()} placeholder="Type a message..." style={{ flex:1, padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", fontFamily:"var(--font-body)" }}/>
              <button onClick={doSend} style={{ padding:"11px 16px", borderRadius:9, background:"#1D9E75", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:600, fontFamily:"var(--font-body)" }}>Send</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}