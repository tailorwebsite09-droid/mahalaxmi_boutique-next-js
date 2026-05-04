import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { requireAdmin } from "@/lib/server-admin-auth";
import { customAlphabet } from "nanoid";
import { supabase } from "@/lib/supabase";

const idGen = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const priceRaw = formData.get("price") as string | null;

    if (!image) {
      return NextResponse.json({ error: "An image file is required" }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(image.type)) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
    }

    const ext = image.type.split("/")[1] === "jpeg" ? "jpg" : image.type.split("/")[1];
    const objectName = `${Date.now()}-${idGen()}.${ext}`;
    const objectPath = `products/${objectName}`;
    
    // Upload to Supabase Storage
    const buffer = await image.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(objectPath, buffer, {
        contentType: image.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Storage upload error:", uploadError);
      return NextResponse.json({ 
        error: "Storage bucket 'products' not found. Please create it in Supabase Storage dashboard.",
        needsSetup: true 
      }, { status: 400 });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(objectPath);

    const [newProduct] = await db.insert(products).values({
      imageUrl: publicUrl,
      price: price.toString(),
    }).returning();

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    
    // Check if it's a bucket missing error
    if (error?.message?.includes("Bucket not found") || error?.statusCode === "404") {
      return NextResponse.json({ 
        error: "Storage bucket 'products' not found. Please create it in your Supabase project.",
        needsSetup: true 
      }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not save the design" }, { status: 500 });
  }
}
