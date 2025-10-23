"use client";

import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { UserAvatar } from "@/components/UserAvatar";
import { ProjectCard } from "@/components/ProjectCard";
import { NetworkGuard } from "@/components/NetworkGuard";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { BoostForm } from "@/components/BoostForm";
import { UserEvents } from "@/components/UserEvents";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ReputationHistory } from "@/components/ReputationHistory";
import { GenesisBreakdown } from "@/components/GenesisBreakdown";
import { Icon } from "@/components/Icon";
import { UserNFTGallery } from "@/components/UserNFTGallery";

interface PageProps {
  params: { address: string };
}

export default function ProfilePage({ params }: PageProps) {
  const { address } = params;
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const [showBoostForm, setShowBoostForm] = useState(false);
  const [createdCount, setCreatedCount] = useState<number | null>(null);

  const isOwnProfile = connectedAddress?.toLowerCase() === address.toLowerCase();

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("¡Dirección copiada al portapapeles!");
  };

  // Get user profile
  const { data: profileData, isLoading: isLoadingProfile } = useReadContract({
    address: CONTRACTS.userProfile.address,
    abi: CONTRACTS.userProfile.abi,
    functionName: "getProfile",
    args: [address as `0x${string}`],
  });

  // Get reputation
  const { data: reputationData } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: [address as `0x${string}`],
  });

  // Get total project count to iterate
  const { data: projectCount } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "projectCount",
  });

  // Parse profile data (handle both array and object return types)
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

  const reputation = reputationData ? Number(reputationData) : 0;
  const totalProjects = projectCount ? Number(projectCount) : 0;

  // Compute user's created project count via multicall
  if (publicClient && createdCount === null && totalProjects > 0) {
    (async () => {
      try {
        const calls = Array.from({ length: totalProjects }, (_, i) => ({
          address: CONTRACTS.launchpad.address as `0x${string}`,
          abi: CONTRACTS.launchpad.abi as any,
          functionName: "getProject" as const,
          args: [BigInt(i)],
        }));
        const res = await (publicClient as any).multicall({ contracts: calls, allowFailure: true });
        const cnt = res.reduce((acc: number, r: any) => {
          const v: any = r?.result;
          if (!v) return acc;
          const creator = (v.creator ?? v[1] ?? "").toString();
          return creator && creator.toLowerCase() === address.toLowerCase() ? acc + 1 : acc;
        }, 0);
        setCreatedCount(cnt);
      } catch {
        setCreatedCount(0);
      }
    })();
  }

  // Find user's projects
  const userProjects: number[] = [];
  for (let i = 0; i < totalProjects; i++) {
    userProjects.push(i);
  }

  const pageTitle = profile?.exists 
    ? `${profile.name}'s Profile`
    : address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}'s Profile`
    : "User Profile";

  const pageDescription = profile?.description 
    ? profile.description 
    : `Reputation: ${reputation} · View projects and boost this user`;

  return (
    <SharedPageLayout title={pageTitle} description={pageDescription}>
      <NetworkGuard>
        {/* Profile Header - Enhanced Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-2xl mb-8">
          <div className="bg-white rounded-xl p-8">
            <div className="flex flex-col md:flex-row items-start md:items-start gap-8">
              {/* Avatar - Larger and more prominent */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <UserAvatar address={address} size="xl" showReputation={true} clickable={false} />
              </div>

              {/* Profile Info */}
              <div className="flex-1 w-full">
                {/* Name and Edit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {isLoadingProfile ? (
                        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
                      ) : profile?.exists ? (
                        profile.name
                      ) : (
                        <span className="text-gray-500">Usuario sin perfil</span>
                      )}
                    </h1>
                    {/* Address with better styling */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 font-mono bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                        {address.slice(0, 10)}...{address.slice(-8)}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="rounded-lg bg-gray-50 hover:bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-all border border-gray-200 hover:border-gray-300 flex items-center gap-1.5"
                        title="Copiar dirección completa"
                      >
                        <Icon name="copy" size="xs" />
                      </button>
                      <a
                        href={`https://sepolia.basescan.org/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-indigo-50 hover:bg-indigo-100 px-3 py-2 text-xs font-medium text-indigo-700 transition-all border border-indigo-200 hover:border-indigo-300 flex items-center gap-1.5"
                      >
                        <Icon name="external" size="xs" />
                        Ver en BaseScan
                      </a>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <Link
                      href="/profile/edit"
                      className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                      title="Editar perfil"
                    >
                      <Icon name="edit" size="sm" />
                      Editar Perfil
                    </Link>
                  )}
                </div>

                {/* Description */}
                {profile?.description && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
                    <p className="text-gray-700 text-base leading-relaxed">{profile.description}</p>
                  </div>
                )}

                {/* Stats Grid - More prominent */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
                  {/* Reputation */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="absolute top-0 right-0 opacity-10">
                      <Icon name="star" size={64} className="text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">Reputación Total</div>
                      <div className="text-4xl font-bold">{reputation}</div>
                      <div className="text-xs opacity-75 mt-1">puntos acumulados</div>
                    </div>
                  </div>

                  {/* Projects Created */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="absolute top-0 right-0 opacity-10">
                      <Icon name="rocket" size={64} className="text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">Proyectos</div>
                      <div className="text-4xl font-bold">{createdCount ?? 0}</div>
                      <div className="text-xs opacity-75 mt-1">proyectos creados</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && connectedAddress && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBoostForm(!showBoostForm)}
                      className="flex-1 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-sm font-bold text-white transition-all hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      {showBoostForm ? (
                        <>
                          <Icon name="x" size="sm" />
                          Cancelar
                        </>
                      ) : (
                        <>
                          <Icon name="zap" size="sm" />
                          Dar Boost
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reputation History */}
        <ReputationHistory address={address as `0x${string}`} />

        {/* Reputation Breakdown */}
        <GenesisBreakdown address={address as `0x${string}`} />

        {/* NFT Gallery */}
        <UserNFTGallery address={address as `0x${string}`} isOwnProfile={isOwnProfile} />

        {/* Boost Form - Show when button clicked */}
        {showBoostForm && !isOwnProfile && connectedAddress && (
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="zap" size="lg" className="text-yellow-500" />
              Boost a {profile?.name || address.slice(0, 10)}
            </h3>
            <BoostForm targetUser={address as `0x${string}`} />
          </div>
        )}

        {/* User's Projects */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Icon name="folder" size="lg" className="text-indigo-600" />
            Proyectos Creados
          </h2>
          {createdCount !== null && <p className="text-sm text-gray-500 mb-4">Total: {createdCount}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((projectId) => (
              <UserProjectCard
                key={projectId}
                projectId={projectId}
                creatorAddress={address}
              />
            ))}
          </div>
        </div>

        {/* User's Events */}
        <div className="mb-10">
          <UserEvents userAddress={address as `0x${string}`} />
        </div>
      </NetworkGuard>
    </SharedPageLayout>
  );
}

// Component to render individual project cards for this user
function UserProjectCard({ projectId, creatorAddress }: { projectId: number; creatorAddress: string }) {
  const { data: projectData } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getProject",
    args: [BigInt(projectId)],
  });

  const { data: creatorReputation } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: [creatorAddress as `0x${string}`],
  });

  if (!projectData) return null;

  // Handle both object and array format from viem
  let project;
  
  if (Array.isArray(projectData)) {
    // Array format
    const data = projectData as [bigint, string, string, string, string, bigint, bigint, bigint, boolean, readonly string[]];
    project = {
      id: data[0],
      creator: data[1],
      title: data[2],
      description: data[3] || '',
      imageUrl: data[4] || '',
      goal: data[5],
      deadline: data[6],
      fundsRaised: data[7],
      claimed: data[8] || false,
      cofounders: data[9] || [],
    };
  } else {
    // Object format (viem v2 returns objects)
    const data = projectData as {
      id: bigint;
      creator: string;
      title: string;
      description: string;
      imageUrl: string;
      goal: bigint;
      deadline: bigint;
      fundsRaised: bigint;
      claimed: boolean;
      cofounders: readonly string[];
    };
    project = {
      id: data.id,
      creator: data.creator,
      title: data.title,
      description: data.description ?? '',
      imageUrl: data.imageUrl ?? '',
      goal: data.goal,
      deadline: data.deadline,
      fundsRaised: data.fundsRaised ?? BigInt(0),
      claimed: data.claimed ?? false,
      cofounders: data.cofounders ?? [],
    };
  }

  // Validate required fields
  if (!project.creator || !project.title || project.goal === undefined) {
    console.error('Missing required project fields:', projectData);
    return null;
  }

  // Only show projects created by this user
  if (project.creator.toLowerCase() !== creatorAddress.toLowerCase()) {
    return null;
  }

  // Safe conversion of reputation to BigInt
  let reputationValue = BigInt(0);
  if (creatorReputation) {
    try {
      if (typeof creatorReputation === 'bigint') {
        reputationValue = creatorReputation;
      } else if (typeof creatorReputation === 'number') {
        reputationValue = BigInt(creatorReputation);
      } else if (typeof creatorReputation === 'string') {
        reputationValue = BigInt(creatorReputation);
      } else {
        reputationValue = BigInt(String(creatorReputation));
      }
    } catch (e) {
      console.error('Error converting reputation:', e);
      reputationValue = BigInt(0);
    }
  }

  return (
    <ProjectCard
      project={project}
      creatorReputation={reputationValue}
      isLoadingReputation={false}
    />
  );
}
