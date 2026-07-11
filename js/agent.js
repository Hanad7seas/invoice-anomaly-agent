// ── Simulated AI Accounting Analyst ───────────────────────────────────────────
// Generates contextual assessments that reference actual transaction data.
// In production, each assess() call would POST to Claude via the Anthropic API
// with a system prompt like: "You are a senior accounting analyst reviewing
// flagged invoice transactions…"

function fmtAmt(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fmtDate(d) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const [y, m, day] = d.split('-');
  return `${months[+m - 1]} ${+day}, ${y}`;
}

// ── Core assessment generator ─────────────────────────────────────────────────
function assessAnomaly(anomaly) {
  const ev = anomaly.evidence;

  switch (anomaly.anomaly_type) {

    case 'duplicate_charge': {
      const days = ev.days_apart;
      const highValue = anomaly.amount >= 1000;
      return {
        confidence: highValue || days <= 2 ? 'high' : 'medium',
        needs_review: true,
        reasoning:
          `This ${anomaly.vendor} charge of ${fmtAmt(anomaly.amount)} on ${fmtDate(anomaly.date)} ` +
          `appears within ${days} day${days === 1 ? '' : 's'} of an identical charge (${ev.original_id}). ` +
          `Subscription billing systems occasionally fire duplicate invoices when payment methods are ` +
          `updated or a retry is triggered after a failed auth. However, without confirmation from the ` +
          `vendor's billing portal, this cannot be distinguished from a legitimate additional seat or ` +
          `period charge. The risk of eating a duplicate ${fmtAmt(anomaly.amount)} charge warrants ` +
          `a quick verification before the 30-day dispute window closes.`,
        action: `Log into the ${anomaly.vendor} billing portal and confirm only one invoice was issued for this period. If duplicated, request a credit or reversal.`,
        false_positive_likelihood: highValue ? 'Low' : 'Medium',
        false_positive_reason: highValue
          ? 'High-value subscriptions rarely have legitimate same-period double-billing.'
          : 'Small subscriptions sometimes legitimately bill twice in short windows (e.g. mid-cycle seat additions).'
      };
    }

    case 'price_spike': {
      const pct = ev.spike_pct.toFixed(1);
      const avg = fmtAmt(ev.historical_avg);
      const spike = fmtAmt(ev.spike_amount);
      const isAWS = anomaly.vendor === 'AWS';
      const isWeWork = anomaly.vendor === 'WeWork';
      const isFacility = anomaly.category === 'Facilities';

      let reasoning, falsePositiveNote;

      if (isAWS) {
        reasoning =
          `AWS charges of ${spike} on ${fmtDate(anomaly.date)} are ${pct}% above this account's ` +
          `3-month average of ${avg} (${ev.prior_count} prior invoices). AWS costs can spike legitimately ` +
          `during product launches, data migrations, or load testing—but a ${pct}% jump is significant ` +
          `enough to require a usage breakdown. The engineering team should pull the Cost Explorer report ` +
          `for this billing period to identify which service drove the increase.`;
        falsePositiveNote = 'Medium — AWS spend genuinely fluctuates, but this magnitude warrants audit.';
      } else if (isWeWork || isFacility) {
        reasoning =
          `WeWork invoiced ${spike} on ${fmtDate(anomaly.date)}, a ${pct}% increase over the consistent ` +
          `${avg}/month seen across the previous ${ev.prior_count} months. Fixed-cost office leases should ` +
          `not fluctuate by this margin. Possible explanations include: (1) a new desk or conference room ` +
          `added without updated PO, (2) a one-time move/setup fee, or (3) a billing error. This needs ` +
          `verification against the signed lease agreement.`;
        falsePositiveNote = 'Low — Facility costs should be fixed per signed contract.';
      } else {
        reasoning =
          `${anomaly.vendor} charged ${spike} on ${fmtDate(anomaly.date)}, which is ${pct}% above the ` +
          `${avg} average across ${ev.prior_count} prior invoices. While occasional price adjustments ` +
          `or bulk purchases can explain higher charges, a ${pct}% deviation without a matching purchase ` +
          `order or price-change notification is unusual. This should be cross-referenced against any ` +
          `active vendor contract or recent quote.`;
        falsePositiveNote = pct > 60
          ? 'Low — Deviation this large is rarely within normal fluctuation.'
          : 'Medium — Some price variation is normal for this vendor category.';
      }

      return {
        confidence: ev.spike_pct >= 50 ? 'high' : 'medium',
        needs_review: true,
        reasoning,
        action: isAWS
          ? 'Pull AWS Cost Explorer report for the billing period and identify which service drove the spike.'
          : `Compare invoice against signed vendor contract or most recent quote. Request itemized breakdown from ${anomaly.vendor}.`,
        false_positive_likelihood: falsePositiveNote.split(' — ')[0],
        false_positive_reason: falsePositiveNote.split(' — ')[1]
      };
    }

    case 'unusual_vendor_round_amount': {
      return {
        confidence: 'high',
        needs_review: true,
        reasoning:
          `TechVault Innovations has no prior transaction history in this account, and the invoice amount ` +
          `of ${fmtAmt(anomaly.amount)} is a precisely round number—both significant red flags. Legitimate ` +
          `software licensing and consulting engagements almost universally produce irregular invoice amounts ` +
          `(reflecting hourly rates × hours, or seat counts × per-seat pricing). A round ${fmtAmt(anomaly.amount)} ` +
          `with a vague description ("Software licensing and consulting services") and no prior vendor ` +
          `relationship suggests this may have bypassed normal procurement. There is no record of a signed ` +
          `statement of work or vendor onboarding in the system.`,
        action: `Request a signed SOW, vendor W-9, and itemized invoice from TechVault Innovations. Escalate to Finance if documentation cannot be produced.`,
        false_positive_likelihood: 'Low',
        false_positive_reason: 'New vendors with round amounts and vague descriptions rarely have innocent explanations without supporting documentation.'
      };
    }

    case 'unusual_vendor': {
      const highVal = anomaly.amount >= 1000;
      return {
        confidence: highVal ? 'high' : 'medium',
        needs_review: highVal,
        reasoning:
          `${anomaly.vendor} has no prior transaction history in this dataset. The ${fmtAmt(anomaly.amount)} ` +
          `charge on ${fmtDate(anomaly.date)} was approved by ${anomaly.approved_by} under the ` +
          `${anomaly.department} department. While legitimate one-time vendor relationships occur ` +
          `(conferences, contractors, equipment), amounts${highVal ? ` of this size ($${(anomaly.amount/1000).toFixed(1)}k)` : ''} ` +
          `with first-time vendors should have a corresponding purchase order or written approval on file. ` +
          `The description may not fully reflect the nature of the engagement.`,
        action: highVal
          ? `Verify a signed contract or PO exists for this engagement. Confirm ${anomaly.approved_by} authorized this through proper procurement channels.`
          : `Confirm with ${anomaly.approved_by} that this was a legitimate one-time purchase with a receipt.`,
        false_positive_likelihood: highVal ? 'Medium' : 'High',
        false_positive_reason: highVal
          ? 'High-value first-time vendors should always have documented approval.'
          : 'Small one-time vendor charges (conferences, subscriptions) are commonly legitimate.'
      };
    }

    default:
      return {
        confidence: 'low',
        needs_review: false,
        reasoning: 'No specific pattern matched. General review recommended.',
        action: 'No immediate action required.',
        false_positive_likelihood: 'High',
        false_positive_reason: 'Unable to determine anomaly type.'
      };
  }
}

