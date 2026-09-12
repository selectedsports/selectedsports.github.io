import { useState, useEffect, useRef, useMemo } from "react"
import {
  MapPin, User as UserIcon, Trophy, Calendar, Clock, Users, Wallet, Lock,
  CheckCircle2, XCircle, Hourglass, Zap, Clipboard, CalendarPlus, LogOut,
  Phone, Bell as BellIcon, CreditCard, Home, ChevronRight, Share2, Award,
  ExternalLink, Sparkles, Check, ShieldCheck, ArrowLeft, Send, MessageSquare,
  ChevronDown, HelpCircle, Activity
} from "lucide-react"
import {
  LogoFull, Logo, Av, Tag, Card, Spinner, StatsBanner, Bell, MessageInbox,
  LeaderboardPage, ProRequestCard, RoleBadge
} from "./ui.jsx"
import {
  fetchMatchPlayers, fetchExpenses, fetchPayments, fetchChat, sendMessage,
  setPlayerStatus, fetchGrounds, fetchOrganizerUpi, confirmPlayerToMatch,
  subscribeToChat, updatePlayer, fetchContributions, fetchStats, fetchPlayerStats,
  fetchInboxMessages, countUnreadMessages, markMessagesRead, fetchPlayerGrounds,
  updatePlayerRole, uploadProfilePhoto, fetchPlayerAuctionHistory, fetchAuctionPlayers
} from "../db.js"
import { PhotoUploadField } from "./PhotoCropModal.jsx"
import { fmtDate, dayName, matchTitle, isValidName, birthDateError, maxBirthDateForMinAge, exportAuctionPoolPdf } from "../constants.js"
import { supabase } from "../supabase.js"
import { useMobile } from "../hooks/useMobile.js"

// Calendar .ics helpers
function pad2(n) { return String(n).padStart(2, "0") }
function parseMatchStart(m) {
  const startPart = (m.time_slot || "").split("-")[0].trim()
  let [time, ampm] = startPart.split(" ")
  let [hh, mm] = (time || "0:00").split(":").map(Number)
  if (/pm/i.test(ampm) && hh !== 12) hh += 12
  if (/am/i.test(ampm) && hh === 12) hh = 0
  const [y, mo, d] = (m.date || "2026-01-01").split("-").map(Number)
  return new Date(y, mo - 1, d, hh || 0, mm || 0)
}
function parseMatchEnd(m) {
  const parts = (m.time_slot || "").split("-")
  if (parts.length < 2) {
    const s = parseMatchStart(m)
    return new Date(s.getTime() + 2 * 3600000)
  }
  const endPart = parts[1].trim()
  let [time, ampm] = endPart.split(" ")
  let [hh, mm] = (time || "0:00").split(":").map(Number)
  if (/pm/i.test(ampm) && hh !== 12) hh += 12
  if (/am/i.test(ampm) && hh === 12) hh = 0
  const [y, mo, d] = (m.date || "2026-01-01").split("-").map(Number)
  return new Date(y, mo - 1, d, hh || 0, mm || 0)
}
function icsDate(dt) {
  return dt.getFullYear() + pad2(dt.getMonth() + 1) + pad2(dt.getDate()) + "T" + pad2(dt.getHours()) + pad2(dt.getMinutes()) + "00"
}
function makeICS(m) {
  const start = parseMatchStart(m)
  const end = parseMatchEnd(m)
  const uid = "match-" + m.id + "@selectedsports"
  const eveningBefore = new Date(start)
  eveningBefore.setDate(eveningBefore.getDate() - 1)
  eveningBefore.setHours(18, 0, 0, 0)
  const minsEvening = Math.round((start - eveningBefore) / 60000)
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Selected Sports//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" + icsDate(new Date()),
    "DTSTART:" + icsDate(start),
    "DTEND:" + icsDate(end),
    "SUMMARY:🏏 " + (matchTitle(m) || "Match"),
    "LOCATION:" + (m.ground || ""),
    "DESCRIPTION:Match confirmed via Selected Sports.",
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Match in 2 hours", "END:VALARM",
    "BEGIN:VALARM", "TRIGGER:-PT" + minsEvening + "M", "ACTION:DISPLAY", "DESCRIPTION:Match tomorrow", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ]
  return lines.join("\r\n")
}
function downloadICS(m) {
  const ics = makeICS(m)
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = (m.team || "match").replace(/[^a-z0-9]/gi, "_") + ".ics"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function ppShare(expenses, confirmedCount) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  return confirmedCount > 0 ? Math.round(total / confirmedCount) : 0
}

