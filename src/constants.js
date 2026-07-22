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
