"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [errors, setErrors] = useState<{ name?: string; description?: string; avatarUrl?: string }>({});

  // Get current profile
  const { data: profileData, isLoading } = useReadContract({
    address: CONTRACTS.userProfile.address,
    abi: CONTRACTS.userProfile.abi,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Load existing profile data
  useEffect(() => {
    if (profileData) {
      const profile = {
        name: profileData[0] as string,
        description: profileData[1] as string,
        avatarUrl: profileData[2] as string,
        exists: profileData[3] as boolean,
      };

      if (profile.exists) {
        setName(profile.name);
        setDescription(profile.description);
        setAvatarUrl(profile.avatarUrl);
      }
    }
  }, [profileData]);

  // Write contract
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("¡Perfil actualizado correctamente! 🎉");
      setTimeout(() => {
        router.push(`/profile/${address}`);
      }, 2000);
    }
  }, [isSuccess, router, address]);

  useEffect(() => {
    if (writeError) {
      toast.error("Error al actualizar el perfil");
      console.error(writeError);
    }
  }, [writeError]);

  const validate = (): boolean => {
    const newErrors: { name?: string; description?: string; avatarUrl?: string } = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (name.length > 50) {
      newErrors.name = "El nombre no puede tener más de 50 caracteres";
    }

    if (description.length > 500) {
      newErrors.description = "La descripción no puede tener más de 500 caracteres";
    }

    if (avatarUrl.length > 200) {
      newErrors.avatarUrl = "La URL no puede tener más de 200 caracteres";
    }

    if (avatarUrl && !avatarUrl.startsWith("http")) {
      newErrors.avatarUrl = "La URL debe comenzar con http:// o https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.userProfile.address,
        abi: CONTRACTS.userProfile.abi,
        functionName: "setProfile",
        args: [name.trim(), description.trim(), avatarUrl.trim()],
      });

      toast.success("Transacción enviada. Esperando confirmación...");
    } catch (error) {
      console.error("Error submitting transaction:", error);
      toast.error("Error al enviar la transacción");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Header />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NetworkGuard>
          {!address ? (
            <div className="glass-card text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🔒 Conecta tu Wallet
              </h2>
              <p className="text-gray-700 mb-6">
                Necesitas conectar tu wallet para editar tu perfil
              </p>
              <p className="text-sm text-gray-600">
                Haz click en "Connect Wallet" en la esquina superior derecha
              </p>
            </div>
          ) : (
          <div className="glass-card">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/profile/${address}`}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  ← Volver al perfil
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                ✏️ Editar Perfil
              </h1>
              <p className="text-gray-600 mt-2">
                Actualiza tu información de perfil. Los cambios se guardarán en la blockchain.
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando perfil...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`input ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Tu nombre o alias"
                    maxLength={50}
                    disabled={isPending || isConfirming}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-red-500">{errors.name}</span>
                    <span className="text-xs text-gray-500">{name.length}/50</span>
                  </div>
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`input min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                    placeholder="Cuéntanos sobre ti, tus habilidades, intereses..."
                    maxLength={500}
                    disabled={isPending || isConfirming}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-red-500">{errors.description}</span>
                    <span className="text-xs text-gray-500">{description.length}/500</span>
                  </div>
                </div>

                {/* Avatar URL Field */}
                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL de Avatar
                  </label>
                  <input
                    type="url"
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className={`input ${errors.avatarUrl ? "border-red-500" : ""}`}
                    placeholder="https://ejemplo.com/tu-avatar.jpg"
                    maxLength={200}
                    disabled={isPending || isConfirming}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-red-500">{errors.avatarUrl}</span>
                    <span className="text-xs text-gray-500">{avatarUrl.length}/200</span>
                  </div>

                  {/* Image Preview */}
                  {avatarUrl && avatarUrl.startsWith("http") && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500">
                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="btn-primary flex-1"
                  >
                    {isPending || isConfirming ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        {isPending ? "Confirmando..." : "Guardando..."}
                      </>
                    ) : (
                      "💾 Guardar Cambios"
                    )}
                  </button>

                  <Link
                    href={`/profile/${address}`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Cancelar
                  </Link>
                </div>

                {/* Transaction Hash */}
                {hash && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      Transacción enviada:
                    </p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {hash}
                    </a>
                  </div>
                )}

                {/* Info Message */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ℹ️ <strong>Nota:</strong> Los cambios requieren una transacción en la blockchain.
                    Asegúrate de tener suficiente ETH en Base Sepolia para pagar el gas.
                  </p>
                </div>
              </form>
            )}
          </div>
          )}
        </NetworkGuard>
      </main>
    </div>
  );
}
