import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { z } from "zod";
import { customAlphabet } from "nanoid";

const orderIdGen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

const CreateOrderBody = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(180).optional().or(z.literal("")),
  description: z.string().trim().min(1).max(2000),
  fabricType: z.string().trim().min(1).max(80),
  placement: z.string().trim().min(1).max(80),
  aiEnhancement: z.boolean().optional().default(false),
  designPath: z.string().trim().regex(/^\/objects\/.+/, "Invalid design path"),
  designFileName: z.string().trim().min(1).max(255),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateOrderBody.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const orderId = `MB-${orderIdGen()}`;
    const createdAt = new Date().toISOString();

    await db.insert(orders).values({
      orderId: orderId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      description: parsed.data.description,
      fabricType: parsed.data.fabricType,
      placement: parsed.data.placement,
      aiEnhancement: parsed.data.aiEnhancement,
      designPath: parsed.data.designPath,
      designFilename: parsed.data.designFileName,
      status: "received",
    });

    console.log(`Design order created: ${orderId}`);

    return NextResponse.json(
      {
        orderId,
        createdAt,
        designUrl: `/api/storage${parsed.data.designPath}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
