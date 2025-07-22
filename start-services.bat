@echo off
echo Iniciando servicios...

start "Backend" /D "C:\Users\Jose\Documents\tbot-web - copia\server" node index.js
timeout /t 3 /nobreak > nul

start "Frontend" /D "C:\Users\Jose\Documents\tbot-web - copia\client" npm run dev
timeout /t 5 /nobreak > nul

echo Servicios iniciados.
echo Backend: http://localhost:3003
echo Frontend: http://localhost:3000
pause
