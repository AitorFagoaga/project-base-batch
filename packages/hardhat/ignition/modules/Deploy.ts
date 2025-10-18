import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition deployment module for Meritocratic Launchpad
 *
 * This deploys both contracts:
 * 1. Reputation.sol - The on-chain reputation protocol
 * 2. Launchpad.sol - The crowdfunding platform
 *
 * These contracts are independent and communicate through the frontend
 */
const MeritocraticLaunchpadModule = buildModule("MeritocraticLaunchpad", (m) => {
  // Deploy Reputation contract
  const reputation = m.contract("Reputation");

  // Deploy Launchpad contract
  const launchpad = m.contract("Launchpad");

  // Return both deployed contracts
  return { reputation, launchpad };
});

export default MeritocraticLaunchpadModule;
