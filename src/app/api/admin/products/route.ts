import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { requireAdmin } from "@/lib/server-admin-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { customAlphabet } from "nanoid";

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
    
    // Save locally
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, objectName);
    await writeFile(filePath, buffer);
    
    const imageUrl = `/uploads/products/${objectName}`;

    const [newProduct] = await db.insert(products).values({
      imageUrl,
      price: price.toString(),
    }).returning();

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Could not save the design" }, { status: 500 });
  }
}
