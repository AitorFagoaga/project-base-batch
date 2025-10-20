# 🚀 Multi-Admin Deployment Guide

This guide explains how to deploy the updated contracts with **multi-admin support** and fix the `createProject` transaction failures.

## 🔧 What Changed

### **Problem Fixed**
Your transactions were failing because of a **parameter mismatch**:
- **Frontend** was calling `createProject(title, description, imageUrl, goalInWei, duration)` (5 params)
- **Old Contract** only accepted `createProject(title, goalInEth, durationInDays)` (3 params)

### **Updates Made**

#### 1. **Launchpad.sol** - Added Description & Image Support
```solidity
// NEW: Project struct now includes description and imageUrl
struct Project {
    uint256 id;
    address creator;
    string title;
    string description;  // ← NEW
    string imageUrl;     // ← NEW
    uint256 goal;
    uint256 deadline;
    uint256 fundsRaised;
    bool claimed;
}

// NEW: createProject now accepts 5 parameters
function createProject(
    string calldata title,
    string calldata description,  // ← NEW
    string calldata imageUrl,     // ← NEW
    uint256 goalInEth,
    uint256 durationInDays
) external returns (uint256 projectId)
```

#### 2. **Reputation.sol** - Multi-Admin Support
```solidity
// OLD: Used Ownable (single owner)
import "@openzeppelin/contracts/access/Ownable.sol";
contract Reputation is IReputation, Ownable { ... }

// NEW: Uses AccessControl (multiple admins)
import "@openzeppelin/contracts/access/AccessControl.sol";
contract Reputation is IReputation, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // ...
}
```

**Benefits:**
- Multiple addresses can have admin privileges
- No single point of failure
- Better for team collaboration

---

## 📋 Deployment Steps

### **Prerequisites**

1. **MetaMask** with Base Sepolia ETH (get from [faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))
2. **Private key** in your `.env` file:
   ```bash
   PRIVATE_KEY=your_private_key_here
   ```

### **Step 1: Deploy the Contracts**

Navigate to the contracts directory:
```bash
cd contracts
```

Run the deployment script:
```bash
npx hardhat run scripts/deploy-multi-admin.ts --network baseSepolia
```

**Expected Output:**
```
🚀 Deploying contracts with Multi-Admin support
📍 Deployer address: 0xYourAddress...
💰 Account balance: 0.5 ETH

📜 Deploying Reputation contract with AccessControl...
✅ Reputation deployed at: 0xABC123...
👤 Initial admin: 0xYourAddress...

🚀 Deploying Launchpad contract...
✅ Launchpad deployed at: 0xDEF456...

✅ Deployer has DEFAULT_ADMIN_ROLE: true
✅ Deployer has ADMIN_ROLE: true

💾 Deployment info saved to: ../../deployments/base-sepolia-multi-admin.json

🎉 Deployment complete!
```

**Save these addresses** - you'll need them in the next steps!

---

### **Step 2: Update Frontend Configuration**

#### 2.1 Update Environment Variables

Open or create `.env.local` in your `app/` directory:

```bash
cd ../app
```

Add the new contract addresses:
```env
NEXT_PUBLIC_REPUTATION_ADDRESS=0xABC123...  # From deployment output
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0xDEF456...   # From deployment output
```

#### 2.2 Update Contract ABIs

Open `app/src/lib/contracts.ts` and update with the new addresses and ABIs from:
```
deployments/base-sepolia-multi-admin.json
```

You can copy the entire ABIs from that file, or just update the addresses if the ABIs match.

---

### **Step 3: (Optional) Add Second Admin**

If you want to add the **original owner** (or anyone else) as a second admin:

#### 3.1 Edit the Script

Open `contracts/scripts/add-admin.ts` and update:

```typescript
// Line 25: Your deployed Reputation address
const REPUTATION_ADDRESS = "0xABC123..."; // From Step 1

// Line 28: Address to add as admin
const SECOND_ADMIN_ADDRESS = "0xOriginalOwner..."; // The old owner's address
```

#### 3.2 Run the Script

```bash
cd contracts
npx hardhat run scripts/add-admin.ts --network baseSepolia
```

**Expected Output:**
```
🔐 Add Admin Script for Reputation Contract
👤 Current signer: 0xYourAddress...

🔍 Checking permissions...
   Your DEFAULT_ADMIN_ROLE: ✅
   Your ADMIN_ROLE: ✅

✨ Granting ADMIN_ROLE to: 0xOriginalOwner...
📝 Transaction hash: 0x123abc...
✅ Transaction confirmed in block: 3261575

✅ SUCCESS! Address now has ADMIN_ROLE

📊 Current Admins:
   0xYourAddress...
   - ADMIN_ROLE: ✅
   - DEFAULT_ADMIN_ROLE: ✅

   0xOriginalOwner...
   - ADMIN_ROLE: ✅
   - DEFAULT_ADMIN_ROLE: ❌
```

