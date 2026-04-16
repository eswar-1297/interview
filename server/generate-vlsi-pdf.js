const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const vlsiQuestions = require("./data/vlsi-questions.json");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title: "#1e3a5f",
  heading: "#1e40af",
  subheading: "#374151",
  text: "#1f2937",
  answer: "#047857",
  answerBg: "#ecfdf5",
  option: "#374151",
  correct: "#047857",
  divider: "#d1d5db",
  section: "#1e40af",
  sectionBg: "#eff6ff",
  label: "#6b7280",
};

function drawHeader(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 100).fill(COLORS.title);
  doc.fillColor("#ffffff").fontSize(26).font("Helvetica-Bold")
    .text(title, 50, 30, { width: doc.page.width - 100 });
  doc.fontSize(12).font("Helvetica")
    .text(subtitle, 50, 65, { width: doc.page.width - 100 });
  doc.fillColor(COLORS.text);
  doc.y = 120;
}

function drawSectionBanner(doc, text) {
  checkPageBreak(doc, 50);
  const y = doc.y;
  doc.rect(50, y, doc.page.width - 100, 30).fill(COLORS.sectionBg);
  doc.rect(50, y, 4, 30).fill(COLORS.section);
  doc.fillColor(COLORS.section).fontSize(13).font("Helvetica-Bold")
    .text(text, 64, y + 8, { width: doc.page.width - 130 });
  doc.fillColor(COLORS.text);
  doc.y = y + 45;
}

function checkPageBreak(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
    doc.y = 50;
  }
}

function drawDivider(doc) {
  const y = doc.y;
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y)
    .strokeColor(COLORS.divider).lineWidth(0.5).stroke();
  doc.y = y + 10;
}

const letters = ["A", "B", "C", "D"];

const sections = [
  { label: "Section A: CMOS & VLSI Fundamentals (Q1, Q35, Q40)", ids: [1, 35, 40] },
  { label: "Section B: Floorplanning & Placement (Q2, Q7, Q9, Q26, Q32, Q34)", ids: [2, 7, 9, 26, 32, 34] },
  { label: "Section C: Clock Tree Synthesis (Q5, Q10, Q11, Q15)", ids: [5, 10, 11, 15] },
  { label: "Section D: Routing & Congestion (Q21, Q38)", ids: [21, 38] },
  { label: "Section E: Static Timing Analysis (Q4, Q8, Q12, Q16, Q17, Q18, Q33, Q39)", ids: [4, 8, 12, 16, 17, 18, 33, 39] },
  { label: "Section F: Physical Verification - DRC/LVS/Antenna (Q13, Q14, Q25)", ids: [13, 14, 25] },
  { label: "Section G: Power - IR Drop, EM, Power Grid (Q6, Q19, Q20, Q24, Q29, Q30)", ids: [6, 19, 20, 24, 29, 30] },
  { label: "Section H: Signal Integrity & Crosstalk (Q3, Q22, Q23)", ids: [3, 22, 23] },
  { label: "Section I: Low Power, DFT & ECO (Q31, Q36, Q37)", ids: [31, 36, 37] },
  { label: "Section J: File Formats - LEF/DEF (Q27, Q28)", ids: [27, 28] },
];

const qMap = {};
vlsiQuestions.forEach((q) => { qMap[q.id] = q; });

