import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { requireAdmin } from "@/lib/server-admin-auth";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

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
        if (existing.imageUrl.startsWith("/uploads/")) {
          const filePath = join(process.cwd(), "public", existing.imageUrl);
          await unlink(filePath).catch(() => {});
        }
      } catch (e) {
        console.warn("Failed to remove product image from storage", e);
      }
    }

    await db.delete(products).where(eq(products.id, productId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Could not delete the design" }, { status: 500 });
  }
}
