import * as XLSX from "xlsx";
import type { TrackingItem } from "@/types/tracking";
import { getCourierConfig } from "@/lib/courier-registry";

export interface ExportSpreadsheetOptions {
  readonly items: readonly TrackingItem[];
  readonly filename?: string;
  readonly format?: "xlsx" | "csv";
}

interface WorksheetCell {
  t: "s" | "n";
  v: string | number;
  f?: string;
}

export function exportTrackingSpreadsheet({
  items,
  filename = "TrackHub-Laporan-Resi",
  format = "xlsx",
}: ExportSpreadsheetOptions): void {
  if (items.length === 0) {
    return;
  }

  const cleanFilename = filename.endsWith(`.${format}`)
    ? filename
    : `${filename}.${format}`;

  if (format === "csv") {
    exportAsCsv(items, cleanFilename);
    return;
  }

  exportAsXlsx(items, cleanFilename);
}

function exportAsXlsx(items: readonly TrackingItem[], filename: string): void {
  const headers = [
    "No",
    "Nomor Resi",
    "Ekspedisi",
    "Status Seller",
    "Link Resmi",
    "Link Mirror CekResi",
    "Waktu Input",
  ];

  const ws: XLSX.WorkSheet = {};
  const range = { s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: items.length } };

  // Write header row
  for (let colIdx = 0; colIdx < headers.length; colIdx++) {
    const cellRef = XLSX.utils.encode_cell({ c: colIdx, r: 0 });
    ws[cellRef] = { t: "s", v: headers[colIdx] } as WorksheetCell;
  }

  // Write item rows with active =HYPERLINK() formulas
  for (let rowIdx = 0; rowIdx < items.length; rowIdx++) {
    const item = items[rowIdx];
    const courierConfig = getCourierConfig(item.courier);
    const r = rowIdx + 1;

    // Col 0: No
    ws[XLSX.utils.encode_cell({ c: 0, r })] = { t: "n", v: rowIdx + 1 } as WorksheetCell;

    // Col 1: Nomor Resi
    ws[XLSX.utils.encode_cell({ c: 1, r })] = { t: "s", v: item.waybill } as WorksheetCell;

    // Col 2: Ekspedisi
    ws[XLSX.utils.encode_cell({ c: 2, r })] = { t: "s", v: courierConfig.name } as WorksheetCell;

    // Col 3: Status Seller
    ws[XLSX.utils.encode_cell({ c: 3, r })] = { t: "s", v: formatStatus(item.status) } as WorksheetCell;

    // Col 4: Link Resmi (Formula Hyperlink)
    ws[XLSX.utils.encode_cell({ c: 4, r })] = {
      t: "s",
      v: "Buka Link Resmi",
      f: `HYPERLINK("${item.officialUrl}", "Buka Link Resmi")`,
    } as WorksheetCell;

    // Col 5: Link Mirror (Formula Hyperlink)
    ws[XLSX.utils.encode_cell({ c: 5, r })] = {
      t: "s",
      v: "Buka Mirror CekResi",
      f: `HYPERLINK("${item.mirrorUrl}", "Buka Mirror CekResi")`,
    } as WorksheetCell;

    // Col 6: Waktu Input
    ws[XLSX.utils.encode_cell({ c: 6, r })] = { t: "s", v: item.createdAt } as WorksheetCell;
  }

  ws["!ref"] = XLSX.utils.encode_range(range);

  // Set professional auto-fit column widths
  ws["!cols"] = [
    { wch: 6 },  // No
    { wch: 22 }, // Nomor Resi
    { wch: 18 }, // Ekspedisi
    { wch: 16 }, // Status Seller
    { wch: 22 }, // Link Resmi
    { wch: 24 }, // Link Mirror
    { wch: 24 }, // Waktu Input
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lacak Resi");
  XLSX.writeFile(wb, filename);
}

function exportAsCsv(items: readonly TrackingItem[], filename: string): void {
  const rows = items.map((item, idx) => {
    const courierConfig = getCourierConfig(item.courier);
    return {
      No: idx + 1,
      "Nomor Resi": item.waybill,
      Ekspedisi: courierConfig.name,
      "Status Seller": formatStatus(item.status),
      "Link Resmi": item.officialUrl,
      "Link Mirror CekResi": item.mirrorUrl,
      "Waktu Input": item.createdAt,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatStatus(status: string): string {
  switch (status) {
    case "in_transit":
      return "Dalam Perjalanan";
    case "delivered":
      return "Terkirim";
    case "issue":
      return "Kendala / Retur";
    default:
      return "Belum Dicek";
  }
}
