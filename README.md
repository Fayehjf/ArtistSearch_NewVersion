# 🎨 Artist Search Platform
This full‑stack web application lets users search the Artsy art database, explore artists and their works, and curate a personal “favorite artists” list. It is built with an Angular 17 + TypeScript frontend and a Node.js 20 / Express backend that proxies all Artsy requests and persists user data in MongoDB Atlas. Everything is containerised and deployed to Google Cloud App Engine, so a single publicly‑hosted URL serves both the SPA and its JSON API. ​

---

## ✨ Demo

> Live site: **https://artistsearch9898.wl.r.appspot.com/search**

Search Aritst as guest
| Desktop | Mobile |
|---------|--------|
| ![image](https://github.com/user-attachments/assets/4224a9b7-4a63-402e-80ac-85d7e2d44b40)| ![image](https://github.com/user-attachments/assets/f9b031ad-1482-4656-8a21-56a3d23e05bd)|



---

## 📚 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [API Reference](#api-reference)
6. [Project Structure](#project-structure)
7. [Roadmap](#roadmap)
8. [Contributing](#contributing)

---

## 🌟 Features

| Category | Highlights |
|----------|-----------|
| **Search** | Artsy-powered artist search with debounced input, spinner feedback, and graceful “no results” handling. |
| **Artist Details** | Biography, nationality, lifespan, artworks tab, category modal, and “similar artists” carousel. |
| **Favorites** | Authenticated users can star/unstar artists, view a “newest‑first” favorites page with live “x minutes ago” timers. |
| **Authentication** | Register / Login / Logout / Delete‑account using JWTs in **HTTP‑only cookies**, passwords hashed with **bcrypt**. |
| **Global Toaster** | Stackable Bootstrap toasts for favorites, auth events, etc. auto‑dismiss after 3 s. |
| **Responsive UI** | Looks great on iPhone 14 Pro Max down to 360 px wide; tested with Chrome DevTools. |
| **CI/CD** | GitHub Actions → `gcloud app deploy`; single URL

---

## 🏛 Architecture

```text
┌────────────────────────────────────────────────────────┐
│                  Google App Engine                     │
│  ┌──────────────┐       ┌───────────────────────────┐  │
│  │   Frontend   │       │          Backend          │  │
│  │  Angular 17  │  ←→   │ Express  Node.js 20       │  │
│  └──────────────┘       │  • Artsy proxy endpoints  │  │
│                         │  • JWT + Cookie auth      │  │
│     MongoDB Atlas ←─────┴─►• Favorites persistence  │  │
│                         │  • bcrypt password hash   │  │
└─────────────────────────┴──────────────────────────────┘
```

---

## ⚙️ Tech Stack
| Layer       | Technology |
|-------------|------------|
| **Frontend**| Angular 17 · TypeScript · RxJS · Bootstrap 5 · SCSS |
| **Backend** | Node.js 20 · Express · Axios · bcrypt · jsonwebtoken · cookie‑parser |
| **Database**| MongoDB Atlas (free tier) |
| **CI / CD** | GitHub Actions · Google Cloud App Engine |

---

## 🚀 Getting Started
### Prerequisites
- Node 20+ & npm 9+
- Angular CLI 17 (`npm install -g @angular/cli`)
- A free MongoDB Atlas cluster
- (Optional) Google Cloud SDK (`gcloud`)

### 1. Clone & Install
```bash
git clone https://github.com/<USER>/<REPO>.git
cd <REPO>

# Install backend dependencies
cd backend && npm ci

# Install frontend dependencies
cd ../frontend && npm ci

```

### 2. Environment Variables

Create a file backend/.env with the following contents:

```env

PORT=8080
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/artistsearch
ARTSY_CLIENT_ID=<your_artsy_client_id>
ARTSY_CLIENT_SECRET=<your_artsy_client_secret>
FRONTEND_URL=http://localhost:4200

```
### 1. Clone & Install
```bash
git clone https://github.com/<USER>/<REPO>.git
cd <REPO>

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

```
### 3. Run Locally
```bash
# In terminal 1 (backend)
cd backend && node app.js      # nodemon on http://localhost:3000

# In terminal 2 (frontend)
cd frontend && ng serve       # ng serve on http://localhost:4200

```

### 4. Build & Deploy
```bash
# Build Angular app into backend/public
cd frontend && ng build

# Move the /dist to backend/public

# Deploy full app to Google App Engine
gcloud app deploy

```
