import { supabase } from "./supabase.js"

export async function fetchPlayers() {
  const { data, error } = await supabase.from("players").select("*").order("name")
  if (error) throw error
  return data
}
export async function addPlayer(name, phone, pin = "1234", created_by = null) {
  const { data, error } = await supabase.from("players").insert({ name, phone, pin, created_by }).select().single()
  if (error) throw error
  return data
}
export async function fetchPlayersByCreator(creator_id) {
  const { data, error } = await supabase.from("players").select("*").eq("created_by", creator_id).order("name")
  if (error) throw error
  return data
}
export async function updatePlayer(id, name, phone, pin, city) {
  const { error } = await supabase.from("players").update({ name, phone, pin, city }).eq("id", id)
  if (error) throw error
}
export async function deletePlayer(id) {
  const { error } = await supabase.from("players").delete().eq("id", id)
  if (error) throw error
}
export async function fetchGrounds() {
  const { data, error } = await supabase.from("grounds").select("*").order("name")
  if (error) throw error
  return data
}
export async function addGround(name, location, maps_link, notes) {
  const { error } = await supabase.from("grounds").insert({ name, location, maps_link, notes })
  if (error) throw error
}
export async function updateGround(id, fields) {
  const { error } = await supabase.from("grounds").update(fields).eq("id", id)
  if (error) throw error
}
export async function deleteGround(id) {
  const { error } = await supabase.from("grounds").delete().eq("id", id)
  if (error) throw error
}
export async function fetchTeams() {
  const { data, error } = await supabase.from("teams").select("*").order("name")
  if (error) throw error
  return data
}
export async function addTeam(name, logo_url) {
  const { data, error } = await supabase.from("teams").insert({ name, logo_url }).select().single()
  if (error) throw error
  return data
}
export async function updateTeam(id, name, logo_url) {
  const { error } = await supabase.from("teams").update({ name, logo_url }).eq("id", id)
  if (error) throw error
}
export async function deleteTeam(id) {
  const { error } = await supabase.from("teams").delete().eq("id", id)
  if (error) throw error
}
export async function uploadTeamLogo(file, teamName) {
  const ext = file.name.split(".").pop()
  const path = `team-logos/${teamName.toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("team-assets").upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from("team-assets").getPublicUrl(path)
  return data.publicUrl
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
export async function createMatch({ date, time_slot, ground, team, team_logo, type, max_players, created_by }) {
  const { data, error } = await supabase.from("matches").insert({ date, time_slot, ground, team, team_logo, type, max_players, created_by: created_by || null, status: "upcoming", link_active: false }).select().single()
  if (error) throw error
  return data
}
export async function deleteMatch(id) {
  // Remove related data first (in case cascade isn't set)
  await supabase.from("match_players").delete().eq("match_id", id)
  await supabase.from("expenses").delete().eq("match_id", id)
  await supabase.from("payments").delete().eq("match_id", id)
  await supabase.from("chat_messages").delete().eq("match_id", id)
  await supabase.from("public_responses").delete().eq("match_id", id)
  const { error } = await supabase.from("matches").delete().eq("id", id)
  if (error) throw error
}
export async function updateMatchStatus(id, status) {
  const { error } = await supabase.from("matches").update({ status }).eq("id", id)
  if (error) throw error
}
export async function updateMatchMaxPlayers(id, max_players) {
  const { error } = await supabase.from("matches").update({ max_players }).eq("id", id)
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
export async function confirmPlayerToMatch(match_id, player_id, status) {
  let finalStatus = status || "confirmed"
  let squadJustFilled = false
  let matchInfo = null
  // If confirming (not declining), enforce the squad cap — overflow goes to waitlist
  if (finalStatus === "confirmed") {
    const { data: match } = await supabase.from("matches").select("max_players, team, date").eq("id", match_id).single()
    matchInfo = match
    const cap = match?.max_players || 0
    if (cap > 0) {
      // Is this player already confirmed? (re-confirm shouldn't double-count)
      const { data: existing } = await supabase.from("match_players").select("status").eq("match_id", match_id).eq("player_id", player_id).maybeSingle()
      if (!existing || existing.status !== "confirmed") {
        const { count } = await supabase.from("match_players").select("id", { count: "exact", head: true }).eq("match_id", match_id).eq("status", "confirmed")
        if ((count || 0) >= cap) finalStatus = "waitlist"
        else if ((count || 0) + 1 === cap) squadJustFilled = true
      }
    }
  }
  const { error } = await supabase.from("match_players").upsert({ match_id, player_id, status: finalStatus }, { onConflict: "match_id,player_id" })
  if (error) throw error
  // Squad just reached capacity on this confirmation — let everyone confirmed know
  if (squadJustFilled && finalStatus === "confirmed" && matchInfo) {
    try {
      const { data: confirmedRows } = await supabase.from("match_players").select("player_id").eq("match_id", match_id).eq("status", "confirmed")
      const ids = (confirmedRows || []).map(r => r.player_id)
      const text = `🔒 Squad full for ${matchInfo.team} on ${matchInfo.date}! See you there 🏏`
      await Promise.all(ids.map(pid => sendAdminMessage(pid, "System", text).catch(()=>{})))
    } catch {}
  }
  return finalStatus
}
export async function notifyPlayer(match_id, player_id) {
  const { error } = await supabase.from("match_players").upsert({ match_id, player_id, status: "pending" }, { onConflict: "match_id,player_id" })
  if (error) throw error
}
export async function removePlayerFromMatch(match_id, player_id) {
  const { error } = await supabase.from("match_players").delete().eq("match_id", match_id).eq("player_id", player_id)
  if (error) throw error
  await promoteFromWaitlist(match_id)
}
export async function setPlayerStatus(match_id, player_id, status) {
  const { error } = await supabase.from("match_players").update({ status }).eq("match_id", match_id).eq("player_id", player_id)
  if (error) throw error
  // If this player is no longer confirmed, a spot may have opened
  if (status !== "confirmed") await promoteFromWaitlist(match_id)
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
export async function fetchSettings() {
  const { data, error } = await supabase.from("settings").select("*")
  if (error) throw error
  return Object.fromEntries((data||[]).map(r=>[r.key,r.value]))
}
export async function upsertSetting(key, value) {
  const { error } = await supabase.from("settings").upsert({ key, value }, { onConflict:"key" })
  if (error) throw error
}

export async function registerPlayer(name, phone, pin) {
  const { data, error } = await supabase.from("players").insert({ name, phone, pin, approved: true }).select().single()
  if (error) throw error
  return data
}
export async function fetchPendingPlayers() {
  const { data, error } = await supabase.from("players").select("*").eq("approved", false).order("id", { ascending: false })
  if (error) throw error
  return data
}
export async function approvePlayer(id) {
  const { error } = await supabase.from("players").update({ approved: true }).eq("id", id)
  if (error) throw error
}
export async function rejectPlayer(id) {
  const { error } = await supabase.from("players").delete().eq("id", id)
  if (error) throw error
}

// ── Contributions ─────────────────────────────────────────────────────────────
export async function fetchContributions(player_id) {
  const { data, error } = await supabase.from("contributions").select("*").eq("player_id", player_id).order("date", { ascending: false })
  if (error) throw error
  return data
}
export async function addContribution(player_id, amount, note, date, match_id) {
  const { data, error } = await supabase.from("contributions").insert({ player_id, amount, note: note || null, date: date || new Date().toISOString().split("T")[0], match_id: match_id || null }).select().single()
  if (error) throw error
  return data
}
export async function deleteContribution(id) {
  const { error } = await supabase.from("contributions").delete().eq("id", id)
  if (error) throw error
}
export async function contributionExists(player_id, match_id) {
  if (!match_id) return false
  const { data } = await supabase.from("contributions").select("id").eq("player_id", player_id).eq("match_id", match_id).maybeSingle()
  return !!data
}

export async function fetchStats() {
  const [m, p, g] = await Promise.all([
    supabase.from("matches").select("id", { count: "exact", head: true }),
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("grounds").select("id", { count: "exact", head: true }),
  ])
  return { matches: m.count || 0, players: p.count || 0, venues: g.count || 0 }
}

// Pro member stats: their matches, unique players who joined them, all venues
export async function fetchProStats(proId) {
  const { data: myMatches } = await supabase.from("matches").select("id").eq("created_by", proId)
  const matchIds = (myMatches || []).map(m => m.id)
  let uniquePlayers = 0
  if (matchIds.length > 0) {
    const { data: mps } = await supabase.from("match_players").select("player_id").in("match_id", matchIds)
    uniquePlayers = new Set((mps || []).map(x => x.player_id)).size
  }
  const { count: venueCount } = await supabase.from("grounds").select("id", { count: "exact", head: true })
  return { matches: matchIds.length, players: uniquePlayers, venues: venueCount || 0 }
}
// Player stats: matches they were confirmed for, unique venues they played at
export async function fetchPlayerStats(playerId) {
  const { data: mps } = await supabase.from("match_players").select("match_id, status").eq("player_id", playerId).eq("status", "confirmed")
  const matchIds = (mps || []).map(x => x.match_id)
  let venues = 0
  if (matchIds.length > 0) {
    const { data: matches } = await supabase.from("matches").select("ground").in("id", matchIds)
    venues = new Set((matches || []).map(m => m.ground).filter(Boolean)).size
  }
  return { matches: matchIds.length, venues }
}

// Returns { matchId: confirmedCount } for a list of match ids (one query)
export async function fetchMatchCounts(matchIds) {
  if (!matchIds || matchIds.length === 0) return {}
  const { data } = await supabase.from("match_players").select("match_id, status").in("match_id", matchIds).eq("status", "confirmed")
  const counts = {}
  ;(data || []).forEach(row => { counts[row.match_id] = (counts[row.match_id] || 0) + 1 })
  return counts
}

// If confirmed < cap, promote the oldest waitlisted player to confirmed. Returns promoted player_id or null.
export async function promoteFromWaitlist(match_id) {
  const { data: match } = await supabase.from("matches").select("max_players").eq("id", match_id).single()
  const cap = match?.max_players || 0
  if (cap <= 0) return null
  const { count: confirmedCount } = await supabase.from("match_players").select("id", { count: "exact", head: true }).eq("match_id", match_id).eq("status", "confirmed")
  if ((confirmedCount || 0) >= cap) return null
  // Find oldest waitlisted
  const { data: wl } = await supabase.from("match_players").select("player_id").eq("match_id", match_id).eq("status", "waitlist").order("created_at", { ascending: true }).limit(1)
  if (!wl || wl.length === 0) return null
  const promoteId = wl[0].player_id
  await supabase.from("match_players").update({ status: "confirmed" }).eq("match_id", match_id).eq("player_id", promoteId)
  return promoteId
}

// For a pro member: all players who joined their matches, with per-player stats
export async function fetchProGroupPlayers(proId) {
  // Get pro's matches
  const { data: myMatches } = await supabase.from("matches").select("id").eq("created_by", proId)
  const matchIds = (myMatches || []).map(m => m.id)
  if (matchIds.length === 0) return []
  // Get all match_players rows for these matches, joined with player info
  const { data: rows } = await supabase.from("match_players").select("player_id, status, players(id, name, phone, city)").in("match_id", matchIds)
  // Get contributions for these players (match-based)
  const { data: contribs } = await supabase.from("contributions").select("player_id, amount").in("match_id", matchIds)
  const contribByPlayer = {}
  ;(contribs || []).forEach(c => { contribByPlayer[c.player_id] = (contribByPlayer[c.player_id] || 0) + Number(c.amount) })
  // Aggregate per player
  const map = {}
  ;(rows || []).forEach(r => {
    const p = r.players
    if (!p) return
    if (!map[p.id]) map[p.id] = { id: p.id, name: p.name, phone: p.phone, city: p.city, played: 0, confirmed: 0, declined: 0, contributed: 0 }
    if (r.status === "confirmed") { map[p.id].confirmed++; map[p.id].played++ }
    else if (r.status === "declined") map[p.id].declined++
  })
  Object.values(map).forEach(p => { p.contributed = contribByPlayer[p.id] || 0 })
  // Sort by most matches played
  return Object.values(map).sort((a, b) => b.played - a.played)
}

// Matches this player is invited to / part of (joined with match info)
export async function fetchMyInvites(playerId) {
  const { data, error } = await supabase.from("match_players")
    .select("status, matches(*)")
    .eq("player_id", playerId)
  if (error) throw error
  return (data || []).filter(r => r.matches).map(r => ({ match: r.matches, myStatus: r.status }))
}

export async function updatePlayerUpi(id, upi_id) {
  const { error } = await supabase.from("players").update({ upi_id }).eq("id", id)
  if (error) throw error
}

export async function fetchOrganizerUpi(match) {
  try {
    if (match?.created_by) {
      const { data } = await supabase.from("players").select("upi_id").eq("id", match.created_by).maybeSingle()
      if (data?.upi_id) return data.upi_id
    }
  } catch {}
  try {
    const settings = await fetchSettings()
    return settings?.upi || settings?.upi_id || ""
  } catch { return "" }
}


// ── Admin Messages ─────────────────────────────────────────────────────────────
export async function sendAdminMessage(player_id, sender, message) {
  const { error } = await supabase.from("admin_messages").insert({ player_id, sender, message })
  if (error) throw error
}
export async function fetchSentMessages() {
  const { data, error } = await supabase.from("admin_messages").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data
}
export async function fetchInboxMessages(playerId) {
  const { data, error } = await supabase.from("admin_messages").select("*").or(`player_id.eq.${playerId},player_id.is.null`).order("created_at", { ascending: false })
  if (error) throw error
  return data
}
export async function countUnreadMessages(playerId) {
  const { count, error } = await supabase.from("admin_messages").select("id", { count: "exact", head: true }).is("read_at", null).or(`player_id.eq.${playerId},player_id.is.null`)
  if (error) throw error
  return count || 0
}
export async function markMessagesRead(playerId) {
  const { error } = await supabase.from("admin_messages").update({ read_at: new Date().toISOString() }).is("read_at", null).or(`player_id.eq.${playerId},player_id.is.null`)
  if (error) throw error
}


// ── Leaderboard ────────────────────────────────────────────────────────────────
// Ranks all players by total confirmed matches played, across the whole app.
export async function fetchLeaderboard() {
  // Only completed matches count, so confirming into a future/never-played
  // match can't inflate rank. Ties (same matchesPlayed) are broken by who
  // confirmed earliest overall — rewards long-standing, consistent players.
  const { data, error } = await supabase.from("match_players").select("player_id, status, created_at, players(id, name, city), matches!inner(status)").eq("status", "confirmed").eq("matches.status", "completed")
  if (error) throw error
  const map = {}
  ;(data || []).forEach(r => {
    const p = r.players
    if (!p) return
    if (!map[p.id]) map[p.id] = { id: p.id, name: p.name, city: p.city, matchesPlayed: 0, earliestConfirmedAt: r.created_at }
    map[p.id].matchesPlayed++
    if (r.created_at && (!map[p.id].earliestConfirmedAt || r.created_at < map[p.id].earliestConfirmedAt)) {
      map[p.id].earliestConfirmedAt = r.created_at
    }
  })
  return Object.values(map).sort((a, b) => {
    if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed
    if (!a.earliestConfirmedAt) return 1
    if (!b.earliestConfirmedAt) return -1
    return new Date(a.earliestConfirmedAt) - new Date(b.earliestConfirmedAt)
  })
}


// ── Pro Access Requests ─────────────────────────────────────────────────────────
export async function requestProAccess(player_id) {
  const { data, error } = await supabase.from("pro_requests").insert({ player_id, status: "pending" }).select().single()
  if (error) throw error
  return data
}
export async function cancelProRequest(request_id) {
  const { error } = await supabase.from("pro_requests").delete().eq("id", request_id)
  if (error) throw error
}
export async function fetchMyProRequest(player_id) {
  const { data, error } = await supabase.from("pro_requests").select("*").eq("player_id", player_id).order("created_at", { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data
}
export async function fetchPendingProRequests() {
  const { data, error } = await supabase.from("pro_requests").select("*, players(id, name, phone)").eq("status", "pending").order("created_at", { ascending: true })
  if (error) throw error
  return data
}
export async function approveProRequest(request_id, player_id) {
  const expiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { error: e1 } = await supabase.from("players").update({ role: "pro", subscription_expiry: expiry }).eq("id", player_id)
  if (e1) throw e1
  const { error: e2 } = await supabase.from("pro_requests").update({ status: "approved", decided_at: new Date().toISOString() }).eq("id", request_id)
  if (e2) throw e2
}
export async function rejectProRequest(request_id) {
  const { error } = await supabase.from("pro_requests").update({ status: "rejected", decided_at: new Date().toISOString() }).eq("id", request_id)
  if (error) throw error
}


// ── Recently Joined (public, login screen) ──────────────────────────────────────
export async function fetchRecentlyRegistered(limit = 5) {
  const { data, error } = await supabase.from("players").select("name, city, id").order("id", { ascending: false }).limit(limit)
  if (error) throw error
  return data
}


// ── Player-specific played venues ────────────────────────────────────────────
export async function fetchPlayerGrounds(playerId) {
  const { data: mps } = await supabase.from("match_players").select("match_id").eq("player_id", playerId).eq("status", "confirmed")
  const matchIds = (mps || []).map(x => x.match_id)
  if (matchIds.length === 0) return []
  const { data: matchRows } = await supabase.from("matches").select("ground").in("id", matchIds)
  const names = Array.from(new Set((matchRows || []).map(m => m.ground).filter(Boolean)))
  if (names.length === 0) return []
  const { data: groundRows } = await supabase.from("grounds").select("id, name, location").in("name", names)
  const found = new Set((groundRows || []).map(g => g.name))
  const missing = names.filter(n => !found.has(n)).map(n => ({ id: n, name: n, location: "" }))
  return [...(groundRows || []), ...missing]
}


// ── Direct Messages (private 1-on-1, separate from group Match Chat) ────────────
export async function sendDirectMessage(sender_id, recipient_id, message) {
  const { error } = await supabase.from("direct_messages").insert({ sender_id, recipient_id, message })
  if (error) throw error
}
export async function fetchConversation(userId, otherId) {
  const { data, error } = await supabase.from("direct_messages").select("*").or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`).order("created_at", { ascending: true })
  if (error) throw error
  return data
}
export async function fetchMyConversations(userId) {
  const { data, error } = await supabase.from("direct_messages").select("*, sender:sender_id(id,name), recipient:recipient_id(id,name)").or(`sender_id.eq.${userId},recipient_id.eq.${userId}`).order("created_at", { ascending: false })
  if (error) throw error
  const map = {}
  ;(data || []).forEach(m => {
    const otherId = m.sender_id === userId ? m.recipient_id : m.sender_id
    const otherName = (m.sender_id === userId ? m.recipient?.name : m.sender?.name) || "Player"
    if (!map[otherId]) map[otherId] = { otherId, otherName, lastMessage: m.message, lastAt: m.created_at, unread: 0 }
    if (m.recipient_id === userId && !m.read_at) map[otherId].unread++
  })
  return Object.values(map).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
}
export async function markConversationRead(userId, otherId) {
  const { error } = await supabase.from("direct_messages").update({ read_at: new Date().toISOString() }).eq("recipient_id", userId).eq("sender_id", otherId).is("read_at", null)
  if (error) throw error
}
export async function countUnreadDirectMessages(userId) {
  const { count, error } = await supabase.from("direct_messages").select("id", { count: "exact", head: true }).eq("recipient_id", userId).is("read_at", null)
  if (error) throw error
  return count || 0
}
export async function fetchMyOrganizers(playerId) {
  const { data: admins } = await supabase.from("players").select("id, name, role").eq("role", "admin")
  const { data: mps } = await supabase.from("match_players").select("status, matches(created_by)").eq("player_id", playerId).eq("status", "confirmed")
  const proIds = Array.from(new Set((mps || []).map(r => r.matches?.created_by).filter(Boolean)))
  let proRows = []
  if (proIds.length > 0) {
    const { data } = await supabase.from("players").select("id, name, role").in("id", proIds).eq("role", "pro")
    proRows = data || []
  }
  const map = new Map()
  ;[...(admins || []), ...proRows].forEach(p => map.set(p.id, p))
  return Array.from(map.values())
}
export async function fetchMyConfirmedPlayers(proId) {
  const { data: myMatches } = await supabase.from("matches").select("id").eq("created_by", proId)
  const matchIds = (myMatches || []).map(m => m.id)
  if (matchIds.length === 0) return []
  const { data: rows } = await supabase.from("match_players").select("player_id, status, players(id, name)").in("match_id", matchIds).eq("status", "confirmed")
  const seen = new Map()
  ;(rows || []).forEach(r => { if (r.players && !seen.has(r.player_id)) seen.set(r.player_id, r.players) })
  return Array.from(seen.values())
}
