const fs = require('fs');
const path = require('path');

// Read the deployment file
const deploymentPath = path.join(__dirname, 'deployments', 'base-sepolia.json');
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Generate contracts.ts content
const content = `/**
 * Contract addresses and ABIs for Base Sepolia deployment
 * Auto-generated from /deployments/base-sepolia.json
 * Last updated: ${deployment.deployedAt}
 * Owner: ${deployment.deployer}
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
const outputPath = path.join(__dirname, 'app', 'src', 'lib', 'contracts.ts');
fs.writeFileSync(outputPath, content);

console.log('✅ contracts.ts updated successfully!');
console.log('📍 Location:', outputPath);
console.log('📝 New Reputation address:', deployment.contracts.Reputation.address);
console.log('📝 New Launchpad address:', deployment.contracts.Launchpad.address);
