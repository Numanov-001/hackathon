import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { answerChat, sanitizeMessages, sanitizeSnapshot } from "./server/siteChat.js";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(frontendRoot, ".env");
const exampleFile = path.join(frontendRoot, ".env.example");
if (!fs.existsSync(envFile) && fs.existsSync(exampleFile)) {
  fs.copyFileSync(exampleFile, envFile);
}

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
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            const messages = sanitizeMessages(body.messages);
            if (!messages.length || messages[messages.length - 1].role !== "user") {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "empty" }));
              return;
            }
            const snapshot = sanitizeSnapshot(body.snapshot);
            const reply = await answerChat(apiKey, messages, snapshot);
            if (!reply) {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: "empty_reply" }));
              return;
            }
            res.end(JSON.stringify({ reply }));
          } catch {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: "groq" }));
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
