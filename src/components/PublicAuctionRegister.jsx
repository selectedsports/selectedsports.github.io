import { useState, useEffect } from "react"
import { registerAuctionPlayer, checkAuctionPhoneExists, findPlayerByPhone, fetchAuctionByCode, uploadProfilePhoto, fetchAuctionPlayers } from "../db.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import { INDIAN_STATES, CITIES_BY_STATE } from "../indianStatesCities.js"
import { isValidName, birthDateError } from "../constants.js"

const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"]
const JERSEY_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"]

const iS = { width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:15, outline:"none", background:"#F8FAF8", color:"#0F172A", boxSizing:"border-box", fontFamily:"var(--font-body)" }
const lS = { fontSize:12, color:"#64748B", display:"block", marginBottom:6, fontWeight:600 }

function Header({ auctionName }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#166534,#0F172A)", padding:"24px 24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:44, width:"auto", display:"block" }}/>
        <div style={{ color:"#B8860B", fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>Auction Registration</div>
      </div>
      <h1 style={{ color:"#FFFFFF", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, margin:"0 0 6px" }}>{auctionName || "Register for the Auction"}</h1>
      <div style={{ color:"rgba(255,255,255,0.75)", fontSize:13 }}>Fill in your details below — the organizer sets your base price separately.</div>
    </div>
  )
}

function AuctionDetailsCard({ auction }) {
  if (!auction) return null
  const rows = [
    ["Auction Date", auction.auction_date ? new Date(auction.auction_date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}) : "Date TBD"],
    ["Time", auction.auction_time || "TBD"],
    ["Venue", auction.location || "TBD"],
    ["Points / Team", auction.points_purse ? auction.points_purse.toLocaleString("en-IN") : "Not set"],
  ]
  return (
    <div style={{ background:"#FFFFFF", borderRadius:16, padding:"18px", border:"1px solid #E2E8F0" }}>
      <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:12, textTransform:"uppercase" }}>Auction Details</div>
      <div style={{ display:"grid", gap:10 }}>
        {rows.map(([label, val]) => (
          <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:"#64748B" }}>{label}</span>
            <span style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{val}</span>
          </div>
        ))}
      </div>
      {auction.description && <div style={{ fontSize:12, color:"#64748B", marginTop:14, paddingTop:14, borderTop:"1px solid #F1F5F9", lineHeight:1.6 }}>{auction.description}</div>}
    </div>
  )
}

