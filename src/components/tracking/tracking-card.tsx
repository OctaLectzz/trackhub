"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { CourierId, TrackingDetailResult } from "@/types/tracking";
import { getCourierConfig } from "@/lib/courier-registry";
import {
  getCachedTracking,
  setCachedTracking,
  removeCachedTracking,
} from "@/lib/tracking-cache";
import { CourierBadge } from "@/components/tracking/courier-badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, RotateCcw, Database } from "lucide-react";
import {
  CardLoadingSkeleton,
  CardErrorState,
  JneVerificationBar,
  EntityBox,
  CardMetadataBar,
  PodPhotosSection,
  ManifestTimelineSection,
} from "./tracking-card-sections";

interface TrackingCardProps {
  readonly waybill: string;
  readonly courier: CourierId;
  readonly initialPhoneLast5?: string;
  readonly onRemove?: () => void;
}

export function TrackingCard({
  waybill,
  courier,
  initialPhoneLast5,
  onRemove,
}: TrackingCardProps): React.JSX.Element {
  const t = useTranslations("trackingCard");

  const [data, setData] = React.useState<TrackingDetailResult | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<boolean>(false);
  const [isFromCache, setIsFromCache] = React.useState<boolean>(false);
  const [jnePhone, setJnePhone] = React.useState<string>(initialPhoneLast5 ?? "");

  const courierConfig = getCourierConfig(courier);

  const fetchTracking = React.useCallback(
    async (forceRefresh = false, overridePhone?: string) => {
      const activePhone = (overridePhone ?? jnePhone).trim();

      if (!forceRefresh) {
        const cached = getCachedTracking(courier, waybill, activePhone);
        if (cached) {
          setData(cached);
          setIsFromCache(true);
          setError(null);
          setLoading(false);
          return;
        }
      } else {
        removeCachedTracking(courier, waybill, activePhone);
      }

      setLoading(true);
      setError(null);
      setIsFromCache(false);

      try {
        const params = new URLSearchParams({ courier, awb: waybill });
        if (courier === "jne" && activePhone) {
          params.set("number", activePhone);
        }

        const res = await fetch(`/api/track?${params.toString()}`);
        const json = (await res.json()) as TrackingDetailResult;

        if (!json.success) {
          setError(json.message || "Data resi tidak ditemukan");
          setData(null);
        } else {
          setCachedTracking(courier, waybill, json, activePhone);
          setData(json);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal memuat pelacakan";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [waybill, courier, jnePhone]
  );

  React.useEffect(() => {
    void fetchTracking(false);
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
    window.open(courierConfig.officialUrlGenerator(waybill), "_blank", "noopener,noreferrer");
  };

  const handleOpenMirror = (): void => {
    window.open(courierConfig.mirrorUrlGenerator(waybill), "_blank", "noopener,noreferrer");
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
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isFromCache && data && data.success && (
              <Badge variant="secondary" className="gap-1 text-[10px] font-medium text-muted-foreground">
                <Database className="size-2.5" />
                <span>{t("cachedNote")}</span>
              </Badge>
            )}

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
              size="icon"
              onClick={() => void fetchTracking(true)}
              disabled={loading}
              className="size-7 text-muted-foreground hover:text-foreground"
              title={t("refreshTitle")}
            >
              <RotateCcw className={`size-3 ${loading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenOfficial}
              className="h-7 gap-1 px-2 text-[11px] font-semibold"
            >
              <ExternalLink className="size-3" />
              <span>{t("officialBtn")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenMirror}
              className="h-7 gap-1 px-2 text-[11px] font-medium text-muted-foreground"
            >
              <span>{t("mirrorBtn")}</span>
            </Button>

            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-7 px-1.5 text-muted-foreground hover:text-destructive"
              >
                ✕
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {courier === "jne" && (
          <JneVerificationBar
            phone={jnePhone}
            onChangePhone={setJnePhone}
            onSubmit={() => void fetchTracking(true, jnePhone)}
            loading={loading}
          />
        )}

        {loading && <CardLoadingSkeleton />}

        {error && !loading && (
          <CardErrorState error={error} onRetry={() => void fetchTracking(true)} />
        )}

        {data && data.success && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <EntityBox
                title={t("senderTitle")}
                name={data.summary.shipperName}
                phone={data.summary.shipperPhone}
                address={data.summary.shipperAddress}
                variant="blue"
              />
              <EntityBox
                title={t("receiverTitle")}
                name={data.summary.receiverName}
                phone={data.summary.receiverPhone}
                address={data.summary.receiverAddress}
                coordinates={data.summary.coordinates}
                variant="emerald"
              />
            </div>

            <CardMetadataBar
              service={data.summary.service}
              date={data.summary.date}
              weight={data.summary.weight}
              amount={data.summary.amount}
              serviceLabel={t("serviceLabel")}
              dateLabel={t("dateLabel")}
              weightLabel={t("weightLabel")}
              amountLabel={t("amountLabel")}
            />

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
