# 👥 **Manual de Usuario - Panel Web T-BOT**
*Sistema de Gestión de Tickets y Soporte Técnico - MPF Tucumán*

---

## 📋 **Índice**

1. [Introducción](#1-introducción)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Dashboard Principal](#3-dashboard-principal)
4. [Gestión de Tickets](#4-gestión-de-tickets)
5. [Reportes](#5-reportes)
6. [Gestión de Usuarios](#6-gestión-de-usuarios)
7. [Configuración de Perfil](#7-configuración-de-perfil)
8. [Roles y Permisos](#8-roles-y-permisos)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)
10. [Soporte Técnico](#10-soporte-técnico)

---

## 1. Introducción

### 🎯 **¿Qué es el Panel Web T-BOT?**

El Panel Web T-BOT es una aplicación web moderna que permite gestionar tickets de soporte técnico integrados con Redmine y complementa el chatbot TBOT de WhatsApp. Está diseñado para administradores y técnicos del MPF Tucumán.

### ✨ **Características principales:**

- 📊 **Dashboard interactivo** con métricas en tiempo real
- 🎫 **Gestión completa de tickets** desde Redmine
- 👥 **Administración de usuarios** y roles
- 📈 **Reportes personalizados** con gráficos
- 🔒 **Sistema de autenticación** seguro con JWT
- 📱 **Interfaz responsive** para móviles y tablets
- 🤖 **Integración con Bot TBOT** de WhatsApp

### 🏢 **Usuarios del sistema:**

- **Administradores:** Acceso completo al sistema
- **Técnicos:** Gestión de tickets asignados
- **Supervisores:** Visualización de reportes y métricas

---

## 2. Acceso al Sistema

### 🌐 **URL de Acceso**

```
http://[IP-SERVIDOR]:3000
```

### 🔐 **Inicio de Sesión**

1. **Abrir navegador web** (Chrome, Firefox, Edge, Safari)
2. **Ingresar la URL** del Panel Web T-BOT
3. **Completar credenciales:**
   - **Email:** usuario@mpftucuman.gob.ar
   - **Contraseña:** Tu contraseña asignada

4. **Hacer clic en "Iniciar Sesión"**

### 🔑 **Credenciales por defecto:**

**Administrador:**
- Email: `admin@mpftucuman.gob.ar`
- Contraseña: `admin123`

> ⚠️ **Importante:** Cambiar la contraseña por defecto en el primer acceso.

### 🚪 **Cerrar Sesión**

1. Hacer clic en tu **nombre de usuario** en la esquina superior derecha
2. Seleccionar **"Cerrar Sesión"**
3. Serás redirigido a la pantalla de login

---

## 3. Dashboard Principal

### 📊 **Vista General**

Al ingresar al sistema, verás el **Dashboard** que muestra:

#### **🎯 Métricas Principales:**
- **Total de Tickets:** Número total de tickets activos
- **Tickets Nuevos:** Tickets sin asignar
- **En Proceso:** Tickets siendo trabajados
- **Resueltos:** Tickets completados

#### **📈 Gráficos Interactivos:**
- **Tickets por Estado:** Gráfico de barras con distribución
- **Tickets por Prioridad:** Distribución por urgencia
- **Tendencias:** Evolución temporal de tickets
- **Técnicos por Asignación:** Carga de trabajo

#### **🔄 Actualización de Datos:**
- Los datos se actualizan **automáticamente cada 30 segundos**
- Botón **"Actualizar"** para refrescar manualmente
- Indicador de **última actualización**

### 🎨 **Personalización del Dashboard**

#### **Filtros de Tiempo:**
- **Hoy:** Tickets del día actual
- **Esta Semana:** Últimos 7 días
- **Este Mes:** Mes actual
- **Personalizado:** Rango de fechas específico

#### **Tipos de Vista:**
- **Vista Ejecutiva:** Métricas resumidas
- **Vista Detallada:** Información completa
- **Vista Técnica:** Enfoque en asignaciones

---

## 4. Gestión de Tickets

### 🎫 **Acceso a Tickets**

1. **Navegar a "Tickets"** desde el menú lateral
2. Se mostrará la **tabla de tickets** con información completa

### 📋 **Información de Tickets**

Cada ticket muestra:

#### **📊 Datos Básicos:**
- **ID:** Número único del ticket
- **Tipo:** Categoria (Incidencia, Solicitud, etc.)
- **Asunto:** Descripción breve del problema
- **Oficina:** Ubicación del solicitante
- **Fecha de Creación:** Cuándo se generó

#### **🎯 Estado y Gestión:**
- **Estado:** Nueva, En curso, Resuelta, Rechazada, Cerrada
- **Prioridad:** Baja, Normal, Alta, Urgente, Inmediata
- **Asignado a:** Técnico responsable

### 🔄 **Gestión de Estados**

#### **Cambiar Estado de Ticket:**
1. **Localizar el ticket** en la tabla
2. **Hacer clic en el dropdown de "Estado"**
3. **Seleccionar nuevo estado:**
   - 🟣 **Nueva:** Ticket recién creado
   - 🟠 **En curso:** Siendo trabajado
   - 🟢 **Resuelta:** Problema solucionado
   - 🟡 **Rechazada:** No procede o información insuficiente
   - 🔴 **Cerrada:** Completamente finalizado

4. **El cambio se guarda automáticamente**

#### **Colores de Estado:**
- 🟣 **Lila:** Nueva
- 🟠 **Naranja:** En curso
- 🟢 **Verde:** Resuelta
- 🟡 **Amarillo:** Rechazada
- 🔴 **Rojo:** Cerrada

### ⚡ **Gestión de Prioridades**

#### **Cambiar Prioridad:**
1. **Hacer clic en el dropdown de "Prioridad"**
2. **Seleccionar nueva prioridad:**
   - 🔵 **Baja:** Problemas menores
   - 🟢 **Normal:** Situaciones estándar
   - 🟣 **Alta:** Requiere atención pronto
   - 🟠 **Urgente:** Afecta productividad
   - 🔴 **Inmediata:** Sistema crítico afectado

#### **Colores de Prioridad:**
- 🔵 **Azul:** Baja
- 🟢 **Verde:** Normal
- 🟣 **Lila:** Alta
- 🟠 **Naranja:** Urgente
- 🔴 **Rojo:** Inmediata

### 👨‍💻 **Asignación de Técnicos**

#### **Asignar Ticket:**
1. **Localizar el ticket** a asignar
2. **Hacer clic en "Asignado a"**
3. **Seleccionar técnico** de la lista
4. **"Sin asignar"** para quitar asignación

### 🔍 **Búsqueda y Filtros**

#### **Barra de Búsqueda:**
- **Buscar por:** ID, asunto, oficina, técnico asignado
- **Búsqueda en tiempo real** mientras escribes
- **No distingue mayúsculas/minúsculas**

#### **Filtros de Visualización:**
- **Tickets por página:** 5, 10, 15, 20, 50
- **Paginación:** Navegar entre páginas
- **Contador:** "Mostrando X de Y tickets"

### 📊 **Información Detallada**

#### **Campos Visibles:**
- **ID:** Número de identificación
- **Tipo:** Categoría del ticket
- **Prioridad:** Nivel de urgencia (con color)
- **Estado:** Situación actual (con color)
- **Asignado a:** Técnico responsable
- **Asunto:** Descripción del problema
- **Oficina:** Ubicación del solicitante
- **Creado:** Fecha y hora (formato argentino)

---

## 5. Reportes

### 📈 **Acceso a Reportes**

1. **Navegar a "Reporte"** desde el menú lateral
2. Se abrirá el **"Reporte Personalizado"**

### 📊 **Tipos de Reportes Disponibles**

#### **🎯 Métricas por Estado:**
- Distribución de tickets por estado actual
- Gráfico de barras interactivo
- Porcentajes y totales

#### **⚡ Métricas por Prioridad:**
- Análisis de urgencia de tickets
- Identificación de problemas críticos
- Tendencias de prioridad

#### **👥 Métricas por Técnico:**
- Carga de trabajo por técnico
- Productividad y asignaciones
- Comparativa de rendimiento

#### **🏢 Métricas por Oficina:**
- Tickets por ubicación
- Identificación de áreas problemáticas
- Distribución geográfica

### 📅 **Filtros de Tiempo**

#### **Rangos Predefinidos:**
- **Hoy:** Actividad del día
- **Esta Semana:** Últimos 7 días
- **Este Mes:** Mes calendario actual
- **Últimos 3 Meses:** Tendencias trimestrales

#### **Rango Personalizado:**
- **Fecha Desde:** Seleccionar fecha inicial
- **Fecha Hasta:** Seleccionar fecha final
- **Aplicar Filtro:** Actualizar reporte

### 📋 **Exportación de Datos**

#### **Formatos Disponibles:**
- **PDF:** Reporte formateado para impresión
- **Excel:** Datos para análisis posterior
- **CSV:** Importación a otras herramientas
- **PNG/JPG:** Gráficos para presentaciones

#### **Proceso de Exportación:**
1. **Configurar filtros** deseados
2. **Hacer clic en "Exportar"**
3. **Seleccionar formato**
4. **Descargar archivo**

---

## 6. Gestión de Usuarios

> 🔒 **Nota:** Esta sección solo está disponible para usuarios con rol **Administrador**.

### 👥 **Acceso a Usuarios**

1. **Navegar a "Usuarios"** desde el menú lateral
2. Se mostrará la **lista de usuarios** del sistema

### 📋 **Información de Usuarios**

#### **Datos Visibles:**
- **ID:** Identificador único
- **Nombre:** Nombre completo
- **Email:** Dirección de correo
- **Rol:** Admin, Técnico, Usuario
- **Estado:** Activo/Inactivo
- **Fecha de Creación:** Cuándo se creó la cuenta
- **Último Acceso:** Última vez que ingresó

### ➕ **Crear Nuevo Usuario**

#### **Proceso:**
1. **Hacer clic en "Nuevo Usuario"**
2. **Completar formulario:**
   - **Nombre completo**
   - **Email** (será el usuario de acceso)
   - **Contraseña inicial**
   - **Confirmar contraseña**
   - **Rol:** Seleccionar nivel de acceso
   - **Estado:** Activo/Inactivo

3. **Hacer clic en "Crear Usuario"**
4. **Confirmación:** El usuario recibirá sus credenciales

### ✏️ **Editar Usuario**

#### **Modificar Datos:**
1. **Hacer clic en el ícono de "Editar"** en la fila del usuario
2. **Modificar campos necesarios:**
   - Cambiar nombre
   - Actualizar email
   - Modificar rol
   - Activar/desactivar cuenta

3. **Guardar cambios**

#### **Resetear Contraseña:**
1. **Seleccionar usuario**
2. **Hacer clic en "Resetear Contraseña"**
3. **Generar nueva contraseña temporal**
4. **Enviar credenciales al usuario**

### 🗑️ **Eliminar Usuario**

#### **Proceso de Eliminación:**
1. **Hacer clic en ícono "Eliminar"**
2. **Confirmar acción** en el diálogo
3. **El usuario será desactivado** (no eliminado completamente)

> ⚠️ **Importante:** Los usuarios no se eliminan físicamente para mantener la integridad de los datos históricos.

---

## 7. Configuración de Perfil

### 👤 **Acceso al Perfil**

1. **Hacer clic en tu nombre** en la esquina superior derecha
2. **Seleccionar "Perfil"** o **"Editar Perfil"**

### ✏️ **Editar Información Personal**

#### **Datos Modificables:**
- **Nombre completo**
- **Email de contacto**
- **Información adicional**

#### **Proceso de Edición:**
1. **Hacer clic en "Editar Perfil"**
2. **Modificar campos deseados**
3. **Hacer clic en "Guardar Cambios"**
4. **Confirmación** de actualización exitosa

### 🔐 **Cambiar Contraseña**

#### **Proceso de Cambio:**
1. **Ir a "Cambiar Contraseña"**
2. **Completar formulario:**
   - **Contraseña actual**
   - **Nueva contraseña**
   - **Confirmar nueva contraseña**

3. **Validaciones:**
   - Mínimo 8 caracteres
   - Al menos una mayúscula
   - Al menos un número
   - Al menos un carácter especial

4. **Guardar nueva contraseña**

### 🎨 **Preferencias de Interfaz**

#### **Configuraciones Disponibles:**
- **Tema:** Claro/Oscuro
- **Idioma:** Español (predeterminado)
- **Zona horaria:** Argentina/Buenos_Aires

---

## 8. Roles y Permisos

### 🔐 **Tipos de Usuarios**

#### **👑 Administrador**
**Permisos completos:**
- ✅ Ver todos los tickets
- ✅ Modificar estados y prioridades
- ✅ Asignar tickets a cualquier técnico
- ✅ Gestionar usuarios (crear, editar, eliminar)
- ✅ Acceso a todos los reportes
- ✅ Configurar sistema
- ✅ Ver logs y auditoría

#### **🔧 Técnico**
**Permisos operativos:**
- ✅ Ver tickets asignados
- ✅ Modificar estado de tickets propios
- ✅ Actualizar prioridades
- ✅ Ver reportes básicos
- ✅ Editar perfil propio
- ❌ Gestionar otros usuarios
- ❌ Configuraciones del sistema


### 🛡️ **Seguridad del Sistema**

#### **Autenticación:**
- **JWT Tokens** con expiración de 24 horas
- **Sesión única** por usuario
- **Logout automático** por inactividad

#### **Autorización:**
- **Validación de roles** en cada acción
- **Acceso basado en permisos**
- **Auditoría de acciones**

---

## 9. Preguntas Frecuentes

### ❓ **Acceso y Login**

**P: ¿Qué hago si olvidé mi contraseña?**
R: Contacta al administrador del sistema para que resetee tu contraseña.

**P: ¿Por qué no puedo acceder al sistema?**
R: Verifica que:
- Tu usuario esté activo
- La contraseña sea correcta
- Tengas conexión a la red interna

**P: ¿El sistema funciona en móviles?**
R: Sí, el Panel Web T-BOT es completamente responsive y funciona en tablets y móviles.

### 🎫 **Gestión de Tickets**

**P: ¿Cómo sé si un ticket es urgente?**
R: Los tickets urgentes aparecen con color naranja, y los inmediatos con color rojo.

**P: ¿Puedo asignarme tickets a mí mismo?**
R: Sí, selecciona tu nombre en el dropdown "Asignado a".

**P: ¿Los cambios se guardan automáticamente?**
R: Sí, todos los cambios de estado, prioridad y asignación se guardan inmediatamente.

### 📊 **Reportes**

**P: ¿Con qué frecuencia se actualizan los datos?**
R: Los datos se actualizan en tiempo real desde Redmine.

**P: ¿Puedo programar reportes automáticos?**
R: Actualmente no, pero puedes exportar reportes manualmente cuando los necesites.

### 👥 **Usuarios**

**P: ¿Puedo cambiar mi propio rol?**
R: No, solo los administradores pueden modificar roles de usuarios.

**P: ¿Qué pasa si elimino un usuario por error?**
R: Los usuarios se desactivan, no se eliminan. Un administrador puede reactivarlos.

---

## 10. Soporte Técnico

### 📞 **Contactos de Soporte**

#### **Equipo de Desarrollo:**
- **Joaquín Juárez**
  - Cel: 3815978765

- **Gustavo Salva**
  - Cel: 3814688720

- **José Ruiz**
  - Cel: 3815071763

#### **Soporte de MPF:**
- **Mesa de Ayuda:** [número interno]
- **Email:** soporte@mpftucuman.gob.ar

### 🐛 **Reportar Problemas**

#### **Información a incluir:**
1. **Descripción detallada** del problema
2. **Pasos para reproducir** el error
3. **Navegador y versión** utilizada
4. **Captura de pantalla** si es posible
5. **Usuario afectado** y hora del incidente

#### **Canales de Reporte:**
- **Email directo** al equipo de soporte

### 🚨 **Problemas Comunes**

#### **No puedo iniciar sesión:**
1. Verificar credenciales
2. Comprobar conexión de red
3. Intentar desde otro navegador
4. Contactar administrador

#### **La página no carga:**
1. Refrescar la página (F5)
2. Limpiar caché del navegador
3. Verificar conexión a internet
4. Reportar al soporte técnico

#### **Los datos no se actualizan:**
1. Hacer clic en "Actualizar"
2. Verificar conexión con Redmine
3. Reportar persistencia del problema

---

## 📚 **Recursos Adicionales**

### 🎓 **Capacitación**
- **Videos tutoriales** disponibles en la intranet
- **Sesiones de capacitación** programadas mensualmente
- **Documentación técnica** para administradores

### 🔗 **Enlaces Útiles**
- **Redmine MPF:** https://incidentes.mpftucuman.gob.ar/
- **Manual de Instalación:** Ver archivo correspondiente

---

## 📄 **Información del Documento**

**📅 Fecha de Creación:** 21 de Julio de 2025  
**🏢 Organización:** MPF Tucumán  
**🤖 Sistema:** T-BOT - Panel Web de Gestión de Tickets  
**📝 Versión:** 1.0  
**👥 Dirigido a:** Usuarios finales, Técnicos y Administradores  

---

*Este manual cubre todas las funcionalidades principales del Panel Web T-BOT. Para consultas específicas o nuevas funcionalidades, contactar al equipo de soporte técnico.*
