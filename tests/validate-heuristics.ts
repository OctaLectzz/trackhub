import { detectCourier, generateTrackingUrls } from "../src/lib/courier-registry";
import { sanitizeBulkWaybills } from "../src/lib/text-sanitizer";

interface TestCase {
  readonly input: string;
  readonly expectedCourier: string;
}

const TEST_CASES: readonly TestCase[] = [
  { input: "P2601080046258", expectedCourier: "pos" },
  { input: "P2509120011223", expectedCourier: "pos" },
  { input: "12345678901", expectedCourier: "pos" }, // 11 digits standard PosIND
  { input: "JP5034350637", expectedCourier: "jnt" },
  { input: "JX6877225553", expectedCourier: "jnt" },
  { input: "JB0033526964", expectedCourier: "jnt" },
  { input: "002727224890", expectedCourier: "sicepat" },
  { input: "001442365534", expectedCourier: "sicepat" },
  { input: "SPXID04829103847", expectedCourier: "spx" },
  { input: "1000293847162", expectedCourier: "anteraja" },
  { input: "LP12345678901", expectedCourier: "lion" },
  { input: "NINJAXP928374", expectedCourier: "ninja" },
  { input: "IDS001234567890", expectedCourier: "idexpress" },
  { input: "SOCAG001234567", expectedCourier: "jne" },
  { input: "0123456789012345", expectedCourier: "jne" },
  { input: "661234567890", expectedCourier: "tiki" },
  { input: "W1234567", expectedCourier: "wahana" },
];

console.log("=== RUNNING HEURISTIC COURIER DETECTOR TESTS ===");
let passedCount = 0;

for (const test of TEST_CASES) {
  const detected = detectCourier(test.input);
  if (detected === test.expectedCourier) {
    passedCount++;
  } else {
    console.error(
      `[FAIL] Input: ${test.input} => Expected: ${test.expectedCourier}, Got: ${detected}`
    );
  }
}

console.log(`Detector Results: ${passedCount}/${TEST_CASES.length} Passed`);

console.log("\n=== RUNNING TEXT SANITIZER & DEDUPLICATION TESTS ===");
const rawDirtySample = `
  # P2601080046258
  P2601080046258 (duplicate)
  JP5034350637, 002727224890 ; SPXID04829103847
  
  "SOCAG001234567"
  • 1000293847162
  JP5034350637 (duplicate)
  xyz (too short)
`;

const sanitizeResult = sanitizeBulkWaybills(rawDirtySample);

console.log(`Raw valid tokens parsed: ${sanitizeResult.rawCount}`);
console.log(`Unique items: ${sanitizeResult.uniqueCount}`);
console.log(`Duplicates removed: ${sanitizeResult.duplicateCount}`);

const urlsPos = generateTrackingUrls("P2601080046258", "pos");
console.log(`PosIND Official POD URL: ${urlsPos.officialUrl}`);
console.log(`PosIND Mirror URL: ${urlsPos.mirrorUrl}`);

if (
  passedCount === TEST_CASES.length &&
  sanitizeResult.uniqueCount === 6 &&
  sanitizeResult.duplicateCount === 2 &&
  urlsPos.officialUrl.includes("kibananew.posindonesia.co.id:4433")
) {
  console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY (100% ACCURACY) <<<");
} else {
  console.error("\n>>> TESTS FAILED INTEGRITY CHECK <<<");
  process.exit(1);
}
