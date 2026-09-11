import { env } from "cloudflare:workers";

const OVERRIDE_CODE = "VARUNI4415";

async function ensureResetState() {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS reset_state (id INTEGER PRIMARY KEY, generation INTEGER NOT NULL DEFAULT 0)",
  ).run();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO reset_state (id, generation) VALUES (1, 0)",
  ).run();
}

export async function GET() {
  await ensureResetState();
  const row = await env.DB.prepare(
    "SELECT generation FROM reset_state WHERE id = 1",
  ).first<{ generation: number }>();
  return Response.json({ generation: row?.generation ?? 0 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { code?: string } | null;
  if (body?.code?.toUpperCase().trim() !== OVERRIDE_CODE) {
    return Response.json({ error: "Controller code not recognized" }, { status: 403 });
  }
  await ensureResetState();
  await env.DB.prepare(
    "UPDATE reset_state SET generation = generation + 1 WHERE id = 1",
  ).run();
  const row = await env.DB.prepare(
    "SELECT generation FROM reset_state WHERE id = 1",
  ).first<{ generation: number }>();
  return Response.json({ generation: row?.generation ?? 0 });
}
