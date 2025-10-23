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

  // Check if user has already claimed this medal
  const { data: hasClaimed } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "hasClaimed",
    args: medalInfo && connectedAddress ? [BigInt(medalInfo.medalId), connectedAddress] : undefined,
    query: { enabled: !!medalInfo && !!connectedAddress },
  });

  // Check if medal is full (only if maxClaims > 0, otherwise infinite claims)
  const isMedalFull = medalsData && medalInfo ? (() => {
    const medals = medalsData as MedalData[];
    const medal = medals.find((m) => Number(m.id) === medalInfo.medalId);
    // Only full if maxClaims > 0 AND claimsCount >= maxClaims
    return medal && medal.maxClaims > 0 ? medal.claimsCount >= medal.maxClaims : false;
  })() : false;

  // Update medal info when contract data loads (FIX: use functional update to avoid infinite loop)
  useEffect(() => {
    if (eventData && medalsData) {
      const event = eventData as EventData;
      const medals = medalsData as MedalData[];
      
      setMedalInfo((prev) => {
        if (!prev) return prev;
        
        const medal = medals.find((m) => Number(m.id) === prev.medalId);
        
        if (event && medal) {
          // Only update if the titles are different (avoid unnecessary re-renders)
          if (prev.eventTitle !== event.title || prev.medalName !== medal.name) {
            return {
              ...prev,
              eventTitle: event.title,
              medalName: medal.name,
            };
          }
        }
        return prev;
      });
    }
  }, [eventData, medalsData]);

  useEffect(() => {
    if (!token) return;
    
    // Decode URL-safe base64 token (eventId:medalId:randomString)
    try {
      // Convert URL-safe base64 back to standard base64
      let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const decoded = atob(base64);
      const parts = decoded.split(":");
      
      if (parts.length >= 2) {
        const eventId = parseInt(parts[0], 10);
        const medalId = parseInt(parts[1], 10);
        
        if (isNaN(eventId) || isNaN(medalId)) {
          console.error("Token contains invalid IDs");
          return;
        }
        
        // Set basic info (will be loaded from contract)
        setMedalInfo({
          eventId,
          medalId,
          eventTitle: `Event #${eventId}`,
          medalName: `Badge #${medalId}`,
        });
      } else {
        console.error("Invalid token format");
      }
    } catch (e) {
      console.error("Invalid token", e);
    }
  }, [token]);

  useEffect(() => {
    if (isSuccess && connectedAddress) {
      toast.success("Badge claimed successfully!");
      setTimeout(() => {
        // Redirect to the user's profile page
        window.location.href = `/profile/${connectedAddress}`;
      }, 2000);
    }
  }, [isSuccess, connectedAddress]);

  const handleClaim = async () => {
    if (!connectedAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!medalInfo) {
      toast.error("Invalid token");
      return;
    }

    // Check if user already claimed
    if (hasClaimed) {
      toast.error("You have already claimed this badge");
      return;
    }

    // Check if user is the event creator
    if (eventData) {
      const event = eventData as EventData;
      if (event.creator.toLowerCase() === connectedAddress.toLowerCase()) {
        toast.error("Event creators cannot claim their own event badges");
        return;
      }
    }

    // Check if medal has available claims (only if maxClaims > 0)
    if (medalsData) {
      const medals = medalsData as MedalData[];
      const medal = medals.find((m) => Number(m.id) === medalInfo.medalId);
      
      if (medal && medal.maxClaims > 0) {
        if (medal.claimsCount >= medal.maxClaims) {
          toast.error("❌ This badge has reached its maximum claims and is no longer available");
          return;
        }
      }
    }

    try {
      writeContract({
        address: EVENT_MANAGER.address,
        abi: EVENT_MANAGER.abi,
        functionName: "claimMedal",
        args: [BigInt(medalInfo.medalId)],
      });
      toast.success("📝 Transaction sent");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Error claiming badge");
    }
  };

  if (!medalInfo) {
    return (
      <SharedPageLayout title="Claim Badge" description="Loading information...">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid token</h3>
          <p className="text-gray-600">The claim link is not valid or has expired.</p>
        </div>
      </SharedPageLayout>
    );
  }

  return (
    <SharedPageLayout 
      title="Claim Badge" 
      description={`Claim your badge from ${medalInfo.eventTitle}`}
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
                    ⚠️ <strong>Connect your wallet</strong> to claim this badge
                  </p>
                </div>
              ) : isMedalFull ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">
                    ❌ <strong>Badge unavailable!</strong> This badge has reached its maximum claims and is no longer available.
                  </p>
                </div>
              ) : hasClaimed ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">
                    ❌ <strong>Already claimed!</strong> You have already claimed this badge.
                  </p>
                </div>
              ) : eventData && (eventData as EventData).creator.toLowerCase() === connectedAddress.toLowerCase() ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900">
                    ❌ <strong>Cannot claim!</strong> Event creators cannot claim their own event badges.
                  </p>
                </div>
              ) : (
                <div className="text-left">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-600 block mb-1">
                      Claiming for:
                    </label>
                    <div className="font-mono text-sm text-gray-900 break-all">
                      {connectedAddress}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleClaim}
                disabled={
                  isPending || 
                  isConfirming || 
                  !connectedAddress ||
                  isMedalFull ||
                  hasClaimed || 
                  (eventData && (eventData as EventData).creator.toLowerCase() === connectedAddress.toLowerCase())
                }
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isConfirming ? "Claiming..." : "🏅 Claim Badge"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-800 font-semibold mb-1">
                  ✅ Badge claimed!
                </div>
                <p className="text-sm text-green-700">
                  Redirecting to your profile...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Important:</strong> You can only claim this badge once with this QR code.
          </p>
        </div>
      </div>
    </SharedPageLayout>
  );
}
