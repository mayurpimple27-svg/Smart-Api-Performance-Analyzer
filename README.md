# Smart API Performance Analyzer

A simple SaaS-style college project.

## What it does
- Takes an API URL, request method (GET/POST), and number of requests.
- Sends requests one-by-one using a simple loop.
- Measures response time and calculates:
  - Average response time
  - Success rate
- Sends those metrics to OpenAI and returns 2-3 short insights.

## Tech Stack
- Frontend: React + React Router + Tailwind CSS
- Backend: Node.js + Express (REST API)
- AI: OpenAI API

## Run Locally

### 1. Backend setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/`:

```env
PORT=5000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Keep `OPENAI_API_KEY` empty for now if you want. The app will still run with fallback insights.

Run backend:

```bash
npm run dev
```

### 2. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

Create `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

## Submission Notes
- Beginner-friendly, no database, no auth, and no advanced concurrency.
- Uses sequential request loop for performance testing.
- UI is intentionally simple for college project evaluation.
