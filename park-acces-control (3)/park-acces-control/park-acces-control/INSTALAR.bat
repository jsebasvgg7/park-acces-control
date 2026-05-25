@echo off
chcp 65001 >nul
color 0A
echo.
echo ╔════════════════════════════════════════════╗
echo ║   Park Access Control v1.0.0               ║
echo ║   Instalador de Aplicación                 ║
echo ╚════════════════════════════════════════════╝
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado
    echo    Descargue desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js detectado
echo.

REM Instalar dependencias
echo ⏳ Instalando dependencias...
call npm install --production
if errorlevel 1 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo ✓ Instalación completada correctamente
echo.
echo Para iniciar la aplicación, ejecute:
echo    npm start
echo.
echo La aplicación estará disponible en:
echo    http://localhost:3000
echo.
pause
