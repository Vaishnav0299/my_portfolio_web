# 🚀 Vaishnav Gaware — Engineering Portfolio & Web Application

> A modern, production-ready, interactive developer portfolio web application built with **React 18**, **Vite 5**, **React Router v7**, **Three.js WebGL graphics**, and a custom **Glassmorphism CSS Design System**. Designed to showcase engineering projects spanning **Full-Stack Web Development**, **Artificial Intelligence**, **Machine Learning**, and **Data Analytics**.
>
> 🌐 **Live Application**: [https://portfolio-vaishnav.me)

---

## 📌 Table of Contents

1. [👨‍💻 Developer Profile &amp; Bio](#-developer-profile--bio)
2. [✨ Portfolio Web App Architecture &amp; Features](#-portfolio-web-app-architecture--features)
3. [📂 Comprehensive Featured Projects Breakdown](#-comprehensive-featured-projects-breakdown)
   - [1. Sales Analytics &amp; Customer Churn Prediction](#1-sales-analytics--customer-churn-prediction)
   - [2. Productivity-Pro](#2-productivity-pro)
   - [3. My Study Assistant](#3-my-study-assistant)
   - [4. Deskify](#4-deskify)
   - [5. Form-Builder](#5-form-builder)
   - [6. Mentor Backend Service](#6-mentor-backend-service)
4. [🛠️ Technical Skills &amp; Competencies](#️-technical-skills--competencies)
5. [⏳ Career &amp; Milestone Timeline](#-career--milestone-timeline)
6. [🖥️ Interactive Systems &amp; UI Features](#️-interactive-systems--ui-features)
   - [Interactive Terminal Emulator (Dev CLI)](#interactive-terminal-emulator-dev-cli)
   - [Interactive Command Palette (Ctrl+K)](#interactive-command-palette-ctrlk)
   - [3D WebGL Canvas &amp; Micro-Animations](#3d-webgl-canvas--micro-animations)
7. [📁 Repository Structure](#-repository-structure)
8. [🚀 Local Setup &amp; Installation Guide](#-local-setup--installation-guide)
9. [🌐 Deployment Configuration (Vercel)](#-deployment-configuration-vercel)
10. [📫 Contact &amp; Social Links](#-contact--social-links)

---

## 👨‍💻 Developer Profile & Bio

| Attribute                | Details                                                                                                           |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Name**           | **Vaishnav Gaware**                                                                                         |
| **Current Role**   | Full-Stack Developer & AI Systems Engineer                                                                        |
| **Education**      | **B.E. Artificial Intelligence & Data Science**                                                             |
| **Location**       | Pune, Maharashtra, India                                                                                          |
| **Email**          | `vaishnavgaware1@gmail.com`                                                                                     |
| **GitHub**         | [github.com/Vaishnav0299](https://github.com/Vaishnav0299)                                                         |
| **LinkedIn**       | [linkedin.com/in/vaishnav-gaware-107799315/](https://www.linkedin.com/in/vaishnav-gaware-107799315/)               |
| **Live Portfolio** | [portfolio-build-by-vaishnav.vercel.app](https://portfolio-build-by-vaishnav.vercel.app)                           |
| **Primary Focus**  | Web Architectures, Microservices, Agentic AI Workflows, Predictive ML, Cloud Infrastructure & Systems Engineering |

### Summary

Full-Stack Developer and AI & Data Science undergraduate building production-grade web applications, machine learning-driven systems, and automated data pipelines. Proficient across the entire stack — utilizing **React**, **Next.js**, and **Node.js** for modern web applications, alongside **Python**, **Scikit-Learn**, **Pandas**, and **Ollama/LangChain** for data science, machine learning, and AI tooling.

---

## ✨ Portfolio Web App Architecture & Features

This repository (`portfolio-v1.0`) contains the full codebase for Vaishnav Gaware's interactive portfolio platform.

```
                   ┌─────────────────────────────────────────┐
                   │         Browser Client (User)          │
                   └──────────────────┬──────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               │         React Router v7 / Vite App           │
               └──────┬───────────────────────┬──────────────┘
                      │                       │
      ┌───────────────▼───────────┐    ┌──────▼─────────────────────┐
      │   UI Pages & Components   │    │    Interactive Engines     │
      │  • Home & Metrics         │    │  • Three.js WebGL Canvas   │
      │  • Project Modals         │    │  • Dev CLI Terminal        │
      │  • Skill Matrices         │    │  • Command Palette (⌘K)    │
      │  • Contact Form (Web3)    │    │  • 3D Spatial Tilt Shader │
      └───────────────────────────┘    └────────────────────────────┘
```

### Core Architecture Highlights

* **High-Performance Bundling**: Built with **Vite 5** for near-instant hot module replacement (HMR) and optimized production bundles.
* **Declarative Client Routing**: Powered by **React Router v7** with seamless single-page application (SPA) page navigation.
* **3D Particle Canvas**: Custom **Three.js** canvas renderer (`ThreeBackground.jsx`) generating interactive particle mesh visualizers and dynamic ambient light orbs.
* **3D Spatial Card Tilt Effect**: Custom event listener hook applying real-time 3D perspective rotation (`perspective(1000px) rotateX(...) rotateY(...)`) on mouse move across cards.
* **Theme System**: Dynamic Light/Dark mode supporting seamless toggle with CSS custom properties (`data-theme` root attribute persistence).
* **Zero UI Library Bloat**: Engineered using clean, custom Vanilla CSS (`index.css`) for ultimate performance, precise responsive breakpoints, and glassmorphism styling.

---

## 📂 Comprehensive Featured Projects Breakdown

The portfolio showcases **6 flagship engineering projects** covering Data Science, Full-Stack Web Development, AI Automation, Web Utilities, and Backend APIs:

---

### 1. Sales Analytics & Customer Churn Prediction

* **Category**: Data Analytics & Machine Learning
* **Status**: Completed | ⭐ 1 GitHub Star
* **Links**: [GitHub Repository](https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction) | [Live Demo](https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction)

#### Overview

An end-to-end data analytics and machine learning pipeline for retail/e-commerce environments. It delivers exploratory sales analysis, KPI/cohort retention reporting, feature engineering, and a Scikit-Learn prediction model to evaluate customer churn probability with real-time Streamlit UI inference.

#### Key Features

* **Exploratory Data Analysis (EDA)**: Sales performance metrics, cohort retention heatmaps, customer lifetime value (CLV) analysis, and RFM segmentation.
* **Churn Prediction Pipeline**: Scikit-Learn classification model trained on engineered customer behavioral features.
* **Interactive Streamlit Web App**: Live model inference interface allowing users to input customer parameters and evaluate churn probability in real time.
* **Executive Deliverables**: Exported KPI reports and reproducible Jupyter Notebook pipeline.

#### Tech Stack & Architecture

`Python` • `Scikit-Learn` • `Pandas` • `NumPy` • `Streamlit` • `Jupyter Notebook` • `Seaborn`

> **Architecture**: Modular Python data pipeline executing EDA via Pandas/Seaborn, feature scaling & classification via Scikit-Learn pipelines, and UI serving via Streamlit.

---

### 2. Productivity-Pro

* **Category**: Full-Stack Collaborative Workspace
* **Status**: Production Ready | ⭐ 12 GitHub Stars
* **Links**: [GitHub Repository](https://github.com/Vaishnav0299/Productivity-Pro) | 🌐 [Live App Deployment](https://productivity-pro-bay.vercel.app)

#### Overview

An enterprise-ready collaborative workspace application built for engineering and product teams requiring sub-millisecond collaboration, live document synchronization, drag-and-drop workflow automation, and structured task management.

#### Key Features

* **Real-time Document Collaboration**: Multi-user live document editing with presence indicators and cursor position synchronization.
* **Kanban Task Engine**: Drag-and-drop workflow board with automated state transitions, tag filtering, and priority management.
* **Role-Based Access Control (RBAC)**: Granular permission controls (Admin, Editor, Viewer) and administrative audit logging panels.
* **Custom Theme System**: Light and dark mode support with CSS modules and fluid multi-device layouts.

#### Tech Stack & Architecture

`TypeScript` • `React` • `Next.js` • `Tailwind CSS` • `Node.js` • `WebSockets`

> **Architecture**: Next.js client with TypeScript. State managed via optimistic UI updates and low-latency WebSocket channels for real-time multi-client synchronization.

---

### 3. My Study Assistant

* **Category**: AI & Intelligent Automation
* **Status**: Active Development | ⭐ 18 GitHub Stars
* **Links**: [GitHub Repository](https://github.com/Vaishnav0299/my-study-assistant) | 🌐 [Live App Deployment](https://my-study-assistant-ten.vercel.app)

#### Overview

An intelligent study platform designed for note organization, automated flashcard generation, topic summaries, and interactive AI study workflows powered by LLMs and Natural Language Processing.

#### Key Features

* **Automated Summarization**: Extracts key concepts, definitions, and high-yield study notes from raw lecture slides and documents.
* **Flashcard Generation & Spaced Repetition**: Automatically generates quiz decks formatted for spaced-repetition memory retention algorithms.
* **Interactive AI Tutor Chatbot**: Context-aware RAG/prompt-engineered assistant that answers questions grounded directly in user-uploaded notes.
* **Multi-Format Export**: Supports export of study sets into Anki decks, JSON, and printable PDFs.

#### Tech Stack & Architecture

`JavaScript` • `React` • `Node.js` • `Express` • `AI LLM APIs` • `Tailwind CSS`

> **Architecture**: React SPA frontend communicating with an asynchronous Node.js microservice API. Employs prompt engineering pipelines and semantic text chunking.

---

### 4. Deskify

* **Category**: Web Utility & Image Processing
* **Status**: Completed | ⭐ 9 GitHub Stars
* **Links**: [GitHub Repository](https://github.com/Vaishnav0299/Deskify) | [Live Demo](https://github.com/Vaishnav0299/Deskify)

#### Overview

A lightweight, 100% client-side web utility that converts vertical mobile wallpapers into widescreen desktop backgrounds instantly with zero server uploads, zero tracking, and hardware-accelerated canvas shaders.

#### Key Features

* **100% Client-Side Engine**: Performs image transformations in-browser using HTML5 Canvas with zero backend latency or privacy concerns.
* **Intelligent Edge Blur & Color Sampling**: Generates matching background extensions using color sampling and hardware-accelerated Gaussian blur shaders.
* **High-DPI 4K Rendering**: Renders canvas outputs up to 4K resolutions with customizable blur radius and aspect ratios.
* **Drag-and-Drop Canvas**: Instant image upload, preview controls, and client-side download triggers.

#### Tech Stack & Architecture

`TypeScript` • `HTML5 Canvas API` • `WebGL Shaders` • `CSS3`

> **Architecture**: Built entirely in pure TypeScript using native HTML5 Canvas API calculations and WebGL blur routines for instant GPU processing.

---

### 5. Form-Builder

* **Category**: Full-Stack Tool & Form Engine
* **Status**: Completed | ⭐ 7 GitHub Stars
* **Links**: [GitHub Repository](https://github.com/Vaishnav0299/Form-Builder) | [Live Demo](https://github.com/Vaishnav0299/Form-Builder)

#### Overview

A dynamic drag-and-drop form creation engine featuring customizable field validation, interactive preview controls, responsive layout inspection, and live JSON schema generation.

#### Key Features

* **Drag-and-Drop Builder Canvas**: Supports text inputs, textareas, dropdown selections, checkboxes, radio groups, and date pickers.
* **Custom Validation Engine**: Visual builder for Regex rules, min/max length constraints, custom error messages, and required fields.
* **Real-time JSON Schema Export**: Generates standardized JSON Schema structures for easy backend consumption or form serialization.
* **Device Preview Controls**: Live responsive preview modal testing forms on Mobile, Tablet, and Desktop viewport sizes.

#### Tech Stack & Architecture

`TypeScript` • `React` • `Tailwind CSS` • `JSON Schema`

> **Architecture**: React state machine handling drag-and-drop event targets, serializing dynamic form trees into compliant JSON Schema models.

---

### 6. Mentor Backend Service

* **Category**: Backend Microservice & API
* **Status**: Maintained | ⭐ 11 GitHub Stars
* **Links**: [GitHub Repository](https://github.com/Vaishnav0299/mentor-backend) | [Live Demo](https://github.com/Vaishnav0299/mentor-backend)

#### Overview

A scalable Node.js RESTful API microservice supporting mentorship matching workflows, mentor availability scheduling, secure authentication, and database persistence.

#### Key Features

* **Authentication & Authorization**: Secure JWT authentication with refresh token rotation and password hashing.
* **Mentorship Slot Booking Engine**: Algorithmic scheduling avoiding slot overlap and managing mentor-mentee session requests.
* **Relational & NoSQL Schemas**: Optimized PostgreSQL / MongoDB database access patterns with indexed queries.
* **API Documentation**: Fully documented RESTful endpoints structured according to OpenAPI / Swagger standards.

#### Tech Stack & Architecture

`JavaScript` • `Node.js` • `Express` • `PostgreSQL` • `MongoDB` • `REST API`

> **Architecture**: Node.js Express application following the Controller-Service-Repository structural pattern with input validation middleware and global error handling.

---

## 🛠️ Technical Skills & Competencies

```
  Frontend Architecture ───────────► React, Next.js, TypeScript, Tailwind CSS (95%)
  Backend & Cloud APIs ───────────► Node.js, Express, Python, FastAPI, REST/GraphQL (90%)
  Databases & Infrastructure ──────► PostgreSQL, MongoDB, ChromaDB, Docker, AWS (88%)
  AI, ML & Data Science ──────────► LangChain, Scikit-Learn, Pandas, TensorFlow (92%)
```

### Detailed Skills Matrix

| Category                             | Core Technologies & Frameworks                                                          | Proficiency Level |
| :----------------------------------- | :-------------------------------------------------------------------------------------- | :---------------: |
| **Frontend Architecture**      | React.js, Next.js, TypeScript, JavaScript (ES6+), Tailwind CSS, HTML5, CSS3             |   **95%**   |
| **Backend & Cloud APIs**       | Node.js, Express, Hono, Python, FastAPI, RESTful APIs, GraphQL                          |   **90%**   |
| **Databases & Infrastructure** | PostgreSQL, MongoDB, ChromaDB, Redis, Docker, AWS, CI/CD GitHub Actions                 |   **88%**   |
| **AI, ML & Data Science**      | LangChain, Ollama Multi-Agent Systems, Scikit-Learn, TensorFlow, Pandas, NumPy, Jupyter |   **92%**   |

---

## ⏳ Career & Milestone Timeline

```
  2023                        2024                        2025                        2026
  Academic Foundations       Full-Stack Web              AI, ML & Vector DBs         Full-Stack & AI Systems
  ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐   ┌────────────────────────┐
  │ • Python & C/C++      │──►│ • React & Node.js     │──►│ • LangChain & Ollama  │──►│ • Full-Stack Web Apps  │
  │ • Data Structures     │   │ • Express & REST APIs │   │ • ChromaDB & ML Models│   │ • Lift LLP Development │
  │ • Statistical Analysis│   │ • PostgreSQL & Mongo  │   │ • Predictive Analytics│   │ • Semantic Caching & Docker│
  └───────────────────────┘   └───────────────────────┘   └───────────────────────┘   └────────────────────────┘
```

* **2026 — Full-Stack Developer & AI Systems Engineer** (*Lift LLP & Open Source*)
  * Architecting full-stack web applications, microservices pipelines, specialized workflow routines, and implementing predictive semantic caching configurations.
* **2025 — AI, Machine Learning & Advanced Data Structures** (*Independent Engineering*)
  * Focused on agentic AI frameworks (LangChain, Ollama), vector databases (ChromaDB), and algorithmic optimization for intelligent assistants and predictive analytics applications.
* **2024 — Full-Stack Web Foundations** (*Undergraduate Engineering*)
  * Mastered core full-stack engineering principles with React, Node.js, Express, PostgreSQL, and MongoDB. Built responsive interfaces and production REST APIs.
* **2023 — Programming & Data Science Foundations** (*Academic Journey*)
  * Deep dive into Python, C/C++, core computer science algorithms, data structures, and statistical data analysis.

---

## 🖥️ Interactive Systems & UI Features

### Interactive Terminal Emulator (Dev CLI)

Accessible at `/terminal` or via the top navigation bar. Emulates a Linux terminal shell (`vaishnav@dev-os`) with full command parsing and interactive command history.

* **Supported CLI Commands**:
  - `help` : Displays list of available CLI commands.
  - `fetch` : Output full system specifications, kernel version, and developer summary.
  - `skills` : Lists technical stack grouped by domain with color-coded syntax highlights.
  - `projects` : Interactive listing of featured production repositories.
  - `contact` : Shows developer email and social links.
  - `about` : Prints developer background and education summary.
  - `sudo` : Simulates root privilege escalation.
  - `github` / `linkedin` : Direct navigation to external profiles.
  - `date` : Returns ISO timestamp.
  - `clear` : Clears terminal execution buffer.

### Interactive Command Palette (`Ctrl+K` / `⌘K`)

Global keyboard listener permitting instant search and modal navigation across the entire portfolio without requiring mouse interactions.

* Press `Ctrl+K` or click the command palette icon in the header.
* Filter routes, search project titles, toggle theme modes, or launch social links dynamically.

### 3D WebGL Canvas & Micro-Animations

* **Interactive Particle Field**: Built using `Three.js` inside `ThreeBackground.jsx`, animating a dynamic node-link graph in 3D coordinate space that responds subtlely to viewport frame rate.
* **Card Tilt Physics**: Real-time 3D rotation matrix applied to project and skill cards on mouse hover.

---

## 📁 Repository Structure (pnpm Monorepo)

```
portfolio-v2.0/
├── api/                          # Vercel serverless entry point (hono/vercel handle)
│   └── index.ts
├── apps/
│   ├── web/                      # React 18 + Vite SPA frontend (public site + admin panel)
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── src/
│   │       ├── App.jsx           # Public + Protected /admin/* routes
│   │       ├── admin/            # CMS Admin Panel (Login, Dashboard, CRUD pages)
│   │       ├── components/       # Public site components (API-fetching with fallback)
│   │       └── lib/              # api.js, db.js (Dexie), syncManager, useHealthCheck
│   └── api/                      # Hono REST API backend
│       └── src/
│           ├── db/               # Drizzle ORM schema, Supabase client, seed script
│           ├── middleware/       # JWT auth middleware, error handlers
│           ├── routes/           # health, auth, projects, skills, timeline, bio, contact, sync
│           └── lib/              # idempotency.ts (UUID deduplication)
├── packages/
│   └── shared/                   # Shared TypeScript interfaces & Zod schemas
│       └── src/
│           ├── types.ts
│           └── schemas.ts
├── ARCHITECTURE.md               # Complete System Design & Architecture write-up
├── pnpm-workspace.yaml           # Monorepo workspace configuration
├── vercel.json                   # Monorepo routing & Vercel build settings
└── .env.example                  # Environment variable reference template
```

---

## 🚀 Local Setup & Installation Guide

Follow these steps to run the v2.0 portfolio monorepo locally:

### Prerequisites

* **Node.js**: Version `18.0.0` or higher
* **pnpm**: Version `9.0.0` or higher (`npm install -g pnpm`)

### 1. Clone the Repository

```bash
git clone https://github.com/Vaishnav0299/portfolio-v1.0.git
cd portfolio-v1.0
```

### 2. Install Workspace Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

Fill in your credentials in `.env`:

```env
# Supabase PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Secret & Admin Password Hash
JWT_SECRET=your_32_byte_random_secret_here
ADMIN_PASSWORD_HASH=your_bcrypt_hash_here

# Web3Forms API Key & API Base URL
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key_here
VITE_API_URL=/api
```

### 4. Seed Database Tables

Populate Supabase with initial data:

```bash
pnpm seed
```

### 5. Start Development Servers

Start both frontend (port 5173) and backend API (port 3001) in parallel:

```bash
pnpm dev
```

* 🌐 **Public Site**: `http://localhost:5173`
* ⚡ **Admin CMS**: `http://localhost:5173/admin/login`

---

## 🌐 Build & Deployment Configuration (Vercel)

### Build for Production

```bash
pnpm build
```

### Vercel Deployment Configuration

Monorepo routing configuration in `vercel.json`:

```json
{
  "buildCommand": "pnpm --filter @portfolio/web build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "npm install -g pnpm && pnpm install",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📫 Contact & Social Links

* 📧 **Email**: [vaishnavgaware1@gmail.com](mailto:vaishnavgaware1@gmail.com)
* 🐙 **GitHub**: [github.com/Vaishnav0299](https://github.com/Vaishnav0299)
* 💼 **LinkedIn**: [linkedin.com/in/vaishnav-gaware-107799315/](https://www.linkedin.com/in/vaishnav-gaware-107799315/)
* 🌐 **Live Portfolio**: [portfolio-build-by-vaishnav.vercel.app](https://portfolio-build-by-vaishnav.vercel.app)
* 📍 **Location**: Pune, Maharashtra, India

---

<p align="center">
  <b>Developed with ❤️ & Precision by Vaishnav Gaware</b><br>
  <i>© 2026 Vaishnav Gaware. All Rights Reserved.</i>
</p>
