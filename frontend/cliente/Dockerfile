FROM node:22.11-slim as build

# Instalar git para clonar el repositorio
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Clonar solo el frontend usando sparse checkout
RUN git clone --filter=blob:none --sparse https://github.com/tu-usuario/TBOT_BOTPRESS.git . && \
    git sparse-checkout set frontend && \
    cd frontend/cliente && \
    npm install && \
    npm run build && \
    npm cache clean --force

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos compilados desde la etapa de build
COPY --from=build /app/frontend/cliente/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto de Nginx
CMD ["nginx", "-g", "daemon off;"]
