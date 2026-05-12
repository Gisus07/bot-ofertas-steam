<h1 align="center">
  🎮 Steam Offers Tracker
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/status-refactor_in_progress-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/version-v1_(legacy)-yellow?style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
</p>

---

## 🇪🇸 Sobre el proyecto

**Steam Offers Tracker** es un bot de Telegram que notifica automáticamente ofertas de videojuegos en Steam mediante web scraping. Permite a los usuarios suscribirse para recibir alertas de nuevas ofertas, ofertas finalizadas, y consultar las más recientes.

**Estado actual:** la versión 1 está pausada. Originalmente desarrollada con Node.js + Puppeteer + Firebase + Telegram Bot API, sirvió como primer experimento de scraping automatizado. Actualmente está pendiente de un **refactor completo** con un stack más sólido.

## 🇬🇧 About the project

**Steam Offers Tracker** is a Telegram bot that automatically notifies Steam video game deals via web scraping. Users can subscribe to receive alerts for new offers, expired offers, and check the latest ones.

**Current status:** v1 is paused. Originally built with Node.js + Puppeteer + Firebase + Telegram Bot API, it served as my first automated scraping experiment. A complete **refactor** is planned with a more robust stack.

---

## 🛣️ Roadmap

### ✅ v1 (current — paused)
- Web scraping con Puppeteer
- Almacenamiento en Firebase Firestore
- Bot de Telegram con suscripciones básicas
- Dockerizado para ejecución 24/7

### 🚧 v2 (planned)
- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Scraping:** revaluación entre Puppeteer / Playwright / API alternativas
- **Architecture:** modular con jobs programados
- **Public access:** cualquier usuario podrá suscribirse vía Telegram sin restricciones
- **Optional:** API REST pública para consumo externo

### 🔮 v3 (ideas)
- Wishlist personalizada por usuario
- Soporte multi-tienda (Epic Games, GOG, Humble Bundle)
- Notificaciones por descuento mínimo configurable
- Dashboard web opcional

---

## 📋 v1 — Documentación legacy

> ⚠️ Esta sección describe la versión actual (pausada). Servirá de referencia para el refactor.

### Características principales (v1)

- 🔍 Scraping completo con scroll infinito para detectar **todas las ofertas activas**
- 📬 Notificaciones automáticas de nuevas ofertas y ofertas finalizadas
- 🧹 Limpieza automática de ofertas vencidas
- 💾 Base de datos en Firebase Firestore
- 🛠️ Comandos de administración para limpieza y monitoreo
- 🐳 Docker-ready para ejecución continua

### Comandos disponibles (v1)

**Para todos los usuarios:**
- `/start` — Suscribirse a las notificaciones
- `/stop` — Cancelar la suscripción
- `/ultimos` — Ver las 10 ofertas más recientes

**Para administrador (definido por `ADMIN_ID`):**
- `/totaljuegos` — Ver total de juegos registrados en Firebase
- `/limpiar_huerfanos` — Eliminar juegos sin fecha de expiración

### Stack (v1)

![Node.js](https://img.shields.io/badge/-Node.js_20+-339933?style=flat-square&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Puppeteer](https://img.shields.io/badge/-Puppeteer-40B5A4?style=flat-square&logo=puppeteer&logoColor=white)
![Firebase](https://img.shields.io/badge/-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Telegram](https://img.shields.io/badge/-Telegram_Bot-26A5E4?style=flat-square&logo=telegram&logoColor=white)

### Variables `.env` (v1)

```env
BOT_TOKEN=tu_token_de_telegram
ADMIN_ID=123456789
```

Adicionalmente requiere `firebase_key.json` con las credenciales de Firebase.

---

## 👤 Autor

**Jesús Rodrigues** ([@Gisus07](https://github.com/Gisus07)) — Caracas, Venezuela 🇻🇪

---

<p align="center">
  <sub>
    First built in 2025 as a learning experiment. <br>
    Currently being redesigned with lessons learned along the way.
  </sub>
</p>
