#!/usr/bin/env node
/**
 * build-shopify-assets.js
 * Generates Shopify-ready product import CSVs + content packs for all 3 stores
 * from the recovered store data. Re-runnable: `node shopify-ready/build-shopify-assets.js`
 *
 * Output (per store): products-shopify-import.csv  +  content-pack.md
 *
 * NOTE: Product descriptions use compliance-safe language ("helps / supports /
 * up to X%") and include disclaimers, per the risk flags in LAUNCH_REPORT.md.
 * Review against FTC/FDA guidance before going live.
 */

const fs = require('fs');
const path = require('path');

/* ---------- Shopify product CSV columns (standard import header) ---------- */
const HEADER = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty',
  'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price',
  'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable',
  'Variant Weight Unit', 'Image Src', 'Image Position', 'SEO Title', 'SEO Description', 'Status',
];

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/* Build CSV rows for one product (first row carries product-level fields,
   additional variants are handle-only rows). */
function productRows(p) {
  const rows = [];
  p.variants.forEach((v, i) => {
    const first = i === 0;
    rows.push([
      p.handle,
      first ? p.title : '',
      first ? p.body : '',
      first ? p.vendor : '',
      first ? p.type : '',
      first ? p.tags : '',
      first ? 'TRUE' : '',
      first ? p.optionName : '',
      v.option,
      v.sku,
      v.grams,
      '',                 // Variant Inventory Tracker: blank = don't track (the dropship app takes over)
      '',                 // Variant Inventory Qty
      'continue',         // keep selling (dropshipped)
      'manual',
      v.price.toFixed(2),
      v.compareAt ? v.compareAt.toFixed(2) : '',
      'TRUE',
      'TRUE',
      'g',
      '',                 // Image Src — add product photos in Shopify after importing from the supplier app
      '',
      first ? p.seoTitle : '',
      first ? p.seoDesc : '',
      'active',
    ]);
  });
  return rows;
}

function buildCsv(store) {
  const lines = [HEADER.map(csvEscape).join(',')];
  store.products.forEach((p) => {
    productRows(p).forEach((r) => lines.push(r.map(csvEscape).join(',')));
  });
  return lines.join('\n') + '\n';
}

/* ----------------------------- STORE DATA ----------------------------- */

const MASK_BODY = `<h3>Clinic-inspired LED light therapy &mdash; at home in 10 minutes a day</h3>
<p>The GlowLab Pro brings 7-wavelength LED light therapy into your daily routine. With 136 LED chips spanning red, blue, green, yellow and infrared light, it's designed to support clearer, brighter, healthier-looking skin.</p>
<ul>
<li><strong>7 wavelengths &middot; 136 LED chips</strong> &mdash; broader coverage than typical 3&ndash;4 light masks</li>
<li><strong>Red light</strong> helps support collagen and the look of fine lines</li>
<li><strong>Blue light</strong> targets acne-causing bacteria on the skin's surface</li>
<li><strong>Green &amp; yellow light</strong> help with the appearance of dark spots and redness</li>
<li><strong>10-minute auto shut-off</strong> &mdash; hands-free, rechargeable, travel-friendly</li>
<li><strong>60-day money-back guarantee</strong> + free shipping</li>
</ul>
<p><em>Results vary. GlowLab is a cosmetic skincare device and is not intended to diagnose, treat, cure, or prevent any disease or medical condition. Consult a dermatologist for medical skin concerns.</em></p>`;

const SERUM_BODY = `<h3>GlowLab Radiance Serum &mdash; made for post-LED skin</h3>
<p>A lightweight daily serum formulated to pair with your LED routine. Niacinamide, hyaluronic acid, vitamin C and bakuchiol help hydrate, brighten and support a smoother-looking complexion.</p>
<ul>
<li>2% Niacinamide &mdash; helps with the look of uneven tone</li>
<li>Hyaluronic acid &mdash; deep hydration</li>
<li>Vitamin C &amp; bakuchiol &mdash; brightening, gentle support</li>
<li>30ml &middot; cruelty-free</li>
</ul>
<p><em>Cosmetic product. Patch test before first use.</em></p>`;

