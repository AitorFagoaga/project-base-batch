"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { EVENT_MANAGER } from "@/lib/eventManager";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import toast from "react-hot-toast";

interface EventData {
  id: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  location: string;
  datetime: bigint;
  timeText: string;
  status: number;
  rejectReason: string;
}

interface MedalData {
  id: bigint;
  eventId: bigint;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  maxClaims: number;
  claimsCount: number;
  active: boolean;
}

export default function ClaimMedalPage() {
  const params = useParams();
  const token = params?.token as string;
  const { address: connectedAddress } = useAccount();
  const [medalInfo, setMedalInfo] = useState<{
    eventId: number;
    medalId: number;
    eventTitle: string;
    medalName: string;
  } | null>(null);

  // Load event data from contract
  const { data: eventData } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "getEvent",
    args: medalInfo ? [BigInt(medalInfo.eventId)] : undefined,
    query: { enabled: !!medalInfo },
  });

  // Load medal data from contract
  const { data: medalsData } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "getEventMedals",
    args: medalInfo ? [BigInt(medalInfo.eventId)] : undefined,
    query: { enabled: !!medalInfo },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Update medal info when contract data loads
  useEffect(() => {
    if (eventData && medalsData && medalInfo) {
      const event = eventData as EventData;
      const medals = medalsData as MedalData[];
      const medal = medals.find((m) => Number(m.id) === medalInfo.medalId);
      
      if (event && medal) {
        setMedalInfo({
          ...medalInfo,
          eventTitle: event.title,
          medalName: medal.name,
        });
      }
    }
  }, [eventData, medalsData, medalInfo]);

  useEffect(() => {
    if (!token) return;
    
    // Decode token (eventId:medalId:randomString)
    try {
      // Decode the token safely
      const decoded = decodeURIComponent(atob(token));
      const parts = decoded.split(":");
      
      if (parts.length >= 2) {
        const eventId = parseInt(parts[0], 10);
        const medalId = parseInt(parts[1], 10);
        
        if (isNaN(eventId) || isNaN(medalId)) {
          console.error("Token contiene IDs inválidos");
          return;
        }
        
        // Set basic info (will be loaded from contract)
        setMedalInfo({
          eventId,
          medalId,
          eventTitle: `Evento #${eventId}`,
          medalName: `Medalla #${medalId}`,
        });
      } else {
        console.error("Token con formato incorrecto");
      }
    } catch (e) {
      console.error("Token inválido", e);
    }
  }, [token]);

  useEffect(() => {
    if (isSuccess && connectedAddress) {
      toast.success("¡Medalla reclamada exitosamente!");
      setTimeout(() => {
        // Redirect to the user's profile page
        window.location.href = `/profile/${connectedAddress}`;
      }, 2000);
    }
  }, [isSuccess, connectedAddress]);

  const handleClaim = async () => {
    if (!connectedAddress) {
      toast.error("Por favor conecta tu wallet primero");
      return;
    }

    if (!medalInfo) {
      toast.error("Token inválido");
      return;
    }

    try {
      writeContract({
        address: EVENT_MANAGER.address,
        abi: EVENT_MANAGER.abi,
        functionName: "claimMedal",
        args: [BigInt(medalInfo.medalId)],
      });
      toast.success("📝 Transacción enviada");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Error al reclamar medalla");
    }
  };

  if (!medalInfo) {
    return (
      <SharedPageLayout title="Reclamar Medalla" description="Cargando información...">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Token inválido</h3>
          <p className="text-gray-600">El enlace de reclamación no es válido o ha expirado.</p>
        </div>
      </SharedPageLayout>
    );
  }

  return (
    <SharedPageLayout 
      title="Reclamar Medalla" 
      description={`Reclama tu medalla del evento ${medalInfo.eventTitle}`}
    >
      <div className="max-w-md mx-auto">
        <div className="card p-8 text-center space-y-6">
          <div className="text-6xl">🏅</div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {medalInfo.medalName}
            </h2>
            <p className="text-gray-600">
              {medalInfo.eventTitle}
            </p>
          </div>

          {!isSuccess ? (
            <>
              {!connectedAddress ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    ⚠️ <strong>Conecta tu wallet</strong> para reclamar esta medalla
                  </p>
                </div>
              ) : (
                <div className="text-left">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-600 block mb-1">
                      Reclamando para:
                    </label>
                    <div className="font-mono text-sm text-gray-900 break-all">
                      {connectedAddress}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={isPending || isConfirming || !connectedAddress}
                className="btn-primary w-full"
              >
                {isPending || isConfirming ? "Reclamando..." : "🏅 Reclamar Medalla"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800 font-semibold mb-1">
                  ✅ ¡Medalla reclamada!
                </div>
                <p className="text-sm text-green-700">
                  Redirigiendo a tu perfil...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Importante:</strong> Solo podrás reclamar esta medalla una vez con este QR.
          </p>
        </div>
      </div>
    </SharedPageLayout>
  );
}
