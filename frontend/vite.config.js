import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { groqReply, sanitizeMessages } from "./server/siteChat.js";

function siteChatPlugin(apiKey) {
  return {
    name: "site-chat",
    configureServer(server) {
      server.middlewares.use("/api/chat", (req, res, next) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", async () => {
          res.setHeader("Content-Type", "application/json");
          if (!apiKey) {
            res.statusCode = 503;
            res.end(JSON.stringify({ error: "no_key" }));
            return;
          }
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            const messages = sanitizeMessages(body.messages);
            if (!messages.length || messages[messages.length - 1].role !== "user") {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "empty" }));
              return;
            }
            const reply = await groqReply(apiKey, messages);
            res.end(JSON.stringify({ reply }));
          } catch (err) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "groq", status: err.status || 0 }));
          }
        });
        req.on("error", next);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), siteChatPlugin(env.GROQ_API_KEY)],
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
        "/api": {
          target: "http://127.0.0.1:8000",
          bypass(req) {
            if (req.url?.startsWith("/api/chat")) return req.url;
          },
        },
        "/ws": {
          target: "ws://127.0.0.1:8000",
          ws: true,
        },
      },
    },
  };
});
