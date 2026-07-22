import { dayName, fmtDate } from "../constants.js"
export function waInvite(match) {
  return `🏏 *Match Invite - ${match.team}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nYou have been personally selected.\nPlease confirm your availability.\n\n✅ Available   ❌ Not Available\n\n_This is a private invite._`
}
export function waPublicLink(match, baseUrl) {
  const link = `${baseUrl}/join/${match.invite_token}`
  return `🏏 *Match Availability - ${match.team}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nTap the link below to confirm your availability:\n\n👇 *${link}*\n\n_Please respond as soon as you can._`
}
export function waPayment(match, matchPlayers, expenses) {
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const pp = confirmed.length > 0 ? Math.round(total / confirmed.length) : 0
  const lines = expenses.map(e => `• ${e.label}: ₹${e.amount} / ${confirmed.length} = ₹${Math.round(e.amount / (confirmed.length || 1))}`).join("\n")
  return `💰 *Payment Request*\n${match.team} - ${dayName(match.date)}\n\n${lines}\n\n*Your share: ₹${pp}*\n\nPay: cricketclub@upi`
}
export function waReminder(match, matchPlayers = []) {
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const list = confirmed.length > 0 ? confirmed.map((mp, i) => `${i + 1}. ${mp.players?.name || "Player"}`).join("\n") : "No one confirmed yet."
  return `⏰ *Match Reminder - ${match.team}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\n✅ *Confirmed Squad (${confirmed.length}):*\n${list}\n\nMatch starts soon! Please be on time 🏏`
}

export function waInviteWithLink(match, baseUrl) {
  const link = `${baseUrl}/join/${match.invite_token}`
  return `🏏 *Match Invite - ${match.team}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nYou've been selected! Tap the link below to confirm your availability in the app:\n\n👇\n${link}\n\n_Log in or register to respond._`
}

export function waSquadFull(match, matchPlayers = []) {
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const list = confirmed.length > 0 ? confirmed.map((mp, i) => `${i + 1}. ${mp.players?.name || "Player"}`).join("\n") : ""
  return `🔒 *Squad Full - ${match.team}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nThe squad is now full! ✅\n\n*Confirmed Squad (${confirmed.length}):*\n${list}\n\nSee you on the field 🏏`
}
