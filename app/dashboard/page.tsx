"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  FileCheck2,
} from "lucide-react";

export default function OverviewPage() {
  const router = useRouter();

  // Metric Ringkasan
  const summaryMetrics = {
    totalProjects: 12,
    activeProjects: 5,
    completedProjects: 7,
    totalAreaHa: 24500,
    pendingVerifications: 3,
    revisionsNeeded: 2,
  };

  // Pipeline Metrics (Sebaran 7 Gate)
  const gateDistribution = [
    { gate: "Gate 1", title: "Flight Plan", count: 1, color: "bg-emerald-500" },
    { gate: "Gate 2", title: "Data Acquisition", count: 2, color: "bg-emerald-500" },
    { gate: "Gate 3", title: "Raw Data", count: 1, color: "bg-emerald-500" },
    { gate: "Gate 4", title: "Raw Data Enhance", count: 1, color: "bg-emerald-500" },
    { gate: "Gate 5", title: "Orthophoto", count: 3, color: "bg-amber-500" },
    { gate: "Gate 6", title: "Orthophoto Enhance", count: 2, color: "bg-[#004b87]" },
    { gate: "Gate 7", title: "Digitization & Detection", count: 2, color: "bg-slate-400" },
  ];

  // Proyek Butuh Perhatian (Action Items)
  const urgentActions = [
    {
      id: "PRJ-001",
      code: "STI-IKN-2026",
      name: "Pemetaan Topografi & LiDAR Kawasan Inti IKN",
      gate: "Gate 5: Orthophoto",
      uploader: "Oliver",
      status: "PENDING",
      type: "Needs Approval",
    },
    {
      id: "PRJ-003",
      code: "STI-SWT-2026",
      name: "Digitasi Lahan Kelapa Sawit PT Sinar Mas",
      gate: "Gate 3: Raw Data",
      uploader: "Clara",
      status: "REVISION",
      type: "Needs Upload/Fix",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans text-slate-800">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Executive Summary Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan eksekutif status operasional, pipa kerja 7-Gate, dan metrik geospasial STI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors"
          >
            Lihat Semua Proyek
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
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
              {summaryMetrics.totalProjects}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {summaryMetrics.activeProjects} Berjalan
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cakupan Area
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">
              {summaryMetrics.totalAreaHa.toLocaleString("id-ID")}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">Hektar</span>
          </div>
        </div>

        {/* Metric 3 */}
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
              {summaryMetrics.pendingVerifications}
            </span>
            <span className="text-xs font-semibold text-amber-700">Antrean Review</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 bg-rose-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Perlu Perbaikan
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-rose-600">
              {summaryMetrics.revisionsNeeded}
            </span>
            <span className="text-xs font-semibold text-rose-700">Status Revisi</span>
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
                      className={`h-full ${item.color}`}
                      style={{ width: `${(item.count / 12) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standar SOP Photogrammetry &amp; Detection STI</span>
            <span className="font-bold text-[#004b87]">Total 12 Active Pipelines</span>
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
              {urgentActions.map((action) => (
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
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="w-full mt-4 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Buka Semua Antrean</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Ringkasan Proyek Terbaru */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Proyek Aktif Utama</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Akses cepat ke detail alur proyek geospasial yang sedang berjalan
            </p>
          </div>
          <FileCheck2 className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Nama Proyek</th>
                <th className="py-3.5 px-4 sm:px-6">Lokasi</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Luas (Ha)</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status Overall</th>
                <th className="py-3.5 px-4 sm:px-6 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr
                onClick={() => router.push("/dashboard/PRJ-001")}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-[#004b87] transition-colors">
                      Pemetaan Topografi &amp; LiDAR Kawasan Inti IKN
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">STI-IKN-2026</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="inline-flex items-center gap-1 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kalimantan Timur</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-slate-900">
                  6,500
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    In Progress (Gate 5)
                  </span>
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-[#004b87] bg-[#004b87]/10 hover:bg-[#004b87] hover:text-white border border-[#004b87]/20 rounded-lg transition-all"
                  >
                    Detail
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}