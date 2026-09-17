"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  FileCheck2,
  Plus,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getDashboardData,
  createProject,
  ProjectRecord,
  DashboardMetrics,
  GateItem,
} from "./actions";

export default function OverviewPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State data dari DB
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalAreaHa: 0,
    pendingVerifications: 0,
    revisionsNeeded: 0,
  });
  const [gateDistribution, setGateDistribution] = useState<GateItem[]>([
    { gate: "Gate 1", title: "Flight Plan", count: 0, color: "bg-emerald-500" },
    {
      gate: "Gate 2",
      title: "Data Acquisition",
      count: 0,
      color: "bg-emerald-500",
    },
    { gate: "Gate 3", title: "Raw Data", count: 0, color: "bg-emerald-500" },
    {
      gate: "Gate 4",
      title: "Raw Data Enhance",
      count: 0,
      color: "bg-emerald-500",
    },
    { gate: "Gate 5", title: "Orthophoto", count: 0, color: "bg-amber-500" },
    {
      gate: "Gate 6",
      title: "Orthophoto Enhance",
      count: 0,
      color: "bg-[#004b87]",
    },
    {
      gate: "Gate 7",
      title: "Digitization & Detection",
      count: 0,
      color: "bg-slate-400",
    },
  ]);
  const [urgentActions, setUrgentActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Modal Tambah Proyek State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields disesuaikan dengan DB: project_name, client, start_date, end_date
  const [formData, setFormData] = useState({
    project_name: "",
    client: "",
    start_date: "",
    end_date: "",
  });

  // Fetch data dari database
  const fetchData = async () => {
    setIsLoading(true);
    setDbError(null);
    const result = await getDashboardData();
    if (result.success && result.data) {
      setProjects(result.data.projects);
      setMetrics(result.data.metrics);
      if (result.data.gateDistribution.length > 0) {
        setGateDistribution(result.data.gateDistribution);
      }
      setUrgentActions(result.data.urgentActions);
    } else {
      setDbError(result.error || "Failed to connect to database");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle submit form tambah project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_name.trim()) {
      setFormError("Project name is required.");
      return;
    }
    if (!formData.client.trim()) {
      setFormError("Client name is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const res = await createProject({
      project_name: formData.project_name,
      client: formData.client,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.project) {
      // Reset form & close modal
      setFormData({
        project_name: "",
        client: "",
        start_date: "",
        end_date: "",
      });
      setIsModalOpen(false);
      setToastMessage("New project added to database successfully!");
      // Refresh data
      fetchData();
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      setFormError(res.error || "Failed to save project. Please try again.");
    }
  };

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Logika pembacaan status baru
  const getProjectStatus = (statusStr: string | undefined | null) => {
    switch (statusStr) {
      case "Complete":
        return {
          label: "Complete",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "On Going":
        return {
          label: "On Going",
          color: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "added":
      default:
        return {
          label: "Added",
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4 font-sans text-slate-800 relative">
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

      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Summary Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Neon DB
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Executive summary of operational status, 7-Gate workflow pipeline,
            and STI project metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchData}
            title="Refresh Data"
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            View All Projects
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* Add Project Button */}
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      {/* Database Error Banner */}
      {dbError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Database Connection Issue:</span>{" "}
            {dbError}
          </div>
        </div>
      )}

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Projects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? "-" : metrics.totalProjects}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              {isLoading ? "..." : `${metrics.activeProjects} Active`}
            </span>
          </div>
        </div>

        {/* Metric 2: Completed */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Projects
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">
              {isLoading ? "-" : metrics.completedProjects}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Completed
            </span>
          </div>
        </div>

        {/* Metric 3: Pending Verification */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending Verification
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-600">
              {isLoading ? "-" : metrics.pendingVerifications}
            </span>
            <span className="text-xs font-semibold text-amber-700">
              Review Queue
            </span>
          </div>
        </div>

        {/* Metric 4: SOP Gates */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SOP Standards
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">7 Gates</span>
            <span className="text-xs font-semibold text-[#004b87] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
              Stage-Gate
            </span>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Stage-Gate Pipeline & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gate Status Distribution (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Project Distribution by Quality Gate (7-Stage SOP)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Number of active projects in progress across each stage
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
                      {item.gate}:{" "}
                      <span className="font-normal text-slate-500">
                        {item.title}
                      </span>
                    </span>
                    <span className="font-mono text-slate-900 font-bold">
                      {item.count} Projects
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{
                        width: `${
                          metrics.totalProjects > 0
                            ? Math.min(
                                100,
                                (item.count / metrics.totalProjects) * 100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>STI Photogrammetry &amp; Detection SOP Standard</span>
            <span className="font-bold text-[#004b87]">
              Total {metrics.totalProjects} Registered Projects
            </span>
          </div>
        </div>

        {/* Action Center / Urgent Items (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Action Center
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                {urgentActions.length} Rejections
              </span>
            </div>

            {/* List Action / Rejections */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {urgentActions.length > 0 ? (
                urgentActions.map((action) => (
                  <div
                    key={`${action.id}-${action.gate}`}
                    onClick={() =>
                      router.push(
                        `/dashboard/${action.id}/${action.stepSlug}`,
                      )
                    }
                    className="p-3.5 rounded-xl border border-rose-100 hover:border-rose-400 bg-rose-50/30 hover:bg-white transition-all cursor-pointer group shadow-sm"
                  >
                    {/* Header Card: Code / ID & Badge Status */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {action.code || `ID: ${String(action.id).slice(0, 8)}`}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        {action.status || "REVISION_NEEDED"}
                      </span>
                    </div>

                    {/* Nama Project */}
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#004b87] transition-colors line-clamp-1">
                      {action.name || action.projectName}
                    </h4>

                    {/* Step / Gate Info */}
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">
                        {action.gate || action.stepName}
                      </span>
                      {action.uploader && (
                        <span className="text-slate-500 text-[10px]">
                          By: {action.uploader}
                        </span>
                      )}
                    </div>

                    {/* Box Alasan Penolakan / Rejection Reason */}
                    <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-rose-200 text-slate-700">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-0.5">
                        Rejection Reason:
                      </span>
                      <p className="text-xs italic text-slate-600 line-clamp-2">
                        "
                        {action.reason ||
                          action.rejectionReason ||
                          "No specific reason provided."}
                        "
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-80" />
                  <p className="text-xs font-medium text-slate-600">
                    All Clear!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No rejected gates or items requiring revision at this time.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/projects")}
            className="w-full mt-4 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open All Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Recent Projects Summary */}


      {/* 5. Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add New Project
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter project information according to database schema
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* project_name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Topographical & LiDAR Mapping for IKN Core Area"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData({ ...formData, project_name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
              </div>

              {/* client */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Client / Organization <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nusantara Capital City Authority / PT Sinar Mas"
                  value={formData.client}
                  onChange={(e) =>
                    setFormData({ ...formData, client: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
              </div>

              {/* Dates Grid (start_date & end_date) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Completion
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Save Project
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