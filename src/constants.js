export const TIME_SLOTS = [
  "5:00 AM - 7:00 AM","6:00 AM - 8:00 AM",
  "7:00 AM - 9:00 AM","8:00 AM - 10:00 AM",
  "4:00 PM - 6:00 PM","5:00 PM - 7:00 PM",
  "6:00 PM - 8:00 PM","7:00 PM - 9:00 PM",
]
export const ADMIN_PASSWORD = "Cricket2026"
export const ADMIN_PHONE = "9897439743"
export const ADMIN_UPI = "9897439743@okbizaxis"
export const PAL = ["#1D9E75","#8B1E2E","#BA7517","#0F6E56","#7A4F13","#3B6D11","#A6192E","#5B7C4A"]
export const aColor = id => PAL[id % PAL.length]
export const initials = name => name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
export const teamInitials = name => name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
export const fmtDate = d => new Date(d+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})
export const dayName = d => new Date(d+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long"})
export const matchTitle = m => m.our_team ? `${m.our_team} vs ${m.team}` : m.team

export const AUCTION_PLANS = [
  { id: "free",   label: "Free",   maxTeams: 3,  price: 0 },
  { id: "plan2",  label: "Plan 2", maxTeams: 4,  price: 1999 },
  { id: "plan2b", label: "Plan 2B", maxTeams: 5,  price: 2249 },
  { id: "plan3",  label: "Plan 3", maxTeams: 6,  price: 2499 },
  { id: "plan4",  label: "Plan 4", maxTeams: 8,  price: 2999 },
  { id: "plan5",  label: "Plan 5", maxTeams: 12, price: 3999 },
  { id: "plan6",  label: "Plan 6", maxTeams: 16, price: 4999 },
]
export const auctionPlanById = id => AUCTION_PLANS.find(p => p.id === id) || AUCTION_PLANS[0]

export const MIN_REGISTRATION_AGE = 15

export const DEFAULT_SQUAD_TARGET = 9
export const MIN_PLAYER_RESERVE = 1000

export function calculateMaxBid(purseRemaining, currentSquadCount, squadTarget = DEFAULT_SQUAD_TARGET, minReserve = MIN_PLAYER_RESERVE) {
  if (currentSquadCount >= squadTarget) return 0
  const remainingSlotsNeeded = Math.max(0, squadTarget - currentSquadCount)
  const slotsAfterCurrent = Math.max(0, remainingSlotsNeeded - 1)
  const reserveNeeded = slotsAfterCurrent * minReserve
  return Math.max(0, (purseRemaining || 0) - reserveNeeded)
}

export function formatCoins(amount) {
  return `🪙 ${Number(amount || 0).toLocaleString("en-IN")}`
}

// The latest birth date that still satisfies the minimum age — use this as
// a date input's `max` so the calendar picker itself only offers valid dates,
// rather than letting someone pick an invalid one and rejecting it after.
export function maxBirthDateForMinAge() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - MIN_REGISTRATION_AGE)
  return d.toISOString().split("T")[0]
}

// Letters, spaces, apostrophes, hyphens, periods only — no digits or symbols.
export const isValidName = s => /^[A-Za-z\s'.-]+$/.test((s || "").trim()) && (s || "").trim().length > 0

// Returns an error message string if invalid, or null if the birth date is valid
// (not in the future, and results in an age of at least MIN_REGISTRATION_AGE).
export function birthDateError(birthDate) {
  if (!birthDate) return "Please enter a date of birth."
  const dob = new Date(birthDate + "T00:00:00")
  if (isNaN(dob.getTime())) return "Please enter a valid date of birth."
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dob > today) return "Date of birth can't be in the future."
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  if (age < MIN_REGISTRATION_AGE) return `Players must be at least ${MIN_REGISTRATION_AGE} years old to register.`
  return null
}

