@echo off
chcp 65001 >nul
title Park Access Control - Servidor
color 0B

echo.
echo ╔════════════════════════════════════════════╗
echo ║   Park Access Control v1.0.0               ║
echo ║   Iniciando Servidor...                    ║
echo ╚════════════════════════════════════════════╝
echo.

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo ⏳ Instalando dependencias...
    call npm install --production
)

echo.
echo 📡 Iniciando servidor...
echo    Puerto: 3000
echo    URL: http://localhost:3000
echo.
echo Presione Ctrl+C para detener el servidor
echo.

call npm start
