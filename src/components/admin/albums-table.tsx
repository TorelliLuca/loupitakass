"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { DeleteAlbumButton } from "@/components/admin/delete-album-button";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ALBUM_RELEASE_TYPE_LABEL,
  getAlbumReleaseType,
} from "@/lib/admin/album-release-type";
import {
  ALBUM_STATUS_LABEL,
  getAlbumAdminStatus,
  type AlbumAdminStatus,
} from "@/lib/admin/album-status";
import type { Album } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type AlbumsTableProps = {
  albums: Album[];
};

type SortKey = "releaseDate" | "titleIt" | "sortOrder" | "status" | "cover";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | AlbumAdminStatus;

const radius = { borderRadius: "0.5rem" } as const;
const panelRadius = { borderRadius: "1rem" } as const;
const ease = [0.22, 1, 0.36, 1] as const;

const STATUS_CHIP_CLASS: Record<AlbumAdminStatus, string> = {
  published:
    "inline-flex bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700",
  unpublished:
    "inline-flex bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-800",
  draft:
    "inline-flex bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, "it", { sensitivity: "base" });
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean;
  dir: SortDir;
}) {
  if (!active) {
    return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />;
  }
  return dir === "asc" ? (
    <ArrowUp className="size-3.5" aria-hidden />
  ) : (
    <ArrowDown className="size-3.5" aria-hidden />
  );
}

export function AlbumsTable({ albums }: AlbumsTableProps) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("sortOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = albums.filter((album) => {
      const status = getAlbumAdminStatus(album);
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        album.titleIt,
        formatDate(album.releaseDate),
        ALBUM_STATUS_LABEL[status],
        ALBUM_RELEASE_TYPE_LABEL[getAlbumReleaseType(album)],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "releaseDate": {
          const byDate = a.releaseDate.localeCompare(b.releaseDate);
          if (byDate !== 0) return byDate * dir;
          return (a.sortOrder - b.sortOrder) * dir;
        }
        case "titleIt":
          return compareText(a.titleIt, b.titleIt) * dir;
        case "sortOrder": {
          const byOrder = a.sortOrder - b.sortOrder;
          if (byOrder !== 0) return byOrder * dir;
          return b.releaseDate.localeCompare(a.releaseDate) * dir;
        }
        case "status": {
          const order: AlbumAdminStatus[] = [
            "published",
            "unpublished",
            "draft",
          ];
          const sa = order.indexOf(getAlbumAdminStatus(a));
          const sb = order.indexOf(getAlbumAdminStatus(b));
          return (sa - sb) * dir;
        }
        case "cover": {
          const fa =
            (a.coverUrl ? 1 : 0) +
            (a.coverBackUrl ? 1 : 0) +
            (a.discUrl ? 1 : 0);
          const fb =
            (b.coverUrl ? 1 : 0) +
            (b.coverBackUrl ? 1 : 0) +
            (b.discUrl ? 1 : 0);
          return (fa - fb) * dir;
        }
        default:
          return 0;
      }
    });
  }, [albums, query, sortDir, sortKey, statusFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "releaseDate" ? "desc" : "asc");
  }

  if (albums.length === 0) {
    return (
      <FadeIn inView={false}>
        <div
          className="border bg-background p-8 text-center text-sm text-muted-foreground"
          style={panelRadius}
        >
          <p>Nessun album in database.</p>
          <Button
            nativeButton={false}
            render={<Link href="/admin/album/nuovo" />}
            className="mt-4"
            style={radius}
          >
            Crea il primo album
          </Button>
        </div>
      </FadeIn>
    );
  }

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Tutti" },
    { value: "published", label: "Pubblicati" },
    { value: "unpublished", label: "Non pubblicati" },
    { value: "draft", label: "Bozze" },
  ];

  const columns: { key: SortKey; label: string }[] = [
    { key: "releaseDate", label: "Uscita" },
    { key: "titleIt", label: "Titolo (IT)" },
    { key: "sortOrder", label: "Ordine" },
    { key: "status", label: "Stato" },
    { key: "cover", label: "Copertine" },
  ];

  return (
    <FadeIn inView={false} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca titolo, data…"
          className="max-w-sm bg-background"
          aria-label="Cerca album"
        />
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filtra per stato"
        >
          {statusFilters.map((item) => {
            const active = statusFilter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(item.value)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-brand-ink text-brand-mist"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
                style={{ borderRadius: "9999px" }}
                aria-pressed={active}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="overflow-x-auto border bg-background"
        style={panelRadius}
      >
        {filteredSorted.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Nessun album corrisponde ai filtri.
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                {columns.map((col) => {
                  const active = sortKey === col.key;
                  return (
                    <th key={col.key} className="px-4 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 hover:text-foreground",
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
                <th className="px-4 py-3 font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((album, index) => {
                const status = getAlbumAdminStatus(album);
                const releaseType = getAlbumReleaseType(album);
                return (
                  <motion.tr
                    key={album.id}
                    className="border-b last:border-b-0"
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index, 12) * 0.03,
                      ease,
                    }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(album.releaseDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{album.titleIt}</span>
                        <span
                          className="inline-flex bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          style={{ borderRadius: "9999px" }}
                        >
                          {ALBUM_RELEASE_TYPE_LABEL[releaseType]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {album.sortOrder}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={STATUS_CHIP_CLASS[status]}
                        style={{ borderRadius: "9999px" }}
                      >
                        {ALBUM_STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {album.coverUrl ? (
                          <a
                            href={album.coverUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-ink underline underline-offset-4"
                          >
                            {releaseType === "single" ? "Cover" : "Fronte"}
                          </a>
                        ) : null}
                        {album.coverBackUrl ? (
                          <a
                            href={album.coverBackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-ink underline underline-offset-4"
                          >
                            Retro
                          </a>
                        ) : null}
                        {album.discUrl ? (
                          <a
                            href={album.discUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-ink underline underline-offset-4"
                          >
                            Disco
                          </a>
                        ) : null}
                        {!album.coverUrl &&
                        !album.coverBackUrl &&
                        !album.discUrl
                          ? "—"
                          : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          nativeButton={false}
                          render={<Link href={`/admin/album/${album.id}`} />}
                          variant="outline"
                          size="sm"
                          style={radius}
                        >
                          Modifica
                        </Button>
                        <DeleteAlbumButton
                          albumId={album.id}
                          title={album.titleIt}
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </FadeIn>
  );
}
