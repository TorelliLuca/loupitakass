"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteAdminButton } from "@/components/admin/delete-admin-button";
import { Button } from "@/components/ui/button";
import type { AdminUserListItem } from "@/lib/queries/admin";
import { cn } from "@/lib/utils";

const radius = { borderRadius: "0.5rem" } as const;
const panelRadius = { borderRadius: "1rem" } as const;

type SortKey = "email" | "createdAt";
type SortDir = "asc" | "desc";

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function formatCreatedAt(value: Date | string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(toDate(value));
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, "it", { sensitivity: "base" });
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />;
  }
  return dir === "asc" ? (
    <ArrowUp className="size-3.5" aria-hidden />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden />
  );
}

type AdminsTableProps = {
  users: AdminUserListItem[];
  currentUserId: string;
};

export function AdminsTable({ users, currentUserId }: AdminsTableProps) {
  const onlyOne = users.length <= 1;
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...users].sort((a, b) => {
      if (sortKey === "email") {
        return compareText(a.email, b.email) * dir;
      }
      const byDate = toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime();
      if (byDate !== 0) return byDate * dir;
      return compareText(a.email, b.email) * dir;
    });
  }, [users, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  if (users.length === 0) {
    return (
      <div
        className="bg-card p-6 text-sm text-muted-foreground shadow-sm ring-1 ring-foreground/10"
        style={panelRadius}
      >
        Nessun utente admin.{" "}
        <Link href="/admin/utenti" className="underline underline-offset-4">
          Creane uno
        </Link>
        .
      </div>
    );
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "createdAt", label: "Creato" },
  ];

  return (
    <div
      className="overflow-hidden bg-card text-card-foreground shadow-sm ring-1 ring-foreground/10"
      style={panelRadius}
    >
      {/* Mobile cards */}
      <ul className="divide-y divide-foreground/8 md:hidden">
        {sorted.map((user) => {
          const isCurrent = user.id === currentUserId;
          const deleteReason = isCurrent
            ? "Non puoi eliminare il tuo account"
            : onlyOne
              ? "Serve almeno un admin"
              : undefined;

          return (
            <li key={user.id} className="space-y-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{user.email}</p>
                  {isCurrent ? (
                    <span className="inline-flex bg-brand-brass/20 px-2 py-0.5 text-[11px] font-semibold text-brand-ink">
                      Tu
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Creato il {formatCreatedAt(user.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  style={radius}
                  render={<Link href={`/admin/utenti/${user.id}`} />}
                >
                  <Pencil className="size-3.5" aria-hidden />
                  Modifica
                </Button>
                <DeleteAdminButton
                  userId={user.id}
                  email={user.email}
                  disabledReason={deleteReason}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-foreground/10 bg-muted/40 text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              {columns.map((col) => {
                const active = sortKey === col.key;
                return (
                  <th key={col.key} className="px-5 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 uppercase hover:text-foreground",
                        active && "text-foreground",
                      )}
                      aria-sort={
                        active
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      {col.label}
                      <SortIcon active={active} dir={sortDir} />
                    </button>
                  </th>
                );
              })}
              <th className="px-5 py-3 text-right font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/8">
            {sorted.map((user) => {
              const isCurrent = user.id === currentUserId;
              const deleteReason = isCurrent
                ? "Non puoi eliminare il tuo account"
                : onlyOne
                  ? "Serve almeno un admin"
                  : undefined;

              return (
                <tr key={user.id} className="align-middle">
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{user.email}</span>
                      {isCurrent ? (
                        <span className="inline-flex bg-brand-brass/20 px-2 py-0.5 text-[11px] font-semibold text-brand-ink">
                          Tu
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatCreatedAt(user.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        nativeButton={false}
                        variant="outline"
                        size="sm"
                        style={radius}
                        render={<Link href={`/admin/utenti/${user.id}`} />}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                        Modifica
                      </Button>
                      <DeleteAdminButton
                        userId={user.id}
                        email={user.email}
                        disabledReason={deleteReason}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
