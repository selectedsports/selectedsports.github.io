import { useState, useEffect } from "react"
import { Logo } from "./ui.jsx"
import { useMobile } from "../hooks/useMobile.js"
import { fetchRecentlyRegistered } from "../db.js"

function maskName(name) {
  const parts = (name || "").trim().split(/\s+/)
  if (parts.length <= 1) return parts[0] || "Player"
  return parts[0] + " " + parts[parts.length - 1][0] + "."
}

export default function HomeScreen({ onLogin, onRegister }) {
  const isMobile = useMobile()
  const [recent, setRecent] = useState([])
  useEffect(() => { fetchRecentlyRegistered(5).then(setRecent).catch(()=>{}) }, [])

  return (
    <div style={{ minHeight:"100vh", background:"#FBF3E7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", position:"relative", overflow:"hidden" }}>
      {/* Ambient warm blobs, consistent with portal accent colors */}
      <div style={{ position:"fixed", top:-160, right:-160, width:460, height:460, borderRadius:"50%", background:"rgba(166,25,46,0.05)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:-120, left:-120, width:340, height:340, borderRadius:"50%", background:"rgba(29,158,117,0.07)", pointerEvents:"none" }}/>

      {/* Oversized watermark ball/bat icon, very subtle */}
      <svg width={isMobile?280:380} height={isMobile?280:380} viewBox="0 0 48 48" style={{ position:"fixed", top:isMobile?-40:-60, left:isMobile?-60:-80, opacity:0.05, pointerEvents:"none" }}>
        <circle cx="24" cy="24" r="24" fill="#0B3D2E"/>
        <circle cx="24" cy="24" r="18" fill="#0F5C43"/>
        <g transform="rotate(-28 22 26)">
          <rect x="19.5" y="10" width="5" height="17" rx="2.5" fill="#E3B37A"/>
          <rect x="20.3" y="26" width="3.4" height="9" rx="1.6" fill="#3E2723"/>
        </g>
        <circle cx="32" cy="17" r="6.5" fill="#A6192E" stroke="#7A1122" strokeWidth="0.6"/>
      </svg>

      <div style={{ width:"100%", maxWidth:440, textAlign:"center", padding:"0 20px", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <div style={{ padding:14, borderRadius:"50%", background:"#fff", border:"1.5px solid #EDE4D3", boxShadow:"0 4px 16px rgba(139,30,46,0.08)" }}>
            <Logo size={isMobile?54:68}/>
          </div>
        </div>
        <h1 style={{ color:"#0B3D2E", fontSize:isMobile?28:36, fontWeight:900, margin:"0 0 4px", fontFamily:"var(--font-head)", letterSpacing:"-1px" }}>Selected Sports</h1>
        <div style={{ fontSize:isMobile?11:12, fontWeight:800, color:"#A6192E", letterSpacing:"2px", margin:"0 0 14px" }}>PLAY. COMPETE. GET RECOGNISED.</div>
        <div style={{ width:44, height:3, background:"#A6192E", borderRadius:4, margin:"0 auto 30px", opacity:0.7 }}/>

        <button onClick={onLogin} style={{ width:"100%", padding:isMobile?"18px":"20px 24px", borderRadius:14, background:"linear-gradient(135deg,#1D9E75,#0F6E56)", border:"none", color:"#fff", fontSize:isMobile?16:17, cursor:"pointer", fontFamily:"var(--font-head)", fontWeight:800, boxShadow:"0 8px 22px rgba(29,158,117,0.3)", letterSpacing:"0.3px", marginBottom:12 }}>
          Login to Selected Sports →
        </button>

        <button onClick={onRegister} style={{ width:"100%", padding:isMobile?"15px":"16px 24px", borderRadius:14, background:"#fff", border:"1.5px solid #0B3D2E", color:"#0B3D2E", fontSize:isMobile?14:15, cursor:"pointer", fontFamily:"var(--font-head)", fontWeight:700 }}>
          New player? Register →
        </button>

        <div style={{ marginTop:22, padding:"13px 16px", background:"#fff", borderRadius:12, border:"1.5px solid #EDE4D3" }}>
          <span style={{ fontSize:isMobile?11:12, color:"#8A7F6A" }}>🔒 Login with your registered mobile number and PIN</span>
        </div>

        {recent.length > 0 && (
          <div style={{ marginTop:26 }}>
            <div style={{ fontSize:11, color:"#9ca3af", fontWeight:700, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:10 }}>🎉 Recently Joined</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
              {recent.map((p) => (
                <div key={p.id} style={{ padding:"6px 12px", background:"#fff", border:"1px solid #EDE4D3", borderRadius:20, fontSize:12, color:"#0B3D2E", fontWeight:600 }}>
                  {maskName(p.name)}{p.city ? ` · ${p.city}` : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
