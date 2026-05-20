import { useState, useEffect, useRef } from "react"
import { LogoFull, Av, Tag, Card, Spinner } from "./ui.jsx"
import { fetchMatchPlayers, fetchExpenses, fetchPayments, fetchChat, sendMessage, setPlayerStatus, subscribeToChat } from "../db.js"
import { fmtDate, dayName } from "../constants.js"
import { supabase } from "../supabase.js"
function ppShare(expenses, confirmedCount) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  return confirmedCount > 0 ? Math.round(total / confirmedCount) : 0
}
export default function PlayerPortal({ player, matches, onLogout }) {
  const [myMatches, setMyMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState(null)
  const [detail, setDetail] = useState(null)
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
    })()
  }, [matches, player.id])
  const loadDetail = async (m) => {
    try {
      const [mps, exps, pays, chats] = await Promise.all([fetchMatchPlayers(m.id), fetchExpenses(m.id), fetchPayments(m.id), fetchChat(m.id)])
      setDetail({ match: m, matchPlayers: mps, expenses: exps, payments: pays, chat: chats })
      setSelId(m.id)
    } catch (e) { alert("Error: " + e.message) }
  }
  if (loading) return <div style={{ minHeight:"100vh", background:"#F0F4F1", display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>
  if (selId && detail) return (
    <MatchDetailPlayer detail={detail} player={player}
      onBack={() => { setSelId(null); setDetail(null) }}
      onRespond={async (action) => { await setPlayerStatus(detail.match.id, player.id, action); await loadDetail(detail.match) }}
    />
  )
  return (
    <div style={{ minHeight:"100vh", background:"#F0F4F1", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#0B3D2E", height:54, display:"flex", alignItems:"center", padding:"0 20px", gap:12 }}>
        <LogoFull size={30} />
        <div style={{ flex:1 }} />
        <Av name={player.name} id={player.id} sz={28} />
        <span style={{ color:"rgba(255,255,255,0.75)", fontSize:13 }}>{player.name}</span>
        <button onClick={onLogout} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)" }}>Logout</button>
      </div>
      <div style={{ maxWidth:660, margin:"0 auto", padding:"22px 16px" }}>
        <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:800, color:"#0B3D2E", fontFamily:"var(--font-head)" }}>Your Match Invites</h2>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#d1fae5", borderRadius:10, border:"1px solid #6ee7b7", marginTop:12, marginBottom:20 }}>
          <span style={{ fontSize:15 }}>🔒</span>
          <span style={{ fontSize:12, color:"#065f46", fontWeight:500 }}>You only see matches you have been personally invited to.</span>
        </div>
        {myMatches.length === 0 ? (
          <Card style={{ padding:"44px 24px", textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🏏</div>
            <div style={{ fontWeight:700, fontSize:16, color:"#0B3D2E", marginBottom:6, fontFamily:"var(--font-head)" }}>No invites yet</div>
            <div style={{ color:"#6b7280", fontSize:13 }}>You will be notified when the admin selects you for a match.</div>
          </Card>
        ) : myMatches.map(({ match: m, myStatus, matchPlayers }) => {
          const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
          const pp = ppShare([], confirmed.length)
          return (
            <Card key={m.id} style={{ padding:"18px 20px", marginBottom:12, cursor:"pointer" }} onClick={() => loadDetail(m)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontWeight:800, color:"#0B3D2E", fontSize:15, marginBottom:4, fontFamily:"var(--font-head)" }}>{m.team}</div>
                  <div style={{ color:"#6b7280", fontSize:12, lineHeight:1.8 }}>📅 {fmtDate(m.date)}<br/>⏰ {m.time_slot}<br/>📍 {m.ground}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end" }}>
                  <Tag col={m.status === "upcoming" ? "blue" : m.status === "completed" ? "green" : "red"}>{m.status}</Tag>
                  <Tag col={myStatus === "confirmed" ? "green" : myStatus === "waitlist" ? "yellow" : myStatus === "declined" ? "red" : "orange"}>
                    {myStatus === "confirmed" ? "✅ Confirmed" : myStatus === "waitlist" ? "⏳ Waitlist" : myStatus === "declined" ? "❌ Declined" : "⚡ Respond"}
                  </Tag>
                </div>
              </div>
              {m.status === "upcoming" && myStatus === "pending" && (
                <div style={{ display:"flex", gap:10, marginTop:14 }} onClick={e => e.stopPropagation()}>
                  <button onClick={async e => { e.stopPropagation(); await setPlayerStatus(m.id, player.id, "confirmed"); window.location.reload() }} style={{ flex:1, padding:"10px", borderRadius:10, background:"#1D9E75", border:"none", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)" }}>✅ Available</button>
                  <button onClick={async e => { e.stopPropagation(); await setPlayerStatus(m.id, player.id, "declined"); window.location.reload() }} style={{ flex:1, padding:"10px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", color:"#991b1b", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)" }}>❌ Can not Make It</button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
function MatchDetailPlayer({ detail, player, onBack, onRespond }) {
  const { match: m, matchPlayers, expenses, payments, chat } = detail
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
    <div style={{ minHeight:"100vh", background:"#F0F4F1", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#0B3D2E", height:54, display:"flex", alignItems:"center", padding:"0 20px", gap:12 }}>
        <LogoFull size={30} />
        <div style={{ flex:1 }} />
        <button onClick={onBack} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"var(--font-body)" }}>← Back</button>
      </div>
      <div style={{ maxWidth:660, margin:"0 auto", padding:"22px 16px" }}>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#0B3D2E,#0F5C43)", padding:"22px 24px" }}>
            <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, marginBottom:3 }}>{dayName(m.date)}, {fmtDate(m.date)}</div>
            <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:"0 0 4px", fontFamily:"var(--font-head)" }}>{m.team}</h2>
            <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13 }}>⏰ {m.time_slot} · 📍 {m.ground}</div>
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <Tag col={m.status === "upcoming" ? "blue" : "green"}>{m.status}</Tag>
              <Tag col={myStatus === "confirmed" ? "green" : myStatus === "waitlist" ? "yellow" : myStatus === "declined" ? "red" : "orange"}>
                {myStatus === "confirmed" ? "✅ You are in!" : myStatus === "waitlist" ? "⏳ On waitlist" : myStatus === "declined" ? "❌ Declined" : "⚡ Awaiting response"}
              </Tag>
            </div>
          </div>
          {m.status === "upcoming" && myStatus === "pending" && (
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", gap:10 }}>
              <button onClick={() => onRespond("confirmed")} style={{ flex:1, padding:"11px", borderRadius:10, background:"#1D9E75", border:"none", color:"#fff", fontSize:14, cursor:"pointer", fontWeight:800, fontFamily:"var(--font-head)" }}>✅ Available</button>
              <button onClick={() => onRespond("declined")} style={{ flex:1, padding:"11px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", color:"#991b1b", fontSize:14, cursor:"pointer", fontWeight:700, fontFamily:"var(--font-head)" }}>❌ Can not Make It</button>
            </div>
          )}
          {m.status === "completed" && expenses.length > 0 && (
            <div style={{ padding:"18px 20px", borderBottom:"1px solid #f3f4f6" }}>
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
                  <span style={{ fontWeight:800, fontSize:17, color:myPaid ? "#1D9E75" : "#c2410c" }}>₹{pp} {myPaid ? "✓ Paid" : "(pending)"}</span>
                </div>
              </div>
            </div>
          )}
          <div style={{ padding:"18px 20px" }}>
            <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:12, fontFamily:"var(--font-head)" }}>💬 Match Chat</div>
            <div style={{ height:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
              {msgs.length === 0 && <p style={{ color:"#9ca3af", fontSize:13 }}>No messages yet.</p>}
              {msgs.map((msg, i) => {
                const isMe = msg.sender === player.name
                return (
                  <div key={i} style={{ display:"flex", flexDirection:isMe ? "row-reverse" : "row", gap:8, alignItems:"flex-end" }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:msg.sender === "Admin" ? "#1D9E75" : "#185FA5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff", flexShrink:0 }}>
                      {msg.sender === "Admin" ? "AD" : msg.sender.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ maxWidth:"68%" }}>
                      <div style={{ fontSize:10, color:"#9ca3af", marginBottom:2, textAlign:isMe ? "right" : "left" }}>{msg.sender}</div>
                      <div style={{ background:isMe ? "#d1fae5" : "#f3f4f6", borderRadius:isMe ? "12px 12px 3px 12px" : "12px 12px 12px 3px", padding:"8px 12px", fontSize:13, color:"#111827" }}>{msg.message}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={chatRef}/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && doSend()} placeholder="Type a message..." style={{ flex:1, padding:"9px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:13, outline:"none", background:"#fafafa", fontFamily:"var(--font-body)" }}/>
              <button onClick={doSend} style={{ padding:"9px 15px", borderRadius:9, background:"#1D9E75", border:"none", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:600, fontFamily:"var(--font-body)" }}>Send</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
