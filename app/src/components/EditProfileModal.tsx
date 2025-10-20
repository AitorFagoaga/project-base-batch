"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";

interface ProfileData {
  name: string;
  description: string;
  avatarUrl: string;
  exists: boolean;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: ProfileData;
  userAddress?: string;
}

export function EditProfileModal({ isOpen, onClose, currentProfile, userAddress }: EditProfileModalProps) {
  const [name, setName] = useState(currentProfile?.name || "");
  const [description, setDescription] = useState(currentProfile?.description || "");
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl || "");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (name.length > 50) {
      toast.error("El nombre debe tener máximo 50 caracteres");
      return;
    }

    if (description.length > 500) {
      toast.error("La descripción debe tener máximo 500 caracteres");
      return;
    }

    if (avatarUrl.length > 200) {
      toast.error("La URL del avatar debe tener máximo 200 caracteres");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.userProfile.address,
        abi: CONTRACTS.userProfile.abi,
        functionName: "setProfile",
        args: [name, description, avatarUrl],
      });

      toast.success("📝 Transacción enviada");
    } catch (err: any) {
      console.error("Set profile error:", err);
      const errorMessage = err?.message || "";

      if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
        toast.error("❌ Transacción cancelada", { duration: 4000 });
      } else {
        toast.error(`❌ Error: ${errorMessage.substring(0, 80)}`, { duration: 5000 });
      }
    }
  };

  if (isSuccess) {
    toast.success("✅ ¡Perfil actualizado!", { duration: 3000 });
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 1500);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">✏️ Editar Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isPending || isConfirming}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre o nickname"
              maxLength={50}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              {name.length}/50 caracteres
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Cuéntanos sobre ti..."
              maxLength={500}
              rows={4}
            />
            <p className="text-sm text-gray-600 mt-1">
              {description.length}/500 caracteres
            </p>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              URL de Avatar (Opcional)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="input-field"
              placeholder="https://... o ipfs://..."
              maxLength={200}
            />
            <p className="text-sm text-gray-600 mt-1">
              Puedes usar una URL de IPFS o cualquier imagen pública
            </p>
            {avatarUrl && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://ui-avatars.com/api/?name=" + encodeURIComponent(name || "User");
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending || isConfirming || !name.trim()}
              className="btn-primary flex-1"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isConfirming ? "Confirmando..." : "Procesando..."}
                </span>
              ) : (
                "💾 Guardar Perfil"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isConfirming}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
