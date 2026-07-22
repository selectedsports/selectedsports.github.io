import { useState, useEffect, useRef } from "react"
import { LogoFull, Av, Tag, Btn, Card, Spinner, LeaderboardPage, DirectMessagesButton } from "./ui.jsx"
import { fetchPlayers, fetchGrounds, fetchMatches, fetchTeams, fetchSettings, confirmPlayerToMatch, fetchMyInvites, fetchMatchCounts, fetchPendingPlayers, approvePlayer, rejectPlayer, createMatch, updateMatchStatus, deleteMatch, toggleMatchLink, updateMatchMaxPlayers, fetchMatchPlayers, notifyPlayer, removePlayerFromMatch, setPlayerStatus, fetchPublicResponses, approvePublicResponse, rejectPublicResponse, fetchExpenses, addExpense, deleteExpense, fetchPayments, togglePayment, addContribution, fetchContributions, deleteContribution, contributionExists, fetchChat, sendMessage, subscribeToChat, addGround, updateGround, deleteGround, addTeam, updateTeam, deleteTeam, uploadTeamLogo, fetchSentMessages, sendAdminMessage, fetchPendingProRequests, approveProRequest, rejectProRequest } from "../db.js"
import { fmtDate, dayName, PAL } from "../constants.js"
import { waInvite, waInviteWithLink, waPublicLink, waPayment, waReminder, waSquadFull } from "./whatsapp.js"
import { supabase } from "../supabase.js"
import { MatchDetailPlayer } from "./PlayerPortal.jsx"
import { useMobile } from "../hooks/useMobile.js"

export const BASE_URL = window.location.hostname==="localhost"?"http://localhost:5173":"https://selectedsports.github.io"
const copy = text => { navigator.clipboard?.writeText(text); alert("Copied!") }

// ── Helpers ───────────────────────────────────────────────────────────────────
const HOURS = Array.from({length:24},(_,i)=>i)
const MINS  = ["00","15","30","45"]
const fmt12 = (h,m) => { const ap=h<12?"AM":"PM"; const hh=h===0?12:h>12?h-12:h; return hh+":"+(m||"00")+" "+ap }
const timeSlotStr = (sh,sm,eh,em) => fmt12(sh,sm)+" - "+fmt12(eh,em)

