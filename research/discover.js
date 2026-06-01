#!/usr/bin/env node
/**
 * Phase 1 (LIVE) — Discovery via DEXScreener
 * Replaces the hardcoded coin list with real market data and writes
 * research/discoveries.json for the rest of the pipeline to consume.
 *
 * Flow: gather candidate tokens (DEXScreener boosts + latest profiles + any
 * --search terms) → enrich each via the tokens endpoint → keep the chosen
 * chain → pick the deepest-liquidity pair per token → filter by liquidity and
 * 24h volume → rank → write the top N.
 *
 * Flags:
 *   --chain <id>          chain to keep (default: solana — Phantom's main chain)
 *   --min-liquidity <n>   minimum USD liquidity   (default 30000)
 *   --min-volume <n>      minimum 24h USD volume   (default 50000)
 *   --limit <n>           how many coins to keep   (default 15)
 *   --search <a,b,c>      extra comma-separated search queries (e.g. "WIF,BONK")
 *   --mock                use the bundled offline sample (no network)
 *   --dry-run             implies --mock; keeps `npm run run-all` network-free
 *
 * This script ONLY reads public market data. It never touches a wallet or key.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  getBoostedTokens,
  getLatestProfiles,
  getTokenPairs,
  searchPairs,
  bestPair,
  pairToCoin,
} from "../lib/dexscreener.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);

function flag(name, def) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : def;
}

const CHAIN = flag("chain", "solana");
const MIN_LIQ = Number(flag("min-liquidity", "30000"));
const MIN_VOL = Number(flag("min-volume", "50000"));
const LIMIT = Number(flag("limit", "15"));
const SEARCH = (flag("search", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
const MOCK = argv.includes("--mock") || argv.includes("--dry-run");

// Base/quote tokens we never want to surface as a "play"
const EXCLUDE_SYMBOLS = /^(WSOL|SOL|USDC|USDT|WETH|ETH|WBTC|BTC|DAI)$/i;

// ---------------------------------------------------------------------------
// Gather raw pairs (live or offline)
// ---------------------------------------------------------------------------
async function gatherPairs() {
  if (MOCK) {
    const sample = JSON.parse(
      readFileSync(resolve(__dirname, "../lib/__sample__/dexscreener-tokens.sample.json"), "utf8")
    );
    return sample.pairs || [];
  }

  const [boosts, profiles] = await Promise.all([
    getBoostedTokens().catch(() => []),
    getLatestProfiles().catch(() => []),
  ]);

  const addrs = new Set();
  for (const b of [...boosts, ...profiles]) {
    if (b.chainId === CHAIN && b.tokenAddress) addrs.add(b.tokenAddress);
  }

  const pairs = [];
  const addrList = [...addrs];
  for (let i = 0; i < addrList.length; i += 30) {
    const batch = addrList.slice(i, i + 30);
    pairs.push(...(await getTokenPairs(batch).catch(() => [])));
  }
  for (const q of SEARCH) {
    pairs.push(...(await searchPairs(q).catch(() => [])));
  }
  return pairs;
}

// ---------------------------------------------------------------------------
// Ranking — reward turnover + positive 1h momentum + healthy liquidity
// ---------------------------------------------------------------------------
function rankScore(coin) {
  const vol = Number(coin["24h_volume"]) || 0;
  const mc = Math.max(Number(coin.market_cap) || 1, 1);
  const liq = Number(coin.liquidity_usd) || 0;
  const ch1h = coin.price_change?.h1 ?? 0;
  return (vol / mc) * 50 + Math.max(0, ch1h) * 0.5 + Math.min(liq / 100_000, 5);
}

function fmt(n) {
  const x = Number(n) || 0;
  if (x >= 1e9) return (x / 1e9).toFixed(1) + "B";
  if (x >= 1e6) return (x / 1e6).toFixed(1) + "M";
  if (x >= 1e3) return (x / 1e3).toFixed(0) + "k";
  return String(x);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n🛰️  DEXScreener Discovery — ${MOCK ? "MOCK / offline" : "LIVE"}  chain=${CHAIN}\n`);
  const raw = await gatherPairs();

  // group by base-token address, keep chosen chain, pick deepest pair each
  const byToken = new Map();
  for (const p of raw) {
    if (p.chainId !== CHAIN) continue;
    const key = p.baseToken?.address;
    if (!key) continue;
    if (!byToken.has(key)) byToken.set(key, []);
    byToken.get(key).push(p);
  }

  let coins = [...byToken.values()]
    .map((pairs) => pairToCoin(bestPair(pairs)))
    .filter(Boolean)
    .filter((c) => !EXCLUDE_SYMBOLS.test(c.symbol))
    .filter((c) => Number(c.liquidity_usd) >= MIN_LIQ && Number(c["24h_volume"]) >= MIN_VOL);

  coins.sort((a, b) => rankScore(b) - rankScore(a));
  coins = coins.slice(0, LIMIT);

  coins.forEach((c, i) => {
    console.log(
      `${String(i + 1).padStart(2)}. ${c.symbol.padEnd(12)} ` +
        `mc:$${fmt(c.market_cap).padStart(6)} vol:$${fmt(c["24h_volume"]).padStart(6)} ` +
        `liq:$${fmt(c.liquidity_usd).padStart(6)} 1h:${String(c.price_change?.h1 ?? 0).padStart(6)}% ` +
        `b/s:${String(c.buy_sell_ratio_24h).padStart(4)}  ${c.rug_risk_level}`
    );
  });

  const output = {
    generated_at: new Date().toISOString(),
    source: MOCK ? "MOCK sample payload (offline)" : "DEXScreener live API",
    source_note: "Populated by research/discover.js — re-run to refresh.",
    chain: CHAIN,
    filters: { min_liquidity_usd: MIN_LIQ, min_volume_24h_usd: MIN_VOL, limit: LIMIT },
    coins,
  };

  const outPath = resolve(__dirname, "discoveries.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n${coins.length} coins → ${outPath}`);
  if (!coins.length) {
    console.log("⚠️  No coins passed filters — loosen --min-liquidity/--min-volume or add --search.");
  }
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
