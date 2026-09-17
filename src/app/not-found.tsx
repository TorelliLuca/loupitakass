import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { NotFoundView } from "@/components/sections/not-found-view";
import { displayFont, sourceSans } from "@/lib/fonts-public";
import "./globals.css";

/**
 * Fallback globale (locale invalido / path fuori dal segmento `[locale]`).
 * Deve fornire html/body perché il layout root è pass-through.
 */
export default async function GlobalNotFound() {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${sourceSans.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <NotFoundView />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
