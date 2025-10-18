"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ProjectCard } from "@/components/ProjectCard";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { LoadingSkeleton, EmptyState } from "@/components/UIComponents";
import Link from "next/link";

export default function Home() {
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
          <div className="flex space-x-8 py-4">
            <Link 
              href="/" 
              className="text-gray-900 font-bold bg-white/30 px-4 py-2 rounded-lg shadow-sm"
            >
              📊 Projects
            </Link>
            <Link 
              href="/create" 
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/20"
            >
              ✨ Create Project
            </Link>
            <Link 
              href="/reputation" 
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/20"
            >
              ⭐ Reputation
            </Link>
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
  const { data: project, isLoading: projectLoading, error: projectError } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getProject",
    args: [projectId],
  });

  const { data: reputation, isLoading: repLoading } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: project ? [project.creator] : undefined,
    query: {
      enabled: !!project, // Only fetch reputation if project loaded
    },
  });

  if (projectError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">Error loading project #{projectId.toString()}</p>
      </div>
    );
  }

  if (projectLoading || !project) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <ProjectCard
      project={project}
      creatorReputation={reputation || BigInt(0)}
      isLoadingReputation={repLoading}
    />
  );
}
