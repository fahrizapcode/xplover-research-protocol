import { expect } from "chai";
import { ethers } from "hardhat";
import { XCRToken } from "../typechain-types";

describe("XCRToken", function () {
  let xcrToken: XCRToken;
  let owner: any;
  let contributor: any;
  let other: any;

  beforeEach(async function () {
    [owner, contributor, other] = await ethers.getSigners();
    const XCRToken = await ethers.getContractFactory("XCRToken");
    xcrToken = await XCRToken.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("should have correct name and symbol", async function () {
      expect(await xcrToken.name()).to.equal("Xplover Community Research");
      expect(await xcrToken.symbol()).to.equal("XCR");
    });

    it("should set the owner correctly", async function () {
      expect(await xcrToken.owner()).to.equal(owner.address);
    });

    it("should start with zero total supply", async function () {
      expect(await xcrToken.totalSupply()).to.equal(0n);
    });
  });

  describe("mintReward", function () {
    const MINT_AMOUNT = ethers.parseEther("10"); // 10 XCR

    it("should mint tokens to contributor", async function () {
      await xcrToken.mintReward(
        contributor.address,
        MINT_AMOUNT,
        "RESEARCH_SUBMITTED",
        "research-uuid-123"
      );
      expect(await xcrToken.balanceOf(contributor.address)).to.equal(MINT_AMOUNT);
    });

    it("should emit ContributionRewarded event", async function () {
      await expect(
        xcrToken.mintReward(contributor.address, MINT_AMOUNT, "RESEARCH_SUBMITTED", "research-uuid-123")
      )
        .to.emit(xcrToken, "ContributionRewarded")
        .withArgs(contributor.address, MINT_AMOUNT, "RESEARCH_SUBMITTED", "research-uuid-123");
    });

    it("should revert when called by non-owner", async function () {
      await expect(
        xcrToken.connect(other).mintReward(contributor.address, MINT_AMOUNT, "RESEARCH_SUBMITTED", "uuid")
      ).to.be.revertedWithCustomError(xcrToken, "OwnableUnauthorizedAccount");
    });

    it("should revert for zero address contributor", async function () {
      await expect(
        xcrToken.mintReward(ethers.ZeroAddress, MINT_AMOUNT, "RESEARCH_SUBMITTED", "uuid")
      ).to.be.revertedWith("XCR: invalid contributor address");
    });

    it("should revert for amount below minimum", async function () {
      await expect(
        xcrToken.mintReward(contributor.address, 0n, "RESEARCH_SUBMITTED", "uuid")
      ).to.be.revertedWith("XCR: amount below minimum");
    });

    it("should revert for amount above maximum", async function () {
      const tooMuch = ethers.parseEther("1001");
      await expect(
        xcrToken.mintReward(contributor.address, tooMuch, "RESEARCH_SUBMITTED", "uuid")
      ).to.be.revertedWith("XCR: amount exceeds maximum");
    });

    it("should support different contribution types", async function () {
      const types = [
        "RESEARCH_SUBMITTED",
        "PEER_REVIEW_COMPLETED",
        "CONTENT_APPROVED",
        "RESEARCH_REFERENCED",
      ];
      for (const type of types) {
        await xcrToken.mintReward(contributor.address, MINT_AMOUNT, type, `uuid-${type}`);
      }
      expect(await xcrToken.balanceOf(contributor.address)).to.equal(MINT_AMOUNT * BigInt(types.length));
    });
  });

  describe("batchMintReward", function () {
    it("should mint to multiple contributors", async function () {
      const [, c1, c2, c3] = await ethers.getSigners();
      const amount = ethers.parseEther("5");

      await xcrToken.batchMintReward(
        [c1.address, c2.address, c3.address],
        [amount, amount, amount],
        ["PEER_REVIEW_COMPLETED", "PEER_REVIEW_COMPLETED", "PEER_REVIEW_COMPLETED"],
        ["uuid-1", "uuid-2", "uuid-3"]
      );

      expect(await xcrToken.balanceOf(c1.address)).to.equal(amount);
      expect(await xcrToken.balanceOf(c2.address)).to.equal(amount);
      expect(await xcrToken.balanceOf(c3.address)).to.equal(amount);
    });

    it("should revert for array length mismatch", async function () {
      await expect(
        xcrToken.batchMintReward(
          [contributor.address],
          [ethers.parseEther("5"), ethers.parseEther("5")],
          ["TYPE"],
          ["uuid"]
        )
      ).to.be.revertedWith("XCR: array length mismatch");
    });
  });
});
