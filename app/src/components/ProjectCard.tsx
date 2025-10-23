"use client";

import Link from "next/link";
import Image from "next/image";
import { ReputationBadge } from "./ReputationBadge";
import { UserAvatar } from "./UserAvatar";
import { formatEther } from "viem";
import { Icon } from "./Icon";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { useEffect } from "react";

/**
 * Project card with reputation display, image, and creator avatar
 */
interface ProjectCardProps {
  project: {
    id: bigint;
    creator: string;
    title: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    goal: bigint;
    deadline: bigint;
    fundsRaised: bigint;
    claimed: boolean;
    cofounders?: readonly string[];
  };
  creatorReputation: bigint;
  isLoadingReputation?: boolean;
}

export function ProjectCard({ project, creatorReputation, isLoadingReputation }: ProjectCardProps) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user already inspired this project
  const { data: hasInspired } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "hasInspired",
    args: address && project.id !== undefined ? [project.id, address] : undefined,
    query: {
      enabled: !!address && project.id !== undefined,
    },
  });

  // Check if user is a cofounder
  const { data: isCofounder } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "isCofounder",
    args: address && project.id !== undefined ? [project.id, address] : undefined,
    query: {
      enabled: !!address && project.id !== undefined,
    },
  });

  const alreadyInspired = hasInspired === true;
  const isOwnProject = address?.toLowerCase() === project.creator?.toLowerCase();
  const isProjectCofounder = isCofounder === true;

  const handleInspire = async () => {
    if (isOwnProject) {
      toast.error("You cannot inspire your own project");
      return;
    }

    if (isProjectCofounder) {
      toast.error("Cofounders cannot inspire their own project");
      return;
    }

    if (alreadyInspired) {
      toast.error("You already inspired this project");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "inspireProject",
        args: [project.id],
      });

      toast.success("Transaction sent");
    } catch (err: any) {
      toast.error(err?.message || "Error inspiring project");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("You inspired this project! The creator received 3 reputation points", {
        duration: 5000,
      });
    }
  }, [isSuccess]);

  if (!project || project.goal === undefined || project.fundsRaised === undefined || project.deadline === undefined) {
    return null;
  }

  const safeProject = {
    ...project,
    fundsRaised: project.fundsRaised ?? BigInt(0),
    description: project.description ?? "",
    imageUrl: project.imageUrl ?? "",
    category: project.category ?? "",
    cofounders: project.cofounders ?? [],
  };

  const progress = Number(safeProject.fundsRaised) / Number(safeProject.goal);
  const progressPercent = Math.min(progress * 100, 100);

  const now = Math.floor(Date.now() / 1000);
  const isActive = now < Number(safeProject.deadline);
  const daysRemaining = Math.max(0, Math.ceil((Number(safeProject.deadline) - now) / 86400));

  const goalEth = formatEther(safeProject.goal);
  const raisedEth = formatEther(safeProject.fundsRaised);
  const projectImage = safeProject.imageUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80";

  return (
    <div className="group rounded-3xl border border-gray-100 bg-white/80 p-3 shadow-[0_18px_40px_-24px_rgba(79,70,229,0.4)] transition-shadow hover:shadow-[0_28px_60px_-30px_rgba(79,70,229,0.55)]">
      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Image
          src={projectImage}
          alt={safeProject.title}
          fill
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 280px, 100vw"
        />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-500 shadow">
              #{safeProject.id.toString()}
            </span>
            {safeProject.category && (
              <span className="rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                {safeProject.category}
              </span>
            )}
          </div>
          <div className="bg-white/95 rounded-full shadow-lg px-2 py-1">
            {isLoadingReputation ? (
              <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
            ) : (
              <ReputationBadge reputation={creatorReputation} />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{safeProject.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {safeProject.description || "No description yet. Tell the world why they should support you!"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UserAvatar address={safeProject.creator} size="sm" showReputation={false} />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">Creator</p>
            <p className="font-mono text-sm font-semibold text-gray-700">
              {safeProject.creator.slice(0, 6)}...{safeProject.creator.slice(-4)}
            </p>
          </div>
          {safeProject.cofounders && safeProject.cofounders.length > 0 && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              +{safeProject.cofounders.length} cofounder{safeProject.cofounders.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="space-y-2 rounded-2xl bg-gray-50/80 p-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-700">Raised</span>
            <span className="font-semibold text-gray-900">
              {raisedEth} / {goalEth} ETH
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
            <span>{progressPercent.toFixed(0)}% funded</span>
            <span>
              {isActive
                ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
                : safeProject.claimed
                ? "Funds claimed"
                : "Campaign ended"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/project/${safeProject.id}`}
            className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
          >
            View Project
          </Link>
          {!isOwnProject && !isProjectCofounder && (
            <button
              type="button"
              onClick={handleInspire}
              disabled={isPending || isConfirming || alreadyInspired}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                alreadyInspired
                  ? "border-green-300 bg-green-50 text-green-700 cursor-not-allowed"
                  : "border-gray-200 text-gray-500 hover:border-indigo-500 hover:text-indigo-600"
              }`}
              title={alreadyInspired ? "You already inspired this project" : "Inspire project"}
            >
              <Icon name="sparkles" size="xs" />
              {alreadyInspired ? "Inspired ✓" : isPending || isConfirming ? "..." : "Inspire"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
