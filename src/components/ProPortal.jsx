import { useState, useEffect } from "react"
import { Users, MapPin, Swords, CircleDot, User, Calendar, Clock, CheckCircle2, XCircle, Hourglass, Star, AlertTriangle, CreditCard, Mail, Trophy, LogOut, Phone, Trash2, Home, ChevronRight, Plus, ClipboardList, UsersRound } from "lucide-react"
import { LogoFull, Av, Tag, Card, Spinner , LeaderboardPage, RoleBadge} from "./ui.jsx"
import { fetchMatches, fetchGrounds, fetchTeams, createMatch, addTeam, deleteMatch, fetchMatchPlayers, fetchExpenses, fetchPayments, fetchChat, fetchPublicResponses, updateMatchStatus, fetchPlayers, fetchSettings , fetchStats, fetchProStats, fetchPlayerStats, fetchMatchCounts, fetchProGroupPlayers, fetchMyInvites, confirmPlayerToMatch, updatePlayer, updatePlayerUpi, fetchInboxMessages, countUnreadMessages, markMessagesRead, fetchAuctionTeams, fetchAuctionPlayers, uploadProfilePhoto, fetchMyAuctions, fetchAuctionRegistrationOpen, setAuctionRegistrationOpen, updateAuctionPlayerBasePrice, deleteAuctionPlayer, createAuctionTeam, updateAuctionTeam, deleteAuctionTeam} from "../db.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import CreateAuctionFlow from "./CreateAuctionFlow.jsx"
import AuctionLiveConsole from "./AuctionLiveConsole.jsx"
import { fmtDate, dayName, matchTitle } from "../constants.js"
import { MatchDetail, TeamAv, SearchDropdown } from "./AdminPortal.jsx" // CALENDAR_NAV_REMOVED
import { MatchDetailPlayer } from "./PlayerPortal.jsx"
import { useMobile } from "../hooks/useMobile.js"

