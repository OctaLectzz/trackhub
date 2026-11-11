"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { CourierId, TrackingItem } from "@/types/tracking";
import { getAllCouriers } from "@/lib/courier-registry";
import { sanitizeBulkWaybills } from "@/lib/text-sanitizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Layers, RotateCcw, Sparkles, Filter, CheckCircle2, Phone } from "lucide-react";

interface BulkInputCardProps {
  readonly onProcessItems: (items: readonly TrackingItem[]) => void;
  readonly onClearItems: () => void;
  readonly isProcessing?: boolean;
}

const SAMPLE_WAYBILLS = `P2611050000002
P2601080046258
005244878857
11LP1715594502994
030205696069`;

export function BulkInputCard({
  onProcessItems,
  onClearItems,
  isProcessing = false,
}: BulkInputCardProps): React.JSX.Element {
  const t = useTranslations("bulkInput");
  const commonT = useTranslations("common");
  const couriersT = useTranslations("couriers");

  const [rawText, setRawText] = React.useState<string>("");
  const [selectedCourier, setSelectedCourier] = React.useState<CourierId | "unknown">("unknown");
  const [jnePhoneLast5, setJnePhoneLast5] = React.useState<string>("");
  const [stats, setStats] = React.useState<{
    uniqueCount: number;
    duplicateCount: number;
  } | null>(null);

  const couriersList = React.useMemo(() => getAllCouriers(), []);

  const attachJneVerification = (items: readonly TrackingItem[]): readonly TrackingItem[] => {
    const cleanPhone = jnePhoneLast5.replace(/\D/g, "").slice(0, 5);
    if (!cleanPhone) {
      return items;
    }
    return items.map((item) =>
      item.courier === "jne" ? { ...item, jnePhoneLast5: cleanPhone } : item
    );
  };

  const handleProcess = (): void => {
    if (!rawText.trim()) {
      return;
    }

    const forced = selectedCourier === "unknown" ? undefined : selectedCourier;
    const result = sanitizeBulkWaybills(rawText, forced);

    setStats({
      uniqueCount: result.uniqueCount,
      duplicateCount: result.duplicateCount,
    });

    onProcessItems(attachJneVerification(result.items));
  };

  const handleClear = (): void => {
    setRawText("");
    setJnePhoneLast5("");
    setStats(null);
    onClearItems();
  };

  const handleLoadSample = (): void => {
    setRawText(SAMPLE_WAYBILLS);
    const result = sanitizeBulkWaybills(SAMPLE_WAYBILLS);
    setStats({
      uniqueCount: result.uniqueCount,
      duplicateCount: result.duplicateCount,
    });
    onProcessItems(result.items);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
            <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLoadSample}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            <span>{t("sampleBtn")}</span>
          </Button>
        </div>
        <CardDescription className="text-xs">{t("description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea
          value={rawText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawText(e.target.value)}
          placeholder={t("placeholder")}
          className="min-h-[160px] font-mono text-xs leading-relaxed"
          disabled={isProcessing}
        />

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="size-3.5" />
            <span>{t("defaultCourierLabel")}</span>
          </label>
          <select
            value={selectedCourier}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedCourier(e.target.value as CourierId | "unknown")
            }
            className="h-9 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isProcessing}
          >
            <option value="unknown">{commonT("autoDetect")}</option>
            {couriersList.map((c) => (
              <option key={c.id} value={c.id}>
                {couriersT(c.id as Parameters<typeof couriersT>[0])}
              </option>
            ))}
          </select>
        </div>

        {selectedCourier === "jne" && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-blue-200 bg-blue-50/40 p-2.5">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-blue-900">
              <Phone className="size-3 text-blue-600" />
              <span>{t("jnePhoneLabel")}</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={jnePhoneLast5}
              onChange={(e) => setJnePhoneLast5(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder={t("jnePhonePlaceholder")}
              className="h-8 w-full rounded-md border border-blue-200 bg-card px-2.5 font-mono text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              disabled={isProcessing}
            />
          </div>
        )}

        {stats && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 p-2.5 text-xs">
            <Badge variant="secondary" className="gap-1 bg-card text-[11px] font-medium shadow-2xs">
              <CheckCircle2 className="size-3 text-emerald-600" />
              <span>{t("detectedCount", { count: stats.uniqueCount })}</span>
            </Badge>
            {stats.duplicateCount > 0 && (
              <Badge variant="outline" className="text-[11px] text-amber-700 border-amber-300">
                {t("duplicatesRemoved", { count: stats.duplicateCount })}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            onClick={handleProcess}
            disabled={!rawText.trim() || isProcessing}
            className="flex-1 text-xs font-semibold"
          >
            {t("processBtn")}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={!rawText.trim() && !stats}
            size="icon"
            className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
            title={t("clearBtn")}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
