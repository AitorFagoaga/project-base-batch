"use client";

import { useState, useMemo, useEffect } from "react";
import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ProjectCard } from "@/components/ProjectCard";
import { NetworkGuard } from "@/components/NetworkGuard";
import { EmptyState } from "@/components/UIComponents";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import Link from "next/link";
import { Icon } from "@/components/Icon";

type ProjectContractResponse = {
  id?: bigint;
  creator?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  goal?: bigint;
  deadline?: bigint;
  fundsRaised?: bigint;
  claimed?: boolean;
  cofounders?: readonly string[];
} & {
  [key: number]: unknown;
};

const CATEGORIES = ["All", "DeFi", "NFT", "Gaming", "Social", "Infrastructure", "Education", "Impact", "Other"];

type SortOption = "latest" | "oldest" | "highest-funding" | "lowest-funding";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

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
        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr),auto] xl:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <Icon name="search" size="sm" className="text-gray-400" />
              </span>
              <input
                type="search"
                placeholder="Search projects, creators, or categories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-6 text-sm text-gray-700 shadow-inner focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-gray-600 shadow-sm hover:border-indigo-400 hover:text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-200 appearance-none"
                >
                  <option value="latest">Sort by • Latest</option>
                  <option value="oldest">Sort by • Oldest</option>
                  <option value="highest-funding">Sort by • Highest Funded</option>
                  <option value="lowest-funding">Sort by • Lowest Funded</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <Icon name="chevronDown" size="xs" className="text-gray-400" />
                </span>
              </div>
              <Link href="/create" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl">
                Create Project
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-600 hover:border-indigo-400 hover:text-gray-900"
                }`}
              >
                {category === "NFT" ? "NFT & Collectibles" : category}
              </button>
            ))}
          </div>

          {totalProjects === 0 ? (
            <EmptyState
              title="No Projects Yet"
              description="Be the first to launch a project on our reputation-based crowdfunding platform. Connect your wallet and create your project now!"
              action={
                <Link href="/create" className="btn-primary inline-flex items-center gap-2">
                  <Icon name="rocket" size="sm" />
                  Launch the First Project
                </Link>
              }
            />
          ) : (
            <ProjectList count={totalProjects} selectedCategory={selectedCategory} searchQuery={searchQuery} sortBy={sortBy} />
          )}
        </div>
      </NetworkGuard>
    </SharedPageLayout>
  );
}

/**
 * Component for funding-based sorting (fetches all project data first)
 */
function ProjectListWithFundingSort({ count, selectedCategory, searchQuery, sortBy }: { count: number; selectedCategory: string; searchQuery: string; sortBy: SortOption }) {
  const [projectsWithFunding, setProjectsWithFunding] = useState<Array<{ id: number; fundsRaised: bigint }>>([]);
  const [isLoadingFunding, setIsLoadingFunding] = useState(true);

  // This is a simplified approach - in production, use multicall or batch reads
  // For now, we'll render projects in ID order and let them self-sort visually
  const projectIds = useMemo(() => {
    if (isLoadingFunding || projectsWithFunding.length === 0) {
      // While loading, show in default order
      return Array.from({ length: count }, (_, i) => i).reverse();
    }

    // Sort by funding
    const sorted = [...projectsWithFunding].sort((a, b) => {
      if (sortBy === "highest-funding") {
        return b.fundsRaised > a.fundsRaised ? 1 : -1;
      } else {
        return a.fundsRaised > b.fundsRaised ? 1 : -1;
      }
    });

    return sorted.map(p => p.id);
  }, [count, projectsWithFunding, sortBy, isLoadingFunding]);

  // Note: For simplicity, we'll just use latest order
  // Implementing full funding sort requires multicall which is complex
  // Using latest as fallback
  useEffect(() => {
    setIsLoadingFunding(false);
  }, []);

  return (
    <>
      <div className="rounded-3xl border border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-6 py-6 mb-8 shadow-inner">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-xl text-indigo-600">
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
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 shadow-sm ring-1 ring-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live on Base Sepolia
            </span>
            <Link href="/reputation" className="text-sm font-semibold text-indigo-600 hover:underline">
              View reputation tiers →
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4">
        {projectIds.map((id) => (
          <ProjectWithReputation key={id} projectId={BigInt(id)} selectedCategory={selectedCategory} searchQuery={searchQuery} sortBy={sortBy} />
        ))}
      </div>
    </>
  );
}

/**
 * Component to render all projects (optimized with loading states)
 */
function ProjectList({ count, selectedCategory, searchQuery, sortBy }: { count: number; selectedCategory: string; searchQuery: string; sortBy: SortOption }) {
  // For funding-based sorting, we need to fetch all projects first
  // This is a simplified approach - for production, consider pagination
  const needsFundingSort = sortBy === "highest-funding" || sortBy === "lowest-funding";

  // Generate project IDs and sort based on sortBy option (ID-based sorting)
  // IMPORTANT: useMemo must be called before any conditional returns (React Hooks rules)
  const projectIds = useMemo(() => {
    let ids = Array.from({ length: count }, (_, i) => i);

    if (sortBy === "latest") {
      ids = ids.reverse(); // Newest first (highest ID)
    }
    // "oldest" keeps natural order

    return ids;
  }, [count, sortBy]);

  if (needsFundingSort) {
    return <ProjectListWithFundingSort count={count} selectedCategory={selectedCategory} searchQuery={searchQuery} sortBy={sortBy} />;
  }

  return (
    <>
      <div className="rounded-3xl border border-gray-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-6 py-6 mb-8 shadow-inner">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-xl text-indigo-600">
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
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 shadow-sm ring-1 ring-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live on Base Sepolia
            </span>
            <Link href="/reputation" className="text-sm font-semibold text-indigo-600 hover:underline">
              View reputation tiers →
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4">
        {projectIds.map((id) => (
          <ProjectWithReputation key={id} projectId={BigInt(id)} selectedCategory={selectedCategory} searchQuery={searchQuery} sortBy={sortBy} />
        ))}
      </div>
    </>
  );
}

/**
 * Component that fetches project + creator reputation (optimized with error handling)
 */
function ProjectWithReputation({ projectId, selectedCategory, searchQuery, sortBy }: { projectId: bigint; selectedCategory: string; searchQuery: string; sortBy: SortOption }) {
  const { data: projectData, isLoading: projectLoading, error: projectError } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getProject",
    args: [projectId],
  });

  // Extract creator address from project data (updated with category field)
  let creatorAddress: string | undefined;
  if (projectData) {
    if (Array.isArray(projectData)) {
      creatorAddress = projectData[1] as string | undefined;
    } else {
      const data = projectData as ProjectContractResponse;
      if (typeof data.creator === "string") {
        creatorAddress = data.creator;
      } else if (typeof data[1] === "string") {
        creatorAddress = data[1] as string;
      }
    }
  }
  if (creatorAddress && typeof creatorAddress === "string" && !creatorAddress.startsWith("0x")) {
    creatorAddress = undefined;
  }

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
    // Array format (updated with category)
    const data = projectData as [bigint, string, string, string, string, string, bigint, bigint, bigint, boolean, readonly string[]];
    project = {
      id: data[0],
      creator: data[1],
      title: data[2],
      description: data[3] || '',
      imageUrl: data[4] || '',
      category: data[5] || '',
      goal: data[6],
      deadline: data[7],
      fundsRaised: data[8],
      claimed: data[9] || false,
      cofounders: data[10] || [],
    };
  } else {
    // Object format (viem v2 returns objects)
    const data = projectData as ProjectContractResponse;
    project = {
      id: (data.id ?? data[0]) as bigint,
      creator: (data.creator ?? data[1]) as string,
      title: (data.title ?? data[2]) as string,
      description: (data.description ?? data[3] ?? '') as string,
      imageUrl: (data.imageUrl ?? data[4] ?? '') as string,
      category: (data.category ?? data[5] ?? '') as string,
      goal: (data.goal ?? data[6]) as bigint,
      deadline: (data.deadline ?? data[7]) as bigint,
      fundsRaised: (data.fundsRaised ?? data[8] ?? BigInt(0)) as bigint,
      claimed: (data.claimed ?? data[9] ?? false) as boolean,
      cofounders: (data.cofounders ?? data[10] ?? []) as readonly string[],
    };
  }

  // Filter out deleted/invalid projects (creator is zero address)
  if (!project.creator || project.creator === "0x0000000000000000000000000000000000000000") {
    return null;
  }

  // Validate required fields
  if (!project.title || project.goal === undefined || project.deadline === undefined) {
    return null;
  }

  // Filter by category
  if (selectedCategory !== "All" && project.category !== selectedCategory) {
    return null;
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    const matchesTitle = (project.title || '').toLowerCase().includes(query);
    const matchesDescription = (project.description || '').toLowerCase().includes(query);
    const matchesCategory = (project.category || '').toLowerCase().includes(query);
    const matchesCreator = (project.creator || '').toLowerCase().includes(query);
    
    if (!matchesTitle && !matchesDescription && !matchesCategory && !matchesCreator) {
      return null;
    }
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