function timeSlotStr(sh, sm, eh, em) {
  const f = (h, m) => { const ap = h >= 12 ? "PM" : "AM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${m} ${ap}` }
  return `${f(sh, sm)} - ${f(eh, em)}`
}

function ProScheduleModal({ grounds, teams, player, onClose, onCreated, isMobile, defaultGroundId }) {
  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({ date: today, startH: 7, startM: "00", endH: 9, endM: "00", groundId: defaultGroundId || "", teamId: teams[0]?.id || "", ourTeamId: "", type: "external", maxPlayers: 9, visibility: "private" })
  const [teamList, setTeamList] = useState(teams)
  const [busy, setBusy] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [addTeamTarget, setAddTeamTarget] = useState("opponent")

  useEffect(() => {
    fetchAuctionTeams().then(auctionTeams => {
      const mapped = auctionTeams.map(t => ({ id: "auc-" + t.id, name: t.name, logo_url: null, isAuction: true }))
      setTeamList(list => [...list.filter(t => !t.isAuction), ...mapped])
    }).catch(() => {})
  }, [])

  const selGround = grounds.find(g => String(g.id) === String(form.groundId))
  const selTeam = teamList.find(t => String(t.id) === String(form.teamId))
  const selOurTeam = teamList.find(t => String(t.id) === String(form.ourTeamId))

  const addNewTeam = async () => {
    if (!newTeamName.trim()) { alert("Team name required"); return }
    try {
      const created = await addTeam(newTeamName.trim(), null)
      setTeamList([...teamList, created])
      setForm(f => ({ ...f, [addTeamTarget === "our" ? "ourTeamId" : "teamId"]: created.id }))
      setShowAddTeam(false); setNewTeamName("")
    } catch(e) { alert(e.message) }
  }

  const create = async () => {
    if (!selGround) { alert("Please select a ground"); return }
    if (form.type === "external" && !selTeam) { alert("Please select the opponent team"); return }
    if (form.type === "external" && !selOurTeam) { alert("Please select which team we're playing as"); return }
    if (form.type === "external" && selTeam && selOurTeam && String(selTeam.id) === String(selOurTeam.id)) { alert("Our team and the opponent can't be the same team"); return }
    setBusy(true)
    const timeSlot = timeSlotStr(form.startH, form.startM, form.endH, form.endM)
    const teamName = form.type === "internal" ? `Internal ${form.maxPlayers/2}v${form.maxPlayers/2}` : selTeam.name
    const teamLogo = form.type === "internal" ? null : (selTeam?.logo_url || null)
    const ourTeamName = form.type === "external" ? selOurTeam.name : null
    const ourTeamLogo = form.type === "external" ? (selOurTeam?.logo_url || null) : null
    try {
      await createMatch({ date: form.date, time_slot: timeSlot, ground: selGround.name, team: teamName, team_logo: teamLogo, our_team: ourTeamName, our_team_logo: ourTeamLogo, type: form.type, max_players: form.maxPlayers, created_by: player.id, visibility: form.visibility })
      onCreated()
    } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const lS = { fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }
  const iS = { width: "100%", padding: "11px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 15, boxSizing: "border-box", fontFamily: "var(--font-body)", outline: "none" }
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 5)

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: "#F8FAF8", borderRadius: isMobile ? "20px 20px 0 0" : 20, padding: isMobile ? "24px 18px" : 30, width: "100%", maxWidth: isMobile ? "100%" : 500, maxHeight: isMobile ? "95vh" : "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>Schedule Match</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#94A3B8" }}>×</button>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={lS}>Date</label>
            <input type="date" value={form.date} min={today} onChange={e => setForm({ ...form, date: e.target.value })} style={iS} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={lS}>Start</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={form.startH} onChange={e => setForm({ ...form, startH: Number(e.target.value) })} style={{ ...iS, padding: "11px 6px" }}>{HOURS.map(h => <option key={h} value={h}>{h % 12 === 0 ? 12 : h % 12} {h >= 12 ? "PM" : "AM"}</option>)}</select>
                <select value={form.startM} onChange={e => setForm({ ...form, startM: e.target.value })} style={{ ...iS, padding: "11px 6px" }}>{["00","15","30","45"].map(m => <option key={m} value={m}>{m}</option>)}</select>
              </div>
            </div>
            <div>
              <label style={lS}>End</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={form.endH} onChange={e => setForm({ ...form, endH: Number(e.target.value) })} style={{ ...iS, padding: "11px 6px" }}>{HOURS.map(h => <option key={h} value={h}>{h % 12 === 0 ? 12 : h % 12} {h >= 12 ? "PM" : "AM"}</option>)}</select>
                <select value={form.endM} onChange={e => setForm({ ...form, endM: e.target.value })} style={{ ...iS, padding: "11px 6px" }}>{["00","15","30","45"].map(m => <option key={m} value={m}>{m}</option>)}</select>
              </div>
            </div>
          </div>
          <div>
            <label style={lS}>Ground</label>
            <select value={form.groundId} onChange={e => setForm({ ...form, groundId: e.target.value })} style={iS}>
              <option value="">Select ground...</option>
              {grounds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lS}>Match Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["external", (<><Swords size={13} style={{verticalAlign:"-2px"}}/> External Match</>), "vs another team"], ["internal", (<><CircleDot size={13} style={{verticalAlign:"-2px"}}/> Internal Match</>), "within our group"]].map(([v, l, sub]) => (
                <button key={v} onClick={() => setForm({ ...form, type: v, maxPlayers: v === "internal" ? 18 : 9 })} style={{ padding: "12px 8px", borderRadius: 9, border: `2px solid ${form.type === v ? "#166534" : "#E2E8F0"}`, background: form.type === v ? "rgba(34,197,94,0.08)" : "#F8FAF8", color: form.type === v ? "#166534" : "#64748B", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: form.type === v ? 800 : 600 }}>{l}</div>
                  <div style={{ fontSize: 10, color: form.type === v ? "#22C55E" : "#94A3B8", marginTop: 2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lS}>Visibility</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["private", "🔒 Private", "Only invited players see it"], ["public", "🌐 Public", "All registered players see it"]].map(([v, l, sub]) => (
                <button key={v} onClick={() => setForm({ ...form, visibility: v })} style={{ padding: "12px 8px", borderRadius: 9, border: `2px solid ${form.visibility === v ? "#166534" : "#E2E8F0"}`, background: form.visibility === v ? "rgba(34,197,94,0.08)" : "#F8FAF8", color: form.visibility === v ? "#166534" : "#64748B", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: form.visibility === v ? 800 : 600 }}>{l}</div>
                  <div style={{ fontSize: 10, color: form.visibility === v ? "#22C55E" : "#94A3B8", marginTop: 2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
          {form.type === "external" && (
            <div>
              <label style={lS}>Our Squad Size</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setForm({ ...form, maxPlayers: n })} style={{ flex: 1, padding: "11px 4px", borderRadius: 9, border: `2px solid ${form.maxPlayers === n ? "#166534" : "#E2E8F0"}`, background: form.maxPlayers === n ? "rgba(34,197,94,0.08)" : "#F8FAF8", color: form.maxPlayers === n ? "#166534" : "#64748B", fontSize: 14, cursor: "pointer", fontWeight: form.maxPlayers === n ? 800 : 600 }}>{n}</button>
                ))}
              </div>
              <div style={{ padding: "8px 12px", background: "rgba(246,196,83,0.12)", borderRadius: 9, border: "1px solid rgba(246,196,83,0.3)", marginBottom: 14, fontSize: 12, color: "#B8860B", fontWeight: 600, display:"flex", alignItems:"center", gap:6 }}><Users size={13}/> Our squad: {form.maxPlayers} players</div>
              <label style={lS}>Our Team (who we're playing as today)</label>
              <select value={form.ourTeamId} onChange={e => { if (e.target.value === "__add") { setAddTeamTarget("our"); setShowAddTeam(true); setNewTeamName("") } else setForm({ ...form, ourTeamId: e.target.value }) }} style={{ ...iS, marginBottom: 14 }}>
                <option value="">Select our team...</option>
                {teamList.map(t => <option key={t.id} value={t.id}>{t.name}{t.isAuction ? " (Auction Team)" : ""}</option>)}
                <option value="__add">+ Add new team</option>
              </select>
              <label style={lS}>Opponent Team</label>
              <select value={form.teamId} onChange={e => { if (e.target.value === "__add") { setAddTeamTarget("opponent"); setShowAddTeam(true); setNewTeamName("") } else setForm({ ...form, teamId: e.target.value }) }} style={iS}>
                <option value="">Select team...</option>
                {teamList.map(t => <option key={t.id} value={t.id}>{t.name}{t.isAuction ? " (Auction Team)" : ""}</option>)}
                <option value="__add">+ Add new team</option>
              </select>
            </div>
          )}
          {form.type === "internal" && (
            <div>
              <label style={lS}>Total Players</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[10,12,14,16,18,20,22].map(n => (
                  <button key={n} onClick={() => setForm({ ...form, maxPlayers: n })} style={{ flex: "1 1 calc(25% - 6px)", padding: "11px 4px", borderRadius: 9, border: `2px solid ${form.maxPlayers === n ? "#166534" : "#E2E8F0"}`, background: form.maxPlayers === n ? "rgba(34,197,94,0.08)" : "#F8FAF8", color: form.maxPlayers === n ? "#166534" : "#64748B", fontSize: 14, cursor: "pointer", fontWeight: form.maxPlayers === n ? 800 : 600 }}>{n}</button>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(34,197,94,0.08)", borderRadius: 10, border: "1px solid rgba(34,197,94,0.15)", fontSize: 13, color: "#166534", fontWeight: 700 }}>{form.maxPlayers/2}v{form.maxPlayers/2} · {form.maxPlayers} players · Two equal sides</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#F8FAF8", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={create} disabled={busy} style={{ flex: 2, padding: "13px", borderRadius: 10, background: "#F8FAF8", border: "none", color: "#0F172A", fontSize: 14, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)" }}>{busy ? "Creating..." : "Create Match"}</button>
        </div>

        {showAddTeam && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }} onClick={() => setShowAddTeam(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#F8FAF8", borderRadius: 16, padding: 22, width: "100%", maxWidth: 360 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Add New Team</h3>
              <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Team name" autoFocus style={{ ...iS, marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddTeam(false)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F8FAF8", cursor: "pointer" }}>Cancel</button>
                <button onClick={addNewTeam} style={{ flex: 2, padding: "12px", borderRadius: 9, background: "#F8FAF8", border: "none", color: "#0F172A", fontWeight: 800, cursor: "pointer" }}>Add & Select</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProPortal({ player, onLogout }) {
  const [matches, setMatches] = useState([])
  const [grounds, setGrounds] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showCreateAuction, setShowCreateAuction] = useState(false)
  const [myAuctions, setMyAuctions] = useState([])
  const [loadingAuctions, setLoadingAuctions] = useState(true)
  const [managingAuction, setManagingAuction] = useState(null)
  const [auctionSubTab, setAuctionSubTab] = useState("players")
  const [auctionPlayers, setAuctionPlayers] = useState([])
  const [auctionTeams, setAuctionTeams] = useState([])
  const [auctionRegOpen, setAuctionRegOpen] = useState(true)
  const [auctionRegBusy, setAuctionRegBusy] = useState(false)
  const [priceDrafts, setPriceDrafts] = useState({})
  const [viewingAuctionPlayer, setViewingAuctionPlayer] = useState(null)
  const [showAddAuctionTeam, setShowAddAuctionTeam] = useState(false)
  const [editAuctionTeam, setEditAuctionTeam] = useState(null)
  const [delAuctionTeam, setDelAuctionTeam] = useState(null)
  const [auctionTeamName, setAuctionTeamName] = useState("")
  const [auctionTeamOwner, setAuctionTeamOwner] = useState("")
  const [auctionTeamPurse, setAuctionTeamPurse] = useState("")
  const [auctionBusy, setAuctionBusy] = useState(false)

  const loadMyAuctions = async () => {
    setLoadingAuctions(true)
    try { setMyAuctions(await fetchMyAuctions(player.id)) } catch(e) { alert(e.message) }
    setLoadingAuctions(false)
  }
  useEffect(() => { loadMyAuctions() }, [])

  const loadAuctionPool = async () => {
    if (!managingAuction) return
    try {
      const [p, t, open] = await Promise.all([fetchAuctionPlayers(managingAuction.id), fetchAuctionTeams(managingAuction.id), fetchAuctionRegistrationOpen(managingAuction.id)])
      setAuctionPlayers(p); setAuctionTeams(t); setAuctionRegOpen(open)
    } catch(e) { alert(e.message) }
  }
  useEffect(() => { loadAuctionPool() }, [managingAuction])

  const toggleAuctionRegistration = async () => {
    setAuctionRegBusy(true)
    try { await setAuctionRegistrationOpen(managingAuction.id, !auctionRegOpen); setAuctionRegOpen(!auctionRegOpen) } catch(e) { alert(e.message) }
    setAuctionRegBusy(false)
  }

  const saveAuctionPrice = async (playerId) => {
    const val = priceDrafts[playerId]
    if (val === undefined || val === "") return
    try { await updateAuctionPlayerBasePrice(playerId, Number(val)); await loadAuctionPool() } catch(e) { alert(e.message) }
  }

  const removeAuctionPlayer = async (p) => {
    if (!window.confirm(`Remove ${p.name} from the auction pool?`)) return
    try { await deleteAuctionPlayer(p.id); await loadAuctionPool() } catch(e) { alert(e.message) }
  }

  const openAddAuctionTeam = () => { setEditAuctionTeam(null); setAuctionTeamName(""); setAuctionTeamOwner(""); setAuctionTeamPurse(""); setShowAddAuctionTeam(true) }
  const openEditAuctionTeam = (t) => { setEditAuctionTeam(t); setAuctionTeamName(t.name); setAuctionTeamOwner(t.owner_name || ""); setAuctionTeamPurse(String(t.purse_total)); setShowAddAuctionTeam(true) }

  const saveAuctionTeam = async () => {
    if (!auctionTeamName.trim()) { alert("Team name required"); return }
    const purse = Number(auctionTeamPurse)
    if (!auctionTeamPurse || isNaN(purse) || purse <= 0) { alert("Enter a valid starting purse"); return }
    setAuctionBusy(true)
    try {
      if (editAuctionTeam) await updateAuctionTeam(editAuctionTeam.id, { name: auctionTeamName.trim(), ownerName: auctionTeamOwner.trim(), purseTotal: purse })
      else await createAuctionTeam(auctionTeamName.trim(), auctionTeamOwner.trim(), purse, managingAuction.id)
      setShowAddAuctionTeam(false)
      await loadAuctionPool()
    } catch(e) { alert(e.message) }
    setAuctionBusy(false)
  }

  const confirmDeleteAuctionTeam = async () => {
    setAuctionBusy(true)
    try { await deleteAuctionTeam(delAuctionTeam.id); setDelAuctionTeam(null); await loadAuctionPool() } catch(e) { alert(e.message) }
    setAuctionBusy(false)
  }

  const [detail, setDetail] = useState(null)
  const [stats, setStats] = useState(null)
  const [playerStats, setPlayerStats] = useState(null)
  const [upiVal, setUpiVal] = useState("")
  const [editingProfile, setEditingProfile] = useState(false)
  const [pForm, setPForm] = useState({ firstName: "", lastName: "", phone: player.phone || "", pin: player.pin, city: player.city || "", birthDate: player.birth_date || "", jerseyNumber: player.jersey_number || "", jerseySize: player.jersey_size || "", photoFile: null, photoPreview: player.profile_image_url || "" })
  const [defaultGroundId, setDefaultGroundId] = useState(() => {
    try { return localStorage.getItem("ss_default_ground_" + player.id) || "" } catch { return "" }
  })
  const setDefaultGround = (id) => {
    setDefaultGroundId(id)
    try { id ? localStorage.setItem("ss_default_ground_" + player.id, id) : localStorage.removeItem("ss_default_ground_" + player.id) } catch {}
  }
  const [proView, setProView] = useState("dashboard")
  const [menuOpen, setMenuOpen] = useState(false)
  const [groupPlayers, setGroupPlayers] = useState([])
  const [invites, setInvites] = useState([])
  const [inviteFilter, setInviteFilter] = useState("upcoming")
  const filteredInvites = invites.filter(({ match: m }) => inviteFilter === "upcoming" ? m.status !== "completed" : m.status === "completed")
  const [invDetail, setInvDetail] = useState(null)
  const loadInvDetail = async (m) => {
    try {
      const [mps, exps, pays, chats] = await Promise.all([fetchMatchPlayers(m.id), fetchExpenses(m.id), fetchPayments(m.id), fetchChat(m.id)])
      setInvDetail({ match: m, matchPlayers: mps, expenses: exps, payments: pays, chat: chats })
    } catch(e) { alert(e.message) }
  }
  const loadInvites = () => fetchMyInvites(player.id).then(all => setInvites(all.filter(r => r.match.created_by !== player.id))).catch(()=>{})
  useEffect(() => { loadInvites() }, [player.id])
  useEffect(() => { fetchProGroupPlayers(player.id).then(setGroupPlayers).catch(()=>{}) }, [player.id])
  const [matchCounts, setMatchCounts] = useState({})
  useEffect(() => { fetchProStats(player.id).then(setStats).catch(()=>{}) }, [])
  useEffect(() => { fetchPlayerStats(player.id).then(setPlayerStats).catch(()=>{}) }, [])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [allPlayers, setAllPlayers] = useState([])
  const [appSettings, setAppSettings] = useState({})
  const loadDetail = async (m) => {
    console.log("loadDetail clicked for match:", m.id)
    setLoadingDetail(true)
    try {
      const [mps, exps, pays, chats, pubs] = await Promise.all([
        fetchMatchPlayers(m.id), fetchExpenses(m.id), fetchPayments(m.id), fetchChat(m.id), fetchPublicResponses(m.id)
      ])
      console.log("loadDetail data loaded, setting detail")
      setDetail({ match: m, matchPlayers: mps || [], expenses: exps || [], payments: pays || [], chat: chats || [], publicResponses: pubs || [] })
    } catch(e) { console.error("loadDetail error:", e); alert("Could not open match: " + e.message) }
    setLoadingDetail(false)
  }
  const [matchesTab, setMatchesTab] = useState("hosted")
  const [playerSearch, setPlayerSearch] = useState("")
  const [playersTab, setPlayersTab] = useState("active")
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

  const expiry = player.subscription_expiry ? new Date(player.subscription_expiry) : null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const active = expiry && expiry >= today
  const daysLeft = expiry ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)) : 0
  const isActive = active

  const load = async () => {
    setLoading(true)
    try {
      const [all, g, t] = await Promise.all([fetchMatches(), fetchGrounds(), fetchTeams()])
      const myMatches = all.filter(m => m.created_by === player.id)
      setMatches(myMatches)
      setGrounds(g); setTeams(t)
      try { const counts = await fetchMatchCounts(myMatches.map(m => m.id)); setMatchCounts(counts) } catch {}
      try { const [ap, st] = await Promise.all([fetchPlayers(), fetchSettings()]); setAllPlayers(ap); setAppSettings(st||{}) } catch {}
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [player.id])

  if (loading) return <div style={{ minHeight: "100vh", background: "#F8FAF8", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>

  // Full match detail view (same as admin) for the pro member's own match
  if (invDetail) {
    return (
      <MatchDetailPlayer
        detail={invDetail}
        player={player}
        onBack={() => setInvDetail(null)}
        onRespond={async (action) => { try { await confirmPlayerToMatch(invDetail.match.id, player.id, action); await loadInvDetail(invDetail.match); loadInvites() } catch(e) { alert(e.message) } }}
        isMobile={isMobile}
      />
    )
  }

  if (detail) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAF8", fontFamily: "var(--font-body)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "14px 12px" : "22px 18px" }}>
          <MatchDetail
            detail={detail}
            players={groupPlayers}
            settings={appSettings}
            onBack={() => setDetail(null)}
            onRefresh={() => loadDetail(detail.match)}
            onDeleted={() => { setDetail(null); load() }}
            onStatusChange={async (status) => { await updateMatchStatus(detail.match.id, status); setDetail(null); load() }}
            isMobile={isMobile}
            loggedPlayer={player}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAF8", fontFamily: "var(--font-body)", paddingBottom:70 }}>
      {/* PRO_HEADER_V1 */}
      <div style={{ background:"#FFFFFF", height:56, borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", padding:"0 16px", gap:12, position:"sticky", top:0, zIndex:200 }}>
        <button onClick={()=>setMenuOpen(o=>!o)} style={{ background:"transparent", border:"none", color:"#0F172A", fontSize:20, cursor:"pointer", padding:6 }}>☰</button>
        <div onClick={()=>{ setDetail(null); setInvDetail(null); setProView("dashboard") }} style={{ flex:1, textAlign:"center", cursor:"pointer", fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Selected Sports</div>
        <div onClick={()=>setProView("profile")} style={{ cursor:"pointer" }}><Av name={player.name} id={player.id} sz={28}/></div>
      </div>

      {menuOpen && (
        <div onClick={()=>setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:299 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", width:260, height:"100%", padding:"20px 14px", boxShadow:"4px 0 24px rgba(0,0,0,0.15)" }}>
            <div onClick={()=>{ setMenuOpen(false); setProView("profile") }} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 8px", borderRadius:10, cursor:"pointer", marginBottom:14, borderBottom:"1px solid #F1F5F9", paddingBottom:16 }}>
              <Av name={player.name} id={player.id} sz={36}/>
              <div style={{ minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ fontSize:14, color:"#0F172A", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{player.name}</div>
                  <span style={{ color: isActive ? "#166534" : "#EF4444", fontSize:10, background: isActive ? "rgba(22,101,52,0.12)" : "rgba(231,76,60,0.12)", padding:"2px 7px", borderRadius:999, fontWeight:700 }}>{isActive ? "PRO" : "EXPIRED"}</span>
                </div>
                <div style={{ fontSize:11, color:"#94A3B8" }}>View Profile</div>
              </div>
            </div>
            <button onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:11, width:"100%", padding:"11px 10px", borderRadius:10, border:"none", background:"transparent", color:"#EF4444", fontSize:14, fontWeight:600, cursor:"pointer", textAlign:"left", fontFamily:"var(--font-body)" }}>
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "14px 12px" : "22px 16px" }}>
        {proView === "dashboard" && (() => {
          const upcomingMatches = matches.filter(m => m.status !== "completed" && m.status !== "cancelled")
          const previewMatches = upcomingMatches.slice(0, 3)
          return (
            <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>👋 Welcome back</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>{player.name}</div>
                <span style={{ color: isActive ? "#166534" : "#EF4444", fontSize: 11, background: isActive ? "rgba(22,101,52,0.12)" : "rgba(231,76,60,0.12)", padding: "2px 9px", borderRadius: 999, fontWeight: 800 }}>{isActive ? "PRO MEMBER" : "SUBSCRIPTION EXPIRED"}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 6, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Calendar size={12}/> {fmtDate(new Date().toISOString().split("T")[0])}</span>
                <span>·</span>
                <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Hourglass size={12}/> {upcomingMatches.length} upcoming match{upcomingMatches.length!==1?"es":""}</span>
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, fontFamily:"var(--font-head)" }}>Your Overview</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { icon:Calendar, v:stats?.matches ?? 0, label:"Matches Hosted", sub:"Matches you organized", bg:"rgba(34,197,94,0.08)", border:"rgba(34,197,94,0.3)", c:"#166534" },
                { icon:Swords, v:playerStats?.matches ?? 0, label:"Matches Played", sub:"Matches you joined", bg:"rgba(15,110,86,0.08)", border:"rgba(15,110,86,0.3)", c:"#0F6E56" },
                { icon:UsersRound, v:stats?.players ?? 0, label:"Players Managed", sub:"Across your matches", bg:"rgba(246,196,83,0.12)", border:"rgba(246,196,83,0.3)", c:"#B8860B" },
                { icon:MapPin, v:stats?.venues ?? 0, label:"Grounds", sub:"Grounds you've used", bg:"rgba(245,158,11,0.08)", border:"rgba(246,196,83,0.15)", c:"#B8860B" },
              ].map((s,i) => (
                <div key={i} style={{ padding: "14px 14px", background: s.bg, borderRadius: 14, border: `1.5px solid ${s.border}` }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.6)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}><s.icon size={14} color={s.c}/></div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.c, fontFamily: "var(--font-head)" }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "#0F172A", fontWeight: 700, marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: "#94A3B8", marginTop:1 }}>{s.sub}</div>
                </div>
              ))}
            </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>Upcoming Matches</h2>
                {upcomingMatches.length > 3 && (
                  <button onClick={() => setProView("matches")} style={{ background: "none", border: "none", color: "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer", display:"flex", alignItems:"center", gap:3 }}>View All <ChevronRight size={14}/></button>
                )}
              </div>

              {upcomingMatches.length === 0 ? (
                <Card style={{ padding: "32px 16px", textAlign: "center", marginBottom: 20 }}>
                  <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><Swords size={36} color="#F1F5F9" /></div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>Ready to host your first match?</div>
                  {active && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Tap "Schedule Match" below to get started.</div>}
                </Card>
              ) : (
                <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
                  {previewMatches.map(m => (
                    <Card key={m.id} onClick={() => loadDetail(m)} style={{ padding: "16px", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <Av name={matchTitle(m)} id={m.id} sz={38}/>
                        <div style={{ flex: 1, minWidth:0 }}>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)" }}>{matchTitle(m)}</div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {fmtDate(m.date)}</div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><Clock size={12}/> {m.time_slot}</div>
                          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {m.ground}</div>
                        </div>
                        <span style={{ background: "#166534", color: "#0F172A", borderRadius: 7, padding: "4px 11px", fontSize: 11, fontWeight: 700, textTransform: "capitalize", display: "inline-block", flexShrink:0 }}>{m.status}</span>
                        <ChevronRight size={16} color="#94A3B8" style={{ flexShrink:0, marginTop:2 }}/>
                      </div>
                      {(() => {
                        const joined = matchCounts[m.id] || 0
                        const cap = m.max_players || 0
                        const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                        const left = Math.max(0, cap - joined)
                        return (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", display:"inline-flex", alignItems:"center", gap:4 }}><Users size={12}/> {joined}/{cap} joined</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: left > 0 ? "#166534" : "#EF4444" }}>{left > 0 ? left + " spots left" : "Full"}</span>
                            </div>
                            <div style={{ height: 8, background: "#E2E8F0", borderRadius: 6, overflow: "hidden" }}>
                              <div style={{ width: pct + "%", height: "100%", background: pct >= 100 ? "#166534" : "linear-gradient(90deg,rgba(34,197,94,0.15),#166534)", borderRadius: 6, transition: "width 0.3s" }} />
                            </div>
                          </div>
                        )
                      })()}
                    </Card>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 12px", fontSize: isMobile ? 16 : 18, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>Quick Actions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label:"Schedule Match", icon:Plus, action:()=>setShowSchedule(true), disabled:!active },
                    { label:"My Players", icon:Users, action:()=>setProView("players"), disabled:false },
                    { label:"New Auction", icon:Trophy, action:()=>setShowCreateAuction(true), disabled:!active },
                    { label:"My Auctions", icon:ClipboardList, action:()=>setProView("auctions"), disabled:false },
                  ].map((a,i) => (
                    <button key={i} onClick={a.action} disabled={a.disabled} style={{ padding: "16px 8px", borderRadius: 14, background: "#F8FAF8", border: "1.5px solid #E2E8F0", cursor: a.disabled ? "not-allowed" : "pointer", opacity: a.disabled ? 0.5 : 1, display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center" }}>
                      <div style={{ width:34, height:34, borderRadius:10, background:"rgba(34,197,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}><a.icon size={17} color="#166534"/></div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>{a.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Card style={{ padding: "16px", background: active ? "linear-gradient(135deg,#166534,#0F766E)" : "rgba(231,76,60,0.12)" }}>
                <div style={{ fontWeight: 800, fontSize: 14, fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 8, color: active ? "#FFFFFF" : "#EF4444" }}>
                  {active ? (<><Star size={16} /> PRO Membership</>) : (<><AlertTriangle size={16} /> Subscription Expired</>)}
                </div>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9, color: active ? "#FFFFFF" : "#EF4444" }}>
                  {active ? `Expires ${player.subscription_expiry} \u00b7 ${daysLeft} day${daysLeft > 1 ? "s" : ""} left` : "Contact admin to renew your subscription."}
                </div>
              </Card>
            </div>
          )
        })()}

        {proView === "matches" && (() => {
          const tabbedMatches = matches.filter(m => {
            if (matchesTab === "hosted") return m.status !== "completed" && m.status !== "cancelled"
            if (matchesTab === "past") return m.status === "completed"
            return m.status === "cancelled"
          })
          return (
            <div>
              <button onClick={() => setProView("dashboard")} style={{ background: "none", border: "none", color: "#166534", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>← Dashboard</button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>My Matches</h2>
                <button onClick={() => setShowSchedule(true)} disabled={!active} style={{ padding: "9px 14px", borderRadius: 10, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 800, cursor: active ? "pointer" : "not-allowed", fontFamily: "var(--font-head)", opacity: active ? 1 : 0.5 }}>＋ New Match</button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1.5px solid #E2E8F0" }}>
                {[["hosted", "Hosted"], ["past", "Past"], ["cancelled", "Cancelled"]].map(([v, label]) => (
                  <button key={v} onClick={() => setMatchesTab(v)} style={{ padding: "10px 4px", background: "none", border: "none", borderBottom: matchesTab === v ? "2.5px solid #166534" : "2.5px solid transparent", color: matchesTab === v ? "#166534" : "#94A3B8", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}>{label}</button>
                ))}
              </div>

              {tabbedMatches.length === 0 ? (
                <Card style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><Swords size={36} color="#F1F5F9" /></div>
                  <div style={{ fontSize: 14, color: "#64748B" }}>
                    {matchesTab === "hosted" ? "Ready to host your first match?" : matchesTab === "past" ? "No completed matches yet." : "No cancelled matches."}
                  </div>
                </Card>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {tabbedMatches.map(m => (
                    <Card key={m.id} onClick={() => loadDetail(m)} style={{ padding: "16px", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)" }}>{matchTitle(m)}</div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} /> {fmtDate(m.date)}</div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>⏰ {m.time_slot}</div>
                          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {m.ground}</div>
                        </div>
                      </div>
                      {(() => {
                        const joined = matchCounts[m.id] || 0
                        const cap = m.max_players || 0
                        const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                        const left = Math.max(0, cap - joined)
                        return (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", display:"inline-flex", alignItems:"center", gap:4 }}><Users size={12}/> {joined}/{cap} joined</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: left > 0 ? "#166534" : "#EF4444" }}>{left > 0 ? left + " spots left" : "Full"}</span>
                            </div>
                            <div style={{ height: 8, background: "#E2E8F0", borderRadius: 6, overflow: "hidden" }}>
                              <div style={{ width: pct + "%", height: "100%", background: pct >= 100 ? "#166534" : "linear-gradient(90deg,rgba(34,197,94,0.15),#166534)", borderRadius: 6, transition: "width 0.3s" }} />
                            </div>
                          </div>
                        )
                      })()}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

                {proView === "players" && (() => {
          const q = playerSearch.trim().toLowerCase()
          let list = groupPlayers.filter(p => !q || p.name.toLowerCase().includes(q))
          if (playersTab === "active") list = [...list].sort((a,b) => b.played - a.played)
          else if (playersTab === "recent") list = [...list].sort((a,b) => (b.lastPlayedDate||"").localeCompare(a.lastPlayedDate||""))
          else list = [...list].sort((a,b) => a.name.localeCompare(b.name))
          return (
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>My Players</h2>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>{groupPlayers.length} player{groupPlayers.length!==1?"s":""} in your network</div>

            {groupPlayers.length === 0 ? (
              <Card style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ marginBottom: 10, display:"flex", justifyContent:"center" }}><Users size={36} color="#F1F5F9"/></div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>No Players Yet</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6, marginBottom: 16 }}>Invite players to your first match.</div>
                <button onClick={() => setShowSchedule(true)} disabled={!active} style={{ padding: "12px 20px", borderRadius: 10, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: active ? "pointer" : "not-allowed", fontFamily: "var(--font-head)", opacity: active ? 1 : 0.5 }}>Invite Players</button>
              </Card>
            ) : (
              <>
                <input value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} placeholder="Search players..." style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", background: "#FFFFFF", boxSizing: "border-box", marginBottom: 12, fontFamily: "var(--font-body)" }}/>

                <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1.5px solid #E2E8F0" }}>
                  {[["active", "Most Active"], ["recent", "Recent"], ["all", "All"]].map(([v, label]) => (
                    <button key={v} onClick={() => setPlayersTab(v)} style={{ padding: "10px 4px", background: "none", border: "none", borderBottom: playersTab === v ? "2.5px solid #166534" : "2.5px solid transparent", color: playersTab === v ? "#166534" : "#94A3B8", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}>{label}</button>
                  ))}
                </div>

                {list.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8", fontSize: 13 }}>No players match "{playerSearch}"</div>
                ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {list.map((p, i) => (
                  <Card key={p.id} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ position: "relative" }}>
                        <Av name={p.name} id={p.id} sz={42}/>
                        {playersTab === "active" && i < 3 && <span style={{ position: "absolute", top: -4, left: -4, background: i === 0 ? "#F59E0B" : i === 1 ? "#F1F5F9" : "#B8860B", color: "#0F172A", fontSize: 9, fontWeight: 800, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8" }}>{p.city || ""}{playersTab === "recent" && p.lastPlayedDate ? ` · Last played ${fmtDate(p.lastPlayedDate)}` : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: "rgba(34,197,94,0.08)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.3)" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)" }}>{p.played}</div>
                        <div style={{ fontSize: 9, color: "#166534", fontWeight: 600 }}>PLAYED</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: "rgba(231,76,60,0.08)", borderRadius: 8, border: "1px solid rgba(231,76,60,0.15)" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#EF4444", fontFamily: "var(--font-head)" }}>{p.declined}</div>
                        <div style={{ fontSize: 9, color: "#EF4444", fontWeight: 600 }}>DECLINED</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: "rgba(245,158,11,0.08)", borderRadius: 8, border: "1px solid rgba(246,196,83,0.15)" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#B8860B", fontFamily: "var(--font-head)" }}>₹{p.contributed}</div>
                        <div style={{ fontSize: 9, color: "#B8860B", fontWeight: 600 }}>PAID</div>
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
      </div>

        {proView === "leaderboard" && <LeaderboardPage isMobile={isMobile} myId={player.id}/>}
      {proView === "auctions" && (() => {
        const mStyle = { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:isMobile?"flex-end":"center", justifyContent:"center", zIndex:300 }
        const mBox = { background:"#F8FAF8", borderRadius:isMobile?"20px 20px 0 0":20, padding:isMobile?"22px 18px":28, width:"100%", maxWidth:isMobile?"100%":420, maxHeight:isMobile?"95vh":"auto", overflowY:"auto", boxSizing:"border-box" }
        const aiS = { width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", boxSizing:"border-box", fontFamily:"var(--font-body)" }

        if (!managingAuction) {
          return (
            <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "0 12px" : "0 16px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>My Auctions</h2>
              <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Auctions you've created</div>
              {loadingAuctions ? <Spinner/> : myAuctions.length === 0 ? (
                <Card style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, color: "#64748B" }}>You haven't created any auctions yet.</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6, marginBottom: 16 }}>Use "New Auction" from the Dashboard to get started.</div>
                  <button onClick={() => setShowCreateAuction(true)} disabled={!active} style={{ padding: "12px 20px", borderRadius: 10, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: active ? "pointer" : "not-allowed", fontFamily: "var(--font-head)", opacity: active ? 1 : 0.5 }}>New Auction</button>
                </Card>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {myAuctions.map(a => {
                    const canManage = a.payment_status === "paid" || a.payment_status === "free"
                    return (
                      <Card key={a.id} onClick={() => canManage && (setManagingAuction(a), setAuctionSubTab("players"))} style={{ padding: "16px", cursor: canManage ? "pointer" : "default" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)" }}>{a.name}</div>
                          <span style={{ background: a.status==="completed"?"#0F172A":a.status==="live"?"#22C55E":"#94A3B8", color: "#FFFFFF", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, textTransform: "capitalize", flexShrink: 0 }}>{a.status}</span>
                        </div>
                        {a.location && <div style={{ fontSize: 12, color: "#64748B", marginBottom: 2, display:"flex", alignItems:"center", gap:4 }}><MapPin size={11}/> {a.location}</div>}
                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>{a.auction_date ? fmtDate(a.auction_date) : "Date TBD"}{a.auction_time ? ` · ${a.auction_time}` : ""}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#7A4F13", fontWeight: 700, background: "rgba(246,196,83,0.15)", padding: "3px 8px", borderRadius: 7 }}>{a.plan_tier} · up to {a.max_teams} teams</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: a.payment_status==="pending"?"#B8860B":"#166534", textTransform: "capitalize" }}>{a.payment_status}</span>
                        </div>
                        {!canManage && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, fontStyle: "italic" }}>Awaiting payment confirmation before this can be managed.</div>}
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )
        }

        return (
          <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "0 12px" : "0 16px" }}>
            <button onClick={() => setManagingAuction(null)} style={{ background: "none", border: "none", color: "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 6 }}>← My Auctions</button>
            <h2 style={{ margin: "0 0 16px", fontSize: isMobile ? 17 : 20, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>{managingAuction.name}</h2>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, background: auctionRegOpen ? "rgba(34,197,94,0.08)" : "rgba(231,76,60,0.08)", border: `1.5px solid ${auctionRegOpen ? "rgba(34,197,94,0.3)" : "rgba(231,76,60,0.2)"}`, marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: auctionRegOpen ? "#166534" : "#EF4444", fontFamily: "var(--font-head)" }}>Public Registration: {auctionRegOpen ? "Open" : "Closed"}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{auctionRegOpen ? "Anyone with the link can register." : "New registrations are blocked."}</div>
              </div>
              <button onClick={toggleAuctionRegistration} disabled={auctionRegBusy} style={{ padding: "9px 16px", borderRadius: 9, border: "none", background: auctionRegOpen ? "#EF4444" : "#166534", color: "#FFFFFF", fontSize: 12, fontWeight: 800, cursor: auctionRegBusy ? "not-allowed" : "pointer", fontFamily: "var(--font-head)", flexShrink: 0 }}>{auctionRegBusy ? "..." : (auctionRegOpen ? "Close" : "Open")}</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18, borderBottom: "1.5px solid #E2E8F0" }}>
              {[["players", `Player Pool (${auctionPlayers.length})`], ["teams", `Teams (${auctionTeams.length})`], ["live", "Live Auction"]].map(([v, label]) => (
                <button key={v} onClick={() => setAuctionSubTab(v)} style={{ padding: "10px 4px", background: "none", border: "none", borderBottom: auctionSubTab===v?"2.5px solid #166534":"2.5px solid transparent", color: auctionSubTab===v?"#166534":"#94A3B8", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}>{label}</button>
              ))}
            </div>

            {auctionSubTab === "players" && (
              auctionPlayers.length === 0 ? (
                <Card style={{ padding: "32px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 14, color: "#64748B" }}>No players have registered yet.</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Share the registration link to start collecting entries.</div>
                </Card>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {auctionPlayers.map(p => (
                    <Card key={p.id} style={{ padding: "14px 16px" }}>
                      <div onClick={() => setViewingAuctionPlayer(p)} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, cursor: "pointer" }}>
                        <Av name={p.name} id={p.id} sz={38}/>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", fontFamily: "var(--font-head)" }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}><Phone size={11}/> {p.phone}{p.playing_role ? ` · ${p.playing_role}` : ""}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeAuctionPlayer(p) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4 }}><Trash2 size={16}/></button>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Base Price ₹</span>
                        <input type="number" min="0" value={priceDrafts[p.id] !== undefined ? priceDrafts[p.id] : (p.base_price ?? "")} onChange={e => setPriceDrafts({ ...priceDrafts, [p.id]: e.target.value })} onBlur={() => saveAuctionPrice(p.id)} placeholder="0" style={{ ...aiS, flex: 1, padding: "8px 10px" }}/>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}

            {auctionSubTab === "teams" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                  <button onClick={openAddAuctionTeam} style={{ padding: "9px 16px", borderRadius: 9, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}>+ Add Team</button>
                </div>
                {auctionTeams.length === 0 ? (
                  <Card style={{ padding: "32px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, color: "#64748B" }}>No teams set up yet.</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Add each team and set their starting purse before the auction begins.</div>
                  </Card>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {auctionTeams.map(t => (
                      <Card key={t.id} style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <TeamAv name={t.name} logo={null} size={38}/>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", fontFamily: "var(--font-head)" }}>{t.name}</div>
                            {t.owner_name && <div style={{ fontSize: 12, color: "#94A3B8" }}>{t.owner_name}</div>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#166534", fontFamily: "var(--font-head)" }}>₹{t.purse_remaining}</div>
                            <div style={{ fontSize: 10, color: "#94A3B8" }}>of ₹{t.purse_total}</div>
                          </div>
                          <button onClick={() => openEditAuctionTeam(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 4 }}>Edit</button>
                          <button onClick={() => setDelAuctionTeam(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4 }}><Trash2 size={16}/></button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {auctionSubTab === "live" && <AuctionLiveConsole isMobile={isMobile} auctionPlayers={auctionPlayers} auctionTeams={auctionTeams} onPoolChange={loadAuctionPool} auctionId={managingAuction.id}/>}

            {showAddAuctionTeam && (
              <div style={mStyle} onClick={() => setShowAddAuctionTeam(false)}>
                <div style={mBox} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>{editAuctionTeam ? "Edit Team" : "Add Auction Team"}</h3>
                    <button onClick={() => setShowAddAuctionTeam(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>×</button>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 5, fontWeight: 600 }}>Team Name *</div>
                  <input value={auctionTeamName} onChange={e => setAuctionTeamName(e.target.value)} placeholder="e.g. Mumbai Warriors" autoFocus style={{ ...aiS, marginBottom: 12 }}/>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 5, fontWeight: 600 }}>Owner / Captain</div>
                  <input value={auctionTeamOwner} onChange={e => setAuctionTeamOwner(e.target.value)} placeholder="e.g. Sahir Attar" style={{ ...aiS, marginBottom: 12 }}/>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 5, fontWeight: 600 }}>Starting Purse (₹) *</div>
                  <input type="number" min="0" value={auctionTeamPurse} onChange={e => setAuctionTeamPurse(e.target.value)} placeholder="e.g. 10000" style={{ ...aiS, marginBottom: 16 }}/>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setShowAddAuctionTeam(false)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#F8FAF8", fontSize: 14, cursor: "pointer" }}>Cancel</button>
                    <button onClick={saveAuctionTeam} disabled={auctionBusy} style={{ flex: 2, padding: "12px", borderRadius: 9, background: "#FFFFFF", border: "none", color: "#0F172A", fontSize: 14, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)" }}>{auctionBusy ? "Saving..." : (editAuctionTeam ? "Save Changes" : "Add Team")}</button>
                  </div>
                </div>
              </div>
            )}

            {delAuctionTeam && (
              <div style={mStyle} onClick={() => setDelAuctionTeam(null)}>
                <div style={mBox} onClick={e => e.stopPropagation()}>
                  <div style={{ textAlign: "center", padding: "10px 0 18px" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                    <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>Delete Team?</h3>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Delete <strong>{delAuctionTeam.name}</strong>? This can't be undone.</p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setDelAuctionTeam(null)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#F8FAF8", fontSize: 14, cursor: "pointer" }}>Cancel</button>
                    <button onClick={confirmDeleteAuctionTeam} disabled={auctionBusy} style={{ flex: 1, padding: "12px", borderRadius: 9, background: "#EF4444", border: "none", color: "#FFFFFF", fontSize: 14, cursor: "pointer", fontWeight: 800 }}>{auctionBusy ? "Deleting..." : "Delete"}</button>
                  </div>
                </div>
              </div>
            )}

            {viewingAuctionPlayer && (
              <div style={mStyle} onClick={() => setViewingAuctionPlayer(null)}>
                <div style={mBox} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>Player Details</h3>
                    <button onClick={() => setViewingAuctionPlayer(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>×</button>
                  </div>
                  <div style={{ display: "flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom: 18 }}>
                    {viewingAuctionPlayer.profile_image_url ? (
                      <img src={viewingAuctionPlayer.profile_image_url} alt={viewingAuctionPlayer.name} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border:"3px solid #166534", marginBottom:10 }}/>
                    ) : (
                      <Av name={viewingAuctionPlayer.name} id={viewingAuctionPlayer.id} sz={100}/>
                    )}
                    <div style={{ fontWeight: 900, fontSize: 17, color: "#0F172A", fontFamily: "var(--font-head)", marginTop:8 }}>{viewingAuctionPlayer.name}</div>
                    <div style={{ fontSize: 13, color: "#64748B", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}><Phone size={12}/> {viewingAuctionPlayer.phone}</div>
                    {viewingAuctionPlayer.category && <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, color: "#B8860B", background: "rgba(246,196,83,0.15)", padding: "2px 8px", borderRadius: 999 }}>{viewingAuctionPlayer.category}</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 9 }}><div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>CITY</div><div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{viewingAuctionPlayer.city || "—"}</div></div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 9 }}><div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>DATE OF BIRTH</div><div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{viewingAuctionPlayer.birth_date ? fmtDate(viewingAuctionPlayer.birth_date) : "—"}</div></div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 9 }}><div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>PLAYING ROLE</div><div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{viewingAuctionPlayer.playing_role || "—"}</div></div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 9 }}><div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>STATUS</div><div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600, textTransform: "capitalize" }}>{viewingAuctionPlayer.status}{viewingAuctionPlayer.status === "sold" && viewingAuctionPlayer.sold_price ? ` · ₹${viewingAuctionPlayer.sold_price}` : ""}</div></div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 9 }}><div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>JERSEY NUMBER</div><div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{viewingAuctionPlayer.jersey_number || "—"}</div></div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 9 }}><div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>JERSEY SIZE</div><div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{viewingAuctionPlayer.jersey_size || "—"}</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px", background: "rgba(34,197,94,0.08)", borderRadius: 9 }}>
                    <span style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>Base Price ₹</span>
                    <input type="number" min="0" value={priceDrafts[viewingAuctionPlayer.id] !== undefined ? priceDrafts[viewingAuctionPlayer.id] : (viewingAuctionPlayer.base_price ?? "")} onChange={e => setPriceDrafts({ ...priceDrafts, [viewingAuctionPlayer.id]: e.target.value })} onBlur={() => saveAuctionPrice(viewingAuctionPlayer.id)} placeholder="0" style={{ ...aiS, flex: 1, padding: "8px 10px", background: "#FFFFFF" }}/>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {proView === "profile" && (() => {
        return (
          <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "0 12px" : "0 16px" }}>

            {/* Header: Avatar, Name, Phone */}
            <Card style={{ padding: "16px", marginBottom: 16, position:"relative" }}>
              {!editingProfile && <button onClick={() => {
                const parts = (player.name || "").trim().split(/\s+/)
                setPForm({ firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "", phone: player.phone || "", pin: player.pin, city: player.city || "", birthDate: player.birth_date || "", jerseyNumber: player.jersey_number || "", jerseySize: player.jersey_size || "", photoFile: null, photoPreview: player.profile_image_url || "" })
                setEditingProfile(true)
              }} style={{ position:"absolute", top:14, right:14, padding: "6px 14px", borderRadius: 8, background: "rgba(246,196,83,0.12)", border: "1px solid rgba(246,196,83,0.3)", color: "#B8860B", fontSize: 12, cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>Edit</button>}
              <div style={{ display: "flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom: editingProfile ? 16 : 0 }}>
                {player.profile_image_url ? (
                  <img src={player.profile_image_url} alt={player.name} style={{ width:100, height:100, borderRadius:"50%", objectFit:"cover", border:"3px solid #166534", marginBottom:10 }}/>
                ) : (
                  <Av name={player.name} id={player.id} sz={100}/>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop:8 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>{player.name}</div>
                  {player.role && player.role !== "player" && <RoleBadge role={player.role} size="sm"/>}
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>{player.phone}</div>
              </div>
              {!editingProfile && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                  <div style={{ padding: "8px 10px", background: "#F8FAF8", borderRadius: 9 }}>
                    <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>CITY</div>
                    <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{player.city || "—"}</div>
                  </div>
                  <div style={{ padding: "8px 10px", background: "#F8FAF8", borderRadius: 9 }}>
                    <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>DATE OF BIRTH</div>
                    <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{player.birth_date ? fmtDate(player.birth_date) : "—"}</div>
                  </div>
                  <div style={{ padding: "8px 10px", background: "#F8FAF8", borderRadius: 9 }}>
                    <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>JERSEY NUMBER</div>
                    <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{player.jersey_number || "—"}</div>
                  </div>
                  <div style={{ padding: "8px 10px", background: "#F8FAF8", borderRadius: 9 }}>
                    <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>JERSEY SIZE</div>
                    <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>{player.jersey_size || "—"}</div>
                  </div>
                </div>
              )}
              {editingProfile && (
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <PhotoUploadField photoPreview={pForm.photoPreview} onPhotoSaved={(file, dataUrl) => setPForm({ ...pForm, photoFile: file, photoPreview: dataUrl })}/>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>First Name</label>
                      <input value={pForm.firstName} onChange={e => setPForm({ ...pForm, firstName: e.target.value })} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>Last Name</label>
                      <input value={pForm.lastName} onChange={e => setPForm({ ...pForm, lastName: e.target.value })} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>Phone</label>
                    <input value={pForm.phone} onChange={e => setPForm({ ...pForm, phone: e.target.value.replace(/[^0-9]/g,"").slice(0,10) })} type="tel" style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>City</label>
                    <input value={pForm.city} onChange={e => setPForm({ ...pForm, city: e.target.value })} placeholder="e.g. Thane" style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>Date of Birth</label>
                    <input value={pForm.birthDate} onChange={e => setPForm({ ...pForm, birthDate: e.target.value })} type="date" max={new Date().toISOString().split("T")[0]} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>Jersey Number</label>
                      <input value={pForm.jerseyNumber} onChange={e => setPForm({ ...pForm, jerseyNumber: e.target.value.replace(/[^0-9]/g,"").slice(0,3) })} inputMode="numeric" placeholder="e.g. 7" style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>Jersey Size</label>
                      <select value={pForm.jerseySize} onChange={e => setPForm({ ...pForm, jerseySize: e.target.value })} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "var(--font-body)" }}>
                        <option value="">Select</option>
                        {["S","M","L","XL","XXL"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 600 }}>PIN</label>
                    <input value={pForm.pin} onChange={e => setPForm({ ...pForm, pin: e.target.value.replace(/[^0-9]/g,"").slice(0,4) })} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", letterSpacing: 6, WebkitTextSecurity: "disc" }}/>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={async () => {
                      if (!pForm.firstName.trim()) { alert("First name required"); return }
                      if (!pForm.lastName.trim()) { alert("Last name required"); return }
                      if (!pForm.city.trim()) { alert("City is required"); return }
                      if (!pForm.birthDate) { alert("Date of birth is required"); return }
                      if (!pForm.jerseyNumber.trim()) { alert("Jersey number is required"); return }
                      if (!pForm.jerseySize) { alert("Jersey size is required"); return }
                      if (!pForm.photoFile && !pForm.photoPreview) { alert("Profile photo is required"); return }
                      try {
                        let photoUrl = pForm.photoPreview
                        if (pForm.photoFile) photoUrl = await uploadProfilePhoto(pForm.photoFile, pForm.phone)
                        const fullName = `${pForm.firstName.trim()} ${pForm.lastName.trim()}`
                        await updatePlayer(player.id, fullName, pForm.phone, pForm.pin, pForm.city, { birthDate: pForm.birthDate, profileImageUrl: photoUrl, jerseyNumber: pForm.jerseyNumber, jerseySize: pForm.jerseySize })
                        alert("Profile updated! Please log in again to see changes.")
                        setEditingProfile(false)
                      } catch(e) { alert(e.message) }
                    }} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#F8FAF8", border: "none", color: "#0F172A", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-head)" }}>Save</button>
                    <button onClick={() => setEditingProfile(false)} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#F8FAF8", border: "1px solid #E2E8F0", color: "#0F172A", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}
            </Card>

            {/* Organizer Settings: UPI + Default Venue */}
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Organizer Settings</div>
            <Card style={{ padding: "16px", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 6, fontFamily: "var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><CreditCard size={16}/> My UPI ID</div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Players will pay their match share to this UPI ID.</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                <input value={upiVal} onChange={e => setUpiVal(e.target.value)} placeholder="yourname@upi" style={{ flex: 1, padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                <button onClick={async () => { try { await updatePlayerUpi(player.id, upiVal.trim()); alert("UPI ID saved!") } catch(e) { alert(e.message) } }} style={{ padding: "11px 18px", borderRadius: 9, background: "#F8FAF8", border: "none", color: "#0F172A", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-head)" }}>Save</button>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 6, fontFamily: "var(--font-head)", display:"flex", alignItems:"center", gap:8 }}><MapPin size={16}/> Default Venue</div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Pre-fills the ground when you schedule a new match.</div>
              {grounds.length === 0 ? (
                <div style={{ fontSize: 13, color: "#94A3B8" }}>No venues added yet.</div>
              ) : (
                <select value={defaultGroundId} onChange={e => setDefaultGround(e.target.value)} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, fontFamily: "var(--font-body)" }}>
                  <option value="">No default</option>
                  {grounds.map(g => (
                    <option key={g.id} value={g.id}>{g.name}{g.location ? ` — ${g.location}` : ""}</option>
                  ))}
                </select>
              )}
            </Card>

            {/* Subscription */}
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Subscription</div>
            <Card style={{ padding: "16px", marginBottom: 16, background: isActive ? "linear-gradient(135deg,#166534,#0F766E)" : "#F8FAF8" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: isActive ? "#FFFFFF" : "#EF4444", fontFamily: "var(--font-head)", display:"flex", alignItems:"center", gap:8 }}>{isActive ? (<><Star size={16}/> PRO Membership</>) : (<><AlertTriangle size={16}/> Subscription Expired</>)}</div>
              <div style={{ fontSize: 12, color: isActive ? "#FFFFFF" : "#EF4444", marginTop: 4, opacity: isActive ? 0.9 : 1 }}>
                {isActive ? `Expires ${player.subscription_expiry} · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left` : "Expired — contact admin to renew."}
              </div>
            </Card>

            {/* Statistics */}
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Statistics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ padding: "14px", background: "rgba(34,197,94,0.08)", borderRadius: 12, border: "1.5px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)" }}>{stats?.matches ?? 0}</div>
                <div style={{ fontSize: 10, color: "#166534", fontWeight: 600 }}>MATCHES HOSTED</div>
              </div>
              <div style={{ padding: "14px", background: "rgba(246,196,83,0.12)", borderRadius: 12, border: "1.5px solid rgba(246,196,83,0.3)", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#B8860B", fontFamily: "var(--font-head)" }}>{stats?.players ?? 0}</div>
                <div style={{ fontSize: 10, color: "#B8860B", fontWeight: 600 }}>PLAYERS MANAGED</div>
              </div>
              <div style={{ padding: "14px", background: "rgba(245,158,11,0.08)", borderRadius: 12, border: "1.5px solid rgba(246,196,83,0.15)", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#B8860B", fontFamily: "var(--font-head)" }}>{stats?.venues ?? 0}</div>
                <div style={{ fontSize: 10, color: "#B8860B", fontWeight: 600 }}>VENUES</div>
              </div>
            </div>

            {/* Support & Logout */}
            <Card style={{ padding: "6px", marginBottom: 24 }}>
              <a href="mailto:selectedhelpline@gmail.com" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 10px", color: "#0F172A", fontSize: 14, fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #F1F5F9" }}>Support</a>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 10px", color: "#0F172A", fontSize: 14, fontWeight: 600, borderBottom: "1px solid #F1F5F9" }}>Privacy</div>
              <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 10px", border: "none", background: "transparent", color: "#EF4444", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}><LogOut size={16}/> Logout</button>
            </Card>
          </div>
        )
      })()}
      {proView === "dashboard" && invites.length > 0 && (
        <div style={{ marginTop: 24, maxWidth: 660, margin: "24px auto 0", padding: isMobile ? "0 12px" : "0 16px" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)", display:"flex", alignItems:"center", gap:9 }}><Mail size={isMobile?18:20}/> Invited Matches</h2>
          <div style={{ display:"flex", gap:6, marginBottom:12 }}>
            {["upcoming","completed"].map(f => (
              <button key={f} onClick={()=>setInviteFilter(f)} style={{ padding:"6px 14px", borderRadius:7, border:"none", background:inviteFilter===f?"#F8FAF8":"#F8FAF8", color:inviteFilter===f?"#0F172A":"#64748B", fontSize:12, cursor:"pointer", fontWeight:inviteFilter===f?700:500, fontFamily:"var(--font-body)", textTransform:"capitalize" }}>{f}</button>
            ))}
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {filteredInvites.length === 0 ? (
              <div style={{ color:"#94A3B8", fontSize:13, textAlign:"center", padding:"16px 0" }}>No {inviteFilter} invites.</div>
            ) : filteredInvites.map(({ match: m, myStatus }) => (
              <Card key={m.id} onClick={() => loadInvDetail(m)} style={{ padding: "16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)", display:"flex", alignItems:"center", gap:6 }}>{matchTitle(m)}{m.visibility === "public" && <span style={{ background:"rgba(37,99,235,0.1)", color:"#2563EB", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:999, textTransform:"uppercase" }}>Public</span>}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 3, display:"flex", alignItems:"center", gap:4 }}><Calendar size={12}/> {fmtDate(m.date)}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>⏰ {m.time_slot}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, display:"flex", alignItems:"center", gap:4 }}><MapPin size={12}/> {m.ground}</div>
                  </div>
                  <span style={{ background:myStatus==="confirmed"?"#166534":myStatus==="waitlist"?"#B8860B":myStatus==="declined"?"#EF4444":"rgba(216,176,91,0.15)", color:"#0F172A", borderRadius:7, padding:"5px 12px", fontSize:12, fontWeight:700, display:"inline-flex", alignItems:"center", gap:6 }}>
                    {myStatus === "confirmed" ? (<><CheckCircle2 size={14}/> You are in!</>) : myStatus === "waitlist" ? (<><Hourglass size={14}/> Waitlist</>) : myStatus === "declined" ? (<><XCircle size={14}/> Declined</>) : "Awaiting reply"}
                  </span>
                </div>
                {m.status === "upcoming" && myStatus === "pending" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                    <button onClick={async (ev) => { ev.stopPropagation(); try { await confirmPlayerToMatch(m.id, player.id, "confirmed"); loadInvites() } catch(e) { alert(e.message) } }} style={{ padding: "12px", borderRadius: 10, background: "#166534", border: "none", color: "#0F172A", fontSize: 14, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><CheckCircle2 size={16}/> Available</button>
                    <button onClick={async (ev) => { ev.stopPropagation(); try { await confirmPlayerToMatch(m.id, player.id, "declined"); loadInvites() } catch(e) { alert(e.message) } }} style={{ padding: "12px", borderRadius: 10, background: "rgba(231,76,60,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><XCircle size={16}/> Not Available</button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}


      {showSchedule && (
        <ProScheduleModal grounds={grounds} teams={teams} player={player} isMobile={isMobile} defaultGroundId={defaultGroundId}
          onClose={() => setShowSchedule(false)}
          onCreated={() => { setShowSchedule(false); load() }} />
      )}

      {showCreateAuction && (
        <CreateAuctionFlow organizerId={player.id} isMobile={isMobile}
          onClose={() => setShowCreateAuction(false)}
          onCreated={() => setShowCreateAuction(false)} />
      )}

      {/* PRO_BOTTOM_NAV_BAR_V1 */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#FFFFFF", borderTop:"1px solid #E2E8F0", display:"flex", zIndex:200, boxShadow:"0 -4px 16px rgba(15,23,42,0.06)" }}>
        {[["dashboard","Home",Home],["matches","Matches",Swords],["players","Players",Users],["leaderboard","Leaderboard",Trophy],["profile","Profile",User]].map(([k,v,Icon]) => (
          <button key={k} onClick={()=>setProView(k)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"9px 4px 8px", border:"none", background:"transparent", cursor:"pointer", color:proView===k?"#166534":"#94A3B8" }}>
            <Icon size={20}/>
            <span style={{ fontSize:10, fontWeight:proView===k?700:500 }}>{v}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
