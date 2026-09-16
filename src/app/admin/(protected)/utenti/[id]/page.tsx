import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteAdminButton } from "@/components/admin/delete-admin-button";
import { EditAdminForm } from "@/components/admin/edit-admin-form";
import { getSession } from "@/lib/auth/session";
import { getAdminUserById, getAdminUsers } from "@/lib/queries/admin";

const panelRadius = { borderRadius: "1.25rem" } as const;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditUserPage({ params }: PageProps) {
  const { id } = await params;
  const [session, user, allUsers] = await Promise.all([
    getSession(),
    getAdminUserById(id),
    getAdminUsers(),
  ]);

  if (!session) return null;
  if (!user) notFound();

  const isCurrent = session.userId === user.id;
  const onlyOne = allUsers.length <= 1;
  const deleteReason = isCurrent
    ? "Non puoi eliminare il tuo account"
    : onlyOne
      ? "Serve almeno un admin"
      : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link
              href="/admin/utenti/gestisci"
              className="underline underline-offset-4"
            >
              ← Gestisci admin
            </Link>
          </p>
          <h1 className="mt-2 font-display text-3xl text-brand-ink">
            Modifica admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <DeleteAdminButton
          userId={user.id}
          email={user.email}
          disabledReason={deleteReason}
        />
      </div>

      <div
        className="max-w-2xl bg-card p-5 text-card-foreground shadow-sm ring-1 ring-foreground/10 sm:p-8"
        style={panelRadius}
      >
        <EditAdminForm userId={user.id} email={user.email} />
      </div>
    </div>
  );
}
