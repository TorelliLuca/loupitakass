import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div
        className="w-full max-w-md bg-card p-8 shadow-lg ring-1 ring-foreground/10"
        style={{ borderRadius: "1.25rem" }}
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" style={{ borderRadius: "0.5rem" }} />
          <Skeleton className="h-4 w-36" style={{ borderRadius: "0.5rem" }} />
        </div>
        <Separator className="my-6" />
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" style={{ borderRadius: "0.5rem" }} />
            <Skeleton className="h-10 w-full" style={{ borderRadius: "0.5rem" }} />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" style={{ borderRadius: "0.5rem" }} />
            <Skeleton className="h-10 w-full" style={{ borderRadius: "0.5rem" }} />
          </div>
          <Skeleton className="h-10 w-full" style={{ borderRadius: "0.5rem" }} />
        </div>
      </div>
    </div>
  );
}
