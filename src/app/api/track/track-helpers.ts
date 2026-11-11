import type {
  TrackingDetailResult,
  TrackingHistoryItem,
  TrackingDetailSummary,
} from "@/types/tracking";

export { fetchPosIndonesiaDirect } from "./pos-scraper";

const BINDERBYTE_COURIER_MAP: Readonly<Record<string, string>> = {
  pos: "pos",
  jnt: "jnt",
  sicepat: "sicepat",
  spx: "spx",
  jne: "jne",
  anteraja: "anteraja",
  tiki: "tiki",
  wahana: "wahana",
  rpx: "rpx",
  lion: "lion",
  ninja: "ninja",
  pcp: "pcp",
  jet: "jet",
  rex: "rex",
  first: "first",
  ide: "ide",
  idexpress: "ide",
  kgx: "kgx",
  sap: "sap",
  jxe: "jxe",
  jnt_cargo: "jnt_cargo",
  lex: "lex",
  indah_cargo: "indah_cargo",
  dakota: "dakota",
  ant_cargo: "ant_cargo",
  next_logistik: "next_logistik",
  gtl: "gtl",
  kurir_tokopedia: "kurir_tokopedia",
  laris_cargo: "laris_cargo",
};

export function getBinderByteBaseUrl(): string {
  const envUrl = process.env.BINDERBYTE_URL;
  if (!envUrl || !envUrl.trim()) {
    return "https://api.binderbyte.com";
  }
  return envUrl.trim().replace(/\/+$/, "");
}

interface BinderByteApiResponse {
  readonly status: number;
  readonly message: string;
  readonly data?: {
    readonly summary?: {
      readonly awb?: string;
      readonly courier?: string;
      readonly service?: string;
      readonly status?: string;
      readonly date?: string;
      readonly weight?: string | number;
      readonly amount?: string | number;
      readonly desc?: string;
    };
    readonly detail?: {
      readonly origin?: string;
      readonly destination?: string;
      readonly shipper?: string;
      readonly receiver?: string;
    };
    readonly history?: readonly {
      readonly date?: string;
      readonly desc?: string;
      readonly location?: string;
    }[];
  };
}

export async function fetchBinderByteTracking(
  apiKey: string,
  courier: string,
  awb: string,
  phoneNumber?: string,
  transactionDate?: string
): Promise<TrackingDetailResult> {
  const bbCourier = BINDERBYTE_COURIER_MAP[courier] ?? courier;
  const baseUrl = getBinderByteBaseUrl();

  const queryParams = new URLSearchParams({
    api_key: apiKey.trim(),
    courier: bbCourier,
    awb: awb.trim(),
  });

  if (bbCourier === "jne" && phoneNumber && phoneNumber.trim()) {
    queryParams.set("number", phoneNumber.trim());
  }

  if (bbCourier === "laris_cargo" && transactionDate && transactionDate.trim()) {
    queryParams.set("date", transactionDate.trim());
  }

  const endpointUrl = `${baseUrl}/v1/track?${queryParams.toString()}`;

  try {
    const res = await fetch(endpointUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6500),
    });

    const json = (await res.json()) as BinderByteApiResponse;

    if (json.status !== 200 || !json.data) {
      return {
        success: false,
        message: json.message || "Data resi tidak ditemukan pada server kurir",
        summary: createEmptySummary(awb, courier),
        history: [],
      };
    }

    const data = json.data;
    const historyList: TrackingHistoryItem[] = (data.history ?? []).map((h) => ({
      date: h.date ?? "",
      desc: h.desc ?? "",
      location: h.location ?? "",
    }));

    const rawWeight = data.summary?.weight;
    const weightDisplay =
      typeof rawWeight === "number"
        ? `${rawWeight} Kg`
        : rawWeight && rawWeight !== "-"
          ? String(rawWeight)
          : "-";

    const rawAmount = data.summary?.amount;
    const amountDisplay =
      rawAmount && rawAmount !== "-" && rawAmount !== ""
        ? String(rawAmount)
        : undefined;

    return {
      success: true,
      summary: {
        awb: data.summary?.awb ?? awb,
        courier: data.summary?.courier ?? courier,
        service: data.summary?.service || "-",
        status: (data.summary?.status ?? "ON PROCESS").toUpperCase(),
        date: data.summary?.date ?? "-",
        weight: weightDisplay,
        amount: amountDisplay,
        origin: data.detail?.origin ?? "-",
        destination: data.detail?.destination ?? "-",
        shipperName: data.detail?.shipper ?? "-",
        shipperPhone: "-",
        shipperAddress: data.detail?.origin ?? "-",
        receiverName: data.detail?.receiver ?? "-",
        receiverPhone: "-",
        receiverAddress: data.detail?.destination ?? "-",
      },
      history: historyList,
    };
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    const errorMsg = isTimeout
      ? "Koneksi ke gateway BinderByte batas waktu (timeout)"
      : err instanceof Error
        ? err.message
        : "Network error";

    return {
      success: false,
      message: `Gagal memuat API: ${errorMsg}`,
      summary: createEmptySummary(awb, courier),
      history: [],
    };
  }
}

export function createEmptySummary(awb: string, courier: string): TrackingDetailSummary {
  return {
    awb,
    courier,
    service: "-",
    status: "UNKNOWN",
    date: "-",
    weight: "-",
    origin: "-",
    destination: "-",
    shipperName: "-",
    shipperPhone: "-",
    shipperAddress: "-",
    receiverName: "-",
    receiverPhone: "-",
    receiverAddress: "-",
  };
}
