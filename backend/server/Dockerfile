FROM node:22.11-slim

# Instalar git para clonar el repositorio
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Clonar solo el backend usando sparse checkout
RUN git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git . && \
    git sparse-checkout set backend && \
    cd backend/server && \
    npm install --production && \
    npm cache clean --force

# Cambiar al directorio del servidor
WORKDIR /app/backend/server

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Comando para iniciar el servidor
CMD ["npm", "start"]
