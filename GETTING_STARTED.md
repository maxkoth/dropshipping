# Getting Started — run it on demand

Run this whenever you're ready to trade. No schedule needed. You read the call,
then you decide and place the trade yourself in Phantom. The app never touches
your wallet or keys.

## One-time setup

1. **Install Node.js 18+** (check: `node --version`). Get it from https://nodejs.org if missing.

2. **Get the code and install dependencies**
   ```bash
   git clone https://github.com/maxkoth/dropshipping
   cd dropshipping
   npm install
   ```

3. **Add your Anthropic API key** (the only paid thing — all market data is free)
   ```bash
   cp .env.example .env
   # open .env, set:  ANTHROPIC_API_KEY=sk-ant-...
   ```
   Telegram/Discord/RPC keys are optional and not needed for an on-demand run.

## Run it any time

```bash
npm run play
```

That does, in order:
1. **discover** — pulls live Solana coins from DEXScreener (price, volume, liquidity, buy/sell flow)
2. **screen** — real rug/safety checks (RugCheck + GoPlus); scam coins are dropped
3. **signals** — Claude analyzes the survivors and writes calls to `data/signals.json`
4. **momentum** — real hourly-candle momentum scan → `data/momentum-signals.json`

## Read the call

- Open `dashboard/index.html` in your browser, **or**
- Look at `data/signals.json` — each entry has: signal (STRONG_BUY/BUY/WATCH/AVOID),
  confidence, entry, take-profit targets, stop-loss, hold duration, and reasoning.

Then you decide and swap in Phantom yourself.

## Safe practice run (no key, no network, all simulated)

```bash
npm run run-all     # full pipeline on mock data
npm run report      # paper-trading scorecard
```

## Honest reminders

- The **data** is real now, but no tool reliably predicts short-term meme moves.
  Treat calls as filtered research, not certainty.
- Prove it in **paper mode** first; never risk more than you can lose entirely.
- **You** hold the keys and place every trade. Execution is always manual in Phantom.
