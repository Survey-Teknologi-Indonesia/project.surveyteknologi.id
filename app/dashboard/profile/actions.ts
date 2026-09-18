"use server";

import pool from "@/app/lib/neon";
import { revalidatePath } from "next/cache";

export interface AccountProfile {
  account_id: string;
  name: string | null;
  username: string | null;
  role: string | null;
}

// 1. Ambil data profil berdasarkan account_id
export async function getAccountProfile(accountId: string): Promise<{
  success: boolean;
  data?: AccountProfile;
  error?: string;
}> {
  try {
    if (!accountId) {
      return { success: false, error: "Account ID is required" };
    }

    const res = await pool.query(
      `
      SELECT 
        account_id, 
        name, 
        username, 
        role 
      FROM account 
      WHERE account_id = $1
      `,
      [accountId]
    );

    if (res.rows.length === 0) {
      return { success: false, error: "Account not found" };
    }

    return {
      success: true,
      data: res.rows[0],
    };
  } catch (error: any) {
    console.error("Failed to fetch account profile:", error);
    return {
      success: false,
      error: error?.message || "Failed to retrieve account data.",
    };
  }
}

// 2. Update Informasi Profile (name & username)
export async function updateAccountProfile(
  accountId: string,
  formData: { name: string; username: string }
): Promise<{ success: boolean; data?: AccountProfile; error?: string }> {
  try {
    if (!accountId) {
      return { success: false, error: "Account ID is required" };
    }
    if (!formData.username?.trim()) {
      return { success: false, error: "Username is required" };
    }

    // Cek apakah username sudah dipakai oleh akun lain
    const checkUser = await pool.query(
      `SELECT account_id FROM account WHERE username = $1 AND account_id != $2`,
      [formData.username.trim(), accountId]
    );

    if (checkUser.rows.length > 0) {
      return { success: false, error: "Username is already taken." };
    }

    const res = await pool.query(
      `
      UPDATE account 
      SET 
        name = $1, 
        username = $2 
      WHERE account_id = $3
      RETURNING account_id, name, username, role
      `,
      [formData.name.trim(), formData.username.trim(), accountId]
    );

    revalidatePath("/dashboard/profile");

    return {
      success: true,
      data: res.rows[0],
    };
  } catch (error: any) {
    console.error("Failed to update account profile:", error);
    return {
      success: false,
      error: error?.message || "Failed to update profile.",
    };
  }
}

// 3. Update Password
export async function updateAccountPassword(
  accountId: string,
  formData: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!accountId) {
      return { success: false, error: "Account ID is required" };
    }
    if (!formData.currentPassword || !formData.newPassword) {
      return { success: false, error: "All password fields are required" };
    }

    // Ambil password lama dari DB untuk verifikasi
    const res = await pool.query(
      `SELECT password FROM account WHERE account_id = $1`,
      [accountId]
    );

    if (res.rows.length === 0) {
      return { success: false, error: "Account not found" };
    }

    const currentDbPassword = res.rows[0].password;

    // Cek kesesuaian password lama
    if (currentDbPassword !== formData.currentPassword) {
      return { success: false, error: "Current password is incorrect." };
    }

    // Update password baru ke DB
    await pool.query(
      `UPDATE account SET password = $1 WHERE account_id = $2`,
      [formData.newPassword, accountId]
    );

    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update password:", error);
    return {
      success: false,
      error: error?.message || "Failed to update password.",
    };
  }
}