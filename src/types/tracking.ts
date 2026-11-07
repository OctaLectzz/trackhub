export type CourierId =
  | "pos"
  | "jnt"
  | "sicepat"
  | "spx"
  | "jne"
  | "anteraja"
  | "tiki"
  | "wahana"
  | "lion"
  | "ninja"
  | "idexpress"
  | "unknown";

export type SellerStatus = "pending" | "in_transit" | "delivered" | "issue";

export interface CourierConfig {
  readonly id: CourierId;
  readonly name: string;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly regexPatterns: readonly RegExp[];
  readonly officialUrlGenerator: (waybill: string) => string;
  readonly mirrorUrlGenerator: (waybill: string) => string;
}

export interface TrackingItem {
  readonly id: string;
  readonly waybill: string;
  readonly courier: CourierId;
  readonly officialUrl: string;
  readonly mirrorUrl: string;
  readonly status: SellerStatus;
  readonly note: string;
  readonly createdAt: string;
}

export interface SanitizeResult {
  readonly items: readonly TrackingItem[];
  readonly rawCount: number;
  readonly uniqueCount: number;
  readonly duplicateCount: number;
}

export interface TrackingHistoryItem {
  readonly date: string;
  readonly desc: string;
  readonly location: string;
}

export interface TrackingDetailSummary {
  readonly awb: string;
  readonly courier: string;
  readonly service: string;
  readonly status: string;
  readonly date: string;
  readonly weight: string;
  readonly origin: string;
  readonly destination: string;
  readonly shipper: string;
  readonly receiver: string;
}

export interface TrackingDetailResult {
  readonly success: boolean;
  readonly summary: TrackingDetailSummary;
  readonly history: readonly TrackingHistoryItem[];
  readonly podPhotos?: readonly string[];
  readonly message?: string;
}
