import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

// Defensive: force dark background directly via inline style, which
// takes precedence over any stylesheet regardless of specificity/order.
document.documentElement.style.setProperty("background", "#F8FAF8", "important")
document.body.style.setProperty("background", "#F8FAF8", "important")

// Unregister any legacy service workers once
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister())
  }).catch(() => {})
}

// Gracefully handle any Vite dynamic import chunk loading failure (e.g. after a deploy)
window.addEventListener("vite:preloadError", (event) => {
  const key = "ss_chunk_err_" + (event?.payload?.message || "retry")
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, "1")
    window.location.reload()
  }
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
)
