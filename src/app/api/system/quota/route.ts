import { NextResponse } from "next/server";
import type { SystemQuotaResult } from "@/types/tracking";
import { getBinderByteBaseUrl } from "@/app/api/track/track-helpers";

export const dynamic = "force-dynamic";

interface BinderByteQuotaResponse {
  readonly status?: number;
  readonly product?: string;
  readonly count?: string | number;
  readonly limit?: string | number;
  readonly price?: string | number;
  readonly balance?: string | number;
  readonly message?: string;
}

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.BINDERBYTE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    const emptyRes: SystemQuotaResult = {
      success: false,
      product: "cek-resi",
      count: 0,
      limit: 0,
      remaining: 0,
      price: "0",
      balance: "0.00",
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
  const endpointUrl = `${baseUrl}/v1/checkQuota?api_key=${encodeURIComponent(apiKey.trim())}`;

  try {
    const res = await fetch(endpointUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    const json = (await res.json()) as BinderByteQuotaResponse;

    if (json.status !== 200) {
      const failRes: SystemQuotaResult = {
        success: false,
        product: json.product ?? "cek-resi",
        count: 0,
        limit: 0,
        remaining: 0,
        price: "0",
        balance: "0.00",
        checkedAt: new Date().toISOString(),
        message: json.message ?? "Gagal mengambil data kuota BinderByte",
      };
      return NextResponse.json(failRes, {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      });
    }

    const count = Number(json.count ?? 0);
    const limit = Number(json.limit ?? 0);
    const remaining = limit > 0 ? Math.max(0, limit - count) : 0;

    const okRes: SystemQuotaResult = {
      success: true,
      product: json.product ?? "cek-resi",
      count,
      limit,
      remaining,
      price: String(json.price ?? "0"),
      balance: String(json.balance ?? "0.00"),
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json(okRes, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    const errRes: SystemQuotaResult = {
      success: false,
      product: "cek-resi",
      count: 0,
      limit: 0,
      remaining: 0,
      price: "0",
      balance: "0.00",
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
