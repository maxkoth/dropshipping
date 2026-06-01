# SaunaZen — Shopify Content Pack

Everything below is ready to paste into Shopify. Product descriptions use compliance-safe language and include disclaimers (see LAUNCH_REPORT.md risk flags).

> Ad scripts, A/B headlines, email flows and the keyword strategy already live in `stores/store-2/saunazen`. This pack adds the store-ready product copy + SEO + a build map.

## Products & descriptions (paste into Products → Add product → Description)

### SaunaZen Infrared Sauna Blanket
- **Price:** $169.00  |  **Compare-at:** $219.00  |  **Option (Color):** Forest Green, Midnight Black, Burgundy
- **SEO title:** SaunaZen Infrared Sauna Blanket | 6 Zones, Low-EMF | $169
- **SEO description:** SaunaZen far-infrared sauna blanket. Far-infrared 4-14um, 6 heat zones, 77-176F, EMF under 3mG. Free carry bag, free shipping, 45-day guarantee.
- **Tags:** infrared sauna blanket, far infrared, recovery, wellness, biohacking

**Description HTML:**

```html
<h3>Far-infrared heat therapy at home</h3>
<p>SaunaZen's far-infrared (4&ndash;14&micro;m) sauna blanket delivers deep, even warmth across 6 heat zones, adjustable from 77&ndash;176&deg;F. Enjoy a relaxing, spa-like session at home in about 45 minutes.</p>
<ul>
<li>6 independent heat zones &middot; 77&ndash;176&deg;F digital control</li>
<li>Low-EMF design (under 3mG)</li>
<li>Waterproof, easy-wipe interior</li>
<li>Folds flat for storage &middot; free carry bag included this week</li>
<li>45-day money-back guarantee + free shipping</li>
</ul>
<p><em>For relaxation and comfort use only. Not a medical device and not intended to diagnose, treat, cure, or prevent any disease. Do not use if pregnant, fitted with a pacemaker, or living with a medical condition without first consulting your doctor. Stay hydrated before and after each session.</em></p>
```

### SaunaZen Premium Carry Bag
- **Price:** $49.00  |  **Compare-at:** $69.00  |  **Option (Size):** One Size
- **SEO title:** SaunaZen Premium Waxed-Canvas Carry Bag
- **SEO description:** Durable waxed-canvas carry bag sized for the SaunaZen infrared sauna blanket. Water-resistant, reinforced handles.
- **Tags:** carry bag, accessory, upsell

**Description HTML:**

```html
<h3>SaunaZen Premium Carry Bag</h3>
<p>Durable waxed-canvas carry bag sized for your SaunaZen blanket. Folds your blanket away neatly for storage or travel.</p><ul><li>Water-resistant waxed canvas</li><li>Reinforced handles</li><li>Fits the SaunaZen blanket folded</li></ul>
```

### SaunaZen Blanket + Carry Bag Bundle
- **Price:** $169.00  |  **Compare-at:** $218.00  |  **Option (Bundle):** Blanket + Carry Bag
- **SEO title:** SaunaZen Blanket + Premium Carry Bag Bundle
- **SEO description:** The full SaunaZen kit: 6-zone far-infrared sauna blanket + premium waxed-canvas carry bag. Free shipping, 45-day guarantee.
- **Tags:** bundle, infrared sauna blanket, carry bag, value

**Description HTML:**

```html
<h3>SaunaZen Blanket + Premium Carry Bag</h3>
<p>The full kit: the 6-zone far-infrared SaunaZen blanket plus the premium waxed-canvas carry bag for easy storage and travel.</p><h3>Far-infrared heat therapy at home</h3>
<p>SaunaZen's far-infrared (4&ndash;14&micro;m) sauna blanket delivers deep, even warmth across 6 heat zones, adjustable from 77&ndash;176&deg;F. Enjoy a relaxing, spa-like session at home in about 45 minutes.</p>
<ul>
<li>6 independent heat zones &middot; 77&ndash;176&deg;F digital control</li>
<li>Low-EMF design (under 3mG)</li>
<li>Waterproof, easy-wipe interior</li>
<li>Folds flat for storage &middot; free carry bag included this week</li>
<li>45-day money-back guarantee + free shipping</li>
</ul>
<p><em>For relaxation and comfort use only. Not a medical device and not intended to diagnose, treat, cure, or prevent any disease. Do not use if pregnant, fitted with a pacemaker, or living with a medical condition without first consulting your doctor. Stay hydrated before and after each session.</em></p>
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
