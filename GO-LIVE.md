# Go Live — your repo is the control panel

This is the "you run it through here" model, made real. After a **one-time setup**, the live store is driven entirely from this GitHub repo: I (or you) push a change, and your host auto-deploys it. You never touch Shopify and never write code.

```
   THIS REPO  ──push──▶  FREE HOST (Cloudflare Pages / Netlify)  ──▶  your live store
   (I edit here)          (auto-deploys local-store/ on every push)     yourstore.com

   customer buys ──▶ Stripe (your account) ──▶ you get paid + order email ──▶ you order from supplier
```

---

## Your one-time setup (≈20 minutes, only you can do these)

These three things require **your identity / accounts** — that's a legal requirement for taking money, not a limitation I can code around.

### 1. Stripe account + payment links
1. Create a free account at **stripe.com** and complete verification (business/personal details + bank account for payouts).
2. Dashboard → **Payment Links → + New**. Create one per store, set the price, enable **"Collect shipping address"** and **"Adjustable quantity."**
   - GlowLab → $97 · SaunaZen → $169 · LinguaFlow → $59
3. Copy each `https://buy.stripe.com/...` URL.
4. Open **`local-store/payment-links.js`** and paste them in (or just paste them to me here and I'll commit them):
   ```js
   window.PAYMENT_LINKS = {
     'glowlab-pro-led-mask':       'https://buy.stripe.com/your_real_link',
     'saunazen-signature-blanket': 'https://buy.stripe.com/your_real_link',
     'linguaflow-pro-earbuds':     'https://buy.stripe.com/your_real_link',
   };
   ```

### 2. Connect a free host (auto-deploy)
Pick one — both are free and watch this repo:
- **Cloudflare Pages:** dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → pick `maxkoth/dropshipping` → Framework preset **None**, Build command **empty**, Build output directory **`local-store`** → Save and Deploy.
- **Netlify:** app.netlify.com → Add new site → Import from Git → pick the repo. The included `netlify.toml` already sets the publish folder — just deploy.

You'll get a live URL (e.g. `your-stores.pages.dev`) in ~1 minute.

### 3. (Optional) Custom domain
Buy a domain (~$10/yr) and add it in the host's domain settings. Or run each store on its own domain later.

**That's the entire list of things only you can do.** Everything else is operated from this repo.

---

## How we run it "through here" after that

- **Change anything** — prices, copy, products, add a store: I edit in this repo and push. Your host redeploys automatically. No further action from you.
- **Orders:** every sale emails you + appears in your Stripe dashboard (with the customer's shipping address).
- **Fulfillment:** order the item from the supplier in `stores/store-N/ops/supplier-import-template.csv` (CJ Dropshipping / AliExpress), ship to the customer, send them the tracking number. (This step needs your money + supplier account; it can be automated later with AutoDS/CJ.)

---

## Adding more stores later (the "infinite stores" path — read this first)

Technically, scaling is a drop-in: add `stores/store-4/storefront/{index.html,product.html,style.css,checkout-redirect.js}`, run `npm run build` in `local-store/`, add its Stripe link, push. It auto-appears on the landing page and deploys.

**But more stores is not more money.** Each store needs its own ad budget, video creative, and customer service, and a fresh ad pixel takes ~$150–300 to learn. Five underfunded stores all stall; one funded store can win. The recommended sequence (from `LAUNCH_REPORT.md`) is **one at a time**:

1. **LinguaFlow first** — best margin, lowest break-even ROAS, summer travel timing.
2. Once it's profitably above ~2x ROAS, bring on **GlowLab**.
3. Then **SaunaZen**.

Get one to actually make money before duplicating. When you're ready to expand, I'll template store #4+ in minutes — but I'd be doing you a disservice to spray up ten stores today.

---

## Honest limits of this setup
- **Checkout = one product per order** (plus quantity) via Stripe Payment Links. Great for these single-hero stores. Upsells/bundles are sold post-purchase (the email flows in `stores/store-N/copy/email-sequence.txt`). If you later want a true multi-item cart + an order-admin dashboard, that's an upgrade to a small server app on the same host — say the word.
- **Product images** are emoji/CSS placeholders right now. Swap in real supplier photos before driving paid traffic.
- **Compliance:** keep the "helps / supports / up to X%" language and disclaimers already in the product copy (see the HIGH-risk flags in `LAUNCH_REPORT.md`).
