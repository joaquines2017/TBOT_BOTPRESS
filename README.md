# 🤖 TBOT-WEB - Sistema de Gestión de Tickets

Sistema completo de gestión de tickets con interfaz web y copia de Botpress

## 📋 Descripción
TBOT_BOTPRESS
El Backup de TBOT de B otpress se encuentran: -Nodos -Intents -Transacciones -Expresiones de los intents -Variables de ssesion y estado de cada nodo -Textos de entrada(respuestas) -Configuración basica, lenguaje, nombre, ID, etc. Descarga el archvivo .tgz y desde Botpress Estudio importa el archivo y tendras una copia del bot.

TBOT-WEB es un sistema integral que combina:
- **Panel Web de Administración**: Interfaz React para gestionar tickets, usuarios y configuraciones
- **API Backend**: Servidor Express.js con PostgreSQL para manejo de datos
- **Bot de WhatsApp**: Automatización de tickets via WhatsApp (repositorio separado)

## 🏗️ Arquitectura

```
tbot-web/
├── client/          # Frontend React (Panel Web)
├── server/          # Backend API Express.js
├── database_setup/  # Scripts de configuración de BD
└── docs/           # Documentación
```

## ⚡ Características Principales

### Panel Web (Cliente)
- ✅ Dashboard de administración
- ✅ Gestión de usuarios y roles
- ✅ CRUD completo de tickets
- ✅ Sistema de autenticación JWT
- ✅ Interfaz responsive con CoreUI React

### API Backend (Servidor)
- ✅ API RESTful con Express.js
- ✅ Base de datos PostgreSQL
- ✅ Autenticación y autorización
- ✅ Auditoría de cambios
- ✅ Integración con sistemas externos (Redmine)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/joaquines2017/tbot-web.git
cd tbot-web
```

### 2. Configurar Backend
```bash
cd server
npm install
```

Configurar base de datos en `db.js`:
```javascript
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'web-tbot',
  password: 'tu_password',
  port: 5432,
})
```

### 3. Configurar Frontend
```bash
cd client
npm install
```

### 4. Iniciar los Servicios

**Backend (Puerto 3003):**
```bash
cd server
npm start
```

**Frontend (Puerto 3000):**
```bash
cd client
npm start
```

## 🔧 Scripts Disponibles

### Servidor
- `npm start` - Iniciar servidor de producción
- `npm run dev` - Iniciar servidor de desarrollo

### Cliente
- `npm start` - Iniciar aplicación en modo desarrollo
- `npm run build` - Construir para producción

## 📊 Base de Datos

El sistema utiliza PostgreSQL con las siguientes tablas principales:
- `usuarios` - Gestión de usuarios del sistema
- `tickets` - Información de tickets de soporte
- `categorias` - Categorías y subcategorías de problemas
- `auditoria_usuarios` - Registro de cambios

## 🔐 Autenticación

Sistema de autenticación basado en JWT con:
- Login/logout de usuarios
- Roles de usuario (admin, técnico, administrativo)
- Protección de rutas por rol
- Middleware de verificación de tokens

## 🌐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Editar usuario
- `DELETE /api/usuarios/:id` - Desactivar usuario

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear ticket
- `PUT /api/tickets/:id` - Actualizar ticket

## 📱 Integración con WhatsApp Bot

Este sistema está diseñado para integrarse con el bot de WhatsApp TBOT:
- **Repositorio del Bot**: [base-ts-baileys-postgres](https://github.com/joaquines2017/TBOT_MPF)
- **Funcionalidad**: Creación automática de tickets via WhatsApp
- **Sincronización**: Base de datos compartida entre ambos sistemas

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Validación de entrada en todas las rutas
- CORS configurado para dominios específicos
- Middleware de autenticación en rutas protegidas

## 📝 Logs y Auditoría

- Logs del servidor en `server.log`
- Auditoría completa de cambios de usuarios
- Registro de IP y User-Agent en acciones críticas

## 🔄 Estados de Tickets

- **Nuevo**: Ticket recién creado
- **En Proceso**: Asignado a técnico
- **Resuelto**: Problema solucionado
- **Rechazado**: Ticket cancelado

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- **Email**: soporte@tbot.com
- **Documentación**: [Manual de Usuario](docs/MANUAL_USUARIO.md)
- **Issues**: [GitHub Issues](https://github.com/joaquines2017/tbot-web/issues)

## 🏆 Créditos

Desarrollado por el equipo de TBOT para la gestión eficiente de tickets de soporte técnico.

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
