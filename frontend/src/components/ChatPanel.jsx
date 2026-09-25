import { useState } from "react";
import { postJson } from "../api/client";

export default function ChatPanel() {
  const [message, setMessage] = useState("Мне нужно 2 тонны помидоров в Намангане дешевле 5000");
  const [log, setLog] = useState([]);

  async function send(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setLog((current) => [...current, { role: "user", text }]);
    try {
      const data = await postJson("/api/chat", { message: text });
      const extra = data.intent?.product
        ? ` Intent: ${data.intent.product} / ${data.intent.region || "any"} / ${data.intent.volume || "-"} kg`
        : "";
      setLog((current) => [...current, { role: "assistant", text: `${data.reply}${extra}` }]);
    } catch (error) {
      setLog((current) => [...current, { role: "assistant", text: String(error) }]);
    }
  }

  return (
    <div className="card">
      <h2>AI assistant</h2>
      <p className="disclaimer">LLM интерпретирует запрос. Цену он не считает и не является источником прайса.</p>
      <div className="chat">
        {log.map((item, index) => (
          <div key={index} className={`bubble ${item.role}`}>
            {item.text}
          </div>
        ))}
      </div>
      <form onSubmit={send}>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit">Спросить</button>
      </form>
    </div>
  );
}
