"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { SellerStatus, TrackingItem } from "@/types/tracking";
import { CourierBadge } from "@/components/tracking/courier-badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, Eye } from "lucide-react";

interface ColumnsOptions {
  readonly onStatusChange: (id: string, status: SellerStatus) => void;
  readonly tTable: (key: string) => string;
  readonly tCommon: (key: string) => string;
}

export function getTrackingColumns({
  onStatusChange,
  tTable,
  tCommon,
}: ColumnsOptions): ColumnDef<TrackingItem>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
          className="size-4 rounded border-border accent-primary cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          aria-label="Select row"
          className="size-4 rounded border-border accent-primary cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "index",
      header: () => <span className="font-semibold text-xs">{tTable("colIndex")}</span>,
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">{row.index + 1}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "waybill",
      header: () => <span className="font-semibold text-xs">{tTable("colResi")}</span>,
      cell: ({ row }) => {
        const waybill = row.original.waybill;
        return <WaybillCell waybill={waybill} tCommon={tCommon} />;
      },
    },
    {
      accessorKey: "courier",
      header: () => <span className="font-semibold text-xs">{tTable("colCourier")}</span>,
      cell: ({ row }) => <CourierBadge courierId={row.original.courier} />,
    },
    {
      id: "directLink",
      header: () => <span className="font-semibold text-xs">{tTable("colDirectLink")}</span>,
      cell: ({ row }) => {
        const item = row.original;
        const handleOpenOfficial = (): void => {
          if (navigator.clipboard) {
            void navigator.clipboard.writeText(item.waybill);
          }
          window.open(item.officialUrl, "_blank", "noopener,noreferrer");
        };

        const isPos = item.courier === "pos";

        return (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleOpenOfficial}
            className={`h-7 gap-1 px-2.5 text-[11px] font-semibold ${
              isPos
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-primary text-primary-foreground"
            }`}
            title={isPos ? "Lihat Lokasi & Foto Bukti Penerimaan" : "Buka Portal Resmi Ekspedisi"}
          >
            {isPos ? <Eye className="size-3" /> : <ExternalLink className="size-3" />}
            <span>{isPos ? "Foto & Lokasi" : tTable("colDirectLink")}</span>
          </Button>
        );
      },
    },
    {
      id: "mirrorLink",
      header: () => <span className="font-semibold text-xs">{tTable("colMirrorLink")}</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <a
            href={item.mirrorUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka Mirror CekResi Instan"
            className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 text-[11px] font-medium text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="size-3" />
            <span>CekResi</span>
          </a>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <span className="font-semibold text-xs">{tTable("colStatusNote")}</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <select
            value={item.status}
            onChange={(e) => onStatusChange(item.id, e.target.value as SellerStatus)}
            className="h-7 rounded-md border border-input bg-card px-2 text-[11px] text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="pending">{tTable("statusPending")}</option>
            <option value="in_transit">{tTable("statusInTransit")}</option>
            <option value="delivered">{tTable("statusDelivered")}</option>
            <option value="issue">{tTable("statusIssue")}</option>
          </select>
        );
      },
    },
  ];
}

function WaybillCell({
  waybill,
  tCommon,
}: {
  readonly waybill: string;
  readonly tCommon: (key: string) => string;
}): React.JSX.Element {
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleCopy = (): void => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(waybill);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
      <span>{waybill}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title={copied ? tCommon("copied") : tCommon("copy")}
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  );
}
