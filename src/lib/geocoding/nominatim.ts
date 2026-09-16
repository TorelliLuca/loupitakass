export type GeocodeResult = {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  label: string;
};

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  square?: string;
  amenity?: string;
  tourism?: string;
  building?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
};

type NominatimItem = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

function buildStreetLine(address?: NominatimAddress) {
  if (!address) return "";
  const place =
    address.amenity ||
    address.tourism ||
    address.building ||
    address.square ||
    "";
  const road = address.road || address.pedestrian || "";
  const number = address.house_number || "";
  const street = [road, number].filter(Boolean).join(" ").trim();
  if (place && street) return `${place}, ${street}`;
  return place || street || address.neighbourhood || address.suburb || "";
}

function buildCity(address?: NominatimAddress) {
  if (!address) return "";
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    ""
  );
}

export function mapNominatimItem(item: NominatimItem): GeocodeResult {
  const address = buildStreetLine(item.address);
  const city = buildCity(item.address);
  const country = item.address?.country ?? "";
  return {
    lat: Number(item.lat),
    lng: Number(item.lon),
    address: address || item.display_name.split(",")[0]?.trim() || "",
    city,
    country,
    label: item.display_name,
  };
}
