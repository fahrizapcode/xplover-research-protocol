import { ethers } from "ethers";
import { getSigner, isBlockchainEnabled } from "./provider";
import { config } from "../utils/config";
import prisma from "../utils/prisma";

// Minimal ABI for XCRToken
const XCR_ABI = [
  "function mintReward(address contributor, uint256 amount, string calldata contributionType, string calldata referenceId) external",
  "function balanceOf(address account) external view returns (uint256)",
];

// Minimal ABI for ContributionAttestation
const ATTESTATION_ABI = [
  "function recordContribution(address contributor, string calldata contributionType, string calldata contributionId) external returns (uint256)",
  "function hasAttestation(string calldata contributionType, string calldata contributionId) external view returns (bool attested, uint256 attestationId)",
];

function getXCRContract() {
  const signer = getSigner();
  return new ethers.Contract(config.blockchain.xcrContractAddress, XCR_ABI, signer);
}

function getAttestationContract() {
  const signer = getSigner();
  return new ethers.Contract(config.blockchain.contributionContractAddress, ATTESTATION_ABI, signer);
}

/**
 * Records a contribution attestation on-chain and mints XCR tokens.
 * This function is designed to be called asynchronously — failures do NOT
 * roll back the off-chain (PostgreSQL) state.
 *
 * @param attestationId - The ID of the blockchain_attestation record in PostgreSQL
 * @param contributorAddress - The wallet address of the contributor (may be empty)
 * @param contributionType - The type of contribution (e.g., "RESEARCH_SUBMITTED")
 * @param contributionId - The UUID of the contribution record
 * @param xcrAmount - The XCR amount to mint (in whole tokens, e.g., 10 = 10 XCR)
 */
export async function recordBlockchainContribution(
  attestationId: string,
  contributorAddress: string | null,
  contributionType: string,
  contributionId: string,
  xcrAmount: number
): Promise<void> {
  if (!isBlockchainEnabled()) {
    // Update attestation as skipped (blockchain disabled)
    await prisma.blockchainAttestation.update({
      where: { id: attestationId },
      data: {
        status: "FAILED",
        errorMessage: "Blockchain integration disabled or not configured",
        updatedAt: new Date(),
      },
    });
    return;
  }

  try {
    const effectiveAddress = contributorAddress && ethers.isAddress(contributorAddress)
      ? contributorAddress
      : ethers.ZeroAddress;

    // 1. Record attestation on-chain
    const attestationContract = getAttestationContract();
    const attestTx = await attestationContract.recordContribution(
      effectiveAddress,
      contributionType,
      contributionId
    );
    await attestTx.wait(1); // Wait for 1 confirmation

    // 2. Mint XCR tokens if contributor has a wallet
    let mintTxHash: string | null = null;
    if (contributorAddress && ethers.isAddress(contributorAddress) && xcrAmount > 0) {
      const xcrContract = getXCRContract();
      const amount = ethers.parseEther(xcrAmount.toString());
      const mintTx = await xcrContract.mintReward(
        contributorAddress,
        amount,
        contributionType,
        contributionId
      );
      await mintTx.wait(1);
      mintTxHash = mintTx.hash;
    }

    // 3. Update attestation record with success
    await prisma.blockchainAttestation.update({
      where: { id: attestationId },
      data: {
        status: "CONFIRMED",
        transactionHash: mintTxHash || attestTx.hash,
        contractAddress: config.blockchain.contributionContractAddress,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown blockchain error";
    console.error(`[Blockchain] Failed to record contribution ${contributionId}:`, errorMessage);

    // Update attestation as failed — DO NOT throw, preserve Web2 state
    await prisma.blockchainAttestation.update({
      where: { id: attestationId },
      data: {
        status: "FAILED",
        errorMessage: errorMessage.substring(0, 500), // Limit length
        updatedAt: new Date(),
      },
    });
  }
}

/**
 * Creates a pending blockchain attestation record and triggers async recording.
 * Returns immediately — blockchain operation happens in background.
 */
export async function scheduleBlockchainAttestation(
  entityType: string,
  entityId: string,
  contributorId: string,
  contributorAddress: string | null,
  contributionType: string,
  xcrAmount: number
): Promise<void> {
  try {
    // Create pending attestation record
    const attestation = await prisma.blockchainAttestation.create({
      data: {
        entityType,
        entityId,
        contributorId,
        contributionType,
        blockchainNetwork: "arbitrumSepolia",
        contractAddress: config.blockchain.contributionContractAddress || null,
        status: "PENDING",
      },
    });

    // Fire-and-forget — blockchain operation is non-blocking
    recordBlockchainContribution(
      attestation.id,
      contributorAddress,
      contributionType,
      entityId,
      xcrAmount
    ).catch((err) => {
      console.error("[Blockchain] Unhandled error in async recording:", err);
    });
  } catch (error) {
    // If even creating the attestation record fails, log but don't throw
    console.error("[Blockchain] Failed to create attestation record:", error);
  }
}
