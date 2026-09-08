import { useState, useEffect } from "react"
import { Card, Spinner, Av } from "./ui.jsx"
import { fetchAuctionState, fetchAuctionBidHistory, startAuction, placeBid, undoLastBid, markPlayerSold, markPlayerUnsold, jumpToAuctionPlayer, fetchAuctionSponsors } from "../db.js"
import { Trophy, Users, Wallet, RotateCcw, XCircle, CheckCircle2, ChevronRight, Zap, Gavel } from "lucide-react"
import { DEFAULT_SQUAD_TARGET, MIN_PLAYER_RESERVE, calculateMaxBid, formatCoins } from "../constants.js"

export default function AuctionLiveConsole({ isMobile, auctionPlayers, auctionTeams, onPoolChange, auctionId, auctionDate }) {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [increment, setIncrement] = useState("100")
  const [bidHistory, setBidHistory] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [jumpTo, setJumpTo] = useState("")
  const [bidStep, setBidStep] = useState(1000)
  const [manualTeamId, setManualTeamId] = useState("")
  const [manualAmount, setManualAmount] = useState("")
  const [banner, setBanner] = useState(null) // { type: "sold" | "unsold", playerName, teamName, price }

  const load = async () => {
    try {
      const s = await fetchAuctionState(auctionId)
      setState(s)
      if (s.current_player_id) setBidHistory(await fetchAuctionBidHistory(s.current_player_id, auctionId))
      else setBidHistory([])
      if (auctionId) {
        fetchAuctionSponsors(auctionId).then(setSponsors).catch(()=>{})
      }
    } catch(e) { alert(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [auctionId])

  const registeredCount = auctionPlayers.filter(p => p.status === "registered" && !p.is_captain && p.status !== "captain").length
  const soldCount = auctionPlayers.filter(p => p.status === "sold").length
  const unsoldCount = auctionPlayers.filter(p => p.status === "unsold").length
  const currentPlayer = state?.current_player_id ? auctionPlayers.find(p => p.id === state.current_player_id) : null
  const leadingTeam = state?.current_team_id ? auctionTeams.find(t => t.id === state.current_team_id) : null

  const doStart = async () => {
    const inc = Number(increment)
    if (!inc || inc <= 0) { alert("Enter a valid bid increment in Coins"); return }
    if (auctionTeams.length < 2) { alert("Add at least 2 teams before starting the auction"); return }
    setBusy(true)
    try { await startAuction(inc, auctionId); await onPoolChange(); await load() } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const doBid = async (teamId) => {
    const nextAmount = (state.current_bid || 0) + bidStep
    setBusy(true)
    try { await placeBid(state.current_player_id, teamId, nextAmount, auctionId); await load() } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const doManualBid = async () => {
    const amount = Number(manualAmount)
    if (!manualTeamId) { alert("Select a team first"); return }
    if (!amount || amount <= 0) { alert("Enter a valid bid amount in Coins"); return }
    if (amount <= (state.current_bid || 0)) { alert(`Bid must be higher than current 🪙 ${(state.current_bid || 0).toLocaleString("en-IN")}`); return }
    
    const team = auctionTeams.find(t => t.id === manualTeamId)
    if (!team) return

    const squadCount = auctionPlayers.filter(p => p.sold_team_id === team.id).length
    if (squadCount >= DEFAULT_SQUAD_TARGET) {
      alert(`${team.name} already has reached the squad limit of ${DEFAULT_SQUAD_TARGET} players!`)
      return
    }

    const maxBidAllowed = calculateMaxBid(team.purse_remaining, squadCount, DEFAULT_SQUAD_TARGET, MIN_PLAYER_RESERVE)
    if (amount > maxBidAllowed) {
      const remainingSlots = Math.max(0, DEFAULT_SQUAD_TARGET - squadCount)
      const slotsAfter = Math.max(0, remainingSlots - 1)
      const reserveNeeded = slotsAfter * MIN_PLAYER_RESERVE
      alert(
        `Cannot place bid of 🪙 ${amount.toLocaleString("en-IN")}.\n\n` +
        `${team.name} has ${squadCount} players (${remainingSlots} slots needed for squad target of ${DEFAULT_SQUAD_TARGET}).\n` +
        `A purse reserve of 🪙 ${reserveNeeded.toLocaleString("en-IN")} (🪙 ${MIN_PLAYER_RESERVE} × ${slotsAfter} future player${slotsAfter > 1 ? "s" : ""}) must be retained.\n\n` +
        `Remaining Purse: 🪙 ${team.purse_remaining.toLocaleString("en-IN")}\n` +
        `Maximum Bid Allowed: 🪙 ${maxBidAllowed.toLocaleString("en-IN")}`
      )
      return
    }

    setBusy(true)
    try { await placeBid(state.current_player_id, manualTeamId, amount, auctionId); setManualAmount(""); await load() } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const doUndo = async () => {
    setBusy(true)
    try { await undoLastBid(state.current_player_id, auctionId); await load() } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const doSold = async () => {
    if (!leadingTeam) { alert("No bids yet — mark Unsold instead, or wait for a bid."); return }
    if (!window.confirm(`Sell ${currentPlayer.name} to ${leadingTeam.name} for 🪙 ${(state.current_bid || 0).toLocaleString("en-IN")} Coins?`)) return
    const pName = currentPlayer.name
    const tName = leadingTeam.name
    const finalBid = state.current_bid
    setBusy(true)
    try {
      await markPlayerSold(state.current_player_id, leadingTeam.id, state.current_bid, auctionId)
      setBanner({ type: "sold", playerName: pName, teamName: tName, price: finalBid })
      setTimeout(() => setBanner(b => (b?.playerName === pName ? null : b)), 7000)
      await onPoolChange()
      await load()
    } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const doUnsold = async () => {
    if (!window.confirm(`Mark ${currentPlayer.name} as unsold?`)) return
    const pName = currentPlayer.name
    setBusy(true)
    try {
      await markPlayerUnsold(state.current_player_id, auctionId)
      setBanner({ type: "unsold", playerName: pName })
      setTimeout(() => setBanner(b => (b?.playerName === pName ? null : b)), 7000)
      await onPoolChange()
      await load()
    } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const doJump = async () => {
    if (!jumpTo) return
    setBusy(true)
    try { await jumpToAuctionPlayer(jumpTo, auctionId); setJumpTo(""); await load() } catch(e) { alert(e.message) }
    setBusy(false)
  }

  if (loading) return <Spinner/>

  if (!state || state.status === "setup") {
    const todayStr = new Date().toISOString().split("T")[0]
    const tooEarly = auctionDate && todayStr < auctionDate
    return (
      <Card style={{ padding:"28px 20px" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:"rgba(34,197,94,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}><Gavel size={22} color="#166534"/></div>
        <div style={{ fontWeight:800, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)", marginBottom:6 }}>Start the Live Auction</div>
        <div style={{ fontSize:13, color:"#64748B", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Users size={13}/> {registeredCount} auction players ready</span>
          <span>·</span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Trophy size={13}/> {auctionTeams.length} teams ready</span>
        </div>
        {tooEarly && <div style={{ padding:"10px 12px", background:"rgba(184,134,11,0.08)", borderRadius:9, color:"#B8860B", fontSize:12, marginBottom:14 }}>This auction is scheduled for {new Date(auctionDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} — it can't be started before then.</div>}
        {auctionTeams.length < 2 && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:14 }}>Add at least 2 teams (in the Teams tab) before starting.</div>}
        <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Bid Increment (🪙 Coins)</div>
        <input type="number" min="1" value={increment} onChange={e=>setIncrement(e.target.value)} style={{ width:"100%", padding:"11px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", background:"#fafafa", boxSizing:"border-box", marginBottom:16 }}/>
        <button onClick={doStart} disabled={busy || auctionTeams.length < 2 || tooEarly} style={{ width:"100%", padding:"14px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, fontWeight:800, cursor:(busy||auctionTeams.length<2||tooEarly)?"not-allowed":"pointer", opacity:(busy||auctionTeams.length<2||tooEarly)?0.5:1, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Zap size={15}/> {busy ? "Starting..." : "Start Auction"}</button>
      </Card>
    )
  }

  if (state.status === "completed") {
    return (
      <div>
        <Card style={{ padding:"24px 20px", textAlign:"center", marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"rgba(184,134,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}><Trophy size={26} color="#B8860B"/></div>
          <div style={{ fontWeight:800, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)" }}>Auction Complete</div>
          <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>{soldCount} sold · {unsoldCount} unsold</div>
        </Card>
        {auctionTeams.map(t => {
          const squad = auctionPlayers
            .filter(p => p.sold_team_id === t.id)
            .sort((a,b) => (b.is_captain || b.status === "captain" ? 1 : 0) - (a.is_captain || a.status === "captain" ? 1 : 0))
          return (
            <Card key={t.id} style={{ padding:"14px 16px", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{t.name} ({squad.length}/9)</div>
                <div style={{ fontSize:12, color:"#94A3B8", display:"flex", alignItems:"center", gap:4 }}><Wallet size={11}/> 🪙 {Number(t.purse_remaining||0).toLocaleString("en-IN")} left of 🪙 {Number(t.purse_total||0).toLocaleString("en-IN")}</div>
              </div>
              {squad.length === 0 ? <div style={{ fontSize:12, color:"#94A3B8" }}>No players in squad.</div> : squad.map(p => {
                const isCap = p.is_captain || p.status === "captain"
                return (
                  <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:"6px 0", color:"#0F172A" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <Av name={p.name} id={p.id} sz={22}/> {p.name} {isCap && <span style={{ fontSize:9, fontWeight:800, background:"#B8860B", color:"#FFFFFF", padding:"1px 6px", borderRadius:4 }}>👑 CAPTAIN</span>}
                    </span>
                    <span style={{ fontWeight:700, color:isCap?"#B8860B":"#166534" }}>{isCap ? "🪙 0 (Captain)" : `🪙 ${Number(p.sold_price||0).toLocaleString("en-IN")}`}</span>
                  </div>
                )
              })}
            </Card>
          )
        })}
      </div>
    )
  }

  // status === "live"
  return (
    <div>
      {/* Official Tournament Sponsors */}
      {sponsors.length > 0 && (
        <div style={{
          background: "#FFFFFF",
          borderRadius: 14,
          border: "1.5px solid #E2E8F0",
          padding: "12px 14px",
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#B8860B",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 5
          }}>
            <span>⭐</span> OFFICIAL TOURNAMENT SPONSORS
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {sponsors.map(s => (
              <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 95 }}>
                {s.logo_url ? (
                  <img
                    src={s.logo_url}
                    alt={s.name}
                    style={{
                      width: 90,
                      height: 65,
                      borderRadius: 10,
                      objectFit: "contain",
                      border: "1px solid #E2E8F0",
                      background: "#FFFFFF",
                      padding: 4
                    }}
                  />
                ) : (
                  <div style={{
                    width: 90,
                    height: 65,
                    borderRadius: 10,
                    background: "rgba(184,134,11,0.1)",
                    border: "1px solid rgba(184,134,11,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 24 }}>🏆</span>
                  </div>
                )}
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#0F172A",
                  marginTop: 6,
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%"
                }}>
                  {s.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sold / Unsold Hammer Notification Banner */}
      {banner && (
        <div style={{
          marginBottom: 16,
          padding: "16px 18px",
          borderRadius: 14,
          background: banner.type === "sold" ? "linear-gradient(135deg, #15803D, #166534)" : "linear-gradient(135deg, #DC2626, #991B1B)",
          color: "#FFFFFF",
          boxShadow: banner.type === "sold" ? "0 8px 24px rgba(22,101,52,0.35)" : "0 8px 24px rgba(220,38,38,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
            <span style={{ fontSize: 34, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}>🔨</span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "1.2px",
                textTransform: "uppercase",
                color: banner.type === "sold" ? "#86EFAC" : "#FECACA"
              }}>
                {banner.type === "sold" ? "SOLD!" : "UNSOLD"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "var(--font-head)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {banner.type === "sold" ? (
                  <span>{banner.playerName} → <strong style={{ color: "#FEF08A" }}>{banner.teamName}</strong> for <strong style={{ color: "#FEF08A" }}>🪙 {Number(banner.price||0).toLocaleString("en-IN")}</strong></span>
                ) : (
                  <span>{banner.playerName} was marked Unsold</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setBanner(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</button>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#64748B", marginBottom:14 }}>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}><Users size={13}/> {registeredCount} left in pool</span>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}><CheckCircle2 size={13} color="#166534"/> {soldCount} sold · <XCircle size={13} color="#EF4444"/> {unsoldCount} unsold</span>
      </div>

      {!currentPlayer ? (
        <Card style={{ padding:"24px 16px", textAlign:"center" }}>
          <div style={{ fontSize:14, color:"#64748B" }}>No player on the block. Use "Jump to player" below to pick one.</div>
        </Card>
      ) : (
        <Card style={{ padding:"18px 16px", marginBottom:14, border:"2px solid #166534" }}>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:6 }}>
            <span style={{ background:"rgba(34,197,94,0.12)", color:"#166534", borderRadius:999, padding:"4px 10px", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", gap:4, flexShrink:0 }}><Gavel size={11}/> On the block</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:14 }}>
            {currentPlayer.profile_image_url ? (
              <img src={currentPlayer.profile_image_url} alt={currentPlayer.name} style={{ width:220, height:250, borderRadius:16, objectFit:"cover", border:"3px solid #166534", marginBottom:10, boxShadow:"0 6px 20px rgba(0,0,0,0.08)" }}/>
            ) : (
              <div style={{ width:220, height:250, borderRadius:16, background:"#F1F5F9", border:"3px solid #166534", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
                <div style={{ fontSize:52, fontWeight:800, color:"#166534", fontFamily:"var(--font-head)" }}>{(currentPlayer.name||"?")[0]}</div>
                {currentPlayer.jersey_number && <div style={{ fontSize:15, fontWeight:700, color:"#64748B", marginTop:6 }}>#{currentPlayer.jersey_number}</div>}
              </div>
            )}
            <div style={{ fontWeight:900, fontSize:18, color:"#0F172A", fontFamily:"var(--font-head)", marginTop:8 }}>{currentPlayer.name}</div>
            <div style={{ fontSize:13, color:"#94A3B8", marginTop:2 }}>{currentPlayer.city ? `${currentPlayer.city} · ` : ""}{currentPlayer.playing_role || "—"} · Base 🪙 {Number(currentPlayer.base_price || 0).toLocaleString("en-IN")}</div>
          </div>
          <div style={{ textAlign:"center", padding:"16px", background:"rgba(34,197,94,0.08)", borderRadius:12, marginBottom:14 }}>
            <div style={{ fontSize:30, fontWeight:900, color:"#166534", fontFamily:"var(--font-head)" }}>🪙 {Number(state.current_bid || 0).toLocaleString("en-IN")}</div>
            <div style={{ fontSize:12, color:leadingTeam?"#166534":"#94A3B8", fontWeight:700, marginTop:4 }}>{leadingTeam ? `Leading: ${leadingTeam.name}` : "No bids yet"}</div>
          </div>

          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:6, textTransform:"uppercase" }}>Bid Step (🪙)</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
              {[1000,2000,5000,10000,15000,20000].map(v => (
                <button key={v} onClick={()=>setBidStep(v)} style={{ padding:"7px 2px", borderRadius:8, border:bidStep===v?"none":"1.5px solid #E2E8F0", background:bidStep===v?"#166534":"#FFFFFF", color:bidStep===v?"#FFFFFF":"#64748B", fontSize:10, fontWeight:700, cursor:"pointer" }}>+{v>=1000?`${v/1000}k`:v}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)", gap:8, marginBottom:14 }}>
            {auctionTeams.map(t => {
              const squadCount = auctionPlayers.filter(p => p.sold_team_id === t.id).length
              const isSquadFull = squadCount >= DEFAULT_SQUAD_TARGET
              const maxBid = calculateMaxBid(t.purse_remaining, squadCount, DEFAULT_SQUAD_TARGET, MIN_PLAYER_RESERVE)
              const nextAmount = (state.current_bid || 0) + bidStep
              const canAfford = !isSquadFull && maxBid >= nextAmount
              const isLeading = leadingTeam?.id === t.id
              return (
                <button
                  key={t.id}
                  onClick={()=>doBid(t.id)}
                  disabled={busy || !canAfford || isLeading}
                  style={{
                    padding:"10px 8px",
                    borderRadius:10,
                    border:isLeading?"2px solid #166534":"1.5px solid #E2E8F0",
                    background:isLeading?"rgba(34,197,94,0.1)":"#FFFFFF",
                    cursor:(busy||!canAfford||isLeading)?"not-allowed":"pointer",
                    opacity:(!canAfford||isLeading)?0.5:1,
                    textAlign:"center"
                  }}
                >
                  {isLeading && <div style={{ fontSize:9, color:"#166534", fontWeight:800, marginBottom:2, display:"flex", alignItems:"center", justifyContent:"center", gap:2 }}><Trophy size={9}/> LEADING</div>}
                  <div style={{ fontSize:12, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.name}</div>
                  <div style={{ fontSize:10, color:"#64748B", fontWeight:600, marginTop:1 }}>
                    {isSquadFull ? `Squad Full (${squadCount}/${DEFAULT_SQUAD_TARGET})` : `Max: 🪙${(maxBid/1000 >= 1 ? `${maxBid/1000}k` : maxBid)}`}
                  </div>
                  <div style={{ fontSize:10, color:canAfford?"#166534":"#EF4444", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:2, marginTop:2 }}>
                    → 🪙{nextAmount.toLocaleString("en-IN")}
                  </div>
                </button>
              )
            })}
          </div>

          <div style={{ padding:"12px", background:"#F8FAF8", borderRadius:10, border:"1px solid #E2E8F0", marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>Manual Bid — jump to any exact amount</div>
            <div style={{ display:"flex", gap:8 }}>
              <select value={manualTeamId} onChange={e=>setManualTeamId(e.target.value)} style={{ flex:1, padding:"9px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", background:"#FFFFFF" }}>
                <option value="">Team...</option>
                {auctionTeams.map(t => {
                  const sc = auctionPlayers.filter(p => p.sold_team_id === t.id).length
                  const mb = calculateMaxBid(t.purse_remaining, sc, DEFAULT_SQUAD_TARGET, MIN_PLAYER_RESERVE)
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} (🪙 {Number(t.purse_remaining||0).toLocaleString("en-IN")} · Max: 🪙{mb.toLocaleString("en-IN")})
                    </option>
                  )
                })}
              </select>
              <input type="number" min="0" value={manualAmount} onChange={e=>setManualAmount(e.target.value)} placeholder={`> 🪙${state.current_bid||0}`} style={{ width:110, padding:"9px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none" }}/>
              <button onClick={doManualBid} disabled={busy} style={{ padding:"9px 14px", borderRadius:8, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:700, cursor:busy?"not-allowed":"pointer" }}>Bid</button>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            <button onClick={doUndo} disabled={busy || bidHistory.length===0} style={{ padding:"11px 4px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#FFFFFF", color:"#64748B", fontSize:12, fontWeight:700, cursor:(busy||bidHistory.length===0)?"not-allowed":"pointer", opacity:bidHistory.length===0?0.5:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><RotateCcw size={13}/> Undo</button>
            <button onClick={doUnsold} disabled={busy} style={{ padding:"11px 4px", borderRadius:9, border:"1.5px solid #EF4444", background:"#FFFFFF", color:"#EF4444", fontSize:12, fontWeight:700, cursor:busy?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><XCircle size={13}/> Unsold</button>
            <button onClick={doSold} disabled={busy || !leadingTeam} style={{ padding:"11px 4px", borderRadius:9, background:"#166534", border:"none", color:"#FFFFFF", fontSize:12, fontWeight:800, cursor:(busy||!leadingTeam)?"not-allowed":"pointer", opacity:!leadingTeam?0.5:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><CheckCircle2 size={13}/> Sold</button>
          </div>
        </Card>
      )}

      {registeredCount > 0 && (
        <div style={{ display:"flex", gap:8, marginBottom:18 }}>
          <select value={jumpTo} onChange={e=>setJumpTo(e.target.value)} style={{ flex:1, padding:"11px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", background:"#FFFFFF", color:"#0F172A" }}>
            <option value="">Jump to player...</option>
            {auctionPlayers.filter(p => p.status === "registered" && !p.is_captain && p.status !== "captain" && p.id !== currentPlayer?.id).sort((a,b) => a.name.localeCompare(b.name)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={doJump} disabled={!jumpTo || busy} style={{ padding:"10px 18px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#FFFFFF", fontSize:13, fontWeight:700, cursor:(!jumpTo||busy)?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:4 }}>Go <ChevronRight size={14}/></button>
        </div>
      )}

      {(() => {
        const recentSold = auctionPlayers.filter(p => p.status === "sold" && p.sold_at).sort((a,b) => new Date(b.sold_at) - new Date(a.sold_at)).slice(0, 5)
        if (recentSold.length === 0) return null
        return (
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:"#0F172A", marginBottom:10, fontFamily:"var(--font-head)", display:"flex", alignItems:"center", gap:6 }}><CheckCircle2 size={14} color="#166534"/> Recently Sold</div>
            <div style={{ display:"grid", gap:6 }}>
              {recentSold.map(p => {
                const team = auctionTeams.find(t => t.id === p.sold_team_id)
                return (
                  <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#FFFFFF", border:"1px solid #F1F5F9", borderRadius:9 }}>
                    {p.profile_image_url ? (
                      <img src={p.profile_image_url} alt={p.name} style={{ width:32, height:32, borderRadius:7, objectFit:"cover", flexShrink:0 }}/>
                    ) : (
                      <div style={{ width:32, height:32, borderRadius:7, background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#64748B", flexShrink:0 }}>{(p.name||"?")[0]}</div>
                    )}
                    <div style={{ flex:1, minWidth:0, fontSize:12, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"#94A3B8", flexShrink:0 }}>{team?.name || "—"}</div>
                    <div style={{ fontSize:12, fontWeight:800, color:"#166534", fontFamily:"var(--font-head)", flexShrink:0 }}>🪙 {Number(p.sold_price||0).toLocaleString("en-IN")}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
