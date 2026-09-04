"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Download,
  Plus,
  SlidersHorizontal,
  Layers,
  MapPin,
} from "lucide-react";

interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  clientType: "Government" | "Private" | "BUMN";
  areaHa: number;
  location: string;
  status: "Completed" | "In Progress" | "Planning";
  startDate: string;
}

const initialProjects: Project[] = [
  {
    id: "PRJ-001",
    code: "STI-IKN-2026",
    name: "Pemetaan Topografi & LiDAR Kawasan Inti IKN",
    client: "Otorita Ibu Kota Nusantara",
    clientType: "Government",
    areaHa: 6500,
    location: "Kalimantan Timur",
    status: "In Progress",
    startDate: "12 Jan 2026",
  },

];

export default function OverviewPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const router = useRouter();

  // Filtered list
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      const matchSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || project.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [searchTerm, statusFilter]);

  // Statistics
  const totalArea = useMemo(
    () => initialProjects.reduce((acc, curr) => acc + curr.areaHa, 0),
    []
  );
  const totalProjects = initialProjects.length;
  const inProgressCount = initialProjects.filter(
    (p) => p.status === "In Progress"
  ).length;

  const renderStatusBadge = (status: Project["status"]) => {
    const config = {
      Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      "In Progress": "bg-[#00a3e0]/10 text-[#004b87] border-[#00a3e0]/30",
      Planning: "bg-amber-50 text-amber-700 border-amber-200",
    };

    const labels = {
      Completed: "Selesai",
      "In Progress": "Berjalan",
      Planning: "Perencanaan",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config[status]}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            status === "Completed"
              ? "bg-emerald-500"
              : status === "In Progress"
              ? "bg-[#00a3e0]"
              : "bg-amber-500"
          }`}
        />
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Proyek Photogrammetry & Pemetaan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau status pengerjaan, lokasi, dan progres area pemetaan geospasial.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Ekspor CSV
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#004b87] hover:bg-[#003966] text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Proyek
          </button>
        </div>
      </div>

      {/* Metric Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Proyek
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {totalProjects}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {inProgressCount} Berjalan
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Cakupan Area
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-900">
              {totalArea.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Hektar (Ha)
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Jumlah Klien
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {new Set(initialProjects.map((p) => p.client)).size}
            </span>
            <span className="text-xs text-slate-500">Kementerian, BUMN, Private</span>
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
              placeholder="Cari proyek, kode, atau klien..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87]/20 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            {["ALL", "In Progress", "Completed", "Planning"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? "bg-[#004b87] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {status === "ALL"
                  ? "Semua Status"
                  : status === "In Progress"
                  ? "Berjalan"
                  : status === "Completed"
                  ? "Selesai"
                  : "Perencanaan"}
              </button>
            ))}
          </div>
        </div>

        {/* Minimalist Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Detail Proyek</th>
                <th className="py-3 px-4">Klien</th>
                <th className="py-3 px-4 text-right">Luas (Ha)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => (
                  <tr
                    key={project.id}
                    onClick={() => router.push(`/dashboard/${project.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400">
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    {/* Proyek Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-[#004b87] transition-colors">
                          {project.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600">
                            {project.code}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {project.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Klien */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {project.client}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5 ml-5">
                          {project.clientType}
                        </span>
                      </div>
                    </td>

                    {/* Luas */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900">
                        {project.areaHa.toLocaleString("id-ID")}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {renderStatusBadge(project.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">
                      Tidak ada proyek yang sesuai dengan kriteria pencarian.
                    </p>
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
          <span>
            Total Area Terpilih:{" "}
            <strong className="font-mono text-slate-800">
              {filteredProjects
                .reduce((acc, curr) => acc + curr.areaHa, 0)
                .toLocaleString("id-ID")}{" "}
              Ha
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}