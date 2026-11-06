import * as React from "react";
import type { CourierId } from "@/types/tracking";
import { getCourierConfig } from "@/lib/courier-registry";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CourierBadgeProps {
  readonly courierId: CourierId;
  readonly className?: string;
  readonly showFullName?: boolean;
}

export function CourierBadge({
  courierId,
  className,
  showFullName = false,
}: CourierBadgeProps): React.JSX.Element {
  const config = getCourierConfig(courierId);

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold tracking-wide transition-colors",
        config.badgeBg,
        className
      )}
      title={config.name}
    >
      {showFullName ? config.name : config.badgeText}
    </Badge>
  );
}
