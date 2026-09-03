"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Compass,
  Layers,
  Activity,
  Settings,
  LifeBuoy,
  User,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Clock,
  Calculator,
  ClipboardPen,
  ArrowLeft,
  Home,
  Wallet,
  LogOut,
  CalendarClock,
  ListChecks,
  LetterText,
  CalculatorIcon,
  DollarSign,
  FileTerminal,
  Wrench,
  FlaskConical,
  BanknoteArrowDown,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: {
    name: string;
    href: string;
    icon?: React.ElementType;
    subItems?: { name: string; href: string; icon?: React.ElementType }[];
  }[];
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: "Memuat...",
    role: "User",
    initials: "--",
  });

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const level = localStorage.getItem("userLevel");
    const name = localStorage.getItem("userName");
    const jabatan = localStorage.getItem("userJabatan");

    if (email) {
      const namePart = email.replace("@surveyteknologi.id", "");
      const formattedName = namePart
        .split(".")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const displayName = name || formattedName;
      const initials = displayName.substring(0, 2).toUpperCase();

      setUserInfo({
        name: displayName,
        role: jabatan || level || "User",
        initials: initials,
      });
    }
  }, []);

  // Track open state for submenus
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    "Finance & Billings": pathname?.startsWith("/dashboard/finance") || false,
    "Document": pathname?.startsWith("/dashboard/document") || false,
    "Tax Calculator": pathname?.startsWith("/dashboard/tax") || false,
    "Tools": pathname?.startsWith("/dashboard/tools") || false,
  });

  const toggleSubmenu = (menuName: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const isProjectWorkspace =
    pathname?.startsWith("/dashboard/projects/") &&
    pathname !== "/dashboard/projects";
  const projectId = isProjectWorkspace ? pathname.split("/")[3] : null;

  // Menu Utama
  const mainMenuItems: MenuItem[] = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
  ];

  const currentMenuItems = mainMenuItems;

  const footerMenuItems = [
    { name: "Settings", href: "/dashboard#settings", icon: Settings },
    { name: "Help & Support", href: "/dashboard/help", icon: LifeBuoy },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 flex flex-col justify-between h-screen w-64 bg-white border-r border-slate-200 shadow-2xl md:shadow-none backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Section: Logo & Company Name (Row Layout) + Menu Utama */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo & Company Name (Row Layout) */}
          <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-200 flex-shrink-0 group">
            <Link href="/dashboard" className="flex items-center gap-3 w-full">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 p-1 bg-slate-50 transition-all duration-300 group-hover:border-slate-300 flex-shrink-0">
                <Image
                  src="/assets/images/logo.jpeg"
                  width={38}
                  height={38}
                  alt="Survey Teknologi Indonesia Logo"
                  className="rounded-lg object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold tracking-wider text-slate-900 uppercase leading-tight truncate">
                  SURVEY TEKNOLOGI
                </span>
                <span className="text-[10px] font-bold text-slate-900 tracking-widest uppercase leading-tight mt-0.5 flex items-center gap-1">
                  <span>INDONESIA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                </span>
              </div>
            </Link>
          </div>

          {/* Menu Utama Label */}
          <div className="px-6 pt-6 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isProjectWorkspace ? "Project Menu" : "Menu Utama"}
            </span>
          </div>

          {/* Menu Navigation */}
          <nav className="px-3 space-y-1">
            {currentMenuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
              const isSubOpen = Boolean(openMenus[item.name]);
              const isItemActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  item.href !== "/dashboard" &&
                  item.href !== "/dashboard" &&
                  pathname?.startsWith(item.href)) ||
                (item.href === "/dashboard" && (pathname === "/" || pathname === "/dashboard/")) ||
                (hasSubItems &&
                  item.subItems?.some(
                    (sub) =>
                      pathname === sub.href ||
                      (sub.href !== "/" && pathname?.startsWith(sub.href))
                  ));

              if (hasSubItems) {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      type="button"
                      onClick={(e) => toggleSubmenu(item.name, e)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group cursor-pointer ${
                        isItemActive
                          ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 text-slate-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isItemActive
                              ? "text-brand-cyan"
                              : "text-slate-500 group-hover:text-slate-900"
                          }`}
                        />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isSubOpen ? "rotate-90 text-brand-cyan" : "text-slate-400"
                        }`}
                      />
                    </button>

                    {isSubOpen && item.subItems && (
                      <div className="ml-4 pl-3.5 border-l border-slate-200 space-y-1 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon || FileText;
                          const isSubActive =
                            pathname === sub.href ||
                            (sub.href !== "/" && pathname?.startsWith(sub.href));

                          return (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={onClose}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-150 group ${
                                isSubActive
                                  ? "bg-brand-cyan/15 text-brand-cyan font-semibold"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                            >
                              <SubIcon
                                className={`w-3.5 h-3.5 transition-colors ${
                                  isSubActive
                                    ? "text-brand-cyan"
                                    : "text-slate-400 group-hover:text-brand-cyan"
                                }`}
                              />
                              <span className="truncate">{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isItemActive
                      ? "bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/25 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isItemActive
                        ? "text-brand-cyan"
                        : "text-slate-500 group-hover:text-slate-900"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Footer Navbar (Settings dll & Admin Profile) */}
        <div className="p-4 border-t border-slate-200 space-y-4 bg-slate-50/80">
          {/* Footer Navigation Label */}
          <div className="px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              System & Settings
            </span>
          </div>

          <div className="space-y-1">
            {footerMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-all duration-200 group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan transition-colors" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-colors" />
              <span>Logout</span>
            </button>
          </div>

          {/* User Profile Summary Card */}
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className="block group"
          >
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3 transition-colors group-hover:bg-slate-50 cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-400 flex items-center justify-center text-slate-600 font-bold text-xs shadow-md flex-shrink-0">
                {userInfo.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate group-hover:text-slate-700 transition-colors">
                  {userInfo.name}
                </p>
                <p className="text-[10px] text-brand-cyan font-medium truncate capitalize">
                  {userInfo.role}
                </p>
              </div>
              <div
                className="h-2 w-2 rounded-full bg-emerald-400"
                title="Online"
              />
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}