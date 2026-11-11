import { NextResponse } from "next/server";
import type { CourierLiveItem, SystemCouriersResult } from "@/types/tracking";
import { getBinderByteBaseUrl } from "@/app/api/track/track-helpers";

export const dynamic = "force-dynamic";

interface BinderByteCouriersResponse {
  readonly status?: number;
  readonly message?: string;
  readonly data?: readonly {
    readonly code?: string;
    readonly name?: string;
    readonly status?: string;
  }[];
}

function normalizeStatus(raw?: string): CourierLiveItem["status"] {
  const s = (raw ?? "").toLowerCase().trim();
  if (s === "online" || s === "offline" || s === "maintenance" || s === "error") {
    return s;
  }
  return "unknown";
}

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.BINDERBYTE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const emptyRes: SystemCouriersResult = {
      success: false,
      couriers: [],
      checkedAt: new Date().toISOString(),
      message: "BinderByte API key is not configured on the server",
    };
    return NextResponse.json(emptyRes, {
      status: 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  const baseUrl = getBinderByteBaseUrl();
  const endpointUrl = `${baseUrl}/v1/list_courier?api_key=${encodeURIComponent(apiKey.trim())}`;

  try {
    const res = await fetch(endpointUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    const json = (await res.json()) as BinderByteCouriersResponse;

    if (!Array.isArray(json.data)) {
      const failRes: SystemCouriersResult = {
        success: false,
        couriers: [],
        checkedAt: new Date().toISOString(),
        message: json.message ?? "Gagal mengambil daftar status kurir BinderByte",
      };
      return NextResponse.json(failRes, {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }

    const couriers: CourierLiveItem[] = json.data.map((item) => ({
      code: item.code ?? "",
      name: item.name ?? item.code ?? "",
      status: normalizeStatus(item.status),
    }));

    const okRes: SystemCouriersResult = {
      success: true,
      couriers,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json(okRes, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    const errRes: SystemCouriersResult = {
      success: false,
      couriers: [],
      checkedAt: new Date().toISOString(),
      message: errorMsg,
    };
    return NextResponse.json(errRes, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }
}