function PlayerPortalInner({ player, matches = [], onLogout }) {
  const [myMatches, setMyMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState(null)
  const [detail, setDetail] = useState(null)
  const isMobile = useMobile()

  // Inbox & notifications
  const [unreadCount, setUnreadCount] = useState(0)
  const [showInbox, setShowInbox] = useState(false)
  const [inboxMsgs, setInboxMsgs] = useState([])

  useEffect(() => {
    countUnreadMessages(player.id).then(setUnreadCount).catch(() => {})
  }, [player.id])

  const openInbox = async () => {
    try {
      const msgs = await fetchInboxMessages(player.id)
      setInboxMsgs(msgs)
      setShowInbox(true)
      await markMessagesRead(player.id)
      setUnreadCount(0)
    } catch (e) {
      alert(e.message)
    }
  }

  // Navigation & tabs
  const [tab, setTab] = useState("dashboard") // dashboard | matches | tournaments | leaderboard | profile
  const [matchFilter, setMatchFilter] = useState("upcoming") // upcoming | completed | all
  const [menuOpen, setMenuOpen] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  // Stats & contributions
  const [stats, setStats] = useState(null)
  useEffect(() => {
    fetchPlayerStats(player.id).then(setStats).catch(() => {})
  }, [player.id])

  const [contribTotal, setContribTotal] = useState(0)
  const [contribList, setContribList] = useState([])
  useEffect(() => {
    fetchContributions(player.id).then(c => {
      setContribList(c || [])
      setContribTotal((c || []).reduce((s, x) => s + Number(x.amount || 0), 0))
    }).catch(() => {})
  }, [player.id])

  // Grounds
  const [grounds, setGrounds] = useState([])
  const [myGrounds, setMyGrounds] = useState([])
  useEffect(() => {
    fetchGrounds().then(setGrounds).catch(() => {})
    fetchPlayerGrounds(player.id).then(setMyGrounds).catch(() => {})
  }, [player.id])

  // Auction history for player
  const [auctionHistory, setAuctionHistory] = useState([])
  const [loadingAuctions, setLoadingAuctions] = useState(false)
  useEffect(() => {
    if (player.phone) {
      setLoadingAuctions(true)
      fetchPlayerAuctionHistory(player.phone)
        .then(res => setAuctionHistory(res || []))
        .catch(() => {})
        .finally(() => setLoadingAuctions(false))
    }
  }, [player.phone])

  // Captain Auction Pool Analysis State
  const [captainPoolModal, setCaptainPoolModal] = useState(null)
  const [captainPoolPlayers, setCaptainPoolPlayers] = useState([])
  const [loadingCaptainPool, setLoadingCaptainPool] = useState(false)
  const [captainPoolSearch, setCaptainPoolSearch] = useState("")
  const [captainPoolRoleFilter, setCaptainPoolRoleFilter] = useState("")

  // Profile Edit Form State
  const nameParts = (player.name || "").trim().split(/\s+/)
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  const [editing, setEditing] = useState(false)
  const [pSaving, setPSaving] = useState(false)
  const [pForm, setPForm] = useState({
    firstName,
    lastName,
    phone: player.phone || "",
    pin: player.pin || "",
    playingRole: player.playing_role || "All-rounder",
    city: player.city || "",
    birthDate: player.birth_date || "",
    jerseyNumber: player.jersey_number || "",
    jerseySize: player.jersey_size || "",
    photoFile: null,
    photoPreview: player.profile_image_url || ""
  })

  const capFn = (v) => v.replace(/[^a-zA-Z ]/g, "").replace(/\b\w/g, c => c.toUpperCase())

  // Load matches
  useEffect(() => {
    ;(async () => {
      const matchPromises = (matches || []).map(async (m) => {
        try {
          const mps = await fetchMatchPlayers(m.id)
          const myRow = (mps || []).find(mp => mp.player_id === player.id)
          if (myRow) return { match: m, myStatus: myRow.status, matchPlayers: mps }
          if (m.visibility === "public") return { match: m, myStatus: "none", matchPlayers: mps }
        } catch {}
        return null
      })
      const resolved = await Promise.all(matchPromises)
      const results = resolved.filter(Boolean)
      setMyMatches(results)
      setLoading(false)

      // Web notification for pending invites
      try {
        const pending = results.filter(r => r.myStatus === "pending")
        if (pending.length > 0 && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Selected Sports", {
              body: `You have ${pending.length} match invite${pending.length > 1 ? "s" : ""} awaiting your response!`,
              icon: "/logo-icon-v4.png"
            })
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(perm => {
              if (perm === "granted") {
                new Notification("Selected Sports", {
                  body: `You have ${pending.length} match invite${pending.length > 1 ? "s" : ""}!`,
                  icon: "/logo-icon-v4.png"
                })
              }
            })
          }
        }
      } catch {}
    })()
  }, [matches, player.id])

  const loadDetail = async (m) => {
    try {
      const [mps, exps, pays, chats, orgUpi] = await Promise.all([
        fetchMatchPlayers(m.id),
        fetchExpenses(m.id),
        fetchPayments(m.id),
        fetchChat(m.id),
        fetchOrganizerUpi(m)
      ])
      setDetail({ match: m, matchPlayers: mps, expenses: exps, payments: pays, chat: chats, organizerUpi: orgUpi })
      setSelId(m.id)
    } catch (e) {
      alert("Error loading match: " + e.message)
    }
  }

  const saveProfile = async () => {
    if (!pForm.firstName.trim()) { alert("First name required"); return }
    if (!isValidName(pForm.firstName)) { alert("First name can only contain letters."); return }
    if (!pForm.lastName.trim()) { alert("Last name required"); return }
    if (!isValidName(pForm.lastName)) { alert("Last name can only contain letters."); return }
    if (pForm.pin.length !== 4) { alert("PIN must be 4 digits"); return }
    if (!pForm.city.trim()) { alert("City is required"); return }
    if (!pForm.birthDate) { alert("Date of birth is required"); return }
    const dobErr = birthDateError(pForm.birthDate)
    if (dobErr) { alert(dobErr); return }
    if (!pForm.jerseyNumber.trim()) { alert("Jersey number is required"); return }
    if (!pForm.jerseySize) { alert("Jersey size is required"); return }

    setPSaving(true)
    try {
      let photoUrl = pForm.photoPreview
      if (pForm.photoFile) {
        photoUrl = await uploadProfilePhoto(pForm.photoFile, pForm.phone)
      }
      const fullName = `${pForm.firstName.trim()} ${pForm.lastName.trim()}`
      await updatePlayer(
        player.id,
        fullName,
        pForm.phone.replace(/[^0-9]/g, "").slice(-10),
        pForm.pin,
        pForm.city.trim(),
        {
          birthDate: pForm.birthDate,
          profileImageUrl: photoUrl,
          jerseyNumber: pForm.jerseyNumber,
          jerseySize: pForm.jerseySize
        }
      )
      if (pForm.playingRole) {
        await updatePlayerRole(player.id, pForm.playingRole)
      }
      alert("Profile updated successfully! Refreshing details...")
      window.location.reload()
    } catch (e) {
      alert(e.message)
    }
    setPSaving(false)
  }

  // Copy Digital Sports Pass Bio
  const copyDigitalPass = () => {
    const roleText = player.playing_role || "Cricket Player"
    const jerseyText = player.jersey_number ? `#${player.jersey_number}` : "—"
    const text = `🏏 *SELECTED SPORTS - DIGITAL PLAYER PASS*\n👤 *Name:* ${player.name}\n👕 *Jersey:* ${jerseyText} (${player.jersey_size || "M"})\n⚡ *Role:* ${roleText}\n📍 *City:* ${player.city || "Pune"}\n🏅 *Player ID:* #SS-${String(player.id).slice(-4).toUpperCase()}\n🌐 *Portal:* https://selectedsports.com`
    navigator.clipboard.writeText(text)
    setCopiedPass(true)
    setTimeout(() => setCopiedPass(false), 2500)
  }

  // Metrics computation
  const pendingMatches = myMatches.filter(r => r.myStatus === "pending")
  const confirmedMatches = myMatches.filter(r => r.myStatus === "confirmed")
  const waitlistMatches = myMatches.filter(r => r.myStatus === "waitlist")
  const declinedMatches = myMatches.filter(r => r.myStatus === "declined")
  const upcomingMatches = myMatches.filter(r => r.match.status !== "completed")
  const completedMatches = myMatches.filter(r => r.match.status === "completed")

  const todayStr = new Date().toISOString().split("T")[0]
  const todaysMatch = myMatches.find(r => r.match.date === todayStr && r.match.status !== "cancelled")

  // Attendance rate
  const totalInvited = confirmedMatches.length + declinedMatches.length + waitlistMatches.length
  const attendanceRate = totalInvited > 0 ? Math.round((confirmedMatches.length / totalInvited) * 100) : 100

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAF8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Spinner />
        <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, fontFamily: "var(--font-head)" }}>Loading Player Portal...</div>
      </div>
    )
  }

  if (selId && detail) {
    return (
      <MatchDetailPlayer
        detail={detail}
        player={player}
        isMobile={isMobile}
        onBack={() => { setSelId(null); setDetail(null) }}
        onRespond={async (action) => {
          await confirmPlayerToMatch(detail.match.id, player.id, action)
          alert(action === "confirmed" ? "You're confirmed for this match! ✅" : "Marked as not available.")
          await loadDetail(detail.match)
        }}
      />
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F1F5F9",
      backgroundImage: "radial-gradient(at 0% 0%, rgba(22, 101, 52, 0.06) 0px, transparent 450px), radial-gradient(at 100% 0%, rgba(184, 134, 11, 0.04) 0px, transparent 400px), radial-gradient(#CBD5E1 0.75px, transparent 0.75px)",
      backgroundSize: "100% 100%, 100% 100%, 24px 24px",
      backgroundAttachment: "fixed",
      fontFamily: "var(--font-body)",
      paddingBottom: 84,
      color: "#0F172A"
    }}>
      
      {/* ── STICKY TOP APP HEADER ── */}
      <header style={{
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        height: 60,
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 150,
        boxShadow: "0 2px 10px rgba(15,23,42,0.03)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              background: "#F8FAF8",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#0F172A",
              position: "relative"
            }}
            title="Open Navigation"
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>☰</span>
            {pendingMatches.length > 0 && (
              <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }}/>
            )}
          </button>

          <div onClick={() => setTab("dashboard")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Logo size={32} />
            <div>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: 15, color: "#0F172A", lineHeight: 1.1 }}>
                Selected <span style={{ color: "#B8860B" }}>Sports</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: 0.6, background: "rgba(22,101,52,0.08)", padding: "1px 6px", borderRadius: 4 }}>PLAYER PORTAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "center", gap: 4, margin: "0 16px" }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: Home },
              { id: "matches", label: "Matches", icon: Users, badge: pendingMatches.length > 0 ? pendingMatches.length : null },
              { id: "tournaments", label: "Tournaments", icon: Trophy, badge: auctionHistory.some(a => (a.is_captain || a.status === "captain") && a.status !== "waitlist" && a.payment_status !== "waitlist") ? "👑 Captain" : (auctionHistory.length > 0 ? auctionHistory.length : null) },
              { id: "leaderboard", label: "Rankings", icon: Award },
              { id: "profile", label: "Pass & Profile", icon: UserIcon },
            ].map(item => {
              const isActive = tab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 12px",
                    borderRadius: 9,
                    border: isActive ? "1.5px solid #166534" : "1.5px solid transparent",
                    background: isActive ? "rgba(22,101,52,0.08)" : "transparent",
                    color: isActive ? "#166534" : "#475569",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 12.5,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    transition: "all 140ms"
                  }}
                >
                  <item.icon size={15} color={isActive ? "#166534" : "#64748B"} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      background: item.badge === "👑 Captain" ? "linear-gradient(135deg, #F59E0B, #D97706)" : "#EF4444",
                      color: item.badge === "👑 Captain" ? "#0F172A" : "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "1px 6px",
                      borderRadius: 999
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Notifications Bell */}
          <button
            onClick={openInbox}
            style={{
              background: "#F8FAF8",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748B",
              position: "relative"
            }}
            title="Inbox Messages"
          >
            <BellIcon size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: -3,
                right: -3,
                background: "#EF4444",
                color: "#FFFFFF",
                fontSize: 10,
                fontWeight: 800,
                padding: "1px 5px",
                borderRadius: 999,
                boxShadow: "0 2px 5px rgba(239,68,68,0.4)"
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Player Avatar */}
          <div onClick={() => setTab("profile")} style={{ cursor: "pointer", position: "relative" }}>
            {player.profile_image_url ? (
              <img
                src={player.profile_image_url}
                alt={player.name}
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #166534" }}
              />
            ) : (
              <Av name={player.name} id={player.id} sz={36} />
            )}
          </div>
        </div>
      </header>

      {/* ── SIDEBAR SLIDE-OVER DRAWER ── */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 300,
            display: "flex"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              width: 285,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "6px 0 28px rgba(0,0,0,0.2)",
              animation: "drawerSlideIn 200ms ease-out"
            }}
          >
            <style>{`
              @keyframes drawerSlideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Drawer Header */}
            <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <LogoFull size={32} />
              <button
                onClick={() => setMenuOpen(false)}
                style={{ background: "#F8FAF8", border: "none", width: 28, height: 28, borderRadius: 8, fontSize: 16, cursor: "pointer", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>

            {/* Player Identity Card inside Drawer */}
            <div style={{ padding: "14px 16px", background: "linear-gradient(135deg, rgba(22,101,52,0.06), rgba(22,101,52,0.02))", borderBottom: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {player.profile_image_url ? (
                  <img src={player.profile_image_url} alt={player.name} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #166534" }}/>
                ) : (
                  <Av name={player.name} id={player.id} sz={44} />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {player.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, background: "#166534", color: "#FFFFFF", padding: "1px 7px", borderRadius: 4 }}>PLAYER</span>
                    {player.jersey_number && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>#{player.jersey_number}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Privileges note */}
              <div style={{ marginTop: 10, padding: "7px 10px", background: "#FFFFFF", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={14} color="#166534"/>
                <span>RSVP to matches, auction pool &amp; stats</span>
              </div>
            </div>

            {/* Navigation items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { id: "dashboard", label: "Home Dashboard", icon: Home },
                { id: "matches", label: "My Matches", icon: Users, badge: pendingMatches.length > 0 ? pendingMatches.length : null },
                { id: "tournaments", label: "Tournaments & Auctions", icon: Trophy, badge: auctionHistory.length > 0 ? auctionHistory.length : null },
                { id: "leaderboard", label: "Leaderboard", icon: Award },
                { id: "profile", label: "Digital Pass & Profile", icon: UserIcon },
              ].map(item => {
                const isActive = tab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id); setMenuOpen(false) }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "11px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: isActive ? "rgba(22,101,52,0.08)" : "transparent",
                      color: isActive ? "#166534" : "#0F172A",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                      transition: "all 150ms"
                    }}
                  >
                    <item.icon size={17} color={isActive ? "#166534" : "#64748B"} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span style={{ background: "#EF4444", color: "#FFFFFF", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}

              <div style={{ margin: "10px 0", height: 1, background: "#F1F5F9" }}/>

              {/* Upgrade to Pro Callout */}
              <div style={{ padding: "12px", background: "linear-gradient(135deg, rgba(246,196,83,0.12), rgba(246,196,83,0.04))", borderRadius: 12, border: "1px solid rgba(246,196,83,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 12, color: "#B8860B" }}>
                  <Sparkles size={14}/> Want to Schedule Matches?
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, lineHeight: 1.4 }}>
                  Upgrade to Pro to host matches, manage squads, and split ground fees.
                </div>
                <button
                  onClick={() => { setTab("profile"); setMenuOpen(false) }}
                  style={{ marginTop: 8, width: "100%", padding: "7px 10px", borderRadius: 8, background: "#166534", color: "#FFFFFF", border: "none", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                >
                  Request Pro Access →
                </button>
              </div>

              {/* Need help banner */}
              <button
                onClick={() => { setShowSupportModal(true); setMenuOpen(false) }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px dashed #CBD5E1",
                  background: "#F8FAF8",
                  color: "#64748B",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  marginTop: 6
                }}
              >
                <HelpCircle size={15} color="#166534"/>
                <span>Organizer Support (Zeeshan)</span>
              </button>
            </div>

            {/* Logout button */}
            <div style={{ padding: "14px 16px", borderTop: "1px solid #F1F5F9" }}>
              <button
                onClick={onLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "11px",
                  borderRadius: 10,
                  border: "1px solid rgba(239,68,68,0.25)",
                  background: "rgba(239,68,68,0.06)",
                  color: "#EF4444",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-head)"
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUPPORT MODAL ── */}
      {showSupportModal && (
        <div onClick={() => setShowSupportModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: 18, maxWidth: 420, width: "100%", padding: 22, boxShadow: "0 24px 60px rgba(15,23,42,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "var(--font-head)", color: "#0F172A" }}>Tournament &amp; Platform Support</div>
              <button onClick={() => setShowSupportModal(false)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 14px", lineHeight: 1.5 }}>
              For auction tournaments, match scheduling, or player account queries, connect directly with the organizer:
            </p>
            <div style={{ background: "#F8FAF8", borderRadius: 12, padding: "14px", border: "1px solid #E2E8F0", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>Md Zeeshan</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Head of Tournaments &amp; Selected Sports Support</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 14, fontWeight: 800, color: "#166534" }}>
                <Phone size={14}/> 9897439743
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <a href="tel:9897439743" style={{ padding: "11px", borderRadius: 10, background: "#166534", color: "#FFFFFF", textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 700 }}>📞 Call Direct</a>
              <a href="https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I'm%20a%20player%20on%20Selected%20Sports%20and%20need%20assistance" target="_blank" rel="noreferrer" style={{ padding: "11px", borderRadius: 10, background: "#25D366", color: "#FFFFFF", textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 700 }}>WhatsApp ↗</a>
            </div>
          </div>
        </div>
      )}

      {/* ── INBOX MODAL ── */}
      {showInbox && (
        <MessageInbox messages={inboxMsgs} onClose={() => setShowInbox(false)} />
      )}

      {/* ── MAIN PORTAL CONTENT WRAPPER ── */}
      <main style={{ maxWidth: isMobile ? "100%" : 860, margin: "0 auto", padding: isMobile ? "16px 12px 110px" : "28px 18px 40px" }}>
        
        {/* TAB 1: DASHBOARD */}
        {tab === "dashboard" && (() => {
          const hour = new Date().getHours()
          const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"
          const firstNameD = (player.name || "Player").split(" ")[0]
          const capTournament = auctionHistory.find(ap => (ap.status === "captain" || ap.is_captain) && ap.status !== "waitlist" && ap.payment_status !== "waitlist")
          const hasCaptainRole = !!capTournament
          const rawCapTeam = capTournament?.auction_teams?.name || ""
          const captainTeamDisplay = rawCapTeam ? (/^team\s+/i.test(rawCapTeam) ? rawCapTeam : `Team ${rawCapTeam}`) : "Your Franchise"
          const spotlightAuction = capTournament || (auctionHistory.length > 0 ? auctionHistory[0] : null)

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Player Hero Card */}
              <div style={{
                background: "linear-gradient(135deg, #14532D 0%, #166534 50%, #0F766E 100%)",
                borderRadius: 22,
                padding: isMobile ? "20px 18px" : "24px 24px",
                color: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(20,83,45,0.28)",
                position: "relative",
                overflow: "hidden",
                border: hasCaptainRole ? "2px solid #F59E0B" : "1px solid rgba(255,255,255,0.15)"
              }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: hasCaptainRole ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)", pointerEvents: "none" }}/>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>
                        🏏 {player.playing_role || "Cricket Player"}
                      </span>
                      {hasCaptainRole && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0F172A", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 900, letterSpacing: 0.5, boxShadow: "0 2px 8px rgba(245,158,11,0.35)" }}>
                          👑 CAPTAIN · {captainTeamDisplay.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, margin: "4px 0", fontFamily: "var(--font-head)" }}>
                      {greeting}, {firstNameD}!
                    </h1>
                    <div style={{ fontSize: 12.5, opacity: 0.9, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                      <span><Calendar size={12} style={{ verticalAlign: "-2px" }}/> {dayName(todayStr)}</span>
                      <span>·</span>
                      <span>📍 {player.city || "Pune"}</span>
                      {player.jersey_number && (
                        <>
                          <span>·</span>
                          <span style={{ fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "1px 7px", borderRadius: 4 }}>
                            Jersey #{player.jersey_number} ({player.jersey_size || "L"})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div onClick={() => setTab("profile")} style={{ cursor: "pointer", textAlign: "center", flexShrink: 0 }}>
                    {player.profile_image_url ? (
                      <img src={player.profile_image_url} alt={player.name} style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", border: hasCaptainRole ? "3px solid #F59E0B" : "3px solid #FFFFFF", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}/>
                    ) : (
                      <Av name={player.name} id={player.id} sz={68} />
                    )}
                  </div>
                </div>

                {/* Quick stats / Attendance tracker */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Activity size={14} />
                      <span>Attendance: <strong>{attendanceRate}%</strong></span>
                    </div>
                    <span>·</span>
                    <span>Confirmed: <strong>{confirmedMatches.length}</strong></span>
                  </div>
                  <button
                    onClick={() => setTab("profile")}
                    style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", fontSize: 11.5, fontWeight: 800, padding: "5px 12px", borderRadius: 8, cursor: "pointer" }}
                  >
                    Digital Pass →
                  </button>
                </div>
              </div>

              {/* ── TOURNAMENT & CAPTAIN SPOTLIGHT CARD ── */}
              {spotlightAuction && (() => {
                const auc = spotlightAuction.auctions || {}
                const team = spotlightAuction.auction_teams || {}
                const isCap = spotlightAuction.status === "captain" || spotlightAuction.is_captain
                const teamN = team.name || (spotlightAuction.status === "sold" ? "Drafted Team" : null)

                return (
                  <div style={{
                    background: "linear-gradient(145deg, #131E30 0%, #1E293B 100%)",
                    borderRadius: 20,
                    padding: isMobile ? "18px 16px" : "22px 22px",
                    color: "#FFFFFF",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                    border: isCap ? "1.5px solid #F59E0B" : "1.5px solid rgba(255,255,255,0.12)",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    {/* Glowing ambient ring */}
                    <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: isCap ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)", pointerEvents: "none", filter: "blur(20px)" }}/>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isCap ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.1)", border: isCap ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.15)", padding: "4px 11px", borderRadius: 999, fontSize: 11, fontWeight: 900, color: isCap ? "#FEF08A" : "#86EFAC", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {isCap ? "👑 TOURNAMENT CAPTAIN & OWNER" : "🏆 TOURNAMENT REGISTRATION"}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.1)", color: "#CBD5E1", padding: "3px 8px", borderRadius: 6 }}>
                        {auc.status === "live" ? "🔴 Live Auction" : "Registration Open"}
                      </span>
                    </div>

                    <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, margin: "0 0 6px", fontFamily: "var(--font-head)", color: "#FFFFFF" }}>
                      {auc.name || "Battle of Champions"}
                    </h2>

                    <div style={{ fontSize: 12, color: "#94A3B8", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      {auc.organized_by && <span>🛡️ Org: <strong style={{ color: "#E2E8F0" }}>{auc.organized_by}</strong></span>}
                      {auc.location && (
                        <>
                          <span>·</span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(auc.location)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#86EFAC", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}
                          >
                            <MapPin size={12}/> {auc.location} ↗
                          </a>
                        </>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 12px", marginBottom: 16, fontSize: 12, border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
                      <span>📅 <strong>{auc.auction_date ? fmtDate(auc.auction_date) : "Date TBD"}</strong></span>
                      {auc.auction_time && <span>⏰ {auc.auction_time}</span>}
                      <span>🪙 Purse: <strong>{Number(auc.points_purse || 100000).toLocaleString("en-IN")} Coins</strong></span>
                      <span style={{ color: "#86EFAC", fontWeight: 700 }}>✅ ₹180 Fee Paid</span>
                    </div>

                    {/* Team & Captain Showcase */}
                    {teamN && (
                      <div style={{
                        background: isCap ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.05))" : "rgba(255,255,255,0.05)",
                        borderRadius: 14,
                        padding: "14px 16px",
                        border: isCap ? "1.5px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.1)",
                        marginBottom: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: isCap ? "#F59E0B" : "#166534",
                            color: isCap ? "#0F172A" : "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: 18
                          }}>
                            {team.logo_url ? (
                              <img src={team.logo_url} alt={teamN} style={{ width: "100%", height: "100%", borderRadius: 10, objectFit: "cover" }}/>
                            ) : (
                              isCap ? "👑" : "🛡️"
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: isCap ? "#FEF08A" : "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
                              {isCap ? "Leading as Captain & Owner" : "Assigned Team"}
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: "#FFFFFF", fontFamily: "var(--font-head)" }}>
                              {teamN ? (/^team\s+/i.test(teamN) ? teamN : `Team ${teamN}`) : "Assigned Team"}
                            </div>
                            <div style={{ fontSize: 11.5, color: "#CBD5E1", marginTop: 2 }}>
                              Role: <strong>{spotlightAuction.playing_role || player.playing_role || "All-rounder"}</strong>
                              {spotlightAuction.jersey_number && <span> · Kit #{spotlightAuction.jersey_number} ({spotlightAuction.jersey_size || "L"})</span>}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Starting Purse</div>
                          <div style={{ fontSize: 15, fontWeight: 900, color: "#FEF08A", fontFamily: "var(--font-head)" }}>
                            🪙 {Number(team.purse_total || auc.points_purse || 100000).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Direct Action Links */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 8 }}>
                      {team.id && auc.auction_code && (
                        <a
                          href={`/team-view/${auc.auction_code}/${team.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "#F59E0B",
                            color: "#0F172A",
                            fontWeight: 900,
                            fontSize: 12,
                            textDecoration: "none",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            boxShadow: "0 2px 6px rgba(245,158,11,0.25)"
                          }}
                        >
                          👑 Team Console
                        </a>
                      )}
                      {auc.auction_code && (
                        <a
                          href={`/live-auction/${auc.auction_code}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "#166534",
                            color: "#FFFFFF",
                            fontWeight: 800,
                            fontSize: 12,
                            textDecoration: "none",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            border: "1px solid rgba(255,255,255,0.2)"
                          }}
                        >
                          📡 Live Auction
                        </a>
                      )}
                      {auc.auction_code && (
                        <a
                          href={`/auction-register/${auc.auction_code}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(255,255,255,0.12)",
                            color: "#FFFFFF",
                            fontWeight: 800,
                            fontSize: 12,
                            textDecoration: "none",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            border: "1px solid rgba(255,255,255,0.2)",
                            gridColumn: isMobile && team.id ? "span 2" : "auto"
                          }}
                        >
                          📋 Squads &amp; Pool
                        </a>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* ── ACTION NEEDED: PENDING MATCH INVITES ── */}
              {pendingMatches.length > 0 && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontWeight: 900, fontSize: 15, color: "#0F172A", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-head)" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", animation: "pulse 1.5s infinite" }}></span>
                      Action Required ({pendingMatches.length})
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", background: "rgba(22,101,52,0.1)", padding: "2px 8px", borderRadius: 999 }}>
                      RSVP Needed
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {pendingMatches.map(({ match: m }) => (
                      <Card key={m.id} style={{ padding: "16px", border: "1.5px solid rgba(239,68,68,0.3)", background: "#FFFFFF", boxShadow: "0 4px 14px rgba(239,68,68,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                              {matchTitle(m)}
                            </div>
                            <div style={{ color: "#64748B", fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                              <span><Calendar size={13} style={{ verticalAlign: "-2px" }}/> {fmtDate(m.date)}</span>
                              <span><Clock size={13} style={{ verticalAlign: "-2px" }}/> {m.time_slot}</span>
                              <span><MapPin size={13} style={{ verticalAlign: "-2px" }}/> {m.ground}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => loadDetail(m)}
                            style={{ background: "#F8FAF8", border: "1px solid #E2E8F0", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#64748B" }}
                          >
                            Details
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                          <button
                            onClick={async () => {
                              await setPlayerStatus(m.id, player.id, "confirmed")
                              window.location.reload()
                            }}
                            style={{
                              padding: "11px",
                              borderRadius: 11,
                              background: "#166534",
                              border: "none",
                              color: "#FFFFFF",
                              fontSize: 13,
                              cursor: "pointer",
                              fontWeight: 800,
                              fontFamily: "var(--font-head)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              boxShadow: "0 4px 10px rgba(22,101,52,0.25)"
                            }}
                          >
                            <CheckCircle2 size={16}/> Available
                          </button>
                          <button
                            onClick={async () => {
                              await setPlayerStatus(m.id, player.id, "declined")
                              window.location.reload()
                            }}
                            style={{
                              padding: "11px",
                              borderRadius: 11,
                              background: "rgba(239,68,68,0.08)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              color: "#EF4444",
                              fontSize: 13,
                              cursor: "pointer",
                              fontWeight: 800,
                              fontFamily: "var(--font-head)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6
                            }}
                          >
                            <XCircle size={16}/> Can't Make It
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TODAY'S MATCH HIGHLIGHT ── */}
              {todaysMatch && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 8, fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={16} color="#166534"/> Today's Scheduled Match
                  </div>
                  <Card
                    style={{
                      padding: "16px",
                      cursor: "pointer",
                      border: "1.5px solid #166534",
                      background: "linear-gradient(135deg, rgba(22,101,52,0.06), #FFFFFF)",
                      boxShadow: "0 6px 18px rgba(22,101,52,0.08)"
                    }}
                    onClick={() => loadDetail(todaysMatch.match)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ background: "#166534", color: "#FFFFFF", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>
                            TODAY
                          </span>
                          <span style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                            {matchTitle(todaysMatch.match)}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                          <span><Clock size={12}/> {todaysMatch.match.time_slot}</span>
                          <span>·</span>
                          <span><MapPin size={12}/> {todaysMatch.match.ground}</span>
                        </div>
                      </div>

                      <ChevronRight size={18} color="#166534"/>
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(todaysMatch.match.ground)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#166534", textDecoration: "none" }}
                      >
                        <MapPin size={13}/> Venue on Google Maps ↗
                      </a>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                        View Roster &amp; Chat →
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {/* ── SEASON STATUS COUNTERS ── */}
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 10, fontFamily: "var(--font-head)" }}>
                  Your Match Activity
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { label: "Confirmed", v: confirmedMatches.length, c: "#166534", bg: "rgba(22,101,52,0.08)", icon: CheckCircle2 },
                    { label: "Waitlist",  v: waitlistMatches.length,  c: "#B8860B", bg: "rgba(246,196,83,0.12)", icon: Hourglass },
                    { label: "Pending",   v: pendingMatches.length,   c: "#2563EB", bg: "rgba(37,99,235,0.08)",  icon: BellIcon },
                    { label: "Declined",  v: declinedMatches.length,  c: "#EF4444", bg: "rgba(239,68,68,0.08)",  icon: XCircle },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        textAlign: "center",
                        padding: "12px 6px",
                        background: "#FFFFFF",
                        border: "1.5px solid #E2E8F0",
                        borderRadius: 14,
                        boxShadow: "0 2px 6px rgba(15,23,42,0.03)"
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 900, color: s.c, fontFamily: "var(--font-head)" }}>{s.v}</div>
                      <div style={{ fontSize: 10, color: "#0F172A", marginTop: 2, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── QUICK SHORTCUTS ── */}
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 10, fontFamily: "var(--font-head)" }}>
                  Quick Hub
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { label: "Matches", icon: Users, tab: "matches", color: "#166534" },
                    { label: "Tournaments", icon: Trophy, tab: "tournaments", color: "#B8860B" },
                    { label: "Rankings", icon: Award, tab: "leaderboard", color: "#0F766E" },
                    { label: "Player Pass", icon: UserIcon, tab: "profile", color: "#2563EB" },
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTab(btn.tab)}
                      style={{
                        padding: "14px 6px",
                        borderRadius: 14,
                        background: "#FFFFFF",
                        border: "1.5px solid #E2E8F0",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
                        transition: "all 150ms"
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${btn.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <btn.icon size={18} color={btn.color} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>{btn.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── DIGITAL PLAYER PASS MINI PREVIEW ── */}
              <Card style={{ padding: "18px", border: "1.5px solid #E2E8F0", background: "linear-gradient(180deg, #FFFFFF, #F8FAF8)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Award size={18} color="#166534"/>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", fontFamily: "var(--font-head)" }}>Digital Sports ID</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", background: "rgba(22,101,52,0.08)", padding: "2px 8px", borderRadius: 999 }}>
                    Active Member
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ position: "relative" }}>
                    {player.profile_image_url ? (
                      <img src={player.profile_image_url} alt={player.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid #166534" }}/>
                    ) : (
                      <Av name={player.name} id={player.id} sz={56} />
                    )}
                    {player.jersey_number && (
                      <div style={{ position: "absolute", bottom: -4, right: -4, background: "#166534", color: "#FFFFFF", fontSize: 10, fontWeight: 900, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFFFFF" }}>
                        {player.jersey_number}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>{player.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{player.playing_role || "Cricket Player"} · {player.city || "Pune"}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Player ID: #SS-{String(player.id).slice(-4).toUpperCase()}</div>
                  </div>

                  <button
                    onClick={copyDigitalPass}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 9,
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      color: "#166534",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    {copiedPass ? <Check size={14}/> : <Share2 size={14}/>}
                    {copiedPass ? "Copied" : "Share"}
                  </button>
                </div>
              </Card>

              {/* ── TOURNAMENT & LEAGUE CENTER ── */}
              {auctionHistory.length > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Trophy size={16} color="#B8860B"/> Tournament &amp; Auction Hub
                    </div>
                    <button onClick={() => setTab("tournaments")} style={{ background: "none", border: "none", color: "#166534", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      View Full Details ({auctionHistory.length}) →
                    </button>
                  </div>

                  {(() => {
                    const latest = auctionHistory[0]
                    const auc = latest.auctions || {}
                    const team = latest.auction_teams || {}
                    const isWaitlist = latest.status === "waitlist" || latest.payment_status === "waitlist"
                    const isCaptain = (latest.is_captain || latest.status === "captain") && !isWaitlist

                    return (
                      <Card style={{
                        padding: "16px",
                        border: isWaitlist ? "1.5px solid #FCD34D" : isCaptain ? "1.5px solid rgba(245,158,11,0.4)" : "1.5px solid #E2E8F0",
                        background: isWaitlist ? "linear-gradient(135deg, rgba(254,243,199,0.35), #FFFFFF)" : isCaptain ? "linear-gradient(135deg, rgba(245,158,11,0.06), #FFFFFF)" : "#FFFFFF",
                        boxShadow: "0 2px 8px rgba(15,23,42,0.04)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              {isWaitlist ? (
                                <span style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <Clock size={11}/> WAITING LIST
                                </span>
                              ) : isCaptain ? (
                                <span style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0F172A", fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 4 }}>
                                  👑 CAPTAIN
                                </span>
                              ) : null}
                              <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                                {auc.name || "Battle of Champions - Season 3"}
                              </div>
                            </div>
                            <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span><Calendar size={12}/> {auc.auction_date ? fmtDate(auc.auction_date) : "12 Sep 2026"}</span>
                              <span>·</span>
                              <span><Clock size={12}/> {auc.auction_time || "8:00 PM"}</span>
                              {isWaitlist ? (
                                <>
                                  <span>·</span>
                                  <span style={{ color: "#B45309", fontWeight: 700 }}>⏳ Spot Pending</span>
                                </>
                              ) : team.name ? (
                                <>
                                  <span>·</span>
                                  <span style={{ color: "#166534", fontWeight: 800 }}>Team {team.name}</span>
                                </>
                              ) : null}
                            </div>
                          </div>

                          <button
                            onClick={() => setTab("tournaments")}
                            style={{
                              padding: "7px 14px",
                              borderRadius: 9,
                              background: isWaitlist ? "#D97706" : "#166534",
                              color: "#FFFFFF",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            {isWaitlist ? "View Waitlist Details →" : "Open Tournament Hub →"}
                          </button>
                        </div>
                      </Card>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })()}

        {/* TAB 2: MY MATCHES */}
        {tab === "matches" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                My Matches
              </h2>
              <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
                View games you're invited to, confirm your availability, and track upcoming match venues.
              </p>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {[
                { key: "upcoming", label: `Upcoming (${upcomingMatches.length})` },
                { key: "completed", label: `Completed (${completedMatches.length})` },
                { key: "all", label: `All Matches (${myMatches.length})` }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setMatchFilter(f.key)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: matchFilter === f.key ? "1.5px solid #166534" : "1.5px solid #E2E8F0",
                    background: matchFilter === f.key ? "#166534" : "#FFFFFF",
                    color: matchFilter === f.key ? "#FFFFFF" : "#64748B",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: matchFilter === f.key ? 800 : 600,
                    fontFamily: "var(--font-body)",
                    whiteSpace: "nowrap"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Match list */}
            {(() => {
              const displayList = myMatches.filter(r => {
                if (matchFilter === "upcoming") return r.match.status !== "completed"
                if (matchFilter === "completed") return r.match.status === "completed"
                return true
              })

              if (displayList.length === 0) {
                return (
                  <Card style={{ padding: "40px 20px", textAlign: "center" }}>
                    <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                      <Calendar size={40} color="#CBD5E1" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", marginBottom: 6, fontFamily: "var(--font-head)" }}>
                      No {matchFilter} matches found
                    </div>
                    <div style={{ color: "#64748B", fontSize: 13, maxWidth: 300, margin: "0 auto" }}>
                      When an organizer invites you to a match or a public match is posted, it will appear here.
                    </div>
                  </Card>
                )
              }

              return (
                <div style={{ display: "grid", gap: 12 }}>
                  {displayList.map(({ match: m, myStatus, matchPlayers }) => {
                    const confirmedCount = (matchPlayers || []).filter(mp => mp.status === "confirmed").length
                    const cap = m.max_players || 0
                    const spotsLeft = Math.max(0, cap - confirmedCount)
                    const pct = cap > 0 ? Math.min(100, Math.round((confirmedCount / cap) * 100)) : 0

                    return (
                      <Card
                        key={m.id}
                        style={{
                          padding: "16px",
                          cursor: "pointer",
                          border: myStatus === "pending" ? "1.5px solid rgba(239,68,68,0.4)" : "1.5px solid #E2E8F0",
                          boxShadow: "0 2px 8px rgba(15,23,42,0.04)"
                        }}
                        onClick={() => loadDetail(m)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                              <span style={{ fontWeight: 800, color: "#0F172A", fontSize: 15, fontFamily: "var(--font-head)" }}>
                                {matchTitle(m)}
                              </span>
                              {m.visibility === "public" && (
                                <span style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 999, textTransform: "uppercase" }}>
                                  Public
                                </span>
                              )}
                            </div>

                            <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.7, display: "flex", flexDirection: "column" }}>
                              <span><Calendar size={12} style={{ verticalAlign: "-2px" }}/> {fmtDate(m.date)}</span>
                              <span><Clock size={12} style={{ verticalAlign: "-2px" }}/> {m.time_slot}</span>
                              <span><MapPin size={12} style={{ verticalAlign: "-2px" }}/> {m.ground}</span>
                            </div>
                          </div>

                          {/* Match Status Badge */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                            <span style={{
                              background: m.status === "upcoming" ? "rgba(22,101,52,0.1)" : m.status === "completed" ? "#E2E8F0" : "rgba(239,68,68,0.1)",
                              color: m.status === "upcoming" ? "#166534" : m.status === "completed" ? "#475569" : "#EF4444",
                              borderRadius: 6,
                              padding: "3px 9px",
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: "capitalize"
                            }}>
                              {m.status}
                            </span>

                            <span style={{
                              background: myStatus === "confirmed" ? "#166534" : myStatus === "waitlist" ? "#B8860B" : myStatus === "declined" ? "#EF4444" : "rgba(239,68,68,0.12)",
                              color: myStatus === "pending" ? "#EF4444" : "#FFFFFF",
                              borderRadius: 6,
                              padding: "3px 9px",
                              fontSize: 11,
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4
                            }}>
                              {myStatus === "confirmed" ? <><CheckCircle2 size={12}/> Confirmed</> :
                               myStatus === "waitlist" ? <><Hourglass size={12}/> Waitlist</> :
                               myStatus === "declined" ? <><XCircle size={12}/> Declined</> :
                               <><Zap size={12}/> Needs RSVP</>}
                            </span>
                          </div>
                        </div>

                        {/* Capacity progress */}
                        {cap > 0 && (
                          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, fontSize: 11 }}>
                              <span style={{ fontWeight: 700, color: "#166534" }}>
                                <Users size={12} style={{ verticalAlign: "-2px" }}/> {confirmedCount}/{cap} Players Confirmed
                              </span>
                              <span style={{ fontWeight: 700, color: spotsLeft > 0 ? "#166534" : "#EF4444" }}>
                                {spotsLeft > 0 ? `${spotsLeft} spots open` : "Squad Full"}
                              </span>
                            </div>
                            <div style={{ height: 6, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "#166534", borderRadius: 4 }}/>
                            </div>
                          </div>
                        )}

                        {/* Fast RSVP for pending match */}
                        {m.status === "upcoming" && myStatus === "pending" && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={async e => {
                                e.stopPropagation()
                                await setPlayerStatus(m.id, player.id, "confirmed")
                                window.location.reload()
                              }}
                              style={{
                                padding: "11px",
                                borderRadius: 10,
                                background: "#166534",
                                border: "none",
                                color: "#FFFFFF",
                                fontSize: 13,
                                cursor: "pointer",
                                fontWeight: 800,
                                fontFamily: "var(--font-head)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6
                              }}
                            >
                              <CheckCircle2 size={15}/> Available
                            </button>
                            <button
                              onClick={async e => {
                                e.stopPropagation()
                                await setPlayerStatus(m.id, player.id, "declined")
                                window.location.reload()
                              }}
                              style={{
                                padding: "11px",
                                borderRadius: 10,
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                color: "#EF4444",
                                fontSize: 13,
                                cursor: "pointer",
                                fontWeight: 800,
                                fontFamily: "var(--font-head)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6
                              }}
                            >
                              <XCircle size={15}/> Can't Make It
                            </button>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        )}

        {/* TAB 3: TOURNAMENTS & AUCTIONS */}
        {tab === "tournaments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Trophy size={24} color="#B8860B"/>
                <h2 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                  My Tournaments &amp; Auctions
                </h2>
              </div>
              <p style={{ color: "#64748B", fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                Official tournament registrations, team captaincy consoles, auction pool bidding stage, and team squads.
              </p>
            </div>

            {/* Quick Summary / Status Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(20,83,45,0.08), rgba(245,158,11,0.08))",
              borderRadius: 18,
              padding: isMobile ? "16px 14px" : "18px 20px",
              border: "1.5px solid rgba(22,101,52,0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative" }}>
                  {player.profile_image_url ? (
                    <img src={player.profile_image_url} alt={player.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "2.5px solid #166534" }}/>
                  ) : (
                    <Av name={player.name} id={player.id} sz={50} />
                  )}
                  {auctionHistory.some(a => (a.is_captain || a.status === "captain") && a.status !== "waitlist" && a.payment_status !== "waitlist") && (
                    <div style={{ position: "absolute", bottom: -3, right: -3, background: "#F59E0B", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #FFFFFF" }}>
                      👑
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>{player.name}</div>
                    {auctionHistory.some(a => (a.is_captain || a.status === "captain") && a.status !== "waitlist" && a.payment_status !== "waitlist") && (
                      <span style={{ fontSize: 10, fontWeight: 900, background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#0F172A", padding: "1px 7px", borderRadius: 4 }}>
                        OFFICIAL CAPTAIN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                    Registered Tournaments: <strong style={{ color: "#166534" }}>{auctionHistory.length}</strong> · Player ID: #SS-{String(player.id).slice(-4).toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSupportModal(true)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  background: "#166534",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "var(--font-head)"
                }}
              >
                + Register Next Tournament
              </button>
            </div>

            {/* Auction registrations list */}
            {loadingAuctions ? (
              <Card style={{ padding: "36px", textAlign: "center" }}>
                <Spinner />
                <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, marginTop: 10 }}>Loading tournament registrations...</div>
              </Card>
            ) : auctionHistory.length === 0 ? (
              <Card style={{ padding: "44px 20px", textAlign: "center" }}>
                <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}>
                  <Trophy size={48} color="#CBD5E1" />
                </div>
                <div style={{ fontWeight: 900, fontSize: 17, color: "#0F172A", marginBottom: 6, fontFamily: "var(--font-head)" }}>
                  No Tournament Registrations Found
                </div>
                <div style={{ color: "#64748B", fontSize: 13, maxWidth: 380, margin: "0 auto 18px", lineHeight: 1.5 }}>
                  You haven't registered for any auction tournaments yet. When an organizer opens registrations, sign up with your phone ({player.phone}) to enter the player pool.
                </div>
                <button
                  onClick={() => setShowSupportModal(true)}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 11,
                    background: "#166534",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  Contact Organizer for Upcoming Tournaments
                </button>
              </Card>
            ) : (
              <div style={{ display: "grid", gap: 18 }}>
                {auctionHistory.map((ap) => {
                  const auc = ap.auctions || {}
                  const team = ap.auction_teams || {}
                  const isWaitlist = ap.status === "waitlist" || ap.payment_status === "waitlist"
                  const isCaptain = (ap.is_captain || ap.status === "captain") && !isWaitlist
                  const isSold = ap.status === "sold"
                  const isUnsold = ap.status === "unsold" || ap.status === "final_unsold"
                  const teamName = !isWaitlist ? (team.name || (isSold ? "Drafted Team" : null)) : null
                  const isPaid = ap.payment_status === "paid"

                  const shareCaptaincy = () => {
                    const tName = team.name ? (/^team\s+/i.test(team.name) ? team.name : `Team ${team.name}`) : "My Franchise Team"
                    const tourName = auc.name || "Tournament Auction"
                    const dateStr = auc.auction_date ? fmtDate(auc.auction_date) : "Upcoming"
                    const locStr = auc.location || "Venue TBD"
                    const text = `🏏 *Official Tournament Captain Announcement!*\n\nI am leading *${tName}* as Captain & Owner in *${tourName}*!\n\n📅 *Auction Date:* ${dateStr}\n⏰ *Time:* ${auc.auction_time || "8:00 PM IST"}\n📍 *Venue:* ${locStr}\n🪙 *Starting Purse:* ₹${Number(team.purse_total || auc.points_purse || 100000).toLocaleString("en-IN")}\n\n📡 Watch the live auction stage here:\n${window.location.origin}/live-auction/${auc.auction_code || ""}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
                  }

                  if (isCaptain) {
                    return (
                      <div
                        key={ap.id}
                        style={{
                          background: "linear-gradient(145deg, #0B3B24 0%, #0F172A 100%)",
                          borderRadius: 22,
                          color: "#FFFFFF",
                          border: "2px solid #F59E0B",
                          boxShadow: "0 12px 35px rgba(11,59,36,0.35)",
                          overflow: "hidden",
                          position: "relative"
                        }}
                      >
                        {/* Shimmer background circle */}
                        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.18), transparent 70%)", pointerEvents: "none" }}/>

                        {/* Top Captain Ribbon */}
                        <div style={{
                          background: "linear-gradient(90deg, #F59E0B, #D97706)",
                          padding: "8px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 11,
                          fontWeight: 900,
                          color: "#0F172A",
                          letterSpacing: 0.8,
                          textTransform: "uppercase"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span>👑</span>
                            <span>OFFICIAL CAPTAIN &amp; TEAM OWNER</span>
                          </div>
                          <span style={{ background: "rgba(15,23,42,0.15)", padding: "2px 8px", borderRadius: 4, fontSize: 10 }}>
                            {auc.name ? auc.name.toUpperCase() : "BATTLE OF CHAMPIONS S3"}
                          </span>
                        </div>

                        {/* Card Content */}
                        <div style={{ padding: isMobile ? "18px 16px" : "24px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                          {/* Tournament & Organizer Header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                                <span style={{ background: "rgba(255,255,255,0.14)", color: "#FFFFFF", fontSize: 11, fontWeight: 800, padding: "2px 9px", borderRadius: 6 }}>
                                  🏢 {auc.organized_by || "Morning Cricket Club - MCC"}
                                </span>
                                <span style={{ background: "rgba(34,197,94,0.22)", color: "#4ADE80", fontSize: 11, fontWeight: 800, padding: "2px 9px", borderRadius: 6, border: "1px solid rgba(74,222,128,0.3)" }}>
                                  ₹180 REGISTRATION {isPaid ? "PAID ✅" : "VERIFIED"}
                                </span>
                              </div>
                              <h3 style={{ margin: "2px 0 6px", fontSize: isMobile ? 20 : 24, fontWeight: 900, fontFamily: "var(--font-head)", color: "#FFFFFF" }}>
                                {auc.name || "Battle of Champions - Season 3"}
                              </h3>
                              <div style={{ fontSize: 12.5, color: "#CBD5E1", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span><Calendar size={13} style={{ verticalAlign: "-2px" }}/> {auc.auction_date ? fmtDate(auc.auction_date) : "12 Sep 2026"}</span>
                                <span>·</span>
                                <span><Clock size={13} style={{ verticalAlign: "-2px" }}/> {auc.auction_time || "8:00 PM IST"}</span>
                              </div>
                            </div>

                            <span style={{
                              background: "linear-gradient(135deg, #F59E0B, #D97706)",
                              color: "#0F172A",
                              fontSize: 12,
                              fontWeight: 900,
                              padding: "6px 14px",
                              borderRadius: 999,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              boxShadow: "0 4px 12px rgba(245,158,11,0.35)"
                            }}>
                              👑 CONFIRMED CAPTAIN
                            </span>
                          </div>

                          {/* Team Strikers Spotlight Banner */}
                          <div style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1.5px solid rgba(245,158,11,0.35)",
                            borderRadius: 16,
                            padding: "16px 18px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 14
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <div style={{
                                width: 52,
                                height: 52,
                                borderRadius: 12,
                                background: "#F59E0B",
                                color: "#0F172A",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 24,
                                fontWeight: 900,
                                boxShadow: "0 4px 12px rgba(245,158,11,0.3)"
                              }}>
                                {team.logo_url ? (
                                  <img src={team.logo_url} alt={team.name} style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }}/>
                                ) : "👑"}
                              </div>
                              <div>
                                <div style={{ fontSize: 11, color: "#FEF08A", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                  YOUR FRANCHISE TEAM
                                </div>
                                <div style={{ fontSize: 19, fontWeight: 900, color: "#FFFFFF", fontFamily: "var(--font-head)" }}>
                                  {team.name ? (/^team\s+/i.test(team.name) ? team.name : `Team ${team.name}`) : "Your Franchise Team"}
                                </div>
                                <div style={{ fontSize: 12, color: "#CBD5E1", marginTop: 2 }}>
                                  Owner &amp; Captain: <strong>{team.owner_name || team.captain_name || player.name}</strong>
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: isMobile ? "left" : "right" }}>
                              <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Starting Auction Purse</div>
                              <div style={{ fontSize: 20, fontWeight: 900, color: "#FEF08A", fontFamily: "var(--font-head)" }}>
                                🪙 {Number(team.purse_total || auc.points_purse || 100000).toLocaleString("en-IN")} Coins
                              </div>
                              <div style={{ fontSize: 11, color: "#4ADE80", fontWeight: 700, marginTop: 1 }}>Purse Active for Bidding</div>
                            </div>
                          </div>

                          {/* Logistics Grid (4 metrics) */}
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
                            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                              <div style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Playing Role</div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", marginTop: 3 }}>
                                🏏 {ap.playing_role || player.playing_role || "All-rounder"}
                              </div>
                              <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 1 }}>{ap.batting_style || "Right Hand"}</div>
                            </div>

                            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                              <div style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Kit &amp; Jersey</div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", marginTop: 3 }}>
                                #{ap.jersey_number || player.jersey_number || "11"} (Size: {ap.jersey_size || player.jersey_size || "L"})
                              </div>
                              <div style={{ fontSize: 11, color: "#4ADE80", marginTop: 1 }}>Kit Reserved</div>
                            </div>

                            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                              <div style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Base Valuation</div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF", marginTop: 3 }}>
                                ₹{Number(ap.base_price || 1000).toLocaleString("en-IN")}
                              </div>
                              <div style={{ fontSize: 11, color: "#FEF08A", marginTop: 1 }}>Retained Captain</div>
                            </div>

                            <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
                              <div style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Auction Status</div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#4ADE80", marginTop: 3 }}>
                                Pre-Drafted
                              </div>
                              <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 1 }}>{team.name ? (/^team\s+/i.test(team.name) ? team.name : `Team ${team.name}`) : "Franchise Team"}</div>
                            </div>
                          </div>

                          {/* Venue Banner with Direct Google Maps Link */}
                          {auc.location && (
                            <div style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 12,
                              padding: "12px 16px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 8
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <MapPin size={16} color="#4ADE80" />
                                <span style={{ fontSize: 12.5, color: "#FFFFFF", fontWeight: 600 }}>
                                  <strong>Venue:</strong> {auc.location}
                                </span>
                              </div>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(auc.location)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: "#4ADE80",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4
                                }}
                              >
                                Google Maps Navigation ↗
                              </a>
                            </div>
                          )}

                          {/* Captain Privileges Note */}
                          <div style={{
                            padding: "12px 14px",
                            background: "rgba(245,158,11,0.08)",
                            border: "1px solid rgba(245,158,11,0.25)",
                            borderRadius: 12,
                            fontSize: 12,
                            color: "#FEF08A",
                            lineHeight: 1.5
                          }}>
                            <strong>👑 Captaincy Privileges:</strong> As Captain &amp; Owner of <strong>{team.name ? (/^team\s+/i.test(team.name) ? team.name : `Team ${team.name}`) : "your franchise team"}</strong>, you have access to your private Team Console during the live auction to place bids in real time, monitor remaining purse coins, and construct your 15-player tournament squad.
                          </div>

                          {/* Four Action Buttons */}
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
                            {team.id && auc.auction_code && (
                              <a
                                href={`/team-view/${auc.auction_code}/${team.id}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: "12px 14px",
                                  borderRadius: 12,
                                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                                  color: "#0F172A",
                                  fontWeight: 900,
                                  fontSize: 13,
                                  textDecoration: "none",
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  boxShadow: "0 4px 12px rgba(245,158,11,0.3)"
                                }}
                              >
                                👑 Team Console
                              </a>
                            )}

                            {auc.auction_code && (
                              <a
                                href={`/live-auction/${auc.auction_code}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: "12px 14px",
                                  borderRadius: 12,
                                  background: "#166534",
                                  color: "#FFFFFF",
                                  fontWeight: 800,
                                  fontSize: 13,
                                  textDecoration: "none",
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6,
                                  border: "1px solid rgba(255,255,255,0.2)"
                                }}
                              >
                                📡 Live Auction
                              </a>
                            )}

                            {auc.id && (
                              <button
                                type="button"
                                onClick={async () => {
                                  setCaptainPoolModal(auc)
                                  setCaptainPoolSearch("")
                                  setCaptainPoolRoleFilter("")
                                  setLoadingCaptainPool(true)
                                  try {
                                    const all = await fetchAuctionPlayers(auc.id)
                                    setCaptainPoolPlayers(all || [])
                                  } catch (e) {
                                    console.error(e)
                                  }
                                  setLoadingCaptainPool(false)
                                }}
                                style={{
                                  padding: "12px 14px",
                                  borderRadius: 12,
                                  background: "rgba(255,255,255,0.12)",
                                  color: "#FFFFFF",
                                  fontWeight: 800,
                                  fontSize: 13,
                                  border: "1px solid rgba(255,255,255,0.25)",
                                  cursor: "pointer",
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 6
                                }}
                              >
                                📋 Analyze Pool
                              </button>
                            )}

                            <button
                              onClick={shareCaptaincy}
                              style={{
                                padding: "12px 14px",
                                borderRadius: 12,
                                background: "#25D366",
                                color: "#FFFFFF",
                                fontWeight: 800,
                                fontSize: 13,
                                border: "none",
                                cursor: "pointer",
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6
                              }}
                            >
                              💬 Share Captaincy
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // Non-captain card
                  return (
                    <Card
                      key={ap.id}
                      style={{
                        padding: "20px",
                        border: isWaitlist ? "1.5px solid #FCD34D" : "1.5px solid #E2E8F0",
                        background: isWaitlist ? "linear-gradient(180deg, #FFFDF5 0%, #FFFFFF 100%)" : "#FFFFFF"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 17, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                            {auc.name || "Selected Sports Auction Tournament"}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span><Calendar size={13} style={{ verticalAlign: "-2px" }}/> {auc.auction_date ? fmtDate(auc.auction_date) : "Date TBD"}</span>
                            {auc.auction_time && (
                              <>
                                <span>·</span>
                                <span><Clock size={13} style={{ verticalAlign: "-2px" }}/> {auc.auction_time}</span>
                              </>
                            )}
                            {auc.organized_by && (
                              <>
                                <span>·</span>
                                <span>Org: <strong>{auc.organized_by}</strong></span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status Tag */}
                        <div>
                          {isSold ? (
                            <span style={{ background: "#166534", color: "#FFFFFF", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <CheckCircle2 size={13}/> SOLD
                            </span>
                          ) : isUnsold ? (
                            <span style={{ background: "#64748B", color: "#FFFFFF", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999 }}>
                              UNSOLD
                            </span>
                          ) : isWaitlist ? (
                            <span style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <Clock size={13}/> WAITING LIST
                            </span>
                          ) : (
                            <span style={{ background: "rgba(37,99,235,0.12)", color: "#2563EB", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 999 }}>
                              IN POOL
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details Box */}
                      <div style={{
                        background: isWaitlist ? "rgba(245,158,11,0.06)" : "#F8FAF8",
                        borderRadius: 12,
                        padding: "14px",
                        marginTop: 14,
                        border: isWaitlist ? "1px solid rgba(245,158,11,0.22)" : "1px solid #E2E8F0",
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                        textAlign: "center"
                      }}>
                        <div>
                          <div style={{ fontSize: 10.5, color: isWaitlist ? "#92400E" : "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>Playing Role</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{ap.playing_role || player.playing_role || "Player"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10.5, color: isWaitlist ? "#92400E" : "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
                            {isWaitlist ? "Waitlist Status" : "Base Price"}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: isWaitlist ? "#B45309" : "#0F172A", marginTop: 2 }}>
                            {isWaitlist ? "⏳ In Queue" : `₹${ap.base_price || 0}`}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10.5, color: isWaitlist ? "#92400E" : "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
                            {isWaitlist ? "Registration Fee" : "Sold Price"}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: isWaitlist ? "#166534" : isSold ? "#166534" : "#64748B", marginTop: 2 }}>
                            {isWaitlist ? "Free (Spot Pending)" : isSold ? `₹${ap.sold_price || ap.bid_price || "—"}` : "—"}
                          </div>
                        </div>
                      </div>

                      {/* Waiting List Notice Banner */}
                      {isWaitlist && (
                        <div style={{
                          marginTop: 14,
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                          border: "1px solid #FCD34D",
                          color: "#78350F"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 13, color: "#92400E", marginBottom: 6 }}>
                            <Clock size={16} color="#B45309"/>
                            <span>Official Waiting List Entry</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "#92400E" }}>
                            All 45 player spots for <strong>{auc.name || "this tournament"}</strong> are currently full. You have been placed on the official waiting list. <strong>No registration fee has been charged.</strong> If a spot opens up due to a cancellation or withdrawal, tournament management will contact you directly to complete payment and confirm your auction entry.
                          </p>
                        </div>
                      )}

                      {/* Team Assignment Banner */}
                      {!isWaitlist && teamName && (
                        <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(22,101,52,0.06)", borderRadius: 10, border: "1px solid rgba(22,101,52,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Award size={16} color="#166534"/>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#166534" }}>Assigned Team: {teamName}</span>
                          </div>
                          {auc.auction_code && (
                            <a
                              href={`/live-auction/${auc.auction_code}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: 12, fontWeight: 800, color: "#166534", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                            >
                              Live Screen ↗
                            </a>
                          )}
                        </div>
                      )}

                      {/* Action Links */}
                      {auc.auction_code && (
                        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                          <a
                            href={`/live-auction/${auc.auction_code}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: 10,
                              background: "#166534",
                              color: "#FFFFFF",
                              fontWeight: 800,
                              fontSize: 12.5,
                              textAlign: "center",
                              textDecoration: "none"
                            }}
                          >
                            📡 Live Auction
                          </a>
                          <a
                            href={`/auction-register/${auc.auction_code}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: 10,
                              background: "#F8FAF8",
                              color: "#0F172A",
                              border: "1px solid #CBD5E1",
                              fontWeight: 800,
                              fontSize: 12.5,
                              textAlign: "center",
                              textDecoration: "none"
                            }}
                          >
                            📋 View Squads
                          </a>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LEADERBOARD */}
        {tab === "leaderboard" && (
          <LeaderboardPage isMobile={isMobile} myId={player.id}/>
        )}

        {/* TAB 5: PROFILE & DIGITAL PLAYER PASS */}
        {tab === "profile" && (() => {
          const played = confirmedMatches.length
          const declinedC = declinedMatches.length
          const fmtD = (d) => {
            try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) } catch { return d }
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                  Digital Player Pass &amp; Profile
                </h2>
                <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
                  Your official sports credentials, kit sizes, career metrics, and payment records.
                </p>
              </div>

              {/* ── OFFICIAL DIGITAL SPORTS PASS CARD ── */}
              <div style={{
                background: "linear-gradient(145deg, #0F172A 0%, #1E293B 100%)",
                borderRadius: 22,
                padding: "22px 20px",
                color: "#FFFFFF",
                boxShadow: "0 14px 35px rgba(15,23,42,0.25)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                position: "relative",
                overflow: "hidden"
              }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%)", pointerEvents: "none" }}/>

                {/* Pass Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 14, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Logo size={28} />
                    <span style={{ fontFamily: "var(--font-head)", fontWeight: 900, fontSize: 15, letterSpacing: 0.5 }}>SELECTED SPORTS PASS</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#22C55E", background: "rgba(34,197,94,0.15)", padding: "2px 8px", borderRadius: 4, letterSpacing: 0.5 }}>
                    VERIFIED
                  </span>
                </div>

                {/* Pass Body */}
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    {player.profile_image_url ? (
                      <img src={player.profile_image_url} alt={player.name} style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", border: "2.5px solid #22C55E", boxShadow: "0 6px 16px rgba(0,0,0,0.3)" }}/>
                    ) : (
                      <div style={{ width: 80, height: 80, borderRadius: 16, background: "#166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, border: "2.5px solid #22C55E" }}>
                        {player.name ? player.name[0].toUpperCase() : "P"}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "var(--font-head)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {player.name}
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.18)", color: "#22C55E", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, marginTop: 4 }}>
                      🏏 {player.playing_role || "Cricket Player"}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 5, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>📍 {player.city || "Pune"}</span>
                      <span>·</span>
                      <span>DOB: {player.birth_date ? fmtDate(player.birth_date) : "—"}</span>
                    </div>
                  </div>

                  {/* Jersey Badge */}
                  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "8px 12px", minWidth: 54 }}>
                    <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>JERSEY</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-head)", lineHeight: 1.1 }}>
                      {player.jersey_number || "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "#CBD5E1", fontWeight: 700 }}>{player.jersey_size || "M"}</div>
                  </div>
                </div>

                {/* Official Captaincy Badge on Pass */}
                {(() => {
                  const capRow = auctionHistory.find(a => (a.is_captain || a.status === "captain") && a.status !== "waitlist" && a.payment_status !== "waitlist")
                  if (!capRow) return null
                  const cTeam = capRow.auction_teams?.name || ""
                  const cTeamDisplay = cTeam ? (/^team\s+/i.test(cTeam) ? cTeam : `Team ${cTeam}`) : "Franchise Team"
                  const cTourn = capRow.auctions?.name || "Tournament Auction"
                  return (
                    <div style={{
                      marginTop: 14,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(217,119,6,0.1))",
                      border: "1.5px solid rgba(245,158,11,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>👑</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 900, color: "#FEF08A", letterSpacing: 0.5, fontFamily: "var(--font-head)" }}>
                            OFFICIAL CAPTAIN &amp; OWNER · {cTeamDisplay.toUpperCase()}
                          </div>
                          <div style={{ fontSize: 10.5, color: "#CBD5E1" }}>
                            {cTourn}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, background: "#F59E0B", color: "#0F172A", padding: "2px 8px", borderRadius: 999 }}>
                        ACTIVE
                      </span>
                    </div>
                  )
                })()}

                {/* Pass Footer */}
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, opacity: 0.85 }}>
                  <span>ID: #SS-{String(player.id).slice(-6).toUpperCase()}</span>
                  <button
                    onClick={copyDigitalPass}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      color: "#FFFFFF",
                      padding: "5px 12px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    {copiedPass ? <Check size={13}/> : <Share2 size={13}/>}
                    {copiedPass ? "Pass Copied!" : "Share Sports Pass"}
                  </button>
                </div>
              </div>

              {/* ── CAREER STATS ── */}
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 10, fontFamily: "var(--font-head)" }}>
                  Career &amp; Attendance Highlights
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: "16px", background: "rgba(22,101,52,0.08)", borderRadius: 14, border: "1.5px solid rgba(22,101,52,0.25)", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)" }}>{played}</div>
                    <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, marginTop: 2 }}>MATCHES PLAYED</div>
                  </div>
                  <div style={{ padding: "16px", background: "rgba(37,99,235,0.08)", borderRadius: 14, border: "1.5px solid rgba(37,99,235,0.25)", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#2563EB", fontFamily: "var(--font-head)" }}>{attendanceRate}%</div>
                    <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 700, marginTop: 2 }}>ATTENDANCE RATE</div>
                  </div>
                  <div style={{ padding: "16px", background: "rgba(246,196,83,0.12)", borderRadius: 14, border: "1.5px solid rgba(246,196,83,0.3)", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#B8860B", fontFamily: "var(--font-head)" }}>₹{contribTotal}</div>
                    <div style={{ fontSize: 11, color: "#B8860B", fontWeight: 700, marginTop: 2 }}>MATCH FEES PAID</div>
                  </div>
                  <div style={{ padding: "16px", background: "#FFFFFF", borderRadius: 14, border: "1.5px solid #E2E8F0", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>{myGrounds.length}</div>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginTop: 2 }}>VENUES PLAYED</div>
                  </div>
                </div>
              </div>

              {/* ── PROFILE DETAILS / EDIT FORM ── */}
              <Card style={{ padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 8 }}>
                    <UserIcon size={16} color="#166534"/> Profile Details
                  </div>
                  {!editing && (
                    <button
                      onClick={() => {
                        setPForm({
                          firstName,
                          lastName,
                          phone: player.phone || "",
                          pin: player.pin || "",
                          playingRole: player.playing_role || "All-rounder",
                          city: player.city || "",
                          birthDate: player.birth_date || "",
                          jerseyNumber: player.jersey_number || "",
                          jerseySize: player.jersey_size || "",
                          photoFile: null,
                          photoPreview: player.profile_image_url || ""
                        })
                        setEditing(true)
                      }}
                      style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(22,101,52,0.1)", border: "1px solid rgba(22,101,52,0.25)", color: "#166534", fontSize: 12, cursor: "pointer", fontWeight: 800 }}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editing ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                      <PhotoUploadField
                        photoPreview={pForm.photoPreview}
                        onPhotoSaved={(file, dataUrl) => setPForm({ ...pForm, photoFile: file, photoPreview: dataUrl })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>First Name</label>
                        <input value={pForm.firstName} onChange={e => setPForm({ ...pForm, firstName: capFn(e.target.value) })} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>Last Name</label>
                        <input value={pForm.lastName} onChange={e => setPForm({ ...pForm, lastName: capFn(e.target.value) })} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>Phone (Read Only)</label>
                      <input value={pForm.phone} disabled style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F1F5F9", color: "#64748B", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>City</label>
                      <input value={pForm.city} onChange={e => setPForm({ ...pForm, city: e.target.value })} placeholder="e.g. Pune" style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>Date of Birth</label>
                      <input value={pForm.birthDate} onChange={e => setPForm({ ...pForm, birthDate: e.target.value })} type="date" max={maxBirthDateForMinAge()} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>Jersey Number</label>
                        <input value={pForm.jerseyNumber} onChange={e => setPForm({ ...pForm, jerseyNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 3) })} inputMode="numeric" placeholder="e.g. 7" style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box" }}/>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>Jersey Size</label>
                        <select value={pForm.jerseySize} onChange={e => setPForm({ ...pForm, jerseySize: e.target.value })} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "var(--font-body)" }}>
                          <option value="">Select Size</option>
                          {["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>Playing Role</label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {["Batsman", "Bowler", "All-rounder", "Wicket-keeper"].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setPForm({ ...pForm, playingRole: r })}
                            style={{
                              padding: "10px 6px",
                              borderRadius: 9,
                              border: pForm.playingRole === r ? "2px solid #166534" : "1.5px solid #E2E8F0",
                              background: pForm.playingRole === r ? "rgba(22,101,52,0.08)" : "#FFFFFF",
                              color: pForm.playingRole === r ? "#166534" : "#0F172A",
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: "pointer"
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 5, fontWeight: 700 }}>Login PIN (4 digits)</label>
                      <input value={pForm.pin} onChange={e => setPForm({ ...pForm, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) })} type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={4} style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 18, outline: "none", boxSizing: "border-box", letterSpacing: 6, textAlign: "center", WebkitTextSecurity: "disc" }}/>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#FFFFFF", fontSize: 14, cursor: "pointer", fontWeight: 700 }}>
                        Cancel
                      </button>
                      <button onClick={saveProfile} disabled={pSaving} style={{ flex: 2, padding: "11px", borderRadius: 10, background: "#166534", border: "none", color: "#FFFFFF", fontSize: 14, cursor: "pointer", fontWeight: 800 }}>
                        {pSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>MOBILE NUMBER</div>
                      <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>{player.phone || "—"}</div>
                    </div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>CITY</div>
                      <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>{player.city || "—"}</div>
                    </div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>DATE OF BIRTH</div>
                      <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>{player.birth_date ? fmtDate(player.birth_date) : "—"}</div>
                    </div>
                    <div style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>JERSEY SIZE</div>
                      <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>{player.jersey_size || "M"}</div>
                    </div>
                  </div>
                )}
              </Card>

              {/* ── PLAYER ROLE PRIVILEGES & PRO UPGRADE ── */}
              <Card style={{ padding: "18px", border: "1.5px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <ShieldCheck size={18} color="#166534"/>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", fontFamily: "var(--font-head)" }}>Player Permissions &amp; Upgrades</span>
                </div>
                <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 14px", lineHeight: 1.5 }}>
                  As a standard player, you can RSVP to match invites, join tournament auctions, and track your attendance. To organize matches or invite squads, submit a Pro request below.
                </p>

                <ProRequestCard player={player} />
              </Card>

              {/* ── PAYMENT & CONTRIBUTION HISTORY ── */}
              {contribList.length > 0 && (
                <Card style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 12, fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Wallet size={16} color="#166534"/> Match Fee Payment History
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {contribList.map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                        <div>
                          <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 700 }}>{c.note || "Match contribution"}</div>
                          <div style={{ fontSize: 11, color: "#94A3B8" }}>{fmtD(c.date)}</div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 15, color: "#166534" }}>₹{c.amount}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── GROUNDS & VENUES PLAYED ── */}
              <Card style={{ padding: "16px" }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 12, fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} color="#166534"/> Grounds Played ({myGrounds.length})
                </div>
                {myGrounds.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#94A3B8" }}>No match grounds recorded yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {myGrounds.map(g => (
                      <div key={g.id} style={{ padding: "10px 12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{g.name}</div>
                          {g.location && <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}><MapPin size={11} style={{ verticalAlign: "-1px" }}/> {g.location}</div>}
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.name + " " + (g.location || ""))}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 11, fontWeight: 700, color: "#166534", textDecoration: "none" }}
                        >
                          Directions ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* ── ORGANIZER SUPPORT CARD ── */}
              <div style={{ background: "linear-gradient(135deg, rgba(22,101,52,0.06), rgba(246,196,83,0.08))", borderRadius: 16, padding: "16px", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "#0F172A" }}>Need help or want to organize an auction?</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Contact Md Zeeshan: 📞 9897439743</div>
                </div>
                <button
                  onClick={() => setShowSupportModal(true)}
                  style={{ padding: "8px 14px", borderRadius: 10, background: "#166534", color: "#FFFFFF", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}
                >
                  Contact ↗
                </button>
              </div>
            </div>
          )
        })()}
      </main>

      {/* ── FIXED BOTTOM NAVIGATION BAR (Mobile Only) ── */}
      {isMobile && (
        <nav style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          display: "flex",
          zIndex: 200,
          boxShadow: "0 -4px 16px rgba(15,23,42,0.05)",
          height: 62
        }}>
          {[
            { key: "dashboard", label: "Home", icon: Home },
            { key: "matches", label: "Matches", icon: Users, badge: pendingMatches.length > 0 ? pendingMatches.length : null },
            { key: "tournaments", label: "Tournaments", icon: Trophy, badge: auctionHistory.some(a => (a.is_captain || a.status === "captain") && a.status !== "waitlist" && a.payment_status !== "waitlist") ? "👑" : null },
            { key: "leaderboard", label: "Rankings", icon: Award },
            { key: "profile", label: "Pass", icon: UserIcon },
          ].map(({ key, label, icon: Icon, badge }) => {
            const isActive = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: isActive ? "#166534" : "#94A3B8",
                  position: "relative",
                  transition: "color 150ms"
                }}
              >
                {isActive && (
                  <div style={{ position: "absolute", top: 0, width: 32, height: 3, background: "#166534", borderRadius: "0 0 3px 3px" }}/>
                )}
                <div style={{ position: "relative" }}>
                  <Icon size={20} />
                  {badge && (
                    <span style={{
                      position: "absolute",
                      top: -4,
                      right: -7,
                      background: badge === "👑" ? "linear-gradient(135deg, #F59E0B, #D97706)" : "#EF4444",
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: 900,
                      padding: "1px 5px",
                      borderRadius: 999,
                      border: "1.5px solid #FFFFFF"
                    }}>
                      {badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 600 }}>{label}</span>
              </button>
            )
          })}
        </nav>
      )}

      {captainPoolModal && (() => {
        const poolList = captainPoolPlayers.filter(p => !p.is_captain && p.status !== "captain")
        const q = captainPoolSearch.trim().toLowerCase()
        const filtered = poolList.filter(p => {
          if (captainPoolRoleFilter && !((p.playing_role || "").toLowerCase().includes(captainPoolRoleFilter.toLowerCase()))) return false
          if (q && !p.name.toLowerCase().includes(q) && !(p.city || "").toLowerCase().includes(q)) return false
          return true
        })

        const roles = [
          { key: "", label: `All (${poolList.length})` },
          { key: "all", label: "🏏 All-rounders" },
          { key: "bat", label: "⚡ Batsmen" },
          { key: "bowl", label: "🎯 Bowlers" },
          { key: "keep", label: "🧤 Keepers" },
        ]

        return (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15,23,42,0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16
            }}
            onClick={() => setCaptainPoolModal(null)}
          >
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 18,
                maxWidth: 680,
                width: "100%",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                padding: "20px 22px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, borderBottom: "1.5px solid #F1F5F9", paddingBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                      Auction Player Pool Dossier
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 800, background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: 999 }}>
                      👑 Captain Scouting View
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                    Analyze all {poolList.length} players available for bidding in <strong>{captainPoolModal.name || "the auction"}</strong>.
                  </div>
                </div>
                <button onClick={() => setCaptainPoolModal(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94A3B8", padding: 0 }}>×</button>
              </div>

              {/* Top Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 11.5, color: "#166534", fontWeight: 700, background: "#DCFCE7", padding: "4px 10px", borderRadius: 8 }}>
                  🔒 Confidential: Mobile numbers withheld for privacy
                </span>
                <button
                  type="button"
                  onClick={() => exportAuctionPoolPdf(captainPoolModal, poolList)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 9,
                    background: "#166534",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  🖨️ Export PDF / Print
                </button>
              </div>

              {/* Search & Filter */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <input
                  value={captainPoolSearch}
                  onChange={e => setCaptainPoolSearch(e.target.value)}
                  placeholder="Search by player name or city..."
                  style={{
                    flex: 1,
                    minWidth: 160,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 12,
                    background: "#FFFFFF",
                    boxSizing: "border-box"
                  }}
                />
                <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
                  {roles.map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setCaptainPoolRoleFilter(r.key)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: captainPoolRoleFilter === r.key ? "1.5px solid #166534" : "1px solid #E2E8F0",
                        background: captainPoolRoleFilter === r.key ? "#DCFCE7" : "#FFFFFF",
                        color: captainPoolRoleFilter === r.key ? "#166534" : "#64748B",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Cards */}
              {loadingCaptainPool ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}><Spinner /></div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                  No players match your search or filter.
                </div>
              ) : (
                <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: 8, maxHeight: 360, paddingRight: 4 }}>
                  {filtered.map((p, idx) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        background: "#F8FAF8",
                        borderRadius: 12,
                        border: "1px solid #E2E8F0"
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 900, color: "#94A3B8", width: 24, textAlign: "center" }}>
                        #{idx + 1}
                      </span>
                      {p.profile_image_url ? (
                        <img
                          src={p.profile_image_url}
                          alt={p.name}
                          style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1.5px solid #E2E8F0" }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#166534", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                          {(p.name || "?")[0]}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A" }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: "#64748B", display: "flex", alignItems: "center", gap: 6, marginTop: 1, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: "#166534" }}>{p.playing_role || "Player"}</span>
                          <span>·</span>
                          <span>📍 {p.city || "Pune"}</span>
                          {p.category && (
                            <>
                              <span>·</span>
                              <span style={{ background: "#F1F5F9", padding: "1px 6px", borderRadius: 4 }}>{p.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: "#166534", fontFamily: "var(--font-head)" }}>
                          🪙 {Number(p.base_price || 0).toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: 9.5, color: "#94A3B8" }}>Base Price</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setCaptainPoolModal(null)}
                  style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default function PlayerPortal({ player, matches = [], onLogout }) {
  if (!player || !player.id) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAF8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Spinner />
        <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, fontFamily: "var(--font-head)" }}>Loading Player Profile...</div>
        <button onClick={onLogout} style={{ marginTop: 8, padding: "8px 16px", borderRadius: 8, background: "#EF4444", color: "#FFFFFF", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Return to Home</button>
      </div>
    )
  }
  return <PlayerPortalInner player={player} matches={matches} onLogout={onLogout} />
}

// ── MATCH DETAIL VIEW FOR PLAYER ──
export function MatchDetailPlayer({ detail, player, onBack, onRespond, isMobile }) {
  const { match: m, matchPlayers, expenses, payments, chat, organizerUpi } = detail
  const [msgs, setMsgs] = useState(chat || [])
  const [input, setInput] = useState("")
  const chatRef = useRef(null)

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs])

  const myRow = matchPlayers.find(mp => mp.player_id === player.id)
  const myStatus = myRow?.status || "pending"
  const confirmed = matchPlayers.filter(mp => mp.status === "confirmed")
  const waitlisted = matchPlayers.filter(mp => mp.status === "waitlist")
  const declined = matchPlayers.filter(mp => mp.status === "declined")

  const pp = ppShare(expenses, confirmed.length)
  const myPaid = payments.find(p => p.player_id === player.id)?.paid

  useEffect(() => {
    const ch = subscribeToChat(m.id, msg => setMsgs(prev => [...prev, msg]))
    return () => { supabase.removeChannel(ch) }
  }, [m.id])

  const doSend = async () => {
    if (!input.trim()) return
    try {
      const msg = await sendMessage(m.id, player.name, input.trim())
      setMsgs(prev => [...prev, msg])
      setInput("")
    } catch (e) {
      alert("Error sending message: " + e.message)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAF8", fontFamily: "var(--font-body)", paddingBottom: 40 }}>
      {/* Detail Top Bar */}
      <div style={{ background: "#FFFFFF", height: 56, borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <button
          onClick={onBack}
          style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAF8", color: "#0F172A", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontWeight: 700 }}
        >
          <ArrowLeft size={15}/> Back
        </button>
        <div style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 15, color: "#0F172A", fontFamily: "var(--font-head)" }}>
          Match Hub
        </div>
        <div style={{ width: 60 }}/>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: isMobile ? "14px 12px" : "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ overflow: "hidden", border: "1.5px solid #E2E8F0" }}>
          {/* Match Banner */}
          <div style={{ background: "linear-gradient(135deg, #166534 0%, #14532D 100%)", padding: isMobile ? "18px 16px" : "22px 24px", color: "#FFFFFF" }}>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9, marginBottom: 3 }}>
              {fmtDate(m.date)}
            </div>
            <h1 style={{ fontSize: isMobile ? 19 : 22, fontWeight: 900, margin: "0 0 6px", fontFamily: "var(--font-head)" }}>
              {matchTitle(m)}
            </h1>
            <div style={{ fontSize: 12, opacity: 0.9, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span><Clock size={13} style={{ verticalAlign: "-2px" }}/> {m.time_slot}</span>
              <span>·</span>
              <span><MapPin size={13} style={{ verticalAlign: "-2px" }}/> {m.ground}</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 800, textTransform: "capitalize" }}>
                {m.status}
              </span>
              <span style={{
                background: myStatus === "confirmed" ? "#22C55E" : myStatus === "waitlist" ? "#F59E0B" : myStatus === "declined" ? "#EF4444" : "#CBD5E1",
                color: myStatus === "pending" ? "#0F172A" : "#FFFFFF",
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 5
              }}>
                {myStatus === "confirmed" ? <><CheckCircle2 size={13}/> You are playing</> :
                 myStatus === "waitlist" ? <><Hourglass size={13}/> On waitlist</> :
                 myStatus === "declined" ? <><XCircle size={13}/> Declined</> :
                 <><Zap size={13}/> Awaiting your reply</>}
              </span>
            </div>
          </div>

          {/* Response Actions */}
          {m.status === "upcoming" && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={() => onRespond("confirmed")}
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  background: myStatus === "confirmed" ? "#166534" : "#F8FAF8",
                  border: myStatus === "confirmed" ? "none" : "1.5px solid #166534",
                  color: myStatus === "confirmed" ? "#FFFFFF" : "#166534",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 800,
                  fontFamily: "var(--font-head)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <CheckCircle2 size={16}/> {myStatus === "confirmed" ? "Confirmed ✅" : "Set Available"}
              </button>
              <button
                onClick={() => onRespond("declined")}
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  background: myStatus === "declined" ? "#EF4444" : "#F8FAF8",
                  border: myStatus === "declined" ? "none" : "1.5px solid rgba(239,68,68,0.4)",
                  color: myStatus === "declined" ? "#FFFFFF" : "#EF4444",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 800,
                  fontFamily: "var(--font-head)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <XCircle size={16}/> {myStatus === "declined" ? "Declined ❌" : "Can't Make It"}
              </button>
            </div>
          )}

          {/* Ground Directions & Add to Calendar */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.ground)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "11px",
                background: "rgba(246,196,83,0.12)",
                borderRadius: 10,
                border: "1px solid rgba(246,196,83,0.3)",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 800,
                color: "#B8860B"
              }}
            >
              <MapPin size={16}/> Google Maps ↗
            </a>

            <button
              onClick={() => downloadICS(m)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "11px",
                background: "#F8FAF8",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 12,
                fontWeight: 800,
                color: "#0F172A",
                cursor: "pointer"
              }}
            >
              <CalendarPlus size={16}/> Add to Calendar
            </button>
          </div>

          {/* Squad Status Overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "14px 16px", borderBottom: "1px solid #F1F5F9" }}>
            {[
              { label: "Invited", v: matchPlayers.length, c: "#64748B" },
              { label: "Confirmed", v: confirmed.length, c: "#166534" },
              { label: "Waitlist", v: waitlisted.length, c: "#B8860B" },
              { label: "Declined", v: declined.length, c: "#EF4444" },
            ].map((s, idx) => (
              <div key={idx} style={{ textAlign: "center", padding: "8px 4px", background: "#F8FAF8", borderRadius: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.c, fontFamily: "var(--font-head)" }}>{s.v}</div>
                <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 2, textTransform: "uppercase", fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Confirmed Roster */}
          <div style={{ padding: "16px", borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={16} color="#166534"/> Who's Coming ({confirmed.length})
              </div>
              {confirmed.length > 0 && (
                <button
                  onClick={() => {
                    const txt = `🏏 ${matchTitle(m)}\n📅 ${fmtDate(m.date)} (${m.time_slot})\n📍 ${m.ground}\n\n✅ Confirmed Players (${confirmed.length}):\n` + confirmed.map((mp, i) => `${i + 1}. ${mp.players?.name || "Player"}`).join("\n")
                    navigator.clipboard.writeText(txt)
                    alert("Copied squad roster!")
                  }}
                  style={{ background: "none", border: "1px solid #CBD5E1", color: "#166534", fontSize: 11, fontWeight: 700, borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}
                >
                  <Clipboard size={12} style={{ verticalAlign: "-2px" }}/> Copy Roster
                </button>
              )}
            </div>

            {confirmed.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94A3B8" }}>No players confirmed yet. Be the first!</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {confirmed.map(mp => (
                  <div key={mp.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 6px", background: "rgba(22,101,52,0.08)", borderRadius: 999, border: "1px solid rgba(22,101,52,0.25)" }}>
                    <Av name={mp.players?.name || "?"} id={mp.player_id} sz={24}/>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>
                      {mp.players?.name || "Player"}{mp.player_id === player.id ? " (You)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense Breakdown & UPI Pay */}
          {expenses.length > 0 && (
            <div style={{ padding: "16px", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Wallet size={16} color="#166534"/> Expense Share
              </div>
              <div style={{ background: "#F8FAF8", borderRadius: 12, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
                {expenses.map((e, idx) => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: idx < expenses.length - 1 ? "1px solid #E2E8F0" : "none", fontSize: 13 }}>
                    <span style={{ color: "#0F172A" }}>{e.label}</span>
                    <span style={{ color: "#64748B" }}>₹{e.amount}</span>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "2px solid #E2E8F0" }}>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>Your Share ({confirmed.length} players)</span>
                  <span style={{ fontWeight: 900, fontSize: 16, color: myPaid ? "#166534" : "#C2410C" }}>
                    ₹{pp} {myPaid ? "✅ Paid" : "(pending)"}
                  </span>
                </div>

                {!myPaid && pp > 0 && organizerUpi && (
                  <a
                    href={`upi://pay?pa=${encodeURIComponent(organizerUpi)}&pn=${encodeURIComponent("Selected Sports")}&am=${pp}&cu=INR&tn=${encodeURIComponent("Match payment - " + (matchTitle(m) || ""))}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      marginTop: 12,
                      padding: "12px",
                      borderRadius: 10,
                      background: "#166534",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: "none"
                    }}
                  >
                    <CreditCard size={15}/> Pay ₹{pp} via UPI App
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Match Live Chat */}
          <div style={{ padding: "16px" }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={16} color="#166534"/> Match Discussion
            </div>

            <div style={{ height: 180, overflowY: "auto", background: "#F8FAF8", borderRadius: 10, border: "1px solid #E2E8F0", padding: "10px", display: "flex", flexDirection: "column", gap: 8 }}>
              {msgs.length === 0 ? (
                <div style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", margin: "auto" }}>No messages yet. Say hi to the squad!</div>
              ) : (
                msgs.map((chatMsg, idx) => (
                  <div key={idx} style={{ fontSize: 12 }}>
                    <strong style={{ color: chatMsg.player_name === player.name ? "#166534" : "#0F172A" }}>{chatMsg.player_name}:</strong>{" "}
                    <span style={{ color: "#334155" }}>{chatMsg.text}</span>
                  </div>
                ))
              )}
              <div ref={chatRef} />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSend()}
                placeholder="Type a message to the squad..."
                style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, outline: "none" }}
              />
              <button
                onClick={doSend}
                style={{ padding: "10px 16px", borderRadius: 8, background: "#166534", color: "#FFFFFF", border: "none", fontWeight: 800, cursor: "pointer" }}
              >
                <Send size={15}/>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}