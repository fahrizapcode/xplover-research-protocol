import prisma from "../utils/prisma";
import { isBlockchainEnabled } from "../blockchain/provider";
import { config } from "../utils/config";

async function main() {
  const attestations = await prisma.blockchainAttestation.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  console.log("\n=== Blockchain Status ===");
  console.log("Enabled:", isBlockchainEnabled());
  console.log("RPC URL:", config.blockchain.rpcUrl || "(not set)");
  console.log("XCR Contract:", config.blockchain.xcrContractAddress || "(not set)");
  console.log("Attestation Contract:", config.blockchain.contributionContractAddress || "(not set)");
  console.log("Private Key set:", !!config.blockchain.privateKey);

  console.log("\n=== Recent Attestation Records ===");
  if (attestations.length === 0) {
    console.log("No attestation records found.");
  } else {
    for (const a of attestations) {
      console.log(`\n[${a.status}] ${a.contributionType}`);
      console.log("  Entity:", a.entityType, a.entityId);
      console.log("  Created:", a.createdAt.toISOString());
      console.log("  TxHash:", a.transactionHash || "(none)");
      console.log("  Error:", a.errorMessage || "(none)");
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
