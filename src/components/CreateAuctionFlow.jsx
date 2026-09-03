import { useState, useEffect } from "react"
import { AUCTION_PLANS } from "../constants.js"
import { createAuction, fetchPlatformUpi, markAuctionPaidByOrganizer, fetchTeams, fetchPlayers, createAuctionTeam, addRosterPlayerToAuction } from "../db.js"
import { Av } from "./ui.jsx"

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
  const [location, setLocation] = useState("")
  const [auctionDate, setAuctionDate] = useState("")
  const [auctionTime, setAuctionTime] = useState("")
  const [pointsPurse, setPointsPurse] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [platformUpi, setPlatformUpi] = useState("")
  const [createdAuction, setCreatedAuction] = useState(null)
  const [paidClicked, setPaidClicked] = useState(false)
  const [rosterTeams, setRosterTeams] = useState([])
  const [rosterPlayers, setRosterPlayers] = useState([])
  const [selectedTeamIds, setSelectedTeamIds] = useState(new Set())
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set())
  const [rosterSearch, setRosterSearch] = useState("")
  const [loadingRoster, setLoadingRoster] = useState(false)

  const plan = AUCTION_PLANS.find(p => p.id === planId) || AUCTION_PLANS[0]

  useEffect(() => { fetchPlatformUpi().then(setPlatformUpi).catch(() => {}) }, [])

  const goDetails = () => setStep("details")

  const submitDetails = async () => {
    setError("")
    if (!name.trim()) { setError("Please enter a name for this auction."); return }
    setBusy(true)
    try {
      const auction = await createAuction({
        name: name.trim(), organizerId, location: location.trim(),
        auctionDate: auctionDate || null, auctionTime: auctionTime || null,
        planTier: plan.id, maxTeams: plan.maxTeams,
        pointsPurse: pointsPurse ? Number(pointsPurse) : null,
        amountDue: plan.price
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

        {step === "details" && (
          <>
            <div style={{ padding:"10px 12px", background:"rgba(34,197,94,0.08)", borderRadius:9, marginBottom:16, fontSize:12, color:"#166534", fontWeight:600 }}>
              {plan.label} · Up to {plan.maxTeams} teams · {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
            </div>
            <label style={lS}>Auction Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunday Premier League Auction" style={{ ...iS, marginBottom:14 }}/>
            <label style={lS}>Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Amritsar" style={{ ...iS, marginBottom:14 }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <div>
                <label style={lS}>Date</label>
                <input type="date" value={auctionDate} onChange={e => setAuctionDate(e.target.value)} style={iS}/>
              </div>
              <div>
                <label style={lS}>Time</label>
                <input type="time" value={auctionTime} onChange={e => setAuctionTime(e.target.value)} style={iS}/>
              </div>
            </div>
            <label style={lS}>Default Points Purse (per team)</label>
            <input type="number" min="0" value={pointsPurse} onChange={e => setPointsPurse(e.target.value)} placeholder="e.g. 10000" style={{ ...iS, marginBottom:16 }}/>
            {error && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:14 }}>{error}</div>}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep("plan")} style={{ flex:1, padding:"12px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#FFFFFF", fontSize:13, cursor:"pointer" }}>Back</button>
              <button onClick={submitDetails} disabled={busy} style={{ flex:2, padding:"12px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:13, fontWeight:800, cursor:busy?"not-allowed":"pointer", fontFamily:"var(--font-head)" }}>{busy ? "Creating..." : (plan.price === 0 ? "Create Auction" : "Continue to Payment")}</button>
            </div>
          </>
        )}

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
            <div style={{ textAlign:"center", padding:"18px", background:"rgba(246,196,83,0.12)", borderRadius:12, marginBottom:18 }}>
              <div style={{ fontSize:12, color:"#7A4F13", fontWeight:600 }}>Amount Due</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#B8860B", fontFamily:"var(--font-head)" }}>₹{plan.price.toLocaleString("en-IN")}</div>
            </div>
            {platformUpi ? (
              <a href={`upi://pay?pa=${encodeURIComponent(platformUpi)}&pn=${encodeURIComponent("Selected Sports")}&am=${plan.price}&cu=INR&tn=${encodeURIComponent("Auction plan - " + name)}`} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:10, background:"#166534", color:"#FFFFFF", fontSize:14, fontWeight:800, fontFamily:"var(--font-head)", textDecoration:"none", marginBottom:14 }}>
                Pay ₹{plan.price.toLocaleString("en-IN")} via UPI
              </a>
            ) : (
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:14, textAlign:"center" }}>Payment link not set up yet — contact the platform admin directly to pay.</div>
            )}
            {!paidClicked ? (
              <button onClick={markPaid} disabled={busy} style={{ width:"100%", padding:"13px", borderRadius:10, border:"1.5px solid #166534", background:"#FFFFFF", color:"#166534", fontSize:13, fontWeight:700, cursor:busy?"not-allowed":"pointer" }}>{busy ? "..." : "I've Paid — Notify Admin"}</button>
            ) : (
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
                <div style={{ fontWeight:800, fontSize:15, color:"#0F172A", fontFamily:"var(--font-head)" }}>Payment noted!</div>
                <div style={{ fontSize:12, color:"#64748B", marginTop:6 }}>The admin will verify and activate your auction shortly. You'll be able to set up teams and players once it's confirmed.</div>
                <AuctionLinks auction={createdAuction}/>
                <button onClick={() => { onCreated?.(createdAuction); onClose() }} style={{ marginTop:16, width:"100%", padding:"12px", borderRadius:9, background:"#F8FAF8", border:"1px solid #E2E8F0", color:"#0F172A", fontSize:13, fontWeight:700, cursor:"pointer" }}>Done</button>
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
