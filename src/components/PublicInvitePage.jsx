import { useState, useEffect } from "react"
import { Logo } from "./ui.jsx"
import { fetchMatchByToken, fetchPlayers, addPlayer, confirmPlayerToMatch, fetchMatchPlayers } from "../db.js"
import { fmtDate, dayName, ADMIN_PHONE, matchTitle } from "../constants.js"
import { saveSession } from "../session.js"

const iS = { width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:15, outline:"none", background:"#F8FAF8", color:"#0F172A", boxSizing:"border-box", fontFamily:"var(--font-body)" }
const lS = { fontSize:12, color:"#64748B", display:"block", marginBottom:6, fontWeight:600 }

function MatchHeader({ match }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#166534,#0F172A)", padding:"24px 24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:44, width:"auto", display:"block" }}/>
        <div style={{ color:"#B8860B", fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>Match Invite</div>
      </div>
      <h1 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, margin:"0 0 8px" }}>{matchTitle(match)}</h1>
      <div style={{ color:"#64748B", fontSize:13, lineHeight:1.9 }}>
        📅 <strong style={{ color:"#0F172A" }}>{fmtDate(match.date)}</strong><br/>
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
  // If yes -> go straight to matchview (with their real status). If no -> only let them
  // self-confirm if they were actually invited (a match_players row already exists for
  // them, e.g. from "Invite Players") OR the organizer explicitly opened this match to
  // the public. Otherwise, this is a forwarded link reaching someone who was never
  // invited — block that, per the organizer's control over who's in the squad.
  const routeAfterAuth = async (playerObj) => {
    const rows = await loadSquad()
    const mine = rows.find(r => r.player_id === playerObj.id)
    if (mine && (mine.status === "confirmed" || mine.status === "declined" || mine.status === "waitlist")) {
      setMyStatus(mine.status)
      setStep("matchview")
    } else if (mine || match.link_active) {
      setStep("availability")
    } else {
      setStep("notInvited")
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
      setStep(match.link_active ? "availability" : "notInvited") // brand new player — can only self-join if this match is open to the public
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
    <div style={{ minHeight:"100vh", background:"#0F172A", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #E2E8F0", borderTopColor:"#166534", animation:"spin 0.7s linear infinite", margin:"0 auto" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:"#64748B", fontSize:14, marginTop:16 }}>Loading match details...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#0F172A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"#F8FAF8", border:"1.5px solid #E2E8F0", borderRadius:20, padding:"36px 32px", width:"90%", maxWidth:380, textAlign:"center", boxShadow:"0 4px 24px rgba(30,125,58,0.1)" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:20, fontWeight:700, marginBottom:10 }}>Link Unavailable</h2>
        <p style={{ color:"#64748B", fontSize:14, lineHeight:1.6 }}>{error}</p>
      </div>
    </div>
  )

  const wrap = children => (
    <div style={{ minHeight:"100vh", background:"#0F172A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px", fontFamily:"var(--font-body)" }}>
      <div style={{ width:"100%", maxWidth:420, background:"#F8FAF8", borderRadius:20, overflow:"hidden", boxShadow:"0 24px 60px rgba(37,95,184,0.15)" }}>
        <MatchHeader match={match}/>
        <div style={{ padding:"24px 24px 28px" }}>{children}</div>
      </div>
    </div>
  )

  // ── Step: Check phone ────────────────────────────────────────────
  if (step === "check") return wrap(
    <div>
      <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:17, fontWeight:700, margin:"0 0 6px" }}>Enter your mobile number</h2>
      <p style={{ color:"#64748B", fontSize:13, marginBottom:20, lineHeight:1.6 }}>Log in (or sign up) to respond to this invite.</p>
      <label style={lS}>Mobile Number *</label>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <div style={{ padding:"12px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAF8", fontSize:14, fontWeight:600, color:"#0F172A", flexShrink:0 }}>+91</div>
        <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))} onKeyDown={e=>e.key==="Enter"&&checkPhone()} placeholder="10-digit number" maxLength={10} style={{...iS,flex:1}}/>
      </div>
      <button onClick={checkPhone} disabled={busy||phone.length<10} style={{ width:"100%", padding:"14px", borderRadius:12, background:phone.length<10?"#E2E8F0":"linear-gradient(135deg,#166534,#0F172A)", border:"none", color:"#0F172A", fontSize:15, fontWeight:700, cursor:phone.length<10?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Checking..." : "Continue →"}
      </button>
    </div>
  )

  // ── Step: Register ───────────────────────────────────────────────
  if (step === "register") return wrap(
    <div>
      <button onClick={()=>setStep("check")} style={{ background:"none", border:"none", color:"#166534", fontSize:13, cursor:"pointer", padding:0, marginBottom:14, fontWeight:700, fontFamily:"var(--font-body)" }}>← Back</button>
      <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:17, fontWeight:700, margin:"0 0 6px" }}>Create your account</h2>
      <p style={{ color:"#64748B", fontSize:13, marginBottom:18, lineHeight:1.6 }}>New number — let's set you up.</p>
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
          {confirmPin && pin!==confirmPin && <div style={{ fontSize:11,color:"#EF4444",marginTop:3 }}>PINs do not match</div>}
        </div>
      </div>
      <div style={{ padding:"10px 14px", background:"rgba(216,176,91,0.1)", borderRadius:10, border:"1px solid rgba(216,176,91,0.35)", marginTop:16, marginBottom:20 }}>
        <p style={{ fontSize:12, color:"#B8860B", margin:0, lineHeight:1.6 }}>💡 Remember this PIN — you'll use your mobile number + PIN to log in any time, including on this same link.</p>
      </div>
      <button onClick={register} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:12, background:"linear-gradient(135deg,#166534,#0F172A)", border:"none", color:"#0F172A", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Registering..." : "Register & Continue →"}
      </button>
    </div>
  )

  // ── Step: Not invited — identified themselves, but no invite exists and this
  // match isn't open to the public. Likely a forwarded link. ─────────────────
  if (step === "notInvited") return wrap(
    <div style={{ textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>🏏🚫</div>
      <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:17, fontWeight:700, margin:"0 0 8px" }}>Caught out!</h2>
      <p style={{ color:"#64748B", fontSize:13, lineHeight:1.6, marginBottom:4 }}>Nice try sneaking into someone else's invite link, but this squad isn't taking walk-ins today. If you actually want to play, ask the organizer to invite you properly — like everyone else had to.</p>
    </div>
  )

  // ── Step: Login existing player ──────────────────────────────────
  if (step === "login") return wrap(
    <div>
      <button onClick={()=>{setStep("check");setPin("")}} style={{ background:"none", border:"none", color:"#166534", fontSize:13, cursor:"pointer", padding:0, marginBottom:14, fontWeight:700, fontFamily:"var(--font-body)" }}>← Back</button>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(30,125,58,0.08)", borderRadius:10, border:"1px solid rgba(30,125,58,0.3)", marginBottom:20 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0F172A",flexShrink:0 }}>
          {foundPlayer?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div style={{ fontWeight:700, fontSize:14, color:"#166534" }}>Welcome back, {foundPlayer?.name}</div>
      </div>
      <label style={lS}>Enter your 4-digit PIN *</label>
      <input type="tel" inputMode="numeric" pattern="[0-9]*" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&loginPlayer()} maxLength={4} placeholder="••••" style={{...iS,letterSpacing:6,fontSize:20,textAlign:"center", WebkitTextSecurity:"disc", marginBottom:20}}/>
      <button onClick={loginPlayer} disabled={busy||pin.length!==4} style={{ width:"100%", padding:"14px", borderRadius:12, background:pin.length!==4?"#E2E8F0":"linear-gradient(135deg,#166534,#0F172A)", border:"none", color:"#0F172A", fontSize:15, fontWeight:700, cursor:pin.length!==4?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Verifying..." : "Log In →"}
      </button>
    </div>
  )

  // ── Step: Availability ───────────────────────────────────────────
  if (step === "availability") return wrap(
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(30,125,58,0.08)", borderRadius:10, border:"1px solid rgba(30,125,58,0.3)", marginBottom:20 }}>
        <div style={{ width:36,height:36,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0F172A",flexShrink:0 }}>
          {foundPlayer?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:"#166534" }}>{foundPlayer?.name}</div>
          <div style={{ fontSize:11, color:"#166534" }}>✅ Logged in</div>
        </div>
      </div>
      <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:17, fontWeight:700, margin:"0 0 20px" }}>Are you available for this match?</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
        <button onClick={()=>setChoice("yes")} style={{ padding:"18px 12px", borderRadius:12, border:`2px solid ${choice==="yes"?"#166534":"#E2E8F0"}`, background:choice==="yes"?"rgba(30,125,58,0.08)":"#F8FAF8", cursor:"pointer", fontFamily:"var(--font-body)" }}>
          <div style={{ fontSize:30, marginBottom:8 }}>✅</div>
          <div style={{ fontWeight:700, fontSize:15, color:choice==="yes"?"#166534":"#0F172A", fontFamily:"var(--font-head)" }}>Available</div>
        </button>
        <button onClick={()=>setChoice("no")} style={{ padding:"18px 12px", borderRadius:12, border:`2px solid ${choice==="no"?"#EF4444":"#E2E8F0"}`, background:choice==="no"?"rgba(220,38,38,0.06)":"#F8FAF8", cursor:"pointer", fontFamily:"var(--font-body)" }}>
          <div style={{ fontSize:30, marginBottom:8 }}>❌</div>
          <div style={{ fontWeight:700, fontSize:15, color:choice==="no"?"#EF4444":"#0F172A", fontFamily:"var(--font-head)" }}>Not Available</div>
        </button>
      </div>
      <button onClick={submitAvailability} disabled={busy||!choice} style={{ width:"100%", padding:"14px", borderRadius:12, background:!choice?"#E2E8F0":"linear-gradient(135deg,#166534,#0F172A)", border:"none", color:"#0F172A", fontSize:15, fontWeight:700, cursor:!choice?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}>
        {busy ? "Submitting..." : "Submit Response →"}
      </button>
      <a href="/" style={{ display:"block", textAlign:"center", width:"100%", padding:"12px", borderRadius:10, background:"transparent", border:"1.5px solid #E2E8F0", color:"#0F172A", fontSize:13, fontWeight:700, fontFamily:"var(--font-head)", textDecoration:"none", marginTop:12, boxSizing:"border-box" }}>
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
      confirmed: { label: "✅ You're in!", col: "rgba(34,197,94,0.15)", bg: "rgba(30,125,58,0.08)", border: "rgba(30,125,58,0.3)" },
      waitlist:  { label: "⏳ You're on the waitlist", col: "rgba(246,196,83,0.15)", bg: "rgba(216,176,91,0.1)", border: "rgba(216,176,91,0.35)" },
      declined:  { label: "❌ You're not available", col: "rgba(231,76,60,0.15)", bg: "rgba(220,38,38,0.06)", border: "rgba(229,57,53,0.3)" },
    }
    const meta = statusMeta[myStatus] || statusMeta.declined
    return wrap(
      <div>
        <div style={{ padding:"12px 14px", background:meta.bg, borderRadius:10, border:`1px solid ${meta.border}`, marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:15, color:meta.col }}>{meta.label}</div>
          {myStatus === "waitlist" && <div style={{ fontSize:12, color:meta.col, marginTop:4 }}>The squad is full. You'll be added automatically if a spot opens up.</div>}
        </div>

        <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", marginBottom:10, fontFamily:"var(--font-head)" }}>👥 Confirmed Squad ({confirmed.length})</div>
        {confirmed.length === 0 ? (
          <div style={{ fontSize:13, color:"#64748B", marginBottom:16 }}>No one has confirmed yet.</div>
        ) : (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            {confirmed.map(r => (
              <div key={r.player_id} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(30,125,58,0.08)", padding:"6px 10px", borderRadius:20, border:"1px solid rgba(25,182,106,0.25)" }}>
                <div style={{ width:20,height:20,borderRadius:"50%",background:"#166534",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#0F172A" }}>
                  {r.players?.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:"#166534" }}>{r.players?.name}</span>
              </div>
            ))}
          </div>
        )}

        {waitlisted.length > 0 && (
          <>
            <div style={{ fontWeight:700, fontSize:13, color:"#B8860B", marginBottom:8, fontFamily:"var(--font-head)" }}>⏳ Waitlist ({waitlisted.length})</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {waitlisted.map(r => (
                <div key={r.player_id} style={{ fontSize:12, fontWeight:600, color:"#B8860B", background:"rgba(216,176,91,0.1)", padding:"6px 10px", borderRadius:20, border:"1px solid rgba(216,176,91,0.3)" }}>{r.players?.name}</div>
              ))}
            </div>
          </>
        )}

        {declined.length > 0 && (
          <>
            <div style={{ fontWeight:700, fontSize:13, color:"#EF4444", marginBottom:8, fontFamily:"var(--font-head)" }}>❌ Declined ({declined.length})</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {declined.map(r => (
                <div key={r.player_id} style={{ fontSize:12, fontWeight:600, color:"#EF4444", background:"rgba(220,38,38,0.06)", padding:"6px 10px", borderRadius:20, border:"1px solid rgba(229,57,53,0.25)" }}>{r.players?.name}</div>
              ))}
            </div>
          </>
        )}

        <a href="/" style={{ display:"block", textAlign:"center", width:"100%", padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#166534,#0F172A)", color:"#0F172A", fontSize:14, fontWeight:700, fontFamily:"var(--font-head)", textDecoration:"none", marginBottom:10, boxSizing:"border-box" }}>
          🏠 Go to my Dashboard
        </a>
        {match.status === "upcoming" && (myStatus === "confirmed" || myStatus === "waitlist" || myStatus === "declined") && (
          <button onClick={changeResponse} style={{ width:"100%", padding:"12px", borderRadius:10, background:"#F8FAF8", border:"1.5px solid #E2E8F0", color:"#0F172A", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)" }}>
            Change my response
          </button>
        )}
      </div>
    )
  }

  return null
}
