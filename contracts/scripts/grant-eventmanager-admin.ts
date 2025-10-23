import { ethers } from "hardhat";

/**
 * Grant ADMIN_ROLE to EventManager contract in Reputation contract
 * This allows EventManager to award reputation points when medals are claimed
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Granting admin role with account:", deployer.address);

  // Contract addresses from deployment
  const REPUTATION_ADDRESS = "0x4bFEd65431969Ef98D6A2e294bB5b5da149D1C6F";
  const EVENT_MANAGER_ADDRESS = "0x8bC5f21Db609fd976a68CF2A266dA2891C535cF6";

  // Get Reputation contract
  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = Reputation.attach(REPUTATION_ADDRESS);

  // Get ADMIN_ROLE hash
  const ADMIN_ROLE = await reputation.ADMIN_ROLE();
  console.log("ADMIN_ROLE hash:", ADMIN_ROLE);

  // Check if EventManager already has admin role
  const hasRole = await reputation.hasRole(ADMIN_ROLE, EVENT_MANAGER_ADDRESS);
  console.log("EventManager has ADMIN_ROLE:", hasRole);

  if (!hasRole) {
    console.log("\n🔑 Granting ADMIN_ROLE to EventManager...");
    const tx = await reputation.grantRole(ADMIN_ROLE, EVENT_MANAGER_ADDRESS);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ ADMIN_ROLE granted to EventManager");
  } else {
    console.log("✅ EventManager already has ADMIN_ROLE");
  }

  // Verify
  const hasRoleAfter = await reputation.hasRole(ADMIN_ROLE, EVENT_MANAGER_ADDRESS);
  console.log("\nFinal verification - EventManager has ADMIN_ROLE:", hasRoleAfter);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
