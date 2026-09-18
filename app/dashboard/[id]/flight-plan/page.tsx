"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Map,
  Plane,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  ShieldCheck,
  FileText,
  FolderArchive,
  Layers,
  FileCode,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { getCurrentUser } from "@/app/login/actions";
import {
  getFlightPlanPageData,
  approveFlightPlanGate,
  rejectFlightPlanGate,
  RawDataPageData,
  DriveFileItem,
} from "./actions";
import DriveFileBrowser from "./DriveFileBrowser";
import KmlMapViewer from "@/app/componets/kmlViewer";

// ─── Status Badge Helper ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVED: {
      label: "Flight Plan Approved",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    PENDING_APPROVAL: {
      label: "Pending Verification",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    REVISION_NEEDED: {
      label: "Revision Needed",
      cls: "bg-rose-50 text-rose-700 border-rose-200",
    },
    NOT_UPLOADED: {
      label: "Not Uploaded",
      cls: "bg-slate-100 text-slate-500 border-slate-200",
    },
  };

  const s = map[status] ?? map["NOT_UPLOADED"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${s.cls}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status === "APPROVED"
            ? "bg-emerald-500"
            : status === "PENDING_APPROVAL"
              ? "bg-amber-500 animate-pulse"
              : status === "REVISION_NEEDED"
                ? "bg-rose-500"
                : "bg-slate-400"
        }`}
      />
      {s.label}
    </span>
  );
}

export default function FlightPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [flightData, setFlightData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    role: "uploader" | "verifier";
  } | null>(null);

  // Load data from Server Action
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    // Sync user role from localStorage / Auth
    const level = localStorage.getItem("userLevel")?.toLowerCase();
    const name = localStorage.getItem("userName") || "User";
    const isVerifier =
      level === "verifikator" || level === "verifier" || level === "admin";

    setCurrentUser({
      name: name,
      role: isVerifier ? "verifier" : "uploader",
    });

    const res = await getFlightPlanPageData(id);
    if (res.success && res.data) {
      setFlightData(res.data);

      // Select first KML file or image as default preview
      const fetchedFiles: DriveFileItem[] = res.data.files || [];
      const firstKmlOrImage = fetchedFiles.find(
        (f) => f.extension === "KML" || f.extension === "KMZ" || f.isImage,
      );
      setSelectedFile(firstKmlOrImage || fetchedFiles[0] || null);
    } else {
      setError(
        res.error ??
          "An error occurred while fetching Flight Plan data from database.",
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Handle Action Approval Gate 1
  const handleApproval = async () => {
    if (!flightData || flightData.status === "APPROVED" || isApproving) return;

    setIsApproving(true);
    try {
      const storedUserId = localStorage.getItem("userId") || currentUser?.id;
      const res = await approveFlightPlanGate(
        flightData.projectId,
        storedUserId,
      );
      if (res.success) {
        setFlightData((prev: any) => ({ ...prev, status: "APPROVED" }));
        setToastMessage("Gate 1 (Flight Plan) successfully approved!");
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(res.message || "Failed to approve stage.");
      }
    } catch (err) {
      alert("An error occurred while verifying Flight Plan.");
    } finally {
      setIsApproving(false);
    }
  };
  const openRejectModal = () => {
    if (!flightData || flightData.status === "REVISION_NEEDED" || isRejected)
      return;
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  // Eksekusi penolakan dari dalam modal
  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Fill the rejection message first");
      return;
    }

    setIsRejected(true);
    try {
      const storedUserId = localStorage.getItem("userId") || currentUser?.id;

      // Kirim rejectionReason ke API (sesuaikan parameter API jika backend menerima pesan)
      const res = await rejectFlightPlanGate(
        flightData.projectId,
        storedUserId,
        rejectionReason,
      );

      if (res.success) {
        setFlightData((prev: any) => ({ ...prev, status: "REVISION_NEEDED" }));
        setToastMessage("Gate 1 (Flight Plan) rejected!");
        setIsRejectModalOpen(false);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(res.message || "Failed to reject stage.");
      }
    } catch (err) {
      alert("An error occurred while verifying Digital Detection.");
    } finally {
      setIsRejected(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500 font-sans min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
        <p className="text-xs font-semibold">
          Loading Flight Plan data (Gate 1)...
        </p>
      </div>
    );
  }

  if (error || !flightData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center font-sans">
        <AlertCircle className="w-12 h-12 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-700">
          Failed to Load Data
        </h2>
        <p className="text-sm text-slate-500 max-w-sm">{error}</p>
        <Link
          href={`/dashboard/${id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#004b87] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const hasFiles = flightData.files && flightData.files.length > 0;
  const hasDriveLink = !!flightData.driveLink;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 text-slate-800 font-sans relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-emerald-900/95 text-white border border-emerald-500 shadow-2xl backdrop-blur-md animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${flightData.projectId}`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600"
            title="Back to Dashboard"
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
                ID: {flightData.projectId.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {flightData.projectName}
            </h1>
            {flightData.client && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Client: {flightData.client}
              </p>
            )}
          </div>
        </div>

        {/* Status Indicator & Refresh */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            title="Reload Data"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {/* Action / Status Section */}
          <div className="flex items-center gap-3">
            {currentUser?.role === "uploader" ? (
              <StatusBadge status={flightData.status} />
            ) : (
              <div className="flex flex-row gap-4">
                <button
                  type="button"
                  onClick={handleApproval}
                  disabled={flightData.status === "APPROVED" || isApproving}
                  className={` items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    flightData.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed"
                      : "bg-[#004b87] hover:bg-[#003763] text-white cursor-pointer"
                  } ${flightData.status === "REVISION_NEEDED" ? "hidden" : "inline-flex"}`}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : flightData.status === "APPROVED" ? (
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
                  onClick={openRejectModal}
                  disabled={
                    flightData.status === "REVISION_NEEDED" || isRejected
                  }
                  className={` items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    flightData.status === "REVISION_NEEDED"
                      ? "bg-red-50 text-red-700 border border-red-200 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                  } ${flightData.status === "APPROVED" ? "hidden" : "inline-flex"}`}
                >
                  {isRejected ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : flightData.status === "REVISION_NEEDED" ? (
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
      </div>

      {/* 2. CARD PREVIEW & PREVIEW VIEWER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Map className="w-4 h-4 text-[#004b87] shrink-0" />
            <h2 className="text-sm font-bold text-slate-800">
              Flight Plan Path &amp; Document Preview
            </h2>
            {selectedFile && (
              <span className="text-xs font-mono text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded ml-2 truncate max-w-xs sm:max-w-md">
                {selectedFile.name}
              </span>
            )}
          </div>
          {selectedFile && (
            <a
              href={selectedFile.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#004b87] hover:underline shrink-0"
            >
              <span>Open Drive File</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* PETA SPASIAL KML INTERAKTIF */}
        <div className="p-2 bg-slate-100">
          <KmlMapViewer file={selectedFile} />
        </div>
      </div>

      {/* 3. Shared File Browser Komponen */}
      {hasDriveLink ? (
        <DriveFileBrowser
          files={flightData.files}
          driveLink={flightData.driveLink!}
          totalFiles={flightData.totalFiles}
          selectedFileId={selectedFile?.id}
          onSelectFile={(file) => setSelectedFile(file)}
        />
      ) : (
        <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
          No Google Drive link associated with this stage yet.
        </div>
      )}

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Rejection Reason
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please provide feedback or the reason why Digital Detection is
              being rejected.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason here..."
              rows={4}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={isRejected}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRejection}
                disabled={isRejected || !rejectionReason.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isRejected ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
