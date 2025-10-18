"use client";

import { useParams } from "next/navigation";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ReputationBadge } from "@/components/ReputationBadge";
import { FundForm } from "@/components/FundForm";
import Link from "next/link";
import { formatEther } from "viem";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = BigInt(params?.id as string);
  const { address } = useAccount();

  // Read project details
  const { data: project, refetch: refetchProject } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getProject",
    args: [projectId],
  });

  // Read creator reputation
  const { data: reputation } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: project ? [project.creator] : undefined,
  });

  // Claim funds
  const { writeContract, data: claimHash, isPending } = useWriteContract();
  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const handleClaim = () => {
    writeContract({
      address: CONTRACTS.launchpad.address,
      abi: CONTRACTS.launchpad.abi,
      functionName: "claimFunds",
      args: [projectId],
    });

    toast.success("Claim transaction submitted!");
  };

  if (!project) {
    return <div className="text-center py-16">Loading project...</div>;
  }

  const now = Math.floor(Date.now() / 1000);
  const isActive = now < Number(project.deadline);
  const goalReached = project.fundsRaised >= project.goal;
  const canClaim = !isActive && goalReached && !project.claimed && address?.toLowerCase() === project.creator.toLowerCase();

  const progress = Number(project.fundsRaised) / Number(project.goal);
  const progressPercent = Math.min(progress * 100, 100);

  const deadlineDate = new Date(Number(project.deadline) * 1000);
  const daysRemaining = Math.max(0, Math.ceil((Number(project.deadline) - now) / 86400));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 Meritocratic Launchpad
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Reputation-based crowdfunding on Base Sepolia
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back to Projects
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NetworkGuard>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Info */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {project.title}
                  </h2>
                  <ReputationBadge reputation={reputation || BigInt(0)} />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="font-semibold">
                      {formatEther(project.fundsRaised)} / {formatEther(project.goal)} ETH
                    </span>
                    <span className="font-semibold">{progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-bold">
                      {project.claimed ? (
                        <span className="text-green-600">✓ Funded</span>
                      ) : isActive ? (
                        <span className="text-blue-600">Active</span>
                      ) : goalReached ? (
                        <span className="text-green-600">Goal Reached</span>
                      ) : (
                        <span className="text-red-600">Ended</span>
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="text-lg font-bold">
                      {isActive ? `${daysRemaining} days left` : deadlineDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Project Creator</p>
                  <p className="font-mono text-sm text-gray-900">{project.creator}</p>
                </div>

                {canClaim && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium mb-3">
                      🎉 Congratulations! You can claim your funds now.
                    </p>
                    <button
                      onClick={handleClaim}
                      disabled={isPending || isClaimConfirming}
                      className="btn-primary"
                    >
                      {isPending || isClaimConfirming ? "Claiming..." : "Claim Funds"}
                    </button>

                    {claimHash && (
                      <div className="mt-3 text-sm">
                        <a
                          href={`https://sepolia.basescan.org/tx/${claimHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          View transaction on BaseScan ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Funding Form */}
            <div>
              {isActive && !project.claimed ? (
                <FundForm projectId={projectId} onSuccess={() => refetchProject()} />
              ) : (
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">Funding Closed</h3>
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
        </NetworkGuard>
      </main>
    </div>
  );
}
