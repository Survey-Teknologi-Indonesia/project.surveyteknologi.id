"use client";

import React, { useState } from "react";
import {
  LayoutList,
  LayoutGrid,
  ExternalLink,
  File,
  FileImage,
  FileCode,
  Clock,
  Layers,
  Search,
  Eye,
  CheckCircle2,
} from "lucide-react";
import type { DriveFileItem } from "./actions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FileTypeIcon({
  ext,
  mimeType,
  size = "sm",
}: {
  ext: string;
  mimeType: string;
  size?: "sm" | "lg";
}) {
  const isImg =
    mimeType?.startsWith("image/") ||
    ["JPG", "JPEG", "PNG", "DNG", "TIFF", "TIF"].includes(ext);
  const cls = size === "lg" ? "w-8 h-8 shrink-0" : "w-4 h-4 shrink-0";
  if (isImg) return <FileImage className={`${cls} text-violet-500`} />;
  if (["LAS", "LAZ", "RBN"].includes(ext))
    return <Layers className={`${cls} text-cyan-500`} />;
  if (["OBS", "CSV", "KML", "KMZ"].includes(ext))
    return <FileCode className={`${cls} text-amber-500`} />;
  return <File className={`${cls} text-slate-400`} />;
}

export function ExtBadge({ ext }: { ext: string }) {
  const colorMap: Record<string, string> = {
    JPG: "bg-violet-100 text-violet-700",
    JPEG: "bg-violet-100 text-violet-700",
    DNG: "bg-fuchsia-100 text-fuchsia-700",
    PNG: "bg-indigo-100 text-indigo-700",
    TIFF: "bg-purple-100 text-purple-700",
    TIF: "bg-purple-100 text-purple-700",
    LAS: "bg-cyan-100 text-cyan-700",
    LAZ: "bg-cyan-100 text-cyan-700",
    RBN: "bg-sky-100 text-sky-700",
    OBS: "bg-amber-100 text-amber-700",
    CSV: "bg-emerald-100 text-emerald-700",
    KML: "bg-orange-100 text-orange-700",
    KMZ: "bg-orange-100 text-orange-700",
    PDF: "bg-red-100 text-red-700",
    DOCX: "bg-blue-100 text-blue-700",
  };
  const cls = colorMap[ext] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${cls}`}
    >
      {ext || "–"}
    </span>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({
  files,
  selectedFileId,
  onSelectFile,
}: {
  files: DriveFileItem[];
  selectedFileId?: string;
  onSelectFile?: (file: DriveFileItem) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4 sm:px-6">Nama Berkas</th>
            <th className="py-3.5 px-4 sm:px-6">Tipe</th>
            <th className="py-3.5 px-4 sm:px-6">Ukuran</th>
            <th className="py-3.5 px-4 sm:px-6">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Dimodifikasi
              </span>
            </th>
            <th className="py-3.5 px-4 sm:px-6 text-center">Status / Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {files.map((file) => {
            const isSelected = selectedFileId === file.id;
            return (
              <tr
                key={file.id}
                onClick={() => onSelectFile?.(file)}
                className={`transition-all cursor-pointer group ${
                  isSelected
                    ? "bg-sky-50/90 font-medium text-[#004b87] border-l-4 border-[#004b87]"
                    : "hover:bg-slate-50/80 border-l-4 border-transparent"
                }`}
              >
                <td className="py-3 px-4 sm:px-6">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileTypeIcon
                      ext={file.extension}
                      mimeType={file.mimeType}
                    />
                    <span
                      className={`text-xs truncate max-w-[200px] sm:max-w-xs ${
                        isSelected
                          ? "font-bold text-[#004b87]"
                          : "font-medium text-slate-800"
                      }`}
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    {isSelected && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#004b87] text-white">
                        <Eye className="w-3 h-3" /> Preview
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 sm:px-6">
                  <ExtBadge ext={file.extension} />
                </td>
                <td className="py-3 px-4 sm:px-6 font-mono text-xs text-slate-600">
                  {file.formattedSize}
                </td>
                <td className="py-3 px-4 sm:px-6 text-xs text-slate-500">
                  {file.modifiedTime}
                </td>
                <td className="py-3 px-4 sm:px-6 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile?.(file);
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        isSelected
                          ? "bg-[#004b87] text-white shadow-sm"
                          : "text-[#004b87] border border-[#004b87]/20 hover:bg-[#004b87]/10"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      {isSelected ? "Terpilih" : "Lihat"}
                    </button>
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Buka berkas di Google Drive"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-3 h-3" /> Drive
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Grid View ────────────────────────────────────────────────────────────────

function GridView({
  files,
  selectedFileId,
  onSelectFile,
}: {
  files: DriveFileItem[];
  selectedFileId?: string;
  onSelectFile?: (file: DriveFileItem) => void;
}) {
  return (
    <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {files.map((file) => {
        const isSelected = selectedFileId === file.id;
        return (
          <div
            key={file.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectFile?.(file)}
            className={`group relative flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? "border-[#004b87] ring-2 ring-[#004b87]/30 bg-sky-50/50 shadow-sm"
                : "border-slate-200 bg-white hover:border-[#004b87]/30 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {/* Active selection badge */}
            {isSelected && (
              <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#004b87] text-white shadow-xs">
                <CheckCircle2 className="w-2.5 h-2.5" /> Aktif
              </span>
            )}

            {/* Thumbnail or icon */}
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
              {file.thumbnailLink ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.thumbnailLink}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded-xl"
                />
              ) : (
                <FileTypeIcon
                  ext={file.extension}
                  mimeType={file.mimeType}
                  size="lg"
                />
              )}
            </div>

            {/* File name */}
            <p
              className={`text-[11px] text-center leading-snug line-clamp-2 w-full ${
                isSelected
                  ? "font-bold text-[#004b87]"
                  : "font-semibold text-slate-700"
              }`}
              title={file.name}
            >
              {file.name}
            </p>

            {/* Extension + size */}
            <div className="flex flex-col items-center gap-1 w-full">
              <ExtBadge ext={file.extension} />
              <span className="text-[10px] font-mono text-slate-400">
                {file.formattedSize}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 mt-1">
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#004b87] px-2 py-0.5 rounded hover:bg-[#004b87]/10 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" /> Buka Drive
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

