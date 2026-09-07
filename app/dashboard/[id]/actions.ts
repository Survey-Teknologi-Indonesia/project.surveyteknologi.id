"use server";

import pool from "@/app/lib/neon";
import { getCurrentUser } from "@/app/login/actions";
import { revalidatePath } from "next/cache";

export interface StepRecord {
  step_id: string;
  step_name: string;
  step_number: number;
}

export interface ProjectInfo {
  project_id: string;
  project_name: string;
  client: string;
  start_date: string | null;
  end_date: string | null;
}

export interface AccountOption {
  account_id: string;
  name: string;
  username: string;
  role: string;
}

export interface StepProgressItem {
  step_id: string;
  gateNumber: number;
  title: string;
  href: string;
  subtitle: string;
  description: string;
  uploadedBy?: string;
  uploadById?: string;
  date?: string;
  rawDate?: string;
  status: "PENDING_UPLOAD" | "APPROVED" | "PENDING_APPROVAL" | "IN_PROGRESS" | "REVISION" | "LOCKED";
  output: string;
  progress_id?: string;
  document_link?: string;
  approvedBy?: string;
  rejectionBy?: string;
}

const STEP_METADATA: Record<
  number,
  {
    href: string;
    subtitle: string;
    description: string;
    output: string;
  }
> = {
  1: {
    href: "flight-plan",
    subtitle: "Flight Path Planning & GCP",
    description:
      "Area of Interest (AOI) boundary definition, flight altitude, photo overlap, and Ground Control Point (GCP) distribution.",
    output: "KML File & GCP Coordinates (.csv)",
  },
  2: {
    href: "data-acquisition",
    subtitle: "Aerial Photography & Flight Log",
    description:
      "Execution of aerial photography flight using drone/aircraft along with flight log recording.",
    output: "Flight Log & Raw Capture Data",
  },
  3: {
    href: "raw-data",
    subtitle: "Photo & Raw GPS Collection",
    description:
      "Extraction and completeness check of aerial photo files (EXIF/GPS) and base station data.",
    output: "Raw Photos (GDrive Link)",
  },
  4: {
    href: "raw-data-enhance",
    subtitle: "Color Correction & Photo Filtering",
    description:
      "Visual quality improvement (radiometric/contrast) and filtering out blurry or cloud-obscured photos.",
    output: "Enhanced Photos (GDrive Link)",
  },
  5: {
    href: "orthophoto",
    subtitle: "Photogrammetry Processing & DEM",
    description:
      "Photo alignment, 3D point cloud generation, mesh, elevation (DEM), and Orthomosaic creation.",
    output: "GeoTIFF Orthomosaic & DEM",
  },
  6: {
    href: "orthophoto-enhance",
    subtitle: "Seamless Blending & Visual Refinement",
    description: "Artifact removal, color matching, and seamline smoothing.",
    output: "Clean Final GeoTIFF",
  },
  7: {
    href: "digital-detection",
    subtitle: "Geospatial Feature Extraction & Final Map",
    description:
      "Digitization of geospatial objects/vectors, feature detection, final map layout design, and handover draft.",
    output: "SHP / CAD / Final PDF Format",
  },
};

export async function getAccounts(): Promise<AccountOption[]> {
  try {
    const res = await pool.query("SELECT account_id, name, username, role FROM account ORDER BY name ASC");
    return res.rows;
  } catch (error) {
    console.error("Gagal mengambil akun:", error);
    return [];
  }
}

