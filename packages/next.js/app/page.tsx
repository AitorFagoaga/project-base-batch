"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Meritocratic Launchpad</h1>
        <ConnectButton />
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Trust-Based Crowdfunding on Base
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fund projects led by builders with proven on-chain reputation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🚀 Launch Projects</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create your crowdfunding campaign and leverage your reputation to build trust
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">⭐ Build Reputation</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Earn medals from trusted communities and boost other builders
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
