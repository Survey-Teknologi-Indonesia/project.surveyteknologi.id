"use client";

import React, { useEffect, useState } from "react";
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
  Upload,
  Check,
  X,
  ShieldCheck,
  UploadCloud,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Building2,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { getCurrentUser } from "@/app/login/actions";
import {
  getProjectStepsData,
  submitStepProgress,
  StepProgressItem,
  ProjectInfo,
  AccountOption,
} from "./actions";

// Mapping icon berdasarkan gateNumber / step_number
const GATE_ICONS: Record<number, React.ElementType> = {
  1: FileText,
  2: Camera,
  3: FolderArchive,
  4: Sparkles,
  5: Map,
  6: Layers,
  7: PenTool,
};

const getStatusMeta = (status: StepProgressItem["status"]) => {
  switch (status) {
    case "PENDING_UPLOAD":
      return {
        label: "Pending Upload",
        badge: "bg-sky-50 text-sky-700 border-sky-200",
        dot: "bg-sky-500",
        nodeBg: "bg-sky-50 text-sky-600 border-sky-400",
        line: "bg-sky-200",
      };
    case "APPROVED":
      return {
        label: "Approved",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        nodeBg: "bg-emerald-50 text-emerald-600 border-emerald-400",
        line: "bg-emerald-400",
      };
    case "PENDING_APPROVAL":
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

  const rawId = params?.id;
  const id = rawId ? (Array.isArray(rawId) ? rawId[0] : rawId) : "";

  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name: string;
    role: "uploader" | "verifier" | "verifikator";
  } | null>(null);

  // State data dari DB
  const [steps, setSteps] = useState<StepProgressItem[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Modal Upload Data (Disesuaikan dengan tabel 'progress')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<StepProgressItem | null>(
    null,
  );
  const [uploadBy, setUploadBy] = useState<string>("");
  const [uploadDate, setUploadDate] = useState<string>("");
  const [documentLink, setDocumentLink] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load user session & data dari database
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await getProjectStepsData(id);
    if (res.success) {
      setSteps(res.steps);
      setProject(res.project || null);
      setAccounts(res.accounts || []);
    } else {
      setErrorMessage(res.error || "Failed to load stages from database.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setIsMounted(true);

    async function init() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const role =
            user.role === "verifikator" || user.role === "verifier"
              ? "verifier"
              : "uploader";
          setCurrentUser({
            id: user.id,
            name: user.name || "User",
            role: role,
          });
        }
      } catch (error) {
        setCurrentUser({ name: "Nindy", role: "uploader" });
      }

      await loadData();
    }

    init();
  }, [id]);

  const isVerifier = currentUser?.role === "verifier";

  // Open upload modal with default data matching 'progress' table
  const handleOpenUploadModal = (step: StepProgressItem) => {
    setSelectedStep(step);
    setModalError(null);
    setDocumentLink(step.document_link || "");
    // Default uploadDate to existing date or today (YYYY-MM-DD)
    setUploadDate(step.rawDate || new Date().toISOString().split("T")[0]);
    // Default uploadBy to existing uploader or currentUser or first account
    const defaultUser =
      step.uploadById ||
      currentUser?.id ||
      accounts.find((a) => a.role === "uploader")?.account_id ||
      accounts[0]?.account_id ||
      "";
    setUploadBy(defaultUser);
    setIsUploadModalOpen(true);
  };

  // Submit data to 'progress' table
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStep) return;

    if (!documentLink.trim()) {
      setModalError("Document link (document_link) is required.");
      return;
    }

    if (!uploadBy) {
      setModalError("Please select an uploader account (upload_by).");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await submitStepProgress({
      projectId: id,
      stepId: selectedStep.step_id,
      uploadBy: uploadBy,
      uploadDate: uploadDate || new Date().toISOString().split("T")[0],
      documentLink: documentLink.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      setToastMessage(
        `Deliverable data for ${selectedStep.title} successfully saved!`,
      );
      setIsUploadModalOpen(false);
      setDocumentLink("");
      loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setModalError(res.error || "Failed to save progress data.");
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
        <p className="text-xs font-semibold">
          Loading SOP stages from database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans text-slate-800">
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

      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-400">
              ID: {id ? id.slice(0, 8) : "N/A"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {project?.project_name || "Mapping & Photogrammetry Project"}
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
            {project?.client && (
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {project.client}
              </span>
            )}
            {project?.start_date && (
              <span className="inline-flex items-center gap-1 font-mono text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {project.start_date}{" "}
                {project.end_date ? `to ${project.end_date}` : ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected: public.progress &amp; public.step
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            title="Reload Progress"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#004b87]" />
            <span>
              Role:{" "}
              <strong className="text-[#004b87] uppercase">
                {currentUser?.role || "Uploader"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Timeline Progress Visualization */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="mb-6 border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Timeline Progress
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Stage-Gate Workflow Visualization for Photogrammetry &amp;
              Detection (SOP STI)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 pt-2">
          <div className="flex min-w-[850px] justify-between items-start">
            {steps.map((step, idx, arr) => {
              const IconComponent = GATE_ICONS[step.gateNumber] || Layers;
              const isLast = idx === arr.length - 1;
              const meta = getStatusMeta(step.status);

              return (
                <div
                  key={step.step_id || step.gateNumber}
                  onClick={() =>
                    step.status !== "LOCKED" &&
                    router.push(`/dashboard/${id}/${step.href}`)
                  }
                  className={`relative flex-1 flex flex-col items-center group ${
                    step.status !== "LOCKED"
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                >
                  {!isLast && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-[2px] transition-colors duration-300 ${meta.line}`}
                    />
                  )}

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
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                      />
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
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Step Progress Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              7 Quality Gates workflow data from PostgreSQL database
            </p>
          </div>
          <span className="text-xs font-bold text-[#004b87] bg-[#004b87]/10 px-3 py-1 rounded-full">
            Total {steps.length} Stages
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6 w-12 text-center">No.</th>
                <th className="py-3.5 px-4 sm:px-6">Stage Name (Gate)</th>
                <th className="py-3.5 px-4 sm:px-6">Uploader (upload_by)</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">
                  Date (upload_date)
                </th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-center w-48">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {steps.map((step) => {
                const meta = getStatusMeta(step.status);

                return (
                  <tr
                    key={step.step_id || step.gateNumber}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 text-center text-xs font-mono text-slate-400">
                      {String(step.gateNumber).padStart(2, "0")}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-[#004b87] transition-colors">
                          {step.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Gate {step.gateNumber}
                          </span>
                          {step.document_link && (
                            <a
                              href={step.document_link}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] text-[#004b87] hover:underline font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Document
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6">
                      {step.uploadedBy && step.uploadedBy !== "-" ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{step.uploadedBy}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          -
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {step.date && step.date !== "-" ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{step.date}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">
                          -
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}
                        />
                        {meta.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {/* LOCKED */}
                      {step.status === "LOCKED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}

                      {/* VERIFIER ON PENDING REVIEW */}
                      {isVerifier && step.status === "PENDING_APPROVAL" && (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/dashboard/${id}/${step.href}`)
                            }
                            className="px-3 py-1.5 text-xs font-bold text-[#004b87] bg-[#004b87]/10 hover:bg-[#004b87] hover:text-white border border-[#004b87]/20 rounded-lg transition-all"
                          >
                            Review &amp; QC
                          </button>
                        </div>
                      )}
                      {isVerifier && step.status === "PENDING_UPLOAD" && (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg">
                            <Lock className="w-3 h-3" />
                            Waiting for Upload
                          </span>
                        </div>
                      )}

                      {/* UPLOADER ACTION */}
                      {!isVerifier &&
                        (step.status === "IN_PROGRESS" ||
                          step.status === "REVISION" ||
                          step.status === "PENDING_UPLOAD") && (
                          <button
                            type="button"
                            onClick={() => handleOpenUploadModal(step)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#004b87] hover:bg-[#003763] rounded-lg shadow-sm transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload Data
                          </button>
                        )}

                      {/* STANDARD DETAILS VIEW */}
                      {((isVerifier &&
                        step.status !== "PENDING_APPROVAL" &&
                        step.status !== "PENDING_UPLOAD") ||
                        (!isVerifier &&
                          step.status !== "IN_PROGRESS" &&
                          step.status !== "REVISION" &&
                          step.status !== "PENDING_UPLOAD")) &&
                        step.status !== "LOCKED" && (
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
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL FORM UPLOAD */}
      {isUploadModalOpen && selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#004b87] uppercase tracking-wider">
                  Gate {selectedStep.gateNumber} Deliverable
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Upload Deliverable: {selectedStep.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* 1. Target Step (step_id) & Project Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    Stage (step_id):
                  </span>
                  <span className="font-bold text-slate-900">
                    Gate {selectedStep.gateNumber} - {selectedStep.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    Output Format:
                  </span>
                  <span className="font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedStep.output}
                  </span>
                </div>
                {project && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                    <span className="font-semibold text-slate-500">
                      Project (project_id):
                    </span>
                    <span className="font-semibold text-[#004b87] truncate max-w-[240px]">
                      {project.project_name}
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Pengunggah (upload_by UUID) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Uploader (upload_by){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    required
                    value={uploadBy}
                    onChange={(e) => setUploadBy(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87]/20 transition-all text-slate-800 font-medium"
                  >
                    <option value="">-- Select Uploader Account --</option>
                    {accounts.map((acc) => (
                      <option key={acc.account_id} value={acc.account_id}>
                        {acc.name} ({acc.role}) - {acc.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Tanggal Upload (upload_date DATE) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Date (upload_date){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87]/20 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* 4. Link Dokumen (document_link TEXT) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  File / Document Link (document_link){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or https://s3..."
                    value={documentLink}
                    onChange={(e) => setDocumentLink(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#004b87] focus:ring-1 focus:ring-[#004b87]/20 transition-all text-slate-800"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter cloud storage URL (Google Drive, Dropbox, AWS S3)
                  where the deliverable is stored.
                </p>
              </div>

              {/* Info Approval State */}
              <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl text-[11px] text-sky-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <span>
                  Once submitted, the deliverable will be queued for verification until validated by a verifier.
                </span>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#004b87] hover:bg-[#003763] rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving Progress...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Save Progress Data
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
