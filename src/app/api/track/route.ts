import { NextRequest, NextResponse } from "next/server";
import type { CourierId } from "@/types/tracking";
import {
  fetchPosIndonesiaDirect,
  fetchBinderByteTracking,
  createEmptySummary,
} from "./track-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const courier = searchParams.get("courier") as CourierId | null;
  const awb = searchParams.get("awb")?.trim();
  const phoneNumber = searchParams.get("number")?.trim() || undefined;
  const transactionDate = searchParams.get("date")?.trim() || undefined;

  if (!courier || !awb) {
    return NextResponse.json(
      {
        success: false,
        message: "Parameters `courier` and `awb` are required",
        summary: createEmptySummary(awb ?? "", courier ?? "unknown"),
        history: [],
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  // Pos Indonesia direct scraping (POD photo, GPS coordinates, recipient verification)
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

  // Commercial couriers via BinderByte logistics gateway
  const apiKey = process.env.BINDERBYTE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return NextResponse.json(
      {
        success: false,
        message: "BinderByte API key is not configured on the server",
        summary: createEmptySummary(awb, courier),
        history: [],
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  const bbResult = await fetchBinderByteTracking(
    apiKey,
    courier,
    awb,
    phoneNumber,
    transactionDate
  );

  // Error responses should never be cached by CDN edges
  if (!bbResult.success) {
    return NextResponse.json(bbResult, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  return NextResponse.json(bbResult, {
    status: 200,
    headers: {
      "Cache-Control":
        bbResult.summary.status === "DELIVERED"
          ? "public, s-maxage=86400, stale-while-revalidate=43200"
          : "public, s-maxage=900, stale-while-revalidate=300",
    },
  });
}
