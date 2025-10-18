/**
 * Environment variable helpers with type safety
 */

export const env = {
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532", 10),
  REPUTATION_ADDRESS: (process.env.NEXT_PUBLIC_REPUTATION_ADDRESS || "") as `0x${string}`,
  LAUNCHPAD_ADDRESS: (process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS || "") as `0x${string}`,
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!env.REPUTATION_ADDRESS || env.REPUTATION_ADDRESS === "") {
    missing.push("NEXT_PUBLIC_REPUTATION_ADDRESS");
  }

  if (!env.LAUNCHPAD_ADDRESS || env.LAUNCHPAD_ADDRESS === "") {
    missing.push("NEXT_PUBLIC_LAUNCHPAD_ADDRESS");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
