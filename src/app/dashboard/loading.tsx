export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-zinc-700 rounded-md" />
        <div className="mt-2 h-4 w-96 bg-zinc-700 rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-zinc-700" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 rounded-xl bg-zinc-700" />
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-zinc-700" />
          <div className="h-48 rounded-xl bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}
