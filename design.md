# Design Spec — NutriLens

## Design Philosophy

NutriLens borrows WhatsApp's interaction model because it's already learned. No onboarding required. You type. You receive. The familiarity of the chat format removes friction from a task that already has enough of it.

The aesthetic is calm, not clinical. Nutrition information often carries anxiety. The design should feel like a knowledgeable friend giving you a straight answer, not a health app judging your choices.

---

## Colour Palette

| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#111B21` | App background (WhatsApp dark) |
| `--bg-chat` | `#0B141A` | Chat window background |
| `--bubble-inbound` | `#202C33` | System message bubbles |
| `--bubble-outbound` | `#005C4B` | User message bubbles |
| `--text-primary` | `#E9EDEF` | Primary text |
| `--text-secondary` | `#8696A0` | Timestamps, labels |
| `--accent-green` | `#00A884` | WhatsApp green, CTAs |
| `--traffic-green` | `#25D366` | Traffic light: good |
| `--traffic-amber` | `#FFA500` | Traffic light: moderate |
| `--traffic-red` | `#FF4444` | Traffic light: worth knowing |
| `--card-bg` | `#2A3942` | NutriCard background |
| `--divider` | `#2A3942` | Separator lines |

---

## Typography

| Use | Font | Size | Weight |
|---|---|---|---|
| Body text | SF Pro / Segoe UI / system-ui | 14px | 400 |
| Product name in card | Same | 15px | 600 |
| Stat label | Same | 12px | 400 |
| Stat value | Same | 14px | 600 |
| Verdict line | Same | 14px | 500, italic |
| Timestamps | Same | 11px | 400 |

No custom fonts. System fonts only. Fast load, native feel.

---

## Layout

**Mobile-first.** Max width `430px` centered on desktop with subtle background texture filling the rest.

```
┌─────────────────────────┐
│  NutriLens          🔍  │  ← Header bar (WhatsApp green)
├─────────────────────────┤
│                         │
│  [System bubble]        │  ← Welcome message on load
│                         │
│          [User bubble]  │  ← User's query, right-aligned
│                         │
│  [NutriCard bubble]     │  ← Result, left-aligned
│                         │
│                         │
├─────────────────────────┤
│  🔍 Type a food name... │  ← Input bar
└─────────────────────────┘
```

---

## Component Specs

### Header Bar
- Height: 56px
- Background: `#202C33`
- Left: app icon (🥗 or wordmark) + "NutriLens"
- Right: no nav icons at MVP
- Bottom border: 1px `--divider`

### Chat Window
- Background: `--bg-chat`
- Padding: 12px 16px
- Scroll: vertical, overflow-y auto
- Auto-scroll to bottom on new message

### Message Bubbles
- Border radius: 8px (sharp top-left for inbound, sharp top-right for outbound)
- Max width: 85% of chat window
- Padding: 8px 12px
- Timestamp: bottom-right, `--text-secondary`, 11px
- Inbound: left-aligned, `--bubble-inbound`
- Outbound: right-aligned, `--bubble-outbound`

### NutriCard (inside inbound bubble)
- Background: `--card-bg`
- Border radius: 8px
- Padding: 12px
- Internal structure:

```
┌─────────────────────────┐
│ 🟡  Lays Classic Salted │  ← Traffic light + product name
├─────────────────────────┤
│ Calories    150 kcal    │
│ ~7% of daily intake     │  ← Stat row × up to 4
│                         │
│ Sugar       1g          │
│ Low                     │
│                         │
│ Salt        170mg       │
│ ~8% of daily intake     │
│                         │
│ Fat         10g         │
│ Mostly unsaturated      │
├─────────────────────────┤
│ The 'sharing size' bag  │  ← Insight line, italic
│ is three servings.      │
├─────────────────────────┤
│ Fine occasionally.      │  ← Verdict, slightly bolder
│ Harder to stop at one.  │
└─────────────────────────┘
```

### Input Bar
- Height: 56px
- Background: `#202C33`
- Input field: `#2A3942`, border radius 24px, full-width minus send button
- Placeholder: "Type a food or drink name..."
- Send button: WhatsApp green circle, arrow icon
- Disabled state: send button greyed out when input is empty
- Loading state: send button replaced with spinner

### Loading / Typing State
- Three-dot typing indicator in inbound bubble
- Animated with staggered opacity pulse
- Appears immediately after user sends, before result arrives

---

## Interaction States

| State | Visual |
|---|---|
| Idle | Welcome bubble visible, input active |
| User typed | Outbound bubble appears, typing indicator shows |
| Loading | Typing indicator pulses (2–3 seconds) |
| Result ready | NutriCard replaces typing indicator |
| Not found | Plain inbound bubble with not-found message |
| Error | Plain inbound bubble with retry prompt |

---

## Micro-copy

**Welcome message:**
> "Hi! Type any food or drink name and I'll break down what's actually in it. Try *Coca Cola*, *Lays Chips*, or *Towergate Digestives*."

**Not found:**
> "I couldn't find that one. Try being more specific — for example, *Lays Classic Salted* instead of just *Lays*."

**Error:**
> "Something went wrong on my end. Try again?"

**Input placeholder:**
> "Type a food or drink name..."

---

## What This Is Not

NutriLens is not a diet app. It does not count calories across a day. It does not tell users what to eat. It translates one product at a time, honestly, without agenda. The design should reflect this. No streaks, no scores, no gamification. Just a clean answer to a simple question.
