"use client";

import Link from "next/link";
import Image from "next/image";
import { ReputationBadge } from "./ReputationBadge";
import { UserAvatar } from "./UserAvatar";
import { formatEther } from "viem";
import { Icon } from "./Icon";

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
    category?: string;
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
  if (!project || project.goal === undefined || project.fundsRaised === undefined || project.deadline === undefined) {
    console.error("Invalid project data in ProjectCard:", project);
    return null;
  }

  const safeProject = {
    ...project,
    fundsRaised: project.fundsRaised ?? BigInt(0),
    description: project.description ?? "",
    imageUrl: project.imageUrl ?? "",
    category: project.category ?? "",
    cofounders: project.cofounders ?? [],
  };

  const progress = Number(safeProject.fundsRaised) / Number(safeProject.goal);
  const progressPercent = Math.min(progress * 100, 100);

  const now = Math.floor(Date.now() / 1000);
  const isActive = now < Number(safeProject.deadline);
  const daysRemaining = Math.max(0, Math.ceil((Number(safeProject.deadline) - now) / 86400));

  const goalEth = formatEther(safeProject.goal);
  const raisedEth = formatEther(safeProject.fundsRaised);
  const projectImage = safeProject.imageUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80";

  return (
    <div className="group rounded-3xl border border-gray-100 bg-white/80 p-3 shadow-[0_18px_40px_-24px_rgba(79,70,229,0.4)] transition-shadow hover:shadow-[0_28px_60px_-30px_rgba(79,70,229,0.55)]">
      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Image
          src={projectImage}
          alt={safeProject.title}
          fill
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 280px, 100vw"
        />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-500 shadow">
              #{safeProject.id.toString()}
            </span>
            {safeProject.category && (
              <span className="rounded-full bg-indigo-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
                {safeProject.category}
              </span>
            )}
          </div>
          {isLoadingReputation ? (
            <div className="h-7 w-24 rounded-full bg-white/70 animate-pulse" />
          ) : (
            <ReputationBadge reputation={creatorReputation} />
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{safeProject.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {safeProject.description || "Sin descripción todavía. ¡Cuéntale al mundo por qué deberían apoyarte!"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UserAvatar address={safeProject.creator} size="sm" showReputation={false} />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">Creador</p>
            <p className="font-mono text-sm font-semibold text-gray-700">
              {safeProject.creator.slice(0, 6)}...{safeProject.creator.slice(-4)}
            </p>
          </div>
          {safeProject.cofounders && safeProject.cofounders.length > 0 && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              +{safeProject.cofounders.length} cofounder{safeProject.cofounders.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="space-y-2 rounded-2xl bg-gray-50/80 p-2.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-700">Recaudado</span>
            <span className="font-semibold text-gray-900">
              {raisedEth} / {goalEth} ETH
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-400">
            <span>{progressPercent.toFixed(0)}% completado</span>
            <span>
              {isActive
                ? `${daysRemaining} día${daysRemaining === 1 ? "" : "s"} restantes`
                : safeProject.claimed
                ? "Fondos reclamados"
                : "Campaña finalizada"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/project/${safeProject.id}`}
            className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
          >
            Ver Proyecto
          </Link>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:border-indigo-500 hover:text-indigo-600"
          >
            <Icon name="sparkles" size="xs" />
            Inspirar
          </button>
        </div>
      </div>
    </div>
  );
}
