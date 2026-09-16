"use client";

import Link from "next/link";
import { logoutAction } from "@/app/admin/actions/auth";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import type { SessionPayload } from "@/lib/auth/session";
import { site } from "@/lib/site";

type AdminShellProps = {
  session: SessionPayload;
  children: React.ReactNode;
};

export function AdminShell({ session, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <FadeIn
          y={0}
          inView={false}
          className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4"
        >
          <div>
            <p className="font-display text-lg text-brand-ink">{site.name}</p>
            <p className="text-xs text-muted-foreground">Area admin</p>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/eventi"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Eventi
            </Link>
            <Link
              href="/admin/album"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Album
            </Link>
            <Link
              href="/admin/utenti/gestisci"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Gestisci admin
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {session.email}
            </span>
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                style={{ borderRadius: "0.5rem" }}
              >
                Esci
              </Button>
            </form>
          </nav>
        </FadeIn>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <FadeIn delay={0.05} inView={false}>
          {children}
        </FadeIn>
      </main>
    </div>
  );
}
