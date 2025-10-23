import { ethers } from "hardhat";

async function main() {
  const EVENT_MANAGER_ADDRESS = "0xb613cF18d14BcB4dA20BB4003C1dB15B66Ba445E";

  const EventManager = await ethers.getContractAt("EventManager", EVENT_MANAGER_ADDRESS);

  const eventCount = await EventManager.eventCount();
  console.log("📊 Total events:", eventCount.toString());

  const medalCount = await EventManager.medalCount();
  console.log("🏅 Total medals:", medalCount.toString());

  if (Number(eventCount) > 0) {
    for (let i = 1; i <= Number(eventCount); i++) {
      try {
        console.log(`\n📅 Event ${i}:`);

        // Use staticCall to bypass the encoding issue
        const eventData = await EventManager.getEvent.staticCall(i);
        console.log(`   Title: ${eventData.title}`);
        console.log(`   Creator: ${eventData.creator}`);
        console.log(`   Status: ${eventData.status} (0=None, 1=Pending, 2=Approved, 3=Rejected)`);

        const medalsData = await EventManager.getEventMedals.staticCall(i);
        console.log(`   Medals: ${medalsData.length}`);
        for (const medal of medalsData) {
          console.log(`     🏅 Medal ID ${medal.id.toString()}: ${medal.name}`);
          console.log(`        Active: ${medal.active}, Claims: ${medal.claimsCount.toString()}/${medal.maxClaims.toString()}, Points: ${medal.points.toString()}`);
        }
      } catch (e: any) {
        console.log(`   Error - ${e.message}`);
      }
    }
  } else {
    console.log("\n⚠️  No events found in this contract!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
