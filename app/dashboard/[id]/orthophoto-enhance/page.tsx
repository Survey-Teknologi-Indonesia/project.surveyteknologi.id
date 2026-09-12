"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  FileCode,
  HardDrive,
  Maximize2,
  Image as ImageIcon,
  Loader2,
  CloudOff,
  FolderArchive,
  Database,
  FileCheck,
} from "lucide-react";

// Menggunakan server action dan komponen shared DriveFileBrowser milikmu
import {
  getOrthophotoEnhancePageData,
  approveOrthophotoEnhanceGate,
  DriveFileItem,
} from "./actions";

import DriveFileBrowser from "./DriveFileBrowser";

// ─── Status Badge Helper ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVED: {
      label: "Orthophoto Verified",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    PENDING_APPROVAL: {
      label: "Menunggu Persetujuan",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    REVISION_NEEDED: {
      label: "Perlu Revisi",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
    NOT_UPLOADED: {
      label: "Belum Diunggah",
      cls: "bg-slate-100 text-slate-500 border-slate-200",
    },
  };

  const s = map[status] ?? map["NOT_UPLOADED"];
  const isApproved = status === "APPROVED";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${s.cls}`}
    >
      {isApproved ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {s.label}
    </span>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default function OrthophotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unbox params promise secara konsisten
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    role: "uploader" | "verifier";
  } | null>(null);

  // 1. Fetch data dari server action berdasarkan projectId & sync role pengguna
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);

      // User role sync dari localStorage
      const level = localStorage.getItem("userLevel")?.toLowerCase();
      const name = localStorage.getItem("userName") || "User";
      const isVerifier =
        level === "verifikator" || level === "verifier" || level === "admin";

      setCurrentUser({
        name: name,
        role: isVerifier ? "verifier" : "uploader",
      });

      // Ambil data Gate Orthophoto via Server Action
      const result = await getOrthophotoEnhancePageData(id);
      if (result.success && result.data) {
        setData(result.data);

        // Pilih file .TIF / .TIFF pertama atau file gambar sebagai preview default
        const fetchedFiles: DriveFileItem[] = result.data.files || [];
        const firstTiff = fetchedFiles.find(
          (f) => f.extension === "TIF" || f.extension === "TIFF" || f.isImage,
        );
        setSelectedFile(firstTiff || fetchedFiles[0] || null);
      } else {
        setError(
          result.error ??
            "Terjadi kesalahan saat mengambil data Orthophoto dari server.",
        );
      }
      setLoading(false);
    }

    loadInitialData();
  }, [id]);

  // 2. Handle Approval Action
  const handleApproval = async () => {
    if (!data || data.status === "APPROVED" || isApproving) return;

    setIsApproving(true);
    try {
      const storedUserId = localStorage.getItem("userId") || currentUser?.id;
      const res = await approveOrthophotoEnhanceGate(data.projectId, storedUserId);
      if (res.success) {
        setData((prev: any) => ({ ...prev, status: "APPROVED" }));
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat memproses verifikasi Orthophoto.");
    } finally {
      setIsApproving(false);
    }
  };

  // Utility untuk upgrade kualitas thumbnail Google Drive dari =s220 ke High-Res =s1600
  const getHighResThumbnail = (link?: string) => {
    if (!link) return null;
    return link.replace(/=s\d+/, "=s1600");
  };

  // ── State Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
        <span className="text-xs font-semibold">
          Memuat data Orthophoto (Gate 5)...
        </span>
      </div>
    );
  }

  // ── State Fallback Error ──
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <CloudOff className="w-12 h-12 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">Gagal Memuat Data</h2>
        <p className="text-sm text-slate-500 max-w-sm">{error}</p>
        <Link
          href={`/dashboard/${id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#004b87] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const hasFiles = data.files && data.files.length > 0;
  const hasDriveLink = !!data.driveLink;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-800">
      {/* ── Navigation & Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href={`/dashboard/${data.projectId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#004b87] mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Step
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-bold">
              {data.projectId.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-[#004b87] uppercase tracking-wider">
              Gate 6
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Orthophoto Enhance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{data.projectName}</p>
        </div>

        {/* Action / Status Section */}
        <div className="flex items-center gap-3">
          {currentUser?.role === "uploader" ? (
            <StatusBadge status={data.status} />
          ) : (
            <button
              type="button"
              onClick={handleApproval}
              disabled={data.status === "APPROVED" || isApproving}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                data.status === "APPROVED"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                  : "bg-[#004b87] hover:bg-[#003763] text-white cursor-pointer"
              }`}
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : data.status === "APPROVED" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Orthophoto Terverifikasi</span>
                </>
              ) : (
                <span>Setujui Orthophoto</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── CARD 1: PREVIEW ORTHOPHOTO (Height 60vh) ── */}
      {/* <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-4 h-4 text-[#004b87] shrink-0" />
            <h2 className="text-sm font-bold text-slate-900">
              Live GeoTIFF Visualizer
            </h2>
            {selectedFile && (
              <span className="text-xs font-mono text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded ml-2 truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </span>
            )}
          </div>
          {selectedFile && (
            <a
              href={selectedFile.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#004b87] hover:underline shrink-0"
            >
              <span>Buka File Drive</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </a>
          )}
        </div> */}

        {/* Viewport Canvas Preview 60vh */}
        {/* <div className="h-[60vh] w-full bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden group">
          {selectedFile ? (
            <>
              {selectedFile.thumbnailLink ? (
                <img
                  src={getHighResThumbnail(selectedFile.thumbnailLink)!}
                  alt={selectedFile.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                />
              ) : (
                <div className="text-center text-slate-400 p-6">
                  <FileCode className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">
                    Preview langsung tidak tersedia untuk format file ini.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gunakan tombol di pojok kanan atas untuk membuka file asli
                    di Drive.
                  </p>
                </div>
              )} */}

              {/* Floating Metadata Overlay */}
              {/* <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 p-3 rounded-xl text-white text-xs space-y-1 max-w-md shadow-lg">
                <p className="font-bold truncate">{selectedFile.name}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-300 font-mono">
                  <span>Size: {selectedFile.formattedSize}</span>
                  <span>•</span>
                  <span>Ext: {selectedFile.extension}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500">
              <Layers className="w-10 h-10 mx-auto mb-2 text-slate-700" />
              <p className="text-xs font-semibold">
                Pilih salah satu berkas dari daftar di bawah untuk menampilkan
                preview.
              </p>
            </div>
          )}
        </div>
      </div> */}

      {/* ── Drive Error Banner ── */}
      {data.error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              Tidak dapat mengambil daftar berkas dari Google Drive
            </p>
            <p className="text-xs text-amber-700 mt-0.5">{data.error}</p>
          </div>
        </div>
      )}

      {/* ── Status: Drive tidak ada ── */}
      {!hasDriveLink && (
        <div className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
          <CloudOff className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-500">
            Belum ada link Google Drive yang terhubung
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            Upload progress pada Gate 5 dengan link folder Google Drive untuk
            menampilkan isi berkas secara langsung di sini.
          </p>
        </div>
      )}

      {/* ── CARD 2: LIST FILE BROWSER (Shared DriveFileBrowser Component) ── */}
      {hasDriveLink && (
        <DriveFileBrowser
          files={data.files}
          driveLink={data.driveLink!}
          totalFiles={data.totalFiles}
          //   selectedFileId={selectedFile?.id}
          //   onSelectFile={(file) => setSelectedFile(file)}
        />
      )}

      {/* ── Direct Cloud Access Footer ── */}
      {hasDriveLink && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Akses Folder Penyimpanan Orthophoto
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh hasil olahan Orthomosaic tersimpan dalam Google Drive
              terstruktur yang siap diunduh atau digabungkan ke SIG.
            </p>
          </div>

          <a
            href={data.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004b87] hover:bg-[#003763] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Buka Google Drive Orthophoto</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
