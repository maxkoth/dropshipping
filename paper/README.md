# Paper-Trading Track Record

**100% simulated. No real money, no wallet, no keys.** This folder is a running
experiment to see how well the system's signals perform over time.

## How a round works

When you say **"go"**, paste the output of `npm run play` (or at minimum a coin
and its current USD price). Then the assistant:

1. Marks the prior open position to the new price → realizes win/loss
2. Opens a new $1,000 paper position from the day's signals (highest conviction,
   not random — so there's real skill to judge)
3. Updates `track-record.json` and reports: what was bought, why, and the running
   scorecard (win rate, total P&L)

Optionally we also log a **random pick** each round as a control, to test whether
the signals actually beat luck.

## Why you have to paste the data

The assistant's sandbox can only reach GitHub — it cannot fetch live crypto
prices itself. Real prices in, honest scorecard out. Made-up prices would make
the track record meaningless.

## Honest expectations

A handful of rounds is mostly luck. Even over many rounds, short-term meme-coin
moves are largely unpredictable — this measures the signals against reality, it
does not promise an edge. Nothing here is financial advice.
