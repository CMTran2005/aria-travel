export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        ARIA
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-xl">
        Adaptive Route Intelligence Assistant — Hệ thống gợi ý và tái lập lịch trình du lịch thông minh thích ứng theo thời gian thực.
      </p>
      <div className="mt-8 flex gap-4">
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          Sprint 1 Initialized
        </span>
      </div>
    </main>
  );
}
