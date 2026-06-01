/**
 * GeckoTerminal API client — real OHLCV candles for DEX pools.
 * Docs: https://www.geckoterminal.com/dex-api
 * Free, no key. Read-only.
 */

const BASE = "https://api.geckoterminal.com/api/v2";

// chain id (as used by DEXScreener) → GeckoTerminal network slug
export const NETWORK_SLUG = {
  solana: "solana",
  ethereum: "eth",
  eth: "eth",
  base: "base",
  polygon: "polygon_pos",
  bsc: "bsc",
  arbitrum: "arbitrum",
  avalanche: "avax",
  optimism: "optimism",
};

async function fetchJson(url, { retries = 2, timeoutMs = 12000, fetchImpl = fetch } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
      clearTimeout(timer);
      if (res.status === 429) throw new Error("rate limited (429)");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 600 * 2 ** attempt));
    }
  }
  throw new Error(`GeckoTerminal request failed: ${url} — ${lastErr?.message}`);
}

/**
 * Parse a GeckoTerminal OHLCV response into candles sorted oldest→newest.
 * ohlcv_list rows are [timestampSec, open, high, low, close, volume].
 * Pure function — offline-testable.
 */
export function parseOhlcv(json) {
  const list = json?.data?.attributes?.ohlcv_list || [];
  return list
    .map((row) => ({
      ts: Number(row[0]),
      timestamp: new Date(Number(row[0]) * 1000).toISOString(),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5]),
    }))
    .filter((c) => Number.isFinite(c.close))
    .sort((a, b) => a.ts - b.ts)
    .map(({ ts, ...candle }) => candle);
}

/**
 * Fetch OHLCV candles for a pool.
 * timeframe: "day" | "hour" | "minute"; aggregate buckets them (e.g. 15-minute = minute/15).
 */
export async function getOhlcv(network, poolAddress, { timeframe = "hour", aggregate = 1, limit = 48, ...opts } = {}) {
  const slug = NETWORK_SLUG[String(network).toLowerCase()] || network;
  const url = `${BASE}/networks/${slug}/pools/${poolAddress}/ohlcv/${timeframe}?aggregate=${aggregate}&limit=${limit}`;
  return parseOhlcv(await fetchJson(url, opts));
}
