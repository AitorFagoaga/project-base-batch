"use client";

import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EVENT_MANAGER } from "@/lib/eventManager";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { MedalQR } from "@/components/MedalQR";

type EventTuple = [bigint, `0x${string}`, string, string, string, string, bigint, string, number, string];
type MedalTuple = [bigint, bigint, string, string, string, number, number, number, boolean];

interface EventData {
  id: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  datetime: bigint;
  timeText: string;
  status: number; // 0=None, 1=Pending, 2=Approved, 3=Rejected
  rejectReason: string;
}

interface MedalData {
  id: bigint;
  eventId: bigint;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  maxClaims: number;
  claimsCount: number;
  active: boolean;
}

export default function EventDetailsPage() {
  const params = useParams();
  const id = Number(params?.id);
  const { address } = useAccount();

  const { data: eventData } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "getEvent", args: [BigInt(id)] });
  const { data: medalsData } = useReadContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "getEventMedals", args: [BigInt(id)] });

  const ev = eventData as EventData | undefined;
  const medals = (medalsData as MedalData[] | undefined) || [];
  const isCreator = ev && address && ev.creator.toLowerCase() === address.toLowerCase();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const toggleActive = (medalId: number, active: boolean) => {
    writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "setMedalActive", args: [BigInt(medalId), active] });
  };

  const award = (medalId: number) => {
    const to = prompt("Dirección del destinatario (0x...):") || "";
    if (!to) return;
    writeContract({ address: EVENT_MANAGER.address, abi: EVENT_MANAGER.abi, functionName: "awardMedal", args: [BigInt(medalId), to as `0x${string}`] });
  };

  return (
    <SharedPageLayout title={ev ? ev.title : "Evento"} description={ev ? ev.description : "Cargando..."}>
      {ev ? (
        <div className="space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-gray-100">
            {ev.imageUrl && (
              <div className="mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={ev.imageUrl} 
                  alt={ev.title} 
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{ev.title}</h2>
            <p className="text-gray-700 mb-4">{ev.description}</p>
            <div className="text-gray-600">📍 {ev.location || "—"}</div>
            <div className="text-gray-600">🗓️ {new Date(Number(ev.datetime) * 1000).toLocaleString()} {ev.timeText ? `(${ev.timeText})` : ""}</div>
            <div className="mt-2 text-sm text-gray-500">
              Estado: {ev.status === 2 ? "✅ Aprobado" : ev.status === 1 ? "⏳ Pendiente" : ev.status === 3 ? "❌ Rechazado" : "—"}
            </div>
            {ev.status === 3 && <div className="text-sm text-red-600">Motivo: {ev.rejectReason}</div>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Medallas del Evento</h3>
              <div className="text-sm text-gray-600">
                {medals.length} medalla{medals.length !== 1 ? 's' : ''} • {medals.reduce((sum, m) => sum + Number(m.points), 0)} puntos totales
              </div>
            </div>
            {medals.length === 0 && <p className="text-gray-600">No hay medallas definidas.</p>}
            {medals.map((m) => {
              const medalId = Number(m.id);
              const name = m.name;
              const desc = m.description;
              const iconUrl = m.iconUrl;
              const points = Number(m.points);
              const maxClaims = Number(m.maxClaims);
              const claimsCount = Number(m.claimsCount);
              const active = m.active;
              const isFull = maxClaims > 0 && claimsCount >= maxClaims;
              
              return (
                <div key={medalId} id={`medal-${medalId}`} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={iconUrl} alt={name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl">
                          🏅
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg text-gray-900">{name}</h4>
                        {points > 0 && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                            +{points} pts
                          </span>
                        )}
                        {!active && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Inactiva
                          </span>
                        )}
                        {isFull && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            Agotada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{desc}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          📊 {claimsCount}{maxClaims > 0 ? ` / ${maxClaims}` : ''} reclamadas
                        </span>
                        {maxClaims > 0 && (
                          <span>
                            {Math.round((claimsCount / maxClaims) * 100)}% completado
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {isCreator && (
                        <>
                          <button className="btn-secondary text-sm" onClick={() => award(medalId)} disabled={isPending || isConfirming}>
                            Asignar
                          </button>
                          <button className="btn-secondary text-sm" onClick={() => toggleActive(medalId, !active)} disabled={isPending || isConfirming}>
                            {active ? 'Desactivar' : 'Activar'}
                          </button>
                        </>
                      )}
                      {!isCreator && (
                        <p className="text-sm text-gray-500 italic">
                          Escanea el QR para reclamar
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {isCreator && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">QR para reclamar esta medalla (escaneable por asistentes):</p>
                      <MedalQR eventId={id} medalId={medalId} />
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
