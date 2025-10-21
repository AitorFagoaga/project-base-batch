#!/bin/bash

# Script para redesplegar el contrato Launchpad con nuevas funcionalidades
# Sistema de inversiones anónimas e historial de contribuyentes

echo "🚀 Iniciando proceso de redespliegue del contrato Launchpad..."
echo ""

# 1. Navegar al directorio de contratos
echo "📁 Navegando al directorio de contratos..."
cd contracts || exit 1

# 2. Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# 3. Compilar contratos
echo ""
echo "🔨 Compilando contratos..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Error al compilar contratos. Verifica los errores arriba."
    exit 1
fi

# 4. Verificar que existe archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró archivo .env"
    echo "📝 Copia .env.example y configura tus variables:"
    echo "   - PRIVATE_KEY"
    echo "   - BASE_SEPOLIA_RPC_URL"
    exit 1
fi

# 5. Redesplegar en Base Sepolia
echo ""
echo "🌐 Desplegando en Base Sepolia..."
echo "⏳ Esto puede tomar algunos minutos..."
npm run deploy:base-sepolia

if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar contrato. Verifica:"
    echo "   1. Tienes suficiente ETH en Base Sepolia"
    echo "   2. La private key es correcta"
    echo "   3. La RPC URL está funcionando"
    exit 1
fi

# 6. Volver al directorio raíz
cd ..

# 7. Verificar que se actualizó contracts.ts
echo ""
echo "🔍 Verificando actualización de ABI..."
if grep -q "getContributors" "app/src/lib/contracts.ts"; then
    echo "✅ ABI actualizado correctamente con nuevas funciones"
else
    echo "⚠️  El ABI podría no haberse actualizado. Verifica manualmente."
fi

echo ""
echo "✨ ¡Redespliegue completado!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verifica la nueva dirección del contrato en app/src/lib/contracts.ts"
echo "   2. Prueba crear un proyecto de prueba"
echo "   3. Realiza una inversión anónima"
echo "   4. Realiza una inversión pública"
echo "   5. Verifica que el historial se muestre correctamente"
echo ""
echo "🔗 Explorador: https://sepolia.basescan.org"
echo ""
