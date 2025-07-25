#  T-BOT Backend Server

## Descripción
Backend del sistema T-BOT construido con Node.js y Express, que proporciona APIs para la gestión de tickets y autenticación de usuarios.

## Tecnologías
- **Node.js 22.11** - Runtime del servidor
- **Express 5.1.0** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor de desarrollo
npm start
```

## Variables de Entorno Requeridas

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tbot_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_jwt_secret
PORT=5000
```

## Desarrollo

```bash
# Desarrollo con auto-reload
npm run dev

# Logs del servidor
tail -f server.log
```

## Notas de Despliegue

Para clonar solo el backend:
```bash
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git backend-deploy
cd backend-deploy
git sparse-checkout set backend
cd backend/server
npm install
npm start
```
