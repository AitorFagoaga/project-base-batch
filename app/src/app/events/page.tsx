"use client";

import { useState, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import Link from "next/link";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EVENT_MANAGER } from "@/lib/eventManager";

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

function useTotalEvents() {
  const { data: total } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "eventCount" 
  });
  return Number(total || BigInt(0));
}

function EventCard({ id, onLoaded }: Readonly<{ id: number; onLoaded?: (isApproved: boolean) => void }>) {
  const [hasNotified, setHasNotified] = useState(false);
  const { data } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "getEvent", 
    args: [BigInt(id)] 
  });
  
  const event = data as EventData | undefined;
  
  // Only show approved events (status === 2)
  const isApproved = !!(event && Number(event.id) !== 0 && event.status === 2);
  
  // Notify parent about this event's approval status using useEffect - only once
  useEffect(() => {
    if (onLoaded && event && Number(event.id) !== 0 && !hasNotified) {
      onLoaded(isApproved);
      setHasNotified(true);
    }
  }, [onLoaded, event, isApproved, hasNotified]);
  
  // Don't render if no data or not approved
  if (!data || !isApproved) return null;
  
  const date = new Date(Number(event.datetime) * 1000);
  
  return (
    <Link href={`/events/${id}`} className="block rounded-2xl bg-white shadow ring-1 ring-gray-100 hover:shadow-md transition overflow-hidden">
      {event.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>📍 {event.location}</span>
          <span>🗓️ {date.toLocaleDateString()} {event.timeText}</span>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [approvedCount, setApprovedCount] = useState(0);
  const [loadedEvents, setLoadedEvents] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  const total = useTotalEvents();
  const { address } = useAccount();
  const { data: adminRole } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "ADMIN_ROLE" 
  });
  const { data: isAdmin } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "hasRole", 
    args: adminRole && address ? [adminRole, address] : undefined,
    query: { enabled: !!address && !!adminRole } 
  });

  // Detectar cuando terminó de cargar todos los eventos
  useEffect(() => {
    if (total > 0 && loadedEvents.size >= total) {
      setIsLoading(false);
    } else if (total === 0) {
      // Si no hay eventos, marcar como cargado inmediatamente
      setIsLoading(false);
    }
  }, [total, loadedEvents.size]);

  const handleEventLoaded = (eventId: number, isApproved: boolean) => {
    if (!loadedEvents.has(eventId)) {
      setLoadedEvents(prev => new Set(prev).add(eventId));
      if (isApproved) {
        setApprovedCount(prev => prev + 1);
      }
    }
  };
  
  const getStatusText = () => {
    if (isLoading) return 'Loading events...';
    if (total === 0) return 'No events created';
    if (approvedCount === 0) return 'No approved events';
    return approvedCount === 1 ? '1 approved event' : `${approvedCount} approved events`;
  };

  return (
    <SharedPageLayout
      title="Events"
      description="Create and discover events with claimable QR badges."
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-gray-600">{getStatusText()}</p>
        <div className="flex gap-2">
          {isAdmin ? <Link href="/events/admin" className="btn-secondary">Admin</Link> : null}
          <Link href="/events/create" className="btn-primary">Create Event</Link>
        </div>
      </div>

      {total > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: total }, (_, i) => i + 1).map((id) => (
            <EventCard key={id} id={id} onLoaded={(isApproved) => handleEventLoaded(id, isApproved)} />
          ))}
        </div>
      ) : !isLoading ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-6">Be the first to create an event</p>
          <Link href="/events/create" className="btn-primary inline-block">
            Create First Event
          </Link>
        </div>
      ) : null}
    </SharedPageLayout>
  );
}
