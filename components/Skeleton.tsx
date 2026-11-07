export function Sk({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function StatsSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="status" aria-label="جارٍ التحميل">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card space-y-2 text-center"><Sk className="mx-auto h-8 w-16" /><Sk className="mx-auto h-3 w-24" /></div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="جارٍ التحميل">
      <div className="flex items-center gap-3"><Sk className="h-6 w-40" /><Sk className="mr-auto h-11 w-24" /></div>
      <Sk className="h-2.5 w-full !rounded-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 !p-3">
          <Sk className="h-11 w-11 shrink-0" />
          <div className="flex-1 space-y-2"><Sk className="h-4 w-2/3" /><Sk className="h-3 w-1/3" /></div>
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ cells = 7 }: { cells?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7" role="status" aria-label="جارٍ التحميل">
      {Array.from({ length: cells }).map((_, i) => <Sk key={i} className="h-28" />)}
    </div>
  );
}

export function PageSkeleton() {
  return <div className="space-y-5"><Sk className="h-8 w-56" /><StatsSkeleton /><ListSkeleton /></div>;
}
