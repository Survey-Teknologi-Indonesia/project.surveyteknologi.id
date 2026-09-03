"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

export async function loginUser(username: string, password: string) {
  if (!process.env.DATABASE_URL) {
    return { success: false, message: "Database URL not configured" };
  }
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Querying the account table matching the schema provided
    const result = await sql`
      SELECT account_id, name, username, role
      FROM account
      WHERE username = ${username} AND password = ${password}
    `;
    
    if (result.length > 0) {
      const user = result[0];
      
      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set('auth_token', user.account_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
      });

      return { 
        success: true, 
        message: "Authentication successful! Redirecting to dashboard...", 
        user: { 
          id: user.account_id, 
          name: user.name, 
          username: user.username,
          role: user.role
        } 
      };
    } else {
      return { success: false, message: "Invalid email or password." };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An error occurred during login. Please try again." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}


export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token || !process.env.DATABASE_URL) {
    return null;
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`
      SELECT account_id, name, username, role
      FROM account
      WHERE account_id = ${token}
    `;

    if (result.length > 0) {
      const user = result[0];
      return {
        id: user.account_id,
        name: user.name,
        username: user.username,
        role: user.role,
      };
    }
    return null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}