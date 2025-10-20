"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import Link from "next/link";
import Image from "next/image";

interface UserAvatarProps {
  address: string;
  size?: "sm" | "md" | "lg";
  showReputation?: boolean;
  clickable?: boolean;
}

export function UserAvatar({ 
  address, 
  size = "md", 
  showReputation = false,
  clickable = true 
}: UserAvatarProps) {
  // Get user profile
  const { data: profileData } = useReadContract({
    address: CONTRACTS.userProfile.address,
    abi: CONTRACTS.userProfile.abi,
    functionName: "getProfile",
    args: [address as `0x${string}`],
  });

  // Get reputation if needed
  const { data: reputationData } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "getReputation",
    args: [address as `0x${string}`],
    query: { enabled: showReputation },
  });

  const profile = profileData ? {
    name: profileData[0] as string,
    description: profileData[1] as string,
    avatarUrl: profileData[2] as string,
    exists: profileData[3] as boolean,
  } : null;

  const reputation = reputationData ? Number(reputationData) : 0;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const avatarUrl = profile?.avatarUrl || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || address.slice(0, 6))}&background=random`;

  const content = (
    <div className="relative inline-block">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-lg bg-white`}>
        <Image
          src={avatarUrl}
          alt={profile?.name || address.slice(0, 6)}
          width={size === "sm" ? 32 : size === "md" ? 48 : 64}
          height={size === "sm" ? 32 : size === "md" ? 48 : 64}
          className="object-cover w-full h-full"
          unoptimized
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(address.slice(0, 6))}&background=6366f1`;
          }}
        />
      </div>
      
      {showReputation && (
        <div 
          className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-2 py-0.5 border-2 border-white shadow-md"
          title={`Reputación: ${reputation} puntos`}
        >
          <span className="text-white text-xs font-bold">
            {reputation >= 1000 ? `${(reputation / 1000).toFixed(1)}k` : reputation}
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link 
        href={`/profile/${address}`}
        className="inline-block hover:opacity-80 transition-opacity"
        title={profile?.name || `Ver perfil de ${address.slice(0, 6)}`}
      >
        {content}
      </Link>
    );
  }

  return content;
}
