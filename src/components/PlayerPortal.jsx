import { useState, useEffect, useRef } from "react"
import { MapPin, User as UserIcon, Trophy, Calendar, Clock, Users, Wallet, Lock, CheckCircle2, XCircle, Hourglass, Zap, Clipboard, CalendarPlus, LogOut, Phone, Bell as BellIcon, CreditCard, Home, ChevronRight } from "lucide-react"
import { LogoFull, Av, Tag, Card, Spinner , StatsBanner, Bell, MessageInbox, LeaderboardPage, ProRequestCard, RoleBadge} from "./ui.jsx"
import { fetchMatchPlayers, fetchExpenses, fetchPayments, fetchChat, sendMessage, setPlayerStatus, fetchGrounds, fetchOrganizerUpi, confirmPlayerToMatch, subscribeToChat , updatePlayer, fetchContributions, fetchStats, fetchPlayerStats, fetchInboxMessages, countUnreadMessages, markMessagesRead, fetchPlayerGrounds, updatePlayerRole, uploadProfilePhoto} from "../db.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import { fmtDate, dayName, matchTitle } from "../constants.js"
import { supabase } from "../supabase.js"
// CALENDAR_NAV_REMOVED
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
    "SUMMARY:🏏 " + (matchTitle(m) || "Match"),
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
  const [tab, setTab] = useState("dashboard")
  const [matchFilter, setMatchFilter] = useState("upcoming")
  const [menuOpen, setMenuOpen] = useState(false)
  const [contribTotal, setContribTotal] = useState(0)
  const [contribList, setContribList] = useState([])
  const [editing, setEditing] = useState(false)
  const [grounds, setGrounds] = useState([])
  useEffect(() => { fetchGrounds().then(setGrounds).catch(()=>{}) }, [])
  const [myGrounds, setMyGrounds] = useState([])
  useEffect(() => { fetchPlayerGrounds(player.id).then(setMyGrounds).catch(()=>{}) }, [player.id])
  const [pForm, setPForm] = useState({ firstName: "", lastName: "", phone: player.phone || "", pin: player.pin, playingRole: player.playing_role || "", city: player.city || "", birthDate: player.birth_date || "", jerseyNumber: player.jersey_number || "", jerseySize: player.jersey_size || "", photoFile: null, photoPreview: player.profile_image_url || "" })
  const [pSaving, setPSaving] = useState(false)
  const capFn = (v) => v.replace(/[^a-zA-Z ]/g,"").replace(/\b\w/g, c=>c.toUpperCase())
  const nameParts = (player.name || "").trim().split(/\s+/)
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  useEffect(() => {
    (async () => {
      try { const c = await fetchContributions(player.id); setContribList(c); setContribTotal(c.reduce((s,x)=>s+Number(x.amount),0)) } catch {}
    })()
  }, [player.id])
  const saveProfile = async () => {
    if (!pForm.firstName.trim()) { alert("First name required"); return }
    if (!pForm.lastName.trim()) { alert("Last name required"); return }
    if (pForm.pin.length !== 4) { alert("PIN must be 4 digits"); return }
    if (!pForm.city.trim()) { alert("City is required"); return }
    if (!pForm.birthDate) { alert("Date of birth is required"); return }
    if (!pForm.jerseyNumber.trim()) { alert("Jersey number is required"); return }
    if (!pForm.jerseySize) { alert("Jersey size is required"); return }
    if (!pForm.photoFile && !pForm.photoPreview) { alert("Profile photo is required"); return }
    setPSaving(true)
    try {
      let photoUrl = pForm.photoPreview
      if (pForm.photoFile) photoUrl = await uploadProfilePhoto(pForm.photoFile, pForm.phone)
      const fullName = `${pForm.firstName.trim()} ${pForm.lastName.trim()}`
      await updatePlayer(player.id, fullName, pForm.phone.replace(/[^0-9]/g,"").slice(-10), pForm.pin, pForm.city.trim(), {
        birthDate: pForm.birthDate, profileImageUrl: photoUrl, jerseyNumber: pForm.jerseyNumber, jerseySize: pForm.jerseySize
      })
      if (pForm.playingRole) await updatePlayerRole(player.id, pForm.playingRole)
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
  if (loading) return <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>
  if (selId && detail) return (
    <MatchDetailPlayer detail={detail} player={player} isMobile={isMobile}
      onBack={() => { setSelId(null); setDetail(null) }}
      onRespond={async (action) => { await confirmPlayerToMatch(detail.match.id, player.id, action); alert(action === "confirmed" ? "You're confirmed for this match! ✅" : "Marked as not available."); await loadDetail(detail.match) }}
    />
  )
  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)", paddingBottom:70 }}>
      {/* PLAYER_HEADER_V1 */}
      <div style={{ background:"#FFFFFF", height:56, borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", padding:"0 16px", gap:12, position:"sticky", top:0, zIndex:200 }}>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:"transparent", border:"none", color:"#0F172A", fontSize:20, cursor:"pointer", padding:6 }}>☰</button>
        <div onClick={()=>setTab("dashboard")} style={{ flex:1, textAlign:"center", cursor:"pointer", fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Selected Sports</div>
        <div onClick={()=>setTab("profile")} style={{ cursor:"pointer" }}><Av name={player.name} id={player.id} sz={28}/></div>
      </div>

      {menuOpen && (
        <div onClick={()=>setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:299 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", width:260, height:"100%", padding:"20px 14px", boxShadow:"4px 0 24px rgba(0,0,0,0.15)" }}>
            <div onClick={()=>{ setMenuOpen(false); setTab("profile") }} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 8px", borderRadius:10, cursor:"pointer", marginBottom:14, borderBottom:"1px solid #F1F5F9", paddingBottom:16 }}>
              <Av name={player.name} id={player.id} sz={36}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, color:"#0F172A", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{player.name}</div>
                <div style={{ fontSize:11, color:"#94A3B8" }}>View Profile</div>
              </div>
            </div>
            <button onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:11, width:"100%", padding:"11px 10px", borderRadius:10, border:"none", background:"transparent", color:"#EF4444", fontSize:14, fontWeight:600, cursor:"pointer", textAlign:"left", fontFamily:"var(--font-body)" }}>
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth:660, margin:"0 auto", padding:isMobile?"14px 12px":"22px 16px" }}>
        {tab === "dashboard" && <StatsBanner stats={stats} isMobile={isMobile}/>}

                {tab === "dashboard" && (() => {
          const hour = new Date().getHours()
          const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"
          const firstNameD = (player.name || "Player").split(" ")[0]
          const todayStr = new Date().toISOString().split("T")[0]
          const pending = myMatches.filter(r => r.myStatus === "pending")
          const confirmedD = myMatches.filter(r => r.myStatus === "confirmed")
          const waitlistD = myMatches.filter(r => r.myStatus === "waitlist")
          const declinedD = myMatches.filter(r => r.myStatus === "declined")
          const upcomingD = myMatches.filter(r => r.match.status !== "completed")
          const todaysMatch = myMatches.find(r => r.match.date === todayStr && r.match.status !== "cancelled")

          return (
            <div>
              {/* Greeting header */}
              <div style={{ marginBottom:20 }}>
                <div style={{ color:"#0F172A", fontSize:isMobile?20:26, fontWeight:900, fontFamily:"var(--font-head)" }}>{greeting}, {firstNameD}</div>
                <div style={{ fontSize:13, color:"#64748B", marginTop:4, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Calendar size={13}/> {dayName(todayStr)}</span>
                  <span>·</span>
                  {pending.length > 0 ? (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><BellIcon size={13}/> {pending.length} invite{pending.length>1?"s":""} awaiting your response</span>
                  ) : (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Hourglass size={13}/> {upcomingD.length} upcoming match{upcomingD.length!==1?"es":""}</span>
                  )}
                </div>
              </div>

              {/* Pending invites - quick respond */}
              {pending.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><BellIcon size={16} color="#166534"/> Needs Your Response</div>
                  <div style={{ display:"grid", gap:10 }}>
                    {pending.map(({ match: m }) => (
                      <Card key={m.id} style={{ padding:"14px 16px" }}>
                        <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", marginBottom:4, display:"flex", alignItems:"center", gap:6 }}>{matchTitle(m)}{m.visibility === "public" && <span style={{ background:"rgba(37,99,235,0.1)", color:"#2563EB", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:999, textTransform:"uppercase" }}>Public</span>}</div>
                        <div style={{ color:"#64748B", fontSize:12, display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                          <span><Calendar size={12} style={{verticalAlign:"-2px"}}/> {fmtDate(m.date)}</span>
                          <span><Clock size={12} style={{verticalAlign:"-2px"}}/> {m.time_slot}</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                          <button onClick={async () => { await setPlayerStatus(m.id, player.id, "confirmed"); window.location.reload() }} style={{ padding:"11px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><CheckCircle2 size={15}/> Available</button>
                          <button onClick={async () => { await setPlayerStatus(m.id, player.id, "declined"); window.location.reload() }} style={{ padding:"11px", borderRadius:10, background:"rgba(231,76,60,0.12)", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><XCircle size={15}/> Can't Make It</button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's match */}
              {todaysMatch && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)" }}>Today's Match</div>
                  <Card style={{ padding:"14px 16px", cursor:"pointer", border:"1.5px solid #166534", background:"rgba(34,197,94,0.06)" }} onClick={() => loadDetail(todaysMatch.match)}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1 }}>
                        <Av name={matchTitle(todaysMatch.match)} id={todaysMatch.match.id} sz={38}/>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{matchTitle(todaysMatch.match)}</div>
                          <div style={{ fontSize:12, color:"#64748B", marginTop:3, display:"flex", alignItems:"center", gap:5 }}><Clock size={12}/> {todaysMatch.match.time_slot} · <MapPin size={12}/> {todaysMatch.match.ground}</div>
                        </div>
                      </div>
                      {(() => {
                        const joined = (todaysMatch.matchPlayers || []).filter(mp => mp.status === "confirmed").length
                        const cap = todaysMatch.match.max_players || 0
                        return (
                          <div style={{ textAlign:"center", flexShrink:0 }}>
                            <div style={{ fontWeight:700, fontSize:14, color:"#166534", fontFamily:"var(--font-head)" }}>{joined}/{cap || "—"}</div>
                            <div style={{ fontSize:10, color:"#94A3B8" }}>Joined</div>
                          </div>
                        )
                      })()}
                      <span style={{ background:"#166534", color:"#FFFFFF", borderRadius:999, padding:"5px 12px", fontSize:11, fontWeight:700, flexShrink:0 }}>Today</span>
                      <ChevronRight size={16} color="#94A3B8" style={{ flexShrink:0 }}/>
                    </div>
                  </Card>
                </div>
              )}

              {/* Stat cards */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)" }}>Your Status</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {[
                    { label:"Confirmed", sub:"Matches you're in", v:confirmedD.length, c:"#166534" },
                    { label:"Waitlist",  sub:"On the fence", v:waitlistD.length,  c:"#B8860B" },
                    { label:"Pending",   sub:"Awaiting reply", v:pending.length,    c:"#166534" },
                    { label:"Declined",  sub:"Not attending", v:declinedD.length,  c:"#EF4444" },
                  ].map((s,i) => (
                    <div key={i} style={{ textAlign:"center", padding:"12px 4px", background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:12 }}>
                      <div style={{ fontSize:18, fontWeight:800, color:s.c, fontFamily:"var(--font-head)" }}>{s.v}</div>
                      <div style={{ fontSize:9, color:"#0F172A", marginTop:2, fontWeight:700, textTransform:"uppercase", letterSpacing:0.3 }}>{s.label}</div>
                      <div style={{ fontSize:8, color:"#94A3B8", marginTop:1 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)" }}>Quick Actions</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  {[
                    { label:"My Matches",  icon:Users,    action:()=>setTab("matches") },
                    { label:"Leaderboard", icon:Trophy,   action:()=>setTab("leaderboard") },
                    { label:"My Profile",  icon:UserIcon, action:()=>setTab("profile") },
                  ].map((a,i) => (
                    <button key={i} onClick={a.action} style={{ padding:"16px 8px", borderRadius:14, background:"#FFFFFF", border:"1.5px solid #E2E8F0", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center" }}>
                      <div style={{ width:34, height:34, borderRadius:10, background:"rgba(34,197,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}><a.icon size={17} color="#166534"/></div>
                      <div style={{ fontSize:11, fontWeight:700, color:"#0F172A", fontFamily:"var(--font-head)" }}>{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {myMatches.length === 0 && (
                <Card style={{ padding:"40px 24px", textAlign:"center" }}>
                  <div style={{ marginBottom:12, display:"flex", justifyContent:"center" }}><Calendar size={40} color="#F1F5F9"/></div>
                  <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", marginBottom:6, fontFamily:"var(--font-head)" }}>No matches yet</div>
                  <div style={{ color:"#64748B", fontSize:13 }}>When an organizer invites you to a match, it'll show up here.</div>
                </Card>
              )}
            </div>
          )
        })()}

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
                <div style={{ padding:"14px", background:"rgba(34,197,94,0.08)", borderRadius:12, border:"1.5px solid rgba(34,197,94,0.3)", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#166534", fontFamily:"var(--font-head)" }}>{played}</div>
                  <div style={{ fontSize:11, color:"#166534", fontWeight:600 }}>MATCHES PLAYED</div>
                </div>
                <div style={{ padding:"14px", background:"rgba(246,196,83,0.12)", borderRadius:12, border:"1.5px solid rgba(246,196,83,0.3)", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#B8860B", fontFamily:"var(--font-head)" }}>{confirmedC}</div>
                  <div style={{ fontSize:11, color:"#B8860B", fontWeight:600 }}>CONFIRMED</div>
                </div>
                <div style={{ padding:"14px", background:"rgba(231,76,60,0.08)", borderRadius:12, border:"1.5px solid rgba(231,76,60,0.15)", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#EF4444", fontFamily:"var(--font-head)" }}>{declinedC}</div>
                  <div style={{ fontSize:11, color:"#EF4444", fontWeight:600 }}>DECLINED</div>
                </div>
                <div style={{ padding:"14px", background:"rgba(245,158,11,0.08)", borderRadius:12, border:"1.5px solid rgba(246,196,83,0.15)", textAlign:"center" }}>
                  <div style={{ fontSize:24, fontWeight:900, color:"#B8860B", fontFamily:"var(--font-head)" }}>₹{contribTotal}</div>
                  <div style={{ fontSize:11, color:"#B8860B", fontWeight:600 }}>CONTRIBUTED</div>
                </div>
              </div>

              {/* Contribution history */}
              {contribList.length > 0 && (
                <Card style={{ padding:"14px 16px", marginBottom:16 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", marginBottom:10, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Wallet size={16}/> Payment History</div>
                  <div style={{ display:"grid", gap:6 }}>
                    {contribList.map(c => (
                      <div key={c.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #F8FAF8" }}>
                        <div>
                          <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{c.note || "—"}</div>
                          <div style={{ fontSize:11, color:"#94A3B8" }}>{fmtD(c.date)}</div>
                        </div>
                        <div style={{ fontWeight:800, fontSize:15, color:"#166534" }}>₹{c.amount}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Profile edit */}
              <Card style={{ padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><UserIcon size={16}/> My Profile</div>
                  {!editing && <button onClick={()=>{ setPForm({ firstName, lastName, phone:player.phone||"", pin:player.pin, playingRole:player.playing_role||"", city:player.city||"", birthDate:player.birth_date||"", jerseyNumber:player.jersey_number||"", jerseySize:player.jersey_size||"", photoFile:null, photoPreview:player.profile_image_url||"" }); setEditing(true) }} style={{ padding:"6px 14px", borderRadius:8, background:"rgba(246,196,83,0.12)", border:"1px solid rgba(246,196,83,0.3)", color:"#B8860B", fontSize:12, cursor:"pointer", fontWeight:700 }}>Edit</button>}
                </div>
                {editing ? (
                  <div style={{ display:"grid", gap:12 }}>
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
                      <PhotoUploadField photoPreview={pForm.photoPreview} onPhotoSaved={(file, dataUrl) => setPForm({...pForm, photoFile:file, photoPreview:dataUrl})}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div>
                        <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>First Name</label>
                        <input value={pForm.firstName} onChange={e=>setPForm({...pForm, firstName:capFn(e.target.value)})} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                      </div>
                      <div>
                        <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>Last Name</label>
                        <input value={pForm.lastName} onChange={e=>setPForm({...pForm, lastName:capFn(e.target.value)})} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>Phone</label>
                      <input value={pForm.phone} onChange={e=>setPForm({...pForm, phone:e.target.value.replace(/[^0-9]/g,"").slice(0,10)})} type="tel" style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>City</label>
                      <input value={pForm.city} onChange={e=>setPForm({...pForm, city:e.target.value})} placeholder="e.g. Thane" style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>Date of Birth</label>
                      <input value={pForm.birthDate} onChange={e=>setPForm({...pForm, birthDate:e.target.value})} type="date" max={new Date().toISOString().split("T")[0]} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div>
                        <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>Jersey Number</label>
                        <input value={pForm.jerseyNumber} onChange={e=>setPForm({...pForm, jerseyNumber:e.target.value.replace(/[^0-9]/g,"").slice(0,3)})} inputMode="numeric" placeholder="e.g. 7" style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                      </div>
                      <div>
                        <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>Jersey Size</label>
                        <select value={pForm.jerseySize} onChange={e=>setPForm({...pForm, jerseySize:e.target.value})} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"var(--font-body)" }}>
                          <option value="">Select</option>
                          {["S","M","L","XL","XXL"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>Playing Role</label>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        {["Batsman","Bowler","All-rounder","Wicket-keeper"].map(r => (
                          <button key={r} type="button" onClick={()=>setPForm({...pForm, playingRole:r})} style={{ padding:"10px 6px", borderRadius:9, border:pForm.playingRole===r?"2px solid #166534":"1.5px solid #E2E8F0", background:pForm.playingRole===r?"rgba(22,101,52,0.08)":"#FFFFFF", color:pForm.playingRole===r?"#166534":"#0F172A", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>{r}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#64748B", display:"block", marginBottom:5, fontWeight:600 }}>PIN (4 digits)</label>
                      <input value={pForm.pin} onChange={e=>setPForm({...pForm, pin:e.target.value.replace(/[^0-9]/g,"").slice(0,4)})} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:18, outline:"none", boxSizing:"border-box", letterSpacing:6, textAlign:"center", WebkitTextSecurity:"disc" }}/>
                    </div>
                    <div style={{ display:"flex", gap:10 }}>
                      <button onClick={()=>setEditing(false)} style={{ flex:1, padding:"11px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
                      <button onClick={saveProfile} disabled={pSaving} style={{ flex:2, padding:"11px", borderRadius:9, background:"#F8FAF8", border:"none", color:"#0F172A", fontSize:14, cursor:"pointer", fontWeight:800 }}>{pSaving?"Saving...":"Save"}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"grid", gap:10 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:4 }}>
                      {player.profile_image_url ? (
                        <img src={player.profile_image_url} alt={player.name} style={{ width:100, height:100, borderRadius:"50%", objectFit:"cover", border:"3px solid #166534", marginBottom:10 }}/>
                      ) : (
                        <Av name={player.name} id={player.id} sz={100}/>
                      )}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
                        <div style={{ fontWeight:800, fontSize:17, color:"#0F172A" }}>{player.name}</div>
                        {player.role && player.role !== "player" && <RoleBadge role={player.role} size="sm"/>}
                      </div>
                      <div style={{ fontSize:13, color:"#64748B", display:"flex", alignItems:"center", gap:5, marginTop:3 }}><Phone size={12}/> {player.phone || "No phone"}</div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:4 }}>
                      <div style={{ padding:"8px 10px", background:"#F8FAF8", borderRadius:9 }}>
                        <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>CITY</div>
                        <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{player.city || "—"}</div>
                      </div>
                      <div style={{ padding:"8px 10px", background:"#F8FAF8", borderRadius:9 }}>
                        <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>DATE OF BIRTH</div>
                        <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{player.birth_date ? fmtDate(player.birth_date) : "—"}</div>
                      </div>
                      <div style={{ padding:"8px 10px", background:"#F8FAF8", borderRadius:9 }}>
                        <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>JERSEY NUMBER</div>
                        <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{player.jersey_number || "—"}</div>
                      </div>
                      <div style={{ padding:"8px 10px", background:"#F8FAF8", borderRadius:9 }}>
                        <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>JERSEY SIZE</div>
                        <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{player.jersey_size || "—"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

                <ProRequestCard player={player} />


                <Card style={{ padding:"16px", marginTop:16 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)" }}><MapPin size={16} style={{verticalAlign:"-3px"}}/> Grounds &amp; Venues</div>
                  {myGrounds.length === 0 ? (
                    <div style={{ fontSize:13, color:"#94A3B8" }}>No venues played yet.</div>
                  ) : (
                    <div style={{ display:"grid", gap:8 }}>
                      {myGrounds.map(g => (
                        <div key={g.id} style={{ padding:"10px 12px", background:"#F8FAF8", borderRadius:10, border:"1px solid #E2E8F0" }}>
                          <div style={{ fontWeight:700, fontSize:13, color:"#0F172A" }}>{g.name}</div>
                          {g.location && <div style={{ fontSize:11, color:"#64748B", marginTop:2, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/> {g.location}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
            </div>
          )
        })()}

        {tab === "matches" && (
          <>
          <h2 style={{ margin:"0 0 4px", fontSize:isMobile?17:20, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>My Matches</h2>
          {(() => {
          const pending = myMatches.filter(r => r.myStatus === "pending")
          if (pending.length === 0 || !showBanner) return null
          return (
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"linear-gradient(135deg,#166534,#0F766E)", borderRadius:14, marginBottom:16, boxShadow:"0 4px 14px rgba(29,158,117,0.3)" }}>
              <BellIcon size={24} color="#0F172A"/>
              <div style={{ flex:1 }}>
                <div style={{ color:"#0F172A", fontWeight:800, fontSize:15, fontFamily:"var(--font-head)" }}>{pending.length} new match invite{pending.length>1?"s":""}!</div>
                <div style={{ color:"#0F172A", fontSize:12, marginTop:2 }}>Tap a match below to confirm your availability</div>
              </div>
              <button onClick={()=>setShowBanner(false)} style={{ background:"#E2E8F0", border:"none", color:"#0F172A", fontSize:18, width:30, height:30, borderRadius:8, cursor:"pointer", flexShrink:0 }}>×</button>
            </div>
          )
        })()}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"rgba(34,197,94,0.15)", borderRadius:10, border:"1px solid rgba(34,197,94,0.15)", marginTop:12, marginBottom:18 }}>
          <Lock size={14}/>
          <span style={{ fontSize:12, color:"#166534", fontWeight:500 }}>You see matches you've been personally invited to, plus any match marked Public.</span>
        </div>
        {myMatches.length === 0 ? (
          <Card style={{ padding:"40px 24px", textAlign:"center" }}>
            <div style={{ marginBottom:12, display:"flex", justifyContent:"center" }}><Calendar size={40} color="#F1F5F9"/></div>
            <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", marginBottom:6, fontFamily:"var(--font-head)" }}>No matches yet</div>
            <div style={{ color:"#64748B", fontSize:13 }}>When an organizer invites you to a match, it'll show up here.</div>
          </Card>
        ) : (() => {
          const upcomingCount = myMatches.filter(r => r.match.status !== "completed").length
          const completedCount = myMatches.filter(r => r.match.status === "completed").length
          const filtered = myMatches.filter(r => matchFilter === "upcoming" ? r.match.status !== "completed" : r.match.status === "completed")
          return (
          <>
            <div style={{ display:"flex", gap:6, marginBottom:16 }}>
              {["upcoming","completed"].map(f => (
                <button key={f} onClick={()=>setMatchFilter(f)} style={{ padding:"8px 16px", borderRadius:10, border:matchFilter===f?"1.5px solid #166534":"1.5px solid #E2E8F0", background:matchFilter===f?"#166534":"#FFFFFF", color:matchFilter===f?"#FFFFFF":"#64748B", fontSize:12, cursor:"pointer", fontWeight:matchFilter===f?700:500, fontFamily:"var(--font-body)", textTransform:"capitalize" }}>{f} ({f==="upcoming"?upcomingCount:completedCount})</button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <Card style={{ padding:"32px 16px", textAlign:"center" }}>
                <div style={{ fontSize:13, color:"#64748B" }}>No {matchFilter} matches.</div>
              </Card>
            ) : filtered.map(({ match: m, myStatus, matchPlayers }) => {
          return (
            <Card key={m.id} style={{ padding:"16px", marginBottom:12, cursor:"pointer" }} onClick={() => loadDetail(m)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:800, color:"#0F172A", fontSize:isMobile?14:15, marginBottom:4, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:6 }}>{matchTitle(m)}{m.visibility === "public" && <span style={{ background:"rgba(37,99,235,0.1)", color:"#2563EB", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:999, textTransform:"uppercase" }}>Public</span>}</div>
                  <div style={{ color:"#64748B", fontSize:12, lineHeight:1.8, display:"flex", flexDirection:"column", gap:2 }}><span><Calendar size={12} style={{verticalAlign:"-2px"}}/> {fmtDate(m.date)}</span><span><Clock size={12} style={{verticalAlign:"-2px"}}/> {m.time_slot}</span><span><MapPin size={12} style={{verticalAlign:"-2px"}}/> {m.ground}</span></div>
                  {(() => {
                    const joined = (matchPlayers || []).filter(mp => mp.status === "confirmed").length
                    const cap = m.max_players || 0
                    const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                    const left = Math.max(0, cap - joined)
                    return (
                      <div style={{ marginTop:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"#166534" }}><Users size={12} style={{verticalAlign:"-2px"}}/> {joined}/{cap} joined</span>
                          <span style={{ fontSize:12, fontWeight:600, color:left>0?"#166534":"#EF4444" }}>{left>0?left+" spots left":"Full"}</span>
                        </div>
                        <div style={{ height:8, background:"#E2E8F0", borderRadius:6, overflow:"hidden" }}>
                          <div style={{ width:pct+"%", height:"100%", background:pct>=100?"#166534":"linear-gradient(90deg,rgba(34,197,94,0.15),#166534)", borderRadius:6 }}/>
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end", flexShrink:0 }}>
                  <span style={{ background:m.status==="upcoming"?"#166534":m.status==="completed"?"#166534":"#EF4444", color:"#0F172A", borderRadius:7, padding:"4px 11px", fontSize:11, fontWeight:700, textTransform:"capitalize", display:"inline-block" }}>{m.status}</span>
                  <span style={{ background:myStatus==="confirmed"?"#166534":myStatus==="waitlist"?"#B8860B":myStatus==="declined"?"#EF4444":"rgba(216,176,91,0.15)", color:"#0F172A", borderRadius:7, padding:"4px 11px", fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:5 }}>
                    {myStatus === "confirmed" ? (<><CheckCircle2 size={13}/> Confirmed</>) : myStatus === "waitlist" ? (<><Hourglass size={13}/> Waitlist</>) : myStatus === "declined" ? (<><XCircle size={13}/> Declined</>) : (<><Zap size={13}/> Respond</>)}
                  </span>
                </div>
              </div>
              {m.status === "upcoming" && myStatus === "pending" && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }} onClick={e => e.stopPropagation()}>
                  <button onClick={async e => { e.stopPropagation(); await setPlayerStatus(m.id, player.id, "confirmed"); window.location.reload() }} style={{ padding:"12px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><CheckCircle2 size={16}/> Available</button>
                  <button onClick={async e => { e.stopPropagation(); await setPlayerStatus(m.id, player.id, "declined"); window.location.reload() }} style={{ padding:"12px", borderRadius:10, background:"rgba(231,76,60,0.12)", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><XCircle size={16}/> Can't Make It</button>
                </div>
              )}
            </Card>
          )
        })}
          </>
          )
        })()}
          </>
        )}
      </div>

      {/* PLAYER_BOTTOM_NAV_BAR_V1 */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#FFFFFF", borderTop:"1px solid #E2E8F0", display:"flex", zIndex:200, boxShadow:"0 -4px 16px rgba(15,23,42,0.06)" }}>
        {[["dashboard","Home",Home],["matches","Matches",Users],["leaderboard","Leaderboard",Trophy],["profile","Profile",UserIcon]].map(([k,v,Icon]) => (
          <button key={k} onClick={()=>setTab(k)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"9px 4px 8px", border:"none", background:"transparent", cursor:"pointer", color:tab===k?"#166534":"#94A3B8" }}>
            <Icon size={20}/>
            <span style={{ fontSize:10, fontWeight:tab===k?700:500 }}>{v}</span>
          </button>
        ))}
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
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#F8FAF8", height:54,borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", padding:"0 16px", gap:12 }}>
        <div onClick={()=>setTab("matches")} style={{ cursor:"pointer" }}><img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:42, width:"auto", display:"block" }}/></div>
        <div style={{ flex:1 }} />
        <button onClick={onBack} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #E2E8F0", background:"transparent", color:"#94A3B8", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)" }}>← Back</button>
      </div>
      <div style={{ maxWidth:660, margin:"0 auto", padding:isMobile?"14px 12px":"22px 16px" }}>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,rgba(22,101,52,0.08),rgba(22,101,52,0.02))", padding:isMobile?"18px 16px":"22px 24px" }}>
            <div style={{ color:"#94A3B8", fontSize:11, marginBottom:3 }}>{fmtDate(m.date)}</div>
            <h2 style={{ color:"#0F172A", fontSize:isMobile?18:20, fontWeight:800, margin:"0 0 4px", fontFamily:"var(--font-head)" }}>{matchTitle(m)}</h2>
            <div style={{ color:"#64748B", fontSize:12, display:"flex", alignItems:"center", gap:5 }}><Clock size={12}/> {m.time_slot} · <MapPin size={12}/> {m.ground}</div>
            <div style={{ display:"flex", gap:8, marginTop:10, flexWrap:"wrap" }}>
              <span style={{ background:m.status==="upcoming"?"#166534":"#64748B", color:"#FFFFFF", borderRadius:999, padding:"4px 12px", fontSize:11, fontWeight:700, textTransform:"capitalize", display:"inline-block" }}>{m.status}</span>
              <span style={{ background:myStatus==="confirmed"?"#166534":myStatus==="waitlist"?"#B8860B":myStatus==="declined"?"#EF4444":"#94A3B8", color:"#FFFFFF", borderRadius:999, padding:"5px 12px", fontSize:12, fontWeight:700, display:"inline-flex", alignItems:"center", gap:6 }}>
                {myStatus === "confirmed" ? (<><CheckCircle2 size={14}/> You are in!</>) : myStatus === "waitlist" ? (<><Hourglass size={14}/> On waitlist</>) : myStatus === "declined" ? (<><XCircle size={14}/> Declined</>) : (<><Zap size={14}/> Awaiting response</>)}
              </span>
            </div>
          </div>
          {m.status === "upcoming" && myStatus === "pending" && (
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #F8FAF8", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={() => onRespond("confirmed")} style={{ padding:"13px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><CheckCircle2 size={16}/> Available</button>
              <button onClick={() => onRespond("declined")} style={{ padding:"13px", borderRadius:10, background:"rgba(231,76,60,0.12)", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><XCircle size={16}/> Can't Make It</button>
            </div>
          )}
          {/* Ground directions */}
          <div style={{ padding:"14px 16px", borderBottom:"1px solid #F8FAF8" }}>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.ground)}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", background:"rgba(246,196,83,0.12)", borderRadius:10, border:"1px solid rgba(246,196,83,0.3)", textDecoration:"none" }}>
              <MapPin size={20}/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#B8860B" }}>{m.ground}</div>
                <div style={{ fontSize:11, color:"#166534" }}>Tap for directions in Google Maps</div>
              </div>
              <span style={{ color:"#166534", fontSize:16 }}>↗</span>
            </a>
          </div>

          {myStatus === "confirmed" && (
            <div style={{ padding:"0 16px 16px" }}>
              <button onClick={() => downloadICS(m)} style={{ width:"100%", padding:"13px", borderRadius:10, background:"rgba(246,196,83,0.12)", border:"1.5px solid rgba(246,196,83,0.3)", color:"#B8860B", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <CalendarPlus size={15} style={{verticalAlign:"-3px", marginRight:6}}/> Add to Calendar
              </button>
              <div style={{ fontSize:11, color:"#94A3B8", textAlign:"center", marginTop:6 }}>Get reminders the evening before & 2 hours before</div>
            </div>
          )}
          {/* Squad Summary */}
          {(() => {
            const waitlistedCount = matchPlayers.filter(mp => mp.status === "waitlist").length
            const declinedCount = matchPlayers.filter(mp => mp.status === "declined").length
            const stats = [
              { label:"Invited", v:matchPlayers.length, c:"#64748B" },
              { label:"Confirmed", v:confirmed.length, c:"#166534" },
              { label:"Pending", v:matchPlayers.length - confirmed.length - waitlistedCount - declinedCount, c:"#B8860B" },
              { label:"Declined", v:declinedCount, c:"#EF4444" },
            ]
            return (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, padding:"16px", borderBottom:"1px solid #F8FAF8" }}>
                {stats.map((s,i) => (
                  <div key={i} style={{ textAlign:"center", padding:"10px 4px", background:"#F8FAF8", borderRadius:10 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:s.c, fontFamily:"var(--font-head)" }}>{s.v}</div>
                    <div style={{ fontSize:9, color:"#94A3B8", marginTop:2, textTransform:"uppercase", letterSpacing:0.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )
          })()}
          {/* Who's coming */}
          <div style={{ padding:"16px", borderBottom:"1px solid #F8FAF8" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Users size={16}/> Who's Coming ({confirmed.length})</div>
              {confirmed.length > 0 && (
                <button onClick={() => {
                  const header = "🏏 " + matchTitle(m) + "\n📅 " + fmtDate(m.date) + "\n⏰ " + m.time_slot + "\n📍 " + m.ground + "\n\n"
                  const txt = header + "✅ Confirmed Players (" + confirmed.length + "):\n" + confirmed.map((mp,i) => (i+1) + ". " + (mp.players?.name || "Player")).join("\n")
                  navigator.clipboard.writeText(txt); alert("Copied confirmed list!")
                }} style={{ background:"none", border:"1px solid rgba(34,197,94,0.15)", color:"#166534", fontSize:11, fontWeight:700, borderRadius:7, padding:"5px 9px", cursor:"pointer" }}><Clipboard size={12} style={{verticalAlign:"-2px"}}/> Copy</button>
              )}
            </div>
            {confirmed.length === 0 ? (
              <div style={{ fontSize:13, color:"#94A3B8", padding:"8px 0" }}>No one has confirmed yet. Be the first!</div>
            ) : (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {confirmed.map(mp => (
                  <div key={mp.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px 6px 6px", background:"rgba(34,197,94,0.08)", borderRadius:20, border:"1px solid rgba(34,197,94,0.3)" }}>
                    <Av name={mp.players?.name || "?"} id={mp.player_id} sz={24}/>
                    <span style={{ fontSize:12, fontWeight:600, color:"#166534" }}>{mp.players?.name || "Player"}{mp.player_id === player.id ? " (You)" : ""}</span>
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
                  <div style={{ padding:"16px", borderBottom:"1px solid #F8FAF8" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#B8860B", fontFamily:"var(--font-head)" }}>⏳ Waitlist ({waitlisted.length})</div>
                      <button onClick={() => {
                        const header = "🏏 " + matchTitle(m) + "\n📅 " + fmtDate(m.date) + "\n⏰ " + m.time_slot + "\n📍 " + m.ground + "\n\n"
                        const txt = header + "⏳ Waitlist (" + waitlisted.length + "):\n" + waitlisted.map((mp,i) => (i+1) + ". " + (mp.players?.name || "Player")).join("\n")
                        navigator.clipboard.writeText(txt); alert("Copied waitlist!")
                      }} style={{ background:"none", border:"1px solid rgba(246,196,83,0.15)", color:"#B8860B", fontSize:11, fontWeight:700, borderRadius:7, padding:"5px 9px", cursor:"pointer" }}><Clipboard size={12} style={{verticalAlign:"-2px"}}/> Copy</button>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {waitlisted.map(mp => (
                        <div key={mp.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px 6px 6px", background:"rgba(251,191,36,0.08)", borderRadius:20, border:"1px solid rgba(246,196,83,0.15)" }}>
                          <Av name={mp.players?.name || "?"} id={mp.player_id} sz={24}/>
                          <span style={{ fontSize:12, fontWeight:600, color:"#B8860B" }}>{mp.players?.name || "Player"}{mp.player_id === player.id ? " (You)" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {declined.length > 0 && (
                  <div style={{ padding:"16px", borderBottom:"1px solid #F8FAF8" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#EF4444", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><XCircle size={16}/> Declined ({declined.length})</div>
                      <button onClick={() => {
                        const header = "🏏 " + matchTitle(m) + "\n📅 " + fmtDate(m.date) + "\n⏰ " + m.time_slot + "\n📍 " + m.ground + "\n\n"
                        const txt = header + "❌ Declined (" + declined.length + "):\n" + declined.map((mp,i) => (i+1) + ". " + (mp.players?.name || "Player")).join("\n")
                        navigator.clipboard.writeText(txt); alert("Copied declined list!")
                      }} style={{ background:"none", border:"1px solid rgba(231,76,60,0.15)", color:"#EF4444", fontSize:11, fontWeight:700, borderRadius:7, padding:"5px 9px", cursor:"pointer" }}><Clipboard size={12} style={{verticalAlign:"-2px"}}/> Copy</button>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                      {declined.map(mp => (
                        <div key={mp.id} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 12px 6px 6px", background:"rgba(231,76,60,0.08)", borderRadius:20, border:"1px solid rgba(231,76,60,0.15)" }}>
                          <Av name={mp.players?.name || "?"} id={mp.player_id} sz={24}/>
                          <span style={{ fontSize:12, fontWeight:600, color:"#EF4444" }}>{mp.players?.name || "Player"}{mp.player_id === player.id ? " (You)" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )
          })()}

          {expenses.length > 0 && (
            <div style={{ padding:"16px", borderBottom:"1px solid #F8FAF8" }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Wallet size={16}/> Expense Breakdown</div>
              <div style={{ background:"#F8FAF8", borderRadius:10, padding:"12px 14px" }}>
                {expenses.map((e, i) => (
                  <div key={e.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i < expenses.length-1 ? "1px solid #E2E8F0" : "none", fontSize:13 }}>
                    <span style={{ color:"#0F172A" }}>{e.label}</span>
                    <span style={{ color:"#64748B" }}>₹{e.amount} / {confirmed.length} = <strong style={{ color:"#0F172A" }}>₹{Math.round(e.amount/(confirmed.length||1))}</strong></span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:"2px solid #E2E8F0" }}>
                  <span style={{ fontWeight:800, fontSize:14 }}>Your total</span>
                  <span style={{ fontWeight:800, fontSize:17, color:myPaid ? "#166534" : "#C2410C", display:"inline-flex", alignItems:"center", gap:5 }}>₹{pp} {myPaid ? (<><CheckCircle2 size={15}/> Paid</>) : "(pending)"}</span>
                </div>
                {!myPaid && pp > 0 && organizerUpi && (
                  <a href={"upi://pay?pa=" + encodeURIComponent(organizerUpi) + "&pn=" + encodeURIComponent("Selected Sports") + "&am=" + pp + "&cu=INR&tn=" + encodeURIComponent("Match payment - " + (matchTitle(m) || ""))} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:12, padding:"13px", borderRadius:10, background:"#EF4444", color:"#0F172A", fontSize:14, fontWeight:800, fontFamily:"var(--font-head)", textDecoration:"none" }}>
                    <CreditCard size={16}/> Pay ₹{pp} via UPI
                  </a>
                )}
                {!myPaid && pp > 0 && !organizerUpi && (
                  <div style={{ marginTop:10, fontSize:12, color:"#94A3B8", textAlign:"center" }}>Organizer hasn't added a UPI ID yet — pay them directly.</div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}