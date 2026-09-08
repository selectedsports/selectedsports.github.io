import { useState, useEffect } from "react"
import { Card, Spinner, Av } from "./ui.jsx"
import { fetchAuctionState, fetchAuctionBidHistory, startAuction, placeBid, undoLastBid, markPlayerSold, markPlayerUnsold, jumpToAuctionPlayer } from "../db.js"
import { Trophy, Users, Wallet, RotateCcw, XCircle, CheckCircle2, ChevronRight, Zap, Gavel } from "lucide-react"

export default function AuctionLiveConsole({ isMobile, auctionPlayers, auctionTeams, onPoolChange, auctionId, auctionDate }) {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [increment, setIncrement] = useState("100")
  const [bidHistory, setBidHistory] = useState([])
  const [jumpTo, setJumpTo] = useState("")
  const [bidStep, setBidStep] = useState(1000)
  const [manualTeamId, setManualTeamId] = useState("")
  const [manualAmount, setManualAmount] = useState("")

  const load = async () => {
    try {
      const s = await fetchAuctionState(auctionId)
      setState(s)
      if (s.current_player_id) setBidHistory(await fetchAuctionBidHistory(s.current_player_id, auctionId))
      else setBidHistory([])
    } catch(e) { alert(e.message) }
    setLoading(false)
  }
  useEffect(() => { load() }, [auctionId])

  const registeredCount = auctionPlayers.filter(p => p.status === "registered").length
  const soldCount = auctionPlayers.filter(p => p.status === "sold").length
  const unsoldCount = auctionPlayers.filter(p => p.status === "unsold").length
  const currentPlayer = state?.current_player_id ? auctionPlayers.find(p => p.id === state.current_player_id) : null
  const leadingTeam = state?.current_team_id ? auctionTeams.find(t => t.id === state.current_team_id) : null

  const doStart = async () => {
    const inc = Number(increment)
    if (!inc || inc <= 0) { alert("Enter a valid bid increment"); return }
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
    if (!amount || amount <= 0) { alert("Enter a valid bid amount"); return }
    if (amount <= (state.current_bid || 0)) { alert(`Bid must be higher than the current ₹${state.current_bid}`); return }
    const team = auctionTeams.find(t => t.id === manualTeamId)
    if (team && team.purse_remaining < amount) { alert(`${team.name} only has ₹${team.purse_remaining} left`); return }
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
    if (!window.confirm(`Sell ${currentPlayer.name} to ${leadingTeam.name} for ₹${state.current_bid}?`)) return
    setBusy(true)
    try { await markPlayerSold(state.current_player_id, leadingTeam.id, state.current_bid, auctionId); await onPoolChange(); await load() } catch(e) { alert(e.message) }
    setBusy(false)
  }

  const doUnsold = async () => {
    if (!window.confirm(`Mark ${currentPlayer.name} as unsold?`)) return
    setBusy(true)
    try { await markPlayerUnsold(state.current_player_id, auctionId); await onPoolChange(); await load() } catch(e) { alert(e.message) }
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
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Users size={13}/> {auctionPlayers.filter(p=>p.status==="registered").length} players in the pool</span>
          <span>·</span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><Trophy size={13}/> {auctionTeams.length} teams ready</span>
        </div>
        {tooEarly && <div style={{ padding:"10px 12px", background:"rgba(184,134,11,0.08)", borderRadius:9, color:"#B8860B", fontSize:12, marginBottom:14 }}>This auction is scheduled for {new Date(auctionDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} — it can't be started before then.</div>}
        {auctionTeams.length < 2 && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:14 }}>Add at least 2 teams (in the Teams tab) before starting.</div>}
        <div style={{ fontSize:12, color:"#6b7280", marginBottom:5, fontWeight:600 }}>Bid Increment (₹)</div>
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
          const squad = auctionPlayers.filter(p => p.sold_team_id === t.id)
          return (
            <Card key={t.id} style={{ padding:"14px 16px", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>{t.name}</div>
                <div style={{ fontSize:12, color:"#94A3B8", display:"flex", alignItems:"center", gap:4 }}><Wallet size={11}/> ₹{t.purse_remaining} left of ₹{t.purse_total}</div>
              </div>
              {squad.length === 0 ? <div style={{ fontSize:12, color:"#94A3B8" }}>No players won.</div> : squad.map(p => (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, padding:"6px 0", color:"#0F172A" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:8 }}><Av name={p.name} id={p.id} sz={22}/> {p.name}</span><span style={{ fontWeight:700, color:"#166534" }}>₹{p.sold_price}</span>
                </div>
              ))}
            </Card>
          )
        })}
      </div>
    )
  }

  // status === "live"
  return (
    <div>
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
              <img src={currentPlayer.profile_image_url} alt={currentPlayer.name} style={{ width:180, height:200, borderRadius:16, objectFit:"cover", border:"3px solid #166534", marginBottom:10 }}/>
            ) : (
              <Av name={currentPlayer.name} id={currentPlayer.id} sz={120}/>
            )}
            <div style={{ fontWeight:900, fontSize:18, color:"#0F172A", fontFamily:"var(--font-head)", marginTop:8 }}>{currentPlayer.name}</div>
            <div style={{ fontSize:13, color:"#94A3B8", marginTop:2 }}>{currentPlayer.city ? `${currentPlayer.city} · ` : ""}{currentPlayer.playing_role || "—"} · Base ₹{currentPlayer.base_price || 0}</div>
          </div>
          <div style={{ textAlign:"center", padding:"16px", background:"rgba(34,197,94,0.08)", borderRadius:12, marginBottom:14 }}>
            <div style={{ fontSize:30, fontWeight:900, color:"#166534", fontFamily:"var(--font-head)" }}>₹{state.current_bid}</div>
            <div style={{ fontSize:12, color:leadingTeam?"#166534":"#94A3B8", fontWeight:700, marginTop:4 }}>{leadingTeam ? `Leading: ${leadingTeam.name}` : "No bids yet"}</div>
          </div>

          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:6, textTransform:"uppercase" }}>Bid Step</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
              {[1000,2000,5000,10000,15000,20000].map(v => (
                <button key={v} onClick={()=>setBidStep(v)} style={{ padding:"7px 2px", borderRadius:8, border:bidStep===v?"none":"1.5px solid #E2E8F0", background:bidStep===v?"#166534":"#FFFFFF", color:bidStep===v?"#FFFFFF":"#64748B", fontSize:10, fontWeight:700, cursor:"pointer" }}>+{v>=1000?`${v/1000}k`:v}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(3,1fr)", gap:8, marginBottom:14 }}>
            {auctionTeams.map(t => {
              const nextAmount = (state.current_bid || 0) + bidStep
              const canAfford = t.purse_remaining >= nextAmount
              const isLeading = leadingTeam?.id === t.id
              return (
                <button key={t.id} onClick={()=>doBid(t.id)} disabled={busy || !canAfford || isLeading} style={{ padding:"10px 8px", borderRadius:10, border:isLeading?"2px solid #166534":"1.5px solid #E2E8F0", background:isLeading?"rgba(34,197,94,0.1)":"#FFFFFF", cursor:(busy||!canAfford||isLeading)?"not-allowed":"pointer", opacity:(!canAfford||isLeading)?0.5:1, textAlign:"center" }}>
                  {isLeading && <div style={{ fontSize:9, color:"#166534", fontWeight:800, marginBottom:2, display:"flex", alignItems:"center", justifyContent:"center", gap:2 }}><Trophy size={9}/> LEADING</div>}
                  <div style={{ fontSize:12, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.name}</div>
                  <div style={{ fontSize:10, color:"#94A3B8", display:"flex", alignItems:"center", justifyContent:"center", gap:3 }}>→ ₹{nextAmount}</div>
                </button>
              )
            })}
          </div>

          <div style={{ padding:"12px", background:"#F8FAF8", borderRadius:10, border:"1px solid #E2E8F0", marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, marginBottom:8, textTransform:"uppercase" }}>Manual Bid — jump to any exact amount</div>
            <div style={{ display:"flex", gap:8 }}>
              <select value={manualTeamId} onChange={e=>setManualTeamId(e.target.value)} style={{ flex:1, padding:"9px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", background:"#FFFFFF" }}>
                <option value="">Team...</option>
                {auctionTeams.map(t => <option key={t.id} value={t.id}>{t.name} (₹{t.purse_remaining})</option>)}
              </select>
              <input type="number" min="0" value={manualAmount} onChange={e=>setManualAmount(e.target.value)} placeholder={`> ₹${state.current_bid||0}`} style={{ width:110, padding:"9px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none" }}/>
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
            {auctionPlayers.filter(p => p.status === "registered" && p.id !== currentPlayer?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                    <Av name={p.name} id={p.id} sz={26}/>
                    <div style={{ flex:1, minWidth:0, fontSize:12, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"#94A3B8", flexShrink:0 }}>{team?.name || "—"}</div>
                    <div style={{ fontSize:12, fontWeight:800, color:"#166534", fontFamily:"var(--font-head)", flexShrink:0 }}>₹{p.sold_price}</div>
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
