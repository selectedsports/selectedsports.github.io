import { useState, useEffect } from "react"
import { registerAuctionPlayer, checkAuctionPhoneExists, findPlayerByPhone, fetchAuctionByCode, uploadProfilePhoto, uploadPaymentReceipt, fetchAuctionPlayers, fetchAuctionTeams, fetchAuctionSponsors } from "../db.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import { INDIAN_STATES, CITIES_BY_STATE } from "../indianStatesCities.js"
import { isValidName, birthDateError, maxBirthDateForMinAge, ADMIN_UPI, ADMIN_PHONE } from "../constants.js"
import { Search as SearchIcon, ShieldCheck, Star } from "lucide-react"

const ROLES = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"]
const JERSEY_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"]

const iS = { width:"100%", padding:"12px 13px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:15, outline:"none", background:"#F8FAF8", color:"#0F172A", boxSizing:"border-box", fontFamily:"var(--font-body)" }
const lS = { fontSize:12, color:"#64748B", display:"block", marginBottom:6, fontWeight:600 }

function Header({ auctionName, organizedBy }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#166534,#0F172A)", padding:"24px 24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height:44, width:"auto", display:"block" }}/>
        <div style={{ color:"#B8860B", fontSize:10, fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>Auction Registration</div>
      </div>
      <h1 style={{ color:"#FFFFFF", fontFamily:"var(--font-head)", fontSize:20, fontWeight:800, margin:"0 0 6px" }}>{auctionName || "Register for the Auction"}</h1>
      {organizedBy && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.12)", color:"#86EFAC", padding:"3px 10px", borderRadius:999, fontSize:11.5, fontWeight:700, marginBottom:8 }}>
          🛡️ Organized by {organizedBy}
        </div>
      )}
      <div style={{ color:"rgba(255,255,255,0.75)", fontSize:13 }}>Fill in your details below — player registration fee applies to all participants.</div>
    </div>
  )
}

