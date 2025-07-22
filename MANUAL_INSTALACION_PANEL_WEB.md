# 📋 **Manual de Instalación - Panel Web T-BOT**
*Continuación del Manual de Instalación TBOT*

---

## 8. Panel Web - Instalación y Configuración

El Panel Web T-BOT es una aplicación React con backend Node.js que permite el monitoreo, control y gestión estadística de tickets integrados con Redmine. Este panel complementa el chatbot TBOT proporcionando una interfaz visual para administradores y técnicos.

### 8.1 Arquitectura del Panel Web

**Frontend:**
* React 19.0.0 con Vite 7.0.3
* CoreUI 5.3.1 para componentes UI
* Axios para comunicación con APIs
* Autenticación JWT

**Backend:**
* Node.js 22.11-slim con Express 5.1.0
* PostgreSQL 8.16.3 como base de datos
* JWT 9.0.2 para autenticación
* bcrypt 6.0.0 para encriptación

**Base de Datos:**
* PostgreSQL compartida con el bot TBOT
* Base de datos: `web-tbot` (independiente de `tbot`)

---

## 9. Instalación del Panel Web

### A. Prerrequisitos del Sistema

Dado que el servidor ya cuenta con Docker y servicios básicos instalados, verificamos:

```bash
# Verificar Node.js (versión 18+ requerida)
node --version

# Verificar npm
npm --version

# Verificar Git
git --version

# Verificar PostgreSQL
sudo systemctl status postgresql
```

### B. Estructura del Proyecto Panel Web

Crear estructura en `/home/administrador/tbot-panel-web/`:

```bash
sudo mkdir -p /home/administrador/tbot-panel-web
cd /home/administrador/tbot-panel-web

# Clonar repositorio del panel web
git clone [URL_REPOSITORIO_PANEL_WEB] .

# Estructura resultante:
# tbot-panel-web/
# ├── client/              # Frontend React
# ├── server/              # Backend Node.js
# ├── database_setup/      # Scripts de BD
# ├── .vscode/            # Configuración VS Code
# ├── INICIAR-SISTEMA.bat # Script de inicio
# └── start-services.bat  # Script de servicios
```

---

## 10. Configuración de Base de Datos

### A. Crear Base de Datos para Panel Web

```bash
# Conectar a PostgreSQL
sudo docker exec -it tbot_postgres psql -U admin -d postgres

# Crear base de datos para panel web
CREATE DATABASE "web-tbot";

# Crear usuario específico (opcional)
CREATE USER panelweb_user WITH PASSWORD 'PanelWeb2024!';

# Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE "web-tbot" TO admin;
GRANT ALL PRIVILEGES ON DATABASE "web-tbot" TO panelweb_user;

# Salir
\q
```

### B. Configurar Tablas del Panel Web

```bash
cd /home/administrador/tbot-panel-web/database_setup

# Ejecutar scripts de configuración de BD
sudo docker exec -i tbot_postgres psql -U admin -d "web-tbot" < usuarios_table.sql
sudo docker exec -i tbot_postgres psql -U admin -d "web-tbot" < roles_table.sql
sudo docker exec -i tbot_postgres psql -U admin -d "web-tbot" < tickets_audit.sql
```

---

## 11. Configuración del Backend

### A. Crear archivo de configuración del servidor

```bash
cd /home/administrador/tbot-panel-web/server

# Crear archivo .env para el backend
nano .env
```

**Contenido del archivo `server/.env`:**

```env
# Configuración del Servidor Backend Panel Web T-BOT
NODE_ENV=production
PORT=3001

# Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=web-tbot
DB_USER=admin
DB_PASSWORD=Kdmf8394

# JWT Configuration
JWT_SECRET=TBot_Panel_Web_Secret_Key_2024_MPF_Tucuman
JWT_EXPIRE=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Redmine Integration
REDMINE_URL=https://incidentes.mpftucuman.gob.ar/
REDMINE_API_KEY=caa5569e969a7a7dd08f2dd1268579aceb93b3f4

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/panel-web.log

# Session Configuration
SESSION_SECRET=TBot_Session_Secret_2024
```

### B. Instalar dependencias del backend

```bash
cd /home/administrador/tbot-panel-web/server

# Instalar dependencias
npm install

# Verificar que todas las dependencias estén instaladas
npm list
```

### C. Crear script de inicio del backend

```bash
# Crear script de inicio
nano /home/administrador/tbot-panel-web/start-backend.sh
```

**Contenido de `start-backend.sh`:**

