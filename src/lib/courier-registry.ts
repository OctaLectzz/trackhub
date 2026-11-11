import type { CourierConfig, CourierId } from "@/types/tracking";

const mirror = (w: string, code: string): string =>
  `https://cekresi.com/?noresi=${encodeURIComponent(w)}&e=${encodeURIComponent(code)}`;

export const COURIER_REGISTRY: readonly CourierConfig[] = [
  {
    id: "spx",
    name: "Shopee Express",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    badgeText: "SPX",
    regexPatterns: [/^SPXID[A-Z0-9]+$/i, /^SPX[A-Z0-9]{10,}$/i, /^ID\d{10,}X$/i],
    officialUrlGenerator: () => "https://spx.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "SPX"),
  },
  {
    id: "pos",
    name: "POS Indonesia",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    badgeText: "PosIND",
    regexPatterns: [/^P\d{11,13}$/i, /^\d{11}$/],
    officialUrlGenerator: (w) =>
      `https://kibananew.posindonesia.co.id:4433/x123449/xhdhhdencript12092003posaja.php?id=${encodeURIComponent(w)}`,
    mirrorUrlGenerator: (w) => mirror(w, "POS"),
  },
  {
    id: "jnt",
    name: "J&T Express",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    badgeText: "J&T",
    regexPatterns: [/^J[PXB]\d{10,}$/i],
    officialUrlGenerator: () => "https://www.jet.co.id/track",
    mirrorUrlGenerator: (w) => mirror(w, "JET"),
  },
  {
    id: "jnt_cargo",
    name: "J&T Cargo",
    badgeBg: "bg-red-50 text-red-800 border-red-300",
    badgeText: "J&T Cargo",
    regexPatterns: [/^200\d{9,11}$/],
    officialUrlGenerator: () => "https://www.jtcargo.id/",
    mirrorUrlGenerator: (w) => mirror(w, "JTCARGO"),
  },
  {
    id: "sicepat",
    name: "SiCepat Express",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    badgeText: "SiCepat",
    regexPatterns: [/^00\d{10,12}$/],
    officialUrlGenerator: () => "https://www.sicepat.com/checkAwb",
    mirrorUrlGenerator: (w) => mirror(w, "SICEPAT"),
  },
  {
    id: "anteraja",
    name: "Anteraja",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    badgeText: "Anteraja",
    regexPatterns: [/^1000\d{9,10}$/, /^11000\d{8,10}$/],
    officialUrlGenerator: () => "https://anteraja.id/tracking",
    mirrorUrlGenerator: (w) => mirror(w, "ANTERAJA"),
  },
  {
    id: "lion",
    name: "Lion Parcel",
    badgeBg: "bg-red-50 text-red-800 border-red-300",
    badgeText: "Lion",
    regexPatterns: [/^11LP\d+$/i, /^LP\d{10,12}$/i, /^11\d{10}$/],
    officialUrlGenerator: () => "https://lionparcel.com/track",
    mirrorUrlGenerator: (w) => mirror(w, "LION"),
  },
  {
    id: "ninja",
    name: "Ninja Xpress",
    badgeBg: "bg-stone-100 text-stone-800 border-stone-300",
    badgeText: "Ninja",
    regexPatterns: [/^NINJA[A-Z0-9]+$/i, /^NVID[A-Z0-9]+$/i, /^NLID[A-Z0-9]+$/i, /^SHP\d{9,}$/i],
    officialUrlGenerator: () => "https://www.ninjaxpress.id/id-id/tracking",
    mirrorUrlGenerator: (w) => mirror(w, "NINJA"),
  },
  {
    id: "ide",
    name: "ID Express",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    badgeText: "ID Express",
    regexPatterns: [/^IDS\d{10,}$/i, /^00\d{8}ID$/i],
    officialUrlGenerator: () => "https://idexpress.com/",
    mirrorUrlGenerator: (w) => mirror(w, "IDE"),
  },
  {
    id: "lex",
    name: "Lazada Express (LEX)",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeText: "LEX",
    regexPatterns: [/^LXAD-[A-Z0-9]+$/i, /^LEX[A-Z0-9]+$/i],
    officialUrlGenerator: () => "https://tracker.lel.asia/",
    mirrorUrlGenerator: (w) => mirror(w, "LEX"),
  },
  {
    id: "kurir_tokopedia",
    name: "Tokopedia Courier",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeText: "Kurir TKP",
    regexPatterns: [/^TKP\d{2}-[A-Z0-9]+$/i],
    officialUrlGenerator: () => "https://www.tokopedia.com/",
    mirrorUrlGenerator: (w) => mirror(w, "TKP"),
  },
  {
    id: "sap",
    name: "SAP Express",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    badgeText: "SAP",
    regexPatterns: [/^MIS\d{12,}$/i, /^SAP[A-Z0-9]{8,}$/i],
    officialUrlGenerator: () => "https://www.sap-express.id/",
    mirrorUrlGenerator: (w) => mirror(w, "SAP"),
  },
  {
    id: "kgx",
    name: "KGXpress",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    badgeText: "KGX",
    regexPatterns: [/^KGX\d{9,}$/i],
    officialUrlGenerator: () => "https://kgx.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "KGX"),
  },
  {
    id: "indah_cargo",
    name: "Indah Cargo",
    badgeBg: "bg-orange-50 text-orange-800 border-orange-300",
    badgeText: "Indah",
    regexPatterns: [/^PNG\d+[A-Z]+\d+$/i],
    officialUrlGenerator: () => "https://indahonline.com/",
    mirrorUrlGenerator: (w) => mirror(w, "INDAH"),
  },
  {
    id: "dakota",
    name: "Dakota Cargo",
    badgeBg: "bg-blue-50 text-blue-800 border-blue-300",
    badgeText: "Dakota",
    regexPatterns: [/^\d{9}[A-Z]\d{8,}$/i],
    officialUrlGenerator: () => "https://www.dakotacargo.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "DAKOTA"),
  },
  {
    id: "pcp",
    name: "PCP Express",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
    badgeText: "PCP",
    regexPatterns: [/^\d{9}V$/i],
    officialUrlGenerator: () => "https://www.pcpexpress.com/",
    mirrorUrlGenerator: (w) => mirror(w, "PCP"),
  },
  {
    id: "rex",
    name: "Royal Express (REX)",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-300",
    badgeText: "REX",
    regexPatterns: [/^222\d{11}$/],
    officialUrlGenerator: () => "https://www.rex.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "REX"),
  },
  {
    id: "wahana",
    name: "Wahana Express",
    badgeBg: "bg-yellow-50 text-yellow-800 border-yellow-200",
    badgeText: "Wahana",
    regexPatterns: [/^[A-Z0-9]{8}$/i],
    officialUrlGenerator: () => "https://www.wahana.com/",
    mirrorUrlGenerator: (w) => mirror(w, "WAHANA"),
  },
  {
    id: "tiki",
    name: "TIKI",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    badgeText: "TIKI",
    regexPatterns: [/^66\d{10}$/, /^03\d{10}$/],
    officialUrlGenerator: () => "https://www.tiki.id/id/tracking",
    mirrorUrlGenerator: (w) => mirror(w, "TIKI"),
  },
  {
    id: "first",
    name: "First Logistics",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    badgeText: "First",
    regexPatterns: [/^FIRST[A-Z0-9]+$/i],
    officialUrlGenerator: () => "https://firstlogistics.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "FIRST"),
  },
  {
    id: "rpx",
    name: "RPX Holding",
    badgeBg: "bg-zinc-100 text-zinc-800 border-zinc-300",
    badgeText: "RPX",
    regexPatterns: [/^7999\d{8}$/],
    officialUrlGenerator: () => "https://www.rpx.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "RPX"),
  },
  {
    id: "jet",
    name: "JET Express",
    badgeBg: "bg-lime-50 text-lime-800 border-lime-200",
    badgeText: "JET",
    regexPatterns: [/^8246\d{8}$/],
    officialUrlGenerator: () => "https://www.jetexpress.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "JETEXPRESS"),
  },
  {
    id: "jxe",
    name: "JX Express",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badgeText: "JXE",
    regexPatterns: [/^JXE\d{9,}$/i],
    officialUrlGenerator: () => "https://www.j-express.id/",
    mirrorUrlGenerator: (w) => mirror(w, "JXE"),
  },
  {
    id: "ant_cargo",
    name: "Ant Cargo",
    badgeBg: "bg-stone-100 text-stone-700 border-stone-300",
    badgeText: "Ant Cargo",
    regexPatterns: [/^ANT[A-Z0-9]{6,}$/i],
    officialUrlGenerator: () => "https://antcargo.id/",
    mirrorUrlGenerator: (w) => mirror(w, "ANTCARGO"),
  },
  {
    id: "next_logistik",
    name: "Next Logistics",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeText: "NextLog",
    regexPatterns: [/^NEXT[A-Z0-9]{6,}$/i],
    officialUrlGenerator: () => "https://nextlogistik.com/",
    mirrorUrlGenerator: (w) => mirror(w, "NEXTLOGISTIK"),
  },
  {
    id: "gtl",
    name: "GTL",
    badgeBg: "bg-neutral-100 text-neutral-800 border-neutral-300",
    badgeText: "GTL",
    regexPatterns: [/^GTL[A-Z0-9]{6,}$/i],
    officialUrlGenerator: () => "https://www.gtl.co.id/",
    mirrorUrlGenerator: (w) => mirror(w, "GTL"),
  },
  {
    id: "laris_cargo",
    name: "Laris Cargo",
    badgeBg: "bg-amber-50 text-amber-900 border-amber-300",
    badgeText: "Laris",
    regexPatterns: [/^LARIS[A-Z0-9]{6,}$/i],
    officialUrlGenerator: () => "https://lariscargo.com/",
    mirrorUrlGenerator: (w) => mirror(w, "LARIS"),
  },
  {
    id: "jne",
    name: "JNE Express",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    badgeText: "JNE",
    regexPatterns: [/^[A-Z0-9]{13,16}$/i, /^\d{12,16}$/],
    officialUrlGenerator: () => "https://www.jne.co.id/tracking",
    mirrorUrlGenerator: (w) => mirror(w, "JNE"),
  },
];

const UNKNOWN_CONFIG: CourierConfig = {
  id: "unknown", name: "Other Courier", badgeBg: "bg-slate-100 text-slate-700 border-slate-300", badgeText: "Unknown",
  regexPatterns: [], officialUrlGenerator: () => "https://cekresi.com/", mirrorUrlGenerator: (w) => `https://cekresi.com/?noresi=${encodeURIComponent(w)}`,
};

export function detectCourier(waybill: string): CourierId {
  const sanitized = waybill.trim().toUpperCase();
  if (!sanitized) return "unknown";

  for (const c of COURIER_REGISTRY) {
    for (const pattern of c.regexPatterns) {
      if (pattern.test(sanitized)) return c.id;
    }
  }
  return "unknown";
}

export function getCourierConfig(courierId: CourierId): CourierConfig {
  const normalizedId: CourierId = courierId === "idexpress" ? "ide" : courierId;
  return COURIER_REGISTRY.find((c) => c.id === normalizedId) ?? UNKNOWN_CONFIG;
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
