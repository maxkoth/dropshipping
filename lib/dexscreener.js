/**
 * DEXScreener API client — public endpoints, no API key required.
 * Docs: https://docs.dexscreener.com/api/reference
 * Requires Node 18+ (uses global fetch).
 *
 * This module ONLY reads market data. It never touches a wallet, key, or order.
 */

const BASE = "https://api.dexscreener.com";

// ---------------------------------------------------------------------------
// Low-level fetch with timeout + exponential backoff
// ---------------------------------------------------------------------------
async function fetchJson(url, { retries = 3, timeoutMs = 12000, fetchImpl = fetch } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);
      if (res.status === 429) throw new Error("rate limited (429)");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw new Error(`DEXScreener request failed: ${url} — ${lastErr?.message}`);
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** Free-text search for pairs (e.g. "WIF", "BONK", "dogwifhat"). */
export async function searchPairs(query, opts = {}) {
  const data = await fetchJson(`${BASE}/latest/dex/search?q=${encodeURIComponent(query)}`, opts);
  return data.pairs || [];
}

/** All pairs for up to 30 comma-separated token addresses (any chain). */
export async function getTokenPairs(addresses, opts = {}) {
  const list = (Array.isArray(addresses) ? addresses : [addresses]).filter(Boolean);
  if (!list.length) return [];
  const data = await fetchJson(`${BASE}/latest/dex/tokens/${list.slice(0, 30).join(",")}`, opts);
  return data.pairs || [];
}

/** Currently "boosted" (paid-promotion) tokens — a cheap discovery seed. */
export async function getBoostedTokens(opts = {}) {
  const data = await fetchJson(`${BASE}/token-boosts/top/v1`, opts);
  return Array.isArray(data) ? data : [];
}

/** Latest token profiles — another discovery seed of recently-listed tokens. */
export async function getLatestProfiles(opts = {}) {
  const data = await fetchJson(`${BASE}/token-profiles/latest/v1`, opts);
  return Array.isArray(data) ? data : [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** From several pairs for the same token, pick the deepest-liquidity one. */
export function bestPair(pairs) {
  const valid = (pairs || []).filter((p) => p && p.liquidity?.usd != null);
  if (valid.length) return valid.sort((a, b) => (b.liquidity.usd || 0) - (a.liquidity.usd || 0))[0];
  return (pairs && pairs[0]) || null;
}

/**
 * Normalize a DEXScreener pair into the coin schema the pipeline expects,
 * plus richer live fields (price_change, txns, buy/sell ratio).
 * holder_count and social_score are left null — DEXScreener does not provide
 * them; enrich later via RPC / a social API.
 */
export function pairToCoin(pair) {
  if (!pair) return null;
  const ageDays = pair.pairCreatedAt
    ? Math.max(0, Math.round((Date.now() - pair.pairCreatedAt) / 86_400_000))
    : null;
  const liq = pair.liquidity?.usd ?? 0;
  const vol24 = pair.volume?.h24 ?? 0;
  const mc = pair.marketCap ?? pair.fdv ?? 0;
  const t24 = pair.txns?.h24 || { buys: 0, sells: 0 };
  const buySell = t24.sells > 0 ? t24.buys / t24.sells : t24.buys;

  return {
    symbol: pair.baseToken?.symbol || "?",
    name: pair.baseToken?.name || "",
    chain: pair.chainId || "",
    dex: pair.dexId || "",
    contract_address: pair.baseToken?.address || "",
    pair_address: pair.pairAddress || "",
    price_usd: pair.priceUsd != null ? Number(pair.priceUsd) : null,
    market_cap: String(Math.round(mc)),
    fdv: pair.fdv ?? null,
    "24h_volume": String(Math.round(vol24)),
    liquidity_usd: String(Math.round(liq)),
    age_days: ageDays != null ? String(ageDays) : "",
    price_change: pair.priceChange || {}, // { m5, h1, h6, h24 }
    txns: pair.txns || {},
    buy_sell_ratio_24h: Number(buySell.toFixed(2)),
    holder_count: null,
    social_score: null,
    rug_risk_level: rugHeuristic({ liq, ageDays, mc }),
    opportunity_type: opportunityHeuristic(pair),
    dexscreener_url: pair.url || "",
    source_links: ["https://dexscreener.com"],
  };
}

/**
 * Crude, transparent liquidity/age heuristic — a quick triage, NOT a real
 * safety audit. The real rug screen (mint authority, honeypot, LP lock) still
 * happens in screener/rugcheck.js.
 */
function rugHeuristic({ liq, ageDays, mc }) {
  if (liq < 20_000) return "HIGH";
  if (mc > 50_000_000 && liq > 500_000) return "LOW";
  if (liq < 75_000 || (ageDays != null && ageDays < 3)) return "MEDIUM";
  return "MEDIUM";
}

function opportunityHeuristic(pair) {
  const ch1h = pair.priceChange?.h1 ?? 0;
  const ageDays = pair.pairCreatedAt ? (Date.now() - pair.pairCreatedAt) / 86_400_000 : 999;
  const vol24 = pair.volume?.h24 ?? 0;
  const mc = pair.marketCap ?? pair.fdv ?? Infinity;
  if (ageDays < 2) return "new_launch";
  if (ch1h >= 25 || vol24 > mc) return "volume_spike";
  return "momentum";
}

export const __BASE = BASE;
