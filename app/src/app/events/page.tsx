"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EVENT_MANAGER } from "@/lib/eventManager";

function useTotalEvents() {
  const { data: total } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "eventCount" });
  return Number((total as bigint) || 0n);
}

function EventCard({ id }: { id: number }) {
  const { data } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "getEvent", args: [BigInt(id)] });
  const e = data as unknown as [bigint, `0x${string}`, string, string, string, bigint, string, number, string] | undefined;
  if (!e || Number(e[0]) === 0 || e[7] !== 2) return null;
  const title = e[2];
  const description = e[3];
  const location = e[4];
  const datetime = Number(e[5]);
  const timeText = e[6];
  const date = new Date(datetime * 1000);
  return (
    <Link href={`/events/${id}`} className="block rounded-2xl p-6 bg-white shadow ring-1 ring-gray-100 hover:shadow-md transition">
      <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-600 line-clamp-2 mb-3">{description}</p>
      <div className="text-sm text-gray-500">
        <span className="mr-4">📍 {location || "—"}</span>
        <span>🗓️ {date.toLocaleDateString()} {timeText || ""}</span>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const total = useTotalEvents();
  const { address } = useAccount();
  const { data: adminRole } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "ADMIN_ROLE" });
  const { data: isAdmin } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "hasRole", args: [adminRole as any, address as any], query: { enabled: !!address && !!adminRole } });

  return (
    <SharedPageLayout
      title="Eventos"
      description="Crea y descubre eventos con medallas reclamables mediante QR."
    >
      <div className="flex items-center justify-between">
        <p className="text-gray-600">{total} eventos</p>
        <div className="flex gap-2">
          {isAdmin ? <Link href="/events/admin" className="btn-secondary">Admin</Link> : null}
          <Link href="/events/create" className="btn-primary">Crear evento</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: total }, (_, i) => i + 1).map((id) => (
          <EventCard key={id} id={id} />
        ))}
      </div>
    </SharedPageLayout>
  );
}
