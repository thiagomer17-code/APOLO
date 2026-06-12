@echo off
rem ============================================================
rem  APOLO - lanzador en modo desarrollo
rem  Usa el Node.js portable incluido en .node (no requiere
rem  tener Node instalado en el sistema). Doble clic para abrir.
rem ============================================================
setlocal
set "APP_DIR=%~dp0"
set "PATH=%APP_DIR%.node\node-v22.22.3-win-x64;%PATH%"
cd /d "%APP_DIR%"
call "%APP_DIR%node_modules\.bin\electron.cmd" .
