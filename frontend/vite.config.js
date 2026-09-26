import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ["**/.chrome-profile/**"],
    },
    proxy: {
      "/siat": {
        target: "https://siat.stat.uz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/siat/, ""),
      },
      "/health": "http://127.0.0.1:8000",
      "/api": "http://127.0.0.1:8000",
      "/ws": {
        target: "ws://127.0.0.1:8000",
        ws: true,
      },
    },
  },
});
