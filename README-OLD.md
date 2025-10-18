# 🚀 Meritocratic Launchpad on Base Sepolia

A **reputation-based crowdfunding platform** built on Base Sepolia that combines on-chain credibility with decentralized fundraising. Creators showcase verified reputation, and backers fund with confidence.

## 🎯 What It Does

### Two-Layer Reputation Protocol
1. **Genesis (Top-Down)**: Owner awards reputation for verified achievements (hackathons, OSS contributions, DAO participation)
2. **Boosts (P2P)**: Users give reputation boosts with sublinear power (`√reputation + 1`), with cooldown to prevent spam

### Crowdfunding Platform (MVP)
- Creators launch projects with `title`, `goal (ETH)`, and `deadline`
- Backers contribute ETH during the campaign
- **All-or-nothing funding**: Creator claims funds only if goal is reached by deadline
- **No refunds** in MVP (reduced complexity for buildathon)

### On-Chain Trust Signal
Your reputation score is displayed on all your projects, giving backers a credible signal of your track record.

---

## 🏗️ Tech Stack

### Smart Contracts
- **Solidity 0.8.20** with OpenZeppelin
- **Hardhat** for development & testing
- **Base Sepolia** (chainId: 84532)

### Frontend
- **Next.js 14** + TypeScript + Tailwind CSS
- **wagmi v2** + **viem** for Web3 interactions
- **RainbowKit** for wallet connection
- **OnchainKit** for Basenames integration (recommended)

---

## 📦 Monorepo Structure

```
launchpad-meritocratic/
├── .env.example           # Environment variables template
├── package.json           # Root workspace config
├── /contracts             # Smart contracts
│   ├── contracts/
│   │   ├── Reputation.sol
│   │   ├── Launchpad.sol
│   │   └── interfaces/
│   ├── test/
│   ├── scripts/
│   │   ├── deploy.ts
│   │   ├── seed-genesis.ts
│   │   └── genesis.json
│   └── hardhat.config.ts
├── /app                   # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
└── /deployments
    └── base-sepolia.json  # Deployment addresses + ABIs
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+
- npm or yarn
- Wallet with Base Sepolia ETH ([faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### 1. Clone & Install
```bash
git clone <repo-url>
cd project-base-batch
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Required for deployment
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Optional for verification
BASESCAN_API_KEY=your_api_key

# Frontend (fill after deployment)
NEXT_PUBLIC_REPUTATION_ADDRESS=
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=

# WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

### 3. Deploy Contracts
```bash
# Compile
npm run contracts:build

# Run tests
npm run contracts:test

# Deploy to Base Sepolia
npm run contracts:deploy
```

This will:
- Deploy `Reputation.sol` and `Launchpad.sol`
- Write addresses/ABIs to `/deployments/base-sepolia.json`
- Print addresses to console

**Important**: Copy the contract addresses to `.env`:
```env
NEXT_PUBLIC_REPUTATION_ADDRESS=0x...
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x...
```

### 4. (Optional) Seed Genesis Reputation
Edit `contracts/scripts/genesis.json` with real addresses:
```json
[
  {
    "address": "0xYourAddress",
    "amount": 100,
    "reason": "Hackathon winner"
  }
]
```

Then:
```bash
npm run contracts:seed
```

### 5. Run Frontend
```bash
npm run app:dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

---

## 🎬 Usage Flow

### For Creators
1. **Connect wallet** to Base Sepolia
2. **Go to "Create Project"**
3. Fill in title, goal (ETH), duration (days)
4. Submit transaction → Project is live!
5. **After deadline**: If goal reached, claim funds from project detail page

### For Backers
1. **Browse projects** on homepage
2. Check **creator reputation** (badge display)
3. Click project → Enter funding amount → Submit
4. Contribution recorded on-chain

### For Reputation Builders
1. **Go to "Reputation"** page
2. View your score and boost power
3. **Give boosts**: Enter recipient address → Submit (cooldown: 24h)
4. Your reputation grows through genesis awards and received boosts

---

## 📝 Submission Checklist (Base Builder Track)

- [x] **Deployed on Base** (Sepolia testnet)
- [x] **1+ on-chain transactions** (deploy + test transactions)
- [ ] **Public repo** (open-source on GitHub)
- [ ] **Public URL** (deploy to Vercel/Netlify)
- [ ] **Video (≥1 min)**:
  - Intro
  - Demo (create/fund/claim + boost)
  - Problem & Solution
  - Architecture overview
- [x] **Basenames integration** (recommended via OnchainKit)
- [ ] **Test transaction hashes** (add below)

### Test Transactions
<!-- Add your transaction hashes here after testing -->
```
Reputation deployment: 0x...
Launchpad deployment: 0x...
Create project tx: 0x...
Fund project tx: 0x...
Boost tx: 0x...
```

---

## 🧪 Testing

Run contract tests:
```bash
cd contracts
npm test
```

Coverage includes:
- Genesis awards (single & batch)
- Boost mechanics (power calculation, cooldown, self-boost prevention)
- Project creation
- Funding flows
- Claim conditions (deadline, goal, reentrancy)

---

## 🔧 Development

### Compile Contracts
```bash
npm run contracts:build
```

### Run Local Tests
```bash
npm run contracts:test
```

### Verify on BaseScan (optional)
If you have `BASESCAN_API_KEY`:
```bash
cd contracts
npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Frontend Development
```bash
npm run app:dev
```

---

## 📚 Architecture

### Smart Contracts

#### `Reputation.sol`
- **Genesis Awards**: Owner-controlled, for verified achievements
- **P2P Boosts**: `boostPower = sqrt(reputation) + baseline`
- **Cooldown**: 24h between boosts (configurable)
- **Safety**: No self-boost, requires minimum reputation (MVP: 0)

#### `Launchpad.sol`
- **Create Project**: Anyone can launch with goal + deadline
- **Fund Project**: Payable, only before deadline
- **Claim Funds**: Creator-only, post-deadline, if goal reached
- **ReentrancyGuard**: Safe ETH transfers

### Frontend
- **NetworkGuard**: Auto-switches to Base Sepolia
- **RainbowKit**: Multi-wallet support
- **Real-time reads**: Project stats, reputation, cooldown
- **Responsive**: Mobile-friendly with Tailwind

---

## 🎥 Video Script (60-120s)

1. **Hook (5s)**: "Tired of rug pulls in Web3 crowdfunding?"
2. **Problem (10s)**: "Traditional platforms lack credibility signals. Scammers exploit this."
3. **Solution (15s)**: "Meet the Meritocratic Launchpad: reputation-based funding on Base."
4. **Demo (40s)**:
   - Show reputation badge on creator
   - Create a project
   - Fund it
   - Boost someone's reputation (cooldown visible)
   - Claim funds post-deadline
5. **Architecture (15s)**: "Two contracts: Reputation (genesis + boosts) + Launchpad (all-or-nothing funding). Built on Base Sepolia."
6. **CTA (10s)**: "Open-source, live on Base. Try it now!"

---

## 🤝 Contributing

This is a buildathon MVP. Contributions welcome post-submission!

Ideas for v2:
- Refund mechanism (partial/full)
- Milestone-based funding
- NFT badges for reputation tiers
- Governance for genesis awards

---

## 📄 License

MIT

---

## 🔗 Links

- **Base Docs**: https://docs.base.org
- **Basenames**: https://www.base.org/names
- **OnchainKit**: https://onchainkit.xyz
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

**Built for the Base Builder Track 🚀**