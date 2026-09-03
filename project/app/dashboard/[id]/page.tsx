"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  Camera,
  FolderArchive,
  Sparkles,
  Map,
  Layers,
  PenTool,
  CheckCircle2,
  Lock,
  User,
  Calendar,
  ChevronRight,
} from "lucide-react";

export interface TimelineStep {
  gateNumber: number;
  title: string;
  href: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  uploadedBy?: string;
  date?: string;
  status: "APPROVED" | "PENDING" | "IN_PROGRESS" | "REVISION" | "LOCKED";
  output: string;
}

const SOP_PIPELINE_STEPS: TimelineStep[] = [
  {
    gateNumber: 1,
    title: "Flight Plan",
    href: "flight-plan",
    subtitle: "Flight Path Planning & GCP",
    description:
      "Area of Interest (AOI) boundary definition, flight altitude, photo overlap, and Ground Control Point (GCP) distribution.",
    icon: FileText,
    uploadedBy: "Oliver",
    date: "20 Jan 2026",
    status: "APPROVED",
    output: "KML File & GCP Coordinates (.csv)",
  },
  {
    gateNumber: 2,
    href: "akuisisi-data",
    title: "Data Acquisition",
    subtitle: "Aerial Photography & Flight Log",
    description:
      "Execution of aerial photography flight using drone/aircraft along with flight log recording.",
    icon: Camera,
    uploadedBy: "Oliver",
    date: "22 Jan 2026",
    status: "APPROVED",
    output: "Flight Log & Raw Capture Data",
  },
  {
    gateNumber: 3,
    title: "Raw Data",
    href: "raw-data",
    subtitle: "Photo & Raw GPS Collection",
    description:
      "Extraction and completeness check of aerial photo files (EXIF/GPS) and base station data.",
    icon: FolderArchive,
    uploadedBy: "Oliver",
    date: "23 Jan 2026",
    status: "APPROVED",
    output: "Raw Photos (GDrive Link)",
  },
  {
    gateNumber: 4,
    title: "Raw Data Enhancement",
    href: "raw-data-enhance",
    subtitle: "Color Correction & Photo Filtering",
    description:
      "Visual quality improvement (radiometric/contrast) and filtering out blurry or cloud-obscured photos.",
    icon: Sparkles,
    uploadedBy: "Clara",
    date: "25 Jan 2026",
    status: "APPROVED",
    output: "Enhanced Photos (GDrive Link)",
  },
  {
    gateNumber: 5,
    title: "Orthophoto",
    href: "orthophoto",
    subtitle: "Photogrammetry Processing & DEM",
    description:
      "Photo alignment, 3D point cloud generation, mesh, elevation (DEM), and Orthomosaic creation.",
    icon: Map,
    uploadedBy: "Clara",
    date: "28 Jan 2026",
    status: "PENDING",
    output: "GeoTIFF Orthomosaic & DEM",
  },
  {
    gateNumber: 6,
    title: "Orthophoto Enhancement",
    href: "orthophoto-enhance",
    subtitle: "Seamless Blending & Visual Refinement",
    description:
      "Artifact removal, color matching, and seamline smoothing.",
    icon: Layers,
    uploadedBy: "-",
    date: "-",
    status: "LOCKED",
    output: "Clean Final GeoTIFF",
  },
  {
    gateNumber: 7,
    title: "Digitization & Detection",
    href: "digitasi-detection",
    subtitle: "Geospatial Feature Extraction & Final Map",
    description:
      "Digitization of geospatial objects/vectors, feature detection, final map layout design, and handover draft.",
    icon: PenTool,
    uploadedBy: "-",
    date: "-",
    status: "LOCKED",
    output: "SHP / CAD / Final PDF Format",
  },
];

