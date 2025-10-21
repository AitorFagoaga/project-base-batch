import { ethers } from "hardhat";

/**
 * Script to grant ADMIN_ROLE to additional admins in EventManager
 * This can be run on an already deployed EventManager contract
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("👥 Granting admin roles with account:", deployer.address);
  
  // EventManager address from deployment
  const eventManagerAddress = "0x0DE94299D493A52726d44B636d73f2F3aEdAA3F8"; // Update from latest deployment
  
  const EventManager = await ethers.getContractFactory("EventManager");
  const eventManager = EventManager.attach(eventManagerAddress);

  // Additional admins to grant ADMIN_ROLE
  const additionalAdmins = [
    "0xaa860E97f1a50ca6Ce786AEf9B835052dfD0ee25",
    "0x31a42406422E72dC790cF42eD978458B0b00bd06"
  ];

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
