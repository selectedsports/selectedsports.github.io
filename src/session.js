const SESSION_KEY = "ss_session"
export function saveSession(role, player = null) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role, player })) } catch {}
}
export function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null") } catch { return null }
}
export function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}
