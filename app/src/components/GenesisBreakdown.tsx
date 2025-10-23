"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";

interface GenesisBreakdownProps {
  address: `0x${string}`;
}

interface GenesisAward {
  amount: bigint;
  category: string;
  reason: string;
  timestamp: bigint;
}

const CATEGORY_CONFIG: Record<string, { icon: string; label: string; color: string; isUrl?: boolean }> = {
  HACKATHON: { icon: "🏆", label: "Hackathon", color: "bg-yellow-100 text-yellow-800" },
  OSS: { icon: "💻", label: "Open Source", color: "bg-green-100 text-green-800" },
  DAO: { icon: "🏛️", label: "DAO", color: "bg-purple-100 text-purple-800" },
  BUILDER: { icon: "🔨", label: "Builder", color: "bg-blue-100 text-blue-800" },
  INVESTMENT: { icon: "💰", label: "Investment", color: "bg-emerald-100 text-emerald-800" },
  CUSTOM: { icon: "https://cdn-icons-png.flaticon.com/512/4151/4151213.png", label: "Inspiration", color: "bg-amber-100 text-amber-800", isUrl: true },
  MEDAL: { icon: "https://png.pngtree.com/png-vector/20220729/ourmid/pngtree-champion-award-medal-icon-png-image_6091841.png", label: "Medal", color: "bg-amber-100 text-amber-800", isUrl: true },
};

export function GenesisBreakdown({ address }: GenesisBreakdownProps) {
  // Read reputation breakdown
  const { data: totalRep } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: [address],
  });

  const { data: genesisRep } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "genesisReputationOf",
    args: [address],
  });

  const { data: boostRep } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "boostReputationOf",
    args: [address],
  });

  const { data: genesisHistory } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "getGenesisHistory",
    args: [address],
  });

  const total = Number(totalRep || BigInt(0));
  const genesis = Number(genesisRep || BigInt(0));
  const boost = Number(boostRep || BigInt(0));

  const genesisPercentage = total > 0 ? Math.round((genesis / total) * 100) : 0;
  const boostPercentage = total > 0 ? Math.round((boost / total) * 100) : 0;

  // Group awards by category
  const categoryTotals: Record<string, number> = {};
  if (genesisHistory) {
    (genesisHistory as GenesisAward[]).forEach((award) => {
      const cat = award.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(award.amount);
    });
  }

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">Reputation Breakdown</h3>

      {/* Total Breakdown */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Genesis (Layer 1)</span>
            <span className="font-bold text-purple-600">
              {genesis} ({genesisPercentage}%)
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${genesisPercentage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Boosts (Layer 2)</span>
            <span className="font-bold text-blue-600">
              {boost} ({boostPercentage}%)
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${boostPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Genesis Categories */}
      {genesis > 0 && (
        <>
          <h4 className="text-md font-semibold mb-3 text-gray-900">
            Genesis Achievements
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(categoryTotals).map(([category, amount]) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.MEDAL;
              return (
                <div
                  key={category}
                  className={`p-3 rounded-lg ${config.color} flex items-center gap-2`}
                >
                  {config.isUrl ? (
                    <img src={config.icon} alt={config.label} className="w-8 h-8" />
                  ) : (
                    <span className="text-2xl">{config.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{config.label}</p>
                    <p className="text-lg font-bold">{amount}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Genesis History */}
          <h4 className="text-md font-semibold mb-3 text-gray-900">
            Award History
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {genesisHistory && (genesisHistory as GenesisAward[]).length > 0 ? (
              (genesisHistory as GenesisAward[])
                .slice()
                .reverse()
                .map((award, index) => {
                  const config =
                    CATEGORY_CONFIG[award.category] || CATEGORY_CONFIG.MEDAL;
                  const date = new Date(Number(award.timestamp) * 1000);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {config.isUrl ? (
                        <img src={config.icon} alt={config.label} className="w-8 h-8 flex-shrink-0" />
                      ) : (
                        <span className="text-2xl flex-shrink-0">{config.icon}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            +{String(award.amount)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{award.reason}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {date.toLocaleDateString()} {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No Genesis awards yet
              </p>
            )}
          </div>
        </>
      )}

      {genesis === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-3">🌱</div>
          <p className="text-gray-600">No Genesis reputation yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Genesis points are awarded for verified achievements
          </p>
        </div>
      )}
    </div>
  );
}
