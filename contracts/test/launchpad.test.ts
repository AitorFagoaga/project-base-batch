import { expect } from "chai";
import { ethers } from "hardhat";
import { Reputation, Launchpad } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Launchpad", function () {
  let reputation: Reputation;
  let launchpad: Launchpad;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let backer1: SignerWithAddress;
  let backer2: SignerWithAddress;

  const COOLDOWN = 86400;
  const BASELINE_POWER = 1;
  const MIN_REP_TO_BOOST = 0;

  beforeEach(async function () {
    [owner, creator, backer1, backer2] = await ethers.getSigners();

    // Deploy Reputation
    const ReputationFactory = await ethers.getContractFactory("Reputation");
    reputation = await ReputationFactory.deploy(
      COOLDOWN,
      BASELINE_POWER,
      MIN_REP_TO_BOOST,
      owner.address
    );

    // Deploy Launchpad
    const LaunchpadFactory = await ethers.getContractFactory("Launchpad");
    launchpad = await LaunchpadFactory.deploy(await reputation.getAddress());
  });

  describe("Project Creation", function () {
    it("Should create a project successfully", async function () {
      const tx = await launchpad
        .connect(creator)
        .createProject(
          "My Project",
          "Description",
          "https://example.com/image.jpg",
          ethers.parseEther("10"),
          30
        );

      await expect(tx).to.emit(launchpad, "ProjectCreated");

      const project = await launchpad.getProject(0);
      expect(project.creator).to.equal(creator.address);
      expect(project.title).to.equal("My Project");
      expect(project.goal).to.equal(ethers.parseEther("10"));
    });

    it("Should revert with zero goal", async function () {
      await expect(
        launchpad.connect(creator).createProject("Test", "Desc", "img.jpg", 0, 30)
      ).to.be.revertedWithCustomError(launchpad, "InvalidGoal");
    });

    it("Should revert with zero duration", async function () {
      await expect(
        launchpad.connect(creator).createProject("Test", "Desc", "img.jpg", ethers.parseEther("10"), 0)
      ).to.be.revertedWithCustomError(launchpad, "InvalidDuration");
    });

    it("Should increment project counter", async function () {
      await launchpad.connect(creator).createProject("Project 1", "Desc 1", "img1.jpg", ethers.parseEther("5"), 30);
      await launchpad.connect(creator).createProject("Project 2", "Desc 2", "img2.jpg", ethers.parseEther("8"), 30);

      expect(await launchpad.projectCount()).to.equal(2);
    });
  });

  describe("Funding", function () {
    let projectId: number;

    beforeEach(async function () {
      await launchpad.connect(creator).createProject("Test Project", "Test Description", "test.jpg", ethers.parseEther("5"), 30);
      projectId = 0;
    });

    it("Should allow funding a project", async function () {
      const fundAmount = ethers.parseEther("2");

      await expect(
        launchpad.connect(backer1).fundProject(projectId, { value: fundAmount })
      )
        .to.emit(launchpad, "ContributionMade")
        .withArgs(projectId, backer1.address, fundAmount);

      const project = await launchpad.getProject(projectId);
      expect(project.fundsRaised).to.equal(fundAmount);
    });

    it("Should track multiple contributions", async function () {
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("2") });
      await launchpad
        .connect(backer2)
        .fundProject(projectId, { value: ethers.parseEther("3") });

      const project = await launchpad.getProject(projectId);
      expect(project.fundsRaised).to.equal(ethers.parseEther("5"));
    });

    it("Should revert on zero contribution", async function () {
      await expect(
        launchpad.connect(backer1).fundProject(projectId, { value: 0 })
      ).to.be.revertedWithCustomError(launchpad, "ZeroContribution");
    });

    it("Should revert if deadline has passed", async function () {
      // Fast-forward past deadline
      await time.increase(31 * 24 * 60 * 60); // 31 days

      await expect(
        launchpad
          .connect(backer1)
          .fundProject(projectId, { value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(launchpad, "DeadlinePassed");
    });
  });

  describe("Claiming Funds", function () {
    let projectId: number;

    beforeEach(async function () {
      await launchpad.connect(creator).createProject("Test Project", "Test Description", "test.jpg", ethers.parseEther("5"), 30);
      projectId = 0;
    });

    it("Should allow creator to claim funds after successful campaign", async function () {
      // Fund the project fully
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("5") });

      // Fast-forward past deadline
      await time.increase(31 * 24 * 60 * 60);

      const creatorBalanceBefore = await ethers.provider.getBalance(
        creator.address
      );

      const tx = await launchpad.connect(creator).claimFunds(projectId);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const creatorBalanceAfter = await ethers.provider.getBalance(
        creator.address
      );

      expect(creatorBalanceAfter).to.equal(
        creatorBalanceBefore + ethers.parseEther("5") - gasUsed
      );
    });

    it("Should revert if deadline not reached", async function () {
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("5") });

      await expect(
        launchpad.connect(creator).claimFunds(projectId)
      ).to.be.revertedWithCustomError(launchpad, "DeadlineNotReached");
    });

    it("Should revert if goal not reached", async function () {
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("3") });

      await time.increase(31 * 24 * 60 * 60);

      await expect(
        launchpad.connect(creator).claimFunds(projectId)
      ).to.be.revertedWithCustomError(launchpad, "GoalNotReached");
    });

    it("Should revert if non-creator tries to claim", async function () {
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("5") });

      await time.increase(31 * 24 * 60 * 60);

      await expect(
        launchpad.connect(backer1).claimFunds(projectId)
      ).to.be.revertedWithCustomError(launchpad, "NotCreator");
    });

    it("Should prevent double claiming", async function () {
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("5") });

      await time.increase(31 * 24 * 60 * 60);

      await launchpad.connect(creator).claimFunds(projectId);

      await expect(
        launchpad.connect(creator).claimFunds(projectId)
      ).to.be.revertedWithCustomError(launchpad, "AlreadyClaimed");
    });
  });

  describe("Integration with Reputation", function () {
    it("Should reference reputation contract correctly", async function () {
      expect(await launchpad.reputation()).to.equal(
        await reputation.getAddress()
      );
    });
  });

  describe("Deleting Projects", function () {
    let projectId: number;

    beforeEach(async function () {
      await launchpad.connect(creator).createProject("Test Project", "Test Description", "test.jpg", ethers.parseEther("5"), 30);
      projectId = 0;
    });

    it("Should allow creator to delete an unfunded project", async function () {
      await expect(launchpad.connect(creator).deleteProject(projectId))
        .to.emit(launchpad, "ProjectDeleted")
        .withArgs(projectId, creator.address);

      const project = await launchpad.getProject(projectId);
      expect(project.creator).to.equal(ethers.ZeroAddress);
    });

    it("Should allow creator to delete a partially funded project (below goal)", async function () {
      // Fund partially (3 ETH out of 5 ETH goal)
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("3") });

      await expect(launchpad.connect(creator).deleteProject(projectId))
        .to.emit(launchpad, "ProjectDeleted")
        .withArgs(projectId, creator.address);

      const project = await launchpad.getProject(projectId);
      expect(project.creator).to.equal(ethers.ZeroAddress);
    });

    it("Should revert if non-creator tries to delete", async function () {
      await expect(
        launchpad.connect(backer1).deleteProject(projectId)
      ).to.be.revertedWithCustomError(launchpad, "NotCreator");
    });

    it("Should revert when trying to delete project that reached its goal", async function () {
      // Fund the project fully
      await launchpad
        .connect(backer1)
        .fundProject(projectId, { value: ethers.parseEther("5") });

      await expect(
        launchpad.connect(creator).deleteProject(projectId)
      ).to.be.revertedWithCustomError(launchpad, "ProjectAlreadyFunded");
    });

    it("Should revert when trying to delete non-existent project", async function () {
      await expect(
        launchpad.connect(creator).deleteProject(999)
      ).to.be.revertedWithCustomError(launchpad, "ProjectNotFound");
    });

    it("Should maintain project counter after deletion", async function () {
      await launchpad.connect(creator).createProject("Project 2", "Desc 2", "img2.jpg", ethers.parseEther("8"), 30);

      expect(await launchpad.projectCount()).to.equal(2);

      // Delete first project
      await launchpad.connect(creator).deleteProject(projectId);

      // Counter should remain the same
      expect(await launchpad.projectCount()).to.equal(2);
    });

    it("Should revert when trying to delete already deleted project", async function () {
      await launchpad.connect(creator).deleteProject(projectId);

      await expect(
        launchpad.connect(creator).deleteProject(projectId)
      ).to.be.revertedWithCustomError(launchpad, "ProjectNotFound");
    });
  });
});
