"use client";

import React, { useState, useEffect } from "react";
import { 
  Menu, 
  Search, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  User, 
  Settings,
  Sparkles,
  Command
} from "lucide-react";
import Link from "next/link";

interface DashboardNavbarProps {
  onOpenSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardNavbar({
  onOpenSidebar,
  searchQuery,
  onSearchChange,
}: DashboardNavbarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Admin User",
    email: "admin@surveyteknologi.id",
    role: "Administrator",
    initials: "AD",
  });

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("theme");
    const isLight =
      savedTheme === "light" ||
      document.documentElement.classList.contains("light");
    if (isLight) {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    }

    // User info sync
    const email = localStorage.getItem("userEmail");
    const level = localStorage.getItem("userLevel");
    const name = localStorage.getItem("userName");
    const jabatan = localStorage.getItem("userJabatan");

    if (email) {
      const namePart = email.replace("@surveyteknologi.id", "");
      const formattedName = namePart
        .split(".")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      const displayName = name || formattedName;
      setUserInfo({
        name: displayName,
        email: email,
        role: jabatan || level || "Admin",
        initials: displayName.substring(0, 2).toUpperCase(),
      });
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      if (newTheme === "light") {
        document.documentElement.classList.add("light");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.classList.remove("light");
        localStorage.setItem("theme", "dark");
      }
      return newTheme;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userLevel");
    localStorage.removeItem("userName");
    localStorage.removeItem("userJabatan");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/10 light:border-slate-200 bg-white px-4 sm:px-6 backdrop-blur-md transition-all duration-300">
      {/* Left side: Mobile Sidebar Toggle & Search Bar */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka menu navigasi"
          className="inline-flex md:hidden items-center justify-center rounded-xl p-2.5 text-gray-400 light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-white light:hover:text-slate-900 border border-white/10 light:border-slate-200 transition-colors focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 light:text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari proyek, satelit, invoice, atau laporan..."
            className="w-full rounded-xl border border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-50 py-2 pl-10 pr-10 text-xs sm:text-sm text-white light:text-slate-900 placeholder:text-gray-400 light:placeholder:text-slate-400 focus:border-brand-cyan/60 focus:bg-white/10 light:focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all duration-200"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white light:hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <div className="hidden sm:flex pointer-events-none absolute inset-y-0 right-0 items-center pr-3">
              <kbd className="inline-flex items-center gap-0.5 rounded border border-white/15 light:border-slate-200 bg-white/5 light:bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 light:text-slate-500">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Actions, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle Button */}

        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            aria-label="Notifikasi"
            className="relative rounded-xl border border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-100 p-2.5 text-gray-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/10 light:hover:bg-slate-200/70 transition-all duration-200 focus:outline-none cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan" />
            </span>
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 light:border-slate-200 bg-zinc-950/95 light:bg-white shadow-2xl backdrop-blur-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 light:border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white light:text-slate-900">
                  Notifikasi Sistem
                </h4>
                <span className="text-[10px] font-semibold bg-brand-cyan/15 text-brand-cyan px-2 py-0.5 rounded-full">
                  3 Baru
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 light:bg-slate-50 border border-white/5 light:border-slate-100 hover:border-brand-cyan/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white light:text-slate-900">Tasking Satelit Sukses</p>
                    <span className="text-[10px] text-gray-400">5m lalu</span>
                  </div>
                  <p className="text-gray-400 light:text-slate-500 text-[11px] mt-0.5">Citra resolusi tinggi 1.5m area IKN telah diproses.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 light:bg-slate-50 border border-white/5 light:border-slate-100 hover:border-brand-cyan/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white light:text-slate-900">Invoice Terbayar</p>
                    <span className="text-[10px] text-gray-400">1j lalu</span>
                  </div>
                  <p className="text-gray-400 light:text-slate-500 text-[11px] mt-0.5">Pembayaran invoice INV-2026-08 telah diterima.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Quick Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 light:border-slate-200 bg-white/5 light:bg-slate-100 p-1.5 sm:px-3 sm:py-1.5 hover:bg-white/10 light:hover:bg-slate-200/60 transition-all duration-200 cursor-pointer"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-tr from-zinc-700 to-zinc-400 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
              {userInfo.initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white light:text-slate-900 leading-tight">
                {userInfo.name}
              </span>
              <span className="text-[10px] font-medium text-brand-cyan leading-tight">
                {userInfo.role}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 light:border-slate-200 bg-zinc-950/95 light:bg-white shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2.5 border-b border-white/10 light:border-slate-100">
                <p className="text-xs font-bold text-white light:text-slate-900 truncate">
                  {userInfo.name}
                </p>
                <p className="text-[11px] text-gray-400 light:text-slate-500 truncate">
                  {userInfo.email}
                </p>
              </div>
              <div className="mt-1 space-y-0.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-gray-300 light:text-slate-700 hover:bg-white/5 light:hover:bg-slate-100 hover:text-white light:hover:text-slate-950 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-brand-cyan" />
                  <span>Profil Saya</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-gray-300 light:text-slate-700 hover:bg-white/5 light:hover:bg-slate-100 hover:text-white light:hover:text-slate-950 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-brand-cyan" />
                  <span>Pengaturan</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-rose-400 hover:bg-rose-400/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
