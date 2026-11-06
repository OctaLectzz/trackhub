"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { TrackingItem } from "@/types/tracking";
import { exportTrackingSpreadsheet } from "@/lib/spreadsheet-export";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, X, Download, FileText, CheckCircle } from "lucide-react";

interface ExportDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly allItems: readonly TrackingItem[];
  readonly selectedItems: readonly TrackingItem[];
}

export function ExportDialog({
  isOpen,
  onClose,
  allItems,
  selectedItems,
}: ExportDialogProps): React.JSX.Element | null {
  const t = useTranslations("export");
  const commonT = useTranslations("common");

  const [scope, setScope] = React.useState<"all" | "selected">("all");
  const [format, setFormat] = React.useState<"xlsx" | "csv">("xlsx");
  const [filename, setFilename] = React.useState<string>(t("fileNameDefault"));
  const [isExported, setIsExported] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (selectedItems.length > 0) {
      setScope("selected");
    } else {
      setScope("all");
    }
  }, [selectedItems]);

  if (!isOpen) {
    return null;
  }

  const targetItems = scope === "selected" && selectedItems.length > 0 ? selectedItems : allItems;

  const handleDownload = (): void => {
    if (targetItems.length === 0) {
      return;
    }

    exportTrackingSpreadsheet({
      items: targetItems,
      filename: filename.trim() || t("fileNameDefault"),
      format,
    });

    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in fade-in-0 zoom-in-95">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <FileSpreadsheet className="size-4" />
              </div>
              <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">{t("description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Cakupan Data</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope("all")}
                className={`flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left text-xs transition-colors cursor-pointer ${
                  scope === "all"
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>Semua Resi</span>
                <span className="text-[11px] opacity-80">({allItems.length} data)</span>
              </button>

              <button
                type="button"
                onClick={() => setScope("selected")}
                disabled={selectedItems.length === 0}
                className={`flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  scope === "selected"
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>Resi Terpilih</span>
                <span className="text-[11px] opacity-80">({selectedItems.length} data)</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Format Spreadsheet</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-colors cursor-pointer ${
                  format === "xlsx"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-800 font-semibold"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <FileSpreadsheet className="size-4 text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-colors cursor-pointer ${
                  format === "csv"
                    ? "border-primary bg-primary/5 text-primary font-semibold"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <FileText className="size-4 text-primary" />
                <span>CSV (.csv)</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Nama Berkas</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </CardContent>

        <CardFooter className="mt-4 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Batal
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={targetItems.length === 0 || isExported}
            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            {isExported ? (
              <>
                <CheckCircle className="size-3.5" />
                <span>Berhasil!</span>
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                <span>{t("downloadBtn")}</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
