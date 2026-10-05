import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const h = (s) => createHash("sha256").update(String(s)).digest();
const str = (v, n) => (typeof v === "string" ? v.slice(0, n) : undefined);

export default async (req) => {
  const store = getStore("heritage");

  if (req.method === "GET") {
    const d = await store.get("tree", { type: "json" });
    return Response.json(d || { people: null }, { headers: { "Cache-Control": "no-store" } });
  }

  if (req.method === "POST") {
    const real = Netlify.env.get("ADMIN_PASSWORD") || "";
    const given = req.headers.get("x-admin-password") || "";
    if (!real || !timingSafeEqual(h(given), h(real))) {
      await new Promise((r) => setTimeout(r, 600)); // slow down guessing
      return new Response("Wrong password", { status: 401 });
    }
    let body;
    try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }
    if (body.check) return Response.json({ ok: true });
    if (!Array.isArray(body.people) || body.people.length > 500) return new Response("Bad data", { status: 400 });

    const people = body.people.map((p) => ({
      id: str(p.id, 40), name: str(p.name, 120), note: str(p.note, 160),
      par: str(p.par, 40), sp: str(p.sp, 40),
      photo: typeof p.photo === "string" && p.photo.startsWith("data:image/") ? p.photo.slice(0, 60000) : undefined,
    })).filter((p) => p.id && p.name);

    await store.setJSON("tree", { people });
    return Response.json({ ok: true });
  }
  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/tree" };
