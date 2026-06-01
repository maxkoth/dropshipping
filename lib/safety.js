/**
 * Token safety / rug checks — real data.
 *   Solana: RugCheck.xyz public report (primary).
 *   EVM:    GoPlus Security API (ethereum / base / bsc / polygon / ...).
 * Read-only. No API key required for the endpoints used here.
 *
 * Each source is normalized into a common SafetyResult, then mapped onto the
 * `checks` object that screener/rugcheck.js already scores.
 */

const RUGCHECK = "https://api.rugcheck.xyz/v1";
const GOPLUS = "https://api.gopluslabs.io/api/v1";

const GOPLUS_CHAIN_IDS = {
  ethereum: "1", eth: "1", base: "8453", bsc: "56", bnb: "56",
  polygon: "137", arbitrum: "42161", avalanche: "43114", avax: "43114", optimism: "10",
};

async function fetchJson(url, { retries = 2, timeoutMs = 12000, fetchImpl = fetch, headers = {} } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, headers: { Accept: "application/json", ...headers } });
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
  throw new Error(`safety request failed: ${url} — ${lastErr?.message}`);
}

// When a source returns nothing, stay conservative but don't hard-fail a coin.
function unknownSafety(extra = {}) {
  return {
    mintAuthorityEnabled: false,
    freezeAuthorityEnabled: false,
    topHoldersPct: 0,
    lpLocked: false,
    lpLockedPct: 0,
    honeypot: false,
    rugged: false,
    buyTaxPct: 0,
    sellTaxPct: 0,
    transferFeePct: 0,
    contractVerified: true,
    risks: ["safety data unavailable"],
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Normalizers (pure → offline-testable)
// ---------------------------------------------------------------------------

export function normalizeRugcheck(report, mint = "") {
  const risks = Array.isArray(report.risks) ? report.risks : [];
  const topHolders = Array.isArray(report.topHolders) ? report.topHolders : [];
  const top10Pct = topHolders.slice(0, 10).reduce((s, h) => s + (h.pct || 0), 0);

  const markets = Array.isArray(report.markets) ? report.markets : [];
  const lps = markets.map((m) => m.lp).filter(Boolean);
  const lpLockedPct = lps.length ? Math.max(...lps.map((l) => l.lpLockedPct ?? 0)) : 0;
  const lpLocked = lpLockedPct >= 50 || lps.some((l) => l.lpLocked === 1 || l.lpLocked === true);

  // transfer fee (token-2022) — pull a % out of a matching risk if present
  const feeRisk = risks.find((r) => /transfer fee/i.test(r.name || ""));
  const feeMatch = feeRisk && /([\d.]+)\s*%/.exec(`${feeRisk.value ?? ""} ${feeRisk.description ?? ""}`);
  const transferFeePct = feeMatch ? Number(feeMatch[1]) : 0;

  const honeypot =
    !!report.rugged ||
    risks.some((r) => /honeypot|cannot sell|non-?transferable/i.test(r.name || ""));

  return {
    source: "rugcheck",
    mint: report.mint || mint,
    mintAuthorityEnabled: !!report.mintAuthority,
    freezeAuthorityEnabled: !!report.freezeAuthority,
    topHoldersPct: Number(top10Pct.toFixed(1)),
    lpLocked,
    lpLockedPct: Number(lpLockedPct.toFixed(1)),
    honeypot,
    rugged: !!report.rugged,
    buyTaxPct: transferFeePct,
    sellTaxPct: transferFeePct,
    transferFeePct,
    contractVerified: true, // not applicable on Solana; treated as verified
    scoreNormalised: report.score_normalised ?? null,
    risks: risks.map((r) => `${r.name}${r.level ? ` (${r.level})` : ""}`),
  };
}

export function normalizeGoplusEvm(entry, address = "") {
  const pct = (x) => (x == null || x === "" ? 0 : Number(x) * 100); // GoPlus tax is a 0–1 decimal
  const holders = Array.isArray(entry.holders) ? entry.holders : [];
  const top10Pct = holders.slice(0, 10).reduce((s, h) => s + Number(h.percent || 0) * 100, 0);
  const lpHolders = Array.isArray(entry.lp_holders) ? entry.lp_holders : [];
  const lpLockedPct = lpHolders
    .filter((l) => l.is_locked === 1 || l.is_locked === "1")
    .reduce((s, l) => s + Number(l.percent || 0) * 100, 0);

  const buyTaxPct = pct(entry.buy_tax);
  const sellTaxPct = pct(entry.sell_tax);
  const honeypot = entry.is_honeypot === "1" || entry.cannot_sell_all === "1";

  const risks = [];
  if (entry.is_honeypot === "1") risks.push("honeypot (danger)");
  if (entry.is_mintable === "1") risks.push("mintable (warn)");
  if (entry.transfer_pausable === "1") risks.push("transfer pausable (warn)");
  if (entry.is_open_source !== "1") risks.push("unverified source (warn)");
  if (buyTaxPct > 5 || sellTaxPct > 5) risks.push(`high tax buy:${buyTaxPct}% sell:${sellTaxPct}%`);

  return {
    source: "goplus",
    address,
    mintAuthorityEnabled: entry.is_mintable === "1",
    freezeAuthorityEnabled: entry.transfer_pausable === "1" || entry.is_blacklisted === "1",
    topHoldersPct: Number(top10Pct.toFixed(1)),
    lpLocked: lpLockedPct >= 50,
    lpLockedPct: Number(lpLockedPct.toFixed(1)),
    honeypot,
    rugged: honeypot,
    buyTaxPct: Number(buyTaxPct.toFixed(1)),
    sellTaxPct: Number(sellTaxPct.toFixed(1)),
    transferFeePct: Number(Math.max(buyTaxPct, sellTaxPct).toFixed(1)),
    contractVerified: entry.is_open_source === "1",
    risks: risks.length ? risks : ["no major flags"],
  };
}

/** Map a normalized SafetyResult onto the checks object rugcheck.js scores. */
export function safetyToChecks(s, coin) {
  return {
    mintAuthorityEnabled: !!s.mintAuthorityEnabled,
    topWalletsConcentrated: (s.topHoldersPct ?? 0) > 30,
    liquidityLocked: !!s.lpLocked,
    liquidityLockDays: s.lpLocked ? 365 : 0,
    contractVerified: s.contractVerified !== false,
    devDumped: false, // not exposed by these sources
    honeypot: !!s.honeypot,
    buyTax: s.buyTaxPct ?? s.transferFeePct ?? 0,
    sellTax: s.sellTaxPct ?? s.transferFeePct ?? 0,
    deployerAgeDays: 999, // unknown — don't penalize
    liquidityUsd: Number(coin.liquidity_usd) || 0,
    _safety_source: s.source,
    _risks: s.risks || [],
  };
}

// ---------------------------------------------------------------------------
// Live fetchers
// ---------------------------------------------------------------------------

export async function solanaSafety(mint, opts = {}) {
  try {
    const report = await fetchJson(`${RUGCHECK}/tokens/${mint}/report`, opts);
    return normalizeRugcheck(report, mint);
  } catch (e) {
    return unknownSafety({ source: "none", mint, error: e.message });
  }
}

export async function evmSafety(chain, address, opts = {}) {
  const id = GOPLUS_CHAIN_IDS[String(chain).toLowerCase()];
  if (!id) return unknownSafety({ source: "none", address, error: `unsupported chain: ${chain}` });
  try {
    const data = await fetchJson(`${GOPLUS}/token_security/${id}?contract_addresses=${address}`, opts);
    const entry = data?.result?.[address.toLowerCase()] || data?.result?.[address];
    if (!entry) return unknownSafety({ source: "goplus", address, error: "no data returned" });
    return normalizeGoplusEvm(entry, address);
  } catch (e) {
    return unknownSafety({ source: "none", address, error: e.message });
  }
}

export async function checkSafety(coin, opts = {}) {
  const chain = String(coin.chain || "").toLowerCase();
  if (chain === "solana") return solanaSafety(coin.contract_address, opts);
  return evmSafety(chain, coin.contract_address, opts);
}
