import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { customAlphabet } from "nanoid";

const idGen = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);

const RequestUploadUrlBody = z.object({
  name: z.string().min(1),
  size: z.number().int().positive(),
  contentType: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestUploadUrlBody.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const { name, size, contentType } = parsed.data;
    
    // Instead of Google Cloud Storage, we'll return a local API endpoint that will accept the PUT
    const ext = name.split('.').pop() || "bin";
    const objectName = `${Date.now()}-${idGen()}.${ext}`;
    const objectPath = `/objects/orders/${objectName}`;
    
    // For local dev, we provide a relative URL to our own API that handles PUT
    const uploadURL = `/api/storage${objectPath}`;

    return NextResponse.json({
      uploadURL,
      objectPath,
      metadata: { name, size, contentType },
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
