"use client";

interface MedalQRProps {
  url: string;
  size?: number;
}

export function MedalQR({ url, size = 240 }: MedalQRProps) {
  const encoded = encodeURIComponent(url);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  return (
    <div className="inline-block p-3 rounded-xl border border-gray-200 bg-white">
      <img src={src} alt="QR para reclamar medalla" width={size} height={size} />
      <p className="mt-2 text-xs text-gray-500 break-all">{url}</p>
    </div>
  );
}

