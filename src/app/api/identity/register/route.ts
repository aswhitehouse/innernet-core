import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createUser,
} from "@/lib/identityStore";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name : "";
    const { token, user } = await createUser(name);
    const res = NextResponse.json({
      ok: true,
      token, // client can show once; cookie is also set
      name: user.name,
      lastSession: user.lastSession,
    });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Register failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
