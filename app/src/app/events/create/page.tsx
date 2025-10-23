"use client";

import { useState, useEffect } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EVENT_MANAGER } from "@/lib/eventManager";
import toast from "react-hot-toast";

interface MedalDraft { name: string; description: string; iconUrl: string; points: number; maxClaims: number; }

export default function CreateEventPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Event logo/image
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [time, setTime] = useState(""); // HH:mm
  const [medals, setMedals] = useState<MedalDraft[]>([
    { name: "Attendee", description: "Event participation", iconUrl: "", points: 10, maxClaims: 0 },
  ]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess && hash && receipt) {
      // Try to extract event ID from logs
      let eventId: number | null = null;
      
      try {
        // Look for EventSubmitted event in logs
        const eventSubmittedLog = receipt.logs.find((log) => {
          // EventSubmitted has eventId as first indexed parameter
          return log.topics.length > 1;
        });
        
        if (eventSubmittedLog && eventSubmittedLog.topics[1]) {
          // Decode the eventId from topics[1]
          eventId = Number.parseInt(eventSubmittedLog.topics[1], 16);
        }
      } catch (e) {
        console.error("Error parsing event ID from logs:", e);
      }
      
      toast.success("✅ Event created successfully. Waiting for admin approval.", { duration: 5000 });
      
      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setImageUrl("");
      setDate("");
      setTime("");
      setMedals([{ name: "Attendee", description: "Event participation", iconUrl: "", points: 10, maxClaims: 0 }]);
    }
  }, [isSuccess, hash, receipt, imageUrl]);

  const addMedal = () => setMedals((m) => [...m, { name: "", description: "", iconUrl: "", points: 0, maxClaims: 0 }]);
  const removeMedal = (idx: number) => setMedals((m) => m.filter((_, i) => i !== idx));
  const updateMedal = (idx: number, patch: Partial<MedalDraft>) =>
    setMedals((m) => m.map((md, i) => (i === idx ? { ...md, ...patch } : md)));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title required");
    if (!date || !time) return toast.error("Date and time required");
    if (medals.length === 0) return toast.error("Add at least one badge");

    // Fix: Create date in local timezone, not UTC
    const dt = new Date(`${date}T${time}:00`).getTime();
    if (!dt || Number.isNaN(dt) || dt < 0) return toast.error("Invalid date/time");

    // Validate that the date is not more than one year in the past
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    if (dt < oneYearAgo) {
      return toast.error("Event date cannot be more than one year in the past");
    }

    try {
      writeContract({
        address: EVENT_MANAGER.address,
        abi: EVENT_MANAGER.abi,
        functionName: "submitEvent",
        args: [
          title,
          description,
          location,
          imageUrl,
          BigInt(Math.floor(dt / 1000)),
          `${time} UTC`,
          medals.map((m) => m.name),
          medals.map((m) => m.description),
          medals.map((m) => m.iconUrl),
          medals.map((m) => m.points),
          medals.map((m) => m.maxClaims),
        ],
      });
      toast.success("📝 Transacción enviada");
    } catch (err) {
      console.error("Error submitting event:", err);
      toast.error("Could not create event");
    }
  };

  return (
    <SharedPageLayout
      title="Create Event"
      description="Define title, description, location, date/time and claimable badges."
    >
      <form onSubmit={submit} className="space-y-6 bg-white rounded-2xl p-6 shadow ring-1 ring-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">Location</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Address or Virtual" />
          </div>
          <div>
            <label className="input-label">Day</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">Time</label>
            <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div>
                    <label htmlFor="imageUrl" className="input-label">
            Event Logo/Image (optional)
          </label>
          <input 
            id="imageUrl" 
            type="url" 
            className="input-field" 
            placeholder="https://..." 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 You can add or change the image later from the admin panel
          </p>
          {imageUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <label className="input-label">Description</label>
          <textarea className="input resize-none" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="input-label">Badges</label>
            <button type="button" className="btn-secondary" onClick={addMedal}>+ Add</button>
          </div>
          <div className="space-y-4">
            {medals.map((m, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Name</label>
                    <input className="input" value={m.name} onChange={(e) => updateMedal(i, { name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Points</label>
                    <input type="number" className="input" value={m.points} onChange={(e) => updateMedal(i, { points: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Description</label>
                    <input className="input" value={m.description} onChange={(e) => updateMedal(i, { description: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Icon (Image URL)</label>
                    <input className="input" value={m.iconUrl} onChange={(e) => updateMedal(i, { iconUrl: e.target.value })} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max claims (0 = unlimited)</label>
                    <input type="number" className="input" value={m.maxClaims} onChange={(e) => updateMedal(i, { maxClaims: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => removeMedal(i)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isPending || isConfirming} className="btn-primary w-full py-3">
          {isPending || isConfirming ? "Creating..." : "Submit Request"}
        </button>
        {hash && (
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-800 mb-2">✓ Transaction sent</p>
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              View on BaseScan ↗
            </a>
          </div>
        )}
      </form>
    </SharedPageLayout>
  );
}
