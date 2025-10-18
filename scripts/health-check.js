#!/usr/bin/env node

/**
 * Health check script - Verifica que todo esté configurado correctamente
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración del Launchpad...\n');

let errors = 0;
let warnings = 0;

// 1. Verificar .env
console.log('1️⃣  Verificando archivo .env...');
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('NEXT_PUBLIC_REPUTATION_ADDRESS=0x')) {
    console.log('   ✅ Reputation address configurada');
  } else {
    console.log('   ❌ Reputation address no configurada');
    errors++;
  }
  
  if (envContent.includes('NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0x')) {
    console.log('   ✅ Launchpad address configurada');
  } else {
    console.log('   ❌ Launchpad address no configurada');
    errors++;
  }
} else {
  console.log('   ❌ Archivo .env no encontrado');
  errors++;
}

// 2. Verificar deployment info
console.log('\n2️⃣  Verificando deployment info...');
const deploymentPath = path.join(__dirname, '../deployments/base-sepolia.json');
if (fs.existsSync(deploymentPath)) {
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log('   ✅ Deployment file encontrado');
  console.log(`   📍 Reputation: ${deployment.contracts.Reputation.address}`);
  console.log(`   📍 Launchpad: ${deployment.contracts.Launchpad.address}`);
  console.log(`   📅 Deployed at: ${deployment.deployedAt}`);
} else {
  console.log('   ⚠️  Deployment file no encontrado');
  warnings++;
}

// 3. Verificar contracts.ts
console.log('\n3️⃣  Verificando ABIs en frontend...');
const contractsPath = path.join(__dirname, '../app/src/lib/contracts.ts');
if (fs.existsSync(contractsPath)) {
  const contractsContent = fs.readFileSync(contractsPath, 'utf8');
  
  if (contractsContent.includes('0x66f8E781f0b714717c7B53dEa1acF7247b4B913b')) {
    console.log('   ✅ ABIs actualizados con direcciones reales');
  } else {
    console.log('   ⚠️  ABIs podrían necesitar actualización');
    console.log('   💡 Ejecuta: node scripts/update-contracts.js');
    warnings++;
  }
} else {
  console.log('   ❌ contracts.ts no encontrado');
  errors++;
}

// 4. Verificar node_modules
console.log('\n4️⃣  Verificando dependencias...');
const nodeModulesPath = path.join(__dirname, '../node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules instalado');
} else {
  console.log('   ❌ node_modules no encontrado');
  console.log('   💡 Ejecuta: npm install');
  errors++;
}

// 5. Verificar archivos críticos
console.log('\n5️⃣  Verificando archivos críticos...');
const criticalFiles = [
  '../contracts/contracts/Reputation.sol',
  '../contracts/contracts/Launchpad.sol',
  '../app/src/app/page.tsx',
  '../app/src/app/create/page.tsx',
  '../app/src/components/ProjectCard.tsx',
  '../app/next.config.js',
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} no encontrado`);
    errors++;
  }
});

// Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN');
console.log('='.repeat(60));

if (errors === 0 && warnings === 0) {
  console.log('\n🎉 ¡TODO PERFECTO! Tu proyecto está listo.\n');
  console.log('Próximos pasos:');
  console.log('  1. Abre http://localhost:3000 en tu navegador');
  console.log('  2. Conecta tu wallet a Base Sepolia');
  console.log('  3. Crea un proyecto de prueba\n');
} else {
  if (errors > 0) {
    console.log(`\n❌ ${errors} error(es) encontrado(s)`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} advertencia(s)`);
  }
  
  console.log('\n💡 Acciones recomendadas:');
  if (errors > 0) {
    console.log('  - Revisa RESUMEN-OPTIMIZACIONES.md para troubleshooting');
    console.log('  - Ejecuta: npm install');
  }
  if (warnings > 0) {
    console.log('  - Ejecuta: node scripts/update-contracts.js');
  }
  console.log('');
}

process.exit(errors > 0 ? 1 : 0);
