export const TIME_SLOTS = [
  "5:00 AM - 7:00 AM","6:00 AM - 8:00 AM",
  "7:00 AM - 9:00 AM","8:00 AM - 10:00 AM",
  "4:00 PM - 6:00 PM","5:00 PM - 7:00 PM",
  "6:00 PM - 8:00 PM","7:00 PM - 9:00 PM",
]
export const TEAMS = ["Dominators","Thunderbolts","Warriors","Challengers","Strikers","Titans"]
export const ADMIN_PASSWORD = "cricket123"
export const PAL = ["#1D9E75","#185FA5","#BA7517","#D4537E","#534AB7","#3B6D11","#7c3aed","#0F6E56"]
export const aColor = id => PAL[id % PAL.length]
export const initials = name => name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
export const fmtDate = d => new Date(d+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})
export const dayName = d => new Date(d+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long"})
