import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { requireAdmin } from "@/lib/server-admin-auth";
import { eq } from "drizzle-orm";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const productId = Number(id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const [existing] = await db
      .select({ imageUrl: products.imageUrl })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (existing?.imageUrl) {
      try {
        // If it's a Supabase storage URL, try to delete it
        if (existing.imageUrl.includes("supabase.co/storage/v1/object/public/products/")) {
          const path = existing.imageUrl.split("/public/products/")[1];
          if (path) {
            await supabase.storage.from("products").remove([path]);
          }
        }
      } catch (e) {
        console.warn("Failed to remove product image from Supabase storage", e);
      }
    }

    await db.delete(products).where(eq(products.id, productId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Could not delete the design" }, { status: 500 });
  }
}
