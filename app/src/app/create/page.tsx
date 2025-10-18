"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkGuard } from "@/components/NetworkGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateProjectPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [title, setTitle] = useState("");
  const [goalEth, setGoalEth] = useState("");
  const [durationDays, setDurationDays] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !goalEth || !durationDays) {
      toast.error("Please fill all fields");
      return;
    }

    const goal = parseFloat(goalEth);
    const duration = parseInt(durationDays, 10);

    if (goal <= 0) {
      toast.error("Goal must be greater than 0");
      return;
    }

    if (duration <= 0 || duration > 365) {
      toast.error("Duration must be between 1 and 365 days");
      return;
    }

    try {
      // Convert ETH to Wei (multiply by 10^18)
      const goalInWei = BigInt(Math.floor(goal * 1e18));
      
      writeContract({
        address: CONTRACTS.launchpad.address,
        abi: CONTRACTS.launchpad.abi,
        functionName: "createProject",
        args: [title, goalInWei, BigInt(duration)],
      });

      toast.success("📝 Transacción enviada a MetaMask");
    } catch (err: any) {
      console.error("Create project error:", err);
      const errorMessage = err?.message || "Transaction failed";
      
      // Mejores mensajes de error en español
      if (errorMessage.includes("User rejected") || errorMessage.includes("User denied")) {
        toast.error("❌ Transacción cancelada en MetaMask", {
          duration: 4000,
        });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("💰 Fondos insuficientes para el gas", {
          duration: 4000,
        });
      } else if (errorMessage.includes("gas")) {
        toast.error("⛽ Error de gas - intenta aumentar el límite", {
          duration: 4000,
        });
      } else {
        toast.error(`❌ Error: ${errorMessage.substring(0, 80)}`, {
          duration: 5000,
        });
      }
    }
  };

  if (isSuccess) {
    toast.success("🎉 ¡Proyecto creado exitosamente! Redirigiendo...", {
      duration: 3000,
      icon: "🚀",
    });
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="glass-card border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 drop-shadow-sm">
                🚀 Meritocratic Launchpad
              </h1>
              <p className="text-gray-800 mt-1 font-medium">
                Reputation-based crowdfunding on Base Sepolia
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="glass-card border-b border-white/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link 
              href="/" 
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/20"
            >
              📊 Projects
            </Link>
            <Link 
              href="/create" 
              className="text-gray-900 font-bold bg-white/30 px-4 py-2 rounded-lg shadow-sm"
            >
              ✨ Create Project
            </Link>
            <Link 
              href="/reputation" 
              className="text-gray-800 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/20"
            >
              ⭐ Reputation
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <NetworkGuard>
          {/* Header Section */}
          <div className="mb-10 text-center animate-fadeIn">
            <h2 className="text-4xl font-bold text-gray-900 drop-shadow-sm mb-3">
              🚀 Launch Your Project
            </h2>
            <p className="text-gray-800 text-lg font-medium max-w-2xl mx-auto">
              Create your crowdfunding campaign on Base Sepolia
            </p>
          </div>

          {!isConnected ? (
            <div className="card text-center py-16 animate-fadeIn">
              <div className="text-7xl mb-6">🔐</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                You need to connect your wallet to create a project
              </p>
              <ConnectButton />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card animate-fadeIn space-y-6">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start">
                  <span className="text-3xl mr-4">💡</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">All-or-Nothing Funding</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Your project receives funds only if the goal is reached before deadline. 
                      This protects backers and ensures project viability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Title */}
              <div>
                <label htmlFor="title" className="input-label text-lg">
                  📝 Project Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Build a Decentralized Social Network"
                  className="input-field text-lg"
                  disabled={isPending || isConfirming}
                  maxLength={100}
                  required
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    Choose a clear, descriptive title
                  </p>
                  <p className={`text-sm font-medium ${title.length > 90 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {title.length}/100
                  </p>
                </div>
              </div>

              {/* Funding Goal */}
              <div>
                <label htmlFor="goal" className="input-label text-lg">
                  💰 Funding Goal (ETH) *
                </label>
                <div className="relative">
                  <input
                    id="goal"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={goalEth}
                    onChange={(e) => setGoalEth(e.target.value)}
                    placeholder="1.0"
                    className="input-field text-lg pr-16"
                    disabled={isPending || isConfirming}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    ETH
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Minimum: 0.01 ETH · Funds are released only if goal is reached
                </p>
              </div>

              {/* Campaign Duration */}
              <div>
                <label htmlFor="duration" className="input-label text-lg">
                  ⏰ Campaign Duration *
                </label>
                <div className="relative">
                  <input
                    id="duration"
                    type="number"
                    min="1"
                    max="365"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    placeholder="30"
                    className="input-field text-lg pr-20"
                    disabled={isPending || isConfirming}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    days
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setDurationDays("7")}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    7 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays("30")}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    30 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays("60")}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    60 days
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationDays("90")}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    90 days
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-900">Transaction Error</p>
                      <p className="text-red-700 text-sm mt-1">{error.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending || isConfirming || !isConnected || !title || !goalEth || !durationDays}
                className="btn-primary w-full text-xl py-4 font-bold"
              >
                {isPending || isConfirming ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Project...
                  </span>
                ) : (
                  "🚀 Launch Project"
                )}
              </button>

              {/* Transaction Link */}
              {hash && (
                <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200 animate-fadeIn">
                  <p className="text-sm text-gray-700 mb-2">Transaction submitted!</p>
                  <a
                    href={`https://sepolia.basescan.org/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center"
                  >
                    View on BaseScan
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </form>
          )}
        </NetworkGuard>
      </main>
    </div>
  );
}
