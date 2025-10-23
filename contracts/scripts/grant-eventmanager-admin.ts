import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Grant ADMIN_ROLE to EventManager contract in Reputation contract
 * This allows EventManager to award reputation when medals are claimed
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Granting admin role with account:", deployer.address);

  // Get addresses from environment variables
  const REPUTATION_ADDRESS = process.env.REPUTATION_ADDRESS;
  const EVENT_MANAGER_ADDRESS = process.env.EVENT_MANAGER_ADDRESS;

  if (!REPUTATION_ADDRESS || REPUTATION_ADDRESS === "") {
    throw new Error("❌ REPUTATION_ADDRESS not set in .env file");
  }

  if (!EVENT_MANAGER_ADDRESS || EVENT_MANAGER_ADDRESS === "") {
    throw new Error("❌ EVENT_MANAGER_ADDRESS not set in .env file");
  }

  console.log("Reputation address:", REPUTATION_ADDRESS);
  console.log("EventManager address:", EVENT_MANAGER_ADDRESS);
