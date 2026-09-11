import { useState, useEffect } from "react"
import { Logo, Av } from "./ui.jsx"
import { fetchPlayers, registerPlayer, fetchRecentlyRegistered, fetchPlayerCount, fetchMatchCount, fetchTeamCount, uploadProfilePhoto, authenticateGroundOwner } from "../db.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import { Phone, Lock, Eye, EyeOff, UserPlus, Users, Swords, Trophy } from "lucide-react"
import { ADMIN_PHONE, isValidName, birthDateError, maxBirthDateForMinAge } from "../constants.js"
import { useMobile } from "../hooks/useMobile.js"

export function UnifiedLoginScreen({ onAdminSuccess, onPlayerSuccess, onGroundOwnerSuccess, onBack, onRegister, initialMode = "player" }) {
  // LOGIN_ONLY_SCREEN_V1
  const [phone, setPhone] = useState("")
  const [pin, setPin]     = useState("")
  const [show, setShow]   = useState(false)
  const [err, setErr]     = useState("")
  const [busy, setBusy]   = useState(false)
  const [remember, setRemember] = useState(false)
  const [loginMode, setLoginMode] = useState(initialMode)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const login = async () => {
    const cleaned = phone.replace(/[^0-9]/g,"").slice(-10)
    if (cleaned.length !== 10) { setErr("Enter a valid 10-digit mobile number."); return }
    if (!pin || pin.length !== 4) { setErr("Enter your 4-digit PIN."); return }
    setBusy(true)
    setErr("")
    try {
      if (loginMode === "ground_owner") {
        const owner = await authenticateGroundOwner(cleaned, pin)
        if (owner) {
          if (onGroundOwnerSuccess) onGroundOwnerSuccess(owner)
          else onPlayerSuccess(owner)
          setBusy(false)
          return
        }
        setErr("Ground owner credentials not recognized. Contact admin to register your ground.")
        setBusy(false)
        return
      }

      // Player / Admin mode
      const players = await fetchPlayers()
      const found = players.find(p => p.phone && p.phone.replace(/[^0-9]/g,"").slice(-10) === cleaned)
      if (!found) {
        // Check if user is a ground owner logging in under standard tab
        const owner = await authenticateGroundOwner(cleaned, pin)
        if (owner) {
          if (onGroundOwnerSuccess) onGroundOwnerSuccess(owner)
          else onPlayerSuccess(owner)
          setBusy(false)
          return
        }
        setErr("Mobile number not registered. Contact your admin."); setBusy(false); return
      }
      if (pin !== found.pin) { setErr("Wrong PIN. Ask your admin for your PIN."); setBusy(false); return }
      const adminCleaned = ADMIN_PHONE.replace(/[^0-9]/g,"").slice(-10)
      if (cleaned === adminCleaned) {
        onAdminSuccess(found)
      } else {
        onPlayerSuccess(found)
      }
    } catch(e) { setErr("Connection error. Try again.") }
    setBusy(false)
  }

  const inputWrapStyle = { display:"flex", alignItems:"center", gap:10, padding:"0 16px", height:52, borderRadius:14, border:"1.5px solid #E2E8F0", background:"#FFFFFF", transition:"border-color 200ms, box-shadow 200ms" }
  const inputStyle = { flex:1, minWidth:0, border:"none", outline:"none", background:"transparent", color:"#0F172A", fontSize:15, fontFamily:"var(--font-body)" }
  const focusHandlers = {
    onFocus: e=>{ e.currentTarget.parentElement.style.borderColor="#166534"; e.currentTarget.parentElement.style.boxShadow="0 0 0 3px rgba(22,101,52,0.15)" },
    onBlur:  e=>{ e.currentTarget.parentElement.style.borderColor="#E2E8F0"; e.currentTarget.parentElement.style.boxShadow="none" },
  }

  const [showHelp, setShowHelp] = useState(false)

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(180deg, #F0FDF4 0%, #F8FAF8 100%)", display:"flex", justifyContent:"center", fontFamily:"var(--font-body)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", top:"-10%", right:"-15%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(22,101,52,0.06) 0%, rgba(22,101,52,0) 70%)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:480, padding:"40px 20px 36px", position:"relative", zIndex:1, display:"flex", flexDirection:"column", justifyContent:"center", minHeight:"100vh" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:13, cursor:"pointer", padding:0, marginBottom:16, fontFamily:"var(--font-body)", alignSelf:"flex-start", display:"inline-flex", alignItems:"center", gap:4, fontWeight:600 }}>← Back to Home</button>
        <div style={{ textAlign:"center", marginBottom:24, opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(-10px)", transition:"opacity 400ms, transform 400ms" }}>
          <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:76, width:"auto", display:"block", margin:"0 auto" }}/>
        </div>

        <div style={{
          background:"#FFFFFF", borderRadius:22, boxShadow:"0 12px 36px rgba(15,23,42,0.08)", border:"1px solid #E2E8F0", padding:"30px 24px",
          opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(16px)", transition:"opacity 450ms 100ms, transform 450ms 100ms",
        }}>
          {/* Mode Switcher Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "#F1F5F9", padding: 4, borderRadius: 12, marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => { setLoginMode("player"); setErr("") }}
              style={{
                padding: "9px 12px",
                borderRadius: 9,
                border: "none",
                background: loginMode === "player" ? "#FFFFFF" : "transparent",
                color: loginMode === "player" ? "#166534" : "#64748B",
                fontWeight: loginMode === "player" ? 800 : 600,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: loginMode === "player" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 150ms ease"
              }}
            >
              🏏 Player / Member
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode("ground_owner"); setErr("") }}
              style={{
                padding: "9px 12px",
                borderRadius: 9,
                border: "none",
                background: loginMode === "ground_owner" ? "#166534" : "transparent",
                color: loginMode === "ground_owner" ? "#FFFFFF" : "#64748B",
                fontWeight: loginMode === "ground_owner" ? 800 : 600,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: loginMode === "ground_owner" ? "0 2px 8px rgba(22,101,52,0.2)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                transition: "all 150ms ease"
              }}
            >
              🏟️ Ground Owner
            </button>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background: loginMode === "ground_owner" ? "rgba(34,197,94,0.12)" : "rgba(22,101,52,0.08)", color:"#166534", padding:"4px 10px", borderRadius:999, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:12 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#166534" }}></span> {loginMode === "ground_owner" ? "Ground Owner Desk" : "Player & Member Portal"}
          </div>
          <h2 style={{ color:"#0F172A", fontSize:23, fontWeight:900, margin:"0 0 6px", fontFamily:"var(--font-head)" }}>
            {loginMode === "ground_owner" ? "Ground Desk Login 🏟️" : "Welcome Back 👋"}
          </h2>
          <p style={{ color:"#64748B", fontSize:13, margin:"0 0 20px" }}>
            {loginMode === "ground_owner" 
              ? "Enter your registered ground mobile & PIN to manage slot bookings."
              : "Enter your registered mobile number and PIN to enter."}
          </p>

          <label style={{ color:"#0F172A", fontSize:13, fontWeight:700, display:"block", marginBottom:6 }}>Mobile Number</label>
          <div style={{ ...inputWrapStyle, marginBottom:16 }}>
            <Phone size={16} color="#166534"/>
            <span style={{ color:"#0F172A", fontWeight:800, fontSize:15 }}>+91</span>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Enter 10-digit number" maxLength={10} style={inputStyle} {...focusHandlers}/>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <label style={{ color:"#0F172A", fontSize:13, fontWeight:700 }}>4-Digit PIN</label>
            <button type="button" onClick={()=>setShowHelp(true)} style={{ background:"none", border:"none", color:"#166534", fontSize:12, fontWeight:700, cursor:"pointer", padding:0 }}>Forgot PIN?</button>
          </div>
          <div style={{ ...inputWrapStyle, marginBottom:12 }}>
            <Lock size={16} color="#166534"/>
            <input type="tel" inputMode="numeric" pattern="[0-9]*" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••" maxLength={4} style={{...inputStyle, letterSpacing:6, fontWeight:700, fontSize:18, WebkitTextSecurity: show ? "none" : "disc"}} {...focusHandlers}/>
            <button type="button" onClick={()=>setShow(s=>!s)} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#94A3B8" }}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#64748B", cursor:"pointer" }}>
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:"#166534", width:16, height:16 }}/>
              Remember Me
            </label>
          </div>

          {err && (
            <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#EF4444", padding:"10px 12px", borderRadius:10, fontSize:12, fontWeight:600, marginBottom:14 }}>
              ⚠️ {err}
            </div>
          )}

          <button onClick={login} disabled={busy||phone.length<10||pin.length!==4} style={{ width:"100%", height:52, borderRadius:13, background:(phone.length<10||pin.length!==4)?"#E2E8F0":"linear-gradient(135deg,#166534,#15803D)", border:"none", color:"#FFFFFF", fontSize:15, fontWeight:800, cursor:(phone.length<10||pin.length!==4)?"not-allowed":"pointer", transition:"transform 150ms, box-shadow 150ms", boxShadow:(phone.length<10||pin.length!==4)?"none":"0 6px 18px rgba(22,101,52,0.3)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            onMouseEnter={e=>{ if(!busy && phone.length>=10 && pin.length===4){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 10px 24px rgba(22,101,52,0.4)" } }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=(phone.length<10||pin.length!==4)?"none":"0 6px 18px rgba(22,101,52,0.3)" }}>
            {busy ? "Signing in..." : (loginMode === "ground_owner" ? "Sign In to Ground Desk →" : "Sign In to Portal →")}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}>
            <div style={{ flex:1, height:1, background:"#F1F5F9" }}/>
            <span style={{ fontSize:11, color:"#94A3B8", fontWeight:700 }}>NEW PLAYER?</span>
            <div style={{ flex:1, height:1, background:"#F1F5F9" }}/>
          </div>

          <button onClick={onRegister} style={{ width:"100%", padding:"13px 16px", borderRadius:13, background:"#FFFFFF", border:"1.5px solid #166534", color:"#166534", fontSize:14, fontWeight:800, cursor:"pointer", transition:"background 150ms", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(22,101,52,0.06)" }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#FFFFFF" }}>
            <UserPlus size={16}/> Create New Player Account
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:20 }}>
          <span style={{ fontSize:12, color:"#64748B" }}>Need assistance?{" "}
            <button onClick={()=>setShowHelp(true)} style={{ background:"none", border:"none", color:"#166534", fontWeight:700, cursor:"pointer", padding:0, textDecoration:"underline" }}>Contact Organizer</button>
          </span>
        </div>

        {showHelp && (
          <div onClick={()=>setShowHelp(false)} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:18, maxWidth:420, width:"100%", padding:24, boxShadow:"0 24px 60px rgba(15,23,42,0.3)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontWeight:800, fontSize:17, fontFamily:"var(--font-head)", color:"#0F172A" }}>Organizer Support</div>
                <button onClick={()=>setShowHelp(false)} style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:"#64748B" }}>×</button>
              </div>
              <p style={{ fontSize:13, color:"#64748B", margin:"0 0 16px" }}>If you forgot your PIN or need help with your account, reach out directly to the organizer:</p>
              <div style={{ background:"#F8FAF8", borderRadius:12, padding:"14px", border:"1px solid #E2E8F0", marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:15, color:"#0F172A" }}>Md Zeeshan</div>
                <div style={{ fontSize:13, color:"#64748B", marginTop:2 }}>Organizer &amp; Support</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, fontSize:14, fontWeight:700, color:"#166534" }}>
                  <Phone size={14}/> 9897439743
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <a href="tel:9897439743" style={{ padding:"11px", borderRadius:10, background:"#166534", color:"#FFFFFF", textDecoration:"none", textAlign:"center", fontSize:13, fontWeight:700 }}>📞 Call Now</a>
                <a href="https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I%20need%20help%20with%20my%20Selected%20Sports%20Player%20Account" target="_blank" rel="noreferrer" style={{ padding:"11px", borderRadius:10, background:"#25D366", color:"#FFFFFF", textDecoration:"none", textAlign:"center", fontSize:13, fontWeight:700 }}>WhatsApp ↗</a>
              </div>
            </div>
          </div>
        )}
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
  const [city, setCity]           = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [jerseySize, setJerseySize]     = useState("")
  const [photoFile, setPhotoFile]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState("")
  const [pin, setPin]             = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin]     = useState(false)
  const [err, setErr]             = useState("")
  const [busy, setBusy]           = useState(false)

  const iS = { width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#FFFFFF", color:"#0F172A", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"var(--font-body)" }
  const lS = { color:"#64748B", fontSize:12, display:"block", marginBottom:6, fontWeight:600 }
  const JERSEY_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"]

  const submit = async () => {
    if (!firstName.trim()) { setErr("First name required"); return }
    if (!isValidName(firstName)) { setErr("First name can only contain letters."); return }
    if (!lastName.trim())  { setErr("Last name required"); return }
    if (!isValidName(lastName)) { setErr("Last name can only contain letters."); return }
    const cleaned = phone.replace(/[^0-9]/g,"").slice(-10)
    if (cleaned.length !== 10) { setErr("Enter a valid 10-digit mobile number"); return }
    if (!city.trim()) { setErr("City required"); return }
    if (!birthDate) { setErr("Date of birth required"); return }
    const dobErr = birthDateError(birthDate)
    if (dobErr) { setErr(dobErr); return }
    if (!jerseyNumber.trim()) { setErr("Jersey number required"); return }
    if (!jerseySize) { setErr("Please select a jersey size"); return }
    if (!photoFile && !photoPreview) { setErr("Please upload a profile photo"); return }
    if (pin.length !== 4) { setErr("PIN must be 4 digits"); return }
    if (pin !== confirmPin) { setErr("PINs do not match"); return }
    setBusy(true)
    setErr("")
    try {
      let photoUrl = photoPreview
      if (photoFile) photoUrl = await uploadProfilePhoto(photoFile, cleaned)
      const fullName = firstName.trim() + " " + lastName.trim()
      await registerPlayer(fullName, cleaned, pin, birthDate, photoUrl, { city: city.trim(), jerseyNumber: jerseyNumber.trim(), jerseySize })
      onSuccess()
    } catch(e) { setErr(e.message.includes("already registered") ? "This number already has an account. Please go back and use Login instead." : "Registration failed: " + e.message) }
    setBusy(false)
  }

  return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:"20px 16px" }}>
      <div style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:20, padding:isMobile?"28px 22px":"36px 42px", width:"100%", maxWidth:400, boxShadow:"0 4px 24px rgba(15,23,42,0.08)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:13, cursor:"pointer", padding:0, marginBottom:22, fontFamily:"var(--font-body)" }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:110, width:"auto", display:"block", margin:"0 auto" }}/>
          <h2 style={{ color:"#0F172A", fontSize:isMobile?18:20, fontWeight:700, margin:"12px 0 4px", fontFamily:"var(--font-head)" }}>Create Account</h2>
          <p style={{ color:"#64748B", fontSize:12 }}>Your account needs admin approval before you can log in</p>
        </div>

        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <PhotoUploadField photoPreview={photoPreview} onPhotoSaved={(file, dataUrl) => { setPhotoFile(file); setPhotoPreview(dataUrl) }}/>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div><label style={lS}>First Name</label><input value={firstName} onChange={e=>setFirstName(e.target.value.replace(/[^a-zA-Z]/g,"").replace(/^(.)(.*)$/, (m,a,b)=>a.toUpperCase()+b.toLowerCase()))} placeholder="Rahul" style={iS}/></div>
          <div><label style={lS}>Last Name</label><input value={lastName} onChange={e=>setLastName(e.target.value.replace(/[^a-zA-Z]/g,"").replace(/^(.)(.*)$/, (m,a,b)=>a.toUpperCase()+b.toLowerCase()))} placeholder="Sharma" style={iS}/></div>
        </div>

        <label style={lS}>Mobile Number</label>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          <div style={{ padding:"12px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#FFFFFF", color:"#0F172A", fontSize:15, flexShrink:0, fontWeight:700 }}>+91</div>
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))} placeholder="10-digit number" maxLength={10} style={{...iS,flex:1,minWidth:0}}/>
        </div>

        <label style={lS}>City</label>
        <input value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Thane" style={{...iS, marginBottom:14}}/>

        <label style={lS}>Date of Birth</label>
        <input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} max={maxBirthDateForMinAge()} style={{...iS, marginBottom:14}}/>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <div>
            <label style={lS}>Jersey Number</label>
            <input value={jerseyNumber} onChange={e=>setJerseyNumber(e.target.value.replace(/[^0-9]/g,"").slice(0,3))} inputMode="numeric" placeholder="e.g. 7" style={iS}/>
          </div>
          <div>
            <label style={lS}>Jersey Size</label>
            <select value={jerseySize} onChange={e=>setJerseySize(e.target.value)} style={iS}>
              <option value="">Select</option>
              {JERSEY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <label style={lS}>Create 4-digit PIN</label>
        <div style={{ position:"relative", marginBottom:14 }}>
          <input type="tel" inputMode="numeric" pattern="[0-9]*" data-toggle="showPin" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="Choose a PIN" style={{...iS,letterSpacing:6,fontSize:18,textAlign:"center",paddingRight:44}}/>
          <button onClick={()=>setShowPin(s=>!s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, padding:0 }}>{showPin?"👁️":"🙈"}</button>
        </div>

        <label style={lS}>Confirm PIN</label>
        <input type="tel" inputMode="numeric" pattern="[0-9]*" value={confirmPin} onChange={e=>setConfirmPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} maxLength={4} placeholder="Re-enter PIN" style={{...iS,letterSpacing:6,fontSize:18,textAlign:"center",marginBottom:8}}/>
        {confirmPin && pin!==confirmPin && <div style={{ fontSize:11, color:"#DC2626", marginBottom:8 }}>PINs do not match</div>}

        {err && <p style={{ color:"#DC2626", fontSize:12, marginTop:10, marginBottom:0 }}>{err}</p>}

        <button onClick={submit} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:10, background:"linear-gradient(135deg,#166534,#14532D)", border:"none", color:"#0F172A", fontSize:15, fontWeight:700, cursor:"pointer", marginTop:16, fontFamily:"var(--font-head)" }}>
          {busy ? "Registering..." : "Submit for Approval →"}
        </button>

        <p style={{ color:"#64748B", fontSize:11, textAlign:"center", marginTop:14, lineHeight:1.6 }}>
          Your admin will review and approve your account.<br/>You'll be able to log in once approved.
        </p>
      </div>
    </div>
  )
}

export function RegistrationSubmittedScreen({ onBack }) {
  const isMobile = useMobile()
  return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", padding:"20px 16px" }}>
      <div style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:20, padding:isMobile?"32px 24px":"40px 36px", width:"100%", maxWidth:400, textAlign:"center", boxShadow:"0 4px 24px rgba(15,23,42,0.08)" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>⏳</div>
        <h2 style={{ color:"#0F172A", fontFamily:"var(--font-head)", fontSize:20, fontWeight:700, marginBottom:10 }}>Registration Complete! </h2>
        <p style={{ color:"#64748B", fontSize:14, lineHeight:1.7, marginBottom:24 }}>
          Your account is ready! You can now log in with your mobile number and PIN.
        </p>
        <button onClick={onBack} style={{ width:"100%", padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#166534,#14532D)", border:"none", color:"#0F172A", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-head)" }}>Back to Home</button>
      </div>
    </div>
  )
}
