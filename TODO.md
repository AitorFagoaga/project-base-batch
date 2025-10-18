# 📋 TODO List - Meritocratic Launchpad

## ✅ Completed

- [x] Smart contracts (`Reputation.sol`, `Launchpad.sol`)
- [x] Full test suite for both contracts
- [x] Deployment scripts with JSON output
- [x] Genesis reputation seeding script
- [x] Next.js frontend with TypeScript
- [x] Wallet connection (RainbowKit)
- [x] Network guard (Base Sepolia)
- [x] All core pages (Home, Create, Project Detail, Reputation)
- [x] Reputation display with visual tiers
- [x] Boost functionality with cooldown
- [x] Fund project forms
- [x] Claim funds UI
- [x] Responsive design (Tailwind)
- [x] Toast notifications
- [x] README with full documentation
- [x] Deployment guide

---

## 🔧 Before Deployment

### Critical (Must Do)
- [ ] Run `npm install` in root directory
- [ ] Create `.env` file from `.env.example`
- [ ] Add your `PRIVATE_KEY` to `.env`
- [ ] Get Base Sepolia ETH from faucet
- [ ] Deploy contracts to Base Sepolia
- [ ] Update `.env` with deployed contract addresses
- [ ] Test all flows locally (create/fund/claim/boost)

### Recommended
- [ ] Get WalletConnect Project ID and add to `.env`
- [ ] Get BaseScan API key for contract verification
- [ ] Update `genesis.json` with real addresses
- [ ] Record all transaction hashes for documentation
- [ ] Take screenshots of UI for documentation

---

## 🎬 For Video Demo

### Setup
- [ ] Have test accounts with reputation ready
- [ ] Have projects already created for quick demo
- [ ] Practice teleprompter script (see DEPLOYMENT.md)
- [ ] Test screen recording software

### Recording Checklist
- [ ] Show problem statement
- [ ] Demo reputation badge on project card
- [ ] Create a new project (show tx on BaseScan)
- [ ] Fund a project (show progress bar update)
- [ ] Navigate to reputation page
- [ ] Give a boost (show cooldown after)
- [ ] Show architecture overview
- [ ] Display live URL and GitHub repo
- [ ] Duration: 60-120 seconds

---

## 🚀 Deployment Steps

### 1. Local Testing
- [ ] `npm install`
- [ ] `npm run contracts:build`
- [ ] `npm run contracts:test` (all tests pass)
- [ ] Update `.env` with test values

### 2. Deploy Contracts
- [ ] `npm run contracts:deploy`
- [ ] Save deployed addresses
- [ ] Update `.env` with contract addresses
- [ ] (Optional) Run `npm run contracts:seed` for genesis reputation

### 3. Deploy Frontend
- [ ] Test locally with `npm run app:dev`
- [ ] Verify all pages work correctly
- [ ] Deploy to Vercel: `cd app && vercel --prod`
- [ ] Add environment variables to Vercel dashboard
- [ ] Test live URL

### 4. Verification (Optional)
- [ ] Verify contracts on BaseScan
- [ ] Add verified contract links to README

---

## 📝 For Submission

### GitHub
- [ ] Make repository public
- [ ] Add transaction hashes to README
- [ ] Add deployed contract addresses to README
- [ ] Add live URL to README
- [ ] Clean up any sensitive data
- [ ] Push all changes

### Video
- [ ] Upload video to YouTube/Loom
- [ ] Add video link to README
- [ ] Keep video unlisted or public

### Documentation
- [ ] Fill in "Test Transactions" section in README
- [ ] Add screenshots to repository (optional)
- [ ] Update any TODOs in code

### Submission Form
- [ ] GitHub repository URL (public)
- [ ] Live demo URL (Vercel)
- [ ] Video demo URL (YouTube/Loom)
- [ ] Contract addresses on Base Sepolia
- [ ] Transaction hashes
- [ ] Team/individual info

---

## 🎨 Optional Enhancements (Post-Submission)

### Features
- [ ] Add project descriptions/images
- [ ] Implement milestone-based funding
- [ ] Add refund mechanism
- [ ] Create NFT badges for reputation tiers
- [ ] Add project categories/tags
- [ ] Implement search and filtering
- [ ] Add project updates feed

### Technical
- [ ] Implement proper error boundaries
- [ ] Add loading skeletons
- [ ] Optimize contract gas usage
- [ ] Add subgraph for indexing
- [ ] Implement pagination for project list
- [ ] Add dark mode
- [ ] Improve accessibility (ARIA labels, keyboard nav)

### Integration
- [ ] Basenames for creator profiles
- [ ] Coinbase Smart Wallet integration
- [ ] CDP SDK for fiat on-ramp
- [ ] XMTP for project updates
- [ ] Frames for social sharing

---

## 🐛 Known Issues (To Address)

- [ ] TypeScript/ESLint errors (non-blocking, will resolve after `npm install`)
- [ ] Contract ABIs in `contracts.ts` are simplified (full ABIs generated after compile)
- [ ] No loading states for initial contract reads (can add React Suspense)
- [ ] No pagination for large project lists (acceptable for MVP)

---

## 📊 Testing Checklist

### Smart Contracts
- [x] Reputation: Genesis awards
- [x] Reputation: Batch awards
- [x] Reputation: Boost mechanics
- [x] Reputation: Cooldown enforcement
- [x] Reputation: Self-boost prevention
- [x] Launchpad: Project creation
- [x] Launchpad: Funding
- [x] Launchpad: Claim conditions
- [x] Launchpad: Reentrancy protection

### Frontend (Manual Testing)
- [ ] Wallet connection
- [ ] Network switching (Base Sepolia)
- [ ] View all projects
- [ ] Create new project
- [ ] Fund existing project
- [ ] View project details
- [ ] Claim funds (as creator)
- [ ] View personal reputation
- [ ] Give boost to another address
- [ ] Cooldown display updates correctly
- [ ] Toast notifications appear
- [ ] Transaction links to BaseScan work
- [ ] Mobile responsiveness
- [ ] Different wallet types (MetaMask, Coinbase Wallet, etc.)

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP)
- [x] Contracts deploy successfully
- [x] Frontend connects to Base Sepolia
- [ ] Can create projects
- [ ] Can fund projects
- [ ] Can claim funds post-deadline
- [ ] Reputation displays correctly
- [ ] Can give boosts with cooldown

### Base Builder Track Requirements
- [ ] Deployed on Base Sepolia ✅
- [ ] Public repository ✅
- [ ] Public demo URL
- [ ] Video demo (1-2 min)
- [ ] 1+ on-chain transactions

### Bonus Points
- [x] Basenames integration ready
- [x] Mobile-responsive UI
- [x] Clean code with comments
- [ ] Contract verification
- [ ] Comprehensive documentation

---

**Remember**: The goal is a working MVP that demonstrates the concept. Polish can come later!

---

## 📞 Support Resources

- **Base Discord**: https://discord.gg/buildonbase
- **Base Docs**: https://docs.base.org
- **Hardhat Docs**: https://hardhat.org
- **wagmi Docs**: https://wagmi.sh
- **RainbowKit Docs**: https://www.rainbowkit.com

---

Last Updated: October 18, 2025
