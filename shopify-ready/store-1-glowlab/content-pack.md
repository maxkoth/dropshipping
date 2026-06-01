# GlowLab — Shopify Content Pack

Everything below is ready to paste into Shopify. Product descriptions use compliance-safe language and include disclaimers (see LAUNCH_REPORT.md risk flags).

> Ad scripts, A/B headlines, email flows and the keyword strategy already live in `stores/store-1/glowlab`. This pack adds the store-ready product copy + SEO + a build map.

## Products & descriptions (paste into Products → Add product → Description)

### GlowLab Pro LED Face Mask
- **Price:** $97.00  |  **Compare-at:** $156.00  |  **Option (Color):** Pearl White, Midnight Black, Rose Gold
- **SEO title:** GlowLab Pro LED Face Mask | 7-Wavelength Light Therapy | $97
- **SEO description:** Buy the GlowLab Pro LED Face Mask. 136 LED chips, 7 wavelengths. Helps support clearer skin, fewer fine lines and brighter tone. Free shipping. 60-day guarantee.
- **Tags:** LED face mask, light therapy, skincare, beauty tech, acne, anti-aging

**Description HTML:**

```html
<h3>Clinic-inspired LED light therapy &mdash; at home in 10 minutes a day</h3>
<p>The GlowLab Pro brings 7-wavelength LED light therapy into your daily routine. With 136 LED chips spanning red, blue, green, yellow and infrared light, it's designed to support clearer, brighter, healthier-looking skin.</p>
<ul>
<li><strong>7 wavelengths &middot; 136 LED chips</strong> &mdash; broader coverage than typical 3&ndash;4 light masks</li>
<li><strong>Red light</strong> helps support collagen and the look of fine lines</li>
<li><strong>Blue light</strong> targets acne-causing bacteria on the skin's surface</li>
<li><strong>Green &amp; yellow light</strong> help with the appearance of dark spots and redness</li>
<li><strong>10-minute auto shut-off</strong> &mdash; hands-free, rechargeable, travel-friendly</li>
<li><strong>60-day money-back guarantee</strong> + free shipping</li>
</ul>
<p><em>Results vary. GlowLab is a cosmetic skincare device and is not intended to diagnose, treat, cure, or prevent any disease or medical condition. Consult a dermatologist for medical skin concerns.</em></p>
```

### GlowLab Radiance Serum (30ml)
- **Price:** $36.00  |  **Compare-at:** $49.00  |  **Option (Size):** 30ml
- **SEO title:** GlowLab Radiance Serum 30ml | Niacinamide + Vitamin C
- **SEO description:** The GlowLab Radiance Serum: niacinamide, hyaluronic acid, vitamin C and bakuchiol to hydrate and brighten. Designed to pair with LED therapy.
- **Tags:** serum, niacinamide, vitamin c, skincare, upsell

**Description HTML:**

```html
<h3>GlowLab Radiance Serum &mdash; made for post-LED skin</h3>
<p>A lightweight daily serum formulated to pair with your LED routine. Niacinamide, hyaluronic acid, vitamin C and bakuchiol help hydrate, brighten and support a smoother-looking complexion.</p>
<ul>
<li>2% Niacinamide &mdash; helps with the look of uneven tone</li>
<li>Hyaluronic acid &mdash; deep hydration</li>
<li>Vitamin C &amp; bakuchiol &mdash; brightening, gentle support</li>
<li>30ml &middot; cruelty-free</li>
</ul>
<p><em>Cosmetic product. Patch test before first use.</em></p>
```

### GlowLab Pro LED Mask + Serum Bundle
- **Price:** $115.00  |  **Compare-at:** $175.00  |  **Option (Bundle):** Mask + Serum
- **SEO title:** GlowLab LED Mask + Radiance Serum Bundle | Save
- **SEO description:** The complete GlowLab glow routine: 7-wavelength LED mask + Radiance Serum. Save versus buying separately. Free shipping, 60-day guarantee.
- **Tags:** bundle, LED face mask, serum, value

**Description HTML:**

```html
<h3>GlowLab Pro LED Mask + Radiance Serum</h3>
<p>The complete glow routine: the 7-wavelength GlowLab Pro LED mask paired with the Radiance Serum, formulated to absorb into freshly-treated skin. Save versus buying separately.</p><h3>Clinic-inspired LED light therapy &mdash; at home in 10 minutes a day</h3>
<p>The GlowLab Pro brings 7-wavelength LED light therapy into your daily routine. With 136 LED chips spanning red, blue, green, yellow and infrared light, it's designed to support clearer, brighter, healthier-looking skin.</p>
<ul>
<li><strong>7 wavelengths &middot; 136 LED chips</strong> &mdash; broader coverage than typical 3&ndash;4 light masks</li>
<li><strong>Red light</strong> helps support collagen and the look of fine lines</li>
<li><strong>Blue light</strong> targets acne-causing bacteria on the skin's surface</li>
<li><strong>Green &amp; yellow light</strong> help with the appearance of dark spots and redness</li>
<li><strong>10-minute auto shut-off</strong> &mdash; hands-free, rechargeable, travel-friendly</li>
<li><strong>60-day money-back guarantee</strong> + free shipping</li>
</ul>
<p><em>Results vary. GlowLab is a cosmetic skincare device and is not intended to diagnose, treat, cure, or prevent any disease or medical condition. Consult a dermatologist for medical skin concerns.</em></p>
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
