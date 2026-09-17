"use client";

import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteLogo } from "@/components/brand/site-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "#home", key: "home" },
  { href: "#date", key: "dates" },
  { href: "#ascoltaci", key: "listen" },
  { href: "#seguici", key: "follow" },
  { href: "#bio", key: "bio" },
  { href: "#membri", key: "members" },
  { href: "#contatti", key: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("Nav");
  const menuId = useId();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const barTone = solid
    ? "border-brand-ink/10 bg-white/95 text-brand-ink backdrop-blur-md"
    : "border-transparent bg-brand-ink/80 text-white backdrop-blur-md";

  const linkTone = solid
    ? "text-brand-ink/70 hover:bg-brand-ink/5 hover:text-brand-ink"
    : "text-white/80 hover:bg-white/10 hover:text-white";

  const iconButtonTone = solid
    ? "text-brand-ink hover:bg-brand-ink/5"
    : "text-white hover:bg-white/10";

  const localeTone = open || !solid ? "onDark" : "ink";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        open ? "border-transparent bg-brand-ink text-white" : barTone,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <a
          href="#home"
          className="shrink-0"
          aria-label={site.name}
          onClick={() => setOpen(false)}
        >
          <SiteLogo
            width={132}
            variant={open || !solid ? "transparent" : "solid"}
            className="h-9 w-auto sm:h-10"
          />
        </a>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.8rem] font-semibold tracking-wide whitespace-nowrap transition-colors",
                linkTone,
              )}
            >
              {t(item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LocaleSwitcher tone={localeTone} />

          <button
            type="button"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full transition-colors lg:hidden",
              open ? "text-white hover:bg-white/10" : iconButtonTone,
            )}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? t("close") : t("menu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-5" strokeWidth={2} aria-hidden />
            ) : (
              <Menu className="size-5" strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        className={cn(
          "fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col bg-brand-ink text-white transition-[opacity,visibility] duration-300 sm:top-16 lg:hidden",
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
          <nav
            className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto py-4"
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-display text-[clamp(2rem,9vw,3.25rem)] leading-[0.95] font-medium tracking-tight text-white/90 transition-colors hover:text-brand-brass focus-visible:outline-none focus-visible:text-brand-brass"
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
