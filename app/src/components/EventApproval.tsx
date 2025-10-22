"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EVENT_MANAGER } from "@/lib/eventManager";
import { getEventImage } from "@/lib/eventImageStorage";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface EventData {
  id: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  location: string;
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

export function EventApproval() {
  const [events, setEvents] = useState<EventData[]>([]);

  // Get total event count
  const { data: eventCount } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "eventCount",
  });

  const totalEvents = eventCount ? Number(eventCount) : 0;

  // Calculate counts from loaded events
  const statusCounts = {
    pending: events.filter(e => e.status === 1).length,
    approved: events.filter(e => e.status === 2).length,
    rejected: events.filter(e => e.status === 3).length,
  };

  if (totalEvents === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay eventos</h3>
        <p className="text-gray-600">Aún no se han creado eventos para aprobar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Aprobar Eventos</h2>
      
      {/* Status Summary */}
      {(statusCounts.pending > 0 || statusCounts.rejected > 0 || statusCounts.approved > 0) && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-6 text-sm">
            {statusCounts.pending > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-900">⏳ Pendientes:</span>
                <span className="text-blue-700">{statusCounts.pending}</span>
              </div>
            )}
            {statusCounts.approved > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-900">✅ Aprobados:</span>
                <span className="text-green-700">{statusCounts.approved}</span>
              </div>
            )}
            {statusCounts.rejected > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-900">❌ Rechazados:</span>
                <span className="text-red-700">{statusCounts.rejected}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {statusCounts.pending === 0 && totalEvents > 0 && (
        <div className="card text-center py-8 bg-yellow-50 border border-yellow-200">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay eventos pendientes de aprobación
          </h3>
          <p className="text-gray-600">
            Todos los eventos ({totalEvents}) ya fueron {statusCounts.rejected === totalEvents ? 'rechazados' : 'procesados'}.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Los usuarios deben crear nuevos eventos para que aparezcan aquí.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {Array.from({ length: totalEvents }, (_, i) => i + 1).map((id) => (
          <EventApprovalCard 
            key={id} 
            eventId={id}
            onEventLoaded={(event) => {
              setEvents(prev => {
                // Avoid duplicates
                const exists = prev.find(e => Number(e.id) === id);
                if (exists) return prev;
                return [...prev, event];
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface EventApprovalCardProps {
  eventId: number;
  onEventLoaded: (event: EventData) => void;
}

function EventApprovalCard({ eventId, onEventLoaded }: EventApprovalCardProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [eventReported, setEventReported] = useState(false);

  const { data } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "getEvent",
    args: [BigInt(eventId)],
  });

  // Get medals for this event
  const { data: medalsData } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "getEventMedals",
    args: [BigInt(eventId)],
  });

  const medals = (medalsData as MedalData[] | undefined) || [];

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Evento actualizado exitosamente");
      setShowRejectForm(false);
      setRejectReason("");
    }
  }, [isSuccess]);

  // Report event data only once
  useEffect(() => {
    if (data && !eventReported) {
      const event = data as EventData;
      onEventLoaded(event);
      setEventReported(true);
    }
  }, [data, eventReported, onEventLoaded]);

  if (!data) return null;

  const event = data as EventData;

  // Only show pending events (status === 1)
  if (event.status !== 1) {
    return null;
  }

  const date = new Date(Number(event.datetime) * 1000);
  const eventImage = getEventImage(eventId);

  const handleApprove = async () => {
    try {
      writeContract({
        address: EVENT_MANAGER.address,
        abi: EVENT_MANAGER.abi,
        functionName: "approveEvent",
        args: [BigInt(eventId)],
      });
    } catch (err: any) {
      toast.error(err.message || "Error al aprobar evento");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Por favor ingresa una razón para rechazar");
      return;
    }

    try {
      writeContract({
        address: EVENT_MANAGER.address,
        abi: EVENT_MANAGER.abi,
        functionName: "rejectEvent",
        args: [BigInt(eventId), rejectReason],
      });
    } catch (err: any) {
      toast.error(err.message || "Error al rechazar evento");
    }
  };

  return (
    <div className="card p-6">
      {eventImage && (
        <div className="mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={eventImage} 
            alt={event.title} 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold border-2 bg-yellow-100 text-yellow-800 border-yellow-300">
            ⏳ Pendiente de aprobación
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{event.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <span className="font-semibold text-gray-700">📍 Ubicación:</span>
          <p className="text-gray-600">{event.location}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">🗓️ Fecha:</span>
          <p className="text-gray-600">{date.toLocaleDateString()} {event.timeText}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-700">👤 Creador:</span>
          <p className="text-gray-600 font-mono text-xs">{event.creator}</p>
        </div>
      </div>

      {/* Medals Information */}
      {medals.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">
            🏅 Medallas del Evento ({medals.length})
          </h4>
          <div className="space-y-2">
            {medals.map((medal) => (
              <div key={Number(medal.id)} className="flex items-center gap-3 text-sm">
                {medal.iconUrl && (
                  <img src={medal.iconUrl} alt={medal.name} className="w-8 h-8 rounded object-cover" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {medal.name}
                    {Number(medal.points) > 0 && (
                      <span className="ml-2 text-xs text-indigo-600">+{Number(medal.points)} pts</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{medal.description}</div>
                </div>
                <div className="text-xs text-gray-500">
                  Max: {Number(medal.maxClaims) > 0 ? Number(medal.maxClaims) : '∞'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
            <strong>Total de puntos disponibles:</strong> {medals.reduce((sum, m) => sum + Number(m.points), 0)} pts
          </div>
        </div>
      )}

      {!showRejectForm ? (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isPending || isConfirming}
            className="btn-primary flex-1"
          >
            {isPending || isConfirming ? "Aprobando..." : "✅ Aprobar Evento"}
          </button>
          <button
            onClick={() => setShowRejectForm(true)}
            disabled={isPending || isConfirming}
            className="btn-secondary flex-1"
          >
            ❌ Rechazar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Razón del rechazo..."
            className="input-field w-full min-h-[80px]"
          />
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isPending || isConfirming || !rejectReason.trim()}
              className="btn-secondary flex-1"
            >
              {isPending || isConfirming ? "Rechazando..." : "Confirmar Rechazo"}
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason("");
              }}
              disabled={isPending || isConfirming}
              className="btn-primary flex-1"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
