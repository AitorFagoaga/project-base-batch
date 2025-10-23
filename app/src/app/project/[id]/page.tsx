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

type TeamMember = {
  member: string;
  role: string;
};

type NormalizedProject = {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
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
      const data = projectData as [bigint, string, string, string, string, string, bigint, bigint, bigint, boolean, readonly string[]];
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
    } else {
      const data = projectData as ProjectContractResponse;
      project = {
        id: (data.id ?? data[0]) as bigint,
        creator: (data.creator ?? data[1]) as string,
        title: (data.title ?? data[2]) as string,
        description: (data.description ?? data[3] ?? "") as string,
        imageUrl: (data.imageUrl ?? data[4] ?? "") as string,
        category: (data.category ?? data[5] ?? "") as string,
        goal: (data.goal ?? data[6]) as bigint,
        deadline: (data.deadline ?? data[7]) as bigint,
        fundsRaised: (data.fundsRaised ?? data[8] ?? BigInt(0)) as bigint,
        claimed: (data.claimed ?? data[9] ?? false) as boolean,
        cofounders: (data.cofounders ?? data[10] ?? []) as readonly string[],
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

  const {
    data: teamMembersData,
    isLoading: isTeamLoading,
  } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getTeamMembers",
    args: [projectId],
    query: {
      enabled: !!project,
    },
  });

  const teamMembers: TeamMember[] = teamMembersData ? (teamMembersData as TeamMember[]) : [];

  // Use finalizeProject for both claiming funds and processing refunds
  const { writeContract: writeFinalize, data: finalizeHash, isPending: isFinalizePending, error: finalizeError } = useWriteContract();
  const { isLoading: isFinalizeConfirming, isSuccess: isFinalizeSuccess, isError: isFinalizeError, error: finalizeReceiptError } = useWaitForTransactionReceipt({
    hash: finalizeHash,
  });

  const { writeContract: writeDelete, data: deleteHash, isPending: isDeletePending } = useWriteContract();
  const { isLoading: isDeleteConfirming, isSuccess: isDeleteSuccess } = useWaitForTransactionReceipt({
    hash: deleteHash,
  });

  // Get user's contribution amount
  const {
    data: userContribution,
    refetch: refetchContribution,
  } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getContribution",
    args: project && address ? [projectId, address as `0x${string}`] : undefined,
    query: {
      enabled: !!project && !!address,
    },
  });

  const handleFinalize = () => {
    if (!project) {
      toast.error("Project not found");
      return;
    }

    try {
      writeFinalize({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "finalizeProject",
        args: [projectId],
      });

      if (goalReached) {
        toast.loading("Transaction submitted! Claiming funds and distributing rewards...", { duration: 3000 });
      } else {
        toast.loading("Transaction submitted! Processing refunds for all contributors...", { duration: 3000 });
      }
    } catch (error) {
      console.error("Error finalizing project:", error);
      toast.error("Failed to finalize project");
    }
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

  // Handle finalization errors
  useEffect(() => {
    if (isFinalizeError && finalizeReceiptError) {
      console.error("Transaction failed:", finalizeReceiptError);
      toast.error("Transaction failed! Check console for details.");
    }
    if (finalizeError) {
      console.error("Transaction submission error:", finalizeError);
      toast.error("Failed to submit transaction. Please try again.");
    }
  }, [isFinalizeError, finalizeReceiptError, finalizeError]);

  // Refetch after successful finalization
  useEffect(() => {
    if (isFinalizeSuccess) {
      if (goalReached) {
        toast.success("✅ Funds claimed and NFTs distributed successfully!");
      } else {
        toast.success("✅ All refunds processed successfully!");
      }
      
      // Refetch project data to update UI
      setTimeout(() => {
        refetchProject();
        refetchContribution();
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinalizeSuccess]);

  const now = Math.floor(Date.now() / 1000);
  let isActive = false;
  let goalReached = false;
  const canClaim = false;
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
  }

  // Can finalize if project ended (regardless of goal reached or not) and not claimed yet
  const canFinalize = project && !isActive && !project.claimed;
  
  // Only allow deletion if project is still active and hasn't reached goal
  const canDelete =
    project &&
    isActive &&
    !goalReached &&
    address?.toLowerCase() === project.creator.toLowerCase();

  let contributionAmount = BigInt(0);
  if (userContribution) {
    try {
      if (typeof userContribution === "bigint") {
        contributionAmount = userContribution;
      } else if (typeof userContribution === "number") {
        contributionAmount = BigInt(userContribution);
      } else if (typeof userContribution === "string") {
        contributionAmount = BigInt(userContribution);
      }
    } catch (error) {
      console.error("Error converting contribution:", error);
      contributionAmount = BigInt(0);
    }
  }

  // Debug: Log refund-related values after all calculations
  useEffect(() => {
    // Removed debug logs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, address, userContribution]);

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

                      {/* Team Section */}
                      {!isTeamLoading && teamMembers.length > 0 && (
                        <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 mb-3">
                            👥 Founding Team ({teamMembers.length})
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {teamMembers.map((member, idx) => (
                              <Link
                                key={idx}
                                href={`/profile/${member.member}`}
                                className="flex items-center gap-3 rounded-xl border border-purple-200 bg-white px-4 py-3 hover:shadow-md hover:border-purple-300 transition-all"
                              >
                                <UserAvatar address={member.member} size="sm" showReputation={false} />
                                <div className="flex-1 min-w-0">
                                  <p className="font-mono text-xs text-gray-700 truncate">
                                    {member.member.slice(0, 6)}...{member.member.slice(-4)}
                                  </p>
                                  <p className="text-xs text-purple-600 font-medium mt-0.5">
                                    {member.role}
                                  </p>
                                </div>
                                {member.member.toLowerCase() === project.creator.toLowerCase() && (
                                  <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                                    Creator
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
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

                  {canFinalize && (
                    <div className={`rounded-[28px] border p-5 shadow-sm ${
                      goalReached 
                        ? 'border-green-200 bg-green-50/80 shadow-green-100' 
                        : 'border-amber-200 bg-amber-50/80 shadow-amber-100'
                    }`}>
                      {goalReached ? (
                        <>
                          <p className="text-green-800 font-semibold mb-2 text-sm">
                            🎉 Goal Reached!
                          </p>
                          <p className="text-xs text-green-700 mb-3">
                            Finalize to claim funds and distribute NFTs & reputation to all backers.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-amber-800 font-semibold mb-2 text-sm">
                            💰 Campaign Ended
                          </p>
                          <p className="text-xs text-amber-700 mb-3">
                            Goal not reached. Finalize to automatically refund all contributors.
                          </p>
                        </>
                      )}
                      <button
                        onClick={handleFinalize}
                        disabled={isFinalizePending || isFinalizeConfirming}
                        className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition w-full disabled:opacity-50 disabled:cursor-not-allowed ${
                          goalReached 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        {isFinalizePending || isFinalizeConfirming ? "Processing..." : "Finalize Project"}
                      </button>
                      {finalizeHash && (
                        <div className="mt-3 text-xs">
                          <a
                            href={`https://sepolia.basescan.org/tx/${finalizeHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={goalReached ? "text-green-700 hover:underline" : "text-amber-700 hover:underline"}
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
