"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { EVENT_MANAGER } from "@/lib/eventManager";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EventImageUploader } from "@/components/EventImageUploader";
import { getEventImage } from "@/lib/eventImageStorage";

interface EventData {
  id: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  location: string;
  datetime: bigint;
  timeText: string;
  status: number;
  rejectReason: string;
}

function EventImageManager({ eventId }: { eventId: number }) {
  const [, forceUpdate] = useState({});
  
  const { data } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "getEvent",
    args: [BigInt(eventId)],
  });

  if (!data) return null;

  const event = data as EventData;
  if (!event || Number(event.id) === 0) return null;

  const currentImage = getEventImage(eventId);

  return (
    <div className="card p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Evento #{eventId}: {event.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {event.description}
          </p>
          
          <EventImageUploader
            eventId={eventId}
            eventTitle={event.title}
            currentImage={currentImage}
            onImageSaved={() => forceUpdate({})}
          />
        </div>

        {currentImage && (
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={event.title}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageEventImagesPage() {
  const { data: eventCount } = useReadContract({
    address: EVENT_MANAGER.address,
    abi: EVENT_MANAGER.abi,
    functionName: "eventCount",
  });

  const totalEvents = eventCount ? Number(eventCount) : 0;

  return (
    <SharedPageLayout
      title="Gestionar Imágenes de Eventos"
      description="Agrega o actualiza imágenes para los eventos existentes"
    >
      <div className="space-y-4">
        {totalEvents === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos
            </h3>
            <p className="text-gray-600">
              Aún no se han creado eventos.
            </p>
          </div>
        ) : (
          Array.from({ length: totalEvents }, (_, i) => i + 1).map((id) => (
            <EventImageManager key={id} eventId={id} />
          ))
        )}
      </div>
    </SharedPageLayout>
  );
}
