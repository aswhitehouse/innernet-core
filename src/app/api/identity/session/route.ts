import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getUserByToken } from "@/lib/identityStore";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** POST body: { token } — validates token, sets cookie, returns user payload */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "Token required" }, { status: 400 });
  }
  const user = await getUserByToken(token);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unknown token" }, { status: 401 });
  }
  const res = NextResponse.json({
    ok: true,
    name: user.name,
    lastSession: user.lastSession,
    preferences: user.preferences,
  });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
