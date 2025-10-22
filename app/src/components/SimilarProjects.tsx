"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ProjectCard } from "./ProjectCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SimilarProjectsProps {
  currentProjectId: bigint;
  category?: string;
}

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

export function SimilarProjects({ currentProjectId, category }: SimilarProjectsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Read total project count
  const { data: projectCount } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "projectCount",
  });

  const totalProjects = projectCount ? Number(projectCount) : 0;

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (totalProjects <= 1) {
    return null; // Don't show if there's only the current project or no projects
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Similar Projects
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="rounded-full bg-white border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="rounded-full bg-white border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {Array.from({ length: totalProjects }, (_, i) => i).map((index) => {
          const projectId = BigInt(index);
          // Skip current project
          if (projectId === currentProjectId) return null;

          return (
            <div key={index} className="flex-shrink-0 w-[320px]">
              <ProjectItem projectId={projectId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProjectItemProps {
  projectId: bigint;
}

function ProjectItem({ projectId }: ProjectItemProps) {
  const { data: projectData } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getProject",
    args: [projectId],
  });

  // Parse project first to get creator address
  let project: any = null;
  let creatorAddress: `0x${string}` | undefined;

  if (projectData) {
    if (Array.isArray(projectData)) {
      const data = projectData as any[];
      project = {
        id: data[0],
        creator: data[1],
        title: data[2],
        description: data[3] || "",
        imageUrl: data[4] || "",
        category: data[5] || "",
        goal: data[6],
        deadline: data[7],
        fundsRaised: data[8],
        claimed: data[9] || false,
        cofounders: data[10] || [],
      };
      creatorAddress = data[1] as `0x${string}`;
    } else {
      const data = projectData as ProjectContractResponse;
      project = {
        id: data.id ?? data[0],
        creator: data.creator ?? data[1],
        title: data.title ?? data[2],
        description: data.description ?? data[3] ?? "",
        imageUrl: data.imageUrl ?? data[4] ?? "",
        category: data.category ?? data[5] ?? "",
        goal: data.goal ?? data[6],
        deadline: data.deadline ?? data[7],
        fundsRaised: data.fundsRaised ?? data[8] ?? BigInt(0),
        claimed: data.claimed ?? data[9] ?? false,
        cofounders: data.cofounders ?? data[10] ?? [],
      };
      creatorAddress = (data.creator ?? data[1]) as `0x${string}`;
    }
  }

  const { data: reputation } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: creatorAddress ? [creatorAddress] : undefined,
    query: {
      enabled: !!creatorAddress,
    },
  });

  if (!projectData || !project) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="aspect-[16/11] bg-gray-200 rounded-2xl"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  let reputationValue = BigInt(0);
  if (reputation) {
    try {
      if (typeof reputation === "bigint") {
        reputationValue = reputation;
      } else if (typeof reputation === "number") {
        reputationValue = BigInt(reputation);
      } else if (typeof reputation === "string") {
        reputationValue = BigInt(reputation);
      } else {
        reputationValue = BigInt(String(reputation));
      }
    } catch (error) {
      console.error("Error converting reputation:", error);
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
