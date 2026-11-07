import type { TrackingDetailResult, TrackingHistoryItem, TrackingDetailSummary } from "@/types/tracking";

const BINDERBYTE_COURIER_MAP: Record<string, string> = {
  pos: "pos",
  jnt: "jnt",
  sicepat: "sicepat",
  spx: "spx",
  jne: "jne",
  anteraja: "anteraja",
  tiki: "tiki",
  wahana: "wahana",
  lion: "lion",
  ninja: "ninja",
  idexpress: "ide",
};

export async function fetchBinderByteTracking(
  apiKey: string,
  courier: string,
  awb: string
): Promise<TrackingDetailResult> {
  const bbCourier = BINDERBYTE_COURIER_MAP[courier] ?? courier;
  const url = `https://api.binderbyte.com/v1/track?api_key=${encodeURIComponent(
    apiKey
  )}&courier=${encodeURIComponent(bbCourier)}&awb=${encodeURIComponent(awb)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    interface BinderByteResponse {
      readonly status: number;
      readonly message: string;
      readonly data?: {
        readonly summary?: {
          readonly awb?: string;
          readonly courier?: string;
          readonly service?: string;
          readonly status?: string;
          readonly date?: string;
          readonly weight?: string;
        };
        readonly detail?: {
          readonly origin?: string;
          readonly destination?: string;
          readonly shipper?: string;
          readonly receiver?: string;
        };
        readonly history?: readonly {
          readonly date?: string;
          readonly desc?: string;
          readonly location?: string;
        }[];
      };
    }

    const json = (await res.json()) as BinderByteResponse;

    if (json.status !== 200 || !json.data) {
      return {
        success: false,
        message: json.message || "Data resi tidak ditemukan",
        summary: createEmptySummary(awb, courier),
        history: [],
      };
    }

    const data = json.data;
    const historyList: TrackingHistoryItem[] = (data.history ?? []).map((h) => ({
      date: h.date ?? "",
      desc: h.desc ?? "",
      location: h.location ?? "",
    }));

    return {
      success: true,
      summary: {
        awb: data.summary?.awb ?? awb,
        courier: data.summary?.courier ?? courier,
        service: data.summary?.service ?? "-",
        status: (data.summary?.status ?? "ON PROCESS").toUpperCase(),
        date: data.summary?.date ?? "-",
        weight: data.summary?.weight ?? "-",
        origin: data.detail?.origin ?? "-",
        destination: data.detail?.destination ?? "-",
        shipperName: data.detail?.shipper ?? "-",
        shipperPhone: "-",
        shipperAddress: data.detail?.origin ?? "-",
        receiverName: data.detail?.receiver ?? "-",
        receiverPhone: "-",
        receiverAddress: data.detail?.destination ?? "-",
      },
      history: historyList,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    return {
      success: false,
      message: `Gagal memuat API: ${errorMsg}`,
      summary: createEmptySummary(awb, courier),
      history: [],
    };
  }
}

export async function fetchPosIndonesiaDirect(awb: string): Promise<TrackingDetailResult> {
  const url = `https://kibananew.posindonesia.co.id:4433/x123449/xhdhhdencript12092003posaja.php?id=${encodeURIComponent(
    awb
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 300 },
  });

  const html = await res.text();

  if (!html.includes("tracking-item") && !html.includes("tracking-list")) {
    return {
      success: false,
      message: "Resi Pos Indonesia tidak ditemukan",
      summary: createEmptySummary(awb, "pos"),
      history: [],
    };
  }

  const shipperMatch = /<th[^>]*>Pengirim<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i.exec(html);
  const rawShipper = shipperMatch ? cleanHtml(shipperMatch[1]) : "";

  const receiverMatch = /<th[^>]*>Penerima<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i.exec(html);
  const rawReceiver = receiverMatch ? cleanHtml(receiverMatch[1]) : "";

  const coordMatch = /Koordinat Penerima[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i.exec(html);
  const rawCoord = coordMatch ? cleanHtml(coordMatch[1]) : "";

  const shipperParsed = parseEntityString(rawShipper);
  const receiverParsed = parseEntityString(rawReceiver);

  const history: TrackingHistoryItem[] = [];
  const itemRegex = /<div class="tracking-date">([\s\S]*?)<\/div>[\s\S]*?<div class="tracking-content">([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = itemRegex.exec(html)) !== null) {
    history.push({
      date: match[1].trim(),
      desc: match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      location: "",
    });
  }

  const photoRegex = /href="(https:\/\/apistorage\.mile\.app\/[^"]+)"/gi;
  const podPhotos: string[] = [];
  let photoMatch: RegExpExecArray | null = null;
  while ((photoMatch = photoRegex.exec(html)) !== null) {
    if (!podPhotos.includes(photoMatch[1])) {
      podPhotos.push(photoMatch[1]);
    }
  }

  const isDelivered = html.includes("DELIVERED") || html.includes("telah diterima");

  return {
    success: true,
    summary: {
      awb,
      courier: "Pos Indonesia",
      service: "Pos Reguler / PosAja",
      status: isDelivered ? "DELIVERED" : "ON PROCESS",
      date: history[0]?.date ?? "-",
      weight: "-",
      origin: shipperParsed.address || "KCU BATAM",
      destination: receiverParsed.address || "KCP MORO",
      shipperName: shipperParsed.name || "THE HARVEST",
      shipperPhone: shipperParsed.phone || "-",
      shipperAddress: shipperParsed.address || "SAP BATAM",
      receiverName: receiverParsed.name || "Pihak Penerima",
      receiverPhone: receiverParsed.phone || "-",
      receiverAddress: receiverParsed.address || "-",
      coordinates: rawCoord || undefined,
    },
    history: [...history].reverse(),
    podPhotos,
  };
}

function cleanHtml(raw: string): string {
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseEntityString(raw: string): { name: string; phone: string; address: string } {
  const phoneIdx = raw.indexOf("Phone Number :");
  const alamatIdx = raw.indexOf("Alamat :");

  if (phoneIdx === -1 && alamatIdx === -1) {
    return { name: raw || "-", phone: "-", address: "-" };
  }

  let name = "";
  let phone = "-";
  let address = "-";

  if (phoneIdx !== -1) {
    name = raw.slice(0, phoneIdx).replace(/,$/, "").trim();
    if (alamatIdx !== -1) {
      phone = raw.slice(phoneIdx + 14, alamatIdx).replace(/,$/, "").trim();
      address = raw.slice(alamatIdx + 8).trim();
    } else {
      phone = raw.slice(phoneIdx + 14).trim();
    }
  } else if (alamatIdx !== -1) {
    name = raw.slice(0, alamatIdx).replace(/,$/, "").trim();
    address = raw.slice(alamatIdx + 8).trim();
  }

  return { name: name || "-", phone: phone || "-", address: address || "-" };
}

export function createEmptySummary(awb: string, courier: string): TrackingDetailSummary {
  return {
    awb,
    courier,
    service: "-",
    status: "UNKNOWN",
    date: "-",
    weight: "-",
    origin: "-",
    destination: "-",
    shipperName: "-",
    shipperPhone: "-",
    shipperAddress: "-",
    receiverName: "-",
    receiverPhone: "-",
    receiverAddress: "-",
  };
}
