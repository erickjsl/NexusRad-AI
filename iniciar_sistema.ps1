# ==========================================================================
# NexusRad AI - Script de Inicialização Completa (Frontend + Node/PostgreSQL)
# ==========================================================================

$Host.UI.RawUI.WindowTitle = "NexusRad AI - Servidor PACS/RIS & PostgreSQL"
Clear-Host

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "                NEXUSRAD AI - PACS / RIS & MEDICAL SUITE                " -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host " 1. Conectando com o Servidor Backend Node.js / PostgreSQL (Porta 4000)..." -ForegroundColor Yellow
Write-Host " 2. Iniciando a Interface Frontend Web (Porta 3000)..." -ForegroundColor Yellow
Write-Host ""

Set-Location -Path "C:\Sistemas\NexusRaid AI"

# Start Node.js API Server in background
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -ErrorAction SilentlyContinue

Write-Host " 🚀 Abrindo navegador no endereço: http://127.0.0.1:3000/" -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:3000/" -ErrorAction SilentlyContinue

Write-Host " ⚡ Executando servidor Vite em tempo real..." -ForegroundColor Cyan
npm run dev -- --host 127.0.0.1 --port 3000
