import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Esclude api, admin, asset statici e interni Next/Vercel
  matcher: ["/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)"],
};
