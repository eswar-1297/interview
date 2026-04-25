const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const questions = require("./data/technical-questions.json");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title:     "#0f172a",
  text:      "#1f2937",
  divider:   "#e5e7eb",
  section:   "#1e40af",
  sectionBg: "#eff6ff",
  correct:   "#16a34a",
  correctBg: "#f0fdf4",
  codeBg:    "#1e293b",
  codeText:  "#e2e8f0",
  Java:      "#1d4ed8",
  JavaBg:    "#eff6ff",
  AI:        "#7c3aed",
  AIBg:      "#f5f3ff",
};

const OPTION_LETTERS = ["A", "B", "C", "D"];

function drawHeader(doc) {
  doc.rect(0, 0, doc.page.width, 110).fill(COLORS.title);
  doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold")
    .text("Technical Interview — Questions & Answer Key", 50, 30, { width: doc.page.width - 100 });
  doc.fontSize(11).font("Helvetica").fillColor("#94a3b8")
    .text("Java Developer  |  Technical Round  |  40 Questions  |  30 Minutes", 50, 62);
  doc.fontSize(10).font("Helvetica").fillColor("#64748b")
    .text(`Generated on ${new Date().toDateString()}`, 50, 84);
  doc.y = 130;
}

function drawDivider(doc) {
  const y = doc.y;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y)
    .strokeColor(COLORS.divider).lineWidth(0.5).stroke();
  doc.y = y + 10;
}

function checkPageBreak(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

function drawQuestion(doc, q) {
  const codeLines = q.code ? q.code.split("\n").length : 0;
  const codeHeight = q.code ? codeLines * 14 + 20 : 0;
  checkPageBreak(doc, 120 + codeHeight);

  const catColor = COLORS[q.category] || "#374151";
  const catBg    = COLORS[q.category + "Bg"] || "#f9fafb";

  const y = doc.y;

  // Question number
  doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.text)
    .text(`Q${q.id}.`, 50, y, { width: 35 });

  // Category badge
  doc.rect(87, y - 1, 38, 16).fill(catBg);
  doc.fillColor(catColor).fontSize(8).font("Helvetica-Bold")
    .text(q.category, 93, y + 3, { width: 32 });

  // Topic badge
  doc.rect(130, y - 1, doc.widthOfString(q.topic, { fontSize: 8 }) + 12, 16).fill("#f1f5f9");
  doc.fillColor("#475569").fontSize(8).font("Helvetica")
    .text(q.topic, 136, y + 3);

  doc.y = y + 24;

  // Question text
  doc.fillColor(COLORS.text).fontSize(11).font("Helvetica")
    .text(q.question, 50, doc.y, { width: doc.page.width - 100 });
  doc.moveDown(0.4);

  // Code block
  if (q.code) {
    const codeY = doc.y;
    const codeW = doc.page.width - 100;
    const actualCodeLines = q.code.split("\n").length;
    const blockH = actualCodeLines * 13 + 18;

    doc.rect(50, codeY, codeW, blockH).fill(COLORS.codeBg);
    doc.fillColor(COLORS.codeText).fontSize(8.5).font("Courier")
      .text(q.code, 60, codeY + 9, { width: codeW - 20, lineGap: 2 });

    doc.y = codeY + blockH + 10;
  }

  // Options
  q.options.forEach((opt, i) => {
    checkPageBreak(doc, 22);
    const isCorrect = i === q.answer;
    const optY = doc.y;

    if (isCorrect) {
      doc.rect(50, optY - 2, doc.page.width - 100, 18).fill(COLORS.correctBg);
    }

    const label = `${OPTION_LETTERS[i]}.  ${opt}`;
    doc.fillColor(isCorrect ? COLORS.correct : COLORS.text)
      .fontSize(10)
      .font(isCorrect ? "Helvetica-Bold" : "Helvetica")
      .text(label, 60, optY, { width: doc.page.width - 120 });

    if (isCorrect) {
      doc.fillColor(COLORS.correct).fontSize(9).font("Helvetica-Bold")
        .text("✓ Correct", doc.page.width - 110, optY, { width: 60 });
    }

    doc.y = optY + 18;
  });

  doc.moveDown(0.6);
  drawDivider(doc);
}

