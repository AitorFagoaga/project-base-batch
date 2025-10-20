import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy script for Reputation and Launchpad contracts
 * Writes deployment info to /deployments/base-sepolia.json
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contracts with account:", deployer.address);
  console.log("📊 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // ═══════════════════════════════════════════════════════════════════════════
  // REPUTATION CONTRACT
  // ═══════════════════════════════════════════════════════════════════════════

  const COOLDOWN = 86400; // 1 day
  const BASELINE_POWER = 1;
  const MIN_REP_TO_BOOST = 0;

  // Deploy fresh Reputation contract with enhanced Genesis features
  console.log("\n📜 Deploying NEW Reputation contract (with Genesis categories)...");
  const ReputationFactory = await ethers.getContractFactory("Reputation");
  const reputation = await ReputationFactory.deploy(
    COOLDOWN,
    BASELINE_POWER,
    MIN_REP_TO_BOOST,
    deployer.address // Your wallet will be the owner
  );

  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("✅ Reputation deployed at:", reputationAddress);
  console.log("👤 Contract owner:", deployer.address);

  // ═══════════════════════════════════════════════════════════════════════════
  // LAUNCHPAD CONTRACT
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🚀 Deploying Launchpad contract...");
  console.log("⏳ Waiting for better gas conditions...");
  
  // Wait a bit to avoid nonce issues
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const LaunchpadFactoryForDeploy = await ethers.getContractFactory("Launchpad");
  
  // Deploy with higher gas price multiplier
  const launchpad = await LaunchpadFactoryForDeploy.deploy(reputationAddress, {
    gasLimit: 2000000, // Explicit gas limit
  });

  await launchpad.waitForDeployment();
  const launchpadAddress = await launchpad.getAddress();
  console.log("✅ Launchpad deployed at:", launchpadAddress);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE DEPLOYMENT INFO
  // ═══════════════════════════════════════════════════════════════════════════

  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Get ABIs for saving
  const ReputationFactoryForAbi = await ethers.getContractFactory("Reputation");
  const LaunchpadFactoryForAbi = await ethers.getContractFactory("Launchpad");

  const deploymentInfo = {
    network: "base-sepolia",
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      Reputation: {
        address: reputationAddress,
        abi: JSON.parse(ReputationFactoryForAbi.interface.formatJson()),
      },
      Launchpad: {
        address: launchpadAddress,
        abi: JSON.parse(LaunchpadFactoryForAbi.interface.formatJson()),
      },
    },
  };

  const outputPath = path.join(deploymentsDir, "base-sepolia.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:", outputPath);
  console.log("\n🎉 Deployment complete!");
  console.log("\n📝 Add these to your .env:");
  console.log(`NEXT_PUBLIC_REPUTATION_ADDRESS=${reputationAddress}`);
  console.log(`NEXT_PUBLIC_LAUNCHPAD_ADDRESS=${launchpadAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
