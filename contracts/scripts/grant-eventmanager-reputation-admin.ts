import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Script to grant ADMIN_ROLE on Reputation contract to EventManager
 * This is required for EventManager to award reputation points when medals are claimed
 */

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n🔑 Granting ADMIN_ROLE to EventManager");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Executing with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Get contract addresses from environment
  const reputationAddress = process.env.NEXT_PUBLIC_REPUTATION_ADDRESS;
  const eventManagerAddress = process.env.NEXT_PUBLIC_EVENT_MANAGER_ADDRESS;

  if (!reputationAddress || !eventManagerAddress) {
    throw new Error("❌ Missing contract addresses in .env file");
  }

  console.log("\n📍 Contract Addresses:");
  console.log("Reputation:    ", reputationAddress);
  console.log("EventManager:  ", eventManagerAddress);

  // Connect to the Reputation contract
  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = Reputation.attach(reputationAddress);

  // Get the ADMIN_ROLE hash
  const ADMIN_ROLE = await reputation.ADMIN_ROLE();
  console.log("\n🔐 ADMIN_ROLE hash:", ADMIN_ROLE);

  // Check if EventManager already has the role
  const hasRole = await reputation.hasRole(ADMIN_ROLE, eventManagerAddress);

  if (hasRole) {
    console.log("\n✅ EventManager already has ADMIN_ROLE on Reputation contract");
    console.log("   No action needed.");
    return;
  }

  console.log("\n⚠️  EventManager does NOT have ADMIN_ROLE");
  console.log("   This is why medal claims don't increase reputation!");
  console.log("\n🔄 Granting ADMIN_ROLE now...");

  // Get gas price with buffer
  const feeData = await ethers.provider.getFeeData();
  const baseGasPrice = feeData.gasPrice || ethers.parseUnits("1", "gwei");
  const bufferedPrice = (baseGasPrice * 130n) / 100n; // 30% buffer

  console.log("⛽ Gas price:", ethers.formatUnits(bufferedPrice, "gwei"), "gwei");

  // Grant the role
  const tx = await reputation.grantRole(ADMIN_ROLE, eventManagerAddress, {
    gasPrice: bufferedPrice,
    gasLimit: 200000
  });

  console.log("📝 Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await tx.wait();

  console.log("\n✅ Transaction confirmed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Block:", receipt?.blockNumber);
  console.log("Gas used:", receipt?.gasUsed.toString());
  console.log("Transaction hash:", tx.hash);

  // Verify the role was granted
  const hasRoleAfter = await reputation.hasRole(ADMIN_ROLE, eventManagerAddress);

  if (hasRoleAfter) {
    console.log("\n🎉 SUCCESS! EventManager now has ADMIN_ROLE on Reputation contract");
    console.log("\n✨ Medal claims will now properly increase reputation scores!");
    console.log("\n📝 Next steps:");
    console.log("1. Test claiming a medal");
    console.log("2. Verify that the reputation score increases by the medal's points value");
    console.log("3. Check the profile page to confirm both the medal and updated reputation appear");
  } else {
    console.log("\n❌ ERROR: Role grant transaction succeeded but verification failed");
    console.log("   Please check the transaction on BaseScan and try again");
  }

  console.log("\n🔍 View on BaseScan:");
  console.log(`https://sepolia.basescan.org/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
