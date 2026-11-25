import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { IMAGE_UPLOAD_DIR } from "../../_lib/paths";
import { getPrivateUpload, isVercelRuntime } from "../../_lib/persistent-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const imageTypes = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key") || "";
  const match = /^uploads\/qr-code\/([a-z0-9-]+)\/([a-f0-9-]+\.(jpg|png|webp|gif))$/i.exec(key);
  if (!match) {
    return new NextResponse("Not found", { status: 404 });
  }
  const headers = {
    "Cache-Control": "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    if (!isVercelRuntime && IMAGE_UPLOAD_DIR) {
      const [, park, filename, extension] = match;
      const file = await readFile(path.join(IMAGE_UPLOAD_DIR, park, filename));
      return new NextResponse(new Uint8Array(file), {
        headers: {
          ...headers,
          "Content-Type": imageTypes[extension.toLowerCase() as keyof typeof imageTypes],
        },
      });
    }
    const blob = await getPrivateUpload(key);
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return new NextResponse("Not found", { status: 404 });
    }
    return new NextResponse(blob.stream, {
      headers: {
        ...headers,
        "Content-Type": blob.blob.contentType || "application/octet-stream",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });
  }
}
