import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { AppSettingsProvider } from "@/context/AppSettingsContext";

export const metadata: Metadata = {
  title: "ARIA — Adaptive Route Intelligence Assistant",
  description: "Trợ lý tối ưu lộ trình và tái lập kế hoạch du lịch thông minh thích ứng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
        <AppSettingsProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppSettingsProvider>
      </body>
    </html>
  );
}

