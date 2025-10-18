"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { BASE_SEPOLIA } from "@/lib/chains";
import { useEffect } from "react";

/**
 * Network guard that ensures user is on Base Sepolia
 */
export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isCorrectNetwork = chainId === BASE_SEPOLIA.id;

  useEffect(() => {
    if (isConnected && !isCorrectNetwork && switchChain) {
      // Auto-switch to Base Sepolia
      switchChain({ chainId: BASE_SEPOLIA.id });
    }
  }, [isConnected, isCorrectNetwork, switchChain]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-8">
          Please connect your wallet to access the Meritocratic Launchpad
        </p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">Wrong Network</h2>
        <p className="text-gray-600 mb-8">
          Please switch to <strong>Base Sepolia</strong> to continue
        </p>
        {switchChain && (
          <button
            onClick={() => switchChain({ chainId: BASE_SEPOLIA.id })}
            className="btn-primary"
          >
            Switch to Base Sepolia
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
