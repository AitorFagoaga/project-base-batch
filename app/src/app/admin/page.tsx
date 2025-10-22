"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { GenesisAwardForm } from "@/components/GenesisAwardForm";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EVENT_MANAGER } from "@/lib/eventManager";

export default function AdminPage() {
  const { address } = useAccount();

  // Check if user is the Reputation contract owner
  const { data: reputationOwner } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "owner",
  });

  // Check if user is EventManager admin
  const { data: adminRole } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "ADMIN_ROLE",
    query: {
      enabled: !!address
    }
  });
  
  const { data: isEventAdmin } = useReadContract({ 
    address: EVENT_MANAGER.address, 
    abi: EVENT_MANAGER.abi, 
    functionName: "hasRole", 
    args: adminRole && address ? [adminRole as `0x${string}`, address] : undefined,
    query: { 
      enabled: !!address && !!adminRole 
    } 
  });

  const isReputationOwner = address && reputationOwner && address.toLowerCase() === reputationOwner.toLowerCase();
  const isAdmin = isReputationOwner || isEventAdmin === true;

  return (
    <SharedPageLayout
      title="Admin Panel"
      description="Award Genesis reputation points to verified builders"
    >
      <NetworkGuard>
        {!address && (
          <div className="card text-center py-16 animate-fadeIn">
            <div className="text-6xl mb-6">🔐</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Connect Your Wallet
            </h3>
            <p className="text-gray-700 text-lg">
              Please connect your wallet to access the admin panel
            </p>
          </div>
        )}

        {address && !isAdmin && (
          <div className="card text-center py-16 animate-fadeIn">
            <div className="text-7xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Access Restricted
            </h3>
            <p className="text-gray-700 text-lg mb-2">
              Only contract owners and admins can access this page.
            </p>
            <div className="mt-6 space-y-3">
              <div className="inline-block px-6 py-3 bg-gray-100 rounded-xl border-2 border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">Reputation Owner</p>
                <p className="text-gray-900 font-mono text-sm">
                  {reputationOwner ? `${reputationOwner.slice(0, 10)}...${reputationOwner.slice(-8)}` : "Loading..."}
                </p>
              </div>
              <p className="text-sm text-gray-500">or EventManager ADMIN_ROLE holder</p>
            </div>
          </div>
        )}

        {address && isAdmin && (
          <div className="animate-fadeIn">
            <GenesisAwardForm />
          </div>
        )}
      </NetworkGuard>
    </SharedPageLayout>
  );
}
