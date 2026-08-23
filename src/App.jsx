import { useState, useEffect } from "react"
import HomeScreen from "./components/HomeScreen.jsx"
import { UnifiedLoginScreen, RegisterScreen, RegistrationSubmittedScreen } from "./components/LoginScreens.jsx"
import AdminPortal from "./components/AdminPortal.jsx"
import PlayerPortal from "./components/PlayerPortal.jsx"
import ProPortal from "./components/ProPortal.jsx"
import PublicInvitePage from "./components/PublicInvitePage.jsx"
import PublicAuctionView from "./components/PublicAuctionView.jsx"
import PublicAuctionRegister from "./components/PublicAuctionRegister.jsx"
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
function getLiveAuctionCode() {
  restoreGitHubPagesPath()
  const match = window.location.pathname.match(/\/live-auction(?:\/([a-zA-Z0-9\-]+))?\/?$/)
  return match ? (match[1] || null) : undefined // undefined = not this path at all
}
function getAuctionRegisterCode() {
  restoreGitHubPagesPath()
  const match = window.location.pathname.match(/\/auction-register(?:\/([a-zA-Z0-9\-]+))?\/?$/)
  return match ? (match[1] || null) : undefined
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
  const [liveAuctionCode, setLiveAuctionCode] = useState(null)
  const [registerAuctionCode, setRegisterAuctionCode] = useState(null)

  useEffect(() => {
    const liveCode = getLiveAuctionCode()
    if (liveCode !== undefined) { setLiveAuctionCode(liveCode); setScreen("liveAuction"); return }
    const regCode = getAuctionRegisterCode()
    if (regCode !== undefined) { setRegisterAuctionCode(regCode); setScreen("auctionRegister"); return }
    const token = getJoinToken()
    if (token) { setJoinToken(token); setScreen("publicInvite"); return }
    const saved = loadSession()
    if (saved?.role === "admin" || saved?.role === "founder") {
      setIsAdmin(true); setPlayer(saved.player); setScreen("portal")
    } else if (saved?.role === "organizer" && saved?.player) {
      setIsAdmin(true); setIsOrganizer(true); setPlayer(saved.player); setScreen("portal")
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
  const [isOrganizer, setIsOrganizer] = useState(false)
  const handleLogin = async (player) => {
    const phone = (player.phone||"").replace(/[^0-9]/g,"").slice(-10)
    const adminPhone = ADMIN_PHONE.replace(/[^0-9]/g,"").slice(-10)
    console.log("phone:", phone, "adminPhone:", adminPhone)
    const founder = phone === adminPhone || player.role === "founder"
    const organizer = !founder && player.role === "organizer"
    const admin = founder || organizer
    const pro = !admin && player.role === "pro"
    setIsAdmin(admin)
    setIsOrganizer(organizer)
    setIsPro(pro)
    setPlayer(player)
    if (!admin) await loadMatches()
    saveSession(founder ? "founder" : (organizer ? "organizer" : (pro ? "pro" : "player")), player)
    setScreen("portal")
  }

  const handleLogout = () => {
    clearSession(); setPlayer(null); setIsAdmin(false); setIsPro(false); setIsOrganizer(false); setMatches([]); setScreen("home")
  }

  return (
    <>
      {screen==="publicInvite" && <PublicInvitePage token={joinToken}/>}
      {screen==="liveAuction"  && <PublicAuctionView auctionCode={liveAuctionCode}/>}
      {screen==="auctionRegister" && <PublicAuctionRegister auctionCode={registerAuctionCode}/>}
      {screen==="home"         && <HomeScreen onLogin={() => setScreen("login")} onRegister={() => setScreen("register")}/>}
      {screen==="register"     && <RegisterScreen onSuccess={() => setScreen("registered")} onBack={() => setScreen("home")}/>}
      {screen==="registered"   && <RegistrationSubmittedScreen onBack={() => setScreen("home")}/>}
      {screen==="login"        && <UnifiedLoginScreen onAdminSuccess={handleLogin} onPlayerSuccess={handleLogin} onBack={() => setScreen("home")} onRegister={() => setScreen("register")}/>}
      {screen==="portal"       && isAdmin && <AdminPortal player={loggedPlayer} onLogout={handleLogout} isFounder={!isOrganizer}/>}
      {screen==="portal"       && !isAdmin && isPro && <ProPortal player={loggedPlayer} onLogout={handleLogout}/>}
      {screen==="portal"       && !isAdmin && !isPro && (
        loadingMatches
          ? <div style={{ minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>
          : <PlayerPortal player={loggedPlayer} matches={matches} onLogout={handleLogout}/>
      )}
    </>
  )
}