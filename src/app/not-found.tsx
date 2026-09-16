import { Bodoni_Moda, Source_Sans_3 } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { NotFoundView } from "@/components/sections/not-found-view";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

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
      className={`${sourceSans.variable} ${bodoni.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <NotFoundView />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
