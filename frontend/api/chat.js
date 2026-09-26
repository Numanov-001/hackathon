import { answerChat, sanitizeMessages, sanitizeSnapshot } from "../server/siteChat.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const messages = sanitizeMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    res.status(400).json({ error: "empty" });
    return;
  }
  const snapshot = sanitizeSnapshot(body.snapshot);
  const reply = await answerChat(process.env.GROQ_API_KEY || "", messages, snapshot);
  res.status(200).json({ reply: reply || "Sayt tahlili hozir ochilmadi. Grafikdagi narx va foizga qarang." });
}
