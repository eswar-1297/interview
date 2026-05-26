const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title:     "#0f172a",
  text:      "#1f2937",
  divider:   "#e5e7eb",
  accent:    "#b45309",
  accentBg:  "#fffbeb",
  answer:    "#15803d",
  answerBg:  "#f0fdf4",
  stepBg:    "#f8fafc",
  stepBorder:"#cbd5e1",
  note:      "#6b7280",
};

const questions = [
  {
    id: 1,
    topic: "GST — Output Tax Computation",
    scenario: `Ravi Traders, a GST-registered business in Maharashtra, made the following supplies during October 2024:
  • Intra-state sales of taxable goods: Rs. 8,00,000 (GST rate 18%)
  • Inter-state sales of taxable goods: Rs. 3,00,000 (GST rate 12%)
  • Export of goods (zero-rated): Rs. 1,50,000
  • Sale of exempt goods: Rs. 50,000
Calculate the total GST liability (CGST, SGST, IGST separately) for the month.`,
    question: "What is the total GST output tax liability of Ravi Traders for October 2024? Show your working.",
    answer: `Step 1 — Intra-state supply (CGST + SGST):
  Rs. 8,00,000 × 18% = Rs. 1,44,000 total GST
  CGST = Rs. 72,000  |  SGST = Rs. 72,000

Step 2 — Inter-state supply (IGST):
  Rs. 3,00,000 × 12% = Rs. 36,000 IGST

Step 3 — Exports (Zero-rated, no output tax):
  GST = Nil (eligible for LUT or refund of ITC)

Step 4 — Exempt supply:
  GST = Nil

TOTAL OUTPUT TAX LIABILITY:
  CGST  = Rs. 72,000
  SGST  = Rs. 72,000
  IGST  = Rs. 36,000
  Total = Rs. 1,80,000`,
    key_concept: "Intra-state supplies attract equal CGST + SGST; inter-state supplies attract IGST. Exports are zero-rated — no output tax is charged.",
  },
  {
    id: 2,
    topic: "TDS — Section 194C Contractor Payment",
    scenario: `ABC Pvt. Ltd. engages a contractor to renovate its office. The following payments are made in FY 2024-25:
  • April: Rs. 28,000
  • May:   Rs. 35,000
  • June:  Rs. 22,000
  The contractor is an individual and has not submitted a lower deduction certificate.`,
    question: "Determine: (a) In which month TDS first becomes applicable under Section 194C, and (b) the total TDS to be deducted by June.",
    answer: `Section 194C thresholds:
  • Single payment limit: Rs. 30,000
  • Aggregate limit in FY: Rs. 1,00,000
  TDS rate (individual): 1%

Month-wise analysis:
  April: Rs. 28,000 — below Rs. 30,000, but aggregate = Rs. 28,000 → No TDS
  May:   Rs. 35,000 — exceeds single-payment limit of Rs. 30,000
          → TDS applicable from May
          Aggregate to date = Rs. 63,000

(a) TDS first becomes applicable in MAY (single payment exceeds Rs. 30,000).

(b) Once TDS is triggered, it applies on ALL previous payments from the start of FY:
  Total of April + May = Rs. 63,000 × 1% = Rs. 630
  June: Rs. 22,000 × 1% = Rs. 220

  Total TDS deducted by end of June = Rs. 630 + Rs. 220 = Rs. 850`,
    key_concept: "TDS under 194C triggers if a single payment exceeds Rs. 30,000 OR aggregate in the year exceeds Rs. 1,00,000. Once triggered, TDS is deducted on cumulative payments.",
  },
  {
    id: 3,
    topic: "Income Tax — Taxable Income Computation",
    scenario: `Priya, a resident individual (age 32), has the following income for FY 2024-25:
  • Gross salary: Rs. 9,60,000  |  Standard deduction: Rs. 75,000
  • Interest from savings bank: Rs. 18,000
  • Rental income from let-out property: Rs. 1,80,000
    (Municipal taxes paid: Rs. 12,000; home loan interest on this property: Rs. 95,000)
  She opts for the OLD tax regime.`,
    question: "Compute Priya's total taxable income under the old regime.",
    answer: `Head 1 — Income from Salary:
  Gross Salary              Rs. 9,60,000
  Less: Standard Deduction  Rs.   75,000
  Net Salary Income       = Rs. 8,85,000

Head 2 — Income from House Property:
  Gross Annual Value (GAV)  Rs. 1,80,000
  Less: Municipal Tax       Rs.   12,000
  Net Annual Value (NAV)  = Rs. 1,68,000
  Less: 30% deduction u/s 24(a) on NAV  Rs. 50,400
  Less: Interest on home loan u/s 24(b) Rs. 95,000
  Income from House Property = Rs. 22,600

Head 3 — Income from Other Sources:
  Savings bank interest     Rs. 18,000
  Less: Deduction u/s 80TTA Rs. 10,000
  Taxable interest        = Rs.  8,000  ← (note: deduction applied at GTI stage)

  Gross Total Income (GTI) = Rs. 8,85,000 + Rs. 22,600 + Rs. 18,000
                           = Rs. 9,25,600
  Less: 80TTA deduction    Rs.   10,000
  TOTAL TAXABLE INCOME   = Rs. 9,15,600`,
    key_concept: "Under the old regime: standard deduction (Rs. 75,000), 30% flat deduction on NAV u/s 24(a), actual interest u/s 24(b), and 80TTA savings interest deduction (max Rs. 10,000) are all available.",
  },
  {
    id: 4,
    topic: "Income Tax — LTCG on Listed Equity Shares",
    scenario: `Arjun purchased 500 shares of XYZ Ltd. on 1 August 2022 at Rs. 240 per share.
He sold all 500 shares on 15 October 2024 at Rs. 410 per share.
STT (Securities Transaction Tax) was paid on both purchase and sale.
Arjun has no other capital gains in FY 2024-25.`,
    question: "Calculate (a) whether the gain is STCG or LTCG, (b) the capital gain amount, and (c) the tax payable on it.",
    answer: `(a) Holding period:
  Purchase: 01-Aug-2022  |  Sale: 15-Oct-2024
  Holding = approx. 26 months → exceeds 12 months
  Classification: LONG-TERM CAPITAL GAIN (LTCG)

(b) Capital Gain:
  Sale consideration: 500 × Rs. 410 = Rs. 2,05,000
  Cost of acquisition: 500 × Rs. 240 = Rs. 1,20,000
  LTCG = Rs. 2,05,000 − Rs. 1,20,000 = Rs. 85,000

  Note: Indexation does NOT apply to listed equity shares.

(c) Tax on LTCG (Section 112A):
  LTCG up to Rs. 1,00,000 per year is exempt.
  Taxable LTCG = Rs. 85,000 − Rs. 85,000 = NIL
  (entire gain falls within the Rs. 1 lakh exemption limit)

  TAX PAYABLE = Rs. 0`,
    key_concept: "LTCG on listed equity (STT paid) is taxed at 10% u/s 112A above Rs. 1,00,000 per year without indexation. If total LTCG ≤ Rs. 1 lakh, no tax is payable.",
  },
  {
    id: 5,
    topic: "GST — Input Tax Credit (ITC) Eligibility",
    scenario: `Kiran Enterprises (GST registered, engaged in taxable supply) incurred the following expenses in November 2024:
  A. Purchase of raw materials for manufacturing: Rs. 5,00,000 (GST 18%)
  B. Purchase of a car for the MD's personal use: Rs. 12,00,000 (GST 28%)
  C. Staff canteen food and refreshments: Rs. 80,000 (GST 5%)
  D. Purchase of office computers: Rs. 1,50,000 (GST 18%)
  E. Outdoor catering for a client event: Rs. 60,000 (GST 18%)`,
    question: "Identify which items are eligible for ITC and compute the total admissible ITC.",
    answer: `ITC Eligibility Analysis:

  A. Raw materials — ELIGIBLE (used in making taxable supply)
     ITC = Rs. 5,00,000 × 18% = Rs. 90,000  ✓

  B. Car for MD's personal use — BLOCKED (Section 17(5))
     Motor vehicles for personal use are explicitly blocked.
     ITC = Rs. 0  ✗

  C. Staff canteen food — BLOCKED (Section 17(5)(b))
     Food and beverages for employees are blocked unless
     obligatory under any law.
     ITC = Rs. 0  ✗

  D. Office computers — ELIGIBLE (capital goods for business use)
     ITC = Rs. 1,50,000 × 18% = Rs. 27,000  ✓

  E. Outdoor catering — BLOCKED (Section 17(5)(b))
     Outdoor catering is explicitly listed as a blocked credit.
     ITC = Rs. 0  ✗

  TOTAL ADMISSIBLE ITC = Rs. 90,000 + Rs. 27,000 = Rs. 1,17,000`,
    key_concept: "Section 17(5) of CGST Act lists 'blocked credits' — motor vehicles (personal use), food/beverages, outdoor catering, club memberships etc. are NOT eligible for ITC.",
  },
  {
    id: 6,
    topic: "Income Tax — Advance Tax Calculation",
    scenario: `Sunita is a freelance tax consultant. Her estimated income for FY 2024-25 is:
  • Professional fees: Rs. 14,00,000
  • Short-term capital gains (equity): Rs. 80,000
  • Savings bank interest: Rs. 12,000
  Estimated deductions: 80C Rs. 1,50,000 | 80D Rs. 25,000 | 80TTA Rs. 10,000
  She has no TDS deducted on her income. She opts for the OLD tax regime.`,
    question: "Compute Sunita's advance tax liability and the amount due at each installment date.",
    answer: `Step 1 — Estimated Taxable Income:
  Professional fees          Rs. 14,00,000
  STCG (equity, 15% flat)    Rs.    80,000  ← taxed separately
  Savings interest           Rs.    12,000
  Gross Total Income       = Rs. 14,92,000

  Less deductions (on non-STCG income):
  80C                        Rs. 1,50,000
  80D                        Rs.    25,000
  80TTA                      Rs.    10,000
  Total deductions         = Rs. 1,85,000

  Normal taxable income    = Rs. 14,92,000 − Rs. 80,000 − Rs. 1,85,000
                           = Rs. 12,27,000  (excluding STCG)

Step 2 — Tax on Normal Income (Old regime, below 60):
  Up to Rs. 2,50,000         Nil
  Rs. 2,50,001–5,00,000      Rs. 12,500   (5%)
  Rs. 5,00,001–10,00,000     Rs. 1,00,000 (20%)
  Rs. 10,00,001–12,27,000    Rs. 68,100   (30%)
  Tax on normal income     = Rs. 1,80,600
  Tax on STCG (15%)        = Rs.    12,000
  Total tax before cess    = Rs. 1,92,600
  Add: Health & Ed. cess 4%= Rs.     7,704
  TOTAL TAX LIABILITY      = Rs. 2,00,304

Step 3 — Advance Tax Installments (since tax > Rs. 10,000):
  15 June     (15%)  = Rs.  30,046
  15 Sept     (45%)  = Rs.  90,137 cumulative → pay Rs. 60,091 this date
  15 Dec      (75%)  = Rs. 1,50,228 cumulative → pay Rs. 60,091 this date
  15 March   (100%)  = Rs. 2,00,304 cumulative → pay Rs. 50,076 this date`,
    key_concept: "Advance tax is required when total tax liability exceeds Rs. 10,000. Installments: 15% by 15 June, 45% by 15 Sept, 75% by 15 Dec, 100% by 15 March. STCG on equity is taxed at flat 15% u/s 111A.",
  },
  {
    id: 7,
    topic: "Income Tax — Deductions Under Chapter VI-A",
    scenario: `Vikram (age 45, salaried) has a Gross Total Income of Rs. 12,50,000 for FY 2024-25.
He made the following investments / payments in FY 2024-25:
  • PPF deposit: Rs. 1,20,000
  • ELSS mutual fund: Rs. 60,000
  • Life insurance premium: Rs. 30,000
  • Health insurance for self & family: Rs. 28,000
  • Health insurance for dependent parents (age 68): Rs. 52,000
  • Interest paid on education loan (Section 80E): Rs. 75,000
He opts for the OLD tax regime.`,
    question: "Calculate the total deductions available and Vikram's net taxable income.",
    answer: `Section 80C (overall cap: Rs. 1,50,000):
  PPF                        Rs. 1,20,000
  ELSS                       Rs.   60,000
  LIC premium                Rs.   30,000
  Total investments        = Rs. 2,10,000
  Allowed (capped at)      = Rs. 1,50,000

Section 80D (Health Insurance):
  Self & family (below 60): Rs. 28,000 — limit Rs. 25,000
    → allowed Rs. 25,000
  Parents (senior citizens): Rs. 52,000 — limit Rs. 50,000
    → allowed Rs. 50,000
  Total 80D deduction      = Rs. 75,000

Section 80E (Education Loan Interest):
  Entire interest amount is deductible — no upper limit
  Allowed                  = Rs. 75,000

TOTAL DEDUCTIONS:
  80C  Rs. 1,50,000
  80D  Rs.    75,000
  80E  Rs.    75,000
       ──────────────
       Rs. 3,00,000

NET TAXABLE INCOME:
  Rs. 12,50,000 − Rs. 3,00,000 = Rs. 9,50,000`,
    key_concept: "80C cap is Rs. 1,50,000 regardless of actual investment. 80D limit for senior-citizen parents is Rs. 50,000. 80E has no maximum limit — full interest on education loan is deductible.",
  },
  {
    id: 8,
    topic: "GST — GSTR-1 vs GSTR-3B Reconciliation",
    scenario: `During the GST audit of Mehta & Co. for FY 2023-24, the following mismatch is found:

  As per GSTR-1 (outward supply data):
    Taxable value:   Rs. 45,00,000  |  Tax: Rs. 8,10,000 (18%)

  As per GSTR-3B (self-assessed return):
    Taxable value:   Rs. 42,00,000  |  Tax: Rs. 7,56,000 (18%)

  On investigation it was found:
  (i)  Two invoices of Rs. 2,00,000 each were raised in March 2024 but not
       reported in GSTR-3B for that month.
  (ii) One credit note of Rs. 1,00,000 was correctly reported in GSTR-1
       but the tax reduction was double-counted in GSTR-3B.`,
    question: "Identify the nature of each discrepancy, compute the tax shortfall/excess, and state the corrective action required.",
    answer: `Discrepancy Analysis:

(i) Invoices of Rs. 2,00,000 × 2 = Rs. 4,00,000 not reported in GSTR-3B:
    Tax impact: Rs. 4,00,000 × 18% = Rs. 72,000 under-reported in GSTR-3B.
    Nature: Genuine short-payment of tax.
    Action: Pay the differential tax of Rs. 72,000 along with
            interest u/s 50 @ 18% p.a. from due date to actual payment.
            Disclose in GSTR-3B of subsequent period (DRC-03 if required).

(ii) Credit note of Rs. 1,00,000 — tax reduction double-counted in GSTR-3B:
    Correct tax reduction on credit note: Rs. 1,00,000 × 18% = Rs. 18,000
    If double-counted: Rs. 36,000 was reduced instead of Rs. 18,000
    Excess ITC/reduction claimed: Rs. 18,000
    Nature: Incorrect/inflated tax credit/reduction.
    Action: Reverse the excess reduction of Rs. 18,000 with interest.

Summary:
  Total tax shortfall (item i)          Rs. 72,000
  Excess reduction to be reversed (ii)  Rs. 18,000
  Net additional tax + interest payable Rs. 90,000 + applicable interest

Reconciliation Lesson:
  GSTR-3B must reflect same taxable value and tax as GSTR-1.
  Differences invite scrutiny notice under Section 61 of the CGST Act.`,
    key_concept: "GSTR-1 vs GSTR-3B mismatches are flagged automatically by the GST portal. Tax shortfalls attract interest @ 18% p.a. Excess ITC reversal also attracts interest @ 24% p.a. u/s 50(3).",
  },
];

