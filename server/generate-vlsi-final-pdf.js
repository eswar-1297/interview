const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const questions = require("./data/vlsi-final-round-questions.json");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title:        "#0f2044",
  text:         "#1f2937",
  divider:      "#e5e7eb",
  section:      "#1e3a5f",
  sectionBg:    "#eff6ff",
  Technical:    "#1d4ed8",
  TechnicalBg:  "#dbeafe",
  HR:           "#7c3aed",
  HRBg:         "#ede9fe",
  Hard:         "#dc2626",
  HardBg:       "#fee2e2",
  Medium:       "#d97706",
  MediumBg:     "#fef3c7",
  keyBg:        "#f0fdf4",
  keyBorder:    "#16a34a",
  keyText:      "#15803d",
  bulletBg:     "#f8fafc",
};

function drawHeader(doc) {
  doc.rect(0, 0, doc.page.width, 120).fill(COLORS.title);

  doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold")
    .text("VLSI Physical Design — Final Interview Round", 50, 22, { width: doc.page.width - 100 });

  doc.fontSize(11).font("Helvetica").fillColor("#93c5fd")
    .text("Fresher Level  |  10 Questions  |  Technical (8) + HR (2)  |  Interviewer Copy", 50, 56);

  doc.fontSize(9).font("Helvetica").fillColor("#94a3b8")
    .text("This document contains questions AND expected answer key points. Do not share with candidates.", 50, 76);

  doc.fontSize(9).font("Helvetica").fillColor("#64748b")
    .text(`Generated on ${new Date().toDateString()}`, 50, 96);

  doc.y = 138;
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

function badge(doc, label, x, y, bgColor, textColor, width) {
  const w = width || doc.widthOfString(label, { fontSize: 8 }) + 14;
  doc.rect(x, y - 1, w, 16).fill(bgColor);
  doc.fillColor(textColor).fontSize(8).font("Helvetica-Bold")
    .text(label, x + 7, y + 3, { width: w - 14, lineBreak: false });
  return w;
}

function drawQuestion(doc, q, index) {
  const catBg    = COLORS[q.category + "Bg"] || "#f9fafb";
  const catColor = COLORS[q.category]        || "#374151";
  const diffBg   = COLORS[q.difficulty + "Bg"] || "#f9fafb";
  const diffColor= COLORS[q.difficulty]        || "#374151";

  const qTextHeight = doc.heightOfString(q.question, { width: doc.page.width - 110, fontSize: 11 });
  const keyPointsHeight = q.keyPoints.reduce((acc, kp) => {
    return acc + doc.heightOfString(`• ${kp}`, { width: doc.page.width - 130, fontSize: 9.5 }) + 6;
  }, 0);
  const estimatedHeight = 30 + qTextHeight + 30 + keyPointsHeight + 50;

  checkPageBreak(doc, Math.min(estimatedHeight, 180));

  const y = doc.y;

  // Question number
  doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.section)
    .text(`Q${q.id}`, 50, y, { width: 28, lineBreak: false });

  // Badges
  let bx = 82;
  bx += badge(doc, q.category, bx, y, catBg, catColor) + 6;
  bx += badge(doc, q.topic, bx, y, "#f1f5f9", "#475569") + 6;
  badge(doc, q.difficulty, bx, y, diffBg, diffColor);

  doc.y = y + 26;

  // Question text box
  const qY = doc.y;
  const qTextH = doc.heightOfString(q.question, { width: doc.page.width - 120, fontSize: 11 }) + 20;

  doc.rect(50, qY, doc.page.width - 100, qTextH).fill("#f8fafc");
  doc.rect(50, qY, 4, qTextH).fill(catColor);
  doc.fillColor(COLORS.text).fontSize(11).font("Helvetica")
    .text(q.question, 64, qY + 10, { width: doc.page.width - 124 });

  doc.y = qY + qTextH + 12;

  // Key Points header
  checkPageBreak(doc, 40);
  const kpHeaderY = doc.y;
  doc.rect(50, kpHeaderY, doc.page.width - 100, 20).fill(COLORS.keyBg);
  doc.rect(50, kpHeaderY, 4, 20).fill(COLORS.keyBorder);
  doc.fillColor(COLORS.keyText).fontSize(9).font("Helvetica-Bold")
    .text("INTERVIEWER: Expected Answer Key Points", 64, kpHeaderY + 6, { width: doc.page.width - 124 });
  doc.y = kpHeaderY + 26;

  // Key points
  q.keyPoints.forEach((kp, i) => {
    checkPageBreak(doc, 22);
    const kpY = doc.y;
    if (i % 2 === 0) doc.rect(54, kpY - 2, doc.page.width - 108, 0).fill(COLORS.bulletBg);
    doc.fillColor(COLORS.keyText).fontSize(9.5).font("Helvetica")
      .text(`•  ${kp}`, 64, kpY, { width: doc.page.width - 130 });
    doc.y += 6;
  });

  doc.y += 10;
  drawDivider(doc);
}

