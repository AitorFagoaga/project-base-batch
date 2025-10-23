"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { parseEther, isAddress } from "viem";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "HACKATHON", label: "🏆 Hackathon Winner", defaultPoints: 100 },
  { value: "OSS", label: "💻 OSS Contributor", defaultPoints: 50 },
  { value: "DAO", label: "🏛️ DAO Member", defaultPoints: 75 },
  { value: "BUILDER", label: "🔨 Notable Builder", defaultPoints: 150 },
  { value: "CUSTOM", label: "✨ Custom", defaultPoints: 10 },
];

export function GenesisAwardForm() {
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Single award state
  const [recipient, setRecipient] = useState("");
  const [category, setCategory] = useState("HACKATHON");
  const [amount, setAmount] = useState("100");
  const [reason, setReason] = useState("");

  // Batch award state
  const [batchData, setBatchData] = useState("");

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle category change and update default amount
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const cat = CATEGORIES.find((c) => c.value === newCategory);
    if (cat) {
      setAmount(cat.defaultPoints.toString());
    }
  };

  // Handle single award
  const handleSingleAward = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAddress(recipient)) {
      toast.error("Invalid recipient address");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.reputation.address,
        abi: CONTRACTS.reputation.abi,
        functionName: "awardGenesisWithCategory",
        args: [recipient as `0x${string}`, BigInt(amount), category, reason],
      });
    } catch (error) {
      console.error("Error awarding genesis:", error);
      toast.error("Failed to award genesis");
    }
  };

  // Handle batch award
  const handleBatchAward = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Parse CSV: address,category,amount,reason
      const lines = batchData
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      if (lines.length === 0) {
        toast.error("No data to process");
        return;
      }

      const recipients: `0x${string}`[] = [];
      const amounts: bigint[] = [];
      const categories: string[] = [];
      const reasons: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim());

        if (parts.length !== 4) {
          toast.error(`Invalid format on line ${i + 1}`);
          return;
        }

        const [addr, cat, amt, rsn] = parts;

        if (!isAddress(addr)) {
          toast.error(`Invalid address on line ${i + 1}: ${addr}`);
          return;
        }

        if (!CATEGORIES.find((c) => c.value === cat)) {
          toast.error(`Invalid category on line ${i + 1}: ${cat}`);
          return;
        }

        if (!amt || Number(amt) <= 0) {
          toast.error(`Invalid amount on line ${i + 1}`);
          return;
        }

        recipients.push(addr as `0x${string}`);
        categories.push(cat);
        amounts.push(BigInt(amt));
        reasons.push(rsn);
      }

      writeContract({
        address: CONTRACTS.reputation.address,
        abi: CONTRACTS.reputation.abi,
        functionName: "awardGenesisBatchWithCategories",
        args: [recipients, amounts, categories, reasons],
      });
    } catch (error) {
      console.error("Error processing batch:", error);
      toast.error("Failed to process batch");
    }
  };

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Genesis reputation awarded!");
      setTimeout(() => {
        setRecipient("");
        setReason("");
        setBatchData("");
      }, 1000);
    }
  }, [isSuccess]);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Mode Selector */}
      <div className="admin-card">
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setMode("single")}
            className={`mode-toggle-btn ${
              mode === "single" ? "mode-toggle-active" : "mode-toggle-inactive"
            }`}
          >
            ✨ Single Award
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`mode-toggle-btn ${
              mode === "batch" ? "mode-toggle-active" : "mode-toggle-inactive"
            }`}
          >
            📊 Batch Award
          </button>
        </div>

        {mode === "single" ? (
          /* Single Award Form */
          <form onSubmit={handleSingleAward} className="space-y-6">
            <div>
              <label className="input-label">
                🏷️ Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-2">
                Recommended: {CATEGORIES.find(c => c.value === category)?.defaultPoints} points
              </p>
            </div>

            <div>
              <label className="input-label">
                📧 Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="input font-mono"
                required
              />
            </div>

            <div>
              <label className="input-label">
                💎 Points Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="input"
                required
              />
            </div>

            <div>
              <label className="input-label">
                📝 Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Winner of ETHGlobal Hackathon 2024"
                rows={4}
                className="input resize-none"
                required
              />
              <p className="text-xs text-gray-600 mt-2">
                Provide specific details about the achievement
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="btn-primary w-full text-lg py-4"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Processing Transaction...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🎁 Award Genesis Reputation
                </span>
              )}
            </button>
          </form>
        ) : (
          /* Batch Award Form */
          <form onSubmit={handleBatchAward} className="space-y-6">
            <div>
              <label className="input-label">
                📊 CSV Data (address,category,amount,reason)
              </label>
              <textarea
                value={batchData}
                onChange={(e) => setBatchData(e.target.value)}
                placeholder={`0x123...,HACKATHON,100,ETHGlobal Winner\n0x456...,OSS,50,Contributor to project X\n0x789...,DAO,75,Active DAO member`}
                rows={10}
                className="input font-mono text-sm resize-none"
                required
              />
              <p className="text-xs text-gray-600 mt-2">
                <strong>Format:</strong> One award per line · Valid categories: {CATEGORIES.map((c) => c.value).join(", ")}
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="btn-primary w-full text-lg py-4"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Processing Batch...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🎁 Award Batch Genesis Reputation
                </span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Instructions */}
      <div className="admin-card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          📋 Genesis Award Guidelines
        </h3>
        <div className="space-y-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.value} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
              <span className="flex-shrink-0 text-2xl">{cat.label.split(" ")[0]}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  {cat.label.split(" ").slice(1).join(" ")}
                </div>
                <div className="text-sm text-gray-700">
                  Recommended: <span className="font-bold text-blue-700">{cat.defaultPoints} points</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
          <p className="text-sm text-yellow-900 font-medium flex items-start gap-2">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <span><strong>Important:</strong> Genesis reputation cannot be revoked. Only award points for verified achievements that you&apos;ve personally validated.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
