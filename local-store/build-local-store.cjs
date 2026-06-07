#!/usr/bin/env node
/**
 * build-local-store.cjs
 * Assembles a self-contained, Shopify-free storefront bundle from the recovered
 * static stores. Checkout goes to your Stripe Payment Links (set in payment-links.js).
 *
 * Run:   node local-store/build-local-store.cjs   (regenerates this folder)
 * Serve: npm start   (from local-store/)  →  http://localhost:8080
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;                       // local-store/
const REPO = path.resolve(ROOT, '..');        // repo root
const SRC = path.join(REPO, 'stores');

const STORES = [
  { dir: 'store-1', brand: 'GlowLab',    tagline: 'LED Light Therapy Face Mask',     emoji: '💜' },
  { dir: 'store-2', brand: 'SaunaZen',   tagline: 'Far-Infrared Sauna Blanket',      emoji: '🌿' },
  { dir: 'store-3', brand: 'LinguaFlow', tagline: 'AI Real-Time Translation Earbuds', emoji: '🌍' },
];

const FILES = ['index.html', 'product.html', 'style.css', 'checkout-redirect.js'];

function patchCheckout(js) {
  const pid = (js.match(/productId:\s*'([^']*)'/) || [])[1] || '';
  // Resolve checkout URL from the shared payment-links.js map, falling back to the placeholder.
  return js.replace(/checkoutUrl:\s*'([^']*)'/,
    `checkoutUrl: (typeof window !== 'undefined' && window.PAYMENT_LINKS && window.PAYMENT_LINKS['${pid}']) || '$1'`);
}

function patchHtml(html) {
  // Load the shared payment-links map before the store's checkout script.
  return html.replace(/<script src="checkout-redirect\.js"><\/script>/g,
    '<script src="../payment-links.js"></script>\n  <script src="checkout-redirect.js"></script>');
}

// 1) Copy + patch each store
STORES.forEach((s) => {
  const dest = path.join(ROOT, s.dir);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  FILES.forEach((f) => {
    let body = fs.readFileSync(path.join(SRC, s.dir, 'storefront', f), 'utf8');
    if (f === 'checkout-redirect.js') body = patchCheckout(body);
    if (f.endsWith('.html')) body = patchHtml(body);
    fs.writeFileSync(path.join(dest, f), body);
  });
  console.log(`✓ ${s.brand} → local-store/${s.dir}/`);
});

// 2) Shared Stripe Payment Links config (the ONLY thing you edit to go live)
const links = `/* ============================================================
   STRIPE PAYMENT LINKS  —  paste your live links below.
   How: Stripe Dashboard → Payment Links → New → create one per product,
   set the price, then copy the https://buy.stripe.com/... URL here.
   No Shopify, no server, no code. Stripe hosts checkout + receipts.
   ============================================================ */
window.PAYMENT_LINKS = {
  'glowlab-pro-led-mask':        'https://buy.stripe.com/REPLACE_GLOWLAB',
  'saunazen-signature-blanket':  'https://buy.stripe.com/REPLACE_SAUNAZEN',
  'linguaflow-pro-earbuds':      'https://buy.stripe.com/REPLACE_LINGUAFLOW',
};
`;
fs.writeFileSync(path.join(ROOT, 'payment-links.js'), links);

// 3) Landing page linking to all 3 stores
const cards = STORES.map((s) => `      <a class="card" href="${s.dir}/index.html">
        <div class="emoji">${s.emoji}</div>
        <div class="brand">${s.brand}</div>
        <div class="tag">${s.tagline}</div>
        <span class="enter">Enter store →</span>
      </a>`).join('\n');
const landing = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your Stores — Local Preview</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem}
  h1{font-size:2rem;margin-bottom:.4rem}p.sub{color:#9aa4c0;margin-bottom:2.5rem;text-align:center}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem;max-width:880px;width:100%}
  .card{background:#151b30;border:1px solid #243056;border-radius:16px;padding:2rem 1.5rem;text-decoration:none;color:#fff;transition:.2s;display:flex;flex-direction:column;gap:.4rem}
  .card:hover{transform:translateY(-4px);border-color:#3a4f8f;background:#1a2240}
  .emoji{font-size:2.5rem}.brand{font-size:1.4rem;font-weight:700}.tag{color:#9aa4c0;font-size:.9rem}
  .enter{margin-top:1rem;color:#6ea8ff;font-weight:600}
  .note{margin-top:2.5rem;color:#6b7494;font-size:.8rem;max-width:620px;text-align:center;line-height:1.5}
</style></head>
<body>
  <h1>🛍️ Your Stores</h1>
  <p class="sub">Local preview — no Shopify. Checkout uses your Stripe Payment Links.</p>
  <div class="grid">
${cards}
  </div>
  <p class="note">Set your real checkout links in <code>payment-links.js</code>. Until then, the Buy buttons point at placeholder Stripe URLs. See <code>README.md</code> to go live + deploy free.</p>
</body></html>
`;
fs.writeFileSync(path.join(ROOT, 'index.html'), landing);

console.log('\nDone. From local-store/ run:  npm start   → http://localhost:8080');
