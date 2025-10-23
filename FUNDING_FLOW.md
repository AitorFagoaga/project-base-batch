# 💰 FLUJO DE INVERSIÓN - Meritocratic Launchpad

## ⚠️ **IMPORTANTE: SISTEMA ACTUAL**

El sistema **NO tiene reembolsos** en esta versión (MVP). Es un modelo "All-or-Nothing" (Todo o Nada).

---

## 📊 ¿Cómo funciona la inversión?

### 🎯 **ESCENARIO 1: Proyecto alcanza su objetivo** ✅

```
1. CREACIÓN DEL PROYECTO
   ├─ Creador establece: Meta (ej: 1 ETH) y Deadline (ej: 30 días)
   └─ Proyecto abierto para inversiones

2. FASE DE INVERSIÓN (antes del deadline)
   ├─ Inversor A invierte: 0.3 ETH → Recibe NFT de Backer
   ├─ Inversor B invierte: 0.5 ETH → Recibe NFT de Backer
   └─ Inversor C invierte: 0.4 ETH → Recibe NFT de Backer
   Total recaudado: 1.2 ETH ✅ (Meta alcanzada!)

3. DESPUÉS DEL DEADLINE
   ├─ Creador llama a claimFunds(projectId)
   ├─ Validaciones:
   │  ✓ Deadline pasado
   │  ✓ Meta alcanzada (1.2 ETH ≥ 1 ETH)
   │  ✓ Fondos no reclamados previamente
   └─ Transferencia: 1.2 ETH → Wallet del Creador

4. RESULTADO
   ├─ Creador: Recibe 1.2 ETH para desarrollar el proyecto
   ├─ Inversores: Conservan NFTs (prueba de inversión)
   └─ Estado: claimed = true
```

**💡 Beneficios para inversores:**
- NFT único que prueba su inversión
- Reputación ganada (1 punto por cada 0.001 ETH)
- Satisfacción de apoyar un proyecto exitoso
- **NO hay devolución de ETH** (es donación/inversión)

---

### ❌ **ESCENARIO 2: Proyecto NO alcanza su objetivo** 

```
1. CREACIÓN DEL PROYECTO
   ├─ Creador establece: Meta (ej: 1 ETH) y Deadline (ej: 30 días)
   └─ Proyecto abierto para inversiones

2. FASE DE INVERSIÓN (antes del deadline)
   ├─ Inversor A invierte: 0.2 ETH → Recibe NFT de Backer
   └─ Inversor B invierte: 0.3 ETH → Recibe NFT de Backer
   Total recaudado: 0.5 ETH ❌ (Meta NO alcanzada)

3. DESPUÉS DEL DEADLINE
   ├─ Creador intenta llamar claimFunds(projectId)
   └─ ❌ TRANSACCIÓN REVIERTE con error: "GoalNotReached"

4. RESULTADO ACTUAL (MVP)
   ├─ Creador: NO puede reclamar fondos (0 ETH recibidos)
   ├─ Inversores: Conservan NFTs pero PIERDEN el ETH invertido 💔
   └─ Fondos: Quedan BLOQUEADOS en el contrato permanentemente
```

**⚠️ PROBLEMA CRÍTICO:**
- **Los inversores pierden su dinero** si el proyecto no alcanza la meta
- **No hay función de reembolso** implementada
- **El ETH queda atrapado** en el contrato sin forma de recuperarlo

---

## 🔧 **Funciones del Contrato**

### ✅ Funciones Disponibles

```solidity
// INVERSIÓN
fundProject(projectId, isAnonymous) payable
  → Permite invertir ETH en un proyecto activo
  → Mintea NFT automáticamente al inversor
  → Da reputación: 1 punto por cada 0.001 ETH

// RECLAMAR FONDOS (solo creador)
claimFunds(projectId) nonReentrant
  → Requiere: deadline pasado + meta alcanzada
  → Transfiere TODO el ETH al creador
  → Marca el proyecto como claimed = true

// ELIMINAR PROYECTO (solo creador)
deleteProject(projectId)
  → Solo si NO se alcanzó la meta
  → Elimina el proyecto del mapping
  → ⚠️ NO devuelve fondos a inversores
```

