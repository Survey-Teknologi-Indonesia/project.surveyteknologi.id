"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FolderArchive,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  HardDrive,
  Image as ImageIcon,
  Database,
  CloudOff,
  Loader2,
} from "lucide-react";

import { getRawDataPageData, approveRawDataGate } from "./actions";
import DriveFileBrowser, { ExtBadge } from "./DriveFileBrowser";

// ─── Status Badge Helper ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVED: {
      label: "Raw Data Verified",
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

// ─── Single Page Component ──────────────────────────────────────────────────
export default function RawDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unbox params promise
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    role: "uploader" | "verifier";
  } | null>(null);

  // 1. Fetch data dari server & sync role pengguna
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);

      // User role sync
      const level = localStorage.getItem("userLevel")?.toLowerCase();
      const name = localStorage.getItem("userName") || "User";
      const isVerifier =
        level === "verifikator" || level === "verifier" || level === "admin";

      setCurrentUser({
        name: name,
        role: isVerifier ? "verifier" : "uploader",
      });

      // Server Data Fetching
      const result = await getRawDataPageData(id);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(
          result.error ?? "Terjadi kesalahan saat mengambil data dari server.",
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
    // Ambil account_id sebenarnya yang tersimpan dari session/localStorage
    const storedUserId = localStorage.getItem("userId") || currentUser?.id;

    const res = await approveRawDataGate(data.projectId, storedUserId);
    if (res.success) {
      setData((prev: any) => ({ ...prev, status: "APPROVED" }));
    } else {
      alert(res.message);
    }
  } catch (err) {
    alert("Terjadi kesalahan saat memproses verifikasi.");
  } finally {
    setIsApproving(false);
  }
};
  // State Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
        <span className="text-xs font-semibold">
          Memuat data Raw Data Enchancement (Gate 4)...
        </span>
      </div>
    );
  }

  // State Fallback Error
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
              Gate {data.gateNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {data.gateTitle}
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
                  <span>Data Terverifikasi</span>
                </>
              ) : (
                <span>Setujui Raw Data Enhance</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Ringkasan Metrik ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Kapasitas
            </span>
            <HardDrive className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {hasFiles ? data.formattedStorage : "–"}
          </p>
          {!hasFiles && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Belum ada berkas
            </p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Jumlah Foto Udara
            </span>
            <ImageIcon className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {hasFiles ? data.totalImages.toLocaleString("id-ID") : "–"}
            {hasFiles && (
              <span className="text-xs font-normal text-slate-500 ml-1">
                Frame
              </span>
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Pengunggah Berkas
            </span>
            <FileCheck className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">
            {data.uploadedBy}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {data.uploadedAt}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Berkas
            </span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {hasFiles ? data.totalFiles.toLocaleString("id-ID") : "–"}
          </p>
          {hasFiles && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              File dari Google Drive
            </p>
          )}
        </div>
      </div>

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
            Upload progress pada Gate 3 dengan link folder Google Drive untuk
            menampilkan isi berkas secara langsung di sini.
          </p>
        </div>
      )}

      {/* ── Ringkasan Kategori Berkas (dari Drive) ── */}
      {hasFiles && data.categories && data.categories.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ringkasan Kategori Berkas Drive
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dikelompokkan otomatis berdasarkan ekstensi file dari Google
                Drive
              </p>
            </div>
            <FolderArchive className="w-5 h-5 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Kategori</th>
                  <th className="py-3.5 px-4 sm:px-6">Format</th>
                  <th className="py-3.5 px-4 sm:px-6">Jumlah File</th>
                  <th className="py-3.5 px-4 sm:px-6">Ukuran Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.categories.map((cat: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                      {cat.category}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex flex-wrap gap-1">
                        {cat.extensions.slice(0, 5).map((ext: string) => (
                          <ExtBadge key={ext} ext={ext} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-700">
                      {cat.count.toLocaleString("id-ID")} file
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-700">
                      {cat.size}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Live File Browser ── */}
      {hasDriveLink && (
        <DriveFileBrowser
          files={data.files}
          driveLink={data.driveLink!}
          totalFiles={data.totalFiles}
        />
      )}

      {/* ── Direct Cloud Access ── */}
      {hasDriveLink && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Akses Folder Penyimpanan Raw Data Enchance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh berkas mentah tersimpan dalam folder Google Drive
              terstruktur yang siap untuk diolah di Gate 4.
            </p>
          </div>

          <a
            href={data.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004b87] hover:bg-[#003763] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Buka Google Drive Raw Data Enchance</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
