# Meritocratic Launchpad - Setup Guide

## ✅ What's Been Initialized

Your monorepo is now ready with:

### 📦 Packages Structure
```
project-base-batch/
├── packages/
│   ├── hardhat/          # Smart contracts (Hardhat 2.22)
│   │   ├── contracts/    # ✅ Reputation.sol + Launchpad.sol
│   │   ├── ignition/     # ✅ Deployment modules
│   │   ├── scripts/      # ✅ ABI export script
│   │   └── test/         # Ready for tests
│   └── next.js/          # Frontend (Next.js 15)
│       ├── app/          # ✅ App router setup
│       ├── lib/          # ✅ wagmi config + contract ABIs
│       └── components/   # Ready for components
└── package.json          # ✅ Workspace configuration
```

### ✅ Completed Setup

1. **Hardhat Package** - Smart contracts environment
   - Solidity ^0.8.20
   - Hardhat 2.22 with Toolbox
   - Hardhat Ignition for deployments
   - Base Sepolia network configured
   - Both contracts created and compiled
   - ABIs exported to frontend

2. **Next.js Package** - Frontend application
   - Next.js 15 with App Router
   - React 19
   - wagmi + viem for Web3
   - RainbowKit for wallet connections
   - TailwindCSS for styling
   - TypeScript configured

3. **Contracts**
   - ✅ [Reputation.sol](packages/hardhat/contracts/Reputation.sol) - Two-layer reputation protocol
   - ✅ [Launchpad.sol](packages/hardhat/contracts/Launchpad.sol) - Crowdfunding platform

## 🚀 Next Steps

### 1. Setup Environment Variables

**For Hardhat (deploy contracts):**
```bash
cd packages/hardhat
cp .env.example .env
```

Edit `.env` and add:
- `PRIVATE_KEY` - Your wallet private key (without 0x)
- `BASE_SEPOLIA_RPC_URL` - Optional (defaults to public endpoint)
- `BASESCAN_API_KEY` - Optional (for contract verification)

**For Next.js (frontend):**
```bash
cd packages/next.js
cp .env.example .env
```

Edit `.env` and add:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)

### 2. Get Base Sepolia ETH

You need testnet ETH for deployment:
1. Get your wallet address from MetaMask
2. Visit Base Sepolia faucets:
   - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - https://www.alchemy.com/faucets/base-sepolia

### 3. Test Locally First

Start a local Hardhat network:
```bash
cd packages/hardhat
npm run node
```

In another terminal, deploy locally:
```bash
cd packages/hardhat
npm run deploy:local
```

### 4. Deploy to Base Sepolia

```bash
cd packages/hardhat
npm run deploy
```

**Save the deployment addresses!** You'll see output like:
```
Reputation deployed to: 0x...
Launchpad deployed to: 0x...
```

Update `packages/next.js/.env`:
```
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS=0x...
```

### 5. Run the Frontend

```bash
cd packages/next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Development Workflow

### Compile Contracts
```bash
cd packages/hardhat
npm run compile
```

### Build (Compile + Export ABIs)
```bash
cd packages/hardhat
npm run build
```

This exports contract ABIs to `packages/next.js/lib/contracts/`

### Run Tests
```bash
cd packages/hardhat
npm run test
```

### Frontend Development
```bash
cd packages/next.js
npm run dev
```

## 🔧 Technology Improvements Over Original Plan

Your setup includes **modern improvements**:

### ✅ Hardhat 2.22 (Stable & Well-Supported)
- While Hardhat 3 exists, version 2.22 is production-ready
- Full plugin ecosystem support
- Hardhat Ignition for reliable deployments

### ✅ Modern Frontend Stack
- Next.js 15 (latest)
- React 19 (latest)
- wagmi v2 + viem (faster, lighter than ethers.js)
- RainbowKit for better UX

### ✅ Monorepo with Workspaces
- Proper package isolation
- Shared scripts at root level
- Easy cross-package imports

### ✅ Type Safety
- TypeScript everywhere
- Auto-generated contract types
- Shared ABIs between packages

## 📚 Available Scripts

### From Root Directory
```bash
npm run hardhat:build    # Compile contracts & export ABIs
npm run hardhat:test     # Run contract tests
npm run hardhat:deploy   # Deploy to Base Sepolia
npm run frontend:dev     # Start frontend dev server
npm run frontend:build   # Build frontend for production
```

### From packages/hardhat
```bash
npm run compile      # Compile contracts
npm run build        # Compile + export ABIs
npm run test         # Run tests
npm run deploy       # Deploy to Base Sepolia
npm run deploy:local # Deploy to local network
npm run node         # Start local Hardhat node
```

### From packages/next.js
```bash
npm run dev    # Start dev server
npm run build  # Build for production
npm run start  # Start production server
```

## 🎯 Smart Contract Features

### Reputation.sol
- **Layer 1**: Medal system (admin/community awards)
- **Layer 2**: Peer-to-peer boosts
- Cooldown: 1 boost per 24 hours
- Boost power scales with reputation
- Anti-manipulation design

### Launchpad.sol
- Create funding campaigns
- Set goals and deadlines
- Accept ETH contributions
- Claim funds when goal reached
- Track individual contributions

## 🏗️ Building Your dApp

### Next Steps for Development

1. **Write Tests** (`packages/hardhat/test/`)
   - Test Reputation contract functions
   - Test Launchpad contract functions
   - Test integration scenarios

2. **Build Frontend Pages**
   - Projects listing page
   - Project detail page
   - Create project page
   - Reputation/profile page
   - Boost functionality

3. **Integrate Contracts**
   - Use exported ABIs from `lib/contracts/`
   - Connect with wagmi hooks
   - Handle transactions with viem

4. **Deploy & Verify**
   - Deploy to Base Sepolia
   - Verify contracts on BaseScan
   - Test with real wallet

## 📖 Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [Hardhat Ignition](https://hardhat.org/ignition)
- [wagmi Docs](https://wagmi.sh)
- [RainbowKit Docs](https://rainbowkit.com)
- [Base Docs](https://docs.base.org)
- [Solidity Docs](https://docs.soliditylang.org)

## 🔍 Need Help?

Check the following files for reference:
- [README.md](README.md) - Project overview
- [CLAUDE.md](claude.md) - Project vision & requirements
- [pasosASegiur.md](pasosASegiur.md) - Original plan

Happy building! 🚀
