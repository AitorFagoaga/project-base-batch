# Actualización del Sistema de Medallas y Reputación

## Cambios Implementados

### 1. **Tokens Seguros para QR** 🔐
- Los QR ahora generan tokens únicos e impredecibles
- URL format: `/claim/{base64Token}` donde token = `eventId:medalId:randomString`
- La página de reclamación carga datos del evento y medalla desde el contrato

### 2. **Restricción de Auto-Reclamación** 🚫
- El creador del evento NO puede reclamar sus propias medallas
- Validación en ambas funciones: `claimMedal()` y `awardMedal()`
- Error: `"Creator cannot claim own medals"` / `"Creator cannot receive own medals"`

### 3. **Integración con Reputación** ⭐
- Las medallas ahora otorgan puntos de reputación automáticamente
- Los puntos aparecen en el historial con formato: `"NombreMedalla - NombreEvento"`
- Categoría visible en el perfil del usuario

## Pasos para Redesplegar

### Opción A: Redesplegar Solo EventManager (Recomendado)

1. **Compilar contratos**:
   ```bash
   cd contracts
   npx hardhat compile
   ```

2. **Redesplegar EventManager**:
   ```bash
   npx hardhat run scripts/deploy.ts --network base-sepolia
   ```
   
   Esto creará un nuevo contrato EventManager con:
   - Constructor actualizado: `constructor(address initialAdmin, address _reputation)`
   - Integración con Reputation

3. **Otorgar permisos al EventManager**:
   ```bash
   npx hardhat run scripts/grant-eventmanager-admin.ts --network base-sepolia
   ```
   
   Esto otorga el `ADMIN_ROLE` del contrato Reputation al EventManager para que pueda otorgar puntos.

4. **Actualizar dirección en el frontend**:
   - Copiar la nueva dirección de EventManager
   - Actualizar en `app/.env.local`:
     ```
     NEXT_PUBLIC_EVENT_MANAGER_ADDRESS=0xNUEVA_DIRECCION
     ```

5. **Migrar eventos existentes** (si es necesario):
   - Los eventos antiguos no se migran automáticamente
   - Opción 1: Pedir a los usuarios que vuelvan a crear eventos
   - Opción 2: Crear un script de migración manual

### Opción B: Mantener Contrato Actual y Actualizarlo

Si NO quieres perder los eventos existentes:

1. **Agregar función de actualización**:
   El contrato actual NO tiene función para actualizar la dirección de Reputation.
   
2. **Redesplegar es necesario** porque:
   - El constructor cambió (ahora requiere dirección de Reputation)
   - No hay función `setReputationContract()` en el contrato actual

## Verificación

Después del redespliegue:

1. **Verificar en Basescan**:
   ```
   https://sepolia.basescan.org/address/NUEVA_DIRECCION
   ```

2. **Probar en frontend**:
   - Crear un evento de prueba
   - Aprobar el evento (como admin)
   - Generar QR de medalla
   - Escanear y reclamar
   - Verificar puntos de reputación en perfil

3. **Verificar historial de reputación**:
   - Ir a `/reputation`
   - Buscar la entrada con categoría "NombreMedalla - NombreEvento"

## Archivos Modificados

### Contratos:
- ✅ `contracts/EventManager.sol`
  - Agregado import de interfaz `IReputation`
  - Constructor actualizado con parámetro `_reputation`
  - Función `setReputationContract()` para actualizar dirección
  - `claimMedal()` ahora otorga puntos
  - `awardMedal()` ahora otorga puntos
  - Validaciones para evitar auto-reclamación

### Scripts:
- ✅ `contracts/scripts/deploy.ts` - Pasa dirección de Reputation al constructor
- ✅ `contracts/scripts/grant-eventmanager-admin.ts` - Otorga permisos

### Frontend:
- ✅ `app/src/app/claim/[token]/page.tsx` - Página de reclamación con token
- ✅ `app/src/components/MedalQR.tsx` - Genera tokens seguros

## Notas Importantes

⚠️ **Los eventos del contrato antiguo NO funcionarán con el nuevo contrato**
- Razón: Las medallas están vinculadas al contrato EventManager específico
- Solución: Recrear eventos importantes en el nuevo contrato

✅ **Los puntos de reputación anteriores se mantienen**
- El contrato Reputation no cambia
- Solo se agrega EventManager como admin

🔐 **Seguridad mejorada**
- Tokens QR ahora son impredecibles
- Creadores no pueden auto-asignarse medallas
- Historial de reputación auditable
