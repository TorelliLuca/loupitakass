"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { SiteLogo } from "@/components/brand/site-logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function StoryHeader() {
  const t = useTranslations("Story");
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        solid
          ? "border-brand-ink/10 bg-white/95 text-brand-ink backdrop-blur-md"
          : "border-transparent bg-brand-ink/80 text-white backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link href="/" aria-label={site.name} className="shrink-0">
          <SiteLogo
            width={132}
            variant={solid ? "solid" : "transparent"}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={cn(
              "hidden text-sm underline-offset-4 transition-colors hover:underline sm:inline",
              solid
                ? "text-brand-ink/65 hover:text-brand-ink"
                : "text-white/75 hover:text-white",
            )}
          >
            {t("backHome")}
          </Link>
          <LocaleSwitcher tone={solid ? "ink" : "onDark"} />
        </div>
      </div>
    </header>
  );
}
