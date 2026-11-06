"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { TrackingItem } from "@/types/tracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X, CheckSquare } from "lucide-react";

interface BatchLauncherBarProps {
  readonly selectedItems: readonly TrackingItem[];
  readonly onClearSelection: () => void;
}

export function BatchLauncherBar({
  selectedItems,
  onClearSelection,
}: BatchLauncherBarProps): React.JSX.Element | null {
  const commonT = useTranslations("common");
  const [isLaunching, setIsLaunching] = React.useState<boolean>(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const handleLaunchAll = async (): Promise<void> => {
    setIsLaunching(true);

    // Stagger opening tabs with 250ms throttle delay to bypass popup blockers
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      if (item) {
        window.open(item.officialUrl, "_blank", "noopener,noreferrer");
      }
      if (i < selectedItems.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    setIsLaunching(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card/95 px-4 py-2.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <CheckSquare className="size-4 text-primary" />
          <Badge variant="secondary" className="font-semibold text-xs">
            {commonT("selected", { count: selectedItems.length })}
          </Badge>
        </div>

        <div className="h-4 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          onClick={handleLaunchAll}
          disabled={isLaunching}
          className="h-8 gap-1.5 px-3 text-xs font-semibold"
        >
          <ExternalLink className="size-3.5" />
          <span>{isLaunching ? commonT("loading") : commonT("openAll")}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="size-8 text-muted-foreground hover:text-foreground"
          title="Deselect all"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
