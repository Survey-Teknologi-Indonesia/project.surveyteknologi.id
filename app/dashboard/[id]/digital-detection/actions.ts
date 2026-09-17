"use server";

import pool from "@/app/lib/neon";
import { google } from "googleapis";
import { revalidatePath } from "next/cache";

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  formattedSize: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
  isImage: boolean;
  extension: string;
}

export interface FileCategorySummary {
  category: string;
  count: number;
  size: string;
  extensions: string[];
}

export interface RawDataPageData {
  projectId: string;
  projectName: string;
  client: string;
  gateNumber: number;
  gateTitle: string;
  status: "APPROVED" | "PENDING_APPROVAL" | "REVISION_NEEDED" | "NOT_UPLOADED";
  uploadedBy: string;
  uploadedAt: string;
  driveLink?: string;
  totalFiles: number;
  totalImages: number;
  totalStorageBytes: number;
  formattedStorage: string;
  categories: FileCategorySummary[];
  files: DriveFileItem[];
  error?: string;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function extractDriveId(url: string): { id: string; type: "folder" | "file" } | null {
  if (!url) return null;
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return { id: folderMatch[1], type: "folder" };

  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return { id: fileMatch[1], type: "file" };

  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch) return { id: idParamMatch[1], type: "folder" };

  return null;
}
export async function getDigitalDetectionPageData(projectId: string): Promise<{
  success: boolean;
  data?: RawDataPageData;
  error?: string;
}> {
  try {
    // 1. Ambil info step Gate 5 (Orthophoto)
    const stepRes = await pool.query(
      "SELECT step_id, TRIM(step_name) AS step_name, step_number FROM step WHERE step_number = 7"
    );
    if (stepRes.rows.length === 0) {
      return { success: false, error: "Tahapan Gate 7 (Digitation & Detection) tidak ditemukan di database." };
    }
    const stepId = stepRes.rows[0].step_id;
    const gateTitle = stepRes.rows[0].step_name;

    // 2. Resolve project (dengan auto-fallback jika ID dummy)
    let isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    let resolvedProjectId = projectId;
    let projectName = "Proyek Pemetaan";
    let client = "-";

    if (!isUUID) {
      const fallbackProj = await pool.query(
        "SELECT project_id, project_name, client FROM project ORDER BY start_date DESC NULLS LAST LIMIT 1"
      );
      if (fallbackProj.rows.length > 0) {
        resolvedProjectId = fallbackProj.rows[0].project_id;
        projectName = fallbackProj.rows[0].project_name;
        client = fallbackProj.rows[0].client;
        isUUID = true;
      }
    } else {
      const projRes = await pool.query(
        "SELECT project_name, client FROM project WHERE project_id = $1",
        [resolvedProjectId]
      );
      if (projRes.rows.length > 0) {
        projectName = projRes.rows[0].project_name;
        client = projRes.rows[0].client;
      }
    }

    // 3. Ambil data progress Gate 5 dari database
    let progressRow: any = null;
    if (isUUID) {
      const progRes = await pool.query(
        `
        SELECT 
          p.progress_id, 
          p.project_id, 
          p.step_id, 
          p.upload_by, 
          TO_CHAR(p.upload_date, 'DD Mon YYYY') AS formatted_upload_date, 
          p.document_link, 
          p."approvedBy", 
          p."rejectionBy",
          u.name AS uploader_name
        FROM progress p
        LEFT JOIN account u ON p.upload_by = u.account_id
        WHERE p.project_id = $1 AND p.step_id = $2
        `,
        [resolvedProjectId, stepId]
      );
      if (progRes.rows.length > 0) {
        progressRow = progRes.rows[0];
      }
    }

    // Tentukan status
    let status: RawDataPageData["status"] = "NOT_UPLOADED";
    if (progressRow) {
      if (progressRow.approvedBy) {
        status = "APPROVED";
      } else if (progressRow.rejectionBy) {
        status = "REVISION_NEEDED";
      } else if (progressRow.document_link || progressRow.formatted_upload_date) {
        status = "PENDING_APPROVAL";
      }
    }

    const driveLink = progressRow?.document_link || "";
    let files: DriveFileItem[] = [];
    let driveError: string | undefined = undefined;

    // 4. Ambil data berkas via Google Drive API (Mendukung Folder maupun File Tunggal .jpg/.tif)
    if (driveLink && process.env.GOOGLE_DRIVE_API_KEY) {
      const driveInfo = extractDriveId(driveLink);
      if (driveInfo) {
        try {
          const drive = google.drive({
            version: "v3",
            auth: process.env.GOOGLE_DRIVE_API_KEY,
          });

          if (driveInfo.type === "folder") {
            const listRes = await drive.files.list({
              q: `'${driveInfo.id}' in parents and trashed = false`,
              pageSize: 100,
              fields:
                "files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink)",
            });

            const fetchedFiles = listRes.data.files || [];
            files = fetchedFiles.map((f: any) => {
              const size = parseInt(f.size || "0", 10);
              const ext = f.name?.split(".").pop()?.toUpperCase() || "";
              const isImage =
                f.mimeType?.toLowerCase().startsWith("image/") ||
                ["JPG", "JPEG", "PNG", "DNG", "TIFF", "TIF", "WEBP"].includes(ext);

              return {
                id: f.id,
                name: f.name || "Untitled",
                mimeType: f.mimeType || "",
                size: size,
                formattedSize: formatBytes(size),
                modifiedTime: f.modifiedTime
                  ? new Date(f.modifiedTime).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-",
                webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
                webContentLink: f.webContentLink,
                thumbnailLink: f.thumbnailLink,
                isImage,
                extension: ext,
              };
            });
          } else {
            // Jika link adalah berkas tunggal (seperti .jpg / .tif)
            const fileRes = await drive.files.get({
              fileId: driveInfo.id,
              fields:
                "id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink",
            });
            const f = fileRes.data;
            const size = parseInt(f.size || "0", 10);
            const ext = f.name?.split(".").pop()?.toUpperCase() || "";
            const isImage =
              f.mimeType?.toLowerCase().startsWith("image/") ||
              ["JPG", "JPEG", "PNG", "DNG", "TIFF", "TIF", "WEBP"].includes(ext);

            files = [
              {
                id: f.id || driveInfo.id,
                name: f.name || "Untitled File",
                mimeType: f.mimeType || "",
                size: size,
                formattedSize: formatBytes(size),
                modifiedTime: f.modifiedTime
                  ? new Date(f.modifiedTime).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-",
                webViewLink: f.webViewLink || driveLink,
                webContentLink: f.webContentLink ?? undefined,
                thumbnailLink: f.thumbnailLink ?? undefined,
                isImage,
                extension: ext,
              },
            ];
          }
        } catch (apiErr: any) {
          console.error("Google Drive API Error:", apiErr.message);
          driveError = apiErr.message || "Gagal mengambil daftar file dari Google Drive API.";
        }
      }
    }

    // 5. Hitung ringkasan statistik dan kategorisasi
    const totalStorageBytes = files.reduce((acc, curr) => acc + curr.size, 0);
    const totalImages = files.filter((f) => f.isImage).length;

    const categoriesMap: Record<string, { count: number; bytes: number; exts: Set<string> }> = {
      "Hasil Orthophoto / Raster": { count: 0, bytes: 0, exts: new Set() },
      "Dokumen & Metadata SIG": { count: 0, bytes: 0, exts: new Set() },
      "Berkas Lainnya": { count: 0, bytes: 0, exts: new Set() },
    };

    files.forEach((f) => {
      const ext = f.extension;
      if (f.isImage || ["TIF", "TIFF", "ECW", "JP2"].includes(ext)) {
        categoriesMap["Hasil Orthophoto / Raster"].count++;
        categoriesMap["Hasil Orthophoto / Raster"].bytes += f.size;
        categoriesMap["Hasil Orthophoto / Raster"].exts.add(ext);
      } else if (["KML", "KMZ", "SHP", "GEOJSON", "PDF", "TXT", "CSV"].includes(ext)) {
        categoriesMap["Dokumen & Metadata SIG"].count++;
        categoriesMap["Dokumen & Metadata SIG"].bytes += f.size;
        categoriesMap["Dokumen & Metadata SIG"].exts.add(ext);
      } else {
        categoriesMap["Berkas Lainnya"].count++;
        categoriesMap["Berkas Lainnya"].bytes += f.size;
        categoriesMap["Berkas Lainnya"].exts.add(ext || "OTHER");
      }
    });

    const categories: FileCategorySummary[] = Object.entries(categoriesMap)
      .filter(([_, val]) => val.count > 0)
      .map(([cat, val]) => ({
        category: cat,
        count: val.count,
        size: formatBytes(val.bytes),
        extensions: Array.from(val.exts),
      }));

    return {
      success: true,
      data: {
        projectId: resolvedProjectId,
        projectName,
        client,
        gateNumber: 5,
        gateTitle,
        status,
        uploadedBy: progressRow?.uploader_name || "Oliver",
        uploadedAt: progressRow?.formatted_upload_date || "-",
        driveLink: driveLink || undefined,
        totalFiles: files.length,
        totalImages,
        totalStorageBytes,
        formattedStorage: formatBytes(totalStorageBytes),
        categories,
        files,
        error: driveError,
      },
    };
  } catch (error: any) {
    console.error("Gagal memuat halaman Orthophoto:", error);
    return {
      success: false,
      error: error?.message || "Gagal mengambil data dari database.",
    };
  }
}

