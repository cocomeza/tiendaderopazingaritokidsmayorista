# Script para limpiar caché de Next.js
# Uso: .\scripts\clean-cache.ps1

Write-Host "🧹 Limpiando caché de Next.js..." -ForegroundColor Cyan

# Detener procesos de Node
Write-Host "`n📌 Deteniendo procesos de Node..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Stop-Process -Name node -Force
    Write-Host "✅ Procesos Node detenidos" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No hay procesos Node corriendo" -ForegroundColor Gray
}

# Eliminar carpeta .next
Write-Host "`n🗑️  Eliminando carpeta .next..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force
    Write-Host "✅ Carpeta .next eliminada" -ForegroundColor Green
} else {
    Write-Host "ℹ️  La carpeta .next no existe" -ForegroundColor Gray
}

# Eliminar cache de node_modules
Write-Host "`n🗑️  Eliminando caché de node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules\.cache) {
    Remove-Item -Path node_modules\.cache -Recurse -Force
    Write-Host "✅ Caché de node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No hay caché en node_modules" -ForegroundColor Gray
}

# Limpiar caché de npm si existe
Write-Host "`n🗑️  Limpiando caché de npm..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>$null
    Write-Host "✅ Caché de npm limpiado" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No se pudo limpiar el caché de npm" -ForegroundColor Gray
}

Write-Host "`n✨ ¡Limpieza completada!" -ForegroundColor Green
Write-Host "`n💡 Ahora puedes ejecutar 'npm run dev' para reiniciar el servidor" -ForegroundColor Cyan

