import { useState, useEffect, useRef, useMemo } from "react"
import { Search as SearchIcon } from "lucide-react"
import { Users, User as UserIcon, Calendar, MapPin, Landmark, Clock, Lock, Wallet, Phone, Link as LinkIcon, ShieldCheck, CheckCircle2, XCircle, Hourglass, Zap, Trash2, Trophy, LayoutDashboard, Swords, MessageSquare, LogOut, Bell, BarChart3, ChevronRight, Plus, UserPlus, UsersRound, MoreVertical, SlidersHorizontal, Star, ArrowUpDown, ArrowLeft, AlertTriangle, Gavel, FileText, RotateCcw, Share2, Download, Printer, Copy, Check, Ban, Shuffle } from "lucide-react"
import { LogoFull, Av, Tag, Btn, Card, Spinner, LeaderboardPage, RoleBadge, CoinIcon } from "./ui.jsx"
import { fetchPlayers, fetchGrounds, fetchGroundOwners, saveGroundOwner, deleteGroundOwner, fetchMatches, fetchTeams, fetchSettings, confirmPlayerToMatch, fetchMyInvites, fetchMatchCounts, fetchPendingPlayers, approvePlayer, rejectPlayer, createMatch, updateMatchStatus, deleteMatch, toggleMatchLink, updateMatchMaxPlayers, fetchMatchPlayers, notifyPlayer, removePlayerFromMatch, setPlayerStatus, fetchPublicResponses, approvePublicResponse, rejectPublicResponse, fetchExpenses, addExpense, deleteExpense, fetchPayments, togglePayment, addContribution, fetchContributions, deleteContribution, contributionExists, fetchChat, sendMessage, subscribeToChat, addGround, updateGround, deleteGround, addTeam, updateTeam, deleteTeam, uploadTeamLogo, fetchSentMessages, sendAdminMessage, fetchPendingProRequests, approveProRequest, rejectProRequest, globalSearch, fetchAuctionPlayers, updateAuctionPlayerBasePrice, deleteAuctionPlayer, tagAuctionPlayerDropped, restoreAuctionPlayer, resetAuctionPlayerToPool, fetchAuctionTeams, createAuctionTeam, updateAuctionTeam, deleteAuctionTeam, fetchAuctionState, startAuction, placeBid, undoLastBid, markPlayerSold, markPlayerUnsold, jumpToAuctionPlayer, fetchAuctionBidHistory, fetchAuctionRegistrationOpen, setAuctionRegistrationOpen, fetchRecentActivity, fetchNotifications, fetchUnreadNotificationCount, markNotificationRead, markAllNotificationsRead, fetchAllAuctions, fetchPendingAuctionPayments, approveAuctionPayment, rejectAuctionPayment, deleteAuctionEvent, fetchPlatformUpi, setPlatformUpi, fetchLeaderboard, fetchPlayerMatchHistory, fetchAllAuctionTeamCounts, fetchAllAuctionPlayerCounts, fetchAuctionSponsors, addAuctionSponsor, deleteAuctionSponsor, uploadSponsorLogo, fetchPlayerAuctionHistory, syncAuctionPlayersToRoster, addRosterPlayerToAuction, updatePlayer, updateAuction, updateAuctionPlayerPaymentStatus, updateAuctionPlayerStatus, fetchScoringConfig, fetchMatchSquad, fetchInnings, fetchDeliveries, fetchMatchScorers, assignMatchScorer, revokeMatchScorer, reopenCompletedMatch } from "../db.js"
import { reduceInningsState } from "../scoringEngine.js"
import ScoringSetupModal from "./ScoringSetupModal.jsx"
import ScoringConsole from "./ScoringConsole.jsx"
import LiveScorecard from "./LiveScorecard.jsx"
import CreateAuctionFlow, { AuctionPaymentModal } from "./CreateAuctionFlow.jsx"
import AuctionLiveConsole from "./AuctionLiveConsole.jsx"
import GroundBookingsSection from "./GroundBookingsSection.jsx"
import { fmtDate, dayName, PAL, matchTitle, AUCTION_PLANS, isValidName, birthDateError, maxBirthDateForMinAge, exportTeamRosterCsv, exportTeamRosterPdf, shareTeamOnWhatsApp, PUNE_CRICKET_GROUNDS, searchPuneMapGrounds, searchMapGrounds, generateAuctionPlayerInvite, exportAuctionPoolPdf, exportAuctionPoolCsv, generateAuctionPoolWhatsAppText, shareAuctionPoolOnWhatsApp, stepBidPointsUp, stepBidPointsDown } from "../constants.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import { waInvite, waInviteWithLink, waPublicLink, waPayment, waReminder, waSquadFull, waGroundOwnerCredentials } from "./whatsapp.js"
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
      setSettings(s||{})
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
    ["dashboard","Home",LayoutDashboard],["matches","🏏 Scoring & Matches",Swords],
    ["leaderboard","Leaderboard",Trophy],["profile","Profile",UserIcon],
  ]
  const desktopNavItems = [
    ["dashboard","Home",LayoutDashboard],
    ["matches","🏏 Live Scoring & Matches",Swords],
    ["players","Players",Users],
    ["teams","Teams",ShieldCheck],
    ["auction","Auction",Wallet],
    ["grounds","Grounds & Bookings",MapPin],
    ["leaderboard","Leaderboard",Trophy],
  ]
  const drawerItems = [
    ["dashboard","Home",LayoutDashboard],["matches","🏏 Live Scoring & Matches",Swords],["players","Players",Users],["teams","Teams",ShieldCheck],["grounds","Grounds & Bookings",MapPin],["auction","Auction",Wallet],["leaderboard","Leaderboard",Trophy]
  ]

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F1F5F9",
      backgroundImage: "radial-gradient(at 0% 0%, rgba(22, 101, 52, 0.06) 0px, transparent 450px), radial-gradient(at 100% 0%, rgba(184, 134, 11, 0.04) 0px, transparent 400px), radial-gradient(#CBD5E1 0.75px, transparent 0.75px)",
      backgroundSize: "100% 100%, 100% 100%, 24px 24px",
      backgroundAttachment: "fixed",
      fontFamily: "var(--font-body)",
      paddingBottom: isMobile ? 120 : 40
    }}>
      {/* Top bar */}
      <div style={{ background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", height: isMobile ? 56 : 60, borderBottom:"1px solid #E2E8F0", display:"flex", alignItems:"center", padding: isMobile ? "0 16px" : "0 24px", gap:12, position:"sticky", top:0, zIndex:200, boxShadow:"0 1px 4px rgba(15,23,42,0.05)" }}>
        {isMobile && (
          <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:"transparent", border:"none", color:"#0F172A", fontSize:20, cursor:"pointer", padding:6 }}>☰</button>
        )}
        <div onClick={()=>navigate("dashboard")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0 }}>
          <div style={{ fontWeight:900, fontSize: isMobile ? 16 : 18, color:"#166534", fontFamily:"var(--font-head)", letterSpacing:"-0.3px" }}>Selected Sports</div>
        </div>

        {/* Desktop Navigation Links */}
        {!isMobile && (
          <div style={{ display:"flex", alignItems:"center", gap:4, margin:"0 auto", flexWrap:"wrap" }}>
            {desktopNavItems.map(([k, label, Icon]) => {
              const active = page === k
              return (
                <button
                  key={k}
                  onClick={()=>navigate(k)}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    gap:6,
                    padding:"7px 13px",
                    borderRadius:8,
                    border:"none",
                    background: active ? "rgba(22,101,52,0.09)" : "transparent",
                    color: active ? "#166534" : "#64748B",
                    fontSize:13,
                    fontWeight: active ? 800 : 600,
                    cursor:"pointer",
                    fontFamily:"var(--font-body)",
                    transition:"all 0.15s ease"
                  }}
                >
                  <Icon size={16} color={active ? "#166534" : "#94A3B8"}/>
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {isMobile && <div style={{ flex: 1 }} />}

        {/* Right action icons */}
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <button onClick={()=>setSearchOpen(true)} style={{ background:"transparent", border:"none", color:"#166534", cursor:"pointer", padding:7, display:"flex", alignItems:"center", borderRadius:8 }} title="Search"><SearchIcon size={18}/></button>
          <button onClick={openNotifications} style={{ background:"transparent", border:"none", color:"#166534", cursor:"pointer", padding:7, display:"flex", alignItems:"center", position:"relative", borderRadius:8 }} title="Notifications">
            <Bell size={18}/>
            {unreadCount > 0 && <span style={{ position:"absolute", top:2, right:2, background:"#EF4444", color:"#FFFFFF", fontSize:9, fontWeight:800, borderRadius:999, minWidth:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>
          {!isMobile && (
            <>
              <div onClick={()=>navigate("profile")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"5px 10px", borderRadius:8, background: page==="profile" ? "rgba(22,101,52,0.09)" : "transparent", marginLeft:4 }}>
                <Av name={loggedPlayer?.name || "Admin"} id={loggedPlayer?.id} sz={28}/>
                <span style={{ fontSize:13, fontWeight:700, color: page==="profile" ? "#166534" : "#0F172A" }}>{loggedPlayer?.name?.split(" ")[0] || "Admin"}</span>
              </div>
              <button onClick={onLogout} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:7, display:"flex", alignItems:"center", borderRadius:8, marginLeft:2 }} title="Logout">
                <LogOut size={17}/>
              </button>
            </>
          )}
        </div>
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

      {/* Hamburger drawer (Mobile) */}
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
        {page==="teams"     && <><BackBtn onBack={()=>navigate("dashboard")}/><TeamsPage teams={teams} matches={matches} onRefresh={load} isMobile={isMobile}/></>}
        {page==="grounds"   && <><BackBtn onBack={()=>navigate("dashboard")}/><GroundsPage grounds={grounds} matches={matches} onRefresh={load} isMobile={isMobile}/></>}
        {page==="auction"   && <><BackBtn onBack={()=>navigate("dashboard")}/><AuctionPage isMobile={isMobile} isFounder={isFounder}/></>}
        {page==="leaderboard" && <><BackBtn onBack={()=>navigate("dashboard")}/><LeaderboardPage isMobile={isMobile} myId={loggedPlayer?.id}/></>}
      </div>

      {/* Bottom navigation - Mobile only */}
      {isMobile && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#FFFFFF", borderTop:"1px solid #E2E8F0", display:"flex", zIndex:200, boxShadow:"0 -4px 16px rgba(15,23,42,0.06)" }}>
          {bottomNavItems.map(([k,v,Icon]) => (
            <button key={k} onClick={()=>navigate(k)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"9px 4px 8px", border:"none", background:"transparent", cursor:"pointer", color:page===k?"#166534":"#94A3B8" }}>
              <Icon size={20}/>
              <span style={{ fontSize:10, fontWeight:page===k?700:500 }}>{v}</span>
            </button>
          ))}
        </div>
      )}
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
      {/* Live Cricket Scoring Banner */}
      <div style={{
        background: "linear-gradient(135deg, #166534 0%, #14532D 100%)",
        borderRadius: 18,
        padding: isMobile ? "16px" : "20px 24px",
        color: "#FFFFFF",
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 14,
        boxShadow: "0 6px 20px rgba(22,101,52,0.22)"
      }}>
        <div style={{ minWidth: 260, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#86EFAC", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px #4ADE80" }}/>
            LIVE CRICKET SCORING SUBSYSTEM
          </div>
          <div style={{ fontSize: isMobile ? 17 : 21, fontWeight: 900, fontFamily: "var(--font-head)" }}>
            Ball-by-Ball Match Scoring & Live Scorecards
          </div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4, lineHeight: 1.4 }}>
            Start live scoring for any upcoming match, record legal balls, extras, wickets, or share spectator links.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate("matches")}
            style={{
              padding: "11px 20px",
              borderRadius: 12,
              background: "#FFFFFF",
              border: "none",
              color: "#166534",
              fontSize: 13,
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "var(--font-head)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            🏏 Start / View Scoring →
          </button>
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
  const [form, setForm] = useState({ date:today, startH:7, startM:"00", endH:9, endM:"00", groundId:grounds[0]?.id||"", teamId:teams[0]?.id||"", type:"external", ourTeamId:"", maxPlayers:9, visibility:"private" })
  const [busy, setBusy] = useState(false)
  const [teamList, setTeamList] = useState(teams)
  const [groundList, setGroundList] = useState(grounds)
  const [mapGrounds, setMapGrounds] = useState([])
  const [loadingMap, setLoadingMap] = useState(false)
  const [typedGroundQuery, setTypedGroundQuery] = useState("")
  const [typedGroundResults, setTypedGroundResults] = useState([])
  const [searchingTypedGround, setSearchingTypedGround] = useState(false)
  const [groundFeedback, setGroundFeedback] = useState("")
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

  useEffect(() => {
    const q = typedGroundQuery.trim()
    if (!q || q.length < 2) {
      setTypedGroundResults([])
      return
    }
    setSearchingTypedGround(true)
    const t = setTimeout(async () => {
      try {
        const results = await searchMapGrounds(q, "Pune", "Maharashtra")
        setTypedGroundResults(results)
      } catch (err) {
        console.warn("Typed ground search error:", err)
      } finally {
        setSearchingTypedGround(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [typedGroundQuery])

  const handleSelectGround = async (g) => {
    if (g.id) {
      setForm(f => ({ ...f, groundId: g.id }))
      setGroundFeedback(g.name)
      setTimeout(() => setGroundFeedback(""), 2500)
      return
    }
    const existing = groundList.find(x => x.name.toLowerCase() === g.name.toLowerCase())
    if (existing) {
      setForm(f => ({ ...f, groundId: existing.id }))
      setGroundFeedback(existing.name)
      setTimeout(() => setGroundFeedback(""), 2500)
      return
    }
    setBusy(true)
    try {
      const created = await addGround(g.name, g.location || "Pune, Maharashtra", g.maps_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.name + " Pune")}`, "Added via match scheduling")
      if (created) {
        const createdObj = created.data || created
        setGroundList(prev => [...prev, createdObj])
        setForm(f => ({ ...f, groundId: createdObj.id }))
        setGroundFeedback(createdObj.name)
        setTimeout(() => setGroundFeedback(""), 2500)
      }
    } catch (e) {
      alert("Ground select: " + e.message)
    } finally {
      setBusy(false)
    }
  }

  const scanPuneMap = async () => {
    setLoadingMap(true)
    try {
      const results = await searchPuneMapGrounds()
      setMapGrounds(results)
    } finally {
      setLoadingMap(false)
    }
  }

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
  const selGround = groundList.find(g=>String(g.id)===String(form.groundId))

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
    try { await createMatch({ date:form.date,time_slot:timeSlot,ground:selGround.name,team:teamName,team_logo:teamLogo,our_team:ourTeamName,our_team_logo:ourTeamLogo,type:form.type,max_players:form.maxPlayers,visibility:form.visibility }); onCreated() }
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
        <p style={{ margin:"0 0 18px",fontSize:12,color:"#6b7280" }}>Schedule match, select venue, and take player availability count.</p>
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

          {/* Ground Selection with Google Maps for Pune */}
          <div style={{ padding:"14px", background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <label style={{ ...lS, marginBottom:0, fontWeight:700, color:"#0F172A", display:"flex", alignItems:"center", gap:6 }}>
                <MapPin size={14} color="#166534"/> Ground (Pune) *
              </label>
              <a
                href="https://www.google.com/maps/search/cricket+grounds+in+pune"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize:11, color:"#166534", fontWeight:700, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}
              >
                Google Maps ↗
              </a>
            </div>
            <div style={{ fontSize:11, color:"#64748B", marginBottom:10 }}>
              Search or pick an available cricket ground from all over Pune.
            </div>

            {/* Live Typing Map Search */}
            <div style={{ marginBottom:10 }}>
              <div style={{ position:"relative" }}>
                <input
                  value={typedGroundQuery}
                  onChange={e => setTypedGroundQuery(e.target.value)}
                  placeholder="Type ground name to fetch on Google Map & add..."
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", background:"#F8FAF8", fontFamily:"var(--font-body)" }}
                />
                {typedGroundQuery && (
                  <button type="button" onClick={() => { setTypedGroundQuery(""); setTypedGroundResults([]) }} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#94A3B8", fontSize:14, cursor:"pointer" }}>×</button>
                )}
              </div>

              {searchingTypedGround && (
                <div style={{ fontSize:11, color:"#166534", fontWeight:600, padding:"4px 0", display:"flex", alignItems:"center", gap:6 }}>
                  <span>🔄</span> Fetching map grounds for "{typedGroundQuery}"...
                </div>
              )}

              {/* Fetched Ground Matches */}
              {typedGroundResults.length > 0 && (
                <div style={{ marginTop:6, padding:"8px", background:"#F0FDF4", border:"1.5px solid #86EFAC", borderRadius:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#166534", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                    <span>📍 Map Matches for "{typedGroundQuery}"</span>
                    <span style={{ fontSize:10, color:"#15803D" }}>Click to Select & Add</span>
                  </div>
                  <div style={{ display:"grid", gap:5, maxHeight:140, overflowY:"auto" }}>
                    {typedGroundResults.map((m, idx) => {
                      const isSel = selGround?.name?.toLowerCase() === m.name.toLowerCase()
                      return (
                        <div key={idx} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 8px", background:"#FFFFFF", borderRadius:6, border:`1px solid ${isSel ? "#166534" : "#BBF7D0"}` }}>
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.name}</div>
                            <div style={{ fontSize:10, color:"#64748B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.location}</div>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0, marginLeft:6 }}>
                            {m.maps_link && (
                              <a href={m.maps_link} target="_blank" rel="noreferrer" style={{ fontSize:10.5, color:"#0284C7", textDecoration:"none", fontWeight:600 }}>Map ↗</a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSelectGround(m)}
                              style={{
                                padding:"4px 8px", borderRadius:6,
                                background: isSel ? "#166534" : "#DCFCE7",
                                color: isSel ? "#FFFFFF" : "#166534",
                                border: "1px solid #166534",
                                fontSize:10.5, fontWeight:700, cursor:"pointer"
                              }}
                            >
                              {isSel ? "✓ Selected" : "+ Select & Add"}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {groundFeedback && (
                <div style={{ fontSize:11.5, color:"#166534", fontWeight:700, marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
                  <span>✓</span> Selected venue: {groundFeedback}
                </div>
              )}
            </div>

            <SearchDropdown
              options={groundList.map(g => ({ ...g, label: `${g.name} — ${g.location || "Pune"}` }))}
              value={form.groundId}
              onChange={v => setForm({ ...form, groundId: v })}
              placeholder="Select or search ground..."
              renderOption={o => (
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{o.name}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{o.location || "Pune"}</div>
                </div>
              )}
              renderSelected={o => <span style={{ fontSize:13, fontWeight:600 }}>{o.name} — {o.location || "Pune"}</span>}
            />

            {/* Quick Pune Grounds Chips */}
            <div style={{ marginTop:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div style={{ fontSize:10.5, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  Available Grounds in Pune
                </div>
                <button
                  type="button"
                  onClick={scanPuneMap}
                  disabled={loadingMap}
                  style={{ background:"none", border:"none", color:"#166534", fontSize:11, fontWeight:700, cursor:"pointer", padding:0 }}
                >
                  {loadingMap ? "Scanning Map..." : "🔄 Scan Pune Map"}
                </button>
              </div>

              {/* Map Discovered Chips */}
              {mapGrounds.length > 0 && (
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:10, color:"#0369A1", fontWeight:600, marginBottom:4 }}>Found on Map:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, maxHeight:100, overflowY:"auto" }}>
                    {mapGrounds.map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectGround(m)}
                        style={{
                          padding:"4px 8px", borderRadius:6,
                          border: selGround?.name === m.name ? "1.5px solid #0284C7" : "1px solid #BAE6FD",
                          background: selGround?.name === m.name ? "#E0F2FE" : "#F0F9FF",
                          color:"#0369A1", fontSize:11, fontWeight:600, cursor:"pointer"
                        }}
                      >
                        📍 {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Presets / Platform Grounds Chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:5, maxHeight:120, overflowY:"auto" }}>
                {PUNE_CRICKET_GROUNDS.slice(0, 14).map((p, idx) => {
                  const isSel = selGround?.name?.toLowerCase() === p.name.toLowerCase()
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectGround(p)}
                      style={{
                        padding:"4px 8px", borderRadius:6,
                        border: isSel ? "1.5px solid #166534" : "1px solid #E2E8F0",
                        background: isSel ? "#DCFCE7" : "#F8FAF8",
                        color: isSel ? "#166534" : "#475569",
                        fontSize:11, fontWeight:600, cursor:"pointer"
                      }}
                    >
                      🏟️ {p.name}
                    </button>
                  )
                })}
              </div>
            </div>
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

          {/* Squad Size & Player Availability Count Target */}
          <div>
            <label style={lS}>
              {form.type === "external" ? "Our Squad Size (Player Availability Target)" : "Total Players (Two Equal Sides)"}
            </label>
            {form.type === "external" ? (
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {[6, 7, 8, 9, 10, 11, 12].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, maxPlayers: n })}
                    style={{
                      flex: "1 1 calc(14% - 6px)",
                      minWidth: 40,
                      padding: "10px 4px",
                      borderRadius: 8,
                      border: `2px solid ${form.maxPlayers === n ? "#166534" : "#E2E8F0"}`,
                      background: form.maxPlayers === n ? "#F0FDF4" : "#FFFFFF",
                      color: form.maxPlayers === n ? "#166534" : "#475569",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: form.maxPlayers === n ? 800 : 600
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {[10, 12, 14, 16, 18, 20, 22].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, maxPlayers: n })}
                    style={{
                      flex: "1 1 calc(25% - 6px)",
                      padding: "10px 4px",
                      borderRadius: 8,
                      border: `2px solid ${form.maxPlayers === n ? "#166534" : "#E2E8F0"}`,
                      background: form.maxPlayers === n ? "#F0FDF4" : "#FFFFFF",
                      color: form.maxPlayers === n ? "#166534" : "#475569",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: form.maxPlayers === n ? 800 : 600
                    }}
                  >
                    {n} ({n/2}v{n/2})
                  </button>
                ))}
              </div>
            )}
            <div style={{ padding:"9px 12px", background:"#F0FDF4", borderRadius:8, border:"1px solid #BBF7D0", fontSize:12, color:"#166534", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
              <Users size={14}/> Taking player availability count: up to <strong>{form.maxPlayers} players</strong> squad capacity.
            </div>
          </div>

          <div>
            <label style={lS}>Visibility</label>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[["private","🔒 Private","Only invited players see it"],["public","🌐 Public","All registered players see it"]].map(([v,l,sub])=>(
                <button key={v} onClick={()=>setForm({...form,visibility:v})} style={{ padding:"12px 8px",borderRadius:9,border:`2px solid ${form.visibility===v?"#166534":"#e5e7eb"}`,background:form.visibility===v?"#f0fdf4":"#F8FAF8",color:form.visibility===v?"#065f46":"#6b7280",cursor:"pointer",fontFamily:"var(--font-body)",textAlign:"center" }}>
                  <div style={{ fontSize:13,fontWeight:form.visibility===v?800:600 }}>{l}</div>
                  <div style={{ fontSize:10,color:form.visibility===v?"#059669":"#9ca3af",marginTop:2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
          {form.type==="external" && (
            <div>
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
  const [search, setSearch]   = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [groundFilter, setGroundFilter] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)
  const [busyAction, setBusyAction] = useState(false)

  useEffect(()=>{ if(initialFilter) setFilter(initialFilter) },[initialFilter])
  useEffect(()=>{ if(selId){ const m=matches.find(m=>m.id===selId); if(m) loadMatch(m) } },[selId])

  const adminId = loggedPlayer?.id
  const proIds = new Set(players.filter(p=>p.role==="pro").map(p=>p.id))
  const statusFiltered =
    filter==="all"   ? matches :
    filter==="mine"  ? matches.filter(m=>!m.created_by || m.created_by===adminId) :
    filter==="pro"   ? matches.filter(m=>m.created_by && proIds.has(m.created_by)) :
    matches.filter(m=>m.status===filter)
  const q = search.trim().toLowerCase()
  const filtered = statusFiltered.filter(m => {
    if (groundFilter && m.ground !== groundFilter) return false
    if (!q) return true
    return matchTitle(m).toLowerCase().includes(q) || (m.team||"").toLowerCase().includes(q) || (m.our_team||"").toLowerCase().includes(q) || (m.ground||"").toLowerCase().includes(q)
  })
  const countFor = k =>
    k==="all"  ? matches.length :
    k==="mine" ? matches.filter(m=>!m.created_by || m.created_by===adminId).length :
    k==="pro"  ? matches.filter(m=>m.created_by && proIds.has(m.created_by)).length :
    matches.filter(m=>m.status===k).length
  const todayStr = new Date().toISOString().split("T")[0]

  const loadMatch = async m => {
    setLoading(true)
    try {
      const [mps,exps,pays,chats,pubs] = await Promise.all([fetchMatchPlayers(m.id),fetchExpenses(m.id),fetchPayments(m.id),fetchChat(m.id),fetchPublicResponses(m.id)])
      setDetail({ match:m,matchPlayers:mps,expenses:exps,payments:pays,chat:chats,publicResponses:pubs })
    } catch(e){ alert(e.message) }
    setLoading(false)
  }

  if(loading) return <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>
  if(detail) return <MatchDetail detail={detail} settings={settings} players={players} teams={teams} onBack={()=>setDetail(null)} onRefresh={()=>loadMatch(detail.match)} onDeleted={()=>{ setDetail(null); onRefresh() }} onStatusChange={async status=>{ await updateMatchStatus(detail.match.id,status); onRefresh(); setDetail(null) }} isMobile={isMobile} loggedPlayer={loggedPlayer}/>

  return (
    <div>
      <BackBtn onBack={()=>onNavigate("dashboard")}/>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:12 }}>
        <div>
          <h2 style={{ color:"#0F172A",fontSize:isMobile?20:26,fontWeight:900,margin:0,fontFamily:"var(--font-head)" }}>Matches</h2>
          <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>Manage and organize all platform matches</div>
        </div>
        {(settings?.subscription_expiry && new Date(settings.subscription_expiry) >= new Date())
          ? <button onClick={()=>setShowNew(true)} style={{ padding:"10px 16px", borderRadius:12, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:6, flexShrink:0, whiteSpace:"nowrap" }}><Plus size={15}/> Create Match</button>
          : <div onClick={()=>alert("Scheduling requires an active subscription.\nContact admin to renew.")} style={{ padding:isMobile?"7px 12px":"8px 16px",borderRadius:9,background:"#f3f4f6",border:"1.5px solid #e5e7eb",color:"#9ca3af",fontSize:isMobile?12:13,cursor:"pointer",fontWeight:600, flexShrink:0 }}><Lock size={12} style={{verticalAlign:"-2px"}}/> Subscribe</div>
        }
      </div>

      {/* Filter pills */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {[["all","All",null],["mine",`My Matches (${countFor("mine")})`,null],["pro",`Pro Matches (${countFor("pro")})`,null],["upcoming",`Upcoming (${countFor("upcoming")})`,null],["completed",`Completed (${countFor("completed")})`,null]].map(([k,label]) => (
          <button key={k} onClick={()=>setFilter(k)} style={{ padding:"9px 16px", borderRadius:999, border:filter===k?"none":"1.5px solid #E2E8F0", background:filter===k?"#166534":"#FFFFFF", color:filter===k?"#FFFFFF":"#0F172A", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)", whiteSpace:"nowrap" }}>{label}</button>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <div style={{ flex:1, position:"relative" }}>
          <SearchIcon size={16} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search matches by name, team or ground..." style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", boxSizing:"border-box", fontFamily:"var(--font-body)" }}/>
        </div>
        <button onClick={()=>setFiltersOpen(o=>!o)} style={{ padding:"12px 16px", borderRadius:12, border:"1.5px solid #E2E8F0", background:filtersOpen||groundFilter?"rgba(22,101,52,0.08)":"#FFFFFF", color:"#0F172A", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}><SlidersHorizontal size={15}/> Filters{groundFilter?" (1)":""}</button>
      </div>

      {filtersOpen && (
        <Card style={{ padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:12, color:"#64748B", fontWeight:600, marginBottom:8 }}>Ground</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={()=>setGroundFilter("")} style={{ padding:"6px 12px", borderRadius:999, border:!groundFilter?"none":"1px solid #E2E8F0", background:!groundFilter?"#166534":"#FFFFFF", color:!groundFilter?"#FFFFFF":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer" }}>Any ground</button>
            {grounds.map(g => (
              <button key={g.id} onClick={()=>setGroundFilter(g.name)} style={{ padding:"6px 12px", borderRadius:999, border:groundFilter===g.name?"none":"1px solid #E2E8F0", background:groundFilter===g.name?"#166534":"#FFFFFF", color:groundFilter===g.name?"#FFFFFF":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer" }}>{g.name}</button>
            ))}
          </div>
        </Card>
      )}
      {filtered.length===0?(
        <Card style={{ padding:"40px 24px",textAlign:"center" }}>
          <div style={{ fontSize:44,marginBottom:10 }}>🏏</div>
          <div style={{ fontWeight:700,fontSize:15,color:"#0F172A",marginBottom:6,fontFamily:"var(--font-head)" }}>No {filter==="all"?"":filter} matches</div>
          <div style={{ color:"#6b7280",fontSize:13 }}>{filter==="upcoming"?"Schedule a new match to get started.":filter==="completed"?"Mark matches as done to see them here.":"No matches found."}</div>
        </Card>
      ):(
        <div style={{ display:"grid",gap:10 }}>
          {filtered.map(m=>{
            const isLive = m.status==="upcoming" && m.date===todayStr
            const statusLabel = isLive ? "Live" : m.status
            const statusStyle = isLive
              ? { background:"rgba(37,99,235,0.12)", color:"#2563EB" }
              : m.status==="upcoming" ? { background:"rgba(34,197,94,0.12)", color:"#166534" }
              : m.status==="completed" ? { background:"#F1F5F9", color:"#64748B" }
              : { background:"rgba(239,68,68,0.12)", color:"#EF4444" }
            return (
            <div key={m.id} onClick={()=>loadMatch(m)} style={{ background:"#FFFFFF",borderRadius:18,padding:isMobile?"15px 16px":"18px 22px",cursor:"pointer",border:"1.5px solid #e5e7eb",boxShadow:"0 4px 14px rgba(15,23,42,0.05)",WebkitTapHighlightColor:"rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                <TeamAv name={m.team} logo={m.team_logo} size={isMobile?40:48}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:800,color:"#0F172A",fontSize:isMobile?13:15,fontFamily:"var(--font-head)" }}>{matchTitle(m)}</div>
                  <div style={{ color:"#64748B",fontSize:12,marginTop:3, display:"flex", alignItems:"center", gap:5 }}><Calendar size={11}/> {fmtDate(m.date)} · <Clock size={11}/> {m.time_slot}</div>
                  <div style={{ color:"#94A3B8",fontSize:12,marginTop:2, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/> {m.ground}</div>
                    {(() => {
                      const joined = matchCounts[m.id] || 0
                      const cap = m.max_players || 0
                      const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                      return (
                        <div style={{ marginTop:8 }} data-adminCardBar>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                            <span style={{ fontSize:12, fontWeight:600, color:"#64748B", display:"inline-flex", alignItems:"center", gap:5 }}><Users size={12}/> {joined} / {cap||"—"} players joined</span>
                            <span style={{ fontSize:12, fontWeight:700, color:"#166534" }}>{pct}%</span>
                          </div>
                          <div style={{ height:6, background:"#e5e7eb", borderRadius:5, overflow:"hidden" }}>
                            <div style={{ width:pct+"%", height:"100%", background:pct>=100?"#166534":"linear-gradient(90deg,#6ee7b7,#166534)", borderRadius:5 }}/>
                          </div>
                        </div>
                      )
                    })()}
                  {m.created_by && (()=>{ const creator = players.find(p=>p.id===m.created_by); return creator && creator.role==="pro" ? <div style={{ color:"#7c3aed",fontSize:11,marginTop:5,fontWeight:700 }}>⭐ Scheduled by {creator.name}</div> : null })()}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => loadMatch(m)}
                      style={{
                        padding: "6px 13px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        boxShadow: "0 2px 6px rgba(22, 101, 52, 0.2)"
                      }}
                    >
                      🏏 {m.status === "in_progress" ? "Resume Scoring" : "Score Match"}
                    </button>
                    <button
                      onClick={() => loadMatch(m)}
                      style={{
                        padding: "6px 11px",
                        borderRadius: 8,
                        background: "#FFFFFF",
                        border: "1.5px solid #E2E8F0",
                        color: "#0F172A",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      📊 Scorecard
                    </button>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",flexShrink:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ ...statusStyle, borderRadius:999, padding:"5px 12px", fontSize:11, fontWeight:700, textTransform:"capitalize", display:"inline-block" }}>{statusLabel}</span>
                    <ChevronRight size={16} color="#94A3B8"/>
                  </div>
                  <div style={{ position:"relative" }} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setOpenMenuId(id=>id===m.id?null:m.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, display:"flex" }}><MoreVertical size={16} color="#94A3B8"/></button>
                    {openMenuId===m.id && (
                      <div style={{ position:"absolute", top:"100%", right:0, background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:10, boxShadow:"0 8px 24px rgba(15,23,42,0.12)", zIndex:20, minWidth:170, overflow:"hidden" }}>
                        <button onClick={()=>{ setOpenMenuId(null); loadMatch(m) }} style={{ width:"100%", padding:"10px 14px", border:"none", background:"#F0FDF4", textAlign:"left", fontSize:13, color:"#166534", cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontWeight:700 }}>🏏 Live Scoring</button>
                        <button onClick={()=>{ setOpenMenuId(null); loadMatch(m) }} style={{ width:"100%", padding:"10px 14px", border:"none", background:"none", textAlign:"left", fontSize:13, color:"#0F172A", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>📊 Scorecard</button>
                        {m.status==="upcoming" && (
                          <button disabled={busyAction} onClick={async()=>{ setBusyAction(true); try{ await updateMatchStatus(m.id,"completed"); onRefresh() } catch(e){alert(e.message)} setBusyAction(false); setOpenMenuId(null) }} style={{ width:"100%", padding:"10px 14px", border:"none", background:"none", textAlign:"left", fontSize:13, color:"#0F172A", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}><CheckCircle2 size={14}/> Mark Completed</button>
                        )}
                        {m.status==="upcoming" && (
                          <button disabled={busyAction} onClick={async()=>{ if(!window.confirm("Cancel this match?")) return; setBusyAction(true); try{ await updateMatchStatus(m.id,"cancelled"); onRefresh() } catch(e){alert(e.message)} setBusyAction(false); setOpenMenuId(null) }} style={{ width:"100%", padding:"10px 14px", border:"none", background:"none", textAlign:"left", fontSize:13, color:"#B8860B", cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}><XCircle size={14}/> Cancel Match</button>
                        )}
                        <button disabled={busyAction} onClick={async()=>{ if(!window.confirm("Delete this match permanently? This cannot be undone.")) return; setBusyAction(true); try{ await deleteMatch(m.id); onRefresh() } catch(e){alert(e.message)} setBusyAction(false); setOpenMenuId(null) }} style={{ width:"100%", padding:"10px 14px", border:"none", background:"none", textAlign:"left", fontSize:13, color:"#EF4444", cursor:"pointer", display:"flex", alignItems:"center", gap:8, borderTop:"1px solid #F1F5F9" }}><Trash2 size={14}/> Delete Match</button>
                      </div>
                    )}
                  </div>
                  {!isMobile&&<Tag col="gray">{m.type}</Tag>}
                  {m.link_active&&<Tag col="green"><LinkIcon size={11} style={{verticalAlign:"-1px"}}/></Tag>}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
      {showNew&&<NewMatchModal grounds={grounds} teams={teams} onClose={()=>setShowNew(false)} onCreated={()=>{setShowNew(false);onRefresh()}} isMobile={isMobile}/>}
    </div>
  )
}

// ─── Match Detail ─────────────────────────────────────────────────────────────
export function MatchDetail({ detail, players, teams = [], settings, onBack, onRefresh, onDeleted, onStatusChange, isMobile, loggedPlayer }) {
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

  // ── Scoring Subsystem State (FR-7 to FR-10) ───────────────────────────────────
  const [scoringConfig, setScoringConfig] = useState(null)
  const [scoringSquad, setScoringSquad]   = useState([])
  const [activeInnings, setActiveInnings] = useState([])
  const [matchScorers, setMatchScorers]   = useState([])
  const [showScoringSetup, setShowScoringSetup] = useState(false)
  const [activeScoringSession, setActiveScoringSession] = useState(null)
  const [showScorecard, setShowScorecard] = useState(false)
  const [loadingScoring, setLoadingScoring] = useState(false)
  const [showAssignScorerModal, setShowAssignScorerModal] = useState(false)
  const [selectedScorerId, setSelectedScorerId] = useState("")

  const loadScoringData = async () => {
    try {
      const [cfg, sq, inn, scs] = await Promise.all([
        fetchScoringConfig(m.id),
        fetchMatchSquad(m.id),
        fetchInnings(m.id),
        fetchMatchScorers(m.id),
      ])
      setScoringConfig(cfg)
      setScoringSquad(sq || [])
      setActiveInnings(inn || [])
      setMatchScorers(scs || [])
    } catch (err) {
      console.warn("Error loading match scoring info:", err)
    }
  }

  useEffect(() => {
    loadScoringData()
  }, [m.id])

  const isFounder = loggedPlayer?.role === "founder"
  const isOrganizer = loggedPlayer?.role === "organizer"
  const isProCreator = loggedPlayer?.role === "pro" && m.created_by === loggedPlayer?.id
  const isAssignedScorer = matchScorers.some(s => s.player_id === loggedPlayer?.id)
  const canScore = isFounder || isOrganizer || isProCreator || isAssignedScorer

  const handleOpenScoring = async () => {
    setLoadingScoring(true)
    try {
      const [cfg, sq, inn] = await Promise.all([
        fetchScoringConfig(m.id),
        fetchMatchSquad(m.id),
        fetchInnings(m.id),
      ])
      setScoringConfig(cfg)
      setScoringSquad(sq || [])
      setActiveInnings(inn || [])

      // If match scoring is not yet configured or squad has fewer than 2 players, launch setup
      if (!cfg || !sq || sq.length < 2) {
        setShowScoringSetup(true)
        setLoadingScoring(false)
        return
      }

      // If config exists, prepare live session
      const currentInn = (inn && inn.find(i => i.status === "in_progress")) || (inn && inn[inn.length - 1])
      if (!currentInn) {
        setShowScoringSetup(true)
        setLoadingScoring(false)
        return
      }

      const dels = await fetchDeliveries(currentInn.id)
      const state = reduceInningsState(cfg, sq, dels, currentInn)

      const allTeams = teams && teams.length > 0 ? teams : await fetchTeams()
      const teamA = allTeams.find(t => t.id === (cfg.toss_winner_team_id || m.team_a_id)) || { id: m.team_a_id || "team_a", name: m.team || "Team A" }
      const teamB = allTeams.find(t => t.id === (m.team_b_id || "team_b")) || { id: m.team_b_id || "team_b", name: "Team B" }

      const battingTeam = currentInn.batting_team_id === teamA.id ? teamA : teamB
      const bowlingTeam = currentInn.bowling_team_id === teamA.id ? teamA : teamB

      setActiveScoringSession({
        config: cfg,
        squad: sq,
        innings: currentInn,
        battingTeam,
        bowlingTeam,
        strikerId: state.strikerSquadId || sq.find(s => s.team_id === battingTeam.id)?.id,
        nonStrikerId: state.nonStrikerSquadId || sq.filter(s => s.team_id === battingTeam.id)[1]?.id,
        openingBowlerId: state.bowlerSquadId || sq.find(s => s.team_id === bowlingTeam.id)?.id,
      })
    } catch (err) {
      alert("Failed to load scoring session: " + err.message)
    } finally {
      setLoadingScoring(false)
    }
  }

  // Active scoring full screen view
  if (activeScoringSession) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "#0F172A", overflowY: "auto" }}>
        <ScoringConsole
          match={m}
          config={activeScoringSession.config}
          squad={activeScoringSession.squad}
          initialInnings={activeScoringSession.innings}
          battingTeam={activeScoringSession.battingTeam}
          bowlingTeam={activeScoringSession.bowlingTeam}
          initialStrikerId={activeScoringSession.strikerId}
          initialNonStrikerId={activeScoringSession.nonStrikerId}
          initialBowlerId={activeScoringSession.openingBowlerId}
          currentUser={loggedPlayer}
          onClose={() => {
            setActiveScoringSession(null)
            loadScoringData()
            onRefresh()
          }}
          onViewScorecard={() => setShowScorecard(true)}
        />
        {showScorecard && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#F8FAF8", width: "100%", maxWidth: 720, maxHeight: "96vh", overflowY: "auto", borderRadius: isMobile ? 0 : 16 }}>
              <LiveScorecard matchId={m.id} match={m} onClose={() => setShowScorecard(false)} />
            </div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div style={{ paddingBottom: isMobile ? 40 : 28 }}>
      <button onClick={onBack} style={{ background:"none",border:"none",color:"#166534",fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:14,padding:0,fontFamily:"var(--font-body)" }}>← All Matches</button>
      <Card style={{ overflow:"hidden", marginBottom: 20 }}>
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
                  <span style={{ background:m.status==="in_progress"?"#DC2626":m.status==="upcoming"?"#166534":m.status==="completed"?"#64748B":"#EF4444", color:"#FFFFFF", borderRadius:999, padding:"4px 12px", fontSize:11, fontWeight:700, textTransform:"capitalize", display:"inline-block" }}>{m.status==="in_progress"?"🔴 In Progress":m.status}</span>
                  <button onClick={handleToggleLink} disabled={toggling} style={{ background:linkActive?"rgba(34,197,94,0.12)":"rgba(148,163,184,0.15)", border:linkActive?"1px solid rgba(34,197,94,0.35)":"1px solid #E2E8F0", color:linkActive?"#166534":"#64748B", borderRadius:999, padding:"4px 11px", fontSize:11, fontWeight:700, cursor:toggling?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", gap:5 }}>
                    <LinkIcon size={11}/> Public link {toggling ? "..." : linkActive ? "ON — tap to turn off" : "OFF — tap to turn on"}
                  </button>
                </div>
                {/* Cricket Live Scoring Quick Actions */}
                <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap",alignItems:"center" }}>
                  {canScore && (
                    <button
                      onClick={handleOpenScoring}
                      disabled={loadingScoring}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 6px rgba(22, 101, 52, 0.25)"
                      }}
                    >
                      🏏 {loadingScoring ? "Loading..." : m.status === "in_progress" ? "Resume Scoring" : "Start Live Scoring"}
                    </button>
                  )}
                  <button
                    onClick={() => setTab("scorecard")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      background: tab === "scorecard" ? "#166534" : "#FFFFFF",
                      border: "1.5px solid #166534",
                      color: tab === "scorecard" ? "#FFFFFF" : "#166534",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5
                    }}
                  >
                    📊 Scorecard
                  </button>
                  {scoringConfig?.public_share_token && (
                    <button
                      onClick={() => {
                        const url = `${BASE_URL}/live-score/${scoringConfig.public_share_token}`
                        if (navigator.share) {
                          navigator.share({ title: `${matchTitle(m)} Live Score`, url })
                        } else {
                          navigator.clipboard.writeText(url)
                          alert("Public Live Scorecard link copied!\n" + url)
                        }
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "#F0FDF4",
                        border: "1px solid #86EFAC",
                        color: "#166534",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5
                      }}
                    >
                      🔗 Share Live Link
                    </button>
                  )}
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
                <div style={{ padding:"12px 14px", background:"rgba(245,158,11,0.08)", border:"1.5px solid rgba(245,158,11,0.3)", borderRadius:10, marginBottom:14 }}>
                  <div style={{ color:"#B8860B", fontSize:12, fontWeight:800, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}><AlertTriangle size={14}/> Public link — anyone can join</div>
                  <div style={{ color:"#7A4F13", fontSize:11, marginBottom:10, lineHeight:1.5 }}>This link isn't tied to one person — if it gets forwarded, anyone who clicks it can register and confirm themselves into the squad, even players you never invited. For a controlled squad, use <strong>Invite Players</strong> below instead.</div>
                  <button onClick={async()=>{
                    const msg = waPublicLink(m, BASE_URL)
                    if (!linkActive) { await toggleMatchLink(m.id, true); setLinkActive(true) }
                    if (navigator.share) { try { await navigator.share({ title:"Match Invite", text:msg }) } catch {} }
                    else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                  }} style={{ width:"100%",padding:"11px",borderRadius:9,background:"#B8860B",border:"none",color:"#FFFFFF",fontSize:13,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📤 Share Public Invite Link Anyway</button>
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {/* Group 1: Invite & notify */}
                <div>
                  <div style={{ fontSize:10,color:"#94A3B8",fontWeight:700,letterSpacing:"0.5px",marginBottom:6,textTransform:"uppercase" }}>Invite & Notify</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    <button onClick={()=>setShowNotify(true)} style={{ padding:"9px 14px",borderRadius:9,background:"rgba(15,110,86,0.15)",border:"1px solid rgba(15,110,86,0.35)",color:"#0F6E56",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>🔒 Invite Players</button>
                    <button onClick={async()=>{
                      const msg = waInviteWithLink(m, BASE_URL)
                      if (navigator.share) { try { await navigator.share({ title:"Match Invite", text:msg }) } catch {} }
                      else { window.open("https://wa.me/?text="+encodeURIComponent(msg), "_blank") }
                    }} title="Includes a forwardable link — recipients can pass it on to others" style={{ padding:"9px 14px",borderRadius:9,background:"rgba(37,211,102,0.2)",border:"1px solid rgba(74,222,128,0.4)",color:"#166534",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📤 Share Invite ⚠️</button>
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
          {[["players","👥 Players"],["scorecard","📊 Scorecard"],["expenses","💰 Expenses"]].map(([k,v])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:isMobile?"11px 12px":"13px 16px",border:"none",borderBottom:tab===k?"3px solid #166534":"3px solid transparent",background:"transparent",color:tab===k?"#0F172A":"#9ca3af",fontSize:isMobile?12:13,fontWeight:tab===k?800:400,cursor:"pointer",marginBottom:"-2px",whiteSpace:"nowrap",fontFamily:"var(--font-body)" }}>{v}</button>
          ))}
        </div>
        <div style={{ padding:isMobile?"14px":"22px" }}>
          {tab==="scorecard" && (
            <div>
              <LiveScorecard matchId={m.id} match={m} isMobile={isMobile} />
            </div>
          )}
          {tab==="players"&&(
            <div>
              {/* Match Scorer Assignment (FR-7.2) */}
              {(isFounder || isOrganizer) && (
                <div style={{ padding: "12px 14px", background: "#F8FAF8", borderRadius: 12, border: "1.5px solid #E2E8F0", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      🏏 Assigned Scorer:
                    </span>
                    {matchScorers.length > 0 ? (
                      matchScorers.map(s => {
                        const p = players.find(pl => pl.id === s.player_id)
                        return (
                          <span key={s.id || s.player_id} style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#3730A3", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {p?.name || "Player"}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation()
                                await revokeMatchScorer(m.id, s.player_id)
                                const scs = await fetchMatchScorers(m.id)
                                setMatchScorers(scs)
                              }}
                              title="Revoke scorer access"
                              style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 0, fontWeight: 800, fontSize: 13 }}
                            >
                              ×
                            </button>
                          </span>
                        )
                      })
                    ) : (
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>No scorer assigned (Organizers can score)</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAssignScorerModal(true)}
                    style={{ padding: "6px 12px", borderRadius: 8, background: "#FFFFFF", border: "1.5px solid #166534", color: "#166534", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    + Assign Scorer
                  </button>
                </div>
              )}
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap" }}>
                <span style={{ fontWeight:800,fontSize:14,color:"#0F172A",fontFamily:"var(--font-head)", display:"inline-flex", alignItems:"center", gap:7 }}><Lock size={15}/> Private Invites</span>
                <Tag col="blue">{matchPlayers.length} invited</Tag>
                {m.status==="upcoming"&&<button onClick={()=>setShowNotify(true)} style={{ marginLeft:"auto",padding:"5px 12px",borderRadius:8,background:"#f0fdf4",border:"1px solid #6ee7b7",color:"065f46",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>+ Manage</button>}
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
                    {list.map(mp=>{ const p=mp.players; if(!p) return null; return <div key={mp.id} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}><Av name={p.name} id={p.id} sz={30}/><span style={{ fontSize:12,color:"#374151" }}>{p.name}</span></div> })}
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

      {/* Scoring Setup Modal (FR-7.3 to FR-7.12) */}
      {showScoringSetup && (
        <ScoringSetupModal
          match={m}
          teams={teams || []}
          players={players || []}
          currentUser={loggedPlayer}
          onClose={() => setShowScoringSetup(false)}
          onStartScoring={(session) => {
            setShowScoringSetup(false)
            setActiveScoringSession(session)
            loadScoringData()
            onRefresh()
          }}
        />
      )}

      {/* Assign Scorer Modal (FR-7.2) */}
      {showAssignScorerModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowAssignScorerModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", borderRadius: 16, padding: 22, width: "100%", maxWidth: 400, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>Assign Match Scorer (FR-7.2)</h3>
              <button onClick={() => setShowAssignScorerModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9CA3AF" }}>×</button>
            </div>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 16px", lineHeight: 1.4 }}>Designate any registered player to score this match from their mobile phone.</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>SELECT PLAYER</label>
              <select
                value={selectedScorerId}
                onChange={e => setSelectedScorerId(e.target.value)}
                style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 14, outline: "none", background: "#F8FAF8" }}
              >
                <option value="">-- Select a player --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone ? p.phone.slice(-4) : "no phone"})</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAssignScorerModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#FFFFFF", color: "#475569", fontSize: 13, cursor: "pointer", fontWeight: 700 }}>Cancel</button>
              <button
                onClick={async () => {
                  if (!selectedScorerId) return
                  try {
                    await assignMatchScorer(m.id, selectedScorerId, loggedPlayer?.id)
                    const scs = await fetchMatchScorers(m.id)
                    setMatchScorers(scs)
                    setShowAssignScorerModal(false)
                    setSelectedScorerId("")
                    alert("Scorer assigned successfully! ✅")
                  } catch (err) {
                    alert("Failed to assign scorer: " + err.message)
                  }
                }}
                disabled={!selectedScorerId}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#166534", color: "#FFFFFF", fontSize: 13, cursor: selectedScorerId ? "pointer" : "not-allowed", fontWeight: 800, opacity: selectedScorerId ? 1 : 0.6 }}
              >
                Confirm Scorer
              </button>
            </div>
          </div>
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
        <div style={{ marginTop:10, fontSize:10, color:"#B8860B", display:"flex", alignItems:"center", gap:4 }}><AlertTriangle size={11}/> These buttons below still include a forwardable link — prefer inviting selected players above for a controlled squad.</div>
        <div style={{ marginTop:6, display:"flex", gap:8 }}>
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

function TeamsPage({ teams, matches, onRefresh, isMobile }) {
  const [showAdd,setShowAdd]=useState(false)
  const [editT,setEditT]=useState(null)
  const [delT,setDelT]=useState(null)
  const [selectedId,setSelectedId]=useState(null)
  const [busy,setBusy]=useState(false)
  const [addName,setAddName]=useState("")
  const [editName,setEditName]=useState("")
  const [search,setSearch]=useState("")
  const [sortBy,setSortBy]=useState("name")
  const [sortOpen,setSortOpen]=useState(false)
  const [openMenuId,setOpenMenuId]=useState(null)
  const [lbRaw,setLbRaw]=useState([])
  useEffect(()=>{ fetchLeaderboard().then(setLbRaw).catch(()=>{}) },[])
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

  // Real per-team stats derived from actual match history — teams have no
  // persistent roster in the schema, so "players on a team" means unique
  // players who've actually been confirmed into a match under that name.
  const matchCountByTeam = {}
  const playersByTeam = {}
  matches.forEach(m => {
    ;[m.team, m.our_team].filter(Boolean).forEach(name => {
      matchCountByTeam[name] = (matchCountByTeam[name]||0) + 1
    })
  })
  lbRaw.forEach(r => {
    const names = [r.matches?.team, r.matches?.our_team].filter(Boolean)
    names.forEach(name => {
      if (!playersByTeam[name]) playersByTeam[name] = new Set()
      if (r.player_id) playersByTeam[name].add(r.player_id)
    })
  })

  const totalPlayers = new Set(lbRaw.map(r=>r.player_id).filter(Boolean)).size
  const mostActive = Object.entries(matchCountByTeam).sort((a,b)=>b[1]-a[1])[0]

  const q = search.trim().toLowerCase()
  const filtered = teams.filter(t => !q || t.name.toLowerCase().includes(q))
  const sortedTeams = [...filtered].sort((a,b) => {
    if (sortBy==="matches") return (matchCountByTeam[b.name]||0) - (matchCountByTeam[a.name]||0)
    if (sortBy==="players") return (playersByTeam[b.name]?.size||0) - (playersByTeam[a.name]?.size||0)
    return (a.name||"").localeCompare(b.name||"")
  })

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:12}}>
        <div>
          <h2 style={{color:"#0F172A",fontSize:isMobile?20:26,fontWeight:900,margin:0,fontFamily:"var(--font-head)"}}>Teams</h2>
          <div style={{fontSize:13,color:"#64748B",marginTop:4}}>Manage all teams on Selected Sports</div>
        </div>
        <button onClick={()=>{setAddName("");setShowAdd(true)}} style={{padding:"10px 16px",borderRadius:12,background:"#166534",border:"none",color:"#FFFFFF",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:6,flexShrink:0,whiteSpace:"nowrap"}}><Plus size={15}/> Create Team</button>
      </div>

      {/* Search + Sort */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,position:"relative"}}>
          <SearchIcon size={16} color="#94A3B8" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by team name..." style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:12,border:"1.5px solid #E2E8F0",fontSize:13,outline:"none",background:"#FFFFFF",boxSizing:"border-box",fontFamily:"var(--font-body)"}}/>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setSortOpen(o=>!o)} style={{padding:"12px 16px",borderRadius:12,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}><ArrowUpDown size={14}/> Sort</button>
          {sortOpen && (
            <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:150,overflow:"hidden"}}>
              {[["name","Name (A-Z)"],["matches","Most Matches"],["players","Most Players"]].map(([k,label])=>(
                <button key={k} onClick={()=>{setSortBy(k);setSortOpen(false)}} style={{width:"100%",padding:"10px 14px",border:"none",background:sortBy===k?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",fontWeight:sortBy===k?700:500}}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{display:"flex",background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:16,marginBottom:20,overflow:"hidden"}}>
        {[
          {icon:UsersRound, v:teams.length, label:"Total Teams"},
          {icon:Calendar, v:Object.values(matchCountByTeam).reduce((a,b)=>a+b,0), label:"Team Match Appearances"},
          {icon:Users, v:totalPlayers, label:"Total Players"},
        ].map((c,i)=>(
          <div key={i} style={{flex:1, padding:"18px 16px", display:"flex", alignItems:"center", gap:12, borderRight:i<2?"1px solid #F1F5F9":"none"}}>
            <c.icon size={20} color="#166534"/>
            <div>
              <div style={{fontSize:isMobile?18:22,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1}}>{c.v}</div>
              <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {sortedTeams.length===0 ? (
        <Card style={{padding:"40px 24px",textAlign:"center"}}>
          <div style={{color:"#6b7280",fontSize:13}}>No teams match your search.</div>
        </Card>
      ) : (
        <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #E2E8F0"}}>
          {!isMobile && (
            <div style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#F8FAF8",borderBottom:"1px solid #E2E8F0",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.4}}>
              <div style={{flex:1}}>Team</div>
              <div style={{width:90,textAlign:"center"}}>Players</div>
              <div style={{width:90,textAlign:"center"}}>Matches</div>
              <div style={{width:36}}/>
            </div>
          )}
          {sortedTeams.map((t,i) => (
            <div key={t.id} onClick={()=>setSelectedId(id=>id===t.id?null:t.id)} style={{display:"flex",alignItems:"center",padding:"14px 16px",background:selectedId===t.id?"rgba(34,197,94,0.05)":"#FFFFFF",borderTop:i===0?"none":"1px solid #F1F5F9",cursor:"pointer",flexWrap:isMobile?"wrap":"nowrap",gap:isMobile?10:0}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                <TeamAv name={t.name} logo={t.logo_url} size={40}/>
                <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>{t.name}</div>
              </div>
              <div style={{width:isMobile?"auto":90,textAlign:"center",fontSize:14,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>{playersByTeam[t.name]?.size||0}{isMobile && <span style={{fontSize:10,color:"#94A3B8",fontWeight:500}}> players</span>}</div>
              <div style={{width:isMobile?"auto":90,textAlign:"center",fontSize:14,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>{matchCountByTeam[t.name]||0}{isMobile && <span style={{fontSize:10,color:"#94A3B8",fontWeight:500}}> matches</span>}</div>
              <div style={{width:36,display:"flex",justifyContent:"flex-end",position:"relative"}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setOpenMenuId(id=>id===t.id?null:t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}><MoreVertical size={16} color="#94A3B8"/></button>
                {openMenuId===t.id && (
                  <div style={{position:"absolute",top:"100%",right:0,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:140,overflow:"hidden"}}>
                    <button onClick={()=>{setEditT(t);setEditName(t.name);setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer"}}>Edit Name</button>
                    <button onClick={()=>{setDelT(t);setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#EF4444",cursor:"pointer",borderTop:"1px solid #F1F5F9"}}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostActive && (
        <Card style={{marginTop:20, padding:"16px 18px"}}>
          <div style={{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:10,fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:8}}><BarChart3 size={16} color="#166534"/> Team Insights</div>
          <div style={{fontSize:12,color:"#64748B"}}>Most Active Team</div>
          <div style={{fontSize:15,fontWeight:800,color:"#166534",fontFamily:"var(--font-head)"}}>{mostActive[0]}</div>
          <div style={{fontSize:11,color:"#94A3B8"}}>{mostActive[1]} match appearance{mostActive[1]!==1?"s":""}</div>
        </Card>
      )}

      {selectedTeam && (
        <div style={{marginTop:16}}>
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

function EditAuctionDateTimeModal({ auction, onClose, onUpdated, isMobile }) {
  const [date, setDate] = useState(auction.auction_date || "")
  const [hour, setHour] = useState("7")
  const [minute, setMinute] = useState("00")
  const [period, setPeriod] = useState("AM")
  const [location, setLocation] = useState(auction.location || "")
  const [bidIncrement, setBidIncrement] = useState(auction.bid_increment ? String(auction.bid_increment) : "1000")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (auction.auction_time) {
      const match = auction.auction_time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
      if (match) {
        setHour(match[1])
        setMinute(match[2])
        if (match[3]) setPeriod(match[3].toUpperCase())
      }
    }
    if (auction.bid_increment) {
      setBidIncrement(String(auction.bid_increment))
    }
  }, [auction])

  const handleSave = async () => {
    if (!date) {
      setError("Please select a date for the auction.")
      return
    }
    const timeStr = `${hour}:${minute} ${period}`
    setBusy(true)
    setError("")
    try {
      const updated = await updateAuction(auction.id, {
        auctionDate: date,
        auctionTime: timeStr,
        location: location.trim() || null,
        bidIncrement: Number(bidIncrement) || 1000
      })
      if (onUpdated) onUpdated(updated)
      onClose()
    } catch (e) {
      setError(e.message || "Failed to update auction date & time")
    } finally {
      setBusy(false)
    }
  }

  const iS = { width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", background:"#F8FAF8", color:"#0F172A", boxSizing:"border-box", fontFamily:"var(--font-body)" }
  const lS = { fontSize:12, color:"#64748B", display:"block", marginBottom:6, fontWeight:600 }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:isMobile?"flex-end":"center", justifyContent:"center", zIndex:350 }}>
      <div style={{ background:"#FFFFFF", borderRadius:isMobile?"20px 20px 0 0":18, padding:isMobile?"22px 18px":26, width:"100%", maxWidth:isMobile?"100%":440, maxHeight:isMobile?"92vh":"auto", overflowY:"auto", boxSizing:"border-box", boxShadow:"0 20px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div>
            <h3 style={{ margin:0, fontSize:16, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)" }}>Edit Auction Date & Time</h3>
            <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{auction.name}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#94A3B8" }}>×</button>
        </div>

        {error && (
          <div style={{ padding:"10px 12px", background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:9, fontSize:12, color:"#DC2626", fontWeight:600, marginBottom:14 }}>
            {error}
          </div>
        )}

        <div style={{ display:"grid", gap:14 }}>
          <div>
            <label style={lS}>Auction Date *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={iS}
            />
          </div>

          <div>
            <label style={lS}>Auction Time *</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <select value={hour} onChange={e => setHour(e.target.value)} style={iS}>
                {["1","2","3","4","5","6","7","8","9","10","11","12"].map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <select value={minute} onChange={e => setMinute(e.target.value)} style={iS}>
                {["00","15","30","45"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={period} onChange={e => setPeriod(e.target.value)} style={iS}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            <div style={{ fontSize:11, color:"#166534", marginTop:4, fontWeight:600 }}>
              ⏰ Scheduled for {hour}:{minute} {period}
            </div>
          </div>

          <div>
            <label style={lS}>Location / Ground Venue (Optional)</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Shinde High School Ground, Pune"
              style={iS}
            />
          </div>

          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <label style={lS}>Bid Increment (🪙 Coins)</label>
              <span style={{ fontSize:11, color:"#166534", fontWeight:800 }}>Default: 🪙 1,000</span>
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {[1000, 2000, 5000, 10000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBidIncrement(String(val))}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: 8,
                    border: bidIncrement === String(val) ? "2px solid #166534" : "1.5px solid #E2E8F0",
                    background: bidIncrement === String(val) ? "#DCFCE7" : "#FFFFFF",
                    color: bidIncrement === String(val) ? "#166534" : "#64748B",
                    fontSize: 12,
                    fontWeight: bidIncrement === String(val) ? 800 : 600,
                    cursor: "pointer"
                  }}
                >
                  🪙 {val >= 1000 ? `${val/1000}k` : val}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                onClick={() => setBidIncrement(prev => String(stepBidPointsDown(prev, 1000)))}
                style={{ width: 42, height: 42, borderRadius: 9, border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", fontSize: 20, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                title="Decrease bid points increment"
              >
                −
              </button>
              <input
                type="number"
                min="1000"
                value={bidIncrement}
                onChange={e => setBidIncrement(e.target.value)}
                placeholder="1000"
                style={{ ...iS, textAlign: "center", fontWeight: 800 }}
              />
              <button
                type="button"
                onClick={() => setBidIncrement(prev => String(stepBidPointsUp(prev, 1000)))}
                style={{ width: 42, height: 42, borderRadius: 9, border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", fontSize: 20, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                title="Increase bid points increment"
              >
                +
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 4 }}>
              Increments: <strong>🪙 1,000</strong> (&lt;20k) · <strong>🪙 2,000</strong> (20k-60k) · <strong>🪙 3,000</strong> (&ge;60k)
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{ flex:1, padding:"11px 16px", borderRadius:9, border:"1px solid #E2E8F0", background:"#FFFFFF", color:"#475569", fontSize:13, fontWeight:700, cursor:"pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              style={{ flex:1.5, padding:"11px 16px", borderRadius:9, border:"none", background:"#166534", color:"#FFFFFF", fontSize:13, fontWeight:800, cursor:busy?"not-allowed":"pointer" }}
            >
              {busy ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuctionPage({ isMobile, isFounder }) {
  const [subTab, setSubTab] = useState("today")
  const [managingAuction, setManagingAuction] = useState(null)
  const [editingAuctionDateTime, setEditingAuctionDateTime] = useState(null)
  const [auctionPlayers, setAuctionPlayers] = useState([])
  const [auctionTeams, setAuctionTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [priceDrafts, setPriceDrafts] = useState({})
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [editTeam, setEditTeam] = useState(null)
  const [teamLogoFile, setTeamLogoFile] = useState(null)
  const [teamLogoPreview, setTeamLogoPreview] = useState("")
  const [delTeam, setDelTeam] = useState(null)
  const [teamName, setTeamName] = useState("")
  const [captainPhone, setCaptainPhone] = useState("")
  const [teamCaptain, setTeamCaptain] = useState("")
  const [captainPlayerId, setCaptainPlayerId] = useState(null)
  const [ownerSameAsCaptain, setOwnerSameAsCaptain] = useState(true)
  const [teamOwner, setTeamOwner] = useState("")
  const [ownerPhone, setOwnerPhone] = useState("")
  const [sameAsOwner, setSameAsOwner] = useState(false)
  const [teamPurse, setTeamPurse] = useState("")
  const [busy, setBusy] = useState(false)
  const [regOpen, setRegOpen] = useState(true)
  const [regBusy, setRegBusy] = useState(false)
  const [delAuction, setDelAuction] = useState(null)
  const [sponsors, setSponsors] = useState([])
  const [loadingSponsors, setLoadingSponsors] = useState(false)
  const [showAddSponsor, setShowAddSponsor] = useState(false)
  const [sponsorName, setSponsorName] = useState("")
  const [sponsorLogoFile, setSponsorLogoFile] = useState(null)
  const [sponsorLogoPreview, setSponsorLogoPreview] = useState("")
  const [sponsorBusy, setSponsorBusy] = useState(false)
  const [delSponsor, setDelSponsor] = useState(null)
  const [delAuctionBusy, setDelAuctionBusy] = useState(false)
  const [copiedLink, setCopiedLink] = useState("")
  const [pendingPayments, setPendingPayments] = useState([])
  const [showCreateAuction, setShowCreateAuction] = useState(false)
  const [viewingPlayer, setViewingPlayer] = useState(null)
  const [playerHistory, setPlayerHistory] = useState([])
  const [loadingPlayerHistory, setLoadingPlayerHistory] = useState(false)
  useEffect(() => {
    if (!viewingPlayer?.phone) { setPlayerHistory([]); return }
    setLoadingPlayerHistory(true)
    fetchPlayerAuctionHistory(viewingPlayer.phone).then(setPlayerHistory).catch(()=>{}).finally(()=>setLoadingPlayerHistory(false))
  }, [viewingPlayer?.phone])
  const [viewingTeam, setViewingTeam] = useState(null)
  const [allAuctions, setAllAuctions] = useState([])
  const [loadingAuctions, setLoadingAuctions] = useState(true)
  const [auctionSearch, setAuctionSearch] = useState("")
  const [auctionSort, setAuctionSort] = useState("date")
  const [auctionSortOpen, setAuctionSortOpen] = useState(false)
  const [poolSearch, setPoolSearch] = useState("")
  const [poolView, setPoolView] = useState("pool") // default to pool
  const [shuffleSeed, setShuffleSeed] = useState(1)
  const randomizedPool = useMemo(() => {
    const pool = auctionPlayers.filter(p => !p.is_captain && p.status !== "captain" && p.status !== "waitlist" && p.payment_status !== "waitlist" && p.status !== "dropped")
    const arr = [...pool]
    let s = (shuffleSeed * 9301 + 49297) % 233280
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr
  }, [auctionPlayers, shuffleSeed])
  const [showExportPoolModal, setShowExportPoolModal] = useState(false)
  const [copiedPoolWa, setCopiedPoolWa] = useState(false)
  const [exportPoolRoleFilter, setExportPoolRoleFilter] = useState("")
  const [exportPoolSearch, setExportPoolSearch] = useState("")
  const [allPlatformPlayers, setAllPlatformPlayers] = useState([])
  const [loadingPlatformPlayers, setLoadingPlatformPlayers] = useState(false)
  const [selectedPlatformIds, setSelectedPlatformIds] = useState(new Set())
  const [platformSearch, setPlatformSearch] = useState("")
  const [platformTypeFilter, setPlatformTypeFilter] = useState("")
  const [addingToPool, setAddingToPool] = useState(false)
  useEffect(() => {
    if (isFounder && managingAuction && poolView === "registered" && allPlatformPlayers.length === 0) {
      setLoadingPlatformPlayers(true)
      fetchPlayers().then(setAllPlatformPlayers).catch(()=>{}).finally(()=>setLoadingPlatformPlayers(false))
    }
  }, [managingAuction, poolView, isFounder])
  useEffect(() => { if (!isFounder) setPoolView("pool") }, [isFounder])
  const [teamSearch, setTeamSearch] = useState("")

  const [auctionTeamCounts, setAuctionTeamCounts] = useState({})
  const [auctionPlayerCounts, setAuctionPlayerCounts] = useState({})
  const loadAuctions = async () => {
    setLoadingAuctions(true)
    try {
      const [list, tCounts, pCounts] = await Promise.all([fetchAllAuctions(), fetchAllAuctionTeamCounts(), fetchAllAuctionPlayerCounts()])
      setAllAuctions(list); setAuctionTeamCounts(tCounts); setAuctionPlayerCounts(pCounts)
    } catch(e) { alert(e.message) }
    setLoadingAuctions(false)
  }
  useEffect(() => { loadAuctions() }, [])

  const loadPayments = async () => { try { setPendingPayments(await fetchPendingAuctionPayments()) } catch {} }
  useEffect(() => { if (isFounder) loadPayments() }, [isFounder])

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const auctionId = managingAuction?.id || null
      const [p, t, open] = await Promise.all([fetchAuctionPlayers(auctionId), fetchAuctionTeams(auctionId), fetchAuctionRegistrationOpen(auctionId)])
      setAuctionPlayers(p); setAuctionTeams(t); setRegOpen(open)
    } catch(e) { if (!silent) alert(e.message) }
    if (!silent) setLoading(false)
  }
  useEffect(() => { load() }, [managingAuction])
  useEffect(() => {
    if (!managingAuction || subTab !== "players") return
    const interval = setInterval(() => load(true), 8000)
    return () => clearInterval(interval)
  }, [managingAuction, subTab])

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

  const doDeleteAuction = async () => {
    setDelAuctionBusy(true)
    try {
      await deleteAuctionEvent(delAuction.id)
      setDelAuction(null)
      setManagingAuction(null)
      setSubTab("today")
      await loadAuctions()
    } catch(e) { alert(e.message) }
    setDelAuctionBusy(false)
  }

  const doAddPlayerToPool = async (player) => {
    setAddingToPool(true)
    try { await addRosterPlayerToAuction(managingAuction.id, player); await load() } catch(e) { alert(e.message) }
    setAddingToPool(false)
  }

  const doBulkAddToPool = async () => {
    setAddingToPool(true)
    try {
      for (const id of selectedPlatformIds) {
        const player = allPlatformPlayers.find(p => p.id === id)
        if (player) await addRosterPlayerToAuction(managingAuction.id, player)
      }
      setSelectedPlatformIds(new Set())
      await load()
    } catch(e) { alert(e.message) }
    setAddingToPool(false)
  }

  const loadSponsors = async (auctionId) => {
    setLoadingSponsors(true)
    try { setSponsors(await fetchAuctionSponsors(auctionId)) } catch(e) { alert(e.message) }
    setLoadingSponsors(false)
  }

  const doAddSponsor = async () => {
    if (!sponsorName.trim()) { alert("Sponsor name required"); return }
    setSponsorBusy(true)
    try {
      let logoUrl = null
      if (sponsorLogoFile) logoUrl = await uploadSponsorLogo(sponsorLogoFile, sponsorName.trim())
      await addAuctionSponsor(managingAuction.id, sponsorName.trim(), logoUrl)
      setShowAddSponsor(false); setSponsorName(""); setSponsorLogoFile(null); setSponsorLogoPreview("")
      await loadSponsors(managingAuction.id)
    } catch(e) { alert(e.message) }
    setSponsorBusy(false)
  }

  const doDeleteSponsor = async () => {
    setSponsorBusy(true)
    try { await deleteAuctionSponsor(delSponsor.id); setDelSponsor(null); await loadSponsors(managingAuction.id) } catch(e) { alert(e.message) }
    setSponsorBusy(false)
  }

  useEffect(() => { if (managingAuction && subTab === "sponsors") loadSponsors(managingAuction.id) }, [managingAuction, subTab])

  const copyLink = (text, key) => {
    navigator.clipboard?.writeText(text)
    setCopiedLink(key)
    setTimeout(() => setCopiedLink(""), 2000)
  }

  const [receiptModalImg, setReceiptModalImg] = useState(null)
  const [pendingPayAuction, setPendingPayAuction] = useState(null)

  const doApprovePayment = async (auctionId) => {
    try { await approveAuctionPayment(auctionId); await Promise.all([loadPayments(), loadAuctions()]) } catch(e) { alert(e.message) }
  }
  const doRejectPayment = async (auctionId) => {
    if (!window.confirm("Reject this payment claim?")) return
    try { await rejectAuctionPayment(auctionId); await Promise.all([loadPayments(), loadAuctions()]) } catch(e) { alert(e.message) }
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
    if (!window.confirm(`Permanently delete ${p.name} from the auction? This removes their registration and receipt records.`)) return
    try {
      await deleteAuctionPlayer(p.id)
      if (viewingPlayer?.id === p.id) setViewingPlayer(null)
      await load()
    } catch(e) { alert(e.message) }
  }

  const tagDropped = async (p) => {
    if (!window.confirm(`Mark ${p.name} as dropped / withdrawn from the auction? They will be removed from the auction pool and captains' export list, but their payment record will remain safely on file.`)) return
    try {
      await tagAuctionPlayerDropped(p.id)
      if (viewingPlayer?.id === p.id) setViewingPlayer(null)
      await load()
    } catch(e) { alert(e.message) }
  }

  const restorePlayer = async (p) => {
    if (!window.confirm(`Restore ${p.name} back to the active auction pool?`)) return
    try {
      await restoreAuctionPlayer(p.id)
      if (viewingPlayer?.id === p.id) setViewingPlayer(null)
      await load()
    } catch(e) { alert(e.message) }
  }

  const openAddTeam = () => {
    setEditTeam(null)
    setTeamLogoFile(null)
    setTeamLogoPreview("")
    setCaptainPhone("")
    setTeamCaptain("")
    setCaptainPlayerId(null)
    setTeamName("")
    setOwnerSameAsCaptain(true)
    setTeamOwner("")
    setOwnerPhone("")
    setTeamPurse(managingAuction?.points_purse ? String(managingAuction.points_purse) : "")
    setShowAddTeam(true)
  }
  const openEditTeam = (t) => {
    setEditTeam(t)
    setTeamLogoFile(null)
    setTeamLogoPreview(t.logo_url || "")
    const capPlayer = auctionPlayers.find(p => p.sold_team_id === t.id && (p.is_captain || p.status === "captain"))
    setCaptainPhone(t.captain_phone || capPlayer?.phone || "")
    setTeamCaptain(t.captain_name || capPlayer?.name || "")
    setCaptainPlayerId(capPlayer?.id || null)
    setTeamName(t.name)
    const isSame = !t.owner_name || t.owner_name === (t.captain_name || capPlayer?.name)
    setOwnerSameAsCaptain(isSame)
    setTeamOwner(t.owner_name || "")
    setOwnerPhone(t.owner_phone || "")
    setTeamPurse(String(t.purse_total))
    setShowAddTeam(true)
  }

  const handleCaptainPhoneChange = (val) => {
    const digits = val.replace(/[^0-9]/g, "").slice(0, 10)
    setCaptainPhone(digits)
    if (digits.length === 10) {
      // Look up in registered auction players
      const matched = auctionPlayers.find(p => (p.phone || "").replace(/[^0-9]/g, "").slice(-10) === digits)
      if (matched) {
        setTeamCaptain(matched.name)
        setCaptainPlayerId(matched.id)
      } else {
        // Look up in platform players roster
        const platMatched = allPlatformPlayers.find(p => (p.phone || "").replace(/[^0-9]/g, "").slice(-10) === digits)
        if (platMatched) {
          setTeamCaptain(platMatched.name)
        }
      }
    }
  }

  const saveTeam = async () => {
    if (!captainPhone.trim()) { alert("Captain mobile number required"); return }
    const cleanCapPhone = captainPhone.replace(/[^0-9]/g, "").slice(-10)
    if (cleanCapPhone.length !== 10) { alert("Please enter a valid 10-digit captain mobile number"); return }
    if (!teamCaptain.trim()) { alert("Captain name required"); return }
    if (!isValidName(teamCaptain)) { alert("Captain name can only contain letters."); return }
    if (!teamName.trim()) { alert("Team name required"); return }

    const finalOwnerName = ownerSameAsCaptain ? teamCaptain.trim() : teamOwner.trim()
    const finalOwnerPhone = ownerSameAsCaptain ? cleanCapPhone : ownerPhone.replace(/[^0-9]/g, "").slice(-10)

    if (!ownerSameAsCaptain) {
      if (finalOwnerName && !isValidName(finalOwnerName)) { alert("Owner name can only contain letters."); return }
    }

    const purse = Number(teamPurse)
    if (!teamPurse || isNaN(purse) || purse <= 0) { alert("Enter a valid starting purse"); return }

    setBusy(true)
    try {
      if (editTeam) {
        await updateAuctionTeam(editTeam.id, {
          name: teamName.trim(),
          ownerName: finalOwnerName,
          purseTotal: purse,
          captainName: teamCaptain.trim(),
          captainPhone: cleanCapPhone,
          ownerPhone: finalOwnerPhone,
          captainPlayerId,
          auctionId: managingAuction?.id || null,
          logoFile: teamLogoFile,
          logoUrl: teamLogoPreview
        })
      } else {
        await createAuctionTeam(
          teamName.trim(),
          finalOwnerName,
          purse,
          managingAuction?.id || null,
          teamCaptain.trim(),
          cleanCapPhone,
          finalOwnerPhone,
          captainPlayerId,
          teamLogoFile,
          teamLogoPreview
        )
      }
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

  const doPrintTeamLists = () => {
    const esc = s => String(s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
    const sections = auctionTeams.map(t => {
      const squad = auctionPlayers.filter(p => p.sold_team_id === t.id)
      const rows = squad.length === 0
        ? `<tr><td colspan="5" style="text-align:center;color:#94A3B8;padding:14px;">No players won yet.</td></tr>`
        : squad.map(p => `<tr><td>${esc(p.name)}</td><td>${esc(p.playing_role||"—")}</td><td>${esc(p.city||"—")}</td><td>${esc(p.phone||"—")}</td><td>₹${esc(p.sold_price||0)}</td></tr>`).join("")
      return `
        <div class="team-block">
          <div class="team-header">
            <div class="team-name">${esc(t.name)}</div>
            <div class="team-meta">Owner: ${esc(t.owner_name||"—")} &nbsp;·&nbsp; Captain: ${esc(t.captain_name||"—")}</div>
          </div>
          <table>
            <thead><tr><th>Player Name</th><th>Role</th><th>City</th><th>Mobile Number</th><th>Sold For</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`
    }).join("")
    const html = `<!DOCTYPE html><html><head><title>${esc(managingAuction?.name||"Auction")} — Team Rosters</title><style>
      body{font-family:Arial,sans-serif;color:#0F172A;padding:24px;}
      h1{font-size:20px;margin:0 0 4px;}
      .subtitle{color:#64748B;font-size:13px;margin-bottom:24px;}
      .team-block{margin-bottom:28px;page-break-inside:avoid;}
      .team-header{background:#F0FDF4;border:1.5px solid #166534;border-radius:8px;padding:10px 14px;margin-bottom:8px;}
      .team-name{font-size:16px;font-weight:800;}
      .team-meta{font-size:12px;color:#374151;margin-top:2px;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th{background:#F8FAF8;text-align:left;padding:8px 10px;border:1px solid #E2E8F0;font-size:11px;text-transform:uppercase;color:#64748B;}
      td{padding:7px 10px;border:1px solid #E2E8F0;}
      @media print{ body{padding:10px;} }
    </style></head><body>
      <h1>${esc(managingAuction?.name||"Auction")} — Team Rosters</h1>
      <div class="subtitle">Generated ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div>
      ${sections}
    </body></html>`
    const w = window.open("", "_blank")
    if (!w) { alert("Please allow pop-ups to print the team lists."); return }
    w.document.write(html)
    w.document.close()
    w.onload = () => w.print()
  }

  if (loading) return <Spinner/>

  const todayStr0 = new Date().toISOString().split("T")[0]
  const activeCount = allAuctions.filter(a => a.status === "live").length
  const upcomingCount0 = allAuctions.filter(a => a.status !== "completed" && a.auction_date && a.auction_date > todayStr0).length
  const completedCount = allAuctions.filter(a => a.status === "completed").length
  const collectedTotal = allAuctions.filter(a => a.payment_status === "paid").reduce((s,a) => s + (Number(a.amount_due)||0), 0)

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom:18, gap:12, flexWrap:"wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {managingAuction && (
            <button onClick={()=>{ setManagingAuction(null); setSubTab("today") }} style={{ background:"none", border:"none", color:"#166534", fontSize:12, fontWeight:700, cursor:"pointer", padding:0, marginBottom:6, display:"flex", alignItems:"center", gap:4 }}>← All Auctions</button>
          )}
          <h2 style={{ color:"#0F172A", fontSize:isMobile?19:26, fontWeight:900, margin:0, fontFamily:"var(--font-head)", overflow: "hidden", textOverflow: "ellipsis", wordBreak: "break-word" }}>{managingAuction ? managingAuction.name : "Auction"}</h2>
          {!managingAuction && <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>Create and manage cricket player auctions</div>}
        </div>
        {!managingAuction && !isMobile && (
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(184,134,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Gavel size={22} color="#B8860B"/></div>
        )}
        {managingAuction ? (
          <button onClick={()=>setDelAuction(managingAuction)} style={{ padding: isMobile ? "8px 12px" : "10px 16px", borderRadius:12, border:"1.5px solid #EF4444", background:"#FFFFFF", color:"#EF4444", fontSize: isMobile ? 12 : 13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:5, flexShrink:0, whiteSpace:"nowrap" }}><Trash2 size={14}/> Delete Auction</button>
        ) : (
          <button onClick={()=>setShowCreateAuction(true)} style={{ padding:"10px 16px", borderRadius:12, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:6, flexShrink:0, whiteSpace:"nowrap" }}><Plus size={15}/> New Auction</button>
        )}
      </div>

      {subTab === "sponsors" && managingAuction && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:13, color:"#64748B" }}>{sponsors.length} sponsor{sponsors.length!==1?"s":""} added</div>
            <button onClick={()=>{setSponsorName("");setSponsorLogoFile(null);setSponsorLogoPreview("");setShowAddSponsor(true)}} style={{ padding:"9px 14px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Plus size={14}/> Add Sponsor</button>
          </div>
          {loadingSponsors ? <Spinner/> : sponsors.length === 0 ? (
            <Card style={{ padding:"36px 20px", textAlign:"center" }}>
              <div style={{ fontSize:14, color:"#64748B" }}>Currently, no sponsors have been added.</div>
              <div style={{ fontSize:12, color:"#94A3B8", marginTop:6 }}>Add a sponsor to have their logo shown on this auction's public page.</div>
            </Card>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)", gap:12 }}>
              {sponsors.map(s => (
                <Card key={s.id} style={{ padding:"16px", textAlign:"center", position:"relative" }}>
                  <button onClick={()=>setDelSponsor(s)} style={{ position:"absolute", top:8, right:8, background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:4 }}><Trash2 size={14}/></button>
                  {s.logo_url ? (
                    <div style={{ width:"100%", height:100, borderRadius:10, background:"#FFFFFF", border:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", padding:6, margin:"0 auto 10px" }}>
                      <img src={s.logo_url} alt={s.name} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/>
                    </div>
                  ) : (
                    <div style={{ width:"100%", height:100, borderRadius:10, background:"rgba(184,134,11,0.1)", border:"1px solid rgba(184,134,11,0.2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", gap:4 }}>
                      <Star size={28} color="#B8860B"/>
                      <span style={{ fontSize:10, color:"#B8860B", fontWeight:700 }}>Sponsor</span>
                    </div>
                  )}
                  <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{s.name}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddSponsor && (
        <div style={mStyle} onClick={()=>setShowAddSponsor(false)}>
          <div style={mBox} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Add Sponsor</h3>
              <button onClick={()=>setShowAddSponsor(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
            </div>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ width:200, height:110, borderRadius:12, background:"#FFFFFF", border: sponsorLogoPreview ? "2px solid #166534" : "2px dashed #CBD5E1", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", margin:"0 auto 8px", padding:4 }}>
                {sponsorLogoPreview ? <img src={sponsorLogoPreview} alt="Logo" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/> : <div style={{ fontSize:12, color:"#94A3B8" }}>Logo / Banner Preview</div>}
              </div>
              <label style={{ cursor:"pointer" }}>
                <span style={{ fontSize:12, color:"#166534", fontWeight:700 }}>{sponsorLogoPreview ? "Change Photo / Banner" : "Upload Photo / Banner"}</span>
                <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{
                  const file = e.target.files?.[0]; if (!file) return
                  setSponsorLogoFile(file)
                  const reader = new FileReader(); reader.onload = () => setSponsorLogoPreview(reader.result); reader.readAsDataURL(file)
                }}/>
              </label>
              <div style={{ fontSize:11, color:"#64748B", marginTop:6 }}>Recommended: Upload large high-resolution logo or banner (600×350px or larger). Displayed large on live broadcast and big screens.</div>
            </div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Sponsor Name *</div>
            <input value={sponsorName} onChange={e=>setSponsorName(e.target.value)} placeholder="e.g. Acme Sports Gear" style={{ ...iS, marginBottom:16 }}/>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowAddSponsor(false)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={doAddSponsor} disabled={sponsorBusy} style={{ flex:2, padding:"12px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>{sponsorBusy?"Adding...":"Add Sponsor"}</button>
            </div>
          </div>
        </div>
      )}

      {delSponsor && (
        <div style={mStyle} onClick={()=>setDelSponsor(null)}>
          <div style={{...mBox, maxWidth:360}} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center", padding:"10px 0 18px" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
              <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Remove Sponsor?</h3>
              <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>Remove <strong>{delSponsor.name}</strong> from this auction?</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDelSponsor(null)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={doDeleteSponsor} disabled={sponsorBusy} style={{ flex:1, padding:"12px", borderRadius:9, background:"#EF4444", border:"none", color:"#FFFFFF", fontSize:14, cursor:"pointer", fontWeight:800 }}>{sponsorBusy?"...":"Remove"}</button>
            </div>
          </div>
        </div>
      )}

      {subTab === "links" && managingAuction && managingAuction.auction_code && (() => {
        const base = window.location.origin
        const regLink = `${base}/auction-register/${managingAuction.auction_code}`
        const liveLink = `${base}/live-auction/${managingAuction.auction_code}`
        return (
          <Card style={{ padding:"14px 16px", marginBottom:16 }}>
            <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:10, textTransform:"uppercase" }}>Shareable Links</div>
            {[["Registration Link", regLink, "reg"], ["Live Auction Link", liveLink, "live"]].map(([label, link, key]) => (
              <div key={key} style={{ marginBottom:key==="reg"?10:0 }}>
                <div style={{ fontSize:11, color:"#64748B", marginBottom:4, fontWeight:600 }}>{label}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <div style={{ flex:1, padding:"9px 11px", background:"#F8FAF8", border:"1px solid #E2E8F0", borderRadius:8, fontSize:12, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{link}</div>
                  <button onClick={()=>copyLink(link, key)} style={{ padding:"9px 14px", borderRadius:8, border:"1px solid #166534", background: copiedLink===key ? "#166534" : "#FFFFFF", color: copiedLink===key ? "#FFFFFF" : "#166534", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }}>{copiedLink===key ? "Copied!" : "Copy"}</button>
                </div>
              </div>
            ))}
            <div style={{ fontSize:11, color:"#94A3B8", marginTop:12, marginBottom:16 }}>Note: the "Team Points Screen" and "YouTube overlay" links some auction apps offer aren't separate pages in Selected Sports — your Live Auction Link above already shows real-time team purses to anyone who opens it.</div>

            {/* Ready-to-Share WhatsApp Player Registration Invite Card */}
            <div style={{ padding:"16px", background:"#F0FDF4", borderRadius:12, border:"1.5px solid #BBF7D0" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6, flexWrap:"wrap", gap:6 }}>
                <div style={{ fontSize:13, fontWeight:900, color:"#166534", display:"flex", alignItems:"center", gap:6, fontFamily:"var(--font-head)" }}>
                  <span>📲</span> Ready-to-Share Player Registration Invite (WhatsApp / SMS)
                </div>
                <span style={{ fontSize:10, fontWeight:800, background:"#DCFCE7", color:"#166534", padding:"2px 8px", borderRadius:999 }}>Official Template</span>
              </div>
              <p style={{ fontSize:12, color:"#475569", margin:"0 0 10px", lineHeight:1.4 }}>
                Copy and share this formatted text directly to WhatsApp groups and players. It contains all tournament details and the registration link!
              </p>
              <div style={{ background:"#FFFFFF", border:"1px solid #CBD5E1", borderRadius:8, padding:"12px", fontSize:11.5, fontFamily:"monospace", whiteSpace:"pre-wrap", color:"#0F172A", maxHeight:160, overflowY:"auto", marginBottom:12, lineHeight:1.5 }}>
                {generateAuctionPlayerInvite(managingAuction, base)}
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button
                  type="button"
                  onClick={() => copyLink(generateAuctionPlayerInvite(managingAuction, base), "invite")}
                  style={{
                    flex: 1,
                    minWidth: 150,
                    padding: "11px 14px",
                    borderRadius: 8,
                    background: copiedLink==="invite" ? "#14532D" : "#166534",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  {copiedLink==="invite" ? "✅ Invite Copied to Clipboard!" : "📋 Copy Full Invite Text"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(generateAuctionPlayerInvite(managingAuction, base))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    minWidth: 150,
                    padding: "11px 14px",
                    borderRadius: 8,
                    background: "#22C55E",
                    color: "#FFFFFF",
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 800,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <span>💬</span> Share to WhatsApp
                </a>
              </div>
            </div>
          </Card>
        )
      })()}

      {subTab === "details" && managingAuction && (() => {
        const teamsN = auctionTeamCounts[managingAuction.id] || auctionTeams.length || 0
        const playersN = auctionPlayerCounts[managingAuction.id] || auctionPlayers.length || 0
        const lowestBase = auctionPlayers.length > 0 ? Math.min(...auctionPlayers.map(p => Number(p.base_price)||0).filter(n=>n>0)) : null
        const base = window.location.origin
        const regLink = `${base}/auction-register/${managingAuction.auction_code}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(regLink)}`
        return (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"#F0FDF4", borderRadius:12, border:"1.5px solid #BBF7D0", marginBottom:16, flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ fontSize:11, color:"#166534", fontWeight:700, textTransform:"uppercase" }}>Scheduled Date & Time</div>
                <div style={{ fontSize:15, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)", marginTop:3 }}>
                  {managingAuction.auction_date ? fmtDate(managingAuction.auction_date) : "Date TBD"}{managingAuction.auction_time ? ` · ${managingAuction.auction_time}` : ""}
                </div>
                {managingAuction.location && <div style={{ fontSize:12, color:"#64748B", marginTop:3, display:"flex", alignItems:"center", gap:4 }}><MapPin size={12}/> {managingAuction.location}</div>}
              </div>
              <button
                type="button"
                onClick={() => setEditingAuctionDateTime(managingAuction)}
                style={{ padding:"8px 14px", borderRadius:8, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}
              >
                ✏️ Edit Date & Time
              </button>
            </div>
            <Card style={{ padding:"18px", marginBottom:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(184,134,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Gavel size={17} color="#B8860B"/></div>
                  <div><div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>Auction Code</div><div style={{ fontSize:14, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{managingAuction.auction_code || "—"}</div></div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(34,197,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Wallet size={17} color="#166534"/></div>
                  <div><div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>Points / Team</div><div style={{ fontSize:14, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{managingAuction.points_purse ? `🪙 ${Number(managingAuction.points_purse).toLocaleString("en-IN")}` : "Not set"}</div></div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(37,99,235,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><ArrowUpDown size={17} color="#2563EB"/></div>
                  <div><div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>Bid Increment</div><div style={{ fontSize:14, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{managingAuction.bid_increment ? `🪙 ${Number(managingAuction.bid_increment).toLocaleString("en-IN")}` : "Not started yet"}</div></div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(184,134,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Gavel size={17} color="#B8860B"/></div>
                  <div><div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>Lowest Base Price</div><div style={{ fontSize:14, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{lowestBase ? `🪙 ${Number(lowestBase).toLocaleString("en-IN")}` : "No players priced yet"}</div></div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(34,197,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><UsersRound size={17} color="#166534"/></div>
                  <div><div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>Teams</div><div style={{ fontSize:14, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{teamsN}</div></div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"rgba(34,197,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Users size={17} color="#166534"/></div>
                  <div><div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>Players</div><div style={{ fontSize:14, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{playersN}</div></div>
                </div>
              </div>
            </Card>
            <Card style={{ padding:"18px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#64748B", fontWeight:600, marginBottom:14 }}>Scan to open the registration page</div>
              <img src={qrUrl} alt="Auction QR Code" width={200} height={200} style={{ borderRadius:12, border:"1px solid #E2E8F0" }}/>
              <div style={{ fontSize:13, fontWeight:800, color:"#166534", marginTop:12, fontFamily:"var(--font-head)" }}>{managingAuction.auction_code}</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>Auction QR Code</div>
            </Card>
          </div>
        )
      })()}

      {!managingAuction && (
        <div style={{ display:"flex", background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:16, marginBottom:20, overflow:"hidden", flexWrap:"wrap" }}>
          {[
            { icon:Gavel, v:activeCount, label:"Active Auctions", color:"#166534" },
            { icon:Calendar, v:upcomingCount0, label:"Upcoming", color:"#166534" },
            { icon:Trophy, v:completedCount, label:"Completed", color:"#166534" },
            { icon:Wallet, v:`₹${collectedTotal.toLocaleString("en-IN")}`, label:"Collected", color:"#B8860B" },
          ].map((c,i)=>(
            <div key={i} style={{ flex:"1 1 25%", minWidth:130, padding:"18px 16px", display:"flex", alignItems:"center", gap:12, borderRight:i<3?"1px solid #F1F5F9":"none" }}>
              <c.icon size={20} color={c.color}/>
              <div>
                <div style={{ fontSize:isMobile?18:22, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)", lineHeight:1 }}>{c.v}</div>
                <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {managingAuction && isFounder && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderRadius:12, background:regOpen?"rgba(34,197,94,0.08)":"rgba(231,76,60,0.08)", border:`1.5px solid ${regOpen?"rgba(34,197,94,0.3)":"rgba(231,76,60,0.2)"}`, marginBottom:18 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:13, color:regOpen?"#166534":"#EF4444", fontFamily:"var(--font-head)" }}>Public Registration: {regOpen ? "Open" : "Closed"}</div>
            <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{regOpen ? "Anyone with the link can register for this auction." : "New registrations are currently blocked."}</div>
          </div>
          <button onClick={toggleRegistration} disabled={regBusy} style={{ padding:"9px 16px", borderRadius:9, border:"none", background:regOpen?"#EF4444":"#166534", color:"#FFFFFF", fontSize:12, fontWeight:800, cursor:regBusy?"not-allowed":"pointer", fontFamily:"var(--font-head)", flexShrink:0 }}>{regBusy ? "..." : (regOpen ? "Close" : "Open")}</button>
        </div>
      )}

      <div style={{
        display:"flex",
        gap:8,
        marginBottom:18,
        overflowX: isMobile ? "auto" : "visible",
        flexWrap: isMobile ? "nowrap" : "wrap",
        paddingBottom: isMobile ? 6 : 0,
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none"
      }}>
        {(managingAuction
          ? (() => {
              const activeCount = auctionPlayers.filter(p => !p.is_captain && p.status !== "captain" && p.status !== "waitlist" && p.payment_status !== "waitlist" && p.status !== "dropped").length
              const droppedCount = auctionPlayers.filter(p => p.status === "dropped").length
              return [
                ["players", `Auction Pool (${activeCount})`],
                ["teams", `Teams (${auctionTeams.length})`],
                ["dropped", `🚫 Dropped (${droppedCount})`],
                ["live", "Live Auction"],
                ["sponsors", "Sponsors"],
                ["links", "Links"],
                ["details", "Details"]
              ]
            })()
          : [["today", "Today's Auctions"], ["upcoming", "Upcoming Auctions"], ["completed", "Completed"], ["pricing", "Pricing"], ...(isFounder ? [["payments", `Payments (${pendingPayments.length})`]] : [])]
        ).map(([v, label]) => {
          const isAct = v === "dropped" ? (subTab === "players" && poolView === "dropped") : (v === "players" ? (subTab === "players" && poolView !== "dropped") : subTab === v)
          return (
            <button
              key={v}
              onClick={() => {
                if (v === "dropped") {
                  setSubTab("players")
                  setPoolView("dropped")
                } else {
                  setSubTab(v)
                  if (v === "players" && poolView === "dropped") setPoolView("pool")
                }
              }}
              style={{
                padding: isMobile ? "8px 14px" : "9px 16px",
                borderRadius: 999,
                border: isAct ? "none" : "1.5px solid #E2E8F0",
                background: isAct ? (v === "dropped" ? "#DC2626" : "#166534") : "#FFFFFF",
                color: isAct ? "#FFFFFF" : "#0F172A",
                fontSize: isMobile ? 12 : 12.5,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {(subTab === "today" || subTab === "upcoming" || subTab === "completed") && (() => {
        const todayStr = new Date().toISOString().split("T")[0]
        const dateFiltered = allAuctions.filter(a => {
          if (subTab === "completed") return a.status === "completed"
          if (a.status === "completed") return false
          if (!a.auction_date) return subTab === "upcoming" // undated auctions show under Upcoming
          return subTab === "today" ? a.auction_date === todayStr : a.auction_date > todayStr
        })
        const q = auctionSearch.trim().toLowerCase()
        const searched = dateFiltered.filter(a => !q || a.name.toLowerCase().includes(q) || (a.players?.name||"").toLowerCase().includes(q) || (a.location||"").toLowerCase().includes(q))
        const list = [...searched].sort((a,b) => {
          if (auctionSort === "name") return a.name.localeCompare(b.name)
          if (auctionSort === "teams") return (b.max_teams||0) - (a.max_teams||0)
          return (a.auction_date||"9999") < (b.auction_date||"9999") ? -1 : 1
        })
        const statusColor = { free:"#166534", paid:"#166534", pending:"#B8860B", rejected:"#EF4444" }
        // Derive a friendlier status label than the raw setup/live/completed value
        const statusLabel = a => a.status === "completed" ? "Completed" : a.status === "live" ? "Active" : (a.auction_date && a.auction_date > todayStr) ? "Upcoming" : "Setup"
        const statusBg = a => a.status === "completed" ? "#F1F5F9" : a.status === "live" ? "rgba(34,197,94,0.12)" : (a.auction_date && a.auction_date > todayStr) ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)"
        const statusFg = a => a.status === "completed" ? "#64748B" : a.status === "live" ? "#166534" : (a.auction_date && a.auction_date > todayStr) ? "#166534" : "#B8860B"
        if (loadingAuctions) return <Spinner/>
        return (
          <>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:200, position:"relative" }}>
                <SearchIcon size={16} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
                <input value={auctionSearch} onChange={e=>setAuctionSearch(e.target.value)} placeholder="Search auctions by name or organizer..." style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", boxSizing:"border-box", fontFamily:"var(--font-body)" }}/>
              </div>
              <div style={{ position:"relative" }}>
                <button onClick={()=>setAuctionSortOpen(o=>!o)} style={{ padding:"12px 16px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#FFFFFF", color:"#0F172A", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}><ArrowUpDown size={14}/> Sort</button>
                {auctionSortOpen && (
                  <div style={{ position:"absolute", top:"100%", right:0, marginTop:4, background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:12, boxShadow:"0 8px 24px rgba(15,23,42,0.12)", zIndex:20, minWidth:150, overflow:"hidden" }}>
                    {[["date","Date"],["name","Name (A-Z)"],["teams","Most Teams"]].map(([k,label])=>(
                      <button key={k} onClick={()=>{setAuctionSort(k);setAuctionSortOpen(false)}} style={{ width:"100%", padding:"10px 14px", border:"none", background:auctionSort===k?"rgba(34,197,94,0.08)":"none", textAlign:"left", fontSize:13, color:"#0F172A", cursor:"pointer", fontWeight:auctionSort===k?700:500 }}>{label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {list.length === 0 ? (
          <Card style={{ padding:"32px 16px", textAlign:"center" }}>
            <div style={{ fontSize:14, color:"#64748B" }}>No {subTab === "today" ? "auctions today" : subTab === "completed" ? "completed auctions yet" : "upcoming auctions"}.</div>
          </Card>
        ) : (
          <div style={{ display:"grid", gap:12 }}>
            {list.map(a => {
              const canManage = a.payment_status === "paid" || a.payment_status === "free"
              const teamsN = auctionTeamCounts[a.id] || 0
              const playersN = auctionPlayerCounts[a.id] || 0
              return (
              <Card key={a.id} style={{ padding:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
                    <TeamAv name={a.name} logo={null} size={44}/>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:15, color:"#0F172A", fontFamily:"var(--font-head)" }}>{a.name}</div>
                      <div style={{ fontSize:12, color:"#64748B", marginTop:2, display:"flex", alignItems:"center", gap:4 }}><UserIcon size={11}/> Organized by {a.players?.name || "—"}</div>
                    </div>
                  </div>
                  <span style={{ background:statusBg(a), color:statusFg(a), borderRadius:999, padding:"4px 11px", fontSize:11, fontWeight:700, flexShrink:0 }}>{statusLabel(a)}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4, flexWrap:"wrap", gap:6 }}>
                  <div style={{ fontSize:12, color:"#64748B", display:"flex", alignItems:"center", gap:4 }}>
                    {a.auction_date ? <><Calendar size={11}/> {fmtDate(a.auction_date)}</> : "Date TBD"}{a.auction_time ? <> · <Clock size={11}/> {a.auction_time}</> : ""}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setEditingAuctionDateTime(a) }}
                    style={{ background:"none", border:"1px solid #CBD5E1", borderRadius:6, padding:"2px 8px", fontSize:11, color:"#166534", fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:3 }}
                  >
                    ✏️ Edit Date & Time
                  </button>
                </div>
                {a.location && <div style={{ fontSize:12, color:"#64748B", marginBottom:10, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/> {a.location}</div>}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingTop:10, borderTop:"1px solid #F1F5F9", gap:10, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", gap:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <UsersRound size={14} color="#166534"/>
                      <div><div style={{ fontSize:13, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)", lineHeight:1 }}>{teamsN}</div><div style={{ fontSize:9, color:"#94A3B8" }}>Teams</div></div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <Users size={14} color="#166534"/>
                      <div><div style={{ fontSize:13, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)", lineHeight:1 }}>{playersN}</div><div style={{ fontSize:9, color:"#94A3B8" }}>Players</div></div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <ShieldCheck size={14} color="#B8860B"/>
                      <div><div style={{ fontSize:13, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)", lineHeight:1, textTransform:"capitalize" }}>{a.plan_tier}</div><div style={{ fontSize:9, color:"#94A3B8" }}>Plan Used</div></div>
                    </div>
                  </div>
                  {canManage ? (
                    <button onClick={()=>{ setManagingAuction(a); setSubTab(a.status==="live" ? "live" : "players") }} style={{ padding:"9px 14px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>{a.status==="completed"?"View Results":"Open Auction"} <ChevronRight size={13}/></button>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                      <span style={{ fontSize:11, color:statusColor[a.payment_status]||"#94A3B8", fontWeight:700, fontStyle:"italic" }}>{a.payment_status === "pending" ? "Awaiting payment confirmation" : a.payment_status}</span>
                      <button onClick={(e)=>{ e.stopPropagation(); setPendingPayAuction(a) }} style={{ padding:"6px 10px", borderRadius:7, background:"rgba(34,197,94,0.08)", border:"1px solid #166534", color:"#166534", fontSize:11, fontWeight:700, cursor:"pointer" }}>Payment Details</button>
                      {isFounder && a.payment_status === "pending" && (
                        <button onClick={async (e)=>{ e.stopPropagation(); await doApprovePayment(a.id) }} style={{ padding:"6px 12px", borderRadius:8, background:"#166534", border:"none", color:"#FFFFFF", fontSize:11, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>✓ Approve</button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )})}
          </div>
        )}
          </>
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

      {subTab === "players" && (() => {
        const auctionPoolPlayers = randomizedPool
        const waitlistPlayers = auctionPlayers.filter(p => !p.is_captain && p.status !== "captain" && p.status !== "dropped" && (p.status === "waitlist" || p.payment_status === "waitlist"))
        const droppedPlayers = auctionPlayers.filter(p => p.status === "dropped")
        const isPlayerUnsold = p => p.status === "unsold" || p.status === "final_unsold"
        const unsoldPlayers = auctionPlayers.filter(isPlayerUnsold)
        const soldCount = auctionPoolPlayers.filter(p => p.status === "sold" || p.sold_team_id).length
        const totalBase = auctionPoolPlayers.reduce((s,p) => s + (Number(p.base_price)||0), 0)
        const inPoolPhones = new Set(auctionPoolPlayers.map(p => (p.phone||"").replace(/[^0-9]/g,"").slice(-10)))
        const notAddedCount = allPlatformPlayers.filter(p => !inPoolPhones.has((p.phone||"").replace(/[^0-9]/g,"").slice(-10))).length
        const q = poolSearch.trim().toLowerCase()
        const filteredPool = auctionPoolPlayers.filter(p => !q || p.name.toLowerCase().includes(q) || (p.playing_role||"").toLowerCase().includes(q))
        const filteredDropped = droppedPlayers.filter(p => !q || p.name.toLowerCase().includes(q) || (p.playing_role||"").toLowerCase().includes(q))
        const filteredUnsold = unsoldPlayers.filter(p => !q || p.name.toLowerCase().includes(q) || (p.playing_role||"").toLowerCase().includes(q))

        const pq = platformSearch.trim().toLowerCase()
        const filteredPlatform = allPlatformPlayers.filter(p => {
          if (pq && !p.name.toLowerCase().includes(pq) && !(p.phone||"").includes(pq)) return false
          if (platformTypeFilter && (p.role||"player") !== platformTypeFilter) return false
          return true
        })
        const toggleSelect = id => {
          const next = new Set(selectedPlatformIds)
          next.has(id) ? next.delete(id) : next.add(id)
          setSelectedPlatformIds(next)
        }

        return (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom:10, flexDirection: isMobile ? "column" : "row", gap: 10 }}>
            <div style={{ fontSize:12, color:"#64748B" }}>
              Pool: <strong>{auctionPoolPlayers.length}</strong> players available for bidding · 🎲 Randomized Order {waitlistPlayers.length > 0 && <span>· ⏳ <strong>{waitlistPlayers.length}</strong> on Waitlist (Hidden)</span>} {droppedPlayers.length > 0 && <span>· 🚫 <strong>{droppedPlayers.length}</strong> Dropped</span>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShuffleSeed(s => s + 1)}
                style={{ padding:"6px 12px", borderRadius:8, border:"1px solid #CBD5E1", background:"#F8FAF8", color:"#0F172A", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}
                title="Randomize player display sequence for live auction"
              >
                <Shuffle size={13} color="#166534"/> 🔀 Reshuffle
              </button>
              <button
                type="button"
                onClick={() => setShowExportPoolModal(true)}
                style={{ background:"rgba(22,101,52,0.08)", border:"1px solid #166534", borderRadius:8, color:"#166534", fontSize:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:5, padding:"6px 12px" }}
              >
                <FileText size={13}/> Export Pool ({auctionPoolPlayers.length})
              </button>
              <button onClick={load} style={{ background:"none", border:"none", color:"#166534", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, padding:0 }}><RotateCcw size={13}/> Refresh</button>
            </div>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: 1,
            background: "#E2E8F0",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            marginBottom: 16,
            overflow: "hidden"
          }}>
            {(isFounder ? [
              { icon:Users, v:allPlatformPlayers.length, label:"Total Players" },
              { icon:Gavel, v:auctionPoolPlayers.length, label:"In Auction Pool" },
              { icon:Clock, v:`${waitlistPlayers.length} (Hidden)`, label:"Waiting List" },
              { icon:Wallet, v:`🪙 ${totalBase.toLocaleString("en-IN")}`, label:"Total Base Value" },
            ] : [
              { icon:Gavel, v:auctionPoolPlayers.length, label:"In Auction Pool" },
              { icon:Clock, v:`${waitlistPlayers.length} (Hidden)`, label:"Waiting List" },
              { icon:CheckCircle2, v:soldCount, label:"Sold" },
              { icon:Wallet, v:`🪙 ${totalBase.toLocaleString("en-IN")}`, label:"Total Base Value" },
            ]).map((c,i)=>(
              <div key={i} style={{ background: "#FFFFFF", padding: isMobile ? "12px 10px" : "14px 16px", display:"flex", alignItems:"center", gap: 10 }}>
                <c.icon size={isMobile ? 16 : 18} color="#166534" style={{ flexShrink: 0 }}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: isMobile ? 14 : 16, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)", lineHeight:1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.v}</div>
                  <div style={{ fontSize:10, color:"#64748B", marginTop:2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto", scrollbarWidth:"none", borderBottom:"1px solid #E2E8F0", paddingBottom:2 }}>
            {[
              ...(isFounder ? [["registered",`Registered Players`]] : []),
              ["pool",`Auction Pool (${auctionPoolPlayers.length})`],
              ["unsold",`🚫 Unsold (${unsoldPlayers.length})`],
              ["dropped",`🚫 Dropped (${droppedPlayers.length})`]
            ].map(([k,label])=>(
              <button key={k} onClick={()=>setPoolView(k)} style={{ padding: isMobile ? "8px 12px" : "9px 16px", borderRadius:"8px 8px 0 0", border:"none", borderBottom:(poolView===k || (!poolView && k==="pool"))?"2.5px solid #166534":"2.5px solid transparent", background:"none", color:(poolView===k || (!poolView && k==="pool"))?"#166534":"#94A3B8", fontSize: isMobile ? 12 : 13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink: 0 }}>{label}</button>
            ))}
          </div>

          {waitlistPlayers.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, marginBottom:14, fontSize:12, color:"#92400E", fontWeight:600 }}>
              <Clock size={14} color="#B45309" style={{ flexShrink:0 }}/>
              <span><strong>{waitlistPlayers.length} players</strong> on Waiting List (Cap reached). Waiting list details are kept private.</span>
            </div>
          )}

          {poolView === "registered" && isFounder ? (
            <>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>All players registered on Selected Sports. Add players to the auction pool to include them in the auction.</div>
              <div style={{ display:"flex", gap:10, marginBottom:14, flexDirection: isMobile ? "column" : "row" }}>
                <div style={{ flex:1, position:"relative" }}>
                  <SearchIcon size={16} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
                  <input value={platformSearch} onChange={e=>setPlatformSearch(e.target.value)} placeholder="Search players by name or phone..." style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", boxSizing:"border-box", fontFamily:"var(--font-body)" }}/>
                </div>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <select value={platformTypeFilter} onChange={e=>setPlatformTypeFilter(e.target.value)} style={{ padding:"12px 14px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, background:"#FFFFFF", color:"#0F172A", flex: isMobile ? 1 : "none" }}>
                    <option value="">All Types</option>
                    <option value="player">Player</option>
                    <option value="pro">PRO</option>
                  </select>
                  {selectedPlatformIds.size > 0 && (
                    <button onClick={doBulkAddToPool} disabled={addingToPool} style={{ padding:"12px 18px", borderRadius:12, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", flex: isMobile ? 1 : "none", justifyContent: "center" }}><Plus size={15}/> Add {selectedPlatformIds.size}</button>
                  )}
                </div>
              </div>
              {loadingPlatformPlayers ? <Spinner/> : filteredPlatform.length === 0 ? (
                <Card style={{ padding:"32px 16px", textAlign:"center" }}><div style={{ fontSize:14, color:"#64748B" }}>No players found.</div></Card>
              ) : (
                <div style={{ display:"grid", gap:8 }}>
                  {filteredPlatform.map(p => {
                    const already = inPoolPhones.has((p.phone||"").replace(/[^0-9]/g,"").slice(-10))
                    return (
                      <Card key={p.id} style={{ padding: isMobile ? "10px 12px" : "12px 14px", display:"flex", alignItems:"center", gap: 10 }}>
                        <input type="checkbox" checked={selectedPlatformIds.has(p.id)} disabled={already} onChange={()=>toggleSelect(p.id)} style={{ flexShrink:0 }}/>
                        {p.profile_image_url ? (
                          <img src={p.profile_image_url} alt={p.name} style={{ width:38, height:38, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
                        ) : (
                          <Av name={p.name} id={p.id} sz={38}/>
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:13.5, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {p.name}
                            {p.role==="pro" && <span style={{ marginLeft:6, fontSize:9, fontWeight:800, color:"#B8860B", background:"rgba(184,134,11,0.12)", padding:"2px 6px", borderRadius:999 }}>PRO</span>}
                          </div>
                          <div style={{ fontSize:11.5, color:"#94A3B8", display:"flex", alignItems:"center", gap:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            <Phone size={11} style={{ flexShrink: 0 }}/>
                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.phone}{p.city ? ` · ${p.city}` : ""}</span>
                          </div>
                        </div>
                        <button onClick={()=>doAddPlayerToPool(p)} disabled={already || addingToPool} style={{ padding:"6px 12px", borderRadius:8, border:already?"none":"1.5px solid #166534", background:already?"rgba(34,197,94,0.12)":"#FFFFFF", color:already?"#166534":"#166534", fontSize:12, fontWeight:700, cursor:already?"default":"pointer", display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          {already ? <><CheckCircle2 size={13}/> Added</> : <><Plus size={13}/> Add</>}
                        </button>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          ) : poolView === "unsold" ? (
            <div>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>
                Players who did not receive bids during the live auction. You can return them to the confirmed auction pool anytime so they can be re-auctioned.
              </div>
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                <div style={{ flex:1, position:"relative" }}>
                  <SearchIcon size={16} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
                  <input value={poolSearch} onChange={e=>setPoolSearch(e.target.value)} placeholder="Search unsold players..." style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", boxSizing:"border-box", fontFamily:"var(--font-body)" }}/>
                </div>
              </div>
              {filteredUnsold.length === 0 ? (
                <Card style={{ padding:"32px 16px", textAlign:"center" }}>
                  <div style={{ fontSize:14, color:"#64748B" }}>{unsoldPlayers.length === 0 ? "No players currently marked as unsold." : "No unsold players match your search."}</div>
                </Card>
              ) : (
                <div style={{ display:"grid", gap:10 }}>
                  {filteredUnsold.map((p, idx) => (
                    <Card key={p.id} style={{ padding: isMobile ? "12px 12px" : "14px 16px", background:"#FFFBF0", border:"1px solid #FED7AA", borderRadius: 14 }}>
                      <div onClick={()=>setViewingPlayer(p)} style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 10, cursor:"pointer" }}>
                        <span style={{ background:"#FFEDD5", color:"#C2410C", border:"1px solid #FDBA74", borderRadius:6, fontSize:11, fontWeight:800, padding:"2px 6px", flexShrink:0 }}>
                          #{idx + 1}
                        </span>
                        {p.profile_image_url ? (
                          <img src={p.profile_image_url} alt={p.name} style={{ width:40, height:40, borderRadius:10, objectFit:"cover", flexShrink:0, border:"1px solid #FED7AA" }}/>
                        ) : (
                          <div style={{ width:40, height:40, borderRadius:10, background:"#FFEDD5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#C2410C", flexShrink:0 }}>{(p.name||"?")[0]}</div>
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                          <div style={{ fontSize:11.5, color:"#9A3412", display:"flex", alignItems:"center", gap:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop: 2 }}>
                            <Phone size={11} style={{ flexShrink: 0 }}/>
                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.phone}{p.playing_role ? ` · ${p.playing_role}` : ""}{p.city ? ` · 📍 ${p.city}` : ""}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          <ChevronRight size={16} color="#94A3B8"/>
                          <button onClick={(e)=>{ e.stopPropagation(); removePlayer(p) }} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:5, display:"flex", alignItems:"center", borderRadius:6 }} title="Delete player"><Trash2 size={15}/></button>
                        </div>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:8, borderTop:"1px dashed #FED7AA", gap: 8, flexWrap:"wrap" }}>
                        <div style={{ display:"flex", alignItems:"center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, color:"#C2410C", background: "#FFEDD5", border:"1px solid #FDBA74", padding: "3px 7px", borderRadius: 6 }}>
                            🚫 Unsold
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color:"#166534" }}>
                            🪙 Base: {Number(p.base_price||0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div style={{ display:"flex", gap:6, marginLeft:"auto" }}>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                await resetAuctionPlayerToPool(p.id)
                                await load()
                              } catch(err) { alert(err.message) }
                            }}
                            style={{ padding: isMobile ? "5px 10px" : "6px 14px", borderRadius:8, background:"#166534", border:"none", color:"#FFFFFF", fontSize:11.5, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)", display:"inline-flex", alignItems:"center", gap:4 }}
                          >
                            ↩️ Return to Pool
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : poolView === "dropped" ? (
            <div>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>
                Players who have withdrawn or been dropped from the auction. Organizer has refunded their registration fees. They are excluded from the live auction and captain dossier.
              </div>
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                <div style={{ flex:1, position:"relative" }}>
                  <SearchIcon size={16} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
                  <input value={poolSearch} onChange={e=>setPoolSearch(e.target.value)} placeholder="Search dropped players..." style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", boxSizing:"border-box", fontFamily:"var(--font-body)" }}/>
                </div>
              </div>
              {filteredDropped.length === 0 ? (
                <Card style={{ padding:"32px 16px", textAlign:"center" }}>
                  <div style={{ fontSize:14, color:"#64748B" }}>{droppedPlayers.length === 0 ? "No players currently marked as dropped." : "No dropped players match your search."}</div>
                </Card>
              ) : (
                <div style={{ display:"grid", gap:10 }}>
                  {filteredDropped.map((p, idx) => (
                    <Card key={p.id} style={{ padding: isMobile ? "12px 12px" : "14px 16px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius: 14 }}>
                      <div onClick={()=>setViewingPlayer(p)} style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 10, cursor:"pointer" }}>
                        <span style={{ background:"#FEE2E2", color:"#DC2626", border:"1px solid #FCA5A5", borderRadius:6, fontSize:11, fontWeight:800, padding:"2px 6px", flexShrink:0 }}>
                          #{idx + 1}
                        </span>
                        {p.profile_image_url ? (
                          <img src={p.profile_image_url} alt={p.name} style={{ width:40, height:40, borderRadius:10, objectFit:"cover", flexShrink:0, border:"1px solid #FECACA" }}/>
                        ) : (
                          <div style={{ width:40, height:40, borderRadius:10, background:"#FEE2E2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#DC2626", flexShrink:0 }}>{(p.name||"?")[0]}</div>
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                          <div style={{ fontSize:11.5, color:"#991B1B", display:"flex", alignItems:"center", gap:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop: 2 }}>
                            <Phone size={11} style={{ flexShrink: 0 }}/>
                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.phone}{p.playing_role ? ` · ${p.playing_role}` : ""}{p.city ? ` · 📍 ${p.city}` : ""}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                          <ChevronRight size={16} color="#94A3B8"/>
                          <button onClick={(e)=>{ e.stopPropagation(); removePlayer(p) }} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:5, display:"flex", alignItems:"center", borderRadius:6 }} title="Delete permanently"><Trash2 size={15}/></button>
                        </div>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:8, borderTop:"1px dashed #FECACA", gap: 8, flexWrap:"wrap" }}>
                        <div style={{ display:"flex", alignItems:"center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#DC2626", background: "#FEE2E2", border:"1px solid #FCA5A5", padding: "3px 7px", borderRadius: 6 }}>
                            🚫 Dropped
                          </span>
                          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#D97706", background: "#FEF3C7", border: "1px solid #FDE68A", padding: "3px 7px", borderRadius: 6 }}>
                            ↩️ Fee Refunded
                          </span>
                          {p.payment_screenshot_url && (
                            <button onClick={(e)=>{ e.stopPropagation(); setReceiptModalImg(p.payment_screenshot_url) }} style={{ padding:"2px 7px", borderRadius:6, border:"1px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:11, fontWeight:700, cursor:"pointer" }}>
                              🧾 Receipt
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); restorePlayer(p) }}
                          style={{ padding: isMobile ? "5px 10px" : "6px 14px", borderRadius:8, background:"#166534", border:"none", color:"#FFFFFF", fontSize:11.5, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)", display:"inline-flex", alignItems:"center", gap:4, marginLeft: "auto" }}
                        >
                          Restore to Pool ➔
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
          <>
          <div style={{ display:"flex", gap:10, marginBottom:14, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flex:1, position:"relative" }}>
              <SearchIcon size={16} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
              <input value={poolSearch} onChange={e=>setPoolSearch(e.target.value)} placeholder="Search players by name or role..." style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", boxSizing:"border-box", fontFamily:"var(--font-body)" }}/>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <button
                type="button"
                onClick={() => setShuffleSeed(s => s + 1)}
                style={{ padding: isMobile ? "8px 12px" : "10px 14px", borderRadius:12, border:"1.5px solid #CBD5E1", background:"#F8FAF8", color:"#0F172A", fontSize:12.5, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}
                title="Randomize player display sequence"
              >
                <Shuffle size={14} color="#166534"/> 🔀 Reshuffle
              </button>
              <button
                type="button"
                onClick={() => setShowExportPoolModal(true)}
                style={{ padding: isMobile ? "8px 14px" : "10px 18px", borderRadius:12, border:"1.5px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:12.5, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)", display:"inline-flex", alignItems:"center", justifyContent: "center", gap:6, whiteSpace:"nowrap", boxShadow:"0 2px 6px rgba(22,101,52,0.06)" }}
              >
                <FileText size={14}/> Export for Captains ({auctionPoolPlayers.length})
              </button>
            </div>
          </div>
          {filteredPool.length === 0 ? (
            <Card style={{ padding:"32px 16px", textAlign:"center" }}>
              <div style={{ fontSize:14, color:"#64748B" }}>{auctionPoolPlayers.length === 0 ? "No players have registered for the auction yet." : "No players match your search."}</div>
              {auctionPoolPlayers.length === 0 && <div style={{ fontSize:12, color:"#94A3B8", marginTop:6 }}>Share the public auction registration link to start collecting entries.</div>}
            </Card>
          ) : (
            <div style={{ display:"grid", gap:10 }}>
              {filteredPool.map((p, idx) => (
                <Card key={p.id} style={{ padding: isMobile ? "12px 12px" : "14px 16px", borderRadius: 14 }}>
                  <div onClick={()=>setViewingPlayer(p)} style={{ display:"flex", alignItems:"center", gap: 10, cursor:"pointer", marginBottom: 10 }}>
                    <span style={{ background:"#F1F5F9", color:"#475569", border:"1px solid #E2E8F0", borderRadius:6, fontSize:11, fontWeight:800, padding:"2px 6px", flexShrink:0 }}>
                      #{idx + 1}
                    </span>
                    {p.profile_image_url ? (
                      <img src={p.profile_image_url} alt={p.name} style={{ width:40, height:40, borderRadius:10, objectFit:"cover", flexShrink:0, border:"1px solid #E2E8F0" }}/>
                    ) : (
                      <div style={{ width:40, height:40, borderRadius:10, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#475569", flexShrink:0 }}>{(p.name||"?")[0]}</div>
                    )}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize:11.5, color:"#64748B", display:"flex", alignItems:"center", gap:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop: 2 }}>
                        <Phone size={11} style={{ flexShrink: 0 }}/>
                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.phone}{p.playing_role ? ` · ${p.playing_role}` : ""}{p.city ? ` · 📍 ${p.city}` : ""}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                      <button
                        type="button"
                        onClick={(e)=>{ e.stopPropagation(); tagDropped(p) }}
                        style={{ background:"#FEF3C7", border:"1px solid #FDE68A", cursor:"pointer", color:"#B45309", padding:"4px 8px", display:"inline-flex", alignItems:"center", gap:4, borderRadius:6, fontSize:11, fontWeight:700 }}
                        title="Tag as Dropped / Withdrawn"
                      >
                        <Ban size={12}/> Drop
                      </button>
                      <button onClick={(e)=>{ e.stopPropagation(); removePlayer(p) }} style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", padding:5, display:"flex", alignItems:"center", borderRadius:6 }} title="Delete player"><Trash2 size={15}/></button>
                      <ChevronRight size={16} color="#94A3B8"/>
                    </div>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap: 8, paddingTop: 10, borderTop:"1px solid #F1F5F9", flexWrap: "wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap: "wrap" }}>
                      {p.payment_status === "paid" && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", background: "rgba(34,197,94,0.12)", padding: "3px 8px", borderRadius: 6, display:"inline-flex", alignItems:"center", gap:3 }}>
                          ✓ Paid
                        </span>
                      )}
                      {p.payment_status === "pending" && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#B45309", background: "rgba(245,158,11,0.12)", padding: "3px 8px", borderRadius: 6, display:"inline-flex", alignItems:"center", gap:3 }}>
                          ⏳ Pending
                        </span>
                      )}
                      {(p.status === "waitlist" || p.payment_status === "waitlist") && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border:"1px solid #FDE68A", padding: "3px 8px", borderRadius: 6 }}>
                          ⏳ Waitlist
                        </span>
                      )}
                      {p.payment_screenshot_url && (
                        <button onClick={(e)=>{ e.stopPropagation(); setReceiptModalImg(p.payment_screenshot_url) }} style={{ padding:"3px 8px", borderRadius:6, border:"1px solid #166534", background:"rgba(34,197,94,0.08)", color:"#166534", fontSize:11, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4 }}>
                          🧾 Receipt
                        </button>
                      )}
                    </div>

                    <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft: "auto" }}>
                      <span style={{ fontSize:11.5, color:"#64748B", fontWeight:700, whiteSpace:"nowrap" }}>🪙 Base Price:</span>
                      <input
                        type="number"
                        min="0"
                        value={priceDrafts[p.id] !== undefined ? priceDrafts[p.id] : (p.base_price ?? "")}
                        onChange={e=>setPriceDrafts({...priceDrafts, [p.id]: e.target.value})}
                        onBlur={()=>savePrice(p.id)}
                        placeholder="0"
                        style={{ width: isMobile ? 85 : 110, padding: "5px 8px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 700, color: "#0F172A", textAlign: "right", outline: "none", background: "#FFFFFF" }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          </>
          )}
        </div>
        )
      })()}

      {subTab === "teams" && (() => {
        const totalPurse = auctionTeams.reduce((s,t) => s + (Number(t.purse_total)||0), 0)
        const totalRemaining = auctionTeams.reduce((s,t) => s + (Number(t.purse_remaining)||0), 0)
        const q = teamSearch.trim().toLowerCase()
        const filteredTeams = auctionTeams.filter(t => !q || t.name.toLowerCase().includes(q) || (t.owner_name||"").toLowerCase().includes(q))
        return (
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
            gap: 1,
            background: "#E2E8F0",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            marginBottom: 16,
            overflow: "hidden"
          }}>
            {[
              { icon:UsersRound, v:auctionTeams.length, label:"Total Teams" },
              { icon:Wallet, v:<span style={{ display:"inline-flex", alignItems:"center", gap:3 }}><CoinIcon size={14}/> {totalPurse.toLocaleString("en-IN")}</span>, label:"Purse Pool" },
              { icon:CheckCircle2, v:<span style={{ display:"inline-flex", alignItems:"center", gap:3 }}><CoinIcon size={14}/> {totalRemaining.toLocaleString("en-IN")}</span>, label:"Remaining" },
            ].map((c,i)=>(
              <div key={i} style={{ background: "#FFFFFF", padding: isMobile ? "10px 8px" : "14px 16px", display:"flex", alignItems:"center", gap: isMobile ? 6 : 10 }}>
                <c.icon size={isMobile ? 15 : 17} color="#166534" style={{ flexShrink: 0 }}/>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: isMobile ? 13 : 16, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)", lineHeight:1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.v}</div>
                  <div style={{ fontSize: isMobile ? 9 : 10, color:"#64748B", marginTop:2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:14, flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ flex:1, position:"relative" }}>
              <SearchIcon size={16} color="#94A3B8" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
              <input value={teamSearch} onChange={e=>setTeamSearch(e.target.value)} placeholder="Search teams by name or owner..." style={{ width:"100%", padding:"12px 14px 12px 40px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", boxSizing:"border-box", fontFamily:"var(--font-body)" }}/>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={doPrintTeamLists} style={{ flex: isMobile ? 1 : "none", padding:"10px 14px", borderRadius:12, border:"1.5px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent: "center", gap:5, whiteSpace:"nowrap" }}><FileText size={15}/> Print / Export</button>
              <button onClick={openAddTeam} style={{ flex: isMobile ? 1 : "none", padding:"10px 14px", borderRadius:12, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent: "center", gap:5, whiteSpace:"nowrap" }}><Plus size={15}/> Add Team</button>
            </div>
          </div>
          {filteredTeams.length === 0 ? (
            <Card style={{ padding:"32px 16px", textAlign:"center" }}>
              <div style={{ fontSize:14, color:"#64748B" }}>{auctionTeams.length === 0 ? "No teams set up yet." : "No teams match your search."}</div>
              {auctionTeams.length === 0 && <div style={{ fontSize:12, color:"#94A3B8", marginTop:6 }}>Add each team and set their starting purse before the auction begins.</div>}
            </Card>
          ) : (
            <div style={{ display:"grid", gap:10 }}>
              {filteredTeams.map(t => {
                const teamSquad = auctionPlayers.filter(p => p.sold_team_id === t.id)
                return (
                <Card key={t.id} style={{ padding: isMobile ? "12px 12px" : "14px 16px", borderRadius: 14 }}>
                  <div onClick={()=>setViewingTeam(t)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                    <TeamAv name={t.name} logo={t.logo_url} size={isMobile ? 36 : 40}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                      <div style={{ fontSize:11.5, color:"#64748B", display:"flex", alignItems:"center", gap:4, flexWrap:"wrap", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {t.captain_name && <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>👑 <strong style={{ color:"#0F172A" }}>{t.captain_name}</strong></span>}
                        <span style={{ color:"#94A3B8" }}>({teamSquad.length}/9 squad)</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink: 0 }}>
                      <div style={{ fontWeight:800, fontSize: isMobile ? 13.5 : 15, color:"#166534", fontFamily:"var(--font-head)", display:"inline-flex", alignItems:"center", gap:3 }}><CoinIcon size={14}/> {Number(t.purse_remaining||0).toLocaleString("en-IN")}</div>
                      <div style={{ fontSize:9.5, color:"#94A3B8", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:2 }}>of <CoinIcon size={10}/> {Number(t.purse_total||0).toLocaleString("en-IN")}</div>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" style={{ flexShrink: 0 }}/>
                  </div>

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6, marginTop:10, paddingTop:10, borderTop:"1px solid #F1F5F9", flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                      <button
                        onClick={(e)=>{ e.stopPropagation(); copyLink(`${window.location.origin}/team-view/${managingAuction.auction_code}/${t.id}`, `team-${t.id}`) }}
                        style={{ padding:"4px 8px", borderRadius:6, border:"1px solid #E2E8F0", background:"#FFFFFF", cursor:"pointer", color: copiedLink===`team-${t.id}` ? "#166534" : "#475569", fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:3 }}
                        title="Copy private squad link for captain/owner"
                      >
                        <LinkIcon size={11}/> {copiedLink===`team-${t.id}` ? "Copied!" : "Link"}
                      </button>
                      <button
                        onClick={(e)=>{ e.stopPropagation(); shareTeamOnWhatsApp(t, managingAuction) }}
                        style={{ padding:"4px 8px", borderRadius:6, border:"1px solid #22C55E", background:"#F0FDF4", cursor:"pointer", color:"#166534", fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:3 }}
                        title="Share squad link directly via WhatsApp to captain/owner"
                      >
                        <span>📱</span> WhatsApp
                      </button>
                      <button
                        onClick={(e)=>{ e.stopPropagation(); exportTeamRosterPdf(t, auctionPlayers, managingAuction?.name) }}
                        style={{ padding:"4px 8px", borderRadius:6, border:"1.5px solid #166534", background:"#166534", cursor:"pointer", color:"#FFFFFF", fontSize:11, fontWeight:700, display:"inline-flex", alignItems:"center", gap:3 }}
                        title="Export official team roster as print-ready PDF"
                      >
                        <span>📄</span> PDF
                      </button>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginLeft: "auto" }}>
                      <button onClick={(e)=>{ e.stopPropagation(); openEditTeam(t) }} style={{ padding:"4px 8px", borderRadius:6, border:"1px solid #E2E8F0", background:"#FFFFFF", cursor:"pointer", color:"#64748B", fontSize:11, fontWeight:700 }}>Edit</button>
                      <button onClick={(e)=>{ e.stopPropagation(); setDelTeam(t) }} style={{ padding:"4px 6px", borderRadius:6, border:"1px solid #FEE2E2", background:"#FEF2F2", cursor:"pointer", color:"#EF4444", fontSize:11, fontWeight:700 }} title="Delete team"><Trash2 size={13}/></button>
                    </div>
                  </div>
                </Card>
              )})}
            </div>
          )}
        </div>
        )
      })()}

      {subTab === "live" && <AuctionLiveConsole isMobile={isMobile} auctionPlayers={auctionPlayers} auctionTeams={auctionTeams} onPoolChange={load} auctionId={managingAuction?.id || null} auctionDate={managingAuction?.auction_date || null}/>}

      {subTab === "payments" && isFounder && (
        pendingPayments.length === 0 ? (
          <Card style={{ padding:"32px 16px", textAlign:"center" }}>
            <Wallet size={28} color="#E2E8F0" style={{ marginBottom:10 }}/>
            <div style={{ fontSize:14, color:"#64748B" }}>No pending auction payments.</div>
          </Card>
        ) : (
          <div style={{ display:"grid", gap:12 }}>
            {pendingPayments.map(a => (
              <Card key={a.id} style={{ padding:"16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:"rgba(184,134,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Wallet size={18} color="#B8860B"/></div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{a.name}</div>
                    <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Organizer: {a.players?.name || "Unknown"} ({a.players?.phone || "—"})</div>
                  </div>
                  <span style={{ background:"rgba(184,134,11,0.12)", color:"#B8860B", fontSize:15, fontWeight:800, padding:"4px 12px", borderRadius:8, fontFamily:"var(--font-head)", flexShrink:0 }}>₹{a.amount_due}</span>
                </div>
                <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>{a.plan_tier} · up to {a.max_teams} teams</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>doApprovePayment(a.id)} style={{ flex:1, padding:"9px", borderRadius:8, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:700, cursor:"pointer" }}>Approve</button>
                  <button onClick={()=>doRejectPayment(a.id)} style={{ flex:1, padding:"9px", borderRadius:8, border:"1px solid #EF4444", background:"#FFFFFF", color:"#EF4444", fontSize:12, fontWeight:700, cursor:"pointer" }}>Reject</button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {showCreateAuction && <CreateAuctionFlow organizerId={null} isMobile={isMobile} onClose={()=>setShowCreateAuction(false)} onCreated={()=>loadPayments()}/>}
      {pendingPayAuction && (
        <AuctionPaymentModal
          auction={pendingPayAuction}
          isMobile={isMobile}
          onClose={()=>setPendingPayAuction(null)}
          onPaid={()=>{ loadAuctions(); loadPayments() }}
        />
      )}

      {showAddTeam && (
        <div style={mStyle} onClick={()=>setShowAddTeam(false)}>
          <div style={mBox} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{editTeam ? "Edit Team" : "Add Auction Team"}</h3>
              <button onClick={()=>setShowAddTeam(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
            </div>

            {/* Field 1: Captain Mobile Number (first field) */}
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Captain Mobile Number *</div>
            <input
              type="tel"
              inputMode="numeric"
              value={captainPhone}
              onChange={e => handleCaptainPhoneChange(e.target.value)}
              placeholder="10-digit mobile number"
              autoFocus
              style={{ ...iS, marginBottom: captainPlayerId ? 4 : 8 }}
            />
            {captainPlayerId ? (
              <div style={{ fontSize:12, color:"#166534", marginBottom:12, fontWeight:700 }}>✓ Auto-fetched from registration pool: {teamCaptain}</div>
            ) : (
              <div style={{ fontSize:11, color:"#94A3B8", marginBottom:12 }}>
                Enter phone to auto-fetch registered player name, or select from list below.
              </div>
            )}

            {/* Quick dropdown helper to pick registered players */}
            {!editTeam && (
              <div style={{ marginBottom: 12 }}>
                <select
                  value={captainPlayerId || ""}
                  onChange={e => {
                    const pid = e.target.value
                    if (!pid) return
                    const p = auctionPlayers.find(x => x.id === pid)
                    if (p) {
                      setCaptainPlayerId(p.id)
                      setCaptainPhone((p.phone || "").replace(/[^0-9]/g, "").slice(-10))
                      setTeamCaptain(p.name)
                    }
                  }}
                  style={{ ...iS, fontSize: 12, padding: "8px 10px", background: "#FFFFFF" }}
                >
                  <option value="">Or select captain from registered pool...</option>
                  {auctionPlayers.filter(p => !p.sold_team_id && p.status === "registered").map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Field 2: Captain Name */}
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Captain Name *</div>
            <input
              value={teamCaptain}
              onChange={e => setTeamCaptain(e.target.value)}
              placeholder="Captain full name"
              style={{ ...iS, marginBottom:12 }}
            />

            {/* Field 3: Team Name */}
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Team Name *</div>
            <input
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Mumbai Warriors"
              style={{ ...iS, marginBottom:12 }}
            />

            {/* Team Logo / Badge */}
            <div style={{ marginBottom: 14, padding: "12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>Team Logo</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: "#FFFFFF",
                  border: teamLogoPreview ? "2px solid #166534" : "1.5px dashed #CBD5E1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  {teamLogoPreview ? (
                    <img src={teamLogoPreview} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <TeamAv name={teamName || "T"} logo={null} size={52} />
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={{ cursor: "pointer", display: "inline-block" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: 7,
                        background: "#166534",
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {teamLogoPreview ? "Change Logo" : "Upload Logo"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setTeamLogoFile(file)
                          const reader = new FileReader()
                          reader.onload = () => setTeamLogoPreview(reader.result)
                          reader.readAsDataURL(file)
                        }}
                      />
                    </label>
                    {teamLogoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setTeamLogoFile(null)
                          setTeamLogoPreview("")
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#EF4444",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "4px 6px"
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: "#94A3B8" }}>PNG, JPG or WebP (Square recommended)</span>
                </div>
              </div>
            </div>

            {/* Field 4: Checkbox Same as Captain */}
            <label style={{ display:"flex", alignItems:"center", gap:8, marginBottom: ownerSameAsCaptain ? 14 : 10, cursor:"pointer", padding:"8px 10px", background:"#F8FAF8", borderRadius:8, border:"1px solid #E2E8F0" }}>
              <input
                type="checkbox"
                checked={ownerSameAsCaptain}
                onChange={e => setOwnerSameAsCaptain(e.target.checked)}
                style={{ width:16, height:16, accentColor:"#166534" }}
              />
              <span style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>Owner is same as Captain</span>
            </label>

            {!ownerSameAsCaptain && (
              <div style={{ padding:"12px", background:"#F8FAF8", borderRadius:10, border:"1px solid #E2E8F0", marginBottom:14 }}>
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Owner Name</div>
                <input
                  value={teamOwner}
                  onChange={e => setTeamOwner(e.target.value)}
                  placeholder="e.g. Sahir Attar"
                  style={{ ...iS, marginBottom:10 }}
                />
                <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Owner Mobile Number</div>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value.replace(/[^0-9]/g, "").slice(0,10))}
                  placeholder="10-digit mobile number"
                  style={{ ...iS, marginBottom:4 }}
                />
              </div>
            )}

            {/* Field 5: Starting Purse */}
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Starting Purse (🪙 Coins) *</div>
            <input
              type="number"
              min="0"
              value={teamPurse}
              onChange={e=>setTeamPurse(e.target.value)}
              disabled={!editTeam}
              placeholder="e.g. 100000"
              style={{ ...iS, marginBottom:16, background:!editTeam?"#F1F5F9":iS.background, color:!editTeam?"#64748B":iS.color }}
            />
            {!editTeam && (managingAuction?.points_purse ? <div style={{ fontSize:11, color:"#166534", marginBottom:16, marginTop:-8 }}>Every team starts with this auction's fixed purse — set once when the auction was created.</div> : <div style={{ fontSize:11, color:"#EF4444", marginBottom:16, marginTop:-8 }}>This auction has no default purse set. Set one in the auction's Details tab first.</div>)}
            {editTeam && <div style={{ fontSize:11, color:"#94A3B8", marginBottom:16, marginTop:-8 }}>Note: editing the purse resets the remaining balance to match — only do this before bidding starts.</div>}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowAddTeam(false)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={saveTeam} disabled={busy} style={{ flex:2, padding:"12px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>{busy ? "Saving..." : (editTeam ? "Save Changes" : "Add Team")}</button>
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

      {delAuction && (
        <div style={mStyle} onClick={()=>setDelAuction(null)}>
          <div style={mBox} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:"center", padding:"10px 0 18px" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
              <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Delete this entire auction?</h3>
              <p style={{ color:"#6b7280", fontSize:13, margin:0 }}>This permanently deletes <strong>{delAuction.name}</strong> — including every registered player, team, and bid. This cannot be undone.</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDelAuction(null)} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#F8FAF8", fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={doDeleteAuction} disabled={delAuctionBusy} style={{ flex:1, padding:"12px", borderRadius:9, background:"#EF4444", border:"none", color:"#FFFFFF", fontSize:14, cursor:"pointer", fontWeight:800 }}>{delAuctionBusy ? "Deleting..." : "Yes, Delete Everything"}</button>
            </div>
          </div>
        </div>
      )}

      {viewingTeam && (() => {
        const squad = auctionPlayers
          .filter(p => p.sold_team_id === viewingTeam.id)
          .sort((a,b) => (b.is_captain || b.status === "captain" ? 1 : 0) - (a.is_captain || a.status === "captain" ? 1 : 0))
        const spent = viewingTeam.purse_total - viewingTeam.purse_remaining
        return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 350,
            padding: isMobile ? 0 : 16
          }}
          onClick={()=>setViewingTeam(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: isMobile ? "20px 20px 0 0" : 18,
              width: "100%",
              maxWidth: isMobile ? "100%" : 460,
              maxHeight: isMobile ? "92vh" : "min(88vh, 720px)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #E2E8F0",
              overflow: "hidden"
            }}
            onClick={e=>e.stopPropagation()}
          >
            {/* PINNED HEADER WITH CLOSE BUTTON */}
            <div style={{
              padding: isMobile ? "14px 16px" : "16px 20px",
              borderBottom: "1px solid #F1F5F9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#FFFFFF",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <TeamAv name={viewingTeam.name} logo={viewingTeam.logo_url} size={isMobile ? 40 : 46}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: isMobile ? 16 : 18, color: "#0F172A", fontFamily: "var(--font-head)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {viewingTeam.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, display: "flex", alignItems: "center", gap: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {viewingTeam.captain_name ? (
                      <span>👑 Capt: <strong style={{ color: "#0F172A" }}>{viewingTeam.captain_name}</strong></span>
                    ) : (viewingTeam.owner_name ? (
                      <span>Owner: {viewingTeam.owner_name}</span>
                    ) : (
                      <span>Team Squad</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={()=>setViewingTeam(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  background: "#F1F5F9",
                  color: "#64748B",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: 10
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* SCROLLABLE SQUAD & STATS BODY */}
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px 16px 24px" : "16px 20px 24px", WebkitOverflowScrolling: "touch" }}>
              {/* PURSE CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div style={{ padding: "10px 6px", background: "#F8FAF8", border: "1px solid #E2E8F0", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Starting Purse</div>
                  <div style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 900, fontFamily: "var(--font-head)", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <CoinIcon size={13}/> {Number(viewingTeam.purse_total||0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ padding: "10px 6px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 9.5, color: "#EF4444", fontWeight: 700, textTransform: "uppercase" }}>Spent</div>
                  <div style={{ fontSize: 13.5, color: "#DC2626", fontWeight: 900, fontFamily: "var(--font-head)", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <CoinIcon size={13}/> {Number(spent||0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ padding: "10px 6px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 9.5, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>Remaining</div>
                  <div style={{ fontSize: 13.5, color: "#166534", fontWeight: 900, fontFamily: "var(--font-head)", marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <CoinIcon size={13}/> {Number(viewingTeam.purse_remaining||0).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 16 }}>
                <button
                  onClick={()=>copyLink(`${window.location.origin}/team-view/${managingAuction.auction_code}/${viewingTeam.id}`, `modal-team-${viewingTeam.id}`)}
                  style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFFFFF", color: copiedLink===`modal-team-${viewingTeam.id}` ? "#166534" : "#475569", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                >
                  <LinkIcon size={12}/> {copiedLink===`modal-team-${viewingTeam.id}` ? "Copied!" : "Team Link"}
                </button>
                <button
                  onClick={()=>shareTeamOnWhatsApp(viewingTeam, managingAuction)}
                  style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid #22C55E", background: "#F0FDF4", color: "#166534", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                >
                  <span>📱</span> WhatsApp
                </button>
                <button
                  onClick={()=>exportTeamRosterPdf(viewingTeam, auctionPlayers, managingAuction?.name)}
                  style={{ padding: "8px 6px", borderRadius: 8, border: "1px solid #166534", background: "#166534", color: "#FFFFFF", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                >
                  <span>📄</span> Export PDF
                </button>
              </div>

              {/* SQUAD HEADER */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 800, fontFamily: "var(--font-head)" }}>
                  Squad ({squad.length}/9 Players)
                </div>
                {squad.length > 0 && (
                  <button
                    onClick={()=>exportTeamRosterCsv(viewingTeam, auctionPlayers, managingAuction?.name)}
                    style={{ background: "none", border: "none", color: "#166534", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 }}
                  >
                    Download CSV
                  </button>
                )}
              </div>

              {/* SQUAD PLAYERS LIST */}
              {squad.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", padding: "16px 0" }}>No players in squad yet.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {squad.map((p, idx) => {
                    const isCap = p.is_captain || p.status === "captain"
                    return (
                      <div
                        key={p.id}
                        onClick={()=>{ setViewingTeam(null); setViewingPlayer(p) }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 10px",
                          background: isCap ? "rgba(184,134,11,0.06)" : "#F8FAF8",
                          border: isCap ? "1px solid rgba(184,134,11,0.3)" : "1px solid #F1F5F9",
                          borderRadius: 10,
                          cursor: "pointer"
                        }}
                      >
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: "#94A3B8", width: 18, textAlign: "center", flexShrink: 0 }}>
                          #{idx + 1}
                        </span>
                        {p.profile_image_url ? (
                          <img src={p.profile_image_url} alt={p.name} style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}/>
                        ) : (
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#64748B", flexShrink: 0 }}>{(p.name||"?")[0]}</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                            {isCap && <span style={{ fontSize: 9, fontWeight: 800, background: "#B8860B", color: "#FFFFFF", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>👑 CAPTAIN</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>{p.playing_role || "—"}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: isCap ? "#B8860B" : "#166534", fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                          {isCap ? (
                            <><CoinIcon size={12}/> 0 (Captain)</>
                          ) : (
                            <><CoinIcon size={12}/> {Number(p.sold_price || 0).toLocaleString("en-IN")}</>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        )
      })()}

      {showExportPoolModal && (() => {
        const poolPlayers = auctionPlayers.filter(p => !p.is_captain && p.status !== "captain" && p.status !== "waitlist" && p.payment_status !== "waitlist" && p.status !== "dropped")
        const q = exportPoolSearch.trim().toLowerCase()
        const filtered = poolPlayers.filter(p => {
          if (exportPoolRoleFilter && !((p.playing_role || "").toLowerCase().includes(exportPoolRoleFilter.toLowerCase()))) return false
          if (q && !p.name.toLowerCase().includes(q) && !(p.city || "").toLowerCase().includes(q)) return false
          return true
        })

        const rolesList = [
          { key: "", label: `All (${poolPlayers.length})` },
          { key: "all", label: "🏏 All-rounders" },
          { key: "bat", label: "⚡ Batsmen" },
          { key: "bowl", label: "🎯 Bowlers" },
          { key: "keep", label: "🧤 Keepers" },
        ]

        return (
          <div style={mStyle} onClick={() => setShowExportPoolModal(false)}>
            <div style={{ ...mBox, maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, borderBottom: "1.5px solid #F1F5F9", paddingBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                      Export Auction Player Pool for Captains
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 800, background: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: 999 }}>
                      {poolPlayers.length} Players
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 1.4 }}>
                    Official dossier for franchise captains to analyze bidding targets before the auction. Mobile numbers are completely hidden for player privacy.
                  </div>
                </div>
                <button onClick={() => setShowExportPoolModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94A3B8", padding: 0 }}>×</button>
              </div>

              <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 10, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "#92400E" }}>
                <span>🔒</span>
                <span><strong>Player Privacy Protected:</strong> Only Player Full Name, Photo, Playing Role, City, and Base Price are exported. Contact numbers are completely removed.</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => exportAuctionPoolPdf(managingAuction, poolPlayers)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #166534",
                    background: "#166534",
                    color: "#FFFFFF",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    boxShadow: "0 2px 8px rgba(22,101,52,0.2)"
                  }}
                >
                  <span style={{ fontSize: 18 }}>🖨️</span>
                  <span>Print / Save PDF</span>
                  <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>Includes Photos & Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportAuctionPoolCsv(managingAuction, poolPlayers)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #CBD5E1",
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: 18 }}>📊</span>
                  <span>Download Excel/CSV</span>
                  <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>Spreadsheet Roster</span>
                </button>

                <button
                  type="button"
                  onClick={() => shareAuctionPoolOnWhatsApp(managingAuction, poolPlayers)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid #22C55E",
                    background: "#22C55E",
                    color: "#FFFFFF",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    boxShadow: "0 2px 8px rgba(34,197,94,0.2)"
                  }}
                >
                  <span style={{ fontSize: 18 }}>💬</span>
                  <span>Share to WhatsApp</span>
                  <span style={{ fontSize: 10, opacity: 0.9, fontWeight: 600 }}>Ready-to-send format</span>
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
                  Player Roster Preview ({filtered.length} of {poolPlayers.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const text = generateAuctionPoolWhatsAppText(managingAuction, poolPlayers)
                    navigator.clipboard?.writeText(text)
                    setCopiedPoolWa(true)
                    setTimeout(() => setCopiedPoolWa(false), 2500)
                  }}
                  style={{
                    background: "none",
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: copiedPoolWa ? "#166534" : "#475569",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5
                  }}
                >
                  {copiedPoolWa ? "✅ Copied WhatsApp Text!" : "📋 Copy WhatsApp Text"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
                  <SearchIcon size={14} color="#94A3B8" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    value={exportPoolSearch}
                    onChange={e => setExportPoolSearch(e.target.value)}
                    placeholder="Search by name or city..."
                    style={{
                      width: "100%",
                      padding: "8px 10px 8px 30px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12,
                      background: "#FFFFFF",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2 }}>
                  {rolesList.map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setExportPoolRoleFilter(r.key)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: exportPoolRoleFilter === r.key ? "1.5px solid #166534" : "1px solid #E2E8F0",
                        background: exportPoolRoleFilter === r.key ? "#DCFCE7" : "#FFFFFF",
                        color: exportPoolRoleFilter === r.key ? "#166534" : "#64748B",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: 8, paddingRight: 4, maxHeight: 300 }}>
                {filtered.map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: "#F8FAF8",
                      borderRadius: 10,
                      border: "1px solid #E2E8F0"
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", width: 24, textAlign: "center" }}>
                      #{idx + 1}
                    </span>
                    {p.profile_image_url ? (
                      <img
                        src={p.profile_image_url}
                        alt={p.name}
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #E2E8F0" }}
                      />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#166534", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {(p.name || "?")[0]}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                        <span style={{ fontWeight: 700, color: "#166534" }}>{p.playing_role || "Player"}</span>
                        <span>·</span>
                        <span>📍 {p.city || "Pune"}</span>
                        {p.category && (
                          <>
                            <span>·</span>
                            <span>{p.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)" }}>
                        🪙 {Number(p.base_price || 0).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: 9.5, color: "#94A3B8" }}>Base Price</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowExportPoolModal(false)}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {viewingPlayer && (() => {
        const isDropped = viewingPlayer.status === "dropped"
        const isWaitlist = viewingPlayer.status === "waitlist" || viewingPlayer.payment_status === "waitlist"
        const isPaid = viewingPlayer.payment_status === "paid"
        const isPending = viewingPlayer.payment_status === "pending"
        const joinedAuctions = playerHistory.length
        const joinedTeams = playerHistory.filter(h => h.status === "sold" && h.sold_team_id).length

        return (
          <div style={mStyle} onClick={()=>setViewingPlayer(null)}>
            <div
              style={{
                ...mBox,
                maxWidth: isMobile ? "100%" : 680,
                maxHeight: isMobile ? "92vh" : "88vh",
                padding: isMobile ? "16px 14px" : "18px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
              onClick={e=>e.stopPropagation()}
            >
              {/* Header Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  {viewingPlayer.profile_image_url ? (
                    <img
                      src={viewingPlayer.profile_image_url}
                      alt={viewingPlayer.name}
                      style={{ width: 50, height: 50, borderRadius: 12, objectFit: "cover", border: "2px solid #166534", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                    />
                  ) : (
                    <div style={{ width: 50, height: 50, borderRadius: 12, background: "#DCFCE7", border: "2px solid #166534", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)" }}>{(viewingPlayer.name||"?")[0]}</div>
                      {viewingPlayer.jersey_number && <div style={{ fontSize: 9.5, fontWeight: 800, color: "#166534" }}>#{viewingPlayer.jersey_number}</div>}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {viewingPlayer.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Phone size={11}/> {viewingPlayer.phone}</span>
                      {viewingPlayer.city && <span>· 📍 {viewingPlayer.city}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                      {viewingPlayer.playing_role && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#166534", background: "#DCFCE7", padding: "2px 7px", borderRadius: 999 }}>
                          {viewingPlayer.playing_role}
                        </span>
                      )}
                      {viewingPlayer.jersey_number && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", background: "#F1F5F9", padding: "2px 7px", borderRadius: 999 }}>
                          Jersey #{viewingPlayer.jersey_number}{viewingPlayer.jersey_size ? ` (${viewingPlayer.jersey_size})` : ""}
                        </span>
                      )}
                      {viewingPlayer.category && (
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#B8860B", background: "rgba(246,196,83,0.18)", padding: "2px 7px", borderRadius: 999 }}>
                          {viewingPlayer.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {isDropped ? (
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", background: "#FEE2E2", border: "1px solid #FCA5A5", padding: "4px 8px", borderRadius: 8 }}>
                      🚫 Dropped
                    </span>
                  ) : isWaitlist ? (
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#B45309", background: "#FEF3C7", border: "1px solid #FDE68A", padding: "4px 8px", borderRadius: 8 }}>
                      ⏳ Waitlist
                    </span>
                  ) : viewingPlayer.status === "sold" ? (
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#166534", background: "#DCFCE7", border: "1px solid #86EFAC", padding: "4px 8px", borderRadius: 8 }}>
                      ✓ Sold
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#166534", background: "rgba(34,197,94,0.12)", padding: "4px 8px", borderRadius: 8 }}>
                      ✓ Confirmed Pool
                    </span>
                  )}
                  <button onClick={()=>setViewingPlayer(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#94A3B8", lineHeight:1, padding:0 }}>×</button>
                </div>
              </div>

              {/* Two-Column Responsive Body */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr", gap: 12, overflowY: "auto", flex: 1, paddingRight: isMobile ? 0 : 2 }}>
                {/* Left Column: Player Bio & Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Bio Stats Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div style={{ padding: "6px 9px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                      <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>DOB</div>
                      <div style={{ fontSize: 11.5, color: "#0F172A", fontWeight: 700, marginTop: 1 }}>{viewingPlayer.birth_date ? fmtDate(viewingPlayer.birth_date) : "—"}</div>
                    </div>
                    <div style={{ padding: "6px 9px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                      <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Playing Role</div>
                      <div style={{ fontSize: 11.5, color: "#0F172A", fontWeight: 700, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{viewingPlayer.playing_role || "—"}</div>
                    </div>
                    <div style={{ padding: "6px 9px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                      <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Jersey Spec</div>
                      <div style={{ fontSize: 11.5, color: "#0F172A", fontWeight: 700, marginTop: 1 }}>#{viewingPlayer.jersey_number || "—"} · {viewingPlayer.jersey_size || "—"}</div>
                    </div>
                    <div style={{ padding: "6px 9px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8 }}>
                      <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Status / Bid</div>
                      <div style={{ fontSize: 11.5, color: "#0F172A", fontWeight: 700, marginTop: 1, textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {viewingPlayer.status === "sold" && viewingPlayer.sold_price ? `Sold 🪙 ${Number(viewingPlayer.sold_price).toLocaleString("en-IN")}` : viewingPlayer.status}
                      </div>
                    </div>
                  </div>

                  {/* Base Price Single Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 9 }}>
                    <span style={{ fontSize: 11.5, color: "#166534", fontWeight: 800 }}>Base Price 🪙</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="number"
                        min="0"
                        value={priceDrafts[viewingPlayer.id] !== undefined ? priceDrafts[viewingPlayer.id] : (viewingPlayer.base_price ?? "")}
                        onChange={e=>setPriceDrafts({...priceDrafts, [viewingPlayer.id]: e.target.value})}
                        onBlur={()=>savePrice(viewingPlayer.id)}
                        placeholder="0"
                        style={{ width: 95, padding: "5px 8px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, fontWeight: 800, color: "#0F172A", textAlign: "right", outline: "none", background: "#FFFFFF" }}
                      />
                    </div>
                  </div>

                  {/* Mini History Pill */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: "#F1F5F9", borderRadius: 8, fontSize: 11, color: "#475569", fontWeight: 700 }}>
                    <span>Experience</span>
                    <span>🏏 {loadingPlayerHistory ? "…" : joinedAuctions} Auction{joinedAuctions !== 1 ? "s" : ""} · 🏆 {joinedTeams} Team{joinedTeams !== 1 ? "s" : ""}</span>
                  </div>

                  {playerHistory.length > 1 && (
                    <div style={{ display: "grid", gap: 4, maxHeight: 60, overflowY: "auto" }}>
                      {playerHistory.slice(0, 3).map(h => (
                        <div key={h.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, padding: "4px 8px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 6 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#0F172A", fontWeight: 600 }}>{h.auctions?.name || "Tournament"}</span>
                          <span style={{ color: h.status === "sold" ? "#166534" : "#94A3B8", fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>
                            {h.status === "sold" ? `Sold 🪙 ${Number(h.sold_price).toLocaleString("en-IN")}` : (h.status || "Registered")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
                    {isDropped ? (
                      <button
                        type="button"
                        onClick={() => restorePlayer(viewingPlayer)}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                      >
                        <CheckCircle2 size={13}/> Restore to Pool
                      </button>
                    ) : isWaitlist ? (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Promote ${viewingPlayer.name} to Confirmed Auction Pool?`)) return
                          try {
                            await updateAuctionPlayerStatus(viewingPlayer.id, "registered", "pending")
                            setViewingPlayer(p => ({ ...p, status: "registered", payment_status: "pending" }))
                            setAuctionPlayers(list => list.map(x => x.id === viewingPlayer.id ? { ...x, status: "registered", payment_status: "pending" } : x))
                          } catch(err) { alert(err.message) }
                        }}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                      >
                        Promote to Pool ➔
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => tagDropped(viewingPlayer)}
                        style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "#FEF3C7", border: "1.5px solid #FDE68A", color: "#B45309", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                      >
                        <Ban size={13}/> Tag as Dropped
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePlayer(viewingPlayer)}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                      title="Permanently delete player record"
                    >
                      <Trash2 size={13}/> Delete
                    </button>
                  </div>
                </div>

                {/* Right Column: Payment Status & Receipt Preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#F8FAF8", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Payment & Fee Status
                  </div>

                  {isDropped ? (
                    <div style={{ padding: "8px 10px", background: "#FEF3C7", border: "1.5px solid #FDE68A", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#B45309", display: "flex", alignItems: "center", gap: 5 }}>
                        ↩️ Fee Refunded
                      </div>
                      <div style={{ fontSize: 10.5, color: "#78350F", marginTop: 2, lineHeight: 1.3 }}>
                        Organizer has refunded the registration fee. Player is withdrawn from pool.
                      </div>
                    </div>
                  ) : isWaitlist ? (
                    <div style={{ padding: "8px 10px", background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#B45309" }}>
                        ⏳ Waiting List
                      </div>
                      <div style={{ fontSize: 10.5, color: "#78350F", marginTop: 2 }}>
                        Registered after 45-player cap. No fee collected.
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "8px 10px", background: isPaid ? "rgba(34,197,94,0.1)" : isPending ? "rgba(245,158,11,0.1)" : "#FFFFFF", border: isPaid ? "1.5px solid #166534" : isPending ? "1.5px solid #F59E0B" : "1px solid #CBD5E1", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: isPaid ? "#166534" : isPending ? "#B45309" : "#0F172A" }}>
                          {isPaid ? "✓ Fee Paid & Approved" : isPending ? "⏳ Pending Verification" : (viewingPlayer.payment_status || "Free Entry")}
                        </div>
                      </div>
                      {isPending && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateAuctionPlayerPaymentStatus(viewingPlayer.id, "paid")
                              setViewingPlayer(p => ({ ...p, payment_status: "paid" }))
                              setAuctionPlayers(list => list.map(x => x.id === viewingPlayer.id ? { ...x, payment_status: "paid" } : x))
                            } catch(err) { alert(err.message) }
                          }}
                          style={{ padding: "5px 10px", borderRadius: 6, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)", whiteSpace: "nowrap" }}
                        >
                          ✓ Approve
                        </button>
                      )}
                      {isPaid && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateAuctionPlayerPaymentStatus(viewingPlayer.id, "pending")
                              setViewingPlayer(p => ({ ...p, payment_status: "pending" }))
                              setAuctionPlayers(list => list.map(x => x.id === viewingPlayer.id ? { ...x, payment_status: "pending" } : x))
                            } catch(err) { alert(err.message) }
                          }}
                          style={{ padding: "3px 8px", borderRadius: 6, background: "#FFFFFF", border: "1px solid #CBD5E1", color: "#64748B", fontSize: 10, cursor: "pointer" }}
                        >
                          Mark Pending
                        </button>
                      )}
                    </div>
                  )}

                  {/* Payment Receipt Image Thumbnail */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>Payment Receipt</span>
                      {viewingPlayer.payment_screenshot_url && (
                        <button
                          type="button"
                          onClick={()=>setReceiptModalImg(viewingPlayer.payment_screenshot_url)}
                          style={{ background: "none", border: "none", color: "#166534", fontSize: 10.5, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline" }}
                        >
                          Enlarge View ↗
                        </button>
                      )}
                    </div>
                    {viewingPlayer.payment_screenshot_url ? (
                      <div
                        onClick={()=>setReceiptModalImg(viewingPlayer.payment_screenshot_url)}
                        style={{ width: "100%", height: 115, borderRadius: 8, background: "#FFFFFF", border: "1.5px solid #CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative" }}
                        title="Click to view full receipt"
                      >
                        <img
                          src={viewingPlayer.payment_screenshot_url}
                          alt="Receipt"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: 60, borderRadius: 8, background: "#FFFFFF", border: "1px dashed #CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 11 }}>
                        No receipt uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {receiptModalImg && (
        <div style={mStyle} onClick={()=>setReceiptModalImg(null)}>
          <div style={{ ...mBox, maxWidth:isMobile?"100%":480, textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>Payment Screenshot</h3>
              <button onClick={()=>setReceiptModalImg(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
            </div>
            <img src={receiptModalImg} alt="Payment Receipt" style={{ width:"100%", maxHeight:"65vh", objectFit:"contain", borderRadius:12, background:"#0F172A", marginBottom:14 }}/>
            <div style={{ display:"flex", gap:10 }}>
              <a href={receiptModalImg} target="_blank" rel="noreferrer" style={{ flex:1, padding:"11px", borderRadius:8, background:"#166534", color:"#FFFFFF", textDecoration:"none", fontSize:13, fontWeight:700, textAlign:"center" }}>Open Full Image ↗</a>
              <button onClick={()=>setReceiptModalImg(null)} style={{ flex:1, padding:"11px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#FFFFFF", fontSize:13, cursor:"pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editingAuctionDateTime && (
        <EditAuctionDateTimeModal
          auction={editingAuctionDateTime}
          onClose={() => setEditingAuctionDateTime(null)}
          onUpdated={(updated) => {
            setAllAuctions(prev => prev.map(x => x.id === updated.id ? { ...x, ...updated } : x))
            if (managingAuction?.id === updated.id) {
              setManagingAuction(prev => ({ ...prev, ...updated }))
            }
          }}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}

function GroundsPage({ grounds, matches, onRefresh, isMobile }) {
  const [activeTab, setActiveTab] = useState("venues") // "venues" | "bookings"
  const [selectedGroundForBooking, setSelectedGroundForBooking] = useState(null)
  const [showAdd,setShowAdd]=useState(false)
  const [editG,setEditG]=useState(null)
  const [delG,setDelG]=useState(null)
  const [selectedId,setSelectedId]=useState(null)
  const [busy,setBusy]=useState(false)
  const [search,setSearch]=useState("")
  const [sortBy,setSortBy]=useState("name")
  const [sortOpen,setSortOpen]=useState(false)
  const [openMenuId,setOpenMenuId]=useState(null)
  const empty={name:"",location:"",maps_link:"",notes:""}
  const [form,setForm]=useState(empty)
  const [editForm,setEditForm]=useState(empty)
  const selectedGround=grounds.find(g=>g.id===selectedId)||null
  const iS={width:"100%",padding:"11px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",boxSizing:"border-box",fontFamily:"var(--font-body)"}
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

  // Real per-ground stats derived from actual match history — grounds have no
  // capacity/status/booking-calendar fields in the schema, so we only show
  // what's genuinely trackable: how many matches have used this ground, and
  // the next upcoming one (if any).
  const todayStr = new Date().toISOString().split("T")[0]
  const matchCountByGround = {}
  const nextMatchByGround = {}
  matches.forEach(m => {
    if (!m.ground) return
    matchCountByGround[m.ground] = (matchCountByGround[m.ground]||0) + 1
    if (m.status === "upcoming" && m.date >= todayStr) {
      const cur = nextMatchByGround[m.ground]
      if (!cur || m.date < cur.date) nextMatchByGround[m.ground] = m
    }
  })
  const totalMatchAppearances = Object.values(matchCountByGround).reduce((a,b)=>a+b,0)
  const groundsWithUpcoming = Object.keys(nextMatchByGround).length

  const q = search.trim().toLowerCase()
  const filtered = grounds.filter(g => !q || g.name.toLowerCase().includes(q) || (g.location||"").toLowerCase().includes(q))
  const sortedGrounds = [...filtered].sort((a,b) => {
    if (sortBy==="matches") return (matchCountByGround[b.name]||0) - (matchCountByGround[a.name]||0)
    return (a.name||"").localeCompare(b.name||"")
  })

  return (
    <div>
      {/* Top Grounds Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, borderBottom: "1px solid #E2E8F0", paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => { setActiveTab("venues"); setSelectedGroundForBooking(null) }}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: activeTab === "venues" ? "1.5px solid #166534" : "1.5px solid #E2E8F0",
            background: activeTab === "venues" ? "#DCFCE7" : "#FFFFFF",
            color: activeTab === "venues" ? "#166534" : "#64748B",
            fontSize: 13,
            fontWeight: activeTab === "venues" ? 800 : 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 150ms ease"
          }}
        >
          <MapPin size={15} /> Venues &amp; Grounds ({grounds.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: activeTab === "bookings" ? "1.5px solid #166534" : "1.5px solid #E2E8F0",
            background: activeTab === "bookings" ? "#DCFCE7" : "#FFFFFF",
            color: activeTab === "bookings" ? "#166534" : "#64748B",
            fontSize: 13,
            fontWeight: activeTab === "bookings" ? 800 : 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 150ms ease"
          }}
        >
          <Calendar size={15} /> 📅 Slot Diary &amp; Bookings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("owners")}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: activeTab === "owners" ? "1.5px solid #166534" : "1.5px solid #E2E8F0",
            background: activeTab === "owners" ? "#DCFCE7" : "#FFFFFF",
            color: activeTab === "owners" ? "#166534" : "#64748B",
            fontSize: 13,
            fontWeight: activeTab === "owners" ? 800 : 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 150ms ease"
          }}
        >
          <ShieldCheck size={15} /> 👥 Ground Owner Logins
        </button>
      </div>

      {activeTab === "bookings" ? (
        <GroundBookingsSection grounds={grounds} initialGroundId={selectedGroundForBooking} isMobile={isMobile} />
      ) : activeTab === "owners" ? (
        <GroundOwnersManagement grounds={grounds} isMobile={isMobile} />
      ) : (
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:12}}>
            <div>
              <h2 style={{color:"#0F172A",fontSize:isMobile?20:26,fontWeight:900,margin:0,fontFamily:"var(--font-head)"}}>Grounds</h2>
              <div style={{fontSize:13,color:"#64748B",marginTop:4}}>Manage all grounds and venues</div>
            </div>
            <button onClick={()=>{setForm(empty);setShowAdd(true)}} style={{padding:"10px 16px",borderRadius:12,background:"#166534",border:"none",color:"#FFFFFF",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:6,flexShrink:0,whiteSpace:"nowrap"}}><Plus size={15}/> Add Ground</button>
          </div>

      {/* Search + Sort */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:200,position:"relative"}}>
          <SearchIcon size={16} color="#94A3B8" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search grounds by name or location..." style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:12,border:"1.5px solid #E2E8F0",fontSize:13,outline:"none",background:"#FFFFFF",boxSizing:"border-box",fontFamily:"var(--font-body)"}}/>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setSortOpen(o=>!o)} style={{padding:"12px 16px",borderRadius:12,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}><ArrowUpDown size={14}/> Sort</button>
          {sortOpen && (
            <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:150,overflow:"hidden"}}>
              {[["name","Name (A-Z)"],["matches","Most Matches"]].map(([k,label])=>(
                <button key={k} onClick={()=>{setSortBy(k);setSortOpen(false)}} style={{width:"100%",padding:"10px 14px",border:"none",background:sortBy===k?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",fontWeight:sortBy===k?700:500}}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat row */}
      <div style={{display:"flex",background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:16,marginBottom:20,overflow:"hidden",flexWrap:"wrap"}}>
        {[
          {icon:MapPin, v:grounds.length, label:"Total Grounds"},
          {icon:Calendar, v:totalMatchAppearances, label:"Match Appearances"},
          {icon:CheckCircle2, v:groundsWithUpcoming, label:"With Upcoming Match"},
        ].map((c,i)=>(
          <div key={i} style={{flex:"1 1 33%", minWidth:150, padding:"18px 16px", display:"flex", alignItems:"center", gap:12, borderRight:i<2?"1px solid #F1F5F9":"none"}}>
            <c.icon size={20} color="#166534"/>
            <div>
              <div style={{fontSize:isMobile?18:22,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1}}>{c.v}</div>
              <div style={{fontSize:11,color:"#64748B",marginTop:2}}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {sortedGrounds.length===0 ? (
        <Card style={{padding:"40px 24px",textAlign:"center"}}>
          <div style={{color:"#6b7280",fontSize:13}}>No grounds match your search.</div>
        </Card>
      ) : (
        <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #E2E8F0"}}>
          {!isMobile && (
            <div style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#F8FAF8",borderBottom:"1px solid #E2E8F0",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.4}}>
              <div style={{flex:1}}>Ground</div>
              <div style={{width:80,textAlign:"center"}}>Matches</div>
              <div style={{width:160,textAlign:"right"}}>Next Match</div>
              <div style={{width:36}}/>
            </div>
          )}
          {sortedGrounds.map((g,i) => {
            const next = nextMatchByGround[g.name]
            return (
            <div key={g.id} onClick={()=>setSelectedId(id=>id===g.id?null:g.id)} style={{display:"flex",alignItems:"center",padding:"14px 16px",background:selectedId===g.id?"rgba(34,197,94,0.05)":"#FFFFFF",borderTop:i===0?"none":"1px solid #F1F5F9",cursor:"pointer",flexWrap:isMobile?"wrap":"nowrap",gap:isMobile?10:0}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                <div style={{width:40,height:40,borderRadius:10,background:"rgba(34,197,94,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><MapPin size={18} color="#166534"/></div>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>{g.name}</div>
                  <div style={{fontSize:12,color:"#64748B",marginTop:2}}>{g.location}</div>
                </div>
              </div>
              <div style={{width:isMobile?"auto":80,textAlign:"center",fontSize:14,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>{matchCountByGround[g.name]||0}{isMobile && <span style={{fontSize:10,color:"#94A3B8",fontWeight:500}}> matches</span>}</div>
              <div style={{width:isMobile?"auto":160,textAlign:"right",fontSize:12,color:next?"#166534":"#94A3B8",fontWeight:next?700:500}}>
                {next ? `${fmtDate(next.date)} · ${next.time_slot}` : "No upcoming match"}
              </div>
              <div style={{width:36,display:"flex",justifyContent:"flex-end",position:"relative"}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setOpenMenuId(id=>id===g.id?null:g.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}><MoreVertical size={16} color="#94A3B8"/></button>
                {openMenuId===g.id && (
                  <div style={{position:"absolute",top:"100%",right:0,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:150,overflow:"hidden"}}>
                    {g.maps_link && <a href={g.maps_link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"block",width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",textDecoration:"none"}}>View on Map</a>}
                    <button onClick={()=>{setSelectedGroundForBooking(g.id);setActiveTab("bookings");setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#166534",cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:6,borderTop:"1px solid #F1F5F9"}}>📅 Slot Diary</button>
                    <button onClick={()=>{setEditG(g);setEditForm({name:g.name,location:g.location,maps_link:g.maps_link||"",notes:g.notes||""});setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",borderTop:"1px solid #F1F5F9"}}>Edit</button>
                    <button onClick={()=>{setDelG(g);setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#EF4444",cursor:"pointer",borderTop:"1px solid #F1F5F9"}}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      )}

      {selectedGround && (
        <div style={{marginTop:16}}>
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"18px",border:"2px solid #166534"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:"#F8FAF8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"2px solid #6ee7b7"}}><MapPin size={24} color="#166534"/></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:17,color:"#0F172A",fontFamily:"var(--font-head)"}}>{selectedGround.name}</div>
                <div style={{fontSize:13,color:"#6b7280",marginTop:3,display:"flex",alignItems:"center",gap:5}}><MapPin size={13}/> {selectedGround.location}</div>
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
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <button onClick={()=>{setSelectedGroundForBooking(selectedGround.id);setActiveTab("bookings")}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #86efac",background:"#DCFCE7",color:"#166534",fontSize:13,cursor:"pointer",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>📅 Bookings</button>
              <button onClick={()=>{setEditG(selectedGround);setEditForm({name:selectedGround.name,location:selectedGround.location,maps_link:selectedGround.maps_link||"",notes:selectedGround.notes||""})}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #dbeafe",background:"#F5E6C8",color:"#7A4F13",fontSize:13,cursor:"pointer",fontWeight:700}}>✏️ Edit</button>
              <button onClick={()=>setDelG(selectedGround)} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#991b1b",fontSize:13,cursor:"pointer",fontWeight:700}}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}
      {showAdd&&<div style={mStyle}><div style={mBox}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Add Ground</h3><button onClick={()=>setShowAdd(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div><GForm f={form} setF={setForm}/><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={addSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Adding...":"Add Ground"}</button></div></div></div>}
      {editG&&<div style={mStyle}><div style={mBox}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:16,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Edit Ground</h3><button onClick={()=>setEditG(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af"}}>×</button></div><GForm f={editForm} setF={setEditForm}/><div style={{display:"flex",gap:10,marginTop:18}}><button onClick={()=>setEditG(null)} style={{flex:1,padding:"12px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={editSubmit} disabled={busy} style={{flex:2,padding:"12px",borderRadius:9,background:"#FFFFFF",border:"none",color:"#0F172A",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"Saving...":"Save"}</button></div></div></div>}
      {delG&&<div style={mStyle}><div style={{...mBox,maxWidth:360}}><div style={{textAlign:"center",padding:"10px 0 18px"}}><div style={{fontSize:40,marginBottom:12}}>⚠️</div><h3 style={{margin:"0 0 8px",fontSize:17,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>Delete Ground?</h3><p style={{color:"#6b7280",fontSize:13,margin:0}}>Delete <strong>{delG.name}</strong>?</p></div><div style={{display:"flex",gap:10}}><button onClick={()=>setDelG(null)} style={{flex:1,padding:"13px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#F8FAF8",fontSize:14,cursor:"pointer"}}>Cancel</button><button onClick={delSubmit} disabled={busy} style={{flex:1,padding:"13px",borderRadius:9,background:"#fee2e2",border:"1.5px solid #fecaca",color:"#991b1b",fontSize:14,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)"}}>{busy?"...":"Yes, Delete"}</button></div></div></div>}
        </>
      )}
    </div>
  )
}


// ── Ground Owners Management (Admin Component) ──────────────────────────────
function GroundOwnersManagement({ grounds = [], isMobile = false }) {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingOwner, setEditingOwner] = useState(null)
  const [delOwner, setDelOwner] = useState(null)
  const [busy, setBusy] = useState(false)
  const empty = { name: "", phone: "", pin: "", ground_id: grounds[0]?.id || "all" }
  const [form, setForm] = useState(empty)
  const [showPins, setShowPins] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchGroundOwners()
      setOwners(data || [])
    } catch (e) {
      console.error("Error loading ground owners:", e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleOpenAdd = () => {
    setEditingOwner(null)
    setForm({ name: "", phone: "", pin: "", ground_id: grounds[0]?.id || "all" })
    setShowAdd(true)
  }

  const handleOpenEdit = (owner) => {
    setEditingOwner(owner)
    setForm({
      name: owner.name || "",
      phone: owner.phone || "",
      pin: owner.pin || "",
      ground_id: owner.ground_id || "all"
    })
    setShowAdd(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { alert("Please enter ground owner name"); return }
    const cleanPhone = (form.phone || "").replace(/[^0-9]/g, "").slice(-10)
    if (cleanPhone.length !== 10) { alert("Please enter a valid 10-digit mobile number"); return }
    const cleanPin = String(form.pin || "").trim()
    if (cleanPin.length !== 4) { alert("Please enter a 4-digit PIN"); return }

    const selGround = grounds.find(g => String(g.id) === String(form.ground_id))
    const groundName = form.ground_id === "all" ? "All Grounds" : (selGround?.name || "Assigned Ground")

    setBusy(true)
    try {
      await saveGroundOwner({
        id: editingOwner?.id,
        name: form.name.trim(),
        phone: cleanPhone,
        pin: cleanPin,
        ground_id: form.ground_id,
        ground_name: groundName,
        active: true
      })
      setShowAdd(false)
      setEditingOwner(null)
      setForm(empty)
      await load()
    } catch (err) {
      alert(err.message)
    }
    setBusy(false)
  }

  const handleDelete = async () => {
    if (!delOwner) return
    setBusy(true)
    try {
      await deleteGroundOwner(delOwner.id)
      setDelOwner(null)
      await load()
    } catch (err) {
      alert(err.message)
    }
    setBusy(false)
  }

  const handleSendCredentials = (owner) => {
    const text = waGroundOwnerCredentials(owner)
    const cleanPhone = (owner.phone || "").replace(/[^0-9]/g, "").slice(-10)
    const url = "https://wa.me/91" + cleanPhone + "?text=" + encodeURIComponent(text)
    window.open(url, "_blank")
  }

  const iS = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13.5, outline: "none", background: "#FFFFFF", boxSizing: "border-box", fontFamily: "var(--font-body)" }
  const lS = { display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 5 }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ color: "#0F172A", fontSize: isMobile ? 20 : 24, fontWeight: 900, margin: 0, fontFamily: "var(--font-head)" }}>
              Ground Owner Logins
            </h2>
            <span style={{ fontSize: 11, background: "rgba(22,101,52,0.12)", color: "#166534", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
              {owners.length} Accounts
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Create separate login credentials for ground owners so they can manage slot bookings online.
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            background: "#166534",
            border: "none",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-head)",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Plus size={15} /> Add Ground Owner
        </button>
      </div>

      {loading ? (
        <Card style={{ padding: "40px", textAlign: "center" }}><Spinner /></Card>
      ) : owners.length === 0 ? (
        <Card style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(22,101,52,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <ShieldCheck size={28} color="#166534" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)" }}>
            No Ground Owner Accounts Yet
          </div>
          <p style={{ fontSize: 13, color: "#64748B", maxWidth: 380, margin: "6px auto 16px" }}>
            Add your ground partners and owners so they can log in via mobile and 4-digit PIN to track bookings and share confirmation slips.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{ padding: "10px 18px", borderRadius: 10, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            <Plus size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Add First Ground Owner
          </button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {owners.map(o => {
            const isPinVisible = showPins[o.id]
            return (
              <div
                key={o.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 14,
                  border: "1px solid #E2E8F0",
                  padding: "16px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.04)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={20} color="#166534" />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>{o.name}</span>
                      <span style={{ fontSize: 11, background: "#F1F5F9", color: "#475569", padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>
                        {o.ground_name || "Assigned Ground"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 12.5, color: "#64748B" }}>
                      <span>📱 +91 <strong>{o.phone}</strong></span>
                      <span>
                        PIN: <strong style={{ letterSpacing: isPinVisible ? 1 : 2, fontFamily: "monospace" }}>{isPinVisible ? o.pin : "••••"}</strong>
                        <button
                          type="button"
                          onClick={() => setShowPins(p => ({ ...p, [o.id]: !p[o.id] }))}
                          style={{ background: "none", border: "none", color: "#166534", fontSize: 11, fontWeight: 700, cursor: "pointer", marginLeft: 4 }}
                        >
                          {isPinVisible ? "Hide" : "Show"}
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleSendCredentials(o)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 9,
                      background: "#DCFCE7",
                      border: "1px solid #86EFAC",
                      color: "#166534",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5
                    }}
                    title="Send Login Credentials to Ground Owner on WhatsApp"
                  >
                    <span>📲 Send WhatsApp PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(o)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 9,
                      background: "#F8FAF8",
                      border: "1px solid #E2E8F0",
                      color: "#475569",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setDelOwner(o)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 9,
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      color: "#DC2626",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Ground Owner Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 18, width: "100%", maxWidth: 440, padding: "24px 22px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                {editingOwner ? "Edit Ground Owner" : "Add Ground Owner Login"}
              </div>
              <button type="button" onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 22, color: "#94A3B8", cursor: "pointer" }}>×</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={lS}>Ground Owner / Manager Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Farhan Pathan" style={iS} required />
              </div>

              <div>
                <label style={lS}>10-Digit Mobile Number *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ padding: "10px 12px", background: "#F1F5F9", borderRadius: 9, fontSize: 13, fontWeight: 700, color: "#475569" }}>+91</div>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })} placeholder="10-digit mobile" style={{ ...iS, flex: 1 }} required />
                </div>
              </div>

              <div>
                <label style={lS}>4-Digit Login PIN *</label>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })} placeholder="e.g. 1234" style={{ ...iS, letterSpacing: 4, textAlign: "center", fontSize: 16, fontWeight: 800 }} required />
              </div>

              <div>
                <label style={lS}>Assigned Ground / Turf</label>
                <select value={form.ground_id} onChange={e => setForm({ ...form, ground_id: e.target.value })} style={iS}>
                  <option value="all">All Grounds (Full Access)</option>
                  {grounds.map(g => (
                    <option key={g.id} value={String(g.id)}>{g.name} ({g.location || "Pune"})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={busy} style={{ flex: 2, padding: "12px", borderRadius: 10, background: "#166534", border: "none", color: "#FFFFFF", fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}>
                  {busy ? "Saving..." : (editingOwner ? "Update Login" : "Create Login")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {delOwner && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, maxWidth: 360, width: "100%", padding: 22, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Delete Ground Owner?</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748B" }}>
              Remove ground owner login for <strong>{delOwner.name}</strong>?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setDelOwner(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFFFFF", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={handleDelete} disabled={busy} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#DC2626", border: "none", color: "#FFFFFF", fontWeight: 800, cursor: "pointer" }}>
                {busy ? "..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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

// ─── Player Profile (full page) ─── real data only: no batting/bowling stats,
// no radar chart, no per-match runs/wickets/win-loss, no MVP awards or team
// captaincy — none of that exists in the data model. Shows what's actually tracked.
function PlayerProfileView({ player, matchesPlayed, rank, points, onBack, onEdit, isMobile }) {
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  useEffect(() => {
    fetchPlayerMatchHistory(player.id).then(setHistory).catch(()=>{}).finally(()=>setLoadingHistory(false))
  }, [player.id])

  const isPending = player.approved === false
  const teamsPlayed = Array.from(new Set(history.flatMap(m => [m.team, m.our_team]).filter(Boolean)))
  const memberSince = player.created_at ? new Date(player.created_at).toLocaleDateString("en-IN", { month:"short", year:"numeric" }) : null

  return (
    <div>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#166534", fontSize:13, fontWeight:700, cursor:"pointer", padding:0, marginBottom:18, display:"flex", alignItems:"center", gap:4 }}><ArrowLeft size={15}/> Back to Players</button>

      <div style={{ marginBottom:20, position:"relative" }}>
        <button onClick={onEdit} style={{ position:"absolute", top:0, right:0, padding:"10px 16px", borderRadius:12, border:"1.5px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>Edit Player</button>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
          {player.profile_image_url ? (
            <img src={player.profile_image_url} alt={player.name} style={{ width:120, height:120, borderRadius:"50%", objectFit:"cover", border:"3px solid #166534", marginBottom:12 }}/>
          ) : (
            <Av name={player.name} id={player.id} sz={120}/>
          )}
          <div style={{ fontSize:isMobile?20:26, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)", marginTop:10 }}>{player.name}</div>
          <div style={{ marginTop:6 }}><RoleBadge role={player.role||"player"}/></div>
          <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3, alignItems:"center" }}>
            {player.phone && <div style={{ fontSize:13, color:"#64748B", display:"flex", alignItems:"center", gap:6 }}><Phone size={13}/> {player.phone}</div>}
            {player.city && <div style={{ fontSize:13, color:"#64748B", display:"flex", alignItems:"center", gap:6 }}><MapPin size={13}/> {player.city}</div>}
          </div>
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
            <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:700, color:isPending?"#B8860B":"#166534" }}><div style={{ width:8, height:8, borderRadius:"50%", background:isPending?"#B8860B":"#166534" }}/> {isPending?"Pending Approval":"Active Player"}</span>
            {memberSince && <><span style={{ color:"#E2E8F0" }}>|</span><span style={{ fontSize:12, color:"#94A3B8" }}>Member since {memberSince}</span></>}
          </div>
        </div>
      </div>

      {/* Real stats only */}
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr 1fr":"repeat(3,1fr)", gap:14, marginBottom:24, padding:"18px", background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:16 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><Calendar size={18} color="#166534"/></div>
          <div style={{ fontSize:isMobile?18:24, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)" }}>{matchesPlayed}</div>
          <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>Matches Played</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><BarChart3 size={18} color="#166534"/></div>
          <div style={{ fontSize:isMobile?18:24, fontWeight:900, color:"#166534", fontFamily:"var(--font-head)" }}>{points} <span style={{ fontSize:11, fontWeight:700, color:"#94A3B8" }}>PTS</span></div>
          <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>Total Points</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><Trophy size={18} color="#B8860B"/></div>
          <div style={{ fontSize:isMobile?18:24, fontWeight:900, color:rank===1?"#B8860B":"#0F172A", fontFamily:"var(--font-head)" }}>{rank?`#${rank}`:"—"}</div>
          <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>Current Rank</div>
        </div>
      </div>

      {/* Recent Matches — real, no runs/wickets/win-loss since that data doesn't exist yet */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)" }}>Recent Matches</div>
        {loadingHistory ? <Spinner/> : history.length===0 ? (
          <Card style={{ padding:"28px 16px", textAlign:"center" }}>
            <div style={{ color:"#94A3B8", fontSize:13 }}>No confirmed matches yet.</div>
          </Card>
        ) : (
          <div style={{ display:"grid", gap:8 }}>
            {history.slice(0,6).map(m => (
              <Card key={m.id} style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <TeamAv name={m.team} logo={null} size={34}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#0F172A" }}>{matchTitle(m)}</div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:2, display:"flex", alignItems:"center", gap:5 }}><Calendar size={11}/> {fmtDate(m.date)} · <MapPin size={11}/> {m.ground}</div>
                </div>
                <span style={{ background:m.status==="completed"?"#F1F5F9":m.status==="cancelled"?"rgba(239,68,68,0.12)":"rgba(34,197,94,0.12)", color:m.status==="completed"?"#64748B":m.status==="cancelled"?"#EF4444":"#166534", borderRadius:999, padding:"4px 10px", fontSize:11, fontWeight:700, textTransform:"capitalize", flexShrink:0 }}>{m.status}</span>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Teams — derived from real match history, no captaincy/join-date since no roster relationship exists */}
      {teamsPlayed.length > 0 && (
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:12, fontFamily:"var(--font-head)" }}>Teams Played For</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {teamsPlayed.map(t => (
              <div key={t} style={{ padding:"10px 16px", borderRadius:12, border:"1px solid #E2E8F0", background:"#FFFFFF", display:"flex", alignItems:"center", gap:10 }}>
                <TeamAv name={t} logo={null} size={28}/>
                <span style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayersPage({ players, onRefresh, isMobile, isFounder }) {
  useEffect(() => {
    syncAuctionPlayersToRoster().then(({ synced }) => { if (synced > 0) onRefresh() }).catch(e => console.error("Background auction-player sync failed:", e))
  }, [])
  const [showAdd,setShowAdd]=useState(false)
  const [editP,setEditP]=useState(null)
  const [pinP,setPinP]=useState(null)
  const [delP,setDelP]=useState(null)
  const [selectedId,setSelectedId]=useState(null)
  const [form,setForm]=useState({firstName:"",lastName:"",phone:"",pin:""})
  const [editForm,setEditForm]=useState({firstName:"",lastName:"",phone:"",pin:"",role:"player",city:"",birthDate:"",jerseyNumber:"",jerseySize:"",photoFile:null,photoPreview:""})
  const [newPin,setNewPin]=useState("")
  const [busy,setBusy]=useState(false)
  const [search,setSearch]=useState("")
  const [tab,setTab]=useState("all")
  const [sortBy,setSortBy]=useState("name")
  const [sortOpen,setSortOpen]=useState(false)
  const [filtersOpen,setFiltersOpen]=useState(false)
  const [cityFilter,setCityFilter]=useState("")
  const [openMenuId,setOpenMenuId]=useState(null)
  const [viewProfileId,setViewProfileId]=useState(null)
  const [lbRaw,setLbRaw]=useState([])
  useEffect(()=>{ fetchLeaderboard().then(setLbRaw).catch(()=>{}) },[])
  const selectedPlayer=players.find(p=>p.id===selectedId)||null
  const iS={width:"100%",padding:"11px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",background:"#fafafa",boxSizing:"border-box",fontFamily:"var(--font-body)"}
  const lS={fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600}
  const mStyle={position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:isMobile?"flex-end":"center",justifyContent:"center",zIndex:300}
  const mBox={background:"#F8FAF8",borderRadius:isMobile?"20px 20px 0 0":20,padding:isMobile?"22px 18px":28,width:"100%",maxWidth:isMobile?"100%":420,maxHeight:isMobile?"95vh":"auto",overflowY:"auto",boxSizing:"border-box"}
  const addSubmit=async()=>{
    if(!form.firstName?.trim()){alert("First name required");return}
    if(!isValidName(form.firstName)){alert("First name can only contain letters.");return}
    if(!form.lastName?.trim()){alert("Last name required");return}
    if(!isValidName(form.lastName)){alert("Last name can only contain letters.");return}
    if(!form.phone||form.phone.length<10){alert("Enter valid 10-digit phone");return}
    if(!form.pin||form.pin.length!==4){alert("PIN must be 4 digits");return}
    const cleanedNew=form.phone.replace(/[^0-9]/g,"").slice(-10)
    if(players.find(p=>p.phone&&p.phone.replace(/[^0-9]/g,"").slice(-10)===cleanedNew)){alert("A player with this number already exists.");return}
    setBusy(true);try{const {addPlayer}=await import("../db.js");await addPlayer(form.firstName.trim()+" "+form.lastName.trim(),form.phone.trim(),form.pin);setForm({firstName:"",lastName:"",phone:"",pin:""});setShowAdd(false);onRefresh()}catch(e){alert(e.message)};setBusy(false)
  }
  const editSubmit=async()=>{
    if(!editForm.firstName.trim()){alert("First name required");return}
    if(!isValidName(editForm.firstName)){alert("First name can only contain letters.");return}
    if(!editForm.lastName.trim()){alert("Last name required");return}
    if(!isValidName(editForm.lastName)){alert("Last name can only contain letters.");return}
    if(editForm.birthDate){const dobErr=birthDateError(editForm.birthDate);if(dobErr){alert(dobErr);return}}
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

  // Real matches-played per player, derived from confirmed+completed match history (same source as Leaderboard)
  const matchCountMap = {}
  lbRaw.forEach(r => { if (r.player_id) matchCountMap[r.player_id] = (matchCountMap[r.player_id]||0) + 1 })
  const rankOrder = Object.entries(matchCountMap).sort((a,b)=>b[1]-a[1]).map(([id])=>id)
  const rankMap = {}
  rankOrder.forEach((id,i)=>{ rankMap[id] = i+1 })

  const registeredCount = players.length
  const proCount = players.filter(p=>p.role==="pro").length
  const adminCount = players.filter(p=>p.role==="organizer"||p.role==="founder").length
  const normalCount = players.filter(p=>!p.role||p.role==="player").length
  const auctionCount = players.filter(p=>p.registration_source==="auction").length
  const cities = Array.from(new Set(players.map(p=>p.city).filter(Boolean))).sort()

  const tabFiltered = players.filter(p => {
    if (tab==="player") return !p.role || p.role==="player"
    if (tab==="pro") return p.role==="pro"
    if (tab==="admin") return p.role==="organizer" || p.role==="founder"
    if (tab==="auction") return p.registration_source==="auction"
    return true
  })
  const q = search.trim().toLowerCase()
  const searchFiltered = tabFiltered.filter(p => {
    if (cityFilter && p.city !== cityFilter) return false
    if (!q) return true
    return (p.name||"").toLowerCase().includes(q) || (p.phone||"").includes(q)
  })
  const sortedPlayers = [...searchFiltered].sort((a,b) => {
    if (sortBy==="matches") return (matchCountMap[b.id]||0) - (matchCountMap[a.id]||0)
    if (sortBy==="rank") return (rankMap[a.id]||9999) - (rankMap[b.id]||9999)
    return (a.name||"").localeCompare(b.name||"")
  })
  const viewProfilePlayer = viewProfileId ? players.find(p=>p.id===viewProfileId) : null

  return (
    <div>
      {viewProfilePlayer ? (
        <PlayerProfileView
          player={viewProfilePlayer}
          matchesPlayed={matchCountMap[viewProfilePlayer.id]||0}
          rank={rankMap[viewProfilePlayer.id]}
          points={(matchCountMap[viewProfilePlayer.id]||0) * 20}
          onBack={()=>setViewProfileId(null)}
          onEdit={()=>{const parts=(viewProfilePlayer.name||"").trim().split(/\s+/);setEditP(viewProfilePlayer);setEditForm({firstName:parts[0]||"",lastName:parts.slice(1).join(" ")||"",phone:viewProfilePlayer.phone||"",pin:viewProfilePlayer.pin,role:viewProfilePlayer.role||"player",city:viewProfilePlayer.city||"",birthDate:viewProfilePlayer.birth_date||"",jerseyNumber:viewProfilePlayer.jersey_number||"",jerseySize:viewProfilePlayer.jersey_size||"",photoFile:null,photoPreview:viewProfilePlayer.profile_image_url||""})}}
          isMobile={isMobile}
        />
      ) : (
      <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:12}}>
        <div>
          <h2 style={{color:"#0F172A",fontSize:isMobile?20:26,fontWeight:900,margin:0,fontFamily:"var(--font-head)"}}>Players</h2>
          <div style={{fontSize:13,color:"#64748B",marginTop:4}}>Manage all registered players on Selected Sports</div>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{padding:"10px 16px",borderRadius:12,background:"#166534",border:"none",color:"#FFFFFF",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"var(--font-head)",display:"flex",alignItems:"center",gap:6,flexShrink:0,whiteSpace:"nowrap"}}><Plus size={15}/> Add Player</button>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:16,marginBottom:20}}>
        {[
          {icon:UsersRound, v:registeredCount, label:"Registered Players", link:"View all players", action:()=>setTab("all")},
          {icon:Star, v:proCount, label:"PRO Players", link:"View PRO players", action:()=>setTab("pro")},
          {icon:ShieldCheck, v:adminCount, label:"Admin", link:"View admins", action:()=>setTab("admin")},
          {icon:UserIcon, v:normalCount, label:"Normal Players", link:"View players", action:()=>setTab("player")},
        ].map((c,i)=>(
          <div key={i} onClick={c.action} style={{padding:"18px", background:"#FFFFFF", borderRadius:16, border:"1px solid #E2E8F0", cursor:"pointer"}}>
            <div style={{width:34,height:34,borderRadius:10,background:"rgba(34,197,94,0.1)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10}}><c.icon size={17} color="#166534"/></div>
            <div style={{fontSize:isMobile?22:28,fontWeight:900,color:"#0F172A",fontFamily:"var(--font-head)",lineHeight:1}}>{c.v}</div>
            <div style={{fontSize:12,color:"#64748B",marginTop:4,fontWeight:600}}>{c.label}</div>
            <div style={{fontSize:11,color:"#166534",marginTop:6,fontWeight:700,display:"flex",alignItems:"center",gap:3}}>{c.link} <ChevronRight size={12}/></div>
          </div>
        ))}
      </div>

      {/* Search + Filters + Sort */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{flex:1, minWidth:200, position:"relative"}}>
          <SearchIcon size={16} color="#94A3B8" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)"}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, phone or team..." style={{width:"100%",padding:"12px 14px 12px 40px",borderRadius:12,border:"1.5px solid #E2E8F0",fontSize:13,outline:"none",background:"#FFFFFF",boxSizing:"border-box",fontFamily:"var(--font-body)"}}/>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setFiltersOpen(o=>!o)} style={{padding:"12px 16px",borderRadius:12,border:"1.5px solid #E2E8F0",background:filtersOpen||cityFilter?"rgba(22,101,52,0.08)":"#FFFFFF",color:"#0F172A",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}><SlidersHorizontal size={15}/> Filters{cityFilter?" (1)":""}</button>
          {filtersOpen && (
            <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:200,padding:"12px 14px"}}>
              <div style={{fontSize:12,color:"#64748B",fontWeight:600,marginBottom:8}}>City</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <button onClick={()=>setCityFilter("")} style={{padding:"6px 12px",borderRadius:999,border:!cityFilter?"none":"1px solid #E2E8F0",background:!cityFilter?"#166534":"#FFFFFF",color:!cityFilter?"#FFFFFF":"#64748B",fontSize:12,fontWeight:600,cursor:"pointer"}}>Any</button>
                {cities.map(c=>(
                  <button key={c} onClick={()=>setCityFilter(c)} style={{padding:"6px 12px",borderRadius:999,border:cityFilter===c?"none":"1px solid #E2E8F0",background:cityFilter===c?"#166534":"#FFFFFF",color:cityFilter===c?"#FFFFFF":"#64748B",fontSize:12,fontWeight:600,cursor:"pointer"}}>{c}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setSortOpen(o=>!o)} style={{padding:"12px 16px",borderRadius:12,border:"1.5px solid #E2E8F0",background:"#FFFFFF",color:"#0F172A",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}><ArrowUpDown size={14}/> Sort</button>
          {sortOpen && (
            <div style={{position:"absolute",top:"100%",right:0,marginTop:4,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:12,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:140,overflow:"hidden"}}>
              {[["name","Name (A-Z)"],["matches","Most Matches"],["rank","Rank"]].map(([k,label])=>(
                <button key={k} onClick={()=>{setSortBy(k);setSortOpen(false)}} style={{width:"100%",padding:"10px 14px",border:"none",background:sortBy===k?"rgba(34,197,94,0.08)":"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",fontWeight:sortBy===k?700:500}}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {[["all",`All (${registeredCount})`],["player",`Players (${normalCount})`],["pro",`PRO (${proCount})`],["admin",`Admin (${adminCount})`],["auction",`Auction (${auctionCount})`]].map(([k,label])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"9px 16px",borderRadius:999,border:tab===k?"none":"1.5px solid #E2E8F0",background:tab===k?"#166534":"#FFFFFF",color:tab===k?"#FFFFFF":"#0F172A",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>

      {/* Table */}
      {sortedPlayers.length===0 ? (
        <Card style={{padding:"40px 24px",textAlign:"center"}}>
          <div style={{color:"#6b7280",fontSize:13}}>No players match your search or filters.</div>
        </Card>
      ) : (
        <div style={{borderRadius:14,overflow:"hidden",border:"1px solid #E2E8F0", marginBottom: isMobile ? 32 : 24}}>
          {!isMobile && (
            <div style={{display:"flex",alignItems:"center",padding:"12px 16px",background:"#F8FAF8",borderBottom:"1px solid #E2E8F0",fontSize:11,fontWeight:700,color:"#64748B",textTransform:"uppercase",letterSpacing:0.4}}>
              <div style={{flex:1}}>Player</div>
              <div style={{width:90,textAlign:"center"}}>Role</div>
              <div style={{width:80,textAlign:"center"}}>Matches</div>
              <div style={{width:60,textAlign:"center"}}>Rank</div>
              <div style={{width:80,textAlign:"center"}}>Status</div>
              <div style={{width:36}}/>
            </div>
          )}
          {sortedPlayers.map((p,i) => {
            const isPending = p.approved === false
            const matches = matchCountMap[p.id] || 0
            const rank = rankMap[p.id]
            return (
              <div key={p.id} onClick={()=>setSelectedId(id=>id===p.id?null:p.id)} style={{display:"flex",alignItems:"center",padding:"14px 16px",background:selectedId===p.id?"rgba(34,197,94,0.05)":"#FFFFFF",borderTop:i===0?"none":"1px solid #F1F5F9",cursor:"pointer",flexWrap:isMobile?"wrap":"nowrap",gap:isMobile?10:0}}>
                <div style={{flex:1,display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                  {p.profile_image_url ? (
                    <img src={p.profile_image_url} alt={p.name} style={{ width:48, height:48, borderRadius:10, objectFit:"cover", flexShrink:0 }}/>
                  ) : (
                    <Av name={p.name} id={p.id} sz={48}/>
                  )}
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0F172A",display:"flex",alignItems:"center",gap:6}}>
                      {p.name}
                      {p.registration_source === "auction" ? (
                        <span style={{ fontSize:9, fontWeight:800, color:"#B8860B", background:"rgba(184,134,11,0.12)", padding:"2px 7px", borderRadius:999, textTransform:"uppercase", flexShrink:0 }}><Gavel size={9} style={{verticalAlign:"-1px", marginRight:2}}/>Auction</span>
                      ) : (
                        <span style={{ fontSize:9, fontWeight:700, color:"#64748B", background:"#F1F5F9", padding:"2px 7px", borderRadius:999, textTransform:"uppercase", flexShrink:0 }}>Direct</span>
                      )}
                    </div>
                    <div style={{fontSize:12,color:"#64748B",marginTop:2,display:"flex",alignItems:"center",gap:4}}><Phone size={11}/> {p.phone||"No phone"}</div>
                    {p.city && <div style={{fontSize:12,color:"#94A3B8",marginTop:1,display:"flex",alignItems:"center",gap:4}}><MapPin size={11}/> {p.city}</div>}
                  </div>
                </div>
                <div style={{width:isMobile?"auto":90,textAlign:"center"}}><RoleBadge role={p.role||"player"} size="sm"/></div>
                <div style={{width:isMobile?"auto":80,textAlign:"center",fontSize:14,fontWeight:800,color:"#0F172A",fontFamily:"var(--font-head)"}}>{matches}{isMobile && <span style={{fontSize:10,color:"#94A3B8",fontWeight:500}}> matches</span>}</div>
                <div style={{width:isMobile?"auto":60,textAlign:"center",fontSize:13,fontWeight:800,color:rank===1?"#B8860B":"#64748B",fontFamily:"var(--font-head)"}}>{rank?`#${rank}`:"—"}</div>
                <div style={{width:isMobile?"auto":80,textAlign:"center"}}>
                  <span style={{background:isPending?"rgba(245,158,11,0.12)":"rgba(34,197,94,0.12)",color:isPending?"#B8860B":"#166534",borderRadius:999,padding:"4px 10px",fontSize:11,fontWeight:700}}>{isPending?"Pending":"Active"}</span>
                </div>
                <div style={{width:36,display:"flex",justifyContent:"flex-end",position:"relative"}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>setOpenMenuId(id=>id===p.id?null:p.id)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex"}}><MoreVertical size={16} color="#94A3B8"/></button>
                  {openMenuId===p.id && (
                    <div style={{position:"absolute",top:"100%",right:0,background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 8px 24px rgba(15,23,42,0.12)",zIndex:20,minWidth:150,overflow:"hidden"}}>
                      <button onClick={()=>{setViewProfileId(p.id);setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>View Profile</button>
                      <button onClick={()=>{const parts=(p.name||"").trim().split(/\s+/);setEditP(p);setEditForm({firstName:parts[0]||"",lastName:parts.slice(1).join(" ")||"",phone:p.phone||"",pin:p.pin,role:p.role||"player",city:p.city||"",birthDate:p.birth_date||"",jerseyNumber:p.jersey_number||"",jerseySize:p.jersey_size||"",photoFile:null,photoPreview:p.profile_image_url||""});setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#0F172A",cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderTop:"1px solid #F1F5F9"}}>Edit</button>
                      <button onClick={()=>{setPinP(p);setNewPin("");setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#B8860B",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>Change PIN</button>
                      <button onClick={()=>{setDelP(p);setOpenMenuId(null)}} style={{width:"100%",padding:"10px 14px",border:"none",background:"none",textAlign:"left",fontSize:13,color:"#EF4444",cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderTop:"1px solid #F1F5F9"}}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedPlayer && (
        <div style={{marginTop:16}}>
          <div style={{background:"#f0fdf4",borderRadius:16,padding:"16px 18px",border:"2px solid #166534",position:"relative"}}>
            <button onClick={()=>setSelectedId(null)} style={{position:"absolute",top:14,right:14,background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer",padding:0}}>×</button>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:14}}>
              {selectedPlayer.profile_image_url ? (
                <img src={selectedPlayer.profile_image_url} alt={selectedPlayer.name} style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",border:"3px solid #166534",marginBottom:10}}/>
              ) : (
                <Av name={selectedPlayer.name} id={selectedPlayer.id} sz={100}/>
              )}
              <div style={{fontWeight:800,fontSize:16,color:"#0F172A",fontFamily:"var(--font-head)",marginTop:8}}>{selectedPlayer.name}</div>
              <div style={{fontSize:12,color:"#6b7280",marginTop:3}}>📱 {selectedPlayer.phone||"No phone"}</div>
              <div style={{fontSize:12,marginTop:6}}><span style={{color:"#9ca3af"}}>PIN: </span><span style={{background:"#d1fae5",color:"#065f46",padding:"2px 10px",borderRadius:5,fontWeight:800,fontSize:14}}>{selectedPlayer.pin}</span></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <button onClick={()=>{const parts=(selectedPlayer.name||"").trim().split(/\s+/);setEditP(selectedPlayer);setEditForm({firstName:parts[0]||"",lastName:parts.slice(1).join(" ")||"",phone:selectedPlayer.phone||"",pin:selectedPlayer.pin,role:selectedPlayer.role||"player",city:selectedPlayer.city||"",birthDate:selectedPlayer.birth_date||"",jerseyNumber:selectedPlayer.jersey_number||"",jerseySize:selectedPlayer.jersey_size||"",photoFile:null,photoPreview:selectedPlayer.profile_image_url||""})}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #dbeafe",background:"#F5E6C8",color:"#7A4F13",fontSize:13,cursor:"pointer",fontWeight:700}}>Edit</button>
              <button onClick={()=>{setPinP(selectedPlayer);setNewPin("")}} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #fde68a",background:"#fefce8",color:"#78350f",fontSize:13,cursor:"pointer",fontWeight:700}}>PIN</button>
              <button onClick={()=>setDelP(selectedPlayer)} style={{padding:"11px 4px",borderRadius:9,border:"1.5px solid #fecaca",background:"#fff5f5",color:"#991b1b",fontSize:13,cursor:"pointer",fontWeight:700}}>Remove</button>
            </div>
            <ContributionsSection player={selectedPlayer} isMobile={isMobile}/>
          </div>
        </div>
      )}
      </>
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
          <div><label style={lS}>Date of Birth</label><input type="date" value={editForm.birthDate} onChange={e=>setEditForm({...editForm,birthDate:e.target.value})} max={maxBirthDateForMinAge()} style={iS}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lS}>Jersey Number</label><input value={editForm.jerseyNumber} onChange={e=>setEditForm({...editForm,jerseyNumber:e.target.value.replace(/[^0-9]/g,"").slice(0,3)})} inputMode="numeric" placeholder="e.g. 7" style={iS}/></div>
            <div><label style={lS}>Jersey Size</label>
              <select value={editForm.jerseySize} onChange={e=>setEditForm({...editForm,jerseySize:e.target.value})} style={iS}>
                <option value="">Select</option>
                {["S","M","L","XL","XXL","3XL","4XL","5XL","6XL"].map(s=><option key={s} value={s}>{s}</option>)}
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


