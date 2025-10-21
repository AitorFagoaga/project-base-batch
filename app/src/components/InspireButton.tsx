"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";

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
      toast.error("❌ No puedes inspirar tu propio proyecto");
      return;
    }

    if (alreadyInspired) {
      toast.error("❌ Ya inspiraste este proyecto");
      return;
    }

    try {
      writeContract({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "inspireProject",
        args: [projectId],
      });

      toast.success("📝 Transacción enviada a MetaMask");
    } catch (err: any) {
      console.error("Inspire error:", err);
      toast.error(err?.message || "Error al inspirar el proyecto");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("✨ ¡Inspiraste este proyecto! El creador recibió 3 puntos de reputación", {
        duration: 5000,
        icon: "🎖️",
      });
    }
  }, [isSuccess]);

  if (isOwnProject) {
    return null; // Don't show button for own projects
  }

  return (
    <div className="card space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-3">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4151/4151213.png" 
            alt="Medalla Inspirador"
            className="w-16 h-16 mx-auto"
          />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ¿Te inspira este proyecto?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Otorga una medalla de "Inspirador" al creador y dale <strong>3 puntos de reputación</strong>
        </p>
      </div>

      {alreadyInspired ? (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <p className="text-sm font-semibold text-green-800 text-center">
            ✓ Ya inspiraste este proyecto
          </p>
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
              Procesando...
            </span>
          ) : (
            "🎖️ Inspirar Proyecto"
          )}
        </button>
      )}

      {hash && (
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800 mb-2">✓ Transacción enviada</p>
          <a
            href={`https://sepolia.basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            Ver en BaseScan ↗
          </a>
        </div>
      )}
    </div>
  );
}
