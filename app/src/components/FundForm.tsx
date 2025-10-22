"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { Wallet, EyeOff, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";

/**
 * Fund form for contributing ETH to a project
 */
interface FundFormProps {
  projectId: bigint;
  creatorAddress: string;
  onSuccess?: () => void;
}

export function FundForm({ projectId, creatorAddress, onSuccess }: FundFormProps) {
  const [amount, setAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { address } = useAccount();

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if user is trying to fund their own project
  const isOwnProject = address?.toLowerCase() === creatorAddress?.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOwnProject) {
      toast.error("You cannot fund your own project");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "fundProject",
        args: [projectId, isAnonymous],
        value: parseEther(amount),
      });

      toast.success("Transaction sent to MetaMask");
    } catch (err: any) {
      const errorMessage = err?.message || "Transaction failed";

      if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
        toast.error("Transaction cancelled in MetaMask", {
          duration: 4000,
        });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds in your wallet", {
          duration: 4000,
        });
      } else if (errorMessage.includes("gas")) {
        toast.error("Gas error - try increasing the limit", {
          duration: 4000,
        });
      } else {
        toast.error(`Error: ${errorMessage.substring(0, 80)}...`, {
          duration: 5000,
        });
      }
      console.error("Fund project error:", err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Contribution successful! Thank you for supporting this project", {
        duration: 5000,
      });
      onSuccess?.();
      setAmount("");
    }
  }, [isSuccess]);

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">Support This Project</h3>
        </div>
        <p className="text-gray-600 text-sm">Contribute ETH to help reach the goal</p>
      </div>

      {isOwnProject && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <p className="text-sm font-semibold text-red-800">
              You cannot fund your own project
            </p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="amount" className="input-label text-base">
          Amount to contribute
        </label>
        <div className="relative">
          <input
            id="amount"
            type="number"
            step="0.001"
            min="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            className="input-field text-lg pr-16"
            disabled={isPending || isConfirming}
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
            ETH
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => setAmount("0.01")}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-800 rounded-lg transition-colors border border-blue-200"
          >
            0.01 ETH
          </button>
          <button
            type="button"
            onClick={() => setAmount("0.1")}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-800 rounded-lg transition-colors border border-blue-200"
          >
            0.1 ETH
          </button>
          <button
            type="button"
            onClick={() => setAmount("1")}
            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-800 rounded-lg transition-colors border border-blue-200"
          >
            1 ETH
          </button>
        </div>
      </div>

      {/* Anonymous Contribution Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            disabled={isPending || isConfirming}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <EyeOff className="w-5 h-5 text-gray-700" />
              <span className="font-semibold text-gray-900">Anonymous Contribution</span>
            </div>
            <p className="text-sm text-gray-600">
              Your address will not appear in the public contributors history. Only the amount will be shown.
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 animate-fadeIn">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 mb-1">Transaction Error</p>
              <p className="text-red-800 text-sm leading-relaxed">
                {error.message.includes("User rejected") || error.message.includes("User denied")
                  ? "You cancelled the transaction in MetaMask. Please try again."
                  : error.message.includes("insufficient funds")
                  ? "You don't have enough ETH in your wallet for this transaction."
                  : error.message.substring(0, 150)}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming || !amount || isOwnProject}
        className="btn-primary w-full text-lg py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending || isConfirming ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Contribute Now
          </span>
        )}
      </button>

      {hash && (
        <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-200 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-700 font-medium">Transaction sent</p>
          </div>
          <a
            href={`https://sepolia.basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center text-sm"
          >
            View on BaseScan
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </form>
  );
}
