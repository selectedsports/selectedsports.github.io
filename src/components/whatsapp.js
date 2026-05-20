import { dayName, fmtDate } from "../constants.js"
export function waInvite(match) {
  return `🏏 *Match Invite - ${match.team}*\n📅 ${dayName(match.date)}, ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nYou have been personally selected.\nPlease confirm your availability.\n\n✅ Available   ❌ Not Available\n\n_This is a private invite._`
}
export function waPublicLink(match, baseUrl) {
  const link = `${baseUrl}/join/${match.invite_token}`
  return `🏏 *Match Availability - ${match.team}*\n📅 ${dayName(match.date)}, ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nTap the link to mark your availability.\n*No login needed - just enter your name.*\n\n👇 *${link}*\n\n_Respond by tomorrow._`
}
export function waPayment(match, matchPlayers, expenses) {
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const pp = confirmed.length > 0 ? Math.round(total / confirmed.length) : 0
  const lines = expenses.map(e => `• ${e.label}: ₹${e.amount} / ${confirmed.length} = ₹${Math.round(e.amount / (confirmed.length || 1))}`).join("\n")
  return `💰 *Payment Request*\n${match.team} - ${dayName(match.date)}\n\n${lines}\n\n*Your share: ₹${pp}*\n\nPay: cricketclub@upi`
}
export function waReminder(match) {
  return `⏰ *Match Reminder - ${match.team}*\n📅 ${dayName(match.date)}, ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nMatch starts soon! Please be on time 🏏`
}
