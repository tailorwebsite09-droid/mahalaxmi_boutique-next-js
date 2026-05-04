import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

// Handle PUT requests to upload files
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const objectPath = path.join("/");
    
    const buffer = await req.arrayBuffer();
    
    const uploadDir = join(process.cwd(), "private_uploads", "objects", ...path.slice(0, -1));
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(process.cwd(), "private_uploads", "objects", objectPath);
    await writeFile(filePath, Buffer.from(buffer));
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving object:", error);
    return NextResponse.json({ error: "Failed to save object" }, { status: 500 });
  }
}

// Handle GET requests to retrieve files
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const objectPath = path.join("/");
    
    const filePath = join(process.cwd(), "private_uploads", "objects", objectPath);
    const fileBuffer = await readFile(filePath);
    
    const ext = objectPath.split('.').pop();
    let contentType = "application/octet-stream";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "svg") contentType = "image/svg+xml";
    
    return new NextResponse(fileBuffer, {
      headers: { "Content-Type": contentType },
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }
    console.error("Error serving object:", error);
    return NextResponse.json({ error: "Failed to serve object" }, { status: 500 });
  }
}
