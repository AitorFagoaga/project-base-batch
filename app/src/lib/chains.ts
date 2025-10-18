import { baseSepolia } from "viem/chains";
import { Chain } from "viem";

/**
 * Chain configuration for Base Sepolia
 */
export const BASE_SEPOLIA: Chain = {
  ...baseSepolia,
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"],
    },
    public: {
      http: ["https://sepolia.base.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "BaseScan",
      url: "https://sepolia.basescan.org",
    },
  },
  testnet: true,
};

export const SUPPORTED_CHAINS = [BASE_SEPOLIA] as const;
