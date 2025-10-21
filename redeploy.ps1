# Script para redesplegar el contrato Launchpad con nuevas funcionalidades
# Sistema de inversiones anónimas e historial de contribuyentes

Write-Host "🚀 Iniciando proceso de redespliegue del contrato Launchpad..." -ForegroundColor Cyan
Write-Host ""

# 1. Navegar al directorio de contratos
Write-Host "📁 Navegando al directorio de contratos..." -ForegroundColor Yellow
Set-Location -Path "contracts"

# 2. Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# 3. Compilar contratos
Write-Host ""
Write-Host "🔨 Compilando contratos..." -ForegroundColor Yellow
npm run compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al compilar contratos. Verifica los errores arriba." -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

# 4. Verificar que existe archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Red
    Write-Host "📝 Copia .env.example y configura tus variables:" -ForegroundColor Yellow
    Write-Host "   - PRIVATE_KEY"
    Write-Host "   - BASE_SEPOLIA_RPC_URL"
    Set-Location -Path ".."
    exit 1
}

# 5. Redesplegar en Base Sepolia
Write-Host ""
Write-Host "🌐 Desplegando en Base Sepolia..." -ForegroundColor Yellow
Write-Host "⏳ Esto puede tomar algunos minutos..." -ForegroundColor Gray
npm run deploy:base-sepolia

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al desplegar contrato. Verifica:" -ForegroundColor Red
    Write-Host "   1. Tienes suficiente ETH en Base Sepolia"
    Write-Host "   2. La private key es correcta"
    Write-Host "   3. La RPC URL está funcionando"
    Set-Location -Path ".."
    exit 1
}

# 6. Volver al directorio raíz
Set-Location -Path ".."

# 7. Verificar que se actualizó contracts.ts
Write-Host ""
Write-Host "🔍 Verificando actualización de ABI..." -ForegroundColor Yellow
$contractsFile = "app\src\lib\contracts.ts"
if (Select-String -Path $contractsFile -Pattern "getContributors" -Quiet) {
    Write-Host "✅ ABI actualizado correctamente con nuevas funciones" -ForegroundColor Green
} else {
    Write-Host "⚠️  El ABI podría no haberse actualizado. Verifica manualmente." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ ¡Redespliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Verifica la nueva dirección del contrato en app\src\lib\contracts.ts"
Write-Host "   2. Prueba crear un proyecto de prueba"
Write-Host "   3. Realiza una inversión anónima"
Write-Host "   4. Realiza una inversión pública"
Write-Host "   5. Verifica que el historial se muestre correctamente"
Write-Host ""
Write-Host "🔗 Explorador: https://sepolia.basescan.org" -ForegroundColor Blue
Write-Host ""
