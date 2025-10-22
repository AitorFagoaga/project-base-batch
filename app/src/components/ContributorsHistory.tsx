"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { formatEther } from "viem";
import { UserAvatar } from "./UserAvatar";

interface ContributorsHistoryProps {
  projectId: bigint;
}

export function ContributorsHistory({ projectId }: Readonly<ContributorsHistoryProps>) {
  // Get list of contributors
  const { data: contributorsData } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getContributors",
    args: [projectId],
  });

  const contributors = contributorsData as `0x${string}`[] | undefined;

  if (!contributors || contributors.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No investors yet
        </h3>
        <p className="text-gray-600 text-sm">
          Be the first to support this project
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💰</span>
          <h3 className="text-xl font-bold text-gray-900">
            Investor History
          </h3>
        </div>
        <p className="text-gray-600 text-sm">
          {contributors.length} {contributors.length === 1 ? 'investor' : 'investors'} supporting this project
        </p>
      </div>

      <div className="space-y-3">
        {contributors.map((address) => (
          <ContributorItem key={address} address={address} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}

interface ContributorItemProps {
  address: `0x${string}`;
  projectId: bigint;
}

function ContributorItem({ address, projectId }: Readonly<ContributorItemProps>) {
  // Get contribution amount
  const { data: contributionData } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "getContribution",
    args: [projectId, address],
  });

  // Check if anonymous
  const { data: isAnonymousData } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "isContributionAnonymous",
    args: [projectId, address],
  });

  // Get reputation only if not anonymous
  const { data: reputationData } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: [address],
    query: {
      enabled: !isAnonymousData,
    },
  });

  const amount = typeof contributionData === 'bigint' 
    ? contributionData 
    : contributionData 
      ? BigInt(contributionData as unknown as string)
      : BigInt(0);
  const isAnonymous = isAnonymousData === true;
  const reputation = reputationData ? Number(reputationData) : 0;

  // Determine reputation badge
  let repBadge = "";
  let repColor = "";
  if (!isAnonymous && reputation > 0) {
    if (reputation >= 500) {
      repBadge = "👑 Legend";
      repColor = "bg-purple-100 text-purple-800";
    } else if (reputation >= 200) {
      repBadge = "⭐ Expert";
      repColor = "bg-blue-100 text-blue-800";
    } else if (reputation >= 50) {
      repBadge = "🔨 Builder";
      repColor = "bg-green-100 text-green-800";
    } else if (reputation >= 10) {
      repBadge = "✨ Contributor";
      repColor = "bg-yellow-100 text-yellow-800";
    } else {
      repBadge = "🌱 Newcomer";
      repColor = "bg-gray-100 text-gray-800";
    }
  }

  if (isAnonymous) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
            ❓
          </div>
          <div>
            <p className="font-semibold text-gray-900">Anonymous Investor</p>
            <p className="text-xs text-gray-500">Private identity</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 text-lg">
            {formatEther(amount)} ETH
          </p>
          <p className="text-xs text-gray-500">Contribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <UserAvatar address={address} size="md" showReputation={false} clickable={true} />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm text-gray-900 truncate">
            {address.slice(0, 10)}...{address.slice(-8)}
          </p>
          {repBadge && (
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${repColor}`}>
              {repBadge} · {reputation} pts
            </span>
          )}
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="font-bold text-indigo-600 text-lg">
          {formatEther(amount)} ETH
        </p>
        <p className="text-xs text-gray-500">Contribución</p>
      </div>
    </div>
  );
}
