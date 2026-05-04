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
      .from("products")
      .createSignedUploadUrl(objectPath);

    if (error) {
      console.error("Supabase Storage error:", error);
      return NextResponse.json({ 
        error: "Storage bucket 'products' not found. Please create it in your Supabase project.",
        needsSetup: true 
      }, { status: 400 });
    }

    return NextResponse.json({
      uploadURL: data.signedUrl,
      objectPath,
      metadata: { name, size, contentType },
    });
  } catch (error: any) {
    console.error("Error generating upload URL:", error);
    
    if (error?.message?.includes("Bucket not found") || error?.statusCode === "404") {
      return NextResponse.json({ 
        error: "Storage bucket 'products' not found. Please create it in your Supabase project.",
        needsSetup: true 
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
