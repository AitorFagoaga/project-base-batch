"use client";

/**
 * Reputation badge component with visual tiers
 */
interface ReputationBadgeProps {
  reputation: bigint;
  className?: string;
}

export function ReputationBadge({ reputation, className = "" }: ReputationBadgeProps) {
  const rep = Number(reputation);

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
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} ${className}`}
      title={`Reputation: ${rep} points`}
    >
      <span>{icon}</span>
      <span>{tier}</span>
      <span className="font-bold">{rep}</span>
    </div>
  );
}
