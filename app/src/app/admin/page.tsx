"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { GenesisAwardForm } from "@/components/GenesisAwardForm";
import { SharedPageLayout } from "@/components/SharedPageLayout";

export default function AdminPage() {
  const { address } = useAccount();

  // Check if user is the owner
  const { data: owner } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "owner",
  });

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  return (
    <SharedPageLayout
      title="Admin Panel"
      description="Award Genesis reputation points to verified builders"
    >
      <NetworkGuard>
        {!address ? (
          <div className="admin-card text-center py-16 animate-fadeIn">
            <div className="text-6xl mb-6">🔐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Connect Your Wallet
            </h3>
            <p className="text-gray-700 text-lg">
              Please connect your wallet to access the admin panel
            </p>
          </div>
        ) : !isOwner ? (
          <div className="admin-card text-center py-16 animate-fadeIn">
            <div className="text-7xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Access Restricted
            </h3>
            <p className="text-gray-700 text-lg mb-2">
              Only the contract owner can access this page.
            </p>
            <div className="mt-6 inline-block px-6 py-3 bg-gray-100 rounded-xl border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">Contract Owner</p>
              <p className="text-gray-900 font-mono text-sm">
                {owner ? `${(owner as string).slice(0, 10)}...${(owner as string).slice(-8)}` : "Loading..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <GenesisAwardForm />
          </div>
        )}
      </NetworkGuard>
    </SharedPageLayout>
  );
}
