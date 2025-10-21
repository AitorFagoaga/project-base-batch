"use client";

/**
 * Reputation badge component with visual tiers
 */
interface ReputationBadgeProps {
  reputation: bigint;
  genesisReputation?: bigint;
  className?: string;
  showGenesis?: boolean;
}

export function ReputationBadge({
  reputation,
  genesisReputation,
  className = "",
  showGenesis = false,
}: ReputationBadgeProps) {
  const rep = Number(reputation);
  const genesis = Number(genesisReputation || 0n);
  const hasGenesis = genesis > 0;

  // Determine tier and styling
  let tier = "Newcomer";
  let bgColor = "bg-gray-200";
  let textColor = "text-gray-700";
  let icon = "🌱";

  if (rep >= 500) {
    tier = "Legend";
    bgColor = "bg-purple-200";
    textColor = "text-purple-800";
    icon = "👑";
  } else if (rep >= 200) {
    tier = "Expert";
    bgColor = "bg-blue-200";
    textColor = "text-blue-800";
    icon = "⭐";
  } else if (rep >= 50) {
    tier = "Builder";
    bgColor = "bg-green-200";
    textColor = "text-green-800";
    icon = "🔨";
  } else if (rep >= 10) {
    tier = "Contributor";
    bgColor = "bg-yellow-200";
    textColor = "text-yellow-800";
    icon = "✨";
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}
        title={`Reputation: ${rep} points`}
      >
        <span>{icon}</span>
        <span>{tier}</span>
        <span className="font-bold">{rep}</span>
      </div>

      {showGenesis && hasGenesis && (
        <div
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300"
          title={`Genesis Verified: ${genesis} points from verified achievements`}
        >
          <span>🔒</span>
          <span className="font-semibold">Verified</span>
        </div>
      )}
    </div>
  );
}
