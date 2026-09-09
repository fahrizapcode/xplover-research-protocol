import * as dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "4000"),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  jwtSecret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  database: {
    url: process.env.DATABASE_URL || "",
  },

  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === "true",
    rpcUrl: process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
    // Auto-add 0x prefix if missing (ethers.js requires it)
    privateKey: process.env.PRIVATE_KEY
      ? process.env.PRIVATE_KEY.startsWith("0x")
        ? process.env.PRIVATE_KEY
        : `0x${process.env.PRIVATE_KEY}`
      : "",
    chainId: parseInt(process.env.ARBITRUM_SEPOLIA_CHAIN_ID || "421614"),
    xcrContractAddress: process.env.XCR_CONTRACT_ADDRESS || "",
    contributionContractAddress: process.env.CONTRIBUTION_CONTRACT_ADDRESS || "",
  },
};
