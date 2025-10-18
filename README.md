# Meritocratic Launchpad

A trust-based crowdfunding platform on Base with on-chain reputation protocol.

## 🏗️ Architecture

This is a monorepo containing:

- **`packages/hardhat`** - Smart contracts (Reputation.sol + Launchpad.sol)
- **`packages/next.js`** - Frontend application with wagmi + RainbowKit

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm, yarn, or pnpm
- MetaMask or compatible Web3 wallet

### Installation

1. **Install dependencies**

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

2. **Setup environment variables**

```bash
# For Hardhat (contracts)
cd packages/hardhat
cp .env.example .env
# Edit .env and add your private key

# For Next.js (frontend)
cd ../next.js
cp .env.example .env
# Edit .env and add your WalletConnect project ID
```

### Development Workflow

#### 1. Compile Smart Contracts

```bash
npm run hardhat:build
```

This compiles the contracts and exports ABIs to the frontend package.

#### 2. Run Tests

```bash
npm run hardhat:test
```

#### 3. Deploy to Local Network

Terminal 1 - Start local Hardhat node:
```bash
cd packages/hardhat
npm run node
```

Terminal 2 - Deploy contracts:
```bash
cd packages/hardhat
npm run deploy:local
```

#### 4. Deploy to Base Sepolia

```bash
# Make sure you have Base Sepolia ETH in your wallet
cd packages/hardhat
npm run deploy
```

Save the deployed contract addresses and update `packages/next.js/.env`:
```
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS=0x...
```

#### 5. Run Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Smart Contracts

### Reputation.sol

Two-layer reputation protocol:
- **Layer 1**: Genesis reputation (medals from trusted communities)
- **Layer 2**: Peer-to-peer boosts (community validation)

Key features:
- Cooldown mechanism (1 boost per day)
- Boost power scales with booster's reputation
- Anti-manipulation by design

### Launchpad.sol

Simple and secure crowdfunding platform:
- Create projects with funding goals and deadlines
- Fund projects with ETH
- Claim funds when goal is reached

The frontend reads reputation scores from `Reputation.sol` to display trust metrics for each project creator.

## 🔧 Tech Stack

### Smart Contracts
- Solidity ^0.8.20
- Hardhat 3
- Hardhat Ignition (deployments)
- TypeScript

### Frontend
- Next.js 15
- React 19
- wagmi + viem
- RainbowKit
- TailwindCSS
- TypeScript

### Network
- Base Sepolia (testnet)
- Base (mainnet ready)

## 📚 Available Scripts

### Root Level
- `npm run dev` - Start frontend dev server
- `npm run build` - Build all packages
- `npm test` - Run contract tests

### Hardhat Package
- `npm run compile` - Compile contracts
- `npm run build` - Compile and export ABIs
- `npm run test` - Run tests
- `npm run deploy` - Deploy to Base Sepolia
- `npm run deploy:local` - Deploy to local network
- `npm run node` - Start local Hardhat node

### Next.js Package
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server

## 🧪 Testing

Tests will be added in the `packages/hardhat/test` directory.

## 🎯 Project Vision

Building a meritocratic launchpad where:
- Investors can trust project creators based on verifiable on-chain reputation
- Builders are rewarded for their contributions and track record
- The community validates and elevates talented contributors

## 📄 License

MIT