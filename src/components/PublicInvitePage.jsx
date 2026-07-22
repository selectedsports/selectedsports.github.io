import { useState, useEffect } from "react"
import { Logo } from "./ui.jsx"
import { fetchMatchByToken, fetchPlayers, addPlayer, confirmPlayerToMatch, fetchMatchPlayers } from "../db.js"
import { fmtDate, dayName, ADMIN_PHONE } from "../constants.js"
import { saveSession } from "../session.js"

const iS = { width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:15, outline:"none", background:"#fafafa", boxSizing:"border-box", fontFamily:"var(--font-body)" }
const lS = { fontSize:12, color:"#374151", display:"block", marginBottom:6, fontWeight:600 }

function MatchHeader({ match }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#0B3D2E,#0F5C43)", padding:"24px 24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <Logo size={32}/>
        <div>
          <div style={{ color:"#fff", fontFamily:"var(--font-head)", fontWeight:800, fontSize:15 }}>Selected Sports</div>
          <div style={{ color:"#4ECBA0", fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>Match Invite</div>
        </div>
      </div>
      <h1 style={{ color:"#fff", fontFamily:"var(--font-head)", fontSize:20, fontWeight:900, margin:"0 0 8px" }}>{match.team}</h1>
      <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13, lineHeight:1.9 }}>
        📅 <strong style={{ color:"#fff" }}>{fmtDate(match.date)}</strong><br/>
        ⏰ {match.time_slot}<br/>
        📍 {match.ground}
      </div>
    </div>
  )
}

function roleFor(p) {
  const cleaned = (p.phone||"").replace(/[^0-9]/g,"").slice(-10)
  const adminPhone = ADMIN_PHONE.replace(/[^0-9]/g,"").slice(-10)
  if (cleaned === adminPhone) return "admin"
  if (p.role === "pro") return "pro"
  return "player"
}

