# ==========================================================================
# NexusRad AI - Script de Criação & Inicialização do Banco PostgreSQL
# ==========================================================================

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "         NEXUSRAD AI - CONFIGURACAO DO BANCO DE DADOS POSTGRESQL       " -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Locate psql.exe automatically on Windows
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source

if (-not $psqlPath) {
    # Search common PostgreSQL install locations
    $possiblePaths = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue
    if ($possiblePaths) {
        $psqlPath = $possiblePaths[0].FullName
    }
}

if ($psqlPath) {
    Write-Host " ⚡ psql localizado em: $psqlPath" -ForegroundColor Green
    Write-Host " ⚡ Executando criação do banco nexusrad_db e aplicando schema.sql..." -ForegroundColor Green
    
    & "$psqlPath" -U postgres -f "C:\Sistemas\NexusRaid AI\database\schema.sql"
    
    Write-Host ""
    Write-Host " ✅ Banco de dados PostgreSQL configurado e alimentado com sucesso!" -ForegroundColor Green
} else {
    Write-Host " ⚠️ O utilitário 'psql' não foi encontrado no PATH do Windows." -ForegroundColor Yellow
    Write-Host " Dica: Se o PostgreSQL já estiver instalado no computador, adicione a pasta bin (ex: C:\Program Files\PostgreSQL\16\bin) ao PATH do sistema." -ForegroundColor Gray
    Write-Host " Você também pode rodar o schema manualmente no PGAdmin ou psql com o arquivo:" -ForegroundColor Gray
    Write-Host " C:\Sistemas\NexusRaid AI\database\schema.sql" -ForegroundColor White
}
