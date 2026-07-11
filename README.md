# Anomaly Agent — Invoice Intelligence

AI-powered invoice anomaly detection. Scans transactions for duplicate charges, price spikes, and unusual vendor relationships — then generates analyst assessments and clarification emails automatically.

**No backend. No API key required. Open `index.html` and run.**

---

## Features

- **Interactive 3D Globe** — drag to rotate, shows vendor locations with anomaly markers
- **Rule-based Detection** — duplicate charges, price spikes (>30% above vendor average), unusual vendors
- **Simulated AI Assessments** — contextual reasoning referencing actual transaction data
- **Draft Emails** — professional clarification emails to the approver on each flagged transaction
- **Full Report** — downloadable Markdown audit report

## Quick Start

```
git clone https://github.com/YOUR_USERNAME/anomaly-agent
cd anomaly-agent
# Open index.html in any browser — no install needed
```

## Architecture

```
index.html          → App shell + navigation
css/styles.css      → Dark theme, glass morphism, glow effects
js/
  data.js           → 150 sample transactions (Apr–Jun 2026)
  analyzer.js       → Rule-based anomaly detection
  agent.js          → Simulated AI assessments + email drafts
  globe.js          → Interactive 3D globe (Natural Earth geography)
  app.js            → App controller, rendering, navigation
```

## Anomaly Detection

| Type | Method |
|---|---|
| Duplicate charges | Same vendor + amount within 5-day window |
| Price spikes | >30% above vendor's historical average (2+ prior invoices) |
| Unusual vendors | Vendors appearing only once with no prior history |
| Round amounts | Suspicious exact round numbers from first-time vendors |

## Upgrading to Real Data

**CSV upload** — Export transactions from QuickBooks/Xero as CSV. The detection logic works on any data with columns: `date, vendor, amount, department, approved_by, description`.

**Real AI** — Replace `assessAnomaly()` in `agent.js` with an Anthropic API call. The input/output structure is already designed for it.

**Live transactions** — Connect Plaid (free sandbox) to pull real bank transactions automatically.

## Sample Output

After running analysis on the sample data:
- 150 transactions reviewed
- 8 anomalies flagged (3 high, 3 medium, 2 low confidence)
- 7 clarification emails drafted
- Total spend: ~$132,000 across Q2 2026
