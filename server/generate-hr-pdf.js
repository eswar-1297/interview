const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const questions = require("./data/hr-questions.json");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title:      "#1e3a5f",
  text:       "#1f2937",
  divider:    "#e5e7eb",
  section:    "#1e40af",
  sectionBg:  "#eff6ff",
  HR:         "#1d4ed8",
  HRBg:       "#eff6ff",
  Technical:  "#6d28d9",
  TechnicalBg:"#f5f3ff",
  Project:    "#b45309",
  ProjectBg:  "#fffbeb",
  Study:      "#047857",
  StudyBg:    "#ecfdf5",
};

function drawHeader(doc) {
  doc.rect(0, 0, doc.page.width, 110).fill(COLORS.title);
  doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold")
    .text("HR Interview — Question List", 50, 28, { width: doc.page.width - 100 });
  doc.fontSize(11).font("Helvetica").fillColor("#93c5fd")
    .text("Java / Python Developer  |  Fresher  |  10 Questions  |  2 min per question", 50, 62);
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
  checkPageBreak(doc, 90);

  const bgColor  = COLORS[q.category + "Bg"] || "#f9fafb";
  const tagColor = COLORS[q.category]        || "#374151";

  // Question number + category tag on same line
  const y = doc.y;
  doc.fontSize(13).font("Helvetica-Bold").fillColor(COLORS.text)
    .text(`Q${q.id}.`, 50, y, { continued: false, width: 30 });

  // Category badge
  const tagX = 82;
  const tagW = 72;
  doc.rect(tagX, y - 1, tagW, 16).fill(bgColor);
  doc.fillColor(tagColor).fontSize(8).font("Helvetica-Bold")
    .text(q.category.toUpperCase(), tagX + 6, y + 3, { width: tagW - 12 });

  doc.y = y + 22;

  // Question text box
  const qY = doc.y;
  const qText = q.question;
  const textH = doc.heightOfString(qText, { width: doc.page.width - 120, fontSize: 11 }) + 20;

  doc.rect(50, qY, doc.page.width - 100, textH).fill("#f9fafb");
  doc.rect(50, qY, 3, textH).fill(tagColor);
  doc.fillColor(COLORS.text).fontSize(11).font("Helvetica")
    .text(qText, 62, qY + 10, { width: doc.page.width - 120 });

  doc.y = qY + textH + 14;
  drawDivider(doc);
}

function generate() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const filePath = path.join(OUTPUT_DIR, "HR_Interview_Questions.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  drawHeader(doc);

  // Legend
  const legendY = doc.y;
  const categories = ["HR", "Technical", "Project", "Study"];
  let lx = 50;
  categories.forEach(cat => {
    doc.rect(lx, legendY, 10, 10).fill(COLORS[cat + "Bg"]);
    doc.rect(lx, legendY, 2, 10).fill(COLORS[cat]);
    doc.fillColor(COLORS[cat]).fontSize(9).font("Helvetica-Bold")
      .text(cat, lx + 14, legendY + 1, { continued: false });
    lx += 80;
  });
  doc.y = legendY + 22;
  drawDivider(doc);

  // Questions
  questions.forEach(q => drawQuestion(doc, q));

  // Summary table at the end
  doc.addPage();
  doc.y = 50;

  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.title)
    .text("Quick Reference", 50, doc.y);
  doc.moveDown(0.6);
  drawDivider(doc);

  const colW = [40, 80, 340];
  const startX = 50;
  const rowH = 28;

  // Table header
  const hY = doc.y;
  doc.rect(startX, hY, colW[0] + colW[1] + colW[2], rowH).fill(COLORS.sectionBg);
  doc.fillColor(COLORS.section).fontSize(9).font("Helvetica-Bold");
  doc.text("No.", startX + 6, hY + 9, { width: colW[0] });
  doc.text("Category", startX + colW[0] + 6, hY - 9, { width: colW[1] });
  doc.text("Question (summary)", startX + colW[0] + colW[1] + 6, hY - 27, { width: colW[2] - 10 });
  doc.y = hY + rowH + 4;

  questions.forEach((q, i) => {
    checkPageBreak(doc, rowH + 6);
    const rY = doc.y;
    if (i % 2 === 0) {
      doc.rect(startX, rY, colW[0] + colW[1] + colW[2], rowH).fill("#f9fafb");
    }

    const tagColor = COLORS[q.category] || COLORS.text;
    const summary  = q.question.length > 80 ? q.question.slice(0, 77) + "..." : q.question;

    doc.fillColor(COLORS.text).fontSize(10).font("Helvetica-Bold")
      .text(`Q${q.id}`, startX + 6, rY + 9, { width: colW[0] });
    doc.fillColor(tagColor).fontSize(9).font("Helvetica-Bold")
      .text(q.category, startX + colW[0] + 6, rY - 9 + 18, { width: colW[1] });
    doc.fillColor(COLORS.text).fontSize(9).font("Helvetica")
      .text(summary, startX + colW[0] + colW[1] + 6, rY - 27 + 18 + 9, { width: colW[2] - 10 });

    doc.y = rY + rowH + 2;
  });

  doc.end();
  console.log(`\nCreated: ${filePath}`);
}

generate();
console.log("Done! HR Questions PDF saved in the 'answer-keys' folder.");
