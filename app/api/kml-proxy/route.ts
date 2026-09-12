// app/api/kml-proxy/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "fileId wajib diisi" }, { status: 400 });
  }

  try {
    const drive = google.drive({
      version: "v3",
      auth: process.env.GOOGLE_DRIVE_API_KEY,
    });

    // Ambil konten berkas mentah (raw media stream) dari Google Drive API via Server
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    return new NextResponse(response.data as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Gagal mengambil file KML via Proxy:", error?.message);
    return NextResponse.json(
      { error: error?.message || "Gagal mengambil file dari Google Drive API." },
      { status: 500 }
    );
  }
}