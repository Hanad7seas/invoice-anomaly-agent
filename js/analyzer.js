// ── Rule-based Anomaly Detector ───────────────────────────────────────────────

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a, b) {
  return Math.abs((parseDate(a) - parseDate(b)) / 86400000);
}

function fmt(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ── 1. Duplicate Detection ────────────────────────────────────────────────────
// Flag transactions with same vendor + amount within a 5-day window.
function findDuplicates(transactions) {
  const anomalies = [];
  const seen = new Set();

  for (let i = 0; i < transactions.length; i++) {
    for (let j = i + 1; j < transactions.length; j++) {
      const a = transactions[i], b = transactions[j];
      if (a.vendor !== b.vendor) continue;
      if (Math.abs(a.amount - b.amount) > 0.01) continue;
      if (daysBetween(a.date, b.date) > 5) continue;

      const key = [a.id, b.id].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);

      const days = daysBetween(a.date, b.date).toFixed(0);

      // The later transaction is the suspect
      const flagId = parseDate(a.date) > parseDate(b.date) ? a.id : b.id;
      const origId = flagId === a.id ? b.id : a.id;
      const flagTxn = flagId === a.id ? a : b;

      anomalies.push({
        id: `DUP-${flagId}`,
        transaction_id: flagId,
        anomaly_type: 'duplicate_charge',
        vendor: flagTxn.vendor,
        amount: flagTxn.amount,
        date: flagTxn.date,
        department: flagTxn.department,
        approved_by: flagTxn.approved_by,
        severity: flagTxn.amount >= 500 ? 'high' : 'medium',
        evidence: {
          original_id: origId,
          duplicate_id: flagId,
          days_apart: Number(days),
          amount: flagTxn.amount,
          summary: `${flagTxn.vendor} charged ${fmt(flagTxn.amount)} on ${flagTxn.date} — identical charge also on ${flagId === a.id ? b.date : a.date} (${days} day${days === '1' ? '' : 's'} apart).`
        }
      });
    }
  }
  return anomalies;
}

// ── 2. Price Spike Detection ──────────────────────────────────────────────────
// For vendors with 2+ prior transactions, flag charges >30% above historical average.
function findPriceSpikes(transactions) {
  const anomalies = [];
  const sorted = [...transactions].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  for (let i = 0; i < sorted.length; i++) {
    const txn = sorted[i];
    const prior = sorted
      .slice(0, i)
      .filter(t => t.vendor === txn.vendor);

    if (prior.length < 2) continue;

    const avg = prior.reduce((s, t) => s + t.amount, 0) / prior.length;
    const pct = ((txn.amount - avg) / avg) * 100;

    if (pct < 30) continue;

    anomalies.push({
      id: `SPIKE-${txn.id}`,
      transaction_id: txn.id,
      anomaly_type: 'price_spike',
      vendor: txn.vendor,
      amount: txn.amount,
      date: txn.date,
      department: txn.department,
      approved_by: txn.approved_by,
      severity: pct >= 50 ? 'high' : 'medium',
      evidence: {
        historical_avg: avg,
        spike_amount: txn.amount,
        spike_pct: pct,
        prior_count: prior.length,
        prior_amounts: prior.map(t => t.amount),
        summary: `${txn.vendor} historically averages ${fmt(avg)} (over ${prior.length} prior charges). This charge of ${fmt(txn.amount)} is ${pct.toFixed(1)}% above that average.`
      }
    });
  }
  return anomalies;
}

// ── 3. Unusual Vendor Detection ───────────────────────────────────────────────
// Flag vendors that appear exactly once across the entire dataset.
function findUnusualVendors(transactions) {
  const counts = {};
  for (const t of transactions) {
    counts[t.vendor] = (counts[t.vendor] || 0) + 1;
  }

  const anomalies = [];
  for (const t of transactions) {
    if (counts[t.vendor] !== 1) continue;

    // Severity: high if amount >= $1000, medium if >= $200, low otherwise
    const severity = t.amount >= 1000 ? 'high' : t.amount >= 200 ? 'medium' : 'low';

    // Extra flag: suspicious round amount
    const isRound = t.amount % 500 === 0 && t.amount >= 1000;

    anomalies.push({
      id: `VENDOR-${t.id}`,
      transaction_id: t.id,
      anomaly_type: isRound ? 'unusual_vendor_round_amount' : 'unusual_vendor',
      vendor: t.vendor,
      amount: t.amount,
      date: t.date,
      department: t.department,
      approved_by: t.approved_by,
      severity,
      evidence: {
        appearance_count: 1,
        is_round_amount: isRound,
        summary: `${t.vendor} has zero prior transaction history. This ${fmt(t.amount)} charge${isRound ? ` is a suspicious round amount ($${t.amount.toFixed(0)})` : ''} with no established vendor relationship on record.`
      }
    });
  }
  return anomalies;
}

// ── 4. Combined Detection ─────────────────────────────────────────────────────
function detectAnomalies(transactions) {
  const dupes   = findDuplicates(transactions);
  const spikes  = findPriceSpikes(transactions);
  const unusual = findUnusualVendors(transactions);

  // Build a set of transaction IDs already flagged (avoid double-listing same txn)
  const flaggedIds = new Set();
  const all = [];

  for (const a of [...dupes, ...spikes, ...unusual]) {
    // Allow same transaction to appear for BOTH unusual_vendor AND round_amount
    const dedupeKey = `${a.anomaly_type}|${a.transaction_id}`;
    if (flaggedIds.has(dedupeKey)) continue;
    flaggedIds.add(dedupeKey);
    all.push(a);
  }

  // Sort: high → medium → low, then by date
  const severityOrder = { high: 0, medium: 1, low: 2 };
  all.sort((a, b) =>
    severityOrder[a.severity] - severityOrder[b.severity] ||
    parseDate(a.date) - parseDate(b.date)
  );

  return all;
}

// ── Helpers for other modules ─────────────────────────────────────────────────
function getTransaction(id) {
  return TRANSACTIONS.find(t => t.id === id);
}

function getVendorHistory(vendor, beforeDate) {
  return TRANSACTIONS.filter(t =>
    t.vendor === vendor && parseDate(t.date) < parseDate(beforeDate)
  ).sort((a, b) => parseDate(a.date) - parseDate(b.date));
}
