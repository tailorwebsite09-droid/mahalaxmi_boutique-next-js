import { NextRequest, NextResponse } from "next/server";
import { db, pool } from "@/lib/db";
import { requireAdmin } from "@/lib/server-admin-auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    // Check if products table exists
    await db.execute(`SELECT 1 FROM products LIMIT 1`);
    
    // Check if bucket exists. We use list() because listBuckets() requires admin keys.
    // If the bucket doesn't exist, this will return an error.
    const { error: bucketError } = await supabase.storage.from("products").list('', { limit: 1 });

    if (bucketError && (bucketError as any).status === 404) {
      return NextResponse.json({
        ready: false,
        reason: "Storage bucket 'products' is missing.",
        setupSql: "-- No SQL needed for bucket creation. Please create a public bucket named 'products' in the Supabase Storage dashboard.",
        sqlEditorUrl: "https://supabase.com/dashboard/project/_/storage/buckets"
      });
    }

    return NextResponse.json({
      ready: true,
    });
  } catch (error: any) {
    console.error("Setup check error:", error);
    // If table doesn't exist, provide setup SQL
    const setupSql = `
-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  description TEXT NOT NULL,
  fabric_type TEXT NOT NULL,
  placement TEXT NOT NULL,
  ai_enhancement BOOLEAN NOT NULL DEFAULT FALSE,
  design_path TEXT NOT NULL,
  design_filename TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
    `.trim();

    return NextResponse.json({
      ready: false,
      reason: "Database tables are missing or not accessible.",
      setupSql: setupSql,
      sqlEditorUrl: "https://supabase.com/dashboard/project/_/sql"
    });
  }
}
