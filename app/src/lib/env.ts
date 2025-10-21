/**
 * Environment variable helpers with type safety
 */

// Import fallback addresses from contracts file
import { CONTRACTS } from "./contracts";

export const env = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532", 10),
  REPUTATION_ADDRESS: (process.env.NEXT_PUBLIC_REPUTATION_ADDRESS || CONTRACTS.reputation.address) as `0x${string}`,
  LAUNCHPAD_ADDRESS: (process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS || CONTRACTS.launchpad.address) as `0x${string}`,
  EVENT_MANAGER_ADDRESS: (process.env.NEXT_PUBLIC_EVENT_MANAGER_ADDRESS || "0x4DB2EEdDbeF88165366070D72EdeA2E293cd4993") as `0x${string}`,
  USER_PROFILE_ADDRESS: (process.env.NEXT_PUBLIC_USER_PROFILE_ADDRESS || CONTRACTS.userProfile.address) as `0x${string}`,
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
} as const;

/**
 * Validate required environment variables
 * This is mainly for production deployment verification
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  // These are optional warnings since we have defaults
  if (!process.env.NEXT_PUBLIC_REPUTATION_ADDRESS) {
    console.warn("Using default REPUTATION_ADDRESS from contracts.ts");
  }

  if (!process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS) {
    console.warn("Using default LAUNCHPAD_ADDRESS from contracts.ts");
  }

  if (!process.env.NEXT_PUBLIC_EVENT_MANAGER_ADDRESS) {
    console.warn("Using default EVENT_MANAGER_ADDRESS from contracts.ts");
  }

  return {
    valid: true, // Always valid since we have defaults
    missing,
  };
}
