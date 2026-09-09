import { useState, useEffect, lazy, Suspense, Component } from "react"
import HomeScreen from "./components/HomeScreen.jsx"
import { fetchMatches } from "./db.js"
import { ADMIN_PHONE } from "./constants.js"
import { Spinner } from "./components/ui.jsx"
import { saveSession, loadSession, clearSession } from "./session.js"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, errorInfo) {
    console.error("SelectedSports App Error caught by boundary:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: "#F8FAF8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", fontFamily: "var(--font-body)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,101,52,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 16 }}>🏏</div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", fontFamily: "var(--font-head)" }}>Selected Sports</h2>
          <p style={{ fontSize: 13, color: "#64748B", maxWidth: 360, margin: "0 0 20px", lineHeight: 1.5 }}>A new version of the app has been deployed. Tap below to refresh.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => window.location.reload()} style={{ padding: "12px 22px", borderRadius: 12, background: "#166534", color: "#FFFFFF", border: "none", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-head)" }}>🔄 Reload App</button>
            <button onClick={() => { clearSession(); localStorage.clear(); window.location.href = "/" }} style={{ padding: "12px 18px", borderRadius: 12, background: "#FFFFFF", color: "#64748B", border: "1.5px solid #E2E8F0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Return to Home</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const UnifiedLoginScreen = lazy(() => import("./components/LoginScreens.jsx").then(m => ({ default: m.UnifiedLoginScreen })))
const RegisterScreen = lazy(() => import("./components/LoginScreens.jsx").then(m => ({ default: m.RegisterScreen })))
const RegistrationSubmittedScreen = lazy(() => import("./components/LoginScreens.jsx").then(m => ({ default: m.RegistrationSubmittedScreen })))

const AdminPortal = lazy(() => import("./components/AdminPortal.jsx"))
const PlayerPortal = lazy(() => import("./components/PlayerPortal.jsx"))
const ProPortal = lazy(() => import("./components/ProPortal.jsx"))
const PublicInvitePage = lazy(() => import("./components/PublicInvitePage.jsx"))
const PublicAuctionView = lazy(() => import("./components/PublicAuctionView.jsx"))
const PublicAuctionRegister = lazy(() => import("./components/PublicAuctionRegister.jsx"))
const TeamOwnerView = lazy(() => import("./components/TeamOwnerView.jsx"))

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
function getTeamViewParams() {
  restoreGitHubPagesPath()
  const match = window.location.pathname.match(/\/team-view\/([a-zA-Z0-9\-]+)\/([a-zA-Z0-9\-]+)\/?$/)
  return match ? { auctionCode: match[1], teamId: match[2] } : null
}



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
  const [teamViewParams, setTeamViewParams] = useState(null)

  useEffect(() => {
    const teamView = getTeamViewParams()
    if (teamView) { setTeamViewParams(teamView); setScreen("teamView"); return }
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
    <ErrorBoundary>
      <Suspense fallback={<div style={{ minHeight:"100vh",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>}>
        {screen==="publicInvite" && <PublicInvitePage token={joinToken}/>}
        {screen==="liveAuction"  && <PublicAuctionView auctionCode={liveAuctionCode}/>}
        {screen==="teamView"     && <TeamOwnerView auctionCode={teamViewParams?.auctionCode} teamId={teamViewParams?.teamId}/>}
        {screen==="auctionRegister" && <PublicAuctionRegister auctionCode={registerAuctionCode}/>}
        {screen==="home"         && <HomeScreen onLogin={() => setScreen("login")} onRegister={() => setScreen("register")}/>}
        {screen==="register"     && <RegisterScreen onSuccess={() => setScreen("registered")} onBack={() => setScreen("home")}/>}
        {screen==="registered"   && <RegistrationSubmittedScreen onBack={() => setScreen("home")}/>}
        {screen==="login"        && <UnifiedLoginScreen onAdminSuccess={handleLogin} onPlayerSuccess={handleLogin} onBack={() => setScreen("home")} onRegister={() => setScreen("register")}/>}
        {screen==="portal"       && isAdmin && <AdminPortal player={loggedPlayer} onLogout={handleLogout} isFounder={!isOrganizer}/>}
        {screen==="portal"       && !isAdmin && isPro && <ProPortal player={loggedPlayer} onLogout={handleLogout}/>}
        {screen==="portal"       && !isAdmin && !isPro && (
          (loadingMatches || !loggedPlayer)
            ? <div style={{ minHeight:"100vh",background:"#FBF3E7",display:"flex",alignItems:"center",justifyContent:"center" }}><Spinner/></div>
            : <PlayerPortal player={loggedPlayer} matches={matches} onLogout={handleLogout}/>
        )}
      </Suspense>
    </ErrorBoundary>
  )
}