function generate() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const filePath = path.join(OUTPUT_DIR, "VLSI_Final_Round_Interview.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  drawHeader(doc);

  // Legend
  const legendY = doc.y;
  let lx = 50;
  [["Technical", "Technical Questions"], ["HR", "HR / Behavioral"]].forEach(([cat, label]) => {
    const bg = COLORS[cat + "Bg"];
    const fg = COLORS[cat];
    doc.rect(lx, legendY, 10, 10).fill(bg);
    doc.rect(lx, legendY, 2, 10).fill(fg);
    doc.fillColor(fg).fontSize(9).font("Helvetica-Bold").text(label, lx + 14, legendY + 1, { continued: false });
    lx += 160;
  });
  [["Hard", "Hard"], ["Medium", "Medium"]].forEach(([diff, label]) => {
    const bg = COLORS[diff + "Bg"];
    const fg = COLORS[diff];
    doc.rect(lx, legendY, 10, 10).fill(bg);
    doc.rect(lx, legendY, 2, 10).fill(fg);
    doc.fillColor(fg).fontSize(9).font("Helvetica-Bold").text(label, lx + 14, legendY + 1, { continued: false });
    lx += 90;
  });
  doc.fillColor(COLORS.keyText).fontSize(9).font("Helvetica-Bold")
    .text("Green boxes = Answer key (interviewer only)", lx, legendY + 1);
  doc.y = legendY + 22;
  drawDivider(doc);

  // Technical section
  const techQs = questions.filter(q => q.category === "Technical");
  const hrQs   = questions.filter(q => q.category === "HR");

  checkPageBreak(doc, 30);
  doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.Technical)
    .text(`Technical Questions  (Q1–Q${techQs.length})`, 50);
  doc.moveDown(0.3);
  drawDivider(doc);
  techQs.forEach(q => drawQuestion(doc, q));

  checkPageBreak(doc, 40);
  doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.HR)
    .text(`HR / Behavioral Questions  (Q${techQs.length + 1}–Q${questions.length})`, 50);
  doc.moveDown(0.3);
  drawDivider(doc);
  hrQs.forEach(q => drawQuestion(doc, q));

  // Quick reference page
  doc.addPage();
  doc.y = 50;

  doc.rect(0, 0, doc.page.width, 70).fill(COLORS.title);
  doc.fillColor("#ffffff").fontSize(18).font("Helvetica-Bold")
    .text("Quick Reference — Interview Guide", 50, 20);
  doc.fillColor("#93c5fd").fontSize(10).font("Helvetica")
    .text("Topics covered | Use this page to track candidate performance during the interview", 50, 48);
  doc.y = 88;

  drawDivider(doc);

  const colW  = [30, 72, 110, 240, 80];
  const startX = 50;
  const rowH   = 28;
  const totalW = colW.reduce((a, b) => a + b, 0);

  // Table header
  const hY = doc.y;
  doc.rect(startX, hY, totalW, rowH).fill(COLORS.sectionBg);
  doc.fillColor(COLORS.section).fontSize(9).font("Helvetica-Bold");
  let cx = startX + 6;
  ["Q#", "Category", "Topic", "Question Summary", "Score /5"].forEach((h, i) => {
    doc.text(h, cx, hY + 10, { width: colW[i] - 6, lineBreak: false });
    cx += colW[i];
  });
  doc.y = hY + rowH + 2;

  questions.forEach((q, i) => {
    checkPageBreak(doc, rowH + 4);
    const rY = doc.y;
    if (i % 2 === 0) doc.rect(startX, rY, totalW, rowH).fill("#f9fafb");

    const catColor = COLORS[q.category] || COLORS.text;
    const summary  = q.question.length > 60 ? q.question.slice(0, 57) + "..." : q.question;

    cx = startX + 6;
    doc.fillColor(COLORS.section).fontSize(9).font("Helvetica-Bold")
      .text(`Q${q.id}`, cx, rY + 9, { width: colW[0] - 6, lineBreak: false }); cx += colW[0];
    doc.fillColor(catColor).fontSize(8).font("Helvetica-Bold")
      .text(q.category, cx, rY + 9, { width: colW[1] - 6, lineBreak: false }); cx += colW[1];
    doc.fillColor("#475569").fontSize(8).font("Helvetica")
      .text(q.topic, cx, rY + 9, { width: colW[2] - 6, lineBreak: false }); cx += colW[2];
    doc.fillColor(COLORS.text).fontSize(8).font("Helvetica")
      .text(summary, cx, rY + 9, { width: colW[3] - 6, lineBreak: false }); cx += colW[3];

    // Score box
    doc.rect(cx, rY + 6, 50, 16).strokeColor("#d1d5db").lineWidth(0.5).stroke();

    doc.y = rY + rowH + 2;
  });

  // Total score row
  const totY = doc.y + 6;
  doc.rect(startX, totY, totalW, rowH).fill(COLORS.sectionBg);
  doc.fillColor(COLORS.section).fontSize(10).font("Helvetica-Bold")
    .text("TOTAL SCORE", startX + 6, totY + 9, { width: totalW - 90, lineBreak: false });
  doc.rect(startX + totalW - 56, totY + 6, 50, 16).strokeColor(COLORS.section).lineWidth(1).stroke();
  doc.fillColor(COLORS.section).fontSize(8).font("Helvetica")
    .text("/ 50", startX + totalW - 40, totY + 10, { lineBreak: false });
  doc.y = totY + rowH + 16;

  drawDivider(doc);

  // Evaluation guide
  doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.title)
    .text("Evaluation Guidelines", 50);
  doc.moveDown(0.4);

  const guidelines = [
    ["5 — Excellent", "Covers all key points, demonstrates deep understanding, gives real-world examples."],
    ["4 — Good",      "Covers most key points with minor gaps; answers are structured and clear."],
    ["3 — Average",   "Covers ~50% of key points; understands the concept but lacks depth."],
    ["2 — Below Avg", "Vague or partially correct; shows awareness of the topic but cannot elaborate."],
    ["1 — Poor",      "Incorrect or blank answer; fundamental concept misunderstood."],
  ];

  guidelines.forEach(([score, desc], i) => {
    checkPageBreak(doc, 20);
    const gY = doc.y;
    if (i % 2 === 0) doc.rect(50, gY - 2, doc.page.width - 100, 18).fill("#f9fafb");
    doc.fillColor(COLORS.section).fontSize(9).font("Helvetica-Bold")
      .text(score, 54, gY, { width: 90, lineBreak: false });
    doc.fillColor(COLORS.text).fontSize(9).font("Helvetica")
      .text(desc, 148, gY, { width: doc.page.width - 200 });
    doc.y += 4;
  });

  doc.moveDown(0.8);
  doc.fontSize(9).font("Helvetica").fillColor("#6b7280")
    .text("Recommendation: Score ≥ 35/50 → Strong hire  |  25–34 → Consider  |  < 25 → Decline", 50);

  doc.end();
  console.log(`\nPDF created: ${filePath}`);
}

generate();