// ── Team Avatar ───────────────────────────────────────────────────────────────
export function TeamAv({ name, logo, size=44 }) {
  const ini = (name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
  const col = PAL[(name||"").length % PAL.length]
  if (name==="Internal 9v9") return <div style={{ width:size,height:size,borderRadius:12,background:"#1D9E75",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0 }}>🔵</div>
  if (logo) return <img src={logo} alt={name} style={{ width:size,height:size,borderRadius:12,objectFit:"cover",flexShrink:0,border:"2px solid #e5e7eb" }}/>
  return <div style={{ width:size,height:size,borderRadius:12,background:col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:900,color:"#fff",flexShrink:0,fontFamily:"var(--font-head)",letterSpacing:"-1px" }}>{ini}</div>
}

// ── Searchable Dropdown ───────────────────────────────────────────────────────
export function SearchDropdown({ options, value, onChange, placeholder, renderOption, renderSelected, onAddNew, addNewLabel }) {
  const [open, setOpen] = useState(false)
  const [q, setQ]       = useState("")
  const ref             = useRef(null)
  const isMobile        = typeof window !== "undefined" && window.innerWidth <= 768

  useEffect(() => {
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [open, isMobile])

  const filtered = options.filter(o => (o.label||o.name||"").toLowerCase().includes(q.toLowerCase()))
  const sel = options.find(o => o.value===value || o.id===value)

  const trigger = (
    <div onClick={()=>setOpen(o=>!o)} style={{ padding:"12px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#fafafa", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:14, fontFamily:"var(--font-body)", minHeight:48 }}>
      <div style={{ flex:1, minWidth:0 }}>{sel ? (renderSelected?renderSelected(sel):<span style={{ fontWeight:600 }}>{sel.label||sel.name}</span>) : <span style={{ color:"#9ca3af" }}>{placeholder}</span>}</div>
      <span style={{ color:"#9ca3af", fontSize:11, marginLeft:8, flexShrink:0 }}>{open?"▲":"▼"}</span>
    </div>
  )

  const list = (
    <>
      {filtered.map(o => (
        <div key={o.id||o.value} onClick={()=>{ onChange(o.id||o.value); setOpen(false); setQ("") }} style={{ padding:"13px 14px", cursor:"pointer", background:(o.id===value||o.value===value)?"#f0fdf4":"transparent", borderBottom:"1px solid #f9fafb" }}>
          {renderOption ? renderOption(o) : <span style={{ fontSize:14 }}>{o.label||o.name}</span>}
        </div>
      ))}
      {filtered.length===0 && <div style={{ padding:"24px 16px", textAlign:"center", color:"#9ca3af", fontSize:14 }}>No results found</div>}
    </>
  )

  // MOBILE: bottom sheet
  if (isMobile) {
    return (
      <div ref={ref} style={{ position:"relative" }}>
        {trigger}
        {open && (
          <>
            <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:9998 }}/>
            <div style={{ position:"fixed", left:0, right:0, bottom:0, background:"#fff", borderRadius:"20px 20px 0 0", zIndex:9999, maxHeight:"75vh", display:"flex", flexDirection:"column", boxShadow:"0 -8px 30px rgba(0,0,0,0.3)" }}>
              <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid #f3f4f6" }}>
                <div style={{ width:40, height:4, background:"#e5e7eb", borderRadius:4, margin:"0 auto 14px" }}/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." autoFocus style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", fontSize:15, outline:"none", fontFamily:"var(--font-body)", boxSizing:"border-box", background:"#fafafa" }}/>
              </div>
              <div style={{ overflowY:"auto", flex:1, WebkitOverflowScrolling:"touch" }}>{list}</div>
              {onAddNew && (
                <div onClick={()=>{ setOpen(false); onAddNew() }} style={{ padding:"14px 16px", borderTop:"1px solid #f3f4f6", cursor:"pointer", color:"#1D9E75", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                  <span>+</span><span>{addNewLabel||"Add new"}</span>
                </div>
              )}
              <button onClick={()=>setOpen(false)} style={{ margin:"8px 16px 16px", padding:"13px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#fff", color:"#6b7280", fontSize:14, cursor:"pointer", fontWeight:600 }}>Close</button>
            </div>
          </>
        )}
      </div>
    )
  }

  // DESKTOP: dropdown
  return (
    <div ref={ref} style={{ position:"relative" }}>
      {trigger}
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"#fff", borderRadius:10, border:"1.5px solid #e5e7eb", boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:500, maxHeight:280, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"8px 10px", borderBottom:"1px solid #f3f4f6" }}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." autoFocus style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1.5px solid #e5e7eb", fontSize:13, outline:"none", fontFamily:"var(--font-body)", boxSizing:"border-box" }}/>
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>{list}</div>
          {onAddNew && (
            <div onClick={()=>{ setOpen(false); onAddNew() }} style={{ padding:"10px 12px", borderTop:"1px solid #f3f4f6", cursor:"pointer", color:"#1D9E75", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              <span>+</span><span>{addNewLabel||"Add new"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Time Picker ───────────────────────────────────────────────────────────────
export function TimePicker({ label, hour, min, onChange }) {
  return (
    <div>
      <div style={{ fontSize:12,color:"#6b7280",marginBottom:5,fontWeight:600 }}>{label}</div>
      <div style={{ display:"flex",gap:6,alignItems:"center" }}>
        <select value={hour} onChange={e=>onChange(Number(e.target.value),min)} style={{ flex:1,padding:"10px 6px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13,background:"#fafafa",fontFamily:"var(--font-body)",outline:"none" }}>
          {HOURS.map(h=><option key={h} value={h}>{String(h===0?12:h>12?h-12:h).padStart(2,"0")} {h<12?"AM":"PM"}</option>)}
        </select>
        <span style={{ color:"#6b7280",fontWeight:600 }}>:</span>
        <select value={min||"00"} onChange={e=>onChange(hour,e.target.value)} style={{ width:64,padding:"10px 4px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13,background:"#fafafa",fontFamily:"var(--font-body)",outline:"none" }}>
          {MINS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  )
}

// ── Back Button ───────────────────────────────────────────────────────────────
function BackBtn({ onBack }) {
  return (
    <button onClick={onBack} style={{ display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#1D9E75",fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:16,padding:0,fontFamily:"var(--font-body)" }}>
      ← Dashboard
    </button>
  )
}

// ── Main Portal ───────────────────────────────────────────────────────────────
export default function AdminPortal({ onLogout, player: loggedPlayer }) {
  const [page, setPage]           = useState("dashboard")
  const [invites, setInvites]     = useState([])
  const [invDetail, setInvDetail] = useState(null)
  const loadInvDetail = async (m) => {
    try {
      const [mps, exps, pays, chats] = await Promise.all([fetchMatchPlayers(m.id), fetchExpenses(m.id), fetchPayments(m.id), fetchChat(m.id)])
      setInvDetail({ match: m, matchPlayers: mps, expenses: exps, payments: pays, chat: chats })
    } catch(e) { alert(e.message) }
  }
  const loadInvites = () => fetchMyInvites(loggedPlayer.id).then(setInvites).catch(()=>{})
  useEffect(() => { loadInvites() }, [])
  const [players, setPlayers]     = useState([])
  const [grounds, setGrounds]     = useState([])
  const [matches, setMatches]     = useState([])
  const [teams, setTeams]         = useState([])
  const [settings, setSettings]   = useState({})
  const [loading, setLoading]     = useState(true)
  // loggedPlayer comes from prop
  const [selId, setSelId]         = useState(null)
  const [matchFilter, setMatchFilter] = useState(null)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const isMobile = useMobile(900)

  const load = async () => {
    setLoading(true)
    try {
      const [p,g,m,t,s] = await Promise.all([fetchPlayers(),fetchGrounds(),fetchMatches(),fetchTeams(),fetchSettings()])
      setPlayers(p); setGrounds(g); setMatches(m); setTeams(t);
      try { const pend = await fetchPendingPlayers(); setPendingCount(pend.length) } catch {} setSettings(s||{})
    } catch(e) { alert("Load error: "+e.message) }
    setLoading(false)
  }
  useEffect(()=>{ load() },[])
  useEffect(()=>{
    try {
      const nav = JSON.parse(sessionStorage.getItem("ss_admin_nav") || "null")
      if (nav && nav.page) {
        setPage(nav.page)
        if (nav.selId) setSelId(nav.selId)
        if (nav.filter) setMatchFilter(nav.filter)
      }
    } catch {}
  },[])

  const navigate = (pg, id=null, filter=null) => {
    setPage(pg); setSelId(id); setMatchFilter(filter); setMenuOpen(false)
    try { sessionStorage.setItem("ss_admin_nav", JSON.stringify({ page: pg, selId: id, filter })) } catch {}
    if (pg !== "dashboard") window.history.pushState({ page: pg }, "")
  }
  useEffect(() => {
    const onPop = () => {
      setSelId(null); setMatchFilter(null); setMenuOpen(false)
      setPage("dashboard")
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  if (loading) return <div style={{ minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>

  const navItems = [["dashboard","Dashboard"],["matches","Matches"],["players","Players"],["teams","Teams"],["grounds","Grounds"],["calendar","Calendar"],["messages","Messages"],["leaderboard","Leaderboard"]]

  if (invDetail) return (
    <MatchDetailPlayer
      detail={invDetail}
      player={loggedPlayer}
      onBack={() => setInvDetail(null)}
      onRespond={async (action) => { try { await confirmPlayerToMatch(invDetail.match.id, loggedPlayer.id, action); alert(action === "confirmed" ? "You're confirmed for this match! ✅" : "Marked as not available."); await loadInvDetail(invDetail.match); loadInvites() } catch(e) { alert(e.message) } }}
      isMobile={isMobile}
    />
  )

  return (
    <div style={{ minHeight:"100vh",background:"#FBF3E7",fontFamily:"var(--font-body)" }}>
      {/* Nav */}
      <div style={{ background:"#0B3D2E",height:54,borderBottom:"3px dashed #A6192E",display:"flex",alignItems:"center",padding:"0 16px",gap:12,position:"sticky",top:0,zIndex:200 }}>
        {/* Logo — click goes to dashboard */}
        <div onClick={()=>navigate("dashboard")} style={{ cursor:"pointer",display:"flex",alignItems:"center" }}>
          <LogoFull size={28}/>
        </div>
        {isMobile ? (
          <><div style={{ flex:1 }}/><button onClick={()=>setProfileMenuOpen(o=>!o)} aria-haspopup="true" aria-expanded={profileMenuOpen} style={{ display:"flex", alignItems:"center", gap:5, background:"transparent", border:"1px solid rgba(255,255,255,0.2)", borderRadius:7, padding:"3px 8px 3px 3px", cursor:"pointer" }}><Av name={loggedPlayer?.name || "Admin"} id={loggedPlayer?.id} sz={20}/><span style={{ fontSize:9, color:"rgba(255,255,255,0.6)" }}>▼</span></button><button onClick={()=>setMenuOpen(o=>!o)} style={{ padding:"6px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"#fff",fontSize:18,cursor:"pointer" }}>☰</button></>
        ) : (
          <><div style={{ flex:1,display:"flex",gap:2,marginLeft:8 }}>{navItems.map(([k,v])=><button key={k} onClick={()=>navigate(k)} style={{ padding:"5px 11px",borderRadius:7,border:"none",background:page===k?"rgba(29,158,117,0.25)":"transparent",color:page===k?"#6ee7b7":"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontWeight:page===k?700:400,fontFamily:"var(--font-body)",position:"relative" }}>{v}</button>)}</div><div style={{ position:"relative" }}>{profileMenuOpen && <div onClick={()=>setProfileMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:250 }}/>}<button onClick={()=>setProfileMenuOpen(o=>!o)} aria-haspopup="true" aria-expanded={profileMenuOpen} style={{ display:"flex", alignItems:"center", gap:7, background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"4px 10px 4px 4px", cursor:"pointer" }}><Av name={loggedPlayer?.name || "Admin"} id={loggedPlayer?.id} sz={24}/><span style={{ fontSize:12, color:"rgba(255,255,255,0.85)", fontWeight:600, maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{loggedPlayer?.name || "Admin"}</span><span style={{ fontSize:9, color:"rgba(255,255,255,0.5)" }}>▼</span></button>{profileMenuOpen && (<div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"#fff", borderRadius:10, boxShadow:"0 10px 28px rgba(0,0,0,0.18)", minWidth:170, overflow:"hidden", zIndex:251 }}><button onClick={()=>{ setProfileMenuOpen(false); navigate("profile") }} style={{ display:"block", width:"100%", padding:"11px 14px", border:"none", background:"transparent", textAlign:"left", fontSize:13, color:"#0B3D2E", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:600 }}>👤 My Profile</button><div style={{ height:1, background:"#EDE4D3" }}/><button onClick={onLogout} style={{ display:"block", width:"100%", padding:"11px 14px", border:"none", background:"transparent", textAlign:"left", fontSize:13, color:"#A6192E", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:600 }}>🚪 Logout</button></div>)}</div></>
        )}
      </div>
      {isMobile&&profileMenuOpen&&(
        <div style={{ position:"fixed", top:54, right:16, background:"#fff", borderRadius:10, boxShadow:"0 10px 28px rgba(0,0,0,0.18)", minWidth:170, overflow:"hidden", zIndex:251 }}>
          <button onClick={()=>{ setProfileMenuOpen(false); navigate("profile") }} style={{ display:"block", width:"100%", padding:"12px 14px", border:"none", background:"transparent", textAlign:"left", fontSize:14, color:"#0B3D2E", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:600 }}>👤 My Profile</button>
          <div style={{ height:1, background:"#EDE4D3" }}/>
          <button onClick={onLogout} style={{ display:"block", width:"100%", padding:"12px 14px", border:"none", background:"transparent", textAlign:"left", fontSize:14, color:"#A6192E", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:600 }}>🚪 Logout</button>
        </div>
      )}
      {isMobile&&menuOpen&&(
        <div style={{ background:"#0F2D1F",borderBottom:"1px solid rgba(255,255,255,0.1)",padding:"10px 16px",position:"sticky",top:54,zIndex:199 }}>
          {navItems.map(([k,v])=><button key={k} onClick={()=>navigate(k)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 14px",borderRadius:8,border:"none",background:page===k?"rgba(29,158,117,0.25)":"transparent",color:page===k?"#6ee7b7":"rgba(255,255,255,0.6)",fontSize:15,cursor:"pointer",fontWeight:page===k?700:400,textAlign:"left",marginBottom:4,fontFamily:"var(--font-body)" }}>{v}</button>)}
          <button onClick={onLogout} style={{ display:"block",width:"100%",padding:"12px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:14,cursor:"pointer",textAlign:"left",marginTop:8,fontFamily:"var(--font-body)" }}>Logout</button>
        </div>
      )}

      <div style={{ maxWidth:1140,margin:"0 auto",padding:isMobile?"14px 12px":"22px 18px" }}>
        {page==="profile"   && <><BackBtn onBack={()=>navigate("dashboard")}/><AdminProfilePage loggedPlayer={loggedPlayer} players={players} matches={matches} grounds={grounds} teams={teams} onRefresh={load} isMobile={isMobile}/></>}
        {page==="dashboard" && <Dashboard invites={invites} onOpenInvite={loadInvDetail} onInviteRespond={async (mid, s) => { try { await confirmPlayerToMatch(mid, loggedPlayer.id, s); loadInvites() } catch(e) { alert(e.message) } }} matches={matches} players={players} grounds={grounds} teams={teams} settings={settings} loggedPlayer={loggedPlayer} onNavigate={navigate} onRefresh={load} isMobile={isMobile}/>}
        {page==="matches"   && <MatchesPage matches={matches} players={players} grounds={grounds} teams={teams} selId={selId} initialFilter={matchFilter} settings={settings} loggedPlayer={loggedPlayer} onNavigate={navigate} onRefresh={load} isMobile={isMobile}/>}
        {page==="players"   && <><BackBtn onBack={()=>navigate("dashboard")}/><PlayersPage players={players} onRefresh={load} isMobile={isMobile}/></>}
        {page==="teams"     && <><BackBtn onBack={()=>navigate("dashboard")}/><TeamsPage teams={teams} onRefresh={load} isMobile={isMobile}/></>}
        {page==="grounds"   && <><BackBtn onBack={()=>navigate("dashboard")}/><GroundsPage grounds={grounds} onRefresh={load} isMobile={isMobile}/></>}
        {page==="calendar"  && <><BackBtn onBack={()=>navigate("dashboard")}/><CalendarPage matches={matches} teams={teams} grounds={grounds} onNavigate={navigate} isMobile={isMobile}/></>}
        {page==="messages"  && <><BackBtn onBack={()=>navigate("dashboard")}/><MessagesPage players={players} loggedPlayer={loggedPlayer} isMobile={isMobile}/></>}
        {page==="leaderboard" && <><BackBtn onBack={()=>navigate("dashboard")}/><LeaderboardPage isMobile={isMobile} myId={loggedPlayer?.id}/></>}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ invites = [], onOpenInvite, onInviteRespond, matches, players, grounds, teams, settings, onNavigate, onRefresh, isMobile, loggedPlayer }) {
  const [proRequests, setProRequests] = useState([])
  const loadProRequests = async () => { try { setProRequests(await fetchPendingProRequests()) } catch {} }
  useEffect(() => { loadProRequests() }, [])
  const decideProRequest = async (req, approve) => {
    try {
      if (approve) await approveProRequest(req.id, req.player_id)
      else await rejectProRequest(req.id)
      await loadProRequests()
    } catch(e) { alert(e.message) }
  }
  const [inviteFilter, setInviteFilter] = useState("upcoming")
  const filteredInvites = invites.filter(({ match: m }) => inviteFilter === "upcoming" ? m.status !== "completed" : m.status === "completed")
  const upcoming  = matches.filter(m => m.status === "upcoming")
  const completed = matches.filter(m => m.status === "completed")
  const [showNew, setShowNew] = useState(false)

  const stats = [
    { label:"Players", v:players.length, c:"#8B1E2E", bg:"#F5DADD", icon:"👥", action:()=>onNavigate("players") },
    { label:"Matches",  v:matches.length, c:"#1D9E75", bg:"#f0fdf4", icon:"📅", action:()=>onNavigate("matches") },
    { label:"Grounds",  v:grounds.length, c:"#7A4F13", bg:"#F5E6C8", icon:"📍", action:()=>onNavigate("grounds") },
    { label:"Teams",    v:teams.length,   c:"#BA7517", bg:"#fffbeb", icon:"🏟️", action:()=>onNavigate("teams") },
  ]

  return (
    <div>
      {/* Title */}
      <h2 style={{ color:"#0B3D2E", fontSize:isMobile?18:22, fontWeight:900, margin:"0 0 16px", fontFamily:"var(--font-head)" }}>Dashboard</h2>


      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        {stats.map((c,i) => (
          <div key={i} onClick={c.action} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", cursor:"pointer", border:"1.5px solid #e5e7eb", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontSize:isMobile?24:30, fontWeight:900, color:c.c, fontFamily:"var(--font-head)", lineHeight:1 }}>{c.v}</div>
            <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>{c.label}</div>
            <div style={{ fontSize:10, color:c.c, marginTop:4, fontWeight:600, opacity:0.8 }}>Tap to view →</div>
          </div>
        ))}
      </div>

      {proRequests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0B3D2E", marginBottom: 12, fontFamily: "var(--font-head)" }}>🏏 Pro Access Requests</div>
          <div style={{ display:"grid", gap:10 }}>
            {proRequests.map(req => (
              <Card key={req.id} style={{ padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                <Av name={req.players?.name || "Player"} id={req.player_id} sz={34}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#111827" }}>{req.players?.name || "Player"}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>wants to schedule matches (Pro access)</div>
                </div>
                <button onClick={()=>decideProRequest(req, true)} style={{ padding:"6px 12px", borderRadius:8, background:"#d1fae5", border:"1px solid #6ee7b7", color:"#065f46", fontSize:12, cursor:"pointer", fontWeight:700 }}>Approve</button>
                <button onClick={()=>decideProRequest(req, false)} style={{ padding:"6px 12px", borderRadius:8, background:"#F5DADD", border:"1px solid #E3AEB4", color:"#8B1E2E", fontSize:12, cursor:"pointer", fontWeight:700 }}>Reject</button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14, marginBottom:14 }}>

        {invites.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0B3D2E", marginBottom: 12, fontFamily: "var(--font-head)" }}>📩 Invited Matches</div>
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              {["upcoming","completed"].map(f => (
                <button key={f} onClick={()=>setInviteFilter(f)} style={{ padding:"5px 12px", borderRadius:7, border:"none", background:inviteFilter===f?"#0B3D2E":"#f3f4f6", color:inviteFilter===f?"#fff":"#6b7280", fontSize:12, cursor:"pointer", fontWeight:inviteFilter===f?700:500, fontFamily:"var(--font-body)", textTransform:"capitalize" }}>{f}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {filteredInvites.length === 0 ? (
                <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"16px 0" }}>No {inviteFilter} invites.</div>
              ) : filteredInvites.map(({ match: m, myStatus }) => (
                <Card key={m.id} onClick={() => onOpenInvite(m)} style={{ padding: "16px", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>{m.team}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>📅 {fmtDate(m.date)} · ⏰ {m.time_slot}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>📍 {m.ground}</div>
                    </div>
                    <Tag col={myStatus === "confirmed" ? "green" : myStatus === "waitlist" ? "yellow" : myStatus === "declined" ? "red" : "orange"}>
                      {myStatus === "confirmed" ? "✅ You are in!" : myStatus === "waitlist" ? "⏳ Waitlist" : myStatus === "declined" ? "❌ Declined" : "Awaiting reply"}
                    </Tag>
                  </div>
                  {m.status === "upcoming" && myStatus === "pending" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                      <button onClick={(ev) => { ev.stopPropagation(); onInviteRespond(m.id, "confirmed") }} style={{ padding: "12px", borderRadius: 10, background: "#1D9E75", border: "none", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)" }}>✅ Available</button>
                      <button onClick={(ev) => { ev.stopPropagation(); onInviteRespond(m.id, "declined") }} style={{ padding: "12px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: 13, cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-head)" }}>❌ Not Available</button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
        {/* Upcoming Matches */}
        <div style={{ background:"#fff", borderRadius:14, padding:"16px", border:"1.5px solid #e5e7eb" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>📅 Upcoming</div>
            <button onClick={()=>setShowNew(true)} style={{ padding:"5px 12px", borderRadius:8, background:"#1D9E75", border:"none", color:"#fff", fontSize:12, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-body)" }}>+ New</button>
          </div>
          {upcoming.length === 0
            ? <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"20px 0" }}>No upcoming matches</div>
            : upcoming.slice(0,4).map(m => (
              <div key={m.id} onClick={()=>onNavigate("matches",m.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:10, border:"1px solid #f3f4f6", marginBottom:8, cursor:"pointer", background:"#fafafa" }}>
                <TeamAv name={m.team} logo={m.team_logo} size={32}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:"#0B3D2E", fontSize:12, fontFamily:"var(--font-head)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.team}</div>
                  <div style={{ color:"#9ca3af", fontSize:11, marginTop:1 }}>{fmtDate(m.date)} · {m.time_slot}</div>
                </div>
              </div>
            ))
          }
          {upcoming.length > 4 && (
            <button onClick={()=>onNavigate("matches",null,"upcoming")} style={{ width:"100%", padding:"7px", borderRadius:8, border:"1px solid #e5e7eb", background:"transparent", color:"#1D9E75", fontSize:12, cursor:"pointer", fontWeight:600 }}>
              View all {upcoming.length} →
            </button>
          )}
        </div>

        {/* My Availability */}
        <MyAvailability matches={matches} players={players} loggedPlayer={loggedPlayer} isMobile={isMobile}/>
      </div>

      {/* Bottom section: Quick Stats + Last Match + Recent Activity */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:14 }}>

        {/* Quick Stats this week */}
        <div style={{ background:"#fff", borderRadius:14, padding:"16px", border:"1.5px solid #e5e7eb" }}>
          <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:14, fontFamily:"var(--font-head)" }}>📊 This Week</div>
          {(() => {
            const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7)
            const weekMatches = matches.filter(m => new Date(m.date) >= weekAgo)
            const confirmedTotal = weekMatches.reduce((s,m) => s, 0)
            return (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  { label:"Upcoming", v:upcoming.length, c:"#1D9E75", bg:"#f0fdf4" },
                  { label:"Played",   v:completed.length, c:"#8B1E2E", bg:"#F5DADD" },
                  { label:"Players",  v:players.length, c:"#7A4F13", bg:"#F5E6C8" },
                  { label:"Teams",    v:teams.length, c:"#BA7517", bg:"#fffbeb" },
                ].map((s,i) => (
                  <div key={i} style={{ padding:"10px 12px", borderRadius:10, background:s.bg }}>
                    <div style={{ fontSize:20, fontWeight:900, color:s.c, fontFamily:"var(--font-head)" }}>{s.v}</div>
                    <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Last Match shortcut + Recent Activity */}
        <div style={{ background:"#fff", borderRadius:14, padding:"16px", border:"1.5px solid #e5e7eb" }}>
          <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:12, fontFamily:"var(--font-head)" }}>🕐 Recent Activity</div>
          {matches.length === 0 ? (
            <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"12px 0" }}>No matches yet</div>
          ) : (
            <div>
              {/* Last match shortcut */}
              {(() => {
                const last = matches[0]
                return (
                  <div onClick={()=>onNavigate("matches",last.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"#f9fafb", border:"1px solid #f3f4f6", marginBottom:10, cursor:"pointer" }}>
                    <TeamAv name={last.team} logo={last.team_logo} size={34}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:12, color:"#0B3D2E", fontFamily:"var(--font-head)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{last.team}</div>
                      <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{fmtDate(last.date)}</div>
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:last.status==="upcoming"?"#1D9E75":last.status==="completed"?"#185FA5":"#ef4444", flexShrink:0 }}>{last.status}</div>
                  </div>
                )
              })()}
              {/* Recent confirmed/declined */}
              <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600, marginBottom:6 }}>LAST MATCH RESPONSES</div>
              {upcoming.length > 0 ? (
                <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.8 }}>
                  Open a match to see who confirmed or declined their availability.
                </div>
              ) : (
                <div style={{ fontSize:12, color:"#6b7280" }}>Schedule a new match to start inviting players.</div>
              )}
              <button onClick={()=>onNavigate("matches")} style={{ marginTop:10, width:"100%", padding:"7px", borderRadius:8, border:"1px solid #e5e7eb", background:"transparent", color:"#1D9E75", fontSize:12, cursor:"pointer", fontWeight:600 }}>
                View All Matches →
              </button>
            </div>
          )}
        </div>
      </div>

      {showNew && <NewMatchModal grounds={grounds} teams={teams} onClose={()=>setShowNew(false)} onCreated={()=>{setShowNew(false);onRefresh()}} isMobile={isMobile}/>}
    </div>
  )
}


function NewMatchModal({ grounds, teams, onClose, onCreated, isMobile }) {
  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({ date:today, startH:7, startM:"00", endH:9, endM:"00", groundId:grounds[0]?.id||"", teamId:teams[0]?.id||"", type:"external", teamBId:"", maxPlayers:18 })
  const [busy, setBusy] = useState(false)
  const [teamList, setTeamList] = useState(teams)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [addingTeam, setAddingTeam] = useState(false)
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) { alert("Team name required"); return }
    if (teamList.find(t => t.name.toLowerCase() === newTeamName.trim().toLowerCase())) { alert("Team already exists"); return }
    setAddingTeam(true)
    try {
      const created = await addTeam(newTeamName.trim(), null)
      setTeamList([...teamList, created])
      setForm(f => ({ ...f, teamId: created.id }))
      setShowAddTeam(false)
      setNewTeamName("")
    } catch(e) { alert(e.message) }
    setAddingTeam(false)
  }
  const selTeam   = teamList.find(t=>String(t.id)===String(form.teamId))
  const selGround = grounds.find(g=>String(g.id)===String(form.groundId))||grounds[0]
  const submit = async () => {
    if(form.type==="external"&&!selTeam){alert("Please select a team");return}
    if(!selGround){alert("Please select a ground");return}
    setBusy(true)
    const timeSlot = timeSlotStr(form.startH,form.startM,form.endH,form.endM)
    const teamName = form.type==="internal"?`Internal ${form.maxPlayers/2}v${form.maxPlayers/2}`:selTeam.name
    const teamLogo = form.type==="internal"?null:selTeam?.logo_url||null
    try { await createMatch({ date:form.date,time_slot:timeSlot,ground:selGround.name,team:teamName,team_logo:teamLogo,type:form.type,max_players:form.maxPlayers }); onCreated() }
    catch(e){alert(e.message)} setBusy(false)
  }
  const lS = { fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600 }
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:300 }}>
      <div style={{ background:"#fff",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"24px 18px":30,width:"100%",maxWidth:isMobile?"100%":500,maxHeight:isMobile?"95vh":"92vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
          <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Schedule New Match</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af" }}>×</button>
        </div>
        <p style={{ margin:"0 0 18px",fontSize:12,color:"#6b7280" }}>No one is notified until you invite them.</p>
        <div style={{ display:"grid",gap:16 }}>
          <div>
            <label style={lS}>Date</label>
            <input type="date" value={form.date} min={today} onChange={e=>setForm({...form,date:e.target.value})} style={{ width:"100%",padding:"11px 12px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:15,boxSizing:"border-box",fontFamily:"var(--font-body)",outline:"none" }}/>
            {form.date&&<div style={{ fontSize:11,color:"#1D9E75",marginTop:4,fontWeight:600 }}>📅 {dayName(form.date)}</div>}
          </div>
          <div>
            <label style={lS}>Match Time</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"end" }}>
              <TimePicker label="Start" hour={form.startH} min={form.startM} onChange={(h,m)=>setForm({...form,startH:h,startM:m})}/>
              <div style={{ textAlign:"center",color:"#9ca3af",fontSize:13,fontWeight:600,paddingBottom:10 }}>to</div>
              <TimePicker label="End" hour={form.endH} min={form.endM} onChange={(h,m)=>setForm({...form,endH:h,endM:m})}/>
            </div>
            <div style={{ fontSize:11,color:"#1D9E75",marginTop:6,fontWeight:600 }}>⏰ {timeSlotStr(form.startH,form.startM,form.endH,form.endM)}</div>
          </div>
          <div>
            <label style={lS}>Ground</label>
            <SearchDropdown options={grounds.map(g=>({...g,label:`${g.name} — ${g.location}`}))} value={form.groundId||(grounds[0]?.id)} onChange={v=>setForm({...form,groundId:v})} placeholder="Select ground..." renderOption={o=><div><div style={{ fontWeight:600,fontSize:13 }}>{o.name}</div><div style={{ fontSize:11,color:"#9ca3af" }}>{o.location}</div></div>} renderSelected={o=><span style={{ fontSize:13,fontWeight:600 }}>{o.name} — {o.location}</span>}/>
          </div>
          <div>
            <label style={lS}>Match Type</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[["external","⚽ External Match","vs another team"],["internal","🔵 Internal Match","within our group"]].map(([v,l,sub])=>(
                <button key={v} onClick={()=>setForm({...form,type:v,teamBId:"",maxPlayers:v==="internal"?18:9})} style={{ padding:"12px 8px",borderRadius:9,border:`2px solid ${form.type===v?"#1D9E75":"#e5e7eb"}`,background:form.type===v?"#f0fdf4":"#fff",color:form.type===v?"#065f46":"#6b7280",cursor:"pointer",fontFamily:"var(--font-body)",textAlign:"center" }}>
                  <div style={{ fontSize:13,fontWeight:form.type===v?800:600 }}>{l}</div>
                  <div style={{ fontSize:10,color:form.type===v?"#059669":"#9ca3af",marginTop:2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
          {form.type==="external" && (
            <div>
              <label style={lS}>Our Squad Size</label>
              <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                {[6,7,8,9,10].map(n=>(
                  <button key={n} onClick={()=>setForm({...form,maxPlayers:n})} style={{ flex:1,padding:"11px 4px",borderRadius:9,border:`2px solid ${form.maxPlayers===n?"#1D9E75":"#e5e7eb"}`,background:form.maxPlayers===n?"#f0fdf4":"#fafafa",color:form.maxPlayers===n?"#065f46":"#6b7280",fontSize:14,cursor:"pointer",fontWeight:form.maxPlayers===n?800:600,fontFamily:"var(--font-body)" }}>{n}</button>
                ))}
              </div>
              <div style={{ padding:"8px 12px",background:"#F5E6C8",borderRadius:9,border:"1px solid #E3C888",marginBottom:14,fontSize:12,color:"#7A4F13",fontWeight:600 }}>👥 Our squad: {form.maxPlayers} players</div>
              <label style={lS}>Opponent Team</label>
              <SearchDropdown options={teamList} value={form.teamId} onChange={v=>setForm({...form,teamId:v})} placeholder="Select team..." onAddNew={()=>{setNewTeamName('');setShowAddTeam(true)}} addNewLabel="Add new team" renderOption={o=><div style={{ display:"flex",alignItems:"center",gap:10 }}><TeamAv name={o.name} logo={o.logo_url} size={28}/><span style={{ fontSize:13,fontWeight:600 }}>{o.name}</span></div>} renderSelected={o=><div style={{ display:"flex",alignItems:"center",gap:8 }}><TeamAv name={o.name} logo={o.logo_url} size={22}/><span style={{ fontSize:13,fontWeight:600 }}>{o.name}</span></div>}/>
            </div>
          )}
          {showAddTeam && (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, padding:16 }} onClick={()=>setShowAddTeam(false)}>
              <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:16, padding:22, width:"100%", maxWidth:360 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>Add New Team</h3>
                  <button onClick={()=>setShowAddTeam(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
                </div>
                <input value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAddTeam()} placeholder="e.g. Dominators" autoFocus style={{ width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:15, outline:"none", background:"#fafafa", boxSizing:"border-box", marginBottom:16, fontFamily:"var(--font-body)" }}/>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setShowAddTeam(false)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:14, cursor:"pointer" }}>Cancel</button>
                  <button onClick={handleAddTeam} disabled={addingTeam} style={{ flex:2, padding:"12px", borderRadius:9, background:"#0B3D2E", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>{addingTeam?"Adding...":"Add & Select"}</button>
                </div>
              </div>
            </div>
          )}
          {form.type==="internal" && (
            <div>
              <label style={lS}>Total Players</label>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:14 }}>
                {[10,12,14,16,18,20,22].map(n=>(
                  <button key={n} onClick={()=>setForm({...form,maxPlayers:n})} style={{ flex:"1 1 calc(25% - 6px)",padding:"11px 4px",borderRadius:9,border:`2px solid ${form.maxPlayers===n?"#1D9E75":"#e5e7eb"}`,background:form.maxPlayers===n?"#f0fdf4":"#fafafa",color:form.maxPlayers===n?"#065f46":"#6b7280",fontSize:14,cursor:"pointer",fontWeight:form.maxPlayers===n?800:600,fontFamily:"var(--font-body)" }}>{n}</button>
                ))}
              </div>
              <div style={{ padding:"14px 16px",background:"#f0fdf4",borderRadius:12,border:"1.5px solid #6ee7b7" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:12,background:"#1D9E75",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,color:"#fff",fontWeight:800,fontFamily:"var(--font-head)" }}>{form.maxPlayers/2}v{form.maxPlayers/2}</div>
                  <div>
                    <div style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Internal {form.maxPlayers/2}v{form.maxPlayers/2}</div>
                    <div style={{ fontSize:12,color:"#065f46",marginTop:2 }}>{form.maxPlayers} players · Two equal sides</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ display:"flex",gap:10,marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1,padding:"13px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"#fff",color:"#374151",fontSize:14,cursor:"pointer",fontFamily:"var(--font-body)" }}>Cancel</button>
          <button onClick={submit} disabled={busy} style={{ flex:2,padding:"13px",borderRadius:10,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)" }}>{busy?"Creating...":"Create Match →"}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Matches Page ─────────────────────────────────────────────────────────────
function MatchesPage({ matches, players, grounds, teams, selId, initialFilter, settings, loggedPlayer, onNavigate, onRefresh, isMobile }) {
  const [showNew, setShowNew] = useState(false)
  const [matchCounts, setMatchCounts] = useState({})
  useEffect(() => { fetchMatchCounts(matches.map(m => m.id)).then(setMatchCounts).catch(()=>{}) }, [matches])
  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter]   = useState(initialFilter||"all")

  useEffect(()=>{ if(initialFilter) setFilter(initialFilter) },[initialFilter])
  useEffect(()=>{ if(selId){ const m=matches.find(m=>m.id===selId); if(m) loadMatch(m) } },[selId])

  const adminId = loggedPlayer?.id
  const proIds = new Set(players.filter(p=>p.role==="pro").map(p=>p.id))
  const filtered =
    filter==="all"   ? matches :
    filter==="mine"  ? matches.filter(m=>!m.created_by || m.created_by===adminId) :
    filter==="pro"   ? matches.filter(m=>m.created_by && proIds.has(m.created_by)) :
    matches.filter(m=>m.status===filter)
  const countFor = k =>
    k==="all"  ? matches.length :
    k==="mine" ? matches.filter(m=>!m.created_by || m.created_by===adminId).length :
    k==="pro"  ? matches.filter(m=>m.created_by && proIds.has(m.created_by)).length :
    matches.filter(m=>m.status===k).length

  const loadMatch = async m => {
    setLoading(true)
    try {
      const [mps,exps,pays,chats,pubs] = await Promise.all([fetchMatchPlayers(m.id),fetchExpenses(m.id),fetchPayments(m.id),fetchChat(m.id),fetchPublicResponses(m.id)])
      setDetail({ match:m,matchPlayers:mps,expenses:exps,payments:pays,chat:chats,publicResponses:pubs })
    } catch(e){ alert(e.message) }
    setLoading(false)
  }

  if(loading) return <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>
  if(detail) return <MatchDetail detail={detail} settings={settings} players={players} onBack={()=>setDetail(null)} onRefresh={()=>loadMatch(detail.match)} onDeleted={()=>{ setDetail(null); onRefresh() }} onStatusChange={async status=>{ await updateMatchStatus(detail.match.id,status); onRefresh(); setDetail(null) }} isMobile={isMobile} loggedPlayer={loggedPlayer}/>

  return (
    <div>
      <BackBtn onBack={()=>onNavigate("dashboard")}/>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <h2 style={{ color:"#0B3D2E",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)" }}>Matches</h2>
        {(settings?.subscription_expiry && new Date(settings.subscription_expiry) >= new Date())
          ? <Btn variant="green" size={isMobile?"sm":"md"} onClick={()=>setShowNew(true)}>+ Schedule</Btn>
          : <div onClick={()=>alert("Scheduling requires an active subscription.\nContact admin to renew.")} style={{ padding:isMobile?"7px 12px":"8px 16px",borderRadius:9,background:"#f3f4f6",border:"1.5px solid #e5e7eb",color:"#9ca3af",fontSize:isMobile?12:13,cursor:"pointer",fontWeight:600 }}>🔒 Subscribe</div>
        }
      </div>
      {/* Filter tabs */}
      <div style={{ display:"flex",gap:6,marginBottom:14,background:"#fff",borderRadius:10,padding:4,border:"1.5px solid #e5e7eb" }}>
        {[["all","All"],["mine","Mine"],["pro","Pro"],["upcoming","Upcoming"],["completed","Played"]].map(([k,v])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{ flex:1,padding:"7px 4px",borderRadius:7,border:"none",background:filter===k?"#0B3D2E":"transparent",color:filter===k?"#fff":"#6b7280",fontSize:isMobile?10:12,cursor:"pointer",fontWeight:filter===k?700:400,fontFamily:"var(--font-body)" }}>
            {v} {k!=="all"&&<span style={{ opacity:0.7 }}>({countFor(k)})</span>}
          </button>
        ))}
      </div>
      {filtered.length===0?(
        <Card style={{ padding:"40px 24px",textAlign:"center" }}>
          <div style={{ fontSize:44,marginBottom:10 }}>🏏</div>
          <div style={{ fontWeight:700,fontSize:15,color:"#0B3D2E",marginBottom:6,fontFamily:"var(--font-head)" }}>No {filter==="all"?"":filter} matches</div>
          <div style={{ color:"#6b7280",fontSize:13 }}>{filter==="upcoming"?"Schedule a new match to get started.":filter==="completed"?"Mark matches as done to see them here.":"No matches found."}</div>
        </Card>
      ):(
        <div style={{ display:"grid",gap:10 }}>
          {filtered.map(m=>(
            <div key={m.id} onClick={()=>loadMatch(m)} style={{ background:"#fff",borderRadius:14,padding:isMobile?"13px 14px":"16px 20px",cursor:"pointer",border:"1.5px solid #e5e7eb",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",WebkitTapHighlightColor:"rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <TeamAv name={m.team} logo={m.team_logo} size={isMobile?40:48}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:800,color:"#0B3D2E",fontSize:isMobile?13:15,fontFamily:"var(--font-head)" }}>{m.team}</div>
                  <div style={{ color:"#6b7280",fontSize:11,marginTop:2 }}>{fmtDate(m.date)} · {m.time_slot}</div>
                  <div style={{ color:"#9ca3af",fontSize:11,marginTop:1 }}>📍 {m.ground}</div>
                    {(() => {
                      const joined = matchCounts[m.id] || 0
                      const cap = m.max_players || 0
                      const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                      const left = Math.max(0, cap - joined)
                      return (
                        <div style={{ marginTop:8 }} data-adminCardBar>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:"#065f46" }}>{joined}/{cap} joined</span>
                            <span style={{ fontSize:11, fontWeight:600, color:left>0?"#1D9E75":"#991b1b" }}>{left>0?left+" left":"Full"}</span>
                          </div>
                          <div style={{ height:6, background:"#e5e7eb", borderRadius:5, overflow:"hidden" }}>
                            <div style={{ width:pct+"%", height:"100%", background:pct>=100?"#1D9E75":"linear-gradient(90deg,#6ee7b7,#1D9E75)", borderRadius:5 }}/>
                          </div>
                        </div>
                      )
                    })()}
                  {m.created_by && (()=>{ const creator = players.find(p=>p.id===m.created_by); return creator && creator.role==="pro" ? <div style={{ color:"#7c3aed",fontSize:11,marginTop:3,fontWeight:700 }}>⭐ Scheduled by {creator.name}</div> : null })()}
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0 }}>
                  {!isMobile&&<Tag col="gray">{m.type}</Tag>}
                  {m.link_active&&<Tag col="green">🔗</Tag>}
                  <Tag col={m.status==="upcoming"?"blue":m.status==="completed"?"green":"red"}>{m.status}</Tag>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showNew&&<NewMatchModal grounds={grounds} teams={teams} onClose={()=>setShowNew(false)} onCreated={()=>{setShowNew(false);onRefresh()}} isMobile={isMobile}/>}
    </div>
  )
}

// ─── Match Detail ─────────────────────────────────────────────────────────────
export function MatchDetail({ detail, players, settings, onBack, onRefresh, onDeleted, onStatusChange, isMobile, loggedPlayer }) {
  const upiId = settings?.upi_id || ""
  const { match:m, matchPlayers, expenses, payments, chat, publicResponses } = detail
  const [tab, setTab]           = useState("players")
  const [showNotify, setShowNotify] = useState(false)
  const [msgs, setMsgs]         = useState(chat)
  const [chatInput, setChatInput] = useState("")
  const [expLabel, setExpLabel] = useState("")
  const [expAmt, setExpAmt]     = useState("")
  const [linkActive, setLinkActive] = useState(m.link_active)
  const [toggling, setToggling] = useState(false)
  const [showEditCount, setShowEditCount] = useState(false)
  const [savingCount, setSavingCount] = useState(false)
  const isInternal = m.type === "internal"
  const countOptions = isInternal ? [10,12,14,16,18,20,22] : [6,7,8,9,10]
  const changeCount = async (n) => {
    setSavingCount(true)
    try { await updateMatchMaxPlayers(m.id, n); onRefresh() } catch(e){ alert(e.message) }
    setSavingCount(false); setShowEditCount(false)
  }
  const chatRef = useRef(null)
  useEffect(()=>{ chatRef.current?.scrollIntoView({behavior:"smooth"}) },[msgs])
  const confirmed = matchPlayers.filter(mp=>mp.status==="confirmed")
  const waitlist  = matchPlayers.filter(mp=>mp.status==="waitlist")
  const declined  = matchPlayers.filter(mp=>mp.status==="declined")
  const total = expenses.reduce((s,e)=>s+Number(e.amount),0)
  const pp = confirmed.length>0?Math.round(total/confirmed.length):0
  const pendingPublic = publicResponses.filter(r=>r.approved===null&&r.availability==="yes")
  useEffect(()=>{
    const ch=subscribeToChat(m.id,msg=>setMsgs(prev=>[...prev,msg]))
    return ()=>{ supabase.removeChannel(ch) }
  },[m.id])
  const doSendChat   = async ()=>{ if(!chatInput.trim()) return; const txt=chatInput.trim(); setChatInput(""); try{ const sent=await sendMessage(m.id,"Admin",txt); setMsgs(prev=> prev.find(x=>x.id===sent.id)?prev:[...prev,sent]) }catch(e){alert(e.message)} }
  const doAddExpense = async ()=>{ if(!expLabel||!expAmt) return; await addExpense(m.id,expLabel,parseFloat(expAmt));setExpLabel("");setExpAmt("");onRefresh() }
  const handleToggleLink = async ()=>{ setToggling(true);await toggleMatchLink(m.id,!linkActive);setLinkActive(l=>!l);setToggling(false) }
  const inviteUrl = `${BASE_URL}/join/${m.invite_token}`
  return (
    <div>
      <button onClick={onBack} style={{ background:"none",border:"none",color:"#1D9E75",fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:14,padding:0,fontFamily:"var(--font-body)" }}>← All Matches</button>
      <Card style={{ overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(135deg,#0B3D2E,#0F5C43)",padding:isMobile?"18px 16px":"24px 26px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
            <div style={{ display:"flex",gap:14,alignItems:"flex-start",flex:1,minWidth:0 }}>
              <TeamAv name={m.team} logo={m.team_logo} size={isMobile?48:60}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:3 }}>{fmtDate(m.date)}</div>
                <h2 style={{ color:"#fff",fontSize:isMobile?17:22,fontWeight:900,margin:"0 0 4px",fontFamily:"var(--font-head)" }}>{m.team}</h2>
                <div style={{ color:"rgba(255,255,255,0.65)",fontSize:12 }}>📍 {m.ground} · ⏰ {m.time_slot}</div>
                <div style={{ display:"flex",gap:6,marginTop:10,flexWrap:"wrap" }}>
                  <Tag col={m.type==="internal"?"teal":"blue"}>{m.type==="internal"?"Internal 9v9":"External"}</Tag>
                  <Tag col={m.status==="upcoming"?"blue":m.status==="completed"?"green":"red"}>{m.status}</Tag>
                  {linkActive&&<Tag col="green">🔗 Link active</Tag>}
                </div>
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ color:"#fff",fontSize:isMobile?28:38,fontWeight:900,lineHeight:1,fontFamily:"var(--font-head)" }}>{confirmed.length}<span onClick={()=>setShowEditCount(true)} style={{ fontSize:isMobile?14:18,color:"rgba(255,255,255,0.55)",fontWeight:400,cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted" }}>/{m.max_players} ✎</span></div>
              <div style={{ color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:2 }}>confirmed</div>
              <button onClick={async()=>{ if(confirm("Permanently DELETE this match and all its data? This cannot be undone.")){ try{ await deleteMatch(m.id); onDeleted() }catch(e){ alert(e.message) } } }} style={{ marginTop:8,padding:"6px 12px",borderRadius:8,background:"rgba(127,29,29,0.5)",border:"1px solid rgba(220,38,38,0.6)",color:"#fecaca",fontSize:11,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>🗑 Delete Match</button>
              {showEditCount && (
                <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:16 }} onClick={()=>setShowEditCount(false)}>
                  <div onClick={e=>e.stopPropagation()} style={{ background:"#fff",borderRadius:16,padding:22,width:"100%",maxWidth:360 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                      <h3 style={{ margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>{isInternal?"Total Players":"Squad Size"}</h3>
                      <button onClick={()=>setShowEditCount(false)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af" }}>×</button>
                    </div>
                    <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 16px" }}>{isInternal?"Split into two equal sides.":"Number of players in our squad."}</p>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
                      {countOptions.map(n=>(
                        <button key={n} onClick={()=>changeCount(n)} disabled={savingCount} style={{ flex:isInternal?"1 1 calc(25% - 6px)":1,padding:"13px 4px",borderRadius:9,border:`2px solid ${m.max_players===n?"#1D9E75":"#e5e7eb"}`,background:m.max_players===n?"#f0fdf4":"#fafafa",color:m.max_players===n?"#065f46":"#374151",fontSize:15,cursor:"pointer",fontWeight:m.max_players===n?800:600,fontFamily:"var(--font-body)" }}>{n}{isInternal?` (${n/2}v${n/2})`:""}</button>
                      ))}
                    </div>
                    <div style={{ fontSize:11,color:"#9ca3af",textAlign:"center" }}>{savingCount?"Saving...":"Tap a number to update"}</div>
                  </div>
                </div>
              )}
              {waitlist.length>0&&<div style={{ color:"#fbbf24",fontSize:11,marginTop:3 }}>+{waitlist.length} waitlisted</div>}
              {pendingPublic.length>0&&<div style={{ color:"#fb923c",fontSize:11,marginTop:3 }}>⚡ {pendingPublic.length} pending</div>}
            </div>
          </div>
          {m.status==="upcoming"&&(
            <div style={{ marginTop:14 }}>
              <div style={{ padding:"12px 14px",background:"rgba(255,255,255,0.07)",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",marginBottom:12 }}>
                {loggedPlayer && (() => {
                  const myRow = (detail.matchPlayers || []).find(mp => mp.player_id === loggedPlayer.id)
                  const myStatus = myRow?.status
                  if (myStatus === "confirmed" || myStatus === "waitlist") {
                    return <div style={{ padding:"10px 14px", background: myStatus === "confirmed" ? "#DCEEDB" : "#F5E6C8", borderRadius:10, marginBottom:14, fontSize:13, fontWeight:700, color: myStatus === "confirmed" ? "#1B5E3A" : "#7A4F13" }}>{myStatus === "confirmed" ? "✅ You're in the squad" : "⏳ You're on the waitlist"}</div>
                  }
                  return (
                    <button onClick={async () => { try { await confirmPlayerToMatch(detail.match.id, loggedPlayer.id, "confirmed"); onRefresh() } catch(e) { alert(e.message) } }} style={{ width:"100%", padding:"12px", borderRadius:10, background:"#A6192E", border:"none", color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)", marginBottom:14 }}>
                      🏏 I'm Playing — Add me to the Squad
                    </button>
                  )
                })()}
                <div style={{ color:"#fff",fontSize:12,fontWeight:700,marginBottom:8 }}>🔗 Invite unlisted players</div>
                <div style={{ color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:10,lineHeight:1.5 }}>Share this link with anyone not in your player list. They can register and join this match.</div>
                <button onClick={async()=>{
                  const msg = waPublicLink(m, BASE_URL)
                  if (!linkActive) { await toggleMatchLink(m.id, true); setLinkActive(true) }
                  if (navigator.share) { try { await navigator.share({ title:"Match Invite", text:msg }) } catch {} }
                  else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                }} style={{ width:"100%",padding:"11px",borderRadius:9,background:"#1D9E75",border:"none",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📤 Share Public Invite Link</button>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {/* Group 1: Invite & notify */}
                <div>
                  <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700,letterSpacing:"0.5px",marginBottom:6,textTransform:"uppercase" }}>Invite & Notify</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <button onClick={()=>setShowNotify(true)} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(24,95,165,0.35)",border:"1px solid rgba(147,197,253,0.4)",color:"#93c5fd",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>🔒 Invite Players</button>
                    <button onClick={async()=>{
                      const msg = waInviteWithLink(m, BASE_URL)
                      if (!linkActive) { await toggleMatchLink(m.id, true); setLinkActive(true) }
                      if (navigator.share) { try { await navigator.share({ title:"Match Invite", text:msg }) } catch {} }
                      else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                    }} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(37,211,102,0.2)",border:"1px solid rgba(74,222,128,0.4)",color:"#4ade80",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📤 Share Invite</button>
                    <button onClick={async()=>{
                      const msg = waReminder(m, matchPlayers) + "\n\n" + BASE_URL + "/join/" + m.invite_token
                      if (navigator.share) { try { await navigator.share({ title:"Match Reminder", text:msg }) } catch {} }
                      else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                    }} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.35)",color:"#fbbf24",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>⏰ Share Reminder</button>
                    {m.max_players > 0 && confirmed.length >= m.max_players && (
                      <button onClick={async()=>{
                        const msg = waSquadFull(m, matchPlayers)
                        if (navigator.share) { try { await navigator.share({ title:"Squad Full", text:msg }) } catch {} }
                        else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                      }} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(166,25,46,0.12)",border:"1px solid rgba(166,25,46,0.3)",color:"#A6192E",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>🔒 Share Squad Full</button>
                    )}
                  </div>
                </div>
                {/* Group 2: Match status */}
                <div>
                  <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700,letterSpacing:"0.5px",marginBottom:6,textTransform:"uppercase" }}>Match Status</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <button onClick={()=>onStatusChange("completed")} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(29,158,117,0.25)",border:"1px solid rgba(29,158,117,0.4)",color:"#6ee7b7",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>✔ Mark Done</button>
                    <button onClick={()=>{ if(confirm("Cancel match?")) onStatusChange("cancelled") }} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(239,68,68,0.15)",border:"1px solid rgba(252,165,165,0.35)",color:"#fca5a5",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)" }}>✕ Cancel</button>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Tabs */}
        <div style={{ display:"flex",borderBottom:"2px solid #f3f4f6",padding:"0 14px",overflowX:"auto" }}>
          {[["players","👥 Players"],["chat","💬 Chat"],["expenses","💰 Expenses"]].map(([k,v])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:isMobile?"11px 12px":"13px 16px",border:"none",borderBottom:tab===k?"3px solid #1D9E75":"3px solid transparent",background:"transparent",color:tab===k?"#0B3D2E":"#9ca3af",fontSize:isMobile?12:13,fontWeight:tab===k?800:400,cursor:"pointer",marginBottom:"-2px",whiteSpace:"nowrap",fontFamily:"var(--font-body)" }}>{v}</button>
          ))}
        </div>
        <div style={{ padding:isMobile?"14px":"22px" }}>
          {tab==="players"&&(
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap" }}>
                <span style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>🔒 Private Invites</span>
                <Tag col="blue">{matchPlayers.length} invited</Tag>
                {m.status==="upcoming"&&<button onClick={()=>setShowNotify(true)} style={{ marginLeft:"auto",padding:"5px 12px",borderRadius:8,background:"#f0fdf4",border:"1px solid #6ee7b7",color:"#065f46",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>+ Manage</button>}
              </div>
              {matchPlayers.length===0?(
                <div style={{ padding:"16px",background:"#fff7ed",borderRadius:12,border:"1px solid #fed7aa",marginBottom:20,textAlign:"center" }}>
                  <div style={{ fontSize:13,color:"#9a3412" }}>No players invited yet. Tap "+ Manage" to invite.</div>
                </div>
              ):(
                <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)",gap:8,marginBottom:20 }}>
                  {matchPlayers.map(mp=>{
                    const p=mp.players; if(!p) return null
                    const sc={confirmed:"#d1fae5",waitlist:"#fef3c7",declined:"#fee2e2",pending:"#f9fafb"}[mp.status]
                    const bc={confirmed:"#6ee7b7",waitlist:"#fcd34d",declined:"#fca5a5",pending:"#e5e7eb"}[mp.status]
                    return (
                      <div key={mp.id} style={{ padding:"10px",borderRadius:11,border:`1.5px solid ${bc}`,background:sc }}>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:7 }}>
                          <Av name={p.name} id={p.id} sz={28}/>
                          <div style={{ flex:1,minWidth:0 }}><div style={{ fontWeight:700,fontSize:11,color:"#111827",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{p.name}</div><div style={{ fontSize:10,color:"#6b7280" }}>{{confirmed:"✅",waitlist:"⏳",declined:"❌",pending:"🕐"}[mp.status]}</div></div>
                        </div>
                        {m.status==="upcoming"&&(
                          <div style={{ display:"flex",gap:3 }}>
                            <button onClick={async()=>{await setPlayerStatus(m.id,p.id,"confirmed");onRefresh()}} style={{ flex:1,padding:"5px",borderRadius:6,border:`1.5px solid ${mp.status==="confirmed"?"#1D9E75":"#d1d5db"}`,background:mp.status==="confirmed"?"#1D9E75":"transparent",color:mp.status==="confirmed"?"#fff":"#6b7280",fontSize:12,cursor:"pointer",fontWeight:700 }}>✔</button>
                            <button onClick={async()=>{await setPlayerStatus(m.id,p.id,"declined");onRefresh()}} style={{ flex:1,padding:"5px",borderRadius:6,border:`1.5px solid ${mp.status==="declined"?"#ef4444":"#d1d5db"}`,background:mp.status==="declined"?"#ef4444":"transparent",color:mp.status==="declined"?"#fff":"#6b7280",fontSize:12,cursor:"pointer" }}>✕</button>
                            <button onClick={async()=>{await removePlayerFromMatch(m.id,p.id);onRefresh()}} style={{ flex:1,padding:"5px",borderRadius:6,border:"1.5px solid #e5e7eb",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer" }}>🗑</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              {/* Stats bar */}
              {matchPlayers.length>0 && (()=>{
                const pending = matchPlayers.filter(mp=>mp.status==="pending")
                return (
                  <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap" }}>
                    <div style={{ flex:"1 1 auto",padding:"10px 12px",background:"#f9fafb",borderRadius:10,border:"1.5px solid #e5e7eb",textAlign:"center",minWidth:70 }}>
                      <div style={{ fontSize:18,fontWeight:900,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>{matchPlayers.length}</div>
                      <div style={{ fontSize:10,color:"#6b7280",fontWeight:600 }}>INVITED</div>
                    </div>
                    <div style={{ flex:"1 1 auto",padding:"10px 12px",background:"#f0fdf4",borderRadius:10,border:"1.5px solid #bbf7d0",textAlign:"center",minWidth:70 }}>
                      <div style={{ fontSize:18,fontWeight:900,color:"#065f46",fontFamily:"var(--font-head)" }}>{confirmed.length}</div>
                      <div style={{ fontSize:10,color:"#065f46",fontWeight:600 }}>CONFIRMED</div>
                    </div>
                    <div style={{ flex:"1 1 auto",padding:"10px 12px",background:"#fff5f5",borderRadius:10,border:"1.5px solid #fecaca",textAlign:"center",minWidth:70 }}>
                      <div style={{ fontSize:18,fontWeight:900,color:"#991b1b",fontFamily:"var(--font-head)" }}>{declined.length}</div>
                      <div style={{ fontSize:10,color:"#991b1b",fontWeight:600 }}>DECLINED</div>
                    </div>
                    <div style={{ flex:"1 1 auto",padding:"10px 12px",background:"#fffbeb",borderRadius:10,border:"1.5px solid #fde68a",textAlign:"center",minWidth:70 }}>
                      <div style={{ fontSize:18,fontWeight:900,color:"#78350f",fontFamily:"var(--font-head)" }}>{pending.length}</div>
                      <div style={{ fontSize:10,color:"#78350f",fontWeight:600 }}>PENDING</div>
                    </div>
                  </div>
                )
              })()}
              {/* Copy confirmed list */}
              {confirmed.length>0 && (
                <button onClick={()=>{
                  const header = "🏏 " + m.team + "\n📅 " + fmtDate(m.date) + " · " + m.time_slot + "\n📍 " + m.ground + "\n\n"
                      const txt = header + "✅ Confirmed Players ("+confirmed.length+"):\n" + confirmed.map((mp,i)=>(i+1)+". "+(mp.players?.name||"Player")).join("\n")
                  navigator.clipboard.writeText(txt); alert("Confirmed players list copied!")
                }} style={{ width:"100%",padding:"10px",borderRadius:9,background:"#d1fae5",border:"1px solid #6ee7b7",color:"#065f46",fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:14,fontFamily:"var(--font-body)" }}>📋 Copy Confirmed Players List</button>
              )}
              <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:10 }}>
                {[{label:"✅ Confirmed",list:confirmed,bg:"#f0fdf4",border:"#bbf7d0",tc:"#065f46"},{label:"⏳ Waitlist",list:waitlist,bg:"#fefce8",border:"#fde68a",tc:"#78350f"},{label:"❌ Declined",list:declined,bg:"#fff5f5",border:"#fecaca",tc:"#991b1b"}].map(({label,list,bg,border,tc})=>(
                  <div key={label} style={{ background:bg,borderRadius:12,padding:"12px 14px",border:`1.5px solid ${border}` }}>
                    <div style={{ fontSize:12,fontWeight:800,color:tc,marginBottom:8,fontFamily:"var(--font-head)" }}>{label} ({list.length})</div>
                    {list.map(mp=>{ const p=mp.players; if(!p) return null; return <div key={mp.id} style={{ display:"flex",alignItems:"center",gap:7,marginBottom:5 }}><Av name={p.name} id={p.id} sz={22}/><span style={{ fontSize:12,color:"#374151" }}>{p.name}</span></div> })}
                    {list.length===0&&<div style={{ fontSize:12,color:"#9ca3af" }}>None</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="chat"&&(
            <div>
              <div style={{ height:260,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,marginBottom:12 }}>
                {msgs.length===0&&<p style={{ color:"#9ca3af",fontSize:13,textAlign:"center",marginTop:40 }}>No messages yet.</p>}
                {msgs.map((msg,i)=>(
                  <div key={i} style={{ display:"flex",flexDirection:msg.sender==="Admin"?"row-reverse":"row",gap:8,alignItems:"flex-end" }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:msg.sender==="Admin"?"#1D9E75":"#185FA5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0 }}>{msg.sender==="Admin"?"AD":msg.sender.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                    <div style={{ maxWidth:"72%" }}>
                      <div style={{ fontSize:10,color:"#9ca3af",marginBottom:2,textAlign:msg.sender==="Admin"?"right":"left" }}>{msg.sender}</div>
                      <div style={{ background:msg.sender==="Admin"?"#d1fae5":"#f3f4f6",borderRadius:msg.sender==="Admin"?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"8px 11px",fontSize:13,color:"#111827" }}>{msg.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatRef}/>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSendChat()} placeholder="Message all notified players..." style={{ flex:1,padding:"11px 13px",borderRadius:10,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",fontFamily:"var(--font-body)" }}/>
                <Btn variant="green" onClick={doSendChat}>Send</Btn>
              </div>
            </div>
          )}
          {tab==="expenses"&&(
            <div>
              {m.status==="completed"&&(
                <div style={{ display:"flex",gap:8,marginBottom:18,flexWrap:isMobile?"wrap":"nowrap" }}>
                  <input value={expLabel} onChange={e=>setExpLabel(e.target.value)} placeholder="Expense label" style={{ flex:isMobile?"1 1 100%":2,padding:"10px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",fontFamily:"var(--font-body)" }}/>
                  <input value={expAmt} onChange={e=>setExpAmt(e.target.value)} type="number" placeholder="Amount ₹" style={{ flex:isMobile?"1 1 calc(50% - 4px)":1,padding:"10px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",fontFamily:"var(--font-body)" }}/>
                  <Btn variant="green" onClick={doAddExpense} style={isMobile?{flex:"1 1 calc(50% - 4px)"}:{}}>+ Add</Btn>
                </div>
              )}
              {expenses.length>0?(
                <div>
                  <div style={{ background:"#f0fdf4",borderRadius:13,padding:"16px",border:"1.5px solid #bbf7d0",marginBottom:18 }}>
                    <div style={{ fontWeight:800,fontSize:14,color:"#065f46",marginBottom:12,fontFamily:"var(--font-head)" }}>💰 Expense Breakdown</div>
                    {expenses.map((e,i)=>(
                      <div key={e.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<expenses.length-1?"1px solid #bbf7d0":"none" }}>
                        <span style={{ fontSize:13,color:"#065f46" }}>{e.label}</span>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <span style={{ fontSize:12,color:"#059669" }}>₹{e.amount} ÷ {confirmed.length||1} = <strong>₹{Math.round(e.amount/(confirmed.length||1))}</strong></span>
                          {m.status==="completed"&&<button onClick={async()=>{await deleteExpense(e.id);onRefresh()}} style={{ background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:14 }}>✕</button>}
                        </div>
                      </div>
                    ))}
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"2px solid #6ee7b7" }}>
                      <span style={{ fontWeight:800,fontSize:15,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Per player</span>
                      <span style={{ fontWeight:900,fontSize:20,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>₹{pp}</span>
                    </div>
                  </div>
                  {m.status==="completed"&&confirmed.length>0&&(
                    <div>
                      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#F5E6C8",borderRadius:11,border:"1.5px solid #E3C888",marginBottom:14 }}>
                        <span style={{ fontSize:20 }}>💳</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11,color:"#6b7280" }}>Collect payments at UPI</div>
                          <div style={{ fontWeight:800,fontSize:15,color:"#7A4F13",fontFamily:"var(--font-head)" }}>{upiId||"Set UPI in settings"}</div>
                        </div>
                        {upiId&&<button onClick={()=>{navigator.clipboard.writeText(upiId);alert("UPI ID copied!")}} style={{ padding:"6px 12px",borderRadius:8,background:"#dbeafe",border:"1px solid #93c5fd",color:"#7A4F13",fontSize:12,cursor:"pointer",fontWeight:700 }}>Copy</button>}
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"#F5E6C8",borderRadius:11,border:"1.5px solid #E3C888",marginBottom:14 }}>
                        <span style={{ fontSize:20 }}>💳</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11,color:"#6b7280" }}>Collect payments at UPI</div>
                          <div style={{ fontWeight:800,fontSize:15,color:"#7A4F13",fontFamily:"var(--font-head)" }}>{upiId||"Set UPI in settings"}</div>
                        </div>
                        {upiId&&<button onClick={()=>{navigator.clipboard.writeText(upiId);alert("UPI ID copied!")}} style={{ padding:"6px 12px",borderRadius:8,background:"#dbeafe",border:"1px solid #93c5fd",color:"#7A4F13",fontSize:12,cursor:"pointer",fontWeight:700 }}>Copy</button>}
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8 }}>
                        <div style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Payment Collection</div>
                        <button onClick={()=>copy(waPayment(m,matchPlayers,expenses,upiId))} style={{ padding:"7px 12px",borderRadius:8,background:"#d1fae5",border:"1px solid #6ee7b7",color:"#065f46",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📲 Copy Payment Msg</button>
                      </div>
                      <div style={{ display:"grid",gap:8 }}>
                        {confirmed.map(mp=>{ const p=mp.players; if(!p) return null; const paid=payments.find(pay=>pay.player_id===p.id)?.paid; return (
                          <div key={mp.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 12px",background:paid?"#f0fdf4":"#fff",borderRadius:11,border:`1.5px solid ${paid?"#6ee7b7":"#e5e7eb"}` }}>
                            <Av name={p.name} id={p.id} sz={34}/>
                            <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{p.name}</div><div style={{ fontSize:12,color:"#6b7280" }}>₹{pp} due</div></div>
                            <button onClick={async()=>{await togglePayment(m.id,p.id,!paid);onRefresh()}} style={{ padding:"7px 13px",borderRadius:9,background:paid?"#d1fae5":"#f3f4f6",border:`1.5px solid ${paid?"#6ee7b7":"#e5e7eb"}`,color:paid?"#065f46":"#6b7280",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>{paid?"✔ Paid":"Mark Paid"}</button>
                          </div>
                        )})}
                      </div>
                    </div>
                  )}
                </div>
              ):(
                <div style={{ textAlign:"center",padding:"32px 0",color:"#9ca3af" }}>
                  <div style={{ fontSize:36,marginBottom:10 }}>💰</div>
                  <div style={{ fontSize:13 }}>{m.status==="completed"?"Add expenses above.":"Mark match as completed first."}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      {showNotify&&<NotifyModal match={m} matchPlayers={matchPlayers} players={players} onClose={()=>setShowNotify(false)} onRefresh={onRefresh} isMobile={isMobile}/>}
    </div>
  )
}

export function WalkInsTab({ match:m, publicResponses, onRefresh, linkActive, inviteUrl, isMobile }) {
  const pending  = publicResponses.filter(r=>r.approved===null)
  const approved = publicResponses.filter(r=>r.approved===true)
  const [busy,setBusy] = useState(null)
  const doApprove = async r=>{ setBusy(r.id); try{await approvePublicResponse(r.id,m.id,r.name,r.phone,m.max_players);onRefresh()}catch(e){alert(e.message)} setBusy(null) }
  const doReject  = async r=>{ setBusy(r.id); try{await rejectPublicResponse(r.id);onRefresh()}catch{} setBusy(null) }
  return (
    <div>
      <div style={{ padding:"12px 14px",background:linkActive?"#f0fdf4":"#fff7ed",borderRadius:12,border:`1.5px solid ${linkActive?"#6ee7b7":"#fed7aa"}`,marginBottom:18 }}>
        <div style={{ fontWeight:700,fontSize:13,color:linkActive?"#065f46":"#9a3412",marginBottom:4 }}>{linkActive?"🟢 Link is active":"🔴 Link is inactive"}</div>
        <div style={{ fontSize:11,wordBreak:"break-all",marginBottom:8,color:linkActive?"#059669":"#c2410c" }}>{inviteUrl}</div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <button onClick={()=>copy(inviteUrl)} style={{ padding:"6px 12px",borderRadius:8,background:"rgba(0,0,0,0.06)",border:"1px solid #d1d5db",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)" }}>📋 Copy</button>
          <button onClick={()=>copy(waPublicLink(m,BASE_URL))} style={{ padding:"6px 12px",borderRadius:8,background:"rgba(37,211,102,0.15)",border:"1px solid rgba(74,222,128,0.35)",color:"#065f46",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)" }}>📲 Share on WhatsApp</button>
        </div>
      </div>
      {publicResponses.length===0?(
        <div style={{ textAlign:"center",padding:"28px 0",color:"#9ca3af" }}>
          <div style={{ fontSize:36,marginBottom:10 }}>🔗</div>
          <div style={{ fontSize:14,fontWeight:600,color:"#374151",marginBottom:6 }}>No walk-in responses yet</div>
          <div style={{ fontSize:12 }}>{linkActive?"Share the link in your WhatsApp group.":"Toggle the link ON to start accepting responses."}</div>
        </div>
      ):(
        <div>
          {pending.length>0&&(
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><span style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>⚡ Pending</span><Tag col="orange">{pending.length}</Tag></div>
              {pending.map(r=>(
                <div key={r.id} style={{ padding:"12px 14px",background:r.availability==="yes"?"#f0fdf4":"#fff5f5",borderRadius:12,border:`1.5px solid ${r.availability==="yes"?"#6ee7b7":"#fca5a5"}`,marginBottom:8 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:r.availability==="yes"?10:0 }}>
                    <div style={{ width:38,height:38,borderRadius:"50%",background:r.availability==="yes"?"#1D9E75":"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0 }}>{r.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{r.name}</div><div style={{ fontSize:11,color:"#6b7280" }}>{r.phone&&<>📱 {r.phone} · </>}{r.availability==="yes"?"✅ Available":"❌ Not available"}</div></div>
                  </div>
                  {r.availability==="yes"&&<div style={{ display:"flex",gap:8 }}><button onClick={()=>doApprove(r)} disabled={busy===r.id} style={{ flex:1,padding:"9px",borderRadius:9,background:"#1D9E75",border:"none",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>{busy===r.id?"...":"✔ Approve"}</button><button onClick={()=>doReject(r)} disabled={busy===r.id} style={{ flex:1,padding:"9px",borderRadius:9,background:"#fee2e2",border:"1px solid #fca5a5",color:"#991b1b",fontSize:13,cursor:"pointer",fontFamily:"var(--font-body)" }}>Reject</button></div>}
                </div>
              ))}
            </div>
          )}
          {approved.length>0&&<div><div style={{ fontWeight:700,fontSize:13,color:"#065f46",marginBottom:10 }}>✅ Approved ({approved.length})</div>{approved.map(r=><div key={r.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",marginBottom:7 }}><div style={{ width:32,height:32,borderRadius:"50%",background:"#1D9E75",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff" }}>{r.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div><div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:13 }}>{r.name}</div><div style={{ fontSize:11,color:"#059669" }}>Added to squad</div></div><Tag col="green">✔</Tag></div>)}</div>}
        </div>
      )}
    </div>
  )
}

export function NotifyModal({ match, matchPlayers, players, onClose, onRefresh, isMobile }) {
  const alreadyInvited = new Set(matchPlayers.map(mp => mp.player_id))
  // Start with currently-invited players pre-selected
  const [selected, setSelected] = useState(new Set(alreadyInvited))
  const [saving, setSaving]     = useState(false)
  const [q, setQ]               = useState("")

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = players.filter(p => (p.name||"").toLowerCase().includes(q.toLowerCase()) || (p.phone||"").includes(q))
  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id))
  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) filtered.forEach(p => next.delete(p.id))
      else filtered.forEach(p => next.add(p.id))
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      // Add newly selected
      for (const p of players) {
        const wasInvited = alreadyInvited.has(p.id)
        const isSelected = selected.has(p.id)
        if (isSelected && !wasInvited) await notifyPlayer(match.id, p.id)
        if (!isSelected && wasInvited) await removePlayerFromMatch(match.id, p.id)
      }
      onRefresh()
      onClose()
    } catch(e) { alert(e.message) }
    setSaving(false)
  }

  const selectedCount = selected.size

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:isMobile?"flex-end":"center", justifyContent:"center", zIndex:300 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#fff", borderRadius:isMobile?"20px 20px 0 0":20, padding:isMobile?"20px 16px":24, width:"100%", maxWidth:isMobile?"100%":500, maxHeight:isMobile?"92vh":"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>🔒 Invite Players</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
        </div>

        {/* Search + Select All */}
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search players..." style={{ flex:1, padding:"10px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", fontFamily:"var(--font-body)", boxSizing:"border-box" }}/>
          <button onClick={toggleAll} style={{ padding:"10px 14px", borderRadius:9, border:"1.5px solid #6ee7b7", background:allSelected?"#1D9E75":"#f0fdf4", color:allSelected?"#fff":"#065f46", fontSize:13, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap", fontFamily:"var(--font-body)" }}>{allSelected?"Clear all":"Select all"}</button>
        </div>

        {/* Player list */}
        <div style={{ flex:1, overflowY:"auto", display:"grid", gap:7 }}>
          {filtered.map(p => {
            const isSel = selected.has(p.id)
            return (
              <div key={p.id} onClick={()=>toggle(p.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 13px", borderRadius:11, border:`1.5px solid ${isSel?"#6ee7b7":"#e5e7eb"}`, background:isSel?"#f0fdf4":"#fafafa", cursor:"pointer" }}>
                <Av name={p.name} id={p.id} sz={34}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{p.name}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>📱 {p.phone}</div>
                </div>
                {alreadyInvited.has(p.id) && <Tag col="green">Invited</Tag>}
                <div style={{ width:24, height:24, borderRadius:7, border:`2px solid ${isSel?"#1D9E75":"#d1d5db"}`, background:isSel?"#1D9E75":"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{isSel && <span style={{ color:"#fff", fontSize:14, fontWeight:800 }}>✔</span>}</div>
              </div>
            )
          })}
          {filtered.length===0 && <div style={{ padding:"24px", textAlign:"center", color:"#9ca3af", fontSize:13 }}>No players found</div>}
        </div>

        {/* Footer */}
        <div style={{ marginTop:14, display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"13px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:14, cursor:"pointer", fontWeight:600 }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex:2, padding:"13px", borderRadius:10, background:"#0B3D2E", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>
            {saving ? "Saving..." : `Invite Selected (${selectedCount})`}
          </button>
        </div>
        <div style={{ marginTop:10, display:"flex", gap:8 }}>
          <button onClick={async()=>{
            const msg = waInviteWithLink(match, BASE_URL)
            if (navigator.share) {
              try { await navigator.share({ title: "Match Invite", text: msg }) } catch {}
            } else {
              const url = "https://wa.me/?text=" + encodeURIComponent(msg)
              window.open(url, "_blank")
            }
          }} style={{ flex:2, padding:"12px", borderRadius:10, background:"#1D9E75", border:"none", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-body)" }}>📤 Share Invite Link</button>
          <button onClick={()=>copy(waInviteWithLink(match, BASE_URL))} style={{ flex:1, padding:"12px", borderRadius:10, background:"#d1fae5", border:"1px solid #6ee7b7", color:"#065f46", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-body)" }}>Copy</button>
        </div>
      </div>
    </div>
  )
}

function TeamsPage({ teams, onRefresh, isMobile }) {
  const [showAdd,setShowAdd]=useState(false)
  const [editT,setEditT]=useState(null)
  const [delT,setDelT]=useState(null)
  const [selectedId,setSelectedId]=useState(null)
  const [busy,setBusy]=useState(false)
  const [addName,setAddName]=useState("")
  const [editName,setEditName]=useState("")
  const selectedTeam=teams.find(t=>t.id===selectedId)||null
  const iS={width:"100%",padding:"11px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",boxSizing:"border-box",fontFamily:"var(--font-body)"}
  const mStyle={position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:300}
  const mBox={background:"#fff",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"22px 18px":28,width:"100%",maxWidth:isMobile?"100%":400,maxHeight:isMobile?"95vh":"auto",overflowY:"auto",boxSizing:"border-box"}
  const addSubmit=async()=>{
    if(!addName.trim()){alert("Team name required");return}
    if(teams.find(t=>t.name.toLowerCase()===addName.trim().toLowerCase())){alert("Team name already exists");return}
    setBusy(true);try{await addTeam(addName.trim(),null);setShowAdd(false);setAddName("");onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const editSubmit=async()=>{
    if(!editName.trim()){alert("Team name required");return}
    if(teams.find(t=>t.name.toLowerCase()===editName.trim().toLowerCase()&&t.id!==editT.id)){alert("Name already taken");return}
    setBusy(true);try{await updateTeam(editT.id,editName.trim(),editT.logo_url||null);setEditT(null);setSelectedId(null);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const delSubmit=async()=>{
    setBusy(true);try{await deleteTeam(delT.id);setDelT(null);setSelectedId(null);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{color:"#0B3D2E",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)"}}>Teams ({teams.length})</h2>
        <Btn variant="green" size={isMobile?"sm":"md"} onClick={()=>{setAddName("");setShowAdd(true)}}>+ Add Team</Btn>
      </div>
      <SearchDropdown
        options={teams}
        value={selectedId}
        onChange={id=>setSelectedId(id===selectedId?null:id)}
        placeholder="Search team by name..."
        renderOption={o=><div style={{display:"flex",alignItems:"center",gap:10}}><TeamAv name={o.name} logo={o.logo_url} size={32}/><span style={{fontWeight:700,fontSize:13}}>{o.name}</span></div>}
        renderSelected={o=><div style={{display:"flex",alignItems:"center",gap:8}}><TeamAv name={o.name} logo={o.logo_url} size={24}/><span style={{fontWeight:700,fontSize:13}}>{o.name}</span></div>}
      />
      {selectedTeam ? (
        <div style={{marginTop:12}}>
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"16px 18px",border:"2px solid #1D9E75"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <TeamAv name={selectedTeam.name} logo={selectedTeam.logo_url} size={56}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:17,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>{selectedTeam.name}</div>
              </div>
              <button onClick={()=>setSelectedId(null)} style={{background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer",padding:0}}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button onClick={()=>{setEditT(selectedTeam);setEditName(selectedTeam.name)}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #dbeafe",background:"#F5E6C8",color:"#7A4F13",fontSize:13,cursor:"pointer",fontWeight:700}}>Edit Name</button>
              <button onClick={()=>setDelT(selectedTeam)} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#991b1b",fontSize:13,cursor:"pointer",fontWeight:700}}>Delete</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{marginTop:12,padding:"14px 16px",background:"#f9fafb",borderRadius:12,border:"1.5px solid #e5e7eb",textAlign:"center",color:"#9ca3af",fontSize:13}}>
          Search or select a team above to manage it
        </div>
      )}
      {showAdd&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Add New Team</h3><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>x</button></div>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:5,fontWeight:600}}>Team Name *</div>
        <input value={addName} onChange={e=>setAddName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSubmit()} placeholder="e.g. Dominators" style={{...iS,marginBottom:16}}/>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={addSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Adding...":"Add Team"}</button></div>
      </div></div>}
      {editT&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Edit Team</h3><button onClick={()=>setEditT(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>x</button></div>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:5,fontWeight:600}}>Team Name *</div>
        <input value={editName} onChange={e=>setEditName(e.target.value)} style={{...iS,marginBottom:16}}/>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setEditT(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={editSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Save"}</button></div>
      </div></div>}
      {delT&&<div style={mStyle}><div style={{...mBox,maxWidth:360}}>
        <div style={{textAlign:"center",padding:"10px 0 18px"}}><div style={{fontSize:40,marginBottom:12}}>!</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Delete Team?</h3><p style={{color:"#6b7280",fontSize:13,margin:0}}>Delete <strong>{delT.name}</strong>?</p></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setDelT(null)} style={{flex:1,padding:"13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={delSubmit} disabled={busy} style={{flex:1,padding:"13px",borderRadius:9,background:"#fee2e2",border:"1.5px solid #fecaca",color:"#991b1b",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"...":"Yes, Delete"}</button></div>
      </div></div>}
    </div>
  )
}

function GForm({ f, setF }) {
  const iS = { width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", boxSizing:"border-box", fontFamily:"var(--font-body)" }
  const lS = { fontSize:12, color:"#6b7280", display:"block", marginBottom:5, fontWeight:600 }
  return (
    <div style={{ display:"grid", gap:14 }}>
      <div>
        <label style={lS}>Ground Name *</label>
        <input value={f.name||""} onChange={e=>setF({...f, name:e.target.value})} placeholder="e.g. Kanade - Turf" style={iS}/>
      </div>
      <div>
        <label style={lS}>Location *</label>
        <input value={f.location||""} onChange={e=>setF({...f, location:e.target.value})} placeholder="e.g. Kondhwa, Pune" style={iS}/>
      </div>
      <div>
        <label style={lS}>Google Maps Link (optional)</label>
        <input value={f.maps_link||""} onChange={e=>setF({...f, maps_link:e.target.value})} placeholder="Paste Google Maps link" style={iS}/>
      </div>
      <div>
        <label style={lS}>Notes (optional)</label>
        <textarea value={f.notes||""} onChange={e=>setF({...f, notes:e.target.value})} placeholder="Any notes about this ground" rows={3} style={{...iS, resize:"vertical"}}/>
      </div>
    </div>
  )
}

function GroundsPage({ grounds, onRefresh, isMobile }) {
  const [showAdd,setShowAdd]=useState(false)
  const [editG,setEditG]=useState(null)
  const [delG,setDelG]=useState(null)
  const [selectedId,setSelectedId]=useState(null)
  const [busy,setBusy]=useState(false)
  const empty={name:"",location:"",maps_link:"",notes:""}
  const [form,setForm]=useState(empty)
  const [editForm,setEditForm]=useState(empty)
  const selectedGround=grounds.find(g=>g.id===selectedId)||null
  const iS={width:"100%",padding:"11px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",boxSizing:"border-box",fontFamily:"var(--font-body)"}
  const lS={fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600}
  const mStyle={position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:300}
  const mBox={background:"#fff",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"22px 18px":28,width:"100%",maxWidth:isMobile?"100%":480,maxHeight:isMobile?"95vh":"auto",overflowY:"auto",boxSizing:"border-box"}
  const addSubmit=async()=>{
    if(!form.name.trim()||!form.location.trim()){alert("Name and location required");return}
    setBusy(true);try{await addGround(form.name.trim(),form.location.trim(),form.maps_link.trim(),form.notes.trim());setShowAdd(false);setForm(empty);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const editSubmit=async()=>{
    if(!editForm.name.trim()){alert("Name required");return}
    setBusy(true);try{await updateGround(editG.id,{name:editForm.name.trim(),location:editForm.location.trim(),maps_link:editForm.maps_link.trim(),notes:editForm.notes.trim()});setEditG(null);setSelectedId(null);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const delSubmit=async()=>{
    setBusy(true);try{await deleteGround(delG.id);setDelG(null);setSelectedId(null);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{color:"#0B3D2E",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)"}}>Grounds ({grounds.length})</h2>
        <Btn variant="green" size={isMobile?"sm":"md"} onClick={()=>{setForm(empty);setShowAdd(true)}}>+ Add Ground</Btn>
      </div>
      <SearchDropdown
        options={grounds.map(g=>({...g,label:g.name+" — "+g.location}))}
        value={selectedId}
        onChange={id=>setSelectedId(id===selectedId?null:id)}
        placeholder="Search ground by name or location..."
        renderOption={o=>(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,border:"1px solid #bbf7d0"}}>📍</div>
            <div><div style={{fontWeight:700,fontSize:13}}>{o.name}</div><div style={{fontSize:11,color:"#9ca3af"}}>{o.location}</div></div>
          </div>
        )}
        renderSelected={o=>(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>📍</span>
            <span style={{fontWeight:700,fontSize:13}}>{o.name} — {o.location}</span>
          </div>
        )}
      />
      {selectedGround ? (
        <div style={{marginTop:12}}>
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"18px",border:"2px solid #1D9E75"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:"2px solid #6ee7b7"}}>📍</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:17,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>{selectedGround.name}</div>
                <div style={{fontSize:13,color:"#6b7280",marginTop:3}}>📌 {selectedGround.location}</div>
              </div>
              <button onClick={()=>setSelectedId(null)} style={{background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer",padding:0,flexShrink:0}}>×</button>
            </div>
            {selectedGround.maps_link&&(
              <a href={selectedGround.maps_link} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"#F5E6C8",borderRadius:10,border:"1px solid #E3C888",marginBottom:12,textDecoration:"none"}}>
                <span style={{fontSize:18}}>🗺️</span>
                <span style={{fontSize:13,color:"#7A4F13",fontWeight:600}}>Open in Google Maps</span>
                <span style={{marginLeft:"auto",color:"#93c5fd",fontSize:12}}>↗</span>
              </a>
            )}
            {selectedGround.notes&&(
              <div style={{padding:"10px 12px",background:"#fefce8",borderRadius:10,border:"1px solid #fde68a",marginBottom:14,fontSize:13,color:"#78350f",lineHeight:1.6}}>
                📝 {selectedGround.notes}
              </div>
            )}
            {!selectedGround.maps_link&&!selectedGround.notes&&(
              <div style={{fontSize:12,color:"#9ca3af",marginBottom:14}}>No map link or notes added yet.</div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button onClick={()=>{setEditG(selectedGround);setEditForm({name:selectedGround.name,location:selectedGround.location,maps_link:selectedGround.maps_link||"",notes:selectedGround.notes||""})}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #dbeafe",background:"#F5E6C8",color:"#7A4F13",fontSize:13,cursor:"pointer",fontWeight:700}}>✏️ Edit</button>
              <button onClick={()=>setDelG(selectedGround)} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#991b1b",fontSize:13,cursor:"pointer",fontWeight:700}}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{marginTop:12,padding:"14px 16px",background:"#f9fafb",borderRadius:12,border:"1.5px solid #e5e7eb",textAlign:"center",color:"#9ca3af",fontSize:13}}>
          Search or select a ground above to view details
        </div>
      )}
      {showAdd&&<div style={mStyle}><div style={mBox}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Add Ground</h3><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div><GForm f={form} setF={setForm}/><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={addSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Adding...":"Add Ground"}</button></div></div></div>}
      {editG&&<div style={mStyle}><div style={mBox}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Edit Ground</h3><button onClick={()=>setEditG(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div><GForm f={editForm} setF={setEditForm}/><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setEditG(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={editSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Save"}</button></div></div></div>}
      {delG&&<div style={mStyle}><div style={{...mBox,maxWidth:360}}><div style={{textAlign:"center",padding:"10px 0 18px"}}><div style={{fontSize:40,marginBottom:12}}>⚠️</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Delete Ground?</h3><p style={{color:"#6b7280",fontSize:13,margin:0}}>Delete <strong>{delG.name}</strong>?</p></div><div style={{display:"flex",gap:10}}><button onClick={()=>setDelG(null)} style={{flex:1,padding:"13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={delSubmit} disabled={busy} style={{flex:1,padding:"13px",borderRadius:9,background:"#fee2e2",border:"1.5px solid #fecaca",color:"#991b1b",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"...":"Yes, Delete"}</button></div></div></div>}
    </div>
  )
}

function ContributionsSection({ player, isMobile }) {
  const [contribs, setContribs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const c = await fetchContributions(player.id); setContribs(c) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [player.id])

  const total = contribs.reduce((s, c) => s + Number(c.amount), 0)

  const save = async () => {
    if (!amount || Number(amount) <= 0) { alert("Enter a valid amount"); return }
    setSaving(true)
    try {
      await addContribution(player.id, Number(amount), note.trim() || "Manual entry", date, null)
      setAmount(""); setNote(""); setShowAdd(false); await load()
    } catch(e) { alert(e.message) }
    setSaving(false)
  }
  const remove = async (id) => {
    if (!confirm("Delete this contribution?")) return
    try { await deleteContribution(id); await load() } catch(e) { alert(e.message) }
  }
  const fmtD = (d) => { try { return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) } catch { return d } }

  return (
    <div style={{ marginTop:12, padding:"14px", background:"#fafafa", borderRadius:12, border:"1px solid #e5e7eb" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>💰 Contributions</div>
        <div style={{ fontWeight:900, fontSize:18, color:"#1D9E75", fontFamily:"var(--font-head)" }}>₹{total}</div>
      </div>
      {loading ? (
        <div style={{ fontSize:12, color:"#9ca3af", padding:"8px 0" }}>Loading...</div>
      ) : contribs.length === 0 ? (
        <div style={{ fontSize:12, color:"#9ca3af", padding:"8px 0" }}>No contributions recorded yet.</div>
      ) : (
        <div style={{ display:"grid", gap:6, marginBottom:10 }}>
          {contribs.map(c => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 11px", background:"#fff", borderRadius:8, border:"1px solid #f3f4f6" }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#065f46", minWidth:55 }}>₹{c.amount}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, color:"#374151", fontWeight:600 }}>{c.note || "—"}</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>{fmtD(c.date)}</div>
              </div>
              <button onClick={()=>remove(c.id)} style={{ background:"none", border:"none", color:"#d1d5db", cursor:"pointer", fontSize:14, flexShrink:0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      {showAdd ? (
        <div style={{ display:"grid", gap:8, marginTop:8 }}>
          <div style={{ display:"flex", gap:8 }}>
            <input value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,""))} placeholder="Amount ₹" type="number" style={{ flex:1, padding:"9px 11px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
            <input value={date} onChange={e=>setDate(e.target.value)} type="date" style={{ flex:1, padding:"9px 11px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (e.g. match name)" style={{ padding:"9px 11px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowAdd(false)} style={{ flex:1, padding:"9px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#fff", fontSize:13, cursor:"pointer" }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:"9px", borderRadius:8, background:"#0B3D2E", border:"none", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:700 }}>{saving?"Saving...":"Add Contribution"}</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:"100%", padding:"9px", borderRadius:8, background:"#f0fdf4", border:"1px solid #6ee7b7", color:"#065f46", fontSize:13, cursor:"pointer", fontWeight:700 }}>+ Add Manual Entry</button>
      )}
    </div>
  )
}

function PlayersPage({ players, onRefresh, isMobile }) {
  const [showAdd,setShowAdd]=useState(false)
  const [editP,setEditP]=useState(null)
  const [pinP,setPinP]=useState(null)
  const [delP,setDelP]=useState(null)
  const [selectedId,setSelectedId]=useState(null)
  const [form,setForm]=useState({firstName:"",lastName:"",phone:"",pin:""})
  const [editForm,setEditForm]=useState({name:"",phone:"",pin:""})
  const [newPin,setNewPin]=useState("")
  const [busy,setBusy]=useState(false)
  const selectedPlayer=players.find(p=>p.id===selectedId)||null
  const iS={width:"100%",padding:"11px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",boxSizing:"border-box",fontFamily:"var(--font-body)"}
  const lS={fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600}
  const mStyle={position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:300}
  const mBox={background:"#fff",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"22px 18px":28,width:"100%",maxWidth:isMobile?"100%":420,maxHeight:isMobile?"95vh":"auto",overflowY:"auto",boxSizing:"border-box"}
  const addSubmit=async()=>{
    if(!form.firstName?.trim()){alert("First name required");return}
    if(!form.lastName?.trim()){alert("Last name required");return}
    if(!form.phone||form.phone.length<10){alert("Enter valid 10-digit phone");return}
    if(!form.pin||form.pin.length!==4){alert("PIN must be 4 digits");return}
    const cleanedNew=form.phone.replace(/[^0-9]/g,"").slice(-10)
    if(players.find(p=>p.phone&&p.phone.replace(/[^0-9]/g,"").slice(-10)===cleanedNew)){alert("A player with this number already exists.");return}
    setBusy(true);try{const {addPlayer}=await import("../db.js");await addPlayer(form.firstName.trim()+" "+form.lastName.trim(),form.phone.trim(),form.pin);setForm({firstName:"",lastName:"",phone:"",pin:""});setShowAdd(false);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const editSubmit=async()=>{
    if(!editForm.name.trim()){alert("Name required");return}
    setBusy(true);try{const {updatePlayer}=await import("../db.js");await updatePlayer(editP.id,editForm.name.trim(),editForm.phone.trim(),editForm.pin);setEditP(null);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const pinSubmit=async()=>{
    if(!newPin||newPin.length!==4){alert("PIN must be 4 digits");return}
    setBusy(true);try{const {updatePlayer}=await import("../db.js");await updatePlayer(pinP.id,pinP.name,pinP.phone,newPin);setPinP(null);setNewPin("");onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const delSubmit=async()=>{
    setBusy(true);try{const {deletePlayer}=await import("../db.js");await deletePlayer(delP.id);setDelP(null);setSelectedId(null);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{color:"#0B3D2E",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)"}}>Players ({players.length})</h2>
        <Btn variant="green" size={isMobile?"sm":"md"} onClick={()=>setShowAdd(true)}>+ Add Player</Btn>
      </div>
      <SearchDropdown
        options={players}
        value={selectedId}
        onChange={id=>setSelectedId(id===selectedId?null:id)}
        placeholder="🔍 Search player by name or phone..."
        renderOption={o=><div style={{display:"flex",alignItems:"center",gap:10}}><Av name={o.name} id={o.id} sz={32}/><div><div style={{fontWeight:700,fontSize:13}}>{o.name}</div><div style={{fontSize:11,color:"#9ca3af"}}>📱 {o.phone||"No phone"}</div></div></div>}
        renderSelected={o=><div style={{display:"flex",alignItems:"center",gap:8}}><Av name={o.name} id={o.id} sz={24}/><span style={{fontWeight:700,fontSize:13}}>{o.name}</span></div>}
      />
      {selectedPlayer?(
        <div style={{marginTop:12}}>
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"16px 18px",border:"2px solid #1D9E75"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <Av name={selectedPlayer.name} id={selectedPlayer.id} sz={52}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:16,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>{selectedPlayer.name}</div>
                <div style={{fontSize:12,color:"#6b7280",marginTop:3}}>📱 {selectedPlayer.phone||"No phone"}</div>
                <div style={{fontSize:12,marginTop:4}}><span style={{color:"#9ca3af"}}>PIN: </span><span style={{background:"#d1fae5",color:"#065f46",padding:"2px 10px",borderRadius:5,fontWeight:800,fontSize:14}}>{selectedPlayer.pin}</span></div>
              </div>
              <button onClick={()=>setSelectedId(null)} style={{background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer",padding:0,flexShrink:0}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <button onClick={()=>{setEditP(selectedPlayer);setEditForm({name:selectedPlayer.name,phone:selectedPlayer.phone||"",pin:selectedPlayer.pin})}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #dbeafe",background:"#F5E6C8",color:"#7A4F13",fontSize:13,cursor:"pointer",fontWeight:700}}>Edit</button>
              <button onClick={()=>{setPinP(selectedPlayer);setNewPin("")}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #fde68a",background:"#fefce8",color:"#78350f",fontSize:13,cursor:"pointer",fontWeight:700}}>PIN</button>
              <button onClick={()=>setDelP(selectedPlayer)} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#991b1b",fontSize:13,cursor:"pointer",fontWeight:700}}>Remove</button>
            </div>
            <ContributionsSection player={selectedPlayer} isMobile={isMobile}/>
          </div>
        </div>
      ):(
        <div style={{marginTop:12,padding:"14px 16px",background:"#f9fafb",borderRadius:12,border:"1.5px solid #e5e7eb",textAlign:"center",color:"#9ca3af",fontSize:13}}>
          Search or select a player above to view details
        </div>
      )}
      {showAdd&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Add New Player</h3><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div>
        <div style={{display:"grid",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lS}>First Name</label><input value={form.firstName||""} onChange={e=>setForm({...form,firstName:e.target.value.replace(/[^a-zA-Z]/g,"").replace(/^(.)(.*)$/, (m,a,b)=>a.toUpperCase()+b.toLowerCase())})} placeholder="Aquib" style={iS}/></div>
            <div><label style={lS}>Last Name</label><input value={form.lastName||""} onChange={e=>setForm({...form,lastName:e.target.value.replace(/[^a-zA-Z]/g,"").replace(/^(.)(.*)$/, (m,a,b)=>a.toUpperCase()+b.toLowerCase())})} placeholder="Javed" style={iS}/></div>
          </div>
          <div><label style={lS}>Mobile</label>
            <div style={{display:"flex",gap:8}}><div style={{padding:"11px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#f3f4f6",fontSize:14,fontWeight:600,color:"#374151",flexShrink:0}}>+91</div><input type="tel" value={form.phone||""} onChange={e=>setForm({...form,phone:e.target.value.replace(/[^0-9]/g,"").slice(0,10)})} placeholder="10 digit number" style={{...iS,flex:1}}/></div>
            {form.phone&&form.phone.length!==10&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>Must be 10 digits</div>}
          </div>
          <div><label style={lS}>PIN (4 digits)</label>
            <input type="tel" inputMode="numeric" pattern="[0-9]*" value={form.pin||""} onChange={e=>setForm({...form,pin:e.target.value.replace(/[^0-9]/g,"").slice(0,4)})} maxLength={4} placeholder="4 digit PIN" style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center"}}/>
            {form.pin&&form.pin.length!==4&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>Must be 4 digits</div>}
          </div>
        </div>
        <div style={{padding:"10px 12px",background:"#f0fdf4",borderRadius:9,border:"1px solid #bbf7d0",marginTop:14,fontSize:12,color:"#065f46"}}>Send PIN to player on WhatsApp after adding.</div>
        <div style={{display:"flex",gap:10,marginTop:16}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={addSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Adding...":"Add Player"}</button></div>
      </div></div>}
      {editP&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Edit Player</h3><button onClick={()=>setEditP(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div>
        <div style={{display:"grid",gap:14}}>
          <div><label style={lS}>Full Name</label><input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} style={iS}/></div>
          <div><label style={lS}>Mobile</label><input type="tel" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value.replace(/[^0-9+]/g,"").slice(0,13)})} style={iS}/></div>
          <div><label style={lS}>PIN</label><input type="tel" inputMode="numeric" pattern="[0-9]*" value={editForm.pin} onChange={e=>setEditForm({...editForm,pin:e.target.value.replace(/[^0-9]/g,"").slice(0,4)})} maxLength={4} style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center"}}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setEditP(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={editSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Save"}</button></div>
      </div></div>}
      {pinP&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Change PIN</h3><button onClick={()=>setPinP(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div>
        <div style={{padding:"12px 14px",background:"#f0fdf4",borderRadius:10,border:"1px solid #6ee7b7",marginBottom:16,fontSize:13,color:"#065f46"}}>Changing PIN for <strong>{pinP.name}</strong></div>
        <label style={lS}>New 4-digit PIN</label>
        <input type="tel" inputMode="numeric" pattern="[0-9]*" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="Enter new PIN" style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center",marginBottom:8}}/>
        {newPin&&newPin.length!==4&&<div style={{fontSize:11,color:"#ef4444",marginBottom:8}}>Must be 4 digits</div>}
        <div style={{display:"flex",gap:10,marginTop:8}}><button onClick={()=>setPinP(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={pinSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Update PIN"}</button></div>
      </div></div>}
      {delP&&<div style={mStyle}><div style={{...mBox,maxWidth:360}}>
        <div style={{textAlign:"center",padding:"10px 0 18px"}}><div style={{fontSize:40,marginBottom:12}}>⚠️</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)"}}>Remove Player?</h3><p style={{color:"#6b7280",fontSize:13,margin:0}}>Remove <strong>{delP.name}</strong>?</p></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setDelP(null)} style={{flex:1,padding:"13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={delSubmit} disabled={busy} style={{flex:1,padding:"13px",borderRadius:9,background:"#fee2e2",border:"1.5px solid #fecaca",color:"#991b1b",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"...":"Yes, Remove"}</button></div>
      </div></div>}
    </div>
  )
}

// ─── My Availability ──────────────────────────────────────────────────────────
function RequestsPage({ onRefresh, isMobile }) {
  return (
    <div>
      <BackBtn onBack={()=>{}} label="Dashboard" hide/>
      <h2 style={{ color:"#0B3D2E", fontSize:isMobile?18:22, fontWeight:900, margin:"0 0 16px", fontFamily:"var(--font-head)" }}>Registration Requests</h2>
      <PendingApprovals onRefresh={onRefresh} isMobile={isMobile} showEmpty/>
    </div>
  )
}

function PendingApprovals({ onRefresh, isMobile, showEmpty }) {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(null)

  const load = async () => {
    setLoading(true)
    try { setPending(await fetchPendingPlayers()) } catch(e) { console.error(e) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const approve = async (id) => {
    setBusy(id)
    try { await approvePlayer(id); await load(); onRefresh() } catch(e) { alert(e.message) }
    setBusy(null)
  }
  const reject = async (id) => {
    if (!confirm("Reject this registration? This cannot be undone.")) return
    setBusy(id)
    try { await rejectPlayer(id); await load() } catch(e) { alert(e.message) }
    setBusy(null)
  }

  if (loading) return null
  if (pending.length === 0) {
    if (showEmpty) return <div style={{ background:"#fff", borderRadius:14, padding:"32px 16px", border:"1.5px solid #e5e7eb", textAlign:"center", color:"#9ca3af" }}><div style={{ fontSize:36, marginBottom:10 }}>✅</div><div style={{ fontSize:14 }}>No pending registration requests</div></div>
    return null
  }

  return (
    <div style={{ background:"#fff7ed", borderRadius:14, padding:"16px", border:"1.5px solid #fed7aa", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:18 }}>⏳</span>
        <div style={{ fontWeight:800, fontSize:14, color:"#9a3412", fontFamily:"var(--font-head)" }}>Pending Approvals</div>
        <div style={{ background:"#f97316", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{pending.length}</div>
      </div>
      <div style={{ display:"grid", gap:8 }}>
        {pending.map(p => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#fff", borderRadius:10, border:"1px solid #fed7aa" }}>
            <Av name={p.name} id={p.id} sz={36}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:"#0B3D2E" }}>{p.name}</div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>📱 {p.phone}</div>
            </div>
            <button onClick={()=>approve(p.id)} disabled={busy===p.id} style={{ padding:"7px 12px", borderRadius:8, background:"#1D9E75", border:"none", color:"#fff", fontSize:12, cursor:"pointer", fontWeight:700, flexShrink:0 }}>{busy===p.id?"...":"✔ Approve"}</button>
            <button onClick={()=>reject(p.id)} disabled={busy===p.id} style={{ padding:"7px 12px", borderRadius:8, background:"#fee2e2", border:"1px solid #fca5a5", color:"#991b1b", fontSize:12, cursor:"pointer", flexShrink:0 }}>Reject</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyAvailability({ matches, players, loggedPlayer, isMobile }) {
  const [myMatches, setMyMatches] = useState([])
  const [loading, setLoading]     = useState(false)
  const [expanded, setExpanded]   = useState(true)

  // Auto-use logged in player
  const myPlayer = loggedPlayer?.id ? loggedPlayer : null
  const pendingCount = myMatches.filter(m => m.status === "pending").length

  const loadMyMatches = async () => {
    if (!myPlayer?.id) return
    setLoading(true)
    try {
      const { fetchMatchPlayers } = await import("../db.js")
      const results = []
      for (const m of matches.filter(x => x.status === "upcoming")) {
        const mps = await fetchMatchPlayers(m.id)
        const row = mps.find(mp => mp.player_id === myPlayer.id)
        if (row) results.push({ match:m, status:row.status })
      }
      setMyMatches(results)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadMyMatches() }, [myPlayer?.id, matches.length])

  const respond = async (matchId, status) => {
    try {
      const { setPlayerStatus } = await import("../db.js")
      await setPlayerStatus(matchId, myPlayer.id, status)
      loadMyMatches()
    } catch(e) { alert(e.message) }
  }

  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #e5e7eb", overflow:"hidden" }}>
      <div onClick={()=>setExpanded(e=>!e)} style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", background:pendingCount>0?"#fff7ed":"#fff" }}>
        <span style={{ fontSize:18 }}>🏏</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>My Availability</div>
          {myPlayer && <div style={{ fontSize:11, color:"#6b7280", marginTop:1 }}>As {myPlayer.name} · {myMatches.length} invite{myMatches.length!==1?"s":""}</div>}
        </div>
        {pendingCount > 0 && (
          <div style={{ background:"#f97316", color:"#fff", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{pendingCount} pending</div>
        )}
        <span style={{ color:"#9ca3af", fontSize:12 }}>{expanded?"▲":"▼"}</span>
      </div>

      {expanded && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid #f3f4f6" }}>
          {!myPlayer ? (
            <div style={{ padding:"16px 0", textAlign:"center", color:"#9ca3af", fontSize:13 }}>
              No player profile linked to your account yet.
            </div>
          ) : loading ? (
            <div style={{ padding:"16px 0", textAlign:"center", color:"#9ca3af", fontSize:13 }}>Loading...</div>
          ) : myMatches.length === 0 ? (
            <div style={{ padding:"16px 0", textAlign:"center", color:"#9ca3af", fontSize:13 }}>No upcoming match invites for you.</div>
          ) : (
            myMatches.map(({match:m, status}) => (
              <div key={m.id} style={{ padding:"11px 12px", borderRadius:12, border:`1.5px solid ${status==="confirmed"?"#6ee7b7":status==="declined"?"#fca5a5":"#fde68a"}`, background:status==="confirmed"?"#f0fdf4":status==="declined"?"#fff5f5":"#fefce8", marginBottom:10, marginTop:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:status==="pending"?10:0 }}>
                  <TeamAv name={m.team} logo={m.team_logo} size={34}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#0B3D2E", fontFamily:"var(--font-head)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{m.team}</div>
                    <div style={{ fontSize:11, color:"#6b7280" }}>{fmtDate(m.date)} · {m.time_slot}</div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:status==="confirmed"?"#065f46":status==="declined"?"#991b1b":"#78350f", flexShrink:0 }}>
                    {status==="confirmed"?"✅ In":status==="declined"?"❌ Out":"⚡ Respond"}
                  </div>
                </div>
                {status==="pending" && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <button onClick={()=>respond(m.id,"confirmed")} style={{ padding:"8px", borderRadius:8, background:"#1D9E75", border:"none", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-body)" }}>✅ Available</button>
                    <button onClick={()=>respond(m.id,"declined")} style={{ padding:"8px", borderRadius:8, background:"#fee2e2", border:"1px solid #fca5a5", color:"#991b1b", fontSize:13, cursor:"pointer", fontFamily:"var(--font-body)" }}>❌ Can't Make It</button>
                  </div>
                )}
                {status !== "pending" && (
                  <button onClick={()=>respond(m.id,"pending")} style={{ fontSize:11, color:"#9ca3af", background:"none", border:"none", cursor:"pointer", padding:"4px 0", textDecoration:"underline" }}>Change response</button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}


export function CalendarPage({ matches, teams, grounds, onNavigate, isMobile }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)
  const agendaRef = useRef(null)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = new Date(year, month).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  const ds = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  // Matches grouped by date
  const matchesByDate = {}
  matches.forEach(m => { if (m.date) { (matchesByDate[m.date] = matchesByDate[m.date] || []).push(m) } })

  const prevMonth = () => { const d = new Date(year, month - 1); setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDate(null) }
  const nextMonth = () => { const d = new Date(year, month + 1); setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDate(null) }

  // Upcoming matches (from today), sorted
  const upcoming = [...matches].filter(m => m.status !== "completed" && m.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date))
  const agendaMatches = selectedDate ? (matchesByDate[selectedDate] || []) : upcoming

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const fmtNice = (dstr) => { try { return new Date(dstr).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) } catch { return dstr } }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#0B3D2E", fontSize: isMobile ? 17 : 20, fontWeight: 800, margin: 0, fontFamily: "var(--font-head)" }}>📅 Calendar</h2>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={prevMonth} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14 }}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0B3D2E", minWidth: 120, textAlign: "center" }}>{monthName}</span>
          <button onClick={nextMonth} style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14 }}>›</button>
        </div>
      </div>

      {/* Calendar grid */}
      <Card style={{ padding: isMobile ? 12 : 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: isMobile ? 10 : 11, fontWeight: 700, color: "#9ca3af", padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={"e" + i}/>
            const dateStr = ds(d)
            const dayMatches = matchesByDate[dateStr] || []
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const hasMatch = dayMatches.length > 0
            return (
              <div key={d} onClick={() => { setSelectedDate(isSelected ? null : dateStr); if (!isSelected) setTimeout(() => agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50) }} style={{
                height: isMobile ? 40 : 52, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                borderRadius: 8, cursor: "pointer", position: "relative",
                background: isSelected ? "#0B3D2E" : hasMatch ? "#f0fdf4" : "transparent",
                border: isToday ? "1.5px solid #1D9E75" : "1.5px solid transparent",
              }}>
                <span style={{ fontSize: isMobile ? 12 : 14, fontWeight: hasMatch ? 800 : 500, color: isSelected ? "#fff" : hasMatch ? "#065f46" : "#374151" }}>{d}</span>
                {hasMatch && <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "#6ee7b7" : "#1D9E75", position: "absolute", bottom: isMobile ? 4 : 6 }}/>}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Agenda */}
      <div ref={agendaRef} style={{ marginBottom: 10, fontSize: 14, fontWeight: 800, color: "#0B3D2E", fontFamily: "var(--font-head)", scrollMarginTop: 70 }}>
        {selectedDate ? `Matches on ${fmtNice(selectedDate)}` : "Upcoming Matches"}
        {selectedDate && <button onClick={() => setSelectedDate(null)} style={{ marginLeft: 10, fontSize: 12, color: "#1D9E75", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Show all</button>}
      </div>
      {agendaMatches.length === 0 ? (
        <Card style={{ padding: "24px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>{selectedDate ? "No matches on this day." : "No upcoming matches."}</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {agendaMatches.map(m => (
            <div key={m.id} onClick={() => onNavigate("matches", m.id)} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", cursor: "pointer", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f0fdf4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, color: "#065f46", fontWeight: 700, textTransform: "uppercase" }}>{new Date(m.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                  <span style={{ fontSize: 16, color: "#0B3D2E", fontWeight: 900, lineHeight: 1 }}>{new Date(m.date).getDate()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: "#0B3D2E", fontSize: 14, fontFamily: "var(--font-head)" }}>{m.team}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>⏰ {m.time_slot}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>📍 {m.ground}</div>
                </div>
                <Tag col={m.status === "upcoming" ? "blue" : m.status === "completed" ? "green" : "gray"}>{m.status}</Tag>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function AdminProfilePage({ loggedPlayer, players, matches, grounds, teams, onRefresh, isMobile }) {
  const [editing, setEditing] = useState(false)
  const [pForm, setPForm] = useState({ name: loggedPlayer?.name || "", phone: loggedPlayer?.phone || "", pin: loggedPlayer?.pin || "", city: loggedPlayer?.city || "" })
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[["Players", players.length, "#F5E6C8", "#7A4F13"], ["Matches", matches.length, "#f0fdf4", "#065f46"], ["Grounds", grounds.length, "#ede9fe", "#5b21b6"], ["Teams", teams.length, "#fffbeb", "#92400e"]].map(([label, val, bg, col]) => (
          <div key={label} style={{ padding: "14px 8px", background: bg, borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: col, fontFamily: "var(--font-head)" }}>{val}</div>
            <div style={{ fontSize: 10, color: col, fontWeight: 600 }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <Card style={{ padding: "16px", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", background: "#0B3D2E", display: "inline-block", padding: "6px 14px", borderRadius: 8, fontFamily: "var(--font-head)" }}>👑 Admin</div>
      </Card>
      <Card style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>👤 My Profile</div>
          {!editing && <button onClick={() => { setPForm({ name: loggedPlayer.name, phone: loggedPlayer.phone || "", pin: loggedPlayer.pin, city: loggedPlayer.city || "" }); setEditing(true) }} style={{ padding: "6px 14px", borderRadius: 8, background: "#F5E6C8", border: "1px solid #E3C888", color: "#7A4F13", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Edit</button>}
        </div>
        {editing ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 600 }}>Name</label>
              <input value={pForm.name} onChange={e => setPForm({ ...pForm, name: e.target.value })} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 600 }}>Phone</label>
              <input value={pForm.phone} onChange={e => setPForm({ ...pForm, phone: e.target.value.replace(/[^0-9]/g,"").slice(0,10) })} type="tel" style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 600 }}>City</label>
              <input value={pForm.city} onChange={e => setPForm({ ...pForm, city: e.target.value })} placeholder="e.g. Thane" style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 600 }}>PIN</label>
              <input value={pForm.pin} onChange={e => setPForm({ ...pForm, pin: e.target.value.replace(/[^0-9]/g,"").slice(0,4) })} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", letterSpacing: 6, WebkitTextSecurity: "disc" }}/>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={async () => { try { await updatePlayer(loggedPlayer.id, pForm.name, pForm.phone, pForm.pin, pForm.city); alert("Profile updated! Please log in again to see changes."); setEditing(false); onRefresh() } catch(e) { alert(e.message) } }} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#0B3D2E", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-head)" }}>Save</button>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div><span style={{ fontSize: 11, color: "#9ca3af" }}>Name</span><div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{loggedPlayer?.name}</div></div>
            <div><span style={{ fontSize: 11, color: "#9ca3af" }}>Phone</span><div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{loggedPlayer?.phone}</div></div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Messages Page (Admin → Players) ────────────────────────────────────────────
function MessagesPage({ players, loggedPlayer, isMobile }) {
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [recipient, setRecipient] = useState("all")
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setSent(await fetchSentMessages()) } catch(e) { alert("Load error: "+e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const send = async () => {
    if (!text.trim()) { alert("Message can't be empty"); return }
    setSending(true)
    try {
      const playerId = recipient === "all" ? null : Number(recipient)
      await sendAdminMessage(playerId, loggedPlayer.name || "Admin", text.trim())
      setText("")
      await load()
    } catch(e) { alert(e.message) }
    setSending(false)
  }

  const recipientName = (pid) => {
    if (!pid) return "All Players"
    const p = players.find(pl => pl.id === pid)
    return p ? p.name : "Player #" + pid
  }

  return (
    <div>
      <h2 style={{ fontFamily:"var(--font-head)", color:"#0B3D2E", fontSize:isMobile?18:20, marginBottom:14 }}>📬 Message Players</h2>
      <Card style={{ padding:16, marginBottom:20 }}>
        <DirectMessagesButton player={loggedPlayer} />
      </Card>
      <Card style={{ padding:16, marginBottom:20 }}>
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"#57534E", display:"block", marginBottom:5 }}>Send to</label>
          <select value={recipient} onChange={e=>setRecipient(e.target.value)} style={{ width:"100%", padding:"9px 10px", borderRadius:8, border:"1.5px solid #EDE4D3", fontSize:13, fontFamily:"var(--font-body)" }}>
            <option value="all">All Players</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"#57534E", display:"block", marginBottom:5 }}>Message</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="Type your message..." style={{ width:"100%", padding:"9px 10px", borderRadius:8, border:"1.5px solid #EDE4D3", fontSize:13, fontFamily:"var(--font-body)", resize:"vertical" }}/>
        </div>
        <Btn onClick={send} disabled={sending} variant="green">{sending ? "Sending..." : "Send Message"}</Btn>
      </Card>

      <h3 style={{ fontFamily:"var(--font-head)", color:"#0B3D2E", fontSize:15, marginBottom:10 }}>Sent Messages</h3>
      {loading ? <Spinner/> : sent.length === 0 ? (
        <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"20px 0" }}>No messages sent yet.</div>
      ) : sent.map(m => (
        <Card key={m.id} style={{ padding:"12px 14px", marginBottom:8 }}>
          <div style={{ fontSize:13, color:"#374151", lineHeight:1.5, marginBottom:5 }}>{m.message}</div>
          <div style={{ fontSize:11, color:"#9ca3af" }}>To {recipientName(m.player_id)} · {m.created_at ? new Date(m.created_at).toLocaleString() : ""}{m.read_at ? " · Read" : " · Unread"}</div>
        </Card>
      ))}
    </div>
  )
}
