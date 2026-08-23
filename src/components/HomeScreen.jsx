import { useState, useEffect } from "react"
import { useMobile } from "../hooks/useMobile.js"
import { fetchPlayerCount, fetchMatchCount, fetchTeamCount } from "../db.js"
import { Users, Swords, Trophy } from "lucide-react"

export default function HomeScreen({ onLogin, onRegister }) {
  const isMobile = useMobile()
  const [playerCount, setPlayerCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [teamCount, setTeamCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [countUp, setCountUp] = useState({ p:0, m:0, t:0 })

  useEffect(() => {
    fetchPlayerCount().then(setPlayerCount).catch(()=>{})
    fetchMatchCount().then(setMatchCount).catch(()=>{})
    fetchTeamCount().then(setTeamCount).catch(()=>{})
    setTimeout(() => setMounted(true), 50)
  }, [])

  useEffect(() => {
    const duration = 700
    const steps = 20
    const stepTime = duration / steps
    let i = 0
    const id = setInterval(() => {
      i++
      setCountUp({
        p: Math.round((playerCount * i) / steps),
        m: Math.round((matchCount * i) / steps),
        t: Math.round((teamCount * i) / steps),
      })
      if (i >= steps) clearInterval(id)
    }, stepTime)
    return () => clearInterval(id)
  }, [playerCount, matchCount, teamCount])

  const stats = [
    { icon:Users, v:countUp.p, label:"Players" },
    { icon:Swords, v:countUp.m, label:"Matches" },
    { icon:Trophy, v:countUp.t, label:"Teams" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", top:"-10%", right:"-15%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0) 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:"-10%", left:"-15%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.04) 0%, rgba(37,99,235,0) 70%)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:500, textAlign:"center", padding:"32px 20px", position:"relative", zIndex:1, opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(-10px)", transition:"opacity 400ms, transform 400ms" }}>
        <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:isMobile?170:200, width:"auto", display:"block", margin:"0 auto 14px" }}/>
        <div style={{ fontSize:isMobile?20:22, fontWeight:700, color:"#0F172A", fontFamily:"var(--font-head)", lineHeight:1.3, marginBottom:8 }}>
          PLAY. COMPETE. <span style={{ color:"#166534" }}>GET RECOGNISED.</span>
        </div>
        <p style={{ color:"#64748B", fontSize:14, marginBottom:24, maxWidth:360, margin:"0 auto 24px" }}>
          Join India's fastest growing cricket community.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:28 }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:16, padding:"14px 8px", boxShadow:"0 4px 12px rgba(15,23,42,0.04)" }}>
              <s.icon size={18} color="#166534" style={{ marginBottom:4 }}/>
              <div style={{ fontSize:20, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{s.v}+</div>
              <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={onLogin} style={{ width:"100%", height:54, borderRadius:14, background:"linear-gradient(135deg,#166534,#14532D)", border:"none", color:"#fff", fontSize:15, cursor:"pointer", fontFamily:"var(--font-head)", fontWeight:700, boxShadow:"0 8px 20px rgba(37,99,235,0.3)", letterSpacing:"0.2px", marginBottom:12, transition:"transform 200ms, box-shadow 200ms" }}
          onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 28px rgba(37,99,235,0.4)" }}
          onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(37,99,235,0.3)" }}>
          Login to Selected Sports →
        </button>

        <button onClick={onRegister} style={{ width:"100%", padding:"14px 16px", borderRadius:14, background:"#FFFFFF", border:"1.5px solid #166534", color:"#166534", fontSize:14, cursor:"pointer", fontFamily:"var(--font-head)", fontWeight:700, transition:"background 200ms" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(37,99,235,0.05)" }}
          onMouseLeave={e=>{ e.currentTarget.style.background="#FFFFFF" }}>
          Create New Player Account
        </button>

        <div style={{ fontSize:12, color:"#94A3B8", fontWeight:600, marginTop:26, letterSpacing:0.3 }}>
          Play • Compete • Get Recognised
        </div>
      </div>
    </div>
  )
}
