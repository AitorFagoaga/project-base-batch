"use client";

import { useParams, useRouter } from "next/navigation";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ReputationBadge } from "@/components/ReputationBadge";
import { FundForm } from "@/components/FundForm";
import { InspireButton } from "@/components/InspireButton";
import { ContributorsHistory } from "@/components/ContributorsHistory";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { UserAvatar } from "@/components/UserAvatar";
import Image from "next/image";
import Link from "next/link";
import { formatEther } from "viem";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

type NormalizedProject = {
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

type ProjectContractResponse = Partial<NormalizedProject> & {
  [key: number]: unknown;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = BigInt(params?.id as string);
  const { address } = useAccount();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: projectData,
    refetch: refetchProject,
    isLoading: isProjectLoading,
    error: projectError,
  } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getProject",
    args: [projectId],
  });

  let project: NormalizedProject | null = null;

  if (projectData) {
    if (Array.isArray(projectData)) {
      const data = projectData as [bigint, string, string, string, string, bigint, bigint, bigint, boolean, readonly string[]];
      project = {
        id: data[0],
        creator: data[1],
        title: data[2],
        description: data[3] || "",
        imageUrl: data[4] || "",
        goal: data[5],
        deadline: data[6],
        fundsRaised: data[7],
        claimed: data[8] || false,
        cofounders: data[9] || [],
      };
    } else {
      const data = projectData as ProjectContractResponse;
      project = {
        id: (data.id ?? data[0]) as bigint,
        creator: (data.creator ?? data[1]) as string,
        title: (data.title ?? data[2]) as string,
        description: (data.description ?? data[3] ?? "") as string,
        imageUrl: (data.imageUrl ?? data[4] ?? "") as string,
        goal: (data.goal ?? data[5]) as bigint,
        deadline: (data.deadline ?? data[6]) as bigint,
        fundsRaised: (data.fundsRaised ?? data[7] ?? BigInt(0)) as bigint,
        claimed: (data.claimed ?? data[8] ?? false) as boolean,
        cofounders: (data.cofounders ?? data[9] ?? []) as readonly string[],
      };
    }
  }

  const {
    data: reputation,
    isLoading: isReputationLoading,
  } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: project ? [project.creator as `0x${string}`] : undefined,
    query: {
      enabled: !!project,
    },
  });

  const { writeContract: writeClaim, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const { writeContract: writeDelete, data: deleteHash, isPending: isDeletePending } = useWriteContract();
  const { isLoading: isDeleteConfirming, isSuccess: isDeleteSuccess } = useWaitForTransactionReceipt({
    hash: deleteHash,
  });

  const handleClaim = () => {
    if (!project) {
      return;
    }

    writeClaim({
      address: CONTRACTS.launchpad.address,
      abi: CONTRACTS.launchpad.abi,
      functionName: "claimFunds",
      args: [projectId],
    });

    toast.success("Claim transaction submitted!");
  };

  const handleDelete = () => {
    if (!project) {
      return;
    }

    writeDelete({
      address: CONTRACTS.launchpad.address,
      abi: CONTRACTS.launchpad.abi,
      functionName: "deleteProject",
      args: [projectId],
    });

    setShowDeleteConfirm(false);
    toast.success("Delete transaction submitted!");
  };

  // Redirect to home after successful deletion
  useEffect(() => {
    if (isDeleteSuccess) {
      toast.success("Project deleted successfully!");
      router.push("/");
    }
  }, [isDeleteSuccess, router]);

  const now = Math.floor(Date.now() / 1000);
  let isActive = false;
  let goalReached = false;
  let canClaim = false;
  let progressPercent = 0;
  let daysRemaining = 0;
  let deadlineDate: Date | null = null;
  let goalEth = "0";
  let raisedEth = "0";

  if (project) {
    goalEth = formatEther(project.goal);
    raisedEth = formatEther(project.fundsRaised);
    const goalNumber = Number(project.goal);
    const deadlineNumber = Number(project.deadline);
    const progress =
      goalNumber > 0 ? Number(project.fundsRaised) / goalNumber : 0;

    progressPercent = Math.min(progress * 100, 100);

    if (Number.isFinite(deadlineNumber)) {
      deadlineDate = new Date(deadlineNumber * 1000);
      daysRemaining = Math.max(
        0,
        Math.ceil((deadlineNumber - now) / 86400)
      );
      isActive = now < deadlineNumber;
    }

    goalReached = project.fundsRaised >= project.goal;
    canClaim =
      !isActive &&
      goalReached &&
      !project.claimed &&
      address?.toLowerCase() === project.creator.toLowerCase();
  }

  const canDelete =
    project &&
    !goalReached &&
    address?.toLowerCase() === project.creator.toLowerCase();

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

  const statusMeta = project
    ? project.claimed
      ? { label: "Funded", className: "bg-green-50 text-green-700 border border-green-200" }
      : isActive
      ? { label: "Active", className: "bg-blue-50 text-blue-700 border border-blue-200" }
      : goalReached
      ? { label: "Goal reached", className: "bg-purple-50 text-purple-700 border border-purple-200" }
      : { label: "Ended", className: "bg-rose-50 text-rose-700 border border-rose-200" }
    : null;

  const heroImage = project?.imageUrl?.trim()
    ? project.imageUrl
    : "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80";

  const pageTitle = project
    ? project.title
    : projectError
    ? "Project unavailable"
    : "Loading project...";
  const pageDescription = project
    ? `${goalEth} ETH goal · ${progressPercent.toFixed(1)}% funded${
        deadlineDate ? ` · Deadline ${deadlineDate.toLocaleDateString()}` : ""
      }`
    : projectError
    ? "We couldn't load this project from the launchpad contract."
    : "Fetching project details from Base Sepolia...";

  return (
    <SharedPageLayout title={pageTitle} description={pageDescription}>
      <NetworkGuard>
        {projectError ? (
          <div className="glass-card border border-red-200 bg-red-50/80 text-center text-red-700 py-12">
            <h2 className="text-2xl font-semibold mb-3">Unable to load project</h2>
            <p>Please try again later or return to the projects list.</p>
            <Link href="/" className="btn-secondary mt-6 inline-block">
              ← Back to Projects
            </Link>
          </div>
        ) : isProjectLoading && !project ? (
          <div className="card max-w-3xl mx-auto py-16 text-center animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto"></div>
            <div className="h-48 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-2xl"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded mx-auto"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded mx-auto"></div>
          </div>
        ) : !project ? (
          <div className="glass-card text-center py-12">
            <h2 className="text-2xl font-semibold mb-3">Project not found</h2>
            <p className="text-gray-600">The requested project does not exist or has been removed.</p>
            <Link href="/" className="btn-secondary mt-6 inline-block">
              ← Back to Projects
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <Link href="/" className="btn-secondary text-sm px-4 py-2">
                ← Back to Projects
              </Link>
              {isReputationLoading ? (
                <div className="h-9 w-32 rounded-full bg-white/70 animate-pulse"></div>
              ) : (
                <ReputationBadge reputation={reputationValue} />
              )}
            </div>

            <div className="card overflow-hidden p-0 mb-8">
              <div className="relative h-72 w-full bg-gradient-to-br from-purple-200/60 to-pink-200/60">
                <Image
                  src={heroImage}
                  alt={project.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="card space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar address={project.creator} size="md" showReputation={false} />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Project Creator
                        </p>
                        <p className="font-mono text-sm text-gray-900 break-all">
                          {project.creator}
                        </p>
                      </div>
                    </div>
                    {statusMeta && (
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {raisedEth} / {goalEth} ETH raised
                      </span>
                      <span className="font-semibold text-purple-600">
                        {progressPercent.toFixed(1)}% funded
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-white/70 border border-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Time
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {isActive
                            ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
                            : deadlineDate
                            ? deadlineDate.toLocaleDateString()
                            : "Campaign ended"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/70 border border-white/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Funding Status
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {goalReached ? "Goal reached" : isActive ? "In progress" : "Goal pending"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {canClaim && (
                    <div className="rounded-2xl border-2 border-green-200 bg-green-50/80 p-5">
                      <p className="text-green-800 font-semibold mb-3">
                        🎉 Congratulations! You can claim your funds now.
                      </p>
                      <button
                        onClick={handleClaim}
                        disabled={isClaimPending || isClaimConfirming}
                        className="btn-primary"
                      >
                        {isClaimPending || isClaimConfirming ? "Claiming..." : "Claim Funds"}
                      </button>
                      {claimHash && (
                        <div className="mt-3 text-sm">
                          <a
                            href={`https://sepolia.basescan.org/tx/${claimHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View transaction on BaseScan ↗
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {canDelete && (
                    <div className="rounded-2xl border-2 border-red-200 bg-red-50/80 p-5">
                      <p className="text-red-800 font-semibold mb-3">
                        ⚠️ Delete this project
                      </p>
                      <p className="text-sm text-red-700 mb-3">
                        This action cannot be undone. The project will be permanently removed from the launchpad.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>

                <div className="card space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Project Overview
                  </h3>
                  {project.description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-gray-500">
                      No description provided for this project.
                    </p>
                  )}

                  {project.cofounders && project.cofounders.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Cofounders
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.cofounders.map((cofounder) => (
                          <span key={cofounder} className="badge badge-primary font-mono">
                            {cofounder.slice(0, 6)}...{cofounder.slice(-4)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Contributors History */}
                <ContributorsHistory projectId={projectId} />
              </div>

              <div className="space-y-6">
                {isActive && !project.claimed ? (
                  <>
                    <FundForm 
                      projectId={projectId} 
                      creatorAddress={project.creator}
                      onSuccess={() => refetchProject()} 
                    />
                    <InspireButton 
                      projectId={projectId}
                      creatorAddress={project.creator}
                    />
                  </>
                ) : (
                  <div className="card space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Funding Closed
                    </h3>
                    <p className="text-gray-600">
                      {project.claimed
                        ? "This project has been successfully funded."
                        : goalReached
                        ? "Campaign ended. Waiting for creator to claim funds."
                        : "Campaign ended without reaching its goal."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="card max-w-md mx-4 p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirm Deletion
              </h3>
              <p className="text-gray-700">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              {project && project.fundsRaised > BigInt(0) && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  ⚠️ Note: This project has {formatEther(project.fundsRaised)} ETH in contributions.
                  Deleting it will make the project inaccessible.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeletePending || isDeleteConfirming}
                  className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeletePending || isDeleteConfirming ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletePending || isDeleteConfirming}
                  className="flex-1 rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              {deleteHash && (
                <div className="text-sm">
                  <a
                    href={`https://sepolia.basescan.org/tx/${deleteHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View transaction on BaseScan ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </NetworkGuard>
    </SharedPageLayout>
  );
}