// ─── Approval Actions (Disesuaikan Nama Fungsi & Revalidation) ─────────────
export async function approveDigitalDetectionGate(
  projectId: string,
  approverId?: string
): Promise<{ success: boolean; message?: string }> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Ambil step_id untuk Gate 3 (Raw Data)
    const stepRes = await client.query(
      "SELECT step_id FROM step WHERE step_number = 7"
    );
    if (stepRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "Step Gate 3 tidak ditemukan di database." };
    }
    const stepId = stepRes.rows[0].step_id;

    // 2. Tentukan ID pengguna (account_id) yang valid
    let validUserId = approverId;
    if (validUserId) {
      const checkUser = await client.query(
        "SELECT account_id FROM account WHERE account_id::text = $1",
        [validUserId]
      );
      if (checkUser.rows.length === 0) validUserId = undefined;
    }

    if (!validUserId) {
      const fallbackUser = await client.query(
        "SELECT account_id FROM account ORDER BY account_id ASC LIMIT 1"
      );
      if (fallbackUser.rows.length === 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: "Tidak ada akun pengguna yang terdaftar di database.",
        };
      }
      validUserId = fallbackUser.rows[0].account_id;
    }

    // 3. Insert ke tabel "approval" sesuai skema (kolom: approveBy, date, remarks)
    const approvalRes = await client.query(
      `INSERT INTO approval ("approveBy", date, remarks)
       VALUES ($1, CURRENT_DATE, $2)
       RETURNING approval_id`,
      [validUserId, "Disetujui via Dashboard Raw Data"]
    );

    const newApprovalId = approvalRes.rows[0].approval_id;

    // 4. Update tabel "progress" (kolom: approvedBy = approval_id)
    const progressRes = await client.query(
      `UPDATE progress
       SET "approvedBy" = $1, "rejectionBy" = NULL
       WHERE project_id = $2 AND step_id = $3`,
      [newApprovalId, projectId, stepId]
    );

    if (progressRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Data progress tidak ditemukan untuk disetujui.",
      };
    }

    await client.query("COMMIT");

    revalidatePath(`/dashboard/${projectId}/raw-data`);
    return { success: true, message: "Raw Data berhasil disetujui!" };
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Approval error:", error);
    return {
      success: false,
      message: error?.message || "Gagal menyimpan persetujuan.",
    };
  } finally {
    client.release();
  }
}

