// Verificación rápida de direcciones de contratos
console.log("=== VERIFICACIÓN DE DIRECCIONES ===\n");

// Leer .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'app', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log("📄 Direcciones en .env.local:");
const eventManagerMatch = envContent.match(/NEXT_PUBLIC_EVENT_MANAGER_ADDRESS=(.+)/);
if (eventManagerMatch) {
  console.log("   EventManager:", eventManagerMatch[1]);
}

console.log("\n⚠️  IMPORTANTE:");
console.log("   Si el servidor de Next.js está corriendo, necesitas reiniciarlo:");
console.log("   1. Presiona Ctrl+C en la terminal donde corre 'npm run dev'");
console.log("   2. Ejecuta: cd app && npm run dev");
console.log("\n✅ Después de reiniciar, las medallas deberían funcionar correctamente.");