```bash
#!/bin/bash
echo "🚀 Iniciando Backend Panel Web T-BOT..."

cd /home/administrador/tbot-panel-web/server

# Verificar que PostgreSQL esté disponible
echo "📊 Verificando conexión a PostgreSQL..."
until nc -z localhost 5432; do
  echo "⏳ Esperando PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL disponible"

# Crear directorio de logs si no existe
mkdir -p logs

# Iniciar servidor backend
echo "🌐 Iniciando servidor backend en puerto 3001..."
npm start

echo "✅ Backend Panel Web iniciado correctamente"
```

```bash
# Dar permisos de ejecución
chmod +x /home/administrador/tbot-panel-web/start-backend.sh
```

---

## 12. Configuración del Frontend

### A. Configurar variables del frontend

```bash
cd /home/administrador/tbot-panel-web/client

# Crear archivo .env para el frontend
nano .env
```

**Contenido del archivo `client/.env`:**

```env
# Configuración Frontend Panel Web T-BOT
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Panel Web T-BOT
VITE_APP_VERSION=1.0.0

# Redmine Configuration
VITE_REDMINE_URL=https://incidentes.mpftucuman.gob.ar/

# Environment
VITE_NODE_ENV=production

# Debug
VITE_DEBUG=false
```

### B. Instalar dependencias del frontend

```bash
cd /home/administrador/tbot-panel-web/client

# Instalar dependencias
npm install

# Compilar para producción
npm run build
```

### C. Crear script de inicio del frontend

```bash
# Crear script de inicio
nano /home/administrador/tbot-panel-web/start-frontend.sh
```

**Contenido de `start-frontend.sh`:**

```bash
#!/bin/bash
echo "🎨 Iniciando Frontend Panel Web T-BOT con Vite..."

cd /home/administrador/tbot-panel-web/client

# Verificar que el backend esté disponible
echo "🔗 Verificando conexión al backend..."
until curl -f http://localhost:3001/api/health > /dev/null 2>&1; do
  echo "⏳ Esperando backend..."
  sleep 3
done

echo "✅ Backend disponible"

# Iniciar servidor según el modo
if [ "$1" = "dev" ]; then
  echo "🛠️ Iniciando Vite en modo desarrollo..."
  npm run dev -- --host 0.0.0.0
else
  echo "🚀 Iniciando Vite en modo producción (preview)..."
  # Compilar si no existe build
  if [ ! -d "dist" ]; then
    echo "📦 Compilando aplicación..."
    npm run build
  fi
  npm run preview -- --host 0.0.0.0 --port 3000
fi

echo "✅ Frontend Panel Web iniciado correctamente"
```

```bash
# Dar permisos de ejecución
chmod +x /home/administrador/tbot-panel-web/start-frontend.sh
```

---

## 13A. Instalación Simple (Sin Docker) - Configuración Actual

### **Esta es la configuración que actualmente usas:**

#### **Backend (Puerto 3001):**
```bash
cd /home/administrador/tbot-panel-web/server
npm install
npm start
```

#### **Frontend (Puerto 3000):**
```bash
cd /home/administrador/tbot-panel-web/client
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

#### **Comandos de tu sistema actual:**
```bash
# Iniciar backend
cd server && npm start

# Iniciar frontend (desarrollo)
cd client && npm run dev

# Iniciar frontend (producción)
cd client && npm run build && npm run preview
```

---

## 13B. Configuración con Docker (Modo Producción)

### ⚡ **Configuración con Vite (Sin Nginx)**

Este proyecto utiliza **Vite Preview Server** en lugar de Nginx para servir la aplicación en producción. Esta configuración es más simple y eficiente para aplicaciones React modernas.

#### **Ventajas de usar Vite directamente:**
- ✅ **Simplicidad:** Una sola imagen Docker por servicio
- ✅ **Desarrollo/Producción similar:** Mismo servidor en ambos entornos
- ✅ **Hot Module Replacement:** Disponible en desarrollo
- ✅ **Configuración unificada:** vite.config.mjs maneja todo
- ✅ **Menos overhead:** Sin proxy adicional nginx

### A. Crear Dockerfile para el Bimage.pngackend

```bash
nano /home/administrador/tbot-panel-web/server/Dockerfile
```

**Contenido del `Dockerfile` para backend:**

```dockerfile
# Dockerfile para Backend Panel Web T-BOT
FROM node:22.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio de logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 3001

