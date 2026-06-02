const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const questions = require("./data/java-mcq-questions.json");
const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title:     "#1e3a5f",
  heading:   "#1e40af",
  text:      "#1f2937",
  correct:   "#047857",
  correctBg: "#ecfdf5",
  wrong:     "#374151",
  codeBg:    "#f3f4f6",
  divider:   "#d1d5db",
  section:   "#1e40af",
  sectionBg: "#eff6ff",
  explain:   "#92400e",
  explainBg: "#fffbeb",
};

const CATEGORY_COLORS = {
  "Strings":           "#1d4ed8",
  "Core Java":         "#7c3aed",
  "OOP":               "#0f766e",
  "Collections":       "#b45309",
  "Exception Handling":"#b91c1c",
  "Java 8 Features":   "#047857",
  "Concurrency":       "#0369a1",
  "Generics":          "#7c3aed",
  "Design Patterns":   "#be185d",
};

const LETTERS = ["A", "B", "C", "D"];

function checkPageBreak(doc, needed = 60) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

function drawHeader(doc) {
  doc.rect(0, 0, doc.page.width, 110).fill(COLORS.title);

  doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold")
    .text("Java Technical MCQ — Round 2", 50, 25, { width: doc.page.width - 100 });

  doc.fontSize(11).font("Helvetica")
    .text("Answer Key  |  30 Questions  |  For 2 Years Experience  |  Duration: 45 min", 50, 60, { width: doc.page.width - 100 });

  doc.fillColor("#94a3b8").fontSize(9)
    .text("CONFIDENTIAL — Interviewer Use Only", 50, 88, { width: doc.page.width - 100 });

  doc.fillColor(COLORS.text);
  doc.y = 130;
}

function drawSectionBanner(doc, label) {
  checkPageBreak(doc, 50);
  const y = doc.y;
  doc.rect(50, y, doc.page.width - 100, 28).fill(COLORS.sectionBg);
  doc.rect(50, y, 4, 28).fill(COLORS.section);
  doc.fillColor(COLORS.section).fontSize(12).font("Helvetica-Bold")
    .text(label, 64, y + 8, { width: doc.page.width - 130 });
  doc.fillColor(COLORS.text);
  doc.y = y + 42;
}

function drawQuestion(doc, q, idx) {
  checkPageBreak(doc, 80);

  // Category badge
  const catColor = CATEGORY_COLORS[q.category] || COLORS.heading;
  const badgeWidth = 120;
  const y0 = doc.y;
  doc.roundedRect(50, y0, badgeWidth, 16, 3).fill(catColor);
  doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold")
    .text(q.category.toUpperCase(), 54, y0 + 4, { width: badgeWidth - 8 });
  doc.fillColor(COLORS.text);
  doc.y = y0 + 22;

  // Question number + text
  doc.fontSize(12).font("Helvetica-Bold")
    .text(`Q${idx + 1}. ${q.question}`, 50, doc.y, { width: doc.page.width - 100 });
  doc.y += 8;

  // Code block
  if (q.code) {
    checkPageBreak(doc, 60);
    const lines = q.code.split("\n");
    const blockH = lines.length * 13 + 16;
    const by = doc.y;
    doc.rect(50, by, doc.page.width - 100, blockH).fill(COLORS.codeBg);
    doc.rect(50, by, 3, blockH).fill("#64748b");
    doc.fillColor("#1e293b").fontSize(9).font("Courier")
      .text(q.code, 62, by + 8, { width: doc.page.width - 124, lineGap: 2 });
    doc.fillColor(COLORS.text);
    doc.y = by + blockH + 8;
  }

  // Options
  q.options.forEach((opt, i) => {
    checkPageBreak(doc, 22);
    const isCorrect = i === q.answer;
    const oy = doc.y;

    if (isCorrect) {
      doc.rect(50, oy, doc.page.width - 100, 20).fill(COLORS.correctBg);
      doc.fillColor(COLORS.correct).fontSize(10).font("Helvetica-Bold")
        .text(`  ${LETTERS[i]}.  ${opt}  ✓`, 54, oy + 5, { width: doc.page.width - 110 });
    } else {
      doc.fillColor(COLORS.wrong).fontSize(10).font("Helvetica")
        .text(`  ${LETTERS[i]}.  ${opt}`, 54, oy + 5, { width: doc.page.width - 110 });
    }
    doc.fillColor(COLORS.text);
    doc.y = oy + 22;
  });

  // Explanation box
  checkPageBreak(doc, 45);
  const ey = doc.y + 4;
  const explainText = `Explanation: ${q.explanation}`;
  const textH = doc.heightOfString(explainText, { width: doc.page.width - 124 }) + 16;
  doc.rect(50, ey, doc.page.width - 100, textH).fill(COLORS.explainBg);
  doc.rect(50, ey, 3, textH).fill(COLORS.explain);
  doc.fillColor(COLORS.explain).fontSize(9).font("Helvetica")
    .text(explainText, 62, ey + 8, { width: doc.page.width - 124 });
  doc.fillColor(COLORS.text);
  doc.y = ey + textH + 14;

  // Divider
  const dy = doc.y;
  doc.moveTo(50, dy).lineTo(doc.page.width - 50, dy)
    .strokeColor(COLORS.divider).lineWidth(0.5).stroke();
  doc.y = dy + 14;
}

function generate() {
  const doc = new PDFDocument({ size: "A4", margin: 50, autoFirstPage: true });
  const filePath = path.join(OUTPUT_DIR, "Java_Technical_MCQ_Answer_Key.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  drawHeader(doc);

  // Summary table
  const categories = [...new Set(questions.map(q => q.category))];
  drawSectionBanner(doc, "Test Overview");
  doc.fontSize(10).font("Helvetica")
    .text(`Total Questions: ${questions.length}  |  Categories: ${categories.join(", ")}`, 50, doc.y, { width: doc.page.width - 100 });
  doc.y += 6;
  doc.text("Difficulty: Intermediate (2 Years Experience)  |  Topics: Core Java, OOP, Collections, Streams, Concurrency", 50, doc.y, { width: doc.page.width - 100 });
  doc.y += 20;

  // Quick answer key grid
  drawSectionBanner(doc, "Quick Answer Reference");
  const cols = 5;
  const colW = (doc.page.width - 100) / cols;
  questions.forEach((q, i) => {
    if (i % cols === 0) checkPageBreak(doc, 22);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellX = 50 + col * colW;
    const cellY = doc.y + (col === 0 && i > 0 ? 0 : 0);
    if (col === 0 && i > 0) doc.y += 22;
    doc.fontSize(9).font("Helvetica-Bold")
      .fillColor(COLORS.heading)
      .text(`Q${i + 1}: ${LETTERS[q.answer]}`, cellX, col === 0 ? doc.y : cellY, { width: colW - 4 });
  });
  doc.y += 30;

  // All questions with answers
  drawSectionBanner(doc, "Detailed Questions & Answers");
  questions.forEach((q, i) => drawQuestion(doc, q, i));

  doc.end();
  console.log(`PDF saved → ${filePath}`);
}

generate();