function generateVlsiAnswerKeyPDF() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const filePath = path.join(OUTPUT_DIR, "VLSI_Physical_Design_Answer_Key.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  drawHeader(
    doc,
    "VLSI / Physical Design - Answer Key",
    "40 MCQ Questions  |  30 Minutes  |  2 Years Experience Level"
  );

  sections.forEach((section) => {
    drawSectionBanner(doc, section.label);

    section.ids.forEach((id) => {
      const q = qMap[id];
      if (!q) return;

      checkPageBreak(doc, 130);

      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.subheading)
        .text(`Q${q.id}. ${q.question}`, 55, doc.y, {
          width: doc.page.width - 110,
        });
      doc.moveDown(0.4);

      q.options.forEach((opt, idx) => {
        const isCorrect = idx === q.answer;
        checkPageBreak(doc, 20);

        if (isCorrect) {
          const y = doc.y;
          doc.rect(70, y - 2, doc.page.width - 140, 18).fill(COLORS.answerBg);
          doc.fillColor(COLORS.correct).fontSize(10).font("Helvetica-Bold")
            .text(`  ${letters[idx]}. ${opt}  \u2713`, 75, y, {
              width: doc.page.width - 150,
            });
        } else {
          doc.fillColor(COLORS.option).fontSize(10).font("Helvetica")
            .text(`  ${letters[idx]}. ${opt}`, 75, doc.y, {
              width: doc.page.width - 150,
            });
        }
        doc.moveDown(0.15);
      });

      doc.moveDown(0.2);
      doc.fillColor(COLORS.answer).fontSize(9).font("Helvetica-Bold")
        .text(`Answer: ${letters[q.answer]}. ${q.options[q.answer]}`, 75, doc.y, {
          width: doc.page.width - 150,
        });
      doc.fillColor(COLORS.text);
      doc.moveDown(0.6);
      drawDivider(doc);
    });
  });

  // Quick-reference summary page
  doc.addPage();
  drawHeader(doc, "Quick Answer Key", "All 40 Answers at a Glance");

  doc.y = 130;

  // Table header
  const colW = 120;
  const startX = 60;
  const headerY = doc.y;
  doc.rect(startX, headerY - 4, colW * 4, 22).fill(COLORS.sectionBg);
  doc.fillColor(COLORS.section).fontSize(10).font("Helvetica-Bold");
  doc.text("Question", startX + 8, headerY, { width: colW });
  doc.text("Answer", startX + colW + 8, headerY - 16, { width: colW });
  doc.text("Question", startX + colW * 2 + 8, headerY - 32, { width: colW });
  doc.text("Answer", startX + colW * 3 + 8, headerY - 48, { width: colW });
  doc.y = headerY + 24;

  for (let row = 0; row < 20; row++) {
    checkPageBreak(doc, 20);
    const y = doc.y;

    if (row % 2 === 0) {
      doc.rect(startX, y - 2, colW * 4, 18).fill("#f9fafb");
    }

    const q1 = vlsiQuestions[row];
    const q2 = vlsiQuestions[row + 20];

    doc.fillColor(COLORS.text).fontSize(10).font("Helvetica");

    if (q1) {
      doc.text(`Q${String(q1.id).padStart(2, " ")}`, startX + 8, y, { width: colW, continued: false });
      doc.fillColor(COLORS.correct).font("Helvetica-Bold");
      doc.text(`${letters[q1.answer]}`, startX + colW + 8, y - 14, { width: colW, continued: false });
    }

    doc.fillColor(COLORS.text).font("Helvetica");
    if (q2) {
      doc.text(`Q${String(q2.id).padStart(2, " ")}`, startX + colW * 2 + 8, y - 28, { width: colW, continued: false });
      doc.fillColor(COLORS.correct).font("Helvetica-Bold");
      doc.text(`${letters[q2.answer]}`, startX + colW * 3 + 8, y - 42, { width: colW, continued: false });
    }

    doc.y = y + 18;
  }

  // Topic distribution note
  doc.moveDown(2);
  checkPageBreak(doc, 120);
  drawSectionBanner(doc, "Topic Distribution");

  const topics = [
    "CMOS & VLSI Fundamentals: 3 questions",
    "Floorplanning & Placement: 6 questions",
    "Clock Tree Synthesis (CTS): 4 questions",
    "Routing & Congestion: 2 questions",
    "Static Timing Analysis (STA): 8 questions",
    "Physical Verification (DRC/LVS/Antenna): 3 questions",
    "Power (IR Drop, EM, Power Grid): 6 questions",
    "Signal Integrity & Crosstalk: 3 questions",
    "Low Power, DFT & ECO: 3 questions",
    "File Formats (LEF/DEF): 2 questions",
  ];

  topics.forEach((t) => {
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
      .text(`  \u2022  ${t}`, 60, doc.y, { width: doc.page.width - 120 });
    doc.moveDown(0.3);
  });

  doc.end();
  console.log(`\nCreated: ${filePath}`);
}

generateVlsiAnswerKeyPDF();
console.log("Done! VLSI Answer Key PDF saved in the 'answer-keys' folder.");
