export const TIME_SLOTS = [
  "5:00 AM - 7:00 AM","6:00 AM - 8:00 AM",
  "7:00 AM - 9:00 AM","8:00 AM - 10:00 AM",
  "4:00 PM - 6:00 PM","5:00 PM - 7:00 PM",
  "6:00 PM - 8:00 PM","7:00 PM - 9:00 PM",
]
export const ADMIN_PASSWORD = "Cricket2026"
export const ADMIN_PHONE = "9897439743"
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
  { id: "plan3",  label: "Plan 3", maxTeams: 6,  price: 2499 },
  { id: "plan4",  label: "Plan 4", maxTeams: 8,  price: 2999 },
  { id: "plan5",  label: "Plan 5", maxTeams: 12, price: 3999 },
  { id: "plan6",  label: "Plan 6", maxTeams: 16, price: 4999 },
]
export const auctionPlanById = id => AUCTION_PLANS.find(p => p.id === id) || AUCTION_PLANS[0]

export const MIN_REGISTRATION_AGE = 15

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
