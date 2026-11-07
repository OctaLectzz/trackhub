"use client";

import * as React from "react";
import type { CourierId, TrackingDetailResult } from "@/types/tracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Camera,
  ExternalLink,
  RotateCcw,
  User,
  ArrowRight,
} from "lucide-react";

interface TrackingDetailRowProps {
  readonly waybill: string;
  readonly courier: CourierId;
  readonly onDeliveredDetected?: (awb: string) => void;
}

export function TrackingDetailRow({
  waybill,
  courier,
  onDeliveredDetected,
}: TrackingDetailRowProps): React.JSX.Element {
  const [data, setData] = React.useState<TrackingDetailResult | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

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
        if (json.summary.status === "DELIVERED" && onDeliveredDetected) {
          onDeliveredDetected(waybill);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat tracking";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [waybill, courier, onDeliveredDetected]);

  React.useEffect(() => {
    void fetchTracking();
  }, [fetchTracking]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-medium text-muted-foreground">
            Mengambil data manifest tracking dari server...
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="h-10 animate-pulse rounded-lg bg-muted/70" />
          <div className="h-10 animate-pulse rounded-lg bg-muted/70" />
          <div className="h-10 animate-pulse rounded-lg bg-muted/70" />
          <div className="h-10 animate-pulse rounded-lg bg-muted/70" />
        </div>
      </div>
    );
  }

  if (error || !data || !data.success) {
    return (
      <div className="flex flex-col items-start gap-2 p-4 text-xs">
        <div className="flex items-center gap-1.5 text-amber-700">
          <AlertCircle className="size-4 shrink-0" />
          <span className="font-semibold">Info Pelacakan:</span>
          <span>{error || data?.message || "Data resi tidak ditemukan"}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void fetchTracking()}
          className="h-7 gap-1 text-[11px]"
        >
          <RotateCcw className="size-3" />
          <span>Coba Ulangi</span>
        </Button>
      </div>
    );
  }

  const { summary, history, podPhotos } = data;
  const isDelivered = summary.status === "DELIVERED";

  return (
    <div className="space-y-4 p-4 text-xs">
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border/80 bg-card p-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-muted-foreground">Rute Pengiriman</div>
          <div className="mt-0.5 flex items-center gap-1 font-semibold text-foreground">
            <span className="truncate max-w-28">{summary.origin || "-"}</span>
            <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate max-w-28">{summary.destination || "-"}</span>
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-muted-foreground">Pihak Penerima</div>
          <div className="mt-0.5 flex items-center gap-1 font-semibold text-foreground">
            <User className="size-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{summary.receiver || "-"}</span>
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-muted-foreground">Layanan &amp; Berat</div>
          <div className="mt-0.5 font-semibold text-foreground">
            {summary.service} ({summary.weight})
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-2.5 shadow-2xs">
          <div className="text-[10px] font-medium text-muted-foreground">Status Terkini</div>
          <div className="mt-0.5">
            <Badge
              variant="outline"
              className={
                isDelivered
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-blue-300 bg-blue-50 text-blue-800"
              }
            >
              {summary.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Proof-of-Delivery Photos (Pos Indonesia specific) */}
      {podPhotos && podPhotos.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <Camera className="size-3.5 text-amber-700" />
            <span>Foto Bukti Serah Terima Kurir (POD)</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {podPhotos.map((photoUrl, idx) => (
              <a
                key={idx}
                href={photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-1.5 rounded-md border border-amber-300 bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground shadow-2xs transition-colors hover:border-amber-500"
              >
                <span>Buka Foto {idx + 1}</span>
                <ExternalLink className="size-3 text-muted-foreground group-hover:text-amber-700" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Manifest Vertical Timeline Stepper */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Clock className="size-3.5 text-primary" />
          <span>Riwayat Perjalanan Paket ({history.length} Checkpoint)</span>
        </div>

        <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {history.map((event, idx) => {
            const isLatest = idx === 0;
            return (
              <div key={idx} className="relative flex flex-col gap-0.5">
                <div
                  className={`absolute -left-6 top-1 size-2.5 rounded-full ring-4 ring-card ${
                    isLatest
                      ? isDelivered
                        ? "bg-emerald-600"
                        : "bg-primary"
                      : "bg-muted-foreground/40"
                  }`}
                />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-foreground">
                    {event.date}
                  </span>
                  {isLatest && (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px] font-bold">
                      TERBARU
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {event.desc}
                  {event.location ? ` • ${event.location}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
