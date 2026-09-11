import { useState, useEffect, useMemo } from "react"
import { 
  Calendar, Clock, Phone, MapPin, User, Users, Plus, Search, 
  CheckCircle2, AlertCircle, MessageSquare, DollarSign, Edit3, 
  Trash2, Printer, X, Share2, Sparkles, Filter, Check, ArrowRight
} from "lucide-react"
import { Card, Spinner } from "./ui.jsx"
import { fmtDate } from "../constants.js"
import { waGroundBookingConfirmation } from "./whatsapp.js"
import { fetchGroundBookings, saveGroundBooking, deleteGroundBooking, updateBookingPaymentStatus } from "../db.js"

const SLOT_PRESETS = [
  "06:00 AM - 09:00 AM",
  "09:00 AM - 12:00 PM",
  "01:00 PM - 04:00 PM",
  "04:00 PM - 07:00 PM",
  "07:00 PM - 10:00 PM",
  "10:00 PM - 01:00 AM"
]

const SLOT_TYPES = [
  "Box Cricket / Turf",
  "11v11 Match (Leather)",
  "11v11 Match (Tennis)",
  "Practice Nets",
  "Corporate Match",
  "Tournament Slot"
]

const AMENITIES_OPTIONS = [
  "Floodlights",
  "Match Balls",
  "Umpire Provided",
  "Drinking Water",
  "Matting Wicket"
]

