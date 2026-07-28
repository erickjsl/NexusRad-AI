@echo off
title NexusRad AI - Launcher
color 0B
echo =======================================================================
echo                 NEXUSRAD AI - PACS / RIS & MEDICAL SUITE
echo =======================================================================
echo.
echo Executando o script PowerShell de inicializacao...
echo.
cd /d "C:\Sistemas\NexusRaid AI"
powershell -ExecutionPolicy Bypass -File "C:\Sistemas\NexusRaid AI\iniciar_sistema.ps1"
pause
