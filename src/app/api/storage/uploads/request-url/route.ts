import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { supabase } from "@/lib/supabase";

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
    
    const ext = name.split('.').pop() || "bin";
    const objectName = `${Date.now()}-${idGen()}.${ext}`;
    const objectPath = `orders/${objectName}`;
    
    // Generate a signed URL for Supabase Storage
    const { data, error } = await supabase.storage
      .from("designs")
      .createSignedUploadUrl(objectPath);

    if (error) {
      console.error("Supabase Storage error:", error);
      throw error;
    }

    return NextResponse.json({
      uploadURL: data.signedUrl,
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
