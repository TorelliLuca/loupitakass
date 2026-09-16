import { headers } from "next/headers";
import type { NextRequest } from "next/server";

function parseForwardedIp(value: string | null) {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

/** IP client da `NextRequest` (proxy / middleware). */
export function getClientIpFromRequest(request: NextRequest) {
  return (
    parseForwardedIp(request.headers.get("x-forwarded-for")) ??
    parseForwardedIp(request.headers.get("x-real-ip")) ??
    "unknown"
  );
}

/** IP client da Server Actions / Server Components. */
export async function getClientIpFromHeaders() {
  const headerStore = await headers();
  return (
    parseForwardedIp(headerStore.get("x-forwarded-for")) ??
    parseForwardedIp(headerStore.get("x-real-ip")) ??
    "unknown"
  );
}
