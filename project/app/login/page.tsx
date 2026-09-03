"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sun,
  Moon,
  LockKeyhole,
  Zap,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    // Default to light mode as primary theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    } else {
      setTheme("light");
      document.documentElement.classList.add("light");
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (!email || !password) {
      setStatus({
        type: "error",
        message: "Please fill in both email and password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      setIsLoading(false);

      if (result.success) {
        setStatus({
          type: "success",
          message: result.message,
        });

        // Optional: Save user info in localStorage or context if needed, for example:
        if (result.user) {
          localStorage.setItem("userLevel", result.user.role);
          localStorage.setItem("userEmail", result.user.username);
          if (result.user.name) localStorage.setItem("userName", result.user.name);
        }

        router.push("/dashboard");
      } else {
        setStatus({
          type: "error",
          message: result.message || "Invalid credentials.",
        });
      }
    } catch (error) {
      setIsLoading(false);
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-slate-50 light:bg-slate-50 [html:not(.light)_&]:bg-[#090d16] text-slate-900 light:text-slate-900 [html:not(.light)_&]:text-white transition-colors duration-300">
      {/* ========================================================
          LEFT COLUMN: Hero & Branding Panel (7 Cols on Desktop)
          ======================================================== */}
      <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-between p-12 xl:p-16 relative overflow-hidden bg-gradient-to-br from-[#00284d] via-[#004b87] to-[#090d16] text-white shadow-2xl">
        {/* Subtle Tech Grid overlay & Glowing Orbs */}
        <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,163,224,0.25)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(0,163,224,0.15)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative overflow-hidden rounded-xl border border-white/20 p-1.5 bg-white/10 backdrop-blur-md shadow-lg">
            <Image
              src="/assets/images/logo.jpeg"
              width={44}
              height={44}
              alt="Survey Teknologi Indonesia Logo"
              className="rounded-lg object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-white uppercase leading-tight">
              SURVEY TEKNOLOGI INDONESIA
            </span>
            <span className="text-[11px] font-semibold text-brand-cyan tracking-widest uppercase leading-none mt-0.5">
              ENTERPRISE PAYMENT PORTAL
            </span>
          </div>
        </div>

        {/* Center Hero Message */}
        <div className="relative z-10 max-w-2xl my-auto py-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-brand-cyan uppercase bg-brand-cyan/15 border border-brand-cyan/30 px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
            <Sparkles
              className="w-3.5 h-3.5 animate-spin"
              style={{ animationDuration: "4s" }}
            />
            <span>INTEGRATED DIGITAL ECOSYSTEM</span>
          </span>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Next-Generation Payment &amp; Geospatial Intelligence.
          </h1>

          <p className="mt-5 text-base xl:text-lg text-blue-100/85 font-light leading-relaxed max-w-xl">
            Access real-time analytics, automated billing workflows, and secure
            digital transaction processing tailored for enterprise survey
            operations across Indonesia.
          </p>

          {/* Feature Highlight Pills */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md hover:bg-white/[0.1] transition-all">
              <LockKeyhole className="w-6 h-6 text-brand-cyan mb-2" />
              <h3 className="text-sm font-bold text-white">
                Bank-Grade Security
              </h3>
              <p className="text-xs text-blue-100/70 mt-1">
                256-bit SSL encryption &amp; enterprise SSO
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md hover:bg-white/[0.1] transition-all">
              <Zap className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="text-sm font-bold text-white">Real-Time Sync</h3>
              <p className="text-xs text-blue-100/70 mt-1">
                Instant surveyor &amp; billing data relay
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md hover:bg-white/[0.1] transition-all">
              <BarChart3 className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="text-sm font-bold text-white">
                Unified Analytics
              </h3>
              <p className="text-xs text-blue-100/70 mt-1">
                Automated invoice tracking &amp; reporting
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/60 font-medium border-t border-white/10 pt-6">
          <span>
            &copy; 2026 Survey Teknologi Indonesia. All rights reserved.
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Status: Operational
          </span>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN: Login Form Area (5 Cols on Desktop)
          ======================================================== */}
      <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative bg-slate-50 light:bg-slate-50 [html:not(.light)_&]:bg-[#090d16] transition-colors duration-300 min-h-screen">
        {/* Subtle Background Glow for Right Column */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(0,163,224,0.08)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />

        {/* Top Right Controls: Theme Toggle */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-full border border-slate-200 light:border-slate-200 [html:not(.light)_&]:border-white/10 bg-white light:bg-white [html:not(.light)_&]:bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-600 light:text-slate-600 [html:not(.light)_&]:text-gray-300 hover:text-slate-900 light:hover:text-slate-900 [html:not(.light)_&]:hover:text-white shadow-sm hover:shadow transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-brand-cyan" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-brand-blue" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto space-y-8 my-auto">
          {/* Mobile-Only Header Brand Logo (< lg screens) */}
          <div className="flex lg:hidden items-center gap-3 pb-2 border-b border-slate-200 light:border-slate-200 [html:not(.light)_&]:border-white/10">
            <Image
              src="/assets/image/logo.jpeg"
              width={38}
              height={38}
              alt="Logo"
              className="rounded-lg object-cover"
              unoptimized
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-slate-900 light:text-slate-900 [html:not(.light)_&]:text-white uppercase leading-none">
                SURVEY TEKNOLOGI
              </span>
              <span className="text-[10px] font-semibold text-brand-cyan tracking-widest uppercase mt-0.5">
                INDONESIA
              </span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-cyan/10 text-brand-cyan text-xs font-bold tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Authentication</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 light:text-slate-900 [html:not(.light)_&]:text-white">
              Sign In to Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 light:text-slate-600 [html:not(.light)_&]:text-gray-400 mt-1.5">
              Enter your corporate credentials to access your workspace.
            </p>
          </div>

          {/* Status Message Notification */}
          {status.type && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-medium shadow-sm animate-fadeIn ${
                status.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 light:text-emerald-700 [html:not(.light)_&]:text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-700 light:text-rose-700 [html:not(.light)_&]:text-rose-400"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 light:text-slate-700 [html:not(.light)_&]:text-gray-300"
              >
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 light:text-slate-400 [html:not(.light)_&]:text-gray-400">
                  <Mail className="h-4 w-4 text-brand-cyan" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@surveyteknologi.id"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white light:bg-white [html:not(.light)_&]:bg-white/5 border border-slate-200 light:border-slate-200 [html:not(.light)_&]:border-white/10 text-slate-900 light:text-slate-900 [html:not(.light)_&]:text-white placeholder-slate-400 light:placeholder-slate-400 [html:not(.light)_&]:placeholder-gray-500 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all duration-200 text-sm font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 light:text-slate-700 [html:not(.light)_&]:text-gray-300"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setStatus({
                      type: "error",
                      message:
                        "Password reset instructions sent to your corporate email.",
                    });
                  }}
                  className="text-xs font-bold text-brand-cyan hover:text-brand-cyan/80 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 light:text-slate-400 [html:not(.light)_&]:text-gray-400">
                  <Lock className="h-4 w-4 text-brand-blue" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-white light:bg-white [html:not(.light)_&]:bg-white/5 border border-slate-200 light:border-slate-200 [html:not(.light)_&]:border-white/10 text-slate-900 light:text-slate-900 [html:not(.light)_&]:text-white placeholder-slate-400 light:placeholder-slate-400 [html:not(.light)_&]:placeholder-gray-500 focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all duration-200 text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 light:text-slate-400 [html:not(.light)_&]:text-gray-400 hover:text-slate-700 light:hover:text-slate-700 [html:not(.light)_&]:hover:text-white focus:outline-none cursor-pointer transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 light:border-slate-300 [html:not(.light)_&]:border-white/20 bg-white light:bg-white [html:not(.light)_&]:bg-white/5 text-brand-cyan focus:ring-brand-cyan focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-600 light:text-slate-600 [html:not(.light)_&]:text-gray-400 group-hover:text-slate-900 light:group-hover:text-slate-900 [html:not(.light)_&]:group-hover:text-white transition-colors">
                  Keep me signed in on this device
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue py-3.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:from-brand-cyan/90 hover:to-brand-blue/90 shadow-[0_4px_15px_rgba(0,163,224,0.25)] hover:shadow-[0_6px_20px_rgba(0,163,224,0.35)] transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          {/* Footer Note */}
          <div className="pt-4 text-center border-t border-slate-200/80 light:border-slate-200/80 [html:not(.light)_&]:border-white/5">
            <p className="text-xs text-slate-600 light:text-slate-600 [html:not(.light)_&]:text-gray-400 font-medium">
              Don&apos;t have a portal account?{" "}
              <Link
                href="/request"
                className="text-brand-cyan hover:text-brand-cyan/80 font-bold underline transition-colors"
              >
                Request Access from IT Support
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile Footer (< lg) */}
        <div className="lg:hidden mt-8 text-center text-[11px] text-slate-400">
          &copy; 2026 Survey Teknologi Indonesia. All rights reserved.
        </div>
      </div>
    </div>
  );
}
