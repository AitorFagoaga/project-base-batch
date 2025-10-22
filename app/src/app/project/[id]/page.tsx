"use client";

import { useParams, useRouter } from "next/navigation";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ReputationBadge } from "@/components/ReputationBadge";
import { FundForm } from "@/components/FundForm";
import { InspireButton } from "@/components/InspireButton";
import { ContributorsHistory } from "@/components/ContributorsHistory";
import { ProjectInvestors } from "@/components/ProjectInvestors";
import { SimilarProjects } from "@/components/SimilarProjects";
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
        id: data.id ?? data[0],
        creator: data.creator ?? data[1],
        title: data.title ?? data[2],
        description: data.description ?? data[3] ?? "",
        imageUrl: data.imageUrl ?? data[4] ?? "",
        goal: data.goal ?? data[5],
        deadline: data.deadline ?? data[6],
        fundsRaised: data.fundsRaised ?? data[7] ?? BigInt(0),
        claimed: data.claimed ?? data[8] ?? false,
        cofounders: data.cofounders ?? data[9] ?? [],
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

  const handleCopyCreator = () => {
    if (!project) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(project.creator)
        .then(() => toast.success("Creator address copied"))
        .catch(() => toast.error("Unable to copy creator address"));
      return;
    }

    toast.error("Clipboard not available in this environment");
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

  const statusDisplay =
    statusMeta?.label ??
    (project
      ? project.claimed
        ? "Funded"
        : goalReached
        ? "Goal reached"
        : isActive
        ? "Active"
        : "Ended"
      : "—");

  const deadlineDisplay = deadlineDate
    ? deadlineDate.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No deadline";

  const metricCards: { label: string; value: string; helper: string }[] = project
    ? [
        {
          label: "Funds Raised",
          value: `${raisedEth} ETH`,
          helper: `of ${goalEth} ETH goal`,
        },
        {
          label: "Time Remaining",
          value: isActive
            ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`
            : "Campaign ended",
          helper:
            deadlineDisplay === "No deadline"
              ? "No deadline configured"
              : `Deadline ${deadlineDisplay}`,
        },
        {
          label: "Status",
          value: statusDisplay,
          helper: project.claimed
            ? "Creator already claimed funds"
            : goalReached
            ? "Goal achieved"
            : isActive
            ? "Collecting contributions"
            : "Goal not reached",
        },
      ]
    : [];

  const attributeChips: { label: string; value: string }[] = project
    ? [
        { label: "Project ID", value: `#${project.id.toString()}` },
        { label: "Goal", value: `${goalEth} ETH` },
        { label: "Progress", value: `${progressPercent.toFixed(1)}%` },
        { label: "Deadline", value: deadlineDisplay },
        {
          label: "Reputation",
          value: reputationValue.toString(),
        },
        project.cofounders.length
          ? {
              label: "Team Size",
              value: `${project.cofounders.length + 1} builders`,
            }
          : { label: "Team", value: "Solo founder" },
      ]
    : [];

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
            <div className="mb-6">
              <Link href="/" className="btn-secondary text-sm px-4 py-2 inline-flex items-center gap-2">
                ← Back to Projects
              </Link>
            </div>

            <div className="space-y-10">
              {/* Hero Section */}
              <section className="relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-gray-200/40">
                <div
                  className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-100 opacity-60 blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white text-xl font-semibold shadow-lg">
                            #{project.id.toString()}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                              Project
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                              {project.title}
                            </h1>
                          </div>
                        </div>
                        {statusMeta && (
                          <span
                            className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${statusMeta.className}`}
                          >
                            {statusMeta.label}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <UserAvatar address={project.creator} size="lg" showReputation={false} />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Creator
                          </p>
                          <p className="font-mono text-sm text-gray-900">
                            {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                          </p>
                        </div>
                        {isReputationLoading ? (
                          <div className="ml-auto h-9 w-28 rounded-full bg-gray-100 animate-pulse" />
                        ) : (
                          <ReputationBadge reputation={reputationValue} className="ml-auto" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {metricCards.map((card) => (
                        <div
                          key={card.label}
                          className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm shadow-gray-100 backdrop-blur"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {card.label}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-gray-900">
                            {card.value}
                          </p>
                          <p className="mt-3 text-xs text-gray-500">
                            {card.helper}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`https://sepolia.basescan.org/address/${project.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-purple-200 hover:text-purple-700 hover:shadow-md"
                      >
                        View creator on BaseScan
                      </Link>
                      <button
                        type="button"
                        onClick={handleCopyCreator}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-purple-200 hover:text-purple-700 hover:shadow-md"
                      >
                        Copy creator address
                      </button>
                    </div>

                    <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-blue-50 p-5 shadow-inner">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Funding Progress
                          </p>
                          <p className="mt-2 text-3xl font-bold text-gray-900">
                            {progressPercent.toFixed(1)}%
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-600">
                          {raisedEth} / {goalEth} ETH
                        </p>
                      </div>
                      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/70">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="mt-3 text-xs text-gray-600">
                        {goalReached
                          ? project.claimed
                            ? "Funds claimed — campaign completed."
                            : "Goal reached. Awaiting claim from creator."
                          : isActive
                          ? "Help push this project to the finish line."
                          : "Campaign closed without reaching its goal."}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Snapshot
                      </h3>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {attributeChips.map(({ label, value }) => (
                          <div
                            key={label}
                            className="rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm shadow-gray-100"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                              {label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm shadow-gray-100">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                        Story & Vision
                      </h3>
                      {project.description ? (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No description provided for this project.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">

                    <div className="relative overflow-hidden rounded-[28px] border border-gray-100 bg-gradient-to-br from-indigo-100/60 via-white to-pink-100/60 p-4 shadow-md shadow-gray-200/50">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-white">
                        <Image
                          src={heroImage}
                          alt={project.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-gray-100 bg-white/80 p-5 text-sm text-gray-600 shadow-sm shadow-gray-100 backdrop-blur">
                      <p>
                        Campaign created by{" "}
                        <span className="font-mono font-semibold text-gray-900">
                          {project.creator.slice(0, 6)}...{project.creator.slice(-4)}
                        </span>{" "}
                        on Base Sepolia. Follow the project to stay in the loop as new
                        milestones unlock.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Funding and Support Section */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-6">
                  <div className="rounded-[32px] border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-1 shadow-lg shadow-indigo-200/60 backdrop-blur">
                    <div className="rounded-[28px] bg-white/95 p-1.5">
                      {isActive && !project.claimed ? (
                        <FundForm
                          projectId={projectId}
                          creatorAddress={project.creator}
                          goalAmount={project.goal}
                          raisedAmount={project.fundsRaised}
                          onSuccess={() => refetchProject()}
                        />
                      ) : (
                        <div className="card rounded-[24px] border border-gray-100 bg-gray-50/70 p-6 text-sm text-gray-600 shadow-md shadow-gray-200/40">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
                </div>

                <div className="space-y-6">
                  <ProjectInvestors projectId={projectId} />

                  <InspireButton
                    projectId={projectId}
                    creatorAddress={project.creator}
                  />

                  {canClaim && (
                    <div className="rounded-[28px] border border-green-200 bg-green-50/80 p-5 shadow-sm shadow-green-100">
                      <p className="text-green-800 font-semibold mb-3 text-sm">
                        🎉 Congratulations! You can claim your funds now.
                      </p>
                      <button
                        onClick={handleClaim}
                        disabled={isClaimPending || isClaimConfirming}
                        className="btn-primary w-full"
                      >
                        {isClaimPending || isClaimConfirming ? "Claiming..." : "Claim Funds"}
                      </button>
                      {claimHash && (
                        <div className="mt-3 text-xs">
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
                    <div className="rounded-[28px] border border-red-200 bg-red-50/80 p-5 shadow-sm shadow-red-100">
                      <p className="text-red-800 font-semibold mb-2 text-sm">
                        ⚠️ Delete this project
                      </p>
                      <p className="text-xs text-red-700 mb-3">
                        This action cannot be undone.
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 w-full"
                      >
                        Delete Project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {project.cofounders && project.cofounders.length > 0 && (
                <div className="card rounded-[28px] border border-gray-100 p-6 shadow-md shadow-gray-200/50">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    Team Members
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.cofounders.map((cofounder) => (
                      <span
                        key={cofounder}
                        className="inline-flex items-center gap-2 rounded-2xl border border-purple-100 bg-purple-50/70 px-4 py-2 text-xs font-semibold text-purple-700"
                      >
                        {cofounder.slice(0, 6)}...{cofounder.slice(-4)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <SimilarProjects currentProjectId={projectId} category={project.category} />
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