// ── Draft clarification email ─────────────────────────────────────────────────
function draftClarificationEmail(anomaly, assessment) {
  const txn = getTransaction(anomaly.transaction_id);
  const ev = anomaly.evidence;
  const approver = anomaly.approved_by;
  const firstName = approver.split(' ')[0];

  let subject, body;

  switch (anomaly.anomaly_type) {

    case 'duplicate_charge':
      subject = `Question re: ${anomaly.vendor} charge – ${fmtDate(anomaly.date)} (${anomaly.transaction_id})`;
      body =
`Hi ${firstName},

I'm doing a routine review of Q2 invoices and wanted to flag something for your awareness.

We have two charges from ${anomaly.vendor} for ${fmtAmt(anomaly.amount)} that appear very close together:

  • ${ev.original_id} — ${fmtDate(getTransaction(ev.original_id)?.date || anomaly.date)}
  • ${anomaly.transaction_id} — ${fmtDate(anomaly.date)} (${ev.days_apart} day${ev.days_apart === 1 ? '' : 's'} later)

This may be completely legitimate — for example, if a seat was added mid-cycle or a billing correction was issued — but I wanted to check in before the dispute window closes.

Could you confirm whether both charges were expected, or let me know if I should contact ${anomaly.vendor} to request a credit on one of them?

Thanks for your help clarifying this.

Best,
Finance & Accounting`;
      break;

    case 'price_spike': {
      const pct = ev.spike_pct.toFixed(0);
      const avg = fmtAmt(ev.historical_avg);
      subject = `${anomaly.vendor} invoice review – ${fmtDate(anomaly.date)} (${anomaly.transaction_id})`;
      body =
`Hi ${firstName},

During our Q2 invoice review, I noticed that the ${anomaly.vendor} charge on ${fmtDate(anomaly.date)} came in at ${fmtAmt(anomaly.amount)}, which is about ${pct}% above the ${avg} we've typically seen from this vendor.

I wanted to reach out before closing the books to make sure this was expected — for example, due to a plan upgrade, increased usage, or a one-time fee.

If you have a corresponding quote, updated contract, or usage explanation on hand, could you share it? If this was unexpected, I can help initiate a review with the vendor.

No urgency, and apologies if this was already on your radar — just making sure we have documentation in place.

Thanks,
Finance & Accounting`;
      break;
    }

    case 'unusual_vendor_round_amount':
      subject = `Documentation needed – TechVault Innovations ${fmtAmt(anomaly.amount)} (${anomaly.transaction_id})`;
      body =
`Hi ${firstName},

I'm reviewing June invoices and have a question about the ${fmtAmt(anomaly.amount)} charge to TechVault Innovations on ${fmtDate(anomaly.date)}.

This vendor doesn't appear in our prior records, and we don't have a purchase order or signed statement of work on file for this engagement.

To complete our records and ensure compliance with procurement policy, could you help me locate:

  1. A signed contract or statement of work with TechVault Innovations
  2. An itemized invoice breaking down the ${fmtAmt(anomaly.amount)} charge
  3. Confirmation that this went through the standard vendor onboarding process

I want to make sure we have everything documented properly — this is standard procedure for new vendor relationships above the $1,000 threshold.

Thank you for your help with this,
Finance & Accounting`;
      break;

    case 'unusual_vendor':
      subject = `One-time vendor check – ${anomaly.vendor} (${anomaly.transaction_id})`;
      body =
`Hi ${firstName},

Quick note as part of our Q2 review — I see a charge from ${anomaly.vendor} for ${fmtAmt(anomaly.amount)} on ${fmtDate(anomaly.date)}, and this vendor doesn't appear in our prior records.

Could you confirm this was a legitimate business expense? If you have a receipt or brief description of what this covered, that would be great to keep on file.

No concerns on my end — just making sure our records are complete.

Thanks,
Finance & Accounting`;
      break;

    default:
      subject = `Invoice review – ${anomaly.vendor} (${anomaly.transaction_id})`;
      body = `Hi ${firstName},\n\nCould you confirm the details of this charge?\n\nThanks.`;
  }

  return {
    to: `${approver} <${approver.toLowerCase().replace(' ', '.')}@company.com>`,
    subject,
    body
  };
}

// ── Process all anomalies ─────────────────────────────────────────────────────
function processAllAnomalies(anomalies) {
  return anomalies.map(anomaly => {
    const assessment = assessAnomaly(anomaly);
    const email = assessment.needs_review
      ? draftClarificationEmail(anomaly, assessment)
      : null;
    return { ...anomaly, assessment, email };
  });
}
