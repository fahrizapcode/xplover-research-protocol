# XPLOVER — Web3 Collaborative Knowledge & DeSci Protocol

Xplover is a full-stack Web3 platform that bridges scientific academic research and public knowledge dissemination through decentralized consensus, dynamic educational carousels, role-based workflows, and an on-chain token incentive ledger.

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Role Ecosystem
- **Researcher (`RESEARCHER`)**: Submits structured research papers with problems, methodological approaches, findings, and community insights. Earns **+10 XCR**.
- **Content Creator (`CONTENT_CREATOR`)**: Transforms academic research into interactive, bite-sized multi-slide carousels with hooks, subtitles, and CTAs. Earns **+25 XCR** upon consensus approval.
- **Peer Reviewer (`PEER_REVIEWER`)**: Evaluates submitted carousels on an 8-dimension scoring protocol (1-10 scale). 5 reviews required for consensus. Earns **+5 XCR** per review.
- **Visual Designer (`VISUAL_DESIGNER`)**: Manages the design queue, crafts high-fidelity infographics, vectors, and dark-mode cyberpunk slides, and publishes content to the network.
- **Protocol Governance (`ADMIN`)**: Manages contributors, grants and revokes roles, monitors token transactions, and inspects Arbitrum Sepolia on-chain attestations.

### 2. Consensus & Review Engine
- **Minimum Reviewers**: 5 independent reviewers required before automated verdict.
- **Approval Threshold**: Overall weighted average score ≥ 8.0/10.
- **Auto-Approval Action**:
  - Carousel status moves to `READY_FOR_VISUAL`.
  - Author of the referenced research receives an additional **+20 XCR** reference royalty.
  - Creator receives **+25 XCR**.
  - On-chain attestation is emitted on Arbitrum Sepolia.
- **Revision Action**: If average score < 8.0 on Round 1, status becomes `REVISION_REQUIRED`. Creator can revise slides up to 1 time. If Round 2 fails, content expires.

### 3. Web3 & Smart Contracts
- **`XCRToken.sol`**: ERC-20 token contract deployed on Arbitrum Sepolia (`421614`). Minting is restricted to verified contribution events.
- **`ContributionAttestation.sol`**: On-chain attestation registry logging entity UUIDs, contributor wallet addresses, contribution types, and metadata hashes.
- **Block Explorer**: Transaction hashes directly link to [Arbiscan Sepolia](https://sepolia.arbiscan.io).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Git

### 1. Clone & Configure Environment
```bash
git clone <repository_url>
cd XCR
cp .env.example .env
```

### 2. Install Dependencies
```bash
# In backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# In contracts
cd ../contracts
npm install
npx hardhat compile

# In frontend
cd ../frontend
npm install
```

### 3. Start Development Servers
From the root directory:
```bash
# Terminal 1: Backend API (port 4000)
cd backend && npm run dev

# Terminal 2: Frontend App (port 3000)
cd frontend && npm run dev
```

Visit **http://localhost:3000** to explore Xplover!

---

## 🔑 Pre-Seeded Demo Accounts

Every demo account password is: `Password123!`

| Role | Name | Email | Wallet Address | Initial XCR |
|---|---|---|---|---|
| **Admin** | Protocol Admin | `admin@xplover.io` | `0xf39Fd6e...` | 500 XCR |
| **Researcher** | Dr. Satoshi Nakamoto | `satoshi@xplover.io` | `0x7099797...` | 120 XCR |
| **Researcher** | Dr. Elena Rostova | `elena@xplover.io` | `0x3C44CdD...` | 85 XCR |
| **Content Creator** | Maya Lin | `maya@xplover.io` | `0x90F79bf...` | 150 XCR |
| **Content Creator** | Alex Chen | `alex@xplover.io` | `0x15d34AA...` | 75 XCR |
| **Peer Reviewer** | Prof. Marcus Brody | `marcus@xplover.io` | `0x9965507...` | 90 XCR |
| **Visual Designer** | Sofia Rossi | `sofia@xplover.io` | `0xBcd4042...` | 110 XCR |

*Note: You can instantly switch between these personas via the **"Switch Persona"** button in the navigation bar.*

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Lucide Icons, Ethers.js v6, CSS Design System (Cyberpunk Glassmorphism)
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, Cookie-Parser, Helmet, Express-Validator
- **Database**: PostgreSQL
- **Blockchain**: Solidity 0.8.20, Hardhat, Ethers.js, Arbitrum Sepolia Testnet