// Status Meta Configuration Helper
const getStatusMeta = (status: TimelineStep["status"]) => {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        nodeBg: "bg-emerald-50 text-emerald-600 border-emerald-400",
        line: "bg-emerald-400",
      };
    case "PENDING":
      return {
        label: "Pending Review",
        badge: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
        dot: "bg-amber-500",
        nodeBg: "bg-amber-50 text-amber-600 border-amber-400",
        line: "bg-slate-200",
      };
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        badge: "bg-sky-50 text-sky-700 border-sky-200 animate-pulse",
        dot: "bg-sky-500",
        nodeBg: "bg-sky-50 text-sky-600 border-sky-400",
        line: "bg-slate-200",
      };
    case "REVISION":
      return {
        label: "Revision Needed",
        badge: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
        nodeBg: "bg-rose-50 text-rose-600 border-rose-400",
        line: "bg-slate-200",
      };
    case "LOCKED":
    default:
      return {
        label: "Locked",
        badge: "bg-slate-100 text-slate-500 border-slate-200",
        dot: "bg-slate-400",
        nodeBg: "bg-slate-50 text-slate-400 border-slate-300",
        line: "bg-slate-200",
      };
  }
};

export default function SOPTimelineCard() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || "PRJ-001";

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-800">
      {/* 1. Timeline Progress Visualization */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Timeline Progress
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage-Gate Workflow Visualization for Photogrammetry & Detection
          </p>
        </div>

        {/* Horizontal Timeline Container */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex min-w-[850px] justify-between items-start">
            {SOP_PIPELINE_STEPS.map((step, idx, arr) => {
              const IconComponent = step.icon;
              const isLast = idx === arr.length - 1;
              const meta = getStatusMeta(step.status);

              return (
                <div
                  key={step.gateNumber}
                  onClick={() =>
                    step.status !== "LOCKED" &&
                    router.push(`/dashboard/${id}/${step.href}`)
                  }
                  className={`relative flex-1 flex flex-col items-center group ${
                    step.status !== "LOCKED" ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  {/* Line Connector */}
                  {!isLast && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-[2px] transition-colors duration-300 ${meta.line}`}
                    />
                  )}

                  {/* Node Icon Circle */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm bg-white ${meta.nodeBg} group-hover:scale-105`}
                  >
                    <IconComponent className="w-4 h-4" />

                    {step.status === "APPROVED" && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      </div>
                    )}
                    {step.status === "LOCKED" && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Step Labels */}
                  <div className="mt-3 text-center px-1 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Gate {step.gateNumber}
                    </span>
                    <h3
                      className={`text-xs font-bold leading-tight mb-2 max-w-[110px] truncate ${
                        step.status === "LOCKED"
                          ? "text-slate-400"
                          : "text-slate-900 group-hover:text-[#004b87]"
                      } transition-colors`}
                    >
                      {step.title}
                    </h3>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Step Progress Table */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Step Progress Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data processing history and status across 7 Quality Gates
          </p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6 w-12 text-center">No.</th>
                <th className="py-3.5 px-4 sm:px-6">Stage Name (Gate)</th>
                <th className="py-3.5 px-4 sm:px-6">Uploader</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Submission Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {SOP_PIPELINE_STEPS.map((step) => {
                const meta = getStatusMeta(step.status);

                return (
                  <tr
                    key={step.gateNumber}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 sm:px-6 text-center text-xs font-mono text-slate-400">
                      {String(step.gateNumber).padStart(2, "0")}
                    </td>

                    {/* Gate Title */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-[#004b87] transition-colors">
                          {step.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Gate {step.gateNumber}
                        </span>
                      </div>
                    </td>

                    {/* Uploader */}
                    <td className="py-3.5 px-4 sm:px-6">
                      {step.uploadedBy && step.uploadedBy !== "-" ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{step.uploadedBy}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {step.date && step.date !== "-" ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{step.date}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {step.status !== "LOCKED" ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/${id}/${step.href}`)
                          }
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-[#004b87] bg-[#004b87]/10 hover:bg-[#004b87] hover:text-white border border-[#004b87]/20 rounded-lg transition-all"
                        >
                          Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}