"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowUpRight, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Detect theme on mount
    const savedTheme = localStorage.getItem("theme");
    const isLight = savedTheme === "light" || document.documentElement.classList.contains("light");
    if (isLight) {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
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

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Invoices", href: "/invoiceGenerator" },
    { name: "Our Fleet", href: "/our-fleet" },
    { name: "About Us", href: "/#about" },
    { name: "Contact", href: "/contact" },
    { name: "Login", href: "/login" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 light:border-slate-200  bg-white backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Brand Logo (Left) */}
          <div className="flex flex-shrink-0 items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative overflow-hidden rounded-lg border border-white/10 light:border-slate-200 p-1 bg-white/5 light:bg-white transition-colors group-hover:border-brand-cyan/30 flex items-center justify-center">
                <Image
                  src="/assets/images/logo.jpeg"
                  width={50}
                  height={50}
                  alt="Survey Teknologi Indonesia Logo"
                  className="rounded object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wider text-white light:text-slate-900 uppercase sm:text-base leading-none">
                  SURVEY TEKNOLOGI
                </span>
                <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase leading-none mt-0.5">
                  INDONESIA
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Center) */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative py-2 text-sm font-medium text-gray-300 light:text-slate-600 hover:text-white light:hover:text-slate-950 transition-colors duration-200 group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop Controls: Theme + CTA (Right) */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-white/5 light:border-slate-200/80 bg-white/5 light:bg-slate-100 p-2 text-gray-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-white" />
              ) : (
                <Moon className="h-4 w-4 text-brand-blue" />
              )}
            </button>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Contact
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Actions (Menu + Theme toggle) */}
          <div className="flex items-center space-x-2 md:hidden">
            
      


            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6 transition-transform duration-300 rotate-90" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6 transition-transform duration-300" aria-hidden="true" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`md:hidden absolute left-0 w-full bg-dark-bg/95 light:bg-slate-50/95 border-b border-white/5 light:border-slate-200 backdrop-blur-lg transition-all duration-300 ease-in-out ${
          isOpen ? "top-full opacity-100 visible py-6" : "top-[-200px] opacity-0 invisible"
        }`}
        id="mobile-menu"
      >
        <div className="space-y-4 px-4 sm:px-6">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-300 light:text-slate-700 hover:bg-white/5 light:hover:bg-slate-100 hover:text-white light:hover:text-slate-950 transition-all duration-200"
            >
              {item.name}
            </a>
          ))}
          <div className="pt-4 border-t border-white/5 light:border-slate-200">
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold uppercase tracking-wider text-black hover:bg-white/90 transition-all duration-200"
            >
              Get in Touch
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
