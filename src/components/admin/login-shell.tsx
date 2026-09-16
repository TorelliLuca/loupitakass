"use client";

import { motion, useReducedMotion } from "motion/react";
import { LoginForm } from "@/components/admin/login-form";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function LoginShell() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.07_75_/_0.12),_transparent_55%)]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease }}
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="relative w-full max-w-md rounded-2xl bg-card p-8 text-card-foreground shadow-lg ring-1 ring-foreground/10"
        style={{ borderRadius: "1.25rem" }}
      >
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-medium text-brand-ink">
            {site.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Accedi all&apos;area admin
          </p>
        </div>
        <Separator className="my-6" />
        <LoginForm />
      </motion.div>
    </div>
  );
}