export function exportTeamRosterCsv(team, auctionPlayers, auctionName = "Cricket Tournament") {
  if (!team) return
  const squad = (auctionPlayers || [])
    .filter(p => p.sold_team_id === team.id)
    .sort((a,b) => {
      const aCap = a.is_captain || a.status === "captain" || (team.captain_player_id && a.id === team.captain_player_id) ? 1 : 0
      const bCap = b.is_captain || b.status === "captain" || (team.captain_player_id && b.id === team.captain_player_id) ? 1 : 0
      return bCap - aCap
    })

  if (squad.length === 0) {
    alert(`No players found in ${team.name}'s squad yet. Players will appear here once acquired in the auction.`)
    return
  }

  const clean = val => {
    if (val === null || val === undefined) return '""'
    return `"${String(val).replace(/"/g, '""')}"`
  }

  const headers = [
    "S.No",
    "Player Name",
    "Team Role",
    "Playing Role",
    "Jersey Number",
    "Jersey Size",
    "City",
    "Date of Birth",
    "Mobile Number",
    "Price Paid (Coins)",
    "Status"
  ]

  const rows = squad.map((p, idx) => {
    const isCap = p.is_captain || p.status === "captain" || (team.captain_player_id && p.id === team.captain_player_id)
    const teamRole = isCap ? "Captain" : "Squad Member"
    const priceStr = isCap ? "0 (Captain)" : `🪙 ${Number(p.sold_price || 0).toLocaleString("en-IN")}`
    return [
      idx + 1,
      clean(p.name || ""),
      clean(teamRole),
      clean(p.playing_role || "—"),
      clean(p.jersey_number || "—"),
      clean(p.jersey_size || "—"),
      clean(p.city || "—"),
      clean(p.birth_date || "—"),
      clean(p.phone || "—"),
      clean(priceStr),
      clean(isCap ? "Captain" : (p.status || "Sold"))
    ].join(",")
  })

  const titleLine = clean(`Tournament: ${auctionName} — Team Roster: ${team.name}`)
  const metaLine = clean(`Captain: ${team.captain_name || "—"}${team.captain_phone ? ` (${team.captain_phone})` : ""} | Owner: ${team.owner_name || "—"}${team.owner_phone ? ` (${team.owner_phone})` : ""} | Starting Purse: 🪙 ${Number(team.purse_total || 0).toLocaleString("en-IN")} | Remaining Purse: 🪙 ${Number(team.purse_remaining || 0).toLocaleString("en-IN")} | Squad: ${squad.length}/9`)

  const csvContent = [
    titleLine,
    metaLine,
    "",
    headers.join(","),
    ...rows
  ].join("\r\n")

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const fileName = `${(team.name || "Team").replace(/[^a-zA-Z0-9_-]/g, "_")}_Roster.csv`
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function shareTeamOnWhatsApp(team, auction) {
  if (!team) return
  const origin = window.location.origin
  const code = auction?.auction_code || ""
  const teamLink = `${origin}/team-view/${code}/${team.id}`
  const targetPhone = (team.captain_phone || team.owner_phone || "").replace(/[^0-9]/g, "").slice(-10)
  const targetName = team.captain_name || team.owner_name || team.name
  const auctionName = auction?.name || "Selected Sports Cricket Tournament"

  const text = `🏏 *${auctionName}*\n\nHi ${targetName},\nHere is your private team link to view *${team.name}* squad, purse wallet, and live auction roster:\n👉 ${teamLink}\n\nGood luck for the auction!`

  const waUrl = targetPhone
    ? `https://wa.me/91${targetPhone}?text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
  window.open(waUrl, "_blank")
}

export function exportTeamRosterPdf(team, auctionPlayers, auctionName = "Cricket Tournament") {
  if (!team) return
  const squad = (auctionPlayers || [])
    .filter(p => p.sold_team_id === team.id)
    .sort((a,b) => {
      const aCap = a.is_captain || a.status === "captain" || (team.captain_player_id && a.id === team.captain_player_id) ? 1 : 0
      const bCap = b.is_captain || b.status === "captain" || (team.captain_player_id && b.id === team.captain_player_id) ? 1 : 0
      return bCap - aCap
    })

  if (squad.length === 0) {
    alert(`No players found in ${team.name}'s squad yet. Players will appear here once acquired in the auction.`)
    return
  }

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))

  const rows = squad.map((p, idx) => {
    const isCap = p.is_captain || p.status === "captain" || (team.captain_player_id && p.id === team.captain_player_id)
    const teamRole = isCap ? '<span class="captain-badge">👑 CAPTAIN</span>' : '<span class="player-badge">PLAYER</span>'
    const priceStr = isCap ? "🪙 0 (Captain)" : `🪙 ${Number(p.sold_price || 0).toLocaleString("en-IN")}`
    const dob = p.birth_date ? p.birth_date : "—"
    return `
      <tr>
        <td style="text-align:center;font-weight:700;color:#64748B;">${idx + 1}</td>
        <td>
          <div style="font-weight:800;color:#0F172A;font-size:13px;">${esc(p.name || "")}</div>
        </td>
        <td>${teamRole}</td>
        <td><strong>${esc(p.playing_role || "—")}</strong></td>
        <td style="text-align:center;">${esc(p.jersey_number ? `#${p.jersey_number}` : "—")}${p.jersey_size ? ` (${esc(p.jersey_size)})` : ""}</td>
        <td>${esc(p.city || "—")}</td>
        <td>${esc(dob)}</td>
        <td><strong style="color:#166534;">${esc(p.phone || "—")}</strong></td>
        <td style="font-weight:800;color:#166534;text-align:right;">${priceStr}</td>
        <td style="text-align:center;"><span class="status-sold">${esc(isCap ? "Captain" : "Sold")}</span></td>
      </tr>
    `
  }).join("")

  const spent = (team.purse_total || 0) - (team.purse_remaining || 0)
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${esc(team.name)} — Official Team Roster</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 14mm 12mm;
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      margin: 0;
      padding: 16px;
      font-size: 12px;
    }
    .header {
      border-bottom: 2.5px solid #166534;
      padding-bottom: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tournament-tag {
      font-size: 11px;
      color: #B8860B;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .team-title {
      font-size: 24px;
      font-weight: 900;
      color: #166534;
      margin: 2px 0 0;
      letter-spacing: -0.5px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: #F8FAF8;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 10px;
      color: #64748B;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 2px;
    }
    .purse-val {
      color: #166534;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    th {
      background: #166534;
      color: #FFFFFF;
      text-align: left;
      padding: 8px 9px;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 800;
    }
    td {
      padding: 7px 9px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 11.5px;
    }
    tr:nth-child(even) td {
      background: #FAFCFA;
    }
    .captain-badge {
      background: #B8860B;
      color: #FFFFFF;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 800;
      display: inline-block;
    }
    .player-badge {
      background: #E2E8F0;
      color: #475569;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 700;
      display: inline-block;
    }
    .status-sold {
      background: #DCFCE7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #64748B;
    }
    .no-print-bar {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 10px 14px;
      border-radius: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .no-print-btn {
      background: #166534;
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: 8px;
      border: none;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
    }
    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span style="font-weight:700;color:#166534;font-size:13px;">📄 Team Roster PDF: Click "Save as PDF" in the print dialog.</span>
    <button class="no-print-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
  </div>

  <div class="header">
    <div class="brand">
      <img src="${window.location.origin}/logo-full.png?v=1" alt="Selected Sports" style="height:44px;width:auto;" onerror="this.style.display='none'"/>
      <div>
        <div class="tournament-tag">${esc(auctionName || "Selected Sports Cricket Tournament")}</div>
        <h1 class="team-title">${esc(team.name)}</h1>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;font-weight:800;color:#0F172A;">OFFICIAL SQUAD ROSTER</div>
      <div style="font-size:10px;color:#64748B;margin-top:2px;">Generated: ${dateStr}</div>
      <div style="font-size:10px;color:#166534;font-weight:700;margin-top:2px;">Squad Size: ${squad.length} / 9 Players</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Team Captain</span>
      <span class="meta-val">👑 ${esc(team.captain_name || "—")}</span>
      ${team.captain_phone ? `<span style="font-size:10.5px;color:#64748B;margin-top:2px;">📞 ${esc(team.captain_phone)}</span>` : ""}
    </div>
    <div class="meta-item">
      <span class="meta-label">Team Owner</span>
      <span class="meta-val">${esc(team.owner_name || "—")}</span>
      ${team.owner_phone ? `<span style="font-size:10.5px;color:#64748B;margin-top:2px;">📞 ${esc(team.owner_phone)}</span>` : ""}
    </div>
    <div class="meta-item">
      <span class="meta-label">Purse Budget</span>
      <span class="meta-val purse-val">🪙 ${Number(team.purse_total || 0).toLocaleString("en-IN")}</span>
      <span style="font-size:10.5px;color:#EF4444;margin-top:2px;">Spent: 🪙 ${Number(spent || 0).toLocaleString("en-IN")}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Remaining Purse</span>
      <span class="meta-val purse-val">🪙 ${Number(team.purse_remaining || 0).toLocaleString("en-IN")}</span>
      <span style="font-size:10.5px;color:#64748B;margin-top:2px;">Available to Bid</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:36px;text-align:center;">#</th>
        <th>Player Name</th>
        <th style="width:95px;">Team Role</th>
        <th style="width:110px;">Playing Role</th>
        <th style="width:90px;text-align:center;">Jersey</th>
        <th style="width:95px;">City</th>
        <th style="width:90px;">Date of Birth</th>
        <th style="width:110px;">Mobile Number</th>
        <th style="width:105px;text-align:right;">Price Paid</th>
        <th style="width:65px;text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="footer">
    <div>Official Roster Document · Selected Sports Auction Platform</div>
    <div>Confidential &amp; Proprietary · Tournament Organizer &amp; Team Management Copy</div>
  </div>
</body>
</html>`

  const w = window.open("", "_blank")
  if (!w) {
    alert("Please allow pop-ups to open the PDF export.")
    return
  }
  w.document.write(html)
  w.document.close()
  w.onload = () => {
    setTimeout(() => {
      w.print()
    }, 250)
  }
}

export const PUNE_CRICKET_GROUNDS = [
  { name: "Shinde High School Cricket Ground", location: "Sahakar Nagar, Pune" },
  { name: "Poona Club Cricket Ground", location: "Camp, Pune" },
  { name: "PYC Hindu Gymkhana", location: "Deccan Gymkhana, Pune" },
  { name: "Law College Cricket Ground", location: "Erandwane, Pune" },
  { name: "Deccan Gymkhana Cricket Ground", location: "Deccan, Pune" },
  { name: "Nehru Stadium", location: "Swargate, Pune" },
  { name: "Fergusson College Ground", location: "FC Road, Pune" },
  { name: "SP College Ground", location: "Sadashiv Peth, Pune" },
  { name: "Eagle Turf", location: "Khadi Machine Chowk, Pune" },
  { name: "MM Turf Play Ground", location: "Parge Nagar, Pune" },
  { name: "Parge Play On", location: "Parge Nagar, Pune" },
  { name: "Anfield Turf", location: "Mohammadwadi, Pune" },
  { name: "Kanade Sports Club - Full Ground", location: "Pisoli, Pune" },
  { name: "Kanade Sports Club - Single", location: "Undri, Pune" },
  { name: "Kanade Sports Club - Indoor", location: "Pisoli, Pune" },
  { name: "Blades Cricket Ground", location: "Bavdhan, Pune" },
  { name: "Legends Cricket Ground", location: "Hadapsar, Pune" },
  { name: "Champions Turf & Cricket Ground", location: "Viman Nagar, Pune" },
  { name: "The Turf", location: "Baner, Pune" },
  { name: "Oxford Cricket Resort Ground", location: "Bavdhan, Pune" },
  { name: "Kharadi Sports Complex Cricket Ground", location: "Kharadi, Pune" },
  { name: "Wakad Cricket Ground", location: "Wakad, Pune" },
  { name: "DY Patil Cricket Stadium", location: "Akurdi, Pune" },
  { name: "Telco Cricket Ground", location: "Pimpri-Chinchwad, Pune" }
]

export async function searchMapGrounds(query = "", city = "Pune", state = "Maharashtra") {
  const q = (query || "").trim()
  const c = (city || "Pune").trim()
  const s = (state || "Maharashtra").trim()
  const results = []
  const seen = new Set()

  // 1. If city is Pune or unspecified, search our curated list first for instant hits
  if (!c || c.toLowerCase() === "pune") {
    const localMatches = PUNE_CRICKET_GROUNDS.filter(g => {
      if (!q) return true
      const qLower = q.toLowerCase()
      return g.name.toLowerCase().includes(qLower) || g.location.toLowerCase().includes(qLower)
    })
    for (const g of localMatches) {
      if (!seen.has(g.name.toLowerCase())) {
        seen.add(g.name.toLowerCase())
        results.push({
          name: g.name,
          location: g.location,
          maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.name + " " + g.location)}`,
          isCurated: true
        })
      }
    }
  }

  // 2. Fetch live from OpenStreetMap Nominatim for the specific query
  try {
    const searchParam = q
      ? `${q} cricket ground ${c} ${s}`
      : `cricket ground in ${c} ${s}`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchParam)}&limit=10&addressdetails=1`
    const res = await fetch(url, { headers: { "Accept": "application/json" } })
    if (res.ok) {
      const data = await res.json()
      for (const item of (data || [])) {
        const rawName = item.name || (item.display_name ? item.display_name.split(",")[0] : "")
        const cleanName = rawName.replace(/,\s*India$/i, "").trim()
        if (cleanName && !seen.has(cleanName.toLowerCase())) {
          seen.add(cleanName.toLowerCase())
          // Extract address/neighborhood if available
          const addr = item.address || {}
          const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || c
          const locStr = `${suburb}, ${c}`
          results.push({
            name: cleanName,
            location: locStr,
            maps_link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName + " " + c)}`,
            isMap: true
          })
        }
      }
    }
  } catch (err) {
    console.warn("Map grounds search failed:", err)
  }

  return results
}

export async function searchPuneMapGrounds(query = "") {
  return searchMapGrounds(query, "Pune", "Maharashtra")
}

export function generateAuctionPlayerInvite(auction, origin) {
  if (!auction) return ""
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "https://selectedsports.github.io")
  const regLink = `${base}/auction-register/${auction.auction_code || ""}`
  const dateFormatted = auction.auction_date ? fmtDate(auction.auction_date) : "To Be Announced"
  const timeFormatted = auction.auction_time || "To Be Announced"
  const venue = auction.location || "Ground / Venue to be confirmed"
  const org = auction.organized_by ? `\n🛡️ *Organized By:* ${auction.organized_by}` : ""
  const fee = Number(auction.player_entry_fee) > 0 ? Number(auction.player_entry_fee) : 180
  const feeText = `₹${fee}`

  return `🏏 *PLAYER REGISTRATION OPEN — ${(auction.name || "CRICKET TOURNAMENT").toUpperCase()}* 🏏${org}

📅 *Auction Date:* ${dateFormatted}
⏰ *Auction Time:* ${timeFormatted}
📍 *Venue:* ${venue}
💰 *Player Entry Fee:* ${feeText} (Mandatory for player registration)

📢 *ATTENTION CRICKET PLAYERS:*
Official player registrations are now LIVE! All players must register before the auction deadline to enter the player pool and get picked by franchise teams.

📝 *How to Register:*
1️⃣ Click the official registration link below
2️⃣ Enter your Mobile Number (existing player details will auto-fill)
3️⃣ Review & edit your Name, Playing Role, City, Jersey # & Profile Photo
4️⃣ Pay the ${feeText} registration fee via Google Pay / UPI & attach payment screenshot
5️⃣ Submit your registration — the organizer will verify your payment and approve you into the live auction pool!

👉 *REGISTER NOW VIA OFFICIAL LINK:*
🔗 ${regLink}

⚡ _Register and transfer the entry fee before the deadline to ensure your spot in the auction!_
🏆 *Selected Sports Cricket Platform*`
}

