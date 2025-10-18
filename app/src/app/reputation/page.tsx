"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ReputationBadge } from "@/components/ReputationBadge";
import { BoostForm } from "@/components/BoostForm";
import Link from "next/link";

export default function ReputationPage() {
  const { address } = useAccount();

  // Read user's reputation
  const { data: reputation } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "reputationOf",
    args: address ? [address] : undefined,
  });

  // Read boost power
  const { data: boostPower } = useReadContract({
    address: CONTRACTS.reputation.address,
    abi: CONTRACTS.reputation.abi,
    functionName: "boostPower",
    args: address ? [address] : undefined,
  });

  // Read cooldown info
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

  const now = Math.floor(Date.now() / 1000);
  const lastBoostTime = lastBoost ? Number(lastBoost) : 0;
  const cooldownSeconds = cooldown ? Number(cooldown) : 86400;
  const timeUntilNextBoost = Math.max(0, lastBoostTime + cooldownSeconds - now);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 Meritocratic Launchpad
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Reputation-based crowdfunding on Base Sepolia
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Projects
            </Link>
            <Link href="/create" className="text-gray-600 hover:text-gray-900">
              Create Project
            </Link>
            <Link href="/reputation" className="text-primary-600 font-medium">
              Reputation
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NetworkGuard>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your Reputation
            </h2>
            <p className="text-gray-600">
              Build trust through verified achievements and community boosts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Reputation Stats */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Reputation Score</h3>

              <div className="flex items-center justify-center py-8">
                <ReputationBadge
                  reputation={reputation || BigInt(0)}
                  className="text-2xl px-6 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Boost Power</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {boostPower ? String(boostPower) : "0"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Cooldown</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(cooldownSeconds / 3600)}h
                  </p>
                </div>
              </div>

              {lastBoostTime > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  {timeUntilNextBoost > 0 ? (
                    <p className="text-blue-800">
                      ⏳ Next boost available in{" "}
                      <strong>
                        {Math.floor(timeUntilNextBoost / 3600)}h{" "}
                        {Math.floor((timeUntilNextBoost % 3600) / 60)}m
                      </strong>
                    </p>
                  ) : (
                    <p className="text-green-800 font-medium">
                      ✓ Ready to boost!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Boost Form */}
            <BoostForm />
          </div>

          {/* How It Works */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4">How Reputation Works</h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Genesis Reputation (Top-Down)
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Project owner awards reputation for verified achievements like hackathon wins, OSS contributions, and DAO participation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Boosts (Peer-to-Peer)
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Give reputation to others using your boost power (√reputation + 1). Boosts have a cooldown period to prevent spam. You cannot boost yourself.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Launch Projects
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Your reputation is displayed on all projects you create, signaling credibility to potential backers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </NetworkGuard>
      </main>
    </div>
  );
}
