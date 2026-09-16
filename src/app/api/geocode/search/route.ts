import { NextResponse, type NextRequest } from "next/server";
import { verifySessionFromRequest } from "@/lib/auth/session";
import { mapNominatimItem } from "@/lib/geocoding/nominatim";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const CONTACT =
  process.env.CONTACT_TO_EMAIL ??
  process.env.ADMIN_EMAIL ??
  "loupitakass@gmail.com";

async function requireAdmin(request: NextRequest) {
  const session = await verifySessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", "it");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": `LouPitakassAdmin/1.0 (${CONTACT})`,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Geocoding non disponibile." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as Parameters<
    typeof mapNominatimItem
  >[0][];
  return NextResponse.json({
    results: data.map(mapNominatimItem),
  });
}
