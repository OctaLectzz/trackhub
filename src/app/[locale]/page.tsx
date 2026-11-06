"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { SellerStatus, TrackingItem } from "@/types/tracking";
import { BulkInputCard } from "@/components/tracking/bulk-input-card";
import { TrackingTable } from "@/components/tracking/tracking-table";

export default function HomePage(): React.JSX.Element {
  const t = useTranslations("home");
  const [items, setItems] = React.useState<readonly TrackingItem[]>([]);

  const handleProcessItems = (newItems: readonly TrackingItem[]): void => {
    setItems(newItems);
  };

  const handleClearItems = (): void => {
    setItems([]);
  };

  const handleStatusChange = (id: string, newStatus: SellerStatus): void => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-1.5">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <BulkInputCard
            onProcessItems={handleProcessItems}
            onClearItems={handleClearItems}
          />
        </div>

        <div className="lg:col-span-8">
          <TrackingTable
            items={items}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
