# Shopify Launch Setup Guide — 3 Stores

This guide turns the recovered assets into 3 live Shopify stores. **Do Store 3 (LinguaFlow) first** — it has the best margin and lowest break-even ROAS (per `LAUNCH_REPORT.md`). Get one working end-to-end before building the others.

> ⚠️ **Read first — honest expectations.** The revenue numbers in `LAUNCH_REPORT.md` are AI-generated *estimates*, not forecasts. Most first dropshipping stores lose their initial ad budget. Treat the $500 test budget as tuition. Two products (LED mask, sauna blanket) carry **HIGH compliance risk** — keep the "helps/supports/up to X%" language already baked into these descriptions and never claim to treat or cure anything.

---

## What's in this folder

```
shopify-ready/
├── SETUP-GUIDE.md                ← you are here
├── build-shopify-assets.js       ← regenerates the CSVs/content packs (node build-shopify-assets.js)
├── store-1-glowlab/
│   ├── products-shopify-import.csv   ← upload to Shopify → Products → Import
│   └── content-pack.md               ← descriptions, SEO, build map
├── store-2-saunazen/  (same two files)
└── store-3-linguaflow/ (same two files)
```

The ad scripts, A/B headlines, email sequences and keyword strategy stay in each store's original `stores/store-N/copy/` folder.

---

## Per-store setup (repeat 3×, starting with LinguaFlow)

### 1. Create the Shopify store
- Sign up at shopify.com (free trial → Basic ~$39/mo). Use a separate store for each brand.
- Set store currency to **USD**, store name to the brand (LinguaFlow / GlowLab / SaunaZen).

### 2. Import the products
- **Products → Import → Add file** → select that store's `products-shopify-import.csv` → **Upload and continue**.
- This creates the main product (with color/size variants), the upsell accessory, and the bundle(s), with prices, compare-at prices, SEO and descriptions already filled.
- The CSV intentionally has **no images** and **inventory tracking off** — you add images and connect inventory in the next step.

### 3. Connect a supplier (this is where products come from)
- Install a dropship app from the Shopify App Store: **DSers** (AliExpress) or the **CJ Dropshipping** app. The recovered `ops/supplier-import-template.csv` lists CJ + AliExpress source URLs, costs, SKUs and HS codes for every variant.
- Find each product in the app, **link it to your imported Shopify product**, and pull in the supplier's images.
- **Order 1 test unit of each product yourself first.** `LAUNCH_REPORT.md` warns the real specs (LED chip count, offline language count, EMF rating) often differ from the listing — verify before you advertise, because you're legally responsible for the claims.

### 4. Payments, shipping, legal
- **Payments:** turn on Shopify Payments + PayPal. (Add Klarna/Afterpay for SaunaZen's higher $169 ticket.)
- **Shipping:** set a free-shipping rate (it's priced into the margins).
- **Legal pages (required for ad approval):** Settings → Policies → auto-generate Privacy, Terms, Refund, Shipping. Add a clear delivery-time notice (**8–14 days**) to avoid chargebacks.

### 5. Build the storefront pages
- Use the free **Dawn** theme (or a builder like GemPages/PageFly).
- Hero headline/subhead → from `copy/headline.txt` (A/B test variants A/B/C).
- Product description / SEO → already imported from the CSV (and detailed in `content-pack.md`).
- Use `storefront/index.html` + `product.html` only as a **visual/layout reference** — they are static pages, not a Shopify theme, so don't try to upload them as one.

### 6. Tracking pixels
- Install **Meta Pixel** (Facebook & Instagram channel) and **TikTok Pixel** (TikTok channel) via Shopify's native sales-channel integrations — easier and more reliable than the manual `fbq`/`ttq` calls in the recovered `checkout-redirect.js`.
- Confirm `AddToCart` and `Purchase` events fire (Meta Events Manager test tool).

### 7. Email flows
- Install **Klaviyo** (free tier). Create three flows and paste from `copy/email-sequence.txt`:
  - **Welcome** (on signup) · **Abandoned Cart** (~1 hr delay) · **Post-Purchase upsell** (2–3 days after order).

### 8. Pre-launch test
- Place one real end-to-end test order; confirm it pushes to the supplier with tracking.
- Work through the "General Launch Checklist" in `LAUNCH_REPORT.md` and `ops/fulfillment-checklist.md` before spending on ads.

---

## Launch order & ad budget (from LAUNCH_REPORT.md)

| Order | Store | First-30-day budget | Channels |
|---|---|---|---|
| 1st | **LinguaFlow** | $250 | TikTok $150 + Facebook $100 |
| 2nd | **GlowLab** | $175 | TikTok $100 + Facebook $75 |
| 3rd | **SaunaZen** | $75 | Facebook $75 (soft launch) |

- Test 3 creatives per store; kill anything under ~1% CTR by week 2; scale the winner ~20%/week.
- Add retargeting once the pixel has data. Only scale a store past test budget once ROAS is comfortably above break-even (LinguaFlow break-even ≈ 1.33x).
- **The one asset you still need: short-form video.** None of the recovered files include video, and TikTok/Reels video is what actually sells these. Film the demo clips described in each `copy/ad-copy.txt`.

---

## Margin reference (from the recovered pricing calculators)

| Store | Lead product | Price | Supplier+ship | Break-even ROAS |
|---|---|---|---|---|
| LinguaFlow | Earbuds | $59 | ~$16 | ~1.33x |
| GlowLab | LED mask | $97 | ~$23 | ~1.35x |
| SaunaZen | Sauna blanket | $169 | ~$54 | ~1.51x |

Re-check anytime with `node stores/store-N/ops/pricing-calculator.js` if supplier costs change.
