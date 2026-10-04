# Stage 1: Build-Prozess
FROM node:20-alpine AS build
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY package.json package-lock.json ./
RUN npm ci

# Quellcode kopieren und Build ausführen
COPY . .
RUN npm run build

# Stage 2: Nginx Webserver
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]