export async function getProjectStepsData(projectId: string): Promise<{
  success: boolean;
  project?: ProjectInfo | null;
  steps: StepProgressItem[];
  accounts: AccountOption[];
  error?: string;
}> {
  try {
    // 1. Ambil data dari tabel 'step' sesuai skema DB (step_id, step_name, step_number)
    const stepQuery = await pool.query(`
      SELECT 
        step_id, 
        TRIM(step_name) AS step_name, 
        step_number 
      FROM step 
      ORDER BY step_number ASC
    `);
    const dbSteps: StepRecord[] = stepQuery.rows;

    // 2. Ambil informasi project jika projectId valid
    let project: ProjectInfo | null = null;
    let isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    let resolvedProjectId = projectId;

    if (!isUUID) {
      const fallbackProj = await pool.query(
        "SELECT project_id, project_name, client, TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date, TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date FROM project ORDER BY start_date DESC NULLS LAST LIMIT 1"
      );
      if (fallbackProj.rows.length > 0) {
        resolvedProjectId = fallbackProj.rows[0].project_id;
        project = fallbackProj.rows[0];
        isUUID = true;
      }
    } else {
      const projectQuery = await pool.query(
        `
        SELECT 
          project_id, 
          project_name, 
          client, 
          TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date, 
          TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date 
        FROM project 
        WHERE project_id = $1
        `,
        [resolvedProjectId]
      );
      if (projectQuery.rows.length > 0) {
        project = projectQuery.rows[0];
      }
    }

    // 3. Ambil data akun untuk opsi uploader
    const accounts = await getAccounts();

    // 4. Ambil data progress untuk project ini sesuai kolom riil pada tabel 'progress'
    let progressMap = new Map<string, any>();
    if (isUUID) {
      const progressQuery = await pool.query(
        `
        SELECT 
          p.progress_id, 
          p.step_id, 
          p.upload_by, 
          p."approvedBy", 
          p."rejectionBy", 
          TO_CHAR(p.upload_date, 'DD Mon YYYY') as formatted_upload_date, 
          TO_CHAR(p.upload_date, 'YYYY-MM-DD') as raw_upload_date,
          p.document_link,
          u.name as uploader_name
        FROM progress p
        LEFT JOIN account u ON p.upload_by = u.account_id
        WHERE p.project_id = $1
        `,
        [resolvedProjectId]
      );
      for (const row of progressQuery.rows) {
        progressMap.set(row.step_id, row);
      }
    }

    // 5. Susun daftar steps dengan status dinamis
    let previousStepApproved = true; // Gate 1 terbuka secara default
    const steps: StepProgressItem[] = dbSteps.map((s) => {
      const meta = STEP_METADATA[s.step_number] || {
        href: s.step_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        subtitle: "SOP Quality Gate",
        description: "Alur tahapan operasional photogrammetry & pemetaan.",
        output: "Dokumen & Data Hasil Tahapan",
      };

      const progress = progressMap.get(s.step_id);

      let status: StepProgressItem["status"] = "LOCKED";
      let uploadedBy = "-";
      let uploadById: string | undefined = undefined;
      let date = "-";
      let rawDate: string | undefined = undefined;
      let progress_id: string | undefined = undefined;
      let document_link: string | undefined = undefined;
      let approvedBy: string | undefined = undefined;
      let rejectionBy: string | undefined = undefined;

      if (progress) {
        progress_id = progress.progress_id;
        document_link = progress.document_link;
        uploadedBy = progress.uploader_name || "User";
        uploadById = progress.upload_by;
        date = progress.formatted_upload_date || "-";
        rawDate = progress.raw_upload_date;
        approvedBy = progress.approvedBy;
        rejectionBy = progress.rejectionBy;

        if (progress.approvedBy) {
          status = "APPROVED";
          previousStepApproved = true;
        } else if (progress.rejectionBy) {
          status = "REVISION";
          previousStepApproved = false;
        } else if (progress.raw_upload_date || progress.document_link) {
          status = "PENDING_APPROVAL";
          previousStepApproved = false;
        } else {
          status = previousStepApproved ? "PENDING_UPLOAD" : "LOCKED";
        }
      } else {
        if (previousStepApproved) {
          status = "PENDING_UPLOAD";
          previousStepApproved = false;
        } else {
          status = "LOCKED";
        }
      }

      return {
        step_id: s.step_id,
        gateNumber: s.step_number,
        title: s.step_name,
        href: meta.href,
        subtitle: meta.subtitle,
        description: meta.description,
        uploadedBy,
        uploadById,
        date,
        rawDate,
        status,
        output: meta.output,
        progress_id,
        document_link,
        approvedBy,
        rejectionBy,
      };
    });

    return {
      success: true,
      project,
      steps,
      accounts,
    };
  } catch (error: any) {
    console.error("Gagal mengambil data steps:", error);
    return {
      success: false,
      steps: [],
      accounts: [],
      error: error?.message || "Gagal mengambil data steps dari database",
    };
  }
}

export async function submitStepProgress(params: {
  projectId: string;
  stepId: string;
  uploadBy: string;
  uploadDate: string;
  documentLink: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    let targetProjectId = params.projectId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetProjectId);
    if (!isUUID) {
      const fallbackProj = await pool.query(
        "SELECT project_id FROM project ORDER BY start_date DESC NULLS LAST LIMIT 1"
      );
      if (fallbackProj.rows.length > 0) {
        targetProjectId = fallbackProj.rows[0].project_id;
      } else {
        return { success: false, error: "ID proyek tidak valid dalam database." };
      }
    }

    if (!params.documentLink?.trim()) {
      return { success: false, error: "Link dokumen wajib diisi." };
    }

    if (!params.uploadBy) {
      return { success: false, error: "Pengunggah (upload_by) wajib dipilih." };
    }

    const uploadDate = params.uploadDate || new Date().toISOString().split("T")[0];

    // Periksa apakah progress sudah pernah dibuat untuk step ini
    const existing = await pool.query(
      "SELECT progress_id FROM progress WHERE project_id = $1 AND step_id = $2",
      [targetProjectId, params.stepId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `
        UPDATE progress 
        SET 
          upload_by = $1, 
          upload_date = $2, 
          document_link = $3, 
          "approvedBy" = NULL,
          "rejectionBy" = NULL
        WHERE progress_id = $4
        `,
        [params.uploadBy, uploadDate, params.documentLink.trim(), existing.rows[0].progress_id]
      );
    } else {
      await pool.query(
        `
        INSERT INTO progress (
          project_id, 
          step_id, 
          upload_by, 
          upload_date, 
          document_link, 
          "approvedBy", 
          "rejectionBy"
        )
        VALUES ($1, $2, $3, $4, $5, NULL, NULL)
        `,
        [targetProjectId, params.stepId, params.uploadBy, uploadDate, params.documentLink.trim()]
      );
    }

    revalidatePath(`/dashboard/${targetProjectId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Gagal submit progress step:", error);
    return { success: false, error: error?.message || "Gagal menyimpan progres ke database." };
  }
}
