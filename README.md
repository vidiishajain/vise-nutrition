# NutriLens

**Type a food name. Get the truth about what's inside.**

NutriLens is a WhatsApp-aesthetic web app that takes any food product name — Coca Cola, Lays Chips, Towergate Digestives — and returns a plain-English nutritional breakdown with a clear consumption verdict. No jargon. No scanning required. Just type and know.

---

## What It Does

You type a product name into a chat-style input. NutriLens searches the Open Food Facts database, pulls the nutritional panel, and uses an AI layer to translate the numbers into a judgment a real person can act on. The result appears as a chat bubble: colour-coded, concise, honest.

---

## Who It's For

Anyone standing in a supermarket aisle, mid-snack, or doing a weekly shop who wants a fast read on whether something is worth eating — without needing a nutrition degree.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourname/nutrilens.git
cd nutrilens

# Install dependencies
npm install

# Add your Anthropic API key
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env

# Run locally
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Core Dependencies

- **Open Food Facts API** — free, no key required, 3M+ products
- **Anthropic Claude API** — for plain-language synthesis
- **React** — frontend
- **Tailwind CSS** — styling

---

## Project Structure

```
nutrilens/
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── InputBar.jsx
│   │   └── NutriCard.jsx
│   ├── api/
│   │   ├── openFoodFacts.js
│   │   └── claude.js
│   └── App.jsx
├── public/
├── .env.example
└── README.md
```

---

## Status

MVP — built in a single session. Core flow functional. See `product-spec.md` for roadmap.
