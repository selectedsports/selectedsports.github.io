import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

// PWA fully removed. Clean up any previously-installed service workers & caches
// so users who installed the old PWA get the fresh web version.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister())
  }).catch(() => {})
}
if (window.caches && caches.keys) {
  caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {})
}

// Auto-update: when a new version is deployed, reload once to get it.
async function checkVersion() {
  try {
    const res = await fetch("/version.json?t=" + Date.now(), { cache: "no-store" })
    if (!res.ok) return
    const { v } = await res.json()
    const seen = localStorage.getItem("ss_version")
    if (seen && seen !== String(v)) {
      localStorage.setItem("ss_version", String(v))
      location.reload()
    } else {
      localStorage.setItem("ss_version", String(v))
    }
  } catch {}
}
setTimeout(checkVersion, 5000) // delay first check so it can't race the initial session-restore render
setInterval(checkVersion, 60000)
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkVersion() })

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
)
