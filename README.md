# 🌍 Imboni — AI-Powered Kigali Discovery Platform

> Discover the best places in Kigali with AI-powered recommendations, voice input, and inclusive design.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (optional — app works without it using built-in static data)
- Google Gemini API key → [Get one free](https://aistudio.google.com/app/apikey)

---

## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker & Docker Compose
- Google Gemini API key → [Get one free](https://aistudio.google.com/app/apikey)

### Quick Start with Docker

```bash
# Clone / Extract the project
unzip imboni.zip
cd imboni

# Create environment file
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@postgres:5432/imboni_db
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

> **⚠️ Important:** Replace `your_gemini_api_key_here` with your actual API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The app will work without it using fallback responses, but AI chat features won't be available.

Create `.env` in project root for Docker:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

**Services:**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **Database:** localhost:5432 (PostgreSQL)

### Docker Commands

```bash
# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build --force-recreate

# Run database migrations (after first start)
docker-compose exec backend npm run db:migrate

# Seed the database
docker-compose exec backend npm run db:seed

# Access database directly
docker-compose exec postgres psql -U postgres -d imboni_db
```

---

## ⚙️ Manual Setup (Alternative)

### 1. Clone / Extract the project

```bash
unzip imboni.zip
cd imboni
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/imboni_db
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

> **Note:** The app works WITHOUT a database. If PostgreSQL is unavailable, it falls back to built-in static data automatically.

#### Optional: Set up the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE imboni_db;"

# Run migrations + seed data
npm run db:migrate
npm run db:seed
```

#### Start the backend

```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

Health check: `curl http://localhost:5000/health`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### Start the frontend

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📱 Progressive Web App (PWA) Setup

Imboni is configured as a **Progressive Web App**, allowing users to install it directly from Chrome, Edge, Safari, and other browsers!

### ✨ Features
- **Installable on Chrome/Edge** - Install button in address bar
- **iOS Support** - Add to Home Screen on Safari
- **Offline Support** - Service worker caches content
- **App Shortcuts** - Quick access to Explore & Chat
- **Standalone Mode** - Runs as a native-like app

### 🎨 Generate App Icons (Required for Installation)

Icons are required for the app to install properly. Generate them from the template:

#### Option 1: Using Node.js + Sharp (Fastest)
```bash
cd frontend
npm install sharp --save-dev
node generate-icons.mjs public/icon-template.svg
```

#### Option 2: Using Python + Pillow
```bash
cd frontend
pip install Pillow
python generate_icons.py public/icon-template.svg
```

#### Option 3: Online Tool
1. Go to https://www.favicon-generator.org/
2. Upload `public/icon-template.svg`
3. Download all generated PNG files
4. Extract to `public/icons/` directory

**Icons generated in:** `frontend/public/icons/`

### 📸 Optional: Add Screenshots
Place screenshots in `frontend/public/screenshots/`:
- `screenshot-narrow.png` (540x720) - Mobile
- `screenshot-wide.png` (1280x720) - Tablet

These appear in the app install prompt.

### 🚀 Testing PWA Installation

1. Start dev server: `npm run dev` (frontend)
2. Open http://localhost:5173 in Chrome
3. Click the **install icon** in the address bar or menu
4. Confirm installation
5. App launches in standalone window

**Offline Testing:**
- DevTools → Network → Offline
- Service worker will cache content
- App continues to work with cached data

### 📝 Customization

Edit `frontend/public/manifest.json` to:
- Change app name, description, colors
- Modify app shortcuts
- Update theme colors
- Add/remove feature categories

See `frontend/public/PWA_SETUP.md` for detailed guide.

---

## 🎯 What Works

| Feature | Status |
|---------|--------|
| AI Chat (Gemini 2.5 Flash) | ✅ Fully working |
| AI Fallback (Gemini 2.5 Flash Lite) | ✅ Automatic |
| Place Discovery & Grid | ✅ 15+ Kigali places |
| Near You / Popular sections | ✅ Distance-sorted |
| Search & Category filters | ✅ Working |
| Voice Input | 🔶 Simulated (UI complete) |
| Onboarding flow | ✅ 3-step guided |
| Language toggle (EN/RW) | ✅ AI responds in Kinyarwanda |
| Simple Mode | ✅ Accessible UI |
| Dark / Light mode | ✅ Working |
| Notifications (demo) | ✅ Mock UI |
| Pricing page (demo) | ✅ Mock payment flow |
| Analytics dashboard (demo) | ✅ Mock stats |
| Accessibility tags | ✅ Wheelchair/Budget/Family |
| PostgreSQL persistence | ✅ With graceful fallback |

---

## 🗂️ Project Structure

```
imboni/
├── docker-compose.yml      # Docker services configuration
├── backend/
│   ├── Dockerfile          # Backend container build
│   ├── .dockerignore       # Files to exclude from build
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── index.ts           # Express server
│   │   ├── routes/
│   │   │   ├── chat.ts        # POST /api/chat → Gemini
│   │   │   ├── voice.ts       # POST /api/voice → Simulated Whisper
│   │   │   ├── places.ts      # GET /api/places
│   │   │   └── preferences.ts # GET/POST /api/preferences
│   │   ├── services/
│   │   │   ├── gemini.ts      # AI with primary/fallback models
│   │   │   └── places.ts      # Place queries + static fallback
│   │   ├── db/
│   │   │   ├── index.ts       # Prisma client connection
│   │   │   ├── migrate.ts     # Run migrations
│   │   │   └── seed.ts        # Seed 15 Kigali places
│   │   └── types/index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── Dockerfile          # Frontend container build
    ├── nginx.conf          # Nginx configuration for production
    ├── src/
    │   ├── App.tsx             # Root: routing, state, preferences
    │   ├── main.tsx
    │   ├── components/
    │   │   ├── chat/
    │   │   │   └── ChatWindow.tsx    # Full chat UI
    │   │   ├── places/
    │   │   │   ├── PlaceCard.tsx     # Card + detail modal
    │   │   │   └── PlacesGrid.tsx    # Grid with filters
    │   │   ├── voice/
    │   │   │   └── VoiceModal.tsx    # Record → transcribe → confirm
    │   │   ├── layout/
    │   │   │   └── Navbar.tsx        # Nav + notifications + settings
    │   │   └── onboarding/
    │   │       └── Onboarding.tsx    # 3-step welcome flow
    │   ├── pages/
    │   │   ├── ExplorePage.tsx
    │   │   ├── ChatPage.tsx
    │   │   ├── PricingPage.tsx
    │   │   └── AnalyticsPage.tsx
    │   ├── data/places.ts      # Static fallback data
    │   ├── theme/index.ts      # Chakra UI theme (DM Sans)
    │   ├── types/index.ts
    │   └── utils/api.ts
    ├── package.json
    └── vite.config.ts
```

---

## 🔌 API Endpoints

### `POST /api/chat`
```json
{
  "message": "Where can I get coffee?",
  "session_id": "uuid",
  "language": "en",
  "user_preferences": ["coffee", "relaxation"],
  "simple_mode": false
}
```

### `POST /api/voice`
```json
{ "audio_data": "base64...", "language": "en" }
```
Returns simulated transcription.

### `GET /api/places`
Query params: `category`, `lat`, `lon`, `limit`, `search`

### `POST /api/preferences`
```json
{ "user_id": "...", "interests": ["food"], "language": "en", "simple_mode": false }
```

---

## 🤖 AI Models & Optimization

| Role | Model |
|------|-------|
| Primary | `gemini-1.5-flash` |
| Fallback | `gemini-1.5-pro` |

### ⚡ Quota Optimization Features

**Batch Processing System:**
- Queues multiple requests and processes them efficiently
- Reduces API calls through intelligent batching
- Built-in rate limiting and request deduplication

**Response Caching:**
- Caches responses for 30 minutes to avoid duplicate API calls
- Memory-efficient with automatic cleanup
- Supports different languages and user preferences

**Pre-computed Responses:**
- Instant responses for common queries (hello, help, places, etc.)
- Zero API quota usage for frequently asked questions
- Covers 20+ common conversation starters

**Smart Fallback System:**
- Graceful degradation when API is unavailable
- Keyword-based responses when AI fails
- Maintains user experience during outages

**Admin Endpoints:**
```bash
# View cache and batch processor stats
GET /admin/cache/stats

# Clear response cache
POST /admin/cache/clear
```

Fallback activates automatically if primary fails.

---

## ♿ Accessibility Features

- **Simple Mode** — larger text, fewer details, clearer actions
- **Accessibility tags** — wheelchair, budget, family-friendly on every card
- **Guided onboarding** — 3-step setup for first-time users
- **Voice input** — speak instead of type
- **Suggestion chips** — one-tap common queries
- **Help button** — persistent usage guide in navbar

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI Library | Chakra UI v2 |
| Layout | Tailwind CSS (layout/spacing only) |
| Font | DM Sans |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| AI | Google Gemini 2.5 Flash |
| Voice | Whisper (simulated) |
| Containerization | Docker + Docker Compose |

---

## 🌍 Default Location

Central Kigali: `-1.9441, 30.0619`

To use real geolocation, the app can be extended with `navigator.geolocation.getCurrentPosition()`.

---

## 📝 Notes

- **No database needed** — all 15 places work offline via static data
- **Chat requires Gemini API key** — set in `backend/.env`
- **Voice is simulated** — returns mock transcriptions; Whisper API not integrated
- **Demo pages** — Pricing and Analytics are UI-only mockups

---

Made with ❤️ for Kigali 🇷🇼
