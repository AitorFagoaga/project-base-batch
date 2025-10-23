"use client";

interface MedalQRProps {
  eventId: number;
  medalId: number;
  size?: number;
}

// Generate secure token: base64url(eventId:medalId:randomString)
function generateToken(eventId: number, medalId: number): string {
  const randomString = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15) +
                       Date.now().toString(36);
  const payload = `${eventId}:${medalId}:${randomString}`;
  // Use URL-safe base64 encoding (replace +, /, = chars)
  return btoa(payload)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function MedalQR({ eventId, medalId, size = 240 }: MedalQRProps) {
  const token = generateToken(eventId, medalId);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/claim/${token}`;
  const encoded = encodeURIComponent(url);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
  
  return (
    <div className="inline-block p-3 rounded-xl border border-gray-200 bg-white">
      <img src={src} alt="QR to claim badge" width={size} height={size} />
      <p className="mt-2 text-xs text-gray-500 text-center">
        Scan to claim
      </p>
    </div>
  );
}


