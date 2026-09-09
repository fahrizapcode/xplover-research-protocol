import { ethers } from "ethers";
import { config } from "../utils/config";

let _provider: ethers.JsonRpcProvider | null = null;
let _signer: ethers.Wallet | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
  }
  return _provider;
}

export function getSigner(): ethers.Wallet {
  if (!_signer) {
    if (!config.blockchain.privateKey) {
      throw new Error("PRIVATE_KEY not configured");
    }
    _signer = new ethers.Wallet(config.blockchain.privateKey, getProvider());
  }
  return _signer;
}

export function isBlockchainEnabled(): boolean {
  return (
    config.blockchain.enabled &&
    !!config.blockchain.privateKey &&
    !!config.blockchain.xcrContractAddress &&
    !!config.blockchain.contributionContractAddress
  );
}
