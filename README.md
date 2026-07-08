# 🛒 PricePulse Kenya

> **"Where can I buy my shopping basket for the lowest total today?"**

Real-time retail price intelligence for Kenyan shoppers. Compare basket prices across Naivas, Carrefour, QuickMart, Chandarana, Tuskys, Cleanshelf, Eastmatt, and more — in seconds.

This isn't just a shopping app. **The price database and data collection network are the real product.** The mobile app is one client of many.

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [Features](#-features)
- [Screenshots / Demo](#-screenshots--demo)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Design](#-database-design)
- [The Secret Sauce: Price Events](#-the-secret-sauce-price-events)
- [Verification Engine](#-verification-engine)
- [Quick Start (Local Dev)](#-quick-start-local-dev)
  - [Prerequisites](#prerequisites)
  - [1. Start Infrastructure](#1-start-infrastructure)
  - [2. Database Setup](#2-database-setup)
  - [3. Start the API](#3-start-the-api)
  - [4. Start the Flutter App](#4-start-the-flutter-app)
  - [5. Run the Background Worker](#5-run-the-background-worker)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Current Status & Roadmap](#-current-status--roadmap)
  - [Phase 1 — ✅ Complete](#phase-1--complete)
  - [Phase 2 — 🏗 In Progress](#phase-2--in-progress)
  - [Phase 3 — ⏳ Planned](#phase-3--planned)
  - [Phase 4 — 🔮 Future](#phase-4--future)
- [What's Missing / Contributions Welcome](#-whats-missing--contributions-welcome)
- [Testing](#-testing)
- [License](#-license)

---

## 🎯 The Problem

Kenyan shoppers waste time and money because **grocery prices vary wildly between supermarkets** — sometimes by 20–40% on the same product.

- Naivas might sell milk for KES 60, while Carrefour sells it for KES 65.
- QuickMart might have the cheapest maize flour, but a more expensive cooking oil.
- Weekly promotions change pricing unpredictably.

**There is no single place to answer: "Where should I buy my full shopping basket today?"**

PricePulse Kenya solves this.

---

## ✨ Features

### Core (Phase 1 — Implemented)

| Feature                                                                     | Status |
| --------------------------------------------------------------------------- | ------ |
| **Phone OTP Authentication** (Africa's Talking)                             | ✅     |
| **Product Catalog** — 40+ Kenyan products, 25 brands, 15 categories         | ✅     |
| **Store & Branch Directory** — 7 chains, 30+ locations with geocoordinates  | ✅     |
| **Manual Price Submission** with verification scoring engine                | ✅     |
| **Community Price Verification** — confirm/dispute votes, reputation system | ✅     |
| **Price History** — time-series price trends per product per branch         | ✅     |
| **Basket Comparison** — THE core feature: compare total cost across stores  | ✅     |
| **Elasticsearch Fuzzy Search** — typo-tolerant product search               | ✅     |
| **Swagger API Docs** — interactive documentation at `/api/docs`             | ✅     |
| **Database Seeder** — realistic Kenyan supermarket data                     | ✅     |
| **Docker Compose** — PostgreSQL + Redis + Elasticsearch                     | ✅     |
| **Render Deployment Config** — `render.yaml` for API + Worker + DB          | ✅     |

### Coming Soon (Phase 2+)

| Feature                                   | Phase |
| ----------------------------------------- | ----- |
| Receipt OCR (Tesseract.js → Cloud Vision) | 2     |
| Barcode scanning (`mobile_scanner`)       | 2     |
| User reputation & trust scoring           | 2     |
| Rewards & points system                   | 3     |
| Leaderboards & gamification               | 3     |
| Price alerts (push notifications)         | 3     |
| Favorites & saved products                | 3     |
| Weekly savings report                     | 3     |
| AI-powered recommendations                | 4     |
| Retail analytics dashboards               | 4     |
| Brand partnerships & API                  | 4     |

---

## 🏗 System Architecture

```
                    ┌──────────────────────────────────┐
                    │        CLIENT LAYER              │
                    │  Flutter App (Android + iOS)     │
                    │  + Admin Web (same codebase)     │
                    └──────────────┬───────────────────┘
                                   │ HTTPS / REST
                    ┌──────────────▼───────────────────┐
                    │       API GATEWAY (NestJS)        │
                    │  Rate Limiting • Auth Guards      │
                    │  Validation Pipes • Swagger       │
                    └──┬────┬────┬────┬────┬────┬───────┘
                       │    │    │    │    │    │
              ┌────────┴┐ ┌─┴──┐ ┌┴───┐ ┌┴──┐ ┌┴────────┐
              │  Auth   │ │Prod│ │Stor│ │Pric│ │ Shopping │
              │  Users  │ │ucts│ │es  │ │e   │ │  Basket  │
              └────┬────┘ └──┬─┘ └──┬─┘ └──┬─┘ └────┬────┘
                   └─────────┴──────┴──────┴────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   PostgreSQL 16         │
                          │   + Prisma ORM          │
                          │   (price events as      │
                          │    time-series data)    │
                          └───────────┬────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   Redis 7               │
                          │   (cache, sessions,     │
                          │    BullMQ queues)       │
                          └───────────┬────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   Elasticsearch 8       │
                          │   (fuzzy product        │
                          │    search with          │
                          │    autocomplete)        │
                          └───────────┬────────────┘
                                      │
                          ┌───────────▼────────────┐
                          │   BullMQ Worker         │
                          │   • Receipt OCR         │
                          │   • Price alerts        │
                          │   • Verification tasks  │
                          └────────────────────────┘
```

### Why a Modular Monolith?

> _"A lot of people hear 'startup' and think they need microservices from day one. We don't."_

Each module has its own:

- Controller — HTTP routes
- Service — Business logic
- DTOs — Validation schemas
- Entities — Database models

Ready to split into separate services when scale demands it.

---

## 🧰 Tech Stack

| Layer       | Technology                                   | Why                                           |
| ----------- | -------------------------------------------- | --------------------------------------------- |
| **Mobile**  | Flutter 3.x + Riverpod 2                     | One codebase: Android + iOS + Web admin       |
| **Backend** | NestJS 10 + TypeScript                       | Modular architecture, DI, guards, scalability |
| **ORM**     | Prisma 6 + PostgreSQL 16                     | Type-safe queries, migrations, GIS support    |
| **Cache**   | Redis 7                                      | Basket results, sessions, leaderboards        |
| **Search**  | Elasticsearch 8                              | Fuzzy search, typo tolerance, autocomplete    |
| **Queue**   | BullMQ + Redis                               | Background OCR, price alerts, verification    |
| **Auth**    | JWT + Passport + Africa's Talking OTP        | Phone-first auth built for Kenya              |
| **OCR**     | Tesseract.js (Phase 2) → Google Cloud Vision | Receipt text extraction                       |
| **Storage** | Cloudflare R2 / Firebase Storage             | Receipt images, product photos                |
| **Push**    | Firebase Cloud Messaging                     | Price alerts, notifications                   |
| **SMS**     | Africa's Talking                             | OTP at local Kenyan rates                     |
| **Maps**    | Mapbox (free tier)                           | Store locator                                 |
| **Hosting** | Render                                       | Free Postgres, easy deploy                    |

---

## 🗄 Database Design

### Core Principle

**Never store "current price". Store price events.**

Like git for prices — every change is a new event:

```
Milk
  ├── Mon: KES 60 at Naivas Westgate (reported by Peter, score: 85 ✅)
  ├── Tue: KES 65 at Carrefour Two Rivers (reported by Jane, score: 72 ✅)
  └── Wed: KES 58 at QuickMart Ruaka (reported by John, score: 45 ⏳ pending)
```

This lets you generate:

- Price history charts
- Inflation trends
- Cheapest time to buy
- Average price per store

### Models (20 tables)

```
Users         Stores        Branches      Products      Categories
Brands        PriceReports  Verifications Receipts      ReceiptItems
ShoppingLists BasketItems   Rewards       Favorites     PriceAlerts
Offers        RefreshTokens OtpRequests
```

---

## 🧪 The Secret Sauce: Price Events

```
Instead of:   Product.price = 70
We store:     Event: Milk price changed 68 → 70 at Naivas, Today
```

Every `PriceReport` is an immutable event with:

- `productId` — what was priced
- `branchId` — where
- `price` — the observed value
- `source` — manual, OCR, barcode, admin, scraper
- `verificationScore` — computed trust score
- `reportedById` — who submitted it
- `reportedAt` — when

The "current price" is **always derived** — the latest `ACCEPTED` event per `(product, branch)`.

---

## ✅ Verification Engine

Every submission runs through a scoring algorithm:

```
Score = 0
+ 50   if receipt uploaded
+ 30   if barcode scan matches product
+ 20   for each confirming vote (community)
+ 15   if reporter reputation > 0.8
+ 10   if price is within 20% of recent average
- 15   if reporter reputation < 0.3
- 20   for each dispute vote
- 30   if duplicate of recent submission

Thresholds:
  Score ≥ 60  → ACCEPTED
  Score 30-59 → PENDING (needs more votes)
  Score < 30  → REJECTED
```

Users earn reputation for verified submissions and lose it for rejected ones. The system automatically weighs contributions based on trust.

---

## 🚀 Quick Start (Local Dev)

### Prerequisites

| Tool           | Version | Download                                                      |
| -------------- | ------- | ------------------------------------------------------------- |
| Node.js        | 20+     | [nodejs.org](https://nodejs.org/)                             |
| Docker Desktop | Latest  | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Flutter SDK    | 3.x     | [flutter.dev](https://flutter.dev/docs/get-started/install)   |
| PostgreSQL CLI | 16      | (optional, for debugging)                                     |
| Redis CLI      | 7       | (optional, for debugging)                                     |

### 1. Start Infrastructure

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts three containers:

- **PostgreSQL 16** — primary database (`localhost:5432`)
- **Redis 7** — cache + BullMQ queue (`localhost:6379`)
- **Elasticsearch 8** — full-text search (`localhost:9200`)

Verify everything is running:

```bash
docker compose -f docker/docker-compose.yml ps
```

### 2. Database Setup

```bash
cd apps/api

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database with real Kenyan data
npx prisma db seed
```

The seeder populates:

- **7 store chains**: Naivas, Carrefour, QuickMart, Chandarana, Cleanshelf, Eastmatt, Tuskys
- **30+ branches** across Nairobi, Mombasa, Kisumu, Nakuru, Eldoret with real coordinates
- **15 categories** from Dairy & Eggs to Canned & Packaged Food
- **25 brands** including Brookside, Daima, Bidco, Coca-Cola, Omo
- **40+ real products** with approximate Nairobi prices
- **Admin user**: `admin@pricepulse.ke`
- **120+ sample price reports** across 3 branches
- **Sample offers** for Naivas and Carrefour

### 3. Start the API

```bash
cd apps/api
npm run start:dev
```

The API starts at: **http://localhost:3000**

Interactive Swagger documentation: **http://localhost:3000/api/docs**

Available endpoints in Swagger:

| Tag             | Endpoints                                           |
| --------------- | --------------------------------------------------- |
| `auth`          | OTP request, OTP verify, token refresh, logout      |
| `users`         | Profile (get/update), leaderboard                   |
| `products`      | CRUD, categories, brands, barcode lookup            |
| `stores`        | Store chains, branches, nearby (Haversine)          |
| `prices`        | Submit price, vote, price history, latest prices    |
| `search`        | Fuzzy product search (Elasticsearch ➔ SQL fallback) |
| `shopping`      | Basket CRUD, **compare prices across stores**       |
| `ocr`           | Receipt upload, receipt details                     |
| `notifications` | FCM token registration, preferences                 |
| `rewards`       | Points history, summary                             |
| `analytics`     | Price trends, top contributors (admin)              |
| `health`        | API uptime check                                    |

### 4. Start the Flutter App

```bash
cd apps/mobile
flutter pub get
flutter run
```

If using an **Android emulator**, the API at `http://10.0.2.2:3000` is automatically available.

If using a **physical device**, update the API URL in `lib/core/config/app_config.dart`:

```dart
static const String apiBaseUrl = 'http://YOUR_MACHINE_IP:3000/api';
```

#### App Screens

| Screen             | Route             | Purpose                                        |
| ------------------ | ----------------- | ---------------------------------------------- |
| Login              | `/login`          | Phone number OTP entry                         |
| OTP Verify         | `/verify-otp`     | 6-digit code verification                      |
| Home               | `/`               | Dashboard with categories, basket summary      |
| Search             | `/search`         | Product search with autocomplete               |
| Product Detail     | `/products/:id`   | Product info & price history                   |
| My Basket          | `/basket`         | Edit quantities, remove items                  |
| **Compare Prices** | `/basket/compare` | **Core feature — stores ranked by total cost** |
| Profile            | `/profile`        | Account settings, logout                       |

### 5. Run the Background Worker

In a separate terminal (for BullMQ queue processing):

```bash
cd apps/api
npm run build    # ensure latest build
node dist/src/worker
```

The worker processes:

- Receipt OCR jobs (in Phase 2+)
- Price alert notifications
- Verification scoring tasks

### Smoke Test

```bash
# Health check
curl http://localhost:3000/api/health

# Search products
curl "http://localhost:3000/api/search?q=milk"

# Get product categories
curl http://localhost:3000/api/products/categories

# Get branches in Nairobi
curl "http://localhost:3000/api/stores/branches/list?city=Nairobi"

# Find nearby branches
curl "http://localhost:3000/api/stores/branches/nearby?lat=-1.2921&lng=36.8219"
```

---

## 🔌 API Endpoints

### Authentication

| Method | Path                    | Description             |
| ------ | ----------------------- | ----------------------- |
| `POST` | `/api/auth/otp/request` | Request phone OTP       |
| `POST` | `/api/auth/otp/verify`  | Verify OTP & get tokens |
| `POST` | `/api/auth/refresh`     | Refresh JWT tokens      |
| `POST` | `/api/auth/logout`      | Revoke refresh token    |

### Products

| Method | Path                             | Description                           |
| ------ | -------------------------------- | ------------------------------------- |
| `GET`  | `/api/products`                  | List products (paginated, filterable) |
| `GET`  | `/api/products/categories`       | All categories                        |
| `GET`  | `/api/products/brands`           | All brands                            |
| `GET`  | `/api/products/barcode/:barcode` | Lookup by barcode                     |
| `GET`  | `/api/products/:id`              | Product details                       |
| `POST` | `/api/products`                  | Create (admin/mod)                    |

### Shopping (Core Feature)

| Method   | Path                             | Description                      |
| -------- | -------------------------------- | -------------------------------- |
| `GET`    | `/api/shopping/basket`           | Get current basket               |
| `POST`   | `/api/shopping/basket/add`       | Add item to basket               |
| `PATCH`  | `/api/shopping/basket/items/:id` | Update quantity                  |
| `DELETE` | `/api/shopping/basket/items/:id` | Remove item                      |
| `DELETE` | `/api/shopping/basket/clear`     | Clear basket                     |
| `GET`    | `/api/shopping/basket/compare`   | **Compare prices across stores** |

### Prices

| Method | Path                             | Description                 |
| ------ | -------------------------------- | --------------------------- |
| `POST` | `/api/prices/submit`             | Submit a price report       |
| `POST` | `/api/prices/vote`               | Confirm/dispute a price     |
| `GET`  | `/api/prices/history/:productId` | Price history (time-series) |
| `GET`  | `/api/prices/latest/:productId`  | Latest price per branch     |

### Stores

| Method | Path                          | Description                   |
| ------ | ----------------------------- | ----------------------------- |
| `GET`  | `/api/stores`                 | All store chains              |
| `GET`  | `/api/stores/branches/list`   | All branches (filter by city) |
| `GET`  | `/api/stores/branches/nearby` | Nearest branches (Haversine)  |
| `GET`  | `/api/stores/:id`             | Store + its branches          |

---

## 🔐 Environment Variables

See `apps/api/.env.example` for the full list. Key variables:

| Variable             | Default                  | Required | Description                                      |
| -------------------- | ------------------------ | -------- | ------------------------------------------------ |
| `DATABASE_URL`       | `postgresql://...`       | ✅       | PostgreSQL connection                            |
| `REDIS_URL`          | `redis://localhost:6379` | ✅       | Redis connection                                 |
| `JWT_SECRET`         | —                        | ✅       | JWT signing key (min 32 chars)                   |
| `JWT_REFRESH_SECRET` | —                        | ✅       | Refresh token key (min 32 chars)                 |
| `AT_API_KEY`         | —                        | ❌       | Africa's Talking API key (sandbox works without) |
| `AT_USERNAME`        | `sandbox`                | ❌       | AT username                                      |
| `ELASTICSEARCH_NODE` | `http://localhost:9200`  | ❌       | ES node URL (graceful fallback to SQL search)    |
| `GOOGLE_CLIENT_ID`   | —                        | ❌       | Google OAuth (Phase 2)                           |

---

## ☁️ Deployment

The project is configured for **Render** via `render.yaml`:

```yaml
services:
  - type: web # NestJS API → pricepulse-api
  - type: worker # BullMQ Worker → pricepulse-worker
databases:
  - name: pricepulse-db # PostgreSQL 16
  - name: pricepulse-redis # Redis 7
```

Deploy on Render:

1. Push to GitHub
2. Connect repo to Render
3. Render auto-detects `render.yaml`
4. Set the `sync: false` env vars manually in Dashboard
5. Deploy

---

## 📊 Current Status & Roadmap

### Phase 1 — ✅ Complete

_The "Prove People Want It" phase._

- [x] User accounts (phone OTP auth)
- [x] Product catalog (40+ Kenyan products)
- [x] Store directory (7 chains, 30+ branches)
- [x] Manual price submission with verification scoring
- [x] Community voting (confirm/dispute prices)
- [x] Price history (time-series per branch)
- [x] Shopping basket CRUD
- [x] **Basket comparison across stores** (THE core feature)
- [x] Product search (Elasticsearch with SQL fallback)
- [x] Swagger API documentation
- [x] Kenyan data seeder
- [x] Docker Compose setup
- [x] Render deployment config

### Phase 2 — 🏗 In Progress

_Building trust and data volume._

- [ ] Receipt upload & OCR (Tesseract.js)
- [ ] Barcode scanning (`mobile_scanner`)
- [ ] Automatic product matching from OCR text
- [ ] Enhanced verification engine with ML signals
- [ ] Block duplicate & fraudulent submissions
- [ ] Google & Apple social login
- [ ] Receipt image storage (Firebase / R2)

### Phase 3 — ⏳ Planned

_Rewarding contributors and retaining users._

- [ ] Rewards & points system (✅ schema ready)
- [ ] Leaderboards (top contributors)
- [ ] Price alerts (push notifications via FCM)
- [ ] Favorites & saved products
- [ ] Weekly savings report ("You saved KES 350 this week")
- [ ] Daily streaks & gamification
- [ ] Referral program

### Phase 4 — 🔮 Future

_Monetization and scale._

- [ ] AI-powered shopping recommendations
- [ ] Sponsored deals & promoted products
- [ ] Retail analytics dashboards for businesses
- [ ] Public API for third-party developers
- [ ] Brand partnerships & coupon integration
- [ ] Web scraper for online supermarket prices
- [ ] Machine learning price predictions
- [ ] PricePulse for Business (B2B SaaS)

---

## 🚧 What's Missing / Contributions Welcome

The current codebase is a **functional prototype** — the architecture is solid and the core feature works. Here's what needs work:

### High Priority

| Area                   | What's Needed                                               | Skill                     |
| ---------------------- | ----------------------------------------------------------- | ------------------------- |
| **Receipt OCR**        | Integrate Tesseract.js, parse line items, match to products | Node.js / Computer Vision |
| **Barcode scanner**    | Wire up `mobile_scanner` to look up products by EAN         | Flutter / Dart            |
| **Push notifications** | Implement Firebase Admin SDK, send price alert pushes       | Node.js / Firebase        |
| **Mobile auth**        | Social login (Google/Apple) buttons in Flutter              | Flutter / OAuth           |
| **Test coverage**      | Backend unit + integration tests (Jest)                     | TypeScript / Testing      |

### Medium Priority

| Area                 | What's Needed                                         | Skill      |
| -------------------- | ----------------------------------------------------- | ---------- |
| **Price alerts**     | CRUD endpoints, trigger check on new price submission | Full-stack |
| **Favorites**        | Allow users to save frequently bought products        | Full-stack |
| **Admin dashboard**  | Flutter web admin for product/store management        | Flutter    |
| **CI/CD**            | GitHub Actions for lint → test → build                | DevOps     |
| **Error monitoring** | Sentry integration for API errors                     | DevOps     |

### Nice to Have

| Area                  | What's Needed                                 | Skill            |
| --------------------- | --------------------------------------------- | ---------------- |
| **Dark mode**         | Flutter theme support                         | Flutter / Design |
| **Map view**          | Show branch locations on an interactive map   | Flutter / Maps   |
| **Offline support**   | Cache products & recent prices in Isar/Hive   | Flutter          |
| **Localization**      | Swahili language support                      | i18n             |
| **Share feature**     | Share "buy here" results via WhatsApp         | Flutter          |
| **MPESA integration** | Pay for premium features via Africa's Talking | Node.js          |

---

## 🧪 Testing

### Backend

```bash
cd apps/api

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Manual Testing Flow

1. Start infrastructure + API (see Quick Start)
2. Open Swagger at `http://localhost:3000/api/docs`
3. Use `POST /api/auth/otp/request` with `+254712345678`
4. Check API logs for OTP (sandbox fallback prints it)
5. Use `POST /api/auth/otp/verify` with the OTP
6. Copy the `accessToken` → click **Authorize** → paste it
7. Now you can call authenticated endpoints:
   - Add items to basket via `POST /api/shopping/basket/add`
   - Compare prices via `GET /api/shopping/basket/compare`
   - Submit prices via `POST /api/prices/submit`

---

## 📁 Project Structure

```
pricepulse-kenya/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Full database schema
│   │   │   ├── migrations/           # Migration history
│   │   │   └── seed.ts               # Kenyan supermarket data
│   │   └── src/
│   │       ├── main.ts               # App bootstrap + Swagger
│   │       ├── app.module.ts         # Root module
│   │       ├── worker.ts             # Background worker entry
│   │       ├── config/               # Config namespaces
│   │       ├── prisma/               # Database service
│   │       ├── processors/           # BullMQ job processors
│   │       ├── common/               # Decorators, guards, filters
│   │       └── modules/
│   │           ├── auth/             # JWT + OTP authentication
│   │           ├── users/            # Profiles + reputation
│   │           ├── products/         # Catalog + categories
│   │           ├── stores/           # Chains + branches + maps
│   │           ├── prices/           # Reports + verification
│   │           ├── shopping/         # Baskets + price comparison
│   │           ├── search/           # Elasticsearch integration
│   │           ├── ocr/              # Receipt processing
│   │           ├── notifications/    # Push + alerts
│   │           ├── rewards/          # Points + gamification
│   │           ├── analytics/        # Admin dashboards
│   │           └── health/           # Health check
│   │
│   └── mobile/                       # Flutter app
│       └── lib/
│           ├── main.dart             # App entry
│           ├── app.dart               # MaterialApp.router
│           ├── core/
│           │   ├── config/           # Environment config
│           │   ├── network/          # Dio API client + interceptors
│           │   ├── router/           # GoRouter setup
│           │   ├── theme/            # Colors, typography, theme
│           │   └── utils/            # Price formatting, helpers
│           ├── features/
│           │   ├── auth/             # OTP login screens
│           │   ├── home/             # Dashboard
│           │   ├── products/         # Search + detail screens
│           │   ├── shopping/         # Basket + comparison screens
│           │   ├── stores/           # Store detail (WIP)
│           │   └── profile/          # Settings + logout
│           └── shared/widgets/       # Reusable UI components
│
├── docker/
│   └── docker-compose.yml            # PostgreSQL + Redis + ES
├── render.yaml                       # Render deployment config
└── README.md                         # This file
```

---

## 📄 License

Private — PricePulse Kenya © 2026

---

> Built with ❤️ for Kenyan shoppers. Every shilling saved matters.