**Note:** Only addresses with `DEFAULT_ADMIN_ROLE` can grant roles to others. The initial deployer gets this role automatically.

---

### **Step 4: Test the Frontend**

1. **Restart your Next.js dev server:**
   ```bash
   cd ../app
   npm run dev
   ```

2. **Navigate to** `http://localhost:3000/create`

3. **Create a test project:**
   - Title: "Test Project"
   - Description: "Testing the new contract"
   - Image URL: (optional)
   - Goal: 0.1 ETH
   - Duration: 30 days

4. **Click "Launch Project"**

5. **The transaction should now succeed!** ✅

Check on BaseScan:
```
https://sepolia.basescan.org/tx/<your-transaction-hash>
```

---

## 🔐 Admin Roles Explained

### **DEFAULT_ADMIN_ROLE**
- Can grant/revoke any role (including ADMIN_ROLE)
- Usually given to the deployer or DAO
- **Only the deployer has this by default**

### **ADMIN_ROLE**
- Can award genesis reputation
- Can update protocol parameters (cooldown, baseline power, etc.)
- **Multiple addresses can have this role**

### **Granting Roles**

From an address with `DEFAULT_ADMIN_ROLE`:

```typescript
// Example: Grant admin to another address
const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
await reputation.grantRole(ADMIN_ROLE, "0xNewAdminAddress");

// Revoke admin (if needed)
await reputation.revokeRole(ADMIN_ROLE, "0xAddressToRevoke");

// Check if address has a role
const hasRole = await reputation.hasRole(ADMIN_ROLE, "0xAddressToCheck");
console.log("Has admin role:", hasRole);
```

---

## 📚 Admin Functions

Both admins can now call these functions:

### **Award Genesis Reputation**
```typescript
// Award reputation to a user
await reputation.awardGenesis(
  userAddress,
  100, // amount
  "Won hackathon"
);

// Award with category
await reputation.awardGenesisWithCategory(
  userAddress,
  100,
  "HACKATHON",
  "Won ETHGlobal 2024"
);

// Award to multiple users
await reputation.awardGenesisBatch(
  [addr1, addr2, addr3],
  [100, 50, 75],
  ["Won 1st place", "Won 2nd place", "Best design"]
);
```

### **Update Protocol Parameters**
```typescript
await reputation.setParams(
  86400,  // cooldown (1 day)
  1,      // baseline power
  0       // min rep to boost
);
```

---

## 🛠️ Troubleshooting

### **Transaction still failing?**

1. **Check you updated the addresses:**
   ```bash
   # In app/.env.local
   echo $NEXT_PUBLIC_LAUNCHPAD_ADDRESS
   ```

2. **Check the ABI is updated:**
   - Open `app/src/lib/contracts.ts`
   - Make sure the Launchpad ABI includes `createProject` with 5 parameters

3. **Clear browser cache and reload:**
   ```bash
   # Restart dev server
   npm run dev
   ```

4. **Check MetaMask is on Base Sepolia:**
   - Network: Base Sepolia
   - Chain ID: 84532

### **Can't add second admin?**

1. **Check you have DEFAULT_ADMIN_ROLE:**
   ```bash
   npx hardhat console --network baseSepolia
   ```
   ```javascript
   const Reputation = await ethers.getContractFactory("Reputation");
   const rep = Reputation.attach("0xYourReputationAddress");
   const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
   const hasRole = await rep.hasRole(DEFAULT_ADMIN_ROLE, "0xYourAddress");
   console.log("Has DEFAULT_ADMIN_ROLE:", hasRole);
   ```

2. **Make sure you're using the deployer's private key** in `.env`

### **Out of gas?**

Get more Base Sepolia ETH from the faucet:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

---

## 📊 Deployment Info

All deployment information is saved to:
```
deployments/base-sepolia-multi-admin.json
```

This file contains:
- Contract addresses
- Full ABIs
- Deployment timestamp
- Deployer address
- List of admins

**Keep this file safe!** You'll need it to interact with the contracts.

---

## 🎯 Next Steps

1. ✅ Deploy contracts
2. ✅ Update frontend with new addresses
3. ✅ Add second admin (optional)
4. ✅ Test creating projects
5. ✅ Award genesis reputation to creators
6. ✅ Test boosting other users

**Happy building!** 🚀

---

## 📞 Need Help?

If you encounter any issues:

1. Check the transaction on BaseScan for error messages
2. Verify all addresses are correct in `.env.local`
3. Make sure you're on Base Sepolia network (Chain ID: 84532)
4. Ensure you have enough ETH for gas

---

## 🔗 Useful Links

- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [BaseScan Explorer](https://sepolia.basescan.org/)
- [OpenZeppelin AccessControl Docs](https://docs.openzeppelin.com/contracts/4.x/access-control)
- [Hardhat Docs](https://hardhat.org/docs)
