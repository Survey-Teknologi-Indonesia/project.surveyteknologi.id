import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Project Tracking STI",
  description: "A project tracking solution for Survey Teknologi Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${plusJakartaSans.variable}`}>
      <body className="bg-[#090d16] light:bg-slate-50 font-sans antialiased text-gray-200 light:text-slate-900 transition-colors duration-300">
        <main>{children}</main>
      </body>
    </html>
  );
}
