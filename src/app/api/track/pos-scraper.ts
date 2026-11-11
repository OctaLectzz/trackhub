import type { TrackingDetailResult, TrackingHistoryItem } from "@/types/tracking";
import { createEmptySummary } from "./track-helpers";

export async function fetchPosIndonesiaDirect(awb: string): Promise<TrackingDetailResult> {
  const url = `https://kibananew.posindonesia.co.id:4433/x123449/xhdhhdencript12092003posaja.php?id=${encodeURIComponent(
    awb.trim()
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(4500),
  });

  const html = await res.text();

  if (!html.includes("tracking-item") && !html.includes("tracking-list")) {
    return {
      success: false,
      message: "Resi Pos Indonesia tidak ditemukan pada database PosAja",
      summary: createEmptySummary(awb, "pos"),
      history: [],
    };
  }

  const shipperMatch = /<th[^>]*>Pengirim<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i.exec(html);
  const rawShipper = shipperMatch ? cleanHtml(shipperMatch[1]) : "";

  const receiverMatch = /<th[^>]*>Penerima<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/i.exec(html);
  const rawReceiver = receiverMatch ? cleanHtml(receiverMatch[1]) : "";

  const coordMatch = /Koordinat Penerima[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i.exec(html);
  const rawCoord = coordMatch ? cleanHtml(coordMatch[1]) : "";

  const shipperParsed = parseEntityString(rawShipper);
  const receiverParsed = parseEntityString(rawReceiver);

  const history: TrackingHistoryItem[] = [];
  const itemRegex =
    /<div class="tracking-date">([\s\S]*?)<\/div>[\s\S]*?<div class="tracking-content">([\s\S]*?)<\/div>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = itemRegex.exec(html)) !== null) {
    history.push({
      date: match[1].trim(),
      desc: match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      location: "",
    });
  }

  const photoRegex = /href="(https:\/\/apistorage\.mile\.app\/[^"]+)"/gi;
  const podPhotos: string[] = [];
  let photoMatch: RegExpExecArray | null = null;
  while ((photoMatch = photoRegex.exec(html)) !== null) {
    if (!podPhotos.includes(photoMatch[1])) {
      podPhotos.push(photoMatch[1]);
    }
  }

  const isDelivered = html.includes("DELIVERED") || html.includes("telah diterima");

  return {
    success: true,
    summary: {
      awb,
      courier: "Pos Indonesia",
      service: "Pos Reguler / PosAja",
      status: isDelivered ? "DELIVERED" : "ON PROCESS",
      date: history[0]?.date ?? "-",
      weight: "-",
      origin: shipperParsed.address || "-",
      destination: receiverParsed.address || "-",
      shipperName: shipperParsed.name || "-",
      shipperPhone: shipperParsed.phone || "-",
      shipperAddress: shipperParsed.address || "-",
      receiverName: receiverParsed.name || "-",
      receiverPhone: receiverParsed.phone || "-",
      receiverAddress: receiverParsed.address || "-",
      coordinates: rawCoord || undefined,
    },
    history: [...history].reverse(),
    podPhotos,
  };
}

function cleanHtml(raw: string): string {
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function parseEntityString(raw: string): {
  readonly name: string;
  readonly phone: string;
  readonly address: string;
} {
  const phoneIdx = raw.indexOf("Phone Number :");
  const alamatIdx = raw.indexOf("Alamat :");

  if (phoneIdx === -1 && alamatIdx === -1) {
    const cleanRaw = raw.replace(/,+$/, "").trim();
    return { name: cleanRaw || "-", phone: "-", address: "-" };
  }

  let name = "";
  let phone = "-";
  let address = "-";

  if (phoneIdx !== -1) {
    name = raw.slice(0, phoneIdx).replace(/,+$/, "").trim();
    if (alamatIdx !== -1) {
      phone = raw.slice(phoneIdx + 14, alamatIdx).replace(/,+$/, "").trim();
      address = raw.slice(alamatIdx + 8).replace(/,+$/, "").trim();
    } else {
      phone = raw.slice(phoneIdx + 14).replace(/,+$/, "").trim();
    }
  } else if (alamatIdx !== -1) {
    name = raw.slice(0, alamatIdx).replace(/,+$/, "").trim();
    address = raw.slice(alamatIdx + 8).replace(/,+$/, "").trim();
  }

  return {
    name: name || "-",
    phone: phone || "-",
    address: address || "-",
  };
}
