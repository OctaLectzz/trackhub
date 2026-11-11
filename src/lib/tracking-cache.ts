import type { TrackingDetailResult } from "@/types/tracking";

const CACHE_STORAGE_KEY = "trackhub:tracking-cache:v1";
const DELIVERED_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days for terminal state
const ACTIVE_TTL_MS = 15 * 60 * 1000; // 15 minutes for active shipments
const MAX_CACHE_ENTRIES = 250;

interface CacheEntry {
  readonly result: TrackingDetailResult;
  readonly cachedAt: number;
  readonly expiresAt: number;
}

type CacheStore = Record<string, CacheEntry>;

function buildCacheKey(courier: string, awb: string, phoneLast5?: string): string {
  const cleanAwb = awb.trim().toUpperCase();
  const suffix = courier === "jne" && phoneLast5 ? `:${phoneLast5.trim()}` : "";
  return `${courier}:${cleanAwb}${suffix}`;
}

function readStore(): CacheStore {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as CacheStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: CacheStore): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota overflow gracefully
  }
}

export function getCachedTracking(
  courier: string,
  awb: string,
  phoneLast5?: string
): TrackingDetailResult | null {
  const key = buildCacheKey(courier, awb, phoneLast5);
  const store = readStore();
  const entry = store[key];

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    const nextStore = { ...store };
    delete nextStore[key];
    writeStore(nextStore);
    return null;
  }

  return {
    ...entry.result,
    cachedAt: entry.cachedAt,
  };
}

export function setCachedTracking(
  courier: string,
  awb: string,
  result: TrackingDetailResult,
  phoneLast5?: string
): void {
  if (!result.success) {
    return;
  }

  const now = Date.now();
  const isDelivered = result.summary.status.toUpperCase() === "DELIVERED";
  const ttl = isDelivered ? DELIVERED_TTL_MS : ACTIVE_TTL_MS;
  const key = buildCacheKey(courier, awb, phoneLast5);

  const store = readStore();
  const nextStore: CacheStore = { ...store };

  // Evict expired or oldest entries if capacity is exceeded
  const keys = Object.keys(nextStore);
  if (keys.length >= MAX_CACHE_ENTRIES) {
    const sorted = keys.sort((a, b) => nextStore[a].cachedAt - nextStore[b].cachedAt);
    const evictCount = Math.max(1, keys.length - MAX_CACHE_ENTRIES + 1);
    for (let i = 0; i < evictCount; i++) {
      delete nextStore[sorted[i]];
    }
  }

  nextStore[key] = {
    result: { ...result, cachedAt: now },
    cachedAt: now,
    expiresAt: now + ttl,
  };

  writeStore(nextStore);
}

export function removeCachedTracking(
  courier: string,
  awb: string,
  phoneLast5?: string
): void {
  const key = buildCacheKey(courier, awb, phoneLast5);
  const store = readStore();
  if (store[key]) {
    const nextStore = { ...store };
    delete nextStore[key];
    writeStore(nextStore);
  }
}
