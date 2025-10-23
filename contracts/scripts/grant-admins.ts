import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

/**
 * Script to grant ADMIN_ROLE to additional admins in EventManager
 * This can be run on an already deployed EventManager contract
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("👥 Granting admin roles with account:", deployer.address);
  
  // EventManager address from environment variable
  const eventManagerAddress = process.env.EVENT_MANAGER_ADDRESS;
  
  if (!eventManagerAddress || eventManagerAddress === "") {
    throw new Error("❌ EVENT_MANAGER_ADDRESS not set in .env file");
  }
  
  const EventManager = await ethers.getContractFactory("EventManager");
  const eventManager = EventManager.attach(eventManagerAddress);

  // Additional admins from environment variables
  const additionalAdmins = [
    process.env.ADMIN_ADDRESS_1,
    process.env.ADMIN_ADDRESS_2
  ].filter(addr => addr && addr !== "0x0000000000000000000000000000000000000000");

  if (additionalAdmins.length === 0) {
    throw new Error("❌ No admin addresses configured. Set ADMIN_ADDRESS_1 and/or ADMIN_ADDRESS_2 in .env file");
  }

  console.log("\n📋 Admins to be granted:");
  additionalAdmins.forEach((admin, i) => {
    console.log(`  ${i + 1}. ${admin}`);
  });

  for (const admin of additionalAdmins) {
    try {
      // Check if already admin
      const ADMIN_ROLE = await eventManager.ADMIN_ROLE();
      const hasRole = await eventManager.hasRole(ADMIN_ROLE, admin);
      
      if (hasRole) {
        console.log(`✓ ${admin} already has ADMIN_ROLE`);
        continue;
      }

      console.log(`\n⏳ Granting ADMIN_ROLE to ${admin}...`);
      const tx = await eventManager.grantAdmin(admin);
      await tx.wait();
      console.log(`✅ Successfully granted ADMIN_ROLE to ${admin}`);
      console.log(`   Transaction: ${tx.hash}`);
    } catch (e) {
      console.log(`❌ Failed to grant ADMIN_ROLE to ${admin}:`, (e as Error).message);
    }
  }

  console.log("\n🎉 Admin role grants completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
