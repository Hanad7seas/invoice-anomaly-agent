// ── Anomaly Agent — App Controller ────────────────────────────────────────────

const App = (() => {
  // ── State ──────────────────────────────────────────────────────────────────
  let state = {
    analysisRun: false,
    anomalies:   [],
    results:     [],
    currentView: 'dashboard',
    anomalyFilter: 'all',
    txnSearch: '',
    txnFilter: 'all',
  };

  let flaggedTxnIds = new Set();
  let globe = null;

  // ── Utilities ──────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const fmtAmt = n => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fmtDate = d => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const [, m, day] = d.split('-');
    return `${months[+m - 1]} ${+day}`;
  };

  function anomalyTypeLabel(type) {
    const map = {
      duplicate_charge:            'Duplicate Charge',
      price_spike:                 'Price Spike',
      unusual_vendor:              'Unusual Vendor',
      unusual_vendor_round_amount: 'Unusual Vendor · Round Amount',
    };
    return map[type] || type;
  }

  function anomalyTypeIcon(type) {
    if (type === 'duplicate_charge')
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`;
    if (type === 'price_spike')
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>`;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
  }

  // ── Animated counter ───────────────────────────────────────────────────────
  function animateCounter(el, target, prefix = '', suffix = '', duration = 900) {
    const start = performance.now();
    const tick  = now => {
      const t   = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const val  = target < 10 ? target : Math.round(ease * target);
      el.textContent = prefix + val.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Spend Chart ────────────────────────────────────────────────────────────
  function drawSpendChart(anomalyDates) {
    const canvas = $('spend-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || canvas.parentElement.offsetWidth;
    const H = 140;
    canvas.width  = W;
    canvas.height = H;

    // Group spend by ISO week
    const weekMap = {};
    for (const t of TRANSACTIONS) {
      const d = new Date(t.date + 'T00:00:00');
      // Monday of that week
      const day  = d.getDay() === 0 ? 7 : d.getDay();
      const mon  = new Date(d);
      mon.setDate(d.getDate() - day + 1);
      const key  = mon.toISOString().slice(0, 10);
      weekMap[key] = (weekMap[key] || 0) + t.amount;
    }

    const anomalyWeeks = new Set();
    for (const ad of anomalyDates) {
      const d   = new Date(ad + 'T00:00:00');
      const day = d.getDay() === 0 ? 7 : d.getDay();
      const mon = new Date(d);
      mon.setDate(d.getDate() - day + 1);
      anomalyWeeks.add(mon.toISOString().slice(0, 10));
    }

    const weeks  = Object.keys(weekMap).sort();
    const values = weeks.map(k => weekMap[k]);
    const maxVal = Math.max(...values);

    const pad   = { t: 20, r: 20, b: 30, l: 60 };
    const gW    = W - pad.l - pad.r;
    const gH    = H - pad.t - pad.b;
    const barW  = (gW / weeks.length) * 0.6;
    const barGap = gW / weeks.length;

    ctx.clearRect(0, 0, W, H);

    // Y grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + gH - (i / 4) * gH;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(W - pad.r, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
      const label = '$' + ((maxVal * i / 4) / 1000).toFixed(0) + 'k';
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(label, pad.l - 6, y + 3.5);
    }

    // Bars
    for (let i = 0; i < weeks.length; i++) {
      const x     = pad.l + i * barGap + (barGap - barW) / 2;
      const barH  = (values[i] / maxVal) * gH;
      const y     = pad.t + gH - barH;
      const isAno = anomalyWeeks.has(weeks[i]);

      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      if (isAno) {
        grad.addColorStop(0, 'rgba(239,68,68,0.8)');
        grad.addColorStop(1, 'rgba(239,68,68,0.2)');
      } else {
        grad.addColorStop(0, 'rgba(99,102,241,0.7)');
        grad.addColorStop(1, 'rgba(99,102,241,0.15)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();

      // Month label (show for first week of each month)
      const wDate = new Date(weeks[i] + 'T00:00:00');
      if (wDate.getDate() <= 7) {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        ctx.fillStyle = 'rgba(148,163,184,0.5)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(months[wDate.getMonth()], x + barW / 2, H - 8);
      }
    }

    // Legend
    ctx.fillStyle = 'rgba(239,68,68,0.8)';
    ctx.fillRect(W - pad.r - 80, 6, 8, 8);
    ctx.fillStyle = 'rgba(148,163,184,0.6)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Anomaly week', W - pad.r - 68, 14);
  }

  // ── Loading sequence ───────────────────────────────────────────────────────
  function showLoading() {
    const overlay = $('loading-overlay');
    overlay.classList.add('visible');
    const steps = [
      'Loading 150 transactions…',
      'Running duplicate detection…',
      'Analysing vendor price history…',
      'Scanning for unusual vendors…',
      'Generating AI assessments…',
      'Drafting clarification emails…',
      'Building report…',
    ];
    const stepsEl = $('loading-steps');
    stepsEl.innerHTML = '';
    steps.forEach(s => {
      const el = document.createElement('div');
      el.className = 'loading-step';
      el.textContent = s;
      stepsEl.appendChild(el);
    });
    return { overlay, stepsEl };
  }

  function animateLoading({ overlay, stepsEl }) {
    return new Promise(resolve => {
      const stepEls = stepsEl.querySelectorAll('.loading-step');
      const bar = $('loading-bar');
      const statusEl = $('loading-status');
      let i = 0;
      const tick = () => {
        if (i < stepEls.length) {
          stepEls[i].classList.add('done');
          statusEl.textContent = stepEls[i].textContent;
          bar.style.width = `${((i + 1) / stepEls.length) * 100}%`;
          i++;
          setTimeout(tick, 280);
        } else {
          setTimeout(resolve, 200);
        }
      };
      setTimeout(tick, 120);
    });
  }

  // ── Run Analysis ───────────────────────────────────────────────────────────
  async function runAnalysis() {
    const loading = showLoading();
    await animateLoading(loading);

    state.anomalies = detectAnomalies(TRANSACTIONS);
    state.results   = processAllAnomalies(state.anomalies);
    state.analysisRun = true;

    flaggedTxnIds = new Set(state.anomalies.map(a => a.transaction_id));

    // Tell the globe to light up anomaly vendors
    if (globe) {
      globe.markAnomalies(state.anomalies.map(a => a.vendor));
    }

    updateBadges();
    loading.overlay.classList.remove('visible');

    // Hide CTA button in hero
    const cta = $('dashboard-hero-cta');
    if (cta) cta.style.display = 'none';

    switchView('dashboard');
    renderDashboard();
    renderTransactions();
    renderAnomalies();
    renderAnalysis();
    renderReport();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function switchView(name) {
    state.currentView = name;
    document.querySelectorAll('.nav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.view === name)
    );
    document.querySelectorAll('.view').forEach(el =>
      el.classList.toggle('active', el.id === `view-${name}`)
    );
    const titles = {
      dashboard:    ['Dashboard',      'Q2 2026 · Apr – Jun · 150 transactions'],
      transactions: ['Transactions',   'All 150 company transactions'],
      anomalies:    ['Anomalies',      'Detected by rule-based analysis'],
      analysis:     ['AI Analysis',    'Simulated analyst assessments'],
      report:       ['Report',         'Full markdown audit report'],
    };
    const [title, sub] = titles[name] || ['', ''];
    $('topbar-title').textContent = title;
    $('topbar-sub').textContent   = sub;
  }

  function updateBadges() {
    const total = state.results.length;
    const high  = state.results.filter(r => r.severity === 'high').length;
    if (total > 0) { $('nav-badge-anomalies').textContent = total; $('nav-badge-anomalies').classList.add('visible'); }
    if (high  > 0) { $('nav-badge-transactions').textContent = high; $('nav-badge-transactions').classList.add('visible'); }
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  function renderDashboard() {
    const results    = state.results;
    const totalSpend = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    const high       = results.filter(r => r.severity === 'high').length;
    const medium     = results.filter(r => r.severity === 'medium').length;
    const needsRev   = results.filter(r => r.assessment?.needs_review).length;

    // ── Stats
    $('stats-row').style.display = '';
    $('stats-row').innerHTML = `
      <div class="stat-card stagger-in" style="animation-delay:.05s">
        <div class="stat-icon accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </div>
        <div class="stat-label">Transactions</div>
        <div class="stat-value accent" id="stat-count">0</div>
        <div class="stat-sub">Apr – Jun 2026</div>
      </div>
      <div class="stat-card stagger-in" style="animation-delay:.1s">
        <div class="stat-icon med">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="stat-label">Total Spend</div>
        <div class="stat-value med" id="stat-spend">$0</div>
        <div class="stat-sub">All departments</div>
      </div>
      <div class="stat-card stagger-in" style="animation-delay:.15s">
        <div class="stat-icon high">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="stat-label">Anomalies Flagged</div>
        <div class="stat-value high" id="stat-flags">0</div>
        <div class="stat-sub">${high} high · ${medium} medium</div>
      </div>
      <div class="stat-card stagger-in" style="animation-delay:.2s">
        <div class="stat-icon success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div class="stat-label">Emails Drafted</div>
        <div class="stat-value success" id="stat-emails">0</div>
        <div class="stat-sub">Need human review</div>
      </div>
    `;

    // Animate counters
    setTimeout(() => {
      animateCounter($('stat-count'),  150,               '',  '');
      animateCounter($('stat-spend'),  Math.round(totalSpend), '$', '');
      animateCounter($('stat-flags'),  results.length,    '',  '');
      animateCounter($('stat-emails'), needsRev,          '',  '');
    }, 100);

    // ── Spend chart
    $('spend-chart-card').style.display = '';
    const anomalyDates = state.anomalies.map(a => a.date);
    setTimeout(() => drawSpendChart(anomalyDates), 50);

    // ── Breakdown
    $('dashboard-grid').style.display = '';
    const byType  = {};
    for (const r of results) {
      const lbl = anomalyTypeLabel(r.anomaly_type);
      byType[lbl] = (byType[lbl] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(byType));
    const typeColors = {
      'Duplicate Charge':              'fill-high',
      'Price Spike':                   'fill-med',
      'Unusual Vendor':                'fill-low',
      'Unusual Vendor · Round Amount': 'fill-accent',
    };
    $('breakdown-body').innerHTML = Object.entries(byType).map(([label, count]) => `
      <div class="breakdown-row">
        <div class="breakdown-meta">
          <span class="breakdown-label">${label}</span>
          <span class="breakdown-count">${count}</span>
        </div>
        <div class="breakdown-track">
          <div class="breakdown-fill ${typeColors[label] || 'fill-accent'}"
               style="width:0%" data-target="${(count / maxCount * 100).toFixed(0)}%"></div>
        </div>
      </div>
    `).join('');

    // Animate bars
    setTimeout(() => {
      document.querySelectorAll('.breakdown-fill[data-target]').forEach(el => {
        el.style.width = el.dataset.target;
      });
    }, 200);

    // ── Recent flags
    $('recent-body').innerHTML = results.slice(0, 6).map(r => `
      <div class="recent-flag" onclick="App.navTo('anomalies')">
        <div class="recent-flag-dot dot-${r.severity}"></div>
        <div class="recent-flag-info">
          <div class="recent-vendor">${r.vendor}</div>
          <div class="recent-meta">${anomalyTypeLabel(r.anomaly_type)} · ${fmtDate(r.date)}</div>
        </div>
        <div class="recent-amount">${fmtAmt(r.amount)}</div>
      </div>
    `).join('');
  }

  // ── Transactions Table ─────────────────────────────────────────────────────
  function renderTransactions() { renderTxnTable(); }

  function renderTxnTable() {
    let data = TRANSACTIONS;
    if (state.txnSearch) {
      data = data.filter(t =>
        [t.vendor, t.department, t.approved_by, t.category, t.id]
          .some(s => s.toLowerCase().includes(state.txnSearch))
      );
    }
    if (state.txnFilter === 'flagged') data = data.filter(t => flaggedTxnIds.has(t.id));
    if (state.txnFilter === 'clean')   data = data.filter(t => !flaggedTxnIds.has(t.id));

    const anomalyMap = {};
    state.anomalies.forEach(a => { anomalyMap[a.transaction_id] = a; });

    $('txn-tbody').innerHTML = data.map(t => {
      const anomaly = anomalyMap[t.id];
      const flagged = !!anomaly;
      return `
        <tr class="${flagged ? 'flagged-row' : ''}">
          <td class="txn-id">${t.id}</td>
          <td class="txn-date">${t.date}</td>
          <td class="txn-vendor">${t.vendor}</td>
          <td style="color:var(--text-3)">${t.category}</td>
          <td class="amount-cell">${fmtAmt(t.amount)}</td>
          <td style="color:var(--text-2)">${t.department}</td>
          <td style="color:var(--text-2)">${t.approved_by}</td>
          <td><span class="badge ${flagged ? `badge-${anomaly.severity}` : 'badge-clean'}">
            ${flagged ? anomalyTypeLabel(anomaly.anomaly_type) : 'Clean'}
          </span></td>
        </tr>`;
    }).join('');
  }

  // ── Anomaly Cards ──────────────────────────────────────────────────────────
  function renderAnomalies() {
    renderAnomalyList();
    document.querySelectorAll('.tab[data-severity]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab[data-severity]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.anomalyFilter = tab.dataset.severity;
        renderAnomalyList();
      });
    });
  }

  function renderAnomalyList() {
    let data = state.results;
    if (state.anomalyFilter !== 'all') data = data.filter(r => r.severity === state.anomalyFilter);

    if (!data.length) {
      $('anomaly-list').innerHTML = `<div class="empty-state small"><p>No ${state.anomalyFilter === 'all' ? '' : state.anomalyFilter + '-severity '}anomalies found.</p></div>`;
      return;
    }

    $('anomaly-list').innerHTML = data.map((r, idx) => {
      const ev = r.evidence;
      let details = '';
      if (r.anomaly_type === 'duplicate_charge') {
        details = `
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-key">Original</div><div class="detail-val">${ev.original_id}</div></div>
            <div class="detail-item"><div class="detail-key">Duplicate</div><div class="detail-val">${ev.duplicate_id}</div></div>
            <div class="detail-item"><div class="detail-key">Days Apart</div><div class="detail-val">${ev.days_apart}</div></div>
            <div class="detail-item"><div class="detail-key">Amount</div><div class="detail-val">${fmtAmt(ev.amount)}</div></div>
          </div>`;
      } else if (r.anomaly_type === 'price_spike') {
        details = `
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-key">This Charge</div><div class="detail-val">${fmtAmt(ev.spike_amount)}</div></div>
            <div class="detail-item"><div class="detail-key">Historical Avg</div><div class="detail-val">${fmtAmt(ev.historical_avg)}</div></div>
            <div class="detail-item"><div class="detail-key">% Above Avg</div><div class="detail-val">+${ev.spike_pct.toFixed(1)}%</div></div>
            <div class="detail-item"><div class="detail-key">Prior Invoices</div><div class="detail-val">${ev.prior_count}</div></div>
          </div>`;
      } else {
        details = `
          <div class="detail-grid">
            <div class="detail-item"><div class="detail-key">Prior History</div><div class="detail-val">None found</div></div>
            <div class="detail-item"><div class="detail-key">Amount</div><div class="detail-val">${fmtAmt(r.amount)}</div></div>
            <div class="detail-item"><div class="detail-key">Round Amount</div><div class="detail-val">${ev.is_round_amount ? 'Yes ⚠' : 'No'}</div></div>
            <div class="detail-item"><div class="detail-key">Department</div><div class="detail-val">${r.department}</div></div>
          </div>`;
      }

      return `
        <div class="anomaly-card ${r.severity} stagger-in" id="acard-${r.id}" style="animation-delay:${idx * 0.05}s">
          <div class="anomaly-card-header" onclick="App.toggleCard('${r.id}')">
            <div class="anomaly-icon ${r.severity}">${anomalyTypeIcon(r.anomaly_type)}</div>
            <div class="anomaly-main">
              <div class="anomaly-title">${r.vendor}</div>
              <div class="anomaly-meta">${anomalyTypeLabel(r.anomaly_type)} · ${r.date} · ${r.department} · ${r.approved_by}</div>
            </div>
            <div class="anomaly-amount">${fmtAmt(r.amount)}</div>
            <span class="badge badge-${r.severity}">${r.severity.charAt(0).toUpperCase() + r.severity.slice(1)}</span>
            <svg class="anomaly-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </div>
          <div class="anomaly-card-body">
            ${details}
            <div class="evidence-box mt-12">
              <div class="evidence-label">Evidence</div>
              <div class="evidence-text">${ev.summary}</div>
            </div>
            <div class="evidence-box mt-12" style="background:var(--accent-bg);border-color:rgba(99,102,241,0.25)">
              <div class="evidence-label" style="color:var(--accent)">Transaction</div>
              <div class="evidence-text">
                <code>${r.transaction_id}</code> · ${getTransaction(r.transaction_id)?.description || ''}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ── AI Analysis ────────────────────────────────────────────────────────────
  function renderAnalysis() {
    $('analysis-list').innerHTML = state.results.map((r, idx) => {
      const a = r.assessment;
      const emailHtml = r.email ? `
        <div class="email-card mt-12">
          <div class="email-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span class="email-header-label">Draft Clarification Email</span>
          </div>
          <div class="email-fields">
            <div class="email-field"><strong>To:</strong> ${r.email.to}</div>
            <div class="email-field"><strong>Subject:</strong> ${r.email.subject}</div>
          </div>
          <div class="email-body-text">${r.email.body}</div>
        </div>` : `
        <div class="evidence-box mt-12" style="background:var(--success-bg);border-color:var(--success-border)">
          <div class="evidence-label" style="color:var(--success)">No Escalation Needed</div>
          <div class="evidence-text">Low confidence this requires immediate action. Monitor for recurrence.</div>
        </div>`;

      return `
        <div class="analysis-card" style="animation-delay:${idx * 0.06}s">
          <div class="analysis-header">
            <div class="analysis-header-info">
              <div class="analysis-vendor">${r.vendor}</div>
              <div class="analysis-sub">${anomalyTypeLabel(r.anomaly_type)} · ${r.transaction_id} · ${r.date}</div>
            </div>
            <span class="confidence-badge conf-${a.confidence}">
              ${a.confidence.charAt(0).toUpperCase() + a.confidence.slice(1)} Confidence
            </span>
          </div>
          <div class="reasoning-box">${a.reasoning}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <span class="badge ${a.needs_review ? 'badge-high' : 'badge-clean'}">
              ${a.needs_review ? '⚠ Needs Review' : '✓ Likely OK'}
            </span>
            <span class="badge" style="background:rgba(255,255,255,0.04);color:var(--text-2);border:1px solid var(--border-2)">
              False Positive: ${a.false_positive_likelihood}
            </span>
          </div>
          <div class="evidence-box">
            <div class="evidence-label">Recommended Action</div>
            <div class="evidence-text">${a.action}</div>
          </div>
          ${emailHtml}
        </div>`;
    }).join('');
  }

  // ── Report ─────────────────────────────────────────────────────────────────
  function renderReport() {
    const r          = state.results;
    const totalSpend = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    const needsRev   = r.filter(x => x.assessment?.needs_review);
    const high       = r.filter(x => x.severity === 'high');
    const medium     = r.filter(x => x.severity === 'medium');
    const low        = r.filter(x => x.severity === 'low');

    let html = `
      <h1>Anomaly Agent — Q2 2026 Invoice Report</h1>
      <p style="color:var(--text-3);font-size:12px;margin-bottom:20px;">
        Generated ${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} ·
        ${TRANSACTIONS.length} transactions · Apr – Jun 2026
      </p>
      <div class="report-summary-box">
        <div class="rs-item"><div class="rs-num">${TRANSACTIONS.length}</div><div class="rs-label">Transactions reviewed</div></div>
        <div class="rs-item"><div class="rs-num">${r.length}</div><div class="rs-label">Anomalies flagged</div></div>
        <div class="rs-item"><div class="rs-num">${needsRev.length}</div><div class="rs-label">Need human review</div></div>
      </div>
      <blockquote>
        <strong>${high.length} high-confidence</strong> and <strong>${medium.length} medium-confidence</strong>
        issues identified across <strong>${fmtAmt(totalSpend)}</strong> in total spend.
        ${needsRev.length} clarification emails drafted.
      </blockquote>
      <hr class="report-divider">`;

    for (const [label, group] of [
      ['🔴 High Severity', high],
      ['🟡 Medium Severity', medium],
      ['🔵 Low Severity', low],
    ]) {
      if (!group.length) continue;
      html += `<h2>${label}</h2>`;
      for (const item of group) {
        const ev = item.evidence;
        const a  = item.assessment;
        let eLine = '';
        if (item.anomaly_type === 'duplicate_charge')
          eLine = `Duplicate of ${ev.original_id} · ${ev.days_apart} day(s) apart`;
        else if (item.anomaly_type === 'price_spike')
          eLine = `${fmtAmt(ev.spike_amount)} vs ${fmtAmt(ev.historical_avg)} avg (+${ev.spike_pct.toFixed(1)}%)`;
        else
          eLine = `No prior history · ${ev.is_round_amount ? 'Suspicious round amount' : 'One-time vendor'}`;

        html += `
          <h3>${item.vendor} — ${anomalyTypeLabel(item.anomaly_type)}</h3>
          <ul>
            <li><strong>Transaction:</strong> <code>${item.transaction_id}</code> · ${item.date}</li>
            <li><strong>Amount:</strong> ${fmtAmt(item.amount)} · ${item.department} · Approved by ${item.approved_by}</li>
            <li><strong>Evidence:</strong> ${eLine}</li>
            <li><strong>AI (${a.confidence} confidence):</strong> ${a.reasoning.slice(0, 200)}…</li>
            <li><strong>Action:</strong> ${a.action}</li>
            ${item.email ? `<li><strong>Email to:</strong> ${item.email.to}</li>` : ''}
          </ul>`;
      }
      html += '<hr class="report-divider">';
    }

    html += `
      <h2>Summary</h2>
      <ul>
        <li>Transactions reviewed: <strong>150</strong></li>
        <li>Total spend: <strong>${fmtAmt(totalSpend)}</strong></li>
        <li>Duplicate charges: <strong>${r.filter(x=>x.anomaly_type==='duplicate_charge').length}</strong></li>
        <li>Price spikes: <strong>${r.filter(x=>x.anomaly_type==='price_spike').length}</strong></li>
        <li>Unusual vendors: <strong>${r.filter(x=>x.anomaly_type.startsWith('unusual_vendor')).length}</strong></li>
        <li>Emails drafted: <strong>${needsRev.length}</strong></li>
      </ul>
      <p style="color:var(--text-3);font-size:11px;margin-top:24px;">
        Anomaly Agent · Rule-based detection + simulated AI reasoning ·
        In production, assessments powered by Claude (Anthropic API).
      </p>`;

    $('report-body').innerHTML = html;
  }

  // ── Markdown export ────────────────────────────────────────────────────────
  function generateMarkdown() {
    const r          = state.results;
    const totalSpend = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
    const needsRev   = r.filter(x => x.assessment?.needs_review);
    let md = `# Anomaly Agent — Q2 2026 Invoice Report\n\n`;
    md += `> Generated ${new Date().toLocaleDateString()} · ${TRANSACTIONS.length} transactions reviewed\n\n`;
    md += `## Summary\n- **${r.length}** anomalies flagged\n`;
    md += `- **${r.filter(x=>x.severity==='high').length}** high, **${r.filter(x=>x.severity==='medium').length}** medium, **${r.filter(x=>x.severity==='low').length}** low\n`;
    md += `- **${needsRev.length}** emails drafted\n- Total spend: **${fmtAmt(totalSpend)}**\n\n---\n\n`;
    for (const [label, group] of [
      ['High Severity', r.filter(x=>x.severity==='high')],
      ['Medium Severity', r.filter(x=>x.severity==='medium')],
      ['Low Severity', r.filter(x=>x.severity==='low')],
    ]) {
      if (!group.length) continue;
      md += `## ${label}\n\n`;
      for (const item of group) {
        const a = item.assessment;
        md += `### ${item.vendor} — ${anomalyTypeLabel(item.anomaly_type)}\n`;
        md += `- **ID:** \`${item.transaction_id}\` · ${item.date}\n`;
        md += `- **Amount:** ${fmtAmt(item.amount)}\n`;
        md += `- **Confidence:** ${a.confidence} | **Needs Review:** ${a.needs_review}\n`;
        md += `- **Reasoning:** ${a.reasoning}\n`;
        md += `- **Action:** ${a.action}\n`;
        if (item.email) md += `\n**Email to:** ${item.email.to}\n\n\`\`\`\n${item.email.body}\n\`\`\`\n`;
        md += '\n';
      }
    }
    return md;
  }

  // ── Public helpers ─────────────────────────────────────────────────────────
  function toggleCard(id) {
    document.getElementById(`acard-${id}`)?.classList.toggle('open');
  }
  function navTo(view) { switchView(view); }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    // Start globe
    globe = new Globe('globe-canvas');
    globe.start();

    // Nav
    document.querySelectorAll('.nav-item[data-view]').forEach(el =>
      el.addEventListener('click', () => switchView(el.dataset.view))
    );
    document.querySelectorAll('.card-link[data-view]').forEach(el =>
      el.addEventListener('click', () => switchView(el.dataset.view))
    );

    // Run
    $('btn-run').addEventListener('click', () => {
      state.analysisRun ? switchView('dashboard') : runAnalysis();
    });

    // Pre-render transaction table
    renderTxnTable();
    $('txn-search').addEventListener('input', e => {
      state.txnSearch = e.target.value.toLowerCase();
      renderTxnTable();
    });
    $('txn-filter').addEventListener('change', e => {
      state.txnFilter = e.target.value;
      renderTxnTable();
    });

    // Anomaly tabs
    document.querySelectorAll('.tab[data-severity]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab[data-severity]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.anomalyFilter = tab.dataset.severity;
        renderAnomalyList();
      });
    });

    // Copy report
    $('btn-copy-report').addEventListener('click', () => {
      if (!state.analysisRun) return alert('Run analysis first.');
      navigator.clipboard.writeText(generateMarkdown()).then(() => {
        const btn = $('btn-copy-report');
        const orig = btn.innerHTML;
        btn.textContent = '✓ Copied!';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      });
    });

    // Download report
    $('btn-download-report').addEventListener('click', () => {
      if (!state.analysisRun) return alert('Run analysis first.');
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([generateMarkdown()], { type: 'text/markdown' })),
        download: 'anomaly-report-q2-2026.md',
      });
      a.click();
    });
  }

  return { init, toggleCard, navTo };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