function generatePDF(outputStream) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(outputStream);

  drawHeader(doc);

  // Section legend
  const legendY = doc.y;
  [["Java", "Java Questions"], ["AI", "AI Questions"]].forEach(([cat, label], i) => {
    const lx = 50 + i * 160;
    doc.rect(lx, legendY, 10, 10).fill(COLORS[cat + "Bg"]);
    doc.rect(lx, legendY, 2, 10).fill(COLORS[cat]);
    doc.fillColor(COLORS[cat]).fontSize(9).font("Helvetica-Bold")
      .text(label, lx + 14, legendY + 1);
  });

  doc.fillColor("#16a34a").fontSize(9).font("Helvetica-Bold")
    .text("Highlighted options = correct answers", 50 + 2 * 160, legendY + 1);

  doc.y = legendY + 22;
  drawDivider(doc);

  // Java section header
  const javaQs = questions.filter(q => q.category === "Java");
  const aiQs   = questions.filter(q => q.category === "AI");

  doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.Java)
    .text(`Java Questions  (Q1–Q${javaQs.length})`, 50);
  doc.moveDown(0.3);
  drawDivider(doc);

  javaQs.forEach(q => drawQuestion(doc, q));

  // AI section header
  checkPageBreak(doc, 40);
  doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.AI)
    .text(`AI / Machine Learning Questions  (Q${javaQs.length + 1}–Q${questions.length})`, 50);
  doc.moveDown(0.3);
  drawDivider(doc);

  aiQs.forEach(q => drawQuestion(doc, q));

  // Summary answer key page
  doc.addPage();
  doc.y = 50;

  doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.title)
    .text("Quick Answer Key", 50);
  doc.moveDown(0.5);
  drawDivider(doc);

  const colW = [50, 60, 50, 320];
  const startX = 50;
  const rowH = 22;

  const hY = doc.y;
  doc.rect(startX, hY, colW.reduce((a, b) => a + b, 0), rowH).fill(COLORS.sectionBg);
  doc.fillColor(COLORS.section).fontSize(9).font("Helvetica-Bold");
  doc.text("Q#", startX + 6, hY + 7, { width: colW[0] });
  doc.text("Category", startX + colW[0] + 4, hY - 7 + 14, { width: colW[1] });
  doc.text("Answer", startX + colW[0] + colW[1] + 4, hY - 7 + 14 - 7, { width: colW[2] });
  doc.text("Correct Option", startX + colW[0] + colW[1] + colW[2] + 4, hY - 7 + 14 - 14, { width: colW[3] - 10 });
  doc.y = hY + rowH + 2;

  questions.forEach((q, i) => {
    checkPageBreak(doc, rowH + 4);
    const rY = doc.y;
    if (i % 2 === 0) {
      doc.rect(startX, rY, colW.reduce((a, b) => a + b, 0), rowH).fill("#f9fafb");
    }

    const catColor  = COLORS[q.category] || COLORS.text;
    const answerText = `${OPTION_LETTERS[q.answer]}. ${q.options[q.answer]}`;
    const summary   = answerText.length > 60 ? answerText.slice(0, 57) + "..." : answerText;

    doc.fillColor(COLORS.text).fontSize(9).font("Helvetica-Bold")
      .text(`Q${q.id}`, startX + 6, rY + 7, { width: colW[0] });
    doc.fillColor(catColor).fontSize(8).font("Helvetica-Bold")
      .text(q.category, startX + colW[0] + 4, rY - 7 + 14, { width: colW[1] });
    doc.fillColor(COLORS.correct).fontSize(9).font("Helvetica-Bold")
      .text(OPTION_LETTERS[q.answer], startX + colW[0] + colW[1] + 4, rY - 7 + 14 - 7, { width: colW[2] });
    doc.fillColor(COLORS.text).fontSize(8).font("Helvetica")
      .text(summary, startX + colW[0] + colW[1] + colW[2] + 4, rY - 7 + 14 - 14 + 7, { width: colW[3] - 10 });

    doc.y = rY + rowH;
  });

  doc.end();
}

// Allow running standalone: node generate-technical-pdf.js
if (require.main === module) {
  const filePath = path.join(OUTPUT_DIR, "Technical_Interview_QnA.pdf");
  generatePDF(fs.createWriteStream(filePath));
  console.log(`PDF saved to: ${filePath}`);
}

module.exports = { generatePDF };
