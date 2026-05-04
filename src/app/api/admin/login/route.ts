import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAdminToken, verifyPassword, isAdminConfigured } from "@/lib/server-admin-auth";

const LoginBody = z.object({
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Admin login not configured on the server" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const parsed = LoginBody.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!verifyPassword(parsed.data.password)) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ token: generateAdminToken() });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
