const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserProfile", function () {
  let userProfile;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const UserProfile = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfile.deploy();
    await userProfile.waitForDeployment();
  });

  describe("Profile Management", function () {
    it("Should set user profile", async function () {
      await userProfile.connect(user1).setProfile(
        "Alice Developer",
        "Full-stack developer passionate about Web3",
        "ipfs://QmHash123"
      );

      const profile = await userProfile.getProfile(user1.address);
      expect(profile.name).to.equal("Alice Developer");
      expect(profile.description).to.equal("Full-stack developer passionate about Web3");
      expect(profile.avatarUrl).to.equal("ipfs://QmHash123");
      expect(profile.exists).to.be.true;
    });

    it("Should update existing profile", async function () {
      await userProfile.connect(user1).setProfile(
        "Alice",
        "Dev",
        "ipfs://old"
      );

      await userProfile.connect(user1).setProfile(
        "Alice Updated",
        "Senior Dev",
        "ipfs://new"
      );

      const profile = await userProfile.getProfile(user1.address);
      expect(profile.name).to.equal("Alice Updated");
      expect(profile.description).to.equal("Senior Dev");
    });

    it("Should emit ProfileUpdated event", async function () {
      await expect(
        userProfile.connect(user1).setProfile(
          "Bob",
          "Designer",
          "ipfs://avatar"
        )
      )
        .to.emit(userProfile, "ProfileUpdated")
        .withArgs(user1.address, "Bob", "Designer", "ipfs://avatar");
    });

    it("Should return empty profile for non-existent user", async function () {
      const profile = await userProfile.getProfile(user2.address);
      expect(profile.name).to.equal("");
      expect(profile.exists).to.be.false;
    });

    it("Should check if user has profile", async function () {
      expect(await userProfile.hasProfile(user1.address)).to.be.false;

      await userProfile.connect(user1).setProfile(
        "Charlie",
        "Tester",
        ""
      );

      expect(await userProfile.hasProfile(user1.address)).to.be.true;
    });
  });

  describe("Validation", function () {
    it("Should reject name longer than 50 chars", async function () {
      const longName = "A".repeat(51);
      await expect(
        userProfile.connect(user1).setProfile(
          longName,
          "Description",
          "ipfs://avatar"
        )
      ).to.be.revertedWith("Name too long");
    });

    it("Should reject description longer than 500 chars", async function () {
      const longDesc = "A".repeat(501);
      await expect(
        userProfile.connect(user1).setProfile(
          "Name",
          longDesc,
          "ipfs://avatar"
        )
      ).to.be.revertedWith("Description too long");
    });

    it("Should reject avatar URL longer than 200 chars", async function () {
      const longUrl = "https://" + "a".repeat(200);
      await expect(
        userProfile.connect(user1).setProfile(
          "Name",
          "Description",
          longUrl
        )
      ).to.be.revertedWith("Avatar URL too long");
    });

    it("Should accept empty avatar URL", async function () {
      await userProfile.connect(user1).setProfile(
        "Name",
        "Description",
        ""
      );

      const profile = await userProfile.getProfile(user1.address);
      expect(profile.avatarUrl).to.equal("");
      expect(profile.exists).to.be.true;
    });
  });

  describe("Multiple Users", function () {
    it("Should handle multiple user profiles independently", async function () {
      await userProfile.connect(user1).setProfile(
        "User One",
        "First user",
        "ipfs://1"
      );

      await userProfile.connect(user2).setProfile(
        "User Two",
        "Second user",
        "ipfs://2"
      );

      const profile1 = await userProfile.getProfile(user1.address);
      const profile2 = await userProfile.getProfile(user2.address);

      expect(profile1.name).to.equal("User One");
      expect(profile2.name).to.equal("User Two");
      expect(profile1.avatarUrl).to.not.equal(profile2.avatarUrl);
    });
  });
});
