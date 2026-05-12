export default function CompanyDetailLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-zinc-700 rounded-md" />
        <div className="h-3 w-3 bg-zinc-700 rounded-full" />
        <div className="h-4 w-32 bg-zinc-700 rounded-md" />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-zinc-700" />
          <div>
            <div className="h-6 w-48 bg-zinc-700 rounded-md" />
            <div className="mt-2 flex gap-2">
              <div className="h-5 w-20 rounded-full bg-zinc-700" />
              <div className="h-5 w-16 rounded-full bg-zinc-700" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-28 bg-zinc-700 rounded-md" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="h-64 rounded-xl bg-zinc-700" />
          <div className="h-48 rounded-xl bg-zinc-700" />
          <div className="h-48 rounded-xl bg-zinc-700" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-[600px] rounded-xl bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}