# Comando de health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Comando de inicio
CMD ["npm", "start"]
```

### B. Crear Dockerfile para el Frontend (usando Vite)

```bash
nano /home/administrador/tbot-panel-web/client/Dockerfile
```

**Contenido del `Dockerfile` para frontend:**

```dockerfile
# Dockerfile para Frontend Panel Web T-BOT (con Vite)
FROM node:22.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación para producción
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Comando de inicio usando Vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

### C. Configuración de Vite para producción

El frontend usa **Vite Preview Server** en lugar de Nginx. Esta configuración ya está en tu archivo `vite.config.mjs`:

```javascript
// vite.config.mjs - Configuración existente
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0', // Permite conexiones externas
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0' // Para modo producción
  }
})
```

### D. Crear Docker Compose para Panel Web

```bash
nano /home/administrador/tbot-panel-web/docker-compose-panel.yml
```

**Contenido de `docker-compose-panel.yml`:**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: tbot_panel_backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: web-tbot
      DB_USER: admin
      DB_PASSWORD: Kdmf8394
      JWT_SECRET: TBot_Panel_Web_Secret_Key_2024_MPF_Tucuman
      REDMINE_URL: https://incidentes.mpftucuman.gob.ar/
      REDMINE_API_KEY: caa5569e969a7a7dd08f2dd1268579aceb93b3f4
    volumes:
      - ./server/logs:/app/logs
    depends_on:
      - postgres
    networks:
      - tbot_net

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: tbot_panel_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - tbot_net

  postgres:
    image: postgres:latest
    container_name: tbot_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: Kdmf8394
      POSTGRES_DB: web-tbot
    ports:
      - "5432:5432"
    volumes:
      - ./data_pg:/var/lib/postgresql/data
    networks:
      - tbot_net

networks:
  tbot_net:
    driver: bridge
    external: true
```

---

## 14. Scripts de Inicio y Mantenimiento

### A. Script de inicio completo

```bash
nano /home/administrador/tbot-panel-web/start-panel-web.sh
```

**Contenido de `start-panel-web.sh`:**

```bash
#!/bin/bash

echo "🚀 Iniciando Panel Web T-BOT Completo..."

# Verificar que Docker esté corriendo
if ! systemctl is-active --quiet docker; then
    echo "❌ Docker no está corriendo. Iniciando Docker..."
    sudo systemctl start docker
    sleep 5
fi

# Crear red si no existe
docker network create tbot_net 2>/dev/null || true

# Cambiar al directorio del proyecto
cd /home/administrador/tbot-panel-web

# Iniciar contenedores
echo "📦 Iniciando contenedores..."
sudo docker-compose -f docker-compose-panel.yml up -d

# Verificar estado
echo "🔍 Verificando estado de los contenedores..."
sleep 10
sudo docker-compose -f docker-compose-panel.yml ps

echo "✅ Panel Web T-BOT iniciado correctamente"
echo "🌐 Frontend disponible en: http://localhost:3000"
echo "🔧 Backend API disponible en: http://localhost:3001"
echo "📊 Base de datos PostgreSQL en puerto: 5432"
```

```bash
# Dar permisos de ejecución
chmod +x /home/administrador/tbot-panel-web/start-panel-web.sh
```

### B. Script de detener servicios

```bash
nano /home/administrador/tbot-panel-web/stop-panel-web.sh
```

**Contenido de `stop-panel-web.sh`:**

```bash
#!/bin/bash

echo "⏹️ Deteniendo Panel Web T-BOT..."

cd /home/administrador/tbot-panel-web

# Detener contenedores
sudo docker-compose -f docker-compose-panel.yml down

echo "✅ Panel Web T-BOT detenido correctamente"
```

```bash
# Dar permisos de ejecución
chmod +x /home/administrador/tbot-panel-web/stop-panel-web.sh
```

---

## 15. Configuración de Usuarios por Defecto

### A. Crear usuario administrador inicial

```bash
# Conectar a la base de datos
sudo docker exec -it tbot_postgres psql -U admin -d "web-tbot"

# Crear usuario administrador
INSERT INTO usuarios (nombre, email, password, rol, activo, fecha_creacion) 
VALUES (
    'Administrador', 
    'admin@mpftucuman.gob.ar', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'admin', 
    true, 
    NOW()
);

# Salir
\q
```

### B. Crear usuarios técnicos de ejemplo

```sql
-- Técnico 1
INSERT INTO usuarios (nombre, email, password, rol, activo, fecha_creacion) 
VALUES (
    'Juan Pérez', 
    'juan.perez@mpftucuman.gob.ar', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'tecnico', 
    true, 
    NOW()
);

