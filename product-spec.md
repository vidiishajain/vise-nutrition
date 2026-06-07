# Product Spec — NutriLens

## Problem

Reading a nutrition label is technically possible for most people. Acting on it is not. The information exists but it's presented in a format that requires context: what's a normal amount of sugar? Is 14g of fat per serving high or fine? How does 480mg of sodium fit into a day?

Most people make food decisions without this context. Not because they don't care, but because the translation layer between "nutrition panel" and "should I eat this" is missing.

---

## Solution

NutriLens provides that translation layer. One input, one output. You name the product. You get a verdict you can act on in 10 seconds.

The verdict is not moralising. It is contextual, portion-aware, and honest about trade-offs.

---

## Core User Flow

```
User types product name
        ↓
App queries Open Food Facts API
        ↓
If found: extract nutritional panel
If not found: return "product not in database" message
        ↓
Claude API synthesises plain-language breakdown
        ↓
NutriCard displayed as chat bubble
```

---

## The NutriCard Output Format

Every result returns four elements:

**1. Traffic Light**
🟢 Generally fine
🟡 Fine in moderation — here's why
🔴 Worth knowing before you decide

**2. Key Numbers** (per serving, not per 100g)
Calories / Sugar / Salt / Saturated Fat
Each shown with a brief contextual note (e.g. "that's ~20% of your daily sugar")

**3. One Plain-English Line**
The thing worth knowing that the label doesn't tell you.
Example: *"The 'low fat' label is accurate, but the sugar content compensates."*

**4. Verdict**
A single short judgment. Not a prohibition. A steer.
Example: *"Fine occasionally. Not an everyday snack."*

---

## MVP Feature Set

- [x] Free-text product search by name
- [x] Open Food Facts integration
- [x] Claude-generated plain-language breakdown
- [x] NutriCard output in WhatsApp-style bubble
- [x] Not-found state handled gracefully
- [x] Mobile-first layout

---

## Out of Scope (MVP)

- Barcode scanning
- User accounts or history
- Dietary preference filters (vegan, gluten-free, etc.)
- Comparison between two products
- Actual WhatsApp Business API integration
- Recipe or ingredient-level analysis

---

## Potential V2 Features

- **Barcode scan** via device camera — same output, faster input
- **WhatsApp Bot** — connect core logic to WhatsApp Business API via Twilio or Meta Cloud API
- **Dietary flags** — user sets preferences (low sugar, high protein), verdict adjusts
- **Compare mode** — "Lays vs Pringles" side by side
- **Save history** — logged-in users keep a product journal

---

## Success Metrics (MVP)

- User can get a result for any major branded product within 10 seconds
- Output is readable and actionable without nutritional knowledge
- Not-found rate below 15% for mainstream supermarket products

---

## Constraints

- Open Food Facts coverage is strong for UK, US, EU products. Weaker for regional Indian brands. This is a known gap.
- Claude API adds ~1–2 seconds latency. Acceptable. Skeleton loading state covers it.
- No user data is stored. No accounts. No tracking. Session only.
