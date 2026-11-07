"use client";

import * as React from "react";
import type { CourierId, TrackingDetailResult } from "@/types/tracking";
import { getCourierConfig } from "@/lib/courier-registry";
import { CourierBadge } from "@/components/tracking/courier-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Copy,
  Check,
  Truck,
  Calendar,
} from "lucide-react";
import {
  CardLoadingSkeleton,
  CardErrorState,
  EntityBox,
  PodPhotosSection,
  ManifestTimelineSection,
} from "./tracking-card-sections";

interface TrackingCardProps {
  readonly waybill: string;
  readonly courier: CourierId;
  readonly onRemove?: () => void;
}

export function TrackingCard({
  waybill,
  courier,
  onRemove,
}: TrackingCardProps): React.JSX.Element {
  const [data, setData] = React.useState<TrackingDetailResult | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);

  const courierConfig = getCourierConfig(courier);

  const fetchTracking = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/track?courier=${encodeURIComponent(courier)}&awb=${encodeURIComponent(
          waybill
        )}`
      );
      const json = (await res.json()) as TrackingDetailResult;

      if (!json.success && json.message) {
        setError(json.message);
      } else {
        setData(json);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat pelacakan";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [waybill, courier]);

  React.useEffect(() => {
    void fetchTracking();
  }, [fetchTracking]);

  const handleCopyWaybill = (): void => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(waybill);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleOpenOfficial = (): void => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(waybill);
    }
    const url = courierConfig.officialUrlGenerator(waybill);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenMirror = (): void => {
    const url = courierConfig.mirrorUrlGenerator(waybill);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="bg-muted/30 p-4 border-b border-border/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <CourierBadge courierId={courier} showFullName />
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
              <span>#{waybill}</span>
              <button
                type="button"
                onClick={handleCopyWaybill}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                title={copied ? "Tersalin!" : "Salin Resi"}
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && data.success && (
              <Badge
                variant="outline"
                className={`font-semibold tracking-wide text-xs ${
                  data.summary.status === "DELIVERED"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-blue-300 bg-blue-50 text-blue-800"
                }`}
              >
                {data.summary.status}
              </Badge>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenOfficial}
              className="h-7 gap-1 px-2 text-[11px] font-semibold"
              title="Buka Portal Resmi Ekspedisi"
            >
              <ExternalLink className="size-3" />
              <span>Web Resmi</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenMirror}
              className="h-7 gap-1 px-2 text-[11px] font-medium text-muted-foreground"
              title="Buka Mirror CekResi Instan"
            >
              <span>CekResi</span>
            </Button>

            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-7 px-1.5 text-muted-foreground hover:text-destructive"
                title="Hapus Kartu Ini"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {loading && <CardLoadingSkeleton />}

        {error && !loading && (
          <CardErrorState error={error} onRetry={() => void fetchTracking()} />
        )}

        {data && data.success && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <EntityBox
                title="Informasi Pengirim"
                name={data.summary.shipperName}
                phone={data.summary.shipperPhone}
                address={data.summary.shipperAddress}
                variant="blue"
              />
              <EntityBox
                title="Informasi Penerima"
                name={data.summary.receiverName}
                phone={data.summary.receiverPhone}
                address={data.summary.receiverAddress}
                coordinates={data.summary.coordinates}
                variant="emerald"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 font-medium text-foreground">
                <Truck className="size-3.5 text-primary" />
                <span>Layanan:</span>
                <span className="font-semibold">{data.summary.service}</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1 font-medium text-foreground">
                <Calendar className="size-3.5 text-primary" />
                <span>Tanggal:</span>
                <span>{data.summary.date}</span>
              </div>
            </div>

            {data.podPhotos && data.podPhotos.length > 0 && (
              <PodPhotosSection photos={data.podPhotos} />
            )}

            <ManifestTimelineSection
              history={data.history}
              isDelivered={data.summary.status === "DELIVERED"}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