const MASK_BUNDLE_BODY = `<h3>GlowLab Pro LED Mask + Radiance Serum</h3>
<p>The complete glow routine: the 7-wavelength GlowLab Pro LED mask paired with the Radiance Serum, formulated to absorb into freshly-treated skin. Save versus buying separately.</p>` + MASK_BODY;

const BLANKET_BODY = `<h3>Far-infrared heat therapy at home</h3>
<p>SaunaZen's far-infrared (4&ndash;14&micro;m) sauna blanket delivers deep, even warmth across 6 heat zones, adjustable from 77&ndash;176&deg;F. Enjoy a relaxing, spa-like session at home in about 45 minutes.</p>
<ul>
<li>6 independent heat zones &middot; 77&ndash;176&deg;F digital control</li>
<li>Low-EMF design (under 3mG)</li>
<li>Waterproof, easy-wipe interior</li>
<li>Folds flat for storage &middot; free carry bag included this week</li>
<li>45-day money-back guarantee + free shipping</li>
</ul>
<p><em>For relaxation and comfort use only. Not a medical device and not intended to diagnose, treat, cure, or prevent any disease. Do not use if pregnant, fitted with a pacemaker, or living with a medical condition without first consulting your doctor. Stay hydrated before and after each session.</em></p>`;

const BAG_BODY = `<h3>SaunaZen Premium Carry Bag</h3>
<p>Durable waxed-canvas carry bag sized for your SaunaZen blanket. Folds your blanket away neatly for storage or travel.</p><ul><li>Water-resistant waxed canvas</li><li>Reinforced handles</li><li>Fits the SaunaZen blanket folded</li></ul>`;

const BLANKET_BUNDLE_BODY = `<h3>SaunaZen Blanket + Premium Carry Bag</h3>
<p>The full kit: the 6-zone far-infrared SaunaZen blanket plus the premium waxed-canvas carry bag for easy storage and travel.</p>` + BLANKET_BODY;

const EARBUDS_BODY = `<h3>Real-time AI translation in 144 languages</h3>
<p>LinguaFlow Pro earbuds translate conversations in real time &mdash; fast, natural, and built for travel, business and everyday connection. 40 core languages work fully offline, so you're covered even without Wi-Fi.</p>
<ul>
<li>144 languages supported &middot; 40 available offline</li>
<li>Real-time, low-latency translation (about 0.2s in ideal conditions)</li>
<li>Up to 98% accuracy on top languages &mdash; varies with accent, dialect &amp; background noise</li>
<li>4-mic noise reduction &middot; Bluetooth 5.3 &middot; IPX5 water resistance</li>
<li>8-hour battery (up to 32 hours with the charging case)</li>
<li>Free travel case this week &middot; 30-day money-back guarantee</li>
</ul>
<p><em>Translation accuracy varies by language pair, accent, dialect and ambient noise. Some features may require the companion app and an internet connection. Not all 144 languages are available offline.</em></p>`;

const CASE_BODY = `<h3>LinguaFlow Premium Travel Case</h3>
<p>A slim, protective hard case for your LinguaFlow earbuds. Shock-absorbing interior, compact for any bag or pocket.</p><ul><li>Hard-shell protection</li><li>Compact, lightweight</li><li>Fits LinguaFlow Pro earbuds + charging case</li></ul>`;

const EARBUDS_BUNDLE_BODY = `<h3>LinguaFlow Pro Earbuds + Travel Case</h3>
<p>The travel-ready kit: LinguaFlow Pro AI translation earbuds plus the premium hard travel case.</p>` + EARBUDS_BODY;

const TWOPACK_BODY = `<h3>LinguaFlow Family 2-Pack &mdash; two-way conversations</h3>
<p>Two pairs of LinguaFlow Pro earbuds so two people can each wear one and talk naturally across languages. Ideal for families, couples and business pairs.</p>` + EARBUDS_BODY;

