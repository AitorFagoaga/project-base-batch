"use client";

import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { UserAvatar } from "@/components/UserAvatar";
import { ProjectCard } from "@/components/ProjectCard";
import { NetworkGuard } from "@/components/NetworkGuard";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { BoostForm } from "@/components/BoostForm";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { ReputationHistory } from "@/components/ReputationHistory";

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
    toast.success("¡Dirección copiada al portapapeles! 📋");
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
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <UserAvatar address={address} size="lg" showReputation={false} clickable={false} />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoadingProfile ? (
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                  ) : profile?.exists ? (
                    profile.name
                  ) : (
                    <span className="text-gray-600">Usuario sin perfil</span>
                  )}
                </h2>
                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                    title="Editar perfil"
                  >
                    ✏️ Editar Perfil
                  </Link>
                )}
              </div>

              {/* Address */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </span>
                <button
                  onClick={copyAddress}
                  className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  title="Copiar dirección completa"
                >
                  📋 Copiar
                </button>
                <a
                  href={`https://sepolia.basescan.org/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  🔍 BaseScan
                </a>
              </div>

              {/* Description */}
              {profile?.description && (
                <p className="text-gray-700 mb-4 max-w-2xl">{profile.description}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                {/* Reputation */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
                    <span className="text-white text-lg font-bold">⭐</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{reputation}</div>
                    <div className="text-xs text-gray-600 font-medium">Reputación</div>
                  </div>
                </div>

                {/* Projects Created */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <span className="text-white text-lg font-bold">🚀</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900" id="project-count">
                      0
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Proyectos</div>
                  </div>
                </div>
              </div>

              {/* Boost Button - Only show if not own profile and connected */}
              {!isOwnProfile && connectedAddress && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowBoostForm(!showBoostForm)}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
                  >
                    {showBoostForm ? "❌ Cancelar" : "⚡ Boost Usuario"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reputation History */}
        <ReputationHistory address={address as `0x${string}`} />

        {/* Boost Form - Show when button clicked */}
        {showBoostForm && !isOwnProfile && connectedAddress && (
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ⚡ Boost a {profile?.name || address.slice(0, 10)}
            </h3>
            <BoostForm targetUser={address as `0x${string}`} />
          </div>
        )}

        {/* User's Projects */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📂 Proyectos Creados
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
