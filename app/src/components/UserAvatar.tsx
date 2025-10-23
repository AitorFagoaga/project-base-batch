"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "./Icon";

interface UserAvatarProps {
  address: string;
  size?: "sm" | "md" | "lg" | "xl";
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
    functionName: "reputationOf",
    args: [address as `0x${string}`],
    query: { enabled: showReputation },
  });

  const reputation = reputationData ? Number(reputationData) : 0;

  // Parse profile data
  const profile = profileData
    ? Array.isArray(profileData)
      ? {
          name: profileData[0] as string,
          description: profileData[1] as string,
          avatarUrl: profileData[2] as string,
          exists: profileData[3] as boolean,
        }
      : {
          name: (profileData as any).name || '',
          description: (profileData as any).description || '',
          avatarUrl: (profileData as any).avatarUrl || '',
          exists: (profileData as any).exists || false,
        }
    : null;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  };

  const pixelSizes = {
    sm: 32,
    md: 48,
    lg: 80,
    xl: 128,
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const displayName = profile?.exists && profile.name ? profile.name : shortAddress;

  // Use custom avatar if available, otherwise use generated one
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&bold=true&size=${pixelSizes[size]}`;
  const avatarUrl = profile?.exists && profile.avatarUrl
    ? profile.avatarUrl
    : defaultAvatar;

  const content = (
    <div className="relative inline-block group">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-3 ${
        size === "xl" ? "border-4" : "border-2"
      } border-white shadow-lg bg-gradient-to-br from-indigo-100 to-purple-100 transition-transform group-hover:scale-105`}>
        <Image
          src={avatarUrl}
          alt={displayName}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="object-cover w-full h-full"
          unoptimized
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = defaultAvatar;
          }}
        />
      </div>

      {showReputation && (
        <div
          className={`absolute ${size === "xl" ? "-bottom-2 -right-2" : "-bottom-1 -right-1"} bg-gradient-to-r from-purple-600 to-pink-600 rounded-full ${
            size === "xl" ? "px-3 py-1.5" : size === "lg" ? "px-2.5 py-1" : "px-2 py-0.5"
          } border-2 border-white shadow-lg flex items-center gap-1`}
          title={`Reputation: ${reputation} points`}
        >
          <Icon
            name="star"
            size={size === "xl" ? "sm" : "xs"}
            className="text-white"
          />
          <span className={`text-white font-bold ${size === "xl" ? "text-sm" : "text-xs"}`}>
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
        className="inline-block hover:opacity-90 transition-opacity"
        title={`View ${displayName}'s profile`}
      >
        {content}
      </Link>
    );
  }

  return content;
}
