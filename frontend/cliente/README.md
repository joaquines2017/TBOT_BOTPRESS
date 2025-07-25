#  T-BOT Frontend Cliente

## Descripción
Panel web del sistema T-BOT construido con React y Vite, que proporciona una interfaz de usuario moderna para la gestión de tickets y usuarios.

## Tecnologías
- **React 19.0.0** - Framework de UI
- **Vite 7.0.3** - Build tool y dev server
- **CoreUI 5.3.1** - Biblioteca de componentes UI
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento
- **JWT** - Manejo de autenticación

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Scripts Disponibles

```bash
# Desarrollo (puerto 3000)
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview

# Linting
npm run lint
```

## Configuración

El cliente se conecta al backend a través de variables de entorno:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

## Estructura de Componentes

```
src/
 components/           # Componentes reutilizables
 views/               # Páginas/Vistas principales  
 contexts/            # React Contexts
 assets/              # Recursos estáticos
 scss/                # Estilos personalizados
```

## Notas de Despliegue

Para clonar solo el frontend:
```bash
git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git frontend-deploy
cd frontend-deploy
git sparse-checkout set frontend
cd frontend/cliente
npm install
npm run build
```
