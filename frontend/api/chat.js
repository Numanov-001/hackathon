import { answerChat, sanitizeMessages, sanitizeSnapshot } from "../server/siteChat.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    res.status(400).json({ error: "bad_json" });
    return;
  }
  const messages = sanitizeMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    res.status(400).json({ error: "empty" });
    return;
  }
  try {
    const snapshot = sanitizeSnapshot(body.snapshot);
    const reply = await answerChat(process.env.GROQ_API_KEY || "", messages, snapshot);
    res.status(200).json({ reply: reply || "Hozir qisqa javob bera olmadim. Bozor yoki P2P haqida qayta so'rang." });
  } catch {
    res.status(200).json({
      reply: "Hozir model band. Bozor sahifasidagi narx va foizga qarang, yoki keyinroq yozing.",
    });
  }
}
