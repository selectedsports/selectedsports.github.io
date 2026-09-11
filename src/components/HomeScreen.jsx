import { useState, useEffect, useMemo } from "react"
import { useMobile } from "../hooks/useMobile.js"
import { fetchPlayerCount, fetchMatchCount, fetchTeamCount } from "../db.js"
import {
  Users, Swords, Trophy, Sparkles, MapPin, Award, CheckCircle2,
  Phone, ArrowRight, ShieldCheck, Zap
} from "lucide-react"

// Instant cached defaults so the homepage never waits or flickers on initial load
const CACHE_KEY = "ss_home_stats_v2"
function getCachedStats() {
  try {
    const saved = localStorage.getItem(CACHE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return { p: 80, m: 43, t: 24 }
}

export default function HomeScreen({ onLogin, onRegister, onGroundOwnerLogin }) {
  const isMobile = useMobile()
  const initial = useMemo(() => getCachedStats(), [])

  const [playerCount, setPlayerCount] = useState(initial.p)
  const [matchCount, setMatchCount]   = useState(initial.m)
  const [teamCount, setTeamCount]     = useState(initial.t)
  const [countUp, setCountUp]         = useState({ p: initial.p, m: initial.m, t: initial.t })
  const [mounted, setMounted]         = useState(false)
  const [showHelp, setShowHelp]       = useState(false)

  // Smooth immediate mount + parallel background fetch
  useEffect(() => {
    setMounted(true)
    let cancelled = false

    Promise.all([
      fetchPlayerCount().catch(() => null),
      fetchMatchCount().catch(() => null),
      fetchTeamCount().catch(() => null),
    ]).then(([p, m, t]) => {
      if (cancelled) return
      const updated = {
        p: typeof p === "number" && p > 0 ? p : initial.p,
        m: typeof m === "number" && m > 0 ? m : initial.m,
        t: typeof t === "number" && t > 0 ? t : initial.t,
      }
      setPlayerCount(updated.p)
      setMatchCount(updated.m)
      setTeamCount(updated.t)
      setCountUp(updated)
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(updated)) } catch {}
    })

    return () => { cancelled = true }
  }, [initial])

  const stats = [
    { icon: Users,  v: countUp.p, label: "Active Players", sub: "Registered Pool", color: "#166534" },
    { icon: Swords, v: countUp.m, label: "Matches Played", sub: "Games & Fixtures", color: "#B8860B" },
    { icon: Trophy, v: countUp.t, label: "Cricket Teams", sub: "Franchises", color: "#0F766E" },
  ]

  const featurePills = [
    { label: "Digital Player Pass", icon: ShieldCheck },
    { label: "Live Auction Console", icon: Zap },
    { label: "Grounds on Google Maps", icon: MapPin },
    { label: "Season MVP Leaderboard", icon: Award },
  ]

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 40%, #F8FAF8 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-body)",
      position: "relative",
      overflow: "hidden",
      padding: isMobile ? "24px 16px 36px" : "40px 20px"
    }}>
      {/* Dynamic stadium glow backdrops */}
      <div style={{
        position: "fixed",
        top: "-15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: isMobile ? 400 : 700,
        height: isMobile ? 400 : 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0) 70%)",
        pointerEvents: "none"
      }}/>
      <div style={{
        position: "fixed",
        bottom: "-10%",
        right: "-10%",
        width: 450,
        height: 450,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(246,196,83,0.06) 0%, rgba(246,196,83,0) 70%)",
        pointerEvents: "none"
      }}/>

      <div style={{
        width: "100%",
        maxWidth: 520,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out"
      }}>

        {/* Top League Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#FFFFFF",
          border: "1px solid rgba(22,101,52,0.25)",
          padding: "5px 14px",
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 800,
          color: "#166534",
          boxShadow: "0 2px 8px rgba(22,101,52,0.06)",
          marginBottom: 16,
          letterSpacing: 0.5,
          textTransform: "uppercase"
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s infinite" }}/>
          Selected Sports • Cricket Platform
        </div>

        {/* Brand Shield Logo (Cleaned of stray pixels) */}
        <div style={{ position: "relative", display: "inline-block", margin: "0 auto 12px" }}>
          <img
            src="/logo-full.png"
            alt="Selected Sports"
            width={isMobile ? 180 : 210}
            height={isMobile ? 180 : 210}
            style={{
              height: isMobile ? 180 : 210,
              width: "auto",
              display: "block",
              margin: "0 auto",
              filter: "drop-shadow(0 10px 24px rgba(22,101,52,0.12))",
              userSelect: "none"
            }}
          />
        </div>

        {/* High-Impact Sports Headline */}
        <div style={{
          fontSize: isMobile ? 22 : 25,
          fontWeight: 900,
          color: "#0F172A",
          fontFamily: "var(--font-head)",
          letterSpacing: "-0.5px",
          lineHeight: 1.25,
          marginBottom: 8
        }}>
          PLAY. COMPETE.{" "}
          <span style={{
            background: "linear-gradient(135deg, #166534 0%, #15803D 50%, #0F766E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            GET RECOGNISED.
          </span>
        </div>

        {/* Subtitle */}
        <p style={{
          color: "#64748B",
          fontSize: isMobile ? 13 : 14,
          lineHeight: 1.5,
          maxWidth: 420,
          margin: "0 auto 22px"
        }}>
          India's premier cricket community for live auction tournaments, match scheduling, digital player passes, and official player leaderboards.
        </p>

        {/* ── LIVE COMMUNITY STATS GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 20
        }}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: 16,
                padding: "14px 6px",
                boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
                transition: "transform 150ms ease, box-shadow 150ms ease"
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `${s.color}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 6px"
              }}>
                <s.icon size={17} color={s.color} />
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#0F172A",
                fontFamily: "var(--font-head)",
                lineHeight: 1.1
              }}>
                {s.v}+
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0F172A", marginTop: 3 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 1 }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ── FEATURE PILLS BADGES ── */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 6,
          marginBottom: 24
        }}>
          {featurePills.map((fp, idx) => (
            <span
              key={idx}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(22,101,52,0.06)",
                border: "1px solid rgba(22,101,52,0.18)",
                color: "#166534",
                padding: "5px 11px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700
              }}
            >
              <fp.icon size={13} color="#166534" />
              {fp.label}
            </span>
          ))}
        </div>

        {/* ── CALL TO ACTION BUTTONS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          <button
            onClick={onLogin}
            style={{
              width: "100%",
              height: 54,
              borderRadius: 15,
              background: "linear-gradient(135deg, #166534 0%, #15803D 100%)",
              border: "none",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "var(--font-head)",
              boxShadow: "0 8px 22px rgba(22,101,52,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform 150ms ease, box-shadow 150ms ease"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)"
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(22,101,52,0.45)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 8px 22px rgba(22,101,52,0.35)"
            }}
          >
            <span>Login to Selected Sports</span>
            <ArrowRight size={17} />
          </button>

          <button
            onClick={onRegister}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 15,
              background: "#FFFFFF",
              border: "1.5px solid #166534",
              color: "#166534",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "var(--font-head)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
              transition: "background 150ms ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(22,101,52,0.06)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#FFFFFF" }}
          >
            <Sparkles size={16} color="#166534"/>
            <span>Create New Player Account</span>
          </button>

          <button
            onClick={() => onGroundOwnerLogin ? onGroundOwnerLogin() : onLogin("ground_owner")}
            style={{
              width: "100%",
              padding: "13px 18px",
              borderRadius: 15,
              background: "#F0FDF4",
              border: "1.5px solid #86EFAC",
              color: "#166534",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "var(--font-head)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(22,101,52,0.06)",
              transition: "all 150ms ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#DCFCE7" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#F0FDF4" }}
          >
            <span>🏟️ Ground Owner Login</span>
            <span style={{ fontSize: 11, background: "rgba(22,101,52,0.12)", padding: "2px 7px", borderRadius: 6 }}>Slot Diary ➔</span>
          </button>
        </div>

        {/* Tournament Organizer Assistance */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#64748B",
          marginTop: 6
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Want to organize an auction?</span>
          </span>
          <button
            onClick={() => setShowHelp(true)}
            style={{
              background: "none",
              border: "none",
              color: "#166534",
              fontWeight: 800,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline"
            }}
          >
            Contact Md Zeeshan ↗
          </button>
        </div>

        {/* Footer info */}
        <div style={{
          fontSize: 11,
          color: "#94A3B8",
          fontWeight: 700,
          marginTop: 20,
          letterSpacing: 0.5,
          textTransform: "uppercase"
        }}>
          Selected Sports • Play • Compete • Get Recognised
        </div>
      </div>

      {/* ── ORGANIZER CONTACT MODAL ── */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
            padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: 20,
              maxWidth: 420,
              width: "100%",
              padding: 24,
              boxShadow: "0 25px 60px rgba(15,23,42,0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 17, fontFamily: "var(--font-head)", color: "#0F172A" }}>
                Tournament Organizer Support
              </div>
              <button
                onClick={() => setShowHelp(false)}
                style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B" }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px", lineHeight: 1.5 }}>
              Want to organize an auction for your tournament, schedule matches, or need account help? Contact Md Zeeshan:
            </p>
            <div style={{ background: "#F8FAF8", borderRadius: 12, padding: "14px", border: "1px solid #E2E8F0", marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>Md Zeeshan</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Head of Tournament Operations</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 15, fontWeight: 800, color: "#166534" }}>
                <Phone size={15}/> 9897439743
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <a
                href="tel:9897439743"
                style={{
                  padding: "12px",
                  borderRadius: 11,
                  background: "#166534",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 800
                }}
              >
                📞 Call Now
              </a>
              <a
                href="https://wa.me/919897439743?text=Hi%20Md%20Zeeshan,%20I'm%20interested%20in%20organizing%20an%20auction%20tournament%20with%20Selected%20Sports"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "12px",
                  borderRadius: 11,
                  background: "#25D366",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 800
                }}
              >
                WhatsApp ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
