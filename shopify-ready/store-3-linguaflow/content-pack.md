# LinguaFlow — Shopify Content Pack

Everything below is ready to paste into Shopify. Product descriptions use compliance-safe language and include disclaimers (see LAUNCH_REPORT.md risk flags).

> Ad scripts, A/B headlines, email flows and the keyword strategy already live in `stores/store-3/linguaflow`. This pack adds the store-ready product copy + SEO + a build map.

## Products & descriptions (paste into Products → Add product → Description)

### LinguaFlow Pro AI Translation Earbuds
- **Price:** $59.00  |  **Compare-at:** $79.00  |  **Option (Color):** Midnight Black, Pearl White, Navy Blue
- **SEO title:** LinguaFlow Pro Earbuds | Real-Time AI Translation | 144 Languages | $59
- **SEO description:** Buy LinguaFlow Pro AI translation earbuds. 144 languages, ~0.2s latency, 40 offline languages, IPX5, 8-hr battery. Free travel case + 30-day guarantee.
- **Tags:** translation earbuds, ai translation, travel tech, earbuds, language

**Description HTML:**

```html
<h3>Real-time AI translation in 144 languages</h3>
<p>LinguaFlow Pro earbuds translate conversations in real time &mdash; fast, natural, and built for travel, business and everyday connection. 40 core languages work fully offline, so you're covered even without Wi-Fi.</p>
<ul>
<li>144 languages supported &middot; 40 available offline</li>
<li>Real-time, low-latency translation (about 0.2s in ideal conditions)</li>
<li>Up to 98% accuracy on top languages &mdash; varies with accent, dialect &amp; background noise</li>
<li>4-mic noise reduction &middot; Bluetooth 5.3 &middot; IPX5 water resistance</li>
<li>8-hour battery (up to 32 hours with the charging case)</li>
<li>Free travel case this week &middot; 30-day money-back guarantee</li>
</ul>
<p><em>Translation accuracy varies by language pair, accent, dialect and ambient noise. Some features may require the companion app and an internet connection. Not all 144 languages are available offline.</em></p>
```

### LinguaFlow Premium Travel Case
- **Price:** $29.00  |  **Compare-at:** $39.00  |  **Option (Size):** Universal
- **SEO title:** LinguaFlow Premium Hard Travel Case
- **SEO description:** Slim hard-shell travel case for LinguaFlow Pro earbuds. Shock-absorbing, compact, fits earbuds and charging case.
- **Tags:** travel case, accessory, upsell, earbuds

**Description HTML:**

```html
<h3>LinguaFlow Premium Travel Case</h3>
<p>A slim, protective hard case for your LinguaFlow earbuds. Shock-absorbing interior, compact for any bag or pocket.</p><ul><li>Hard-shell protection</li><li>Compact, lightweight</li><li>Fits LinguaFlow Pro earbuds + charging case</li></ul>
```

### LinguaFlow Earbuds + Travel Case Bundle
- **Price:** $59.00  |  **Compare-at:** $88.00  |  **Option (Bundle):** Earbuds + Case
- **SEO title:** LinguaFlow Earbuds + Travel Case Bundle
- **SEO description:** Travel-ready kit: LinguaFlow Pro AI translation earbuds + premium hard travel case. Free shipping, 30-day guarantee.
- **Tags:** bundle, translation earbuds, travel case, value

**Description HTML:**

```html
<h3>LinguaFlow Pro Earbuds + Travel Case</h3>
<p>The travel-ready kit: LinguaFlow Pro AI translation earbuds plus the premium hard travel case.</p><h3>Real-time AI translation in 144 languages</h3>
<p>LinguaFlow Pro earbuds translate conversations in real time &mdash; fast, natural, and built for travel, business and everyday connection. 40 core languages work fully offline, so you're covered even without Wi-Fi.</p>
<ul>
<li>144 languages supported &middot; 40 available offline</li>
<li>Real-time, low-latency translation (about 0.2s in ideal conditions)</li>
<li>Up to 98% accuracy on top languages &mdash; varies with accent, dialect &amp; background noise</li>
<li>4-mic noise reduction &middot; Bluetooth 5.3 &middot; IPX5 water resistance</li>
<li>8-hour battery (up to 32 hours with the charging case)</li>
<li>Free travel case this week &middot; 30-day money-back guarantee</li>
</ul>
<p><em>Translation accuracy varies by language pair, accent, dialect and ambient noise. Some features may require the companion app and an internet connection. Not all 144 languages are available offline.</em></p>
```

### LinguaFlow Family 2-Pack (Bidirectional)
- **Price:** $99.00  |  **Compare-at:** $138.00  |  **Option (Bundle):** 2 Pairs
- **SEO title:** LinguaFlow Family 2-Pack | Two-Way AI Translation
- **SEO description:** Two pairs of LinguaFlow Pro earbuds for natural two-way conversation across languages. Great for families, couples and business pairs.
- **Tags:** two pack, translation earbuds, family, value, AOV

**Description HTML:**

```html
<h3>LinguaFlow Family 2-Pack &mdash; two-way conversations</h3>
<p>Two pairs of LinguaFlow Pro earbuds so two people can each wear one and talk naturally across languages. Ideal for families, couples and business pairs.</p><h3>Real-time AI translation in 144 languages</h3>
<p>LinguaFlow Pro earbuds translate conversations in real time &mdash; fast, natural, and built for travel, business and everyday connection. 40 core languages work fully offline, so you're covered even without Wi-Fi.</p>
<ul>
<li>144 languages supported &middot; 40 available offline</li>
<li>Real-time, low-latency translation (about 0.2s in ideal conditions)</li>
<li>Up to 98% accuracy on top languages &mdash; varies with accent, dialect &amp; background noise</li>
<li>4-mic noise reduction &middot; Bluetooth 5.3 &middot; IPX5 water resistance</li>
<li>8-hour battery (up to 32 hours with the charging case)</li>
<li>Free travel case this week &middot; 30-day money-back guarantee</li>
</ul>
<p><em>Translation accuracy varies by language pair, accent, dialect and ambient noise. Some features may require the companion app and an internet connection. Not all 144 languages are available offline.</em></p>
```

## Where each recovered asset goes in Shopify

| Recovered file | Use it for |
|---|---|
| `copy/seo-meta.txt` | Online Store → Preferences (homepage title/meta) + each product's SEO fields |
| `copy/headline.txt` | Hero section H1/subhead on your home + product page (A/B test the variants) |
| `copy/ad-copy.txt` | Meta Ads Manager & TikTok Ads Manager primary text + video scripts |
| `copy/email-sequence.txt` | Klaviyo flows: Welcome, Abandoned Cart, Post-Purchase upsell |
| `ops/supplier-import-template.csv` | Source/import products in DSers or the CJ Dropshipping app |
| `ops/pricing-calculator.js` | `node pricing-calculator.js` to re-check margins if costs change |
| `ops/fulfillment-checklist.md` | Your daily order-fulfillment SOP |
| `storefront/*.html` | Visual/layout reference when building theme sections (not a Shopify theme) |
