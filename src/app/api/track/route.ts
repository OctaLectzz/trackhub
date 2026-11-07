import { NextRequest, NextResponse } from "next/server";
import type { CourierId, TrackingDetailResult } from "@/types/tracking";
import {
  fetchPosIndonesiaDirect,
  fetchBinderByteTracking,
  createEmptySummary,
} from "./track-helpers";

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

  // 1. Pos Indonesia Direct Scraper (POD photo, phone, coordinates, full address)
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

  // 2. Commercial Couriers via BinderByte API
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

  const bbResult = await fetchBinderByteTracking(apiKey, courier, awb);

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
