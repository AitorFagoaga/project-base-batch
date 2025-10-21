"use client";

import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EVENT_MANAGER } from "@/lib/eventManager";
import toast from "react-hot-toast";

interface MedalDraft { name: string; description: string; points: number; maxClaims: number; }

export default function CreateEventPage() {
  const { address } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [time, setTime] = useState(""); // HH:mm
  const [medals, setMedals] = useState<MedalDraft[]>([
    { name: "Asistente", description: "Participación en el evento", points: 10, maxClaims: 0 },
  ]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addMedal = () => setMedals((m) => [...m, { name: "", description: "", points: 0, maxClaims: 0 }]);
  const removeMedal = (idx: number) => setMedals((m) => m.filter((_, i) => i !== idx));
  const updateMedal = (idx: number, patch: Partial<MedalDraft>) =>
    setMedals((m) => m.map((md, i) => (i === idx ? { ...md, ...patch } : md)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Título requerido");
    if (!date || !time) return toast.error("Fecha y horario requeridos");
    if (medals.length === 0) return toast.error("Agrega al menos una medalla");

    const dt = new Date(`${date}T${time}:00Z`).getTime();
    if (!dt || isNaN(dt)) return toast.error("Fecha/hora inválidas");

    try {
      writeContract({
        address: EVENT_MANAGER.address,
        abi: EVENT_MANAGER.abi,
        functionName: "submitEvent",
        args: [
          title,
          description,
          location,
          BigInt(Math.floor(dt / 1000)),
          `${time} UTC`,
          medals.map((m) => m.name),
          medals.map((m) => m.description),
          medals.map((m) => BigInt(m.points)) as any,
          medals.map((m) => BigInt(m.maxClaims)) as any,
        ],
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear el evento");
    }
  };

  return (
    <SharedPageLayout
      title="Crear Evento"
      description="Define título, descripción, lugar, fecha/horario y medallas reclamables."
    >
      <form onSubmit={submit} className="space-y-6 bg-white rounded-2xl p-6 shadow ring-1 ring-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Título</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">Lugar</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dirección o Virtual" />
          </div>
          <div>
            <label className="input-label">Día</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">Horario</label>
            <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="input-label">Descripción</label>
          <textarea className="input resize-none" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="input-label">Medallas</label>
            <button type="button" className="btn-secondary" onClick={addMedal}>+ Agregar</button>
          </div>
          <div className="space-y-4">
            {medals.map((m, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nombre</label>
                    <input className="input" value={m.name} onChange={(e) => updateMedal(i, { name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Puntos</label>
                    <input type="number" className="input" value={m.points} onChange={(e) => updateMedal(i, { points: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Descripción</label>
                    <input className="input" value={m.description} onChange={(e) => updateMedal(i, { description: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Máx. claims (0 = ilimitado)</label>
                    <input type="number" className="input" value={m.maxClaims} onChange={(e) => updateMedal(i, { maxClaims: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeMedal(i)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isPending || isConfirming} className="btn-primary w-full py-3">
          {isPending || isConfirming ? "Creando..." : "Enviar solicitud"}
        </button>
        {isSuccess && <p className="text-green-600">Solicitud enviada. Espera la aprobación del admin.</p>}
      </form>
    </SharedPageLayout>
  );
}

