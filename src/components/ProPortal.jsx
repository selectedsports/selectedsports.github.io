import { useState, useEffect } from "react"
import { LogoFull, Av, Tag, Card, Spinner , StatsBanner, Bell, MessageInbox, LeaderboardPage, DirectMessagesButton} from "./ui.jsx"
import { fetchMatches, fetchGrounds, fetchTeams, createMatch, addTeam, deleteMatch, fetchMatchPlayers, fetchExpenses, fetchPayments, fetchChat, fetchPublicResponses, updateMatchStatus, fetchPlayers, fetchSettings , fetchStats, fetchProStats, fetchMatchCounts, fetchProGroupPlayers, fetchMyInvites, confirmPlayerToMatch, updatePlayer, updatePlayerUpi, fetchInboxMessages, countUnreadMessages, markMessagesRead} from "../db.js"
import { fmtDate, dayName } from "../constants.js"
import { MatchDetail, CalendarPage } from "./AdminPortal.jsx"
import { MatchDetailPlayer } from "./PlayerPortal.jsx"
import { useMobile } from "../hooks/useMobile.js"

function timeSlotStr(sh, sm, eh, em) {
  const f = (h, m) => { const ap = h >= 12 ? "PM" : "AM"; const hh = h % 12 === 0 ? 12 : h % 12; return `${hh}:${m} ${ap}` }
  return `${f(sh, sm)} - ${f(eh, em)}`
}