type ViewMode = "list" | "grid";

interface DriveFileBrowserProps {
  files: DriveFileItem[];
  driveLink: string;
  totalFiles: number;
  selectedFileId?: string;
  onSelectFile?: (file: DriveFileItem) => void;
}

export default function DriveFileBrowser({
  files,
  driveLink,
  totalFiles,
  selectedFileId,
  onSelectFile,
}: DriveFileBrowserProps) {
  const [view, setView] = useState<ViewMode>("list");

  const hasFiles = files.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Isi Folder Google Drive
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik berkas untuk menampilkan pratinjau di peta spasial KML.
            {hasFiles && (
              <span className="ml-1 font-semibold text-emerald-600">
                · {totalFiles} berkas ditemukan
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          {hasFiles && (
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setView("list")}
                title="Tampilan List"
                className={`p-1.5 rounded-md transition-all ${
                  view === "list"
                    ? "bg-white shadow text-[#004b87]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                title="Tampilan Grid"
                className={`p-1.5 rounded-md transition-all ${
                  view === "grid"
                    ? "bg-white shadow text-[#004b87]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}

          <a
            href={driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#004b87] border border-[#004b87]/20 rounded-lg hover:bg-[#004b87]/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Drive
          </a>
        </div>
      </div>

      {/* Empty state */}
      {!hasFiles && (
        <div className="flex flex-col items-center gap-2 py-14 text-center">
          <Search className="w-8 h-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            Folder Google Drive kosong atau tidak dapat diakses
          </p>
          <p className="text-xs text-slate-400 max-w-xs">
            Pastikan folder bersifat publik atau API Key memiliki akses yang
            diperlukan.
          </p>
        </div>
      )}

      {/* File view */}
      {hasFiles && (
        <>
          {view === "list" ? (
            <ListView
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
            />
          ) : (
            <GridView
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={onSelectFile}
            />
          )}
        </>
      )}
    </div>
  );
}
