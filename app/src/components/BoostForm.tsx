"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { isAddress } from "viem";

/**
 * Boost form for giving reputation to another user
 */
interface BoostFormProps {
  targetUser?: `0x${string}`;
}

export function BoostForm({ targetUser }: BoostFormProps = {}) {
  const [recipientAddress, setRecipientAddress] = useState(targetUser || "");
  const { address } = useAccount();

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read cooldown and last boost time
  const { data: lastBoost } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "lastBoostAt",
    args: address ? [address] : undefined,
  });

  const { data: cooldown } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "cooldown",
  });

  const { data: boostPowerData } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "boostPower",
    args: address ? [address] : undefined,
  });

  const now = Math.floor(Date.now() / 1000);
  const lastBoostTime = lastBoost ? Number(lastBoost) : 0;
  const cooldownSeconds = cooldown ? Number(cooldown) : 86400;
  const timeUntilNextBoost = Math.max(0, lastBoostTime + cooldownSeconds - now);
  const canBoost = timeUntilNextBoost === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientAddress || !isAddress(recipientAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    if (recipientAddress.toLowerCase() === address?.toLowerCase()) {
      toast.error("Cannot boost yourself!");
      return;
    }

    if (!canBoost) {
      const hours = Math.floor(timeUntilNextBoost / 3600);
      const minutes = Math.floor((timeUntilNextBoost % 3600) / 60);
      toast.error(`Cooldown active: ${hours}h ${minutes}m remaining`);
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.reputation.address,
        abi: CONTRACTS.reputation.abi,
        functionName: "boost",
        args: [recipientAddress as `0x${string}`],
      });

      toast.success("Boost transaction submitted!");
    } catch (err: any) {
      toast.error(err?.message || "Boost failed");
    }
  };

  if (isSuccess) {
    toast.success("Boost given successfully!");
    setRecipientAddress("");
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-bold mb-4">Boost Someone's Reputation</h3>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <p className="font-medium text-blue-900">Your boost power: {boostPowerData ? String(boostPowerData) : "0"}</p>
        <p className="text-blue-700 mt-1">
          {canBoost ? (
            "✓ Ready to boost!"
          ) : (
            `⏳ Cooldown: ${formatTime(timeUntilNextBoost)}`
          )}
        </p>
      </div>

      <div className="mb-4">
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
          Recipient Address
        </label>
        <input
          id="recipient"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="0x..."
          className="input-field font-mono text-sm"
          disabled={isPending || isConfirming || !canBoost || !!targetUser}
          readOnly={!!targetUser}
        />
        {targetUser && (
          <p className="text-xs text-gray-500 mt-1">
            Boosteando a este usuario
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming || !canBoost || !recipientAddress}
        className="btn-primary w-full"
      >
        {isPending || isConfirming ? "Processing..." : "Give Boost"}
      </button>

      {hash && (
        <div className="mt-3 text-sm text-gray-600">
          <a
            href={`https://sepolia.basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            View on BaseScan ↗
          </a>
        </div>
      )}
    </form>
  );
}
