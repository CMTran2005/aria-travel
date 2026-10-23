import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARIA — Adaptive Route Intelligence Assistant",
  description: "Smart travel route optimization and real-time re-planning assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
