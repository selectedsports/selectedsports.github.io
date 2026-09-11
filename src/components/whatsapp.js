import { dayName, fmtDate, matchTitle } from "../constants.js"
export function waInvite(match) {
  return `🏏 *Match Invite - ${matchTitle(match)}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nYou have been personally selected.\nPlease confirm your availability.\n\n✅ Available   ❌ Not Available\n\n_This is a private invite._`
}
export function waPublicLink(match, baseUrl) {
  const link = `${baseUrl}/join/${match.invite_token}`
  return `🏏 *Match Availability - ${matchTitle(match)}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nTap the link below to confirm your availability:\n\n👇 *${link}*\n\n_Please respond as soon as you can._`
}
export function waPayment(match, matchPlayers, expenses) {
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const pp = confirmed.length > 0 ? Math.round(total / confirmed.length) : 0
  const lines = expenses.map(e => `• ${e.label}: ₹${e.amount} / ${confirmed.length} = ₹${Math.round(e.amount / (confirmed.length || 1))}`).join("\n")
  return `💰 *Payment Request*\n${matchTitle(match)} - ${dayName(match.date)}\n\n${lines}\n\n*Your share: ₹${pp}*\n\nPay: cricketclub@upi`
}
export function waReminder(match, matchPlayers = []) {
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const list = confirmed.length > 0 ? confirmed.map((mp, i) => `${i + 1}. ${mp.players?.name || "Player"}`).join("\n") : "No one confirmed yet."
  return `⏰ *Match Reminder - ${matchTitle(match)}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\n✅ *Confirmed Squad (${confirmed.length}):*\n${list}\n\nMatch starts soon! Please be on time 🏏`
}

export function waInviteWithLink(match, baseUrl) {
  const link = `${baseUrl}/join/${match.invite_token}`
  return `🏏 *Match Invite - ${matchTitle(match)}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nYou've been selected! Tap the link below to confirm your availability in the app:\n\n👇\n${link}\n\n_Log in or register to respond._`
}

export function waSquadFull(match, matchPlayers = []) {
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const waitlist = matchPlayers.filter(mp => mp.status === "waitlist")
  const list = confirmed.length > 0 ? confirmed.map((mp, i) => `${i + 1}. ${mp.players?.name || "Player"}`).join("\n") : ""
  const waitlistBlock = waitlist.length > 0
    ? `\n\n*Waiting List (${waitlist.length}):*\n${waitlist.map((mp, i) => `${i + 1}. ${mp.players?.name || "Player"}`).join("\n")}`
    : ""
  return `🔒 *Squad Full - ${matchTitle(match)}*\n📅 ${fmtDate(match.date)}\n⏰ ${match.time_slot}\n📍 ${match.ground}\n\nThe squad is now full! ✅\n\n*Confirmed Squad (${confirmed.length}):*\n${list}${waitlistBlock}\n\nSee you on the field 🏏`
}

export function waGroundBookingConfirmation(booking) {
  const balanceStr = Number(booking.balance_due || 0) > 0
    ? `⚠️ *Balance Due: ₹${Number(booking.balance_due).toLocaleString("en-IN")}* (To be settled at ground)\n`
    : `✅ *Payment: Fully Paid & Confirmed*\n`

  const advanceStr = Number(booking.advance_paid || 0) > 0
    ? `💵 *Advance Paid:* ₹${Number(booking.advance_paid).toLocaleString("en-IN")}\n`
    : ""

  const amenitiesStr = booking.amenities && booking.amenities.length > 0
    ? `✨ *Amenities:* ${booking.amenities.join(", ")}\n`
    : ""

  const teamStr = booking.customer_team ? ` (${booking.customer_team})` : ""

  return `🏏 *GROUND BOOKING CONFIRMATION*\n\n` +
    `🏟️ *Ground:* ${booking.ground_name || "Match Ground"}\n` +
    `📅 *Date:* ${fmtDate(booking.date)}\n` +
    `⏰ *Slot Timing:* ${booking.time_slot || "Full Slot"}\n` +
    `🏏 *Slot Type:* ${booking.slot_type || "Cricket Match"}\n` +
    `👤 *Booked By:* ${booking.customer_name}${teamStr}\n` +
    `💰 *Total Rent:* ₹${Number(booking.rate || 0).toLocaleString("en-IN")}\n` +
    advanceStr +
    balanceStr +
    amenitiesStr +
    (booking.notes ? `📝 *Notes:* ${booking.notes}\n` : "") +
    `\n_Your slot is reserved. Please report 15 mins prior to the slot timing._\n` +
    `_Selected Sports Ground Desk_`
}
