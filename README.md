# Imboni AI — Kigali Discovery Platform

This repository contains the Imboni experience discovery app built with a React + TypeScript frontend and an Express + TypeScript backend.

The project includes:
- AI-powered concierge recommendations
- Local Kigali event matching and partner prioritization
- Voice input, chat, and user profile support
- Partner business registration and sponsored results

## 🔍 Quick Guide for Judges

### 1. Open the repository
- Root: `README.md` (this file)
- Backend: `backend/`
- Frontend: `frontend/`

### 2. Run locally
The simplest path is:

```bash
cd backend
npm install
cd ../frontend
npm install
```

#### Backend
```bash
cd backend
npm run build
npm run dev
```
Backend default: `http://localhost:5000`

#### Frontend
```bash
cd frontend
npm run dev
```
Frontend default: `http://localhost:5173`

### 3. Required environment variables
Create `backend/.env` with the following values:

```env
PORT=5001
NODE_ENV=production
MONGO_URI=<your-mongo-uri>
GEMINI_API_KEY=<your-gemini-key>
OPENAI_API_KEY=<your-openai-key>
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Verify service health
Open in browser or curl:

- Backend health: `http://localhost:5000/health`
- Frontend app: `http://localhost:5173`

### 5. Concierge endpoint
Test the new AI concierge behavior with:

```bash
curl -X POST http://localhost:5000/api/concierge/recommend \
  -H "Content-Type: application/json" \
  -d '{"interests":["music","food"],"budget":"moderate","neighborhoods":["Kimihurura"],"mood":"energetic"}'
```

The response includes:
- `intent_analysis`
- `current_time`
- `recommendations` (sponsored IMBONI partners first)
- `trending_wildcard`
- `local_pro_tip`

### 6. Push changes to GitHub
Use the following commands from the repository root:

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

If you need to publish a new branch:

```bash
git checkout -b feature/my-update
git push -u origin feature/my-update
```

## 🧠 What judges should inspect

- `backend/src/services/concierge.ts` — AI concierge matching logic with sponsored partner prioritization
- `backend/src/routes/concierge.ts` — API endpoint and JSON response shape
- `frontend/src/utils/api.ts` — normalized API client and error logging
- `frontend/src/pages/AuthPage.tsx` / `frontend/src/pages/ProfilePage.tsx` — verified route prefixes for auth
- `backend/src/index.ts` — route registration, CORS, and detailed error logging

## 🚀 Deployment notes

### Render Backend
- Set `FRONTEND_URL` to `https://imboninkigali.vercel.app`
- Confirm `MONGO_URI`, `GEMINI_API_KEY`, and `OPENAI_API_KEY`

### Vercel Frontend
- Set `VITE_API_URL=https://imboniai.onrender.com`
- Deploy the `frontend/` folder as the project root if configured separately

## ✅ Summary
This repo is ready for review. The backend is compiled with TypeScript, the concierge feature includes sponsor prioritization, and the frontend is aligned with `/api/*` routes.
