"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { Icon } from "./Icon";

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

  useEffect(() => {
    if (isSuccess) {
      toast.success("✅ ¡Perfil actualizado!", { duration: 3000 });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
  }, [isSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30"></div>

        <div className="relative bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Icon name="edit" size="xl" className="text-indigo-600" />
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Editar Perfil
                </h2>
                <p className="text-sm text-gray-600 mt-1">Personaliza tu identidad en la plataforma</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors leading-none p-2 hover:bg-gray-100 rounded-full"
              disabled={isPending || isConfirming}
              aria-label="Cerrar"
            >
              <Icon name="x" size="lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Preview Section */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-indigo-500 to-purple-500 shadow-xl bg-gradient-to-br from-indigo-100 to-purple-100">
                  <img
                    src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random&bold=true&size=128`}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random&bold=true&size=128`;
                    }}
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-2 shadow-lg">
                  <Icon name="camera" size="sm" className="text-white" />
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-900 placeholder-gray-400"
                placeholder="Tu nombre o nickname"
                maxLength={50}
                required
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Este será tu nombre público en la plataforma</p>
                <p className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {name.length}/50
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-gray-900 placeholder-gray-400 min-h-[120px] resize-none"
                placeholder="Desarrollador blockchain, constructor, innovador... Cuéntanos sobre ti y tus intereses"
                maxLength={500}
                rows={4}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Describe tu experiencia y proyectos</p>
                <p className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {description.length}/500
                </p>
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                URL de Avatar (Opcional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder="https://... o ipfs://..."
                  maxLength={200}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Icon name="image" size="sm" className="text-gray-400" />
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Sube tu imagen a IPFS o usa cualquier URL pública. Si lo dejas vacío, se generará uno automáticamente.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isPending || isConfirming || !name.trim()}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-4 text-base font-bold text-white transition-all hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
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
                  <>
                    <Icon name="save" size="sm" />
                    Guardar Perfil
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending || isConfirming}
                className="px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
