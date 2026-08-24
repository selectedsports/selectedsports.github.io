import { useState, useEffect, useRef } from "react"
import { Search as SearchIcon } from "lucide-react"
import { Users, User as UserIcon, Calendar, MapPin, Landmark, Clock, Lock, Wallet, Phone, Link as LinkIcon, ShieldCheck, CheckCircle2, XCircle, Hourglass, Zap, Trash2, Trophy, LayoutDashboard, Swords, MessageSquare, LogOut, Bell, BarChart3, ChevronRight, Plus, UserPlus, UsersRound } from "lucide-react"
import { LogoFull, Av, Tag, Btn, Card, Spinner, LeaderboardPage, RoleBadge } from "./ui.jsx"
import { fetchPlayers, fetchGrounds, fetchMatches, fetchTeams, fetchSettings, confirmPlayerToMatch, fetchMyInvites, fetchMatchCounts, fetchPendingPlayers, approvePlayer, rejectPlayer, createMatch, updateMatchStatus, deleteMatch, toggleMatchLink, updateMatchMaxPlayers, fetchMatchPlayers, notifyPlayer, removePlayerFromMatch, setPlayerStatus, fetchPublicResponses, approvePublicResponse, rejectPublicResponse, fetchExpenses, addExpense, deleteExpense, fetchPayments, togglePayment, addContribution, fetchContributions, deleteContribution, contributionExists, fetchChat, sendMessage, subscribeToChat, addGround, updateGround, deleteGround, addTeam, updateTeam, deleteTeam, uploadTeamLogo, fetchSentMessages, sendAdminMessage, fetchPendingProRequests, approveProRequest, rejectProRequest, globalSearch, fetchAuctionPlayers, updateAuctionPlayerBasePrice, deleteAuctionPlayer, fetchAuctionTeams, createAuctionTeam, updateAuctionTeam, deleteAuctionTeam, fetchAuctionState, startAuction, placeBid, undoLastBid, markPlayerSold, markPlayerUnsold, jumpToAuctionPlayer, fetchAuctionBidHistory, fetchAuctionRegistrationOpen, setAuctionRegistrationOpen, fetchRecentActivity, fetchNotifications, fetchUnreadNotificationCount, markNotificationRead, markAllNotificationsRead, fetchAllAuctions, fetchPendingAuctionPayments, approveAuctionPayment, rejectAuctionPayment, deleteAuctionEvent, fetchPlatformUpi, setPlatformUpi } from "../db.js"
import CreateAuctionFlow from "./CreateAuctionFlow.jsx"
import AuctionLiveConsole from "./AuctionLiveConsole.jsx"
import { fmtDate, dayName, PAL, matchTitle, AUCTION_PLANS } from "../constants.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
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
  if (name==="Internal 9v9") return <div style={{ width:size,height:size,borderRadius:12,background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0 }}>🔵</div>
  if (logo) return <img src={logo} alt={name} style={{ width:size,height:size,borderRadius:12,objectFit:"cover",flexShrink:0,border:"2px solid #e5e7eb" }}/>
  return <div style={{ width:size,height:size,borderRadius:12,background:col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:900,color:"#0F172A",flexShrink:0,fontFamily:"var(--font-head)",letterSpacing:"-1px" }}>{ini}</div>
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
            <div style={{ position:"fixed", left:0, right:0, bottom:0, background:"#F8FAF8", borderRadius:"20px 20px 0 0", zIndex:9999, maxHeight:"75vh", display:"flex", flexDirection:"column", boxShadow:"0 -8px 30px rgba(0,0,0,0.3)" }}>
              <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid #f3f4f6" }}>
                <div style={{ width:40, height:4, background:"#e5e7eb", borderRadius:4, margin:"0 auto 14px" }}/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." autoFocus style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", fontSize:15, outline:"none", fontFamily:"var(--font-body)", boxSizing:"border-box", background:"#fafafa" }}/>
              </div>
              <div style={{ overflowY:"auto", flex:1, WebkitOverflowScrolling:"touch" }}>{list}</div>
              {onAddNew && (
                <div onClick={()=>{ setOpen(false); onAddNew() }} style={{ padding:"14px 16px", borderTop:"1px solid #f3f4f6", cursor:"pointer", color:"#166534", fontSize:14, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                  <span>+</span><span>{addNewLabel||"Add new"}</span>
                </div>
              )}
              <button onClick={()=>setOpen(false)} style={{ margin:"8px 16px 16px", padding:"13px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#F8FAF8", color:"#6b7280", fontSize:14, cursor:"pointer", fontWeight:600 }}>Close</button>
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
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"#F8FAF8", borderRadius:10, border:"1.5px solid #e5e7eb", boxShadow:"0 8px 24px rgba(0,0,0,0.12)", zIndex:500, maxHeight:280, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"8px 10px", borderBottom:"1px solid #f3f4f6" }}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." autoFocus style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1.5px solid #e5e7eb", fontSize:13, outline:"none", fontFamily:"var(--font-body)", boxSizing:"border-box" }}/>
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>{list}</div>
          {onAddNew && (
            <div onClick={()=>{ setOpen(false); onAddNew() }} style={{ padding:"10px 12px", borderTop:"1px solid #f3f4f6", cursor:"pointer", color:"#166534", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
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
    <button onClick={onBack} style={{ display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#166534",fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:16,padding:0,fontFamily:"var(--font-body)" }}>
      ← Dashboard
    </button>
  )
}

// ── Main Portal ───────────────────────────────────────────────────────────────
export default function AdminPortal({ onLogout, player: loggedPlayer, isFounder = true }) {
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

  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const loadUnreadCount = () => fetchUnreadNotificationCount().then(setUnreadCount).catch(() => {})
  useEffect(() => { loadUnreadCount() }, [])
  const openNotifications = async () => {
    setNotifOpen(true)
    try { setNotifications(await fetchNotifications()) } catch {}
  }
  const closeNotifications = async () => {
    setNotifOpen(false)
    try { await markAllNotificationsRead(); setUnreadCount(0) } catch {}
  }
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

  if (loading) return <div style={{ minHeight:"100vh",background:"#F8F6EF",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>

  if (invDetail) return (
    <MatchDetailPlayer
      detail={invDetail}
      player={loggedPlayer}
      onBack={() => setInvDetail(null)}
      onRespond={async (action) => { try { await confirmPlayerToMatch(invDetail.match.id, loggedPlayer.id, action); alert(action === "confirmed" ? "You're confirmed for this match! ✅" : "Marked as not available."); await loadInvDetail(invDetail.match); loadInvites() } catch(e) { alert(e.message) } }}
      isMobile={isMobile}
    />
  )

  const bottomNavItems = [
    ["dashboard","Home",LayoutDashboard],["matches","Matches",Swords],
    ["leaderboard","Leaderboard",Trophy],["profile","Profile",UserIcon],
  ]
  const drawerItems = [
    ["players","Players",Users],["teams","Teams",ShieldCheck],["grounds","Grounds",MapPin],["auction","Auction",Wallet],
  ]

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)", paddingBottom:70 }}>
      {/* Top bar */}
      <div style={{ background:"#FFFFFF", height:56, borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", padding:"0 16px", gap:12, position:"sticky", top:0, zIndex:200 }}>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:"transparent", border:"none", color:"#0F172A", fontSize:20, cursor:"pointer", padding:6 }}>☰</button>
        <div onClick={()=>navigate("dashboard")} style={{ flex:1, textAlign:"center", cursor:"pointer", fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Selected Sports</div>
        <button onClick={()=>setSearchOpen(true)} style={{ background:"transparent", border:"none", color:"#166534", cursor:"pointer", padding:6, display:"flex", alignItems:"center" }} title="Search"><SearchIcon size={19}/></button>
        <button onClick={openNotifications} style={{ background:"transparent", border:"none", color:"#166534", cursor:"pointer", padding:6, display:"flex", alignItems:"center", position:"relative" }} title="Notifications">
          <Bell size={19}/>
          {unreadCount > 0 && <span style={{ position:"absolute", top:2, right:2, background:"#EF4444", color:"#FFFFFF", fontSize:9, fontWeight:800, borderRadius:999, minWidth:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
        </button>
      </div>
      {searchOpen && <GlobalSearchOverlay onClose={()=>setSearchOpen(false)} onNavigate={navigate}/>}

      {notifOpen && (
        <div onClick={closeNotifications} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:299 }}>
          <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", top:56, right:16, background:"#FFFFFF", width:320, maxWidth:"calc(100vw - 32px)", maxHeight:400, overflowY:"auto", borderRadius:14, boxShadow:"0 8px 30px rgba(0,0,0,0.18)", padding:"14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>Notifications</div>
              <button onClick={closeNotifications} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af" }}>×</button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", padding:"20px 0" }}>No notifications yet.</div>
            ) : notifications.map(n => (
              <div key={n.id} style={{ padding:"10px 8px", borderBottom:"1px solid #F1F5F9", fontSize:13, color:"#0F172A" }}>
                {n.message}
                <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{timeAgo(n.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hamburger drawer */}
      {menuOpen && (
        <div onClick={()=>setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:299 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", width:260, height:"100%", padding:"20px 14px", boxShadow:"4px 0 24px rgba(0,0,0,0.15)" }}>
            <div onClick={()=>{ setMenuOpen(false); navigate("profile") }} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 8px", borderRadius:10, cursor:"pointer", marginBottom:14, borderBottom:"1px solid #F1F5F9", paddingBottom:16 }}>
              <Av name={loggedPlayer?.name || "Admin"} id={loggedPlayer?.id} sz={36}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, color:"#0F172A", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{loggedPlayer?.name || "Admin"}</div>
                <div style={{ fontSize:11, color:"#94A3B8" }}>View Profile</div>
              </div>
            </div>
            {drawerItems.map(([k,v,Icon]) => (
              <button key={k} onClick={()=>{ setMenuOpen(false); navigate(k) }} style={{ display:"flex", alignItems:"center", gap:11, width:"100%", padding:"12px 10px", borderRadius:10, border:"none", background:page===k?"#166534":"transparent", color:page===k?"#FFFFFF":"#64748B", fontSize:14, fontWeight:page===k?700:500, cursor:"pointer", textAlign:"left", fontFamily:"var(--font-body)", marginBottom:2 }}>
                <Icon size={18}/> {v}
              </button>
            ))}
            <div style={{ borderTop:"1px solid #F1F5F9", marginTop:14, paddingTop:14 }}>
              <button onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:11, width:"100%", padding:"11px 10px", borderRadius:10, border:"none", background:"transparent", color:"#EF4444", fontSize:14, fontWeight:600, cursor:"pointer", textAlign:"left", fontFamily:"var(--font-body)" }}>
                <LogOut size={18}/> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:isMobile?"14px 12px":"22px 18px" }}>
        {page==="profile"   && <><BackBtn onBack={()=>navigate("dashboard")}/><AdminProfilePage loggedPlayer={loggedPlayer} players={players} matches={matches} grounds={grounds} teams={teams} onRefresh={load} isMobile={isMobile} isFounder={isFounder}/></>}
        {page==="dashboard" && <Dashboard invites={invites} onOpenInvite={loadInvDetail} onInviteRespond={async (mid, s) => { try { await confirmPlayerToMatch(mid, loggedPlayer.id, s); loadInvites() } catch(e) { alert(e.message) } }} matches={matches} players={players} grounds={grounds} teams={teams} settings={settings} loggedPlayer={loggedPlayer} onNavigate={navigate} onRefresh={load} isMobile={isMobile}/>}
        {page==="matches"   && <MatchesPage matches={matches} players={players} grounds={grounds} teams={teams} selId={selId} initialFilter={matchFilter} settings={settings} loggedPlayer={loggedPlayer} onNavigate={navigate} onRefresh={load} isMobile={isMobile}/>}
        {page==="players"   && <><BackBtn onBack={()=>navigate("dashboard")}/><PlayersPage players={players} onRefresh={load} isMobile={isMobile} isFounder={isFounder}/></>}
        {page==="teams"     && <><BackBtn onBack={()=>navigate("dashboard")}/><TeamsPage teams={teams} onRefresh={load} isMobile={isMobile}/></>}
        {page==="grounds"   && <><BackBtn onBack={()=>navigate("dashboard")}/><GroundsPage grounds={grounds} onRefresh={load} isMobile={isMobile}/></>}
        {page==="auction"   && <><BackBtn onBack={()=>navigate("dashboard")}/><AuctionPage isMobile={isMobile} isFounder={isFounder}/></>}
        {page==="leaderboard" && <><BackBtn onBack={()=>navigate("dashboard")}/><LeaderboardPage isMobile={isMobile} myId={loggedPlayer?.id}/></>}
      </div>

      {/* Bottom navigation */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#FFFFFF", borderTop:"1px solid #E2E8F0", display:"flex", zIndex:200, boxShadow:"0 -4px 16px rgba(15,23,42,0.06)" }}>
        {bottomNavItems.map(([k,v,Icon]) => (
          <button key={k} onClick={()=>navigate(k)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"9px 4px 8px", border:"none", background:"transparent", cursor:"pointer", color:page===k?"#166534":"#94A3B8" }}>
            <Icon size={20}/>
            <span style={{ fontSize:10, fontWeight:page===k?700:500 }}>{v}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard 
function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function Dashboard({ invites = [], onOpenInvite, onInviteRespond, matches, players, grounds, teams, settings, onNavigate, onRefresh, isMobile, loggedPlayer }) {
  // REDESIGN_MARKER_DASHBOARD_V2
  const [proRequests, setProRequests] = useState([])
  const loadProRequests = async () => { try { setProRequests(await fetchPendingProRequests()) } catch {} }
  useEffect(() => { loadProRequests() }, [])
  const [activity, setActivity] = useState([])
  useEffect(() => { fetchRecentActivity(8).then(setActivity).catch(() => {}) }, [])
  const [dashMatchCounts, setDashMatchCounts] = useState({})
  useEffect(() => { fetchMatchCounts(matches.map(m => m.id)).then(setDashMatchCounts).catch(() => {}) }, [matches])
  const [activityExpanded, setActivityExpanded] = useState(false)
  const [requestsExpanded, setRequestsExpanded] = useState(false)
  const ACTIVITY_ICON = { match_created: Calendar, match_completed: CheckCircle2, player_approved: UserPlus, auction_sold: Trophy }
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

  const BLUE = "#14532D"
  const BLUE_BG = "rgba(22,101,52,0.1)"
  const stats = [
    { label:"Players", sub:"Registered Players", v:players.length, icon:Users, action:()=>onNavigate("players") },
    { label:"Matches",  sub:"Total Matches", v:matches.length, icon:Calendar, action:()=>onNavigate("matches") },
    { label:"Grounds",  sub:"Available Grounds", v:grounds.length, icon:MapPin, action:()=>onNavigate("grounds") },
    { label:"Teams",    sub:"Total Teams", v:teams.length,   icon:UsersRound, action:()=>onNavigate("teams") },
  ]

  const cardStyle = { background:"#FFFFFF", borderRadius:18, padding:"24px", border:"1px solid #E2E8F0", boxShadow:"0 6px 24px rgba(15,23,42,0.06)" }

  const todayStr = new Date().toISOString().split("T")[0]
  const todaysMatches = matches.filter(m => m.date === todayStr && m.status !== "cancelled")
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  return (
    <div>
      {/* Greeting header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color:"#0F172A", fontSize:isMobile?20:26, fontWeight:900, fontFamily:"var(--font-head)" }}>{greeting}, {(loggedPlayer?.name||"Admin").split(" ")[0]}</div>
        <div style={{ fontSize:13, color:"#64748B", marginTop:4, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Calendar size={13}/> {dayName(todayStr)}, {fmtDate(todayStr)}</span>
          <span>·</span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Clock size={13}/> {todaysMatches.length} match{todaysMatches.length!==1?"es":""} today</span>
          <span>·</span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Hourglass size={13}/> {upcoming.length} upcoming</span>
        </div>
      </div>

      {todaysMatches.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Today's Matches</div>
            <button onClick={()=>onNavigate("matches")} style={{ background:"none", border:"none", color:BLUE, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>View All <ChevronRight size={14}/></button>
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {todaysMatches.map(m => {
              const joined = dashMatchCounts[m.id] || 0
              const cap = m.max_players || 0
              return (
                <div key={m.id} onClick={()=>onNavigate("matches", m.id)} style={{ padding:"14px 16px", borderRadius:14, border:`1.5px solid ${BLUE}`, background:BLUE_BG, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1 }}>
                    <Av name={matchTitle(m)} id={m.id} sz={38}/>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{matchTitle(m)}</div>
                      <div style={{ fontSize:12, color:"#64748B", marginTop:2, display:"flex", alignItems:"center", gap:5 }}><Clock size={12}/> {m.time_slot} · <MapPin size={12}/> {m.ground}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"center", flexShrink:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:BLUE, fontFamily:"var(--font-head)" }}>{joined}/{cap || "—"}</div>
                    <div style={{ fontSize:10, color:"#94A3B8" }}>Joined</div>
                  </div>
                  <span style={{ background:BLUE, color:"#FFFFFF", borderRadius:999, padding:"5px 12px", fontSize:11, fontWeight:700, flexShrink:0 }}>Today</span>
                  <ChevronRight size={16} color="#94A3B8" style={{ flexShrink:0 }}/>
                </div>
              )
            })}
          </div>
        </div>
      )}


      {/* Stat Cards — Platform Overview, matching mockup: icon circle, big number, label, sub-label, chevron */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Platform Overview</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:24, marginBottom:24 }}>
        {stats.map((c,i) => (
          <div key={i} onClick={c.action} style={{ ...cardStyle, cursor:"pointer", transition:"transform 0.25s, box-shadow 0.25s, border-color 0.25s", position:"relative" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(15,23,42,0.1)"; e.currentTarget.style.borderColor=BLUE }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(15,23,42,0.06)"; e.currentTarget.style.borderColor="#E2E8F0" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:BLUE_BG, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}><c.icon size={18} color={BLUE}/></div>
            <div style={{ fontSize:isMobile?24:30, fontWeight:700, color:BLUE, fontFamily:"var(--font-head)", lineHeight:1 }}>{c.v}</div>
            <div style={{ fontSize:13, color:"#0F172A", marginTop:4, fontWeight:600 }}>{c.label}</div>
            <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{c.sub}</div>
            <ChevronRight size={16} color={BLUE} style={{ position:"absolute", bottom:16, right:16 }}/>
          </div>
        ))}
      </div>

      {proRequests.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", marginBottom: 14, fontFamily: "var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><ShieldCheck size={17} color={BLUE}/> Pro Access Requests</div>
          <div style={{ display:"grid", gap:12 }}>
            {(requestsExpanded ? proRequests : proRequests.slice(0,3)).map(req => (
              <div key={req.id} style={{ ...cardStyle, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <Av name={req.players?.name || "Player"} id={req.player_id} sz={38}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, fontSize:14, color:"#0F172A" }}>{req.players?.name || "Player"}</span>
                    <span style={{ background:"rgba(184,134,11,0.12)", color:"#B8860B", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:999, textTransform:"uppercase", letterSpacing:0.3 }}>Pro Access</span>
                  </div>
                  <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>Wants to become a Pro organizer · Requested {timeAgo(req.created_at)}</div>
                </div>
                <button onClick={()=>decideProRequest(req, true)} style={{ padding:"7px 14px", borderRadius:8, background:"#22C55E", border:"none", color:"#FFFFFF", fontSize:12, cursor:"pointer", fontWeight:600, flexShrink:0 }}>Approve</button>
                <button onClick={()=>decideProRequest(req, false)} style={{ padding:"7px 14px", borderRadius:8, background:"#FFFFFF", border:"1px solid #EF4444", color:"#EF4444", fontSize:12, cursor:"pointer", fontWeight:600, flexShrink:0 }}>Reject</button>
              </div>
            ))}
          </div>
          {proRequests.length > 3 && (
            <button onClick={()=>setRequestsExpanded(e=>!e)} style={{ width:"100%", padding:"8px", borderRadius:12, border:"1px solid #E2E8F0", background:"transparent", color:BLUE, fontSize:12, cursor:"pointer", fontWeight:600, marginTop:8 }}>
              {requestsExpanded ? "Show less" : `+${proRequests.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {/* Main grid */}
      <div style={{ marginBottom:24 }}>

        <div style={cardStyle}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Calendar size={16} color={BLUE}/> My Matches</div>
            <button onClick={()=>setShowNew(true)} style={{ padding:"6px 14px", borderRadius:12, background:BLUE, border:"none", color:"#FFFFFF", fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"var(--font-body)" }}>+ New</button>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {["upcoming","completed"].map(f => (
              <button key={f} onClick={()=>setInviteFilter(f)} style={{ padding:"6px 14px", borderRadius:8, border:inviteFilter===f?`1px solid ${BLUE}`:"1px solid #E2E8F0", background:inviteFilter===f?BLUE:"#FFFFFF", color:inviteFilter===f?"#FFFFFF":"#64748B", fontSize:12, cursor:"pointer", fontWeight:inviteFilter===f?600:500, fontFamily:"var(--font-body)", textTransform:"capitalize" }}>{f} ({f==="upcoming"?upcoming.length:completed.length})</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap: 12 }}>
            {(() => {
              const myInviteStatusByMatchId = Object.fromEntries(invites.map(({match:m, myStatus}) => [m.id, myStatus]))
              const listSource = inviteFilter === "upcoming" ? upcoming : completed
              if (listSource.length === 0) return <div style={{ color:"#64748B", fontSize:13, textAlign:"center", padding:"16px 0", gridColumn:"1 / -1" }}>No {inviteFilter} matches.</div>
              return listSource.slice(0,4).map(m => {
                const myStatus = myInviteStatusByMatchId[m.id]
                const inviteObj = invites.find(r => r.match.id === m.id)
                const total = (m.max_players || 0) || null
                const joined = null // per-match confirmed count not loaded on this dashboard list
                return (
                  <div key={m.id} onClick={() => inviteObj ? onOpenInvite(m) : onNavigate("matches", m.id)} style={{ padding:"16px", borderRadius:14, border:"1px solid #E2E8F0", cursor:"pointer", transition:"transform 0.25s, box-shadow 0.25s, border-color 0.25s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 25px rgba(15,23,42,0.08)"; e.currentTarget.style.borderColor=BLUE }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="#E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth:0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)" }}>{matchTitle(m)}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 3, display:"flex", alignItems:"center", gap:5 }}><Calendar size={12}/> {fmtDate(m.date)} · <Clock size={12}/> {m.time_slot}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, display:"flex", alignItems:"center", gap:5 }}><MapPin size={12}/> {m.ground}</div>
                      </div>
                      {myStatus ? (
                        <span style={{ background:myStatus==="confirmed"?"#22C55E":myStatus==="waitlist"?"#F59E0B":myStatus==="declined"?"#EF4444":"#F59E0B", color:"#FFFFFF", borderRadius:999, padding:"5px 12px", fontSize:12, fontWeight:600, display:"inline-flex", alignItems:"center", gap:6, flexShrink:0 }}>
                          {myStatus === "confirmed" ? (<><CheckCircle2 size={14}/> Confirmed</>) : myStatus === "waitlist" ? (<><Hourglass size={14}/> Waitlist</>) : myStatus === "declined" ? (<><XCircle size={14}/> Declined</>) : "Pending"}
                        </span>
                      ) : (
                        <span style={{ background:m.status==="completed"?"#0F172A":m.status==="cancelled"?"#EF4444":"#22C55E", color:"#FFFFFF", borderRadius:999, padding:"5px 12px", fontSize:11, fontWeight:600, flexShrink:0, textTransform:"capitalize" }}>{m.status}</span>
                      )}
                    </div>
                    {m.status === "upcoming" && myStatus === "pending" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                        <button onClick={(ev) => { ev.stopPropagation(); onInviteRespond(m.id, "confirmed") }} style={{ padding: "12px", borderRadius: 12, background: BLUE, border: "none", color: "#FFFFFF", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-head)" }}>✅ Available</button>
                        <button onClick={(ev) => { ev.stopPropagation(); onInviteRespond(m.id, "declined") }} style={{ padding: "12px", borderRadius: 12, background: "#FFFFFF", border: "1px solid #EF4444", color: "#EF4444", fontSize: 13, cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-head)" }}>❌ Not Available</button>
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
          {(inviteFilter==="upcoming" ? upcoming.length : completed.length) > 4 && (
            <button onClick={()=>onNavigate("matches",null,inviteFilter)} style={{ width:"100%", padding:"8px", borderRadius:12, border:"1px solid #E2E8F0", background:"transparent", color:BLUE, fontSize:12, cursor:"pointer", fontWeight:600, marginTop:8 }}>
              View all {inviteFilter==="upcoming" ? upcoming.length : completed.length} →
            </button>
          )}
        </div>
      </div>

      {/* Bottom section: Quick Stats + Last Match + Recent Activity */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:24 }}>

        {/* Quick Stats this week — unified blue per design system */}
        <div style={cardStyle}>
          <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", marginBottom:14, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><BarChart3 size={17} color={BLUE}/> This Week</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { label:"Upcoming", v:upcoming.length },
              { label:"Played",   v:completed.length },
              { label:"Players",  v:players.length },
              { label:"Teams",    v:teams.length },
            ].map((s,i) => (
              <div key={i} style={{ padding:"14px 16px", borderRadius:12, background:BLUE_BG }}>
                <div style={{ fontSize:24, fontWeight:700, color:BLUE, fontFamily:"var(--font-head)" }}>{s.v}</div>
                <div style={{ fontSize:12, color:"#64748B", marginTop:3, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity — real feed, icon-per-type */}
        <div style={cardStyle}>
          <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", marginBottom:14, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Clock size={17} color={BLUE}/> Recent Activity</div>
          {activity.length === 0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 16px", textAlign:"center" }}>
              <Clock size={28} color="#E2E8F0" style={{ marginBottom:10 }}/>
              <div style={{ color:"#64748B", fontSize:13, fontWeight:600 }}>No activity yet</div>
              <div style={{ color:"#94A3B8", fontSize:12, marginTop:4, maxWidth:220 }}>Creating matches or approving players will show up here.</div>
            </div>
          ) : (
            <div>
              {(activityExpanded ? activity : activity.slice(0,5)).map((a) => {
                const Icon = ACTIVITY_ICON[a.action] || Clock
                return (
                  <div key={a.id} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:BLUE_BG, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon size={14} color={BLUE}/></div>
                    <div style={{ flex:1, minWidth:0, display:"flex", justifyContent:"space-between", gap:8 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:"#0F172A" }}>{a.summary}</div>
                      <div style={{ fontSize:11, color:"#94A3B8", flexShrink:0, whiteSpace:"nowrap" }}>{timeAgo(a.created_at)}</div>
                    </div>
                  </div>
                )
              })}
              {activity.length > 5 && (
                <button onClick={()=>setActivityExpanded(e=>!e)} style={{ width:"100%", padding:"8px", borderRadius:12, border:"1px solid #E2E8F0", background:"transparent", color:BLUE, fontSize:12, cursor:"pointer", fontWeight:600, marginTop:2 }}>
                  {activityExpanded ? "Show less" : `+${activity.length - 5} more`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:16, color:"#0F172A", marginBottom:14, fontFamily:"var(--font-head)" }}>Quick Actions</div>
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:14 }}>
          {[
            { label:"Create Match", icon:Plus, action:()=>setShowNew(true) },
            { label:"Add Player",   icon:UserPlus, action:()=>onNavigate("players") },
            { label:"Create Team",  icon:UsersRound, action:()=>onNavigate("teams") },
            { label:"Add Ground",   icon:MapPin,   action:()=>onNavigate("grounds") },
          ].map((a,i) => (
            <button key={i} onClick={a.action} style={{ ...cardStyle, padding:"18px 12px", cursor:"pointer", border:"1.5px solid #E2E8F0", display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=BLUE }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="#E2E8F0" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:BLUE_BG, display:"flex", alignItems:"center", justifyContent:"center" }}><a.icon size={18} color={BLUE}/></div>
              <div style={{ fontSize:12, fontWeight:700, color:"#0F172A", fontFamily:"var(--font-head)" }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(5,1fr)", gap:10 }}>
          {[
            { label:"Players",     action:()=>onNavigate("players") },
            { label:"Teams",       action:()=>onNavigate("teams") },
            { label:"Matches",     action:()=>onNavigate("matches") },
            { label:"Grounds",     action:()=>onNavigate("grounds") },
            { label:"Leaderboard", action:()=>onNavigate("leaderboard") },
          ].map((n,i) => (
            <div key={i} onClick={n.action} style={{ padding:"12px 14px", borderRadius:12, border:"1px solid #E2E8F0", background:"#FFFFFF", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:13, fontWeight:600, color:"#0F172A" }}>
              {n.label} <span style={{ color:BLUE }}>→</span>
            </div>
          ))}
        </div>
      </div>

      {showNew && <NewMatchModal grounds={grounds} teams={teams} onClose={()=>setShowNew(false)} onCreated={()=>{setShowNew(false);onRefresh()}} isMobile={isMobile}/>}
    </div>
  )
}

function NewMatchModal({ grounds, teams, onClose, onCreated, isMobile }) {
  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({ date:today, startH:7, startM:"00", endH:9, endM:"00", groundId:"", teamId:teams[0]?.id||"", type:"external", ourTeamId:"", maxPlayers:18 })
  const [busy, setBusy] = useState(false)
  const [teamList, setTeamList] = useState(teams)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [addingTeam, setAddingTeam] = useState(false)
  const [addTeamTarget, setAddTeamTarget] = useState("opponent")

  useEffect(() => {
    fetchAuctionTeams().then(auctionTeams => {
      const mapped = auctionTeams.map(t => ({ id: "auc-" + t.id, name: t.name, logo_url: null, isAuction: true }))
      setTeamList(list => [...list.filter(t => !t.isAuction), ...mapped])
    }).catch(() => {})
  }, [])
  const handleAddTeam = async () => {
    if (!newTeamName.trim()) { alert("Team name required"); return }
    if (teamList.find(t => t.name.toLowerCase() === newTeamName.trim().toLowerCase())) { alert("Team already exists"); return }
    setAddingTeam(true)
    try {
      const created = await addTeam(newTeamName.trim(), null)
      setTeamList([...teamList, created])
      setForm(f => ({ ...f, [addTeamTarget === "our" ? "ourTeamId" : "teamId"]: created.id }))
      setShowAddTeam(false)
      setNewTeamName("")
    } catch(e) { alert(e.message) }
    setAddingTeam(false)
  }
  const selTeam   = teamList.find(t=>String(t.id)===String(form.teamId))
  const selOurTeam = teamList.find(t=>String(t.id)===String(form.ourTeamId))
  const selGround = grounds.find(g=>String(g.id)===String(form.groundId))
  const submit = async () => {
    if(form.type==="external"&&!selTeam){alert("Please select the opponent team");return}
    if(form.type==="external"&&!selOurTeam){alert("Please select which team we're playing as");return}
    if(form.type==="external"&&selTeam&&selOurTeam&&String(selTeam.id)===String(selOurTeam.id)){alert("Our team and the opponent can't be the same team");return}
    if(!selGround){alert("Please select a ground");return}
    setBusy(true)
    const timeSlot = timeSlotStr(form.startH,form.startM,form.endH,form.endM)
    const teamName = form.type==="internal"?`Internal ${form.maxPlayers/2}v${form.maxPlayers/2}`:selTeam.name
    const teamLogo = form.type==="internal"?null:selTeam?.logo_url||null
    const ourTeamName = form.type==="external"?selOurTeam.name:null
    const ourTeamLogo = form.type==="external"?(selOurTeam?.logo_url||null):null
    try { await createMatch({ date:form.date,time_slot:timeSlot,ground:selGround.name,team:teamName,team_logo:teamLogo,our_team:ourTeamName,our_team_logo:ourTeamLogo,type:form.type,max_players:form.maxPlayers }); onCreated() }
    catch(e){alert(e.message)} setBusy(false)
  }
  const lS = { fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600 }
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:300 }}>
      <div style={{ background:"#F8FAF8",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"24px 18px":30,width:"100%",maxWidth:isMobile?"100%":500,maxHeight:isMobile?"95vh":"92vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
          <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)" }}>Schedule New Match</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af" }}>×</button>
        </div>
        <p style={{ margin:"0 0 18px",fontSize:12,color:"#6b7280" }}>No one is notified until you invite them.</p>
        <div style={{ display:"grid",gap:16 }}>
          <div>
            <label style={lS}>Date</label>
            <input type="date" value={form.date} min={today} onChange={e=>setForm({...form,date:e.target.value})} style={{ width:"100%",padding:"11px 12px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:15,boxSizing:"border-box",fontFamily:"var(--font-body)",outline:"none" }}/>
            {form.date&&<div style={{ fontSize:11,color:"#166534",marginTop:4,fontWeight:600 }}>📅 {dayName(form.date)}</div>}
          </div>
          <div>
            <label style={lS}>Match Time</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"end" }}>
              <TimePicker label="Start" hour={form.startH} min={form.startM} onChange={(h,m)=>setForm({...form,startH:h,startM:m})}/>
              <div style={{ textAlign:"center",color:"#9ca3af",fontSize:13,fontWeight:600,paddingBottom:10 }}>to</div>
              <TimePicker label="End" hour={form.endH} min={form.endM} onChange={(h,m)=>setForm({...form,endH:h,endM:m})}/>
            </div>
            <div style={{ fontSize:11,color:"#166534",marginTop:6,fontWeight:600 }}>⏰ {timeSlotStr(form.startH,form.startM,form.endH,form.endM)}</div>
          </div>
          <div>
            <label style={lS}>Ground</label>
            <SearchDropdown options={grounds.map(g=>({...g,label:`${g.name} — ${g.location}`}))} value={form.groundId} onChange={v=>setForm({...form,groundId:v})} placeholder="Select ground..." renderOption={o=><div><div style={{ fontWeight:600,fontSize:13 }}>{o.name}</div><div style={{ fontSize:11,color:"#9ca3af" }}>{o.location}</div></div>} renderSelected={o=><span style={{ fontSize:13,fontWeight:600 }}>{o.name} — {o.location}</span>}/>
          </div>
          <div>
            <label style={lS}>Match Type</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[["external","⚽ External Match","vs another team"],["internal","🔵 Internal Match","within our group"]].map(([v,l,sub])=>(
                <button key={v} onClick={()=>setForm({...form,type:v,ourTeamId:"",maxPlayers:v==="internal"?18:9})} style={{ padding:"12px 8px",borderRadius:9,border:`2px solid ${form.type===v?"#166534":"#e5e7eb"}`,background:form.type===v?"#f0fdf4":"#F8FAF8",color:form.type===v?"#065f46":"#6b7280",cursor:"pointer",fontFamily:"var(--font-body)",textAlign:"center" }}>
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
                  <button key={n} onClick={()=>setForm({...form,maxPlayers:n})} style={{ flex:1,padding:"11px 4px",borderRadius:9,border:`2px solid ${form.maxPlayers===n?"#166534":"#e5e7eb"}`,background:form.maxPlayers===n?"#f0fdf4":"#fafafa",color:form.maxPlayers===n?"#065f46":"#6b7280",fontSize:14,cursor:"pointer",fontWeight:form.maxPlayers===n?800:600,fontFamily:"var(--font-body)" }}>{n}</button>
                ))}
              </div>
              <div style={{ padding:"8px 12px",background:"#F5E6C8",borderRadius:9,border:"1px solid #E3C888",marginBottom:14,fontSize:12,color:"#7A4F13",fontWeight:600 }}>👥 Our squad: {form.maxPlayers} players</div>
              <label style={lS}>Our Team (who we're playing as today)</label>
              <div style={{ marginBottom: 14 }}>
                <SearchDropdown options={teamList} value={form.ourTeamId} onChange={v=>setForm({...form,ourTeamId:v})} placeholder="Select our team..." onAddNew={()=>{setAddTeamTarget("our");setNewTeamName('');setShowAddTeam(true)}} addNewLabel="Add new team" renderOption={o=><div style={{ display:"flex",alignItems:"center",gap:10 }}><TeamAv name={o.name} logo={o.logo_url} size={28}/><span style={{ fontSize:13,fontWeight:600 }}>{o.name}</span>{o.isAuction && <span style={{ fontSize:10,color:"#B8860B",fontWeight:700,marginLeft:6 }}>(Auction Team)</span>}</div>} renderSelected={o=><div style={{ display:"flex",alignItems:"center",gap:8 }}><TeamAv name={o.name} logo={o.logo_url} size={22}/><span style={{ fontSize:13,fontWeight:600 }}>{o.name}</span></div>}/>
              </div>
              <label style={lS}>Opponent Team</label>
              <SearchDropdown options={teamList} value={form.teamId} onChange={v=>setForm({...form,teamId:v})} placeholder="Select team..." onAddNew={()=>{setAddTeamTarget("opponent");setNewTeamName('');setShowAddTeam(true)}} addNewLabel="Add new team" renderOption={o=><div style={{ display:"flex",alignItems:"center",gap:10 }}><TeamAv name={o.name} logo={o.logo_url} size={28}/><span style={{ fontSize:13,fontWeight:600 }}>{o.name}</span>{o.isAuction && <span style={{ fontSize:10,color:"#B8860B",fontWeight:700,marginLeft:6 }}>(Auction Team)</span>}</div>} renderSelected={o=><div style={{ display:"flex",alignItems:"center",gap:8 }}><TeamAv name={o.name} logo={o.logo_url} size={22}/><span style={{ fontSize:13,fontWeight:600 }}>{o.name}</span></div>}/>
            </div>
          )}
          {showAddTeam && (
            <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, padding:16 }} onClick={()=>setShowAddTeam(false)}>
              <div onClick={e=>e.stopPropagation()} style={{ background:"#F8FAF8", borderRadius:16, padding:22, width:"100%", maxWidth:360 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Add New Team</h3>
                  <button onClick={()=>setShowAddTeam(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
                </div>
                <input value={newTeamName} onChange={e=>setNewTeamName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAddTeam()} placeholder="e.g. Dominators" autoFocus style={{ width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:15, outline:"none", background:"#fafafa", boxSizing:"border-box", marginBottom:16, fontFamily:"var(--font-body)" }}/>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setShowAddTeam(false)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
                  <button onClick={handleAddTeam} disabled={addingTeam} style={{ flex:2, padding:"12px", borderRadius:9, background:"#FFFFFF", border:"none", color:"#0F172A", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>{addingTeam?"Adding...":"Add & Select"}</button>
                </div>
              </div>
            </div>
          )}
          {form.type==="internal" && (
            <div>
              <label style={lS}>Total Players</label>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:14 }}>
                {[10,12,14,16,18,20,22].map(n=>(
                  <button key={n} onClick={()=>setForm({...form,maxPlayers:n})} style={{ flex:"1 1 calc(25% - 6px)",padding:"11px 4px",borderRadius:9,border:`2px solid ${form.maxPlayers===n?"#166534":"#e5e7eb"}`,background:form.maxPlayers===n?"#f0fdf4":"#fafafa",color:form.maxPlayers===n?"#065f46":"#6b7280",fontSize:14,cursor:"pointer",fontWeight:form.maxPlayers===n?800:600,fontFamily:"var(--font-body)" }}>{n}</button>
                ))}
              </div>
              <div style={{ padding:"14px 16px",background:"#f0fdf4",borderRadius:12,border:"1.5px solid #6ee7b7" }}>
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:12,background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,color:"#0F172A",fontWeight:800,fontFamily:"var(--font-head)" }}>{form.maxPlayers/2}v{form.maxPlayers/2}</div>
                  <div>
                    <div style={{ fontWeight:800,fontSize:14,color:"#0F172A",fontFamily:"var(--font-head)" }}>Internal {form.maxPlayers/2}v{form.maxPlayers/2}</div>
                    <div style={{ fontSize:12,color:"#065f46",marginTop:2 }}>{form.maxPlayers} players · Two equal sides</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ display:"flex",gap:10,marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1,padding:"13px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"#F8FAF8",color:"#374151",fontSize:14,cursor:"pointer",fontFamily:"var(--font-body)" }}>Cancel</button>
          <button onClick={submit} disabled={busy} style={{ flex:2,padding:"13px",borderRadius:10,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)" }}>{busy?"Creating...":"Create Match →"}</button>
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
        <h2 style={{ color:"#0F172A",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)" }}>Matches</h2>
        {(settings?.subscription_expiry && new Date(settings.subscription_expiry) >= new Date())
          ? <Btn variant="green" size={isMobile?"sm":"md"} onClick={()=>setShowNew(true)}>+ Schedule</Btn>
          : <div onClick={()=>alert("Scheduling requires an active subscription.\nContact admin to renew.")} style={{ padding:isMobile?"7px 12px":"8px 16px",borderRadius:9,background:"#f3f4f6",border:"1.5px solid #e5e7eb",color:"#9ca3af",fontSize:isMobile?12:13,cursor:"pointer",fontWeight:600 }}>🔒 Subscribe</div>
        }
      </div>
      {/* Filter tabs */}
      <div style={{ display:"flex",gap:6,marginBottom:14,background:"#F8FAF8",borderRadius:10,padding:4,border:"1.5px solid #e5e7eb" }}>
        {[["all","All"],["mine","Mine"],["pro","Pro"],["upcoming","Upcoming"],["completed","Played"]].map(([k,v])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{ flex:1,padding:"7px 4px",borderRadius:7,border:"none",background:filter===k?"#FFFFFF":"transparent",color:filter===k?"#0F172A":"#6b7280",fontSize:isMobile?10:12,cursor:"pointer",fontWeight:filter===k?700:400,fontFamily:"var(--font-body)" }}>
            {v} {k!=="all"&&<span style={{ opacity:0.7 }}>({countFor(k)})</span>}
          </button>
        ))}
      </div>
      {filtered.length===0?(
        <Card style={{ padding:"40px 24px",textAlign:"center" }}>
          <div style={{ fontSize:44,marginBottom:10 }}>🏏</div>
          <div style={{ fontWeight:700,fontSize:15,color:"#0F172A",marginBottom:6,fontFamily:"var(--font-head)" }}>No {filter==="all"?"":filter} matches</div>
          <div style={{ color:"#6b7280",fontSize:13 }}>{filter==="upcoming"?"Schedule a new match to get started.":filter==="completed"?"Mark matches as done to see them here.":"No matches found."}</div>
        </Card>
      ):(
        <div style={{ display:"grid",gap:10 }}>
          {filtered.map(m=>(
            <div key={m.id} onClick={()=>loadMatch(m)} style={{ background:"#F8FAF8",borderRadius:18,padding:isMobile?"15px 16px":"18px 22px",cursor:"pointer",border:"1.5px solid #e5e7eb",boxShadow:"0 4px 14px rgba(30,79,175,0.15)",WebkitTapHighlightColor:"rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <TeamAv name={m.team} logo={m.team_logo} size={isMobile?40:48}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:800,color:"#0F172A",fontSize:isMobile?13:15,fontFamily:"var(--font-head)" }}>{matchTitle(m)}</div>
                  <div style={{ color:"#6b7280",fontSize:11,marginTop:2 }}>{fmtDate(m.date)} · {m.time_slot}</div>
                  <div style={{ color:"#9ca3af",fontSize:11,marginTop:1, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/> {m.ground}</div>
                    {(() => {
                      const joined = matchCounts[m.id] || 0
                      const cap = m.max_players || 0
                      const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                      const left = Math.max(0, cap - joined)
                      return (
                        <div style={{ marginTop:8 }} data-adminCardBar>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:"#065f46" }}>{joined}/{cap} joined</span>
                            <span style={{ fontSize:11, fontWeight:600, color:left>0?"#166534":"#991b1b" }}>{left>0?left+" left":"Full"}</span>
                          </div>
                          <div style={{ height:6, background:"#e5e7eb", borderRadius:5, overflow:"hidden" }}>
                            <div style={{ width:pct+"%", height:"100%", background:pct>=100?"#166534":"linear-gradient(90deg,#6ee7b7,#166534)", borderRadius:5 }}/>
                          </div>
                        </div>
                      )
                    })()}
                  {m.created_by && (()=>{ const creator = players.find(p=>p.id===m.created_by); return creator && creator.role==="pro" ? <div style={{ color:"#7c3aed",fontSize:11,marginTop:3,fontWeight:700 }}>⭐ Scheduled by {creator.name}</div> : null })()}
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end",flexShrink:0 }}>
                  {!isMobile&&<Tag col="gray">{m.type}</Tag>}
                  {m.link_active&&<Tag col="green"><LinkIcon size={11} style={{verticalAlign:"-1px"}}/></Tag>}
                  <span style={{ background:m.status==="upcoming"?"#166534":m.status==="completed"?"#64748B":"#EF4444", color:"#FFFFFF", borderRadius:999, padding:"4px 12px", fontSize:11, fontWeight:700, textTransform:"capitalize", display:"inline-block" }}>{m.status}</span>
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
      <button onClick={onBack} style={{ background:"none",border:"none",color:"#166534",fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:14,padding:0,fontFamily:"var(--font-body)" }}>← All Matches</button>
      <Card style={{ overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(135deg,rgba(22,101,52,0.08),rgba(22,101,52,0.02))",padding:isMobile?"18px 16px":"24px 26px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
            <div style={{ display:"flex",gap:14,alignItems:"flex-start",flex:1,minWidth:0 }}>
              <TeamAv name={m.team} logo={m.team_logo} size={isMobile?48:60}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ color:"#94A3B8",fontSize:11,marginBottom:3 }}>{fmtDate(m.date)}</div>
                <h2 style={{ color:"#0F172A",fontSize:isMobile?17:22,fontWeight:900,margin:"0 0 4px",fontFamily:"var(--font-head)" }}>{matchTitle(m)}</h2>
                <div style={{ color:"#64748B",fontSize:12, display:"flex", alignItems:"center", gap:5 }}><MapPin size={12}/> {m.ground} · <Clock size={12}/> {m.time_slot}</div>
                <div style={{ display:"flex",gap:6,marginTop:10,flexWrap:"wrap" }}>
                  <span style={{ background:m.type==="internal"?"#0F766E":"#FBBF24", color:"#FFFFFF", borderRadius:7, padding:"4px 11px", fontSize:11, fontWeight:700, display:"inline-block" }}>{m.type==="internal"?"Internal 9v9":"External"}</span>
                  <span style={{ background:m.status==="upcoming"?"#166534":m.status==="completed"?"#64748B":"#EF4444", color:"#FFFFFF", borderRadius:999, padding:"4px 12px", fontSize:11, fontWeight:700, textTransform:"capitalize", display:"inline-block" }}>{m.status}</span>
                  {linkActive&&<Tag col="green"><LinkIcon size={11} style={{verticalAlign:"-1px"}}/> Link active</Tag>}
                </div>
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ color:"#0F172A",fontSize:isMobile?28:38,fontWeight:900,lineHeight:1,fontFamily:"var(--font-head)" }}>{confirmed.length}<span onClick={()=>setShowEditCount(true)} style={{ fontSize:isMobile?14:18,color:"#94A3B8",fontWeight:400,cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted" }}>/{m.max_players} ✎</span></div>
              <div style={{ color:"#94A3B8",fontSize:11,marginTop:2 }}>confirmed</div>
              <button onClick={async()=>{ if(confirm("Permanently DELETE this match and all its data? This cannot be undone.")){ try{ await deleteMatch(m.id); onDeleted() }catch(e){ alert(e.message) } } }} style={{ marginTop:8,padding:"6px 12px",borderRadius:8,background:"rgba(127,29,29,0.5)",border:"1px solid rgba(220,38,38,0.6)",color:"#fecaca",fontSize:11,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>🗑 Delete Match</button>
              {showEditCount && (
                <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10000,padding:16 }} onClick={()=>setShowEditCount(false)}>
                  <div onClick={e=>e.stopPropagation()} style={{ background:"#F8FAF8",borderRadius:16,padding:22,width:"100%",maxWidth:360 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                      <h3 style={{ margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)" }}>{isInternal?"Total Players":"Squad Size"}</h3>
                      <button onClick={()=>setShowEditCount(false)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af" }}>×</button>
                    </div>
                    <p style={{ fontSize:12,color:"#6b7280",margin:"0 0 16px" }}>{isInternal?"Split into two equal sides.":"Number of players in our squad."}</p>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
                      {countOptions.map(n=>(
                        <button key={n} onClick={()=>changeCount(n)} disabled={savingCount} style={{ flex:isInternal?"1 1 calc(25% - 6px)":1,padding:"13px 4px",borderRadius:9,border:`2px solid ${m.max_players===n?"#166534":"#e5e7eb"}`,background:m.max_players===n?"#f0fdf4":"#fafafa",color:m.max_players===n?"#065f46":"#374151",fontSize:15,cursor:"pointer",fontWeight:m.max_players===n?800:600,fontFamily:"var(--font-body)" }}>{n}{isInternal?` (${n/2}v${n/2})`:""}</button>
                      ))}
                    </div>
                    <div style={{ fontSize:11,color:"#9ca3af",textAlign:"center" }}>{savingCount?"Saving...":"Tap a number to update"}</div>
                  </div>
                </div>
              )}
              {waitlist.length>0&&<div style={{ color:"#B8860B",fontSize:11,marginTop:3 }}>+{waitlist.length} waitlisted</div>}
              {pendingPublic.length>0&&<div style={{ color:"#B8860B",fontSize:11,marginTop:3 }}>⚡ {pendingPublic.length} pending</div>}
            </div>
          </div>
          {m.status==="upcoming"&&(
            <div style={{ marginTop:14 }}>
              <div style={{ padding:"12px 14px",background:"#F1F5F9",borderRadius:10,border:"1px solid #E2E8F0",marginBottom:12 }}>
                {loggedPlayer && (() => {
                  const myRow = (detail.matchPlayers || []).find(mp => mp.player_id === loggedPlayer.id)
                  const myStatus = myRow?.status
                  if (myStatus === "confirmed" || myStatus === "waitlist") {
                    return <div style={{ padding:"10px 14px", background: myStatus === "confirmed" ? "#DCEEDB" : "#F5E6C8", borderRadius:10, marginBottom:14, fontSize:13, fontWeight:700, color: myStatus === "confirmed" ? "#1B5E3A" : "#7A4F13" }}>{myStatus === "confirmed" ? (<><CheckCircle2 size={14} style={{verticalAlign:"-2px"}}/> You're in the squad</>) : (<><Hourglass size={14} style={{verticalAlign:"-2px"}}/> You're on the waitlist</>)}</div>
                  }
                  return (
                    <button onClick={async () => { try { await confirmPlayerToMatch(detail.match.id, loggedPlayer.id, "confirmed"); onRefresh() } catch(e) { alert(e.message) } }} style={{ width:"100%", padding:"12px", borderRadius:10, background:"#A6192E", border:"none", color:"#0F172A", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)", marginBottom:14 }}>
                      🏏 I'm Playing — Add me to the Squad
                    </button>
                  )
                })()}
                <div style={{ color:"#0F172A",fontSize:12,fontWeight:700,marginBottom:8 }}>🔗 Invite unlisted players</div>
                <div style={{ color:"#94A3B8",fontSize:11,marginBottom:10,lineHeight:1.5 }}>Share this link with anyone not in your player list. They can register and join this match.</div>
                <button onClick={async()=>{
                  const msg = waPublicLink(m, BASE_URL)
                  if (!linkActive) { await toggleMatchLink(m.id, true); setLinkActive(true) }
                  if (navigator.share) { try { await navigator.share({ title:"Match Invite", text:msg }) } catch {} }
                  else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                }} style={{ width:"100%",padding:"11px",borderRadius:9,background:"#166534",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📤 Share Public Invite Link</button>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {/* Group 1: Invite & notify */}
                <div>
                  <div style={{ fontSize:10,color:"#94A3B8",fontWeight:700,letterSpacing:"0.5px",marginBottom:6,textTransform:"uppercase" }}>Invite & Notify</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <button onClick={()=>setShowNotify(true)} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(15,110,86,0.15)",border:"1px solid rgba(15,110,86,0.35)",color:"#0F6E56",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>🔒 Invite Players</button>
                    <button onClick={async()=>{
                      const msg = waInviteWithLink(m, BASE_URL)
                      if (!linkActive) { await toggleMatchLink(m.id, true); setLinkActive(true) }
                      if (navigator.share) { try { await navigator.share({ title:"Match Invite", text:msg }) } catch {} }
                      else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                    }} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(37,211,102,0.2)",border:"1px solid rgba(74,222,128,0.4)",color:"#166534",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📤 Share Invite</button>
                    <button onClick={async()=>{
                      const msg = waReminder(m, matchPlayers) + "\n\n" + BASE_URL + "/join/" + m.invite_token
                      if (navigator.share) { try { await navigator.share({ title:"Match Reminder", text:msg }) } catch {} }
                      else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                    }} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.35)",color:"#B8860B",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>⏰ Share Reminder</button>
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
                  <div style={{ fontSize:10,color:"#94A3B8",fontWeight:700,letterSpacing:"0.5px",marginBottom:6,textTransform:"uppercase" }}>Match Status</div>
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
          {[["players","👥 Players"],["expenses","💰 Expenses"]].map(([k,v])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:isMobile?"11px 12px":"13px 16px",border:"none",borderBottom:tab===k?"3px solid #166534":"3px solid transparent",background:"transparent",color:tab===k?"#0F172A":"#9ca3af",fontSize:isMobile?12:13,fontWeight:tab===k?800:400,cursor:"pointer",marginBottom:"-2px",whiteSpace:"nowrap",fontFamily:"var(--font-body)" }}>{v}</button>
          ))}
        </div>
        <div style={{ padding:isMobile?"14px":"22px" }}>
          {tab==="players"&&(
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap" }}>
                <span style={{ fontWeight:800,fontSize:14,color:"#0F172A",fontFamily:"var(--font-head)", display:"inline-flex", alignItems:"center", gap:7 }}><Lock size={15}/> Private Invites</span>
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
                    const bc={confirmed:"#6ee7b7",waitlist:"rgba(216,176,91,0.12)",declined:"#fca5a5",pending:"#e5e7eb"}[mp.status]
                    return (
                      <div key={mp.id} style={{ padding:"12px",borderRadius:16,border:`1.5px solid ${bc}`,background:sc }}>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:7 }}>
                          <Av name={p.name} id={p.id} sz={28}/>
                          <div style={{ flex:1,minWidth:0 }}><div style={{ fontWeight:700,fontSize:11,color:"#0F172A",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{p.name}</div><div style={{ fontSize:10,color:"#6b7280" }}>{{confirmed:<CheckCircle2 size={12} color="#166534"/>,waitlist:<Hourglass size={12} color="#B8860B"/>,declined:<XCircle size={12} color="#EF4444"/>,pending:<Clock size={12}/>}[mp.status]}</div></div>
                        </div>
                        {m.status==="upcoming"&&(
                          <div style={{ display:"flex",gap:3 }}>
                            <button onClick={async()=>{await setPlayerStatus(m.id,p.id,"confirmed");onRefresh()}} style={{ flex:1,padding:"5px",borderRadius:6,border:`1.5px solid ${mp.status==="confirmed"?"#166534":"#d1d5db"}`,background:mp.status==="confirmed"?"#166534":"transparent",color:mp.status==="confirmed"?"#0F172A":"#6b7280",fontSize:12,cursor:"pointer",fontWeight:700 }}><CheckCircle2 size={13}/></button>
                            <button onClick={async()=>{await setPlayerStatus(m.id,p.id,"declined");onRefresh()}} style={{ flex:1,padding:"5px",borderRadius:6,border:`1.5px solid ${mp.status==="declined"?"#ef4444":"#d1d5db"}`,background:mp.status==="declined"?"#ef4444":"transparent",color:mp.status==="declined"?"#0F172A":"#6b7280",fontSize:12,cursor:"pointer" }}><XCircle size={13}/></button>
                            <button onClick={async()=>{await removePlayerFromMatch(m.id,p.id);onRefresh()}} style={{ flex:1,padding:"5px",borderRadius:6,border:"1.5px solid #e5e7eb",background:"transparent",color:"#9ca3af",fontSize:12,cursor:"pointer" }}><Trash2 size={13}/></button>
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
                      <div style={{ fontSize:18,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)" }}>{matchPlayers.length}</div>
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
                  const header = "🏏 " + matchTitle(m) + "\n📅 " + fmtDate(m.date) + " · " + m.time_slot + "\n📍 " + m.ground + "\n\n"
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
                    <div style={{ fontWeight:800,fontSize:14,color:"#065f46",marginBottom:12,fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Wallet size={16}/> Expense Breakdown</div>
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
                      <span style={{ fontWeight:800,fontSize:15,color:"#0F172A",fontFamily:"var(--font-head)" }}>Per player</span>
                      <span style={{ fontWeight:900,fontSize:20,color:"#0F172A",fontFamily:"var(--font-head)" }}>₹{pp}</span>
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
                        {upiId&&<button onClick={()=>{navigator.clipboard.writeText(upiId);alert("UPI ID copied!")}} style={{ padding:"6px 12px",borderRadius:8,background:"#F5E6C8",border:"1px solid #E3C888",color:"#7A4F13",fontSize:12,cursor:"pointer",fontWeight:700 }}>Copy</button>}
                      </div>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8 }}>
                        <div style={{ fontWeight:800,fontSize:14,color:"#0F172A",fontFamily:"var(--font-head)" }}>Payment Collection</div>
                        <button onClick={()=>copy(waPayment(m,matchPlayers,expenses,upiId))} style={{ padding:"7px 12px",borderRadius:8,background:"#d1fae5",border:"1px solid #6ee7b7",color:"#065f46",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📲 Copy Payment Msg</button>
                      </div>
                      <div style={{ display:"grid",gap:8 }}>
                        {confirmed.map(mp=>{ const p=mp.players; if(!p) return null; const paid=payments.find(pay=>pay.player_id===p.id)?.paid; return (
                          <div key={mp.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 12px",background:paid?"#f0fdf4":"#F8FAF8",borderRadius:11,border:`1.5px solid ${paid?"#6ee7b7":"#e5e7eb"}` }}>
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
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><span style={{ fontWeight:800,fontSize:14,color:"#0F172A",fontFamily:"var(--font-head)" }}>⚡ Pending</span><Tag col="orange">{pending.length}</Tag></div>
              {pending.map(r=>(
                <div key={r.id} style={{ padding:"12px 14px",background:r.availability==="yes"?"#f0fdf4":"#fff5f5",borderRadius:12,border:`1.5px solid ${r.availability==="yes"?"#6ee7b7":"#fca5a5"}`,marginBottom:8 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:r.availability==="yes"?10:0 }}>
                    <div style={{ width:38,height:38,borderRadius:"50%",background:r.availability==="yes"?"#166534":"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#0F172A",flexShrink:0 }}>{r.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{r.name}</div><div style={{ fontSize:11,color:"#6b7280" }}>{r.phone&&<>📱 {r.phone} · </>}{r.availability==="yes"?"✅ Available":"❌ Not available"}</div></div>
                  </div>
                  {r.availability==="yes"&&<div style={{ display:"flex",gap:8 }}><button onClick={()=>doApprove(r)} disabled={busy===r.id} style={{ flex:1,padding:"9px",borderRadius:9,background:"#166534",border:"none",color:"#0F172A",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>{busy===r.id?"...":"✔ Approve"}</button><button onClick={()=>doReject(r)} disabled={busy===r.id} style={{ flex:1,padding:"9px",borderRadius:9,background:"#fee2e2",border:"1px solid #fca5a5",color:"#991b1b",fontSize:13,cursor:"pointer",fontFamily:"var(--font-body)" }}>Reject</button></div>}
                </div>
              ))}
            </div>
          )}
          {approved.length>0&&<div><div style={{ fontWeight:700,fontSize:13,color:"#065f46",marginBottom:10 }}>✅ Approved ({approved.length})</div>{approved.map(r=><div key={r.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",marginBottom:7 }}><div style={{ width:32,height:32,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#0F172A" }}>{r.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div><div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:13 }}>{r.name}</div><div style={{ fontSize:11,color:"#059669" }}>Added to squad</div></div><Tag col="green">✔</Tag></div>)}</div>}
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
  const [auctionSquads, setAuctionSquads] = useState([]) // [{ team, linkedPlayerIds, unlinkedCount }]

  useEffect(() => {
    Promise.all([fetchAuctionTeams(), fetchAuctionPlayers()]).then(([teamsRes, playersRes]) => {
      const sold = playersRes.filter(p => p.status === "sold" && p.sold_team_id)
      const squads = teamsRes.map(t => {
        const won = sold.filter(p => p.sold_team_id === t.id)
        const linkedIds = won.filter(p => p.linked_player_id).map(p => p.linked_player_id)
        return { team: t, linkedPlayerIds: linkedIds, unlinkedCount: won.length - linkedIds.length }
      }).filter(s => s.linkedPlayerIds.length > 0 || s.unlinkedCount > 0)
      setAuctionSquads(squads)
    }).catch(() => {})
  }, [])

  const addSquad = (squad) => {
    setSelected(prev => {
      const next = new Set(prev)
      squad.linkedPlayerIds.forEach(id => next.add(id))
      return next
    })
  }

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
      <div onClick={e=>e.stopPropagation()} style={{ background:"#F8FAF8", borderRadius:isMobile?"20px 20px 0 0":20, padding:isMobile?"20px 16px":24, width:"100%", maxWidth:isMobile?"100%":500, maxHeight:isMobile?"92vh":"85vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Lock size={17}/> Invite Players</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
        </div>

        {/* Quick add from auction squads */}
        {auctionSquads.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Quick add auction squad</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {auctionSquads.map(s => (
                <button key={s.team.id} onClick={() => addSquad(s)} style={{ padding: "7px 12px", borderRadius: 9, border: "1.5px solid #E3C888", background: "rgba(246,196,83,0.12)", color: "#7A4F13", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  {s.team.name} ({s.linkedPlayerIds.length}){s.unlinkedCount > 0 ? ` +${s.unlinkedCount} unlinked` : ""}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search + Select All */}
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search players..." style={{ flex:1, padding:"10px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", fontFamily:"var(--font-body)", boxSizing:"border-box" }}/>
          <button onClick={toggleAll} style={{ padding:"10px 14px", borderRadius:9, border:"1.5px solid #6ee7b7", background:allSelected?"#166534":"#f0fdf4", color:allSelected?"#0F172A":"#065f46", fontSize:13, cursor:"pointer", fontWeight:700, whiteSpace:"nowrap", fontFamily:"var(--font-body)" }}>{allSelected?"Clear all":"Select all"}</button>
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
                  <div style={{ fontSize:11, color:"#9ca3af", display:"flex", alignItems:"center", gap:4 }}><Phone size={11}/> {p.phone}</div>
                </div>
                {alreadyInvited.has(p.id) && <Tag col="green">Invited</Tag>}
                <div style={{ width:24, height:24, borderRadius:7, border:`2px solid ${isSel?"#166534":"#d1d5db"}`, background:isSel?"#166534":"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{isSel && <span style={{ color:"#0F172A", fontSize:14, fontWeight:800 }}>✔</span>}</div>
              </div>
            )
          })}
          {filtered.length===0 && <div style={{ padding:"24px", textAlign:"center", color:"#9ca3af", fontSize:13 }}>No players found</div>}
        </div>

        {/* Footer */}
        <div style={{ marginTop:14, display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"13px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer", fontWeight:600 }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex:2, padding:"13px", borderRadius:10, background:"#FFFFFF", border:"none", color:"#0F172A", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>
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
          }} style={{ flex:2, padding:"12px", borderRadius:10, background:"#166534", border:"none", color:"#0F172A", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-body)" }}>📤 Share Invite Link</button>
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
  const mBox={background:"#F8FAF8",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"22px 18px":28,width:"100%",maxWidth:isMobile?"100%":400,maxHeight:isMobile?"95vh":"auto",overflowY:"auto",boxSizing:"border-box"}
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
        <h2 style={{color:"#0F172A",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)"}}>Teams ({teams.length})</h2>
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
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"16px 18px",border:"2px solid #166534"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <TeamAv name={selectedTeam.name} logo={selectedTeam.logo_url} size={56}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:17,color:"#0F172A",fontFamily:"var(--font-head)"}}>{selectedTeam.name}</div>
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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Add New Team</h3><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>x</button></div>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:5,fontWeight:600}}>Team Name *</div>
        <input value={addName} onChange={e=>setAddName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSubmit()} placeholder="e.g. Dominators" style={{...iS,marginBottom:16}}/>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={addSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Adding...":"Add Team"}</button></div>
      </div></div>}
      {editT&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Edit Team</h3><button onClick={()=>setEditT(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>x</button></div>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:5,fontWeight:600}}>Team Name *</div>
        <input value={editName} onChange={e=>setEditName(e.target.value)} style={{...iS,marginBottom:16}}/>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setEditT(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={editSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Save"}</button></div>
      </div></div>}
      {delT&&<div style={mStyle}><div style={{...mBox,maxWidth:360}}>
        <div style={{textAlign:"center",padding:"10px 0 18px"}}><div style={{fontSize:40,marginBottom:12}}>!</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Delete Team?</h3><p style={{color:"#6b7280",fontSize:13,margin:0}}>Delete <strong>{delT.name}</strong>?</p></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setDelT(null)} style={{flex:1,padding:"13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={delSubmit} disabled={busy} style={{flex:1,padding:"13px",borderRadius:9,background:"#fee2e2",border:"1.5px solid #fecaca",color:"#991b1b",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"...":"Yes, Delete"}</button></div>
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

function AuctionPage({ isMobile, isFounder }) {
  const [subTab, setSubTab] = useState("today")
  const [managingAuction, setManagingAuction] = useState(null)
  const [auctionPlayers, setAuctionPlayers] = useState([])
  const [auctionTeams, setAuctionTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceDrafts, setPriceDrafts] = useState({})
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [editTeam, setEditTeam] = useState(null)
  const [delTeam, setDelTeam] = useState(null)
  const [teamName, setTeamName] = useState("")
  const [teamOwner, setTeamOwner] = useState("")
  const [teamPurse, setTeamPurse] = useState("")
  const [busy, setBusy] = useState(false)
  const [regOpen, setRegOpen] = useState(true)
  const [regBusy, setRegBusy] = useState(false)
  const [pendingPayments, setPendingPayments] = useState([])
  const [showCreateAuction, setShowCreateAuction] = useState(false)
  const [viewingPlayer, setViewingPlayer] = useState(null)
  const [viewingTeam, setViewingTeam] = useState(null)
  const [allAuctions, setAllAuctions] = useState([])
  const [loadingAuctions, setLoadingAuctions] = useState(true)

  const loadAuctions = async () => {
    setLoadingAuctions(true)
    try { setAllAuctions(await fetchAllAuctions()) } catch(e) { alert(e.message) }
    setLoadingAuctions(false)
  }
  useEffect(() => { loadAuctions() }, [])

  const loadPayments = async () => { try { setPendingPayments(await fetchPendingAuctionPayments()) } catch {} }
  useEffect(() => { if (isFounder) loadPayments() }, [isFounder])

  const load = async () => {
    setLoading(true)
    try {
      const auctionId = managingAuction?.id || null
      const [p, t, open] = await Promise.all([fetchAuctionPlayers(auctionId), fetchAuctionTeams(auctionId), fetchAuctionRegistrationOpen(auctionId)])
      setAuctionPlayers(p); setAuctionTeams(t); setRegOpen(open)
    } catch(e) { alert(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [managingAuction])

  const toggleRegistration = async () => {
    setRegBusy(true)
    try {
      const auctionId = managingAuction?.id || null
      if (auctionId) await setAuctionRegistrationOpen(auctionId, !regOpen)
      else await setAuctionRegistrationOpen(!regOpen)
      setRegOpen(!regOpen)
    } catch(e) { alert(e.message) }
    setRegBusy(false)
  }

  const doApprovePayment = async (auctionId) => {
    try { await approveAuctionPayment(auctionId); await loadPayments() } catch(e) { alert(e.message) }
  }
  const doRejectPayment = async (auctionId) => {
    if (!window.confirm("Reject this payment claim?")) return
    try { await rejectAuctionPayment(auctionId); await loadPayments() } catch(e) { alert(e.message) }
  }

  const iS = { width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", boxSizing:"border-box", fontFamily:"var(--font-body)" }
  const mStyle = { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:isMobile?"flex-end":"center", justifyContent:"center", zIndex:300 }
  const mBox = { background:"#F8FAF8", borderRadius:isMobile?"20px 20px 0 0":20, padding:isMobile?"22px 18px":28, width:"100%", maxWidth:isMobile?"100%":400, maxHeight:isMobile?"95vh":"auto", overflowY:"auto", boxSizing:"border-box" }

  const savePrice = async (id) => {
    const val = priceDrafts[id]
    if (val === undefined || val === "") return
    try { await updateAuctionPlayerBasePrice(id, Number(val)); await load() }
    catch(e) { alert(e.message) }
  }

  const removePlayer = async (p) => {
    if (!window.confirm(`Remove ${p.name} from the auction pool?`)) return
    try { await deleteAuctionPlayer(p.id); await load() } catch(e) { alert(e.message) }
  }

  const openAddTeam = () => { setEditTeam(null); setTeamName(""); setTeamOwner(""); setTeamPurse(""); setShowAddTeam(true) }
  const openEditTeam = (t) => { setEditTeam(t); setTeamName(t.name); setTeamOwner(t.owner_name || ""); setTeamPurse(String(t.purse_total)); setShowAddTeam(true) }

  const saveTeam = async () => {
    if (!teamName.trim()) { alert("Team name required"); return }
    const purse = Number(teamPurse)
    if (!teamPurse || isNaN(purse) || purse <= 0) { alert("Enter a valid starting purse"); return }
    setBusy(true)
    try {
      if (editTeam) await updateAuctionTeam(editTeam.id, { name: teamName.trim(), ownerName: teamOwner.trim(), purseTotal: purse })
      else await createAuctionTeam(teamName.trim(), teamOwner.trim(), purse, managingAuction?.id || null)
      setShowAddTeam(false)
      await load()
    } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const confirmDeleteTeam = async () => {
    setBusy(true)
    try { await deleteAuctionTeam(delTeam.id); setDelTeam(null); await load() } catch(e) { alert(e.message) }
    setBusy(false)
  }

  if (loading) return <Spinner/>

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          {managingAuction && (
            <button onClick={()=>{ setManagingAuction(null); setSubTab("today") }} style={{ background:"none", border:"none", color:"#166534", fontSize:12, fontWeight:700, cursor:"pointer", padding:0, marginBottom:6, display:"flex", alignItems:"center", gap:4 }}>← All Auctions</button>
          )}
          <h2 style={{ color:"#0F172A", fontSize:isMobile?17:20, fontWeight:800, margin:0, fontFamily:"var(--font-head)" }}>{managingAuction ? managingAuction.name : "Auction Control Panel"}</h2>
        </div>
        <button onClick={()=>setShowCreateAuction(true)} style={{ padding:"9px 16px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)", flexShrink:0 }}>+ New Auction</button>
      </div>

      {managingAuction && isFounder && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderRadius:12, background:regOpen?"rgba(34,197,94,0.08)":"rgba(231,76,60,0.08)", border:`1.5px solid ${regOpen?"rgba(34,197,94,0.3)":"rgba(231,76,60,0.2)"}`, marginBottom:18 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:13, color:regOpen?"#166534":"#EF4444", fontFamily:"var(--font-head)" }}>Public Registration: {regOpen ? "Open" : "Closed"}</div>
            <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{regOpen ? "Anyone with the link can register for this auction." : "New registrations are currently blocked."}</div>
          </div>
          <button onClick={toggleRegistration} disabled={regBusy} style={{ padding:"9px 16px", borderRadius:9, border:"none", background:regOpen?"#EF4444":"#166534", color:"#FFFFFF", fontSize:12, fontWeight:800, cursor:regBusy?"not-allowed":"pointer", fontFamily:"var(--font-head)", flexShrink:0 }}>{regBusy ? "..." : (regOpen ? "Close" : "Open")}</button>
        </div>
      )}

      <div style={{ display:"flex", gap:8, marginBottom:18, borderBottom:"1.5px solid #E2E8F0", flexWrap:"wrap" }}>
        {(managingAuction
          ? [["players", `Player Pool (${auctionPlayers.length})`], ["teams", `Teams (${auctionTeams.length})`], ["live", "Live Auction"]]
          : [["today", "Today's Auctions"], ["upcoming", "Upcoming Auctions"], ["pricing", "Pricing"], ...(isFounder ? [["payments", `Payments (${pendingPayments.length})`]] : [])]
        ).map(([v, label]) => (
          <button key={v} onClick={()=>setSubTab(v)} style={{ padding:"10px 4px", background:"none", border:"none", borderBottom:subTab===v?"2.5px solid #166534":"2.5px solid transparent", color:subTab===v?"#166534":"#94A3B8", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)" }}>{label}</button>
        ))}
      </div>

      {(subTab === "today" || subTab === "upcoming") && (() => {
        const todayStr = new Date().toISOString().split("T")[0]
        const list = allAuctions.filter(a => {
          if (!a.auction_date) return subTab === "upcoming" // undated auctions show under Upcoming
          return subTab === "today" ? a.auction_date === todayStr : a.auction_date > todayStr
        })
        const statusColor = { free:"#166534", paid:"#166534", pending:"#B8860B", rejected:"#EF4444" }
        const opColor = { setup:"#94A3B8", live:"#22C55E", completed:"#0F172A" }
        if (loadingAuctions) return <Spinner/>
        return list.length === 0 ? (
          <Card style={{ padding:"32px 16px", textAlign:"center" }}>
            <div style={{ fontSize:14, color:"#64748B" }}>No {subTab === "today" ? "auctions today" : "upcoming auctions"}.</div>
          </Card>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12 }}>
            {list.map(a => {
              const canManage = a.payment_status === "paid" || a.payment_status === "free"
              return (
              <Card key={a.id} onClick={() => canManage && (setManagingAuction(a), setSubTab("players"))} style={{ padding:"16px", cursor: canManage ? "pointer" : "default" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:"#0F172A", fontFamily:"var(--font-head)" }}>{a.name}</div>
                  <span style={{ background:opColor[a.status]||"#94A3B8", color:"#FFFFFF", borderRadius:999, padding:"3px 10px", fontSize:10, fontWeight:700, textTransform:"capitalize", flexShrink:0 }}>{a.status}</span>
                </div>
                <div style={{ fontSize:12, color:"#64748B", marginBottom:2 }}>Organizer: {a.players?.name || "—"}</div>
                {a.location && <div style={{ fontSize:12, color:"#64748B", marginBottom:2, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/> {a.location}</div>}
                <div style={{ fontSize:12, color:"#64748B", marginBottom:8, display:"flex", alignItems:"center", gap:4 }}>
                  {a.auction_date ? <><Calendar size={11}/> {fmtDate(a.auction_date)}</> : "Date TBD"}{a.auction_time ? ` · ${a.auction_time}` : ""}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:"#7A4F13", fontWeight:700, background:"rgba(246,196,83,0.15)", padding:"3px 8px", borderRadius:7 }}>{a.plan_tier} · up to {a.max_teams} teams</span>
                  <span style={{ fontSize:11, fontWeight:700, color:statusColor[a.payment_status]||"#94A3B8", textTransform:"capitalize" }}>{a.payment_status}</span>
                </div>
                {!canManage && <div style={{ fontSize:11, color:"#94A3B8", marginTop:8, fontStyle:"italic" }}>Awaiting payment confirmation before this can be managed.</div>}
              </Card>
            )})}
          </div>
        )
      })()}

      {subTab === "pricing" && (
        <div>
          <div style={{ fontSize:13, color:"#64748B", marginBottom:16 }}>Plans available for organizers creating a new auction.</div>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)", gap:12 }}>
            {AUCTION_PLANS.map(p => (
              <Card key={p.id} style={{ padding:"18px 12px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>{p.label}</div>
                <div style={{ fontSize:24, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)", margin:"8px 0" }}>{p.maxTeams} <span style={{ fontSize:12, fontWeight:600, color:"#64748B" }}>teams</span></div>
                <div style={{ fontSize:16, fontWeight:800, color: p.price === 0 ? "#166534" : "#B8860B" }}>{p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {subTab === "players" && (
        auctionPlayers.length === 0 ? (
          <Card style={{ padding:"32px 16px", textAlign:"center" }}>
            <div style={{ fontSize:14, color:"#64748B" }}>No players have registered for the auction yet.</div>
            <div style={{ fontSize:12, color:"#94A3B8", marginTop:6 }}>Share the public auction registration link to start collecting entries.</div>
          </Card>
        ) : (
          <div style={{ display:"grid", gap:10 }}>
            {auctionPlayers.map(p => (
              <Card key={p.id} style={{ padding:"14px 16px" }}>
                <div onClick={()=>setViewingPlayer(p)} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, cursor:"pointer" }}>
                  <Av name={p.name} id={p.id} sz={38}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{p.name}</div>
                    <div style={{ fontSize:12, color:"#94A3B8", display:"flex", alignItems:"center", gap:4 }}><Phone size={11}/> {p.phone}{p.playing_role ? ` · ${p.playing_role}` : ""}</div>
                  </div>
                  <button onClick={(e)=>{ e.stopPropagation(); removePlayer(p) }} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:4 }}><Trash2 size={16}/></button>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>Base Price ₹</span>
                  <input type="number" min="0" value={priceDrafts[p.id] !== undefined ? priceDrafts[p.id] : (p.base_price ?? "")} onChange={e=>setPriceDrafts({...priceDrafts, [p.id]: e.target.value})} onBlur={()=>savePrice(p.id)} placeholder="0" style={{ ...iS, flex:1, padding:"8px 10px" }}/>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {subTab === "teams" && (
        <div>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
            <Btn variant="green" size={isMobile?"sm":"md"} onClick={openAddTeam}>+ Add Team</Btn>
          </div>
          {auctionTeams.length === 0 ? (
            <Card style={{ padding:"32px 16px", textAlign:"center" }}>
              <div style={{ fontSize:14, color:"#64748B" }}>No teams set up yet.</div>
              <div style={{ fontSize:12, color:"#94A3B8", marginTop:6 }}>Add each team and set their starting purse before the auction begins.</div>
            </Card>
          ) : (
            <div style={{ display:"grid", gap:10 }}>
              {auctionTeams.map(t => (
                <Card key={t.id} style={{ padding:"14px 16px" }}>
                  <div onClick={()=>setViewingTeam(t)} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                    <TeamAv name={t.name} logo={null} size={38}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{t.name}</div>
                      {t.owner_name && <div style={{ fontSize:12, color:"#94A3B8" }}>{t.owner_name}</div>}
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, fontSize:15, color:"#166534", fontFamily:"var(--font-head)" }}>₹{t.purse_remaining}</div>
                      <div style={{ fontSize:10, color:"#94A3B8" }}>of ₹{t.purse_total}</div>
                    </div>
                    <button onClick={(e)=>{ e.stopPropagation(); openEditTeam(t) }} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748B", padding:4 }}>Edit</button>
                    <button onClick={(e)=>{ e.stopPropagation(); setDelTeam(t) }} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:4 }}><Trash2 size={16}/></button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === "live" && <AuctionLiveConsole isMobile={isMobile} auctionPlayers={auctionPlayers} auctionTeams={auctionTeams} onPoolChange={load} auctionId={managingAuction?.id || null}/>}

      {subTab === "payments" && isFounder && (
        pendingPayments.length === 0 ? (
          <Card style={{ padding:"32px 16px", textAlign:"center" }}>
            <div style={{ fontSize:14, color:"#64748B" }}>No pending auction payments.</div>
          </Card>
        ) : (
          <div style={{ display:"grid", gap:10 }}>
            {pendingPayments.map(a => (
              <Card key={a.id} style={{ padding:"14px 16px" }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{a.name}</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Organizer: {a.players?.name || "Unknown"} ({a.players?.phone || "—"})</div>
                <div style={{ fontSize:12, color:"#94A3B8" }}>{a.plan_tier} · up to {a.max_teams} teams · ₹{a.amount_due}</div>
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <button onClick={()=>doApprovePayment(a.id)} style={{ flex:1, padding:"9px", borderRadius:8, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:700, cursor:"pointer" }}>Approve</button>
                  <button onClick={()=>doRejectPayment(a.id)} style={{ flex:1, padding:"9px", borderRadius:8, border:"1px solid #EF4444", background:"#FFFFFF", color:"#EF4444", fontSize:12, fontWeight:700, cursor:"pointer" }}>Reject</button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {showCreateAuction && <CreateAuctionFlow organizerId={null} isMobile={isMobile} onClose={()=>setShowCreateAuction(false)} onCreated={()=>loadPayments()}/>}

      {showAddTeam && (
        <div style={mStyle} onClick={()=>setShowAddTeam(false)}>
          <div style={mBox} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{editTeam ? "Edit Team" : "Add Auction Team"}</h3>
              <button onClick={()=>setShowAddTeam(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
            </div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Team Name *</div>
            <input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="e.g. Mumbai Warriors" autoFocus style={{ ...iS, marginBottom:12 }}/>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Owner / Captain</div>
            <input value={teamOwner} onChange={e=>setTeamOwner(e.target.value)} placeholder="e.g. Sahir Attar" style={{ ...iS, marginBottom:12 }}/>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Starting Purse (₹) *</div>
            <input type="number" min="0" value={teamPurse} onChange={e=>setTeamPurse(e.target.value)} placeholder="e.g. 10000" style={{ ...iS, marginBottom:16 }}/>
            {editTeam && <div style={{ fontSize:11, color:"#94A3B8", marginBottom:16, marginTop:-8 }}>Note: editing the purse resets the remaining balance to match — only do this before bidding starts.</div>}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowAddTeam(false)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={saveTeam} disabled={busy} style={{ flex:2, padding:"12px", borderRadius:9, background:"#FFFFFF", border:"none", color:"#0F172A", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>{busy ? "Saving..." : (editTeam ? "Save Changes" : "Add Team")}</button>
            </div>
          </div>
        </div>
      )}

      {delTeam && (
        <div style={mStyle} onClick={()=>setDelTeam(null)}>
          <div style={mBox} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center", padding:"10px 0 18px" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
              <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Delete Team?</h3>
              <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>Delete <strong>{delTeam.name}</strong>? This can't be undone.</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDelTeam(null)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={confirmDeleteTeam} disabled={busy} style={{ flex:1, padding:"12px", borderRadius:9, background:"#EF4444", border:"none", color:"#FFFFFF", fontSize:14, cursor:"pointer", fontWeight:800 }}>{busy ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {viewingTeam && (() => {
        const squad = auctionPlayers.filter(p => p.sold_team_id === viewingTeam.id)
        const spent = viewingTeam.purse_total - viewingTeam.purse_remaining
        return (
        <div style={mStyle} onClick={()=>setViewingTeam(null)}>
          <div style={mBox} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Team Details</h3>
              <button onClick={()=>setViewingTeam(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
              <TeamAv name={viewingTeam.name} logo={null} size={56}/>
              <div>
                <div style={{ fontWeight:900, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)" }}>{viewingTeam.name}</div>
                {viewingTeam.owner_name && <div style={{ fontSize:13, color:"#64748B", marginTop:2 }}>Owner: {viewingTeam.owner_name}</div>}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
              <div style={{ padding:"10px 8px", background:"#F8FAF8", borderRadius:9, textAlign:"center" }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>STARTING PURSE</div>
                <div style={{ fontSize:14, color:"#0F172A", fontWeight:800, fontFamily:"var(--font-head)" }}>₹{viewingTeam.purse_total}</div>
              </div>
              <div style={{ padding:"10px 8px", background:"rgba(231,76,60,0.08)", borderRadius:9, textAlign:"center" }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>SPENT</div>
                <div style={{ fontSize:14, color:"#EF4444", fontWeight:800, fontFamily:"var(--font-head)" }}>₹{spent}</div>
              </div>
              <div style={{ padding:"10px 8px", background:"rgba(34,197,94,0.08)", borderRadius:9, textAlign:"center" }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>REMAINING</div>
                <div style={{ fontSize:14, color:"#166534", fontWeight:800, fontFamily:"var(--font-head)" }}>₹{viewingTeam.purse_remaining}</div>
              </div>
            </div>

            <div style={{ fontSize:12, color:"#94A3B8", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>Squad ({squad.length})</div>
            {squad.length === 0 ? (
              <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", padding:"16px 0" }}>No players won yet.</div>
            ) : (
              <div style={{ display:"grid", gap:8 }}>
                {squad.map(p => (
                  <div key={p.id} onClick={()=>{ setViewingTeam(null); setViewingPlayer(p) }} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"#F8FAF8", borderRadius:9, cursor:"pointer" }}>
                    {p.profile_image_url ? (
                      <img src={p.profile_image_url} alt={p.name} style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
                    ) : (
                      <Av name={p.name} id={p.id} sz={32}/>
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{p.name}</div>
                      <div style={{ fontSize:11, color:"#94A3B8" }}>{p.playing_role || "—"}</div>
                    </div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#166534", fontFamily:"var(--font-head)" }}>₹{p.sold_price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )
      })()}

      {viewingPlayer && (
        <div style={mStyle} onClick={()=>setViewingPlayer(null)}>
          <div style={mBox} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Player Details</h3>
              <button onClick={()=>setViewingPlayer(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
              {viewingPlayer.profile_image_url ? (
                <img src={viewingPlayer.profile_image_url} alt={viewingPlayer.name} style={{ width:64, height:64, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
              ) : (
                <Av name={viewingPlayer.name} id={viewingPlayer.id} sz={64}/>
              )}
              <div>
                <div style={{ fontWeight:900, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)" }}>{viewingPlayer.name}</div>
                <div style={{ fontSize:13, color:"#64748B", display:"flex", alignItems:"center", gap:4, marginTop:2 }}><Phone size={12}/> {viewingPlayer.phone}</div>
                {viewingPlayer.category && <span style={{ display:"inline-block", marginTop:6, fontSize:10, fontWeight:700, color:"#B8860B", background:"rgba(246,196,83,0.15)", padding:"2px 8px", borderRadius:999 }}>{viewingPlayer.category}</span>}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              <div style={{ padding:"10px 12px", background:"#F8FAF8", borderRadius:9 }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>CITY</div>
                <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{viewingPlayer.city || "—"}</div>
              </div>
              <div style={{ padding:"10px 12px", background:"#F8FAF8", borderRadius:9 }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>DATE OF BIRTH</div>
                <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{viewingPlayer.birth_date ? fmtDate(viewingPlayer.birth_date) : "—"}</div>
              </div>
              <div style={{ padding:"10px 12px", background:"#F8FAF8", borderRadius:9 }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>PLAYING ROLE</div>
                <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{viewingPlayer.playing_role || "—"}</div>
              </div>
              <div style={{ padding:"10px 12px", background:"#F8FAF8", borderRadius:9 }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>STATUS</div>
                <div style={{ fontSize:13, color:"#0F172A", fontWeight:600, textTransform:"capitalize" }}>{viewingPlayer.status}{viewingPlayer.status==="sold" && viewingPlayer.sold_price ? ` · ₹${viewingPlayer.sold_price}` : ""}</div>
              </div>
              <div style={{ padding:"10px 12px", background:"#F8FAF8", borderRadius:9 }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>JERSEY NUMBER</div>
                <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{viewingPlayer.jersey_number || "—"}</div>
              </div>
              <div style={{ padding:"10px 12px", background:"#F8FAF8", borderRadius:9 }}>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>JERSEY SIZE</div>
                <div style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{viewingPlayer.jersey_size || "—"}</div>
              </div>
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"center", padding:"12px", background:"rgba(34,197,94,0.08)", borderRadius:9 }}>
              <span style={{ fontSize:12, color:"#166534", fontWeight:700 }}>Base Price ₹</span>
              <input type="number" min="0" value={priceDrafts[viewingPlayer.id] !== undefined ? priceDrafts[viewingPlayer.id] : (viewingPlayer.base_price ?? "")} onChange={e=>setPriceDrafts({...priceDrafts, [viewingPlayer.id]: e.target.value})} onBlur={()=>savePrice(viewingPlayer.id)} placeholder="0" style={{ ...iS, flex:1, padding:"8px 10px", background:"#FFFFFF" }}/>
            </div>
          </div>
        </div>
      )}
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
  const mBox={background:"#F8FAF8",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"22px 18px":28,width:"100%",maxWidth:isMobile?"100%":480,maxHeight:isMobile?"95vh":"auto",overflowY:"auto",boxSizing:"border-box"}
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
        <h2 style={{color:"#0F172A",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)"}}>Grounds ({grounds.length})</h2>
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
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"18px",border:"2px solid #166534"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:"#F8FAF8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:"2px solid #6ee7b7"}}>📍</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:17,color:"#0F172A",fontFamily:"var(--font-head)"}}>{selectedGround.name}</div>
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
      {showAdd&&<div style={mStyle}><div style={mBox}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Add Ground</h3><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div><GForm f={form} setF={setForm}/><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={addSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Adding...":"Add Ground"}</button></div></div></div>}
      {editG&&<div style={mStyle}><div style={mBox}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Edit Ground</h3><button onClick={()=>setEditG(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div><GForm f={editForm} setF={setEditForm}/><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setEditG(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={editSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Save"}</button></div></div></div>}
      {delG&&<div style={mStyle}><div style={{...mBox,maxWidth:360}}><div style={{textAlign:"center",padding:"10px 0 18px"}}><div style={{fontSize:40,marginBottom:12}}>⚠️</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Delete Ground?</h3><p style={{color:"#6b7280",fontSize:13,margin:0}}>Delete <strong>{delG.name}</strong>?</p></div><div style={{display:"flex",gap:10}}><button onClick={()=>setDelG(null)} style={{flex:1,padding:"13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={delSubmit} disabled={busy} style={{flex:1,padding:"13px",borderRadius:9,background:"#fee2e2",border:"1.5px solid #fecaca",color:"#991b1b",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"...":"Yes, Delete"}</button></div></div></div>}
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
        <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><Wallet size={16}/> Contributions</div>
        <div style={{ fontWeight:900, fontSize:18, color:"#166534", fontFamily:"var(--font-head)" }}>₹{total}</div>
      </div>
      {loading ? (
        <div style={{ fontSize:12, color:"#9ca3af", padding:"8px 0" }}>Loading...</div>
      ) : contribs.length === 0 ? (
        <div style={{ fontSize:12, color:"#9ca3af", padding:"8px 0" }}>No contributions recorded yet.</div>
      ) : (
        <div style={{ display:"grid", gap:6, marginBottom:10 }}>
          {contribs.map(c => (
            <div key={c.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 11px", background:"#F8FAF8", borderRadius:8, border:"1px solid #f3f4f6" }}>
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
            <button onClick={()=>setShowAdd(false)} style={{ flex:1, padding:"9px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:13, cursor:"pointer" }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2, padding:"9px", borderRadius:8, background:"#FFFFFF", border:"none", color:"#0F172A", fontSize:13, cursor:"pointer", fontWeight:700 }}>{saving?"Saving...":"Add Contribution"}</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setShowAdd(true)} style={{ width:"100%", padding:"9px", borderRadius:8, background:"#f0fdf4", border:"1px solid #6ee7b7", color:"#065f46", fontSize:13, cursor:"pointer", fontWeight:700 }}>+ Add Manual Entry</button>
      )}
    </div>
  )
}

function PlayersPage({ players, onRefresh, isMobile, isFounder }) {
  const [showAdd,setShowAdd]=useState(false)
  const [editP,setEditP]=useState(null)
  const [pinP,setPinP]=useState(null)
  const [delP,setDelP]=useState(null)
  const [selectedId,setSelectedId]=useState(null)
  const [form,setForm]=useState({firstName:"",lastName:"",phone:"",pin:""})
  const [editForm,setEditForm]=useState({firstName:"",lastName:"",phone:"",pin:"",role:"player",city:"",birthDate:"",jerseyNumber:"",jerseySize:"",photoFile:null,photoPreview:""})
  const [newPin,setNewPin]=useState("")
  const [busy,setBusy]=useState(false)
  const selectedPlayer=players.find(p=>p.id===selectedId)||null
  const iS={width:"100%",padding:"11px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",boxSizing:"border-box",fontFamily:"var(--font-body)"}
  const lS={fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600}
  const mStyle={position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:300}
  const mBox={background:"#F8FAF8",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"22px 18px":28,width:"100%",maxWidth:isMobile?"100%":420,maxHeight:isMobile?"95vh":"auto",overflowY:"auto",boxSizing:"border-box"}
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
    if(!editForm.firstName.trim()){alert("First name required");return}
    if(!editForm.lastName.trim()){alert("Last name required");return}
    setBusy(true);try{
      const {updatePlayer,setPlayerAccountRole,uploadProfilePhoto}=await import("../db.js")
      let photoUrl=editForm.photoPreview
      if(editForm.photoFile) photoUrl=await uploadProfilePhoto(editForm.photoFile,editForm.phone)
      const fullName=editForm.firstName.trim()+" "+editForm.lastName.trim()
      await updatePlayer(editP.id,fullName,editForm.phone.trim(),editForm.pin,editForm.city,{birthDate:editForm.birthDate,profileImageUrl:photoUrl,jerseyNumber:editForm.jerseyNumber,jerseySize:editForm.jerseySize})
      if(isFounder&&editForm.role&&editForm.role!==(editP.role||"player")){await setPlayerAccountRole(editP.id,editForm.role)}
      setEditP(null);onRefresh()
    }catch(e){alert(e.message)};setBusy(false)
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
        <h2 style={{color:"#0F172A",fontSize:isMobile?17:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)"}}>Players ({players.length})</h2>
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
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"16px 18px",border:"2px solid #166534"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <Av name={selectedPlayer.name} id={selectedPlayer.id} sz={52}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:16,color:"#0F172A",fontFamily:"var(--font-head)"}}>{selectedPlayer.name}</div>
                <div style={{fontSize:12,color:"#6b7280",marginTop:3}}>📱 {selectedPlayer.phone||"No phone"}</div>
                <div style={{fontSize:12,marginTop:4}}><span style={{color:"#9ca3af"}}>PIN: </span><span style={{background:"#d1fae5",color:"#065f46",padding:"2px 10px",borderRadius:5,fontWeight:800,fontSize:14}}>{selectedPlayer.pin}</span></div>
              </div>
              <button onClick={()=>setSelectedId(null)} style={{background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer",padding:0,flexShrink:0}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <button onClick={()=>{const parts=(selectedPlayer.name||"").trim().split(/\s+/);setEditP(selectedPlayer);setEditForm({firstName:parts[0]||"",lastName:parts.slice(1).join(" ")||"",phone:selectedPlayer.phone||"",pin:selectedPlayer.pin,role:selectedPlayer.role||"player",city:selectedPlayer.city||"",birthDate:selectedPlayer.birth_date||"",jerseyNumber:selectedPlayer.jersey_number||"",jerseySize:selectedPlayer.jersey_size||"",photoFile:null,photoPreview:selectedPlayer.profile_image_url||""})}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #dbeafe",background:"#F5E6C8",color:"#7A4F13",fontSize:13,cursor:"pointer",fontWeight:700}}>Edit</button>
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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Add New Player</h3><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div>
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
        <div style={{display:"flex",gap:10,marginTop:16}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={addSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Adding...":"Add Player"}</button></div>
      </div></div>}
      {editP&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Edit Player</h3><button onClick={()=>setEditP(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div>
        <div style={{display:"grid",gap:14}}>
          <div style={{display:"flex",justifyContent:"center"}}>
            <PhotoUploadField photoPreview={editForm.photoPreview} onPhotoSaved={(file,dataUrl)=>setEditForm({...editForm,photoFile:file,photoPreview:dataUrl})}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lS}>First Name</label><input value={editForm.firstName} onChange={e=>setEditForm({...editForm,firstName:e.target.value})} style={iS}/></div>
            <div><label style={lS}>Last Name</label><input value={editForm.lastName} onChange={e=>setEditForm({...editForm,lastName:e.target.value})} style={iS}/></div>
          </div>
          <div><label style={lS}>Mobile</label><input type="tel" value={editForm.phone} onChange={e=>setEditForm({...editForm,phone:e.target.value.replace(/[^0-9+]/g,"").slice(0,13)})} style={iS}/></div>
          <div><label style={lS}>City</label><input value={editForm.city} onChange={e=>setEditForm({...editForm,city:e.target.value})} placeholder="e.g. Pune" style={iS}/></div>
          <div><label style={lS}>Date of Birth</label><input type="date" value={editForm.birthDate} onChange={e=>setEditForm({...editForm,birthDate:e.target.value})} max={new Date().toISOString().split("T")[0]} style={iS}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lS}>Jersey Number</label><input value={editForm.jerseyNumber} onChange={e=>setEditForm({...editForm,jerseyNumber:e.target.value.replace(/[^0-9]/g,"").slice(0,3)})} inputMode="numeric" placeholder="e.g. 7" style={iS}/></div>
            <div><label style={lS}>Jersey Size</label>
              <select value={editForm.jerseySize} onChange={e=>setEditForm({...editForm,jerseySize:e.target.value})} style={iS}>
                <option value="">Select</option>
                {["S","M","L","XL","XXL"].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div><label style={lS}>PIN</label><input type="tel" inputMode="numeric" pattern="[0-9]*" value={editForm.pin} onChange={e=>setEditForm({...editForm,pin:e.target.value.replace(/[^0-9]/g,"").slice(0,4)})} maxLength={4} style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center"}}/></div>
          {isFounder && (
            <div>
              <label style={lS}>Role</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <button type="button" onClick={()=>setEditForm({...editForm,role:"player"})} style={{padding:"11px 6px",borderRadius:9,border:editForm.role==="player"?"2px solid #22C55E":"1.5px solid #E2E8F0",background:editForm.role==="player"?"rgba(34,197,94,0.08)":"#FFFFFF",color:editForm.role==="player"?"#166534":"#64748B",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"var(--font-body)"}}>🏏 Player</button>
                <button type="button" onClick={()=>setEditForm({...editForm,role:"organizer"})} style={{padding:"11px 6px",borderRadius:9,border:editForm.role==="organizer"?"2px solid #166534":"1.5px solid #E2E8F0",background:editForm.role==="organizer"?"rgba(22,101,52,0.08)":"#FFFFFF",color:editForm.role==="organizer"?"#166534":"#64748B",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"var(--font-body)"}}>🛡 Organizer</button>
              </div>
              <div style={{fontSize:11,color:"#94A3B8",marginTop:6}}>Organizers get admin access, but can't manage other organizers or platform settings.</div>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setEditP(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={editSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Save"}</button></div>
      </div></div>}
      {pinP&&<div style={mStyle}><div style={mBox}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Change PIN</h3><button onClick={()=>setPinP(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div>
        <div style={{padding:"12px 14px",background:"#f0fdf4",borderRadius:10,border:"1px solid #6ee7b7",marginBottom:16,fontSize:13,color:"#065f46"}}>Changing PIN for <strong>{pinP.name}</strong></div>
        <label style={lS}>New 4-digit PIN</label>
        <input type="tel" inputMode="numeric" pattern="[0-9]*" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="Enter new PIN" style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center",marginBottom:8}}/>
        {newPin&&newPin.length!==4&&<div style={{fontSize:11,color:"#ef4444",marginBottom:8}}>Must be 4 digits</div>}
        <div style={{display:"flex",gap:10,marginTop:8}}><button onClick={()=>setPinP(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={pinSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Update PIN"}</button></div>
      </div></div>}
      {delP&&<div style={mStyle}><div style={{...mBox,maxWidth:360}}>
        <div style={{textAlign:"center",padding:"10px 0 18px"}}><div style={{fontSize:40,marginBottom:12}}>⚠️</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Remove Player?</h3><p style={{color:"#6b7280",fontSize:13,margin:0}}>Remove <strong>{delP.name}</strong>?</p></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setDelP(null)} style={{flex:1,padding:"13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={delSubmit} disabled={busy} style={{flex:1,padding:"13px",borderRadius:9,background:"#fee2e2",border:"1.5px solid #fecaca",color:"#991b1b",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"...":"Yes, Remove"}</button></div>
      </div></div>}
    </div>
  )
}

// ─── My Availability ──────────────────────────────────────────────────────────
function RequestsPage({ onRefresh, isMobile }) {
  return (
    <div>
      <BackBtn onBack={()=>{}} label="Dashboard" hide/>
      <h2 style={{ color:"#0F172A", fontSize:isMobile?18:22, fontWeight:900, margin:"0 0 16px", fontFamily:"var(--font-head)" }}>Registration Requests</h2>
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
    if (showEmpty) return <div style={{ background:"#F8FAF8", borderRadius:14, padding:"32px 16px", border:"1.5px solid #e5e7eb", textAlign:"center", color:"#9ca3af" }}><div style={{ fontSize:36, marginBottom:10 }}>✅</div><div style={{ fontSize:14 }}>No pending registration requests</div></div>
    return null
  }

  return (
    <div style={{ background:"#fff7ed", borderRadius:14, padding:"16px", border:"1.5px solid #fed7aa", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <span style={{ fontSize:18 }}>⏳</span>
        <div style={{ fontWeight:800, fontSize:14, color:"#9a3412", fontFamily:"var(--font-head)" }}>Pending Approvals</div>
        <div style={{ background:"#f97316", color:"#0F172A", borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{pending.length}</div>
      </div>
      <div style={{ display:"grid", gap:8 }}>
        {pending.map(p => (
          <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#F8FAF8", borderRadius:10, border:"1px solid #fed7aa" }}>
            <Av name={p.name} id={p.id} sz={36}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:"#0F172A" }}>{p.name}</div>
              <div style={{ fontSize:11, color:"#9ca3af", display:"flex", alignItems:"center", gap:4 }}><Phone size={11}/> {p.phone}</div>
            </div>
            <button onClick={()=>approve(p.id)} disabled={busy===p.id} style={{ padding:"7px 12px", borderRadius:8, background:"#166534", border:"none", color:"#0F172A", fontSize:12, cursor:"pointer", fontWeight:700, flexShrink:0 }}>{busy===p.id?"...":"✔ Approve"}</button>
            <button onClick={()=>reject(p.id)} disabled={busy===p.id} style={{ padding:"7px 12px", borderRadius:8, background:"#fee2e2", border:"1px solid #fca5a5", color:"#991b1b", fontSize:12, cursor:"pointer", flexShrink:0 }}>Reject</button>
          </div>
        ))}
      </div>
    </div>
  )
}


function AdminProfilePage({ loggedPlayer, players, matches, grounds, teams, onRefresh, isMobile, isFounder }) {
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
        <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", background: "#FFFFFF", display: "inline-block", padding: "6px 14px", borderRadius: 8, fontFamily: "var(--font-head)" }}>👑 Admin</div>
      </Card>
      <Card style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", fontFamily: "var(--font-head)" }}>👤 My Profile</div>
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
              <button onClick={async () => { try { await updatePlayer(loggedPlayer.id, pForm.name, pForm.phone, pForm.pin, pForm.city); alert("Profile updated! Please log in again to see changes."); setEditing(false); onRefresh() } catch(e) { alert(e.message) } }} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#FFFFFF", border: "none", color: "#0F172A", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-head)" }}>Save</button>
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
function GlobalSearchOverlay({ onClose, onNavigate }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!query.trim()) { setResults(null); return }
    setLoading(true)
    const t = setTimeout(() => {
      globalSearch(query).then(setResults).catch(()=>setResults(null)).finally(()=>setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const goTo = (pg, id) => { onNavigate(pg, id); onClose() }

  const sections = results ? [
    { key: "matches", label: "Matches", items: results.matches, render: m => ({ id: m.id, title: matchTitle(m), sub: `${m.ground} · ${m.status}` }) },
    { key: "players", label: "Players", items: results.players, render: p => ({ id: p.id, title: p.name, sub: p.city || "", role: p.role }) },
    { key: "teams", label: "Teams", items: results.teams, render: t => ({ id: t.id, title: t.name, sub: "" }) },
    { key: "grounds", label: "Grounds", items: results.grounds, render: g => ({ id: g.id, title: g.name, sub: g.location || "" }) },
  ].filter(s => s.items && s.items.length > 0) : []

  const totalResults = sections.reduce((n, s) => n + s.items.length, 0)

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-start", justifyContent:"center", zIndex:800, padding:"70px 16px 16px" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#F8FAF8", border:"1.5px solid #F1F5F9", borderRadius:16, maxWidth:480, width:"100%", maxHeight:"75vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", borderBottom:"1px solid #F1F5F9" }}>
          <SearchIcon size={17} color="#F8FAF8"/>
          <input
            ref={inputRef}
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search players, teams, grounds, matches..."
            style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#0F172A", fontSize:15, fontFamily:"var(--font-body)" }}
          />
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#64748B", fontSize:18, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ overflowY:"auto", padding: query.trim() ? "8px 0" : 0 }}>
          {!query.trim() ? (
            <div style={{ padding:"30px 20px", textAlign:"center", color:"#64748B", fontSize:13 }}>Start typing to search across players, teams, grounds, and matches.</div>
          ) : loading ? (
            <div style={{ padding:"30px 20px", textAlign:"center", color:"#64748B", fontSize:13 }}>Searching...</div>
          ) : totalResults === 0 ? (
            <div style={{ padding:"30px 20px", textAlign:"center", color:"#64748B", fontSize:13 }}>No results for "{query}".</div>
          ) : sections.map(s => (
            <div key={s.key} style={{ padding:"6px 16px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.5, margin:"8px 0 4px" }}>{s.label}</div>
              {s.items.map(item => {
                const r = s.render(item)
                return (
                  <div key={r.id} onClick={()=>goTo(s.key, r.id)} style={{ padding:"9px 10px", borderRadius:9, cursor:"pointer", display:"flex", flexDirection:"column" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#F8FAF8"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:"#0F172A" }}>{r.title}</div>
                      {r.role && r.role !== "player" && <RoleBadge role={r.role} size="sm"/>}
                    </div>
                    {r.sub && <div style={{ fontSize:12, color:"#64748B" }}>{r.sub}</div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


