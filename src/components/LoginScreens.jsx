import { useState } from "react"
import { Logo } from "./ui.jsx"
import { fetchPlayers, registerPlayer } from "../db.js"
import { ADMIN_PHONE } from "../constants.js"
import { useMobile } from "../hooks/useMobile.js"

export function UnifiedLoginScreen({ onAdminSuccess, onPlayerSuccess, onBack }) {
  const isMobile = useMobile()
  const [phone, setPhone] = useState("")
  const [pin, setPin]     = useState("")
  const [show, setShow]   = useState(false)
  const [err, setErr]     = useState("")
  const [busy, setBusy]   = useState(false)

  const login = async () => {
    const cleaned = phone.replace(/[^0-9]/g,"").slice(-10)
    if (cleaned.length !== 10) { setErr("Enter a valid 10-digit mobile number."); return }
    if (!pin || pin.length !== 4) { setErr("Enter your 4-digit PIN."); return }
    setBusy(true)
    setErr("")
    try {
      const players = await fetchPlayers()
      // Find player by last 10 digits of phone
      const found = players.find(p => p.phone && p.phone.replace(/[^0-9]/g,"").slice(-10) === cleaned)
      if (!found) { setErr("Mobile number not registered. Contact your admin."); setBusy(false); return }
      if (pin !== found.pin) { setErr("Wrong PIN. Ask your admin for your PIN."); setBusy(false); return }
      // Check if admin by comparing last 10 digits
      const adminCleaned = ADMIN_PHONE.replace(/[^0-9]/g,"").slice(-10)
      if (cleaned === adminCleaned) {
        onAdminSuccess(found)
      } else {
        onPlayerSuccess(found)
      }
    } catch(e) { setErr("Connection error. Try again.") }
    setBusy(false)
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#2b0f0f)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:"20px 16px" }}>
      <div style={{ background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.10)", borderRadius:20, padding:isMobile?"28px 22px":"36px 42px", width:"100%", maxWidth:380, backdropFilter:"blur(10px)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, cursor:"pointer", padding:0, marginBottom:22, fontFamily:"var(--font-body)" }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <Logo size={44}/>
          <h2 style={{ color:"#fff", fontSize:isMobile?18:20, fontWeight:800, margin:"12px 0 4px", fontFamily:"var(--font-head)" }}>Welcome Back</h2>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>Login with your mobile number and PIN</p>
        </div>

        <label style={{ color:"rgba(255,255,255,0.5)", fontSize:12, display:"block", marginBottom:6 }}>Mobile Number</label>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <div style={{ padding:"13px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.7)", fontSize:16, flexShrink:0, fontWeight:600 }}>+91</div>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))}
            onKeyDown={e => e.key==="Enter" && login()}
            placeholder="10-digit number"
            maxLength={10}
            style={{ flex:1, padding:"13px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:16, outline:"none", fontFamily:"var(--font-body)" }}
          />
        </div>

        <label style={{ color:"rgba(255,255,255,0.5)", fontSize:12, display:"block", marginBottom:6 }}>4-digit PIN</label>
        <div style={{ position:"relative", marginBottom:8 }}>
          <input
            type="tel" inputMode="numeric" pattern="[0-9]*" data-toggle="show"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))}
            onKeyDown={e => e.key==="Enter" && login()}
            placeholder="Enter your PIN"
            maxLength={4}
            style={{ width:"100%", padding:"13px 44px 13px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:16, boxSizing:"border-box", outline:"none", fontFamily:"var(--font-body)", letterSpacing:4, WebkitTextSecurity:"disc" }}
          />
          <button onClick={() => setShow(s=>!s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.45)", fontSize:16, padding:0 }}>{show?"👁️":"🙈"}</button>
        </div>

        {err && <p style={{ color:"#f87171", fontSize:12, marginBottom:10 }}>{err}</p>}

        <button onClick={login} disabled={busy||phone.length<10||pin.length!==4} style={{ width:"100%", padding:"14px", borderRadius:10, background:(phone.length<10||pin.length!==4)?"#374151":"#1D9E75", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:(phone.length<10||pin.length!==4)?"not-allowed":"pointer", marginTop:8, fontFamily:"var(--font-head)" }}>
          {busy?"Logging in...":"Login →"}
        </button>

        <p style={{ color:"rgba(255,255,255,0.25)", fontSize:11, textAlign:"center", marginTop:16, lineHeight:1.6 }}>
          New player? Ask your admin to add you.<br/>
          Forgot PIN? Contact your admin.
        </p>
      </div>
    </div>
  )
}

// Keep old exports for backward compatibility
export function AdminLoginScreen({ onSuccess, onBack }) {
  return <UnifiedLoginScreen onAdminSuccess={onSuccess} onPlayerSuccess={onSuccess} onBack={onBack}/>
}
export function PlayerLoginScreen({ onSuccess, onBack }) {
  return <UnifiedLoginScreen onAdminSuccess={onSuccess} onPlayerSuccess={onSuccess} onBack={onBack}/>
}
export function RegisterScreen({ onSuccess, onBack }) {
  const isMobile = useMobile()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName]   = useState("")
  const [phone, setPhone]         = useState("")
  const [pin, setPin]             = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin]     = useState(false)
  const [err, setErr]             = useState("")
  const [busy, setBusy]           = useState(false)

  const iS = { width:"100%", padding:"12px 13px", borderRadius:9, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"var(--font-body)" }
  const lS = { color:"rgba(255,255,255,0.5)", fontSize:12, display:"block", marginBottom:6 }

  const submit = async () => {
    if (!firstName.trim()) { setErr("First name required"); return }
    if (!lastName.trim())  { setErr("Last name required"); return }
    const cleaned = phone.replace(/[^0-9]/g,"").slice(-10)
    if (cleaned.length !== 10) { setErr("Enter a valid 10-digit mobile number"); return }
    if (pin.length !== 4) { setErr("PIN must be 4 digits"); return }
    if (pin !== confirmPin) { setErr("PINs do not match"); return }
    setBusy(true)
    setErr("")
    try {
      const players = await fetchPlayers()
      const exists = players.find(p => p.phone && p.phone.replace(/[^0-9]/g,"").slice(-10) === cleaned)
      if (exists) { setErr("This number already has an account. Please go back and use Login instead."); setBusy(false); return }
      const fullName = firstName.trim() + " " + lastName.trim()
      await registerPlayer(fullName, cleaned, pin)
      onSuccess()
    } catch(e) { setErr("Registration failed: " + e.message) }
    setBusy(false)
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#2b0f0f)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:"20px 16px" }}>
      <div style={{ background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.10)", borderRadius:20, padding:isMobile?"28px 22px":"36px 42px", width:"100%", maxWidth:400, backdropFilter:"blur(10px)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:13, cursor:"pointer", padding:0, marginBottom:22, fontFamily:"var(--font-body)" }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <Logo size={44}/>
          <h2 style={{ color:"#fff", fontSize:isMobile?18:20, fontWeight:800, margin:"12px 0 4px", fontFamily:"var(--font-head)" }}>Create Account</h2>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>Your account needs admin approval before you can log in</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div><label style={lS}>First Name</label><input value={firstName} onChange={e=>setFirstName(e.target.value.replace(/[^a-zA-Z]/g,"").replace(/^(.)(.*)$/, (m,a,b)=>a.toUpperCase()+b.toLowerCase()))} placeholder="Rahul" style={iS}/></div>
          <div><label style={lS}>Last Name</label><input value={lastName} onChange={e=>setLastName(e.target.value.replace(/[^a-zA-Z]/g,"").replace(/^(.)(.*)$/, (m,a,b)=>a.toUpperCase()+b.toLowerCase()))} placeholder="Sharma" style={iS}/></div>
        </div>

        <label style={lS}>Mobile Number</label>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          <div style={{ padding:"12px 12px", borderRadius:9, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.7)", fontSize:15, flexShrink:0, fontWeight:600 }}>+91</div>
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))} placeholder="10-digit number" maxLength={10} style={{...iS,flex:1}}/>
        </div>

        <label style={lS}>Create 4-digit PIN</label>
        <div style={{ position:"relative", marginBottom:14 }}>
          <input type="tel" inputMode="numeric" pattern="[0-9]*" data-toggle="showPin" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="Choose a PIN" style={{...iS,letterSpacing:6,fontSize:18,textAlign:"center",paddingRight:44}}/>
          <button onClick={()=>setShowPin(s=>!s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, padding:0 }}>{showPin?"👁️":"🙈"}</button>
        </div>

        <label style={lS}>Confirm PIN</label>
        <input type="tel" inputMode="numeric" pattern="[0-9]*" value={confirmPin} onChange={e=>setConfirmPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="Re-enter PIN" style={{...iS,letterSpacing:6,fontSize:18,textAlign:"center",marginBottom:8}}/>
        {confirmPin && pin!==confirmPin && <div style={{ fontSize:11, color:"#f87171", marginBottom:8 }}>PINs do not match</div>}

        {err && <p style={{ color:"#f87171", fontSize:12, marginTop:10, marginBottom:0 }}>{err}</p>}

        <button onClick={submit} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:10, background:"#1D9E75", border:"none", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", marginTop:16, fontFamily:"var(--font-head)" }}>
          {busy ? "Registering..." : "Submit for Approval →"}
        </button>

        <p style={{ color:"rgba(255,255,255,0.25)", fontSize:11, textAlign:"center", marginTop:14, lineHeight:1.6 }}>
          Your admin will review and approve your account.<br/>You'll be able to log in once approved.
        </p>
      </div>
    </div>
  )
}

export function RegistrationSubmittedScreen({ onBack }) {
  const isMobile = useMobile()
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#2b0f0f)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:"20px 16px" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:isMobile?"32px 24px":"40px 36px", width:"100%", maxWidth:400, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>⏳</div>
        <h2 style={{ color:"#0B3D2E", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, marginBottom:10 }}>Registration Complete! </h2>
        <p style={{ color:"#6b7280", fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Your account is ready! You can now log in with your mobile number and PIN.
        </p>
        <button onClick={onBack} style={{ width:"100%", padding:"13px", borderRadius:10, background:"#0B3D2E", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)" }}>Back to Home</button>
      </div>
    </div>
  )
}
