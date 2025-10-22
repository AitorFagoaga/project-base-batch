import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy script for Reputation and Launchpad contracts (v2.0 with NFT support)
 * Includes robust gas management, retry logic, and timing delays
 * Writes deployment info to /deployments/base-sepolia.json
 */

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current gas price with a buffer percentage
 * @param provider Ethers provider
 * @param bufferPercent Percentage to add to base gas price (default 30%)
 * @returns Gas price with buffer applied
 */
async function getGasPrice(provider: any, bufferPercent: number = 30): Promise<bigint> {
  const feeData = await provider.getFeeData();
  const baseGasPrice = feeData.gasPrice || ethers.parseUnits("1", "gwei");
  const bufferedPrice = (baseGasPrice * BigInt(100 + bufferPercent)) / 100n;
  return bufferedPrice;
}

/**
 * Wait for network stability between deployments
 * @param seconds Number of seconds to wait
 */
async function waitForStability(seconds: number = 5): Promise<void> {
  console.log(`⏳ Waiting ${seconds} seconds for network stability...`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * Deploy a contract with retry logic and exponential gas increase
 * @param factory Contract factory
 * @param args Constructor arguments
 * @param gasLimit Gas limit for deployment
 * @param provider Ethers provider
 * @param contractName Name of contract (for logging)
 * @param maxRetries Maximum number of retry attempts
 * @returns Deployed contract
 */
async function deployWithRetry(
  factory: any,
  args: any[],
  gasLimit: number,
  provider: any,
  contractName: string,
  maxRetries: number = 3
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get fresh gas price with increasing buffer on retries
      const bufferPercent = 30 + (attempt - 1) * 10;
      const gasPrice = await getGasPrice(provider, bufferPercent);

      console.log(`⛽ Attempt ${attempt}/${maxRetries}: Gas price = ${ethers.formatUnits(gasPrice, "gwei")} gwei (${bufferPercent}% buffer)`);

      // Deploy with explicit gas parameters
      const contract = await factory.deploy(...args, {
        gasPrice,
        gasLimit
      });

      console.log(`📝 Transaction sent, waiting for confirmation...`);
      return contract;

    } catch (error: any) {
      const errorMsg = error.message || String(error);

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        console.error(`❌ ${contractName} deployment failed after ${maxRetries} attempts`);
        throw error;
      }

      // Check if it's an "underpriced" error that we can retry
      if (errorMsg.includes("underpriced") || errorMsg.includes("replacement")) {
        console.log(`⚠️  Attempt ${attempt} failed: Transaction underpriced`);
        console.log(`🔄 Retrying with higher gas price...`);
        await waitForStability(3);
      } else {
        // For other errors, throw immediately
        console.error(`❌ ${contractName} deployment failed with unexpected error:`);
        throw error;
      }
    }
  }

  throw new Error(`${contractName} deployment failed after ${maxRetries} attempts`);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DEPLOYMENT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n🚀 Deploying contracts with account:", deployer.address);
  console.log("📊 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Check gas price
  const currentGasPrice = await getGasPrice(ethers.provider, 0);
  console.log("⛽ Current network gas price:", ethers.formatUnits(currentGasPrice, "gwei"), "gwei");

  // ═══════════════════════════════════════════════════════════════════════════
  // REPUTATION CONTRACT
  // ═══════════════════════════════════════════════════════════════════════════

  const COOLDOWN = 86400; // 1 day
  const BASELINE_POWER = 1;
  const MIN_REP_TO_BOOST = 0;

  console.log("\n📜 Deploying Reputation contract (with Genesis categories)...");
  const ReputationFactory = await ethers.getContractFactory("Reputation");

  const reputation = await deployWithRetry(
    ReputationFactory,
    [COOLDOWN, BASELINE_POWER, MIN_REP_TO_BOOST, deployer.address],
    3000000, // 3M gas limit
    ethers.provider,
    "Reputation"
  );

  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("✅ Reputation deployed at:", reputationAddress);
  console.log("👤 Contract owner:", deployer.address);

  // Wait before next deployment
  await waitForStability(5);

  // ═══════════════════════════════════════════════════════════════════════════
  // USER PROFILE CONTRACT
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n👤 Deploying UserProfile contract...");
  const UserProfileFactory = await ethers.getContractFactory("UserProfile");

  const userProfile = await deployWithRetry(
    UserProfileFactory,
    [], // No constructor args
    1000000, // 1M gas limit
    ethers.provider,
    "UserProfile"
  );

  await userProfile.waitForDeployment();
  const userProfileAddress = await userProfile.getAddress();
  console.log("✅ UserProfile deployed at:", userProfileAddress);

  // Wait before next deployment
  await waitForStability(5);

  // ═══════════════════════════════════════════════════════════════════════════
  // LAUNCHPAD CONTRACT (with NFT support)
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🚀 Deploying Launchpad contract (includes ProjectNFT bytecode)...");
  const LaunchpadFactory = await ethers.getContractFactory("Launchpad");

  // Estimate gas for informational purposes
  try {
    const deploymentTx = LaunchpadFactory.getDeployTransaction(reputationAddress);
    const estimatedGas = await ethers.provider.estimateGas(deploymentTx);
    console.log("📊 Estimated gas needed:", estimatedGas.toString());
    console.log("📦 Using gas limit: 8,000,000 (includes ProjectNFT bytecode)");
  } catch (e) {
    console.log("⚠️  Could not estimate gas, proceeding with 8M limit");
  }

  const launchpad = await deployWithRetry(
    LaunchpadFactory,
    [reputationAddress],
    8000000, // 8M gas limit (increased for NFT feature)
    ethers.provider,
    "Launchpad"
  );

  await launchpad.waitForDeployment();
  const launchpadAddress = await launchpad.getAddress();
  console.log("✅ Launchpad deployed at:", launchpadAddress);

  // Wait before next deployment
  await waitForStability(5);

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT MANAGER CONTRACT
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🗓️  Deploying EventManager contract...");
  const EventManagerFactory = await ethers.getContractFactory("EventManager");

  const eventManager = await deployWithRetry(
    EventManagerFactory,
    [deployer.address],
    3000000, // 3M gas limit (increased for complex contract)
    ethers.provider,
    "EventManager"
  );

  await eventManager.waitForDeployment();
  const eventManagerAddress = await eventManager.getAddress();
  console.log("✅ EventManager deployed at:", eventManagerAddress);

  // Wait before post-deployment configuration
  await waitForStability(3);

  // ═══════════════════════════════════════════════════════════════════════════
  // POST-DEPLOYMENT CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════

  // Grant ADMIN_ROLE to additional admins
  console.log("\n👥 Granting ADMIN_ROLE to additional admins...");
  const additionalAdmins = [
    "0xaa860E97f1a50ca6Ce786AEf9B835052dfD0ee25",
    "0x31a42406422E72dC790cF42eD978458B0b00bd06"
  ];

  for (const admin of additionalAdmins) {
    try {
      const gasPrice = await getGasPrice(ethers.provider, 30);
      const grantAdminTx = await eventManager.grantAdmin(admin, { gasPrice });
      await grantAdminTx.wait();
      console.log(`✅ Granted ADMIN_ROLE to ${admin}`);
    } catch (e) {
      console.log(`⚠️  Could not grant ADMIN_ROLE to ${admin}:`, (e as Error).message);
    }
  }

  // Ensure Launchpad can award Reputation for investments
  console.log("\n🔗 Configuring Launchpad permissions...");
  try {
    const adminRole = await reputation.ADMIN_ROLE();
    const gasPrice = await getGasPrice(ethers.provider, 30);
    const grantTx = await reputation.grantRole(adminRole, launchpadAddress, { gasPrice });
    await grantTx.wait();
    console.log("✅ Granted ADMIN_ROLE to Launchpad for Reputation awards");
  } catch (e) {
    console.log("⚠️  Could not grant ADMIN_ROLE to Launchpad:", (e as Error).message);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE DEPLOYMENT INFO
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n💾 Saving deployment information...");

  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Get ABIs for saving
  const ReputationFactoryForAbi = await ethers.getContractFactory("Reputation");
  const LaunchpadFactoryForAbi = await ethers.getContractFactory("Launchpad");
  const UserProfileFactoryForAbi = await ethers.getContractFactory("UserProfile");
  const EventManagerFactoryForAbi = await ethers.getContractFactory("EventManager");

  const deploymentInfo = {
    network: "base-sepolia",
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    gasUsed: {
      reputation: "~2,500,000",
      userProfile: "~800,000",
      launchpad: "~5,500,000 (includes NFT bytecode)",
      eventManager: "~1,200,000"
    },
    contracts: {
      Reputation: {
        address: reputationAddress,
        abi: JSON.parse(ReputationFactoryForAbi.interface.formatJson()),
      },
      Launchpad: {
        address: launchpadAddress,
        abi: JSON.parse(LaunchpadFactoryForAbi.interface.formatJson()),
      },
      UserProfile: {
        address: userProfileAddress,
        abi: JSON.parse(UserProfileFactoryForAbi.interface.formatJson()),
      },
      EventManager: {
        address: eventManagerAddress,
        abi: JSON.parse(EventManagerFactoryForAbi.interface.formatJson()),
      },
    },
  };

  const outputPath = path.join(deploymentsDir, "base-sepolia.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("✅ Deployment info saved to:", outputPath);

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Reputation:    ", reputationAddress);
  console.log("UserProfile:   ", userProfileAddress);
  console.log("Launchpad:     ", launchpadAddress);
  console.log("EventManager:  ", eventManagerAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n📝 Next Steps:");
  console.log("1. Update frontend /app/src/lib/contracts.ts with new addresses");
  console.log("2. Configure Pinata API keys in /app/.env.local:");
  console.log("   NEXT_PUBLIC_PINATA_JWT=your_jwt_here");
  console.log("3. Test creating a project with NFT configuration");
  console.log("4. Test investing and verify NFT minting");

  console.log("\n🔍 Verify contracts on BaseScan:");
  console.log(`https://sepolia.basescan.org/address/${launchpadAddress}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTE
// ═══════════════════════════════════════════════════════════════════════════

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
