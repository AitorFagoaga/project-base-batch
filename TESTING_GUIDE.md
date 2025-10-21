# 🧪 Guía de Testing - Sistema de Inversiones Anónimas

## Pre-requisitos

Antes de comenzar el testing, asegúrate de:

- [ ] Haber redesplegado el contrato Launchpad con los cambios
- [ ] Tener el ABI actualizado en `app/src/lib/contracts.ts`
- [ ] Tener al menos 0.5 ETH en Base Sepolia para pruebas
- [ ] Tener 2-3 wallets diferentes para simular múltiples inversores

## 🚀 Plan de Testing

### Fase 1: Crear Proyecto de Prueba

1. **Conectar Wallet Principal**
   - Ir a http://localhost:3000
   - Conectar con wallet que tenga reputación

2. **Crear Proyecto**
   - Click en "Create Project"
   - Llenar formulario:
     - Title: "Proyecto Test - Inversiones Anónimas"
     - Description: "Este es un proyecto para probar el sistema de inversiones"
     - Goal: 1 ETH
     - Duration: 30 días
   - Submit y esperar confirmación

3. **Verificar Proyecto Creado**
   - Navegar a la página del proyecto
   - Verificar que el historial de inversores esté vacío
   - Debe mostrar: "📭 No hay inversores aún"

### Fase 2: Inversión Pública (Con Identidad)

1. **Preparar Primera Inversión**
   - Usar wallet con buena reputación (50+ pts)
   - Navegar al proyecto creado

2. **Realizar Inversión Pública**
   - Ingresar monto: 0.1 ETH
   - **NO** marcar checkbox "Contribución Anónima"
   - Click en "Contribuir Ahora"
   - Aprobar en MetaMask
   - Esperar confirmación

3. **Verificar en Historial**
   - Debe aparecer tu dirección
   - Debe mostrar tu avatar
   - Debe mostrar tu badge de reputación
   - Debe mostrar "0.1 ETH"

**✅ Checklist:**
- [ ] Dirección visible y correcta
- [ ] Badge de reputación correcto
- [ ] Monto correcto
- [ ] Color indigo en border
- [ ] Hover effect funciona

### Fase 3: Inversión Anónima

1. **Cambiar a Segunda Wallet**
   - Desconectar wallet actual
   - Conectar con otra wallet

2. **Realizar Inversión Anónima**
   - Navegar al mismo proyecto
   - Ingresar monto: 0.2 ETH
   - **SÍ** marcar checkbox "Contribución Anónima"
   - Click en "Contribuir Ahora"
   - Aprobar en MetaMask
   - Esperar confirmación

3. **Verificar en Historial**
   - Debe aparecer "Inversor Anónimo"
   - Avatar debe ser "❓"
   - NO debe mostrar dirección
   - NO debe mostrar reputación
   - Debe mostrar "0.2 ETH"

**✅ Checklist:**
- [ ] Texto "Inversor Anónimo" visible
- [ ] Avatar es ❓
- [ ] NO se ve dirección
- [ ] NO se ve reputación
- [ ] Monto correcto
- [ ] Color gris en background

### Fase 4: Múltiples Inversiones

1. **Tercera Inversión (Pública, baja reputación)**
   - Cambiar a wallet con 0-10 pts de reputación
   - Invertir 0.05 ETH
   - NO marcar anónimo
   - Verificar badge "Newcomer"

2. **Cuarta Inversión (Anónima)**
   - Cambiar a cuarta wallet
   - Invertir 0.15 ETH
   - SÍ marcar anónimo
   - Verificar que aparece como anónimo

3. **Quinta Inversión (Pública, alta reputación)**
   - Usar wallet con 200+ pts
   - Invertir 0.3 ETH
   - NO marcar anónimo
   - Verificar badge "Expert" o "Legend"

**Orden esperado en historial:**
```
1. [👑 Legend/⭐ Expert] 0.3 ETH (alta reputación)
2. [Badge correspondiente] 0.1 ETH (primera inversión)
3. ❓ Anónimo - 0.2 ETH
4. ❓ Anónimo - 0.15 ETH
5. [🌱 Newcomer] 0.05 ETH
```

### Fase 5: Edge Cases

#### Test 5.1: Invertir Múltiples Veces con la Misma Wallet

