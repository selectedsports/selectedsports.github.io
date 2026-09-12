import React from "react"

export default function ConflictResolutionModal({
  conflictData,
  onKeepDevice,
  onKeepServer,
  onCancel,
}) {
  if (!conflictData) return null

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.8)", zIndex: 11000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#FFFFFF", width: "100%", maxWidth: 440, borderRadius: 16, overflow: "hidden", color: "#0F172A", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "14px 18px", background: "#DC2626", color: "#FFFFFF" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>⚠️ Delivery Sync Conflict</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.9 }}>
            Another scorer or device has submitted deliveries for this over (FR-10.5).
          </p>
        </div>

        <div style={{ padding: 18 }}>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px" }}>
            The server already holds a different delivery sequence. Choose which version to retain:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={onKeepDevice}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "2px solid #166534",
                background: "rgba(22,101,52,0.08)",
                color: "#166534",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              📱 Keep This Device's Deliveries
              <span style={{ display: "block", fontSize: 11, color: "#64748B", fontWeight: 600, marginTop: 2 }}>
                Overwrites server with your local deliveries.
              </span>
            </button>

            <button
              onClick={onKeepServer}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #CBD5E1",
                background: "#F8FAFC",
                color: "#334155",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              ☁️ Keep Server Version
              <span style={{ display: "block", fontSize: 11, color: "#64748B", fontWeight: 600, marginTop: 2 }}>
                Discards local unsynced edits and pulls latest server score.
              </span>
            </button>
          </div>
        </div>

        <div style={{ padding: "12px 18px", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", textAlign: "right" }}>
          <button
            onClick={onCancel}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#64748B", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
          >
            Review Later
          </button>
        </div>
      </div>
    </div>
  )
}
