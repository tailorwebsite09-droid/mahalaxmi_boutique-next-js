import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Handle GET requests to retrieve files from Supabase Storage
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const objectPath = path.join("/");
    
    const { data, error } = await supabase.storage
      .from("products")
      .download(objectPath);

    if (error) {
      console.error("Error downloading from Supabase Storage:", error);
      if (error.message.includes("Object not found")) {
        return NextResponse.json({ error: "Object not found" }, { status: 404 });
      }
      throw error;
    }

    const fileBuffer = await data.arrayBuffer();
    
    const ext = objectPath.split('.').pop();
    let contentType = "application/octet-stream";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "svg") contentType = "image/svg+xml";
    
    return new NextResponse(fileBuffer, {
      headers: { "Content-Type": contentType },
    });
  } catch (error: any) {
    console.error("Error serving object:", error);
    return NextResponse.json({ error: "Failed to serve object" }, { status: 500 });
  }
}
