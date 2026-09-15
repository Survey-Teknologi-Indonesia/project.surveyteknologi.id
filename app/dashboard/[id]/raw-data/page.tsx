"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  FolderArchive,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  HardDrive,
  XCircle,
  Image as ImageIcon,
  Database,
  CloudOff,
  Loader2,
} from "lucide-react";

import { getRawDataPageData, approveRawDataGate, rejectRawDataGate, RawDataPageData } from "./actions";
import DriveFileBrowser, { ExtBadge } from "./DriveFileBrowser";

// ─── Status Badge Helper ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVED: {
      label: "Raw Data Verified",
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

// ─── Single Page Component ──────────────────────────────────────────────────
export default function RawDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unbox params promise
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRejected, setIsRejected] = useState(false);

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    role: "uploader" | "verifier";
  } | null>(null);

  // 1. Fetch data from server & sync user role
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);

      // User role sync
      const level = localStorage.getItem("userLevel")?.toLowerCase();
      const name = localStorage.getItem("userName") || "User";
      const isVerifier =
        level === "verifikator" || level === "verifier" || level === "admin";

      setCurrentUser({
        name: name,
        role: isVerifier ? "verifier" : "uploader",
      });

      // Server Data Fetching
      const result = await getRawDataPageData(id);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(
          result.error ?? "An error occurred while fetching data from server.",
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

      const res = await approveRawDataGate(data.projectId, storedUserId);
      if (res.success) {
        setData((prev: any) => ({ ...prev, status: "APPROVED" }));
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("An error occurred while verifying stage.");
    } finally {
      setIsApproving(false);
    }
  };

  // 3. Handle Reject Action
    const handleRejection = async () => {
      if (!data || data.status === "REVISION_NEEDED" || isRejected) return;
  
      setIsRejected(true);
      try {
        const storedUserId = localStorage.getItem("userId") || currentUser?.id;
        const res = await rejectRawDataGate(
          data.projectId,
          storedUserId,
        );
        if (res.success) {
          setData((prev: any) => ({ ...prev, status: "REVISION_NEEDED" }));
          setToastMessage("Gate 1 (Flight Plan) rejected!");
          setTimeout(() => setToastMessage(null), 4000);
        } else {
          alert(res.message || "Failed to reject stage.");
        }
      } catch (err) {
        alert("An error occurred while verifying Flight Plan.");
      } finally {
        setIsRejected(false);
      }
    };
  // State Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
        <span className="text-xs font-semibold">
          Loading Raw Data (Gate 3)...
        </span>
      </div>
    );
  }

  // State Fallback Error
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
      {/* ── Navigation & Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            href={`/dashboard/${data.projectId}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#004b87] mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Stages
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-bold">
              {data.projectId.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-[#004b87] uppercase tracking-wider">
              Gate {data.gateNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {data.gateTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{data.projectName}</p>
        </div>

        {/* Action / Status Section */}
        <div className="flex items-center gap-3">
          {currentUser?.role === "uploader" ? (
            <StatusBadge status={data.status} />
          ) : (
              <div className="flex flex-row gap-4">
                <button
                  type="button"
                  onClick={handleApproval}
                  disabled={data.status === "APPROVED" || isApproving}
                  className={` items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    data.status === "APPROVED" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                      : "bg-[#004b87] hover:bg-[#003763] text-white cursor-pointer"
                  } ${data.status === "REVISION_NEEDED" ? "hidden" : "inline-flex"}`}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : data.status === "APPROVED" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Flight Plan Verified</span>
                    </>
                  ) : (
                    <span>Approve Flight Plan</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRejection}
                  disabled={data.status === "REVISION_NEEDED" || isRejected}
                  className={` items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    data.status === "REVISION_NEEDED"
                      ? "bg-red-50 text-red-700 border border-red-200 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  } ${data.status === "APPROVED" ? "hidden" : "inline-flex"}`}
                >
                  {isRejected ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : data.status === "REVISION_NEEDED" ? (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Flight Plan Rejected</span>
                    </>
                  ) : (
                    <span>Reject Flight Plan</span>
                  )}
                </button>
              </div>
          )}
        </div>
      </div>

      {/* ── Metric Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Capacity
            </span>
            <HardDrive className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {hasFiles ? data.formattedStorage : "–"}
          </p>
          {!hasFiles && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              No files yet
            </p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Aerial Photo Count
            </span>
            <ImageIcon className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {hasFiles ? data.totalImages.toLocaleString("en-US") : "–"}
            {hasFiles && (
              <span className="text-xs font-normal text-slate-500 ml-1">
                Frames
              </span>
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              File Uploader
            </span>
            <FileCheck className="w-4 h-4 text-[#004b87]" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">
            {data.uploadedBy}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {data.uploadedAt}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Files
            </span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {hasFiles ? data.totalFiles.toLocaleString("en-US") : "–"}
          </p>
          {hasFiles && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Files from Google Drive
            </p>
          )}
        </div>
      </div>

      {/* ── Drive Error Banner ── */}
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

      {/* ── Status: Drive not linked ── */}
      {!hasDriveLink && (
        <div className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
          <CloudOff className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-500">
            No Google Drive link connected yet
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            Upload progress for Gate 3 with a Google Drive folder link to view files directly here.
          </p>
        </div>
      )}

      {/* ── Drive File Category Summary ── */}
      {hasFiles && data.categories && data.categories.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Drive File Category Summary
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically categorized based on Google Drive file extensions
              </p>
            </div>
            <FolderArchive className="w-5 h-5 text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Category</th>
                  <th className="py-3.5 px-4 sm:px-6">Format</th>
                  <th className="py-3.5 px-4 sm:px-6">File Count</th>
                  <th className="py-3.5 px-4 sm:px-6">Total Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.categories.map((cat: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                      {cat.category}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex flex-wrap gap-1">
                        {cat.extensions.slice(0, 5).map((ext: string) => (
                          <ExtBadge key={ext} ext={ext} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-700">
                      {cat.count.toLocaleString("en-US")} files
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-700">
                      {cat.size}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Live File Browser ── */}
      {hasDriveLink && (
        <DriveFileBrowser
          files={data.files}
          driveLink={data.driveLink!}
          totalFiles={data.totalFiles}
        />
      )}

      {/* ── Direct Cloud Access ── */}
      {hasDriveLink && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Raw Data Storage Folder Access
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All raw files are stored in a structured Google Drive folder ready for processing in Gate 4.
            </p>
          </div>

          <a
            href={data.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#004b87] hover:bg-[#003763] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <FolderArchive className="w-4 h-4" />
            <span>Open Raw Data Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
