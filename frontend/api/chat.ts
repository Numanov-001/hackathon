import { groqReply, sanitizeMessages } from "../server/siteChat.js";

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
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return Response.json({ error: "no_key" }, { status: 503 });
  }
  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  const messages = sanitizeMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "empty" }, { status: 400 });
  }
  try {
    const reply = await groqReply(key, messages);
    return Response.json({ reply });
  } catch (err) {
    const status = err && typeof err === "object" && "status" in err ? Number(err.status) : 0;
    return Response.json({ error: "groq", status }, { status: 502 });
  }
}
