import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

// Defensive: force dark background directly via inline style, which
// takes precedence over any stylesheet regardless of specificity/order.
document.documentElement.style.setProperty("background", "#F8FAF8", "important")
document.body.style.setProperty("background", "#F8FAF8", "important")

// Unregister any legacy service workers and clear cache storage
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister())
  }).catch(() => {})
}
if ("caches" in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name))
  }).catch(() => {})
}

// Detect if running an outdated bundle compared to the server build.
// If server has a newer version, immediately reload with a cache-busting param.
async function ensureLatestVersion() {
  try {
    const res = await fetch("/version.json?_cb=" + Date.now(), { cache: "no-store" })
    if (!res.ok) return
    const data = await res.json()
    if (data?.v && typeof __APP_BUILD_TIME__ !== "undefined" && data.v > __APP_BUILD_TIME__) {
      console.warn("New build detected on server. Reloading to latest:", data.v, ">", __APP_BUILD_TIME__)
      const u = new URL(window.location.href)
      u.searchParams.set("_v", String(data.v))
      window.location.replace(u.toString())
    }
  } catch {}
}
ensureLatestVersion()
setInterval(ensureLatestVersion, 30000)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") ensureLatestVersion()
})

// Gracefully handle any Vite dynamic import chunk loading failure (e.g. after a deploy)
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault()
  console.warn("Dynamic import preload error, fetching fresh bundle:", event)
  const lastReload = parseInt(sessionStorage.getItem("vite_preload_ts") || "0", 10)
  if (Date.now() - lastReload > 6000) {
    sessionStorage.setItem("vite_preload_ts", String(Date.now()))
    const u = new URL(window.location.href)
    u.searchParams.set("_v", String(Date.now()))
    window.location.replace(u.toString())
  }
})

// Catch unhandled dynamic chunk failures
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason?.message || String(event.reason || "")
  if (/dynamically imported|loading chunk|failed to fetch/i.test(reason)) {
    event.preventDefault()
    const lastReload = parseInt(sessionStorage.getItem("unhandled_chunk_ts") || "0", 10)
    if (Date.now() - lastReload > 6000) {
      sessionStorage.setItem("unhandled_chunk_ts", String(Date.now()))
      const u = new URL(window.location.href)
      u.searchParams.set("_v", String(Date.now()))
      window.location.replace(u.toString())
    }
  }
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
)
