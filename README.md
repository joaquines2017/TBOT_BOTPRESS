#  T-BOT - Sistema de Gestión de Tickets WhatsApp

Sistema completo de gestión de tickets integrado con WhatsApp, construido con React (frontend) y Node.js (backend).

##  Arquitectura del Proyecto

```
TBOT_BOTPRESS/
 README.md                    # Este archivo
 docker-compose.yml           # Orquestación de servicios

 backend/                     #  Servidor Backend
    server/                  # Node.js + Express + PostgreSQL
        package.json
        index.js
        controllers/
        routes/
        services/

 frontend/                    #  Cliente Frontend
     cliente/                 # React + Vite + CoreUI
         package.json
         vite.config.mjs
         src/
         public/
```

##  Inicio Rápido

### Desarrollo Completo (Docker)
```bash
# Clonar repositorio completo
git clone https://github.com/tu-usuario/TBOT_BOTPRESS.git
cd TBOT_BOTPRESS

# Iniciar todos los servicios
docker-compose up -d
```

### Desarrollo Manual

#### Backend
```bash
cd backend/server
npm install
npm start
# Servidor en http://localhost:5000
```

#### Frontend  
```bash
cd frontend/cliente
npm install
npm run dev
# Cliente en http://localhost:3000
```

##  Despliegue Selectivo

### Solo Backend
```bash
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git backend-deploy
cd backend-deploy
git sparse-checkout set backend
cd backend/server
npm install
npm start
```

### Solo Frontend
```bash
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git frontend-deploy
cd frontend-deploy  
git sparse-checkout set frontend
cd frontend/cliente
npm install
npm run build
```

##  Tecnologías

### Backend
- Node.js 22.11
- Express 5.1.0
- PostgreSQL
- JWT + bcrypt

### Frontend
- React 19.0.0
- Vite 7.0.3
- CoreUI 5.3.1
- Axios

##  Características

-  Gestión completa de tickets
-  Integración con WhatsApp (Baileys)
-  Panel administrativo web
-  Autenticación JWT
-  Base de datos PostgreSQL
-  API REST documentada
-  Interfaz responsive

##  Configuración

Ver archivos README específicos:
- [Backend Setup](backend/server/README.md)
- [Frontend Setup](frontend/cliente/README.md)

##  Licencia

Este proyecto fue desarrollado para el MPF Tucumán como parte de la tesis de grado.

