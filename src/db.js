import { supabase } from "./supabase.js"

// Computes an age-based category from a birth date. Currently only flags Under-19;
// returns null for anyone 19+ so existing/manual categories aren't overwritten.
function computeAgeCategory(birthDate) {
  if (!birthDate) return null
  const dob = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const hasHadBirthdayThisYear = (today.getMonth() > dob.getMonth()) || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())
  if (!hasHadBirthdayThisYear) age--
  return age < 19 ? "Under 19" : null
}

export async function checkPlayerPhoneExists(phone) {
  const cleaned = (phone || "").replace(/[^0-9]/g, "").slice(-10)
  const { data, error } = await supabase.from("players").select("id, phone")
  if (error) throw error
  return (data || []).some(p => (p.phone || "").replace(/[^0-9]/g, "").slice(-10) === cleaned)
}

export async function uploadProfilePhoto(file, phone) {
  const ext = file.name.split(".").pop()
  const cleaned = (phone || "anon").replace(/[^0-9]/g, "")
  const path = `profile-photos/${cleaned}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("team-assets").upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from("team-assets").getPublicUrl(path)
  return data.publicUrl
}

export async function uploadPaymentReceipt(file, auctionId, phone) {
  const ext = file.name.split(".").pop()
  const cleaned = (phone || "anon").replace(/[^0-9]/g, "")
  const path = `payment-receipts/${auctionId || "auc"}-${cleaned}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("team-assets").upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from("team-assets").getPublicUrl(path)
  return data.publicUrl
}

// ── Activity log & notifications ──────────────────────────────────────────────
async function logActivity(actorId, action, summary) {
  try { await supabase.from("activity_log").insert({ actor_player_id: actorId || null, action, summary }) } catch {}
}
export async function fetchRecentActivity(limit = 8) {
  const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(limit)
  if (error) throw error
  return data
}
async function createNotification(type, message) {
  try { await supabase.from("notifications").insert({ type, message }) } catch {}
}
export async function fetchNotifications(limit = 20) {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(limit)
  if (error) throw error
  return data
}
export async function fetchUnreadNotificationCount() {
  const { count, error } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false)
  if (error) throw error
  return count || 0
}
export async function markNotificationRead(id) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)
  if (error) throw error
}
export async function markAllNotificationsRead() {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false)
  if (error) throw error
}

