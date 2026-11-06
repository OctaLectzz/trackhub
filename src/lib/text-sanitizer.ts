import type { CourierId, SanitizeResult, TrackingItem } from "@/types/tracking";
import { detectCourier, generateTrackingUrls } from "@/lib/courier-registry";

function generateDeterministicId(waybill: string, index: number): string {
  const clean = waybill.replace(/[^A-Z0-9]/gi, "").toLowerCase();
  return `${clean}-${Date.now().toString(36)}-${index}`;
}

export function sanitizeBulkWaybills(
  rawInput: string,
  forcedCourier?: CourierId
): SanitizeResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      items: [],
      rawCount: 0,
      uniqueCount: 0,
      duplicateCount: 0,
    };
  }

  // 1. Split by lines first
  const lines = rawInput.split(/\r?\n/);
  const seenWaybills = new Set<string>();
  const items: TrackingItem[] = [];

  let rawCount = 0;
  let duplicateCount = 0;

  for (const line of lines) {
    // 2. Further split lines by commas, semicolons, or tabs
    const lineTokens = line.split(/[,;\t]/);

    for (const token of lineTokens) {
      // 3. Extract the primary alphanumeric candidate, stripping trailing parentheses/notes like "(duplicate)"
      const strippedNote = token.replace(/\(.*\)/g, "");

      // Match contiguous alphanumeric sequence of at least 5 chars
      const matches = strippedNote.match(/[A-Za-z0-9]{5,}/g);
      if (!matches) {
        continue;
      }

      for (const candidate of matches) {
        const cleaned = candidate.trim();
        rawCount++;

        const normalizedKey = cleaned.toUpperCase();
        if (seenWaybills.has(normalizedKey)) {
          duplicateCount++;
          continue;
        }

        seenWaybills.add(normalizedKey);

        const courier =
          forcedCourier && forcedCourier !== "unknown"
            ? forcedCourier
            : detectCourier(cleaned);

        const urls = generateTrackingUrls(cleaned, courier);

        const newItem: TrackingItem = {
          id: generateDeterministicId(cleaned, items.length),
          waybill: cleaned,
          courier,
          officialUrl: urls.officialUrl,
          mirrorUrl: urls.mirrorUrl,
          status: "pending",
          note: "",
          createdAt: new Date().toISOString(),
        };

        items.push(newItem);
      }
    }
  }

  return {
    items,
    rawCount,
    uniqueCount: items.length,
    duplicateCount,
  };
}
