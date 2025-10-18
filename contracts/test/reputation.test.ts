import { expect } from "chai";
import { ethers } from "hardhat";
import { Reputation } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Reputation", function () {
  let reputation: Reputation;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let charlie: SignerWithAddress;

  const COOLDOWN = 86400; // 1 day
  const BASELINE_POWER = 1;
  const MIN_REP_TO_BOOST = 0;

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    const ReputationFactory = await ethers.getContractFactory("Reputation");
    reputation = await ReputationFactory.deploy(
      COOLDOWN,
      BASELINE_POWER,
      MIN_REP_TO_BOOST,
      owner.address
    );
  });

  describe("Genesis Awards", function () {
    it("Should allow owner to award genesis reputation", async function () {
      await reputation.awardGenesis(alice.address, 100, "Hackathon winner");
      expect(await reputation.reputationOf(alice.address)).to.equal(100);
    });

    it("Should allow batch genesis awards", async function () {
      await reputation.awardGenesisBatch(
        [alice.address, bob.address],
        [100, 50],
        ["Hackathon winner", "OSS contributor"]
      );

      expect(await reputation.reputationOf(alice.address)).to.equal(100);
      expect(await reputation.reputationOf(bob.address)).to.equal(50);
    });

    it("Should revert if non-owner tries to award genesis", async function () {
      await expect(
        reputation.connect(alice).awardGenesis(bob.address, 100, "Test")
      ).to.be.revertedWithCustomError(reputation, "OwnableUnauthorizedAccount");
    });

    it("Should revert on batch arrays length mismatch", async function () {
      await expect(
        reputation.awardGenesisBatch(
          [alice.address, bob.address],
          [100],
          ["Test", "Test2"]
        )
      ).to.be.revertedWithCustomError(reputation, "ArrayLengthMismatch");
    });
  });

  describe("Boosts (P2P)", function () {
    beforeEach(async function () {
      // Give Alice initial reputation so she can boost
      await reputation.awardGenesis(alice.address, 100, "Initial");
    });

    it("Should allow boost with correct power calculation", async function () {
      // Alice (rep=100) boosts Bob
      // Power = sqrt(100) + 1 = 10 + 1 = 11
      await reputation.connect(alice).boost(bob.address);
      expect(await reputation.reputationOf(bob.address)).to.equal(11);
    });

    it("Should enforce cooldown between boosts", async function () {
      await reputation.connect(alice).boost(bob.address);

      // Try to boost again immediately
      await expect(
        reputation.connect(alice).boost(charlie.address)
      ).to.be.revertedWithCustomError(reputation, "CooldownNotExpired");
    });

    it("Should allow boost after cooldown expires", async function () {
      await reputation.connect(alice).boost(bob.address);

      // Fast-forward time
      await time.increase(COOLDOWN);

      // Should succeed now
      await reputation.connect(alice).boost(charlie.address);
      expect(await reputation.reputationOf(charlie.address)).to.equal(11);
    });

    it("Should prevent self-boost", async function () {
      await expect(
        reputation.connect(alice).boost(alice.address)
      ).to.be.revertedWithCustomError(reputation, "CannotBoostSelf");
    });

    it("Should revert if booster has insufficient reputation", async function () {
      // Update min rep required
      await reputation.setParams(COOLDOWN, BASELINE_POWER, 50);

      // Bob has 0 rep, cannot boost
      await expect(
        reputation.connect(bob).boost(charlie.address)
      ).to.be.revertedWithCustomError(reputation, "InsufficientReputation");
    });
  });

  describe("Parameter Updates", function () {
    it("Should allow owner to update parameters", async function () {
      await reputation.setParams(3600, 2, 10);

      expect(await reputation.cooldown()).to.equal(3600);
    });

    it("Should revert if non-owner tries to update parameters", async function () {
      await expect(
        reputation.connect(alice).setParams(3600, 2, 10)
      ).to.be.revertedWithCustomError(reputation, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return correct boost power", async function () {
      await reputation.awardGenesis(alice.address, 144, "Test");
      
      // sqrt(144) + 1 = 12 + 1 = 13
      expect(await reputation.boostPower(alice.address)).to.equal(13);
    });

    it("Should track last boost timestamp", async function () {
      await reputation.awardGenesis(alice.address, 100, "Test");
      await reputation.connect(alice).boost(bob.address);

      const lastBoost = await reputation.lastBoostAt(alice.address);
      expect(lastBoost).to.be.gt(0);
    });
  });
});
