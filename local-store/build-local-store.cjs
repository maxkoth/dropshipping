#!/usr/bin/env node
/**
 * build-local-store.cjs
 * Assembles a self-contained, Shopify-free storefront bundle from the recovered
 * static stores. Checkout goes to your Stripe Payment Links (set in payment-links.js).
 *
 * Run:   node local-store/build-local-store.cjs   (regenerates this folder)
 * Serve: npm start   (from local-store/)  →  http://localhost:8080
 *
 * Scaling: any folder stores/store-N/storefront/ is auto-discovered, so adding a
 * new store is a drop-in. Your real payment-links.js is NEVER overwritten.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;                       // local-store/
const REPO = path.resolve(ROOT, '..');        // repo root
const SRC = path.join(REPO, 'stores');
const FILES = ['index.html', 'product.html', 'style.css', 'checkout-redirect.js'];

// Polish for the known stores; unknown stores fall back to derived defaults.
const KNOWN = {
  'store-1': { emoji: '💜' },
  'store-2': { emoji: '🌿' },
  'store-3': { emoji: '🌍' },
};

function discoverStores() {
  return fs.readdirSync(SRC)
    .filter((d) => /^store-\d+$/.test(d) && fs.existsSync(path.join(SRC, d, 'storefront', 'index.html')))
    .sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]))
    .map((dir) => {
      const indexHtml = fs.readFileSync(path.join(SRC, dir, 'storefront', 'index.html'), 'utf8');
      const checkout = fs.readFileSync(path.join(SRC, dir, 'storefront', 'checkout-redirect.js'), 'utf8');
      const title = (indexHtml.match(/<title>([^<]*)<\/title>/) || [])[1] || dir;
      const brand = title.split('|')[0].trim() || dir;
      const tagline = ((title.split('|')[1] || '').split(/[—–-]/)[0] || '').trim() || 'Shop now';
      const productId = (checkout.match(/productId:\s*'([^']*)'/) || [])[1] || dir;
      return { dir, brand, tagline, productId, emoji: (KNOWN[dir] || {}).emoji || '🛒' };
    });
}

function patchCheckout(js, pid) {
  return js.replace(/checkoutUrl:\s*'([^']*)'/,
    `checkoutUrl: (typeof window !== 'undefined' && window.PAYMENT_LINKS && window.PAYMENT_LINKS['${pid}']) || '$1'`);
}
function patchHtml(html) {
  return html.replace(/<script src="checkout-redirect\.js"><\/script>/g,
    '<script src="../payment-links.js"></script>\n  <script src="checkout-redirect.js"></script>');
}

const stores = discoverStores();

// 1) Copy + patch each store
stores.forEach((s) => {
  const dest = path.join(ROOT, s.dir);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  FILES.forEach((f) => {
    let body = fs.readFileSync(path.join(SRC, s.dir, 'storefront', f), 'utf8');
    if (f === 'checkout-redirect.js') body = patchCheckout(body, s.productId);
    if (f.endsWith('.html')) body = patchHtml(body);
    fs.writeFileSync(path.join(dest, f), body);
  });
  console.log(`✓ ${s.brand} → local-store/${s.dir}/`);
});

// 2) Stripe Payment Links config — created once, then PRESERVED (your edits are safe).
const linksPath = path.join(ROOT, 'payment-links.js');
if (fs.existsSync(linksPath)) {
  console.log('• payment-links.js already exists — preserved (your live links are untouched).');
} else {
  const entries = stores.map((s) => `  '${s.productId}': 'https://buy.stripe.com/REPLACE_${s.brand.toUpperCase()}',`).join('\n');
  fs.writeFileSync(linksPath, `/* ============================================================
   STRIPE PAYMENT LINKS  —  paste your live links below.
   Stripe Dashboard → Payment Links → New (one per product) → copy the
   https://buy.stripe.com/... URL here. No Shopify, no server, no code.
   This file is NOT overwritten by rebuilds, so your links stay put.
   ============================================================ */
window.PAYMENT_LINKS = {
${entries}
};
`);
  console.log('• payment-links.js created with placeholder links.');
}

// 3) Landing page linking to all discovered stores
const cards = stores.map((s) => `      <a class="card" href="${s.dir}/index.html">
        <div class="emoji">${s.emoji}</div>
        <div class="brand">${s.brand}</div>
        <div class="tag">${s.tagline}</div>
        <span class="enter">Enter store →</span>
      </a>`).join('\n');
fs.writeFileSync(path.join(ROOT, 'index.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your Stores</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem}
  h1{font-size:2rem;margin-bottom:.4rem}p.sub{color:#9aa4c0;margin-bottom:2.5rem;text-align:center}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem;max-width:980px;width:100%}
  .card{background:#151b30;border:1px solid #243056;border-radius:16px;padding:2rem 1.5rem;text-decoration:none;color:#fff;transition:.2s;display:flex;flex-direction:column;gap:.4rem}
  .card:hover{transform:translateY(-4px);border-color:#3a4f8f;background:#1a2240}
  .emoji{font-size:2.5rem}.brand{font-size:1.4rem;font-weight:700}.tag{color:#9aa4c0;font-size:.9rem}
  .enter{margin-top:1rem;color:#6ea8ff;font-weight:600}
  .note{margin-top:2.5rem;color:#6b7494;font-size:.8rem;max-width:620px;text-align:center;line-height:1.5}
</style></head>
<body>
  <h1>🛍️ Your Stores</h1>
  <p class="sub">No Shopify. Checkout runs on your Stripe Payment Links.</p>
  <div class="grid">
${cards}
  </div>
  <p class="note">Set checkout links in <code>payment-links.js</code>. See <code>GO-LIVE.md</code> to connect a free host so every push publishes automatically.</p>
</body></html>
`);

console.log(`\nDone — ${stores.length} store(s). From local-store/ run:  npm start  → http://localhost:8080`);
