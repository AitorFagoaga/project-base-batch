# 🏗️ Architecture Overview - Meritocratic Launchpad

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  (Next.js 14 + React + TypeScript + Tailwind + RainbowKit)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ wagmi v2 + viem
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    BASE SEPOLIA                              │
│                   (chainId: 84532)                           │
│                                                              │
│  ┌────────────────────────┐    ┌──────────────────────────┐ │
│  │  Reputation.sol        │    │   Launchpad.sol          │ │
│  │  ─────────────────     │    │   ──────────────         │ │
│  │  • Genesis Awards      │◄───┤   • Create Projects      │ │
│  │  • P2P Boosts         │    │   • Fund Projects        │ │
│  │  • Cooldown System    │    │   • Claim Funds          │ │
│  │  • Sublinear Power    │    │   • Query Reputation     │ │
│  └────────────────────────┘    └──────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Layer

### Reputation.sol

**Purpose**: Two-layer reputation protocol (Genesis + Boosts)

**Key Functions**:
```solidity
// Layer 1: Top-Down (Owner Only)
function awardGenesis(address recipient, uint256 amount, string reason)
function awardGenesisBatch(address[] recipients, uint256[] amounts, string[] reasons)

// Layer 2: Peer-to-Peer
function boost(address recipient)
function boostPower(address booster) view returns (uint256)  // √rep + baseline

// Configuration
function setParams(uint256 cooldown, uint256 baselinePower, uint256 minRepToBoost)

// Queries
function reputationOf(address account) view returns (uint256)
function lastBoostAt(address booster) view returns (uint256)
```

**State Variables**:
- `mapping(address => uint256) _reputation` - Reputation scores
- `mapping(address => uint256) _lastBoostAt` - Cooldown tracking
- `uint256 _cooldown` - Seconds between boosts (default: 86400 = 1 day)
- `uint256 _baselinePower` - Base boost power (default: 1)
- `uint256 _minRepToBoost` - Min reputation to give boosts (MVP: 0)

**Boost Power Formula**:
```
boostPower(booster) = √(reputation[booster]) + baselinePower
```

Example:
- Booster with 100 rep → √100 + 1 = 11 power
- Booster with 144 rep → √144 + 1 = 13 power
- Booster with 0 rep → √0 + 1 = 1 power

**Safety Mechanisms**:
1. **No self-boost**: `require(recipient != msg.sender)`
2. **Cooldown enforcement**: Check `lastBoostAt + cooldown > block.timestamp`
3. **Minimum reputation**: Check `reputation >= minRepToBoost`

---

### Launchpad.sol

**Purpose**: Simple all-or-nothing crowdfunding

**Key Functions**:
```solidity
// Project Management
function createProject(string title, uint256 goalInEth, uint256 durationInDays) returns (uint256 projectId)
function fundProject(uint256 projectId) payable
function claimFunds(uint256 projectId) nonReentrant

// Queries
function getProject(uint256 projectId) view returns (Project)
function projectCount() view returns (uint256)
function getContribution(uint256 projectId, address backer) view returns (uint256)
```

**Project Struct**:
```solidity
struct Project {
    uint256 id;
    address creator;
    string title;
    uint256 goal;           // in wei
    uint256 deadline;       // timestamp
    uint256 fundsRaised;
    bool claimed;
}
```

**Funding Flow**:
```
1. Creator calls createProject()
   └─> Project created with unique ID

2. Backers call fundProject{value: X}
   └─> ETH stored in contract
   └─> fundsRaised += X

3. After deadline, if fundsRaised >= goal:
   └─> Creator calls claimFunds()
   └─> All funds transferred to creator
   └─> claimed = true

4. If goal not reached:
   └─> Funds stay in contract (no refunds in MVP)
```

**Safety Mechanisms**:
1. **ReentrancyGuard**: Prevents reentrancy attacks on claim
2. **Deadline checks**: No funding after deadline
3. **Goal validation**: Claim only if goal reached
4. **Single claim**: `require(!claimed)`
5. **Creator-only claim**: `require(msg.sender == project.creator)`

---

## Frontend Layer

### Tech Stack
- **Next.js 14**: App Router, Server Components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **wagmi v2**: React Hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **RainbowKit**: Wallet connection UI
- **react-hot-toast**: Toast notifications
- **@tanstack/react-query**: Data fetching/caching

### Page Structure

```
/app
├── layout.tsx           # Root layout with providers
├── page.tsx             # Home (project list)
├── create/
│   └── page.tsx         # Create project form
├── project/
│   └── [id]/
│       └── page.tsx     # Project detail + fund/claim
└── reputation/
    └── page.tsx         # Reputation dashboard + boost form
```

### Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Providers                        │
│  (WagmiProvider, QueryClient, RainbowKitProvider)   │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │       NetworkGuard        │  (Force Base Sepolia)
    └─────────────┬─────────────┘
                  │
    ┌─────────────▼─────────────┐
    │        Page Layout        │
    │  (Header, Nav, Footer)    │
    └─────────────┬─────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
  ┌────▼────┐          ┌────▼────┐
  │ Display │          │  Forms  │
  │ Components│        │ Components│
  └─────────┘          └─────────┘
  • ProjectCard        • FundForm
  • ReputationBadge    • BoostForm
