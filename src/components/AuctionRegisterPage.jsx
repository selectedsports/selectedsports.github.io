import { useState, useEffect } from "react"
import { Logo, Spinner } from "./ui.jsx"
import { registerAuctionPlayer, checkAuctionPhoneExists, fetchSettings, fetchPlayers } from "../db.js"

const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"]

function titleCase(v) {
  return v.replace(/[^a-zA-Z ]/g, "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

const iS = { width:"100%", padding:"14px", borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:15, outline:"none", background:"#FFFFFF", color:"#0F172A", boxSizing:"border-box", fontFamily:"var(--font-body)" }
const lS = { fontSize:12, color:"#64748B", display:"block", marginBottom:6, fontWeight:600 }

export default function AuctionRegisterPage() {
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [registrationOpen, setRegistrationOpen] = useState(false)
  useEffect(() => {
    fetchSettings().then(s => setRegistrationOpen(s.auction_registration_open === "true")).catch(()=>setRegistrationOpen(false)).finally(()=>setCheckingStatus(false))
  }, [])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [matchedExisting, setMatchedExisting] = useState(false)
  const [checkingPhone, setCheckingPhone] = useState(false)

  const handlePhoneChange = async (val) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 10)
    setPhone(cleaned)
    setMatchedExisting(false)
    if (cleaned.length === 10) {
      setCheckingPhone(true)
      try {
        const players = await fetchPlayers()
        const found = players.find(p => p.phone && p.phone.replace(/[^0-9]/g, "").slice(-10) === cleaned)
        if (found) {
          setName(found.name)
          setMatchedExisting(true)
          if (found.playing_role) setRole(found.playing_role)
        }
      } catch {}
      setCheckingPhone(false)
    }
  }
  const [role, setRole] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const submit = async () => {
    setError("")
    if (!name.trim()) { setError("Name is required"); return }
    const cleaned = phone.replace(/[^0-9]/g, "").slice(-10)
    if (cleaned.length !== 10) { setError("Enter a valid 10-digit mobile number"); return }
    if (!role) { setError("Select your playing role"); return }

    setBusy(true)
    try {
      const exists = await checkAuctionPhoneExists(cleaned)
      if (exists) { setError("This number is already registered for the auction."); setBusy(false); return }
      await registerAuctionPlayer(name.trim(), cleaned, role)
      setDone(true)
    } catch (e) {
      setError("Registration failed: " + e.message)
    }
    setBusy(false)
  }

  if (checkingStatus) {
    return (
      <div style={{ minHeight:"100vh", background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Spinner/>
      </div>
    )
  }

  if (!registrationOpen) {
    return (
      <div style={{ minHeight:"100vh", background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", fontFamily:"var(--font-body)" }}>
        <div style={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:20, padding:"40px 28px", width:"100%", maxWidth:420, textAlign:"center", boxShadow:"0 10px 30px rgba(15,23,42,0.08)" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}><Logo size={54}/></div>
          <div style={{ fontSize:44, marginBottom:14 }}>🔒</div>
          <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:19, fontWeight:800, marginBottom:10 }}>Registration Closed</h2>
          <p style={{ color:"#64748B", fontSize:14, lineHeight:1.7 }}>
            Auction registration isn't open right now. Check back later or contact your organizer for details on the next auction.
          </p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ minHeight:"100vh", background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", fontFamily:"var(--font-body)" }}>
        <div style={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:20, padding:"40px 28px", width:"100%", maxWidth:420, textAlign:"center", boxShadow:"0 10px 30px rgba(15,23,42,0.08)" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🏏</div>
          <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, marginBottom:10 }}>You're Registered!</h2>
          <p style={{ color:"#64748B", fontSize:14, lineHeight:1.7 }}>
            Thanks, <strong style={{ color:"#2563EB" }}>{name}</strong> — you're on the auction list as a <strong style={{ color:"#2563EB" }}>{role}</strong>.<br/><br/>
            We'll notify you when the auction begins.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 16px", fontFamily:"var(--font-body)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", top:"-10%", right:"-15%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0) 70%)", pointerEvents:"none" }}/>
      <div style={{ background:"#FFFFFF", border:"1px solid #E2E8F0", borderRadius:20, padding:"32px 26px", width:"100%", maxWidth:500, boxShadow:"0 10px 30px rgba(15,23,42,0.08)", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
          <Logo size={54}/>
        </div>
        <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, textAlign:"center", marginBottom:4 }}>Player Auction Registration</h2>
        <p style={{ color:"#64748B", fontSize:13, textAlign:"center", marginBottom:24 }}>Enter your details to be listed in the upcoming auction</p>

        <label style={lS}>Mobile Number *</label>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <div style={{ padding:"14px 12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#FFFFFF", color:"#0F172A", fontSize:15, flexShrink:0, fontWeight:700 }}>+91</div>
          <input type="tel" value={phone} onChange={e=>handlePhoneChange(e.target.value)} placeholder="10-digit number" maxLength={10} style={{...iS, flex:1, minWidth:0}}/>
        </div>
        {checkingPhone && <div style={{ fontSize:12, color:"#94A3B8", marginBottom:8 }}>Checking...</div>}
        {matchedExisting && <div style={{ fontSize:12, color:"#22C55E", fontWeight:600, marginBottom:8 }}>✓ Welcome back, {name}!</div>}

        <label style={lS}>Full Name *</label>
        <input value={name} onChange={e=>setName(titleCase(e.target.value))} placeholder="Your name" style={{...iS, marginBottom:4}}/>
        <div style={{ fontSize:11, color:"#94A3B8", marginBottom:16 }}>Please use your real name, not a nickname.</div>

        <label style={lS}>Playing Role *</label>
        {matchedExisting && role ? (
          <div style={{ padding:"14px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#0F172A", fontSize:14, fontWeight:600, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            {role}
            <button type="button" onClick={()=>setMatchedExisting(false)} style={{ background:"none", border:"none", color:"#2563EB", fontSize:12, fontWeight:600, cursor:"pointer" }}>Change</button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:16 }}>
            {ROLES.map(r => (
              <button key={r} onClick={()=>setRole(r)} style={{ padding:"12px 8px", borderRadius:10, border:role===r?"2px solid #2563EB":"1.5px solid #E2E8F0", background:role===r?"rgba(37,99,235,0.08)":"#FFFFFF", color:role===r?"#2563EB":"#0F172A", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>{r}</button>
            ))}
          </div>
        )}

        {error && <p style={{ color:"#EF4444", fontSize:12, marginTop:8, marginBottom:0 }}>{error}</p>}

        <button onClick={submit} disabled={busy} style={{ width:"100%", height:54, borderRadius:14, background:"linear-gradient(135deg,#2563EB,#1D4ED8)", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", marginTop:20, fontFamily:"var(--font-head)", boxShadow:"0 8px 20px rgba(37,99,235,0.3)", transition:"transform 200ms, box-shadow 200ms" }}
          onMouseEnter={e=>{ if(!busy){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 28px rgba(37,99,235,0.4)" } }}
          onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(37,99,235,0.3)" }}>
          {busy ? "Submitting..." : "Register for Auction →"}
        </button>
      </div>
    </div>
  )
}
