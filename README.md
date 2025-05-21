# 🎮 Bot de Ofertas Steam (Telegram + Firebase + Puppeteer)

Este bot de Telegram notifica automáticamente ofertas de videojuegos en Steam. Usa Web Scraping con Puppeteer, almacena los datos en Firebase y permite suscribirse para recibir alertas. Desarrollado en Node.js y desplegado en Docker para operación 24/7.

---

## 🚀 Características principales

- 🔎 Scraping completo con scroll infinito para detectar **todas las ofertas activas**.
- 📤 Notificaciones automáticas para:
  - Nuevas ofertas
  - Ofertas finalizadas
- 🧠 Limpieza automática de ofertas vencidas y ofertas sin fecha
- ☁️ Base de datos en **Firebase Firestore**
- 🧼 Comandos de limpieza y monitoreo para administrador
- 🐳 **Docker-ready** para ejecución continua en servidor

---

## 🧩 Comandos disponibles

### Comandos para todos los usuarios

- `/start` – Suscribirse a las notificaciones
- `/stop` – Cancelar la suscripción
- `/ultimos` – Ver las 10 ofertas más recientes

### Comandos para administrador (definido por `ADMIN_ID`)

- `/totaljuegos` – Ver total de juegos registrados en Firebase
- `/limpiar_huerfanos` – Eliminar juegos sin fecha de expiración

---

## 🛠️ Requisitos

- Node.js 20+
- Firebase Firestore (con `firebase_key.json`)
- Docker & Docker Compose
- Bot de Telegram (con su token)

---

## 🔐 Variables `.env`

Crea un archivo `.env` con el siguiente contenido:

```env
BOT_TOKEN=tu_token_de_telegram
ADMIN_ID=123456789
```
