@echo off
echo 🚀 INICIANDO SISTEMA T-BOT COMPLETO
echo ====================================
echo.

echo 📅 Fecha: %date% %time%
echo 👤 Usuario: %username%
echo 📁 Directorio: %cd%
echo.

echo 🔧 PASO 1: Deteniendo procesos Node.js anteriores...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Procesos anteriores eliminados
echo.

echo 🔧 PASO 2: Iniciando Backend (Puerto 3003)...
cd /d "c:\Users\Jose\Documents\tbot-web - copia\server"
start "T-BOT Backend" cmd /k "echo 🖥️ BACKEND T-BOT - Puerto 3003 && npm start"
echo ✅ Backend iniciándose...
echo.

echo 🔧 PASO 3: Esperando 5 segundos...
timeout /t 5 /nobreak >nul
echo ✅ Pausa completada
echo.

echo 🔧 PASO 4: Iniciando Frontend (Puerto 3000)...
cd /d "c:\Users\Jose\Documents\tbot-web - copia\client"
start "T-BOT Frontend" cmd /k "echo 🌐 FRONTEND T-BOT - Puerto 3000 && npm start"
echo ✅ Frontend iniciándose...
echo.

echo 🔧 PASO 5: Esperando 10 segundos para que se inicialicen...
timeout /t 10 /nobreak >nul
echo.

echo 🎯 SISTEMA T-BOT INICIADO COMPLETAMENTE
echo ========================================
echo.
echo 📍 URLS DEL SISTEMA:
echo    🖥️  Backend:  http://localhost:3003
echo    🌐 Frontend: http://localhost:3000
echo.
echo 🧪 TESTING DEL PERFIL:
echo    1. Ve a: http://localhost:3000/#/tickets/usuarios
echo    2. Haz clic en el ícono de editar (lápiz)
echo    3. El modal debería abrirse SIN errores
echo.
echo ✅ LISTO PARA PROBAR
echo.
pause
