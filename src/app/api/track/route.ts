import { NextRequest, NextResponse } from "next/server";
import type { CourierId, TrackingDetailResult, TrackingHistoryItem } from "@/types/tracking";

// Mapping internal courier IDs to BinderByte courier codes
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const courier = searchParams.get("courier") as CourierId | null;
  const awb = searchParams.get("awb")?.trim();

  if (!courier || !awb) {
    return NextResponse.json(
      {
        success: false,
        message: "Parameters `courier` and `awb` are required",
        summary: createEmptySummary(awb ?? "", courier ?? "unknown"),
        history: [],
      },
      { status: 400 }
    );
  }

  // Specialized route: Pos Indonesia direct POD photo & timeline scraper
  if (courier === "pos") {
    try {
      const posResult = await fetchPosIndonesiaDirect(awb);
      if (posResult.success) {
        return NextResponse.json(posResult, {
          headers: {
            "Cache-Control":
              posResult.summary.status === "DELIVERED"
                ? "public, s-maxage=86400, stale-while-revalidate=43200"
                : "public, s-maxage=900, stale-while-revalidate=300",
          },
        });
      }
    } catch (posErr) {
      console.warn("PosIND direct fetch error, falling back to BinderByte:", posErr);
    }
  }

  // Commercial couriers or fallback via BinderByte API
  const apiKey = process.env.BINDERBYTE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        message: "BinderByte API key is not configured on the server",
        summary: createEmptySummary(awb, courier),
        history: [],
      },
      { status: 503 }
    );
  }

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
      return NextResponse.json(
        {
          success: false,
          message: json.message || "Waybill not found or courier offline",
          summary: createEmptySummary(awb, courier),
          history: [],
        },
        { status: 200 }
      );
    }

    const data = json.data;
    const historyList: TrackingHistoryItem[] = (data.history ?? []).map((h) => ({
      date: h.date ?? "",
      desc: h.desc ?? "",
      location: h.location ?? "",
    }));

    const result: TrackingDetailResult = {
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
        shipper: data.detail?.shipper ?? "-",
        receiver: data.detail?.receiver ?? "-",
      },
      history: historyList,
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control":
          result.summary.status === "DELIVERED"
            ? "public, s-maxage=86400, stale-while-revalidate=43200"
            : "public, s-maxage=900, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown server error";
    return NextResponse.json(
      {
        success: false,
        message: `Failed to fetch tracking data: ${errorMsg}`,
        summary: createEmptySummary(awb, courier),
        history: [],
      },
      { status: 500 }
    );
  }
}

async function fetchPosIndonesiaDirect(awb: string): Promise<TrackingDetailResult> {
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
      message: "Resi Pos Indonesia tidak ditemukan di server Kibana",
      summary: createEmptySummary(awb, "pos"),
      history: [],
    };
  }

  // Regex parse tracking items: <div class="tracking-date">...</div> ... <div class="tracking-content">...</div>
  const history: TrackingHistoryItem[] = [];
  const itemRegex = /<div class="tracking-date">([\s\S]*?)<\/div>[\s\S]*?<div class="tracking-content">([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = itemRegex.exec(html)) !== null) {
    const rawDate = match[1].trim();
    const rawContent = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    history.push({
      date: rawDate,
      desc: rawContent,
      location: "",
    });
  }

  // Regex parse POD photos: href="(https://apistorage.mile.app/[^"]+)"
  const photoRegex = /href="(https:\/\/apistorage\.mile\.app\/[^"]+)"/gi;
  const podPhotos: string[] = [];
  let photoMatch: RegExpExecArray | null = null;
  while ((photoMatch = photoRegex.exec(html)) !== null) {
    if (!podPhotos.includes(photoMatch[1])) {
      podPhotos.push(photoMatch[1]);
    }
  }

  const isDelivered = html.includes("DELIVERED") || html.includes("telah diterima");
  const reversedHistory = [...history].reverse();

  return {
    success: true,
    summary: {
      awb,
      courier: "Pos Indonesia",
      service: "Pos Reguler / PosAja",
      status: isDelivered ? "DELIVERED" : "ON PROCESS",
      date: history[0]?.date ?? "-",
      weight: "-",
      origin: history[0]?.desc ?? "-",
      destination: history[history.length - 1]?.desc ?? "-",
      shipper: "Mitra PosIND",
      receiver: isDelivered ? "Pihak Penerima" : "-",
    },
    history: reversedHistory,
    podPhotos,
  };
}

function createEmptySummary(awb: string, courier: string) {
  return {
    awb,
    courier,
    service: "-",
    status: "UNKNOWN",
    date: "-",
    weight: "-",
    origin: "-",
    destination: "-",
    shipper: "-",
    receiver: "-",
  };
}
