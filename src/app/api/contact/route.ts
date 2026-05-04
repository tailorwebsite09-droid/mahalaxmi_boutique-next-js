import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/schema";
import { z } from "zod";

const ContactBody = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(1).max(40),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ContactBody.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid contact data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    await db.insert(contacts).values({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    });

    return NextResponse.json({ stored: true }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error storing contact:", error);
    return NextResponse.json(
      { error: "Could not save your message" },
      { status: 500 }
    );
  }
}
