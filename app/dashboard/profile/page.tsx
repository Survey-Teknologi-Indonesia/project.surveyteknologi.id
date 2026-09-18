"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
} from "lucide-react";
import {
  getAccountProfile,
  updateAccountProfile,
  updateAccountPassword,
} from "./actions";

import { getCurrentUser } from "@/app/login/actions";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // State Profile Info (Disesuaikan dengan skema tabel account)
  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    role: "",
    company: "PT Survey Teknologi Indonesia",
  });

  // State Form Change Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback State
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch Data dari Database saat komponen dimuat
  useEffect(() => {
    setIsLoadingProfile(true);

    // 1. Ambil session user aktif dari cookie auth_token
    getCurrentUser().then(async (user) => {
      if (user && user.id) {
        // Simpan backup ke localStorage agar kompatibel dengan fungsi lain
        localStorage.setItem("userId", user.id);

        // 2. Ambil detail akun dari database
        const res = await getAccountProfile(user.id);
        if (res.success && res.data) {
          const data = res.data;
          setProfileData((prev) => ({
            ...prev,
            username: data.username || "",
            fullName: data.name || "",
            role: data.role || "User",
          }));
        } else {
          setMessage({
            type: "error",
            text: res.error || "Gagal memuat profil.",
          });
        }
      } else {
        setMessage({
          type: "error",
          text: "Sesi tidak ditemukan. Silakan login kembali.",
        });
      }
      setIsLoadingProfile(false);
    });
  }, []);
  // Handle Update Profile via Server Action
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountId = localStorage.getItem("userId");
    if (!accountId) {
      setMessage({ type: "error", text: "User session not found." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const res = await updateAccountProfile(accountId, {
      name: profileData.fullName,
      username: profileData.username,
    });

    setIsSubmitting(false);

    // Pengecekan eksplisit res.data
    if (res.success && res.data) {
      const updatedData = res.data; // Simpan ke variabel lokal agar type-narrowing bekerja sempurna
      setProfileData((prev) => ({
        ...prev,
        username: updatedData.username || "",
        fullName: updatedData.name || "",
      }));
      setMessage({
        type: "success",
        text: "Profile details updated successfully!",
      });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to update profile.",
      });
    }
  };
  // Handle Update Password via Server Action
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    const accountId = localStorage.getItem("userId");
    if (!accountId) {
      setMessage({ type: "error", text: "User session not found." });
      return;
    }

    setIsSubmitting(true);

    const res = await updateAccountPassword(accountId, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to change password.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 font-sans text-slate-800 space-y-6">
      {/* 1. Header & Avatar Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-[#004b87]/10 text-[#004b87] font-black text-2xl flex items-center justify-center border border-[#004b87]/20 shadow-inner flex-shrink-0">
          {isLoadingProfile ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            (profileData.fullName || "User")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          )}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-xl font-bold text-slate-900">
            {isLoadingProfile
              ? "Loading..."
              : profileData.fullName || "User Profile"}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {profileData.username || "username"}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#004b87]/10 text-[#004b87] border border-[#004b87]/20 uppercase">
              <Shield className="w-3 h-3" />
              {profileData.role || "User"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <Building className="w-3 h-3 text-slate-400" />
              {profileData.company}
            </span>
          </div>
        </div>
      </div>

      {/* Alert / Feedback Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setActiveTab("profile");
          }}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "profile"
              ? "text-[#004b87]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Account Details
          {activeTab === "profile" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004b87] rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setActiveTab("security");
          }}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "security"
              ? "text-[#004b87]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Security & Password
          {activeTab === "security" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004b87] rounded-full" />
          )}
        </button>
      </div>

      {/* 3. Content Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Min. 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-[#004b87] focus:ring-2 focus:ring-[#004b87]/10 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#004b87] hover:bg-[#003763] text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
