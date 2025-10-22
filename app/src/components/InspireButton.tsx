"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { Sparkles, CheckCircle } from "lucide-react";

interface InspireButtonProps {
  projectId: bigint;
  creatorAddress: string;
}

export function InspireButton({ projectId, creatorAddress }: InspireButtonProps) {
  const { address } = useAccount();
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check if user already inspired this project
  const { data: hasInspired } = useReadContract({
    address: CONTRACTS.launchpad.address,
    abi: CONTRACTS.launchpad.abi,
    functionName: "hasInspired",
    args: address && projectId !== undefined ? [projectId, address] : undefined,
    query: {
      enabled: !!address && projectId !== undefined,
    },
  });

  const alreadyInspired = hasInspired === true;
  const isOwnProject = address?.toLowerCase() === creatorAddress?.toLowerCase();

  const handleInspire = async () => {
    if (isOwnProject) {
      toast.error("You cannot inspire your own project");
      return;
    }

    if (alreadyInspired) {
      toast.error("You already inspired this project");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "inspireProject",
        args: [projectId],
      });

      toast.success("Transaction sent to MetaMask");
    } catch (err: any) {
      console.error("Inspire error:", err);
      toast.error(err?.message || "Error inspiring the project");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("You inspired this project! The creator received 3 reputation points", {
        duration: 5000,
      });
    }
  }, [isSuccess]);

  if (isOwnProject) {
    return null; // Don't show button for own projects
  }

  return (
    <div className="card space-y-4">
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center">
          <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-4">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4151/4151213.png" 
              alt="Inspiration" 
              className="w-10 h-10"
            />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Does this project inspire you?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Award an "Inspiration" badge to the creator and give them <strong>3 reputation points</strong>
        </p>
      </div>

      {alreadyInspired ? (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm font-semibold text-green-800 text-center">
              You already inspired this project
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleInspire}
          disabled={isPending || isConfirming || alreadyInspired}
          className="btn-primary w-full py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Sparkles className="w-5 h-5" />
              Inspire Project
            </span>
          )}
        </button>
      )}

      {hash && (
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center gap-1 mb-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <p className="text-xs text-green-800">Transaction sent</p>
          </div>
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
    </div>
  );
}
