import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import { ContributionAttestation } from "../typechain-types";

describe("ContributionAttestation", function () {
  let attestation: ContributionAttestation;
  let owner: any;
  let contributor: any;
  let other: any;

  beforeEach(async function () {
    [owner, contributor, other] = await ethers.getSigners();
    const CA = await ethers.getContractFactory("ContributionAttestation");
    attestation = await CA.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("should set the owner correctly", async function () {
      expect(await attestation.owner()).to.equal(owner.address);
    });

    it("should start with zero attestation count", async function () {
      expect(await attestation.attestationCount()).to.equal(0n);
    });
  });

  describe("recordContribution", function () {
    it("should record a contribution and emit event", async function () {
      await expect(
        attestation.recordContribution(contributor.address, "RESEARCH_SUBMITTED", "research-uuid-1")
      )
        .to.emit(attestation, "ContributionRecorded")
        .withArgs(contributor.address, "RESEARCH_SUBMITTED", "research-uuid-1", anyValue, 1n);
    });

    it("should increment attestation count", async function () {
      await attestation.recordContribution(contributor.address, "RESEARCH_SUBMITTED", "uuid-1");
      await attestation.recordContribution(contributor.address, "PEER_REVIEW_COMPLETED", "uuid-2");
      expect(await attestation.attestationCount()).to.equal(2n);
    });

    it("should revert for duplicate contribution", async function () {
      await attestation.recordContribution(contributor.address, "RESEARCH_SUBMITTED", "uuid-1");
      await expect(
        attestation.recordContribution(contributor.address, "RESEARCH_SUBMITTED", "uuid-1")
      ).to.be.revertedWith("CA: contribution already attested");
    });

    it("should revert when called by non-owner", async function () {
      await expect(
        attestation
          .connect(other)
          .recordContribution(contributor.address, "RESEARCH_SUBMITTED", "uuid-1")
      ).to.be.revertedWithCustomError(attestation, "OwnableUnauthorizedAccount");
    });

    it("should revert for empty contribution type", async function () {
      await expect(
        attestation.recordContribution(contributor.address, "", "uuid-1")
      ).to.be.revertedWith("CA: empty contribution type");
    });

    it("should revert for empty contribution ID", async function () {
      await expect(
        attestation.recordContribution(contributor.address, "RESEARCH_SUBMITTED", "")
      ).to.be.revertedWith("CA: empty contribution ID");
    });

    it("should allow zero address as contributor (no wallet connected)", async function () {
      await expect(
        attestation.recordContribution(ethers.ZeroAddress, "RESEARCH_SUBMITTED", "uuid-1")
      ).to.not.be.reverted;
    });
  });

  describe("hasAttestation", function () {
    it("should return false for non-existent contribution", async function () {
      const [attested] = await attestation.hasAttestation("RESEARCH_SUBMITTED", "uuid-nonexistent");
      expect(attested).to.be.false;
    });

    it("should return true for existing contribution", async function () {
      await attestation.recordContribution(contributor.address, "RESEARCH_SUBMITTED", "uuid-1");
      const [attested, id] = await attestation.hasAttestation("RESEARCH_SUBMITTED", "uuid-1");
      expect(attested).to.be.true;
      expect(id).to.equal(1n);
    });
  });

  describe("getAttestation", function () {
    it("should return correct attestation data", async function () {
      await attestation.recordContribution(contributor.address, "CONTENT_APPROVED", "content-uuid-1");
      const [addr, type, id] = await attestation.getAttestation(1n);
      expect(addr).to.equal(contributor.address);
      expect(type).to.equal("CONTENT_APPROVED");
      expect(id).to.equal("content-uuid-1");
    });

    it("should revert for non-existent attestation", async function () {
      await expect(attestation.getAttestation(999n)).to.be.revertedWith("CA: attestation not found");
    });
  });

  describe("batchRecordContributions", function () {
    it("should batch record multiple contributions", async function () {
      const [, c1, c2] = await ethers.getSigners();
      await attestation.batchRecordContributions(
        [c1.address, c2.address],
        ["RESEARCH_SUBMITTED", "PEER_REVIEW_COMPLETED"],
        ["uuid-1", "uuid-2"]
      );
      expect(await attestation.attestationCount()).to.equal(2n);
    });

    it("should skip already attested contributions in batch", async function () {
      await attestation.recordContribution(contributor.address, "RESEARCH_SUBMITTED", "uuid-1");
      // Batch including already attested uuid-1 should skip it, not revert
      await expect(
        attestation.batchRecordContributions(
          [contributor.address, contributor.address],
          ["RESEARCH_SUBMITTED", "PEER_REVIEW_COMPLETED"],
          ["uuid-1", "uuid-2"]
        )
      ).to.not.be.reverted;
      expect(await attestation.attestationCount()).to.equal(2n); // original + uuid-2
    });
  });
});
