import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

const h = (s) => createHash("sha256").update(String(s)).digest();
const str = (v, n) => (typeof v === "string" ? v.slice(0, n).trim() : "");
const img = (v) => (typeof v === "string" && v.startsWith("data:image/") ? v.slice(0, 60000) : undefined);

export default async (req) => {
  const store = getStore("heritage");

  if (req.method === "GET") {
    const d = await store.get("tree", { type: "json" });
    return Response.json(d || { people: null }, { headers: { "Cache-Control": "no-store" } });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (Number(req.headers.get("content-length") || 0) > 5_000_000) return new Response("Too large", { status: 413 });

  let body;
  try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }

  // Public: a relative sends a branch for review. It never touches the tree directly.
  if (body.submit) {
    const s = body.submit;
    if (s.website) return Response.json({ ok: true }); // hidden field: bots fill it, people do not
    const entry = {
      sid: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      at: new Date().toISOString(),
      rel: ["spouse", "parent", "claim"].includes(s.rel) ? s.rel : "child",
      anchor: str(s.anchor, 40), name: str(s.name, 120), note: str(s.note, 160),
      contact: str(s.contact, 120), spouse: str(s.spouse, 120),
      children: (Array.isArray(s.children) ? s.children : []).slice(0, 15).map((c) => str(c, 120)).filter(Boolean),
      photo: img(s.photo),
    };
    if (!entry.name || !entry.anchor) return new Response("Name and relation are required", { status: 400 });
    const pending = (await store.get("pending", { type: "json" })) || [];
    if (pending.length >= 60) return new Response("Too many entries are waiting. Please try again later.", { status: 429 });
    pending.push(entry);
    await store.setJSON("pending", pending);
    return Response.json({ ok: true });
  }

  // Admin only from here
  const real = Netlify.env.get("ADMIN_PASSWORD") || "";
  const given = req.headers.get("x-admin-password") || "";
  if (!real || !timingSafeEqual(h(given), h(real))) {
    await new Promise((r) => setTimeout(r, 600));
    return new Response("Wrong password", { status: 401 });
  }
  if (body.check) return Response.json({ ok: true });
  if (body.listPending) return Response.json({ pending: (await store.get("pending", { type: "json" })) || [] });
  if (body.removePending) {
    const left = ((await store.get("pending", { type: "json" })) || []).filter((e) => e.sid !== body.removePending);
    await store.setJSON("pending", left);
    return Response.json({ ok: true });
  }
  if (!Array.isArray(body.people) || body.people.length > 500) return new Response("Bad data", { status: 400 });
  const people = body.people.map((p) => ({
    id: str(p.id, 40), name: str(p.name, 120), note: str(p.note, 160),
    par: str(p.par, 40) || undefined, sp: str(p.sp, 40) || undefined, photo: img(p.photo),
  })).filter((p) => p.id && p.name);
  await store.setJSON("tree", { people });
  return Response.json({ ok: true });
};

export const config = { path: "/api/tree" };
