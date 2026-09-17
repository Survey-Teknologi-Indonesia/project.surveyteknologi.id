"use server";

import pool from "@/app/lib/neon";
import { revalidatePath } from "next/cache";

export type ProjectStatus = "On Going" | "Finished" | "added";

export interface ProjectRecord {
  project_id: string;
  project_name: string;
  client: string;
  start_date: string | null;
  end_date: string | null;
  status?: ProjectStatus | null;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalAreaHa: number;
  pendingVerifications: number;
  revisionsNeeded: number;
}

export interface GateItem {
  gate: string;
  title: string;
  count: number;
  color: string;
}

export interface UrgentActionItem {
  id: string; // project_id
  code: string; // ID pendek/kode
  name: string; // Nama project
  gate: string; // Nama Gate / Step
  uploader: string; // Pihak/User penolak
  status: string; // Evaluated Status (REVISION_NEEDED)
  reason: string; // Alasan penolakan
  stepSlug: string;
}

export interface DashboardData {
  projects: ProjectRecord[];
  metrics: DashboardMetrics;
  gateDistribution: GateItem[];
  urgentActions: UrgentActionItem[];
}

export async function getDashboardData(): Promise<{
  success: boolean;
  data?: DashboardData;
  error?: string;
}> {
  try {
    // 1. Ambil semua project dari tabel project
    const projectRes = await pool.query(`
      SELECT 
        project_id, 
        project_name, 
        client, 
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, 
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
        status
      FROM project 
      ORDER BY start_date DESC NULLS LAST
    `);
    const projects: ProjectRecord[] = projectRes.rows;

    // 2. Ambil master steps untuk sop gates
    const stepRes = await pool.query(`
      SELECT step_id, TRIM(step_name) as step_name, step_number 
      FROM step 
      ORDER BY step_number ASC
    `);
    const steps = stepRes.rows;

    // 3. Ambil seluruh data progress
    const progressRes = await pool.query(`
      SELECT 
        p.progress_id, 
        p.project_id, 
        p.step_id, 
        p.upload_date, 
        p."approvedBy",
        p."rejectionBy",
        p.document_link,
        pj.project_name,
        TRIM(s.step_name) as step_name, 
        s.step_number
      FROM progress p
      LEFT JOIN step s ON p.step_id = s.step_id
      LEFT JOIN project pj ON p.project_id = pj.project_id
    `);
    const progressRows = progressRes.rows;

    // 4. Query Urgent Actions khusus mengambil progress dengan status REVISION_NEEDED
    // Logika status dievaluasi menggunakan CASE WHEN sesuai dengan kondisi logika frontend
    // 4. Query Urgent Actions dengan JOIN ke tabel rejection dan account
    // 1. Tambahkan COALESCE pada query SQL agar step_name tidak bernilai NULL
    const urgentRes = await pool.query(`
  SELECT 
    p.project_id as id,
    pj.project_name as name,
    s.step_number,
    s.step_name,
    COALESCE(TRIM(s.step_url), 'Unknown Step') as step_url,
    COALESCE(a.name, a.username, 'QC Team') as uploader,
    'REVISION_NEEDED' as status,
    COALESCE(r.remarks, 'Revision required for this stage.') as reason
  FROM progress p
  INNER JOIN project pj ON p.project_id = pj.project_id
  INNER JOIN step s ON p.step_id = s.step_id
  INNER JOIN rejection r ON p."rejectionBy" = r.rejection_id
  LEFT JOIN account a ON r."rejectBy" = a.account_id
  WHERE p."approvedBy" IS NULL 
    AND p."rejectionBy" IS NOT NULL
  ORDER BY r.date DESC NULLS LAST, p.upload_date DESC NULLS LAST
`);

    // 2. Gunakan optional chaining (?.) atau fallback default string sebelum calling .replace()
    const urgentActions: UrgentActionItem[] = urgentRes.rows.map((row) => {
      const rawStepName = row.step_url || "Unknown Step";
      const cleanStepName = rawStepName.replace(/[\r\n\t]/g, "").trim();

      // Keamanan tambahan untuk pembuat slug
      const stepSlug = cleanStepName
        ? cleanStepName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : "step";

      return {
        id: row.id,
        code: `PRJ-${String(row.id).slice(0, 5).toUpperCase()}`,
        name: row.name || "Unnamed Project",
        gate: `Gate ${row.step_number || 0}: ${cleanStepName}`,
        stepNumber: row.step_number || 0,
        stepSlug: stepSlug,
        uploader: row.uploader,
        status: row.status,
        reason: row.reason,
      };
    });
    // Hitung metrik
    const totalProjects = projects.length;
    const now = new Date();
    const activeProjects = projects.filter((p) => {
      if (p.status) return p.status === "On Going" || p.status === "added";
      if (!p.end_date) return true;
      return new Date(p.end_date) >= now;
    }).length;

    const completedProjects =
      projects.filter((p) => p.status === "Finished").length ||
      totalProjects - activeProjects;

    // Pending Verification: Ada upload_date/document_link tetapi approvedBy & rejectionBy masih NULL
    const pendingVerifications = progressRows.filter(
      (pr) =>
        (pr.upload_date || pr.document_link) &&
        !pr.approvedBy &&
        !pr.rejectionBy,
    ).length;

    const revisionsNeeded = urgentActions.length;

    // Gate distribution colors
    const gateColors = [
      "bg-emerald-500",
      "bg-emerald-500",
      "bg-emerald-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-[#004b87]",
      "bg-slate-400",
    ];

    const gateDistribution: GateItem[] = steps.map((s, idx) => {
      const count = progressRows.filter(
        (pr) => pr.step_number === s.step_number,
      ).length;
      return {
        gate: `Gate ${s.step_number}`,
        title: s.step_name.replace(/[\r\n\t]/g, "").trim(),
        count: count,
        color: gateColors[idx % gateColors.length],
      };
    });

    return {
      success: true,
      data: {
        projects,
        metrics: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalAreaHa: 0,
          pendingVerifications,
          revisionsNeeded,
        },
        gateDistribution,
        urgentActions,
      },
    };
  } catch (error: any) {
    console.error("Failed to load dashboard data:", error);
    return {
      success: false,
      error: error?.message || "Failed to retrieve data from database",
    };
  }
}

export async function createProject(formData: {
  project_name: string;
  client: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: ProjectStatus | null;
}): Promise<{ success: boolean; project?: ProjectRecord; error?: string }> {
  try {
    if (!formData.project_name?.trim()) {
      return { success: false, error: "Project name is required." };
    }
    if (!formData.client?.trim()) {
      return { success: false, error: "Client name is required." };
    }

    const startDate = formData.start_date?.trim()
      ? formData.start_date.trim()
      : null;
    const endDate = formData.end_date?.trim() ? formData.end_date.trim() : null;
    const projectStatus = formData.status || "On Going";

    const res = await pool.query(
      `
      INSERT INTO project (project_name, client, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        project_id, 
        project_name, 
        client, 
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, 
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
        status
      `,
      [
        formData.project_name.trim(),
        formData.client.trim(),
        startDate,
        endDate,
        projectStatus,
      ],
    );

    const newProject = res.rows[0];

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      project: newProject,
    };
  } catch (error: any) {
    console.error("Failed to create project:", error);
    return {
      success: false,
      error: error?.message || "Failed to add project to database.",
    };
  }
}
