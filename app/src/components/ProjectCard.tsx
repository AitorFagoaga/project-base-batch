"use client";

import Link from "next/link";
import Image from "next/image";
import { ReputationBadge } from "./ReputationBadge";
import { UserAvatar } from "./UserAvatar";
import { formatEther } from "viem";

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
  // Validar que el proyecto tenga todas las propiedades requeridas
  if (!project || project.goal === undefined || project.fundsRaised === undefined || project.deadline === undefined) {
    console.error('Invalid project data in ProjectCard:', project);
    return null;
  }
  
  // Asegurar valores por defecto
  const safeProject = {
    ...project,
    fundsRaised: project.fundsRaised ?? BigInt(0),
    description: project.description ?? '',
    imageUrl: project.imageUrl ?? '',
    cofounders: project.cofounders ?? [],
  };

  const progress = Number(safeProject.fundsRaised) / Number(safeProject.goal);
  const progressPercent = Math.min(progress * 100, 100);

  const now = Math.floor(Date.now() / 1000);
  const deadlineDate = new Date(Number(safeProject.deadline) * 1000);
  const isActive = now < Number(safeProject.deadline);
  const daysRemaining = Math.max(
    0,
    Math.ceil((Number(safeProject.deadline) - now) / 86400)
  );

  const goalEth = formatEther(safeProject.goal);
  const raisedEth = formatEther(safeProject.fundsRaised);

  const projectImage = safeProject.imageUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80";

  return (
    <div className="card hover:shadow-xl transition-all duration-200 overflow-hidden p-0">
      {/* Project Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-purple-400 to-pink-400">
        <Image
          src={projectImage}
          alt={safeProject.title}
          fill
          className="object-cover"
          unoptimized
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80";
          }}
        />
        {/* Reputation Badge Overlay */}
        <div className="absolute top-3 right-3">
          {isLoadingReputation ? (
            <div className="h-6 w-20 bg-white/80 rounded animate-pulse"></div>
          ) : (
            <ReputationBadge reputation={creatorReputation} />
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {safeProject.title}
        </h3>

        {/* Description */}
        {safeProject.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {safeProject.description}
          </p>
        )}

        {/* Creator & Co-founders */}
        <div className="flex items-center gap-2 mb-4">
          <UserAvatar address={safeProject.creator} size="sm" showReputation={false} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Creador</p>
            <p className="text-sm font-medium text-gray-900 truncate font-mono">
              {safeProject.creator.slice(0, 6)}...{safeProject.creator.slice(-4)}
            </p>
          </div>
          {safeProject.cofounders && safeProject.cofounders.length > 0 && (
            <div className="flex -space-x-2">
              {safeProject.cofounders.slice(0, 3).map((cofounder, idx) => (
                <div key={idx} className="relative" title={`Co-founder: ${cofounder}`}>
                  <UserAvatar address={cofounder} size="sm" showReputation={false} />
                </div>
              ))}
              {safeProject.cofounders.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">
                    +{safeProject.cofounders.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-semibold">
              {raisedEth} / {goalEth} ETH
            </span>
            <span className="font-bold text-purple-600">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Status & CTA */}
        <div className="flex items-center justify-between gap-3">
          {isActive ? (
            <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
              ⏰ {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
            </span>
          ) : safeProject.claimed ? (
            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
              ✓ Financiado
            </span>
          ) : (
            <span className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
              ⏱️ Finalizado
            </span>
          )}

          <Link
            href={`/project/${safeProject.id}`}
            className="btn-primary text-sm py-2 px-4"
          >
            Ver Proyecto →
          </Link>
        </div>
      </div>
    </div>
  );
}