```

### Key Components

#### ConnectButton
- Wraps RainbowKit's ConnectButton
- Shows wallet address, balance, network

#### NetworkGuard
- Checks if user is on Base Sepolia (84532)
- Auto-switches network if possible
- Shows error message if wrong network

#### ProjectCard
- Displays project title, goal, progress
- Shows creator's reputation badge
- Links to project detail page

#### ReputationBadge
- Visual tier system based on reputation
  - 0-9: Newcomer 🌱
  - 10-49: Contributor ✨
  - 50-199: Builder 🔨
  - 200-499: Expert ⭐
  - 500+: Legend 👑

#### FundForm
- Input for ETH amount
- Validates non-zero amount
- Shows transaction status
- Links to BaseScan

#### BoostForm
- Input for recipient address
- Shows current boost power
- Displays cooldown countdown
- Prevents self-boost

---

## Data Flow

### Read Flow (View Data)
```
User opens page
  └─> useReadContract hook (wagmi)
      └─> RPC call to Base Sepolia
          └─> Contract view function
              └─> Data returned
                  └─> React state updated
                      └─> UI re-renders
```

### Write Flow (Send Transaction)
```
User submits form
  └─> Form validation
      └─> useWriteContract hook (wagmi)
          └─> Wallet prompts user
              └─> User signs transaction
                  └─> Transaction sent to Base Sepolia
                      └─> Pending state shown
                          └─> useWaitForTransactionReceipt
                              └─> Transaction confirmed
                                  └─> Success toast
                                      └─> Data refetched
                                          └─> UI updated
```

---

## State Management

### Contract State (On-Chain)
- Reputation scores
- Boost timestamps
- Project data
- Funding amounts

### React State (Client-Side)
- Form inputs (title, amount, address)
- Loading states (isPending, isConfirming)
- Transaction hashes
- Error messages

### Query Cache (TanStack Query)
- Contract read results
- Auto-invalidation on writes
- Stale-while-revalidate pattern

---

## Security Considerations

### Smart Contracts
✅ **OpenZeppelin libraries**: Battle-tested code
✅ **ReentrancyGuard**: Prevents reentrancy attacks
✅ **Ownable**: Owner-only functions
✅ **Custom errors**: Gas-efficient error handling
✅ **Event emission**: Transparency and indexing

### Frontend
✅ **Input validation**: Client-side checks
✅ **Address validation**: isAddress() checks
✅ **Type safety**: TypeScript strict mode
✅ **Network guard**: Prevents wrong-chain txs
✅ **Transaction confirmation**: Wait for receipt

### Known Limitations (MVP)
⚠️ **No refunds**: Funds locked if goal not reached
⚠️ **Single claim**: Creator must claim all at once
⚠️ **No milestones**: No partial funding releases
⚠️ **Genesis centralized**: Owner controls genesis awards

---

## Gas Optimization

### Contract Level
- `immutable` for Reputation address in Launchpad
- `uint256` instead of smaller types (EVM word size)
- Custom errors instead of revert strings
- Batch operations for genesis awards
- Babylonian sqrt (O(log n) complexity)

### Frontend Level
- Cached reads with TanStack Query
- Debounced input validation
- Optimistic UI updates
- Batch contract calls where possible

---

## Testing Strategy

### Unit Tests (Hardhat)
- **Reputation**: Genesis, boosts, cooldown, params
- **Launchpad**: Create, fund, claim, edge cases
- **Integration**: Both contracts together

### Manual Testing (Frontend)
- Wallet connection flows
- Network switching
- Transaction signing
- Error handling
- Mobile responsiveness

---

## Deployment Pipeline

```
1. Local Development
   └─> npm install
   └─> Contracts compile
   └─> Tests run

2. Deploy Contracts
   └─> hardhat deploy --network base-sepolia
   └─> Addresses saved to /deployments/base-sepolia.json

3. Update Frontend
   └─> Copy addresses to .env
   └─> Test locally

4. Deploy Frontend
   └─> vercel --prod
   └─> Environment variables set

5. Verification (Optional)
   └─> hardhat verify --network base-sepolia
   └─> Contracts verified on BaseScan
```

---

## Future Enhancements

### Smart Contracts v2
- [ ] Refund mechanism (partial/full)
- [ ] Milestone-based funding
- [ ] Project categories
- [ ] Governance for genesis awards
- [ ] Multi-sig for owner operations
- [ ] Delegation of reputation

### Frontend v2
- [ ] Project descriptions with Markdown
- [ ] Image uploads (IPFS)
- [ ] Search and filters
- [ ] Pagination
- [ ] Real-time updates (WebSockets)
- [ ] Dark mode
- [ ] Localization (i18n)

### Integrations
- [ ] Basenames for profiles
- [ ] Smart Wallet integration
- [ ] CDP SDK for fiat on-ramp
- [ ] XMTP for messaging
- [ ] Farcaster Frames
- [ ] Subgraph for indexing

---

## Performance Metrics

### Smart Contracts
- Reputation deployment: ~500k gas
- Launchpad deployment: ~800k gas
- Create project: ~150k gas
- Fund project: ~80k gas
- Boost: ~100k gas
- Claim funds: ~50k gas

### Frontend
- Initial load: <3s (target)
- Time to interactive: <1s
- Bundle size: <500KB (gzipped)
- Lighthouse score: 90+ (target)

---

## Monitoring & Analytics

### On-Chain
- BaseScan for transaction history
- Event logs for indexing
- Gas usage tracking

### Frontend
- Vercel Analytics
- Web Vitals
- Error tracking (browser console)

---

**Last Updated**: October 18, 2025
