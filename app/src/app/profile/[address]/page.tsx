"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { UserAvatar } from "@/components/UserAvatar";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ProjectCard } from "@/components/ProjectCard";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useState } from "react";

interface PageProps {
  params: { address: string };
}

export default function ProfilePage({ params }: PageProps) {
  const { address } = params;
  const { address: connectedAddress } = useAccount();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwnProfile = connectedAddress?.toLowerCase() === address.toLowerCase();

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

  const profile = profileData
    ? {
        name: profileData[0] as string,
        description: profileData[1] as string,
        avatarUrl: profileData[2] as string,
        exists: profileData[3] as boolean,
      }
    : null;

  const reputation = reputationData ? Number(reputationData) : 0;
  const totalProjects = projectCount ? Number(projectCount) : 0;

  // Find user's projects
  const userProjects: number[] = [];
  for (let i = 0; i < totalProjects; i++) {
    userProjects.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NetworkGuard>
          {/* Profile Header */}
          <div className="glass-card mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <UserAvatar address={address} size="lg" showReputation={false} clickable={false} />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isLoadingProfile ? (
                      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    ) : profile?.exists ? (
                      profile.name
                    ) : (
                      <span className="text-gray-600">Usuario sin perfil</span>
                    )}
                  </h1>
                  {isOwnProfile && (
                    <>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="btn-secondary text-sm"
                        title="Editar perfil (modal rápido)"
                      >
                        ✏️ Editar
                      </button>
                      <Link
                        href="/profile/edit"
                        className="btn-primary text-sm"
                        title="Editar perfil (página completa)"
                      >
                        📝 Editar Perfil
                      </Link>
                    </>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-600 font-mono">
                    {address.slice(0, 10)}...{address.slice(-8)}
                  </span>
                  <a
                    href={`https://sepolia.basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    🔍 Ver en BaseScan
                  </a>
                </div>

                {/* Description */}
                {profile?.description && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{profile.description}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  {/* Reputation */}
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
                      <span className="text-white text-sm font-bold">⭐</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{reputation}</div>
                      <div className="text-xs text-gray-600">Reputación</div>
                    </div>
                  </div>

                  {/* Projects Created (will be calculated below) */}
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-2">
                      <span className="text-white text-sm font-bold">🚀</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900" id="project-count">
                        0
                      </div>
                      <div className="text-xs text-gray-600">Proyectos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User's Projects */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📂 Proyectos Creados
            </h2>
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
      </main>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={profile || undefined}
          userAddress={address}
        />
      )}
    </div>
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
