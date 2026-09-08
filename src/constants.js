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
