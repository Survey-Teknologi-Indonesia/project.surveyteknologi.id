"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  X,
  Bell,
  LogOut,
  User,
  Settings,
  Command,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface DashboardNavbarProps {
  onOpenMobileMenu?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardNavbar({
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
}: DashboardNavbarProps) {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Admin User",
    email: "admin@surveyteknologi.id",
    role: "Administrator",
    initials: "AD",
  });

  useEffect(() => {
    // User info sync from localStorage
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

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userLevel");
    localStorage.removeItem("userName");
    localStorage.removeItem("userJabatan");
    window.location.href = "/login";
  };

  // Menu navigasi utama pengganti sidebar
  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard }, 
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    // { name: "Stage Gates", href: "/dashboard/gates", icon: Layers },
    // { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shadow-sm backdrop-blur-md transition-all">
      {/* LEFT SECTION: Brand Logo & Main Navigation Links */}
      <div className="flex items-center gap-6 lg:gap-10">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Buka menu navigasi"
          className="inline-flex lg:hidden items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Brand Logo & Title */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 p-1 bg-slate-50 shadow-sm">
            <Image
              src="/assets/images/logo.jpeg"
              width={36}
              height={36}
              alt="Logo STI"
              className="rounded-lg object-cover  transition-all"
              unoptimized
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-black tracking-wider text-slate-900 uppercase leading-none">
              SURVEY TEKNOLOGI
            </span>
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mt-0.5">
              INDONESIA
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Pengganti Sidebar) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-zinc-300" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* RIGHT SECTION: Search Bar, Notifications, & Profile */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64 xl:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari proyek atau dokumen..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400/20 transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            aria-label="Notifikasi"
            className="relative rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all focus:outline-none cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-800" />
            </span>
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Notifikasi Sistem
                </h4>
                <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-full">
                  3 Baru
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">Flight Plan Disetujui</p>
                    <span className="text-[10px] text-slate-400">5m lalu</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Gate 1 Proyek IKN telah disetujui oleh Verifikator.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">Upload Data Baru</p>
                    <span className="text-[10px] text-slate-400">1j lalu</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Oliver mengunggah data mentah area Sawit.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
              {userInfo.initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {userInfo.name}
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase leading-tight">
                {userInfo.role}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {userInfo.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {userInfo.email}
                </p>
              </div>
              <div className="mt-1 space-y-0.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Profil Saya</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Pengaturan</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU (Muncul saat tombol hamburger diklik di layar kecil) */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 lg:hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1 mb-4 pb-4 border-b border-slate-100">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-zinc-300" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Search bar khusus mobile */}
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari proyek..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}