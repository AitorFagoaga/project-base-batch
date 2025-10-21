/**
 * Script para resetear el contador de proyectos del contrato Launchpad
 * ADVERTENCIA: Esto no borra los proyectos existentes, solo resetea el contador
 * Los proyectos viejos seguirán en la blockchain pero la app mostrará desde 0
 */

const hre = require("hardhat");

async function main() {
  console.log("⚠️  ADVERTENCIA: Este script solo puede ser ejecutado por el owner del contrato");
  console.log("");

  // Direcciones de los contratos en Base Sepolia
  const LAUNCHPAD_ADDRESS = "0x06AD960d6b070ba78973d40a6Cb54321ed02dF4b";
  
  // Obtener el contrato
  const Launchpad = await hre.ethers.getContractAt("Launchpad", LAUNCHPAD_ADDRESS);
  
  // Verificar el contador actual
  const currentCount = await Launchpad.projectCount();
  console.log(`📊 Contador actual de proyectos: ${currentCount}`);
  
  if (currentCount === 0n) {
    console.log("✅ El contador ya está en 0. No hay nada que resetear.");
    return;
  }
  
  console.log("");
  console.log("❌ ERROR: El contrato Launchpad actual NO tiene función para resetear proyectos.");
  console.log("");
  console.log("📋 Opciones disponibles:");
  console.log("");
  console.log("OPCIÓN 1 - REDESPLEGAR CONTRATO (Recomendado):");
  console.log("  1. Ejecuta: cd contracts");
  console.log("  2. Ejecuta: npx hardhat run scripts/deploy.ts --network base-sepolia");
  console.log("  3. Actualiza las direcciones en .env.local");
  console.log("  4. Ejecuta: node scripts/update-contracts.js");
  console.log("");
  console.log("OPCIÓN 2 - CONTINUAR CON PROYECTOS EXISTENTES:");
  console.log("  Los proyectos actuales quedarán en la blockchain.");
  console.log("  Simplemente crea nuevos proyectos que se sumarán a los existentes.");
  console.log("");
  console.log("OPCIÓN 3 - MODIFICAR CONTRATO (Avanzado):");
  console.log("  1. Agrega una función resetProjectCount() al contrato");
  console.log("  2. Redespliega el contrato");
  console.log("  3. Ejecuta esta función desde el script");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
