"use client";

import React from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function FlightPlanPage() {
  // Demo Data (Nanti bisa diganti dengan props / data dari database)
  const flightData = {
    projectId: "STI-PG-001",
    projectName: "Pemetaan Jalur Tol Pekanbaru",
    status: "PENDING_APPROVAL", // PENDING_APPROVAL | APPROVED | REVISION_NEEDED
    uploadedBy: "Budi Santoso (Pilot Drone)",
    uploadedAt: "28 Agu 2026, 10:15 WIB",
    parameters: {
      aoiArea: "450 Ha",
      altitude: "120 Meter AGL",
      frontOverlap: "80%",
      sideOverlap: "75%",
      droneModel: "DJI Matrice 300 RTK",
      gcpCount: "12 Titik",
    },
    files: [
      { name: "Flight_Plan_Tol_Pekanbaru_v1.kml", size: "2.4 MB", type: "KML" },
      { name: "Airspace_Permit_Letter.pdf", size: "1.1 MB", type: "PDF" },
      { name: "GCP_Distribution_Coordinates.csv", size: "45 KB", type: "CSV" },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 text-slate-800 font-sans">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${flightData.projectId}`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600"
            title="Kembali ke Detail Proyek"
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
                {flightData.projectId}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Rencana Jalur Terbang & GCP
            </h1>
          </div>
        </div>

        {/* Status Indicator Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            MENUNGGU VERIFIKASI
          </span>
        </div>
      </div>

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
          <div className="relative bg-slate-100 min-h-[420px] flex-1 flex flex-col items-center justify-center p-6 text-center">
            {/* Visual Placeholder untuk Map / Cesium JS / Google Earth Embed */}
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

            <a
              href="https://earth.google.com/web/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ExternalLink className="w-4 h-4 text-[#00a3e0]" />
              Buka di Google Earth Web
            </a>
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
                  {flightData.parameters.aoiArea}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Tinggi Terbang
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {flightData.parameters.altitude}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Overlap Depan
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {flightData.parameters.frontOverlap}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase">
                  Overlap Samping
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {flightData.parameters.sideOverlap}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Model Drone:</span>
                <span className="font-semibold text-slate-800">
                  {flightData.parameters.droneModel}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Jumlah Titik GCP:</span>
                <span className="font-semibold text-slate-800">
                  {flightData.parameters.gcpCount}
                </span>
              </div>
            </div>
          </div>

          {/* Upload Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-xs space-y-2.5">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
              Informasi Pengajuan
            </h3>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>
                Oleh: <strong>{flightData.uploadedBy}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Waktu: {flightData.uploadedAt}</span>
            </div>
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
          {flightData.files.map((file, idx) => (
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
                className="p-2 text-slate-500 hover:text-[#004b87] hover:bg-white rounded-lg transition-colors"
                title="Unduh Berkas"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Verification Action Bar (Khusus Verifikator) */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-white">
            Verifikasi Gate 1: Flight Plan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Periksa kelengkapan overlap, izin terbang, dan sebaran GCP sebelum
            melanjutkan ke Gate 2 (Akuisisi Data).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Tolak / Minta Revisi
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Setujui (Approve)
          </button>
        </div>
      </div>
    </div>
  );
}