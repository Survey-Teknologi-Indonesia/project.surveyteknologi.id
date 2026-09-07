"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  FileCheck2,
  Plus,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getDashboardData,
  createProject,
  ProjectRecord,
  DashboardMetrics,
  GateItem,
} from "./actions";

export default function OverviewPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State data dari DB
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalAreaHa: 0,
    pendingVerifications: 0,
    revisionsNeeded: 0,
  });
  const [gateDistribution, setGateDistribution] = useState<GateItem[]>([
    { gate: "Gate 1", title: "Flight Plan", count: 0, color: "bg-emerald-500" },
    { gate: "Gate 2", title: "Data Acquisition", count: 0, color: "bg-emerald-500" },
    { gate: "Gate 3", title: "Raw Data", count: 0, color: "bg-emerald-500" },
    { gate: "Gate 4", title: "Raw Data Enhance", count: 0, color: "bg-emerald-500" },
    { gate: "Gate 5", title: "Orthophoto", count: 0, color: "bg-amber-500" },
    { gate: "Gate 6", title: "Orthophoto Enhance", count: 0, color: "bg-[#004b87]" },
    { gate: "Gate 7", title: "Digitization & Detection", count: 0, color: "bg-slate-400" },
  ]);
  const [urgentActions, setUrgentActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Modal Tambah Proyek State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields disesuaikan dengan DB: project_name, client, start_date, end_date
  const [formData, setFormData] = useState({
    project_name: "",
    client: "",
    start_date: "",
    end_date: "",
  });

  // Fetch data dari database
  const fetchData = async () => {
    setIsLoading(true);
    setDbError(null);
    const result = await getDashboardData();
    if (result.success && result.data) {
      setProjects(result.data.projects);
      setMetrics(result.data.metrics);
      if (result.data.gateDistribution.length > 0) {
        setGateDistribution(result.data.gateDistribution);
      }
      setUrgentActions(result.data.urgentActions);
    } else {
      setDbError(result.error || "Gagal menghubungkan ke database");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle submit form tambah project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_name.trim()) {
      setFormError("Nama proyek wajib diisi.");
      return;
    }
    if (!formData.client.trim()) {
      setFormError("Nama klien wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const res = await createProject({
      project_name: formData.project_name,
      client: formData.client,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.project) {
      // Reset form & tutup modal
      setFormData({
        project_name: "",
        client: "",
        start_date: "",
        end_date: "",
      });
      setIsModalOpen(false);
      setToastMessage("Proyek baru berhasil ditambahkan ke database!");
      // Refresh data
      fetchData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setFormError(res.error || "Gagal menyimpan proyek. Silakan coba lagi.");
    }
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getProjectStatus = (endDateStr: string | null) => {
    if (!endDateStr) return { label: "Berjalan", color: "bg-sky-50 text-sky-700 border-sky-200" };
    const end = new Date(endDateStr);
    const now = new Date();
    if (end < now) {
      return { label: "Selesai", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    return { label: "Berjalan", color: "bg-sky-50 text-sky-700 border-sky-200" };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans text-slate-800 relative">
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

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Summary Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Neon DB
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan eksekutif status operasional, pipa kerja 7-Gate, dan metrik proyek riil STI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            title="Muat Ulang Data"
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Lihat Semua Proyek
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Tombol Tambah Proyek sesuai instruksi */}
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Proyek
          </button>
        </div>
      </div>

      {/* Database Error Banner jika terjadi error koneksi */}
      {dbError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Koneksi Database Terkendala:</span> {dbError}
          </div>
        </div>
      )}

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Proyek */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Proyek
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? "-" : metrics.totalProjects}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {isLoading ? "..." : `${metrics.activeProjects} Berjalan`}
            </span>
          </div>
        </div>

        {/* Metric 2: Selesai */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Proyek Selesai
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? "-" : metrics.completedProjects}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Completed
            </span>
          </div>
        </div>

        {/* Metric 3: Butuh Verifikasi */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Butuh Verifikasi
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600">
              {isLoading ? "-" : metrics.pendingVerifications}
            </span>
            <span className="text-xs font-semibold text-amber-700">Antrean Review</span>
          </div>
        </div>

        {/* Metric 4: SOP Gates */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Standar SOP
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">7 Gate</span>
            <span className="text-xs font-semibold text-[#004b87] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
              Stage-Gate
            </span>
          </div>
        </div>
      </div>

      {/* 3. Section Tengah: Pipeline Stage-Gate & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sebaran Status Gate (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sebaran Proyek per Quality Gate (SOP 7-Stage)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jumlah proyek aktif yang sedang diproses pada tiap tahap
                </p>
              </div>
              <Layers className="w-5 h-5 text-slate-400" />
            </div>

            {/* Distribution List */}
            <div className="space-y-3 mt-4">
              {gateDistribution.map((item) => (
                <div key={item.gate} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 font-bold">
                      {item.gate}: <span className="font-normal text-slate-500">{item.title}</span>
                    </span>
                    <span className="font-mono text-slate-900 font-bold">{item.count} Proyek</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{
                        width: `${
                          metrics.totalProjects > 0
                            ? Math.min(100, (item.count / metrics.totalProjects) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar SOP Photogrammetry &amp; Detection STI</span>
            <span className="font-bold text-[#004b87]">
              Total {metrics.totalProjects} Proyek Terdaftar
            </span>
          </div>
        </div>

        {/* Action Center / Urgent Items (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Pusat Perhatian</h3>
              </div>
              <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                {urgentActions.length} Actions
              </span>
            </div>

            {/* List Action */}
            <div className="space-y-3">
              {urgentActions.length > 0 ? (
                urgentActions.map((action) => (
                  <div
                    key={action.id}
                    onClick={() => router.push(`/dashboard/${action.id}`)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-[#004b87] bg-slate-50/50 hover:bg-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400">{action.code}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          action.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {action.type}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#004b87] transition-colors line-clamp-1">
                      {action.name}
                    </h4>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{action.gate}</span>
                      <span className="font-semibold text-slate-700">{action.uploader}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-80" />
                  <p className="text-xs font-medium text-slate-600">Semua Berjalan Lancar</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tidak ada antrean review mendesak saat ini.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="w-full mt-4 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Buka Semua Proyek</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Ringkasan Proyek Terbaru dari Neon DB */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Proyek Aktif Utama</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data proyek terdaftar di database Neon PostgreSQL
            </p>
          </div>
          <FileCheck2 className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Nama Proyek</th>
                <th className="py-3.5 px-4 sm:px-6">Klien</th>
                <th className="py-3.5 px-4 sm:px-6">Tanggal Mulai</th>
                <th className="py-3.5 px-4 sm:px-6">Target Selesai</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#004b87] mb-2" />
                    <p className="text-xs">Memuat data proyek dari database...</p>
                  </td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map((project) => {
                  const status = getProjectStatus(project.end_date);
                  return (
                    <tr
                      key={project.project_id}
                      onClick={() => router.push(`/dashboard/${project.project_id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Nama Proyek & ID */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-[#004b87] transition-colors">
                            {project.project_name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {project.project_id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Klien */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{project.client}</span>
                        </div>
                      </td>

                      {/* Tanggal Mulai */}
                      <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600 font-mono">
                        {formatDisplayDate(project.start_date)}
                      </td>

                      {/* Target Selesai */}
                      <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600 font-mono">
                        {formatDisplayDate(project.end_date)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {status.label}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/${project.project_id}`);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-[#004b87] bg-[#004b87]/10 hover:bg-[#004b87] hover:text-white border border-[#004b87]/20 rounded-lg transition-all"
                        >
                          Detail
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <FolderKanban className="w-10 h-10 mx-auto mb-2.5 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">
                      Belum Ada Proyek di Database
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Tabel project di Neon PostgreSQL masih kosong. Klik tombol di bawah untuk
                      menambahkan proyek pertama.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setIsModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Proyek Pertama
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal Tambah Proyek (Sesuai Struktur Tabel project) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Proyek Baru</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input data sesuai skema tabel project database Neon
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* project_name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Proyek <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemetaan Topografi & LiDAR Kawasan Inti IKN"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
              </div>

              {/* client */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Klien / Instansi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Otorita Ibu Kota Nusantara / PT Sinar Mas"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
              </div>

              {/* Dates Grid (start_date & end_date) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Mulai
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Selesai
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Simpan Proyek
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