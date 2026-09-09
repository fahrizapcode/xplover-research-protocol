import { config } from "./utils/config";
import { createApp } from "./app";
import prisma from "./utils/prisma";
import { isBlockchainEnabled } from "./blockchain/provider";

const app = createApp();

const server = app.listen(config.port, () => {
  const chainOk = isBlockchainEnabled();
  console.log(`🚀 Xplover Backend running on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
  console.log(`⛓️  Blockchain Enabled: ${chainOk}`);
  if (chainOk) {
    console.log(`   📄 XCR Token:      ${config.blockchain.xcrContractAddress}`);
    console.log(`   📄 Attestation:    ${config.blockchain.contributionContractAddress}`);
  } else if (config.blockchain.enabled) {
    console.log(`   ⚠️  Blockchain flag=true but wallet/contracts not configured correctly`);
  }
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    await prisma.$disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;
