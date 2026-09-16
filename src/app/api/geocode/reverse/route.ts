import { NextResponse, type NextRequest } from "next/server";
import { verifySessionFromRequest } from "@/lib/auth/session";
import { mapNominatimItem } from "@/lib/geocoding/nominatim";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const CONTACT =
  process.env.CONTACT_TO_EMAIL ??
  process.env.ADMIN_EMAIL ??
  "loupitakass@gmail.com";

export async function GET(request: NextRequest) {
  const session = await verifySessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Coordinate non valide." }, { status: 400 });
  }

  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");
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
      { error: "Reverse geocoding non disponibile." },
      { status: 502 },
    );
  }

  const data = await response.json();
  if (!data?.lat || !data?.lon) {
    return NextResponse.json({ error: "Nessun risultato." }, { status: 404 });
  }

  return NextResponse.json({ result: mapNominatimItem(data) });
}
