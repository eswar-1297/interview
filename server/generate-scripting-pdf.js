const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const scriptingQuestions = require("./data/scripting-questions.json");

const OUTPUT_DIR = path.join(__dirname, "..", "answer-keys");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const COLORS = {
  title: "#1e3a5f",
  heading: "#1e40af",
  subheading: "#374151",
  text: "#1f2937",
  answer: "#047857",
  answerBg: "#ecfdf5",
  divider: "#d1d5db",
  section: "#1e40af",
  sectionBg: "#eff6ff",
  codeBg: "#f3f4f6",
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

function drawCodeBlock(doc, code) {
  const lines = code.split("\n");
  const lineH = 13;
  const blockH = lines.length * lineH + 12;
  checkPageBreak(doc, blockH);
  const y = doc.y;
  doc.rect(55, y - 2, doc.page.width - 110, blockH).fill(COLORS.codeBg);
  doc.fillColor(COLORS.text).fontSize(9).font("Courier");
  lines.forEach((line, i) => {
    doc.text(line, 65, y + 4 + i * lineH, { width: doc.page.width - 130 });
  });
  doc.y = y + blockH + 6;
}

const solutions = [
  {
    id: 1,
    approach:
      "Split each string on ':' to get the path name and slack value. Convert slack to float. Track the minimum (most negative) slack seen so far and its corresponding path name. If no negative slack exists, return \"None\".",
    python: `def find_wns_path(paths):
    worst_name = None
    worst_slack = float('inf')
    for entry in paths:
        name, slack_str = entry.rsplit(':', 1)
        slack = float(slack_str)
        if slack < 0 and slack < worst_slack:
            worst_slack = slack
            worst_name = name
    return worst_name if worst_name else "None"

# Test
paths = ["path_a:-0.52", "path_b:0.31", "path_c:-1.23", "path_d:-0.07"]
print(find_wns_path(paths))   # path_c`,
  },
  {
    id: 2,
    approach:
      "Split each string by whitespace to extract the cell type (second token). Use a dictionary to count occurrences. Finally, sort by count in descending order using sorted() with a reverse key and rebuild a dict (Python 3.7+ preserves insertion order).",
    python: `def count_instances(components):
    counts = {}
    for comp in components:
        _, cell = comp.split()
        counts[cell] = counts.get(cell, 0) + 1
    return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))

# Test
components = ["U1 AND2", "U2 OR2", "U3 AND2", "U4 INV", "U5 AND2", "U6 OR2"]
print(count_instances(components))   # {'AND2': 3, 'OR2': 2, 'INV': 1}`,
  },
  {
    id: 3,
    approach:
      "Iterate over the nets dictionary. For each net, compute fanout as len(sinks). If fanout > threshold, add (net_name, fanout) to the result list. Sort the result by fanout descending using sorted() with reverse=True.",
    python: `def find_high_fanout_nets(nets, threshold):
    result = [
        (name, len(sinks))
        for name, sinks in nets.items()
        if len(sinks) > threshold
    ]
    return sorted(result, key=lambda x: x[1], reverse=True)

# Test
nets = {
    "clk": ["FF1/CK", "FF2/CK", "FF3/CK", "FF4/CK", "FF5/CK"],
    "reset": ["FF1/R", "FF2/R"],
    "data": ["FF6/D"]
}
threshold = 3
print(find_high_fanout_nets(nets, threshold))   # [('clk', 5)]`,
  },
  {
    id: 4,
    approach:
      "Iterate over each (source, destination) path tuple. Look up both flip-flops in the domains dictionary. If their clock domains differ, include the pair in the output. Preserve the original order — no sorting needed.",
    python: `def detect_cdc(paths, domains):
    return [
        (src, dst)
        for src, dst in paths
        if domains[src] != domains[dst]
    ]

# Test
paths = [("FF_A", "FF_B"), ("FF_B", "FF_C"), ("FF_C", "FF_D")]
domains = {"FF_A": "clk1", "FF_B": "clk1", "FF_C": "clk2", "FF_D": "clk2"}
print(detect_cdc(paths, domains))   # [('FF_B', 'FF_C')]`,
  },
];

function generateScriptingPDF() {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const filePath = path.join(OUTPUT_DIR, "Scripting_Round_Answer_Key.pdf");
  doc.pipe(fs.createWriteStream(filePath));

  drawHeader(
    doc,
    "Python Scripting Round — Answer Key",
    "4 Problems  |  Physical Design Automation  |  45 Minutes  |  Round 3"
  );

  solutions.forEach((sol, idx) => {
    const q = scriptingQuestions[idx];
    if (!q) return;

    if (idx > 0) {
      doc.addPage();
      doc.y = 50;
    }

    // Problem title
    doc.fontSize(17).font("Helvetica-Bold").fillColor(COLORS.heading)
      .text(`Problem ${sol.id}: ${q.title}`, 50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.5);

    // Description
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
      .text(q.description, 50, doc.y, { width: doc.page.width - 100 });
    doc.moveDown(0.7);

    // Sample I/O
    checkPageBreak(doc, 60);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.label).text("SAMPLE INPUT:", 55, doc.y);
    doc.moveDown(0.2);
    drawCodeBlock(doc, q.sampleInput);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.label).text("SAMPLE OUTPUT:", 55, doc.y);
    doc.moveDown(0.2);
    drawCodeBlock(doc, q.sampleOutput);

    if (q.constraints) {
      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.label).text("CONSTRAINTS:", 55, doc.y);
      doc.moveDown(0.2);
      doc.fontSize(9).font("Helvetica").fillColor(COLORS.text)
        .text(q.constraints, 65, doc.y, { width: doc.page.width - 130 });
      doc.moveDown(0.7);
    }

    drawDivider(doc);

    // Approach
    checkPageBreak(doc, 60);
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.answer).text("Approach:", 50, doc.y);
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.text)
      .text(sol.approach, 55, doc.y, { width: doc.page.width - 110 });
    doc.moveDown(0.8);

    // Python Solution
    drawSectionBanner(doc, "Python Solution");
    drawCodeBlock(doc, sol.python);
  });

  doc.end();
  console.log(`\nCreated: ${filePath}`);
}

generateScriptingPDF();
console.log("Done! Scripting Answer Key PDF saved in the 'answer-keys' folder.");
