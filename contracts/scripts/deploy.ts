import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=== Xplover Contract Deployment ===");
  console.log("Network: Arbitrum Sepolia (Chain ID: 421614)");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("===================================\n");

  // Deploy XCR Token
  console.log("Deploying XCRToken...");
  const XCRToken = await ethers.getContractFactory("XCRToken");
  const xcrToken = await XCRToken.deploy(deployer.address);
  await xcrToken.waitForDeployment();
  const xcrAddress = await xcrToken.getAddress();
  console.log("✅ XCRToken deployed to:", xcrAddress);

  // Deploy Contribution Attestation
  console.log("\nDeploying ContributionAttestation...");
  const ContributionAttestation = await ethers.getContractFactory("ContributionAttestation");
  const attestation = await ContributionAttestation.deploy(deployer.address);
  await attestation.waitForDeployment();
  const attestationAddress = await attestation.getAddress();
  console.log("✅ ContributionAttestation deployed to:", attestationAddress);

  console.log("\n=== Deployment Complete ===");
  console.log("XCR Token:", xcrAddress);
  console.log("Contribution Attestation:", attestationAddress);
  console.log("===========================\n");

  // Update .env file with contract addresses
  const envPath = path.join(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    envContent = envContent.replace(
      /XCR_CONTRACT_ADDRESS=.*/,
      `XCR_CONTRACT_ADDRESS=${xcrAddress}`
    );
    envContent = envContent.replace(
      /CONTRIBUTION_CONTRACT_ADDRESS=.*/,
      `CONTRIBUTION_CONTRACT_ADDRESS=${attestationAddress}`
    );
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Updated .env with contract addresses");
  } else {
    console.log("⚠️  No .env file found. Please manually set:");
    console.log(`XCR_CONTRACT_ADDRESS=${xcrAddress}`);
    console.log(`CONTRIBUTION_CONTRACT_ADDRESS=${attestationAddress}`);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "arbitrumSepolia",
    chainId: 421614,
    deployer: deployer.address,
    contracts: {
      XCRToken: xcrAddress,
      ContributionAttestation: attestationAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, "arbitrumSepolia.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Deployment info saved to contracts/deployments/arbitrumSepolia.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
