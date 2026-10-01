const API = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function readError(res) {
  const text = await res.text();
  try {
    const body = JSON.parse(text);
    if (body && typeof body.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) {
      const first = body.detail[0];
      if (first && typeof first.msg === "string") return first.msg;
    }
  } catch {
    /* keep the raw body */
  }
  if (!text || /proxy error|ECONNREFUSED|Bad Gateway/i.test(text)) {
    return "Server ishlamayapti. Backendni yoqing (port 8000).";
  }
  return text.slice(0, 200);
}

function headers(token) {
  const next = { "Content-Type": "application/json" };
  if (token) next.Authorization = `Bearer ${token}`;
  return next;
}

async function request(path, init) {
  let res;
  try {
    res = await fetch(`${API}${path}`, init);
  } catch {
    throw new Error("Server ishlamayapti. Backendni yoqing (port 8000).");
  }
  if (!res.ok) throw new Error(await readError(res));
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function getJson(path, token) {
  return request(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function postJson(path, body, token) {
  return request(path, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(body),
  });
}

export async function patchJson(path, body, token) {
  return request(path, {
    method: "PATCH",
    headers: headers(token),
    body: JSON.stringify(body),
  });
}

export async function deleteJson(path, token) {
  return request(path, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
