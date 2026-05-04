import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const isAdminConfigured: boolean = Boolean(SESSION_SECRET && ADMIN_PASSWORD);

export function generateAdminToken(): string {
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET not configured");
  return createHmac("sha256", SESSION_SECRET).update("mahalaxmi:admin").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function verifyPassword(candidate: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  return safeEqual(candidate, ADMIN_PASSWORD);
}

export function verifyAdminToken(token: string): boolean {
  if (!SESSION_SECRET) return false;
  try {
    return safeEqual(token, generateAdminToken());
  } catch {
    return false;
  }
}

/** Extract bearer token from request and return 401 response if invalid. */
export function requireAdmin(
  req: NextRequest,
): NextResponse | null {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
