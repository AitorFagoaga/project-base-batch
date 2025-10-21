import { ethers } from "hardhat";

/**
 * Add a second admin to the Reputation contract
 *
 * Prerequisites:
 * - You must be running this with a wallet that has DEFAULT_ADMIN_ROLE
 * - The Reputation contract must be deployed with AccessControl
 *
 * Usage:
 *   1. Edit REPUTATION_ADDRESS to your deployed contract
 *   2. Edit SECOND_ADMIN_ADDRESS to the address you want to add
 *   3. Run: npx hardhat run scripts/add-admin.ts --network baseSepolia
 */
async function main() {
  const [signer] = await ethers.getSigners();

  console.log("🔐 Add Admin Script for Reputation Contract");
  console.log("👤 Current signer:", signer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION - UPDATE THESE VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  // TODO: Update this with your deployed Reputation contract address
  const REPUTATION_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual address

  // TODO: Update this with the address you want to add as admin
  const SECOND_ADMIN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual address

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  if (REPUTATION_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please update REPUTATION_ADDRESS in add-admin.ts");
    process.exit(1);
  }

  if (SECOND_ADMIN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please update SECOND_ADMIN_ADDRESS in add-admin.ts");
    process.exit(1);
  }

  console.log("\n📋 Configuration:");
  console.log("   Reputation Contract:", REPUTATION_ADDRESS);
  console.log("   New Admin Address:", SECOND_ADMIN_ADDRESS);

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECT TO CONTRACT
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🔗 Connecting to Reputation contract...");

  const ReputationFactory = await ethers.getContractFactory("Reputation");
  const reputation = ReputationFactory.attach(REPUTATION_ADDRESS);

  // Role identifiers
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK PERMISSIONS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🔍 Checking permissions...");

  const hasDefaultAdmin = await reputation.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
  const hasAdminRole = await reputation.hasRole(ADMIN_ROLE, signer.address);

  console.log("   Your DEFAULT_ADMIN_ROLE:", hasDefaultAdmin ? "✅" : "❌");
  console.log("   Your ADMIN_ROLE:", hasAdminRole ? "✅" : "❌");

  if (!hasDefaultAdmin) {
    console.error("\n❌ Error: You don't have DEFAULT_ADMIN_ROLE!");
    console.error("   Only addresses with DEFAULT_ADMIN_ROLE can grant roles to others.");
    console.error("   Current signer:", signer.address);
    console.error("\n💡 Make sure you're using the wallet that deployed the contract.");
    process.exit(1);
  }

  // Check if address already has admin role
  const alreadyAdmin = await reputation.hasRole(ADMIN_ROLE, SECOND_ADMIN_ADDRESS);

  if (alreadyAdmin) {
    console.log("\n⚠️  Warning: This address already has ADMIN_ROLE");
    console.log("   Address:", SECOND_ADMIN_ADDRESS);
    console.log("   No action needed.");
    process.exit(0);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRANT ADMIN ROLE
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n✨ Granting ADMIN_ROLE to:", SECOND_ADMIN_ADDRESS);
  console.log("⏳ Sending transaction...");

  const tx = await reputation.grantRole(ADMIN_ROLE, SECOND_ADMIN_ADDRESS);
  console.log("📝 Transaction hash:", tx.hash);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFY GRANT
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🔍 Verifying new admin...");

  const nowHasAdminRole = await reputation.hasRole(ADMIN_ROLE, SECOND_ADMIN_ADDRESS);

  if (nowHasAdminRole) {
    console.log("✅ SUCCESS! Address now has ADMIN_ROLE");
    console.log("   New Admin:", SECOND_ADMIN_ADDRESS);
    console.log("\n🎉 Both admins can now:");
    console.log("   - Award genesis reputation (awardGenesis)");
    console.log("   - Award genesis with categories (awardGenesisWithCategory)");
    console.log("   - Award genesis in batches (awardGenesisBatch)");
    console.log("   - Update protocol parameters (setParams)");
  } else {
    console.error("❌ Error: Role grant may have failed");
    console.error("   Please check the transaction on BaseScan");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST ALL ADMINS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n📊 Current Admins:");

  // Check both addresses
  const addresses = [signer.address, SECOND_ADMIN_ADDRESS];

  for (const addr of addresses) {
    const hasAdmin = await reputation.hasRole(ADMIN_ROLE, addr);
    const hasDefaultAdmin = await reputation.hasRole(DEFAULT_ADMIN_ROLE, addr);

    console.log(`\n   ${addr}`);
    console.log(`   - ADMIN_ROLE: ${hasAdmin ? "✅" : "❌"}`);
    console.log(`   - DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin ? "✅" : "❌"}`);
  }

  console.log("\n✅ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