-- Técnico 2
INSERT INTO usuarios (nombre, email, password, rol, activo, fecha_creacion) 
VALUES (
    'María González', 
    'maria.gonzalez@mpftucuman.gob.ar', 
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'tecnico', 
    true, 
    NOW()
);
```

---

## 16. Verificación de la Instalación

### A. Verificar servicios corriendo

```bash
# Verificar contenedores
sudo docker ps

# Verificar logs
sudo docker logs tbot_panel_backend
sudo docker logs tbot_panel_frontend
sudo docker logs tbot_postgres

# Verificar puertos abiertos
sudo netstat -tlnp | grep -E ':(3000|3001|3008|5432)'
```

### B. Verificar conectividad

```bash
# Test backend
curl -f http://localhost:3001/api/health

# Test frontend (Vite)
curl -f http://localhost:3000

# Test base de datos
sudo docker exec tbot_postgres pg_isready -U admin -d "web-tbot"

# Verificar que Vite esté sirviendo correctamente
curl -s http://localhost:3000 | grep -q "<!doctype html>" && echo "✅ Frontend OK" || echo "❌ Frontend Error"
```

---

## 17. Acceso al Panel Web

### A. URLs de acceso

* **Panel Web Frontend:** http://192.168.100.254:3000
* **API Backend:** http://192.168.100.254:3001/api
* **Bot BuilderBot:** http://192.168.100.254:3008
* **Botpress (configuración):** http://192.168.100.254:3000 (temporal)

### B. Credenciales por defecto

* **Usuario:** admin@mpftucuman.gob.ar
* **Contraseña:** admin123

---

## 18. Integración con Bot TBOT

El Panel Web está diseñado para trabajar en conjunto con el Bot TBOT:

### A. Compartir base de datos PostgreSQL

Ambos sistemas utilizan la misma instancia de PostgreSQL pero bases de datos separadas:
* Bot TBOT: base de datos `tbot`
* Panel Web: base de datos `web-tbot`

### B. Integración con Redmine

Ambos sistemas comparten la misma configuración de Redmine:
* URL: https://incidentes.mpftucuman.gob.ar/
* API Key: caa5569e969a7a7dd08f2dd1268579aceb93b3f4

---

## 19. Mantenimiento y Actualizaciones

### A. Actualizar código del Panel Web

```bash
cd /home/administrador/tbot-panel-web

# Detener servicios
./stop-panel-web.sh

# Actualizar código
git pull origin main

# Reconstruir contenedores
sudo docker-compose -f docker-compose-panel.yml build --no-cache

# Iniciar servicios
./start-panel-web.sh
```

### B. Backup de base de datos

```bash
# Backup automático
sudo docker exec tbot_postgres pg_dump -U admin "web-tbot" > backup_panel_web_$(date +%Y%m%d_%H%M%S).sql
```

---

## 20. Monitoreo y Logs

### A. Ubicación de logs

* **Backend:** `/home/administrador/tbot-panel-web/server/logs/`
* **Docker logs:** `sudo docker logs [container_name]`
* **PostgreSQL logs:** Dentro del contenedor

### B. Comandos de monitoreo

```bash
# Ver logs en tiempo real
sudo docker logs -f tbot_panel_backend
sudo docker logs -f tbot_panel_frontend

# Ver estado de recursos
sudo docker stats

# Ver espacio en disco
df -h
```

---

## ✅ Estado Final del Sistema Completo

### Servicios corriendo:

1. **PostgreSQL:** Puerto 5432 (compartido)
   - Base de datos `tbot` (Bot)
   - Base de datos `web-tbot` (Panel Web)

2. **Bot TBOT:**
   - Botpress: Puerto 3000 (temporal configuración)
   - BuilderBot: Puerto 3008 (WhatsApp)

3. **Panel Web T-BOT:**
   - Frontend React: Puerto 3000
   - Backend API: Puerto 3001

### URLs de acceso:
* **Panel Web:** http://IP-SERVIDOR:3000
* **API Backend:** http://IP-SERVIDOR:3001
* **Bot WhatsApp:** http://IP-SERVIDOR:3008

**¡El sistema completo T-BOT (Bot + Panel Web) está ahora funcionando integrado!**

---

*Fin del Manual de Instalación Panel Web T-BOT*

---

## 📞 **Contacto del equipo de soporte**
- **Joaquín Juárez:** Cel: 3815978765
- **Gustavo Salva:** Cel: 3814688720
- **José Ruiz:** Cel: 3815071763

**📅 Generado:** 20 de Julio de 2025  
**🏢 Organización:** MPF Tucumán  
**🤖 Proyecto:** T-BOT - Sistema Integral de Gestión de Tickets
