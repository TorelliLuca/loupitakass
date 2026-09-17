"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type LocaleSwitcherTone = "ink" | "onDark";

const toneClasses: Record<
  LocaleSwitcherTone,
  {
    trigger: string;
    panel: string;
    item: string;
    itemActive: string;
  }
> = {
  ink: {
    trigger:
      "text-brand-ink/75 hover:bg-brand-ink/5 hover:text-brand-ink aria-expanded:bg-brand-ink/5",
    panel: "border-brand-ink/10 bg-white text-brand-ink shadow-lg",
    item: "text-brand-ink/70 hover:bg-brand-ink/5 hover:text-brand-ink",
    itemActive: "bg-brand-ink text-white hover:bg-brand-ink hover:text-white",
  },
  onDark: {
    trigger:
      "text-white/80 hover:bg-white/10 hover:text-white aria-expanded:bg-white/10",
    panel: "border-white/10 bg-brand-ink text-white shadow-lg",
    item: "text-white/70 hover:bg-white/10 hover:text-white",
    itemActive:
      "bg-brand-brass text-brand-ink hover:bg-brand-brass hover:text-brand-ink",
  },
};

function LocaleFlag({
  code,
  className,
}: {
  code: AppLocale;
  className?: string;
}) {
  const frame = cn(
    "h-3.5 w-[1.3125rem] shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.14)]",
    className,
  );

  // SVG usati come <img> non risolvono <image> nested → OC composto in loco
  if (code === "oc") {
    return (
      <span
        className={cn(
          "relative inline-block overflow-hidden bg-[#C8102E]",
          frame,
        )}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- croce brand statica */}
        <img
          src={site.images.flags.oc}
          alt=""
          width={14}
          height={14}
          decoding="async"
          className="absolute inset-[10%] size-[80%] object-contain"
        />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG bandiera statica locale
    <img
      src={site.images.flags[code]}
      alt=""
      width={21}
      height={14}
      decoding="async"
      className={cn("object-cover", frame)}
      aria-hidden
    />
  );
}

function LocaleOptionLabel({
  code,
  label,
}: {
  code: AppLocale;
  label: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LocaleFlag code={code} />
      <span>{label}</span>
    </span>
  );
}

export function LocaleSwitcher({
  className,
  tone = "ink",
  align = "end",
}: {
  className?: string;
  tone?: LocaleSwitcherTone;
  align?: "start" | "end";
}) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const styles = toneClasses[tone];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold tracking-wide uppercase transition-colors",
          styles.trigger,
        )}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="listbox"
        aria-label={t("label")}
        onClick={() => setOpen((value) => !value)}
      >
        <LocaleOptionLabel code={locale} label={t(locale)} />
        <ChevronDown
          className={cn(
            "size-3.5 opacity-70 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        id={menuId}
        role="listbox"
        aria-label={t("label")}
        aria-hidden={!open}
        hidden={!open}
        className={cn(
          "absolute top-[calc(100%+0.4rem)] z-50 min-w-32 overflow-hidden rounded-xl border py-1",
          align === "end" ? "right-0" : "left-0",
          styles.panel,
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        {routing.locales.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={active}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase transition-colors",
                active ? styles.itemActive : styles.item,
              )}
              onClick={() => {
                setOpen(false);
                if (!active) {
                  router.replace(pathname, { locale: code as AppLocale });
                }
              }}
            >
              <LocaleOptionLabel code={code} label={t(code)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
