console.log('🚀 Iniciando servidor T-BOT...');
console.log('📅 Fecha:', new Date().toLocaleString());

// Cargar el servidor
require('./index.js');

// Verificar después de 3 segundos que el servidor está funcionando
setTimeout(async () => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://192.168.100.250:3003/api/auth/check', { timeout: 2000 });
    console.log('✅ Servidor respondiendo correctamente');
  } catch (error) {
    console.log('⚠️ Servidor iniciado pero revisar endpoints');
  }
}, 3000);
