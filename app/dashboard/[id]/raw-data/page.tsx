"use client";

import React from "react";
import {
  FolderArchive,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  HardDrive,
  MapPin,
  FileCode,
  Image as ImageIcon,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";


export default function RawDataPage() {
  // Mock Data untuk Gate 3: Raw Data
  const rawDataDetails = {
    projectCode: "STI-IKN-2026",
    projectName: "Pemetaan Topografi & LiDAR Kawasan Inti IKN",
    gateNumber: 3,
    gateTitle: "Raw Data (Collection & Technical Verification)",
    status: "APPROVED", // APPROVED | PENDING | REVISION | LOCKED
    verifiedBy: "Oliver",
    verificationDate: "23 Jan 2026",
    totalStorageGB: "42.8 GB",
    totalPhotos: 1440,
    driveLink: "https://drive.google.com/drive/folders/sti-raw-data-ikn-2026",
    fileBreakdown: [
      {
        category: "Aerial Imagery (EXIF Photo)",
        count: "1,440 Files (.JPG / .DNG)",
        size: "34.2 GB",
        status: "VALID",
        notes: "EXIF geotag & Timestamp lengkap di seluruh frame",
      },
      {
        category: "LiDAR Point Cloud Raw",
        count: "4 Files (.LAS / .RBN)",
        size: "6.5 GB",
        status: "VALID",
        notes: "Tersimpan lengkap dari sensor Zenmuse L1",
      },
      {
        category: "Base Station Data (GNSS/PPK)",
        count: "2 Files (.OBS / .26O)",
        size: "180 MB",
        status: "VALID",
        notes: "File RINEX pengamatan base 8 jam penuh",
      },
      {
        category: "Ground Control Point (GCP)",
        count: "1 File (.CSV) + 12 Pre-mark Photos",
        size: "25 MB",
        status: "VALID",
        notes: "12 Titik GCP & 4 Titik ICP terukur presisi",
      },
    ],
    technicalChecks: [
      { label: "File Corrupt Check", passed: true, detail: "0 file rusak dari total 1,446 berkas" },
      { label: "EXIF Geotag Metadata", passed: true, detail: "Lat, Long, Alt terekam di setiap foto" },
      { label: "Base Station RINEX Continuity", passed: true, detail: "Interval perekaman 1Hz tanpa terputus" },
      { label: "GCP Coordinate System", passed: true, detail: "Format WGS84 / UTM Zone 50S terverifikasi" },
    ],
  };

  const params = useParams();
  const id = params?.id


  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-800">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href={`/dashboard/${id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#004b87] mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Kembali ke Step 
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-bold">
              {rawDataDetails.projectCode}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-[#004b87] uppercase tracking-wider">
              Gate {rawDataDetails.gateNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {rawDataDetails.gateTitle}
          </h1>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Raw Data Verified
          </span>
        </div>
      </div>

      {/* Ringkasan Metrik Berkas Digital */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kapasitas</span>
            <HardDrive className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {rawDataDetails.totalStorageGB}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Jumlah Foto Luft</span>
            <ImageIcon className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {rawDataDetails.totalPhotos.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-500">Frame</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pemeriksa File</span>
            <FileCheck className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">
            {rawDataDetails.verifiedBy}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {rawDataDetails.verificationDate}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Integritas Berkas</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">100% Valid</p>
        </div>
      </div>

      {/* Tabel Rincian Kategori File Digital */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Rincian Kategori Berkas Digital Mentah
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Struktur dan kuantitas file yang telah diunggah dan diverifikasi kelengkapannya
            </p>
          </div>
          <FolderArchive className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Kategori Berkas</th>
                <th className="py-3.5 px-4 sm:px-6">Jumlah File</th>
                <th className="py-3.5 px-4 sm:px-6">Ukuran</th>
                <th className="py-3.5 px-4 sm:px-6">Catatan Verifikasi</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rawDataDetails.fileBreakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs font-mono text-slate-700">
                    {item.count}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs font-mono text-slate-700">
                    {item.size}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                    {item.notes}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checklist Validasi Teknis Data Mentah */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Checklist QC Teknis Data Mentah
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rawDataDetails.technicalChecks.map((check, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">{check.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Cloud Access */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Akses Folder Penyimpanan Raw Data
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh berkas mentah tersimpan dalam folder Google Drive terstruktur yang siap untuk diolah di Gate 4.
          </p>
        </div>

        <a
          href={rawDataDetails.driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004b87] hover:bg-[#003763] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <FolderArchive className="w-4 h-4" />
          <span>Buka Google Drive Raw Data</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}