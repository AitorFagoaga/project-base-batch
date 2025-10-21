"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EVENT_MANAGER } from "@/lib/eventManager";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { MedalQR } from "@/components/MedalQR";
import toast from "react-hot-toast";

type EventTuple = [bigint, `0x${string}`, string, string, string, bigint, string, number, string];
type MedalTuple = [bigint, bigint, string, string, string, number, number, number, boolean];

export default function EventDetailsPage() {
  const params = useParams();
  const id = Number(params?.id);
  const { address } = useAccount();
  const search = useSearchParams();
  const claimParam = search?.get("medal");

  const { data: eventData } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "getEvent", args: [BigInt(id)] });
  const { data: medalsData } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "getEventMedals", args: [BigInt(id)] });

  const ev = eventData as unknown as EventTuple | undefined;
  const medals = (medalsData as unknown as MedalTuple[] | undefined) || [];
  const isCreator = ev && address && ev[1].toLowerCase() === address.toLowerCase();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = (medalId: number) => {
    writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "claimMedal", args: [BigInt(medalId)] });
  };

  const toggleActive = (medalId: number, active: boolean) => {
    writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "setMedalActive", args: [BigInt(medalId), active] });
  };

  const award = (medalId: number) => {
    const to = prompt("Dirección del destinatario (0x...):") || "";
    if (!to) return;
    writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "awardMedal", args: [BigInt(medalId), to as any] });
  };

  const eventUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <SharedPageLayout title={ev ? ev[2] : "Evento"} description={ev ? ev[3] : "Cargando..."}>
      {ev ? (
        <div className="space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-gray-100">
            <div className="text-gray-600">📍 {ev[4] || "—"}</div>
            <div className="text-gray-600">🗓️ {new Date(Number(ev[5]) * 1000).toLocaleString()} {ev[6] ? `(${ev[6]})` : ""}</div>
            <div className="mt-2 text-sm text-gray-500">Estado: {ev[7] === 2 ? "Aprobado" : ev[7] === 1 ? "Pendiente" : ev[7] === 3 ? "Rechazado" : "—"}</div>
            {ev[7] === 3 && <div className="text-sm text-red-600">Motivo: {ev[8]}</div>}
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Medallas</h3>
            {medals.length === 0 && <p className="text-gray-600">No hay medallas definidas.</p>}
            {medals.map((m) => {
              const medalId = Number(m[0]);
              const name = m[2];
              const desc = m[3];
              const iconUrl = m[4];
              const points = Number(m[5]);
              const maxClaims = Number(m[6]);
              const claimsCount = Number(m[7]);
              const active = m[8];
              const qrLink = `${eventUrl}/events/${id}?medal=${medalId}`;
              return (
                <div key={medalId} id={`medal-${medalId}`} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    {iconUrl ? (
                      <img src={iconUrl} alt={name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : null}
                    <div>
                      <div className="font-semibold text-gray-900">{name} {points ? <span className="text-xs text-indigo-600">({points} pts)</span> : null}</div>
                      <div className="text-sm text-gray-600">{desc}</div>
                      <div className="text-xs text-gray-500">Claims: {claimsCount}{maxClaims ? ` / ${maxClaims}` : " (ilimitado)"}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary" disabled={isPending || isConfirming || ev[7] !== 2 || !active} onClick={() => claim(medalId)}>Reclamar</button>
                      {isCreator && (
                        <>
                          <button className="btn-secondary" onClick={() => award(medalId)} disabled={isPending || isConfirming}>Asignar</button>
                          <button className="btn-secondary" onClick={() => toggleActive(medalId, !active)} disabled={isPending || isConfirming}>
                            {active ? "Desactivar" : "Activar"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {isCreator && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">QR para reclamar esta medalla (escaneable por asistentes):</p>
                      <MedalQR url={qrLink} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">Cargando...</div>
      )}
    </SharedPageLayout>
  );
}
