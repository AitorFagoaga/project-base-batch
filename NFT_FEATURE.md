# Backer NFT Feature Documentation

## Overview

Every project on the launchpad automatically mints **proof-of-backing NFTs** to backers who invest. Each NFT serves as a permanent, on-chain record of the backer's contribution.

## Architecture

### Smart Contracts

#### 1. **ProjectNFT.sol**
- **Type:** ERC-721 NFT contract
- **Deployment:** One unique contract deployed per project
- **Location:** `contracts/contracts/ProjectNFT.sol`

**Key Features:**
- Stores investment amount on-chain for each token
- Only the Launchpad contract can mint NFTs
- All backers receive the same NFT image/metadata
- Investment amount is queryable via `getInvestmentAmount(tokenId)`

**Main Functions:**
```solidity
function mintToBacker(address backer, uint256 investmentAmount) external returns (uint256)
function getInvestmentAmount(uint256 tokenId) external view returns (uint256)
function tokensOfOwner(address owner) external view returns (uint256[] memory)
```

#### 2. **Launchpad.sol (Modified)**
- **Changes Made:**
  - Added `nftContract` field to Project struct
  - Updated `createProject()` to deploy a new ProjectNFT contract per project
  - Updated `fundProject()` to mint an NFT after each contribution
  - Added `getProjectNFT(uint256 projectId)` view function

**New Parameters for createProject:**
```solidity
string calldata nftName,      // e.g., "MyProject Backer NFT"
string calldata nftSymbol,    // e.g., "MYPROJ"
string calldata nftBaseURI    // IPFS metadata URI (ipfs://Qm...)
```

## Frontend Implementation

### 1. **IPFS Service** (`app/src/lib/ipfsService.ts`)

Handles all IPFS uploads via Pinata:

```typescript
// Upload image to IPFS
const imageUri = await uploadImageToIPFS(file);
// Returns: ipfs://Qm.../image.png

// Create and upload metadata JSON
const metadata = {
  name: "MyProject Backer NFT",
  description: "Official backer NFT",
  image: imageUri
};
const metadataUri = await uploadMetadataToIPFS(metadata);
// Returns: ipfs://Qm.../metadata.json
```

### 2. **Create Project Form** (`app/src/app/create/page.tsx`)

**New Fields Added:**
1. **NFT Collection Name** - Name for the NFT collection
2. **NFT Description** - Description of what the NFT represents
3. **NFT Image** - File upload for the NFT artwork (max 10MB, JPEG/PNG/GIF/WebP)

**Upload Flow:**
```
User fills form → Uploads NFT image
  ↓
Frontend uploads image to IPFS (Stage 1)
  ↓
Frontend creates metadata JSON and uploads to IPFS (Stage 2)
  ↓
Frontend sends transaction to blockchain (Stage 3)
  ↓
Project created with NFT contract deployed
```

**Loading States:**
- "Uploading NFT image to IPFS network..." (15-30 seconds)
- "Creating your NFT's metadata..."
- "Please confirm the transaction in your wallet..."

### 3. **Contracts Configuration** (`app/src/lib/contracts.ts`)

Added ProjectNFT ABI for interacting with project-specific NFT contracts:

```typescript
// Get NFT contract address for a project
const nftAddress = await readContract({
  address: CONTRACTS.launchpad.address,
  abi: CONTRACTS.launchpad.abi,
  functionName: 'getProjectNFT',
  args: [projectId]
});

// Query investment amount for a specific token
const amount = await readContract({
  address: nftAddress,
  abi: CONTRACTS.projectNFT.abi,
  functionName: 'getInvestmentAmount',
  args: [tokenId]
});
```

## Environment Configuration

### Required Environment Variables

Add to `app/.env.local`:

```bash
# Pinata IPFS Configuration
NEXT_PUBLIC_PINATA_JWT=your_jwt_token_here
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

### Getting Pinata API Keys

1. Sign up at [https://pinata.cloud](https://pinata.cloud)
2. Navigate to API Keys section
3. Create a new API key with:
   - **Permissions:** `pinFileToIPFS`, `pinJSONToIPFS`
   - Copy the JWT token
4. Add the JWT to your `.env.local` file

## Data Flow

### Project Creation with NFT

```
1. Creator fills project form + NFT configuration
   └─ Project info: title, description, goal, etc.
   └─ NFT info: name, description, image file

2. Frontend uploads NFT image to IPFS
   └─ Returns: ipfs://Qm.../image.png

3. Frontend creates metadata JSON
   {
     "name": "MyProject Backer NFT",
     "description": "Official backer NFT for MyProject",
     "image": "ipfs://Qm.../image.png"
   }

4. Frontend uploads metadata to IPFS
   └─ Returns: ipfs://Qm.../metadata.json

