"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ProjectCard } from "@/components/ProjectCard";
import { NetworkGuard } from "@/components/NetworkGuard";
import { EmptyState } from "@/components/UIComponents";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import Link from "next/link";

type ProjectContractResponse = {
  id?: bigint;
  creator?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  goal?: bigint;
  deadline?: bigint;
  fundsRaised?: bigint;
  claimed?: boolean;
  cofounders?: readonly string[];
} & {
  [key: number]: unknown;
};
export default function Home() {
  // Read total project count
  const { data: projectCount } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "projectCount",
  });

  const totalProjects = projectCount ? Number(projectCount) : 0;
  const projectsLabel =
    totalProjects > 0
      ? `Explore ${totalProjects} live project${totalProjects > 1 ? "s" : ""} backed by on-chain reputation.`
      : "Be the first to launch a reputation-backed project on the Meritocratic Launchpad.";

  return (
    <SharedPageLayout title="Active Projects" description={projectsLabel}>
      <NetworkGuard>
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
    </SharedPageLayout>
  );
}

/**
 * Component to render all projects (optimized with loading states)
 */
function ProjectList({ count }: { count: number }) {
  const projectIds = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      <div className="glass-card px-6 py-5 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-lg shadow-indigo-500/20">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-xl">
            📡
          </span>
          <div>
            <p className="text-base font-semibold text-gray-900">
              Showing {count} project{count !== 1 ? "s" : ""} across the launchpad
            </p>
            <p className="text-sm text-gray-600">
              Updated in real time via on-chain reads. Discover projects backed by reputation.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md sm:self-auto">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow animate-pulse"></span>
          Live on Base Sepolia
        </span>
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
      <div className="glass-card border border-red-200 bg-red-50/70 p-6 text-sm text-red-700">
        <p className="text-red-600 text-sm">Error loading project #{projectId.toString()}</p>
      </div>
    );
  }

  if (projectLoading || !projectData) {
    return (
      <div className="card h-full animate-pulse space-y-4">
        <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-purple-200/60 to-pink-200/60"></div>
        <div className="h-6 rounded bg-gray-200"></div>
        <div className="h-4 rounded bg-gray-200 w-5/6"></div>
        <div className="h-4 rounded bg-gray-200 w-2/3"></div>
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
    const data = projectData as ProjectContractResponse;
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
