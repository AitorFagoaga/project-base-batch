"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { EVENT_MANAGER } from "@/lib/eventManager";
import { Icon } from "@/components/Icon";
import Link from "next/link";

interface UserMedalsGalleryProps {
  address: `0x${string}`;
  isOwnProfile: boolean;
}

interface MedalData {
  medalId: number;
  eventId: number;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  blockNumber: bigint;
}

const FALLBACK_MEDAL_IMAGE = "https://cdn-icons-png.flaticon.com/512/1304/1304061.png";

export function UserMedalsGallery({ address, isOwnProfile }: UserMedalsGalleryProps) {
  const publicClient = usePublicClient();
  const [medals, setMedals] = useState<MedalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const sectionTitle = useMemo(
    () => (isOwnProfile ? "Tus Medallas" : "Medallas Obtenidas"),
    [isOwnProfile]
  );

  const helperText = useMemo(
    () =>
      isOwnProfile
        ? "Medallas que has ganado al participar en eventos y actividades de la comunidad."
        : "Explora las medallas obtenidas por este usuario en eventos y actividades.",
    [isOwnProfile]
  );

  useEffect(() => {
    let ignore = false;

    async function loadMedals() {
      // Wait for publicClient to be available
      if (!publicClient) {
        console.log("⏳ UserMedalsGallery: Waiting for publicClient...");
        return;
      }

      // Check if EVENT_MANAGER address is configured
      if (!EVENT_MANAGER.address || EVENT_MANAGER.address === ("" as `0x${string}`)) {
        console.error("❌ UserMedalsGallery: EVENT_MANAGER.address is not configured");
        if (!ignore) {
          setError("El contrato de medallas no está configurado");
          setIsLoading(false);
        }
        return;
      }

      console.log("🔍 UserMedalsGallery: Loading medals for", address);
      console.log("📍 EVENT_MANAGER address:", EVENT_MANAGER.address);

      try {
        setIsLoading(true);
        setError(null);

        const latest = await publicClient.getBlockNumber();
        // Reduced from 500000 to 10000 to avoid RPC timeouts/503 errors
        const from = latest > BigInt(10000) ? latest - BigInt(10000) : BigInt(0);

        console.log(`📦 Scanning blocks ${from} to ${latest}`);

        const event = parseAbiItem(
          "event MedalClaimed(uint256 indexed eventId, uint256 indexed medalId, address indexed claimer)"
        );

        const logs = await publicClient.getLogs({
          address: EVENT_MANAGER.address as `0x${string}`,
          event,
          args: { claimer: address },
          fromBlock: from,
          toBlock: latest,
        });

        console.log(`✅ Found ${logs.length} medal claim events`);

        const medalDetails: MedalData[] = [];

        for (const log of logs) {
          const medalId = Number(log.args?.medalId || BigInt(0));
          const eventId = Number(log.args?.eventId || BigInt(0));

          console.log(`🏅 Fetching details for medal ${medalId} from event ${eventId}`);

          try {
            const medalData = (await publicClient.readContract({
              address: EVENT_MANAGER.address as `0x${string}`,
              abi: EVENT_MANAGER.abi,
              functionName: "getMedal",
              args: [BigInt(medalId)],
            })) as any;

            const name = String(medalData?.name ?? medalData?.[2] ?? "");
            const description = String(medalData?.description ?? medalData?.[3] ?? "");
            const iconUrl = String(medalData?.iconUrl ?? medalData?.[4] ?? "");
            const points = Number(medalData?.points ?? medalData?.[5] ?? 0);

            console.log(`  ✓ Medal: "${name}" (${points} pts)`);

            medalDetails.push({
              medalId,
              eventId,
              name,
              description,
              iconUrl,
              points,
              blockNumber: log.blockNumber ?? BigInt(0),
            });
          } catch (err) {
            console.error(`❌ Error fetching medal ${medalId}:`, err);
          }
        }

        if (!ignore) {
          // Sort by block number (most recent first)
          const sorted = medalDetails.sort((a, b) => Number(b.blockNumber - a.blockNumber));
          setMedals(sorted);
          console.log(`✅ Loaded ${sorted.length} medals successfully`);
        }
      } catch (err) {
        console.error("❌ Error loading medals:", err);

        // Check if it's an RPC error (503, timeout, etc.)
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isRpcError = errorMessage.includes("503") ||
                          errorMessage.includes("HTTP request failed") ||
                          errorMessage.includes("no backend") ||
                          errorMessage.includes("timeout");

        if (!ignore) {
          if (isRpcError) {
            setError("El servicio de blockchain está temporalmente no disponible. Por favor, intenta de nuevo en unos momentos.");
          } else {
            setError(`Error: ${errorMessage}`);
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadMedals();
    return () => {
      ignore = true;
    };
  }, [publicClient, address, retryCount]);

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Icon name="award" size="lg" className="text-yellow-500" />
              {sectionTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{helperText}</p>
          </div>
          <div className="rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold px-4 py-1">
            Cargando...
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white/80 shadow-lg p-4 space-y-4"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-200" />
              <div className="h-5 w-1/2 rounded-full bg-gray-200" />
              <div className="h-4 w-3/4 rounded-full bg-gray-100" />
              <div className="h-4 w-1/3 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  if (error) {
    return (
      <div className="mb-12 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold mb-2 text-rose-700">
              <Icon name="alert" size="sm" />
              No pudimos cargar las medallas
            </div>
            <p className="text-sm text-rose-600/80 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Icon name="loader" size="sm" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="award" size="lg" className="text-yellow-500" />
            {sectionTitle}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{helperText}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-yellow-50 px-4 py-1.5 text-xs font-semibold text-yellow-600 border border-yellow-200">
            {medals.length} Medalla{medals.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {medals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-yellow-200 bg-yellow-50/40 px-8 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <Icon name="award" size="lg" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Aún no hay medallas
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
            {isOwnProfile
              ? "Participa en eventos y actividades de la comunidad para ganar medallas."
              : "Cuando este usuario gane medallas, aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {medals.map((medal) => (
            <div
              key={`${medal.medalId}-${medal.blockNumber}`}
              className="group overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-[0_18px_40px_-24px_rgba(234,179,8,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-28px_rgba(234,179,8,0.55)]"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 p-8 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={medal.iconUrl || FALLBACK_MEDAL_IMAGE}
                  alt={medal.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_MEDAL_IMAGE;
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    +{medal.points} pts
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{medal.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {medal.description || "Medalla obtenida por participación en evento"}
                  </p>
                </div>

                <div className="rounded-2xl bg-yellow-50/70 border border-yellow-100 px-4 py-3">
                  <p className="text-xs uppercase text-gray-400 tracking-wide mb-1">Reputación ganada</p>
                  <p className="text-sm font-semibold text-yellow-600">
                    +{medal.points} puntos
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/events/${medal.eventId}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-yellow-600"
                  >
                    <Icon name="calendar" size="xs" />
                    Ver evento
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
