import { useState, useRef, useEffect } from "react"
import { useMobile } from "../hooks/useMobile.js"
import {
  Download, Printer, Share2, X, Check, ShieldCheck, Award,
  Sparkles, QrCode, Phone, MapPin, Calendar, Tag
} from "lucide-react"
import { Logo } from "./ui.jsx"

export default function PlayerIdCardModal({ player, onClose, isAuction = false }) {
  const isMobile = useMobile()
  const [wearMode, setWearMode] = useState(true) // true = lanyard hanging view, false = clean card view
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef(null)

  if (!player) return null

  const pId = String(player.id || "0000").slice(-6).toUpperCase()
  const pName = player.name || "Cricket Player"
  const pRole = player.playing_role || player.role || "All-rounder"
  const pCity = player.city || "Pune"
  const pJersey = player.jersey_number ? `#${player.jersey_number}` : "—"
  const pSize = player.jersey_size || "M"
  const pDob = player.birth_date ? new Date(player.birth_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"
  const pPhone = player.phone ? player.phone.slice(-10) : ""
  const verificationUrl = `${window.location.origin}/#/id-card/${player.id}`

  // Share on WhatsApp
  const handleShareWhatsApp = () => {
    const text = `🏏 *SELECTED SPORTS - OFFICIAL PLAYER ID CARD*\n` +
      `👤 *Name:* ${pName}\n` +
      `🏅 *Player ID:* #SS-${pId}\n` +
      `⚡ *Playing Role:* ${pRole}\n` +
      `👕 *Jersey:* ${pJersey} (${pSize})\n` +
      `📍 *City:* ${pCity}\n` +
      `✅ *Accreditation:* Verified Tournament Player\n` +
      `🌐 *Digital Pass:* ${verificationUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  // Print ID Card
  const handlePrint = () => {
    window.print()
  }

  // Download high-resolution PNG of the card using Canvas
  const handleDownload = () => {
    setDownloading(true)
    try {
      const W = 600
      const H = 940
      const canvas = document.createElement("canvas")
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext("2d")

      // Card Background Gradient
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, "#0F172A")
      grad.addColorStop(0.5, "#162235")
      grad.addColorStop(1, "#0A0F1D")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)

      // Top green header
      const topGrad = ctx.createLinearGradient(0, 0, W, 0)
      topGrad.addColorStop(0, "#166534")
      topGrad.addColorStop(1, "#15803D")
      ctx.fillStyle = topGrad
      ctx.fillRect(0, 0, W, 140)

      // Gold Accent Line
      ctx.fillStyle = "#F59E0B"
      ctx.fillRect(0, 140, W, 5)

      // Header Text
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 26px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("SELECTED SPORTS", W / 2, 55)

      ctx.fillStyle = "#86EFAC"
      ctx.font = "bold 13px sans-serif"
      ctx.fillText("OFFICIAL PLAYER ACCREDITATION PASS", W / 2, 85)

      ctx.fillStyle = "#FEF08A"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText("SEASON 2026 • VERIFIED IDENTITY", W / 2, 110)

      // Card Punch Hole simulation (if in wear mode)
      ctx.fillStyle = "#000000"
      ctx.beginPath()
      ctx.roundRect(W / 2 - 40, 10, 80, 14, 7)
      ctx.fill()

      // Function to finish text drawing
      const finishDrawing = (photoImg) => {
        // Photo Box
        const photoY = 175
        const photoSize = 180
        const photoX = W / 2 - photoSize / 2

        ctx.fillStyle = "#166534"
        ctx.beginPath()
        ctx.roundRect(photoX - 4, photoY - 4, photoSize + 8, photoSize + 8, 20)
        ctx.fill()

        if (photoImg) {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(photoX, photoY, photoSize, photoSize, 16)
          ctx.clip()
          ctx.drawImage(photoImg, photoX, photoY, photoSize, photoSize)
          ctx.restore()
        } else {
          ctx.fillStyle = "#1E293B"
          ctx.beginPath()
          ctx.roundRect(photoX, photoY, photoSize, photoSize, 16)
          ctx.fill()
          ctx.fillStyle = "#22C55E"
          ctx.font = "bold 70px sans-serif"
          ctx.fillText(pName.charAt(0).toUpperCase(), W / 2, photoY + 115)
        }

        // Verified Stamp Badge on Photo
        ctx.fillStyle = "#22C55E"
        ctx.beginPath()
        ctx.roundRect(W / 2 - 60, photoY + photoSize - 16, 120, 32, 16)
        ctx.fill()
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 13px sans-serif"
        ctx.fillText("✓ VERIFIED", W / 2, photoY + photoSize + 5)

        // Player Name
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "bold 32px sans-serif"
        ctx.fillText(pName.toUpperCase(), W / 2, photoY + photoSize + 60)

        // Role & Jersey Pill
        ctx.fillStyle = "rgba(34, 197, 94, 0.2)"
        ctx.beginPath()
        ctx.roundRect(W / 2 - 130, photoY + photoSize + 78, 260, 36, 18)
        ctx.fill()
        ctx.strokeStyle = "#22C55E"
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = "#4ADE80"
        ctx.font = "bold 15px sans-serif"
        ctx.fillText(`🏏 ${pRole}  •  JERSEY ${pJersey} (${pSize})`, W / 2, photoY + photoSize + 102)

        // Details Grid Box
        const gridY = photoY + photoSize + 135
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)"
        ctx.beginPath()
        ctx.roundRect(40, gridY, W - 80, 180, 16)
        ctx.fill()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Details Rows
        ctx.textAlign = "left"
        const rows = [
          ["PLAYER ID", `#SS-${pId}`, "CITY", pCity],
          ["DATE OF BIRTH", pDob, "BLOOD / MED", "A+ Verified"],
          ["MEMBERSHIP", "Tournament Active", "REGISTERED", "2026 Season"]
        ]

        rows.forEach((r, idx) => {
          const y = gridY + 36 + idx * 52
          // Col 1
          ctx.fillStyle = "#94A3B8"
          ctx.font = "bold 11px sans-serif"
          ctx.fillText(r[0], 65, y)
          ctx.fillStyle = "#FFFFFF"
          ctx.font = "bold 16px sans-serif"
          ctx.fillText(r[1], 65, y + 20)

          // Col 2
          ctx.fillStyle = "#94A3B8"
          ctx.font = "bold 11px sans-serif"
          ctx.fillText(r[2], W / 2 + 30, y)
          ctx.fillStyle = "#FFFFFF"
          ctx.font = "bold 16px sans-serif"
          ctx.fillText(r[3], W / 2 + 30, y + 20)
        })

        // Security Barcode & Footer
        const footerY = H - 110
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
        ctx.beginPath()
        ctx.moveTo(40, footerY)
        ctx.lineTo(W - 40, footerY)
        ctx.stroke()

        // Barcode lines
        ctx.fillStyle = "#FFFFFF"
        for (let i = 0; i < 50; i++) {
          const bx = 60 + i * 8
          const bw = (i % 3 === 0) ? 4 : (i % 2 === 0 ? 2 : 1)
          ctx.fillRect(bx, footerY + 14, bw, 36)
        }

        ctx.textAlign = "right"
        ctx.fillStyle = "#F59E0B"
        ctx.font = "bold 14px sans-serif"
        ctx.fillText("OFFICIAL PLAYER PASS", W - 60, footerY + 30)
        ctx.fillStyle = "#94A3B8"
        ctx.font = "11px sans-serif"
        ctx.fillText("SELECTEDSPORTS.GITHUB.IO", W - 60, footerY + 48)

        // Trigger download
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.download = `Player_ID_Card_${pName.replace(/\s+/g, "_")}.png`
          a.href = url
          a.click()
          URL.revokeObjectURL(url)
          setDownloading(false)
        }, "image/png")
      }

      if (player.profile_image_url) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => finishDrawing(img)
        img.onerror = () => finishDrawing(null)
        img.src = player.profile_image_url
      } else {
        finishDrawing(null)
      }
    } catch (e) {
      console.error("Download card error:", e)
      alert("Could not generate image download. You can take a screenshot or print.")
      setDownloading(false)
    }
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.85)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "12px" : "24px",
      overflowY: "auto"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>

        {/* Top Control Bar */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          color: "#FFFFFF"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏷️</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, fontFamily: "var(--font-head)" }}>
                Official Player ID Card
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>
                Accreditation & Match Pass
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setWearMode(w => !w)}
              style={{
                background: wearMode ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.1)",
                border: wearMode ? "1.5px solid #22C55E" : "1px solid rgba(255, 255, 255, 0.2)",
                color: wearMode ? "#4ADE80" : "#FFFFFF",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5
              }}
            >
              <span>{wearMode ? "📿 Lanyard View" : "💳 Card View"}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#FFFFFF",
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── WEARABLE LANYARD STRAP SIMULATION ── */}
        {wearMode && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            animation: "fadeIn 200ms ease"
          }}>
            {/* Lanyard Neck Ribbon */}
            <div style={{
              width: 38,
              height: 48,
              background: "repeating-linear-gradient(45deg, #166534, #166534 8px, #14532D 8px, #14532D 16px)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
              borderLeft: "1px solid rgba(255,255,255,0.2)",
              borderRight: "1px solid rgba(255,255,255,0.2)",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: "#86EFAC",
                fontWeight: 900,
                letterSpacing: 1,
                transform: "rotate(90deg)",
                whiteSpace: "nowrap"
              }}>
                SELECTED SPORTS
              </div>
            </div>

            {/* Metal Swivel Hook / Clip */}
            <div style={{
              width: 22,
              height: 18,
              background: "linear-gradient(180deg, #CBD5E1 0%, #64748B 50%, #94A3B8 100%)",
              borderRadius: "4px 4px 8px 8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
              border: "1px solid #94A3B8",
              marginBottom: -4,
              zIndex: 2
            }} />
            <div style={{
              width: 10,
              height: 14,
              border: "3px solid #CBD5E1",
              borderTop: "none",
              borderRadius: "0 0 6px 6px",
              marginBottom: -6,
              zIndex: 3
            }} />
          </div>
        )}

        {/* ── THE WEARABLE ID CARD (DOM PRINTABLE ELEMENT) ── */}
        <div
          ref={cardRef}
          style={{
            width: "100%",
            background: "linear-gradient(155deg, #0F172A 0%, #1E293B 60%, #0B1120 100%)",
            borderRadius: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)",
            color: "#FFFFFF",
            position: "relative",
            overflow: "hidden",
            padding: "20px 20px 18px",
            boxSizing: "border-box"
          }}
        >
          {/* Card Punch-Hole for Lanyard */}
          {wearMode && (
            <div style={{
              width: 60,
              height: 12,
              background: "#090D16",
              borderRadius: 8,
              margin: "-6px auto 14px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.1)"
            }} />
          )}

          {/* Top Brand Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            paddingBottom: 12,
            marginBottom: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #166534 0%, #22C55E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16
              }}>
                🏏
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, fontFamily: "var(--font-head)", letterSpacing: 0.5 }}>
                  SELECTED SPORTS
                </div>
                <div style={{ fontSize: 9.5, color: "#86EFAC", fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  Player Accreditation ID
                </div>
              </div>
            </div>

            <div style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#4ADE80",
              fontSize: 10,
              fontWeight: 900,
              padding: "3px 8px",
              borderRadius: 6,
              letterSpacing: 0.5
            }}>
              2026 OFFICIAL
            </div>
          </div>

          {/* Photo & Main Identity */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {player.profile_image_url ? (
                <img
                  src={player.profile_image_url}
                  alt={pName}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 18,
                    objectFit: "cover",
                    border: "3px solid #22C55E",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.5)"
                  }}
                />
              ) : (
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: 18,
                  background: "#166534",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 900,
                  border: "3px solid #22C55E",
                  color: "#FFFFFF"
                }}>
                  {pName.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#22C55E",
                color: "#FFFFFF",
                fontSize: 9,
                fontWeight: 900,
                padding: "2px 7px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
              }}>
                ✓ VERIFIED
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 18,
                fontWeight: 900,
                fontFamily: "var(--font-head)",
                color: "#FFFFFF",
                lineHeight: 1.2,
                marginBottom: 4,
                wordBreak: "break-word"
              }}>
                {pName}
              </div>

              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "rgba(34,197,94,0.18)",
                color: "#4ADE80",
                fontSize: 11,
                fontWeight: 800,
                padding: "3px 9px",
                borderRadius: 6,
                marginBottom: 6
              }}>
                🏏 {pRole}
              </div>

              <div style={{ fontSize: 11, color: "#94A3B8", display: "flex", flexDirection: "column", gap: 2 }}>
                <div>📍 {pCity}</div>
                {pPhone && <div>📱 +91 {pPhone.slice(0, 5)}•••{pPhone.slice(-2)}</div>}
              </div>
            </div>
          </div>

          {/* Details Table Grid */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            padding: "10px 14px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 14
          }}>
            <div>
              <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700 }}>PLAYER ID</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#FEF08A", fontFamily: "var(--font-head)" }}>
                #SS-{pId}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700 }}>JERSEY SPEC</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-head)" }}>
                {pJersey} ({pSize})
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700 }}>DATE OF BIRTH</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1" }}>
                {pDob}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 700 }}>STATUS</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#4ADE80" }}>
                Tagged &amp; Active
              </div>
            </div>
          </div>

          {/* Hologram & QR Verification Strip */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            borderTop: "1px dashed rgba(255,255,255,0.15)",
            fontSize: 10,
            color: "#94A3B8"
          }}>
            {/* Foil Hologram Simulation */}
            <div style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #B45309 100%)",
              color: "#0F172A",
              padding: "3px 8px",
              borderRadius: 6,
              fontWeight: 900,
              fontSize: 9,
              letterSpacing: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}>
              <span>🛡️ OFFICIAL HOLOGRAM</span>
            </div>

            <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 10, color: "#CBD5E1" }}>
              MATCH-READY PASS
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginTop: 16
        }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              padding: "12px 10px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #166534 0%, #15803D 100%)",
              color: "#FFFFFF",
              border: "none",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              boxShadow: "0 4px 12px rgba(22,101,52,0.3)"
            }}
          >
            <Download size={17} />
            <span>{downloading ? "Saving..." : "Download"}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            style={{
              padding: "12px 10px",
              borderRadius: 12,
              background: "#25D366",
              color: "#FFFFFF",
              border: "none",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
              boxShadow: "0 4px 12px rgba(37,211,102,0.3)"
            }}
          >
            <Share2 size={17} />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: "12px 10px",
              borderRadius: 12,
              background: "#FFFFFF",
              color: "#0F172A",
              border: "1.5px solid #CBD5E1",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5
            }}
          >
            <Printer size={17} />
            <span>Print Badge</span>
          </button>
        </div>

      </div>
    </div>
  )
}
