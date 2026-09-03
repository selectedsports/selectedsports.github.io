import { useState, useEffect } from "react"
import { Logo, Av } from "./ui.jsx"
import { fetchPlayers, registerPlayer, fetchRecentlyRegistered, fetchPlayerCount, fetchMatchCount, fetchTeamCount, uploadProfilePhoto } from "../db.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import { Phone, Lock, Eye, EyeOff, UserPlus, Users, Swords, Trophy } from "lucide-react"
import { ADMIN_PHONE, isValidName, birthDateError } from "../constants.js"
import { useMobile } from "../hooks/useMobile.js"

export function UnifiedLoginScreen({ onAdminSuccess, onPlayerSuccess, onBack, onRegister }) {
  // LOGIN_ONLY_SCREEN_V1
  const [phone, setPhone] = useState("")
  const [pin, setPin]     = useState("")
  const [show, setShow]   = useState(false)
  const [err, setErr]     = useState("")
  const [busy, setBusy]   = useState(false)
  const [remember, setRemember] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const login = async () => {
    const cleaned = phone.replace(/[^0-9]/g,"").slice(-10)
    if (cleaned.length !== 10) { setErr("Enter a valid 10-digit mobile number."); return }
    if (!pin || pin.length !== 4) { setErr("Enter your 4-digit PIN."); return }
    setBusy(true)
    setErr("")
    try {
      const players = await fetchPlayers()
      const found = players.find(p => p.phone && p.phone.replace(/[^0-9]/g,"").slice(-10) === cleaned)
      if (!found) { setErr("Mobile number not registered. Contact your admin."); setBusy(false); return }
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
    onFocus: e=>{ e.currentTarget.parentElement.style.borderColor="#166534"; e.currentTarget.parentElement.style.boxShadow="0 0 0 3px rgba(37,99,235,0.12)" },
    onBlur:  e=>{ e.currentTarget.parentElement.style.borderColor="#E2E8F0"; e.currentTarget.parentElement.style.boxShadow="none" },
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", justifyContent:"center", fontFamily:"var(--font-body)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", top:"-10%", right:"-15%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.05) 0%, rgba(37,99,235,0) 70%)", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:500, padding:"48px 20px 40px", position:"relative", zIndex:1, display:"flex", flexDirection:"column", justifyContent:"center", minHeight:"100vh" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#64748B", fontSize:13, cursor:"pointer", padding:0, marginBottom:16, fontFamily:"var(--font-body)", alignSelf:"flex-start" }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:28, opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(-10px)", transition:"opacity 400ms, transform 400ms" }}>
          <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:80, width:"auto", display:"block", margin:"0 auto" }}/>
        </div>

        <div style={{
          background:"#FFFFFF", borderRadius:20, boxShadow:"0 10px 30px rgba(15,23,42,0.08)", padding:"32px 26px",
          opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(16px)", transition:"opacity 450ms 100ms, transform 450ms 100ms",
        }}>
          <h2 style={{ color:"#0F172A", fontSize:24, fontWeight:800, margin:"0 0 22px", fontFamily:"var(--font-head)" }}>Welcome Back 👋</h2>

          <label style={{ color:"#0F172A", fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Mobile Number</label>
          <div style={{ ...inputWrapStyle, marginBottom:16 }}>
            <Phone size={16} color="#94A3B8"/>
            <span style={{ color:"#0F172A", fontWeight:700, fontSize:15 }}>+91</span>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^0-9]/g,"").slice(0,10))} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Enter your mobile number" maxLength={10} style={inputStyle} {...focusHandlers}/>
          </div>

          <label style={{ color:"#0F172A", fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>PIN</label>
          <div style={{ ...inputWrapStyle, marginBottom:10 }}>
            <Lock size={16} color="#94A3B8"/>
            <input type="tel" inputMode="numeric" pattern="[0-9]*" value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,"").slice(0,4))} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Enter your PIN" maxLength={4} style={{...inputStyle, letterSpacing:4, WebkitTextSecurity: show ? "none" : "disc"}} {...focusHandlers}/>
            <button onClick={()=>setShow(s=>!s)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>{show ? <EyeOff size={16} color="#94A3B8"/> : <Eye size={16} color="#94A3B8"/>}</button>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"#64748B", cursor:"pointer" }}>
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:"#166534", width:15, height:15 }}/>
              Remember Me
            </label>
            <span style={{ fontSize:13, color:"#166534", fontWeight:600, cursor:"default" }}>Forgot PIN?</span>
          </div>

          {err && <p style={{ color:"#EF4444", fontSize:12, marginBottom:10 }}>{err}</p>}

          <button onClick={login} disabled={busy||phone.length<10||pin.length!==4} style={{ width:"100%", height:54, borderRadius:14, background:(phone.length<10||pin.length!==4)?"#E2E8F0":"linear-gradient(135deg,#166534,#14532D)", border:"none", color:"#FFFFFF", fontSize:15, fontWeight:700, cursor:(phone.length<10||pin.length!==4)?"not-allowed":"pointer", transition:"transform 200ms, box-shadow 200ms", boxShadow:(phone.length<10||pin.length!==4)?"none":"0 8px 20px rgba(37,99,235,0.3)" }}
            onMouseEnter={e=>{ if(!busy && phone.length>=10 && pin.length===4){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 28px rgba(37,99,235,0.4)" } }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=(phone.length<10||pin.length!==4)?"none":"0 8px 20px rgba(37,99,235,0.3)" }}>
            {busy ? "Logging in..." : "Login →"}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:"#E2E8F0" }}/>
            <span style={{ fontSize:12, color:"#94A3B8", fontWeight:600 }}>OR</span>
            <div style={{ flex:1, height:1, background:"#E2E8F0" }}/>
          </div>

          <button onClick={onRegister} style={{ width:"100%", padding:"14px 16px", borderRadius:14, background:"#FFFFFF", border:"1.5px solid #166534", color:"#166534", fontSize:14, fontWeight:700, cursor:"pointer", transition:"background 200ms" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(37,99,235,0.05)" }}
            onMouseLeave={e=>{ e.currentTarget.style.background="#FFFFFF" }}>
            Create New Player Account
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:20 }}>
          <span style={{ fontSize:12, color:"#94A3B8" }}>Need help? <span style={{ color:"#166534", fontWeight:600, cursor:"default" }}>Contact Organizer</span></span>
        </div>
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
        <input type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)} max={new Date().toISOString().split("T")[0]} style={{...iS, marginBottom:14}}/>

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
