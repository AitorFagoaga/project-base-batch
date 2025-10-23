import { ethers } from "hardhat";

/**
 * Redeploy EventManager contract with fixed IReputation interface
 *
 * Usage:
 *   npx hardhat run scripts/redeploy-eventmanager.ts --network baseSepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Redeploying EventManager contract");
  console.log("📍 Deployer address:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Existing contract addresses (from .env.local)
  const REPUTATION_ADDRESS = "0x4bFEd65431969Ef98D6A2e294bB5b5da149D1C6F";
  const CURRENT_EVENT_MANAGER = "0x4DB2EEdDbeF88165366070D72EdeA2E293cd4993";

  console.log("\n📋 Using existing contracts:");
  console.log("   Reputation:", REPUTATION_ADDRESS);
  console.log("   Old EventManager:", CURRENT_EVENT_MANAGER, "(will be replaced)");

  // Deploy new EventManager
  console.log("\n🚀 Deploying new EventManager contract...");

  const EventManagerFactory = await ethers.getContractFactory("EventManager");
  const eventManager = await EventManagerFactory.deploy(
    deployer.address, // initialAdmin
    REPUTATION_ADDRESS  // reputation contract address
  );

  await eventManager.waitForDeployment();
  const eventManagerAddress = await eventManager.getAddress();

  console.log("✅ New EventManager deployed at:", eventManagerAddress);

  // Verify admin role
  console.log("\n🔍 Verifying admin roles...");
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
  const hasAdminRole = await eventManager.hasRole(ADMIN_ROLE, deployer.address);
  console.log("✅ Deployer has ADMIN_ROLE:", hasAdminRole);

  // Check that reputation contract is set correctly
  const reputationContractAddress = await eventManager.reputation();
  console.log("✅ Reputation contract:", reputationContractAddress);

  console.log("\n📝 IMPORTANT: Grant ADMIN_ROLE to EventManager on Reputation contract");
  console.log("   Run this command to grant admin role:");
  console.log(`   npx hardhat run scripts/grant-eventmanager-admin.ts --network baseSepolia`);
  console.log("   Or manually grant using Reputation contract's grantAdmin() function");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 NEXT STEPS:");
  console.log("\n1️⃣  Update your frontend .env.local file:");
  console.log(`   NEXT_PUBLIC_EVENT_MANAGER_ADDRESS=${eventManagerAddress}`);

  console.log("\n2️⃣  Update ABI in app/src/lib/eventManager.ts:");
  console.log("   The ABI has been regenerated in typechain-types/");

  console.log("\n3️⃣  Grant EventManager ADMIN_ROLE on Reputation contract:");
  console.log(`   Address to grant: ${eventManagerAddress}`);

  console.log("\n4️⃣  Test creating an event on your frontend");
  console.log("   The transaction should now succeed!");

  console.log("\n📊 Summary:");
  console.log("   Old EventManager:", CURRENT_EVENT_MANAGER);
  console.log("   New EventManager:", eventManagerAddress);
  console.log("   Reputation:", REPUTATION_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
