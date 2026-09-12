"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  FileCode,
  HardDrive,
  Maximize2,
  Image as ImageIcon,
  Loader2,
  CloudOff,
  FolderArchive,
  Database,
  FileCheck,
} from "lucide-react";

// Menggunakan server action dan komponen shared DriveFileBrowser milikmu
import {
  getDigitalDetectionPageData,
  approveDigitalDetectionGate,
  DriveFileItem,
} from "./actions";

import DriveFileBrowser from "./DriveFileBrowser";

// --- Status Badge Helper ---------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVED: {
      label: "Digital Detection Verified",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    PENDING_APPROVAL: {
      label: "Pending Verification",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    REVISION_NEEDED: {
      label: "Revision Needed",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
    NOT_UPLOADED: {
      label: "Not Uploaded",
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

// --- Page Component ----------------------------------------------------------
export default function DigitalDetectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    role: "uploader" | "verifier";
  } | null>(null);

  // 1. Fetch data from server action by projectId & sync user role
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);

      const level = localStorage.getItem("userLevel")?.toLowerCase();
      const name = localStorage.getItem("userName") || "User";
      const isVerifier =
        level === "verifikator" || level === "verifier" || level === "admin";

      setCurrentUser({
        name: name,
        role: isVerifier ? "verifier" : "uploader",
      });

      const result = await getDigitalDetectionPageData(id);
      if (result.success && result.data) {
        setData(result.data);

        const fetchedFiles: DriveFileItem[] = result.data.files || [];
        const firstTiff = fetchedFiles.find(
          (f) => f.extension === "TIF" || f.extension === "TIFF" || f.isImage,
        );
        setSelectedFile(firstTiff || fetchedFiles[0] || null);
      } else {
        setError(
          result.error ??
            "An error occurred while fetching Digital Detection data from the server.",
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
      const storedUserId = localStorage.getItem("userId") || currentUser?.id;
      const res = await approveDigitalDetectionGate(data.projectId, storedUserId);
      if (res.success) {
        setData((prev: any) => ({ ...prev, status: "APPROVED" }));
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("An error occurred while approving Digital Detection.");
    } finally {
      setIsApproving(false);
    }
  };

  // Utility to upgrade Google Drive thumbnail quality from =s220 to High-Res =s1600
  const getHighResThumbnail = (link?: string) => {
    if (!link) return null;
    return link.replace(/=s\d+/, "=s1600");
  };

  // --- State Loading ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
        <span className="text-xs font-semibold">
          Loading Digital Detection data (Gate 7)...
        </span>
      </div>
    );
  }

  // --- State Fallback Error ---
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <CloudOff className="w-12 h-12 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">Failed to Load Data</h2>
        <p className="text-sm text-slate-500 max-w-sm">{error}</p>
        <Link
          href={`/dashboard/${id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#004b87] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const hasFiles = data.files && data.files.length > 0;
  const hasDriveLink = !!data.driveLink;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-800">
      {/* --- Navigation & Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href={`/dashboard/${data.projectId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#004b87] mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Pipeline
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-bold">
              {data.projectId.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-[#004b87] uppercase tracking-wider">
              Gate 7
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Digital Detection
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
                  <span>Processing...</span>
                </>
              ) : data.status === "APPROVED" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Digital Detection Verified</span>
                </>
              ) : (
                <span>Approve Digital Detection</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* --- Drive Error Banner --- */}
      {data.error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              Unable to retrieve file list from Google Drive
            </p>
            <p className="text-xs text-amber-700 mt-0.5">{data.error}</p>
          </div>
        </div>
      )}

      {/* --- Status: Drive link not found --- */}
      {!hasDriveLink && (
        <div className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
          <CloudOff className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-500">
            No Google Drive folder linked yet
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            Upload progress on Gate 7 with a Google Drive folder URL to view
            file contents directly here.
          </p>
        </div>
      )}

      {/* --- CARD 2: LIST FILE BROWSER (Shared DriveFileBrowser Component) --- */}
      {hasDriveLink && (
        <DriveFileBrowser
          files={data.files}
          driveLink={data.driveLink!}
          totalFiles={data.totalFiles}
        />
      )}

      {/* --- Direct Cloud Access Footer --- */}
      {hasDriveLink && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Access Digital Detection Storage Folder
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All digital detection and vectorization files are organized in
              Google Drive and ready for download or GIS integration.
            </p>
          </div>

          <a
            href={data.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004b87] hover:bg-[#003763] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Open Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
  
