import { useState } from "react"
import { Logo } from "./ui.jsx"
import { fetchPlayers } from "../db.js"
import { ADMIN_PASSWORD } from "../constants.js"
function AuthShell({ onBack, title, subtitle, children }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10,#0B3D2E,#071a10)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)" }}>
      <div style={{ background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.10)", borderRadius:20, padding:"36px 42px", width:360, backdropFilter:"blur(10px)" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer", padding:0, marginBottom:22, fontFamily:"var(--font-body)" }}>← Back</button>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <Logo size={46} />
          <h2 style={{ color:"#fff", fontSize:20, fontWeight:800, margin:"12px 0 4px", fontFamily:"var(--font-head)" }}>{title}</h2>
          <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
export function AdminLoginScreen({ onSuccess, onBack }) {
  const [pass, setPass] = useState("")
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)
  const login = () => {
    setBusy(true)
    setTimeout(() => {
      if (pass === ADMIN_PASSWORD) { onSuccess(); setErr("") }
      else setErr("Wrong password. Hint: cricket123")
      setBusy(false)
    }, 400)
  }
  return (
    <AuthShell onBack={onBack} title="Admin Login" subtitle="Selected Sports Admin Portal">
      <label style={{ color:"rgba(255,255,255,0.5)", fontSize:12, display:"block", marginBottom:6 }}>Password</label>
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Enter admin password" style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:14, boxSizing:"border-box", outline:"none", marginBottom:8, fontFamily:"var(--font-body)" }} />
      {err && <p style={{ color:"#f87171", fontSize:12, marginBottom:10 }}>{err}</p>}
      <button onClick={login} disabled={busy} style={{ width:"100%", padding:"12px", borderRadius:10, background:"#1D9E75", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:6, fontFamily:"var(--font-head)" }}>{busy ? "Checking..." : "Login →"}</button>
    </AuthShell>
  )
}
export function PlayerLoginScreen({ onSuccess, onBack }) {
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)
  const login = async () => {
    if (!name.trim()) { setErr("Please enter your name."); return }
    setBusy(true)
    try {
      const players = await fetchPlayers()
      const found = players.find(p => p.name.toLowerCase().includes(name.toLowerCase().trim()))
      if (!found) { setErr("Player not found. Check your name."); setBusy(false); return }
      if (pin !== found.pin) { setErr("Wrong PIN. Ask your admin for your PIN."); setBusy(false); return }
      onSuccess(found)
    } catch (e) { setErr("Connection error. Check your internet."); setBusy(false) }
  }
  return (
    <AuthShell onBack={onBack} title="Player Login" subtitle="Only your personal invites are visible">
      <label style={{ color:"rgba(255,255,255,0.5)", fontSize:12, display:"block", marginBottom:6 }}>Your Name</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aquib Javed" style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:14, boxSizing:"border-box", outline:"none", marginBottom:12, fontFamily:"var(--font-body)" }} />
      <label style={{ color:"rgba(255,255,255,0.5)", fontSize:12, display:"block", marginBottom:6 }}>4-digit PIN</label>
      <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="PIN (ask your admin)" style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.07)", color:"#fff", fontSize:14, boxSizing:"border-box", outline:"none", marginBottom:8, fontFamily:"var(--font-body)" }} />
      {err && <p style={{ color:"#f87171", fontSize:12, marginBottom:10 }}>{err}</p>}
      <button onClick={login} disabled={busy} style={{ width:"100%", padding:"12px", borderRadius:10, background:"#185FA5", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:6, fontFamily:"var(--font-head)" }}>{busy ? "Logging in..." : "Login →"}</button>
      <p style={{ color:"rgba(255,255,255,0.22)", fontSize:11, textAlign:"center", marginTop:14 }}>Other players matches are always private.</p>
    </AuthShell>
  )
}
