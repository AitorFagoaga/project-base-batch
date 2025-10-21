# Instrucciones para Actualizar el Contrato Launchpad

## Cambios Realizados

Se ha actualizado el contrato `Launchpad.sol` para incluir funcionalidad de inversiones anónimas e historial de contribuyentes.

### Modificaciones en el Contrato:

1. **Nuevos Mappings**:
   - `mapping(uint256 => address[]) private _contributors` - Lista de contribuyentes por proyecto
   - `mapping(uint256 => mapping(address => bool)) private _isAnonymous` - Flag de anonimato por contribución

2. **Evento Actualizado**:
   - `ContributionMade` ahora incluye parámetro `bool isAnonymous`

3. **Nuevas Funciones View**:
   - `getContributors(uint256 projectId)` - Retorna lista de addresses que contribuyeron
   - `isContributionAnonymous(uint256 projectId, address backer)` - Verifica si una contribución es anónima

4. **Función Modificada**:
   - `fundProject(uint256 projectId, bool isAnonymous)` - Ahora acepta parámetro de anonimato

## Pasos para Redesplegar:

### 1. Compilar el Contrato Actualizado

```bash
cd contracts
npm run compile
```

### 2. Actualizar el Script de Deploy

El script de deploy ya debería funcionar, pero verifica que use el contrato actualizado.

### 3. Redesplegar en Base Sepolia

```bash
npm run deploy:base-sepolia
```

### 4. Actualizar el ABI en el Frontend

Después del deploy, el script automáticamente debería actualizar:
- `app/src/lib/contracts.ts` con la nueva dirección y ABI

### 5. Verificar las Nuevas Funciones

Usa un explorador de bloques o Remix para verificar que las nuevas funciones estén disponibles:
- `getContributors(uint256)`
- `isContributionAnonymous(uint256, address)`
- `fundProject(uint256, bool)` con el nuevo parámetro

## Cambios en el Frontend Implementados:

✅ **FundForm.tsx**:
- Checkbox para seleccionar "Contribución Anónima"
- Pasa el parámetro `isAnonymous` a `fundProject()`

✅ **ContributorsHistory.tsx** (Nuevo componente):
- Muestra lista de inversores ordenada
- Para inversores anónimos: Muestra avatar con "?" y solo el monto
- Para inversores públicos: Muestra avatar, dirección, reputación y monto
- Badge de reputación (Legend, Expert, Builder, etc.)

✅ **project/[id]/page.tsx**:
- Integra el componente `ContributorsHistory`
- Se muestra debajo de la descripción del proyecto

## Notas Importantes:

1. **Migración de Datos**: Este es un cambio que requiere redesplegar el contrato. Los proyectos existentes NO tendrán historial de contribuyentes retroactivo.

2. **Gas Costs**: La nueva funcionalidad añade un pequeño costo de gas adicional por:
   - Almacenar la dirección en el array de contributors (primera vez)
   - Almacenar el flag de anonimato

3. **Testing**: Antes de usar en producción:
   - Crear un proyecto de prueba
   - Hacer contribuciones anónimas y públicas
   - Verificar que el historial se muestre correctamente
   - Verificar que los montos coincidan

## Rollback (Si es necesario):

Si necesitas revertir los cambios:

1. Revertir `Launchpad.sol` a la versión anterior
2. Redesplegar el contrato antiguo
3. Actualizar `contracts.ts` con la dirección del contrato anterior
4. Remover el checkbox de anonimato en `FundForm.tsx`
5. Remover el componente `ContributorsHistory` de la página del proyecto