1. Volver a wallet de Fase 2
2. Hacer segunda inversión: 0.05 ETH
3. Marcar como anónimo esta vez
4. **Resultado esperado:**
   - Solo aparece UNA vez en el historial
   - El monto se actualiza: 0.15 ETH total
   - La flag de anonimato puede cambiar

**⚠️ Nota:** El flag de anonimato se actualiza con cada nueva inversión

#### Test 5.2: Inversión Mínima

1. Intentar invertir 0.0001 ETH
2. Sin marcar anónimo
3. **Resultado esperado:**
   - Transacción exitosa
   - Aparece en historial con monto pequeño

#### Test 5.3: Proyecto Sin Fondos

1. Crear nuevo proyecto
2. NO invertir nada
3. **Resultado esperado:**
   - Mensaje "📭 No hay inversores aún"
   - No hay errores en consola

### Fase 6: Verificación On-Chain

#### Verificar en BaseScan

1. **Obtener dirección del contrato:**
   - Abrir `app/src/lib/contracts.ts`
   - Copiar dirección de `launchpad.address`

2. **Ir a BaseScan:**
   - https://sepolia.basescan.org
   - Buscar la dirección del contrato

3. **Verificar Eventos:**
   - Ir a pestaña "Events"
   - Buscar eventos "ContributionMade"
   - Verificar que incluyen parámetro `isAnonymous`

4. **Llamar funciones Read:**
   - `getContributors(projectId)` → Debe retornar array de addresses
   - `isContributionAnonymous(projectId, address)` → Debe retornar true/false
   - `getContribution(projectId, address)` → Debe retornar monto correcto

### Fase 7: Responsive Testing

#### Desktop (1920x1080)
- [ ] Historial se ve en grid de 1 columna
- [ ] Avatares alineados a la izquierda
- [ ] Montos alineados a la derecha
- [ ] Todo legible y espaciado

#### Tablet (768x1024)
- [ ] Historial mantiene mismo diseño
- [ ] Textos se leen bien
- [ ] No hay overflow horizontal

#### Mobile (375x667)
- [ ] Direcciones se truncan correctamente
- [ ] Badges se ajustan
- [ ] Checkbox de anonimato usa todo el ancho
- [ ] Botones de inversión son tappable

## 🐛 Bugs Conocidos a Verificar

### Bug Potencial #1: Estado de Anonimato
**Descripción:** Si un usuario invierte primero como público y luego como anónimo, ¿qué pasa?

**Test:**
1. Invertir 0.1 ETH como público
2. Invertir 0.1 ETH más como anónimo
3. **Verificar:** Solo aparece una vez, monto total 0.2 ETH
4. **Estado final:** Anónimo (última inversión gana)

### Bug Potencial #2: Ordenamiento
**Descripción:** ¿Los inversores están ordenados por reputación?

**Test:**
1. Verificar orden en historial
2. **Esperado:** Alta reputación primero, baja al final
3. **Anónimos:** Al final de la lista

### Bug Potencial #3: Carga de Reputación
**Descripción:** ¿La reputación se carga correctamente para cada inversor?

**Test:**
1. Verificar que cada badge sea correcto
2. Verificar que los puntos coincidan con el perfil del usuario
3. Si tarda mucho, verificar que no haya llamadas duplicadas

## 📊 Métricas a Registrar

Durante el testing, anota:

```
Proyecto ID: _________
Total ETH recaudado: _________
Número total de inversores: _________
  - Públicos: _________ ( _____% )
  - Anónimos: _________ ( _____% )

Inversión más grande: _________ ETH
Inversión más pequeña: _________ ETH
Reputación promedio (públicos): _________ pts

Tiempo de carga historial: _________ seg
Gas usado por inversión: _________ wei
```

## ✅ Checklist Final

Antes de dar por terminado el testing:

- [ ] Al menos 5 inversiones de prueba
- [ ] Al menos 2 inversiones anónimas
- [ ] Al menos 3 inversiones públicas con diferentes reputaciones
- [ ] Verificado en BaseScan
- [ ] Probado en mobile, tablet y desktop
- [ ] Sin errores en consola del navegador
- [ ] Sin warnings de React
- [ ] Transacciones exitosas en MetaMask
- [ ] UI responsive y bonita
- [ ] Datos correctos en historial

## 🎉 Testing Completado

Si todos los checks están ✅, el sistema está listo para producción!

### Siguiente Paso:

Documenta cualquier bug encontrado en GitHub Issues con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica
- Logs de consola
