import { answerChat, sanitizeMessages, sanitizeSnapshot } from "../server/siteChat.js";

export const config = { runtime: "edge" };

const hits = new Map<string, { n: number; t: number }>();

function limited(ip: string) {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || now - row.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  row.n += 1;
  return row.n > 20;
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (limited(ip)) {
    return Response.json({ error: "limit" }, { status: 429 });
  }
  let body: { messages?: unknown; snapshot?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const messages = sanitizeMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "empty" }, { status: 400 });
  }
  const snapshot = sanitizeSnapshot(body.snapshot);
  const key = process.env.GROQ_API_KEY || "";
  try {
    const reply = await answerChat(key, messages, snapshot);
    if (!reply) {
      return Response.json({ error: "empty_reply" }, { status: 502 });
    }
    return Response.json({ reply, source: key ? "groq" : "local" });
  } catch {
    const fallback = await answerChat("", messages, snapshot);
    if (fallback) {
      return Response.json({ reply: fallback, source: "local" });
    }
    return Response.json({ error: "groq" }, { status: 502 });
  }
}
