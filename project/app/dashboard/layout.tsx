"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "../componets/layout/sidebar";
import DashboardNavbar from "../componets/layout/dashboard-navbar";

import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"bulan-ini" | "q3" | "tahun-ini">(
    "bulan-ini",
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pathname = usePathname();

  const isChatPage = pathname?.startsWith("/dashboard/chat");

  // Auto hide toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage("Data statistik dashboard berhasil diperbarui!");
    }, 700);
  };

  const handleExportReport = () => {
    setToastMessage(
      "Laporan Tagihan & Pembayaran Q3_2026.pdf sedang diunduh...",
    );
  };

  const handleTaskingRequest = () => {
    setToastMessage(
      "Permintaan Tasking Satelit Resolusi 1.5m telah dijadwalkan ke Tim Operasional.",
    );
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-100 font-sans">
        <div className="min-h-screen print:min-h-auto flex bg-slate-50  text-slate-100 light:text-slate-900 font-sans transition-colors duration-300 relative overflow-x-clip print:overflow-visible">
          {/* 1. SIDEBAR KIRI */}
          {!isChatPage && (
            <div className="print:hidden">
              <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
          )}

          {/* 2. AREA CONTENT UTAMA + NAVBAR ATAS */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${
              isChatPage ? "" : "md:ml-64"
            } print:ml-0 print:overflow-visible transition-all duration-300`}
          >
            {/* Top Navbar dengan Search Bar dan Tombol Logout */}
            <div className="print:hidden">
              <DashboardNavbar
                onOpenSidebar={() => setIsSidebarOpen(true)}
                searchQuery={searchQuery}
                onSearchChange={(q: string) => setSearchQuery(q)}
              />
            </div>

            {/* Background Tech Grid & Glowing Orbs */}
            <div className="absolute inset-0 bg-tech-grid opacity-20 light:opacity-30 pointer-events-none" />
            <div className="absolute top-32 left-1/3 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

            {/* Toast Notification */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-zinc-900/95 light:bg-white/95 border border-white/20 shadow-2xl backdrop-blur-md text-white light:text-slate-900 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"></div>
                <p className="text-sm font-medium">{toastMessage}</p>
                <button
                  onClick={() => setToastMessage(null)}
                  className="ml-2 text-gray-400 hover:text-white light:hover:text-slate-900 p-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <main
              className={`p-4 sm:p-6 w-full h-[calc(100vh-80px)] ${
                isChatPage ? "overflow-hidden" : "overflow-y-auto"
              }`}
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
