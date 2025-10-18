import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Seeds genesis reputation from a JSON file
 * Reads from ./genesis.json and awards reputation batch
 */
async function main() {
  // Load deployment info
  const deploymentsPath = path.join(__dirname, "../../deployments/base-sepolia.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("❌ Deployment file not found. Run deploy script first.");
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  const reputationAddress = deploymentInfo.contracts.Reputation.address;

  console.log("🌱 Seeding genesis reputation...");
  console.log("📍 Reputation contract:", reputationAddress);

  // Load genesis data
  const genesisPath = path.join(__dirname, "genesis.json");
  if (!fs.existsSync(genesisPath)) {
    console.log("⚠️  No genesis.json found. Creating example file...");
    
    const exampleGenesis = [
      {
        address: "0x0000000000000000000000000000000000000001",
        amount: 100,
        reason: "Hackathon winner",
      },
      {
        address: "0x0000000000000000000000000000000000000002",
        amount: 50,
        reason: "OSS contributor",
      },
    ];
    
    fs.writeFileSync(genesisPath, JSON.stringify(exampleGenesis, null, 2));
    console.log("📝 Example genesis.json created. Update with real addresses and re-run.");
    return;
  }

  const genesisData = JSON.parse(fs.readFileSync(genesisPath, "utf-8"));

  if (!Array.isArray(genesisData) || genesisData.length === 0) {
    console.log("⚠️  Genesis data is empty or invalid.");
    return;
  }

  // Connect to contract
  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = Reputation.attach(reputationAddress);

  // Prepare batch data
  const addresses = genesisData.map((entry: any) => entry.address);
  const amounts = genesisData.map((entry: any) => entry.amount);
  const reasons = genesisData.map((entry: any) => entry.reason);

  console.log(`\n📦 Awarding genesis reputation to ${addresses.length} addresses...`);

  // Execute batch award
  const tx = await reputation.awardGenesisBatch(addresses, amounts, reasons);
  console.log("⏳ Transaction submitted:", tx.hash);

  await tx.wait();
  console.log("✅ Genesis reputation awarded!");

  // Verify
  console.log("\n🔍 Verifying reputation scores:");
  for (let i = 0; i < addresses.length; i++) {
    const rep = await reputation.reputationOf(addresses[i]);
    console.log(`  ${addresses[i]}: ${rep} (${reasons[i]})`);
  }

  console.log("\n🎉 Seed complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