const stores = [
  {
    slug: 'store-1-glowlab', vendor: 'GlowLab', name: 'GlowLab (LED Face Mask)',
    products: [
      {
        handle: 'glowlab-pro-led-face-mask', title: 'GlowLab Pro LED Face Mask',
        body: MASK_BODY, vendor: 'GlowLab', type: 'Beauty Device',
        tags: 'LED face mask, light therapy, skincare, beauty tech, acne, anti-aging',
        optionName: 'Color',
        seoTitle: 'GlowLab Pro LED Face Mask | 7-Wavelength Light Therapy | $97',
        seoDesc: 'Buy the GlowLab Pro LED Face Mask. 136 LED chips, 7 wavelengths. Helps support clearer skin, fewer fine lines and brighter tone. Free shipping. 60-day guarantee.',
        variants: [
          { option: 'Pearl White', sku: 'GLAB-LED-001-PW', grams: 450, price: 97, compareAt: 156 },
          { option: 'Midnight Black', sku: 'GLAB-LED-001-BK', grams: 450, price: 97, compareAt: 156 },
          { option: 'Rose Gold', sku: 'GLAB-LED-001-RG', grams: 450, price: 97, compareAt: 156 },
        ],
      },
      {
        handle: 'glowlab-radiance-serum', title: 'GlowLab Radiance Serum (30ml)',
        body: SERUM_BODY, vendor: 'GlowLab', type: 'Skincare', tags: 'serum, niacinamide, vitamin c, skincare, upsell',
        optionName: 'Size', seoTitle: 'GlowLab Radiance Serum 30ml | Niacinamide + Vitamin C',
        seoDesc: 'The GlowLab Radiance Serum: niacinamide, hyaluronic acid, vitamin C and bakuchiol to hydrate and brighten. Designed to pair with LED therapy.',
        variants: [{ option: '30ml', sku: 'GLAB-SER-001', grams: 120, price: 36, compareAt: 49 }],
      },
      {
        handle: 'glowlab-mask-serum-bundle', title: 'GlowLab Pro LED Mask + Serum Bundle',
        body: MASK_BUNDLE_BODY, vendor: 'GlowLab', type: 'Beauty Device', tags: 'bundle, LED face mask, serum, value',
        optionName: 'Bundle', seoTitle: 'GlowLab LED Mask + Radiance Serum Bundle | Save',
        seoDesc: 'The complete GlowLab glow routine: 7-wavelength LED mask + Radiance Serum. Save versus buying separately. Free shipping, 60-day guarantee.',
        variants: [{ option: 'Mask + Serum', sku: 'GLAB-BUNDLE-001', grams: 570, price: 115, compareAt: 175 }],
      },
    ],
  },
  {
    slug: 'store-2-saunazen', vendor: 'SaunaZen', name: 'SaunaZen (Infrared Sauna Blanket)',
    products: [
      {
        handle: 'saunazen-infrared-sauna-blanket', title: 'SaunaZen Infrared Sauna Blanket',
        body: BLANKET_BODY, vendor: 'SaunaZen', type: 'Wellness Device',
        tags: 'infrared sauna blanket, far infrared, recovery, wellness, biohacking',
        optionName: 'Color',
        seoTitle: 'SaunaZen Infrared Sauna Blanket | 6 Zones, Low-EMF | $169',
        seoDesc: 'SaunaZen far-infrared sauna blanket. Far-infrared 4-14um, 6 heat zones, 77-176F, EMF under 3mG. Free carry bag, free shipping, 45-day guarantee.',
        variants: [
          { option: 'Forest Green', sku: 'SZEN-BLK-001-FG', grams: 2800, price: 169, compareAt: 219 },
          { option: 'Midnight Black', sku: 'SZEN-BLK-001-BK', grams: 2800, price: 169, compareAt: 219 },
          { option: 'Burgundy', sku: 'SZEN-BLK-001-BU', grams: 2800, price: 169, compareAt: 219 },
        ],
      },
      {
        handle: 'saunazen-premium-carry-bag', title: 'SaunaZen Premium Carry Bag',
        body: BAG_BODY, vendor: 'SaunaZen', type: 'Accessory', tags: 'carry bag, accessory, upsell',
        optionName: 'Size', seoTitle: 'SaunaZen Premium Waxed-Canvas Carry Bag',
        seoDesc: 'Durable waxed-canvas carry bag sized for the SaunaZen infrared sauna blanket. Water-resistant, reinforced handles.',
        variants: [{ option: 'One Size', sku: 'SZEN-BAG-001', grams: 450, price: 49, compareAt: 69 }],
      },
      {
        handle: 'saunazen-blanket-bag-bundle', title: 'SaunaZen Blanket + Carry Bag Bundle',
        body: BLANKET_BUNDLE_BODY, vendor: 'SaunaZen', type: 'Wellness Device', tags: 'bundle, infrared sauna blanket, carry bag, value',
        optionName: 'Bundle', seoTitle: 'SaunaZen Blanket + Premium Carry Bag Bundle',
        seoDesc: 'The full SaunaZen kit: 6-zone far-infrared sauna blanket + premium waxed-canvas carry bag. Free shipping, 45-day guarantee.',
        variants: [{ option: 'Blanket + Carry Bag', sku: 'SZEN-BUNDLE-PROMO', grams: 3250, price: 169, compareAt: 218 }],
      },
    ],
  },
  {
    slug: 'store-3-linguaflow', vendor: 'LinguaFlow', name: 'LinguaFlow (AI Translation Earbuds)',
    products: [
      {
        handle: 'linguaflow-pro-translation-earbuds', title: 'LinguaFlow Pro AI Translation Earbuds',
        body: EARBUDS_BODY, vendor: 'LinguaFlow', type: 'Electronics',
        tags: 'translation earbuds, ai translation, travel tech, earbuds, language',
        optionName: 'Color',
        seoTitle: 'LinguaFlow Pro Earbuds | Real-Time AI Translation | 144 Languages | $59',
        seoDesc: 'Buy LinguaFlow Pro AI translation earbuds. 144 languages, ~0.2s latency, 40 offline languages, IPX5, 8-hr battery. Free travel case + 30-day guarantee.',
        variants: [
          { option: 'Midnight Black', sku: 'LFLOW-001-BK', grams: 180, price: 59, compareAt: 79 },
          { option: 'Pearl White', sku: 'LFLOW-001-WH', grams: 180, price: 59, compareAt: 79 },
          { option: 'Navy Blue', sku: 'LFLOW-001-NB', grams: 180, price: 59, compareAt: 79 },
        ],
      },
      {
        handle: 'linguaflow-travel-case', title: 'LinguaFlow Premium Travel Case',
        body: CASE_BODY, vendor: 'LinguaFlow', type: 'Accessory', tags: 'travel case, accessory, upsell, earbuds',
        optionName: 'Size', seoTitle: 'LinguaFlow Premium Hard Travel Case',
        seoDesc: 'Slim hard-shell travel case for LinguaFlow Pro earbuds. Shock-absorbing, compact, fits earbuds and charging case.',
        variants: [{ option: 'Universal', sku: 'LFLOW-CASE-001', grams: 80, price: 29, compareAt: 39 }],
      },
      {
        handle: 'linguaflow-earbuds-case-bundle', title: 'LinguaFlow Earbuds + Travel Case Bundle',
        body: EARBUDS_BUNDLE_BODY, vendor: 'LinguaFlow', type: 'Electronics', tags: 'bundle, translation earbuds, travel case, value',
        optionName: 'Bundle', seoTitle: 'LinguaFlow Earbuds + Travel Case Bundle',
        seoDesc: 'Travel-ready kit: LinguaFlow Pro AI translation earbuds + premium hard travel case. Free shipping, 30-day guarantee.',
        variants: [{ option: 'Earbuds + Case', sku: 'LFLOW-BUNDLE-PROMO', grams: 260, price: 59, compareAt: 88 }],
      },
      {
        handle: 'linguaflow-family-2-pack', title: 'LinguaFlow Family 2-Pack (Bidirectional)',
        body: TWOPACK_BODY, vendor: 'LinguaFlow', type: 'Electronics', tags: 'two pack, translation earbuds, family, value, AOV',
        optionName: 'Bundle', seoTitle: 'LinguaFlow Family 2-Pack | Two-Way AI Translation',
        seoDesc: 'Two pairs of LinguaFlow Pro earbuds for natural two-way conversation across languages. Great for families, couples and business pairs.',
        variants: [{ option: '2 Pairs', sku: 'LFLOW-2PACK', grams: 360, price: 99, compareAt: 138 }],
      },
    ],
  },
];

