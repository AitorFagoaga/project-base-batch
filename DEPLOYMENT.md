# 🚀 DEPLOYMENT GUIDE - Meritocratic Launchpad

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Add your `PRIVATE_KEY` (wallet with Base Sepolia ETH)
- [ ] Set `BASE_SEPOLIA_RPC_URL` (default: https://sepolia.base.org)
- [ ] (Optional) Add `BASESCAN_API_KEY` for contract verification
- [ ] (Optional) Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from [WalletConnect Cloud](https://cloud.walletconnect.com/)

### 2. Get Base Sepolia ETH
Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Minimum: ~0.1 ETH for deployment + testing

---

## Step-by-Step Deployment

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Compile & Test Contracts
```powershell
npm run contracts:build
npm run contracts:test
```

Expected output: All tests passing ✅

### Step 3: Deploy to Base Sepolia
```powershell
npm run contracts:deploy
```

**Save the output!** You'll see:
```
✅ Reputation deployed at: 0x123...
✅ Launchpad deployed at: 0xabc...
```

### Step 4: Update Frontend Environment
Copy the deployed addresses to `.env`:
```env
NEXT_PUBLIC_REPUTATION_ADDRESS=0x123...
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0xabc...
```

### Step 5: (Optional) Seed Genesis Reputation
Edit `contracts/scripts/genesis.json` with your addresses:
```json
[
  {
    "address": "0xYourWalletAddress",
    "amount": 100,
    "reason": "Buildathon creator"
  },
  {
    "address": "0xAnotherAddress",
    "amount": 50,
    "reason": "Early tester"
  }
]
```

Then run:
```powershell
npm run contracts:seed
```

### Step 6: Start Frontend Locally
```powershell
npm run app:dev
```

Open http://localhost:3000 and test:
- [ ] Connect wallet (Base Sepolia)
- [ ] Create a project
- [ ] Fund a project
- [ ] Check reputation page
- [ ] Give a boost (if you have reputation)

### Step 7: Record Test Transactions
Save transaction hashes for submission:
```
Reputation deploy: 0x...
Launchpad deploy: 0x...
Create project: 0x...
Fund project: 0x...
Boost tx: 0x...
```

### Step 8: Deploy Frontend to Vercel
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
cd app
vercel --prod
```

During deployment, add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CHAIN_ID=84532`
- `NEXT_PUBLIC_REPUTATION_ADDRESS=0x...`
- `NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x...`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...` (optional)

---

## Verification (Optional but Recommended)

If you have `BASESCAN_API_KEY`:

```powershell
cd contracts

# Verify Reputation
npx hardhat verify --network base-sepolia 0xREPUTATION_ADDRESS 86400 1 0 0xYOUR_OWNER_ADDRESS

# Verify Launchpad
npx hardhat verify --network base-sepolia 0xLAUNCHPAD_ADDRESS 0xREPUTATION_ADDRESS
```

---

## Video Recording Checklist

Record a 60-120 second demo covering:

### 1. Intro (10s)
- "Hey! I built a reputation-based launchpad on Base"
- Show the live URL

### 2. Problem (10s)
- "Web3 crowdfunding suffers from rug pulls"
- "No credibility signals for creators"

### 3. Solution (15s)
- "Two-layer reputation: Genesis awards + P2P boosts"
- "Creators showcase verified achievements"
- Show reputation badge on project

### 4. Demo (40s)
- **Create Project**: Fill form, submit tx, show on BaseScan
- **Fund Project**: Enter amount, fund, show progress bar update
- **Reputation Page**: Show boost power, cooldown
- **Give Boost**: Boost someone (show cooldown active after)

### 5. Architecture (15s)
- "Two Solidity contracts: Reputation + Launchpad"
- "Built with Hardhat, Next.js, wagmi, RainbowKit"
- "Deployed on Base Sepolia"

### 6. CTA (10s)
- "Open-source on GitHub"
- "Try it live at [your-url]"
- "Base Builder Track 2024"

---

## Submission Checklist

### Required
- [ ] Deployed on Base (Sepolia testnet) ✅
- [ ] 1+ on-chain transactions (deploy + test txs)
- [ ] Public GitHub repo (set to public)
- [ ] Public URL (Vercel/Netlify)
- [ ] Video (1-2 minutes, uploaded to YouTube/Loom)

### Recommended
- [ ] Basenames integration (included via OnchainKit)
- [ ] Contract verification on BaseScan
- [ ] README with setup instructions
- [ ] Transaction hashes documented

### Optional (Extra Points)
- [ ] Smart Wallet integration (Coinbase Smart Wallet)
- [ ] CDP SDK usage
- [ ] Mobile-responsive design (included!)
- [ ] Accessibility features

---

## Troubleshooting

### "Insufficient funds" error
- Get more Base Sepolia ETH from faucet
- Check wallet is connected to Base Sepolia

### "Cannot find module" errors
- Run `npm install` in both root and `/app`
- Delete `node_modules` and reinstall if needed

### Deployment fails
- Check `PRIVATE_KEY` is correct
- Ensure `BASE_SEPOLIA_RPC_URL` is accessible
- Try alternative RPC: `https://base-sepolia.blockpi.network/v1/rpc/public`

### Frontend shows wrong network
- Clear browser cache
- Disconnect wallet and reconnect
- Make sure MetaMask/wallet has Base Sepolia added

### Contract verification fails
- Double-check constructor arguments match deployment
- Ensure `BASESCAN_API_KEY` is valid
- Wait a few minutes and retry

---

## Post-Deployment

### Share Your Project
- Tweet with `#BaseBuilderTrack` and `#Base`
- Share on Farcaster
- Post in Base Discord

### Monitor
- Check BaseScan for interactions: https://sepolia.basescan.org
- Monitor Vercel analytics
- Review any errors in browser console

---

## Resources

- **Base Docs**: https://docs.base.org
- **Base Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- **BaseScan**: https://sepolia.basescan.org
- **Vercel Docs**: https://vercel.com/docs
- **WalletConnect Cloud**: https://cloud.walletconnect.com/

---

**Good luck with your submission! 🚀**
