# 🎨 Artist Search Platform
This full‑stack web application lets users search the Artsy art database, explore artists and their works, and curate a personal “favorite artists” list. It is built with an Angular 17 + TypeScript frontend and a Node.js 20 / Express backend that proxies all Artsy requests and persists user data in MongoDB Atlas. Everything is containerised and deployed to Google Cloud App Engine, so a single publicly‑hosted URL serves both the SPA and its JSON API. ​

> Full‑stack web app for discovering artists & artworks via the Artsy API,  
> built with Angular 17 + Bootstrap 5 on the front end and Node.js 20 / Express on the back end.

[![Deploy to GCP](https://img.shields.io/badge/GCP-App%20Engine-blue?logo=googlecloud)](https://<your‑project>.appspot.com)
[![Build](https://img.shields.io/github/actions/workflow/status/<USER>/<REPO>/ci.yml?label=Build&logo=github)](https://github.com/<USER>/<REPO>/actions)
[![License](https://img.shields.io/github/license/<USER>/<REPO>)](LICENSE)

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
9. [License](#license)

---

## Features

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

## Architecture

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
