import Link from "next/link";
import { Suspense } from "react";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { AdminsTable } from "@/components/admin/admins-table";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getAdminUsers } from "@/lib/queries/admin";

export default async function AdminManageUsersPage() {
  const session = await getSession();
  if (!session) return null;

  const users = await getAdminUsers();

  return (
    <div className="space-y-8">
      <Suspense fallback={null}>
        <AdminFlashToast />
      </Suspense>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brand-ink sm:text-4xl">
            Gestisci admin
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Modifica email e password oppure rimuovi utenti autorizzati
            all’area admin.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/utenti" />}
          style={{ borderRadius: "0.5rem" }}
        >
          Crea admin
        </Button>
      </div>

      <AdminsTable users={users} currentUserId={session.userId} />
    </div>
  );
}
