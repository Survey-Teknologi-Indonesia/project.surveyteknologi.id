"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Map,
  Plane,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Calendar,
  Layers,
  Maximize2,
  Check,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser } from "@/app/login/actions";
import {
  getFlightPlanData,
  approveFlightPlan,
  rejectFlightPlan,
  FlightPlanData,
  AccountOption,
} from "./actions";

export default function FlightPlanPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const id = rawId ? (Array.isArray(rawId) ? rawId[0] : rawId) : "";

  const [flightData, setFlightData] = useState<FlightPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; role: string } | null>(null);

  // Modal States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State untuk Approve (sesuai tabel public.approval)
  const [approveForm, setApproveForm] = useState({
    approveBy: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // Form State untuk Reject (sesuai tabel public.rejection)
  const [rejectForm, setRejectForm] = useState({
    rejectBy: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // Load data dari database
  const loadData = async () => {
    setIsLoading(true);
    const res = await getFlightPlanData(id);
    if (res.success && res.data) {
      setFlightData(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error(err);
      }
      await loadData();
    }
    init();
  }, [id]);

  // Buka Modal Approve
  const handleOpenApproveModal = () => {
    setActionError(null);
    const defaultVerifier =
      currentUser?.id ||
      flightData?.accounts.find((a) => a.role === "verifikator")?.account_id ||
      flightData?.accounts[0]?.account_id ||
      "";
    setApproveForm({
      approveBy: defaultVerifier,
      date: new Date().toISOString().split("T")[0],
      remarks: "",
    });
    setIsApproveModalOpen(true);
  };

  // Buka Modal Reject
  const handleOpenRejectModal = () => {
    setActionError(null);
    const defaultVerifier =
      currentUser?.id ||
      flightData?.accounts.find((a) => a.role === "verifikator")?.account_id ||
      flightData?.accounts[0]?.account_id ||
      "";
    setRejectForm({
      rejectBy: defaultVerifier,
      date: new Date().toISOString().split("T")[0],
      remarks: "",
    });
    setIsRejectModalOpen(true);
  };

  // Submit Approve (Simpan ke tabel 'approval')
  const handleSubmitApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightData) return;

    if (!approveForm.approveBy) {
      setActionError("Pilih akun verifikator (approveBy).");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const res = await approveFlightPlan({
      projectId: flightData.projectId,
      stepId: flightData.stepId,
      approveBy: approveForm.approveBy,
      date: approveForm.date,
      remarks: approveForm.remarks,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsApproveModalOpen(false);
      setToastMessage("Gate 1 (Flight Plan) berhasil disetujui dan dicatat di tabel approval!");
      loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setActionError(res.error || "Gagal menyetujui tahapan.");
    }
  };

  // Submit Reject (Simpan ke tabel 'rejection')
  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightData) return;

    if (!rejectForm.rejectBy) {
      setActionError("Pilih akun peninjau (rejectBy).");
      return;
    }

    if (!rejectForm.remarks.trim()) {
      setActionError("Catatan revisi / alasan penolakan (remarks) wajib diisi sesuai ketentuan database.");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const res = await rejectFlightPlan({
      projectId: flightData.projectId,
      stepId: flightData.stepId,
      rejectBy: rejectForm.rejectBy,
      date: rejectForm.date,
      remarks: rejectForm.remarks.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsRejectModalOpen(false);
      setToastMessage("Gate 1 (Flight Plan) ditolak / diminta revisi dan dicatat di tabel rejection!");
      loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setActionError(res.error || "Gagal menyimpan penolakan.");
    }
  };

  // Status Badge Helper
  const renderStatusBadge = () => {
    switch (flightData?.status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            DISETUJUI (APPROVED)
          </span>
        );
      case "REVISION_NEEDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            PERLU REVISI (REVISION)
          </span>
        );
      case "PENDING_APPROVAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            MENUNGGU VERIFIKASI
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            BELUM DIUNGGAH
          </span>
        );
    }
  };

  // Demo parameter flight plan jika belum ada sensor telemetry
  const parameters = {
    aoiArea: "450 Ha",
    altitude: "120 Meter AGL",
    frontOverlap: "80%",
    sideOverlap: "75%",
    droneModel: "DJI Matrice 300 RTK",
    gcpCount: "12 Titik",
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
        <p className="text-xs font-semibold">Memuat verifikasi Flight Plan dari database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 text-slate-800 font-sans relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-900/95 text-white border border-emerald-500 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-emerald-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${id}`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600"
            title="Kembali ke Timeline Proyek"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#004b87]">
                Gate 1 • Flight Plan
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-500">
                ID: {id ? id.slice(0, 8) : "N/A"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {flightData?.projectName || "Rencana Jalur Terbang & GCP"}
            </h1>
            {flightData?.client && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Klien: {flightData.client}
              </p>
            )}
          </div>
        </div>

        {/* Status Indicator & Refresh */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            title="Muat Ulang Status"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {renderStatusBadge()}
        </div>
      </div>

      {/* Box Info Riwayat Approval / Rejection jika sudah ada */}
      {flightData?.approvalInfo && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-emerald-800">
              Tahapan ini telah disetujui oleh {flightData.approvalInfo.approverName} pada {flightData.approvalInfo.date}
            </p>
            {flightData.approvalInfo.remarks && (
              <p className="text-emerald-700 bg-white/70 p-2 rounded-lg border border-emerald-100 italic">
                &ldquo;{flightData.approvalInfo.remarks}&rdquo;
              </p>
            )}
            <span className="text-[10px] text-emerald-600 font-mono block">
              Tercatat di tabel public.approval (ID: {flightData.approvalInfo.approval_id})
            </span>
          </div>
        </div>
      )}

      {flightData?.rejectionInfo && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-sm">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-rose-800">
              Tahapan ini diminta revisi oleh {flightData.rejectionInfo.rejectorName} pada {flightData.rejectionInfo.date}
            </p>
            <p className="text-rose-700 bg-white/70 p-2 rounded-lg border border-rose-100 font-medium">
              Alasan Revisi: &ldquo;{flightData.rejectionInfo.remarks}&rdquo;
            </p>
            <span className="text-[10px] text-rose-600 font-mono block">
              Tercatat di tabel public.rejection (ID: {flightData.rejectionInfo.rejection_id})
            </span>
          </div>
        </div>
      )}

      {/* 2. Main Content Grid (Map Preview & Parameters) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Map Preview Card (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-[#004b87]" />
              <h2 className="text-sm font-bold text-slate-800">
                Preview Jalur Terbang (KML / KMZ)
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#004b87] bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Layar Penuh
            </button>
          </div>

          {/* Map Viewer Container */}
          <div className="relative bg-slate-100 min-h-[400px] flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-4 rounded-full bg-white border border-slate-200 shadow-sm mb-3">
              <Plane className="w-8 h-8 text-[#004b87]" />
            </div>
            <p className="text-base font-bold text-slate-800">
              Interactive KML Viewer
            </p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Peta jalur pemotretan udara, batas AOI, dan sebaran 12 titik GCP
              ditampilkan secara spasial di sini.
            </p>

            {flightData?.documentLink ? (
              <a
                href={flightData.documentLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#004b87] text-white hover:bg-[#003763] shadow-md transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Buka Tautan Data Deliverable
              </a>
            ) : (
              <a
                href="https://earth.google.com/web/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
              >
                <ExternalLink className="w-4 h-4 text-[#00a3e0]" />
                Buka di Google Earth Web
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Specifications & Metadata (1/3 width) */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Parameter Penerbangan
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Cakupan AOI
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parameters.aoiArea}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Tinggi Terbang
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parameters.altitude}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Overlap Depan
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parameters.frontOverlap}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Overlap Samping
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {parameters.sideOverlap}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Model Drone:</span>
                <span className="font-semibold text-slate-800">
                  {parameters.droneModel}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Jumlah Titik GCP:</span>
                <span className="font-semibold text-slate-800">
                  {parameters.gcpCount}
                </span>
              </div>
            </div>
          </div>

          {/* Upload Info Card dari DB */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs space-y-2.5">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Informasi Pengajuan (Tabel progress)
            </h3>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>
                Pengunggah: <strong>{flightData?.uploadedBy || "Belum ada"}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Waktu Upload: {flightData?.uploadedAt || "-"}</span>
            </div>
            {flightData?.documentLink && (
              <div className="pt-2 border-t border-slate-100">
                <a
                  href={flightData.documentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#004b87] hover:underline font-semibold flex items-center gap-1.5 truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{flightData.documentLink}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Downloadable Files Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#004b87]" />
          Berkas Lampiran Deliverable (Gate 1)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Flight_Plan_AOI_v1.kml", size: "2.4 MB", type: "KML" },
            { name: "Airspace_Permit_Letter.pdf", size: "1.1 MB", type: "PDF" },
            { name: "GCP_Distribution_Coordinates.csv", size: "45 KB", type: "CSV" },
          ].map((file, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#004b87] font-bold text-xs uppercase">
                  {file.type}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{file.size}</p>
                </div>
              </div>
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-[#004b87] hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="Unduh Berkas"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Verification Action Bar (Terkoneksi ke Tabel approval & rejection) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Verifikasi Gate 1: Flight Plan
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Aksi verifikasi ini akan tercatat langsung ke tabel <strong>public.approval</strong> atau <strong>public.rejection</strong>.
          </p>
        </div>

        {/* Tombol Tolak / Minta Revisi & Setujui (Approve) */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenRejectModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            <XCircle className="w-4 h-4" />
            Tolak / Minta Revisi
          </button>
          <button
            type="button"
            onClick={handleOpenApproveModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Setujui (Approve)
          </button>
        </div>
      </div>

      {/* MODAL 1: SETUJUI (APPROVE) - Sesuai Struktur Tabel public.approval */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Tabel public.approval
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Setujui Gate 1: Flight Plan
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitApprove} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* 1. Verifikator (approveBy UUID) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Verifikator (approveBy) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    required
                    value={approveForm.approveBy}
                    onChange={(e) => setApproveForm({ ...approveForm, approveBy: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium text-slate-800"
                  >
                    <option value="">-- Pilih Akun Verifikator --</option>
                    {flightData?.accounts.map((acc) => (
                      <option key={acc.account_id} value={acc.account_id}>
                        {acc.name} ({acc.role}) - {acc.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Tanggal Persetujuan (date DATE) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Persetujuan (date) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={approveForm.date}
                    onChange={(e) => setApproveForm({ ...approveForm, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* 3. Catatan Persetujuan (remarks TEXT, opsional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan / Keterangan Persetujuan (remarks)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Flight plan memenuhi SOP overlap 80/75% dan sebaran 12 titik GCP telah sesuai."
                  value={approveForm.remarks}
                  onChange={(e) => setApproveForm({ ...approveForm, remarks: e.target.value })}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 text-slate-800"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan Persetujuan...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Konfirmasi Setujui
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TOLAK / MINTA REVISI - Sesuai Struktur Tabel public.rejection */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                    Tabel public.rejection
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Tolak / Minta Revisi Gate 1
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReject} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* 1. Peninjau (rejectBy UUID) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Peninjau / Verifikator (rejectBy) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    required
                    value={rejectForm.rejectBy}
                    onChange={(e) => setRejectForm({ ...rejectForm, rejectBy: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600 font-medium text-slate-800"
                  >
                    <option value="">-- Pilih Akun Peninjau --</option>
                    {flightData?.accounts.map((acc) => (
                      <option key={acc.account_id} value={acc.account_id}>
                        {acc.name} ({acc.role}) - {acc.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Tanggal Penolakan (date DATE) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Penolakan (date) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={rejectForm.date}
                    onChange={(e) => setRejectForm({ ...rejectForm, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600 text-slate-800"
                  />
                </div>
              </div>

              {/* 3. Alasan Penolakan / Catatan Revisi (remarks TEXT NOT NULL - WAJIB!) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Revisi / Alasan Penolakan (remarks) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan alasan penolakan dan bagian yang perlu diperbaiki oleh pilot/uploader..."
                  value={rejectForm.remarks}
                  onChange={(e) => setRejectForm({ ...rejectForm, remarks: e.target.value })}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-rose-600 text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Kolom ini wajib diisi sesuai ketentuan skema tabel (<code>remarks TEXT NOT NULL</code>).
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan Penolakan...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      Kirim Penolakan &amp; Revisi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}