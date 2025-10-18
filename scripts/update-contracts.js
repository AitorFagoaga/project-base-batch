/**
 * Script to update frontend contract addresses and ABIs from deployment JSON
 */
const fs = require('fs');
const path = require('path');

const deploymentPath = path.join(__dirname, '../deployments/base-sepolia.json');
const contractsPath = path.join(__dirname, '../app/src/lib/contracts.ts');

// Read deployment info
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Generate contracts.ts content
const content = `/**
 * Contract addresses and ABIs for Base Sepolia deployment
 * Auto-generated from /deployments/base-sepolia.json
 * Last updated: ${new Date().toISOString()}
 */

export const CONTRACTS = {
  reputation: {
    address: "${deployment.contracts.Reputation.address}" as \`0x\${string}\`,
    abi: ${JSON.stringify(deployment.contracts.Reputation.abi, null, 2)} as const,
  },
  launchpad: {
    address: "${deployment.contracts.Launchpad.address}" as \`0x\${string}\`,
    abi: ${JSON.stringify(deployment.contracts.Launchpad.abi, null, 2)} as const,
  },
} as const;

export type ReputationABI = typeof CONTRACTS.reputation.abi;
export type LaunchpadABI = typeof CONTRACTS.launchpad.abi;
`;

// Write to contracts.ts
fs.writeFileSync(contractsPath, content, 'utf8');

console.log('✅ Updated app/src/lib/contracts.ts');
console.log(`   - Reputation: ${deployment.contracts.Reputation.address}`);
console.log(`   - Launchpad: ${deployment.contracts.Launchpad.address}`);
