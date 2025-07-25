#  Guía de Clonado Selectivo - TBOT_BOTPRESS

##  Estructura del Repositorio

```
TBOT_BOTPRESS/
 README.md                # Documentación principal
 .gitignore              # Archivos ignorados

 backend/                #  Servidor Backend  
    server/             # Node.js + Express + PostgreSQL
        package.json    # Dependencias del servidor
        index.js        # Punto de entrada
        controllers/    # Lógica de negocio
        routes/         # Rutas de la API
        services/       # Servicios externos

 frontend/               #  Cliente Frontend
     cliente/            # React + Vite + CoreUI
         package.json    # Dependencias del cliente
         vite.config.mjs # Configuración de Vite
         src/            # Código fuente React
         public/         # Assets estáticos
```

##  Comandos de Clonado Selectivo

### 1. Solo Backend (Para servidor backend)

```bash
# Clonar solo el backend
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git tbot-backend
cd tbot-backend

# Configurar para incluir solo backend
git sparse-checkout set backend README.md .gitignore

# Navegar al directorio del servidor
cd backend/server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor
npm start
```

### 2. Solo Frontend (Para servidor frontend)

```bash
# Clonar solo el frontend  
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git tbot-frontend
cd tbot-frontend

# Configurar para incluir solo frontend
git sparse-checkout set frontend README.md .gitignore

# Navegar al directorio del cliente
cd frontend/cliente

# Instalar dependencias
npm install

# Configurar variables de entorno del cliente
echo "VITE_API_URL=http://tu-servidor-backend:5000/api" > .env

# Iniciar servidor de desarrollo
npm run dev

# O crear build para producción
npm run build
```

### 3. Proyecto Completo (Para desarrollo local)

```bash
# Clonar repositorio completo
git clone https://github.com/tu-usuario/TBOT_BOTPRESS.git tbot-completo
cd tbot-completo

# Backend
cd backend/server
npm install
npm start

# Frontend (en nueva terminal)
cd ../../frontend/cliente  
npm install
npm run dev
```

##  Configuración de Variables de Entorno

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tbot_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_jwt_secret
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

##  Scripts de Despliegue Automatizado

### deploy-backend.sh
```bash
#!/bin/bash
echo " Desplegando Backend T-BOT..."
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git tbot-backend-deploy
cd tbot-backend-deploy
git sparse-checkout set backend
cd backend/server
npm install --production
echo " Backend listo en: $(pwd)"
```

### deploy-frontend.sh  
```bash
#!/bin/bash
echo " Desplegando Frontend T-BOT..."
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git tbot-frontend-deploy
cd tbot-frontend-deploy
git sparse-checkout set frontend
cd frontend/cliente
npm install
npm run build
echo " Frontend compilado en: $(pwd)/dist"
```

##  Ventajas de esta Estructura

 **Un solo repositorio**: Fácil mantenimiento y versionado conjunto
 **Clonado selectivo**: Solo descargas lo que necesitas
 **Despliegue independiente**: Cada servidor solo tiene su código  
 **Archivos de configuración separados**: package.json independientes
 **Documentación específica**: README para cada parte del proyecto
 **Git sparse-checkout**: Soporte nativo de Git para clonado parcial

##  Actualizar Código

### En clon de solo backend:
```bash
cd tbot-backend
git pull origin master
cd backend/server
npm install  # Si hay nuevas dependencias
```

### En clon de solo frontend:
```bash  
cd tbot-frontend
git pull origin master
cd frontend/cliente
npm install  # Si hay nuevas dependencias
npm run build  # Recompilar para producción
```

##  Notas Importantes

- **Git 2.25+**: Los comandos de sparse checkout requieren Git 2.25 o superior
- **Variables de entorno**: Cada parte tiene sus propias variables de entorno
- **Puertos**: Backend usa puerto 5000, Frontend usa puerto 3000 por defecto
- **Base de datos**: Solo el backend necesita acceso a PostgreSQL
- **Build**: Solo el frontend necesita proceso de compilación (build)

---

** Última actualización:** 22 de Julio de 2025  
** Proyecto:** T-BOT - Sistema de Gestión de Tickets WhatsApp  
** MPF Tucumán:** Ministerio Público Fiscal de Tucumán
