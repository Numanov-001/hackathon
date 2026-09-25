import { useState } from "react";
import { postJson } from "../api/client";

const SUGGESTIONS = [
  "Where is tomato cheapest?",
  "Show best offers",
  "Will tomato price rise?",
  "Find 2 tons in Namangan",
];

export default function AIAssistant() {
  const [message, setMessage] = useState("Find 2 tons of tomato under 5000 UZS in Namangan");
  const [log, setLog] = useState([]);
  const [intent, setIntent] = useState(null);

  async function send(text) {
    const query = (text || message).trim();
    if (!query) return;
    setLog((current) => [...current, { role: "user", text: query }]);
    try {
      const data = await postJson("/api/chat", { message: query });
      setIntent(data.intent);
      setLog((current) => [...current, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setLog((current) => [...current, { role: "assistant", text: String(error) }]);
    }
  }

  return (
    <section className="rail-block" id="ai">
      <h3>Assistant</h3>
      <div className="chat-log">
        {log.map((item, index) => (
          <div key={index} className="bubble">{item.text}</div>
        ))}
      </div>
      {intent?.product && (
        <div className="disclaimer" style={{ padding: "0 0 8px" }}>
          Detected: {intent.product} · {intent.volume || "—"} kg · {intent.region || "any"} · ≤ {intent.max_price || "—"}
        </div>
      )}
      <div className="chips">
        {SUGGESTIONS.map((item) => (
          <button key={item} className="chip" onClick={() => send(item)}>{item}</button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="field"
        style={{ marginTop: 8 }}
      >
        <span>Question</span>
        <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
        <button className="btn" type="submit">Interpret and search</button>
      </form>
    </section>
  );
}
