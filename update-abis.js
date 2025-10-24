const fs = require('fs');
const path = require('path');

// Read the deployment file
const deploymentPath = path.join(__dirname, 'deployments', 'base-sepolia.json');
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Extract ABIs
const contracts = deployment.contracts;

// Function to format ABI for TypeScript
function formatABI(abi) {
  return `export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)} as const;`;
}

// Create Reputation ABI file
const reputationABI = formatABI(contracts.Reputation.abi);
fs.writeFileSync(
  path.join(__dirname, 'app', 'src', 'lib', 'abis', 'reputationABI.ts'),
  reputationABI
);
console.log('✅ Updated reputationABI.ts');

// Create Launchpad ABI file
const launchpadABI = formatABI(contracts.Launchpad.abi);
fs.writeFileSync(
  path.join(__dirname, 'app', 'src', 'lib', 'abis', 'launchpadABI.ts'),
  launchpadABI
);
console.log('✅ Updated launchpadABI.ts');

// Create UserProfile ABI file
const userProfileABI = formatABI(contracts.UserProfile.abi);
fs.writeFileSync(
  path.join(__dirname, 'app', 'src', 'lib', 'abis', 'userProfileABI.ts'),
  userProfileABI
);
console.log('✅ Updated userProfileABI.ts');

// Create EventManager ABI file
const eventManagerABI = formatABI(contracts.EventManager.abi);
fs.writeFileSync(
  path.join(__dirname, 'app', 'src', 'lib', 'abis', 'eventManagerABI.ts'),
  eventManagerABI
);
console.log('✅ Updated eventManagerABI.ts');

console.log('\n🎉 All ABIs updated successfully!');
