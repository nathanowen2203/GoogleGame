# Search Wars 🌍

**Which country Googles it more?** — A Google Trends comparison game.

## Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

## Running the App

You need **two terminals** running simultaneously.

### Terminal 1 — Backend (port 3001)

```bash
cd backend
npm start
```

### Terminal 2 — Frontend (port 5173)

```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

## How it works

1. Each round you're shown a topic (e.g. *"Bitcoin"*)
2. Two random countries are shown as cards
3. Pick which country searches that topic more on Google
4. The real Google Trends data is revealed
5. Score points for correct answers, build streaks for bonuses!

## Data Source

- **Live mode**: Uses the `google-trends-api` npm package to query Google Trends relative interest by region
- **Fallback mode**: If Google Trends is unavailable (rate limits, network issues), realistic mock data is used automatically

## Environment

No API keys required — uses Google's public (unofficial) Trends API.

## Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend  | Node.js, Express, google-trends-api, node-cache |
# GoogleGame
