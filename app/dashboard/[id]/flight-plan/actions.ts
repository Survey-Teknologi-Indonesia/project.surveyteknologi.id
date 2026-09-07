"use server";

import pool from "@/app/lib/neon";
import { getCurrentUser } from "@/app/login/actions";
import { revalidatePath } from "next/cache";

export interface AccountOption {
  account_id: string;
  name: string;
  username: string;
  role: string;
}

export interface FlightPlanData {
  projectId: string;
  stepId: string;
  projectName: string;
  client: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REVISION_NEEDED" | "NOT_UPLOADED";
  uploadedBy?: string;
  uploadedAt?: string;
  documentLink?: string;
  approvalInfo?: {
    approval_id: string;
    approveBy: string;
    approverName: string;
    date: string;
    remarks: string | null;
  } | null;
  rejectionInfo?: {
    rejection_id: string;
    rejectBy: string;
    rejectorName: string;
    date: string;
    remarks: string;
  } | null;
  accounts: AccountOption[];
}

export async function getFlightPlanData(projectId: string): Promise<{
  success: boolean;
  data?: FlightPlanData;
  error?: string;
}> {
  try {
    // 1. Ambil step Gate 1 (Flight Plan)
    const stepRes = await pool.query(
      "SELECT step_id, TRIM(step_name) as step_name, step_number FROM step WHERE step_number = 1"
    );
    if (stepRes.rows.length === 0) {
      return { success: false, error: "Step Gate 1 (Flight Plan) tidak ditemukan di database." };
    }
    const stepId = stepRes.rows[0].step_id;

    // 2. Ambil informasi project
    let isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    let resolvedProjectId = projectId;
    let projectName = "Proyek Pemetaan";
    let client = "-";

    if (!isUUID) {
      // Fallback otomatis jika membuka ID dummy (seperti PRJ-001 / STI-PG-001)
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

    // 3. Ambil progress untuk Gate 1
    let progressRow: any = null;
    if (isUUID) {
      const progRes = await pool.query(
        `
        SELECT 
          p.progress_id, 
          p.project_id, 
          p.step_id, 
          p.upload_by, 
          TO_CHAR(p.upload_date, 'DD Mon YYYY') as formatted_upload_date, 
          p.document_link, 
          p."approvedBy", 
          p."rejectionBy",
          u.name as uploader_name
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

    // 4. Ambil info approval jika ada
    let approvalInfo = null;
    if (progressRow && progressRow.approvedBy) {
      const appRes = await pool.query(
        `
        SELECT 
          a.approval_id, 
          a."approveBy", 
          TO_CHAR(a.date, 'DD Mon YYYY') as formatted_date, 
          a.remarks,
          u.name as approver_name
        FROM approval a
        LEFT JOIN account u ON a."approveBy" = u.account_id
        WHERE a.approval_id = $1
        `,
        [progressRow.approvedBy]
      );
      if (appRes.rows.length > 0) {
        approvalInfo = {
          approval_id: appRes.rows[0].approval_id,
          approveBy: appRes.rows[0].approveBy,
          approverName: appRes.rows[0].approver_name || "Verifikator",
          date: appRes.rows[0].formatted_date || "-",
          remarks: appRes.rows[0].remarks,
        };
      }
    }

    // 5. Ambil info rejection jika ada
    let rejectionInfo = null;
    if (progressRow && progressRow.rejectionBy) {
      const rejRes = await pool.query(
        `
        SELECT 
          r.rejection_id, 
          r."rejectBy", 
          TO_CHAR(r.date, 'DD Mon YYYY') as formatted_date, 
          r.remarks,
          u.name as rejector_name
        FROM rejection r
        LEFT JOIN account u ON r."rejectBy" = u.account_id
        WHERE r.rejection_id = $1
        `,
        [progressRow.rejectionBy]
      );
      if (rejRes.rows.length > 0) {
        rejectionInfo = {
          rejection_id: rejRes.rows[0].rejection_id,
          rejectBy: rejRes.rows[0].rejectBy,
          rejectorName: rejRes.rows[0].rejector_name || "Verifikator",
          date: rejRes.rows[0].formatted_date || "-",
          remarks: rejRes.rows[0].remarks,
        };
      }
    }

    // 6. Ambil daftar akun
    const accRes = await pool.query(
      "SELECT account_id, name, username, role FROM account ORDER BY name ASC"
    );
    const accounts = accRes.rows;

    // Tentukan status
    let status: FlightPlanData["status"] = "NOT_UPLOADED";
    if (progressRow) {
      if (progressRow.approvedBy) {
        status = "APPROVED";
      } else if (progressRow.rejectionBy) {
        status = "REVISION_NEEDED";
      } else if (progressRow.document_link || progressRow.upload_date) {
        status = "PENDING_APPROVAL";
      }
    }

    return {
      success: true,
      data: {
        projectId,
        stepId,
        projectName,
        client,
        status,
        uploadedBy: progressRow?.uploader_name || "Oliver",
        uploadedAt: progressRow?.formatted_upload_date || "-",
        documentLink: progressRow?.document_link || undefined,
        approvalInfo,
        rejectionInfo,
        accounts,
      },
    };
  } catch (error: any) {
    console.error("Gagal mengambil data Flight Plan:", error);
    return {
      success: false,
      error: error?.message || "Gagal memuat data flight plan dari database.",
    };
  }
}

export async function approveFlightPlan(data: {
  projectId: string;
  stepId: string;
  approveBy: string;
  date?: string;
  remarks?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    let targetProjectId = data.projectId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetProjectId);
    if (!isUUID) {
      const fallbackProj = await pool.query(
        "SELECT project_id FROM project ORDER BY start_date DESC NULLS LAST LIMIT 1"
      );
      if (fallbackProj.rows.length > 0) {
        targetProjectId = fallbackProj.rows[0].project_id;
      } else {
        return { success: false, error: "ID proyek tidak valid dan belum ada proyek di database." };
      }
    }

    if (!data.approveBy) {
      return { success: false, error: "Akun verifikator (approveBy) wajib dipilih." };
    }

    const dateVal = data.date || new Date().toISOString().split("T")[0];
    const remarksVal = data.remarks?.trim() || null;

    // 1. Simpan ke tabel 'approval'
    // Kolom: approval_id (UUID, default gen_random_uuid()), approveBy (UUID), date (DATE), remarks (TEXT)
    const appRes = await pool.query(
      `
      INSERT INTO approval ("approveBy", date, remarks)
      VALUES ($1, $2, $3)
      RETURNING approval_id
      `,
      [data.approveBy, dateVal, remarksVal]
    );

    const approvalId = appRes.rows[0].approval_id;

    // 2. Hubungkan ke tabel 'progress' (kolom approvedBy)
    const progCheck = await pool.query(
      "SELECT progress_id FROM progress WHERE project_id = $1 AND step_id = $2",
      [targetProjectId, data.stepId]
    );

    if (progCheck.rows.length > 0) {
      await pool.query(
        `
        UPDATE progress 
        SET 
          "approvedBy" = $1, 
          "rejectionBy" = NULL
        WHERE progress_id = $2
        `,
        [approvalId, progCheck.rows[0].progress_id]
      );
    } else {
      await pool.query(
        `
        INSERT INTO progress (
          project_id, 
          step_id, 
          upload_by, 
          upload_date, 
          "approvedBy", 
          "rejectionBy"
        )
        VALUES ($1, $2, $3, $4, $5, NULL)
        `,
        [targetProjectId, data.stepId, data.approveBy, dateVal, approvalId]
      );
    }

    revalidatePath(`/dashboard/${targetProjectId}`);
    revalidatePath(`/dashboard/${targetProjectId}/flight-plan`);

    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyetujui (approve):", error);
    return { success: false, error: error?.message || "Gagal menyimpan persetujuan ke database." };
  }
}

export async function rejectFlightPlan(data: {
  projectId: string;
  stepId: string;
  rejectBy: string;
  date?: string;
  remarks: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    let targetProjectId = data.projectId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetProjectId);
    if (!isUUID) {
      const fallbackProj = await pool.query(
        "SELECT project_id FROM project ORDER BY start_date DESC NULLS LAST LIMIT 1"
      );
      if (fallbackProj.rows.length > 0) {
        targetProjectId = fallbackProj.rows[0].project_id;
      } else {
        return { success: false, error: "ID proyek tidak valid dan belum ada proyek di database." };
      }
    }

    if (!data.rejectBy) {
      return { success: false, error: "Akun peninjau (rejectBy) wajib dipilih." };
    }

    // CATATAN PENTING: Sesuai constraint DB pada tabel rejection: remarks TEXT NOT NULL
    if (!data.remarks?.trim()) {
      return { success: false, error: "Alasan penolakan / catatan revisi (remarks) wajib diisi." };
    }

    const dateVal = data.date || new Date().toISOString().split("T")[0];
    const remarksVal = data.remarks.trim();

    // 1. Simpan ke tabel 'rejection'
    // Kolom: rejection_id (UUID, default gen_random_uuid()), rejectBy (UUID), date (DATE), remarks (TEXT NOT NULL)
    const rejRes = await pool.query(
      `
      INSERT INTO rejection ("rejectBy", date, remarks)
      VALUES ($1, $2, $3)
      RETURNING rejection_id
      `,
      [data.rejectBy, dateVal, remarksVal]
    );

    const rejectionId = rejRes.rows[0].rejection_id;

    // 2. Hubungkan ke tabel 'progress' (kolom rejectionBy)
    const progCheck = await pool.query(
      "SELECT progress_id FROM progress WHERE project_id = $1 AND step_id = $2",
      [targetProjectId, data.stepId]
    );

    if (progCheck.rows.length > 0) {
      await pool.query(
        `
        UPDATE progress 
        SET 
          "rejectionBy" = $1, 
          "approvedBy" = NULL
        WHERE progress_id = $2
        `,
        [rejectionId, progCheck.rows[0].progress_id]
      );
    } else {
      await pool.query(
        `
        INSERT INTO progress (
          project_id, 
          step_id, 
          upload_by, 
          upload_date, 
          "rejectionBy", 
          "approvedBy"
        )
        VALUES ($1, $2, $3, $4, $5, NULL)
        `,
        [targetProjectId, data.stepId, data.rejectBy, dateVal, rejectionId]
      );
    }

    revalidatePath(`/dashboard/${targetProjectId}`);
    revalidatePath(`/dashboard/${targetProjectId}/flight-plan`);

    return { success: true };
  } catch (error: any) {
    console.error("Gagal menolak / meminta revisi:", error);
    return { success: false, error: error?.message || "Gagal menyimpan penolakan ke database." };
  }
}
