"use server";

import pool from "@/app/lib/neon";
import { revalidatePath } from "next/cache";

export type ProjectStatus = "added" | "On Going" | "Finished";

export interface ProjectRecord {
  project_id: string;
  project_name: string;
  client: string;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
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
  id: string;
  code: string;
  name: string;
  gate: string;
  stepNumber: number;
  stepSlug: string;
  uploader: string;
  status: string;
  reason: string;
}

export interface DashboardData {
  projects: ProjectRecord[];
  metrics: DashboardMetrics;
  gateDistribution: GateItem[];
  urgentActions: UrgentActionItem[];
}

export async function getDashboardData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
  try {
    // 1. Ambil semua project
    const projectRes = await pool.query(`
      SELECT 
        project_id, 
        project_name, 
        client, 
        TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, 
        TO_CHAR(end_date, 'YYYY-MM-DD') as end_date
      FROM project 
      ORDER BY start_date DESC NULLS LAST
    `);
    const rawProjects = projectRes.rows;

    // 2. Ambil master steps untuk menghitung total gate SOP
    const stepRes = await pool.query(`
      SELECT step_id, TRIM(step_name) as step_name, step_number 
      FROM step 
      ORDER BY step_number ASC
    `);
    const steps = stepRes.rows;
    const totalMasterGates = steps.length || 7;

    // 3. Ambil seluruh data progress
    const progressRes = await pool.query(`
      SELECT 
        p.progress_id, 
        p.project_id, 
        p.step_id, 
        p.upload_date, 
        p.document_link,
        p."approvedBy",
        p."rejectionBy",
        TRIM(s.step_name) as step_name, 
        s.step_number
      FROM progress p
      LEFT JOIN step s ON p.step_id = s.step_id
    `);
    const progressRows = progressRes.rows;

    // 4. Kalkulasi status dinamis untuk setiap proyek
    const projects: ProjectRecord[] = rawProjects.map((p) => {
      const projectProgresses = progressRows.filter((pr) => pr.project_id === p.project_id);

      // Hitung unggahan aktif
      const hasAnyUpload = projectProgresses.some(
        (pr) => pr.upload_date || pr.document_link
      );

      // Hitung gate yang sudah di-approve
      const approvedCount = projectProgresses.filter((pr) => pr.approvedBy).length;

      let calculatedStatus: ProjectStatus = "added";

      if (totalMasterGates > 0 && approvedCount === totalMasterGates) {
        calculatedStatus = "Finished";
      } else if (hasAnyUpload) {
        calculatedStatus = "On Going";
      } else {
        calculatedStatus = "added";
      }

      return {
        ...p,
        status: calculatedStatus,
      };
    });

    // 5. Query Urgent Actions (Gate yang ditolak)
    const urgentRes = await pool.query(`
      SELECT 
        p.project_id as id,
        pj.project_name as name,
        s.step_number,
        COALESCE(TRIM(s.step_name), 'Unknown Step') as step_name,
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

    const urgentActions: UrgentActionItem[] = urgentRes.rows.map((row) => {
      const rawStepName = row.step_name || "Unknown Step";
      const cleanStepName = rawStepName.replace(/[\r\n\t]/g, "").trim();
      const stepSlug = cleanStepName
        ? cleanStepName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
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

    // Metrik Dashboard
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "On Going" || p.status === "added").length;
    const completedProjects = projects.filter((p) => p.status === "Finished").length;

    const pendingVerifications = progressRows.filter(
      (pr) => (pr.upload_date || pr.document_link) && !pr.approvedBy && !pr.rejectionBy
    ).length;

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
      const count = progressRows.filter((pr) => pr.step_number === s.step_number).length;
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
          revisionsNeeded: urgentActions.length,
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
