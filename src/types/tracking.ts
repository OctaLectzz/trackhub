export type CourierId =
  | "pos"
  | "jne"
  | "jnt"
  | "sicepat"
  | "anteraja"
  | "wahana"
  | "rpx"
  | "lion"
  | "ninja"
  | "tiki"
  | "pcp"
  | "jet"
  | "rex"
  | "first"
  | "ide"
  | "spx"
  | "kgx"
  | "sap"
  | "jxe"
  | "jnt_cargo"
  | "lex"
  | "indah_cargo"
  | "dakota"
  | "ant_cargo"
  | "next_logistik"
  | "gtl"
  | "kurir_tokopedia"
  | "laris_cargo"
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
  readonly jnePhoneLast5?: string;
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
  readonly amount?: string;
  readonly origin: string;
  readonly destination: string;
  readonly shipperName: string;
  readonly shipperPhone: string;
  readonly shipperAddress: string;
  readonly receiverName: string;
  readonly receiverPhone: string;
  readonly receiverAddress: string;
  readonly coordinates?: string;
}

export interface TrackingDetailResult {
  readonly success: boolean;
  readonly summary: TrackingDetailSummary;
  readonly history: readonly TrackingHistoryItem[];
  readonly podPhotos?: readonly string[];
  readonly message?: string;
  readonly cachedAt?: number;
}

export interface SystemQuotaResult {
  readonly success: boolean;
  readonly product: string;
  readonly count: number;
  readonly limit: number;
  readonly remaining: number;
  readonly price: string;
  readonly balance: string;
  readonly checkedAt: string;
  readonly message?: string;
}

export interface CourierLiveItem {
  readonly code: string;
  readonly name: string;
  readonly status: "online" | "offline" | "maintenance" | "error" | "unknown";
}

export interface SystemCouriersResult {
  readonly success: boolean;
  readonly couriers: readonly CourierLiveItem[];
  readonly checkedAt: string;
  readonly message?: string;
}
