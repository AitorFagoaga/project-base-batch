"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { formatEther } from "viem";
import { UserAvatar } from "./UserAvatar";
import { Users } from "lucide-react";

interface ProjectInvestorsProps {
  projectId: bigint;
}

export function ProjectInvestors({ projectId }: Readonly<ProjectInvestorsProps>) {
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
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Investors
          </h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-sm text-gray-600">
            No investors yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Be the first to support
          </p>
        </div>
      </div>
    );
  }

  // Show top 6 investors
  const topInvestors = contributors.slice(0, 6);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Investors
        </h3>
        <span className="ml-auto text-xs font-semibold text-gray-400">
          {contributors.length} total
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topInvestors.map((address) => (
          <InvestorCard key={address} address={address} projectId={projectId} />
        ))}
      </div>

      {contributors.length > 6 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            +{contributors.length - 6} more investor{contributors.length - 6 > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

interface InvestorCardProps {
  address: `0x${string}`;
  projectId: bigint;
}

function InvestorCard({ address, projectId }: Readonly<InvestorCardProps>) {
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

  const amount = typeof contributionData === 'bigint'
    ? contributionData
    : contributionData
      ? BigInt(contributionData as unknown as string)
      : BigInt(0);
  const isAnonymous = isAnonymousData === true;

  if (isAnonymous) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
            ?
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-600 truncate">
              Anonymous
            </p>
            <p className="text-xs text-gray-400">
              Private investor
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">Contribution</p>
          <p className="text-sm font-bold text-gray-900">
            {formatEther(amount)} ETH
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border-2 border-indigo-100 hover:border-indigo-300 transition-colors p-3">
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar address={address} size="sm" showReputation={false} clickable={true} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono font-semibold text-gray-900 truncate">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p className="text-xs text-gray-500">
            Supporter
          </p>
        </div>
      </div>
      <div className="pt-2 border-t border-indigo-100">
        <p className="text-xs text-gray-500">Contribution</p>
        <p className="text-sm font-bold text-indigo-600">
          {formatEther(amount)} ETH
        </p>
      </div>
    </div>
  );
}
