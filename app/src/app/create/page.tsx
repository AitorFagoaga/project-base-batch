"use client";

import { useEffect, useMemo, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { parseEther } from "viem";

import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { SharedPageLayout } from "@/components/SharedPageLayout";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80";

export default function CreateProjectPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [goalEth, setGoalEth] = useState("");
  const [durationDays, setDurationDays] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    toast.success("🎉 ¡Proyecto creado exitosamente! Redirigiendo...", {
      duration: 3000,
      icon: "🚀",
    });

    const redirect = setTimeout(() => router.push("/"), 2000);
    return () => clearTimeout(redirect);
  }, [isSuccess, router]);

  const previewImage = imageUrl.trim() || FALLBACK_IMAGE;
  const goalLabel = goalEth ? `${goalEth} ETH` : "Define tu meta";
  const durationLabel = durationDays
    ? `${durationDays} día${durationDays === "1" ? "" : "s"}`
    : "Selecciona duración";

  const descriptionPreview =
    description.trim() ||
    "Comparte la visión de tu proyecto, qué construirás y por qué tu reputación respalda la campaña.";

  const cofounderHint = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "0xTuWallet";

  const handleQuickAmount = (amount: string) => {
    setGoalEth(amount);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !goalEth || !durationDays) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const goal = Number(goalEth);
    const duration = Number(durationDays);

    if (Number.isNaN(goal) || goal <= 0) {
      toast.error("La meta debe ser mayor a 0");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0 || duration > 365) {
      toast.error("La duración debe estar entre 1 y 365 días");
      return;
    }

    if (title.length > 100) {
      toast.error("El título debe tener máximo 100 caracteres");
      return;
    }

    if (description.length > 1000) {
      toast.error("La descripción debe tener máximo 1000 caracteres");
      return;
    }

    if (imageUrl.length > 200) {
      toast.error("La URL de la imagen debe tener máximo 200 caracteres");
      return;
    }

    try {
      const goalInWei = parseEther(goalEth);

      writeContract({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "createProject",
        args: [title, description, imageUrl, goalInWei, BigInt(duration)],
      });

      toast.success("📝 Transacción enviada a MetaMask");
    } catch (submitError) {
      console.error("Create project error:", submitError);
      const errorMessage = submitError instanceof Error ? submitError.message : String(submitError);

      if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
        toast.error("❌ Transacción cancelada en MetaMask", { duration: 4000 });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("💰 Fondos insuficientes para el gas", { duration: 4000 });
      } else if (errorMessage.toLowerCase().includes("gas")) {
        toast.error("⛽ Error de gas - intenta aumentar el límite", { duration: 4000 });
      } else {
        toast.error(`❌ Error: ${errorMessage.substring(0, 80)}`, { duration: 5000 });
      }
    }
  };

  const quickAmounts = useMemo(() => ["0.01", "0.05", "0.1"], []);

  return (
    <SharedPageLayout
      title="Launch Your Project"
      description="Configura tu campaña reputacional en minutos. Define los datos clave y lánzala cuando estés listo."
    >
      <NetworkGuard>
        {!isConnected ? (
          <div className="card text-center py-16 animate-fadeIn">
            <div className="text-6xl mb-6">🔐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Conecta tu wallet
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Necesitas conectar tu wallet para crear un proyecto.
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Tu reputación en cadena respalda la confianza de los patrocinadores.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr),minmax(260px,1fr)]">
            <form onSubmit={handleSubmit} className="card space-y-8" noValidate>
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  All-or-nothing funding
                </h3>
                <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                  Los fondos solo se liberan si alcanzas la meta antes de la fecha límite. Esto protege a tus
                  patrocinadores y demuestra la seriedad de la campaña.
                </p>
              </div>

              <section className="space-y-5">
                <header className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información del proyecto
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Paso 1 de 2
                  </span>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="input-label text-base">
                      📝 Título del proyecto *
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Construir una red social descentralizada"
                      className="input-field text-base"
                      disabled={isPending || isConfirming}
                      maxLength={100}
                      required
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Utiliza un título claro y específico.</span>
                      <span className={title.length > 90 ? "font-semibold text-orange-600" : ""}>
                        {title.length}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="imageUrl" className="input-label text-base">
                      🖼️ Imagen de portada
                    </label>
                    <input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      placeholder="https://... o ipfs://..."
                      className="input-field text-base"
                      disabled={isPending || isConfirming}
                      maxLength={200}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Opcional, pero ayuda a contar la historia de tu proyecto.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="input-label text-base">
                    📄 Descripción
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe qué vas a construir, por qué importa y cómo usarás los fondos."
                    className="input-field text-base min-h-[140px] resize-y"
                    disabled={isPending || isConfirming}
                    maxLength={1000}
                    rows={5}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Máximo 1000 caracteres.</span>
                    <span className={description.length > 900 ? "font-semibold text-orange-600" : ""}>
                      {description.length}/1000
                    </span>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <header className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Metas y duración
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Paso 2 de 2
                  </span>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="goal" className="input-label text-base">
                      💰 Meta de financiamiento (ETH) *
                    </label>
                    <div className="relative">
                      <input
                        id="goal"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={goalEth}
                        onChange={(event) => setGoalEth(event.target.value)}
                        placeholder="1.00"
                        className="input-field text-base pr-16"
                        disabled={isPending || isConfirming}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                        ETH
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleQuickAmount(amount)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                            goalEth === amount
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-blue-200 bg-white/70 text-blue-700 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                          disabled={isPending || isConfirming}
                        >
                          {amount} ETH
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Establece una meta alcanzable; podrás ampliarla en futuras campañas.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="duration" className="input-label text-base">
                      ⏰ Duración de la campaña (días) *
                    </label>
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      max="365"
                      value={durationDays}
                      onChange={(event) => setDurationDays(event.target.value)}
                      placeholder="30"
                      className="input-field text-base"
                      disabled={isPending || isConfirming}
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      El máximo permitido es de 365 días. Te recomendamos entre 21 y 45 días.
                    </p>
                  </div>
                </div>
              </section>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 animate-fadeIn">
                  <p className="text-sm font-semibold text-red-800">
                    Error en la transacción
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {error.message.includes("User rejected") || error.message.includes("User denied")
                      ? "Cancelaste la transacción en tu wallet. Intenta nuevamente cuando estés listo."
                      : error.message.includes("insufficient funds")
                      ? "No tienes suficiente ETH para completar esta transacción."
                      : error.message.substring(0, 160)}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Revisa los datos antes de enviar la transacción. Podrás editar la campaña desde el panel si necesitas cambios.
                </p>
                <button
                  type="submit"
                  disabled={isPending || isConfirming}
                  className="btn-primary w-full sm:w-auto"
                >
                  {isPending || isConfirming ? "Procesando..." : "🚀 Crear proyecto"}
                </button>
              </div>
            </form>

            <aside className="glass-card lg:sticky lg:top-28 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vista previa</h3>
                <p className="text-sm text-gray-600">
                  Así lucirá tu campaña en el listado antes de lanzarla.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-inner">
                <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-purple-200/60 to-pink-200/60">
                  <Image
                    src={previewImage}
                    alt="Vista previa del proyecto"
                    fill
                    className="object-cover"
                    priority={false}
                    sizes="(min-width: 1024px) 340px, 100vw"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {title || "Tu proyecto todavía no tiene título"}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {descriptionPreview}
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50/80 px-4 py-3 text-sm text-indigo-700">
                    Creador provisional: <span className="font-mono">{cofounderHint}</span>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Meta</span>
                      <span className="font-semibold text-gray-900">{goalLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Duración</span>
                      <span className="font-semibold text-gray-900">{durationLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5 space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-purple-600">
                  Recomendaciones rápidas
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Describe hitos claros y cómo se usará el presupuesto.</li>
                  <li>• Comparte tu reputación o logros previos para generar confianza.</li>
                  <li>• Prepara una actualización semanal para tus patrocinadores.</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </NetworkGuard>
    </SharedPageLayout>
  );
}
