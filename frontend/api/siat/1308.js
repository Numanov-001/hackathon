import { writeSiat1308 } from "../../server/siatProxy.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ detail: "GET kerak." });
    return;
  }
  await writeSiat1308(res);
}
