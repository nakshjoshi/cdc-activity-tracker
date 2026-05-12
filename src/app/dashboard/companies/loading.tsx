export default function CompaniesLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="h-8 w-48 bg-zinc-700 rounded-md" />
          <div className="mt-2 h-4 w-32 bg-zinc-700 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-zinc-700 rounded-md" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 w-24 rounded-full bg-zinc-700" />
        ))}
      </div>

      <div className="h-[600px] w-full rounded-xl bg-zinc-700" />
    </div>
  );
}
