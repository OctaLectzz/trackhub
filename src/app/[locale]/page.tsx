"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { TrackingItem } from "@/types/tracking";
import { useTrackingWorkspace } from "@/hooks/use-tracking-workspace";
import { BulkInputCard } from "@/components/tracking/bulk-input-card";
import { TrackingCardList } from "@/components/tracking/tracking-card-list";

export default function HomePage(): React.JSX.Element {
  const t = useTranslations("home");
  const {
    items,
    isHydrated,
    setItems,
    clearWorkspace,
  } = useTrackingWorkspace();

  const handleProcessItems = (newItems: readonly TrackingItem[]): void => {
    setItems(newItems);
  };

  const handleClearItems = (): void => {
    clearWorkspace();
  };

  const handleRemoveSingleItem = (id: string): void => {
    setItems(items.filter((item) => item.id !== id));
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
          <TrackingCardList
            items={isHydrated ? items : []}
            onClearWorkspace={clearWorkspace}
            onRemoveItem={handleRemoveSingleItem}
          />
        </div>
      </div>
    </div>
  );
}
