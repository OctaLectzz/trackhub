"use client";

import * as React from "react";
import type { SellerStatus, TrackingItem } from "@/types/tracking";

const STORAGE_KEY = "trackhub:workspace:v1";

export interface TrackingWorkspaceHook {
  readonly items: readonly TrackingItem[];
  readonly isHydrated: boolean;
  readonly setItems: (items: readonly TrackingItem[]) => void;
  readonly appendItems: (newItems: readonly TrackingItem[]) => void;
  readonly updateItemStatus: (id: string, status: SellerStatus) => void;
  readonly clearWorkspace: () => void;
}

export function useTrackingWorkspace(): TrackingWorkspaceHook {
  const [items, setItemsState] = React.useState<readonly TrackingItem[]>([]);
  const [isHydrated, setIsHydrated] = React.useState<boolean>(false);

  // Load from localStorage after client mounts to avoid hydration mismatch
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TrackingItem[];
        if (Array.isArray(parsed)) {
          setItemsState(parsed);
        }
      }
    } catch (err) {
      console.warn("Failed to read workspace state from localStorage:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync back to localStorage whenever items change
  const saveToStorage = React.useCallback((updated: readonly TrackingItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to save workspace state to localStorage:", err);
    }
  }, []);

  const setItems = React.useCallback(
    (newItems: readonly TrackingItem[]) => {
      setItemsState(newItems);
      saveToStorage(newItems);
    },
    [saveToStorage]
  );

  const appendItems = React.useCallback(
    (newItems: readonly TrackingItem[]) => {
      setItemsState((prev) => {
        const combined = [...prev, ...newItems];
        saveToStorage(combined);
        return combined;
      });
    },
    [saveToStorage]
  );

  const updateItemStatus = React.useCallback(
    (id: string, status: SellerStatus) => {
      setItemsState((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, status } : item
        );
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const clearWorkspace = React.useCallback(() => {
    setItemsState([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Failed to clear localStorage:", err);
    }
  }, []);

  return {
    items,
    isHydrated,
    setItems,
    appendItems,
    updateItemStatus,
    clearWorkspace,
  };
}
