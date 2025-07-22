# Scripts de Base de Datos - TBot Web

## 📁 Archivos Esenciales

### **Scripts de Instalación Principal:**
- `install_web_tbot.sql` - **PRINCIPAL**: Instalación completa de la base de datos web-tbot
- `install_web_tbot_limpio.sql` - Instalación limpia sin datos de ejemplo

### **Scripts de Migración:**
- `migrar_datos_tbot.sql` - Migración de datos desde la base anterior
- `extraer_usuarios_tbot.sql` - Extracción específica de usuarios

### **Scripts de Verificación:**
- `verificar_migracion.sql` - Verificar que la migración fue exitosa
- `verificacion_final.sql` - Verificación completa del sistema

## 📁 Scripts Alternativos (Opcionales)

### **Instalación por Módulos:**
- `01_create_database.sql` - Crear base de datos
- `02_create_tables.sql` - Crear tablas
- `03_create_indexes.sql` - Crear índices
- `04_create_views.sql` - Crear vistas
- `05_initial_data.sql` - Datos iniciales
- `06_functions.sql` - Funciones y triggers

### **Otros:**
- `ejecutar_migracion.sql` - Script de migración alternativo
- `GARANTIA_COMPATIBILIDAD.md` - Documentación de compatibilidad

## 🚀 Uso Recomendado

### Para nueva instalación:
```sql
psql -U postgres -f install_web_tbot.sql
```

### Para migración desde sistema anterior:
```sql
psql -U postgres -f install_web_tbot.sql
psql -U postgres -d web-tbot -f migrar_datos_tbot.sql
psql -U postgres -d web-tbot -f verificar_migracion.sql
```

## 📋 Estado Actual

La base de datos **web-tbot** ya está instalada y funcionando correctamente.
Estos scripts se mantienen para:
- Instalaciones futuras
- Respaldos
- Documentación del proceso
