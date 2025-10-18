import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia, hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Meritocratic Launchpad",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [baseSepolia, base, hardhat],
  ssr: true,
});