function drawHeader(doc) {
  doc.rect(0, 0, doc.page.width, 110).fill(COLORS.title);
  doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold")
    .text("Practical Round — Questions & Answer Key", 50, 28, { width: doc.page.width - 100 });
  doc.fontSize(11).font("Helvetica").fillColor("#94a3b8")
    .text("Tax Consultant  |  Practical Round  |  8 Scenarios", 50, 62);
  doc.fontSize(10).font("Helvetica").fillColor("#64748b")
    .text(`Generated on ${new Date().toDateString()}`, 50, 84);
  doc.y = 130;
}

function drawDivider(doc) {
  const y = doc.y;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y)
    .strokeColor(COLORS.divider).lineWidth(0.5).stroke();
  doc.y = y + 12;
}

function checkPageBreak(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

function drawQuestion(doc, q) {
  checkPageBreak(doc, 60);

  const y = doc.y;

  // Question number + topic badge
  doc.rect(50, y, doc.page.width - 100, 26).fill(COLORS.accentBg);
  doc.rect(50, y, 4, 26).fill(COLORS.accent);

  doc.fillColor(COLORS.accent).fontSize(12).font("Helvetica-Bold")
    .text(`Q${q.id}.  ${q.topic}`, 62, y + 7, { width: doc.page.width - 120 });
  doc.y = y + 36;

  // Scenario box
  checkPageBreak(doc, 80);
  const scenY = doc.y;
  doc.fillColor("#475569").fontSize(9).font("Helvetica-Bold")
    .text("SCENARIO", 50, scenY);
  doc.y = scenY + 14;

  const scenTextY = doc.y;
  const scenLines = q.scenario.split("\n");
  const scenHeight = scenLines.length * 13 + 16;
  doc.rect(50, scenTextY, doc.page.width - 100, scenHeight).fill(COLORS.stepBg)
    .rect(50, scenTextY, 2, scenHeight).fill(COLORS.stepBorder);
  doc.fillColor(COLORS.text).fontSize(10).font("Helvetica")
    .text(q.scenario.trim(), 60, scenTextY + 8, { width: doc.page.width - 120, lineGap: 2 });
  doc.y = scenTextY + scenHeight + 10;

  // Question text
  checkPageBreak(doc, 40);
  doc.fillColor(COLORS.title).fontSize(11).font("Helvetica-Bold")
    .text(`Question:  ${q.question}`, 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.8);

  // Answer box
  checkPageBreak(doc, 100);
  const ansY = doc.y;
  doc.fillColor(COLORS.answer).fontSize(9).font("Helvetica-Bold")
    .text("MODEL ANSWER", 50, ansY);
  doc.y = ansY + 14;

  const ansTextY = doc.y;
  const ansLines = q.answer.split("\n");
  const ansHeight = ansLines.length * 13 + 20;

  doc.rect(50, ansTextY, doc.page.width - 100, ansHeight).fill(COLORS.answerBg)
    .rect(50, ansTextY, 3, ansHeight).fill(COLORS.answer);
  doc.fillColor(COLORS.answer).fontSize(10).font("Courier")
    .text(q.answer.trim(), 60, ansTextY + 10, { width: doc.page.width - 120, lineGap: 2 });
  doc.y = ansTextY + ansHeight + 10;

  // Key concept
  checkPageBreak(doc, 40);
  const noteY = doc.y;
  doc.rect(50, noteY, doc.page.width - 100, 1).fill(COLORS.divider);
  doc.y = noteY + 8;
  doc.fillColor(COLORS.note).fontSize(9).font("Helvetica-Bold")
    .text("Key Concept:  ", 50, doc.y, { continued: true })
    .font("Helvetica").text(q.key_concept, { width: doc.page.width - 100 });
  doc.moveDown(1.2);

  drawDivider(doc);
}

function generatePDF(outputStream) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(outputStream);

  drawHeader(doc);

  // Intro note
  doc.fillColor(COLORS.note).fontSize(10).font("Helvetica")
    .text(
      "Instructions: Each question presents a real-world tax scenario. Show full working, state applicable provisions/sections, and arrive at a clear numerical or reasoned conclusion.",
      50, doc.y, { width: doc.page.width - 100 }
    );
  doc.moveDown(0.6);
  drawDivider(doc);


  questions.forEach(q => drawQuestion(doc, q));

  doc.end();
}

if (require.main === module) {
  const filePath = path.join(OUTPUT_DIR, "Tax_Case_Study_Answer_Key.pdf");
  generatePDF(fs.createWriteStream(filePath));
  console.log(`PDF saved to: ${filePath}`);
}

module.exports = { generatePDF };
