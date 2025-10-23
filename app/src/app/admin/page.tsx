"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { NetworkGuard } from "@/components/NetworkGuard";
import { EventApproval } from "@/components/EventApproval";
import { SharedPageLayout } from "@/components/SharedPageLayout";
import { EVENT_MANAGER } from "@/lib/eventManager";
import Link from "next/link";

// Hardcoded admin addresses (lowercase for comparison)
const ADMIN_ADDRESSES = [
  "0xaa860e97f1a50ca6ce786aef9b835052dfd0ee25", // Your address
  "0x31a42406422e72dc790cf42ed978458b0b00bd06", // Second admin
];

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

  const isReputationOwner = address && reputationOwner && typeof reputationOwner === 'string' && address.toLowerCase() === reputationOwner.toLowerCase();
  const isHardcodedAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase());
  const isAdmin = isReputationOwner || isEventAdmin === true || isHardcodedAdmin;

  return (
    <SharedPageLayout
      title="Admin Panel - Approve Events"
      description="Approve or reject events created by users"
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
              Access Denied
            </h3>
            <p className="text-gray-700 text-lg">
              You don't have permission to access this page.
            </p>
          </div>
        )}

        {address && isAdmin && (
          <div className="animate-fadeIn space-y-6">
            <EventApproval />
          </div>
        )}
      </NetworkGuard>
    </SharedPageLayout>
  );
}
