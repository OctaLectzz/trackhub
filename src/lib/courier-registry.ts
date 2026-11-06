import type { CourierConfig, CourierId } from "@/types/tracking";

export const COURIER_REGISTRY: readonly CourierConfig[] = [
  {
    id: "spx",
    name: "Shopee Xpress",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    badgeText: "SPX",
    regexPatterns: [/^SPXID[A-Z0-9]+$/i, /^SPX[A-Z0-9]{10,}$/i],
    officialUrlGenerator: () => "https://spx.co.id/",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=SPX`,
  },
  {
    id: "pos",
    name: "Pos Indonesia",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    badgeText: "PosIND",
    regexPatterns: [/^P\d{11,13}$/i, /^\d{11}$/],
    officialUrlGenerator: (waybill: string) =>
      `https://kibananew.posindonesia.co.id:4433/x123449/xhdhhdencript12092003posaja.php?id=${encodeURIComponent(waybill)}`,
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=POS`,
  },
  {
    id: "jnt",
    name: "J&T Express",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    badgeText: "J&T",
    regexPatterns: [/^J[PX]\d{10,12}$/i, /^JX\d{10,}$/i, /^JB\d{10,}$/i],
    officialUrlGenerator: () => "https://www.jet.co.id/track",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=JET`,
  },
  {
    id: "sicepat",
    name: "SiCepat Ekspres",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    badgeText: "SiCepat",
    regexPatterns: [/^00\d{10}$/, /^00\d{11,12}$/],
    officialUrlGenerator: () => "https://www.sicepat.com/checkAwb",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=SICEPAT`,
  },
  {
    id: "anteraja",
    name: "Anteraja",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    badgeText: "Anteraja",
    regexPatterns: [/^1000\d{9,10}$/],
    officialUrlGenerator: () => "https://anteraja.id/tracking",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=ANTERAJA`,
  },
  {
    id: "lion",
    name: "Lion Parcel",
    badgeBg: "bg-red-50 text-red-800 border-red-300",
    badgeText: "Lion",
    regexPatterns: [/^LP\d{10,12}$/i, /^11\d{10}$/],
    officialUrlGenerator: () => "https://lionparcel.com/track",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=LION`,
  },
  {
    id: "ninja",
    name: "Ninja Xpress",
    badgeBg: "bg-stone-100 text-stone-800 border-stone-300",
    badgeText: "Ninja",
    regexPatterns: [/^NINJA[A-Z0-9]+$/i, /^SHP\d{9,}$/i],
    officialUrlGenerator: () => "https://www.ninjaxpress.id/id-id/tracking",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=NINJA`,
  },
  {
    id: "idexpress",
    name: "ID Express",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    badgeText: "ID Express",
    regexPatterns: [/^IDS\d{12}$/i, /^00\d{8}ID$/i],
    officialUrlGenerator: () => "https://idexpress.com/",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=IDE`,
  },
  {
    id: "wahana",
    name: "Wahana Express",
    badgeBg: "bg-yellow-50 text-yellow-800 border-yellow-200",
    badgeText: "Wahana",
    regexPatterns: [/^[A-Z0-9]{8}$/i],
    officialUrlGenerator: () => "https://www.wahana.com/",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=WAHANA`,
  },
  {
    id: "tiki",
    name: "TIKI",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    badgeText: "TIKI",
    regexPatterns: [/^66\d{10}$/, /^03\d{10}$/],
    officialUrlGenerator: () => "https://www.tiki.id/id/tracking",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=TIKI`,
  },
  {
    id: "jne",
    name: "JNE Express",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeText: "JNE",
    regexPatterns: [/^[A-Z0-9]{13,16}$/i, /^\d{12,16}$/],
    officialUrlGenerator: () => "https://www.jne.co.id/tracking",
    mirrorUrlGenerator: (waybill: string) =>
      `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}&e=JNE`,
  },
];

const UNKNOWN_COURIER_CONFIG: CourierConfig = {
  id: "unknown",
  name: "Other Courier",
  badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
  badgeText: "Unknown",
  regexPatterns: [],
  officialUrlGenerator: () => "https://cekresi.com/",
  mirrorUrlGenerator: (waybill: string) =>
    `https://cekresi.com/?noresi=${encodeURIComponent(waybill)}`,
};

export function detectCourier(waybill: string): CourierId {
  const sanitized = waybill.trim().toUpperCase();
  if (!sanitized) {
    return "unknown";
  }

  for (const courier of COURIER_REGISTRY) {
    for (const pattern of courier.regexPatterns) {
      if (pattern.test(sanitized)) {
        return courier.id;
      }
    }
  }

  return "unknown";
}

export function getCourierConfig(courierId: CourierId): CourierConfig {
  const found = COURIER_REGISTRY.find((c) => c.id === courierId);
  return found ?? UNKNOWN_COURIER_CONFIG;
}

export function generateTrackingUrls(
  waybill: string,
  courierId: CourierId
): { readonly officialUrl: string; readonly mirrorUrl: string } {
  const config = getCourierConfig(courierId);
  return {
    officialUrl: config.officialUrlGenerator(waybill),
    mirrorUrl: config.mirrorUrlGenerator(waybill),
  };
}

export function getAllCouriers(): readonly CourierConfig[] {
  return COURIER_REGISTRY;
}
