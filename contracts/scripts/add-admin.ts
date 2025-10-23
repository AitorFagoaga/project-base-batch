import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Script to add a second admin to the Reputation contract
 * Run this after deploying with deploy-multi-admin.ts if you want to add more admins
 * 
 * Usage:
 *   1. Update REPUTATION_ADDRESS and ADMIN_ADDRESS_2 in .env file
 *   2. Run: npx hardhat run scripts/add-admin.ts --network base-sepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🔐 Adding admin to Reputation contract");
  console.log("👤 Deployer address:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // ═══════════════════════════════════════════════════════════════════════════
  // GET ADDRESSES FROM ENVIRONMENT
  // ═══════════════════════════════════════════════════════════════════════════

  const REPUTATION_ADDRESS = process.env.REPUTATION_ADDRESS;
  const SECOND_ADMIN_ADDRESS = process.env.ADMIN_ADDRESS_2;

  // Validate addresses
  if (!REPUTATION_ADDRESS || REPUTATION_ADDRESS === "" || REPUTATION_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ Please set REPUTATION_ADDRESS in your .env file");
  }

  if (!SECOND_ADMIN_ADDRESS || SECOND_ADMIN_ADDRESS === "" || SECOND_ADMIN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    throw new Error("❌ Please set ADMIN_ADDRESS_2 in your .env file");
  }
