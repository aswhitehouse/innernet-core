import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getUserByToken } from "@/lib/identityStore";

/** GET — cookie only; returns 401 if missing/invalid */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const user = await getUserByToken(token);
  if (!user) {
    const res = NextResponse.json({ ok: false }, { status: 401 });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
  return NextResponse.json({
    ok: true,
    name: user.name,
    lastSession: user.lastSession,
    preferences: user.preferences,
  });
}