export async function fetchPlayers() {
  const { data, error } = await supabase.from("players").select("*").order("name")
  if (error) throw error
  return data
}
export async function addPlayer(name, phone, pin = "1234", created_by = null, birthDate = null, profileImageUrl = null, extra = {}) {
  if (await checkPlayerPhoneExists(phone)) throw new Error("This phone number is already registered.")
  const category = computeAgeCategory(birthDate)
  const { data, error } = await supabase.from("players").insert({ name, phone, pin, created_by, birth_date: birthDate || null, profile_image_url: profileImageUrl || null, category, city: extra.city || null, jersey_number: extra.jerseyNumber || null, jersey_size: extra.jerseySize || null, registration_source: extra.source || "direct" }).select().single()
  if (error) throw error
  if (data && data.approved === false) await createNotification("player_pending", `${name} registered and is awaiting approval`)
  return data
}
export async function fetchPlayersByCreator(creator_id) {
  const { data, error } = await supabase.from("players").select("*").eq("created_by", creator_id).order("name")
  if (error) throw error
  return data
}
export async function updatePlayer(id, name, phone, pin, city, extra = {}) {
  const fields = { name, phone, pin, city }
  if (extra.birthDate !== undefined) fields.birth_date = extra.birthDate || null
  if (extra.profileImageUrl !== undefined) fields.profile_image_url = extra.profileImageUrl || null
  if (extra.jerseyNumber !== undefined) fields.jersey_number = extra.jerseyNumber || null
  if (extra.jerseySize !== undefined) fields.jersey_size = extra.jerseySize || null
  const { error } = await supabase.from("players").update(fields).eq("id", id)
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
  const { data, error } = await supabase.from("grounds").insert({ name, location, maps_link, notes }).select().single()
  if (error) throw error
  return data
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
export async function createMatch({ date, time_slot, ground, team, team_logo, our_team, our_team_logo, type, max_players, created_by, visibility }) {
  const { data, error } = await supabase.from("matches").insert({ date, time_slot, ground, team, team_logo, our_team: our_team || null, our_team_logo: our_team_logo || null, type, max_players, created_by: created_by || null, status: "upcoming", link_active: false, visibility: visibility || "private" }).select().single()
  if (error) throw error
  let actorName = "Someone"
  if (created_by) {
    const { data: actor } = await supabase.from("players").select("name").eq("id", created_by).maybeSingle()
    if (actor?.name) actorName = actor.name
  }
  const title = our_team ? `${our_team} vs ${team}` : team
  await logActivity(created_by, "match_created", `${actorName} created ${title}`)
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
  if (status === "completed") {
    const { data: m } = await supabase.from("matches").select("team, our_team").eq("id", id).maybeSingle()
    if (m) await logActivity(null, "match_completed", `Match completed: ${m.our_team ? `${m.our_team} vs ${m.team}` : m.team}`)
  }
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
  const { data, error } = await supabase.from("match_players").select("*, players(id, name, phone, role)").eq("match_id", match_id).order("responded_at", { ascending: true, nullsFirst: false })
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
  const { error } = await supabase.from("match_players").upsert({ match_id, player_id, status: finalStatus, responded_at: new Date().toISOString() }, { onConflict: "match_id,player_id" })
  if (error) throw error
  // Squad just reached capacity on this confirmation — let everyone confirmed know
  if (squadJustFilled && finalStatus === "confirmed" && matchInfo) {
    try {
      const { data: confirmedRows } = await supabase.from("match_players").select("player_id").eq("match_id", match_id).eq("status", "confirmed")
      const ids = (confirmedRows || []).map(r => r.player_id)
      const text = `🔒 Squad full for ${matchInfo.team} on ${matchInfo.date}! See you there 🏏[[match:${match_id}]]`
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
  let finalStatus = status
  // Enforce the squad cap here too — this function is what the "Available"
  // buttons (Player Portal, Pro's own invites, Admin's quick confirm) call,
  // and it previously had no capacity check at all, unlike confirmPlayerToMatch.
  if (status === "confirmed") {
    const { data: match } = await supabase.from("matches").select("max_players").eq("id", match_id).single()
    const cap = match?.max_players || 0
    if (cap > 0) {
      const { data: existing } = await supabase.from("match_players").select("status").eq("match_id", match_id).eq("player_id", player_id).maybeSingle()
      if (!existing || existing.status !== "confirmed") {
        const { count } = await supabase.from("match_players").select("id", { count: "exact", head: true }).eq("match_id", match_id).eq("status", "confirmed")
        if ((count || 0) >= cap) finalStatus = "waitlist"
      }
    }
  }
  const { error } = await supabase.from("match_players").upsert({ match_id, player_id, status: finalStatus, responded_at: new Date().toISOString() }, { onConflict: "match_id,player_id" })
  if (error) throw error
  // If this player is no longer confirmed, a spot may have opened
  if (status !== "confirmed") await promoteFromWaitlist(match_id)
  return finalStatus
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
  await supabase.from("match_players").upsert({ match_id: matchId, player_id: player.id, status, responded_at: new Date().toISOString() }, { onConflict: "match_id,player_id" })
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

export async function registerPlayer(name, phone, pin, birthDate = null, profileImageUrl = null, extra = {}) {
  if (await checkPlayerPhoneExists(phone)) throw new Error("This phone number is already registered.")
  const category = computeAgeCategory(birthDate)
  const { data, error } = await supabase.from("players").insert({ name, phone, pin, approved: true, birth_date: birthDate || null, profile_image_url: profileImageUrl || null, category, city: extra.city || null, jersey_number: extra.jerseyNumber || null, jersey_size: extra.jerseySize || null, registration_source: "direct" }).select().single()
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
  const { data: p } = await supabase.from("players").select("name").eq("id", id).maybeSingle()
  if (p?.name) await logActivity(null, "player_approved", `${p.name} was approved`)
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
export async function fetchPlayerMatchHistory(playerId) {
  const { data, error } = await supabase.from("match_players").select("status, matches(id, date, time_slot, ground, team, our_team, status, type)").eq("player_id", playerId).eq("status", "confirmed")
  if (error) throw error
  return (data || []).map(r => r.matches).filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date))
}

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
  const { data: wl } = await supabase.from("match_players").select("player_id").eq("match_id", match_id).eq("status", "waitlist").order("responded_at", { ascending: true, nullsFirst: false }).limit(1)
  if (!wl || wl.length === 0) return null
  const promoteId = wl[0].player_id
  await supabase.from("match_players").update({ status: "confirmed" }).eq("match_id", match_id).eq("player_id", promoteId)
  return promoteId
}

// For a pro member: all players who joined their matches, with per-player stats
export async function fetchProGroupPlayers(proId) {
  // Get pro's matches
  const { data: myMatches } = await supabase.from("matches").select("id, date").eq("created_by", proId)
  const matchIds = (myMatches || []).map(m => m.id)
  if (matchIds.length === 0) return []
  const matchDateById = Object.fromEntries((myMatches || []).map(m => [m.id, m.date]))
  // Get all match_players rows for these matches, joined with player info
  const { data: rows } = await supabase.from("match_players").select("match_id, player_id, status, players(id, name, phone, city)").in("match_id", matchIds)
  // Get contributions for these players (match-based)
  const { data: contribs } = await supabase.from("contributions").select("player_id, amount").in("match_id", matchIds)
  const contribByPlayer = {}
  ;(contribs || []).forEach(c => { contribByPlayer[c.player_id] = (contribByPlayer[c.player_id] || 0) + Number(c.amount) })
  // Aggregate per player
  const map = {}
  ;(rows || []).forEach(r => {
    const p = r.players
    if (!p) return
    if (!map[p.id]) map[p.id] = { id: p.id, name: p.name, phone: p.phone, city: p.city, played: 0, confirmed: 0, declined: 0, contributed: 0, lastPlayedDate: null }
    if (r.status === "confirmed") {
      map[p.id].confirmed++; map[p.id].played++
      const d = matchDateById[r.match_id]
      if (d && (!map[p.id].lastPlayedDate || d > map[p.id].lastPlayedDate)) map[p.id].lastPlayedDate = d
    }
    else if (r.status === "declined") map[p.id].declined++
  })
  Object.values(map).forEach(p => { p.contributed = contribByPlayer[p.id] || 0 })
  // Sort by most matches played
  return Object.values(map).sort((a, b) => b.played - a.played)
}

// Matches this player is invited to / part of (joined with match info)
export async function fetchMyInvites(playerId) {
  const [{ data: mine, error: e1 }, { data: pub, error: e2 }] = await Promise.all([
    supabase.from("match_players").select("status, matches(*)").eq("player_id", playerId),
    supabase.from("matches").select("*").eq("visibility", "public").eq("status", "upcoming")
  ])
  if (e1) throw e1
  if (e2) throw e2
  const mineRows = (mine || []).filter(r => r.matches).map(r => ({ match: r.matches, myStatus: r.status }))
  const mineIds = new Set(mineRows.map(r => r.match.id))
  // Public matches this player wasn't personally invited to show up as "pending"
  // so they get the same Confirm/Decline treatment as a normal invite.
  const publicRows = (pub || []).filter(m => !mineIds.has(m.id)).map(m => ({ match: m, myStatus: "pending" }))
  return [...mineRows, ...publicRows]
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
  // Returns raw rows (one per confirmed player-match), not pre-aggregated,
  // so the UI can filter by season/role and recompute rankings without refetching.
  // Only completed matches count, so confirming into a future/never-played
  // match can't inflate rank. Ties are broken by who confirmed earliest overall.
  const { data, error } = await supabase.from("match_players").select("player_id, status, created_at, players(id, name, city, role), matches!inner(status, date, team, our_team)").eq("status", "confirmed").eq("matches.status", "completed")
  if (error) throw error
  return data || []
}


// ── Pro Access Requests ─────────────────────────────────────────────────────────
export async function requestProAccess(player_id) {
  const { data, error } = await supabase.from("pro_requests").insert({ player_id, status: "pending" }).select().single()
  if (error) throw error
  const { data: p } = await supabase.from("players").select("name").eq("id", player_id).maybeSingle()
  if (p?.name) await createNotification("pro_request", `${p.name} requested Pro access`)
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


// ── Player count (public-safe, count-only, no row data) ──────────────────────
export async function fetchPlayerCount() {
  const { count, error } = await supabase.from("players").select("id", { count: "exact", head: true })
  if (error) throw error
  return count || 0
}


// ── Resolve Admin (for inbox replies) ────────────────────────────────────────
export async function fetchAdminPlayerId() {
  const { data, error } = await supabase.from("players").select("id").eq("role", "admin").limit(1).maybeSingle()
  if (error) throw error
  return data?.id || null
}


// ── Feedback (player -> admin suggestions/bug reports) ────────────────────────
export async function sendFeedback(player_id, sender_name, message) {
  const { error } = await supabase.from("feedback").insert({ player_id, sender_name, message })
  if (error) throw error
}
export async function fetchFeedback() {
  const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data
}


// ── Global Search (players, teams, grounds, matches) ─────────────────────────
export async function globalSearch(query) {
  const q = (query || "").trim()
  if (!q) return { players: [], teams: [], grounds: [], matches: [] }
  const [playersRes, teamsRes, groundsRes, matchesRes] = await Promise.all([
    supabase.from("players").select("id, name, city, role").ilike("name", `%${q}%`).limit(5),
    supabase.from("teams").select("id, name").ilike("name", `%${q}%`).limit(5),
    supabase.from("grounds").select("id, name, location").ilike("name", `%${q}%`).limit(5),
    supabase.from("matches").select("id, team, our_team, ground, date, status").ilike("team", `%${q}%`).limit(5),
  ])
  return {
    players: playersRes.data || [],
    teams: teamsRes.data || [],
    grounds: groundsRes.data || [],
    matches: matchesRes.data || [],
  }
}


export async function fetchMatchCount() {
  const { count, error } = await supabase.from("matches").select("id", { count: "exact", head: true })
  if (error) throw error
  return count || 0
}

export async function fetchTeamCount() {
  const { count, error } = await supabase.from("teams").select("id", { count: "exact", head: true })
  if (error) throw error
  return count || 0
}


// ── Auction Tournament — registration functions ───────────────────────────────
// (Added here because the original patch that should have added these
// during Phase 1 never actually landed on this file.)
// Add an existing platform player straight into an auction's pool, skipping
// the public self-registration form. Playing role isn't tracked on the main
// players table, so it's left unset — the organizer can set it afterward in
// the Player Pool tab, same as any manually-added auction player.
export async function addRosterPlayerToAuction(auctionId, player) {
  const cleaned = (player.phone || "").replace(/[^0-9]/g, "").slice(-10)
  const exists = await checkAuctionPhoneExists(cleaned, auctionId)
  if (exists) return null // already in this auction's pool, skip silently
  const category = computeAgeCategory(player.birth_date)
  const basePrice = await computeAuctionBasePrice(auctionId)
  const { data, error } = await supabase.from("auction_players").insert({
    name: player.name, phone: cleaned, status: "registered", auction_id: auctionId,
    birth_date: player.birth_date || null, profile_image_url: player.profile_image_url || null,
    category, city: player.city || null, jersey_number: player.jersey_number || null, jersey_size: player.jersey_size || null, base_price: basePrice
  }).select().single()
  if (error) throw error
  return data
}

// Base price is always exactly 1% of the auction's total points purse per
// team, applied automatically to every player — no manual entry needed.
async function computeAuctionBasePrice(auctionId) {
  if (!auctionId) return null
  const { data } = await supabase.from("auctions").select("points_purse").eq("id", auctionId).maybeSingle()
  return data?.points_purse ? Math.round(data.points_purse / 100) : null
}

export async function registerAuctionPlayer(name, phone, playingRole, birthDate = null, profileImageUrl = null, auctionId = null, extra = {}) {
  const category = computeAgeCategory(birthDate)
  const basePrice = await computeAuctionBasePrice(auctionId)
  const payload = {
    name, phone, playing_role: playingRole, status: "registered", birth_date: birthDate || null, profile_image_url: profileImageUrl || null, category, auction_id: auctionId || null,
    city: extra.city || null, jersey_number: extra.jerseyNumber || null, jersey_size: extra.jerseySize || null, base_price: basePrice
  }
  if (extra.paymentScreenshotUrl) payload.payment_screenshot_url = extra.paymentScreenshotUrl
  if (extra.paymentStatus) payload.payment_status = extra.paymentStatus

  let { data, error } = await supabase.from("auction_players").insert(payload).select().single()
  if (error && (error.message?.includes("payment_screenshot_url") || error.message?.includes("payment_status"))) {
    console.warn("Retrying registerAuctionPlayer without payment columns:", error.message)
    delete payload.payment_screenshot_url
    delete payload.payment_status
    const res = await supabase.from("auction_players").insert(payload).select().single()
    if (res.error) throw res.error
    data = res.data
  } else if (error) {
    throw error
  }
  await createNotification("auction_registration", `${name} registered for the auction`)
  // Also create a full (pending-approval) player account if this phone isn't one already,
  // so auction registrants count toward the main player roster too.
  try { await addPlayer(name, phone, "1234", null, birthDate, profileImageUrl, { ...extra, source: "auction" }) } catch(e) { console.error("Failed to sync auction registrant into main player roster:", e) }
  return data
}

export async function updateAuctionPlayerPaymentStatus(playerId, status) {
  const { error } = await supabase.from("auction_players").update({ payment_status: status }).eq("id", playerId)
  if (error) throw error
}

export async function fetchAuctionPlayers(auctionId = null) {
  let q = supabase.from("auction_players").select("*").order("created_at", { ascending: true })
  q = auctionId ? q.eq("auction_id", auctionId) : q.is("auction_id", null)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function checkAuctionPhoneExists(phone, auctionId = null) {
  const cleaned = (phone || "").replace(/[^0-9]/g, "").slice(-10)
  let q = supabase.from("auction_players").select("id, phone")
  q = auctionId ? q.eq("auction_id", auctionId) : q.is("auction_id", null)
  const { data, error } = await q
  if (error) throw error
  return (data || []).some(p => (p.phone || "").replace(/[^0-9]/g, "").slice(-10) === cleaned)
}

// Narrow public lookup for auction registration auto-fill — only returns non-sensitive fields
export async function findPlayerByPhone(phone) {
  const cleaned = (phone || "").replace(/[^0-9]/g, "").slice(-10)
  if (cleaned.length !== 10) return null
  const { data, error } = await supabase.from("players").select("id, name, playing_role, birth_date, profile_image_url, category, city, jersey_number, jersey_size").ilike("phone", `%${cleaned}`)
  if (error) throw error
  return (data && data[0]) || null
}

export async function fetchAuctionRegistrationOpen(auctionId = null) {
  if (auctionId) {
    const { data, error } = await supabase.from("auctions").select("registration_open").eq("id", auctionId).maybeSingle()
    if (error) throw error
    return data?.registration_open !== false
  }
  const settings = await fetchSettings()
  return settings?.auction_registration_open !== "false" // legacy/unscoped fallback
}
export async function setAuctionRegistrationOpen(isOpenOrAuctionId, maybeIsOpen) {
  // Supports both the legacy global call setAuctionRegistrationOpen(bool)
  // and the new scoped call setAuctionRegistrationOpen(auctionId, bool)
  if (typeof isOpenOrAuctionId === "boolean") {
    await upsertSetting("auction_registration_open", isOpenOrAuctionId ? "true" : "false")
    return
  }
  const { error } = await supabase.from("auctions").update({ registration_open: maybeIsOpen }).eq("id", isOpenOrAuctionId)
  if (error) throw error
}

export async function updatePlayerRole(id, playingRole) {
  const { error } = await supabase.from("players").update({ playing_role: playingRole }).eq("id", id)
  if (error) throw error
}

// ── Auction Tournament — admin control panel (base price, teams, purses) ─────
export async function updateAuctionPlayerBasePrice(id, basePrice) {
  const { error } = await supabase.from("auction_players").update({ base_price: basePrice }).eq("id", id)
  if (error) throw error
}
export async function updateAuctionPlayerCategory(id, category) {
  const { error } = await supabase.from("auction_players").update({ category }).eq("id", id)
  if (error) throw error
}
export async function deleteAuctionPlayer(id) {
  const { error } = await supabase.from("auction_players").delete().eq("id", id)
  if (error) throw error
}
export async function fetchAuctionTeams(auctionId = null) {
  let q = supabase.from("auction_teams").select("*").order("created_at", { ascending: true })
  q = auctionId ? q.eq("auction_id", auctionId) : q.is("auction_id", null)
  const { data, error } = await q
  if (error) throw error
  return data
}
export async function assignCaptainToTeam(teamId, auctionId, { captainPlayerId, captainPhone, captainName }) {
  const cleanedPhone = (captainPhone || "").replace(/[^0-9]/g, "").slice(-10)

  // 1. If explicit player ID provided from registered pool
  if (captainPlayerId) {
    const updatePayload = {
      sold_team_id: teamId,
      status: "captain",
      is_captain: true,
      sold_price: 0,
      sold_at: new Date().toISOString()
    }
    if (captainName) updatePayload.name = captainName.trim()
    let res = await supabase.from("auction_players").update(updatePayload).eq("id", captainPlayerId)
    if (res.error && res.error.message?.includes("is_captain")) {
      delete updatePayload.is_captain
      await supabase.from("auction_players").update(updatePayload).eq("id", captainPlayerId)
    }
    return
  }

  // 2. If phone number provided, look in auction_players for this auction
  if (cleanedPhone && cleanedPhone.length === 10) {
    let q = supabase.from("auction_players").select("id, name, phone")
    q = auctionId ? q.eq("auction_id", auctionId) : q.is("auction_id", null)
    const { data: existingPlayers } = await q
    const matched = (existingPlayers || []).find(p => (p.phone || "").replace(/[^0-9]/g, "").slice(-10) === cleanedPhone)

    if (matched) {
      const updatePayload = {
        sold_team_id: teamId,
        status: "captain",
        is_captain: true,
        sold_price: 0,
        sold_at: new Date().toISOString()
      }
      if (captainName) updatePayload.name = captainName.trim()
      let res = await supabase.from("auction_players").update(updatePayload).eq("id", matched.id)
      if (res.error && res.error.message?.includes("is_captain")) {
        delete updatePayload.is_captain
        await supabase.from("auction_players").update(updatePayload).eq("id", matched.id)
      }
      return
    }

    // Not in auction_players yet: check main players table or create fresh
    let photoUrl = null
    let role = null
    let city = null
    let birthDate = null
    let jerseyNumber = null
    let jerseySize = null
    let playerName = captainName ? captainName.trim() : "Captain"
    try {
      const pInfo = await findPlayerByPhone(cleanedPhone)
      if (pInfo) {
        if (!captainName && pInfo.name) playerName = pInfo.name
        photoUrl = pInfo.profile_image_url || null
        role = pInfo.playing_role || null
        city = pInfo.city || null
        birthDate = pInfo.birth_date || null
        jerseyNumber = pInfo.jersey_number || null
        jerseySize = pInfo.jersey_size || null
      }
    } catch {}

    const basePrice = await computeAuctionBasePrice(auctionId)
    const newCapPayload = {
      name: playerName,
      phone: cleanedPhone,
      playing_role: role || "All-rounder",
      status: "captain",
      is_captain: true,
      sold_team_id: teamId,
      sold_price: 0,
      sold_at: new Date().toISOString(),
      auction_id: auctionId || null,
      profile_image_url: photoUrl,
      city,
      birth_date: birthDate,
      jersey_number: jerseyNumber,
      jersey_size: jerseySize,
      base_price: basePrice || 0
    }
    let insRes = await supabase.from("auction_players").insert(newCapPayload)
    if (insRes.error && insRes.error.message?.includes("is_captain")) {
      delete newCapPayload.is_captain
      await supabase.from("auction_players").insert(newCapPayload)
    }
    return
  }

  // 3. Fallback: if only captainName is given
  if (captainName && captainName.trim()) {
    let q = supabase.from("auction_players").select("id, name")
    q = auctionId ? q.eq("auction_id", auctionId) : q.is("auction_id", null)
    const { data: existingPlayers } = await q
    const matched = (existingPlayers || []).find(p => (p.name || "").trim().toLowerCase() === captainName.trim().toLowerCase())
    if (matched) {
      const updatePayload = {
        sold_team_id: teamId,
        status: "captain",
        is_captain: true,
        sold_price: 0,
        sold_at: new Date().toISOString()
      }
      let res = await supabase.from("auction_players").update(updatePayload).eq("id", matched.id)
      if (res.error && res.error.message?.includes("is_captain")) {
        delete updatePayload.is_captain
        await supabase.from("auction_players").update(updatePayload).eq("id", matched.id)
      }
    } else {
      const basePrice = await computeAuctionBasePrice(auctionId)
      const newCapPayload = {
        name: captainName.trim(),
        status: "captain",
        is_captain: true,
        sold_team_id: teamId,
        sold_price: 0,
        sold_at: new Date().toISOString(),
        auction_id: auctionId || null,
        base_price: basePrice || 0
      }
      let insRes = await supabase.from("auction_players").insert(newCapPayload)
      if (insRes.error && insRes.error.message?.includes("is_captain")) {
        delete newCapPayload.is_captain
        await supabase.from("auction_players").insert(newCapPayload)
      }
    }
  }
}

export async function createAuctionTeam(name, ownerName, purseTotal, auctionId = null, captainName = null, captainPhone = null, ownerPhone = null, captainPlayerId = null) {
  const payload = {
    name, owner_name: ownerName || null, captain_name: captainName || null, purse_total: purseTotal, purse_remaining: purseTotal, auction_id: auctionId || null
  }
  if (captainPhone) payload.captain_phone = captainPhone
  if (ownerPhone) payload.owner_phone = ownerPhone

  let teamData
  let { data, error } = await supabase.from("auction_teams").insert(payload).select().single()
  if (error && (error.message?.includes("captain_phone") || error.message?.includes("owner_phone"))) {
    delete payload.captain_phone
    delete payload.owner_phone
    const retry = await supabase.from("auction_teams").insert(payload).select().single()
    if (retry.error) throw retry.error
    teamData = retry.data
  } else if (error) {
    throw error
  } else {
    teamData = data
  }

  if (teamData?.id && (captainPlayerId || captainPhone || captainName)) {
    try {
      await assignCaptainToTeam(teamData.id, auctionId, { captainPlayerId, captainPhone, captainName })
    } catch (err) {
      console.warn("Could not pre-assign captain:", err)
    }
  }

  return teamData
}

export async function updateAuctionTeam(id, { name, ownerName, purseTotal, captainName, captainPhone, ownerPhone, captainPlayerId, auctionId }) {
  const payload = {
    name, owner_name: ownerName || null, captain_name: captainName || null, purse_total: purseTotal, purse_remaining: purseTotal
  }
  if (captainPhone) payload.captain_phone = captainPhone
  if (ownerPhone) payload.owner_phone = ownerPhone

  let { error } = await supabase.from("auction_teams").update(payload).eq("id", id)
  if (error && (error.message?.includes("captain_phone") || error.message?.includes("owner_phone"))) {
    delete payload.captain_phone
    delete payload.owner_phone
    const retry = await supabase.from("auction_teams").update(payload).eq("id", id)
    if (retry.error) throw retry.error
  } else if (error) {
    throw error
  }

  if (id && (captainPlayerId || captainPhone || captainName)) {
    try {
      await assignCaptainToTeam(id, auctionId, { captainPlayerId, captainPhone, captainName })
    } catch (err) {
      console.warn("Could not update pre-assigned captain:", err)
    }
  }
}

export async function deleteAuctionTeam(id) {
  try {
    await supabase.from("auction_players").update({ status: "registered", sold_team_id: null, sold_price: null, is_captain: false }).eq("sold_team_id", id)
  } catch {}
  const { error } = await supabase.from("auction_teams").delete().eq("id", id)
  if (error) throw error
}

// ── Auction Tournament — live bidding ─────────────────────────────────────────
export async function fetchAuctionState(auctionId = null) {
  if (auctionId) return await fetchAuctionById(auctionId)
  const { data, error } = await supabase.from("auction_state").select("*").eq("id", 1).single()
  if (error) throw error
  return data
}

function nextUnsoldPlayer(players, excludeId) {
  const eligible = players.filter(p => p.id !== excludeId && p.status === "registered" && !p.is_captain && p.status !== "captain")
  if (eligible.length === 0) return null
  const randomIndex = Math.floor(Math.random() * eligible.length)
  return eligible[randomIndex]
}

export async function startAuction(bidIncrement, auctionId = null) {
  const players = await fetchAuctionPlayers(auctionId)
  const first = nextUnsoldPlayer(players, null)
  if (!first) throw new Error("No players in the pool yet — add players before starting.")
  const table = auctionId ? "auctions" : "auction_state"
  const idVal = auctionId || 1
  const { error } = await supabase.from(table).update({
    status: "live", bid_increment: bidIncrement, current_player_id: first.id,
    current_bid: first.base_price || 0, current_team_id: null
  }).eq("id", idVal)
  if (error) throw error
}

export async function placeBid(playerId, teamId, amount, auctionId = null) {
  const { error: e1 } = await supabase.from("auction_bids").insert({ player_id: playerId, team_id: teamId, amount, auction_id: auctionId || null })
  if (e1) throw e1
  const table = auctionId ? "auctions" : "auction_state"
  const idVal = auctionId || 1
  const { error: e2 } = await supabase.from(table).update({ current_bid: amount, current_team_id: teamId }).eq("id", idVal)
  if (e2) throw e2
}

export async function undoLastBid(playerId, auctionId = null) {
  const { data: bids, error: e1 } = await supabase.from("auction_bids").select("*").eq("player_id", playerId).order("created_at", { ascending: false }).limit(2)
  if (e1) throw e1
  if (!bids || bids.length === 0) return
  const { error: e2 } = await supabase.from("auction_bids").delete().eq("id", bids[0].id)
  if (e2) throw e2
  const prev = bids[1]
  const { data: player } = await supabase.from("auction_players").select("base_price").eq("id", playerId).single()
  const table = auctionId ? "auctions" : "auction_state"
  const idVal = auctionId || 1
  const { error: e3 } = await supabase.from(table).update({
    current_bid: prev ? prev.amount : (player?.base_price || 0),
    current_team_id: prev ? prev.team_id : null
  }).eq("id", idVal)
  if (e3) throw e3
}

export async function markPlayerSold(playerId, teamId, amount, auctionId = null) {
  const { error: e1 } = await supabase.from("auction_players").update({ status: "sold", sold_price: amount, sold_team_id: teamId, sold_at: new Date().toISOString() }).eq("id", playerId)
  if (e1) throw e1
  const { data: team, error: e2 } = await supabase.from("auction_teams").select("purse_remaining, name").eq("id", teamId).single()
  if (e2) throw e2
  const { error: e3 } = await supabase.from("auction_teams").update({ purse_remaining: team.purse_remaining - amount }).eq("id", teamId)
  if (e3) throw e3
  const { data: p } = await supabase.from("auction_players").select("name").eq("id", playerId).maybeSingle()
  if (p?.name) await logActivity(null, "auction_sold", `${p.name} sold to ${team.name} for ₹${amount}`)
  await advanceToNextPlayer(playerId, auctionId)
}

export async function markPlayerUnsold(playerId, auctionId = null) {
  const { error } = await supabase.from("auction_players").update({ status: "unsold" }).eq("id", playerId)
  if (error) throw error
  await advanceToNextPlayer(playerId, auctionId)
}

async function advanceToNextPlayer(justDecidedId, auctionId = null) {
  const players = await fetchAuctionPlayers(auctionId)
  const next = nextUnsoldPlayer(players, justDecidedId)
  const table = auctionId ? "auctions" : "auction_state"
  const idVal = auctionId || 1
  if (!next) {
    const { error } = await supabase.from(table).update({ status: "completed", current_player_id: null, current_bid: 0, current_team_id: null }).eq("id", idVal)
    if (error) throw error
    return
  }
  const { error } = await supabase.from(table).update({ current_player_id: next.id, current_bid: next.base_price || 0, current_team_id: null }).eq("id", idVal)
  if (error) throw error
}

export async function jumpToAuctionPlayer(playerId, auctionId = null) {
  const { data: player, error: e1 } = await supabase.from("auction_players").select("base_price").eq("id", playerId).single()
  if (e1) throw e1
  const table = auctionId ? "auctions" : "auction_state"
  const idVal = auctionId || 1
  const { error: e2 } = await supabase.from(table).update({ current_player_id: playerId, current_bid: player.base_price || 0, current_team_id: null }).eq("id", idVal)
  if (e2) throw e2
}

export async function fetchAuctionBidHistory(playerId, auctionId = null) {
  let q = supabase.from("auction_bids").select("*, auction_teams(name)").eq("player_id", playerId).order("created_at", { ascending: false })
  if (auctionId) q = q.eq("auction_id", auctionId)
  const { data, error } = await q
  if (error) throw error
  return data
}

// ── Auction Tournament — multi-tenant auction events ──────────────────────────
export async function fetchPlatformUpi() {
  const settings = await fetchSettings()
  const upi = settings?.platform_upi_id
  return (upi && upi !== "9897439743@okbizaxis") ? upi : "9897439743@pz"
}
export async function setPlatformUpi(upiId) {
  await upsertSetting("platform_upi_id", upiId)
}

export function normalizeAuctionOrganizedBy(a) {
  if (!a) return a
  if (!a.organized_by) {
    if (a.logo_url && a.logo_url.startsWith("org:")) {
      a.organized_by = a.logo_url.replace(/^org:/, "").trim()
    } else if (a.players?.name) {
      a.organized_by = a.players.name
    }
  }
  return a
}

export async function createAuction({ name, organizerId, location, auctionDate, auctionTime, planTier, maxTeams, pointsPurse, amountDue, playerEntryFee = 0, organizerUpiId = null, organizerPaymentPhone = null, organizedBy = null }) {
  const paymentStatus = amountDue > 0 ? "pending" : "free"
  const orgClean = organizedBy ? organizedBy.trim() : null
  const payload = {
    name, organizer_id: organizerId || null, location: location || null,
    auction_date: auctionDate || null, auction_time: auctionTime || null,
    plan_tier: planTier, max_teams: maxTeams, points_purse: pointsPurse || null,
    amount_due: amountDue || 0, payment_status: paymentStatus
  }
  if (playerEntryFee !== undefined) payload.player_entry_fee = playerEntryFee ? Number(playerEntryFee) : 0
  if (organizerUpiId) payload.organizer_upi_id = organizerUpiId.trim()
  if (organizerPaymentPhone) payload.organizer_payment_phone = organizerPaymentPhone.trim()
  if (orgClean) {
    payload.organized_by = orgClean
    payload.logo_url = `org:${orgClean}`
  }

  let { data, error } = await supabase.from("auctions").insert(payload).select().single()
  if (error && (error.message?.includes("player_entry_fee") || error.message?.includes("organizer_upi_id") || error.message?.includes("organizer_payment_phone") || error.message?.includes("organized_by"))) {
    console.warn("Retrying createAuction without unrecognized columns:", error.message)
    const fallbackPayload = {
      name, organizer_id: organizerId || null, location: location || null,
      auction_date: auctionDate || null, auction_time: auctionTime || null,
      plan_tier: planTier, max_teams: maxTeams, points_purse: pointsPurse || null,
      amount_due: amountDue || 0, payment_status: paymentStatus,
      logo_url: orgClean ? `org:${orgClean}` : null
    }
    const res = await supabase.from("auctions").insert(fallbackPayload).select().single()
    if (res.error) throw res.error
    data = res.data
  } else if (error) {
    throw error
  }
  if (orgClean && data?.id) {
    upsertSetting(`auction_org_${data.id}`, orgClean).catch(() => {})
    if (data.auction_code) upsertSetting(`auction_org_${data.auction_code}`, orgClean).catch(() => {})
  }
  if (amountDue > 0) await createNotification("auction_payment_pending", `New auction "${name}" awaiting payment confirmation (₹${amountDue})`)
  return normalizeAuctionOrganizedBy(data)
}

export async function updateAuction(id, updates = {}) {
  const payload = {}
  if (updates.auctionDate !== undefined) payload.auction_date = updates.auctionDate || null
  if (updates.auction_date !== undefined) payload.auction_date = updates.auction_date || null
  if (updates.auctionTime !== undefined) payload.auction_time = updates.auctionTime || null
  if (updates.auction_time !== undefined) payload.auction_time = updates.auction_time || null
  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.location !== undefined) payload.location = updates.location ? updates.location.trim() : null
  if (updates.pointsPurse !== undefined) payload.points_purse = updates.pointsPurse ? Number(updates.pointsPurse) : null
  if (updates.points_purse !== undefined) payload.points_purse = updates.points_purse ? Number(updates.points_purse) : null
  if (updates.bidIncrement !== undefined) payload.bid_increment = updates.bidIncrement ? Number(updates.bidIncrement) : 1000
  if (updates.bid_increment !== undefined) payload.bid_increment = updates.bid_increment ? Number(updates.bid_increment) : 1000

  const orgClean = updates.organizedBy ? updates.organizedBy.trim() : (updates.organized_by ? updates.organized_by.trim() : null)
  if (orgClean !== null) {
    payload.organized_by = orgClean
    payload.logo_url = `org:${orgClean}`
  }

  let { data, error } = await supabase.from("auctions").update(payload).eq("id", id).select().single()
  if (error && error.message?.includes("organized_by")) {
    delete payload.organized_by
    const retry = await supabase.from("auctions").update(payload).eq("id", id).select().single()
    if (retry.error) throw retry.error
    data = retry.data
  } else if (error) {
    throw error
  }

  if (orgClean && id) {
    upsertSetting(`auction_org_${id}`, orgClean).catch(() => {})
    if (data?.auction_code) upsertSetting(`auction_org_${data.auction_code}`, orgClean).catch(() => {})
  }

  return normalizeAuctionOrganizedBy(data)
}

export async function fetchMyAuctions(organizerId) {
  const { data, error } = await supabase.from("auctions").select("*").eq("organizer_id", organizerId).order("created_at", { ascending: false })
  if (error) throw error
  return data
}

// Lightweight bulk counts (one column, aggregated client-side) so the auction
// list can show real Teams/Players numbers per card without a query per auction.
export async function fetchAllAuctionTeamCounts() {
  const { data, error } = await supabase.from("auction_teams").select("auction_id")
  if (error) throw error
  const counts = {}
  ;(data || []).forEach(r => { if (r.auction_id) counts[r.auction_id] = (counts[r.auction_id]||0) + 1 })
  return counts
}
export async function fetchAllAuctionPlayerCounts() {
  const { data, error } = await supabase.from("auction_players").select("auction_id")
  if (error) throw error
  const counts = {}
  ;(data || []).forEach(r => { if (r.auction_id) counts[r.auction_id] = (counts[r.auction_id]||0) + 1 })
  return counts
}

// A player's full history across EVERY auction they've registered for (matched
// by phone, since auction_players has no direct link to the main players table).
export async function fetchPlayerAuctionHistory(phone) {
  if (!phone) return []
  const norm = phone.replace(/[^0-9]/g, "").slice(-10)
  try {
    const { data, error } = await supabase
      .from("auction_players")
      .select("*, auctions(id, name, auction_code, auction_date, points_purse, status, organized_by), auction_teams!sold_team_id(id, name, color, logo_url)")
      .or(`phone.eq.${phone},phone.eq.${norm},phone.like.%${norm}`)
      .order("created_at", { ascending: false })
    if (!error && data) return data.filter(r => r.auctions)
  } catch {}

  const { data, error } = await supabase
    .from("auction_players")
    .select("*, auctions(id, name, auction_code, auction_date, points_purse, status, organized_by)")
    .or(`phone.eq.${phone},phone.eq.${norm},phone.like.%${norm}`)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data || []).filter(r => r.auctions)
}

// One-time backfill: sync every existing auction registration (across every
// auction) into the main player roster, skipping anyone whose phone number
// already exists there — so re-running this never creates duplicates or
// inflates the player count.
export async function syncAuctionPlayersToRoster() {
  const norm = phone => (phone || "").replace(/[^0-9]/g, "").slice(-10)
  const [{ data: auctionPlayers, error: e1 }, { data: mainPlayers, error: e2 }] = await Promise.all([
    supabase.from("auction_players").select("name, phone, birth_date, profile_image_url, city, jersey_number, jersey_size"),
    supabase.from("players").select("phone"),
  ])
  if (e1) throw e1
  if (e2) throw e2
  const existingPhones = new Set((mainPlayers || []).map(p => norm(p.phone)))
  let synced = 0, skipped = 0
  for (const ap of (auctionPlayers || [])) {
    const phone = norm(ap.phone)
    if (!phone || existingPhones.has(phone)) { skipped++; continue }
    try {
      await addPlayer(ap.name, phone, "1234", null, ap.birth_date, ap.profile_image_url, { city: ap.city, jerseyNumber: ap.jersey_number, jerseySize: ap.jersey_size, source: "auction" })
      existingPhones.add(phone) // prevents inserting the same new phone twice if they're in multiple auctions
      synced++
    } catch(e) { console.error(`Failed to sync ${ap.name} (${phone}):`, e); skipped++ }
  }
  return { synced, skipped }
}

export async function fetchAuctionSponsors(auctionId) {
  const { data, error } = await supabase.from("auction_sponsors").select("*").eq("auction_id", auctionId).order("created_at", { ascending: true })
  if (error) throw error
  return data || []
}
export async function addAuctionSponsor(auctionId, name, logoUrl) {
  const { data, error } = await supabase.from("auction_sponsors").insert({ auction_id: auctionId, name, logo_url: logoUrl || null }).select().single()
  if (error) throw error
  return data
}
export async function deleteAuctionSponsor(id) {
  const { error } = await supabase.from("auction_sponsors").delete().eq("id", id)
  if (error) throw error
}
export async function uploadSponsorLogo(file, sponsorName) {
  const ext = file.name.split(".").pop()
  const path = `sponsor-logos/${(sponsorName||"sponsor").toLowerCase().replace(/\s+/g,"-")}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("team-assets").upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from("team-assets").getPublicUrl(path)
  return data.publicUrl
}

export async function fetchAllAuctions() {
  const { data, error } = await supabase.from("auctions").select("*, players(name)").order("created_at", { ascending: false })
  if (error) throw error
  return (data || []).map(normalizeAuctionOrganizedBy)
}

export async function fetchAuctionByCode(code) {
  const { data, error } = await supabase.from("auctions").select("*").eq("auction_code", code).maybeSingle()
  if (error) throw error
  if (!data) return null
  normalizeAuctionOrganizedBy(data)
  if (!data.organized_by) {
    try {
      const { data: s } = await supabase.from("settings").select("value").eq("key", `auction_org_${data.id}`).maybeSingle()
      if (s?.value) data.organized_by = s.value
      else {
        const { data: sc } = await supabase.from("settings").select("value").eq("key", `auction_org_${code}`).maybeSingle()
        if (sc?.value) data.organized_by = sc.value
      }
    } catch {}
  }
  return data
}

export async function fetchAuctionById(id) {
  const { data, error } = await supabase.from("auctions").select("*").eq("id", id).single()
  if (error) throw error
  if (!data) return null
  normalizeAuctionOrganizedBy(data)
  if (!data.organized_by) {
    try {
      const { data: s } = await supabase.from("settings").select("value").eq("key", `auction_org_${id}`).maybeSingle()
      if (s?.value) data.organized_by = s.value
    } catch {}
  }
  return data
}

export async function fetchPendingAuctionPayments() {
  const { data, error } = await supabase.from("auctions").select("*, players(name, phone)").eq("payment_status", "pending").order("created_at", { ascending: true })
  if (error) throw error
  return data
}

export async function markAuctionPaidByOrganizer(auctionId) {
  await createNotification("auction_payment_claimed", `An organizer marked auction payment as sent — please verify and approve.`)
}

export async function approveAuctionPayment(auctionId) {
  const { error } = await supabase.from("auctions").update({ payment_status: "paid" }).eq("id", auctionId)
  if (error) throw error
}

export async function rejectAuctionPayment(auctionId) {
  const { error } = await supabase.from("auctions").update({ payment_status: "rejected" }).eq("id", auctionId)
  if (error) throw error
}

export async function deleteAuctionEvent(auctionId) {
  await supabase.from("auction_bids").delete().eq("auction_id", auctionId)
  await supabase.from("auction_players").delete().eq("auction_id", auctionId)
  await supabase.from("auction_teams").delete().eq("auction_id", auctionId)
  const { error } = await supabase.from("auctions").delete().eq("id", auctionId)
  if (error) throw error
}


// ── Role & Permission system (Founder can promote/demote Organizers) ─────────
export async function setPlayerAccountRole(id, role) {
  const { error } = await supabase.from("players").update({ role }).eq("id", id)
  if (error) throw error
}
