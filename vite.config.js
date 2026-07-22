import { defineConfig } from "vite"
import { writeFileSync } from "fs"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [
    react(),
    {
      name: "write-version",
      closeBundle() {
        try { writeFileSync("dist/version.json", JSON.stringify({ v: Date.now() })) } catch {}
      }
    },
  ],
  base: "/",
})
