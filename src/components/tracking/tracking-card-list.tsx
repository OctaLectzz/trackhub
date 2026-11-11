"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { TrackingItem } from "@/types/tracking";
import { getAllCouriers } from "@/lib/courier-registry";
import { TrackingCard } from "@/components/tracking/tracking-card";
import { ExportDialog } from "@/components/tracking/export-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Package2, Download, Trash2, Layers } from "lucide-react";

interface TrackingCardListProps {
  readonly items: readonly TrackingItem[];
  readonly onClearWorkspace?: () => void;
  readonly onRemoveItem?: (id: string) => void;
}

export function TrackingCardList({
  items,
  onClearWorkspace,
  onRemoveItem,
}: TrackingCardListProps): React.JSX.Element {
  const commonT = useTranslations("common");
  const couriersT = useTranslations("couriers");

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedCourier, setSelectedCourier] = React.useState<string>("all");
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState<boolean>(false);

  const couriersList = React.useMemo(() => getAllCouriers(), []);

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.waybill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourier =
        selectedCourier === "all" || item.courier === selectedCourier;

      return matchesSearch && matchesCourier;
    });
  }, [items, searchQuery, selectedCourier]);

  return (
    <div className="space-y-4">
      <Card className="shadow-xs border-border/80">
        <CardHeader className="p-4 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Hasil Pelacakan Paket
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  Menampilkan {filteredItems.length} dari {items.length} resi aktif
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={commonT("search")}
                  className="h-8 w-40 rounded-lg border border-input bg-card pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-52"
                />
              </div>

              <select
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
                className="h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">{commonT("allCouriers")}</option>
                {couriersList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {couriersT(c.id as Parameters<typeof couriersT>[0])}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExportDialogOpen(true)}
                disabled={items.length === 0}
                className="h-8 gap-1.5 px-2.5 text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                title={commonT("export")}
              >
                <Download className="size-3.5" />
                <span>{commonT("export")}</span>
              </Button>

              {onClearWorkspace && items.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClearWorkspace}
                  className="size-8 text-muted-foreground hover:text-destructive"
                  title="Kosongkan Semua Kartu"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <TrackingCard
              key={item.id}
              waybill={item.waybill}
              courier={item.courier}
              initialPhoneLast5={item.jnePhoneLast5}
              onRemove={onRemoveItem ? () => onRemoveItem(item.id) : undefined}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
            <Package2 className="size-10 text-muted-foreground/40" />
            <div className="text-sm font-medium">Belum Ada Kartu Pelacakan</div>
            <p className="max-w-sm text-xs">
              Masukkan nomor resi pada panel di sebelah kiri, lalu klik &quot;Proses Semua Resi&quot; untuk menampilkan rincian pengirim, penerima, dan riwayat perjalanan paket.
            </p>
          </CardContent>
        </Card>
      )}

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        allItems={items}
        selectedItems={[]}
      />
    </div>
  );
}
