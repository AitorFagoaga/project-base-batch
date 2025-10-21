import { ethers } from "hardhat";

/**
 * Transfer ownership script (if you have access to current owner's key)
 * Alternative to redeployment
 */
async function main() {
  const [signer] = await ethers.getSigners();

  console.log("🔐 Transfer Ownership Script");
  console.log("Current signer:", signer.address);

  const REPUTATION_ADDRESS = "0x66f8E781f0b714717c7B53dEa1acF7247b4B913b";
  const NEW_OWNER = "0x31a42406422E72dC790cF42eD978458B0b00bd06"; // Your wallet

  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = Reputation.attach(REPUTATION_ADDRESS);

  // Check current owner
  const currentOwner = await reputation.owner();
  console.log("📜 Current owner:", currentOwner);

  if (currentOwner.toLowerCase() === signer.address.toLowerCase()) {
    console.log("\n✅ You are the current owner! Transferring to:", NEW_OWNER);

    const tx = await reputation.transferOwnership(NEW_OWNER);
    await tx.wait();

    console.log("✅ Ownership transferred!");
    console.log("🔍 Transaction:", tx.hash);

    const newOwner = await reputation.owner();
    console.log("👤 New owner:", newOwner);
  } else {
    console.log("\n❌ You are not the current owner!");
    console.log("⚠️ You need to either:");
    console.log("   1. Use the current owner's private key in .env");
    console.log("   2. Redeploy the contract with your address as owner");
    console.log("\n📖 See DEPLOYMENT_GUIDE.md for instructions");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
