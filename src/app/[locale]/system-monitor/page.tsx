"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { SystemQuotaResult, SystemCouriersResult } from "@/types/tracking";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  RotateCcw,
  Zap,
  CreditCard,
  Layers,
  Clock,
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
} from "lucide-react";

export default function SystemMonitorPage(): React.JSX.Element {
  const t = useTranslations("systemMonitor");

  const [quota, setQuota] = React.useState<SystemQuotaResult | null>(null);
  const [couriers, setCouriers] = React.useState<SystemCouriersResult | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [lastChecked, setLastChecked] = React.useState<string>("");

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [quotaRes, couriersRes] = await Promise.all([
        fetch("/api/system/quota").then((r) => r.json() as Promise<SystemQuotaResult>),
        fetch("/api/system/couriers").then((r) => r.json() as Promise<SystemCouriersResult>),
      ]);

      setQuota(quotaRes);
      setCouriers(couriersRes);
      setLastChecked(new Date().toLocaleTimeString("id-ID", { hour12: false }));
    } catch (err) {
      console.error("Failed to fetch system monitor diagnostics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const courierStats = React.useMemo(() => {
    const list = couriers?.couriers ?? [];
    return {
      total: list.length,
      online: list.filter((c) => c.status === "online").length,
      maintenance: list.filter((c) => c.status === "maintenance").length,
      error: list.filter((c) => c.status === "error" || c.status === "offline").length,
    };
  }, [couriers]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("title")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastChecked && (
            <span className="text-xs text-muted-foreground font-mono">
              {t("lastChecked")} {lastChecked}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void fetchData()}
            disabled={loading}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <RotateCcw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("refreshBtn")}</span>
          </Button>
        </div>
      </div>

      {/* Quota & Balance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>{t("remainingQuota")}</span>
              <Zap className="size-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground font-mono">
              {quota ? quota.remaining : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              {t("totalQuota")}: <span className="font-semibold text-foreground">{quota?.limit ?? 0}</span> hit
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>{t("accountBalance")}</span>
              <CreditCard className="size-4 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700 font-mono">
              {quota ? `Rp ${Number(quota.balance).toLocaleString("id-ID")}` : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              {t("requestPrice")}: <span className="font-semibold text-foreground">Rp {quota?.price ?? 15}</span>/hit
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>{t("usedQuota")}</span>
              <Clock className="size-4 text-blue-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground font-mono">
              {quota ? quota.count : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Produk: <span className="font-semibold text-foreground">{quota?.product ?? "cek-resi"}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border/80">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>{t("apiGateway")}</span>
              <Server className="size-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {quota?.success ? "Active" : "Degraded"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground">
              Endpoint: <span className="font-mono text-foreground font-semibold">api.binderbyte.com</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courier Status Grid */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                {t("courierStatusSection")}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 text-[11px] gap-1">
                <CheckCircle2 className="size-3" />
                <span>{courierStats.online} Online</span>
              </Badge>
              {courierStats.maintenance > 0 && (
                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 text-[11px] gap-1">
                  <AlertTriangle className="size-3" />
                  <span>{courierStats.maintenance} Maint</span>
                </Badge>
              )}
              {courierStats.error > 0 && (
                <Badge variant="outline" className="text-rose-700 bg-rose-50 border-rose-300 text-[11px] gap-1">
                  <XCircle className="size-3" />
                  <span>{courierStats.error} Error</span>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(couriers?.couriers ?? []).map((c) => {
              const isOnline = c.status === "online";
              const isMaint = c.status === "maintenance";
              const isErr = c.status === "error" || c.status === "offline";

              return (
                <div
                  key={c.code}
                  className="flex items-center justify-between rounded-lg border border-border/80 bg-card p-2.5 text-xs transition-colors hover:border-border"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold text-foreground truncate" title={c.name}>
                      {c.name}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      {c.code}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] px-1.5 font-semibold ${
                      isOnline
                        ? "text-emerald-700 bg-emerald-50/80 border-emerald-200"
                        : isMaint
                          ? "text-amber-700 bg-amber-50/80 border-amber-200"
                          : isErr
                            ? "text-rose-700 bg-rose-50/80 border-rose-200"
                            : "text-muted-foreground bg-muted border-border"
                    }`}
                  >
                    {isOnline ? "Online" : isMaint ? "Maint" : "Error"}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
            <ShieldAlert className="size-3.5 text-muted-foreground shrink-0" />
            <span>
              Halaman ini bersifat internal/unlisted untuk pemantauan konektivitas dan kuota. Tidak ada tautan publik yang mengarah ke URL ini.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