function AuctionDetailsCard({ auction }) {
  if (!auction) return null
  const fee = Number(auction.player_entry_fee) > 0 ? Number(auction.player_entry_fee) : 180
  const rows = [
    ...(auction.organized_by ? [["Organized By", auction.organized_by]] : []),
    ["Auction Date", auction.auction_date ? new Date(auction.auction_date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}) : "Date TBD"],
    ["Time", auction.auction_time || "TBD"],
    ["Venue", auction.location || "TBD"],
    ["Points / Team", auction.points_purse ? auction.points_purse.toLocaleString("en-IN") : "Not set"],
    ["Registration Fee", `₹${fee.toLocaleString("en-IN")}`],
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
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")

  useEffect(() => {
    if (!auctionId) { setLoading(false); return }
    fetchAuctionPlayers(auctionId)
      .then(list => setPlayers((list || []).filter(p => !p.is_captain && p.status !== "captain")))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auctionId])

  const q = search.trim().toLowerCase()
  const filtered = players.filter(p => {
    if (roleFilter && p.playing_role !== roleFilter) return false
    if (!q) return true
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q) ||
      (p.playing_role || "").toLowerCase().includes(q) ||
      (p.jersey_number && String(p.jersey_number).includes(q))
    )
  })

  return (
    <div style={{ background:"#FFFFFF", borderRadius:16, padding:"18px", border:"1px solid #E2E8F0" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:6 }}>
        <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>
          Registered Players ({loading ? "…" : players.length})
        </div>
        <div style={{ fontSize:10, color:"#166534", background:"rgba(34,197,94,0.1)", padding:"3px 8px", borderRadius:6, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
          <ShieldCheck size={12}/> Confidential: Mobile # Hidden
        </div>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:140, position:"relative" }}>
          <SearchIcon size={14} color="#94A3B8" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search player, city, role..."
            style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1px solid #E2E8F0", fontSize:12, outline:"none", background:"#F8FAF8", boxSizing:"border-box" }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          style={{ padding:"8px 8px", borderRadius:8, border:"1px solid #E2E8F0", fontSize:12, background:"#F8FAF8", color:"#0F172A" }}
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", padding:"18px 0" }}>Loading registered players...</div>
      ) : filtered.length === 0 ? (
        <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", padding:"18px 0" }}>
          {players.length === 0 ? "No one has registered yet — be the first!" : "No players match your search."}
        </div>
      ) : (
        <div style={{ display:"grid", gap:8, maxHeight:360, overflowY:"auto", paddingRight:2 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", background:"#F8FAF8", borderRadius:9, border:"1px solid #F1F5F9" }}>
              {p.profile_image_url ? (
                <img src={p.profile_image_url} alt={p.name} style={{ width:40, height:40, borderRadius:8, objectFit:"cover", flexShrink:0, border:"1px solid #E2E8F0" }}/>
              ) : (
                <div style={{ width:40, height:40, borderRadius:8, background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#64748B", flexShrink:0 }}>
                  {(p.name||"?")[0]}
                </div>
              )}
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0F172A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {p.name}
                </div>
                <div style={{ fontSize:11, color:"#64748B", marginTop:2, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  {p.playing_role && <span style={{ fontWeight:600, color:"#166534" }}>{p.playing_role}</span>}
                  {p.city && <span>· 📍 {p.city}</span>}
                  {p.jersey_number && <span>· 🎽 #{p.jersey_number} {p.jersey_size ? `(${p.jersey_size})` : ""}</span>}
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                {p.status === "sold" ? (
                  <span style={{ fontSize:10, fontWeight:800, color:"#166534", background:"rgba(34,197,94,0.14)", padding:"3px 8px", borderRadius:999, whiteSpace:"nowrap" }}>
                    Sold 🪙 {Number(p.sold_price||0).toLocaleString("en-IN")}
                  </span>
                ) : p.status === "unsold" ? (
                  <span style={{ fontSize:10, fontWeight:700, color:"#EF4444", background:"rgba(239,68,68,0.1)", padding:"3px 8px", borderRadius:999, whiteSpace:"nowrap" }}>
                    Unsold
                  </span>
                ) : Number(p.base_price) > 0 ? (
                  <span style={{ fontSize:10, fontWeight:700, color:"#B8860B", background:"rgba(245,158,11,0.12)", padding:"3px 8px", borderRadius:999, whiteSpace:"nowrap" }}>
                    Base 🪙 {Number(p.base_price).toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span style={{ fontSize:10, fontWeight:700, color:"#64748B", background:"#E2E8F0", padding:"3px 8px", borderRadius:999, whiteSpace:"nowrap" }}>
                    Registered
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TournamentTeamsAndSquads({ auctionId }) {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedTeamId, setExpandedTeamId] = useState(null)

  useEffect(() => {
    if (!auctionId) { setLoading(false); return }
    Promise.all([fetchAuctionTeams(auctionId), fetchAuctionPlayers(auctionId)])
      .then(([tList, pList]) => {
        setTeams(tList || [])
        setPlayers(pList || [])
        if (tList && tList.length > 0) setExpandedTeamId(tList[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auctionId])

  if (loading) {
    return (
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:"24px 18px", border:"1px solid #E2E8F0", textAlign:"center", color:"#94A3B8", fontSize:13 }}>
        Loading tournament teams...
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:"28px 18px", border:"1px solid #E2E8F0", textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:8 }}>🛡️</div>
        <div style={{ fontSize:14, fontWeight:800, color:"#0F172A" }}>No teams announced yet</div>
        <div style={{ fontSize:12, color:"#94A3B8", marginTop:4 }}>The tournament organizer is setting up the teams. Check back soon!</div>
      </div>
    )
  }

  return (
    <div style={{ display:"grid", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingLeft:4 }}>
        <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>
          Tournament Teams ({teams.length})
        </div>
        <div style={{ fontSize:10, color:"#166534", background:"rgba(34,197,94,0.1)", padding:"3px 8px", borderRadius:6, fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
          <ShieldCheck size={12}/> Mobile # Hidden
        </div>
      </div>

      {teams.map(t => {
        const squad = players
          .filter(p => p.sold_team_id === t.id)
          .sort((a,b) => {
            const aCap = a.is_captain || a.status === "captain" || (t.captain_player_id && a.id === t.captain_player_id) ? 1 : 0
            const bCap = b.is_captain || b.status === "captain" || (t.captain_player_id && b.id === t.captain_player_id) ? 1 : 0
            return bCap - aCap
          })
        const isExpanded = expandedTeamId === t.id

        return (
          <div key={t.id} style={{ background:"#FFFFFF", borderRadius:16, border:"1px solid #E2E8F0", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.03)" }}>
            <div
              onClick={() => setExpandedTeamId(isExpanded ? null : t.id)}
              style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background: isExpanded ? "#F8FAF8" : "#FFFFFF" }}
            >
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ fontSize:15, fontWeight:800, color:"#0F172A", fontFamily:"var(--font-head)" }}>{t.name}</div>
                <div style={{ fontSize:12, color:"#64748B", marginTop:3, display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  {t.captain_name && <span>👑 Captain: <strong style={{ color:"#0F172A" }}>{t.captain_name}</strong></span>}
                  {t.owner_name && t.owner_name !== t.captain_name && <span>· Owner: {t.owner_name}</span>}
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#166534", fontFamily:"var(--font-head)" }}>
                  🪙 {Number(t.purse_remaining || 0).toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>
                  {squad.length}/9 Squad {isExpanded ? "▲" : "▼"}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding:"12px 16px 16px", borderTop:"1px solid #F1F5F9" }}>
                <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase", marginBottom:8, display:"flex", justifyContent:"space-between" }}>
                  <span>Squad Members ({squad.length}/9)</span>
                  <span style={{ color:"#166534" }}>🔒 Private</span>
                </div>
                {squad.length === 0 ? (
                  <div style={{ fontSize:12, color:"#94A3B8", textAlign:"center", padding:"12px 0" }}>No players won yet.</div>
                ) : (
                  <div style={{ display:"grid", gap:6 }}>
                    {squad.map(p => {
                      const isCap = p.is_captain || p.status === "captain" || (t.captain_player_id && p.id === t.captain_player_id)
                      return (
                        <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background: isCap ? "rgba(184,134,11,0.08)" : "#F8FAF8", border: isCap ? "1px solid rgba(184,134,11,0.3)" : "1px solid #F1F5F9", borderRadius:8 }}>
                          {p.profile_image_url ? (
                            <img src={p.profile_image_url} alt={p.name} style={{ width:34, height:34, borderRadius:8, objectFit:"cover", flexShrink:0 }}/>
                          ) : (
                            <div style={{ width:34, height:34, borderRadius:8, background:"#E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#64748B", flexShrink:0 }}>
                              {(p.name || "?")[0]}
                            </div>
                          )}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#0F172A", display:"flex", alignItems:"center", gap:6 }}>
                              <span>{p.name}</span>
                              {isCap && <span style={{ fontSize:9, fontWeight:800, background:"#B8860B", color:"#FFFFFF", padding:"1px 5px", borderRadius:4 }}>👑 CAPTAIN</span>}
                            </div>
                            <div style={{ fontSize:11, color:"#64748B" }}>
                              {p.playing_role || "—"} {p.city ? `· 📍 ${p.city}` : ""} {p.jersey_number ? `· 🎽 #${p.jersey_number}` : ""}
                            </div>
                          </div>
                          <div style={{ fontSize:12, fontWeight:800, color: isCap ? "#B8860B" : "#166534", fontFamily:"var(--font-head)", flexShrink:0 }}>
                            {isCap ? "Captain" : `🪙 ${Number(p.sold_price || 0).toLocaleString("en-IN")}`}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TournamentSponsorsList({ auctionId }) {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auctionId) { setLoading(false); return }
    fetchAuctionSponsors(auctionId)
      .then(list => setSponsors(list || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [auctionId])

  if (loading) {
    return (
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:"24px 18px", border:"1px solid #E2E8F0", textAlign:"center", color:"#94A3B8", fontSize:13 }}>
        Loading tournament sponsors...
      </div>
    )
  }

  if (sponsors.length === 0) {
    return (
      <div style={{ background:"#FFFFFF", borderRadius:16, padding:"28px 18px", border:"1px solid #E2E8F0", textAlign:"center" }}>
        <div style={{ fontSize:36, marginBottom:8 }}>⭐</div>
        <div style={{ fontSize:14, fontWeight:800, color:"#0F172A" }}>Official Tournament Sponsors</div>
        <div style={{ fontSize:12, color:"#94A3B8", marginTop:4 }}>Sponsors will be announced shortly. Interested in sponsoring? Contact the tournament organizer!</div>
      </div>
    )
  }

  return (
    <div style={{ background:"#FFFFFF", borderRadius:16, padding:"18px", border:"1px solid #E2E8F0" }}>
      <div style={{ fontSize:11, color:"#94A3B8", fontWeight:700, textTransform:"uppercase", marginBottom:14 }}>
        Official Tournament Sponsors ({sponsors.length})
      </div>
      <div style={{ display:"grid", gap:14 }}>
        {sponsors.map(s => (
          <div key={s.id} style={{ background:"#F8FAF8", borderRadius:12, padding:"14px", border:"1px solid #E2E8F0", textAlign:"center" }}>
            {s.logo_url ? (
              <div style={{ width:"100%", height:120, background:"#FFFFFF", borderRadius:8, border:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", padding:8, marginBottom:8 }}>
                <img src={s.logo_url} alt={s.name} style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}/>
              </div>
            ) : (
              <div style={{ width:"100%", height:100, background:"rgba(184,134,11,0.1)", borderRadius:8, border:"1px solid rgba(184,134,11,0.2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, marginBottom:8 }}>
                <Star size={26} color="#B8860B"/>
                <span style={{ fontSize:10, color:"#B8860B", fontWeight:800 }}>Official Sponsor</span>
              </div>
            )}
            <div style={{ fontSize:14, fontWeight:800, color:"#0F172A" }}>{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaymentSection({ auction, firstName, receiptFile, receiptPreview, setReceiptFile, setReceiptPreview, copiedText, setCopiedText }) {
  const fee = Number(auction?.player_entry_fee) > 0 ? Number(auction.player_entry_fee) : 180
  const upiId = auction?.organizer_upi_id || ADMIN_UPI || "9897439743@okbizaxis"
  const paymentPhone = auction?.organizer_payment_phone || ADMIN_PHONE || "9897439743"

  return (
    <div style={{ padding:"16px", background:"rgba(34,197,94,0.06)", border:"1.5px solid #166534", borderRadius:14, marginBottom:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <div style={{ fontWeight:800, fontSize:14, color:"#0F172A", fontFamily:"var(--font-head)" }}>Registration Fee Required</div>
        <span style={{ background:"#166534", color:"#FFFFFF", fontSize:13, fontWeight:800, padding:"4px 10px", borderRadius:8 }}>₹{fee}</span>
      </div>
      <div style={{ fontSize:12, color:"#64748B", marginBottom:12, lineHeight:1.5 }}>
        Please transfer the registration fee of ₹{fee} to the details below and upload your payment screenshot. Form cannot be submitted without payment proof.
      </div>

      {/* Notice explaining Google Pay opens while page stays in background */}
      <div style={{ fontSize:11, color:"#1E40AF", background:"rgba(37,99,235,0.08)", padding:"9px 12px", borderRadius:8, border:"1px solid rgba(37,99,235,0.2)", marginBottom:14, lineHeight:1.4 }}>
        💡 <strong>Notice:</strong> When you tap <em>Pay with Google Pay</em>, your GPay app will open while this registration page remains open in the background. Complete payment in GPay, take a screenshot, and switch back here to upload it below.
      </div>

      {/* Payment Info */}
      <div style={{ background:"#FFFFFF", padding:"12px 14px", borderRadius:10, border:"1px solid #E2E8F0", display:"grid", gap:10, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:10, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>UPI ID</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{upiId}</div>
          </div>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(upiId); setCopiedText("upi"); setTimeout(() => setCopiedText(""), 2000) }} style={{ padding:"5px 10px", borderRadius:6, border:"1px solid #E2E8F0", background:"#F8FAF8", fontSize:11, fontWeight:700, cursor:"pointer", color: copiedText==="upi"?"#166534":"#64748B" }}>
            {copiedText === "upi" ? "Copied!" : "Copy"}
          </button>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:8, borderTop:"1px solid #F1F5F9" }}>
          <div>
            <div style={{ fontSize:10, color:"#94A3B8", fontWeight:700, textTransform:"uppercase" }}>Google Pay / PhonePe / Paytm</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>+91 {paymentPhone}</div>
          </div>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(paymentPhone); setCopiedText("phone"); setTimeout(() => setCopiedText(""), 2000) }} style={{ padding:"5px 10px", borderRadius:6, border:"1px solid #E2E8F0", background:"#F8FAF8", fontSize:11, fontWeight:700, cursor:"pointer", color: copiedText==="phone"?"#166534":"#64748B" }}>
            {copiedText === "phone" ? "Copied!" : "Copy"}
          </button>
        </div>

        <div style={{ display:"grid", gap:8, marginTop:6 }}>
          <a
            href={`tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(auction?.name || "Selected Sports")}&am=${fee}&cu=INR&tn=${encodeURIComponent("Auction Fee - " + (firstName || "Player"))}`}
            onClick={() => { if (paymentPhone) navigator.clipboard?.writeText(paymentPhone) }}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", borderRadius:9, background:"#1A73E8", color:"#FFFFFF", textDecoration:"none", fontSize:13, fontWeight:800, textAlign:"center", boxShadow:"0 2px 8px rgba(26,115,232,0.25)" }}
          >
            <span>📱</span> Pay ₹{fee} with Google Pay
          </a>
          <a
            href={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(auction?.name || "Selected Sports")}&am=${fee}&cu=INR&tn=${encodeURIComponent("Auction Fee - " + (firstName || "Player"))}`}
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"10px", borderRadius:8, background:"#166534", color:"#FFFFFF", textDecoration:"none", fontSize:12, fontWeight:700, textAlign:"center" }}
          >
            <span>⚡</span> Pay ₹{fee} via Any UPI App
          </a>
        </div>
      </div>

      {/* Screenshot Upload Field */}
      <div style={{ borderTop:"1px dashed #CBD5E1", paddingTop:14 }}>
        <label style={{ ...lS, color:"#0F172A", fontWeight:700 }}>Upload Payment Screenshot *</label>
        <div style={{ fontSize:11, color:"#64748B", marginBottom:10 }}>Attach a screenshot of the completed payment transaction.</div>

        {receiptPreview ? (
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"#FFFFFF", padding:"10px", borderRadius:10, border:"1.5px solid #166534" }}>
            <img src={receiptPreview} alt="Receipt" style={{ width:56, height:56, objectFit:"cover", borderRadius:8, border:"1px solid #E2E8F0" }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#166534" }}>✓ Screenshot Attached</div>
              <div style={{ fontSize:11, color:"#64748B", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{receiptFile?.name || "Payment receipt"}</div>
            </div>
            <label style={{ padding:"6px 12px", borderRadius:7, background:"#F1F5F9", fontSize:11, fontWeight:700, cursor:"pointer", color:"#0F172A" }}>
              Change
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                setReceiptFile(file)
                const r = new FileReader()
                r.onload = () => setReceiptPreview(r.result)
                r.readAsDataURL(file)
              }}/>
            </label>
          </div>
        ) : (
          <label style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"18px 12px", borderRadius:10, border:"2px dashed #94A3B8", background:"#FFFFFF", cursor:"pointer", textAlign:"center" }}>
            <div style={{ fontSize:22, marginBottom:4 }}>📸</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#166534" }}>Tap to Upload Payment Screenshot *</div>
            <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>JPG, PNG, or WebP (Mandatory)</div>
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              setReceiptFile(file)
              const r = new FileReader()
              r.onload = () => setReceiptPreview(r.result)
              r.readAsDataURL(file)
            }}/>
          </label>
        )}
      </div>
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
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState("")
  const [copiedText, setCopiedText] = useState("")
  const [lookedUp, setLookedUp] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [infoTab, setInfoTab] = useState("register") // "register" | "details" | "players"
  const [registeredCount, setRegisteredCount] = useState(0)

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
    if (!auctionId) return
    fetchAuctionPlayers(auctionId).then(plist => setRegisteredCount((plist || []).length)).catch(() => {})
  }, [auctionId])

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
        } else {
          setLookedUp(false)
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
    const fee = Number(auction?.player_entry_fee) > 0 ? Number(auction.player_entry_fee) : 180
    if (!receiptFile && !receiptPreview) {
      setError(`Please transfer the registration fee of ₹${fee} and upload your payment screenshot.`); return
    }
    setBusy(true)
    try {
      const exists = await checkAuctionPhoneExists(cleaned, auctionId)
      if (exists) { setError("This phone number is already registered for this auction."); setBusy(false); return }
      let photoUrl = photoPreview
      if (photoFile) photoUrl = await uploadProfilePhoto(photoFile, cleaned)
      let receiptUrl = receiptPreview || null
      if (receiptFile) receiptUrl = await uploadPaymentReceipt(receiptFile, auctionId, cleaned)
      await registerAuctionPlayer(`${firstName.trim()} ${lastName.trim()}`, cleaned, role, birthDate, photoUrl, auctionId, {
        city: city.trim(), jerseyNumber: jerseyNumber.trim(), jerseySize,
        paymentScreenshotUrl: receiptUrl,
        paymentStatus: "pending"
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
      <Header auctionName={auction?.name} organizedBy={auction?.organized_by}/>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px 40px" }}>
        <div style={{ background:"#FFFFFF", borderRadius:16, padding:"24px 20px", textAlign:"center", border:"1px solid #E2E8F0", marginBottom:20 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🔒</div>
          <div style={{ fontWeight:800, fontSize:17, color:"#0F172A", fontFamily:"var(--font-head)" }}>Registration is closed</div>
          <div style={{ fontSize:13, color:"#64748B", marginTop:6 }}>The organizer has closed auction registration. Explore tournament details, squads, and players below.</div>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
          {[
            ["details", "📋 Details"],
            ["players", `🏏 Players (${registeredCount})`],
            ["teams", "🛡️ Teams & Squads"],
            ["sponsors", "⭐ Sponsors"]
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setInfoTab(k)}
              style={{
                flex: 1,
                minWidth: 80,
                padding: "8px 10px",
                borderRadius: 10,
                border: (infoTab === k || (infoTab === "register" && k === "details")) ? "none" : "1.5px solid #E2E8F0",
                background: (infoTab === k || (infoTab === "register" && k === "details")) ? "#166534" : "#FFFFFF",
                color: (infoTab === k || (infoTab === "register" && k === "details")) ? "#FFFFFF" : "#64748B",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {(infoTab === "details" || infoTab === "register") && <AuctionDetailsCard auction={auction}/>}
        {infoTab === "players" && <RegisteredPlayersList auctionId={auctionId}/>}
        {infoTab === "teams" && <TournamentTeamsAndSquads auctionId={auctionId}/>}
        {infoTab === "sponsors" && <TournamentSponsorsList auctionId={auctionId}/>}
      </div>
    </div>
  )

  if (done) return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header auctionName={auction?.name} organizedBy={auction?.organized_by}/>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px 40px" }}>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
          <div style={{ fontWeight:800, fontSize:18, color:"#0F172A", fontFamily:"var(--font-head)" }}>
            You're registered!
          </div>
          <div style={{ fontSize:13, color:"#64748B", marginTop:8, lineHeight:1.5 }}>
            <span>
              {firstName}, you've been added to the auction pool. The organizer will verify your payment and set your base price before the auction starts.
            </span>
          </div>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
          {[
            ["details", "📋 Details"],
            ["players", `🏏 Players (${registeredCount})`],
            ["teams", "🛡️ Teams & Squads"],
            ["sponsors", "⭐ Sponsors"]
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setInfoTab(k)}
              style={{
                flex: 1,
                minWidth: 80,
                padding: "8px 10px",
                borderRadius: 10,
                border: (infoTab === k || (infoTab === "register" && k === "details")) ? "none" : "1.5px solid #E2E8F0",
                background: (infoTab === k || (infoTab === "register" && k === "details")) ? "#166534" : "#FFFFFF",
                color: (infoTab === k || (infoTab === "register" && k === "details")) ? "#FFFFFF" : "#64748B",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {(infoTab === "details" || infoTab === "register") && <AuctionDetailsCard auction={auction}/>}
        {infoTab === "players" && <RegisteredPlayersList auctionId={auctionId}/>}
        {infoTab === "teams" && <TournamentTeamsAndSquads auctionId={auctionId}/>}
        {infoTab === "sponsors" && <TournamentSponsorsList auctionId={auctionId}/>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAF8", fontFamily:"var(--font-body)" }}>
      <Header auctionName={auction?.name} organizedBy={auction?.organized_by}/>
      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px 40px" }}>

        <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none" }}>
          {[
            ["register", `📝 Register (₹${Number(auction?.player_entry_fee) > 0 ? Number(auction.player_entry_fee) : 180})`],
            ["details", "📋 Details"],
            ["players", `🏏 Players (${registeredCount})`],
            ["teams", "🛡️ Teams & Squads"],
            ["sponsors", "⭐ Sponsors"]
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setInfoTab(k)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: infoTab === k ? "none" : "1.5px solid #E2E8F0",
                background: infoTab === k ? "#166534" : "#FFFFFF",
                color: infoTab === k ? "#FFFFFF" : "#64748B",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-head)"
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {infoTab === "details" && <AuctionDetailsCard auction={auction}/>}
        {infoTab === "players" && <RegisteredPlayersList auctionId={auctionId}/>}
        {infoTab === "teams" && <TournamentTeamsAndSquads auctionId={auctionId}/>}
        {infoTab === "sponsors" && <TournamentSponsorsList auctionId={auctionId}/>}

        {infoTab === "register" && (
        <div style={{ background:"#FFFFFF", borderRadius:16, padding:"20px 18px", border:"1px solid #E2E8F0" }}>

          <label style={lS}>Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} type="tel" inputMode="numeric" placeholder="10-digit mobile number" style={{ ...iS, marginBottom: lookedUp ? 8 : 16 }}/>
          {lookedUp && (
            <div style={{ fontSize:12, color:"#166534", marginBottom:16, fontWeight:600, background:"rgba(22,101,52,0.08)", border:"1px solid rgba(22,101,52,0.2)", padding:"10px 12px", borderRadius:9, lineHeight:1.5 }}>
              ✓ Found your account! Your details are pre-filled below. You can review or edit any fields, then complete payment to submit.
            </div>
          )}

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
          <input value={birthDate} onChange={e => setBirthDate(e.target.value)} type="date" max={maxBirthDateForMinAge()} style={{ ...iS, marginBottom:16 }}/>

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

          {/* Mandatory Payment Section */}
          <PaymentSection
            auction={auction}
            firstName={firstName}
            receiptFile={receiptFile}
            receiptPreview={receiptPreview}
            setReceiptFile={setReceiptFile}
            setReceiptPreview={setReceiptPreview}
            copiedText={copiedText}
            setCopiedText={setCopiedText}
          />

          {error && <div style={{ padding:"10px 12px", background:"rgba(231,76,60,0.08)", borderRadius:9, color:"#EF4444", fontSize:12, marginBottom:16 }}>{error}</div>}

          <button onClick={submit} disabled={busy} style={{ width:"100%", padding:"14px", borderRadius:10, background:"#166534", border:"none", color:"#FFFFFF", fontSize:14, fontWeight:800, cursor:busy?"not-allowed":"pointer", opacity:busy?0.6:1, fontFamily:"var(--font-head)" }}>
            {busy ? "Registering..." : "Register for Auction"}
          </button>
        </div>
        )}
      </div>
    </div>
  )
}
