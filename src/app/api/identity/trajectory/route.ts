import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, recordSessionTrajectory } from "@/lib/identityStore";

/** POST — body { mode, summary }; requires cookie */
export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "Not identified" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const mode = typeof body?.mode === "string" ? body.mode : "";
  const summary = typeof body?.summary === "string" ? body.summary : "";
  if (!mode || !summary) {
    return NextResponse.json(
      { ok: false, error: "mode and summary required" },
      { status: 400 }
    );
  }
  await recordSessionTrajectory(token, mode.slice(0, 32), summary.slice(0, 280));
  return NextResponse.json({ ok: true });
}