function RegisteredPlayersList({ auctionId }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!auctionId) { setLoading(false); return }
    fetchAuctionPlayers(auctionId).then(setPlayers).catch(()=>{}).finally(()=>setLoading(false))
  }, [auctionId])
  return (
    <div style={{ background:"#FFFFFF", borderRadius:16, padding:"18px", border:"1px solid #E2E8F0" }}>
      <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:12, textTransform:"uppercase" }}>Registered Players ({loading ? "…" : players.length})</div>
      {loading ? (
        <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", padding:"12px 0" }}>Loading...</div>
      ) : players.length === 0 ? (
        <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", padding:"12px 0" }}>No one has registered yet — be the first!</div>
      ) : (
        <div style={{ display:"grid", gap:8, maxHeight:320, overflowY:"auto" }}>
          {players.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"#F8FAF8", borderRadius:9 }}>
              {p.profile_image_url ? (
                <img src={p.profile_image_url} alt={p.name} style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
              ) : (
                <div style={{ width:32, height:32, borderRadius:"50%", background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#64748B", flexShrink:0 }}>{(p.name||"?")[0]}</div>
              )}
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                {p.playing_role && <div style={{ fontSize:11, color:"#94A3B8" }}>{p.playing_role}</div>}
              </div>
              {p.status === "sold" && <span style={{ fontSize:10, fontWeight:700, color:"#166534", background:"rgba(34,197,94,0.12)", padding:"2px 8px", borderRadius:999, flexShrink:0 }}>Sold ₹{p.sold_price}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PublicAuctionRegister({ auctionCode }) {
  const [checking, setChecking] = useState(true)
  const [auction, setAuction] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [city, setCity] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [cityMode, setCityMode] = useState("select") // "select" | "other"
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [jerseySize, setJerseySize] = useState("")
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState("")
  const [lookedUp, setLookedUp] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [editingExisting, setEditingExisting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [infoTab, setInfoTab] = useState("register") // "register" | "details" | "players"

  useEffect(() => {
    if (!auctionCode) { setChecking(false); return } // legacy/unscoped fallback
    fetchAuctionByCode(auctionCode).then(a => {
      if (!a) setNotFound(true)
      else setAuction(a)
      setChecking(false)
    }).catch(() => { setNotFound(true); setChecking(false) })
  }, [auctionCode])

  const auctionId = auction?.id || null
  const isOpen = auction ? auction.registration_open !== false : true

  useEffect(() => {
    const cleaned = phone.replace(/[^0-9]/g, "")
    if (cleaned.length !== 10) { setLookedUp(false); return }
    const t = setTimeout(() => {
      findPlayerByPhone(cleaned).then(p => {
        if (p) {
          const parts = (p.name || "").trim().split(/\s+/)
          setFirstName(parts[0] || "")
          setLastName(parts.slice(1).join(" ") || "")
          if (p.city) {
            setCity(p.city)
            const foundState = Object.keys(CITIES_BY_STATE).find(st => CITIES_BY_STATE[st].includes(p.city))
            if (foundState) { setSelectedState(foundState); setCityMode("select") }
            else { setCityMode("other") }
          }
          if (p.playing_role && ROLES.includes(p.playing_role)) setRole(p.playing_role)
          if (p.birth_date) setBirthDate(p.birth_date)
          if (p.profile_image_url) setPhotoPreview(p.profile_image_url)
          if (p.jersey_number) setJerseyNumber(p.jersey_number)
          if (p.jersey_size) setJerseySize(p.jersey_size)
          setLookedUp(true)
          const complete = !!(parts[0] && parts.length > 1 && p.city && p.playing_role && ROLES.includes(p.playing_role) && p.birth_date && p.profile_image_url && p.jersey_number && p.jersey_size)
          setProfileComplete(complete)
          setEditingExisting(false)
        } else {
          setLookedUp(false)
          setProfileComplete(false)
        }
      }).catch(() => {})
    }, 400)
    return () => clearTimeout(t)
  }, [phone])

  const submit = async () => {
    setError("")
    if (!firstName.trim()) { setError("Please enter your first name."); return }
    if (!isValidName(firstName)) { setError("First name can only contain letters."); return }
    if (!lastName.trim()) { setError("Please enter your last name."); return }
    if (!isValidName(lastName)) { setError("Last name can only contain letters."); return }
    if (!city.trim()) { setError("Please enter your city."); return }
    const cleaned = phone.replace(/[^0-9]/g, "")
    if (cleaned.length !== 10) { setError("Please enter a valid 10-digit phone number."); return }
    if (!role) { setError("Please select your playing role."); return }
    if (!birthDate) { setError("Please enter your date of birth."); return }
    const dobErr = birthDateError(birthDate)
    if (dobErr) { setError(dobErr); return }
    if (!jerseyNumber.trim()) { setError("Please enter your jersey number."); return }
    if (!jerseySize) { setError("Please select your jersey size."); return }
    if (!photoFile && !photoPreview) { setError("Please upload a profile photo."); return }
    setBusy(true)
    try {
      const exists = await checkAuctionPhoneExists(cleaned, auctionId)
      if (exists) { setError("This phone number is already registered for this auction."); setBusy(false); return }
      let photoUrl = photoPreview
      if (photoFile) photoUrl = await uploadProfilePhoto(photoFile, cleaned)
      await registerAuctionPlayer(`${firstName.trim()} ${lastName.trim()}`, cleaned, role, birthDate, photoUrl, auctionId, {
        city: city.trim(), jerseyNumber: jerseyNumber.trim(), jerseySize
      })
      setDone(true)
    } catch(e) { setError(e.message) }
    setBusy(false)
  }

  if (checking) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-body)" }}>
      <div style={{ color:"#64748B", fontSize:14 }}>Loading...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header/>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"32px 20px", textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:10 }}>❓</div>
        <div style={{ fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Auction not found</div>
        <div style={{ fontSize:13, color:"#64748B", marginTop:6 }}>This registration link doesn't match any auction. Double-check the link with the organizer.</div>
      </div>
    </div>
  )

  if (!isOpen) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header auctionName={auction?.name}/>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"32px 20px", textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:10 }}>🔒</div>
        <div style={{ fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>Registration is closed</div>
        <div style={{ fontSize:13, color:"#64748B", marginTop:6 }}>The organizer has closed auction registration. Please check back later or contact them directly.</div>
      </div>
    </div>
  )

  if (done) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header auctionName={auction?.name}/>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"32px 20px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>You're registered!</div>
          <div style={{ fontSize:13, color:"#64748B", marginTop:6 }}>{firstName}, you've been added to the auction pool. The organizer will set your base price before the auction starts.</div>
        </div>
        <AuctionDetailsCard auction={auction}/>
        <div style={{ height:20 }}/>
        <RegisteredPlayersList auctionId={auctionId}/>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header auctionName={auction?.name}/>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px 40px" }}>

        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[["register","Register"],["details","Auction Details"],["players","Players"]].map(([k,label]) => (
            <button key={k} onClick={()=>setInfoTab(k)} style={{ flex:1, padding:"9px 6px", borderRadius:10, border:infoTab===k?"none":"1.5px solid #E2E8F0", background:infoTab===k?"#166534":"#FFFFFF", color:infoTab===k?"#FFFFFF":"#64748B", fontSize:12, fontWeight:700, cursor:"pointer" }}>{label}</button>
          ))}
        </div>

        {infoTab === "details" && <AuctionDetailsCard auction={auction}/>}
        {infoTab === "players" && <RegisteredPlayersList auctionId={auctionId}/>}

        {infoTab === "register" && (
        <div style={{ background:"#FFFFFF", borderRadius:16, padding:"20px 18px", border:"1px solid #E2E8F0" }}>

          <label style={lS}>Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} type="tel" inputMode="numeric" placeholder="10-digit mobile number" style={{ ...iS, marginBottom: lookedUp ? 6 : 16 }}/>
          {lookedUp && profileComplete && !editingExisting && <div style={{ fontSize:12, color:"#166534", marginBottom:16, fontWeight:600 }}>✓ Found your account — your profile is already complete.</div>}
          {lookedUp && (!profileComplete || editingExisting) && <div style={{ fontSize:12, color:"#166534", marginBottom:16, fontWeight:600 }}>✓ Found your account — details auto-filled below{!profileComplete ? ", just fill in what's missing" : ""}.</div>}

          {lookedUp && profileComplete && !editingExisting ? (
            <>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"18px 14px", background:"#F8FAF8", borderRadius:12, border:"1px solid #E2E8F0", marginBottom:16 }}>
                <img src={photoPreview} alt={firstName} style={{ width:110, height:110, borderRadius:"50%", objectFit:"cover", border:"3px solid #166534", marginBottom:10 }}/>
                <div style={{ fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>{firstName} {lastName}</div>
                <div style={{ fontSize:12, color:"#64748B", marginTop:3 }}>{city} · {role}</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:1 }}>Jersey #{jerseyNumber} ({jerseySize}) · DOB {birthDate}</div>
              </div>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:16, textAlign:"center" }}>
                These are your saved details. <button type="button" onClick={()=>setEditingExisting(true)} style={{ background:"none", border:"none", color:"#166534", fontWeight:700, cursor:"pointer", padding:0, fontSize:12, textDecoration:"underline" }}>Edit before submitting</button>
              </div>
              {error && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:16 }}>{error}</div>}
              <button onClick={submit} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, fontWeight:800, cursor:busy?"not-allowed":"pointer", opacity:busy?0.6:1, fontFamily:"var(--font-head)" }}>{busy ? "Registering..." : "Confirm & Register for Auction"}</button>
            </>
          ) : (
            <>
          <div style={{ marginBottom:16 }}>
            <PhotoUploadField photoPreview={photoPreview} onPhotoSaved={(file, dataUrl) => { setPhotoFile(file); setPhotoPreview(dataUrl) }}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <div>
              <label style={lS}>First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" style={iS}/>
            </div>
            <div>
              <label style={lS}>Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" style={iS}/>
            </div>
          </div>

          <label style={lS}>State</label>
          <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setCity(""); setCityMode("select") }} style={{ ...iS, marginBottom:16 }}>
            <option value="">Select your state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label style={lS}>City</label>
          {cityMode === "other" ? (
            <div style={{ marginBottom:16 }}>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Type your city" style={iS}/>
              {selectedState && CITIES_BY_STATE[selectedState] && (
                <button type="button" onClick={() => { setCityMode("select"); setCity("") }} style={{ background:"none", border:"none", color:"#166534", fontSize:11, fontWeight:700, cursor:"pointer", padding:0, marginTop:6 }}>← Choose from list instead</button>
              )}
            </div>
          ) : (
            <select value={city} onChange={e => { if (e.target.value === "__other__") { setCityMode("other"); setCity("") } else { setCity(e.target.value) } }} disabled={!selectedState} style={{ ...iS, marginBottom:16, opacity: selectedState ? 1 : 0.6 }}>
              <option value="">{selectedState ? "Select your city" : "Select a state first"}</option>
              {selectedState && (CITIES_BY_STATE[selectedState] || []).map(c => <option key={c} value={c}>{c}</option>)}
              {selectedState && <option value="__other__">My city isn't listed...</option>}
            </select>
          )}

          <label style={lS}>Date of Birth</label>
          <input value={birthDate} onChange={e => setBirthDate(e.target.value)} type="date" max={new Date().toISOString().split("T")[0]} style={{ ...iS, marginBottom:16 }}/>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <div>
              <label style={lS}>Jersey Number</label>
              <input value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))} inputMode="numeric" placeholder="e.g. 7" style={iS}/>
            </div>
            <div>
              <label style={lS}>Jersey Size</label>
              <select value={jerseySize} onChange={e => setJerseySize(e.target.value)} style={iS}>
                <option value="">Select</option>
                {JERSEY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <label style={lS}>Playing Role</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
            {ROLES.map(r => (
              <button key={r} type="button" onClick={() => setRole(r)} style={{ padding:"10px 6px", borderRadius:9, border:role===r?"2px solid #166534":"1.5px solid #E2E8F0", background:role===r?"rgba(22,101,52,0.08)":"#FFFFFF", color:role===r?"#166534":"#0F172A", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>{r}</button>
            ))}
          </div>

          {error && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:16 }}>{error}</div>}

          <button onClick={submit} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, fontWeight:800, cursor:busy?"not-allowed":"pointer", opacity:busy?0.6:1, fontFamily:"var(--font-head)" }}>{busy ? "Registering..." : "Register for Auction"}</button>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
