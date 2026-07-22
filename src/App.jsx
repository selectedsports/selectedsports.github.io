import { useState, useEffect } from "react"
import HomeScreen from "./components/HomeScreen.jsx"
import { UnifiedLoginScreen, RegisterScreen, RegistrationSubmittedScreen } from "./components/LoginScreens.jsx"
import AdminPortal from "./components/AdminPortal.jsx"
import PlayerPortal from "./components/PlayerPortal.jsx"
import ProPortal from "./components/ProPortal.jsx"
import PublicInvitePage from "./components/PublicInvitePage.jsx"
import { fetchMatches } from "./db.js"
import { ADMIN_PHONE } from "./constants.js"
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

import { saveSession, loadSession, clearSession } from "./session.js"

// Detect iOS
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone



export default function App() {
  const [screen, setScreen]          = useState("home")
  const [loggedPlayer, setPlayer]    = useState(null)
  const [isAdmin, setIsAdmin]        = useState(false)
  const [matches, setMatches]        = useState([])
  const [loadingMatches, setLoading] = useState(false)
  const [joinToken, setJoinToken]    = useState(null)

  useEffect(() => {
    const token = getJoinToken()
    if (token) { setJoinToken(token); setScreen("publicInvite"); return }
    const saved = loadSession()
    if (saved?.role === "admin") {
      setIsAdmin(true); setPlayer(saved.player); setScreen("portal")
    } else if (saved?.role === "pro" && saved?.player) {
      setIsAdmin(false); setIsPro(true); setPlayer(saved.player); setScreen("portal")
    } else if (saved?.role === "player" && saved?.player) {
      setIsAdmin(false); setPlayer(saved.player)
      loadMatches().then(() => setScreen("portal"))
    }
  }, [])

  const loadMatches = async () => {
    setLoading(true)
    try { setMatches(await fetchMatches()) } catch {}
    setLoading(false)
  }

  const [isPro, setIsPro] = useState(false)
  const handleLogin = async (player) => {
    const phone = (player.phone||"").replace(/[^0-9]/g,"").slice(-10)
    const adminPhone = ADMIN_PHONE.replace(/[^0-9]/g,"").slice(-10)
    console.log("phone:", phone, "adminPhone:", adminPhone)
    const admin = phone === adminPhone
    const pro = !admin && player.role === "pro"
    setIsAdmin(admin)
    setIsPro(pro)
    setPlayer(player)
    if (!admin) await loadMatches()
    saveSession(admin ? "admin" : (pro ? "pro" : "player"), player)
    setScreen("portal")
  }

  const handleLogout = () => {
    clearSession(); setPlayer(null); setIsAdmin(false); setIsPro(false); setMatches([]); setScreen("home")
  }

  return (
    <>
      {screen==="publicInvite" && <PublicInvitePage token={joinToken}/>}
      {screen==="home"         && <HomeScreen onLogin={() => setScreen("login")} onRegister={() => setScreen("register")}/>}
      {screen==="register"     && <RegisterScreen onSuccess={() => setScreen("registered")} onBack={() => setScreen("home")}/>}
      {screen==="registered"   && <RegistrationSubmittedScreen onBack={() => setScreen("home")}/>}
      {screen==="login"        && <UnifiedLoginScreen onAdminSuccess={handleLogin} onPlayerSuccess={handleLogin} onBack={() => setScreen("home")}/>}
      {screen==="portal"       && isAdmin && <AdminPortal player={loggedPlayer} onLogout={handleLogout}/>}
      {screen==="portal"       && !isAdmin && isPro && <ProPortal player={loggedPlayer} onLogout={handleLogout}/>}
      {screen==="portal"       && !isAdmin && !isPro && (
        loadingMatches
          ? <div style={{ minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>
          : <PlayerPortal player={loggedPlayer} matches={matches} onLogout={handleLogout}/>
      )}
    </>
  )
}