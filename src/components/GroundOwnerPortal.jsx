import { useState, useEffect } from "react"
import { MapPin, LogOut, Phone, Calendar, RefreshCw, ShieldCheck, Sparkles } from "lucide-react"
import { Card, Spinner } from "./ui.jsx"
import { fetchGrounds } from "../db.js"
import GroundBookingsSection from "./GroundBookingsSection.jsx"
import { useMobile } from "../hooks/useMobile.js"

export default function GroundOwnerPortal({ owner, onLogout }) {
  const isMobile = useMobile()
  const [grounds, setGrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadGrounds = async () => {
    setLoading(true)
    try {
      const g = await fetchGrounds()
      setGrounds(g || [])
    } catch (e) {
      console.error("Error loading grounds:", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGrounds()
  }, [])

  const assignedGround = grounds.find(g => String(g.id) === String(owner?.ground_id))
  const displayGroundName = assignedGround?.name || owner?.ground_name || "Assigned Ground"

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F1F5F9",
      backgroundImage: "radial-gradient(at 0% 0%, rgba(22, 101, 52, 0.06) 0px, transparent 450px), radial-gradient(at 100% 0%, rgba(184, 134, 11, 0.04) 0px, transparent 400px), radial-gradient(#CBD5E1 0.75px, transparent 0.75px)",
      backgroundSize: "100% 100%, 100% 100%, 24px 24px",
      backgroundAttachment: "fixed",
      fontFamily: "var(--font-body)",
      paddingBottom: isMobile ? 60 : 40
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: "rgba(255, 255, 255, 0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        height: isMobile ? 56 : 64,
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 14px" : "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "0 1px 4px rgba(15,23,42,0.04)"
      }}>
        {/* Brand & Ground Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <img src="/logo-full.png?v=1" alt="Selected Sports" style={{ height: isMobile ? 32 : 38, width: "auto" }} />
          <div style={{ height: 20, width: 1.5, background: "#E2E8F0" }} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: isMobile ? 13 : 15,
              fontWeight: 900,
              color: "#166534",
              fontFamily: "var(--font-head)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              <MapPin size={isMobile ? 14 : 16} color="#166534" style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{displayGroundName}</span>
            </div>
            <div style={{ fontSize: 10.5, color: "#64748B", fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" }}>
              Ground Desk &amp; Slot Diary
            </div>
          </div>
        </div>

        {/* Owner Info & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => { setRefreshKey(k => k + 1); loadGrounds() }}
            title="Refresh Bookings"
            style={{
              background: "none",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              padding: "7px 10px",
              color: "#64748B",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600
            }}
          >
            <RefreshCw size={13} />
            {!isMobile && "Refresh"}
          </button>

          {!isMobile && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "#F1F5F9",
              borderRadius: 8,
              fontSize: 12,
              color: "#0F172A",
              fontWeight: 700
            }}>
              <ShieldCheck size={14} color="#166534" />
              <span>{owner?.name || "Ground Owner"}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid #FCA5A5",
              background: "#FEF2F2",
              color: "#DC2626",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-body)"
            }}
            title="Logout"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "16px 12px" : "24px 20px" }}>
        {/* Welcome Notice */}
        <div style={{
          background: "linear-gradient(135deg, #166534 0%, #15803D 100%)",
          borderRadius: 16,
          padding: isMobile ? "16px 14px" : "20px 24px",
          color: "#FFFFFF",
          marginBottom: 20,
          boxShadow: "0 8px 24px rgba(22,101,52,0.18)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>
              <Sparkles size={12} /> Ground Owner Desk
            </div>
            <h1 style={{ margin: "0 0 4px", fontSize: isMobile ? 18 : 22, fontWeight: 900, fontFamily: "var(--font-head)" }}>
              Welcome, {owner?.name || "Ground Manager"} 👋
            </h1>
            <p style={{ margin: 0, fontSize: 12.5, opacity: 0.9, maxWidth: 520, lineHeight: 1.4 }}>
              Take slot reservations for <strong>{displayGroundName}</strong>, track advances &amp; balance dues, and instantly dispatch official confirmation slips with unique Booking IDs on WhatsApp.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.15)", padding: "8px 14px", borderRadius: 10, fontSize: 12 }}>
            <Phone size={13} />
            <span>Login: <strong>+91 {owner?.phone}</strong></span>
          </div>
        </div>

        {/* Slot Diary Content */}
        {loading ? (
          <Card style={{ padding: "40px", textAlign: "center" }}>
            <Spinner />
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 12 }}>Loading venue and slot diary...</div>
          </Card>
        ) : (
          <GroundBookingsSection
            key={refreshKey}
            grounds={grounds}
            initialGroundId={owner?.ground_id !== "all" ? owner?.ground_id : null}
            lockGround={owner?.ground_id !== "all"}
            groundOwner={owner}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  )
}
