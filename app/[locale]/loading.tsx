export default function Loading() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#fffaf4_0%,_#f6f7fb_100%)] px-4 pb-20 pt-28 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur-sm animate-pulse md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="h-5 w-28 rounded-full bg-slate-200" />
              <div className="h-11 w-72 max-w-full rounded-2xl bg-slate-200" />
              <div className="h-4 w-96 max-w-full rounded-full bg-slate-100" />
            </div>
            <div className="flex gap-3">
              <div className="h-11 w-28 rounded-full bg-slate-200" />
              <div className="h-11 w-11 rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                <div className="h-36 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-4 w-4/5 rounded-full bg-slate-200" />
                <div className="mt-2 h-3 w-2/3 rounded-full bg-slate-100" />
                <div className="mt-4 flex gap-2">
                  <div className="h-9 flex-1 rounded-full bg-slate-200" />
                  <div className="h-9 w-24 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[24px] border border-black/5 bg-white/75 p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.22)] animate-pulse">
              <div className="h-4 w-24 rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-1/2 rounded-2xl bg-slate-200" />
              <div className="mt-3 h-3 w-3/4 rounded-full bg-slate-100" />
              <div className="mt-5 h-28 rounded-2xl bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}