import { Logo } from "./ui.jsx"
export default function HomeScreen({ onAdmin, onPlayer }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#071a10 0%,#0B3D2E 45%,#071a10 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"fixed", top:-140, right:-140, width:440, height:440, borderRadius:"50%", background:"rgba(29,158,117,0.07)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:-100, left:-100, width:320, height:320, borderRadius:"50%", background:"rgba(29,158,117,0.05)", pointerEvents:"none" }}/>
      <div style={{ width:440, textAlign:"center", padding:"0 20px", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}><Logo size={76} /></div>
        <h1 style={{ color:"#fff", fontSize:34, fontWeight:900, margin:"0 0 6px", fontFamily:"var(--font-head)", letterSpacing:"-1px" }}>Selected Sports</h1>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, margin:"0 0 8px" }}>Cricket Club Management · Pimpri, Pune</p>
        <div style={{ width:40, height:3, background:"#1D9E75", borderRadius:4, margin:"0 auto 36px" }}/>
        <div style={{ display:"grid", gap:14 }}>
          <button onClick={onAdmin} style={{ padding:"20px 24px", borderRadius:16, background:"rgba(29,158,117,0.10)", border:"1.5px solid rgba(29,158,117,0.38)", color:"#fff", fontSize:15, cursor:"pointer", textAlign:"left", fontFamily:"var(--font-body)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(29,158,117,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>⚙️</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:3, fontFamily:"var(--font-head)" }}>Admin Login</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontWeight:400 }}>Schedule matches · Invite players · Track payments</div>
              </div>
            </div>
          </button>
          <button onClick={onPlayer} style={{ padding:"20px 24px", borderRadius:16, background:"rgba(24,95,165,0.10)", border:"1.5px solid rgba(24,95,165,0.35)", color:"#fff", fontSize:15, cursor:"pointer", textAlign:"left", fontFamily:"var(--font-body)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"rgba(24,95,165,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>👤</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:3, fontFamily:"var(--font-head)" }}>Player Login</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontWeight:400 }}>View your personal match invites · Confirm availability</div>
              </div>
            </div>
          </button>
        </div>
        <div style={{ marginTop:28, padding:"12px 16px", background:"rgba(29,158,117,0.08)", borderRadius:10, border:"1px solid rgba(29,158,117,0.2)" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.42)" }}>🔒 Players only see matches they have been personally selected for</span>
        </div>
      </div>
    </div>
  )
}
