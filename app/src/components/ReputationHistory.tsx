"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useReadContract } from "wagmi";
import { parseAbiItem } from "viem";
import { CONTRACTS } from "@/lib/contracts";
import { EVENT_MANAGER } from "@/lib/eventManager";

interface ReputationHistoryProps {
  address: `0x${string}`;
}

type GenesisAward = { amount: bigint; category: string; reason: string; timestamp: bigint };

export function ReputationHistory({ address }: Readonly<ReputationHistoryProps>) {
  // 1) Genesis history (from Reputation contract storage)
  const { data: genesisData } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "getGenesisHistory",
    args: [address],
  });

  const genesis = useMemo<GenesisAward[]>(() => {
    if (!genesisData) return [];
    // viem v2 may return array of objects or tuples
    const raw = genesisData as any[];
    return raw.map((it: any) => ({
      amount: BigInt(it.amount ?? it[0] ?? 0),
      category: String(it.category ?? it[1] ?? ""),
      reason: String(it.reason ?? it[2] ?? ""),
      timestamp: BigInt(it.timestamp ?? it[3] ?? 0),
    }));
  }, [genesisData]);

  // 2) Boost logs (BoostGiven) - Optimized to avoid RPC overload
  const publicClient = usePublicClient();
  const [boosts, setBoosts] = useState<{ booster: `0x${string}`; power: bigint; blockNumber: bigint }[]>([]);
  const [isLoadingBoosts, setIsLoadingBoosts] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadBoosts() {
      if (!publicClient || isLoadingBoosts) return;
      setIsLoadingBoosts(true);
      try {
        const latest = await publicClient.getBlockNumber();
        // Reduced from 500000 to 10000 blocks to avoid RPC overload
        const from = latest > 10000n ? latest - 10000n : 0n;
        const event = parseAbiItem(
          "event BoostGiven(address indexed booster, address indexed recipient, uint256 power)"
        );
        const logs = await publicClient.getLogs({
          address: CONTRACTS.reputation.address,
          event,
          args: { recipient: address },
          fromBlock: from,
          toBlock: latest,
        });
        if (!ignore) {
          setBoosts(
            logs.map((l) => ({
              booster: (l.args?.booster ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
              power: BigInt(l.args?.power ?? 0),
              blockNumber: l.blockNumber ?? 0n,
            }))
          );
        }
      } catch (e) {
        console.error("Error loading boosts:", e);
      } finally {
        setIsLoadingBoosts(false);
      }
    }
    loadBoosts();
    return () => { ignore = true; };
  }, [publicClient, address]);

  // 3) Medal claims (EventManager)
  const [medalClaims, setMedalClaims] = useState<{
    eventId: number;
    medalId: number;
    name: string;
    iconUrl: string;
    blockNumber: bigint;
  }[]>([]);

  useEffect(() => {
    let ignore = false;
    async function loadClaims() {
      if (!publicClient || !EVENT_MANAGER.address) return;
      try {
        const latest = await publicClient.getBlockNumber();
        const from = latest > 500000n ? latest - 500000n : 0n;
        const event = parseAbiItem(
          "event MedalClaimed(uint256 indexed eventId, uint256 indexed medalId, address indexed claimer)"
        );
        const logs = await publicClient.getLogs({
          address: EVENT_MANAGER.address,
          event,
          args: { claimer: address },
          fromBlock: from,
          toBlock: latest,
        });

        // For each medalId, fetch details
        const items: {
          eventId: number;
          medalId: number;
          name: string;
          iconUrl: string;
          blockNumber: bigint;
        }[] = [];
        for (const l of logs) {
          const medalId = Number(l.args?.medalId || 0n);
          const eventId = Number(l.args?.eventId || 0n);
          try {
            const m = (await publicClient.readContract({
              address: EVENT_MANAGER.address,
              abi: EVENT_MANAGER.abi,
              functionName: "getMedal",
              args: [BigInt(medalId)],
            })) as any;
            const name = String(m?.name ?? m?.[2] ?? "");
            const iconUrl = String(m?.iconUrl ?? m?.[4] ?? "");
            items.push({ eventId, medalId, name, iconUrl, blockNumber: l.blockNumber ?? 0n });
          } catch {}
        }
        if (!ignore) setMedalClaims(items);
      } catch (e) {
        // silent
      }
    }
    loadClaims();
    return () => { ignore = true; };
  }, [publicClient, address]);

  // 4) Merge simple timeline
  const boostIcon = "https://cdn-icons-png.flaticon.com/512/1828/1828884.png";
  const investIcon = "https://cdn-icons-png.flaticon.com/512/3135/3135706.png";
  const timeline = useMemo(() => {
    const items: { type: "genesis" | "boost" | "medal"; title: string; sub?: string; icon?: string; when?: bigint }[] = [];
    for (const g of genesis) {
      const isInvest = (g.category || "").toUpperCase() === "INVESTMENT";
      items.push({
        type: "genesis",
        title: isInvest ? "Medalla de Inversor" : (g.reason || g.category || "Genesis award"),
        sub: `${g.amount.toString()} pts`,
        icon: isInvest ? investIcon : undefined,
        when: g.timestamp,
      });
    }
    for (const b of boosts) {
      const short = `${b.booster.slice(0, 6)}...${b.booster.slice(-4)}`;
      items.push({ type: "boost", title: `Boost de ${short}`, sub: `+${b.power.toString()} pts`, icon: boostIcon, when: b.blockNumber });
    }
    for (const m of medalClaims) {
      items.push({ type: "medal", title: m.name || `Medalla #${m.medalId}`, icon: m.iconUrl, when: m.blockNumber });
    }
    return items.sort((a, b) => Number((b.when ?? 0n) - (a.when ?? 0n)));
  }, [genesis, boosts, medalClaims]);

  if (timeline.length === 0) return null;

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Historial de Reputación</h3>
        <p className="text-sm text-gray-600">Cómo fue obtenida la reputación de este usuario</p>
      </div>
      <div className="space-y-3">
        {timeline.map((it, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            {it.icon ? (
              <img src={it.icon} alt="icon" className="w-10 h-10 rounded object-cover" />
            ) : (
              <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg">🏅</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{it.title}</div>
              {it.sub ? <div className="text-xs text-gray-500">{it.sub}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
