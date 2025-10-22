"use client";

interface MedalQRProps {
  eventId: number;
  medalId: number;
  size?: number;
}

// Generate secure token: base64(eventId:medalId:randomString)
function generateToken(eventId: number, medalId: number): string {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15) +
                       Date.now().toString(36);
  const payload = `${eventId}:${medalId}:${randomString}`;
  return btoa(payload);
}

export function MedalQR({ eventId, medalId, size = 240 }: MedalQRProps) {
  const token = generateToken(eventId, medalId);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/claim/${token}`;
  const encoded = encodeURIComponent(url);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  
  return (
    <div className="inline-block p-3 rounded-xl border border-gray-200 bg-white">
      <img src={src} alt="QR para reclamar medalla" width={size} height={size} />
      <p className="mt-2 text-xs text-gray-500 text-center">
        Escanea para reclamar
      </p>
    </div>
  );
}


