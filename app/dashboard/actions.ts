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

export interface DashboardData {
  projects: ProjectRecord[];
  metrics: DashboardMetrics;
  gateDistribution: GateItem[];
  urgentActions: Array<{
    id: string;
    code: string;
    name: string;
    gate: string;
    uploader: string;
    status: "PENDING" | "REVISION";
    type: string;
  }>;
}

export async function getDashboardData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
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

    // 3. Ambil data progress (jika ada)
    const progressRes = await pool.query(`
      SELECT 
        p.progress_id, 
        p.project_id, 
        p.step_id, 
        p.upload_date, 
        p."approvedBy",
        p."rejectionBy",
        TRIM(s.step_name) as step_name, 
        s.step_number
      FROM progress p
      LEFT JOIN step s ON p.step_id = s.step_id
    `);
    const progressRows = progressRes.rows;

    // Hitung metrik
    const totalProjects = projects.length;
    
    // Proyek aktif: jika status On Going / added, atau end_date di masa depan
    const now = new Date();
    const activeProjects = projects.filter((p) => {
      if (p.status) return p.status === "On Going" || p.status === "added";
      if (!p.end_date) return true;
      return new Date(p.end_date) >= now;
    }).length;

    const completedProjects = projects.filter((p) => p.status === "Finished").length || (totalProjects - activeProjects);

    // Pending verification: progress yang sudah diupload tapi belum di-approve
    const pendingVerifications = progressRows.filter(
      (pr) => pr.upload_date && !pr.approvedBy
    ).length;

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
          revisionsNeeded: 0,
        },
        gateDistribution,
        urgentActions: [],
      },
    };
  } catch (error: any) {
    console.error("Gagal memuat data dashboard:", error);
    return {
      success: false,
      error: error?.message || "Gagal mengambil data dari database",
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
      return { success: false, error: "Nama proyek wajib diisi." };
    }
    if (!formData.client?.trim()) {
      return { success: false, error: "Nama klien wajib diisi." };
    }

    const startDate = formData.start_date?.trim() ? formData.start_date.trim() : null;
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
      [formData.project_name.trim(), formData.client.trim(), startDate, endDate, projectStatus]
    );

    const newProject = res.rows[0];

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      project: newProject,
    };
  } catch (error: any) {
    console.error("Gagal menambah project:", error);
    return {
      success: false,
      error: error?.message || "Gagal menambahkan project ke database.",
    };
  }
}
