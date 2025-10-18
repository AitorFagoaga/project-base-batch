import fs from "fs";
import path from "path";

/**
 * Export contract ABIs to the frontend package
 * Run this after compiling contracts: npx hardhat run scripts/export-abis.ts
 */
async function main() {
  const artifactsPath = path.join(__dirname, "../artifacts/contracts");
  const outputPath = path.join(__dirname, "../../next.js/lib/contracts");

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Export Reputation contract
  const reputationArtifact = JSON.parse(
    fs.readFileSync(
      path.join(artifactsPath, "Reputation.sol/Reputation.json"),
      "utf8"
    )
  );

  fs.writeFileSync(
    path.join(outputPath, "Reputation.json"),
    JSON.stringify(
      {
        abi: reputationArtifact.abi,
        contractName: "Reputation",
      },
      null,
      2
    )
  );

  // Export Launchpad contract
  const launchpadArtifact = JSON.parse(
    fs.readFileSync(
      path.join(artifactsPath, "Launchpad.sol/Launchpad.json"),
      "utf8"
    )
  );

  fs.writeFileSync(
    path.join(outputPath, "Launchpad.json"),
    JSON.stringify(
      {
        abi: launchpadArtifact.abi,
        contractName: "Launchpad",
      },
      null,
      2
    )
  );

  console.log("✅ Contract ABIs exported to frontend package");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