export default function PublicInvitePage({ token }) {
  const [match, setMatch]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [step, setStep]         = useState("check") // check | register | login | availability | matchview
  const [phone, setPhone]       = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName]   = useState("")
  const [pin, setPin]           = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [foundPlayer, setFoundPlayer] = useState(null)
  const [choice, setChoice]     = useState(null)
  const [busy, setBusy]         = useState(false)
  const [myStatus, setMyStatus] = useState(null) // confirmed | declined | waitlist | pending | null
  const [squad, setSquad]       = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const m = await fetchMatchByToken(token)
        if (!m) { setError("Match not found."); setLoading(false); return }
        if (!m.link_active) { setError("This invite link is no longer active."); setLoading(false); return }
        if (m.status !== "upcoming") { setError("This match has already been completed or cancelled."); setLoading(false); return }
        setMatch(m)
        setStep("check")
      } catch { setError("Invalid or expired invite link.") }
      setLoading(false)
    })()
  }, [token])

  // Load the squad list (all match_players rows with player info) for this match
  const loadSquad = async () => {
    try {
      const rows = await fetchMatchPlayers(match.id)
      setSquad(rows || [])
      return rows || []
    } catch { setSquad([]); return [] }
  }

  // After identifying the player (login or register), check if they've already responded.
  // If yes -> go straight to matchview (with their real status). If no -> go to availability.
  const routeAfterAuth = async (playerObj) => {
    const rows = await loadSquad()
    const mine = rows.find(r => r.player_id === playerObj.id)
    if (mine && (mine.status === "confirmed" || mine.status === "declined" || mine.status === "waitlist")) {
      setMyStatus(mine.status)
      setStep("matchview")
    } else {
      setStep("availability")
    }
  }

  // Step 1: Check if phone is registered
  const checkPhone = async () => {
    const cleaned = phone.replace(/[^0-9]/g,"").slice(-10)
    if (cleaned.length !== 10) { alert("Enter a valid 10-digit mobile number."); return }
    setBusy(true)
    try {
      const players = await fetchPlayers()
      const found = players.find(p => p.phone && p.phone.replace(/[^0-9]/g,"").slice(-10) === cleaned)
      if (found) { setFoundPlayer(found); setStep("login") }
      else { setStep("register") }
    } catch(e) { alert("Connection error: " + e.message) }
    setBusy(false)
  }

  // Step 2a: Register new player
  const register = async () => {
    if (!firstName.trim()) { alert("First name required"); return }
    if (!lastName.trim())  { alert("Last name required"); return }
    if (pin.length !== 4)  { alert("PIN must be 4 digits"); return }
    if (pin !== confirmPin) { alert("PINs do not match"); return }
    setBusy(true)
    try {
      const cleaned = phone.replace(/[^0-9]/g,"").slice(-10)
      const allPlayers = await fetchPlayers()
      if (allPlayers.find(p => p.phone && p.phone.replace(/[^0-9]/g,"").slice(-10) === cleaned)) {
        alert("This number already has an account. Please go back and it will detect your account.")
        setBusy(false); return
      }
      const fullName = firstName.trim() + " " + lastName.trim()
      const newPlayer = await addPlayer(fullName, cleaned, pin)
      setFoundPlayer(newPlayer)
      saveSession(roleFor(newPlayer), newPlayer)
      setStep("availability") // brand new player — never responded, no need to check
    } catch(e) { alert("Registration failed: " + e.message) }
    setBusy(false)
  }

  // Step 2b: Login existing player
  const loginPlayer = async () => {
    if (pin.length !== 4) { alert("Enter your 4-digit PIN"); return }
    if (pin !== foundPlayer.pin) { alert("Wrong PIN. Ask your admin for your PIN."); return }
    setBusy(true)
    try { saveSession(roleFor(foundPlayer), foundPlayer); await routeAfterAuth(foundPlayer) } catch(e) { alert(e.message) }
    setBusy(false)
  }

  // Step 3: Submit availability
  const submitAvailability = async () => {
    if (!choice) { alert("Please select your availability"); return }
    setBusy(true)
    try {
      const pid = foundPlayer.id
      const finalStatus = await confirmPlayerToMatch(match.id, pid, choice === "yes" ? "confirmed" : "declined")
      setMyStatus(finalStatus || (choice === "yes" ? "confirmed" : "declined"))
      await loadSquad()
      setStep("matchview")
    } catch(e) { alert("Error: " + e.message) }
    setBusy(false)
  }

  const changeResponse = () => { setChoice(myStatus === "declined" ? "yes" : "no"); setStep("availability") }

  // ── Screens ─────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#FBF3E7", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #EDE4D3", borderTopColor:"#1D9E75", animation:"spin 0.7s linear infinite", margin:"0 auto" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:"#6b7280", fontSize:14, marginTop:16 }}>Loading match details...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#FBF3E7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#fff", border:"1.5px solid #EDE4D3", borderRadius:20, padding:"36px 32px", width:"90%", maxWidth:380, textAlign:"center", boxShadow:"0 4px 20px rgba(139,30,46,0.06)" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ color:"#0B3D2E", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, marginBottom:10 }}>Link Unavailable</h2>
        <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.6 }}>{error}</p>
      </div>
    </div>
  )

  const wrap = children => (
    <div style={{ minHeight:"100vh", background:"#FBF3E7", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", fontFamily:"var(--font-body)" }}>
      <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:20, overflow:"hidden", boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}>
        <MatchHeader match={match}/>
        <div style={{ padding:"24px 24px 28px" }}>{children}</div>
      </div>
    </div>
  )

  // ── Step: Check phone ────────────────────────────────────────────
  if (step === "check") return wrap(
    <div>
      <h2 style={{ color:"#0B3D2E", fontFamily:"var(--font-head)", fontSize:17, fontWeight:800, margin:"0 0 6px" }}>Enter your mobile number</h2>
      <p style={{ color:"#6b7280", fontSize:13, marginBottom:20, lineHeight:1.6 }}>Log in (or sign up) to respond to this invite.</p>
      <label style={lS}>Mobile Number *</label>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <div style={{ padding:"12px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#f3f4f6", fontSize:14, fontWeight:600, color:"#374151", flexShrink:0 }}>+91</div>
        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))} onKeyDown={e=>e.key==="Enter"&&checkPhone()} placeholder="10-digit number" maxLength={10} style={{...iS,flex:1}}/>
      </div>
      <button onClick={checkPhone} disabled={busy||phone.length<10} style={{ width:"100%", padding:"14px", borderRadius:12, background:phone.length<10?"#d1d5db":"#0B3D2E", border:"none", color:phone.length<10?"#6b7280":"#fff", fontSize:15, fontWeight:800, cursor:phone.length<10?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Checking..." : "Continue →"}
      </button>
    </div>
  )

  // ── Step: Register ───────────────────────────────────────────────
  if (step === "register") return wrap(
    <div>
      <button onClick={()=>setStep("check")} style={{ background:"none", border:"none", color:"#1D9E75", fontSize:13, cursor:"pointer", padding:0, marginBottom:14, fontWeight:700, fontFamily:"var(--font-body)" }}>← Back</button>
      <h2 style={{ color:"#0B3D2E", fontFamily:"var(--font-head)", fontSize:17, fontWeight:800, margin:"0 0 6px" }}>Create your account</h2>
      <p style={{ color:"#6b7280", fontSize:13, marginBottom:18, lineHeight:1.6 }}>New number — let's set you up.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
        <div><label style={lS}>First Name *</label><input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" style={iS}/></div>
        <div><label style={lS}>Last Name *</label><input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" style={iS}/></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div>
          <label style={lS}>Create 4-digit PIN *</label>
          <input type="tel" inputMode="numeric" pattern="[0-9]*" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="4-digit PIN" style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center", WebkitTextSecurity:"disc"}}/>
        </div>
        <div>
          <label style={lS}>Confirm PIN *</label>
          <input type="tel" inputMode="numeric" pattern="[0-9]*" value={confirmPin} onChange={e=>setConfirmPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="Re-enter PIN" style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center", WebkitTextSecurity:"disc"}}/>
          {confirmPin && pin!==confirmPin && <div style={{ fontSize:11,color:"#ef4444",marginTop:3 }}>PINs do not match</div>}
        </div>
      </div>
      <div style={{ padding:"10px 14px", background:"#F5E6C8", borderRadius:10, border:"1px solid #E3C888", marginTop:16, marginBottom:20 }}>
        <p style={{ fontSize:12, color:"#7A4F13", margin:0, lineHeight:1.6 }}>💡 Remember this PIN — you'll use your mobile number + PIN to log in any time, including on this same link.</p>
      </div>
      <button onClick={register} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:12, background:"#0B3D2E", border:"none", color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Registering..." : "Register & Continue →"}
      </button>
    </div>
  )

  // ── Step: Login existing player ──────────────────────────────────
  if (step === "login") return wrap(
    <div>
      <button onClick={()=>{setStep("check");setPin("")}} style={{ background:"none", border:"none", color:"#1D9E75", fontSize:13, cursor:"pointer", padding:0, marginBottom:14, fontWeight:700, fontFamily:"var(--font-body)" }}>← Back</button>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#f0fdf4", borderRadius:10, border:"1px solid #6ee7b7", marginBottom:20 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:"#1D9E75",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0 }}>
          {foundPlayer?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div style={{ fontWeight:700, fontSize:14, color:"#065f46" }}>Welcome back, {foundPlayer?.name}</div>
      </div>
      <label style={lS}>Enter your 4-digit PIN *</label>
      <input type="tel" inputMode="numeric" pattern="[0-9]*" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&loginPlayer()} maxLength={4} placeholder="••••" style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center", WebkitTextSecurity:"disc", marginBottom:20}}/>
      <button onClick={loginPlayer} disabled={busy||pin.length!==4} style={{ width:"100%", padding:"14px", borderRadius:12, background:pin.length!==4?"#d1d5db":"#0B3D2E", border:"none", color:pin.length!==4?"#6b7280":"#fff", fontSize:15, fontWeight:800, cursor:pin.length!==4?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Verifying..." : "Log In →"}
      </button>
    </div>
  )

  // ── Step: Availability ───────────────────────────────────────────
  if (step === "availability") return wrap(
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#f0fdf4", borderRadius:10, border:"1px solid #6ee7b7", marginBottom:20 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:"#1D9E75",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0 }}>
          {foundPlayer?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:"#065f46" }}>{foundPlayer?.name}</div>
          <div style={{ fontSize:11, color:"#059669" }}>✅ Logged in</div>
        </div>
      </div>
      <h2 style={{ color:"#0B3D2E", fontFamily:"var(--font-head)", fontSize:17, fontWeight:800, margin:"0 0 20px" }}>Are you available for this match?</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        <button onClick={()=>setChoice("yes")} style={{ padding:"18px 12px", borderRadius:12, border:`2px solid ${choice==="yes"?"#1D9E75":"#e5e7eb"}`, background:choice==="yes"?"#f0fdf4":"#fafafa", cursor:"pointer", fontFamily:"var(--font-body)" }}>
          <div style={{ fontSize:30, marginBottom:8 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:15, color:choice==="yes"?"#065f46":"#374151", fontFamily:"var(--font-head)" }}>Available</div>
        </button>
        <button onClick={()=>setChoice("no")} style={{ padding:"18px 12px", borderRadius:12, border:`2px solid ${choice==="no"?"#ef4444":"#e5e7eb"}`, background:choice==="no"?"#fff5f5":"#fafafa", cursor:"pointer", fontFamily:"var(--font-body)" }}>
          <div style={{ fontSize:30, marginBottom:8 }}>❌</div>
          <div style={{ fontWeight:800, fontSize:15, color:choice==="no"?"#991b1b":"#374151", fontFamily:"var(--font-head)" }}>Not Available</div>
        </button>
      </div>
      <button onClick={submitAvailability} disabled={busy||!choice} style={{ width:"100%", padding:"14px", borderRadius:12, background:!choice?"#d1d5db":"#0B3D2E", border:"none", color:!choice?"#6b7280":"#fff", fontSize:15, fontWeight:800, cursor:!choice?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Submitting..." : "Submit Response →"}
      </button>
      <a href="/" style={{ display:"block", textAlign:"center", width:"100%", padding:"12px", borderRadius:10, background:"transparent", border:"1.5px solid #e5e7eb", color:"#374151", fontSize:13, fontWeight:700, fontFamily:"var(--font-head)", textDecoration:"none", marginTop:12, boxSizing:"border-box" }}>
        🏠 Go to my Dashboard
      </a>
    </div>
  )

  // ── Step: Match view (details + squad) — shown after responding or on repeat visits ──
  if (step === "matchview") {
    const confirmed = squad.filter(r => r.status === "confirmed")
    const waitlisted = squad.filter(r => r.status === "waitlist")
    const declined = squad.filter(r => r.status === "declined")
    const statusMeta = {
      confirmed: { label: "✅ You're in!", col: "#065f46", bg: "#f0fdf4", border: "#6ee7b7" },
      waitlist:  { label: "⏳ You're on the waitlist", col: "#92400e", bg: "#fffbeb", border: "#fde68a" },
      declined:  { label: "❌ You're not available", col: "#991b1b", bg: "#fff5f5", border: "#fecaca" },
    }
    const meta = statusMeta[myStatus] || statusMeta.declined
    return wrap(
      <div>
        <div style={{ padding:"12px 14px", background:meta.bg, borderRadius:10, border:`1px solid ${meta.border}`, marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:15, color:meta.col }}>{meta.label}</div>
          {myStatus === "waitlist" && <div style={{ fontSize:12, color:meta.col, marginTop:4 }}>The squad is full. You'll be added automatically if a spot opens up.</div>}
        </div>

        <div style={{ fontWeight:800, fontSize:14, color:"#0B3D2E", marginBottom:10, fontFamily:"var(--font-head)" }}>👥 Confirmed Squad ({confirmed.length})</div>
        {confirmed.length === 0 ? (
          <div style={{ fontSize:13, color:"#9ca3af", marginBottom:16 }}>No one has confirmed yet.</div>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            {confirmed.map(r => (
              <div key={r.player_id} style={{ display:"flex", alignItems:"center", gap:6, background:"#f0fdf4", padding:"6px 10px", borderRadius:20, border:"1px solid #bbf7d0" }}>
                <div style={{ width:20,height:20,borderRadius:"50%",background:"#1D9E75",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff" }}>
                  {r.players?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:"#065f46" }}>{r.players?.name}</span>
              </div>
            ))}
          </div>
        )}

        {waitlisted.length > 0 && (
          <>
            <div style={{ fontWeight:800, fontSize:13, color:"#92400e", marginBottom:8, fontFamily:"var(--font-head)" }}>⏳ Waitlist ({waitlisted.length})</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {waitlisted.map(r => (
                <div key={r.player_id} style={{ fontSize:12, fontWeight:600, color:"#92400e", background:"#fffbeb", padding:"6px 10px", borderRadius:20, border:"1px solid #fde68a" }}>{r.players?.name}</div>
              ))}
            </div>
          </>
        )}

        {declined.length > 0 && (
          <>
            <div style={{ fontWeight:800, fontSize:13, color:"#991b1b", marginBottom:8, fontFamily:"var(--font-head)" }}>❌ Declined ({declined.length})</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {declined.map(r => (
                <div key={r.player_id} style={{ fontSize:12, fontWeight:600, color:"#991b1b", background:"#fff5f5", padding:"6px 10px", borderRadius:20, border:"1px solid #fecaca" }}>{r.players?.name}</div>
              ))}
            </div>
          </>
        )}

        <a href="/" style={{ display:"block", textAlign:"center", width:"100%", padding:"13px", borderRadius:10, background:"#0B3D2E", color:"#fff", fontSize:14, fontWeight:800, fontFamily:"var(--font-head)", textDecoration:"none", marginBottom:10, boxSizing:"border-box" }}>
          🏠 Go to my Dashboard
        </a>
        {match.status === "upcoming" && (myStatus === "confirmed" || myStatus === "waitlist" || myStatus === "declined") && (
          <button onClick={changeResponse} style={{ width:"100%", padding:"12px", borderRadius:10, background:"#fff", border:"1.5px solid #e5e7eb", color:"#374151", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)" }}>
            Change my response
          </button>
        )}
      </div>
    )
  }

  return null
}
