import { aColor, initials } from "../constants.js"
export function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="#0B3D2E"/>
      <circle cx="24" cy="24" r="18" fill="#0F5C43"/>
      <path d="M14 24 Q24 10 34 24 Q24 38 14 24Z" fill="#1D9E75" opacity="0.9"/>
      <circle cx="24" cy="24" r="4" fill="#fff" opacity="0.95"/>
    </svg>
  )
}
export function LogoFull({ size = 40 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <Logo size={size} />
      <div>
        <div style={{ color:"#fff", fontFamily:"var(--font-head)", fontWeight:800, fontSize:size*0.44, letterSpacing:"-0.5px", lineHeight:1.1 }}>Selected</div>
        <div style={{ color:"#1D9E75", fontFamily:"var(--font-head)", fontWeight:600, fontSize:size*0.27, letterSpacing:"2.5px", textTransform:"uppercase", lineHeight:1.1 }}>Sports</div>
      </div>
    </div>
  )
}
export function Av({ name, id, sz = 34 }) {
  return (
    <div style={{ width:sz, height:sz, borderRadius:"50%", background:aColor(id), display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz*0.3, fontWeight:700, color:"#fff", flexShrink:0, letterSpacing:"-0.5px", fontFamily:"var(--font-head)" }}>
      {initials(name)}
    </div>
  )
}
const TAG_STYLES = {
  green:{ bg:"#d1fae5", tx:"#065f46" }, lime:{ bg:"#ecfccb", tx:"#3a5c0a" },
  yellow:{ bg:"#fef3c7", tx:"#78350f" }, red:{ bg:"#fee2e2", tx:"#991b1b" },
  blue:{ bg:"#dbeafe", tx:"#1e3a8a" }, teal:{ bg:"#ccfbf1", tx:"#134e4a" },
  orange:{ bg:"#ffedd5", tx:"#9a3412" }, purple:{ bg:"#ede9fe", tx:"#4c1d95" },
  gray:{ bg:"#f3f4f6", tx:"#374151" },
}
export function Tag({ children, col = "gray" }) {
  const c = TAG_STYLES[col] || TAG_STYLES.gray
  return <span style={{ background:c.bg, color:c.tx, borderRadius:6, padding:"3px 9px", fontSize:11, fontWeight:700, whiteSpace:"nowrap", display:"inline-block", fontFamily:"var(--font-head)" }}>{children}</span>
}
export function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style:sx = {} }) {
  const base = { border:"none", borderRadius:10, cursor:disabled?"not-allowed":"pointer", fontWeight:600, fontFamily:"var(--font-body)", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, opacity:disabled?0.55:1 }
  const variants = {
    primary:{ background:"#0B3D2E", color:"#fff" },
    green:{ background:"#1D9E75", color:"#fff" },
    danger:{ background:"#fee2e2", color:"#991b1b", border:"1px solid #fecaca" },
    ghost:{ background:"#f3f4f6", color:"#374151" },
    wa:{ background:"#dcfce7", color:"#166534", border:"1px solid #86efac" },
    outline:{ background:"transparent", color:"#0B3D2E", border:"1.5px solid #0B3D2E" },
    dark:{ background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.18)" },
  }
  const sizes = { sm:{ padding:"5px 12px", fontSize:12 }, md:{ padding:"9px 18px", fontSize:13 }, lg:{ padding:"12px 24px", fontSize:14 } }
  return <button onClick={disabled?undefined:onClick} style={{ ...base, ...variants[variant], ...sizes[size], ...sx }}>{children}</button>
}
export function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #d1fae5", borderTopColor:"#1D9E75", animation:"spin 0.7s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
export function Card({ children, style:sx = {} }) {
  return <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #e5e7eb", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", ...sx }}>{children}</div>
}
