const API = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function readError(res) {
  const text = await res.text();
  try {
    const body = JSON.parse(text);
    if (body && typeof body.detail === "string") return body.detail;
  } catch {
    /* keep the raw body */
  }
  return text || "So‘rov bajarilmadi.";
}

function headers(token) {
  const next = { "Content-Type": "application/json" };
  if (token) next.Authorization = `Bearer ${token}`;
  return next;
}

export async function getJson(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function postJson(path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
