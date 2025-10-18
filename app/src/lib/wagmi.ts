"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { SUPPORTED_CHAINS } from "./chains";
import { env } from "./env";

/**
 * Wagmi configuration with RainbowKit
 * Optimized for Base Sepolia with caching and batch settings
 */
export const wagmiConfig = getDefaultConfig({
  appName: "Meritocratic Launchpad",
  projectId: env.WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: SUPPORTED_CHAINS as any,
  ssr: true,
  batch: {
    multicall: {
      batchSize: 1024 * 200, // 200KB batch size for better performance
      wait: 16, // 16ms wait time between batches
    },
  },
});
