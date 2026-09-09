import { defineConfig } from "vite"
import { writeFileSync } from "fs"
import react from "@vitejs/plugin-react"

const buildTime = Date.now()

export default defineConfig({
  define: {
    __APP_BUILD_TIME__: buildTime,
  },
  plugins: [
    react(),
    {
      name: "write-version",
      closeBundle() {
        try { writeFileSync("dist/version.json", JSON.stringify({ v: buildTime })) } catch {}
      }
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react"
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase"
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons"
            }
          }
        }
      }
    }
  },
  base: "/",
})
