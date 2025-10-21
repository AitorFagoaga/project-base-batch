# 🗑️ Cómo Borrar/Resetear Proyectos

## 🎯 Solución Rápida Recomendada

La forma más fácil de empezar desde cero es **redesplegar los contratos**:

### Paso 1: Redesplegar Contratos

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network base-sepolia
```

Esto te dará nuevas direcciones de contratos limpias.

### Paso 2: Actualizar .env.local

Copia las nuevas direcciones que te dio el deploy y actualiza `app/.env.local`:

```env
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_REPUTATION_ADDRESS=0xNUEVA_DIRECCION_REPUTATION
NEXT_PUBLIC_USER_PROFILE_ADDRESS=0xNUEVA_DIRECCION_USER_PROFILE
NEXT_PUBLIC_LAUNCHPAD_ADDRESS=0xNUEVA_DIRECCION_LAUNCHPAD
```

### Paso 3: Actualizar ABIs en el Frontend

```bash
node scripts/update-contracts.js
```

### Paso 4: Reiniciar el Servidor

```bash
cd app
npm run dev
```

¡Listo! Ahora tendrás contratos completamente nuevos sin proyectos antiguos.

---

## 📝 Notas Importantes

### ¿Por qué redesplegar?

El contrato Launchpad actual **NO tiene función para borrar proyectos**. Por seguridad y diseño blockchain:

- ❌ No se pueden "borrar" datos de la blockchain
- ❌ No hay función `deleteProject()` o `resetProjects()`
- ✅ La única forma es desplegar contratos nuevos

### Ventajas de Redesplegar:

- ✅ Estado completamente limpio
- ✅ Contador de proyectos en 0
- ✅ Sin proyectos antiguos
- ✅ Nuevas direcciones de contratos
- ✅ Rápido y simple

### Datos que se Pierden:

- ⚠️ Todos los proyectos anteriores
- ⚠️ Todas las contribuciones anteriores
- ⚠️ Los perfiles de usuario se mantienen (diferente contrato)
- ⚠️ La reputación se reinicia si redespliega Reputation.sol

---

## 🔄 Alternativa: Solo Redesplegar Launchpad

Si quieres mantener perfiles y reputación pero empezar con proyectos limpios:

### Opción: Redesplegar Solo Launchpad

1. **Modifica deploy.ts** para solo desplegar Launchpad:

```typescript
// En contracts/scripts/deploy.ts
// Comenta estos deploys:
// const reputation = await ReputationFactory.deploy(...);
// const userProfile = await UserProfileFactory.deploy();

// Solo despliega Launchpad con las direcciones EXISTENTES:
const EXISTING_REPUTATION = "0x66f8E781f0b714717c7B53dEa1acF7247b4B913b";
const launchpad = await LaunchpadFactory.deploy(EXISTING_REPUTATION);
```

2. **Despliega**:
```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```

3. **Actualiza solo LAUNCHPAD_ADDRESS** en `.env.local`

4. **Actualiza ABIs**:
```bash
node scripts/update-contracts.js
```

Esto mantiene:
- ✅ Reputación existente
- ✅ Perfiles existentes
- ✅ Proyectos limpios (0)

---

## 🛠️ Si Prefieres Modificar el Contrato

### Agregar Función de Reset (No Recomendado)

Si realmente quieres una función para resetear, puedes modificar `Launchpad.sol`:

```solidity
// Agregar función solo para owner
function resetProjectCount() external onlyOwner {
    projectCount = 0;
}
```

Pero esto **NO borra** proyectos existentes, solo resetea el contador. Los proyectos viejos seguirán en la blockchain.

---

## 💡 Recomendación Final

**Para desarrollo**: Redespliega todos los contratos frecuentemente
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network base-sepolia
```

**Para producción**: Los proyectos son permanentes, no se pueden borrar

---

## 🚀 Script de Deploy Rápido

He creado un script en `contracts/scripts/reset-projects.js` que te explica las opciones, pero la **mejor opción es redesplegar**.

Ejecuta:
```bash
cd contracts
node scripts/reset-projects.js
```

Para ver todas las opciones disponibles.
