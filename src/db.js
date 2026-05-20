import { supabase } from "./supabase.js"
export async function fetchPlayers() {
  const { data, error } = await supabase.from("players").select("*").order("name")
  if (error) throw error
  return data
}
export async function addPlayer(name, phone, pin = "1234") {
  const { data, error } = await supabase.from("players").insert({ name, phone, pin }).select().single()
  if (error) throw error
  return data
}
export async function fetchGrounds() {
  const { data, error } = await supabase.from("grounds").select("*").order("name")
  if (error) throw error
  return data
}
export async function fetchMatches() {
  const { data, error } = await supabase.from("matches").select("*").order("date", { ascending: false })
  if (error) throw error
  return data
}
export async function fetchMatchByToken(token) {
  const { data, error } = await supabase.from("matches").select("*").eq("invite_token", token).single()
  if (error) throw error
  return data
}
export async function createMatch({ date, time_slot, ground, team, type, max_players }) {
  const { data, error } = await supabase.from("matches").insert({ date, time_slot, ground, team, type, max_players, status: "upcoming", link_active: false }).select().single()
  if (error) throw error
  return data
}
export async function updateMatchStatus(id, status) {
  const { error } = await supabase.from("matches").update({ status }).eq("id", id)
  if (error) throw error
}
export async function toggleMatchLink(id, active) {
  const { error } = await supabase.from("matches").update({ link_active: active }).eq("id", id)
  if (error) throw error
}
export async function fetchMatchPlayers(match_id) {
  const { data, error } = await supabase.from("match_players").select("*, players(id, name, phone)").eq("match_id", match_id)
  if (error) throw error
  return data
}
export async function notifyPlayer(match_id, player_id) {
  const { error } = await supabase.from("match_players").upsert({ match_id, player_id, status: "pending" }, { onConflict: "match_id,player_id" })
  if (error) throw error
}
export async function removePlayerFromMatch(match_id, player_id) {
  const { error } = await supabase.from("match_players").delete().eq("match_id", match_id).eq("player_id", player_id)
  if (error) throw error
}
export async function setPlayerStatus(match_id, player_id, status) {
  const { error } = await supabase.from("match_players").update({ status }).eq("match_id", match_id).eq("player_id", player_id)
  if (error) throw error
}
export async function fetchPublicResponses(match_id) {
  const { data, error } = await supabase.from("public_responses").select("*").eq("match_id", match_id).order("created_at")
  if (error) throw error
  return data
}
export async function submitPublicResponse(match_id, name, phone, availability) {
  const { data: existing } = await supabase.from("public_responses").select("id").eq("match_id", match_id).ilike("name", name.trim()).maybeSingle()
  if (existing) {
    const { error } = await supabase.from("public_responses").update({ availability, phone, approved: null }).eq("id", existing.id)
    if (error) throw error
    return { updated: true }
  }
  const { data, error } = await supabase.from("public_responses").insert({ match_id, name: name.trim(), phone: phone?.trim() || null, availability, approved: null }).select().single()
  if (error) throw error
  return data
}
export async function approvePublicResponse(responseId, matchId, name, phone, maxPlayers) {
  const { data: existing } = await supabase.from("match_players").select("id").eq("match_id", matchId).eq("status", "confirmed")
  const confirmedCount = existing?.length || 0
  const willWaitlist = confirmedCount >= maxPlayers
  let player = null
  const { data: found } = await supabase.from("players").select("*").ilike("name", name.trim()).maybeSingle()
  if (found) {
    player = found
    if (phone && !found.phone) await supabase.from("players").update({ phone }).eq("id", found.id)
  } else {
    const { data: created, error: ce } = await supabase.from("players").insert({ name: name.trim(), phone: phone?.trim() || null, pin: "1234" }).select().single()
    if (ce) throw ce
    player = created
  }
  const status = willWaitlist ? "waitlist" : "confirmed"
  await supabase.from("match_players").upsert({ match_id: matchId, player_id: player.id, status }, { onConflict: "match_id,player_id" })
  const { error } = await supabase.from("public_responses").update({ approved: true, player_id: player.id }).eq("id", responseId)
  if (error) throw error
  return { player, status }
}
export async function rejectPublicResponse(responseId) {
  const { error } = await supabase.from("public_responses").update({ approved: false }).eq("id", responseId)
  if (error) throw error
}
export async function fetchExpenses(match_id) {
  const { data, error } = await supabase.from("expenses").select("*").eq("match_id", match_id)
  if (error) throw error
  return data
}
export async function addExpense(match_id, label, amount) {
  const { data, error } = await supabase.from("expenses").insert({ match_id, label, amount }).select().single()
  if (error) throw error
  return data
}
export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (error) throw error
}
export async function fetchPayments(match_id) {
  const { data, error } = await supabase.from("payments").select("*").eq("match_id", match_id)
  if (error) throw error
  return data
}
export async function togglePayment(match_id, player_id, paid) {
  const { error } = await supabase.from("payments").upsert({ match_id, player_id, paid }, { onConflict: "match_id,player_id" })
  if (error) throw error
}
export async function fetchChat(match_id) {
  const { data, error } = await supabase.from("chat_messages").select("*").eq("match_id", match_id).order("sent_at")
  if (error) throw error
  return data
}
export async function sendMessage(match_id, sender, message) {
  const { data, error } = await supabase.from("chat_messages").insert({ match_id, sender, message }).select().single()
  if (error) throw error
  return data
}
export function subscribeToChat(match_id, callback) {
  return supabase.channel("chat:" + match_id).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `match_id=eq.${match_id}` }, payload => callback(payload.new)).subscribe()
}
