import { useState, useEffect } from "react"
import HomeScreen from "./components/HomeScreen.jsx"
import { AdminLoginScreen, PlayerLoginScreen } from "./components/LoginScreens.jsx"
import AdminPortal from "./components/AdminPortal.jsx"
import PlayerPortal from "./components/PlayerPortal.jsx"
import PublicInvitePage from "./components/PublicInvitePage.jsx"
import { fetchMatches } from "./db.js"
import { Spinner } from "./components/ui.jsx"
function restoreGitHubPagesPath() {
  const params = new URLSearchParams(window.location.search)
  const redirectedPath = params.get("p")
  if (redirectedPath) window.history.replaceState(null, "", redirectedPath)
}
function getJoinToken() {
  restoreGitHubPagesPath()
  const path = window.location.pathname
  const match = path.match(/\/join\/([a-zA-Z0-9\-]+)/)
  return match ? match[1] : null
}
export default function App() {
  const [screen, setScreen] = useState("home")
  const [loggedPlayer, setPlayer] = useState(null)
  const [matches, setMatches] = useState([])
  const [loadingMatches, setLoading] = useState(false)
  const [joinToken, setJoinToken] = useState(null)
  useEffect(() => {
    const token = getJoinToken()
    if (token) { setJoinToken(token); setScreen("publicInvite") }
  }, [])
  const loadMatches = async () => {
    setLoading(true)
    try { setMatches(await fetchMatches()) } catch {}
    setLoading(false)
  }
  const handlePlayerSuccess = async (player) => {
    setPlayer(player)
    await loadMatches()
    setScreen("player")
  }
  if (screen === "publicInvite") return <PublicInvitePage token={joinToken} />
  if (screen === "home") return <HomeScreen onAdmin={() => setScreen("adminLogin")} onPlayer={() => setScreen("playerLogin")} />
  if (screen === "adminLogin") return <AdminLoginScreen onSuccess={() => setScreen("admin")} onBack={() => setScreen("home")} />
  if (screen === "playerLogin") return <PlayerLoginScreen onSuccess={handlePlayerSuccess} onBack={() => setScreen("home")} />
  if (screen === "admin") return <AdminPortal onLogout={() => setScreen("home")} />
  if (screen === "player") {
    if (loadingMatches) return <div style={{ minHeight:"100vh", background:"#F0F4F1", display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>
    return <PlayerPortal player={loggedPlayer} matches={matches} onLogout={() => { setPlayer(null); setMatches([]); setScreen("home") }} />
  }
  return null
}
