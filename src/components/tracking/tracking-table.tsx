"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import type { CourierId, SellerStatus, TrackingItem } from "@/types/tracking";
import { getAllCouriers } from "@/lib/courier-registry";
import { getTrackingColumns } from "@/components/tracking/tracking-columns";
import { BatchLauncherBar } from "@/components/tracking/batch-launcher-bar";
import { ExportDialog } from "@/components/tracking/export-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, Package2, Download, Trash2 } from "lucide-react";

interface TrackingTableProps {
  readonly items: readonly TrackingItem[];
  readonly onStatusChange: (id: string, status: SellerStatus) => void;
  readonly onClearWorkspace?: () => void;
}

export function TrackingTable({
  items,
  onStatusChange,
  onClearWorkspace,
}: TrackingTableProps): React.JSX.Element {
  const tTable = useTranslations("table");
  const commonT = useTranslations("common");
  const couriersT = useTranslations("couriers");

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [selectedCourierFilter, setSelectedCourierFilter] = React.useState<string>("all");
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState<boolean>(false);

  const couriersList = React.useMemo(() => getAllCouriers(), []);

  const columns = React.useMemo(
    () =>
      getTrackingColumns({
        onStatusChange,
        tTable: (key: string) => tTable(key as Parameters<typeof tTable>[0]),
        tCommon: (key: string) => commonT(key as Parameters<typeof commonT>[0]),
      }),
    [onStatusChange, tTable, commonT]
  );

  const tableData = React.useMemo(() => [...items], [items]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleCourierFilterChange = (courierId: string): void => {
    setSelectedCourierFilter(courierId);
    if (courierId === "all") {
      table.getColumn("courier")?.setFilterValue(undefined);
    } else {
      table.getColumn("courier")?.setFilterValue(courierId);
    }
  };

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package2 className="size-4" />
            </div>
            <CardTitle className="text-base font-semibold">
              {commonT("appName")} Workspace
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={commonT("search")}
                className="h-8 w-44 rounded-lg border border-input bg-card pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-56"
              />
            </div>

            <select
              value={selectedCourierFilter}
              onChange={(e) => handleCourierFilterChange(e.target.value)}
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
              title="Ekspor Laporan Spreadsheet"
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
                title="Kosongkan Seluruh Workspace"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                    <Package2 className="size-8 text-muted-foreground/40" />
                    <p className="text-xs">{tTable("emptyState")}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()} (
              {table.getFilteredRowModel().rows.length} total resi)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-7 px-2"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-7 px-2"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <BatchLauncherBar
        selectedItems={selectedRows}
        onClearSelection={() => setRowSelection({})}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        allItems={items}
        selectedItems={selectedRows}
      />
    </Card>
  );
}
