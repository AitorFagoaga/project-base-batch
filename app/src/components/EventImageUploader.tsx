"use client";

import { useState } from "react";
import { saveEventImage } from "@/lib/eventImageStorage";
import toast from "react-hot-toast";

interface EventImageUploaderProps {
  eventId: number;
  eventTitle: string;
  currentImage?: string | null;
  onImageSaved?: () => void;
}

export function EventImageUploader({ 
  eventId, 
  eventTitle, 
  currentImage,
  onImageSaved 
}: EventImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(currentImage || "");
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    if (!imageUrl.trim()) {
      toast.error("Ingresa una URL de imagen");
      return;
    }

    try {
      new URL(imageUrl.trim());
    } catch {
      toast.error("URL inválida");
      return;
    }

    saveEventImage(eventId, imageUrl.trim());
    toast.success("Imagen guardada");
    setShowForm(false);
    onImageSaved?.();
  };

  if (!showForm && !currentImage) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        + Agregar imagen
      </button>
    );
  }

  if (!showForm && currentImage) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-gray-600 hover:text-gray-700"
      >
        ✏️ Cambiar imagen
      </button>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">
          URL de la imagen para {eventTitle}
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="input-field text-sm"
        />
      </div>
      
      {imageUrl && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={imageUrl} 
            alt="Vista previa" 
            className="max-h-32 rounded object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSave} className="btn-primary flex-1 text-sm">
          Guardar
        </button>
        <button 
          onClick={() => {
            setShowForm(false);
            setImageUrl(currentImage || "");
          }} 
          className="btn-secondary flex-1 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
