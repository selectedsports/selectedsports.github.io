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
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") ensureLatestVersion()
})

// Gracefully handle any Vite dynamic import chunk loading failure (e.g. after a deploy)
window.addEventListener("vite:preloadError", (event) => {
  console.warn("Dynamic import preload error, fetching fresh bundle:", event)
  const u = new URL(window.location.href)
  u.searchParams.set("_retry", String(Date.now()))
  window.location.replace(u.toString())
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
)
