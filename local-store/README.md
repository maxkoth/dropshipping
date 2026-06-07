# Local Store Bundle — run your stores without Shopify

A self-contained version of all 3 storefronts that runs on your own machine (or any free static host) with **no Shopify**. Checkout is handled by **Stripe Payment Links** — Stripe hosts the payment page and sends receipts, so you never run payment code yourself.

```
local-store/
├── index.html            landing page → links to all 3 stores
├── payment-links.js      ← the ONE file you edit (paste your Stripe links here)
├── serve.mjs             zero-dependency local web server
├── package.json          npm start / npm run build
├── build-local-store.cjs regenerates this bundle from stores/ (npm run build)
├── store-1/  (GlowLab)    index.html · product.html · style.css · checkout-redirect.js
├── store-2/  (SaunaZen)   …
└── store-3/  (LinguaFlow) …
```

---

## 1. Run it locally (30 seconds)

From this folder:

```bash
npm start
```

Then open **http://localhost:8080**. No build step, no dependencies, no account needed. (No Node? `python3 -m http.server 8080` works too.)

You'll see the landing page → click into any store → browse the product page → **Add to Cart** sends you to checkout. Until you add real Stripe links (step 2), the buy button points at a placeholder URL.

---

## 2. Make checkout real (no Shopify, no code)

1. Create a free **Stripe** account → stripe.com.
2. Dashboard → **Payment Links → + New** → create one link per product, set the price ($59 / $97 / $169), enable shipping-address collection and the quantity selector.
3. Copy each `https://buy.stripe.com/...` URL into **`payment-links.js`**:

```js
window.PAYMENT_LINKS = {
  'glowlab-pro-led-mask':       'https://buy.stripe.com/your_real_link',
  'saunazen-signature-blanket': 'https://buy.stripe.com/your_real_link',
  'linguaflow-pro-earbuds':     'https://buy.stripe.com/your_real_link',
};
```

That's it — the buy buttons now take customers to real, hosted Stripe checkout. Stripe collects payment, the shipping address, and emails the receipt.

---

## 3. Put it online for real customers (free)

Your machine isn't a public website. To let anyone buy, drop this folder on a free static host:

- **Netlify Drop** (easiest): netlify.com/drop → drag the `local-store` folder in → you get a live URL in seconds.
- **Cloudflare Pages** or **Vercel**: connect this repo, set the output directory to `local-store`.
- Add your own domain on any of them (free DNS, ~$10/yr for the domain).

Because checkout is Stripe Payment Links, a plain static host is all you need — no server.

---

## 4. Fulfilling orders (where the product comes from)

When you get a Stripe order email:
1. Order the item from the supplier in your `ops/supplier-import-template.csv` (CJ Dropshipping / AliExpress), shipping to the customer's address.
2. Add their tracking number to the customer (Stripe → the payment → send an update, or email them).
3. Or automate with an order tool (e.g. AutoDS/CJ) — but at low volume, manual is fine.

---

## What this bundle is — and isn't

**Is:** the real recovered storefronts, running, with a working path to take live payments and fulfill orders, entirely without Shopify.

**Isn't:** a full e-commerce backend. Stripe Payment Links handle one product per checkout (plus quantity) — great for these single-hero stores, but there's no multi-item cart, no built-in inventory sync, no automatic order→supplier push, and no Shopify-style admin. If you outgrow that, either move to Shopify (see `../shopify-ready/`) or add a small cart + Stripe Checkout backend.

> Re-generate this bundle anytime after editing the source storefronts: `npm run build`.
> Product images: the pages use emoji/CSS placeholders. Swap in real supplier photos in each store's `index.html` / `product.html` before going live.
