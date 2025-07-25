#  Docker Deployment Guide

## Servicios Disponibles

### Arquitectura Completa
- **PostgreSQL** - Base de datos principal
- **Botpress** - Plataforma de chatbot
- **Builderbot** - Bot de WhatsApp
- **Backend** - API REST (Express + Node.js)
- **Frontend** - Panel Web (React + Vite + Nginx)

## Configuración de Entorno

### Archivos .env requeridos:
- `.env` - Variables principales
- `postgres.env` - Configuración PostgreSQL
- `botpress.env` - Configuración Botpress
- `builderbot.env` - Configuración Bot WhatsApp
- `backend.env` - Configuración API Backend
- `frontend.env` - Configuración Cliente Frontend

## Comandos de Despliegue

### Producción Completa
```bash
# Construir e iniciar todos los servicios
docker-compose -f docker-compose.prod.yml up -d

# Ver logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Parar todos los servicios
docker-compose -f docker-compose.prod.yml down
```

### Servicios Individuales

#### Solo Backend + Base de Datos
```bash
docker-compose -f docker-compose.prod.yml up -d postgres backend
```

#### Solo Frontend (requiere backend corriendo)
```bash
docker-compose -f docker-compose.prod.yml up -d frontend
```

#### Bot Completo (Botpress + Builderbot)
```bash
docker-compose -f docker-compose.prod.yml up -d postgres botpress builderbot
```

## Puertos de Servicios

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:5000
- **Botpress**: http://localhost:3000
- **Builderbot**: http://localhost:3008
- **PostgreSQL**: localhost:5432

## Volúmenes Persistentes

- `postgres_data` - Datos de PostgreSQL
- `botpress_data` - Datos de Botpress
- `./backend/server/logs` - Logs del backend

## Comandos Útiles

### Logs específicos
```bash
# Backend logs
docker logs tbot_backend -f

# Frontend logs
docker logs tbot_frontend -f

# Base de datos logs
docker logs tbot_postgres -f
```

### Backup de datos
```bash
# Backup PostgreSQL
docker exec tbot_postgres pg_dump -U admin web-tbot > backup_$(date +%Y%m%d).sql

# Backup Botpress
docker run --rm -v botpress_data:/data -v $(pwd):/backup alpine tar czf /backup/botpress_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### Desarrollo

Para desarrollo, usar el docker-compose regular:
```bash
docker-compose up -d
```

### Troubleshooting

#### Reconstruir imágenes
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### Limpiar volúmenes (¡CUIDADO!)
```bash
docker-compose -f docker-compose.prod.yml down -v
```

#### Verificar estado de servicios
```bash
docker-compose -f docker-compose.prod.yml ps
```
