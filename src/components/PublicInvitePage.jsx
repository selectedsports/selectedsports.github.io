import { useState, useEffect } from "react"
import { Logo } from "./ui.jsx"
import { fetchMatchByToken, submitPublicResponse } from "../db.js"
import { fmtDate, dayName } from "../constants.js"
export default function PublicInvitePage({ token }) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [choice, setChoice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  useEffect(() => {
    ;(async () => {
      try {
        const m = await fetchMatchByToken(token)
        if (!m) { setError("Match not found."); setLoading(false); return }
        if (!m.link_active) { setError("This invite link is no longer active."); setLoading(false); return }
        if (m.status !== "upcoming") { setError("This match has already been completed or cancelled."); setLoading(false); return }
        setMatch(m)
      } catch { setError("Invalid or expired invite link.") }
      setLoading(false)
    })()
  }, [token])
  const submit = async () => {
    if (!name.trim()) { alert("Please enter your name."); return }
    if (!choice) { alert("Please select your availability."); return }
    setSubmitting(true)
    try {
      await submitPublicResponse(match.id, name.trim(), phone.trim(), choice)
      setSubmitted({ name: name.trim(), availability: choice })
      setDone(true)
    } catch (e) { alert("Something went wrong: " + e.message) }
    setSubmitting(false)
  }
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#071a10)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid rgba(255,255,255,0.15)", borderTopColor:"#1D9E75", animation:"spin 0.7s linear infinite", margin:"0 auto" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14, marginTop:16 }}>Loading match details...</p>
      </div>
    </div>
  )
  if (error) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#071a10)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"36px 42px", width:360, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ color:"#fff", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, marginBottom:10 }}>Link Unavailable</h2>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:14, lineHeight:1.6 }}>{error}</p>
      </div>
    </div>
  )
  if (done && submitted) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#071a10)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:"24px 16px" }}>
      <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:20, padding:"32px 24px", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>{submitted.availability === "yes" ? "✅" : "❌"}</div>
        <h2 style={{ color:"#0B3D2E", fontFamily:"var(--font-head)", fontSize:22, fontWeight:800, marginBottom:8 }}>{submitted.availability === "yes" ? "You are in the squad!" : "Response recorded"}</h2>
        <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.6 }}>{submitted.availability === "yes" ? `Thanks ${submitted.name}! Your availability has been sent to the admin. You will be confirmed once the squad is finalised.` : `Thanks ${submitted.name}. We have noted you are not available this time. See you next match!`}</p>
        <div style={{ marginTop:24, padding:"14px 16px", background:"#f0fdf4", borderRadius:12, border:"1px solid #bbf7d0", textAlign:"left" }}>
          <div style={{ color:"#065f46", fontWeight:700, fontSize:15, marginBottom:4 }}>{match.team}</div>
          <div style={{ color:"#059669", fontSize:13, lineHeight:1.8 }}>📅 {fmtDate(match.date)}<br/>⏰ {match.time_slot}<br/>📍 {match.ground}</div>
        </div>
      </div>
    </div>
  )
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#071a10)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", fontFamily:"var(--font-body)" }}>
      <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:20, overflow:"hidden", boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ background:"linear-gradient(135deg,#0B3D2E,#0F5C43)", padding:"24px 24px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <Logo size={34} />
            <div>
              <div style={{ color:"#fff", fontFamily:"var(--font-head)", fontWeight:800, fontSize:15 }}>Selected Sports</div>
              <div style={{ color:"#4ECBA0", fontFamily:"var(--font-head)", fontWeight:600, fontSize:10, letterSpacing:"2px", textTransform:"uppercase" }}>Match Invite</div>
            </div>
          </div>
          <div style={{ display:"inline-block", background:"rgba(29,158,117,0.25)", border:"1px solid rgba(78,203,160,0.35)", borderRadius:8, padding:"4px 10px", marginBottom:12 }}>
            <span style={{ color:"#4ECBA0", fontSize:11, fontWeight:600 }}>🔗 Public invite - no login needed</span>
          </div>
          <h1 style={{ color:"#fff", fontFamily:"var(--font-head)", fontSize:22, fontWeight:900, margin:"0 0 6px" }}>{match.team}</h1>
          <div style={{ color:"rgba(255,255,255,0.65)", fontSize:13, lineHeight:1.9 }}>
            📅 <strong style={{ color:"#fff" }}>{dayName(match.date)}</strong>, {fmtDate(match.date)}<br/>⏰ {match.time_slot}<br/>📍 {match.ground}
          </div>
        </div>
        <div style={{ padding:"24px 24px 28px" }}>
          <h2 style={{ color:"#0B3D2E", fontFamily:"var(--font-head)", fontSize:17, fontWeight:800, margin:"0 0 20px" }}>Mark your availability</h2>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, color:"#374151", display:"block", marginBottom:6, fontWeight:600 }}>Your full name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" style={{ width:"100%", padding:"11px 13px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", boxSizing:"border-box", fontFamily:"var(--font-body)" }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, color:"#374151", display:"block", marginBottom:6, fontWeight:600 }}>WhatsApp number <span style={{ color:"#9ca3af", fontWeight:400 }}>(optional)</span></label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" type="tel" style={{ width:"100%", padding:"11px 13px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", boxSizing:"border-box", fontFamily:"var(--font-body)" }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:12, color:"#374151", display:"block", marginBottom:10, fontWeight:600 }}>Are you available? *</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <button onClick={() => setChoice("yes")} style={{ padding:"16px 12px", borderRadius:12, border:`2px solid ${choice === "yes" ? "#1D9E75" : "#e5e7eb"}`, background:choice === "yes" ? "#f0fdf4" : "#fafafa", cursor:"pointer", fontFamily:"var(--font-body)" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>✅</div>
                <div style={{ fontWeight:800, fontSize:15, color:choice === "yes" ? "#065f46" : "#374151", fontFamily:"var(--font-head)" }}>Available</div>
              </button>
              <button onClick={() => setChoice("no")} style={{ padding:"16px 12px", borderRadius:12, border:`2px solid ${choice === "no" ? "#ef4444" : "#e5e7eb"}`, background:choice === "no" ? "#fff5f5" : "#fafafa", cursor:"pointer", fontFamily:"var(--font-body)" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>❌</div>
                <div style={{ fontWeight:800, fontSize:15, color:choice === "no" ? "#991b1b" : "#374151", fontFamily:"var(--font-head)" }}>Not Available</div>
              </button>
            </div>
          </div>
          <div style={{ padding:"10px 14px", background:"#fff7ed", borderRadius:10, border:"1px solid #fed7aa", marginBottom:20 }}>
            <p style={{ fontSize:12, color:"#9a3412", margin:0, lineHeight:1.6 }}>⚡ Your response goes to the admin for review. Final squad confirmed by admin.</p>
          </div>
          <button onClick={submit} disabled={submitting || !name.trim() || !choice} style={{ width:"100%", padding:"14px", borderRadius:12, background:(!name.trim() || !choice) ? "#d1d5db" : "#0B3D2E", border:"none", color:(!name.trim() || !choice) ? "#6b7280" : "#fff", fontSize:15, fontWeight:800, cursor:(!name.trim() || !choice) ? "not-allowed" : "pointer", fontFamily:"var(--font-head)" }}>
            {submitting ? "Submitting..." : "Submit Availability →"}
          </button>
        </div>
      </div>
    </div>
  )
}
