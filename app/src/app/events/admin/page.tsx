"use client";

import { useMemo } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EVENT_MANAGER } from "@/lib/eventManager";
import toast from "react-hot-toast";

type EventTuple = [bigint, `0x${string}`, string, string, string, bigint, string, number, string];

export default function AdminEventsPage() {
  const { address } = useAccount();
  const { data: adminRole } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "ADMIN_ROLE" });
  const { data: isAdmin } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "hasRole", args: [adminRole as any, address as any], query: { enabled: !!address && !!adminRole } });

  const { data: total } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "eventCount" });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function PendingRow({ id }: { id: number }) {
    const { data } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "getEvent", args: [BigInt(id)] });
    const e = data as unknown as EventTuple | undefined;
    if (!e || Number(e[0]) === 0 || e[7] !== 1) return null;
    const title = e[2];
    const description = e[3];
    const location = e[4];
    const datetime = Number(e[5]);
    const date = new Date(datetime * 1000);
    const approve = () => writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "approveEvent", args: [BigInt(id)] });
    const reject = () => { const reason = prompt("Motivo del rechazo:") || ""; writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "rejectEvent", args: [BigInt(id), reason] }); };
    return (
      <div className="rounded-xl border border-gray-200 p-4 bg-white flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600 line-clamp-1">{description}</div>
          <div className="text-xs text-gray-500">📍 {location || "—"} · 🗓️ {date.toLocaleDateString()}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={reject} disabled={isPending || isConfirming}>Rechazar</button>
          <button className="btn-primary" onClick={approve} disabled={isPending || isConfirming}>Aprobar</button>
        </div>
      </div>
    );
  }

  const approve = (id: number) => {
    writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "approveEvent", args: [BigInt(id)] });
  };
  const reject = (id: number) => {
    const reason = prompt("Motivo del rechazo:") || "";
    writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "rejectEvent", args: [BigInt(id), reason] });
  };

  return (
    <SharedPageLayout title="Admin de Eventos" description="Aprueba o rechaza solicitudes de eventos.">
      {!address ? (
        <div className="admin-card text-center py-16">Conecta tu wallet para continuar.</div>
      ) : !isAdmin ? (
        <div className="admin-card text-center py-16">Acceso restringido a administradores.</div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pendientes</h3>
          {Array.from({ length: Number(total || BigInt(0)) }, (_, i) => i + 1).map((id) => (
            <PendingRow key={id} id={id} />
          ))}
        </div>
      )}
    </SharedPageLayout>
  );
}