5. Frontend calls createProject() with metadata URI

6. Launchpad.sol deploys new ProjectNFT contract
   └─ Contract address stored in project struct

7. Project created successfully ✅
```

### Investment with NFT Minting

```
1. Backer calls fundProject(projectId, isAnonymous) with ETH

2. Launchpad.sol validates and processes payment

3. Launchpad.sol calls ProjectNFT.mintToBacker()
   └─ Parameters: backer address, investment amount

4. ProjectNFT mints token to backer's wallet
   └─ Stores investment amount on-chain
   └─ Uses shared metadata URI

5. NFTMinted event emitted

6. Backer receives NFT instantly ✅
   └─ Visible in MetaMask & OpenSea
   └─ Investment amount queryable on-chain
```

## Key Design Decisions

### Why On-Chain Investment Storage?

**Problem:** Creating unique metadata per investment would require:
- Uploading a new JSON file to IPFS for each backer
- Slow UX (15-30 seconds per investment)
- High gas costs

**Solution:** Store investment amount directly in the contract:
```solidity
mapping(uint256 tokenId => uint256 investmentAmount) private _investments;
```

**Benefits:**
✅ Instant NFT minting (no IPFS delays)
✅ Gas efficient
✅ Verifiable on-chain via `getInvestmentAmount()`
✅ All NFTs share the same visual metadata

### Why Deploy-Per-Project?

**Alternative:** Single NFT contract for all projects with complex token ID mapping

**Chosen:** Separate NFT contract per project

**Benefits:**
✅ Simpler implementation
✅ Each project has its own branded NFT collection
✅ Better separation of concerns
✅ More flexible for future features (royalties, custom logic)

## Testing

### Compile Contracts

```bash
cd contracts
npx hardhat compile
```

### Deploy to Base Sepolia

```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```

The Launchpad contract will automatically deploy ProjectNFT contracts as projects are created.

### Test on Frontend

1. Configure Pinata API keys in `.env.local`
2. Create a new project with NFT configuration
3. Invest in the project
4. Check your wallet for the minted NFT

## Viewing NFTs

### In MetaMask
1. Open MetaMask
2. Go to NFTs tab
3. Your backer NFT will appear automatically

### On OpenSea
1. Visit OpenSea Testnet: `https://testnets.opensea.io/`
2. Connect your wallet
3. Your NFTs will be listed under your profile

### Query Investment Amount

Use the `getInvestmentAmount(tokenId)` function to verify the on-chain investment amount for any NFT.

## Future Enhancements

Potential improvements for future iterations:

1. **Dynamic Metadata API**
   - Create an API endpoint that generates metadata on-the-fly
   - Include investment amount in the metadata JSON
   - Better marketplace compatibility

2. **NFT Tiers**
   - Different NFT artwork based on investment ranges
   - Bronze/Silver/Gold/Diamond tiers

3. **Utility Features**
   - Special access for NFT holders
   - Voting rights in project decisions
   - Royalties on secondary sales

4. **Batch Minting**
   - Allow multiple investments to be batched
   - Gas optimization

## Troubleshooting

### IPFS Upload Fails

**Error:** `Pinata upload failed`

**Solutions:**
- Verify your `NEXT_PUBLIC_PINATA_JWT` is correct
- Check Pinata account quota hasn't been exceeded
- Ensure image file is under 10MB
- Verify file format is JPEG, PNG, GIF, or WebP

### NFT Not Appearing in Wallet

**Possible Causes:**
- Transaction not confirmed yet (check BaseScan)
- Wallet needs manual NFT import
- Wrong network selected in wallet

**Solutions:**
- Wait for transaction confirmation
- Manually import NFT using contract address and token ID
- Ensure wallet is on Base Sepolia network

### Contract Deployment Gas Issues

**Error:** `out of gas` or similar

**Solutions:**
- Increase gas limit in transaction
- Check Base Sepolia has enough testnet ETH
- Wait and retry during lower network congestion

## File Reference

### Smart Contracts
- `/contracts/contracts/ProjectNFT.sol` - ERC-721 NFT contract
- `/contracts/contracts/Launchpad.sol` - Modified launchpad with NFT minting

### Frontend
- `/app/src/lib/ipfsService.ts` - IPFS upload utilities
- `/app/src/app/create/page.tsx` - Project creation form
- `/app/src/lib/contracts.ts` - Contract ABIs and addresses

### Configuration
- `/app/.env.example` - Environment variables template
- `/contracts/hardhat.config.ts` - Hardhat configuration

## Support

For issues or questions:
1. Check this documentation first
2. Review error messages in browser console
3. Check transaction on BaseScan for on-chain errors
4. Verify environment variables are configured correctly
