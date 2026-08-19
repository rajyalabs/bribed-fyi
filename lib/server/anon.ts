import { cookies } from "next/headers";
import { sha256 } from "./db";

const COOKIE = "bfa"; // anonymous voter token

/** Returns a stable, hashed anonymous id from a cookie; sets the cookie if missing. */
export async function anonHash(): Promise<string> {
  const jar = await cookies();
  let token = jar.get(COOKIE)?.value;
  if (!token || token.length < 16) {
    token = crypto.randomUUID();
    jar.set(COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }
  return sha256(`anon:${token}`);
}