### ❌ Funciones NO Implementadas

```solidity
// NO EXISTE: refundBacker()
// NO EXISTE: withdrawInvestment()
// NO EXISTE: claimRefund()
```

---

## 🚨 **RIESGOS ACTUALES**

| Escenario | Creador | Inversor | ETH |
|-----------|---------|----------|-----|
| ✅ Meta alcanzada | Recibe todo el ETH | Pierde ETH, gana NFT | Va al creador |
| ❌ Meta NO alcanzada | NO recibe nada | Pierde ETH, gana NFT | **BLOQUEADO EN CONTRATO** |
| 🗑️ Proyecto eliminado | Puede eliminar | Pierde ETH, gana NFT | **BLOQUEADO EN CONTRATO** |

---

## 💡 **RECOMENDACIONES URGENTES**

### 🔴 Opción 1: Añadir Sistema de Reembolsos

```solidity
// NUEVA FUNCIÓN A IMPLEMENTAR
function refundBacker(uint256 projectId) external nonReentrant {
    Project storage project = _projects[projectId];
    
    // Validaciones
    require(block.timestamp >= project.deadline, "Campaign still active");
    require(project.fundsRaised < project.goal, "Goal was reached");
    require(!project.claimed, "Funds already claimed");
    
    uint256 contribution = _contributions[projectId][msg.sender];
    require(contribution > 0, "No contribution found");
    
    // Marcar como devuelto
    _contributions[projectId][msg.sender] = 0;
    
    // Transferir ETH de vuelta
    (bool success, ) = payable(msg.sender).call{value: contribution}("");
    require(success, "Refund failed");
    
    emit RefundProcessed(projectId, msg.sender, contribution);
}
```

### 🟡 Opción 2: Documentar Claramente el Riesgo

Añadir advertencias en:
- Página de inversión
- Modal de confirmación
- README y documentación

**Mensaje sugerido:**
> ⚠️ **ATENCIÓN**: Esta es una inversión/donación sin garantía de reembolso. Si el proyecto no alcanza su meta, los fondos quedarán bloqueados y no podrán ser recuperados. Invierte solo lo que estés dispuesto a perder.

### 🟢 Opción 3: Implementar Reembolso Automático

```solidity
// Al reclamar, si NO se alcanzó la meta, devolver a todos
function processFailedCampaign(uint256 projectId) external {
    // Solo ejecutable después del deadline
    // Si meta no alcanzada, devolver a cada contributor
    // Iterar sobre _contributors[projectId] y devolver
}
```

---

## 📝 **ESTADO ACTUAL DEL CÓDIGO**

### Comentario en el Contrato (línea 11):

```solidity
/**
 * @dev MVP: No refunds, all-or-nothing funding, single claim post-deadline
 */
```

Este comentario **confirma** que:
- ❌ NO hay reembolsos
- ✅ Es "all-or-nothing" (todo o nada)
- ✅ Solo una reclamación post-deadline

---

## 🎯 **RESUMEN EJECUTIVO**

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué pasa si se alcanza la meta? | Creador reclama TODO el ETH ✅ |
| ¿Qué pasa si NO se alcanza la meta? | ETH queda BLOQUEADO, nadie lo recibe ❌ |
| ¿Los inversores recuperan su dinero? | **NO**, en ningún escenario 💔 |
| ¿Qué reciben los inversores? | NFT + Reputación (sin valor monetario) 🎨 |
| ¿Es esto seguro para inversores? | **NO**, riesgo de pérdida total 🚨 |
| ¿Qué se debe hacer? | **Implementar reembolsos URGENTE** 🔧 |

---

## 🛠️ **PRÓXIMOS PASOS RECOMENDADOS**

1. **Inmediato**: Añadir advertencia clara en la UI
2. **Corto plazo**: Implementar función de reembolso
3. **Mediano plazo**: Añadir tests de reembolso
4. **Largo plazo**: Considerar escrow automático con Chainlink

---

**Documentado el**: 23 de Octubre, 2025  
**Versión del contrato**: Launchpad.sol (MVP)  
**Estado**: ⚠️ Sistema sin reembolsos - RIESGO ALTO para inversores
