# ==========================================================================
# NexusRad AI - Script Automatizado para Redefinição de Senha do PostgreSQL
# ==========================================================================

Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host "        REDEFINICAO AUTOMATICA DE SENHA DO POSTGRESQL PARA 'postgres'  " -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan
Write-Host ""

# Find pg_hba.conf
$hbaFiles = Get-ChildItem "C:\Program Files\PostgreSQL\*\data\pg_hba.conf", "C:\ProgramData\PostgreSQL\*\data\pg_hba.conf" -ErrorAction SilentlyContinue

if (-not $hbaFiles) {
    Write-Host " Nao foi possivel localizar o arquivo pg_hba.conf automaticamente." -ForegroundColor Red
    exit 1
}

$hbaFile = $hbaFiles[0].FullName
Write-Host " Arquivo pg_hba.conf encontrado em: $hbaFile" -ForegroundColor Green

# Backup original content
$originalContent = Get-Content $hbaFile -Raw

# Replace scram-sha-256 with trust
$trustContent = $originalContent -replace '127.0.0.1/32\s+scram-sha-256', '127.0.0.1/32            trust' -replace '::1/128\s+scram-sha-256', '::1/128                 trust'

Write-Host " Aplicando modo trust temporario..." -ForegroundColor Yellow
Set-Content -Path $hbaFile -Value $trustContent -Force

# Find service
$services = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($services) {
    $serviceName = $services[0].Name
    Write-Host " Reiniciando servico $serviceName..." -ForegroundColor Yellow
    Restart-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
}

# Find psql
$psqlPath = (Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName -First 1)

if ($psqlPath) {
    Write-Host " Alterando a senha do usuario postgres para postgres..." -ForegroundColor Green
    & "$psqlPath" -U postgres -h 127.0.0.1 -c "ALTER USER postgres WITH PASSWORD 'postgres';"
} else {
    Write-Host " psql.exe nao encontrado." -ForegroundColor Red
}

# Revert to original scram-sha-256
Write-Host " Restaurando arquivo de seguranca pg_hba.conf..." -ForegroundColor Yellow
Set-Content -Path $hbaFile -Value $originalContent -Force

if ($services) {
    Restart-Service -Name $services[0].Name -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host " SENHA DO POSTGRESQL REDEFINIDA COM SUCESSO!" -ForegroundColor Green
