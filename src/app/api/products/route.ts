import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Could not load designs" },
      { status: 500 }
    );
  }
}
