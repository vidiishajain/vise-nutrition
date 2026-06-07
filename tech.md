# Tech Spec — NutriLens

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + Vite | Fast setup, component model fits chat UI |
| Styling | Tailwind CSS | Utility-first, no CSS files to manage |
| Data | Open Food Facts API | Free, no auth, 3M+ products, REST |
| AI | Anthropic Claude API (claude-sonnet-4) | Plain-language synthesis, structured output |
| Server layer | Vercel Serverless Function (`/api/analyse.js`) | Keeps API key server-side, never exposed to browser |
| Hosting | Vercel | Zero-config React + serverless deployment |
| Env management | `.env` local / Vercel env vars in prod | API key never touches the client |

---

## Data Layer — Open Food Facts

**Base URL:** `https://world.openfoodfacts.org`

**Search by product name:**
```
GET /cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=1
```

**Key fields extracted from response:**
```json
{
  "product_name": "Coca-Cola Classic",
  "serving_size": "330ml",
  "nutriments": {
    "energy-kcal_serving": 139,
    "sugars_serving": 35,
    "fat_serving": 0,
    "saturated-fat_serving": 0,
    "sodium_serving": 0.01,
    "salt_serving": 0.025
  },
  "nutrition_grades": "e"
}
```

**Fallback:** If `_serving` values are absent, use `_100g` values and note the difference.

**Not-found handling:** If `products` array is empty or `product_name` is missing, return a graceful not-found state. Do not call the serverless function in this case.

---

## AI Layer — Vercel Serverless Function

### Why a serverless function?

React + Vite is a client-side app. Any API call made directly from the browser is visible in the network tab. Calling the Anthropic API from the frontend would expose your `ANTHROPIC_API_KEY` to anyone who opens DevTools. The serverless function sits between your frontend and Anthropic. The browser never sees the key.

### Function location

```
/api/analyse.js       ← Vercel detects this automatically as a serverless route
```

### What it does

Receives nutritional data from the frontend as a POST request. Calls the Anthropic API server-side. Returns the parsed Claude response to the frontend.

### Request shape (frontend → `/api/analyse`)

```json
{
  "product_name": "Coca-Cola Classic",
  "serving_size": "330ml",
  "kcal": 139,
  "sugar": 35,
  "fat": 0,
  "sat_fat": 0,
  "salt": 0.025,
  "nutrition_grade": "e"
}
```

### Response shape (`/api/analyse` → frontend)

```json
{
  "traffic_light": "amber",
  "key_stats": [
    { "label": "Calories", "value": "139 kcal", "context": "~7% of a 2000 kcal day" },
    { "label": "Sugar", "value": "35g", "context": "~39% of recommended daily sugar" },
    { "label": "Fat", "value": "0g", "context": "No fat" },
    { "label": "Salt", "value": "0.03g", "context": "Low" }
  ],
  "insight": "It's fat-free, but one can puts you close to half your recommended daily sugar intake.",
  "verdict": "Fine as an occasional treat. Not an everyday drink."
}
```

### Claude system prompt (inside the serverless function)

```
You are a plain-English food label translator.
You receive structured nutritional data for a food product.
Your job is to return a JSON object with four fields:
- traffic_light: "green", "amber", or "red"
- key_stats: an array of up to 4 objects, each with "label", "value", and "context"
- insight: one sentence. The thing worth knowing that the label doesn't say.
- verdict: one short sentence. A steer, not a prohibition.

Be honest. Be specific. Never be preachy.
Return only valid JSON. No markdown, no preamble.
```

**Model:** `claude-sonnet-4-20250514`
**Call type:** Single-turn. No conversation history needed.

---

## Component Architecture

```
App.jsx
├── ChatWindow.jsx          # Scrollable message history
│   └── MessageBubble.jsx   # Individual chat bubble (user or system)
│       └── NutriCard.jsx   # Structured result card inside bubble
├── InputBar.jsx            # Text input + send button
└── StatusIndicator.jsx     # Typing / loading state
```

---

## API Call Flow

```
User submits product name
        ↓
InputBar → App state (loading: true)
        ↓
openFoodFacts.js: fetch product data directly from browser
(Open Food Facts is public, no key required — safe to call client-side)
        ↓
If no product found → push not-found MessageBubble → stop
        ↓
claude.js: POST nutritional data to /api/analyse
        ↓
Vercel serverless function calls Anthropic API server-side
        ↓
Serverless function returns parsed JSON to frontend
        ↓
Push NutriCard MessageBubble to chat history
        ↓
loading: false
```

---

## Project Structure

```
nutrilens/
├── api/
│   └── analyse.js          ← Serverless function (Vercel auto-detects)
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── InputBar.jsx
│   │   └── NutriCard.jsx
│   ├── api/
│   │   ├── openFoodFacts.js
│   │   └── claude.js       ← POSTs to /api/analyse, does not call Anthropic directly
│   └── App.jsx
├── public/
├── .env.example
└── README.md
```

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-...
```

Set locally in `.env`. Set in Vercel dashboard under Project Settings → Environment Variables for production.

Open Food Facts requires no key.

---

## Error States

| Scenario | Handling |
|---|---|
| Product not in database | "I couldn't find that product. Try a more specific name or check the spelling." |
| Open Food Facts timeout | Retry once, then surface error message |
| Serverless function failure | "Something went wrong generating the breakdown. Try again." |
| Claude API failure (inside function) | Function returns 500, frontend catches and shows error bubble |
| Missing serving data | Fall back to per 100g, note this in output |
| Ambiguous product name (multiple results) | Take first result, show product name in output so user can verify |

---

## Performance Notes

- Open Food Facts response: ~300–600ms
- Serverless function cold start: ~200–400ms (first request only)
- Claude API response: ~1–2 seconds
- Total round trip: ~2–3 seconds
- Typing indicator covers the wait
- No caching at MVP. Repeated queries hit the APIs fresh.
