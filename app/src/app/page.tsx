"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ProjectCard } from "@/components/ProjectCard";
import { NetworkGuard } from "@/components/NetworkGuard";
import { LoadingSkeleton, EmptyState } from "@/components/UIComponents";
import { useIsContractOwner } from "@/hooks/useIsContractOwner";
import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
export default function Home() {
  // Check if user is contract owner
  const { isOwner } = useIsContractOwner();

  // Read total project count
  const { data: projectCount } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "projectCount",
  });

  const totalProjects = projectCount ? Number(projectCount) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="glass-card border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 drop-shadow-sm">
                🚀 Meritocratic Launchpad
              </h1>
              <p className="text-gray-800 mt-1 font-medium">
                Reputation-based crowdfunding on Base Sepolia
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass-card border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            <Link
              href="/"
              className="text-gray-900 font-bold bg-white/40 px-4 py-2 rounded-lg shadow-md scale-105"
            >
              📊 Projects
            </Link>
            <Link
              href="/create"
              className="text-gray-800 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/20"
            >
              ✨ Create Project
            </Link>
            <Link
              href="/reputation"
              className="text-gray-800 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/20"
            >
              ⭐ Reputation
            </Link>
            {isOwner && (
              <Link
                href="/admin"
                className="text-gray-800 hover:text-gray-900 font-medium transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/20"
              >
                👑 Admin
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NetworkGuard>
          <div className="mb-10 text-center animate-fadeIn">
            <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm mb-3">
              Active Projects
            </h2>
            <p className="text-gray-800 text-lg font-medium">
              {totalProjects > 0 ? (
                <>{totalProjects} project{totalProjects > 1 ? 's' : ''} launched · Fund projects backed by verified reputation</>
              ) : (
                <>Be the first to launch a project on the Meritocratic Launchpad</>
              )}
            </p>
          </div>

          {totalProjects === 0 ? (
            <EmptyState
              title="No Projects Yet"
              description="Be the first to launch a project on our reputation-based crowdfunding platform. Connect your wallet and create your project now!"
              action={
                <Link href="/create" className="btn-primary inline-block">
                  🚀 Launch the First Project
                </Link>
              }
            />
          ) : (
            <ProjectList count={totalProjects} />
          )}
        </NetworkGuard>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            Built on Base Sepolia · Open Source
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Component to render all projects (optimized with loading states)
 */
function ProjectList({ count }: { count: number }) {
  const projectIds = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Loading {count} projects...
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectIds.map((id) => (
          <ProjectWithReputation key={id} projectId={BigInt(id)} />
        ))}
      </div>
    </>
  );
}

/**
 * Component that fetches project + creator reputation (optimized with error handling)
 */
function ProjectWithReputation({ projectId }: { projectId: bigint }) {
  const { data: projectData, isLoading: projectLoading, error: projectError } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getProject",
    args: [projectId],
  });

  // Extract creator address from project data
  const creatorAddress = projectData 
    ? (projectData as [bigint, string, string, string, string, bigint, bigint, bigint, boolean, readonly string[]])[1]
    : undefined;

  const { data: reputation, isLoading: repLoading } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: creatorAddress ? [creatorAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!creatorAddress, // Only fetch reputation if project loaded
    },
  });

  if (projectError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">Error loading project #{projectId.toString()}</p>
      </div>
    );
  }

  if (projectLoading || !projectData) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

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
    const data = projectData as any;
    project = {
      id: data.id ?? data[0],
      creator: data.creator ?? data[1],
      title: data.title ?? data[2],
      description: data.description ?? data[3] ?? '',
      imageUrl: data.imageUrl ?? data[4] ?? '',
      goal: data.goal ?? data[5],
      deadline: data.deadline ?? data[6],
      fundsRaised: data.fundsRaised ?? data[7] ?? BigInt(0),
      claimed: data.claimed ?? data[8] ?? false,
      cofounders: data.cofounders ?? data[9] ?? [],
    };
  }

  // Validate required fields
  if (!project.creator || !project.title || project.goal === undefined || project.deadline === undefined) {
    console.error('Missing required project fields:', projectData);
    return null;
  }

  // Safe conversion of reputation to BigInt
  let reputationValue = BigInt(0);
  if (reputation) {
    try {
      if (typeof reputation === 'bigint') {
        reputationValue = reputation;
      } else if (typeof reputation === 'number') {
        reputationValue = BigInt(reputation);
      } else if (typeof reputation === 'string') {
        reputationValue = BigInt(reputation);
      } else {
        reputationValue = BigInt(String(reputation));
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
      isLoadingReputation={repLoading}
    />
  );
}
