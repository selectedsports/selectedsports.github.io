import { useState, useEffect, useRef } from "react"
import { LogoFull, Av, Tag, Btn, Card, Spinner } from "./ui.jsx"
import { fetchPlayers, fetchGrounds, fetchMatches, createMatch, updateMatchStatus, toggleMatchLink, fetchMatchPlayers, notifyPlayer, removePlayerFromMatch, setPlayerStatus, fetchPublicResponses, approvePublicResponse, rejectPublicResponse, fetchExpenses, addExpense, deleteExpense, fetchPayments, togglePayment, fetchChat, sendMessage, subscribeToChat } from "../db.js"
import { TIME_SLOTS, TEAMS, fmtDate, dayName } from "../constants.js"
import { waInvite, waPublicLink, waPayment, waReminder } from "./whatsapp.js"
import { supabase } from "../supabase.js"
const BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5173" : "https://selectedsports.github.io"
const copy = text => { navigator.clipboard?.writeText(text); alert("Copied! Paste in WhatsApp.") }
export default function AdminPortal({ onLogout }) {
  const [page, setPage] = useState("dashboard")
  const [players, setPlayers] = useState([])
  const [grounds, setGrounds] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState(null)
  const load = async () => {
    setLoading(true)
    try { const [p,g,m] = await Promise.all([fetchPlayers(),fetchGrounds(),fetchMatches()]); setPlayers(p); setGrounds(g); setMatches(m) }
    catch(e) { alert("Load error: "+e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])
  const navigate = (pg, id=null) => { setPage(pg); setSelId(id) }
  if (loading) return <div style={{ minHeight:"100vh", background:"#F0F4F1", display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner/></div>
  return (
    <div style={{ minHeight:"100vh", background:"#F0F4F1", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#0B3D2E", height:54, display:"flex", alignItems:"center", padding:"0 20px", gap:14, position:"sticky", top:0, zIndex:200 }}>
        <LogoFull size={30}/>
        <div style={{ flex:1, display:"flex", gap:2, marginLeft:8 }}>
          {[["dashboard","Dashboard"],["matches","Matches"],["players","Players"],["calendar","Calendar"]].map(([k,v]) => (
            <button key={k} onClick={() => navigate(k)} style={{ padding:"5px 13px", borderRadius:7, border:"none", background:page===k?"rgba(29,158,117,0.25)":"transparent", color:page===k?"#6ee7b7":"rgba(255,255,255,0.5)", fontSize:13, cursor:"pointer", fontWeight:page===k?700:400, fontFamily:"var(--font-body)" }}>{v}</button>
          ))}
        </div>
        <span style={{ color:"#6ee7b7", fontSize:11, background:"rgba(29,158,117,0.2)", padding:"2px 8px", borderRadius:5 }}>Admin</span>
        <button onClick={onLogout} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)" }}>Logout</button>
      </div>
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"22px 18px" }}>
        {page==="dashboard" && <Dashboard matches={matches} players={players} grounds={grounds} onNavigate={navigate} onRefresh={load}/>}
        {page==="matches" && <MatchesPage matches={matches} players={players} grounds={grounds} selId={selId} onNavigate={navigate} onRefresh={load}/>}
        {page==="players" && <PlayersPage players={players} onRefresh={load}/>}
        {page==="calendar" && <CalendarPage matches={matches} grounds={grounds} onNavigate={navigate}/>}
      </div>
    </div>
  )
}
function Dashboard({ matches, players, grounds, onNavigate, onRefresh }) {
  const upcoming = matches.filter(m => m.status==="upcoming")
  const completed = matches.filter(m => m.status==="completed")
  const [showNew, setShowNew] = useState(false)
  return (
    <div>
      <h2 style={{ color:"#0B3D2E", fontSize:20, fontWeight:800, margin:"0 0 18px", fontFamily:"var(--font-head)" }}>Dashboard</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:13, marginBottom:22 }}>
        {[{label:"Total Players",v:players.length,c:"#185FA5",bg:"#eff6ff",icon:"👥"},{label:"Upcoming",v:upcoming.length,c:"#1D9E75",bg:"#f0fdf4",icon:"📅"},{label:"Played",v:completed.length,c:"#BA7517",bg:"#fffbeb",icon:"🏏"},{label:"Grounds",v:grounds.length,c:"#7c3aed",bg:"#ede9fe",icon:"📍"}].map((c,i) => (
          <Card key={i} style={{ padding:"16px 18px" }}>
            <div style={{ width:38,height:38,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontSize:28,fontWeight:900,color:c.c,fontFamily:"var(--font-head)" }}>{c.v}</div>
            <div style={{ fontSize:12,color:"#6b7280",marginTop:3 }}>{c.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:18 }}>
        <Card style={{ padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontWeight:800, fontSize:15, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>Upcoming Matches</div>
            <Btn variant="green" size="sm" onClick={() => setShowNew(true)}>+ New</Btn>
          </div>
          {upcoming.length===0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No upcoming matches.</p>}
          {upcoming.slice(0,4).map(m => (
            <div key={m.id} onClick={() => onNavigate("matches",m.id)} style={{ padding:"11px 13px",borderRadius:12,border:"1.5px solid #e5e7eb",marginBottom:10,cursor:"pointer",background:"#fafafa" }}>
              <div style={{ fontWeight:700,color:"#0B3D2E",fontSize:13,fontFamily:"var(--font-head)" }}>{m.team} · {m.ground}</div>
              <div style={{ color:"#6b7280",fontSize:12,marginTop:2 }}>{fmtDate(m.date)} · {m.time_slot}</div>
            </div>
          ))}
        </Card>
        <Card style={{ padding:18 }}>
          <div style={{ fontWeight:800,fontSize:15,color:"#0B3D2E",marginBottom:14,fontFamily:"var(--font-head)" }}>Two Ways to Invite</div>
          {[{icon:"🔒",col:"#d1fae5",bc:"#bbf7d0",title:"Private invite",body:"Select players from your list. They log in with name + PIN."},{icon:"🔗",col:"#dbeafe",bc:"#93c5fd",title:"Public link",body:"Share link in WhatsApp group. Anyone can respond - no login needed."}].map((item,i) => (
            <div key={i} style={{ display:"flex",gap:10,padding:"12px 13px",background:item.col,borderRadius:10,border:`1px solid ${item.bc}`,marginBottom:10 }}>
              <span style={{ fontSize:20,flexShrink:0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight:700,fontSize:12,color:"#0B3D2E",marginBottom:3 }}>{item.title}</div>
                <div style={{ fontSize:11,color:"#374151",lineHeight:1.5 }}>{item.body}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      {showNew && <NewMatchModal grounds={grounds} onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); onRefresh() }}/>}
    </div>
  )
}
function MatchesPage({ matches, players, grounds, selId, onNavigate, onRefresh }) {
  const [showNew, setShowNew] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => { if(selId) loadMatch(matches.find(m=>m.id===selId)) }, [selId])
  const loadMatch = async m => {
    if(!m) return
    setLoading(true)
    try {
      const [mps,exps,pays,chats,pubs] = await Promise.all([fetchMatchPlayers(m.id),fetchExpenses(m.id),fetchPayments(m.id),fetchChat(m.id),fetchPublicResponses(m.id)])
      setDetail({ match:m, matchPlayers:mps, expenses:exps, payments:pays, chat:chats, publicResponses:pubs })
    } catch(e) { alert(e.message) }
    setLoading(false)
  }
  if(loading) return <Spinner/>
  if(detail) return <MatchDetail detail={detail} players={players} onBack={() => { setDetail(null); onNavigate("matches") }} onRefresh={() => loadMatch(detail.match)} onStatusChange={async status => { await updateMatchStatus(detail.match.id,status); onRefresh(); setDetail(null); onNavigate("matches") }}/>
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
        <h2 style={{ color:"#0B3D2E",fontSize:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)" }}>All Matches</h2>
        <Btn variant="green" onClick={() => setShowNew(true)}>+ Schedule Match</Btn>
      </div>
      <div style={{ display:"grid", gap:12 }}>
        {matches.map(m => (
          <Card key={m.id} style={{ padding:"16px 20px",cursor:"pointer" }} onClick={() => loadMatch(m)}>
            <div style={{ display:"flex",alignItems:"center",gap:16 }}>
              <div style={{ width:46,height:46,borderRadius:13,background:m.status==="upcoming"?"#f0fdf4":m.status==="completed"?"#ecfdf5":"#fff5f5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,border:`1.5px solid ${m.status==="upcoming"?"#bbf7d0":m.status==="completed"?"#6ee7b7":"#fca5a5"}` }}>🏏</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800,color:"#0B3D2E",fontSize:14,fontFamily:"var(--font-head)" }}>{m.team}</div>
                <div style={{ color:"#6b7280",fontSize:12,marginTop:2 }}>{fmtDate(m.date)} · {m.time_slot} · {m.ground}</div>
              </div>
              <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end" }}>
                <Tag col="gray">{m.type}</Tag>
                {m.link_active && <Tag col="green">🔗 Link active</Tag>}
                <Tag col={m.status==="upcoming"?"blue":m.status==="completed"?"green":"red"}>{m.status}</Tag>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {showNew && <NewMatchModal grounds={grounds} onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); onRefresh() }}/>}
    </div>
  )
}
function MatchDetail({ detail, players, onBack, onRefresh, onStatusChange }) {
  const { match:m, matchPlayers, expenses, payments, chat, publicResponses } = detail
  const [tab, setTab] = useState("players")
  const [showNotify, setShowNotify] = useState(false)
  const [msgs, setMsgs] = useState(chat)
  const [chatInput, setChatInput] = useState("")
  const [expLabel, setExpLabel] = useState("")
  const [expAmt, setExpAmt] = useState("")
  const [linkActive, setLinkActive] = useState(m.link_active)
  const [toggling, setToggling] = useState(false)
  const chatRef = useRef(null)
  useEffect(() => { chatRef.current?.scrollIntoView({behavior:"smooth"}) }, [msgs])
  const confirmed = matchPlayers.filter(mp=>mp.status==="confirmed")
  const waitlist = matchPlayers.filter(mp=>mp.status==="waitlist")
  const declined = matchPlayers.filter(mp=>mp.status==="declined")
  const total = expenses.reduce((s,e)=>s+Number(e.amount),0)
  const pp = confirmed.length>0 ? Math.round(total/confirmed.length) : 0
  const pendingPublic = publicResponses.filter(r=>r.approved===null&&r.availability==="yes")
  useEffect(() => {
    const ch = subscribeToChat(m.id, msg => setMsgs(prev=>[...prev,msg]))
    return () => { supabase.removeChannel(ch) }
  }, [m.id])
  const doSendChat = async () => {
    if(!chatInput.trim()) return
    try { const msg = await sendMessage(m.id,"Admin",chatInput.trim()); setMsgs(p=>[...p,msg]); setChatInput("") } catch(e){alert(e.message)}
  }
  const doAddExpense = async () => {
    if(!expLabel||!expAmt) return
    await addExpense(m.id,expLabel,parseFloat(expAmt))
    setExpLabel(""); setExpAmt(""); onRefresh()
  }
  const handleToggleLink = async () => {
    setToggling(true)
    const next = !linkActive
    await toggleMatchLink(m.id,next)
    setLinkActive(next)
    setToggling(false)
  }
  const inviteUrl = `${BASE_URL}/join/${m.invite_token}`
  return (
    <div>
      <button onClick={onBack} style={{ background:"none",border:"none",color:"#1D9E75",fontSize:13,cursor:"pointer",fontWeight:700,marginBottom:14,padding:0,fontFamily:"var(--font-body)" }}>← All Matches</button>
      <Card style={{ overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(135deg,#0B3D2E,#0F5C43)",padding:"24px 26px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <div style={{ color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:3 }}>{dayName(m.date)}, {fmtDate(m.date)}</div>
              <h2 style={{ color:"#fff",fontSize:22,fontWeight:900,margin:"0 0 4px",fontFamily:"var(--font-head)" }}>{m.team}</h2>
              <div style={{ color:"rgba(255,255,255,0.65)",fontSize:13 }}>📍 {m.ground} · ⏰ {m.time_slot}</div>
              <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap" }}>
                <Tag col={m.type==="internal"?"teal":"blue"}>{m.type==="internal"?"Internal 9v9":"External 9-a-side"}</Tag>
                <Tag col={m.status==="upcoming"?"blue":m.status==="completed"?"green":"red"}>{m.status}</Tag>
                {linkActive && <Tag col="green">🔗 Link active</Tag>}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ color:"#fff",fontSize:38,fontWeight:900,lineHeight:1,fontFamily:"var(--font-head)" }}>{confirmed.length}<span style={{ fontSize:18,color:"rgba(255,255,255,0.4)",fontWeight:400 }}>/{m.max_players}</span></div>
              <div style={{ color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:2 }}>confirmed</div>
              {waitlist.length>0 && <div style={{ color:"#fbbf24",fontSize:12,marginTop:4 }}>+{waitlist.length} waitlisted</div>}
              {pendingPublic.length>0 && <div style={{ color:"#fb923c",fontSize:12,marginTop:4 }}>⚡ {pendingPublic.length} walk-in pending</div>}
            </div>
          </div>
          {m.status==="upcoming" && (
            <div style={{ marginTop:16 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.07)",borderRadius:10,border:"1px solid rgba(255,255,255,0.12)",marginBottom:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#fff",fontSize:12,fontWeight:700,marginBottom:2 }}>🔗 Public invite link</div>
                  <div style={{ color:"rgba(255,255,255,0.45)",fontSize:11,wordBreak:"break-all" }}>{inviteUrl}</div>
                </div>
                <div style={{ display:"flex",gap:8,flexShrink:0 }}>
                  <button onClick={() => copy(inviteUrl)} style={{ padding:"6px 11px",borderRadius:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)" }}>📋 Copy</button>
                  <button onClick={() => copy(waPublicLink(m,BASE_URL))} style={{ padding:"6px 11px",borderRadius:8,background:"rgba(37,211,102,0.2)",border:"1px solid rgba(74,222,128,0.35)",color:"#4ade80",fontSize:11,cursor:"pointer",fontFamily:"var(--font-body)" }}>📲 WA Msg</button>
                  <button onClick={handleToggleLink} disabled={toggling} style={{ padding:"6px 12px",borderRadius:8,background:linkActive?"#fee2e2":"rgba(29,158,117,0.3)",border:`1px solid ${linkActive?"#fca5a5":"rgba(29,158,117,0.5)"}`,color:linkActive?"#fca5a5":"#6ee7b7",fontSize:11,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>{toggling?"...":linkActive?"⏸ Deactivate":"▶ Activate"}</button>
                </div>
              </div>
              <div style={{ display:"flex",gap:9,flexWrap:"wrap" }}>
                <button onClick={() => setShowNotify(true)} style={{ padding:"7px 14px",borderRadius:9,background:"rgba(24,95,165,0.35)",border:"1px solid rgba(147,197,253,0.4)",color:"#93c5fd",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>🔒 Private Invites</button>
                <button onClick={() => copy(waInvite(m))} style={{ padding:"7px 14px",borderRadius:9,background:"rgba(37,211,102,0.15)",border:"1px solid rgba(74,222,128,0.35)",color:"#4ade80",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)" }}>📲 Copy Invite</button>
                <button onClick={() => copy(waReminder(m))} style={{ padding:"7px 14px",borderRadius:9,background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.35)",color:"#fbbf24",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)" }}>⏰ Reminder</button>
                <button onClick={() => onStatusChange("completed")} style={{ padding:"7px 14px",borderRadius:9,background:"rgba(29,158,117,0.25)",border:"1px solid rgba(29,158,117,0.4)",color:"#6ee7b7",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>✓ Mark Done</button>
                <button onClick={() => { if(confirm("Cancel match?")) onStatusChange("cancelled") }} style={{ padding:"7px 14px",borderRadius:9,background:"rgba(239,68,68,0.15)",border:"1px solid rgba(252,165,165,0.35)",color:"#fca5a5",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)" }}>✕ Cancel</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ display:"flex",borderBottom:"2px solid #f3f4f6",padding:"0 22px",overflowX:"auto" }}>
          {[["players","👥 Players"],["walkins",`🔗 Walk-ins${publicResponses.length>0?` (${publicResponses.length})`:""}${pendingPublic.length>0?" ⚡":""}`],["chat","💬 Chat"],["expenses","💰 Expenses"]].map(([k,v]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding:"13px 16px",border:"none",borderBottom:tab===k?"3px solid #1D9E75":"3px solid transparent",background:"transparent",color:tab===k?"#0B3D2E":"#9ca3af",fontSize:13,fontWeight:tab===k?800:400,cursor:"pointer",marginBottom:"-2px",whiteSpace:"nowrap",fontFamily:"var(--font-body)" }}>{v}</button>
          ))}
        </div>
        <div style={{ padding:22 }}>
          {tab==="players" && (
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                <span style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>🔒 Private Invites</span>
                <Tag col="blue">{matchPlayers.length} invited</Tag>
                {m.status==="upcoming" && <button onClick={() => setShowNotify(true)} style={{ marginLeft:"auto",padding:"5px 12px",borderRadius:8,background:"#f0fdf4",border:"1px solid #6ee7b7",color:"#065f46",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>+ Manage</button>}
              </div>
              {matchPlayers.length===0 ? (
                <div style={{ padding:"16px 18px",background:"#fff7ed",borderRadius:12,border:"1px solid #fed7aa",marginBottom:22,textAlign:"center" }}>
                  <div style={{ fontSize:13,color:"#9a3412" }}>No players privately invited yet.</div>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:22 }}>
                  {matchPlayers.map(mp => {
                    const p=mp.players; if(!p) return null
                    const sc={confirmed:"#d1fae5",waitlist:"#fef3c7",declined:"#fee2e2",pending:"#f9fafb"}[mp.status]
                    const bc={confirmed:"#6ee7b7",waitlist:"#fcd34d",declined:"#fca5a5",pending:"#e5e7eb"}[mp.status]
                    return (
                      <div key={mp.id} style={{ padding:"10px 12px",borderRadius:11,border:`1.5px solid ${bc}`,background:sc }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                          <Av name={p.name} id={p.id} sz={30}/>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ fontWeight:700,fontSize:12,color:"#111827",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{p.name}</div>
                            <div style={{ fontSize:10,color:"#6b7280" }}>{{confirmed:"✅ Confirmed",waitlist:"⏳ Waitlist",declined:"❌ Declined",pending:"🕐 Pending"}[mp.status]}</div>
                          </div>
                        </div>
                        {m.status==="upcoming" && (
                          <div style={{ display:"flex",gap:4 }}>
                            <button onClick={async()=>{await setPlayerStatus(m.id,p.id,"confirmed");onRefresh()}} style={{ flex:1,padding:"4px",borderRadius:6,border:`1.5px solid ${mp.status==="confirmed"?"#1D9E75":"#d1d5db"}`,background:mp.status==="confirmed"?"#1D9E75":"transparent",color:mp.status==="confirmed"?"#fff":"#6b7280",fontSize:11,cursor:"pointer",fontWeight:700 }}>✓</button>
                            <button onClick={async()=>{await setPlayerStatus(m.id,p.id,"declined");onRefresh()}} style={{ flex:1,padding:"4px",borderRadius:6,border:`1.5px solid ${mp.status==="declined"?"#ef4444":"#d1d5db"}`,background:mp.status==="declined"?"#ef4444":"transparent",color:mp.status==="declined"?"#fff":"#6b7280",fontSize:11,cursor:"pointer" }}>✕</button>
                            <button onClick={async()=>{await removePlayerFromMatch(m.id,p.id);onRefresh()}} style={{ flex:1,padding:"4px",borderRadius:6,border:"1.5px solid #e5e7eb",background:"transparent",color:"#9ca3af",fontSize:11,cursor:"pointer" }}>🗑</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
                {[{label:"✅ Confirmed",list:confirmed,bg:"#f0fdf4",border:"#bbf7d0",tc:"#065f46"},{label:"⏳ Waitlist",list:waitlist,bg:"#fefce8",border:"#fde68a",tc:"#78350f"},{label:"❌ Declined",list:declined,bg:"#fff5f5",border:"#fecaca",tc:"#991b1b"}].map(({label,list,bg,border,tc}) => (
                  <div key={label} style={{ background:bg,borderRadius:12,padding:"12px 14px",border:`1.5px solid ${border}` }}>
                    <div style={{ fontSize:12,fontWeight:800,color:tc,marginBottom:10,fontFamily:"var(--font-head)" }}>{label} ({list.length})</div>
                    {list.map(mp => { const p=mp.players; if(!p) return null; return <div key={mp.id} style={{ display:"flex",alignItems:"center",gap:7,marginBottom:6 }}><Av name={p.name} id={p.id} sz={22}/><span style={{ fontSize:12,color:"#374151" }}>{p.name}</span></div> })}
                    {list.length===0 && <div style={{ fontSize:12,color:"#9ca3af" }}>None</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="walkins" && <WalkInsTab match={m} publicResponses={publicResponses} onRefresh={onRefresh} linkActive={linkActive} onToggleLink={handleToggleLink} inviteUrl={inviteUrl}/>}
          {tab==="chat" && (
            <div>
              <div style={{ height:300,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,marginBottom:14 }}>
                {msgs.length===0 && <p style={{ color:"#9ca3af",fontSize:13 }}>No messages yet.</p>}
                {msgs.map((msg,i) => (
                  <div key={i} style={{ display:"flex",flexDirection:msg.sender==="Admin"?"row-reverse":"row",gap:8,alignItems:"flex-end" }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:msg.sender==="Admin"?"#1D9E75":"#185FA5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0 }}>{msg.sender==="Admin"?"AD":msg.sender.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                    <div style={{ maxWidth:"68%" }}>
                      <div style={{ fontSize:10,color:"#9ca3af",marginBottom:2,textAlign:msg.sender==="Admin"?"right":"left" }}>{msg.sender}</div>
                      <div style={{ background:msg.sender==="Admin"?"#d1fae5":"#f3f4f6",borderRadius:msg.sender==="Admin"?"12px 12px 3px 12px":"12px 12px 12px 3px",padding:"9px 13px",fontSize:13,color:"#111827" }}>{msg.message}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatRef}/>
              </div>
              <div style={{ display:"flex",gap:10 }}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSendChat()} placeholder="Message all notified players..." style={{ flex:1,padding:"10px 13px",borderRadius:10,border:"1.5px solid #e5e7eb",fontSize:13,outline:"none",background:"#fafafa",fontFamily:"var(--font-body)" }}/>
                <Btn variant="green" onClick={doSendChat}>Send</Btn>
              </div>
            </div>
          )}
          {tab==="expenses" && (
            <div>
              {m.status==="completed" && (
                <div style={{ display:"flex",gap:10,marginBottom:20 }}>
                  <input value={expLabel} onChange={e=>setExpLabel(e.target.value)} placeholder="Expense label" style={{ flex:2,padding:"9px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:13,outline:"none",background:"#fafafa",fontFamily:"var(--font-body)" }}/>
                  <input value={expAmt} onChange={e=>setExpAmt(e.target.value)} type="number" placeholder="Amount" style={{ flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:13,outline:"none",background:"#fafafa",fontFamily:"var(--font-body)" }}/>
                  <Btn variant="green" onClick={doAddExpense}>+ Add</Btn>
                </div>
              )}
              {expenses.length>0 ? (
                <div>
                  <div style={{ background:"#f0fdf4",borderRadius:13,padding:"16px 18px",border:"1.5px solid #bbf7d0",marginBottom:20 }}>
                    <div style={{ fontWeight:800,fontSize:14,color:"#065f46",marginBottom:14,fontFamily:"var(--font-head)" }}>💰 Expense Breakdown</div>
                    {expenses.map((e,i) => (
                      <div key={e.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<expenses.length-1?"1px solid #bbf7d0":"none" }}>
                        <span style={{ fontSize:13,color:"#065f46" }}>{e.label}</span>
                        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                          <span style={{ fontSize:13,color:"#059669" }}>₹{e.amount} / {confirmed.length||1} = <strong style={{ color:"#0B3D2E" }}>₹{Math.round(e.amount/(confirmed.length||1))}</strong></span>
                          {m.status==="completed" && <button onClick={async()=>{await deleteExpense(e.id);onRefresh()}} style={{ background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:12 }}>✕</button>}
                        </div>
                      </div>
                    ))}
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:"2px solid #6ee7b7" }}>
                      <span style={{ fontWeight:800,fontSize:15,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Per player</span>
                      <span style={{ fontWeight:900,fontSize:20,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>₹{pp}</span>
                    </div>
                  </div>
                  {m.status==="completed" && (
                    <div>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                        <div style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Payment Collection</div>
                        <button onClick={() => copy(waPayment(m,matchPlayers,expenses))} style={{ padding:"6px 12px",borderRadius:8,background:"#d1fae5",border:"1px solid #6ee7b7",color:"#065f46",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📲 Copy Payment Msg</button>
                      </div>
                      <div style={{ display:"grid",gap:8 }}>
                        {confirmed.map(mp => {
                          const p=mp.players; if(!p) return null
                          const paid=payments.find(pay=>pay.player_id===p.id)?.paid
                          return (
                            <div key={mp.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:paid?"#f0fdf4":"#fff",borderRadius:11,border:`1.5px solid ${paid?"#6ee7b7":"#e5e7eb"}` }}>
                              <Av name={p.name} id={p.id} sz={36}/>
                              <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{p.name}</div><div style={{ fontSize:12,color:"#6b7280" }}>₹{pp} due</div></div>
                              <button onClick={async()=>{await togglePayment(m.id,p.id,!paid);onRefresh()}} style={{ padding:"6px 14px",borderRadius:9,background:paid?"#d1fae5":"#f3f4f6",border:`1.5px solid ${paid?"#6ee7b7":"#e5e7eb"}`,color:paid?"#065f46":"#6b7280",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>{paid?"✓ Paid":"Mark Paid"}</button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:"center",padding:"36px 0",color:"#9ca3af" }}>
                  <div style={{ fontSize:40,marginBottom:12 }}>💰</div>
                  <div style={{ fontSize:13 }}>{m.status==="completed"?"Add expenses above.":"Mark match as completed first."}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      {showNotify && <NotifyModal match={m} matchPlayers={matchPlayers} players={players} onClose={() => setShowNotify(false)} onRefresh={onRefresh}/>}
    </div>
  )
}
function WalkInsTab({ match, publicResponses, onRefresh, linkActive, inviteUrl }) {
  const pending = publicResponses.filter(r=>r.approved===null)
  const approved = publicResponses.filter(r=>r.approved===true)
  const rejected = publicResponses.filter(r=>r.approved===false)
  const [busy, setBusy] = useState(null)
  const doApprove = async r => {
    setBusy(r.id)
    try { await approvePublicResponse(r.id,match.id,r.name,r.phone,match.max_players); onRefresh() }
    catch(e) { alert(e.message) }
    setBusy(null)
  }
  const doReject = async r => { setBusy(r.id); try { await rejectPublicResponse(r.id); onRefresh() } catch {} setBusy(null) }
  return (
    <div>
      <div style={{ padding:"12px 16px",background:linkActive?"#f0fdf4":"#fff7ed",borderRadius:12,border:`1.5px solid ${linkActive?"#6ee7b7":"#fed7aa"}`,marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontWeight:700,fontSize:13,color:linkActive?"#065f46":"#9a3412" }}>{linkActive?"🟢 Link is active - accepting responses":"🔴 Link is inactive"}</div>
          <div style={{ fontSize:11,color:linkActive?"#059669":"#c2410c",marginTop:3,wordBreak:"break-all" }}>{inviteUrl}</div>
        </div>
        <button onClick={() => copy(inviteUrl)} style={{ padding:"6px 12px",borderRadius:8,background:"rgba(0,0,0,0.06)",border:"1px solid #d1d5db",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)",flexShrink:0,marginLeft:10 }}>📋 Copy</button>
      </div>
      {publicResponses.length===0 ? (
        <div style={{ textAlign:"center",padding:"32px 0",color:"#9ca3af" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🔗</div>
          <div style={{ fontSize:14,fontWeight:600,color:"#374151",marginBottom:6 }}>No walk-in responses yet</div>
          <div style={{ fontSize:12 }}>{linkActive?"Share the link above in your WhatsApp group.":"Activate the link to start accepting responses."}</div>
        </div>
      ) : (
        <div>
          {pending.length>0 && (
            <div style={{ marginBottom:22 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                <span style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>⚡ Pending Review</span>
                <Tag col="orange">{pending.length} to review</Tag>
              </div>
              <div style={{ display:"grid",gap:8 }}>
                {pending.map(r => (
                  <div key={r.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:r.availability==="yes"?"#f0fdf4":"#fff5f5",borderRadius:12,border:`1.5px solid ${r.availability==="yes"?"#6ee7b7":"#fca5a5"}` }}>
                    <div style={{ width:40,height:40,borderRadius:"50%",background:r.availability==="yes"?"#1D9E75":"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0 }}>{r.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:13 }}>{r.name}</div>
                      <div style={{ fontSize:11,color:"#6b7280" }}>{r.phone&&<>📱 {r.phone} · </>}{r.availability==="yes"?"✅ Available":"❌ Not available"}</div>
                    </div>
                    {r.availability==="yes" && (
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={() => doApprove(r)} disabled={busy===r.id} style={{ padding:"7px 14px",borderRadius:9,background:"#1D9E75",border:"none",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>{busy===r.id?"...":"✓ Approve"}</button>
                        <button onClick={() => doReject(r)} disabled={busy===r.id} style={{ padding:"7px 12px",borderRadius:9,background:"#fee2e2",border:"1px solid #fca5a5",color:"#991b1b",fontSize:12,cursor:"pointer",fontFamily:"var(--font-body)" }}>Reject</button>
                      </div>
                    )}
                    {r.availability==="no" && <Tag col="red">Not available</Tag>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {approved.length>0 && (
            <div style={{ marginBottom:18 }}>
              <div style={{ fontWeight:700,fontSize:13,color:"#065f46",marginBottom:10 }}>✅ Approved ({approved.length})</div>
              {approved.map(r => (
                <div key={r.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 14px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",marginBottom:7 }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:"#1D9E75",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff" }}>{r.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                  <div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:13 }}>{r.name}</div><div style={{ fontSize:11,color:"#059669" }}>Added to squad</div></div>
                  <Tag col="green">✓ In squad</Tag>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
function NotifyModal({ match, matchPlayers, players, onClose, onRefresh }) {
  const [q, setQ] = useState("")
  const notifiedIds = new Set(matchPlayers.map(mp=>mp.player_id))
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300 }}>
      <div style={{ background:"#fff",borderRadius:20,padding:28,width:500,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
          <h3 style={{ margin:"0 0 4px",fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>🔒 Private Invites</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af" }}>×</button>
        </div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search player..." style={{ padding:"9px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:13,marginBottom:12,outline:"none",background:"#fafafa",fontFamily:"var(--font-body)" }}/>
        <div style={{ flex:1,overflowY:"auto",display:"grid",gap:7 }}>
          {players.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())).map(p => {
            const isIn=notifiedIds.has(p.id)
            return (
              <div key={p.id} onClick={async()=>{if(isIn)await removePlayerFromMatch(match.id,p.id);else await notifyPlayer(match.id,p.id);onRefresh()}} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 13px",borderRadius:11,border:`1.5px solid ${isIn?"#6ee7b7":"#e5e7eb"}`,background:isIn?"#f0fdf4":"#fafafa",cursor:"pointer" }}>
                <Av name={p.name} id={p.id} sz={34}/>
                <div style={{ flex:1 }}><div style={{ fontWeight:700,fontSize:13 }}>{p.name}</div><div style={{ fontSize:11,color:"#9ca3af" }}>📱 {p.phone}</div></div>
                {isIn && <Tag col="green">Invited</Tag>}
                <div style={{ width:22,height:22,borderRadius:6,border:`2px solid ${isIn?"#1D9E75":"#d1d5db"}`,background:isIn?"#1D9E75":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{isIn&&<span style={{ color:"#fff",fontSize:13,fontWeight:800 }}>✓</span>}</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop:14,padding:"10px 13px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",fontSize:12,color:"#065f46",fontWeight:600 }}>{matchPlayers.length} players privately invited</div>
        <div style={{ display:"flex",gap:10,marginTop:12 }}>
          <button onClick={() => copy(waInvite(match))} style={{ flex:1,padding:"10px",borderRadius:10,background:"#d1fae5",border:"1px solid #6ee7b7",color:"#065f46",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"var(--font-body)" }}>📲 Copy WhatsApp Invite</button>
          <button onClick={onClose} style={{ flex:1,padding:"10px",borderRadius:10,background:"#0B3D2E",border:"none",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)" }}>Done ✓</button>
        </div>
      </div>
    </div>
  )
}
function NewMatchModal({ grounds, onClose, onCreated }) {
  const today = new Date().toISOString().split("T")[0]
  const [form, setForm] = useState({ date:today, time_slot:"7:00 AM - 9:00 AM", ground:grounds[0]?.name||"MM Ground", team:"Dominators", type:"external" })
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    try { await createMatch({...form,max_players:form.type==="internal"?18:9}); onCreated() }
    catch(e) { alert(e.message) }
    setBusy(false)
  }
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300 }}>
      <div style={{ background:"#fff",borderRadius:20,padding:30,width:460,boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
          <h3 style={{ margin:0,fontSize:17,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Schedule New Match</h3>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9ca3af" }}>×</button>
        </div>
        <p style={{ margin:"0 0 18px",fontSize:12,color:"#6b7280" }}>No one is notified until you invite them.</p>
        <div style={{ display:"grid",gap:13 }}>
          <div>
            <label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600 }}>Date</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13,boxSizing:"border-box",fontFamily:"var(--font-body)" }}/>
            {form.date && <div style={{ fontSize:11,color:"#1D9E75",marginTop:4,fontWeight:600 }}>📅 {dayName(form.date)}</div>}
          </div>
          <div>
            <label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600 }}>Time Slot</label>
            <select value={form.time_slot} onChange={e=>setForm({...form,time_slot:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13,boxSizing:"border-box",fontFamily:"var(--font-body)" }}>
              {TIME_SLOTS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600 }}>Ground</label>
            <select value={form.ground} onChange={e=>setForm({...form,ground:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13,boxSizing:"border-box",fontFamily:"var(--font-body)" }}>
              {grounds.map(g=><option key={g.id} value={g.name}>{g.name} ({g.location})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600 }}>Team Name</label>
            <select value={form.team} onChange={e=>setForm({...form,team:e.target.value})} style={{ width:"100%",padding:"9px 11px",borderRadius:8,border:"1.5px solid #e5e7eb",fontSize:13,boxSizing:"border-box",fontFamily:"var(--font-body)" }}>
              {TEAMS.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:7,fontWeight:600 }}>Match Type</label>
            <div style={{ display:"flex",gap:10 }}>
              {[["external","External (9 players)"],["internal","Internal 9v9 (18)"]].map(([v,l]) => (
                <button key={v} onClick={()=>setForm({...form,type:v})} style={{ flex:1,padding:"9px",borderRadius:9,border:`2px solid ${form.type===v?"#1D9E75":"#e5e7eb"}`,background:form.type===v?"#f0fdf4":"#fff",color:form.type===v?"#065f46":"#6b7280",fontSize:12,cursor:"pointer",fontWeight:form.type===v?700:500,fontFamily:"var(--font-body)" }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:10,border:"1.5px solid #e5e7eb",background:"#fff",color:"#374151",fontSize:13,cursor:"pointer",fontWeight:600,fontFamily:"var(--font-body)" }}>Cancel</button>
          <button onClick={submit} disabled={busy} style={{ flex:2,padding:"11px",borderRadius:10,background:"#0B3D2E",border:"none",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)" }}>{busy?"Creating...":"Create Match →"}</button>
        </div>
      </div>
    </div>
  )
}
function PlayersPage({ players, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:"", phone:"", pin:"1234" })
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    if(!form.name.trim()) return
    setBusy(true)
    try { const {addPlayer} = await import("../db.js"); await addPlayer(form.name.trim(),form.phone.trim(),form.pin||"1234"); setForm({name:"",phone:"",pin:"1234"}); setShowAdd(false); onRefresh() }
    catch(e) { alert(e.message) }
    setBusy(false)
  }
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
        <h2 style={{ color:"#0B3D2E",fontSize:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)" }}>Players ({players.length})</h2>
        <Btn variant="green" onClick={() => setShowAdd(true)}>+ Add Player</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
        {players.map(p => (
          <Card key={p.id} style={{ padding:"16px 18px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:11,marginBottom:12 }}>
              <Av name={p.name} id={p.id} sz={42}/>
              <div>
                <div style={{ fontWeight:800,fontSize:13,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>{p.name}</div>
                <div style={{ fontSize:11,color:"#9ca3af",marginTop:2 }}>📱 {p.phone||"No phone"}</div>
                <div style={{ fontSize:11,color:"#9ca3af" }}>PIN: {p.pin}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {showAdd && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300 }}>
          <div style={{ background:"#fff",borderRadius:20,padding:28,width:380,boxShadow:"0 24px 60px rgba(0,0,0,0.25)" }}>
            <h3 style={{ margin:"0 0 20px",fontSize:16,fontWeight:800,color:"#0B3D2E",fontFamily:"var(--font-head)" }}>Add New Player</h3>
            <div style={{ display:"grid",gap:12 }}>
              {[["Name","name","text"],["Phone","phone","tel"],["PIN","pin","text"]].map(([label,key,type]) => (
                <div key={key}>
                  <label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:5,fontWeight:600 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{ width:"100%",padding:"9px 12px",borderRadius:9,border:"1.5px solid #e5e7eb",fontSize:13,outline:"none",background:"#fafafa",boxSizing:"border-box",fontFamily:"var(--font-body)" }}/>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex:1,padding:"10px",borderRadius:9,border:"1.5px solid #e5e7eb",background:"#fff",fontSize:13,cursor:"pointer",fontFamily:"var(--font-body)" }}>Cancel</button>
              <button onClick={submit} disabled={busy} style={{ flex:2,padding:"10px",borderRadius:9,background:"#0B3D2E",border:"none",color:"#fff",fontSize:13,cursor:"pointer",fontWeight:800,fontFamily:"var(--font-head)" }}>{busy?"Adding...":"Add Player"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
function CalendarPage({ matches, grounds, onNavigate }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const firstDay = new Date(year,month,1).getDay()
  const daysInMonth = new Date(year,month+1,0).getDate()
  const monthName = new Date(year,month).toLocaleDateString("en-IN",{month:"long",year:"numeric"})
  const ds = d => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
        <h2 style={{ color:"#0B3D2E",fontSize:20,fontWeight:800,margin:0,fontFamily:"var(--font-head)" }}>Calendar</h2>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={() => { const d=new Date(year,month-1); setYear(d.getFullYear()); setMonth(d.getMonth()) }} style={{ padding:"6px 12px",borderRadius:8,border:"1.5px solid #e5e7eb",background:"#fff",cursor:"pointer" }}>← Prev</button>
          <span style={{ padding:"6px 14px",fontSize:14,fontWeight:700,fontFamily:"var(--font-head)",color:"#0B3D2E" }}>{monthName}</span>
          <button onClick={() => { const d=new Date(year,month+1); setYear(d.getFullYear()); setMonth(d.getMonth()) }} style={{ padding:"6px 12px",borderRadius:8,border:"1.5px solid #e5e7eb",background:"#fff",cursor:"pointer" }}>Next →</button>
        </div>
      </div>
      <Card style={{ overflow:"hidden",marginBottom:18 }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:"2px solid #f3f4f6" }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} style={{ textAlign:"center",padding:"10px 0",fontSize:12,fontWeight:700,color:"#6b7280" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)" }}>
          {Array.from({length:firstDay},(_,i) => <div key={"e"+i} style={{ minHeight:82,borderRight:"1px solid #f3f4f6",borderBottom:"1px solid #f3f4f6",background:"#fafafa" }}/>)}
          {Array.from({length:daysInMonth},(_,i) => {
            const d=i+1, s=ds(d), dm=matches.filter(m=>m.date===s), isToday=s===now.toISOString().split("T")[0]
            return (
              <div key={d} style={{ minHeight:82,padding:7,borderRight:"1px solid #f3f4f6",borderBottom:"1px solid #f3f4f6",background:isToday?"#f0fdf4":"#fff" }}>
                <div style={{ width:25,height:25,borderRadius:"50%",background:isToday?"#1D9E75":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:isToday?800:400,color:isToday?"#fff":"#374151",marginBottom:4 }}>{d}</div>
                {dm.map(m => <div key={m.id} onClick={() => onNavigate("matches",m.id)} style={{ background:m.status==="upcoming"?"#dbeafe":m.status==="completed"?"#d1fae5":"#fee2e2",color:m.status==="upcoming"?"#1e3a8a":m.status==="completed"?"#065f46":"#991b1b",borderRadius:5,padding:"2px 6px",fontSize:10,fontWeight:700,cursor:"pointer",marginBottom:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis" }}>🏏 {m.team}</div>)}
              </div>
            )
          })}
        </div>
      </Card>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        <Card style={{ padding:18 }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",marginBottom:12,fontFamily:"var(--font-head)" }}>📍 Grounds</div>
          {grounds.map(g => <div key={g.id} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f3f4f6" }}><div><div style={{ fontWeight:700,fontSize:13 }}>{g.name}</div><div style={{ fontSize:11,color:"#9ca3af" }}>{g.location}</div></div><Tag col="green">{matches.filter(m=>m.ground===g.name).length} matches</Tag></div>)}
        </Card>
        <Card style={{ padding:18 }}>
          <div style={{ fontWeight:800,fontSize:14,color:"#0B3D2E",marginBottom:12,fontFamily:"var(--font-head)" }}>⏰ Time Slots</div>
          {TIME_SLOTS.map((t,i) => <div key={i} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #f3f4f6" }}><div style={{ width:7,height:7,borderRadius:"50%",background:i<4?"#1D9E75":"#185FA5",flexShrink:0 }}/><span style={{ fontSize:12,color:"#374151" }}>{t}</span><span style={{ fontSize:11,color:"#9ca3af",marginLeft:"auto" }}>{i<4?"Morning":"Evening"}</span></div>)}
        </Card>
      </div>
    </div>
  )
}