export async function rejectDigitalDetectionGate(
  projectId: string,
  rejectorId?: string
): Promise<{ success: boolean; message?: string }> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Get step_id for Gate 1 (Flight Plan)
    const stepRes = await client.query(
      "SELECT step_id FROM step WHERE step_number = 7"
    );
    if (stepRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, message: "Gate 7 stage not found in database." };
    }
    const stepId = stepRes.rows[0].step_id;

    // 2. Validate user ID
    let validUserId = rejectorId;
    if (validUserId) {
      const checkUser = await client.query(
        "SELECT account_id FROM account WHERE account_id::text = $1",
        [validUserId]
      );
      if (checkUser.rows.length === 0) validUserId = undefined;
    }

    if (!validUserId) {
      const fallbackUser = await client.query(
        "SELECT account_id FROM account ORDER BY account_id ASC LIMIT 1"
      );
      if (fallbackUser.rows.length === 0) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: "No registered user account found in database.",
        };
      }
      validUserId = fallbackUser.rows[0].account_id;
    }

    // 3. Insert into "rejection" table
    const rejectionRes = await client.query(
      `INSERT INTO rejection ("rejectBy", date, remarks)
       VALUES ($1, CURRENT_DATE, $2)
       RETURNING rejection_id`,
      [validUserId, "Rejected via Flight Plan Dashboard"]
    );

    const newRejectionId = rejectionRes.rows[0].rejection_id;

    // 4. Update "progress" table
    const progressRes = await client.query(
      `UPDATE progress
       SET "rejectionBy" = $1, "approvedBy" = NULL
       WHERE project_id = $2 AND step_id = $3`,
      [newRejectionId, projectId, stepId]
    );

    if (progressRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        message: "Progress data not found to reject.",
      };
    }

    await client.query("COMMIT");

    revalidatePath(`/dashboard/${projectId}/digital-detection`);
    return { success: true, message: "Digital Detection successfully rejected!" };
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Approval error:", error);
    return {
      success: false,
      message: error?.message || "Failed to save approval.",
    };
  } finally {
    client.release();
  }
}