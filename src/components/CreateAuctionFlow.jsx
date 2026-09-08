import { useState, useEffect } from "react"
import { AUCTION_PLANS, ADMIN_PHONE, ADMIN_UPI } from "../constants.js"
import { createAuction, fetchPlatformUpi, markAuctionPaidByOrganizer, fetchTeams, fetchPlayers, createAuctionTeam, addRosterPlayerToAuction, fetchGrounds, addGround } from "../db.js"
import { Av } from "./ui.jsx"
import { INDIAN_STATES, CITIES_BY_STATE } from "../indianStatesCities.js"
import { MapPin } from "lucide-react"

const iS = { width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:14, outline:"none", background:"#F8FAF8", color:"#0F172A", boxSizing:"border-box", fontFamily:"var(--font-body)" }
const lS = { fontSize:12, color:"#64748B", display:"block", marginBottom:6, fontWeight:600 }

function AuctionLinks({ auction }) {
  const [copied, setCopied] = useState("")
  if (!auction?.auction_code) return null
  const base = window.location.origin
  const regLink = `${base}/auction-register/${auction.auction_code}`
  const liveLink = `${base}/live-auction/${auction.auction_code}`
  const copy = (text, which) => { navigator.clipboard?.writeText(text); setCopied(which); setTimeout(() => setCopied(""), 2000) }
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>Your Shareable Links</div>
      {[["Registration Link", regLink, "reg"], ["Live Auction Link", liveLink, "live"]].map(([label, link, key]) => (
        <div key={key} style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#64748B", marginBottom:4, fontWeight:600 }}>{label}</div>
          <div style={{ display:"flex", gap:8 }}>
            <div style={{ flex:1, padding:"9px 11px", background:"#F8FAF8", border:"1px solid #E2E8F0", borderRadius:8, fontSize:12, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{link}</div>
            <button onClick={() => copy(link, key)} style={{ padding:"9px 14px", borderRadius:8, border:"1px solid #166534", background: copied===key ? "#166534" : "#FFFFFF", color: copied===key ? "#FFFFFF" : "#166534", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }}>{copied===key ? "Copied!" : "Copy"}</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CreateAuctionFlow({ organizerId, isMobile, onClose, onCreated }) {
  const [step, setStep] = useState("plan") // plan | details | payment | done
  const [planId, setPlanId] = useState("free")
  const [name, setName] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [city, setCity] = useState("")
  const [cityMode, setCityMode] = useState("select") // "select" | "other"
  const [groundName, setGroundName] = useState("")
  const [groundMapsLink, setGroundMapsLink] = useState("")
  const [savedGrounds, setSavedGrounds] = useState([])
  const [mapGrounds, setMapGrounds] = useState([])
  const [loadingMapGrounds, setLoadingMapGrounds] = useState(false)
  const [mapSearched, setMapSearched] = useState(false)
  const [auctionDate, setAuctionDate] = useState("")
  const [timeHour, setTimeHour] = useState("7")
  const [timeMinute, setTimeMinute] = useState("00")
  const [timePeriod, setTimePeriod] = useState("AM")
  const [pointsPurse, setPointsPurse] = useState("")
  const [playerEntryFee, setPlayerEntryFee] = useState("")
  const [organizerUpiId, setOrganizerUpiId] = useState("")
  const [organizerPaymentPhone, setOrganizerPaymentPhone] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [platformUpi, setPlatformUpi] = useState("")
  const [createdAuction, setCreatedAuction] = useState(null)
  const [paidClicked, setPaidClicked] = useState(false)
  const [copiedField, setCopiedField] = useState("")
  const [rosterTeams, setRosterTeams] = useState([])
  const [rosterPlayers, setRosterPlayers] = useState([])
  const [selectedTeamIds, setSelectedTeamIds] = useState(new Set())
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set())
  const [rosterSearch, setRosterSearch] = useState("")
  const [loadingRoster, setLoadingRoster] = useState(false)

  const plan = AUCTION_PLANS.find(p => p.id === planId) || AUCTION_PLANS[0]
  const adminUpi = platformUpi || ADMIN_UPI || "9897439743@okbizaxis"
  const copyText = (txt, field) => {
    navigator.clipboard?.writeText(txt)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  useEffect(() => {
    fetchPlatformUpi().then(setPlatformUpi).catch(() => {})
    fetchGrounds().then(setSavedGrounds).catch(() => {})
  }, [])

  const searchFreeMapGrounds = async (targetCity, targetState) => {
    const c = (targetCity !== undefined ? targetCity : city).trim()
    const s = (targetState !== undefined ? targetState : selectedState).trim()
    if (!c) return
    setLoadingMapGrounds(true)
    setMapSearched(true)
    try {
      const q = encodeURIComponent(`cricket ground in ${c} ${s}`)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=12&addressdetails=1`, {
        headers: { "Accept": "application/json" }
      })
      if (res.ok) {
        const data = await res.json()
        const found = []
        const seen = new Set()
        for (const item of (data || [])) {
          const rawName = item.name || (item.display_name ? item.display_name.split(",")[0] : "")
          const cleanName = rawName.replace(/,\s*India$/i, "").trim()
          if (cleanName && !seen.has(cleanName.toLowerCase())) {
            seen.add(cleanName.toLowerCase())
            found.push({
              name: cleanName,
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName + " " + c)}`
            })
          }
        }
        setMapGrounds(found)
      }
    } catch (err) {
      console.warn("Free map search failed:", err)
    } finally {
      setLoadingMapGrounds(false)
    }
  }

  const goDetails = () => setStep("details")

  const submitDetails = async () => {
    setError("")
    if (!name.trim()) { setError("Please enter a name for this auction."); return }
    if (!selectedState) { setError("Please select a state."); return }
    if (!city.trim()) { setError("Please select or enter a city."); return }
    if (!auctionDate) { setError("Please select an auction date."); return }
    const todayStr = new Date().toISOString().split("T")[0]
    if (auctionDate < todayStr) { setError("Auction date can't be in the past."); return }
    if (!pointsPurse || Number(pointsPurse) <= 0) { setError("Please enter a default points purse per team."); return }
    const feeNum = Number(playerEntryFee) || 0
    if (feeNum > 0) {
      if (!organizerUpiId.trim()) { setError("Please enter your UPI ID so players can pay the entry fee."); return }
      const cleanPhone = organizerPaymentPhone.replace(/[^0-9]/g, "").slice(-10)
      if (cleanPhone.length !== 10) { setError("Please enter a valid 10-digit mobile number for GPay/PhonePe."); return }
    }
    const groundClean = groundName.trim()
    const location = groundClean ? `${groundClean} · ${city.trim()}, ${selectedState}` : `${city.trim()}, ${selectedState}`
    const auctionTime = `${timeHour}:${timeMinute} ${timePeriod}`
    setBusy(true)
    try {
      if (groundClean) {
        const alreadyExists = (savedGrounds || []).some(g => (g.name || "").trim().toLowerCase() === groundClean.toLowerCase())
        if (!alreadyExists) {
          const mapsLinkToSave = groundMapsLink.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(groundClean + " " + city.trim())}`
          addGround(groundClean, `${city.trim()}, ${selectedState}`, mapsLinkToSave, "Added during auction setup").catch(e => console.warn("Auto add ground error:", e))
        }
      }
      const cleanPhone = organizerPaymentPhone.replace(/[^0-9]/g, "").slice(-10)
      const auction = await createAuction({
        name: name.trim(), organizerId, location,
        auctionDate: auctionDate || null, auctionTime: auctionTime || null,
        planTier: plan.id, maxTeams: plan.maxTeams,
        pointsPurse: pointsPurse ? Number(pointsPurse) : null,
        amountDue: plan.price,
        playerEntryFee: feeNum,
        organizerUpiId: feeNum > 0 ? organizerUpiId.trim() : null,
        organizerPaymentPhone: feeNum > 0 ? cleanPhone : null
      })
      setCreatedAuction(auction)
      setStep("roster")
      setLoadingRoster(true)
      Promise.all([fetchTeams(), fetchPlayers()]).then(([t, p]) => { setRosterTeams(t); setRosterPlayers(p) }).catch(() => {}).finally(() => setLoadingRoster(false))
    } catch(e) { setError(e.message) }
    setBusy(false)
  }

  const skipRoster = () => {
    setStep(plan.price > 0 ? "payment" : "done")
    if (plan.price === 0) onCreated?.(createdAuction)
  }

  const proceedAfterRoster = async () => {
    setBusy(true)
    try {
      const purse = pointsPurse ? Number(pointsPurse) : 0
      await Promise.all([
        ...rosterTeams.filter(t => selectedTeamIds.has(t.id)).map(t => createAuctionTeam(t.name, null, purse, createdAuction.id)),
        ...rosterPlayers.filter(p => selectedPlayerIds.has(p.id)).map(p => addRosterPlayerToAuction(createdAuction.id, p)),
      ])
    } catch(e) { alert(e.message) }
    setStep(plan.price > 0 ? "payment" : "done")
    if (plan.price === 0) onCreated?.(createdAuction)
    setBusy(false)
  }

  const markPaid = async () => {
    setBusy(true)
    try {
      await markAuctionPaidByOrganizer(createdAuction.id)
      setPaidClicked(true)
    } catch(e) { setError(e.message) }
    setBusy(false)
  }

  const mStyle = { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:isMobile?"flex-end":"center", justifyContent:"center", zIndex:400 }
  const mBox = { background:"#F8FAF8", borderRadius:isMobile?"20px 20px 0 0":20, padding:isMobile?"22px 18px":28, width:"100%", maxWidth:isMobile?"100%":460, maxHeight:isMobile?"92vh":"85vh", overflowY:"auto", boxSizing:"border-box" }

  return (
    <div style={mStyle} onClick={onClose}>
      <div style={mBox} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>
            {step === "plan" ? "Choose a Plan" : step === "details" ? "Auction Details" : step === "roster" ? "Add Teams & Players" : step === "payment" ? "Complete Payment" : "You're All Set!"}
          </h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>×</button>
        </div>

        {step === "plan" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
              {AUCTION_PLANS.map(p => (
                <button key={p.id} onClick={() => setPlanId(p.id)} style={{ padding:"16px 10px", borderRadius:14, border: planId===p.id ? "2px solid #166534" : "1.5px solid #E2E8F0", background: planId===p.id ? "rgba(34,197,94,0.08)" : "#FFFFFF", cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>{p.label}</div>
                  <div style={{ fontSize:20, fontWeight:900, color:"#0F172A", fontFamily:"var(--font-head)", margin:"6px 0" }}>{p.maxTeams} <span style={{ fontSize:11, fontWeight:600, color:"#64748B" }}>teams</span></div>
                  <div style={{ fontSize:14, fontWeight:800, color: p.price === 0 ? "#166534" : "#B8860B" }}>{p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}</div>
                </button>
              ))}
            </div>
            <button onClick={goDetails} style={{ width:"100%", padding:"14px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)" }}>Continue with {plan.label} →</button>
          </>
        )}

        {step === "details" && (() => {
          const todayStr = new Date().toISOString().split("T")[0]
          const feeNum = Number(playerEntryFee) || 0
          const paymentValid = feeNum === 0 || (organizerUpiId.trim() && organizerPaymentPhone.replace(/[^0-9]/g, "").slice(-10).length === 10)
          const allFilled = name.trim() && selectedState && city.trim() && auctionDate && auctionDate >= todayStr && pointsPurse && Number(pointsPurse) > 0 && paymentValid
          return (
          <>
            <div style={{ padding:"10px 12px", background:"rgba(34,197,94,0.08)", borderRadius:9, marginBottom:16, fontSize:12, color:"#166534", fontWeight:600 }}>
              {plan.label} · Up to {plan.maxTeams} teams · {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
            </div>
            <label style={lS}>Auction Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunday Premier League Auction" style={{ ...iS, marginBottom:14 }}/>

            <label style={lS}>State *</label>
            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setCity(""); setCityMode("select"); setGroundName(""); setMapGrounds([]); setMapSearched(false) }} style={{ ...iS, marginBottom:14 }}>
              <option value="">Select state</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <label style={lS}>City *</label>
            {cityMode === "other" ? (
              <div style={{ marginBottom:14 }}>
                <input value={city} onChange={e => { setCity(e.target.value); setGroundName("") }} placeholder="Type your city" style={iS}/>
                {selectedState && CITIES_BY_STATE[selectedState] && (
                  <button type="button" onClick={() => { setCityMode("select"); setCity(""); setGroundName("") }} style={{ background:"none", border:"none", color:"#166534", fontSize:11, fontWeight:700, cursor:"pointer", padding:0, marginTop:6 }}>← Choose from list instead</button>
                )}
              </div>
            ) : (
              <select value={city} onChange={e => { if (e.target.value === "__other__") { setCityMode("other"); setCity(""); setGroundName(""); setMapGrounds([]); setMapSearched(false) } else { setCity(e.target.value); setGroundName(""); if (e.target.value) searchFreeMapGrounds(e.target.value, selectedState) } }} disabled={!selectedState} style={{ ...iS, marginBottom:14, opacity: selectedState ? 1 : 0.6 }}>
                <option value="">{selectedState ? "Select city" : "Select a state first"}</option>
                {selectedState && (CITIES_BY_STATE[selectedState] || []).map(c => <option key={c} value={c}>{c}</option>)}
                {selectedState && <option value="__other__">My city isn't listed...</option>}
              </select>
            )}

            {/* Ground / Venue Selection with Free Map Pickup */}
            <div style={{ padding:"14px", background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:12, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <label style={{ ...lS, marginBottom:0, fontWeight:700, color:"#0F172A", display:"flex", alignItems:"center", gap:6 }}>
                  <MapPin size={14} color="#166534"/> Ground / Venue (Optional)
                </label>
                {city.trim() && (
                  <a
                    href={`https://www.google.com/maps/search/cricket+grounds+in+${encodeURIComponent(city)}+${encodeURIComponent(selectedState)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize:11, color:"#166534", fontWeight:700, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}
                  >
                    Google Maps ↗
                  </a>
                )}
              </div>
              <div style={{ fontSize:11, color:"#64748B", marginBottom:10 }}>
                Enter tournament ground name, or pick an available ground found in {city || "your city"}.
              </div>

              <input
                value={groundName}
                onChange={e => setGroundName(e.target.value)}
                placeholder="e.g. Shinde High School Cricket Ground, Sahakar Nagar"
                style={{ ...iS, marginBottom:8 }}
              />

              {/* Quick Pick Chips */}
              {city.trim() && (() => {
                const citySavedGrounds = (savedGrounds || []).filter(g => {
                  const loc = (g.location || "").toLowerCase()
                  const c = city.trim().toLowerCase()
                  return loc.includes(c) || (g.name || "").toLowerCase().includes(c)
                })
                return (
                  <div style={{ marginTop:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div style={{ fontSize:10.5, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                        Available Cricket Grounds in {city}
                      </div>
                      <button
                        type="button"
                        onClick={() => searchFreeMapGrounds(city, selectedState)}
                        disabled={loadingMapGrounds}
                        style={{ background:"none", border:"none", color:"#166534", fontSize:11, fontWeight:700, cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:3 }}
                      >
                        {loadingMapGrounds ? "Searching Map..." : "🔄 Scan Map"}
                      </button>
                    </div>

                    {/* Saved Platform Grounds */}
                    {citySavedGrounds.length > 0 && (
                      <div style={{ marginBottom:8 }}>
                        <div style={{ fontSize:10, color:"#166534", fontWeight:600, marginBottom:4 }}>Platform Grounds:</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                          {citySavedGrounds.map(g => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => { setGroundName(g.name); if (g.maps_link) setGroundMapsLink(g.maps_link) }}
                              style={{
                                padding:"5px 9px", borderRadius:7,
                                border: groundName === g.name ? "1.5px solid #166534" : "1px solid #BBF7D0",
                                background: groundName === g.name ? "#DCFCE7" : "#F0FDF4",
                                color:"#166534", fontSize:11, fontWeight:600, cursor:"pointer", textAlign:"left"
                              }}
                            >
                              🏟️ {g.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Map Discovered Grounds */}
                    {loadingMapGrounds ? (
                      <div style={{ fontSize:11, color:"#64748B", padding:"4px 0" }}>Searching cricket grounds on map...</div>
                    ) : mapGrounds.length > 0 ? (
                      <div>
                        <div style={{ fontSize:10, color:"#0369A1", fontWeight:600, marginBottom:4 }}>Discovered on Map:</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5, maxHeight:120, overflowY:"auto" }}>
                          {mapGrounds.map((m, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => { setGroundName(m.name); setGroundMapsLink(m.mapsUrl) }}
                              style={{
                                padding:"5px 9px", borderRadius:7,
                                border: groundName === m.name ? "1.5px solid #0284C7" : "1px solid #BAE6FD",
                                background: groundName === m.name ? "#E0F2FE" : "#F0F9FF",
                                color:"#0369A1", fontSize:11, fontWeight:600, cursor:"pointer", textAlign:"left"
                              }}
                            >
                              📍 {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : mapSearched ? (
                      <div style={{ fontSize:11, color:"#94A3B8" }}>
                        No cricket grounds indexed on map for {city}. You can type the ground name above or browse via the Google Maps link.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => searchFreeMapGrounds(city, selectedState)}
                        style={{ padding:"6px 10px", borderRadius:6, border:"1px dashed #CBD5E1", background:"#F8FAF8", color:"#475569", fontSize:11, fontWeight:600, cursor:"pointer" }}
                      >
                        🔍 Fetch available grounds from map
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <div>
                <label style={lS}>Date *</label>
                <input type="date" min={todayStr} value={auctionDate} onChange={e => setAuctionDate(e.target.value)} style={iS}/>
              </div>
              <div>
                <label style={lS}>Time *</label>
                <div style={{ display:"flex", gap:6 }}>
                  <select value={timeHour} onChange={e => setTimeHour(e.target.value)} style={{ ...iS, padding:"11px 6px" }}>
                    {Array.from({length:12},(_,i)=>String(i+1)).map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <select value={timeMinute} onChange={e => setTimeMinute(e.target.value)} style={{ ...iS, padding:"11px 6px" }}>
                    {["00","15","30","45"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={timePeriod} onChange={e => setTimePeriod(e.target.value)} style={{ ...iS, padding:"11px 6px" }}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <label style={lS}>Default Points Purse (🪙 Coins per team) *</label>
            <div style={{ fontSize:11, color:"#94A3B8", marginBottom:6, marginTop:-8 }}>Starting coin wallet for every team (e.g. 100000 for 1 Lac Coins, or 10000).</div>
            <input type="number" min="1" value={pointsPurse} onChange={e => setPointsPurse(e.target.value)} placeholder="e.g. 100000 (1 Lac Coins)" style={{ ...iS, marginBottom:16 }}/>

            {/* Player Entry Fee & Organizer Payment Information */}
            <div style={{ padding:"16px", background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:12, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:13, color:"#0F172A", marginBottom:4, fontFamily:"var(--font-head)" }}>Player Registration Fee &amp; Payment</div>
              <div style={{ fontSize:11, color:"#64748B", marginBottom:12 }}>Specify how much individual players must pay to register. If free, enter 0.</div>

              <label style={lS}>Player Entry Fee (₹)</label>
              <input type="number" min="0" value={playerEntryFee} onChange={e => setPlayerEntryFee(e.target.value)} placeholder="0 (Free registration)" style={{ ...iS, marginBottom: feeNum > 0 ? 12 : 0 }}/>

              {feeNum > 0 && (
                <div style={{ display:"grid", gap:10, marginTop:10, paddingTop:12, borderTop:"1px solid #F1F5F9" }}>
                  <div>
                    <label style={lS}>Your UPI ID (for receiving player fees) *</label>
                    <input value={organizerUpiId} onChange={e => setOrganizerUpiId(e.target.value)} placeholder="e.g. name@okhdfcbank" style={iS}/>
                  </div>
                  <div>
                    <label style={lS}>Your Google Pay Number *</label>
                    <input type="tel" maxLength={10} value={organizerPaymentPhone} onChange={e => setOrganizerPaymentPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} placeholder="10-digit mobile number" style={iS}/>
                  </div>
                  <div style={{ fontSize:11, color:"#166534", marginTop:2 }}>
                    Players will be instructed to pay ₹{feeNum} to your Google Pay / UPI and attach a payment screenshot before they can register.
                  </div>
                </div>
              )}
            </div>

            {error && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:14 }}>{error}</div>}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep("plan")} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#FFFFFF", fontSize:13, cursor:"pointer" }}>Back</button>
              <button onClick={submitDetails} disabled={busy || !allFilled} style={{ flex:2, padding:"12px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:800, cursor:(busy||!allFilled)?"not-allowed":"pointer", opacity:(busy||!allFilled)?0.5:1, fontFamily:"var(--font-head)" }}>{busy ? "Creating..." : (plan.price === 0 ? "Create Auction" : "Continue to Payment")}</button>
            </div>
          </>
          )
        })()}

        {step === "roster" && createdAuction && (() => {
          const q = rosterSearch.trim().toLowerCase()
          const filteredPlayers = rosterPlayers.filter(p => !q || p.name.toLowerCase().includes(q) || (p.phone||"").includes(q))
          const toggleTeam = id => {
            const next = new Set(selectedTeamIds)
            if (next.has(id)) next.delete(id)
            else { if (next.size >= plan.maxTeams) { alert(`Your ${plan.label} plan allows up to ${plan.maxTeams} teams.`); return } next.add(id) }
            setSelectedTeamIds(next)
          }
          const togglePlayer = id => {
            const next = new Set(selectedPlayerIds)
            next.has(id) ? next.delete(id) : next.add(id)
            setSelectedPlayerIds(next)
          }
          return (
            <>
              <div style={{ padding:"10px 12px", background:"rgba(34,197,94,0.08)", borderRadius:9, marginBottom:16, fontSize:12, color:"#166534" }}>
                Optional — pick teams and players already on Selected Sports to add them straight into this auction's pool. Skip this if you'd rather add them later or let players self-register via your link.
              </div>
              {loadingRoster ? <div style={{ textAlign:"center", padding:"24px", color:"#94A3B8", fontSize:13 }}>Loading your roster...</div> : (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>Teams</div>
                    <span style={{ fontSize:11, color:"#166534", fontWeight:700, background:"rgba(34,197,94,0.1)", padding:"3px 9px", borderRadius:999 }}>{selectedTeamIds.size} / {plan.maxTeams} selected</span>
                  </div>
                  {rosterTeams.length === 0 ? (
                    <div style={{ fontSize:12, color:"#94A3B8", marginBottom:16 }}>No teams on your roster yet.</div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:18, maxHeight:180, overflowY:"auto" }}>
                      {rosterTeams.map(t => (
                        <button key={t.id} type="button" onClick={()=>toggleTeam(t.id)} style={{ padding:"10px 6px", borderRadius:10, border:selectedTeamIds.has(t.id)?"2px solid #166534":"1.5px solid #E2E8F0", background:selectedTeamIds.has(t.id)?"rgba(34,197,94,0.08)":"#FFFFFF", cursor:"pointer", textAlign:"center" }}>
                          <Av name={t.name} id={t.id} sz={32}/>
                          <div style={{ fontSize:10, fontWeight:700, color:"#0F172A", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>Players</div>
                    <span style={{ fontSize:11, color:"#166534", fontWeight:700, background:"rgba(34,197,94,0.1)", padding:"3px 9px", borderRadius:999 }}>{selectedPlayerIds.size} selected</span>
                  </div>
                  <input value={rosterSearch} onChange={e=>setRosterSearch(e.target.value)} placeholder="Search players by name or phone..." style={{ ...iS, marginBottom:10 }}/>
                  {filteredPlayers.length === 0 ? (
                    <div style={{ fontSize:12, color:"#94A3B8", marginBottom:16 }}>No players found.</div>
                  ) : (
                    <div style={{ display:"grid", gap:6, maxHeight:220, overflowY:"auto", marginBottom:16 }}>
                      {filteredPlayers.map(p => (
                        <label key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:9, border:selectedPlayerIds.has(p.id)?"1.5px solid #166534":"1px solid #E2E8F0", background:selectedPlayerIds.has(p.id)?"rgba(34,197,94,0.06)":"#FFFFFF", cursor:"pointer" }}>
                          <input type="checkbox" checked={selectedPlayerIds.has(p.id)} onChange={()=>togglePlayer(p.id)} style={{ flexShrink:0 }}/>
                          <Av name={p.name} id={p.id} sz={28}/>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:"#0F172A" }}>{p.name}</div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>{p.phone}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={skipRoster} disabled={busy} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#FFFFFF", fontSize:13, cursor:"pointer", fontWeight:700 }}>Skip for now</button>
                <button onClick={proceedAfterRoster} disabled={busy} style={{ flex:2, padding:"12px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)" }}>{busy ? "Adding..." : `Continue${selectedTeamIds.size+selectedPlayerIds.size > 0 ? ` (${selectedTeamIds.size+selectedPlayerIds.size} added)` : ""}`}</button>
              </div>
            </>
          )
        })()}

        {step === "payment" && createdAuction && (
          <>
            <div style={{ textAlign:"center", padding:"14px 16px", background:"rgba(246,196,83,0.12)", borderRadius:12, marginBottom:16, border:"1px solid rgba(246,196,83,0.3)" }}>
              <div style={{ fontSize:11, color:"#7A4F13", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px" }}>Amount Due</div>
              <div style={{ fontSize:30, fontWeight:900, color:"#B8860B", fontFamily:"var(--font-head)", margin:"3px 0" }}>₹{plan.price.toLocaleString("en-IN")}</div>
              <div style={{ fontSize:11, color:"#7A4F13", fontWeight:600 }}>{createdAuction.name} · {plan.label} (up to {plan.maxTeams} teams)</div>
            </div>

            <div style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#0F172A", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                <span>💳</span> Admin Payment Details
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:"#F8FAF8", borderRadius:8, border:"1px solid #E2E8F0", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:10, color:"#64748B", fontWeight:700, textTransform:"uppercase" }}>Google Pay</div>
                  <div style={{ fontSize:14, fontWeight:800, color:"#0F172A", letterSpacing:"0.5px" }}>{ADMIN_PHONE}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(ADMIN_PHONE, "phone")}
                  style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #166534", background: copiedField==="phone" ? "#166534" : "rgba(34,197,94,0.08)", color: copiedField==="phone" ? "#FFFFFF" : "#166534", fontSize:11, fontWeight:700, cursor:"pointer" }}
                >
                  {copiedField === "phone" ? "✓ Copied" : "Copy"}
                </button>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:"#F8FAF8", borderRadius:8, border:"1px solid #E2E8F0", marginBottom:10 }}>
                <div style={{ minWidth:0, flex:1, marginRight:8 }}>
                  <div style={{ fontSize:10, color:"#64748B", fontWeight:700, textTransform:"uppercase" }}>Admin UPI ID</div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{adminUpi}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(adminUpi, "upi")}
                  style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #166534", background: copiedField==="upi" ? "#166534" : "rgba(34,197,94,0.08)", color: copiedField==="upi" ? "#FFFFFF" : "#166534", fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0 }}
                >
                  {copiedField === "upi" ? "✓ Copied" : "Copy"}
                </button>
              </div>

              <div style={{ display:"grid", gap:8 }}>
                <a
                  href={`tez://upi/pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent("Selected Sports Admin")}&am=${plan.price}&cu=INR&tn=${encodeURIComponent("Auction plan - " + (createdAuction?.name || name))}`}
                  onClick={() => copyText(ADMIN_PHONE, "phone")}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"11px", borderRadius:8, background:"#1A73E8", color:"#FFFFFF", fontSize:13, fontWeight:800, textDecoration:"none", boxSizing:"border-box", boxShadow:"0 2px 8px rgba(26,115,232,0.25)" }}
                >
                  <span>📱</span> Pay ₹{plan.price.toLocaleString("en-IN")} with Google Pay
                </a>
                <a
                  href={`upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent("Selected Sports Admin")}&am=${plan.price}&cu=INR&tn=${encodeURIComponent("Auction plan - " + (createdAuction?.name || name))}`}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"10px", borderRadius:8, background:"#166534", color:"#FFFFFF", fontSize:12, fontWeight:700, textDecoration:"none", boxSizing:"border-box" }}
                >
                  <span>⚡</span> Pay via Any UPI App
                </a>
              </div>
            </div>

            <div style={{ background:"rgba(34,197,94,0.06)", border:"1.5px solid rgba(34,197,94,0.3)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:800, color:"#166534", marginBottom:6 }}>
                📋 Next Steps to Activate:
              </div>
              <div style={{ fontSize:12, color:"#334155", lineHeight:1.5, display:"flex", flexDirection:"column", gap:6 }}>
                <div><strong>1.</strong> Make payment of <strong>₹{plan.price.toLocaleString("en-IN")}</strong> via Google Pay or UPI above.</div>
                <div><strong>2.</strong> Send your payment screenshot on WhatsApp to <strong>{ADMIN_PHONE}</strong>.</div>
                <div><strong>3.</strong> Once confirmed by the admin, you will be able to access the auction platform.</div>
              </div>

              <a
                href={`https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(`Hi Admin, I have made the payment of ₹${plan.price.toLocaleString("en-IN")} for my auction "${createdAuction?.name || name}". Please find my payment screenshot attached. Kindly confirm and activate my auction access.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"11px", borderRadius:8, background:"#25D366", color:"#FFFFFF", fontSize:13, fontWeight:800, textDecoration:"none", marginTop:10, boxSizing:"border-box", boxShadow:"0 2px 8px rgba(37,211,102,0.25)" }}
              >
                <span>💬</span> Send Screenshot on WhatsApp ({ADMIN_PHONE})
              </a>
            </div>

            {!paidClicked ? (
              <button
                onClick={markPaid}
                disabled={busy}
                style={{ width:"100%", padding:"13px", borderRadius:10, border:"1.5px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:13, fontWeight:800, cursor:busy?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}
              >
                {busy ? "Notifying..." : "I've Paid — Notify Admin"}
              </button>
            ) : (
              <div style={{ textAlign:"center", padding:"14px", background:"#F8FAF8", borderRadius:12, border:"1px solid #E2E8F0" }}>
                <div style={{ fontSize:28, marginBottom:6 }}>✅</div>
                <div style={{ fontWeight:800, fontSize:15, color:"#0F172A", fontFamily:"var(--font-head)" }}>Payment Notified!</div>
                <div style={{ fontSize:12, color:"#64748B", marginTop:4, marginBottom:10 }}>
                  Admin has been alerted. Please also send your screenshot on WhatsApp to <strong>{ADMIN_PHONE}</strong> for fast confirmation.
                </div>
                <a
                  href={`https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(`Hi Admin, I have made the payment of ₹${plan.price.toLocaleString("en-IN")} for my auction "${createdAuction?.name || name}". Please find my payment screenshot attached. Kindly confirm and activate my auction access.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 16px", borderRadius:8, background:"#25D366", color:"#FFFFFF", fontSize:12, fontWeight:700, textDecoration:"none", marginBottom:12 }}
                >
                  <span>💬</span> Open WhatsApp ({ADMIN_PHONE})
                </a>
                <AuctionLinks auction={createdAuction}/>
                <button onClick={() => { onCreated?.(createdAuction); onClose() }} style={{ marginTop:12, width:"100%", padding:"12px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>Done</button>
              </div>
            )}
          </>
        )}

        {step === "done" && createdAuction && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🎉</div>
            <div style={{ fontWeight:800, fontSize:16, color:"#0F172A", fontFamily:"var(--font-head)" }}>{createdAuction.name} is ready!</div>
            <div style={{ fontSize:13, color:"#64748B", marginTop:6, marginBottom:18 }}>Add teams and players to get started.</div>
            <AuctionLinks auction={createdAuction}/>
            <button onClick={() => { onCreated?.(createdAuction); onClose() }} style={{ marginTop:16, width:"100%", padding:"13px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:"var(--font-head)" }}>Go to Auction</button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AuctionPaymentModal({ auction, isMobile, onClose, onPaid }) {
  const [platformUpi, setPlatformUpi] = useState("")
  const [copiedField, setCopiedField] = useState("")
  const [paidClicked, setPaidClicked] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetchPlatformUpi().then(setPlatformUpi).catch(() => {})
  }, [])

  const plan = AUCTION_PLANS.find(p => p.id === auction?.plan_tier) || {
    price: auction?.amount_due || 0,
    label: auction?.plan_tier || "Auction Plan",
    maxTeams: auction?.max_teams || 6
  }
  const amount = auction?.amount_due !== undefined ? Number(auction.amount_due) : plan.price
  const adminUpi = platformUpi || ADMIN_UPI || "9897439743@okbizaxis"

  const copyText = (txt, field) => {
    navigator.clipboard?.writeText(txt)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  const handleMarkPaid = async () => {
    setBusy(true)
    try {
      if (auction?.id) {
        await markAuctionPaidByOrganizer(auction.id)
      }
      setPaidClicked(true)
      onPaid?.()
    } catch (e) {
      alert(e.message)
    }
    setBusy(false)
  }

  const whatsappMsg = `Hi Admin, I have made the payment of ₹${amount.toLocaleString("en-IN")} for my auction "${auction?.name || "Cricket Auction"}". Please find my payment screenshot attached. Kindly confirm and activate my auction access.`
  const whatsappUrl = `https://wa.me/91${ADMIN_PHONE}?text=${encodeURIComponent(whatsappMsg)}`
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent("Selected Sports Admin")}&am=${amount}&cu=INR&tn=${encodeURIComponent("Auction plan - " + (auction?.name || "Cricket Auction"))}`

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#FFFFFF", borderRadius:18, padding: isMobile ? "20px 16px" : "24px 22px", width:440, maxWidth:"100%", maxHeight:"92vh", overflowY:"auto", boxSizing:"border-box", boxShadow:"0 12px 40px rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontWeight:900, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)" }}>Complete Payment</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:24, cursor:"pointer", color:"#94A3B8", lineHeight:1, padding:4 }}>×</button>
        </div>

        <div style={{ textAlign:"center", padding:"14px 16px", background:"rgba(246,196,83,0.12)", borderRadius:12, marginBottom:16, border:"1px solid rgba(246,196,83,0.3)" }}>
          <div style={{ fontSize:11, color:"#7A4F13", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px" }}>Amount Due</div>
          <div style={{ fontSize:32, fontWeight:900, color:"#B8860B", fontFamily:"var(--font-head)", margin:"3px 0" }}>₹{amount.toLocaleString("en-IN")}</div>
          <div style={{ fontSize:12, color:"#7A4F13", fontWeight:600 }}>{auction?.name} {plan.label ? `· ${plan.label}` : ""}</div>
        </div>

        <div style={{ background:"#FFFFFF", border:"1.5px solid #E2E8F0", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:800, color:"#0F172A", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <span>💳</span> Admin Payment Details
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:"#F8FAF8", borderRadius:8, border:"1px solid #E2E8F0", marginBottom:8 }}>
            <div>
              <div style={{ fontSize:10, color:"#64748B", fontWeight:700, textTransform:"uppercase" }}>Google Pay</div>
              <div style={{ fontSize:14, fontWeight:800, color:"#0F172A", letterSpacing:"0.5px" }}>{ADMIN_PHONE}</div>
            </div>
            <button
              type="button"
              onClick={() => copyText(ADMIN_PHONE, "phone")}
              style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #166534", background: copiedField==="phone" ? "#166534" : "rgba(34,197,94,0.08)", color: copiedField==="phone" ? "#FFFFFF" : "#166534", fontSize:11, fontWeight:700, cursor:"pointer" }}
            >
              {copiedField === "phone" ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 12px", background:"#F8FAF8", borderRadius:8, border:"1px solid #E2E8F0", marginBottom:10 }}>
            <div style={{ minWidth:0, flex:1, marginRight:8 }}>
              <div style={{ fontSize:10, color:"#64748B", fontWeight:700, textTransform:"uppercase" }}>Admin UPI ID</div>
              <div style={{ fontSize:13, fontWeight:800, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{adminUpi}</div>
            </div>
            <button
              type="button"
              onClick={() => copyText(adminUpi, "upi")}
              style={{ padding:"5px 12px", borderRadius:7, border:"1px solid #166534", background: copiedField==="upi" ? "#166534" : "rgba(34,197,94,0.08)", color: copiedField==="upi" ? "#FFFFFF" : "#166534", fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0 }}
            >
              {copiedField === "upi" ? "✓ Copied" : "Copy"}
            </button>
          </div>

          <div style={{ display:"grid", gap:8 }}>
            <a
              href={`tez://upi/pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent("Selected Sports Admin")}&am=${amount}&cu=INR&tn=${encodeURIComponent("Auction plan - " + (auction?.name || "Cricket Auction"))}`}
              onClick={() => copyText(ADMIN_PHONE, "phone")}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"11px", borderRadius:8, background:"#1A73E8", color:"#FFFFFF", fontSize:13, fontWeight:800, textDecoration:"none", boxSizing:"border-box", boxShadow:"0 2px 8px rgba(26,115,232,0.25)" }}
            >
              <span>📱</span> Pay ₹{amount.toLocaleString("en-IN")} with Google Pay
            </a>
            <a
              href={upiDeepLink}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"10px", borderRadius:8, background:"#166534", color:"#FFFFFF", fontSize:12, fontWeight:700, textDecoration:"none", boxSizing:"border-box" }}
            >
              <span>⚡</span> Pay via Any UPI App
            </a>
          </div>
        </div>

        <div style={{ background:"rgba(34,197,94,0.06)", border:"1.5px solid rgba(34,197,94,0.3)", borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:800, color:"#166534", marginBottom:6 }}>
            📋 Next Steps to Activate:
          </div>
          <div style={{ fontSize:12, color:"#334155", lineHeight:1.5, display:"flex", flexDirection:"column", gap:6 }}>
            <div><strong>1.</strong> Make payment of <strong>₹{amount.toLocaleString("en-IN")}</strong> via Google Pay or UPI above.</div>
            <div><strong>2.</strong> Send your payment screenshot on WhatsApp to <strong>{ADMIN_PHONE}</strong>.</div>
            <div><strong>3.</strong> Once confirmed by the admin, you will be able to access the auction platform.</div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"11px", borderRadius:8, background:"#25D366", color:"#FFFFFF", fontSize:13, fontWeight:800, textDecoration:"none", marginTop:10, boxSizing:"border-box", boxShadow:"0 2px 8px rgba(37,211,102,0.25)" }}
          >
            <span>💬</span> Send Screenshot on WhatsApp ({ADMIN_PHONE})
          </a>
        </div>

        {!paidClicked ? (
          <button
            onClick={handleMarkPaid}
            disabled={busy}
            style={{ width:"100%", padding:"13px", borderRadius:10, border:"1.5px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:13, fontWeight:800, cursor:busy?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}
          >
            {busy ? "Notifying..." : "I've Paid — Notify Admin"}
          </button>
        ) : (
          <div style={{ textAlign:"center", padding:"14px", background:"#F8FAF8", borderRadius:12, border:"1px solid #E2E8F0" }}>
            <div style={{ fontSize:28, marginBottom:6 }}>✅</div>
            <div style={{ fontWeight:800, fontSize:15, color:"#0F172A", fontFamily:"var(--font-head)" }}>Payment Notified!</div>
            <div style={{ fontSize:12, color:"#64748B", marginTop:4, marginBottom:10 }}>
              Admin has been alerted. Please also send your screenshot on WhatsApp to <strong>{ADMIN_PHONE}</strong> for fast confirmation.
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px 16px", borderRadius:8, background:"#25D366", color:"#FFFFFF", fontSize:12, fontWeight:700, textDecoration:"none", marginBottom:12 }}
            >
              <span>💬</span> Open WhatsApp ({ADMIN_PHONE})
            </a>
            {auction && <AuctionLinks auction={auction}/>}
            <button onClick={onClose} style={{ marginTop:12, width:"100%", padding:"12px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:700, cursor:"pointer" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