export default function GroundBookingsSection({ grounds = [], initialGroundId = null, isMobile = false }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterGround, setFilterGround] = useState(initialGroundId ? String(initialGroundId) : "all")
  const [filterDateTab, setFilterDateTab] = useState("upcoming") // 'all', 'today', 'tomorrow', 'upcoming', 'balance_due', 'past'
  const [showModal, setShowModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [busy, setBusy] = useState(false)
  const [settlingBooking, setSettlingBooking] = useState(null)
  const [settleAmount, setSettleAmount] = useState("")
  const [settleMode, setSettleMode] = useState("Cash")

  const todayStr = new Date().toISOString().split("T")[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchGroundBookings()
      setBookings(data)
    } catch (e) {
      console.error("Error loading ground bookings:", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-sync initialGroundId if changed
  useEffect(() => {
    if (initialGroundId) {
      setFilterGround(String(initialGroundId))
    }
  }, [initialGroundId])

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings.filter(b => {
      // Search match
      if (q) {
        const matchName = (b.customer_name || "").toLowerCase().includes(q)
        const matchPhone = (b.customer_phone || "").includes(q)
        const matchTeam = (b.customer_team || "").toLowerCase().includes(q)
        const matchGround = (b.ground_name || "").toLowerCase().includes(q)
        const matchNotes = (b.notes || "").toLowerCase().includes(q)
        if (!matchName && !matchPhone && !matchTeam && !matchGround && !matchNotes) return false
      }

      // Ground filter
      if (filterGround !== "all") {
        if (String(b.ground_id) !== String(filterGround) && b.ground_name !== filterGround) {
          return false
        }
      }

      // Date / Tab filter
      const bDate = b.date || ""
      if (filterDateTab === "today") return bDate === todayStr
      if (filterDateTab === "tomorrow") return bDate === tomorrowStr
      if (filterDateTab === "upcoming") return bDate >= todayStr && b.status !== "cancelled"
      if (filterDateTab === "balance_due") return Number(b.balance_due || 0) > 0 && b.status !== "cancelled"
      if (filterDateTab === "past") return bDate < todayStr
      return true
    }).sort((a, b) => {
      // Sort upcoming ascending, past descending
      if (filterDateTab === "past") return (b.date || "").localeCompare(a.date || "")
      return (a.date || "").localeCompare(b.date || "")
    })
  }, [bookings, search, filterGround, filterDateTab, todayStr, tomorrowStr])

  // Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0
    let totalBalanceDue = 0
    let todayCount = 0

    bookings.forEach(b => {
      if (b.status === "cancelled") return
      totalRevenue += Number(b.advance_paid || 0)
      totalBalanceDue += Number(b.balance_due || 0)
      if (b.date === todayStr) todayCount++
    })

    return {
      totalBookings: bookings.length,
      todayCount,
      totalRevenue,
      totalBalanceDue
    }
  }, [bookings, todayStr])

  const handleOpenAdd = () => {
    setEditingBooking(null)
    setShowModal(true)
  }

  const handleOpenEdit = (b) => {
    setEditingBooking(b)
    setShowModal(true)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete booking for "${name}"?`)) return
    setBusy(true)
    try {
      await deleteGroundBooking(id)
      await loadData()
    } catch (e) {
      alert(e.message)
    }
    setBusy(false)
  }

  const handleQuickSettleBalance = (b) => {
    setSettlingBooking(b)
    setSettleAmount(String(b.balance_due || 0))
    setSettleMode("Cash")
  }

  const doSubmitSettle = async () => {
    if (!settlingBooking) return
    const amt = Number(settleAmount) || 0
    if (amt <= 0) {
      alert("Enter a valid settlement amount")
      return
    }
    setBusy(true)
    try {
      const currentAdvance = Number(settlingBooking.advance_paid || 0)
      const newAdvance = currentAdvance + amt
      await updateBookingPaymentStatus(settlingBooking.id, {
        advance_paid: newAdvance,
        payment_method: settleMode
      })
      setSettlingBooking(null)
      await loadData()
    } catch (e) {
      alert(e.message)
    }
    setBusy(false)
  }

  const handleSendWhatsApp = (b) => {
    const rawPhone = (b.customer_phone || "").replace(/[^0-9]/g, "")
    const cleanPhone = rawPhone.length === 10 ? "91" + rawPhone : rawPhone
    const text = waGroundBookingConfirmation(b)
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  const handlePrintSchedule = () => {
    const targetDate = filterDateTab === "tomorrow" ? tomorrowStr : todayStr
    const slotsToPrint = bookings.filter(b => b.date === targetDate && b.status !== "cancelled")
    
    const rowsHtml = slotsToPrint.length === 0
      ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748B;">No ground bookings scheduled for ${fmtDate(targetDate)}.</td></tr>`
      : slotsToPrint.map((b, i) => `
        <tr>
          <td style="text-align:center;font-weight:700;">#${i+1}</td>
          <td><strong>${b.time_slot || "—"}</strong></td>
          <td>${b.ground_name || "—"}</td>
          <td><strong>${b.customer_name}</strong>${b.customer_team ? `<br><small style="color:#64748B;">${b.customer_team}</small>` : ""}</td>
          <td>${b.customer_phone}</td>
          <td style="text-align:right;">₹${Number(b.rate||0).toLocaleString("en-IN")}</td>
          <td style="text-align:right;font-weight:800;color:${Number(b.balance_due||0) > 0 ? '#DC2626' : '#166534'};">
            ${Number(b.balance_due||0) > 0 ? `₹${Number(b.balance_due).toLocaleString("en-IN")} DUE` : "✓ Paid"}
          </td>
        </tr>
      `).join("")

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ground Booking Daily Schedule - ${targetDate}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0F172A; }
          h2 { margin: 0 0 4px; font-size: 20px; }
          .sub { color: #64748B; font-size: 13px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #CBD5E1; padding: 10px 12px; font-size: 12px; text-align: left; }
          th { background: #F1F5F9; font-weight: 800; text-transform: uppercase; font-size: 11px; }
          .footer { margin-top: 24px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <h2>🏏 Ground Daily Slot Schedule</h2>
        <div class="sub">Date: <strong>${fmtDate(targetDate)}</strong> · Generated from Selected Sports Ground Diary</div>
        <table>
          <thead>
            <tr>
              <th style="width:40px;text-align:center;">#</th>
              <th>Time Slot</th>
              <th>Ground / Turf</th>
              <th>Booked By / Team</th>
              <th>Phone</th>
              <th style="text-align:right;">Slot Rent</th>
              <th style="text-align:right;">Balance Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="footer">Ground Office Desk Copy · Official Daily Booking Schedule</div>
      </body>
      </html>
    `
    const w = window.open("", "_blank")
    if (w) {
      w.document.write(printHtml)
      w.document.close()
      setTimeout(() => { try { w.print() } catch {} }, 300)
    }
  }

  if (loading) return <Spinner />

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* Top Banner & Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ color: "#0F172A", fontSize: isMobile ? 20 : 24, fontWeight: 900, margin: 0, fontFamily: "var(--font-head)" }}>
              Ground Bookings &amp; Slot Diary
            </h2>
            <span style={{ fontSize: 11, background: "rgba(34,197,94,0.12)", color: "#166534", padding: "3px 8px", borderRadius: 6, fontWeight: 800 }}>
              Online Register
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Digital slot notepad for ground owners — track bookings, advances, and send WhatsApp confirmation slips.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={handlePrintSchedule}
            title="Print Today's Schedule for ground desk"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "#FFFFFF",
              border: "1.5px solid #CBD5E1",
              color: "#334155",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Printer size={15} /> {!isMobile && "Print Schedule"}
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "#166534",
              border: "none",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "var(--font-head)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(22,101,52,0.25)"
            }}
          >
            <Plus size={16} /> Book Slot
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 5 }}>
            <Calendar size={13} color="#166534" /> Today's Slots
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginTop: 4, fontFamily: "var(--font-head)" }}>
            {metrics.todayCount}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{fmtDate(todayStr)}</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 5 }}>
            <Users size={13} color="#3B82F6" /> Total Bookings
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginTop: 4, fontFamily: "var(--font-head)" }}>
            {metrics.totalBookings}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Registered in diary</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 5 }}>
            <CheckCircle2 size={13} color="#166534" /> Collected Revenue
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#166534", marginTop: 4, fontFamily: "var(--font-head)" }}>
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Advances &amp; full payments</div>
        </div>

        <div style={{ background: metrics.totalBalanceDue > 0 ? "rgba(239,68,68,0.06)" : "#FFFFFF", border: metrics.totalBalanceDue > 0 ? "1.5px solid rgba(239,68,68,0.3)" : "1px solid #E2E8F0", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: metrics.totalBalanceDue > 0 ? "#DC2626" : "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={13} color={metrics.totalBalanceDue > 0 ? "#DC2626" : "#94A3B8"} /> Balance Due
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: metrics.totalBalanceDue > 0 ? "#DC2626" : "#0F172A", marginTop: 4, fontFamily: "var(--font-head)" }}>
            ₹{metrics.totalBalanceDue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: 11, color: metrics.totalBalanceDue > 0 ? "#EF4444" : "#94A3B8", marginTop: 2, fontWeight: metrics.totalBalanceDue > 0 ? 700 : 400 }}>
            {metrics.totalBalanceDue > 0 ? "To collect at ground" : "All settled"}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "14px 16px", border: "1px solid #E2E8F0", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          {/* Search box */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={15} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer, phone, team, notes..."
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: 9,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                outline: "none",
                background: "#FAFBFB",
                boxSizing: "border-box"
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 16 }}>×</button>
            )}
          </div>

          {/* Ground Venue selector */}
          <div style={{ width: isMobile ? "100%" : 220 }}>
            <select
              value={filterGround}
              onChange={e => setFilterGround(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 9,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                background: "#FAFBFB",
                color: "#0F172A",
                outline: "none",
                fontWeight: 600
              }}
            >
              <option value="all">All Grounds &amp; Venues</option>
              {grounds.map(g => (
                <option key={g.id} value={String(g.id)}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {[
            ["upcoming", "📅 Upcoming Slots"],
            ["today", `⚡ Today (${todayStr})`],
            ["tomorrow", "🌅 Tomorrow"],
            ["balance_due", `⚠️ Balance Due (${bookings.filter(b => Number(b.balance_due || 0) > 0 && b.status !== "cancelled").length})`],
            ["all", "All Bookings"],
            ["past", "History / Past"]
          ].map(([k, label]) => {
            const active = filterDateTab === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilterDateTab(k)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: active ? "1.5px solid #166534" : "1px solid #E2E8F0",
                  background: active ? "#DCFCE7" : "#FFFFFF",
                  color: active ? "#166534" : "#475569",
                  fontSize: 12,
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 150ms ease"
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Calendar size={26} color="#166534" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)" }}>
            No Ground Bookings Found
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4, maxWidth: 360, margin: "4px auto 14px" }}>
            {search || filterGround !== "all" || filterDateTab !== "all"
              ? "No bookings match your current search or filter criteria. Try changing filters or clear search."
              : "Start maintaining your ground bookings digitally online. Say goodbye to offline notepads!"}
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              padding: "10px 18px",
              borderRadius: 9,
              background: "#166534",
              border: "none",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "var(--font-head)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Plus size={15} /> Add First Booking
          </button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filteredBookings.map(b => {
            const isToday = b.date === todayStr
            const isBalanceDue = Number(b.balance_due || 0) > 0
            const isFullyPaid = Number(b.rate || 0) > 0 && Number(b.balance_due || 0) === 0
            const hasAdvance = Number(b.advance_paid || 0) > 0

            return (
              <div
                key={b.id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 12,
                  border: isToday ? "2px solid #166534" : "1px solid #E2E8F0",
                  padding: "14px 16px",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
                  transition: "all 150ms ease"
                }}
              >
                {/* Top Row: Date/Slot, Venue, Payment Pill */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ 
                      background: isToday ? "#166534" : "#F1F5F9", 
                      color: isToday ? "#FFFFFF" : "#0F172A", 
                      padding: "4px 10px", 
                      borderRadius: 6, 
                      fontSize: 11.5, 
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <Calendar size={12} /> {fmtDate(b.date)} {isToday && "· TODAY"}
                    </span>

                    <span style={{ 
                      background: "rgba(59,130,246,0.1)", 
                      color: "#2563EB", 
                      padding: "4px 9px", 
                      borderRadius: 6, 
                      fontSize: 11.5, 
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <Clock size={12} /> {b.time_slot || "Slot"}
                    </span>

                    <span style={{ 
                      background: "#F8FAF8", 
                      border: "1px solid #E2E8F0",
                      color: "#475569", 
                      padding: "4px 9px", 
                      borderRadius: 6, 
                      fontSize: 11.5, 
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}>
                      <MapPin size={12} color="#166534" /> {b.ground_name}
                    </span>
                  </div>

                  {/* Payment Status Badge */}
                  <div>
                    {isFullyPaid ? (
                      <span style={{ background: "#DCFCE7", color: "#166534", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={12} /> Paid in Full (₹{Number(b.rate).toLocaleString("en-IN")})
                      </span>
                    ) : isBalanceDue ? (
                      <span style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <AlertCircle size={12} /> ₹{Number(b.balance_due).toLocaleString("en-IN")} Balance Due
                      </span>
                    ) : (
                      <span style={{ background: "#F1F5F9", color: "#64748B", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        Payment Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Customer Info, Team, Slot Type */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                        {b.customer_name}
                      </span>
                      {b.customer_team && (
                        <span style={{ fontSize: 11, background: "rgba(34,197,94,0.1)", color: "#166534", padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>
                          🏏 {b.customer_team}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#64748B", background: "#F8FAF8", padding: "2px 6px", borderRadius: 4, border: "1px solid #E2E8F0" }}>
                        {b.slot_type || "Match"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 12, color: "#64748B" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={12} color="#166534" /> <strong>{b.customer_phone}</strong>
                      </span>
                      {b.payment_method && (
                        <span>Mode: <strong>{b.payment_method}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Financials pill */}
                  <div style={{ textAlign: isMobile ? "left" : "right" }}>
                    <div style={{ fontSize: 12, color: "#64748B" }}>
                      Rate: <strong style={{ color: "#0F172A" }}>₹{Number(b.rate || 0).toLocaleString("en-IN")}</strong>
                      {hasAdvance && (
                        <span> · Adv: <strong style={{ color: "#166534" }}>₹{Number(b.advance_paid).toLocaleString("en-IN")}</strong></span>
                      )}
                    </div>
                    {isBalanceDue && (
                      <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 700, marginTop: 2 }}>
                        Remaining: ₹{Number(b.balance_due).toLocaleString("en-IN")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities & Notes (if any) */}
                {((b.amenities && b.amenities.length > 0) || b.notes) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 12, fontSize: 11 }}>
                    {b.amenities && b.amenities.map(a => (
                      <span key={a} style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                        ✨ {a}
                      </span>
                    ))}
                    {b.notes && (
                      <span style={{ color: "#64748B", fontStyle: "italic", marginLeft: 4 }}>
                        📝 "{b.notes}"
                      </span>
                    )}
                  </div>
                )}

                {/* Actions Bottom Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {/* Send WhatsApp confirmation slip */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(b)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 8,
                        background: "#DCFCE7",
                        border: "1px solid #86EFAC",
                        color: "#166534",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5
                      }}
                      title="Send booking confirmation slip on WhatsApp"
                    >
                      <MessageSquare size={13} /> WhatsApp Slip
                    </button>

                    {/* Settle Balance quick action */}
                    {isBalanceDue && (
                      <button
                        type="button"
                        onClick={() => handleQuickSettleBalance(b)}
                        style={{
                          padding: "7px 12px",
                          borderRadius: 8,
                          background: "#FFFFFF",
                          border: "1.5px solid #F59E0B",
                          color: "#B45309",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <DollarSign size={13} /> Settle Balance
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        color: "#475569",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.customer_name)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        border: "1px solid #FECACA",
                        background: "#FFF5F5",
                        color: "#DC2626",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Settle Balance Modal */}
      {settlingBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 16 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 380, padding: 22, boxShadow: "0 10px 30px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A", fontFamily: "var(--font-head)" }}>
                Settle Remaining Balance
              </div>
              <button onClick={() => setSettlingBooking(null)} style={{ background: "none", border: "none", fontSize: 20, color: "#94A3B8", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>
              Customer: <strong>{settlingBooking.customer_name}</strong><br />
              Total Rent: ₹{Number(settlingBooking.rate || 0).toLocaleString("en-IN")}<br />
              Advance Paid: ₹{Number(settlingBooking.advance_paid || 0).toLocaleString("en-IN")}<br />
              Current Balance: <strong style={{ color: "#DC2626" }}>₹{Number(settlingBooking.balance_due || 0).toLocaleString("en-IN")}</strong>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                Amount Received (₹)
              </label>
              <input
                type="number"
                value={settleAmount}
                onChange={e => setSettleAmount(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontSize: 15, fontWeight: 800, color: "#0F172A", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                Payment Mode
              </label>
              <select
                value={settleMode}
                onChange={e => setSettleMode(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
              >
                <option value="Cash">Cash at Ground</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="GPay / PhonePe">Google Pay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setSettlingBooking(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 9, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doSubmitSettle}
                disabled={busy}
                style={{ flex: 1.5, padding: "11px", borderRadius: 9, border: "none", background: "#166534", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer" }}
              >
                {busy ? "Saving..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Booking Modal */}
      {showModal && (
        <BookingFormModal
          grounds={grounds}
          initialGroundId={filterGround !== "all" ? filterGround : (grounds[0]?.id || null)}
          booking={editingBooking}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            setShowModal(false)
            await loadData()
          }}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}

// ── Booking Form Modal Component ──────────────────────────────────────────────
function BookingFormModal({ grounds = [], initialGroundId = null, booking = null, onClose, onSaved, isMobile = false }) {
  const [groundId, setGroundId] = useState(booking?.ground_id || initialGroundId || (grounds[0]?.id || ""))
  const [customGround, setCustomGround] = useState(booking?.ground_name || "")
  const [customerName, setCustomerName] = useState(booking?.customer_name || "")
  const [customerPhone, setCustomerPhone] = useState(booking?.customer_phone || "")
  const [customerTeam, setCustomerTeam] = useState(booking?.customer_team || "")
  const [date, setDate] = useState(booking?.date || new Date().toISOString().split("T")[0])
  const [timeSlot, setTimeSlot] = useState(booking?.time_slot || SLOT_PRESETS[0])
  const [slotType, setSlotType] = useState(booking?.slot_type || SLOT_TYPES[0])
  const [rate, setRate] = useState(booking?.rate !== undefined ? String(booking.rate) : "2500")
  const [advancePaid, setAdvancePaid] = useState(booking?.advance_paid !== undefined ? String(booking.advance_paid) : "1000")
  const [paymentMethod, setPaymentMethod] = useState(booking?.payment_method || "UPI")
  const [amenities, setAmenities] = useState(booking?.amenities || ["Floodlights"])
  const [notes, setNotes] = useState(booking?.notes || "")
  const [status, setStatus] = useState(booking?.status || "confirmed")
  const [busy, setBusy] = useState(false)

  const numRate = Number(rate) || 0
  const numAdvance = Number(advancePaid) || 0
  const balanceDue = Math.max(0, numRate - numAdvance)

  const todayStr = new Date().toISOString().split("T")[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  const handleToggleAmenity = (item) => {
    setAmenities(prev => 
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) {
      alert("Please enter customer / booker name")
      return
    }
    if (!customerPhone.trim()) {
      alert("Please enter customer phone number")
      return
    }

    const selectedGroundObj = grounds.find(g => String(g.id) === String(groundId))
    const finalGroundName = selectedGroundObj?.name || customGround.trim() || "Ground"

    setBusy(true)
    try {
      await saveGroundBooking({
        id: booking?.id,
        ground_id: groundId || null,
        ground_name: finalGroundName,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_team: customerTeam.trim(),
        date,
        time_slot: timeSlot.trim(),
        slot_type: slotType,
        rate: numRate,
        advance_paid: numAdvance,
        balance_due: balanceDue,
        payment_method: paymentMethod,
        amenities,
        notes: notes.trim(),
        status
      })
      onSaved()
    } catch (err) {
      alert(err.message)
    }
    setBusy(false)
  }

  const iStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1.5px solid #CBD5E1",
    fontSize: 13,
    outline: "none",
    background: "#FFFFFF",
    color: "#0F172A",
    boxSizing: "border-box"
  }

  const lStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 4
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 14 }}>
      <div style={{ background: "#FFFFFF", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#FFFFFF", zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", fontFamily: "var(--font-head)" }}>
              {booking ? "Edit Ground Booking" : "New Ground Booking"}
            </div>
            <div style={{ fontSize: 12, color: "#64748B" }}>
              Record slot reservation, agreed rent, and customer details
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "#94A3B8", cursor: "pointer" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "18px 20px" }}>
          {/* Ground Venue Selection */}
          <div style={{ marginBottom: 14 }}>
            <label style={lStyle}>Ground / Venue *</label>
            <select
              value={groundId}
              onChange={e => setGroundId(e.target.value)}
              style={iStyle}
            >
              {grounds.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.location || "Venue"})</option>
              ))}
              <option value="custom">Other / Custom Ground Name...</option>
            </select>
            {groundId === "custom" && (
              <input
                type="text"
                value={customGround}
                onChange={e => setCustomGround(e.target.value)}
                placeholder="Type ground / turf name"
                style={{ ...iStyle, marginTop: 6 }}
              />
            )}
          </div>

          {/* Customer Name & Phone */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={lStyle}>Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                style={iStyle}
              />
            </div>
            <div>
              <label style={lStyle}>Phone (WhatsApp) *</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="10-digit number"
                required
                style={iStyle}
              />
            </div>
          </div>

          {/* Team / Club Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={lStyle}>Team / Club Name (Optional)</label>
            <input
              type="text"
              value={customerTeam}
              onChange={e => setCustomerTeam(e.target.value)}
              placeholder="e.g. Phoenix Cricket Club, TCS Corporate XI"
              style={iStyle}
            />
          </div>

          {/* Date with quick chips */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ ...lStyle, marginBottom: 0 }}>Date *</label>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setDate(todayStr)}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, border: date === todayStr ? "1px solid #166534" : "1px solid #CBD5E1", background: date === todayStr ? "#DCFCE7" : "#F8FAF8", color: date === todayStr ? "#166534" : "#475569", cursor: "pointer", fontWeight: 700 }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDate(tomorrowStr)}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, border: date === tomorrowStr ? "1px solid #166534" : "1px solid #CBD5E1", background: date === tomorrowStr ? "#DCFCE7" : "#F8FAF8", color: date === tomorrowStr ? "#166534" : "#475569", cursor: "pointer", fontWeight: 700 }}
                >
                  Tomorrow
                </button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={iStyle}
              required
            />
          </div>

          {/* Time Slot Presets & Custom */}
          <div style={{ marginBottom: 14 }}>
            <label style={lStyle}>Time Slot Timing *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8 }}>
              {SLOT_PRESETS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTimeSlot(preset)}
                  style={{
                    padding: "7px 4px",
                    borderRadius: 7,
                    border: timeSlot === preset ? "2px solid #166534" : "1px solid #CBD5E1",
                    background: timeSlot === preset ? "#DCFCE7" : "#FFFFFF",
                    color: timeSlot === preset ? "#166534" : "#475569",
                    fontSize: 11,
                    fontWeight: timeSlot === preset ? 800 : 600,
                    cursor: "pointer",
                    textAlign: "center"
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              placeholder="Or type custom slot (e.g. 06:30 AM - 09:30 AM)"
              style={iStyle}
            />
          </div>

          {/* Slot Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={lStyle}>Slot Type / Match Format</label>
            <select
              value={slotType}
              onChange={e => setSlotType(e.target.value)}
              style={iStyle}
            >
              {SLOT_TYPES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Financials & Balance Calculator (Crucial Notepad feature!) */}
          <div style={{ background: "#F8FAF8", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "14px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <DollarSign size={14} /> Rent &amp; Advance Payment
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={lStyle}>Total Slot Rent (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={rate}
                  onChange={e => setRate(e.target.value)}
                  placeholder="2500"
                  required
                  style={{ ...iStyle, fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={lStyle}>Advance Received (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={advancePaid}
                  onChange={e => setAdvancePaid(e.target.value)}
                  placeholder="1000"
                  style={{ ...iStyle, fontWeight: 800, color: "#166534" }}
                />
              </div>
            </div>

            {/* Calculated Balance Banner */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: balanceDue > 0 ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.1)", borderRadius: 8, border: balanceDue > 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(34,197,94,0.25)" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: balanceDue > 0 ? "#DC2626" : "#166534" }}>
                {balanceDue > 0 ? "⚠️ Remaining Balance Due:" : "✓ Fully Paid &amp; Settled"}
              </span>
              <span style={{ fontSize: 15, fontWeight: 900, color: balanceDue > 0 ? "#DC2626" : "#166534", fontFamily: "var(--font-head)" }}>
                ₹{balanceDue.toLocaleString("en-IN")}
              </span>
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={lStyle}>Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                style={iStyle}
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash</option>
                <option value="GPay / PhonePe">Google Pay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
              </select>
            </div>
          </div>

          {/* Amenities Checkboxes */}
          <div style={{ marginBottom: 14 }}>
            <label style={lStyle}>Amenities Provided</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {AMENITIES_OPTIONS.map(item => {
                const checked = amenities.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleAmenity(item)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 7,
                      border: checked ? "1.5px solid #166534" : "1px solid #CBD5E1",
                      background: checked ? "#DCFCE7" : "#FFFFFF",
                      color: checked ? "#166534" : "#475569",
                      fontSize: 11.5,
                      fontWeight: checked ? 800 : 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    {checked ? "✓" : "+"} {item}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 18 }}>
            <label style={lStyle}>Special Notes / Requests</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Extra 15 mins warm up requested, balance to be paid before match starts..."
              rows={2}
              style={{ ...iStyle, resize: "vertical" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{ flex: 1, padding: "12px", borderRadius: 9, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              style={{ flex: 1.6, padding: "12px", borderRadius: 9, border: "none", background: "#166534", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer", fontFamily: "var(--font-head)" }}
            >
              {busy ? "Saving Booking..." : (booking ? "Update Booking" : "Confirm Booking")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
