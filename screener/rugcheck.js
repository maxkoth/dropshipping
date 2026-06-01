#!/usr/bin/env node
/**
 * Phase 2 — Rug Pull Screener
 * Runs automated safety checks on discovered coins.
 * Use --dry-run to simulate without live RPC calls.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { checkSafety, safetyToChecks } from "../lib/safety.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Scoring weights
// ---------------------------------------------------------------------------
const WEIGHTS = {
  mintAuthorityEnabled: { score: -100, label: "Mint authority still active" },
  topWalletsConcentrated: { score: -40, label: "Top 10 wallets > 30% supply" },
  liquidityNotLocked: { score: -30, label: "Liquidity not locked" },
  liquidityLockedShort: { score: -15, label: "Liquidity locked < 30 days" },
  contractUnverified: { score: -20, label: "Contract not verified on-chain" },
  devDumped: { score: -50, label: "Dev wallet sold > 10% within 48h" },
  honeypotDetected: { score: -100, label: "Honeypot: cannot sell" },
  highTax: { score: -35, label: "Buy/sell tax > 5%" },
  freshDeployer: { score: -25, label: "Deployer wallet < 7 days old" },
  lowLiquidity: { score: -20, label: "Liquidity < $50k USD" },
};

// ---------------------------------------------------------------------------
// Simulated on-chain checks (replace with real RPC / API calls in production)
// ---------------------------------------------------------------------------
function simulateChecks(coin) {
  if (DRY_RUN) {
    // Return deterministic fake data seeded from symbol length for demo
    const seed = coin.symbol.charCodeAt(0) % 4;
    return {
      mintAuthorityEnabled: seed === 0,
      topWalletsConcentrated: seed <= 1,
      liquidityLocked: seed > 0,
      liquidityLockDays: seed > 0 ? seed * 30 : 0,
      contractVerified: seed > 1,
      devDumped: seed === 0,
      honeypot: false,
      buyTax: seed * 1.5,
      sellTax: seed * 2,
      deployerAgeDays: seed * 10,
      liquidityUsd: parseFloat(coin.liquidity_usd || "0"),
    };
  }

  // Live mode resolves checks via lib/safety.js (see liveChecks); this stub
  // should never be hit because simulateChecks is only called in DRY_RUN.
  throw new Error("simulateChecks called outside dry-run");
}

// ---------------------------------------------------------------------------
// Live checks — real RugCheck (Solana) / GoPlus (EVM) data
// ---------------------------------------------------------------------------
async function liveChecks(coin) {
  const safety = await checkSafety(coin);
  return safetyToChecks(safety, coin);
}

// ---------------------------------------------------------------------------
// Score a single coin from a resolved `checks` object
// ---------------------------------------------------------------------------
function scoreChecks(coin, checks) {
  const flags = [];
  let score = 100;

  if (checks.mintAuthorityEnabled) {
    score += WEIGHTS.mintAuthorityEnabled.score;
    flags.push(WEIGHTS.mintAuthorityEnabled.label);
  }
  if (checks.topWalletsConcentrated) {
    score += WEIGHTS.topWalletsConcentrated.score;
    flags.push(WEIGHTS.topWalletsConcentrated.label);
  }
  if (!checks.liquidityLocked) {
    score += WEIGHTS.liquidityNotLocked.score;
    flags.push(WEIGHTS.liquidityNotLocked.label);
  } else if (checks.liquidityLockDays < 30) {
    score += WEIGHTS.liquidityLockedShort.score;
    flags.push(
      `${WEIGHTS.liquidityLockedShort.label} (${checks.liquidityLockDays}d)`
    );
  }
  if (!checks.contractVerified) {
    score += WEIGHTS.contractUnverified.score;
    flags.push(WEIGHTS.contractUnverified.label);
  }
  if (checks.devDumped) {
    score += WEIGHTS.devDumped.score;
    flags.push(WEIGHTS.devDumped.label);
  }
  if (checks.honeypot) {
    score += WEIGHTS.honeypotDetected.score;
    flags.push(WEIGHTS.honeypotDetected.label);
  }
  if (checks.buyTax > 5 || checks.sellTax > 5) {
    score += WEIGHTS.highTax.score;
    flags.push(
      `${WEIGHTS.highTax.label} (buy:${checks.buyTax}% sell:${checks.sellTax}%)`
    );
  }
  if (checks.deployerAgeDays < 7) {
    score += WEIGHTS.freshDeployer.score;
    flags.push(
      `${WEIGHTS.freshDeployer.label} (${checks.deployerAgeDays}d old)`
    );
  }
  if (checks.liquidityUsd < 50000) {
    score += WEIGHTS.lowLiquidity.score;
    flags.push(`${WEIGHTS.lowLiquidity.label} ($${checks.liquidityUsd.toLocaleString()})`);
  }

  score = Math.max(0, score);

  let verdict;
  if (score >= 75) verdict = "PASS";
  else if (score >= 45) verdict = "WARN";
  else verdict = "FAIL";

  // Instant disqualifiers override score
  if (checks.mintAuthorityEnabled || checks.honeypot || checks.devDumped) {
    verdict = "FAIL";
  }

  // Surface any extra notes from the live safety source (RugCheck / GoPlus)
  if (Array.isArray(checks._risks)) {
    for (const r of checks._risks) if (r && !flags.includes(r)) flags.push(r);
  }

  return {
    symbol: coin.symbol,
    chain: coin.chain,
    contract_address: coin.contract_address,
    verdict,
    score,
    safety_source: checks._safety_source || (DRY_RUN ? "mock" : "unknown"),
    flags,
    checked_at: new Date().toISOString(),
    raw_checks: checks,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`\n🔍 Rug Pull Screener — ${DRY_RUN ? "DRY RUN" : "LIVE (RugCheck / GoPlus)"}\n`);

  const discoveriesPath = resolve(__dirname, "../research/discoveries.json");
  const discoveries = JSON.parse(readFileSync(discoveriesPath, "utf8"));

  const results = [];
  for (const coin of discoveries.coins) {
    const checks = DRY_RUN ? simulateChecks(coin) : await liveChecks(coin);
    results.push(scoreChecks(coin, checks));
  }

  const passed = results.filter((r) => r.verdict === "PASS");
  const warned = results.filter((r) => r.verdict === "WARN");
  const failed = results.filter((r) => r.verdict === "FAIL");

  results.forEach((r) => {
    const icon = r.verdict === "PASS" ? "✅" : r.verdict === "WARN" ? "⚠️ " : "❌";
    console.log(`${icon} [${r.verdict}] ${r.symbol} (${r.chain}) — score: ${r.score}`);
    if (r.flags.length) r.flags.forEach((f) => console.log(`      • ${f}`));
  });

  console.log(`\nSummary: ${passed.length} PASS  ${warned.length} WARN  ${failed.length} FAIL`);

  const output = {
    generated_at: new Date().toISOString(),
    dry_run: DRY_RUN,
    summary: { pass: passed.length, warn: warned.length, fail: failed.length },
    results,
    qualified: [...passed, ...warned].map((r) => r.symbol),
  };

  const outPath = resolve(__dirname, "../data/screener-results.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nResults saved → ${outPath}`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
