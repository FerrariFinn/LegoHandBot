import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy für /api ist schon vorbereitet, damit spätere Fetch-/SSE-Calls
// vom Chat-UI zum Backend ohne CORS-Handstände funktionieren. Die
// tatsächliche Verdrahtung (useChatStream statt fakeStream) kommt erst
// mit der Baseline-Pipeline, siehe ticket-gesetzbuch-chatbot-v4.md.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
