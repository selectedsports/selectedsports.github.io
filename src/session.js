const SESSION_KEY = "ss_session"
// Using localStorage (not sessionStorage) so login persists across full browser
// restarts, not just page refreshes within the same tab session. Cleared only
// on explicit logout via clearSession().
export function saveSession(role, player = null) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ role, player })) } catch {}
}
export function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") } catch { return null }
}
export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}
