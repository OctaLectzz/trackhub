"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Phone,
  MapPin,
  Clock,
  Camera,
  ExternalLink,
  RotateCcw,
  AlertCircle,
} from "lucide-react";

export function CardLoadingSkeleton(): React.JSX.Element {
  const t = useTranslations("trackingCard");

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>{t("loadingText")}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-24 animate-pulse rounded-lg bg-muted/60" />
      </div>
    </div>
  );
}

export function CardErrorState({
  error,
  onRetry,
}: {
  readonly error: string;
  readonly onRetry: () => void;
}): React.JSX.Element {
  const t = useTranslations("trackingCard");

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0 text-amber-600" />
        <span>{error}</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="h-7 shrink-0 gap-1 px-2 text-[11px]"
      >
        <RotateCcw className="size-3" />
        <span>{t("retryBtn")}</span>
      </Button>
    </div>
  );
}

export function JneVerificationBar({
  phone,
  onChangePhone,
  onSubmit,
  loading,
}: {
  readonly phone: string;
  readonly onChangePhone: (val: string) => void;
  readonly onSubmit: () => void;
  readonly loading: boolean;
}): React.JSX.Element {
  const t = useTranslations("trackingCard");

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200/80 bg-blue-50/30 p-2.5 text-xs">
      <Phone className="size-3.5 text-blue-600 shrink-0" />
      <input
        type="text"
        inputMode="numeric"
        maxLength={5}
        value={phone}
        onChange={(e) => onChangePhone(e.target.value.replace(/\D/g, "").slice(0, 5))}
        placeholder={t("jnePhoneInput")}
        className="h-7 flex-1 min-w-44 rounded-md border border-input bg-card px-2.5 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onSubmit}
        disabled={loading || phone.length < 5}
        className="h-7 px-2.5 text-[11px] font-semibold"
      >
        {t("jneVerifyBtn")}
      </Button>
    </div>
  );
}

export function EntityBox({
  title,
  name,
  phone,
  address,
  coordinates,
  variant,
}: {
  readonly title: string;
  readonly name: string;
  readonly phone: string;
  readonly address: string;
  readonly coordinates?: string;
  readonly variant: "blue" | "emerald";
}): React.JSX.Element {
  const isBlue = variant === "blue";
  const borderClass = isBlue ? "border-blue-100 bg-blue-50/30" : "border-emerald-100 bg-emerald-50/30";
  const headerClass = isBlue ? "text-blue-900 border-blue-100/80" : "text-emerald-900 border-emerald-100/80";
  const iconClass = isBlue ? "text-blue-600" : "text-emerald-600";
  const phoneIconClass = isBlue ? "text-blue-500" : "text-emerald-500";

  return (
    <div className={`rounded-xl border p-3 space-y-1.5 ${borderClass}`}>
      <div className={`flex items-center gap-1.5 font-semibold border-b pb-1 ${headerClass}`}>
        <User className={`size-3.5 ${iconClass}`} />
        <span>{title}</span>
      </div>
      <div className="space-y-1 text-foreground">
        <div className="font-bold text-[13px]">{name}</div>
        <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
          <Phone className={`size-3 ${phoneIconClass}`} />
          <span>{phone}</span>
        </div>
        <div className="flex items-start gap-1.5 text-muted-foreground text-[11px] leading-relaxed">
          <MapPin className={`size-3 shrink-0 mt-0.5 ${phoneIconClass}`} />
          <span>{address}</span>
        </div>
        {coordinates && (
          <div className="text-[10px] text-emerald-700/80 font-mono">
            GPS: {coordinates}
          </div>
        )}
      </div>
    </div>
  );
}

export function PodPhotosSection({ photos }: { readonly photos: readonly string[] }): React.JSX.Element {
  const t = useTranslations("trackingCard");

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
        <Camera className="size-3.5 text-amber-700" />
        <span>{t("podTitle")}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {photos.map((photoUrl, idx) => (
          <a
            key={idx}
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 rounded-lg border border-amber-300 bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-2xs transition-colors hover:border-amber-500"
          >
            <span>{t("podOpen", { index: idx + 1 })}</span>
            <ExternalLink className="size-3 text-muted-foreground group-hover:text-amber-700" />
          </a>
        ))}
      </div>
    </div>
  );
}

export function ManifestTimelineSection({
  history,
  isDelivered,
}: {
  readonly history: readonly { date: string; desc: string; location: string }[];
  readonly isDelivered: boolean;
}): React.JSX.Element {
  const t = useTranslations("trackingCard");

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Clock className="size-3.5 text-primary" />
        <span>{t("manifestTitle", { count: history.length })}</span>
      </div>

      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {history.map((event, idx) => {
          const isLatest = idx === 0;

          return (
            <div key={idx} className="relative flex flex-col gap-0.5 text-xs">
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
                    {t("latestBadge")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {event.desc}
                {event.location ? ` • ${event.location}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CardMetadataBar({
  service,
  date,
  weight,
  amount,
  serviceLabel,
  dateLabel,
  weightLabel,
  amountLabel,
}: {
  readonly service: string;
  readonly date: string;
  readonly weight?: string;
  readonly amount?: string;
  readonly serviceLabel: string;
  readonly dateLabel: string;
  readonly weightLabel: string;
  readonly amountLabel: string;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-1 font-medium text-foreground">
        <span className="text-primary font-semibold">{serviceLabel}</span>
        <span className="font-semibold">{service}</span>
      </div>
      <div className="h-3 w-px bg-border" />
      <div className="flex items-center gap-1 font-medium text-foreground">
        <span className="text-primary font-semibold">{dateLabel}</span>
        <span>{date}</span>
      </div>
      {weight && weight !== "-" && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span className="text-primary font-semibold">{weightLabel}</span>
            <span>{weight}</span>
          </div>
        </>
      )}
      {amount && (
        <>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1 font-medium text-foreground">
            <span className="text-primary font-semibold">{amountLabel}</span>
            <span>Rp {amount}</span>
          </div>
        </>
      )}
    </div>
  );
}
