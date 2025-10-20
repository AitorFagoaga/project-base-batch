import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy script for Reputation and Launchpad contracts with Multi-Admin support
 * - Reputation: Uses AccessControl for multiple admins
 * - Launchpad: Supports description and imageUrl fields
 *
 * Usage:
 *   npx hardhat run scripts/deploy-multi-admin.ts --network baseSepolia
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contracts with Multi-Admin support");
  console.log("📍 Deployer address:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // ═══════════════════════════════════════════════════════════════════════════
  // REPUTATION CONTRACT (with AccessControl)
  // ═══════════════════════════════════════════════════════════════════════════

  const COOLDOWN = 86400; // 1 day in seconds
  const BASELINE_POWER = 1; // Base boost power
  const MIN_REP_TO_BOOST = 0; // Minimum reputation to boost others (0 for MVP)

  console.log("\n📜 Deploying Reputation contract with AccessControl...");
  console.log("⚙️  Parameters:");
  console.log("   - Cooldown:", COOLDOWN, "seconds (24 hours)");
  console.log("   - Baseline Power:", BASELINE_POWER);
  console.log("   - Min Rep to Boost:", MIN_REP_TO_BOOST);
  console.log("   - Initial Admin:", deployer.address);

  const ReputationFactory = await ethers.getContractFactory("Reputation");
  const reputation = await ReputationFactory.deploy(
    COOLDOWN,
    BASELINE_POWER,
    MIN_REP_TO_BOOST,
    deployer.address // Initial admin (you can add more later)
  );

  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();

  console.log("✅ Reputation deployed at:", reputationAddress);
  console.log("👤 Initial admin:", deployer.address);
  console.log("📝 Note: You can add more admins using the add-admin.ts script");

  // ═══════════════════════════════════════════════════════════════════════════
  // LAUNCHPAD CONTRACT (with description & imageUrl)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🚀 Deploying Launchpad contract...");
  console.log("⏳ Waiting 3 seconds to avoid nonce issues...");

  await new Promise(resolve => setTimeout(resolve, 3000));

  const LaunchpadFactory = await ethers.getContractFactory("Launchpad");
  const launchpad = await LaunchpadFactory.deploy(reputationAddress, {
    gasLimit: 2000000, // Explicit gas limit
  });

  await launchpad.waitForDeployment();
  const launchpadAddress = await launchpad.getAddress();

  console.log("✅ Launchpad deployed at:", launchpadAddress);
  console.log("🔗 Connected to Reputation at:", reputationAddress);

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFY ADMIN ROLES
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🔍 Verifying admin roles...");

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

  const hasDefaultAdmin = await reputation.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasAdminRole = await reputation.hasRole(ADMIN_ROLE, deployer.address);

  console.log("✅ Deployer has DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
  console.log("✅ Deployer has ADMIN_ROLE:", hasAdminRole);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE DEPLOYMENT INFO
  // ═══════════════════════════════════════════════════════════════════════════

  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: "base-sepolia",
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    features: {
      multiAdmin: true,
      descriptionSupport: true,
      imageUrlSupport: true
    },
    contracts: {
      Reputation: {
        address: reputationAddress,
        abi: JSON.parse(ReputationFactory.interface.formatJson()),
        admins: [deployer.address], // You can add more via add-admin.ts
      },
      Launchpad: {
        address: launchpadAddress,
        abi: JSON.parse(LaunchpadFactory.interface.formatJson()),
      },
    },
  };

  const outputPath = path.join(deploymentsDir, "base-sepolia-multi-admin.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:", outputPath);

  // ═══════════════════════════════════════════════════════════════════════════
  // NEXT STEPS
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 NEXT STEPS:");
  console.log("\n1️⃣  Update your frontend .env file:");
  console.log(`   NEXT_PUBLIC_REPUTATION_ADDRESS=${reputationAddress}`);
  console.log(`   NEXT_PUBLIC_LAUNCHPAD_ADDRESS=${launchpadAddress}`);

  console.log("\n2️⃣  Update contract ABIs in your frontend:");
  console.log(`   Copy from: ${outputPath}`);
  console.log(`   To: app/src/lib/contracts.ts`);

  console.log("\n3️⃣  (Optional) Add a second admin:");
  console.log("   Edit scripts/add-admin.ts with the second admin address");
  console.log("   Run: npx hardhat run scripts/add-admin.ts --network baseSepolia");

  console.log("\n4️⃣  Test creating a project on your frontend");
  console.log("   The transaction should now succeed with all 5 parameters!");

  console.log("\n📚 See DEPLOYMENT_MULTI_ADMIN.md for detailed instructions");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
