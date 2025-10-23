/**
 * Script to update frontend contract addresses and ABIs from deployment JSON
 */
const fs = require('fs');
const path = require('path');

const deploymentPath = path.join(__dirname, '../deployments/base-sepolia.json');
const contractsPath = path.join(__dirname, '../app/src/lib/contracts.ts');

// Read deployment info
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// ProjectNFT template (static - not from deployment)
const projectNFTTemplate = {
  type: "template",
  abi: [
    {
      "type": "function",
      "name": "mintToBacker",
      "inputs": [
        { "name": "backer", "type": "address" },
        { "name": "investmentAmount", "type": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getInvestmentAmount",
      "inputs": [{ "name": "tokenId", "type": "uint256" }],
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "totalSupply",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "baseURI",
      "inputs": [],
      "outputs": [{ "name": "", "type": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "tokensOfOwner",
      "inputs": [{ "name": "owner", "type": "address" }],
      "outputs": [{ "name": "", "type": "uint256[]" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "ownerOf",
      "inputs": [{ "name": "tokenId", "type": "uint256" }],
      "outputs": [{ "name": "", "type": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "tokenURI",
      "inputs": [{ "name": "tokenId", "type": "uint256" }],
      "outputs": [{ "name": "", "type": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "NFTMinted",
      "inputs": [
        { "name": "backer", "type": "address", "indexed": true },
        { "name": "tokenId", "type": "uint256", "indexed": true },
        { "name": "investmentAmount", "type": "uint256", "indexed": false }
      ]
    }
  ]
};

// Generate contracts.ts content
const content = `/**
 * Contract addresses and ABIs for Base Sepolia deployment
 * Auto-generated from /deployments/base-sepolia.json
 * Last updated: ${new Date().toISOString()}
 */

export const CONTRACTS = {
  projectNFT: {
    // This is a template ABI - actual NFT contract addresses are created per project
    address: "0x0000000000000000000000000000000000000000" as \`0x\${string}\`,
    abi: ${JSON.stringify(projectNFTTemplate.abi, null, 2)} as const,
  },
  reputation: {
    address: "${deployment.contracts.Reputation.address}" as \`0x\${string}\`,
    abi: ${JSON.stringify(deployment.contracts.Reputation.abi, null, 2)} as const,
  },
  launchpad: {
    address: "${deployment.contracts.Launchpad.address}" as \`0x\${string}\`,
    abi: ${JSON.stringify(deployment.contracts.Launchpad.abi, null, 2)} as const,
  },
  userProfile: {
    address: "${deployment.contracts.UserProfile.address}" as \`0x\${string}\`,
    abi: ${JSON.stringify(deployment.contracts.UserProfile.abi, null, 2)} as const,
  },
  eventManager: {
    address: "${deployment.contracts.EventManager.address}" as \`0x\${string}\`,
    abi: ${JSON.stringify(deployment.contracts.EventManager.abi, null, 2)} as const,
  },
} as const;

export type ProjectNFTABI = typeof CONTRACTS.projectNFT.abi;
export type ReputationABI = typeof CONTRACTS.reputation.abi;
export type LaunchpadABI = typeof CONTRACTS.launchpad.abi;
export type UserProfileABI = typeof CONTRACTS.userProfile.abi;
export type EventManagerABI = typeof CONTRACTS.eventManager.abi;
`;

// Write to contracts.ts
fs.writeFileSync(contractsPath, content, 'utf8');

console.log('✅ Updated app/src/lib/contracts.ts');
console.log(`   - Reputation: ${deployment.contracts.Reputation.address}`);
console.log(`   - Launchpad: ${deployment.contracts.Launchpad.address}`);
console.log(`   - UserProfile: ${deployment.contracts.UserProfile.address}`);
console.log(`   - EventManager: ${deployment.contracts.EventManager.address}`);
