"use client";

import Link from "next/link";
import { ReputationBadge } from "./ReputationBadge";
import { formatEther } from "viem";

/**
 * Project card with reputation display
 */
interface ProjectCardProps {
  project: {
    id: bigint;
    creator: string;
    title: string;
    goal: bigint;
    deadline: bigint;
    fundsRaised: bigint;
    claimed: boolean;
  };
  creatorReputation: bigint;
  isLoadingReputation?: boolean;
}

export function ProjectCard({ project, creatorReputation, isLoadingReputation }: ProjectCardProps) {
  const progress = Number(project.fundsRaised) / Number(project.goal);
  const progressPercent = Math.min(progress * 100, 100);

  const now = Math.floor(Date.now() / 1000);
  const deadlineDate = new Date(Number(project.deadline) * 1000);
  const isActive = now < Number(project.deadline);
  const daysRemaining = Math.max(
    0,
    Math.ceil((Number(project.deadline) - now) / 86400)
  );

  const goalEth = formatEther(project.goal);
  const raisedEth = formatEther(project.fundsRaised);

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
        {isLoadingReputation ? (
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <ReputationBadge reputation={creatorReputation} />
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            {raisedEth} / {goalEth} ETH
          </span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className="text-gray-600">
          Creator:{" "}
          <span className="font-mono text-xs">
            {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
          </span>
        </span>
        {isActive ? (
          <span className="text-green-600 font-medium">
            {daysRemaining} days left
          </span>
        ) : project.claimed ? (
          <span className="text-blue-600 font-medium">✓ Funded</span>
        ) : (
          <span className="text-red-600 font-medium">Ended</span>
        )}
      </div>

      <Link
        href={`/project/${project.id}`}
        className="btn-primary w-full text-center block"
      >
        View Project
      </Link>
    </div>
  );
}
