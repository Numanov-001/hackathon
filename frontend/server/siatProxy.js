const SIAT_1308_URL = "https://siat.stat.uz/api/sdmx/1308/table/";
const TTL_MS = 30 * 60 * 1000;

let cache = { at: 0, status: 0, body: "" };

export async function fetchSiat1308Table() {
  const now = Date.now();
  if (cache.body && now - cache.at < TTL_MS) {
    return { status: cache.status, body: cache.body };
  }
  const response = await fetch(SIAT_1308_URL, {
    headers: { Accept: "application/json" },
  });
  const body = await response.text();
  cache = { at: Date.now(), status: response.status, body };
  return { status: response.status, body };
}

export async function writeSiat1308(res) {
  try {
    const { status, body } = await fetchSiat1308Table();
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=1800");
    res.end(body);
  } catch {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ detail: "SIAT ulanmadi." }));
  }
}
