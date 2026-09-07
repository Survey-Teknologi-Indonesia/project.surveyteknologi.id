"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Download,
  Plus,
  SlidersHorizontal,
  Layers,
  MapPin,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  getDashboardData,
  createProject,
  ProjectRecord,
  ProjectStatus,
} from "@/app/dashboard/actions";

export default function ProjectsPage() {
  const router = useRouter();

  // State data dari DB
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Modal Tambah Proyek
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State sesuai struktur tabel 'project'
  const [formData, setFormData] = useState<{
    project_name: string;
    client: string;
    start_date: string;
    end_date: string;
    status: ProjectStatus;
  }>({
    project_name: "",
    client: "",
    start_date: "",
    end_date: "",
    status: "On Going",
  });

  // Fetch data dari database
  const fetchProjects = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await getDashboardData();
    if (res.success && res.data) {
      setProjects(res.data.projects);
    } else {
      setErrorMessage(res.error || "Gagal memuat data proyek dari database.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter list
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchSearch =
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || project.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Statistics
  const totalProjects = projects.length;
  const onGoingCount = projects.filter((p) => p.status === "On Going").length;
  const finishedCount = projects.filter((p) => p.status === "Finished").length;
  const addedCount = projects.filter((p) => p.status === "added").length;
  const uniqueClientsCount = new Set(projects.map((p) => p.client)).size;

  // Render Status Badge sesuai enum tabel project
  const renderStatusBadge = (status?: ProjectStatus | null) => {
    switch (status) {
      case "On Going":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            On Going
          </span>
        );
      case "Finished":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Finished
          </span>
        );
      case "added":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Added
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Unknown
          </span>
        );
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

  // Submit Handler Modal Tambah Proyek
  const handleFormSubmit = async (e: React.FormEvent) => {
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
      project_name: formData.project_name.trim(),
      client: formData.client.trim(),
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      status: formData.status,
    });

    setIsSubmitting(false);

    if (res.success && res.project) {
      setFormData({
        project_name: "",
        client: "",
        start_date: "",
        end_date: "",
        status: "On Going",
      });
      setIsAddModalOpen(false);
      setToastMessage("Proyek baru berhasil disimpan ke database Neon!");
      fetchProjects();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setFormError(res.error || "Gagal menambahkan proyek ke database.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (projects.length === 0) return;
    const headers = ["ID", "Nama Proyek", "Klien", "Tanggal Mulai", "Target Selesai", "Status"];
    const rows = projects.map((p) => [
      p.project_id,
      `"${p.project_name.replace(/"/g, '""')}"`,
      `"${p.client.replace(/"/g, '""')}"`,
      p.start_date || "-",
      p.end_date || "-",
      p.status || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `STI_Projects_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Proyek Photogrammetry &amp; Pemetaan
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Neon DB
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pantau status pengerjaan, klien, alur stage-gate, dan jadwal proyek STI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchProjects}
            title="Muat Ulang Data"
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={projects.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Ekspor CSV
          </button>

          {/* Tombol Tambah Proyek */}
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003966] text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Proyek
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Card 1: Total Proyek */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Proyek
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? "-" : totalProjects}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Tabel project
            </span>
          </div>
        </div>

        {/* Card 2: On Going */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              On Going
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-sky-700">
              {isLoading ? "-" : onGoingCount}
            </span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
              Berjalan
            </span>
          </div>
        </div>

        {/* Card 3: Finished */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Finished
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-700">
              {isLoading ? "-" : finishedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              Selesai
            </span>
          </div>
        </div>

        {/* Card 4: Klien Terdaftar */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jumlah Klien
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? "-" : uniqueClientsCount}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Instansi / Mitra
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama proyek, ID, atau klien..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87]/20 transition-all"
            />
          </div>

          {/* Status Tabs sesuai Enum: ALL, On Going, Finished, added */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            {[
              { key: "ALL", label: "Semua Status" },
              { key: "On Going", label: "On Going" },
              { key: "Finished", label: "Finished" },
              { key: "added", label: "Added" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.key
                    ? "bg-[#004b87] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minimalist Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 sm:px-6">Detail Proyek</th>
                <th className="py-3.5 px-4 sm:px-6">Klien (client)</th>
                <th className="py-3.5 px-4 sm:px-6">Tanggal Mulai (start_date)</th>
                <th className="py-3.5 px-4 sm:px-6">Target Selesai (end_date)</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#004b87] mb-2" />
                    <p className="text-xs font-semibold">Memuat daftar proyek dari database...</p>
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => (
                  <tr
                    key={project.project_id}
                    onClick={() => router.push(`/dashboard/${project.project_id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    {/* Proyek Info */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-[#004b87] transition-colors">
                          {project.project_name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 mt-0.5">
                          ID: {project.project_id.slice(0, 8)}...
                        </span>
                      </div>
                    </td>

                    {/* Klien */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {project.client}
                      </span>
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
                      {renderStatusBadge(project.status)}
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <FolderKanban className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">
                      Tidak Ada Proyek Ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Belum ada proyek yang sesuai dengan kriteria pencarian atau tabel database masih kosong.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setIsAddModalOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003966] text-white shadow-sm transition-colors"
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

        {/* Footer Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Menampilkan <strong>{filteredProjects.length}</strong> dari{" "}
            <strong>{totalProjects}</strong> total proyek
          </span>
          <span className="font-medium text-slate-600">
            Tersinkronisasi dengan Tabel <strong>public.project</strong> (PostgreSQL Neon)
          </span>
        </div>
      </div>

      {/* MODAL TAMBAH PROYEK (Disesuaikan dengan Struktur Tabel public.project) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div>
                <span className="text-[10px] font-bold text-[#004b87] uppercase tracking-wider">
                  PostgreSQL Neon • public.project
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Proyek Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Nama Proyek (project_name TEXT) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Proyek (project_name) <span className="text-rose-500">*</span>
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

              {/* 2. Klien / Instansi (client TEXT) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Klien / Instansi (client) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Otorita Ibu Kota Nusantara / PT Sinar Mas"
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
              </div>

              {/* 3. Dates Grid: start_date & end_date (DATE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Mulai (start_date)
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Selesai (end_date)
                  </label>
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

              {/* 4. Status Proyek (status enum: 'On Going' | 'Finished' | 'added') */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Proyek (status) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ProjectStatus,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all font-medium"
                >
                  <option value="On Going">On Going (Sedang Berjalan)</option>
                  <option value="Finished">Finished (Selesai)</option>
                  <option value="added">added (Baru Ditambahkan)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pilihan disesuaikan dengan tipe enum database PostgreSQL: <code>status</code>.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003966] text-white shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
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