import { Skeleton } from "@/components/ui/skeleton";

const radius = { borderRadius: "0.5rem" } as const;
const panelRadius = { borderRadius: "1rem" } as const;

function PageHeaderSkeleton({
  withAction = false,
}: {
  withAction?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" style={radius} />
        <Skeleton className="h-4 w-64" style={radius} />
      </div>
      {withAction ? <Skeleton className="h-9 w-32" style={radius} /> : null}
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Caricamento dashboard">
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-card p-5 shadow-sm ring-1 ring-foreground/10"
            style={panelRadius}
          >
            <Skeleton className="h-4 w-28" style={radius} />
            <Skeleton className="mt-2 h-4 w-48" style={radius} />
            <Skeleton className="mt-4 h-10 w-16" style={radius} />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-36" style={radius} />
    </div>
  );
}

export function AdminEventsListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Caricamento eventi">
      <PageHeaderSkeleton withAction />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-full max-w-sm" style={radius} />
        <div className="flex flex-wrap gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-8 w-24"
              style={{ borderRadius: "9999px" }}
            />
          ))}
        </div>
      </div>
      <div
        className="overflow-hidden border bg-background"
        style={panelRadius}
      >
        <div className="border-b bg-muted/40 px-4 py-3">
          <div className="flex gap-6">
            {[72, 120, 96, 64, 72, 88].map((w, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ ...radius, width: w }}
              />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 px-4 py-3"
            >
              <Skeleton className="h-4 w-20 shrink-0" style={radius} />
              <Skeleton className="h-4 w-40 shrink-0" style={radius} />
              <Skeleton className="h-4 w-32 shrink-0" style={radius} />
              <Skeleton
                className="h-5 w-24 shrink-0"
                style={{ borderRadius: "9999px" }}
              />
              <Skeleton className="h-4 w-10 shrink-0" style={radius} />
              <div className="ml-auto flex gap-2">
                <Skeleton className="h-8 w-20" style={radius} />
                <Skeleton className="h-8 w-8" style={radius} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminEventFormSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Caricamento form evento">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" style={radius} />
        <Skeleton className="h-9 w-52" style={radius} />
        <Skeleton className="h-4 w-36" style={radius} />
      </div>
      {[0, 1, 2].map((section) => (
        <div
          key={section}
          className="space-y-4 bg-card p-5 ring-1 ring-foreground/10"
          style={panelRadius}
        >
          <Skeleton className="h-4 w-28" style={radius} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" style={radius} />
              <Skeleton className="h-10 w-full" style={radius} />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" style={radius} />
              <Skeleton className="h-10 w-full" style={radius} />
            </div>
          </div>
          {section === 1 ? (
            <Skeleton className="h-48 w-full" style={radius} />
          ) : null}
        </div>
      ))}
      <Skeleton className="h-10 w-40" style={radius} />
    </div>
  );
}
