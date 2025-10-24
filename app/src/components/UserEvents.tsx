"use client";

import { useReadContract } from "wagmi";
import { EVENT_MANAGER } from "@/lib/eventManager";
import { getEventImage } from "@/lib/eventImageStorage";
import Link from "next/link";
import { useState } from "react";

interface UserEventsProps {
  userAddress: `0x${string}`;
}

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

export function UserEvents({ userAddress }: UserEventsProps) {
  const [showPending, setShowPending] = useState(true);
  const [showApproved, setShowApproved] = useState(true);
  const [showRejected, setShowRejected] = useState(true);

  // Get total event count
  const { data: eventCount } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "eventCount",
  });

  const totalEvents = eventCount ? Number(eventCount) : 0;

  if (totalEvents === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events</h3>
        <p className="text-gray-600">This user hasn&apos;t created any events yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowPending(!showPending)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              showPending
                ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
                : "bg-gray-100 text-gray-600 border-2 border-gray-200"
            }`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setShowApproved(!showApproved)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              showApproved
                ? "bg-green-100 text-green-800 border-2 border-green-300"
                : "bg-gray-100 text-gray-600 border-2 border-gray-200"
            }`}
          >
            ✅ Approved
          </button>
          <button
            onClick={() => setShowRejected(!showRejected)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              showRejected
                ? "bg-red-100 text-red-800 border-2 border-red-300"
                : "bg-gray-100 text-gray-600 border-2 border-gray-200"
            }`}
          >
            ❌ Rejected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: totalEvents }, (_, i) => i + 1).map((id) => (
          <EventCard
            key={id}
            eventId={id}
            userAddress={userAddress}
            showPending={showPending}
            showApproved={showApproved}
            showRejected={showRejected}
          />
        ))}
      </div>
    </div>
  );
}

interface EventCardProps {
  eventId: number;
  userAddress: `0x${string}`;
  showPending: boolean;
  showApproved: boolean;
  showRejected: boolean;
}

function EventCard({ eventId, userAddress, showPending, showApproved, showRejected }: EventCardProps) {
  const { data } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "getEvent",
    args: [BigInt(eventId)],
  });

  if (!data) return null;

  // Parse as named tuple
  const event = data as EventData;
  
  // Check if this event belongs to the user
  if (!event.creator || event.creator.toLowerCase() !== userAddress.toLowerCase()) {
    return null;
  }

  // Filter based on status and user's filter preferences
  // Status: 0=None, 1=Pending, 2=Approved, 3=Rejected
  if (event.status === 1 && !showPending) return null; // Pending
  if (event.status === 2 && !showApproved) return null; // Approved
  if (event.status === 3 && !showRejected) return null; // Rejected

  const statusConfig = {
    0: { label: "No status", color: "bg-gray-100 text-gray-800 border-gray-300" },
    1: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    2: { label: "Approved", color: "bg-green-100 text-green-800 border-green-300" },
    3: { label: "Rejected", color: "bg-red-100 text-red-800 border-red-300" },
  };

  const config = statusConfig[event.status as 0 | 1 | 2 | 3];
  const date = new Date(Number(event.datetime) * 1000);
  const eventImage = getEventImage(eventId);

  return (
    <Link
      href={`/events/${eventId}`}
      className="block rounded-2xl bg-white shadow ring-1 ring-gray-100 hover:shadow-md transition overflow-hidden"
    >
      {eventImage && (
        <div className="w-full h-32 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={eventImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">{event.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-bold border-2 ${config.color}`}>
            {config.label}
          </span>
        </div>
        
        {/* Show reject reason if rejected */}
        {event.status === 3 && event.rejectReason && (
          <div className="mb-2 p-2 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-xs font-semibold text-red-900 mb-1">Rejection reason:</p>
            <p className="text-xs text-red-700">{event.rejectReason}</p>
          </div>
        )}

        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{event.description}</p>
        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{event.location || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🗓️</span>
            <span>{date.toLocaleDateString()} {event.timeText || ""}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
