"use client";

import React, { useState } from "react";
import {
  Camera,
  Calendar,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  ExternalLink,
  Wind,
  Sun,
  ShieldCheck,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useParams } from "next/navigation";

export default function DataAcquisitionPage() {
  // Mock Data Field Acquisition
  const acquisitionData = {
    projectCode: "STI-IKN-2026",
    projectName: "Topographic Mapping & LiDAR in IKN Core Area",
    gateNumber: 2,
    gateTitle: "Data Acquisition (Aerial Data Capture)",
    status: "APPROVED", // APPROVED | PENDING | REVISION | IN_PROGRESS
    flightDate: "22 Jan 2026",
    pilot: "Oliver",
    coPilot: "Budi Santoso",
    equipment: "Drone VTOL M300 RTK + Sensor LiDAR Zenmuse L1",
    location: "Sepaku, Penajam Paser Utara, East Kalimantan",
    coverageArea: "1,200 Ha (Flight Session 1-4)",
    weatherCondition: "Clear / Wind 8 km/h (Optimal Condition)",
    flightLogs: [
      {
        session: "Flight 01",
        time: "08:30 - 09:15 WITA",
        altitude: "150m AGL",
        photosCount: 450,
        batteryUsed: "2 Sets (TB60)",
        status: "Success",
      },
      {
        session: "Flight 02",
        time: "10:00 - 10:45 WITA",
        altitude: "150m AGL",
        photosCount: 510,
        batteryUsed: "2 Sets (TB60)",
        status: "Success",
      },
      {
        session: "Flight 03",
        time: "13:30 - 14:15 WITA",
        altitude: "150m AGL",
        photosCount: 480,
        batteryUsed: "2 Sets (TB60)",
        status: "Success",
      },
    ],
    deliverableLink: "https://drive.google.com/drive/folders/sti-raw-capture-ikn-2026",
    notes:
      "All flight grids (1-4) were successfully completed without weather obstacles. GPS base station logs and flight track KML files are fully attached.",
  };

  const params = useParams();
  const id = params?.id;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-800">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href={`/dashboard/${id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#004b87] mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Stages
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-bold">
              {acquisitionData.projectCode}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-[#004b87] uppercase tracking-wider">
              Gate {acquisitionData.gateNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {acquisitionData.gateTitle}
          </h1>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Stage Approved
          </span>
        </div>
      </div>

      {/* Main Info Grid & Field Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Mission Info */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-500 border-b border-slate-100 pb-2">
            <Camera className="w-4 h-4 text-[#004b87]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Equipment &amp; Mission
            </span>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <p className="text-slate-400">Drone / Sensor:</p>
              <p className="font-bold text-slate-900">{acquisitionData.equipment}</p>
            </div>
            <div>
              <p className="text-slate-400">Coverage Area:</p>
              <p className="font-bold text-slate-900">{acquisitionData.coverageArea}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Field Team */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-500 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-[#004b87]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Field Personnel
            </span>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Lead Pilot:</span>
              <span className="font-bold text-slate-900">{acquisitionData.pilot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Co-Pilot / Safety:</span>
              <span className="font-bold text-slate-900">{acquisitionData.coPilot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flight Date:</span>
              <span className="font-bold text-slate-900">{acquisitionData.flightDate}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Field Conditions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-500 border-b border-slate-100 pb-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Field Conditions
            </span>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <p className="text-slate-400">Survey Location:</p>
              <p className="font-bold text-slate-900 truncate">{acquisitionData.location}</p>
            </div>
            <div>
              <p className="text-slate-400">Weather / Wind Speed:</p>
              <p className="font-bold text-emerald-600">{acquisitionData.weatherCondition}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Field Flight Logs (Flight Sessions)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed flight history of aerial imaging per session
            </p>
          </div>
          <Clock className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Flight Session</th>
                <th className="py-3.5 px-4 sm:px-6">Time (WITA)</th>
                <th className="py-3.5 px-4 sm:px-6">Flight Altitude</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Photo Count</th>
                <th className="py-3.5 px-4 sm:px-6">Battery Used</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Log Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {acquisitionData.flightLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                    {log.session}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                    {log.time}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs font-mono text-slate-700">
                    {log.altitude}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center font-mono font-bold text-slate-900">
                    {log.photosCount} Frames
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                    {log.batteryUsed}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Activities Photo Documentation */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#004b87]" />
            <h2 className="text-base font-bold text-slate-900">
              Field Activities Photo Documentation
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">4 Photos Attached</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group cursor-pointer flex items-center justify-center text-slate-400 hover:border-[#004b87] transition-all"
            >
              <div className="text-center p-2">
                <Camera className="w-6 h-6 mx-auto mb-1 text-slate-400 group-hover:text-[#004b87] transition-colors" />
                <span className="text-[10px] font-bold text-slate-500 block">
                  Field Photo 0{item}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverable Section (Raw Data Google Drive Link) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#004b87]" />
            <h2 className="text-base font-bold text-slate-900">
              Acquisition Deliverables
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Field Team Notes
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {acquisitionData.notes}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Raw Data Link (Raw Flight Data &amp; GPS Log)
            </p>
            <a
              href={acquisitionData.deliverableLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-[#004b87] text-slate-700 hover:text-white border border-slate-200 rounded-xl text-xs font-bold transition-all group"
            >
              <UploadCloud className="w-4 h-4 text-[#004b87] group-hover:text-white transition-colors" />
              <span>Open Raw Field Data in Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}