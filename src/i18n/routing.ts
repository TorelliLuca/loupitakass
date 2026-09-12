import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "fr", "en", "oc"],
  defaultLocale: "it",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