function ProScheduleModal({ grounds, teams, player, onClose, onCreated, isMobile }) {
  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({ date: today, startH: 7, startM: "00", endH: 9, endM: "00", groundId: grounds[0]?.id || "", teamId: teams[0]?.id || "", type: "external", maxPlayers: 9 })
  const [teamList, setTeamList] = useState(teams)
  const [busy, setBusy] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")

  const selGround = grounds.find(g => String(g.id) === String(form.groundId))
  const selTeam = teamList.find(t => String(t.id) === String(form.teamId))

  const addNewTeam = async () => {
    if (!newTeamName.trim()) { alert("Team name required"); return }
    try {
      const created = await addTeam(newTeamName.trim(), null)
      setTeamList([...teamList, created])
      setForm(f => ({ ...f, teamId: created.id }))
      setShowAddTeam(false); setNewTeamName("")
    } catch(e) { alert(e.message) }
  }

  const create = async () => {
    if (!selGround) { alert("Please select a ground"); return }
    if (form.type === "external" && !selTeam) { alert("Please select a team"); return }
    setBusy(true)
    const timeSlot = timeSlotStr(form.startH, form.startM, form.endH, form.endM)
    const teamName = form.type === "internal" ? `Internal ${form.maxPlayers/2}v${form.maxPlayers/2}` : selTeam.name
    const teamLogo = form.type === "internal" ? null : (selTeam?.logo_url || null)
    try {
      await createMatch({ date: form.date, time_slot: timeSlot, ground: selGround.name, team: teamName, team_logo: teamLogo, type: form.type, max_players: form.maxPlayers, created_by: player.id })
      onCreated()
    } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const lS = { fontSize: 12, color: "#6b7280", display: "block", marginBottom: 5, fontWeight: 600 }
  const iS = { width: "100%", padding: "11px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 15, boxSizing: "border-box", fontFamily: "var(--font-body)", outline: "none" }
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 5)

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: "#fff", borderRadius: isMobile ? "20px 20px 0 0" : 20, padding: isMobile ? "24px 18px" : 30, width: "100%", maxWidth: isMobile ? "100%" : 500, maxHeight: isMobile ? "95vh" : "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>Schedule Match</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af" }}>×</button>
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
              {[["external", "⚽ External Match", "vs another team"], ["internal", "🔵 Internal Match", "within our group"]].map(([v, l, sub]) => (
                <button key={v} onClick={() => setForm({ ...form, type: v, maxPlayers: v === "internal" ? 18 : 9 })} style={{ padding: "12px 8px", borderRadius: 9, border: `2px solid ${form.type === v ? "#1D9E75" : "#e5e7eb"}`, background: form.type === v ? "#f0fdf4" : "#fff", color: form.type === v ? "#065f46" : "#6b7280", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: form.type === v ? 800 : 600 }}>{l}</div>
                  <div style={{ fontSize: 10, color: form.type === v ? "#059669" : "#9ca3af", marginTop: 2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
          {form.type === "external" && (
            <div>
              <label style={lS}>Our Squad Size</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setForm({ ...form, maxPlayers: n })} style={{ flex: 1, padding: "11px 4px", borderRadius: 9, border: `2px solid ${form.maxPlayers === n ? "#1D9E75" : "#e5e7eb"}`, background: form.maxPlayers === n ? "#f0fdf4" : "#fafafa", color: form.maxPlayers === n ? "#065f46" : "#6b7280", fontSize: 14, cursor: "pointer", fontWeight: form.maxPlayers === n ? 800 : 600 }}>{n}</button>
                ))}
              </div>
              <div style={{ padding: "8px 12px", background: "#F5E6C8", borderRadius: 9, border: "1px solid #E3C888", marginBottom: 14, fontSize: 12, color: "#7A4F13", fontWeight: 600 }}>👥 Our squad: {form.maxPlayers} players</div>
              <label style={lS}>Opponent Team</label>
              <select value={form.teamId} onChange={e => { if (e.target.value === "__add") { setShowAddTeam(true); setNewTeamName("") } else setForm({ ...form, teamId: e.target.value }) }} style={iS}>
                <option value="">Select team...</option>
                {teamList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                <option value="__add">+ Add new team</option>
              </select>
            </div>
          )}
          {form.type === "internal" && (
            <div>
              <label style={lS}>Total Players</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[10,12,14,16,18,20,22].map(n => (
                  <button key={n} onClick={() => setForm({ ...form, maxPlayers: n })} style={{ flex: "1 1 calc(25% - 6px)", padding: "11px 4px", borderRadius: 9, border: `2px solid ${form.maxPlayers === n ? "#1D9E75" : "#e5e7eb"}`, background: form.maxPlayers === n ? "#f0fdf4" : "#fafafa", color: form.maxPlayers === n ? "#065f46" : "#6b7280", fontSize: 14, cursor: "pointer", fontWeight: form.maxPlayers === n ? 800 : 600 }}>{n}</button>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "12px 14px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #6ee7b7", fontSize: 13, color: "#065f46", fontWeight: 700 }}>{form.maxPlayers/2}v{form.maxPlayers/2} · {form.maxPlayers} players · Two equal sides</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={create} disabled={busy} style={{ flex: 2, padding: "13px", borderRadius: 10, background: "#0B3D2E", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)" }}>{busy ? "Creating..." : "Create Match"}</button>
        </div>

        {showAddTeam && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }} onClick={() => setShowAddTeam(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 360 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#0B3D2E" }}>Add New Team</h3>
              <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Team name" autoFocus style={{ ...iS, marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddTeam(false)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button onClick={addNewTeam} style={{ flex: 2, padding: "12px", borderRadius: 9, background: "#0B3D2E", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Add & Select</button>
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
  const [detail, setDetail] = useState(null)
  const [stats, setStats] = useState(null)
  const [upiVal, setUpiVal] = useState("")
  const [editingProfile, setEditingProfile] = useState(false)
  const [pForm, setPForm] = useState({ name: player.name, phone: player.phone || "", pin: player.pin })
  const [proView, setProView] = useState("matches")
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
  const [tab, setTab] = useState(()=>{ try { return sessionStorage.getItem("ss_pro_tab") || "matches" } catch { return "matches" } })
  const [myPlayers, setMyPlayers] = useState([])
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [npFirst, setNpFirst] = useState("")
  const [npLast, setNpLast] = useState("")
  const [npPhone, setNpPhone] = useState("")
  const [npPin, setNpPin] = useState("")
  const [npBusy, setNpBusy] = useState(false)
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

  const capFn = (v) => v.replace(/[^a-zA-Z]/g,"").replace(/^(.)(.*)$/, (m,a,b)=>a.toUpperCase()+b.toLowerCase())
  const loadPlayers = async () => {
    try { const p = await fetchPlayersByCreator(player.id); setMyPlayers(p) } catch {}
  }
  const addMyPlayer = async () => {
    if (!npFirst.trim()) { alert("First name required"); return }
    if (npPhone.length !== 10) { alert("Enter a valid 10-digit number"); return }
    if (npPin.length !== 4) { alert("PIN must be 4 digits"); return }
    setNpBusy(true)
    try {
      await addPlayer((npFirst.trim()+" "+npLast.trim()).trim(), npPhone, npPin, player.id)
      setNpFirst(""); setNpLast(""); setNpPhone(""); setNpPin(""); setShowAddPlayer(false)
      await loadPlayers()
    } catch(e) { alert(e.message) }
    setNpBusy(false)
  }

  const expiry = player.subscription_expiry ? new Date(player.subscription_expiry) : null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const active = expiry && expiry >= today
  const daysLeft = expiry ? Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)) : 0

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
  useEffect(() => { try { sessionStorage.setItem("ss_pro_tab", tab) } catch {} }, [tab])

  if (loading) return <div style={{ minHeight: "100vh", background: "#FBF3E7", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>

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
      <div style={{ minHeight: "100vh", background: "#FBF3E7", fontFamily: "var(--font-body)" }}>
        <div style={{ background: "#0B3D2E", height: 54,borderBottom:"3px dashed #A6192E", display: "flex", alignItems: "center", padding: "0 16px", gap: 10 }}>
          <div onClick={()=>{ setDetail(null); setInvDetail(null); setProView("matches") }} style={{ cursor:"pointer" }}><LogoFull size={28} /></div>
          <span style={{ color: "#6ee7b7", fontSize: 11, background: "rgba(29,158,117,0.2)", padding: "2px 8px", borderRadius: 5, fontWeight: 700 }}>PRO</span>
          <div style={{ flex: 1 }} />
          <button onClick={onLogout} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Logout</button>
        </div>
        <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "14px 12px" : "22px 16px" }}>
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
    <div style={{ minHeight: "100vh", background: "#FBF3E7", fontFamily: "var(--font-body)" }}>
      <div style={{ background: "#0B3D2E", height: 54,borderBottom:"3px dashed #A6192E", display: "flex", alignItems: "center", padding: "0 16px", gap: 10 }}>
        <div onClick={()=>{ setDetail(null); setInvDetail(null); setProView("matches") }} style={{ cursor:"pointer" }}><LogoFull size={28} /></div>
        <span style={{ color: "#6ee7b7", fontSize: 11, background: "rgba(29,158,117,0.2)", padding: "2px 8px", borderRadius: 5, fontWeight: 700 }}>PRO</span>
        <div style={{ flex: 1 }} />
        <div onClick={()=>setProView("profile")} style={{ cursor:"pointer" }}><Av name={player.name} id={player.id} sz={28} /></div>
        <Bell count={unreadCount} onClick={openInbox} />
        {showInbox && <MessageInbox messages={inboxMsgs} onClose={()=>setShowInbox(false)} />}
        {!isMobile && <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{player.name}</span>}
        <button onClick={onLogout} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>Logout</button>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "14px 12px" : "22px 16px" }}>
        <div style={{ padding: "14px 16px", background: active ? "linear-gradient(135deg,#1D9E75,#0F6E56)" : "#fee2e2", borderRadius: 14, marginBottom: 18, color: active ? "#fff" : "#991b1b" }}>
          <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-head)" }}>{active ? "⭐ Pro Member" : "⚠️ Subscription Expired"}</div>
          <div style={{ fontSize: 12, marginTop: 3, opacity: 0.9 }}>
            {active ? `Valid till ${player.subscription_expiry} · ${daysLeft} day${daysLeft > 1 ? "s" : ""} left` : "Contact admin to renew your subscription."}
          </div>
        </div>

        <StatsBanner stats={stats} isMobile={isMobile}/>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, background: "#fff", borderRadius: 10, padding: 4, border: "1.5px solid #e5e7eb" }}>
          {[["matches","My Matches"],["calendar","Calendar"],["players","Players"],["leaderboard","Leaderboard"]].map(([k,v]) => (
            <button key={k} onClick={() => setProView(k)} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "none", background: proView === k ? "#0B3D2E" : "transparent", color: proView === k ? "#fff" : "#6b7280", fontSize: 13, cursor: "pointer", fontWeight: proView === k ? 700 : 500 }}>{v}</button>
          ))}
        </div>
        {proView === "calendar" && (
          <CalendarPage matches={matches} teams={[]} grounds={[]} onNavigate={(pg, id) => { const m = matches.find(x => x.id === id); if (m) loadDetail(m) }} isMobile={isMobile}/>
        )}
        {proView === "players" && (
          <div>
            <h2 style={{ margin: "0 0 14px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>My Group Players</h2>
            {groupPlayers.length === 0 ? (
              <Card style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>No players yet.</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>Players who join your matches will appear here.</div>
              </Card>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {groupPlayers.map((p, i) => (
                  <Card key={p.id} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ position: "relative" }}>
                        <Av name={p.name} id={p.id} sz={42}/>
                        {i < 3 && <span style={{ position: "absolute", top: -4, left: -4, background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : "#b45309", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.city || ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#065f46", fontFamily: "var(--font-head)" }}>{p.played}</div>
                        <div style={{ fontSize: 9, color: "#065f46", fontWeight: 600 }}>PLAYED</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: "#fff5f5", borderRadius: 8, border: "1px solid #fecaca" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#991b1b", fontFamily: "var(--font-head)" }}>{p.declined}</div>
                        <div style={{ fontSize: 9, color: "#991b1b", fontWeight: 600 }}>DECLINED</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", padding: "8px 4px", background: "#fefce8", borderRadius: 8, border: "1px solid #fde68a" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#78350f", fontFamily: "var(--font-head)" }}>₹{p.contributed}</div>
                        <div style={{ fontSize: 9, color: "#78350f", fontWeight: 600 }}>PAID</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}


        {tab === "players" && (
          <div>
            {active && (
              <button onClick={() => setShowAddPlayer(true)} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#0B3D2E", border: "none", color: "#fff", fontSize: 15, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)", marginBottom: 16 }}>+ Add Player</button>
            )}
            {myPlayers.length === 0 ? (
              <Card style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>No players added yet.</div>
              </Card>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {myPlayers.map(p => (
                  <Card key={p.id} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <Av name={p.name} id={p.id} sz={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#0B3D2E" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.city || ""}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "matches" && <h2 style={{ margin: "0 0 14px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>My Matches</h2>}

        {tab === "matches" && active && (
          <button onClick={() => setShowSchedule(true)} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#0B3D2E", border: "none", color: "#fff", fontSize: 15, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)", marginBottom: 18 }}>+ Schedule New Match</button>
        )}

        {tab === "matches" && (matches.length === 0 ? (
          <Card style={{ padding: "32px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚽</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>No matches scheduled yet.</div>
            {active && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>Tap "Schedule New Match" to create one.</div>}
          </Card>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {matches.map(m => (
              <Card key={m.id} onClick={() => loadDetail(m)} style={{ padding: "16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>{m.team}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>📅 {fmtDate(m.date)}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>⏰ {m.time_slot}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>📍 {m.ground}</div>
                  </div>
                  <Tag col={m.status === "upcoming" ? "blue" : "green"}>{m.status}</Tag>
                </div>
                {(() => {
                  const joined = matchCounts[m.id] || 0
                  const cap = m.max_players || 0
                  const pct = cap > 0 ? Math.min(100, Math.round((joined / cap) * 100)) : 0
                  const left = Math.max(0, cap - joined)
                  return (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#065f46" }}>👥 {joined}/{cap} joined</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: left > 0 ? "#1D9E75" : "#991b1b" }}>{left > 0 ? left + " spots left" : "Full"}</span>
                      </div>
                      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: pct >= 100 ? "#1D9E75" : "linear-gradient(90deg,#6ee7b7,#1D9E75)", borderRadius: 6, transition: "width 0.3s" }}/>
                      </div>
                    </div>
                  )
                })()}
              </Card>
            ))}
          </div>
        ))}
      </div>

      {showAddPlayer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", zIndex: 300 }} onClick={() => setShowAddPlayer(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: isMobile ? "20px 20px 0 0" : 20, padding: isMobile ? "24px 18px" : 28, width: "100%", maxWidth: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>Add Player</h3>
              <button onClick={() => setShowAddPlayer(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9ca3af" }}>×</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input value={npFirst} onChange={e => setNpFirst(capFn(e.target.value))} placeholder="First name" style={{ padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                <input value={npLast} onChange={e => setNpLast(capFn(e.target.value))} placeholder="Last name" style={{ padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#f3f4f6", fontSize: 14, fontWeight: 600 }}>+91</div>
                <input value={npPhone} onChange={e => setNpPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))} type="tel" placeholder="10 digit number" style={{ flex: 1, padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <input value={npPin} onChange={e => setNpPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4} placeholder="4 digit PIN" style={{ padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 20, outline: "none", boxSizing: "border-box", letterSpacing: 6, textAlign: "center" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={() => setShowAddPlayer(false)} style={{ flex: 1, padding: "12px", borderRadius: 9, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={addMyPlayer} disabled={npBusy} style={{ flex: 2, padding: "12px", borderRadius: 9, background: "#0B3D2E", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 800 }}>{npBusy ? "Adding..." : "Add Player"}</button>
            </div>
          </div>
        </div>
      )}

        {proView === "leaderboard" && <LeaderboardPage isMobile={isMobile} myId={player.id}/>}
      {proView === "profile" && (() => {
        const daysLeft = player.subscription_expiry ? Math.ceil((new Date(player.subscription_expiry) - new Date()) / 86400000) : null
        const isActive = daysLeft !== null && daysLeft >= 0
        return (
          <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "0 12px" : "0 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ padding: "14px", background: "#f0fdf4", borderRadius: 12, border: "1.5px solid #bbf7d0", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#065f46", fontFamily: "var(--font-head)" }}>{stats?.matches ?? 0}</div>
                <div style={{ fontSize: 10, color: "#065f46", fontWeight: 600 }}>MATCHES SCHEDULED</div>
              </div>
              <div style={{ padding: "14px", background: "#F5E6C8", borderRadius: 12, border: "1.5px solid #E3C888", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#7A4F13", fontFamily: "var(--font-head)" }}>{stats?.players ?? 0}</div>
                <div style={{ fontSize: 10, color: "#7A4F13", fontWeight: 600 }}>PLAYERS MANAGED</div>
              </div>
              <div style={{ padding: "14px", background: "#fefce8", borderRadius: 12, border: "1.5px solid #fde68a", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#78350f", fontFamily: "var(--font-head)" }}>{stats?.venues ?? 0}</div>
                <div style={{ fontSize: 10, color: "#78350f", fontWeight: 600 }}>VENUES</div>
              </div>
            </div>

            <Card style={{ padding: "16px", marginBottom: 16, background: isActive ? "linear-gradient(135deg,#0B3D2E,#0F5C43)" : "#fff" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: isActive ? "#fff" : "#991b1b", fontFamily: "var(--font-head)" }}>⭐ Pro Membership</div>
              <div style={{ fontSize: 12, color: isActive ? "rgba(255,255,255,0.8)" : "#991b1b", marginTop: 4 }}>
                {isActive ? `Valid till ${player.subscription_expiry} · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left` : "Expired — contact admin to renew."}
              </div>
            </Card>

            <Card style={{ padding: "16px", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0B3D2E", marginBottom: 6, fontFamily: "var(--font-head)" }}>💳 My UPI ID</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>Players will pay their match share to this UPI ID.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={upiVal} onChange={e => setUpiVal(e.target.value)} placeholder="yourname@upi" style={{ flex: 1, padding: "11px 12px", borderRadius: 9, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                <button onClick={async () => { try { await updatePlayerUpi(player.id, upiVal.trim()); alert("UPI ID saved!") } catch(e) { alert(e.message) } }} style={{ padding: "11px 18px", borderRadius: 9, background: "#0B3D2E", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-head)" }}>Save</button>
              </div>
            </Card>

            <Card style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>👤 My Profile</div>
                {!editingProfile && <button onClick={() => { setPForm({ name: player.name, phone: player.phone || "", pin: player.pin, city: player.city || "" }); setEditingProfile(true) }} style={{ padding: "6px 14px", borderRadius: 8, background: "#F5E6C8", border: "1px solid #E3C888", color: "#7A4F13", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Edit</button>}
              </div>
              {editingProfile ? (
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
                    <button onClick={async () => { try { await updatePlayer(player.id, pForm.name, pForm.phone, pForm.pin, pForm.city); alert("Profile updated! Please log in again to see changes."); setEditingProfile(false) } catch(e) { alert(e.message) } }} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#0B3D2E", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-head)" }}>Save</button>
                    <button onClick={() => setEditingProfile(false)} style={{ flex: 1, padding: "11px", borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#374151", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div><span style={{ fontSize: 11, color: "#9ca3af" }}>Name</span><div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{player.name}</div></div>
                  <div><span style={{ fontSize: 11, color: "#9ca3af" }}>Phone</span><div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{player.phone}</div></div>
                </div>
              )}
            </Card>

            <Card style={{ padding: "16px", marginTop: 16 }}>
              <DirectMessagesButton player={player} />
            </Card>

            <Card style={{ padding: "16px", marginTop: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0B3D2E", marginBottom: 12, fontFamily: "var(--font-head)" }}>📍 Grounds &amp; Venues</div>
              {grounds.length === 0 ? (
                <div style={{ fontSize: 13, color: "#9ca3af" }}>No venues added yet.</div>
              ) : (
                <select defaultValue="" style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "var(--font-body)" }}>
                  <option value="" disabled>Select a venue to view</option>
                  {grounds.map(g => (
                    <option key={g.id} value={g.id}>{g.name}{g.location ? ` — ${g.location}` : ""}</option>
                  ))}
                </select>
              )}
            </Card>
          </div>
        )
      })()}
      {proView === "matches" && invites.length > 0 && (
        <div style={{ marginTop: 24, maxWidth: 660, margin: "24px auto 0", padding: isMobile ? "0 12px" : "0 16px" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>📩 Invited Matches</h2>
          <div style={{ display:"flex", gap:6, marginBottom:12 }}>
            {["upcoming","completed"].map(f => (
              <button key={f} onClick={()=>setInviteFilter(f)} style={{ padding:"6px 14px", borderRadius:7, border:"none", background:inviteFilter===f?"#0B3D2E":"#f3f4f6", color:inviteFilter===f?"#fff":"#6b7280", fontSize:12, cursor:"pointer", fontWeight:inviteFilter===f?700:500, fontFamily:"var(--font-body)", textTransform:"capitalize" }}>{f}</button>
            ))}
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {filteredInvites.length === 0 ? (
              <div style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"16px 0" }}>No {inviteFilter} invites.</div>
            ) : filteredInvites.map(({ match: m, myStatus }) => (
              <Card key={m.id} onClick={() => loadInvDetail(m)} style={{ padding: "16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0B3D2E", fontFamily: "var(--font-head)" }}>{m.team}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>📅 {fmtDate(m.date)}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>⏰ {m.time_slot}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>📍 {m.ground}</div>
                  </div>
                  <Tag col={myStatus === "confirmed" ? "green" : myStatus === "waitlist" ? "yellow" : myStatus === "declined" ? "red" : "orange"}>
                    {myStatus === "confirmed" ? "✅ You are in!" : myStatus === "waitlist" ? "⏳ Waitlist" : myStatus === "declined" ? "❌ Declined" : "Awaiting reply"}
                  </Tag>
                </div>
                {m.status === "upcoming" && myStatus === "pending" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                    <button onClick={async (ev) => { ev.stopPropagation(); try { await confirmPlayerToMatch(m.id, player.id, "confirmed"); loadInvites() } catch(e) { alert(e.message) } }} style={{ padding: "12px", borderRadius: 10, background: "#1D9E75", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 800, fontFamily: "var(--font-head)" }}>✅ Available</button>
                    <button onClick={async (ev) => { ev.stopPropagation(); try { await confirmPlayerToMatch(m.id, player.id, "declined"); loadInvites() } catch(e) { alert(e.message) } }} style={{ padding: "12px", borderRadius: 10, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-head)" }}>❌ Not Available</button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}


      {showSchedule && (
        <ProScheduleModal grounds={grounds} teams={teams} player={player} isMobile={isMobile}
          onClose={() => setShowSchedule(false)}
          onCreated={() => { setShowSchedule(false); load() }} />
      )}
    </div>
  )
}
