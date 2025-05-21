FROM node:20-bullseye

# Variables para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Crear directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libglib2.0-0 \
  libdrm2 \
  libgbm1 \
  libxshmfence1 \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Instalar Chrome estable
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get update && \
    apt-get install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias del proyecto
RUN npm install

# Dar permisos de ejecución al script
RUN chmod +x entrypoint.sh

# Establecer zona horaria
ENV TZ=America/Caracas

EXPOSE 80

ENTRYPOINT ["./entrypoint.sh"]