/* ----------------------------- CONTENT PACK ----------------------------- */
function buildContentPack(store) {
  const L = [];
  L.push(`# ${store.vendor} — Shopify Content Pack\n`);
  L.push(`Everything below is ready to paste into Shopify. Product descriptions use compliance-safe language and include disclaimers (see LAUNCH_REPORT.md risk flags).\n`);
  L.push(`> Ad scripts, A/B headlines, email flows and the keyword strategy already live in \`stores/${store.slug.replace(/^store-\d+-/, m => 'store-' + store.slug.match(/store-(\d)/)[1] + '/')}\`. This pack adds the store-ready product copy + SEO + a build map.\n`);

  L.push(`## Products & descriptions (paste into Products → Add product → Description)\n`);
  store.products.forEach((p) => {
    const v0 = p.variants[0];
    const colors = p.variants.map((v) => v.option).join(', ');
    L.push(`### ${p.title}`);
    L.push(`- **Price:** $${v0.price.toFixed(2)}  |  **Compare-at:** $${v0.compareAt ? v0.compareAt.toFixed(2) : '—'}  |  **Option (${p.optionName}):** ${colors}`);
    L.push(`- **SEO title:** ${p.seoTitle}`);
    L.push(`- **SEO description:** ${p.seoDesc}`);
    L.push(`- **Tags:** ${p.tags}`);
    L.push(`\n**Description HTML:**\n`);
    L.push('```html');
    L.push(p.body);
    L.push('```\n');
  });

  L.push(`## Where each recovered asset goes in Shopify\n`);
  L.push(`| Recovered file | Use it for |`);
  L.push(`|---|---|`);
  L.push(`| \`copy/seo-meta.txt\` | Online Store → Preferences (homepage title/meta) + each product's SEO fields |`);
  L.push(`| \`copy/headline.txt\` | Hero section H1/subhead on your home + product page (A/B test the variants) |`);
  L.push(`| \`copy/ad-copy.txt\` | Meta Ads Manager & TikTok Ads Manager primary text + video scripts |`);
  L.push(`| \`copy/email-sequence.txt\` | Klaviyo flows: Welcome, Abandoned Cart, Post-Purchase upsell |`);
  L.push(`| \`ops/supplier-import-template.csv\` | Source/import products in DSers or the CJ Dropshipping app |`);
  L.push(`| \`ops/pricing-calculator.js\` | \`node pricing-calculator.js\` to re-check margins if costs change |`);
  L.push(`| \`ops/fulfillment-checklist.md\` | Your daily order-fulfillment SOP |`);
  L.push(`| \`storefront/*.html\` | Visual/layout reference when building theme sections (not a Shopify theme) |\n`);
  return L.join('\n');
}

/* ----------------------------- RUN ----------------------------- */
const OUT = path.join(__dirname);
stores.forEach((store) => {
  const dir = path.join(OUT, store.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'products-shopify-import.csv'), buildCsv(store));
  fs.writeFileSync(path.join(dir, 'content-pack.md'), buildContentPack(store));
  const variantCount = store.products.reduce((n, p) => n + p.variants.length, 0);
  console.log(`✓ ${store.name}: ${store.products.length} products / ${variantCount} variants → ${store.slug}/`);
});
console.log('\nDone. Import each products-shopify-import.csv via Shopify → Products → Import.');
