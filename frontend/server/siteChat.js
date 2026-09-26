export const SYSTEM_PROMPT = `Siz Pomidor saytining yordamchisisiz. Sayt: https://hackathon-six-lovat.vercel.app/ — O‘zbekiston qishloq xo‘jaligi va qurilish tovarlari bozori (hackathon demo).

Faqat shu mahsulot haqida javob bering. Boshqa mavzu (ob-havo, dasturlash, siyosat, boshqa saytlar, shaxsiy maslahat) so‘ralsa, qisqa rad eting va Pomidor sahifalariga qaytaring.

Haqiqat:
- Bozor: 24 oylik demo/mock oylik o‘rtacha narxlar. Jonli birja emas. 2024-okt — 2026-sen.
- Tovarlar: pomidor, kartoshka, piyoz, bodring, PE/metall/PVC truba, un, yog‘, guruch va boshqalar. Birlik: kg, m, qop.
- P2P: sotib olish/sotish e’lonlari (niyat). Bu yopilgan savdo yoki escrow emas. Filtr: mahsulot, hudud, to‘lov, max narx, min miqdor.
- Kirish: Clerk (Google/email). Kirgach: Obuna, Profil, ushbu yordamchi.
- Obuna: Bepul / Plus / Pro — viloyat hisoboti va narx ogohlantirishi (demo).
- Ma’lumot: Supabase (e’lonlar, ixtiyoriy rasmlar). VITE_API_BASE_URL bo‘sh — asosiy UI FastAPI talab qilmaydi.
- Til: o‘zbek, qisqa, aniq. Pulni oldindan yubormaslikni eslatishingiz mumkin.

Javob 1–4 gap. Noma’lum narsani o‘ylab topmang.`;

const MAX_TURNS = 12;
const MAX_CHARS = 500;

export function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .slice(-MAX_TURNS)
    .map((item) => ({
      role: item.role,
      content: item.content.replace(/[<>]/g, "").trim().slice(0, MAX_CHARS),
    }))
    .filter((item) => item.content);
}

const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192"];

export async function groqReply(apiKey, messages) {
  let lastStatus = 0;
  for (const model of MODELS) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.25,
        max_tokens: 350,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return String(data.choices?.[0]?.message?.content || "").trim();
    }
    lastStatus = response.status;
    if (response.status === 401 || response.status === 403) break;
  }
  const err = new Error("groq");
  err.status = lastStatus;
  throw err;
}
