/**
 * AI Expense Tracker — Hackathon Q&A Answer Key PDF Generator
 * Run: node generate-ai-expense-hackathon-pdf.js
 */
const PDFDocument = require("pdfkit");
const fs   = require("fs");
const path = require("path");

const OUTPUT = path.join(__dirname, "..", "answer-keys", "Hackathon_AI_Expense_Tracker_Answer_Key.pdf");

const C = {
  navy:   "#1a2e4a",
  blue:   "#2563eb",
  orange: "#ea580c",
  green:  "#16a34a",
  red:    "#dc2626",
  purple: "#7c3aed",
  gray:   "#6b7280",
  light:  "#f1f5f9",
  border: "#e2e8f0",
  text:   "#1e293b",
};

const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
doc.pipe(fs.createWriteStream(OUTPUT));

const LEFT = 50;
const W = doc.page.width - 100;

function space(h = 10) { doc.moveDown(0); doc.y += h; }

function ensure(h) {
  if (doc.y + h > doc.page.height - 60) doc.addPage();
}

function sectionTitle(txt, color = C.navy) {
  ensure(40);
  space(6);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(color).text(txt, LEFT, doc.y);
  doc.moveTo(LEFT, doc.y + 2).lineTo(LEFT + W, doc.y + 2).strokeColor(C.border).lineWidth(1).stroke();
  space(8);
}

function para(txt, opts = {}) {
  ensure(30);
  doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica")
     .fontSize(opts.size || 10)
     .fillColor(opts.color || C.text)
     .text(txt, LEFT, doc.y, { width: W, align: "left", lineGap: 2 });
  space(opts.gap ?? 6);
}

function bullet(txt, color = C.text) {
  ensure(24);
  doc.font("Helvetica").fontSize(10).fillColor(color)
     .text("•  " + txt, LEFT + 12, doc.y, { width: W - 12, lineGap: 2 });
  space(4);
}

function code(lines) {
  const h = lines.length * 12 + 12;
  ensure(h + 8);
  doc.save().rect(LEFT, doc.y, W, h).fill(C.light).restore();
  doc.font("Courier").fontSize(8.5).fillColor(C.navy)
     .text(lines.join("\n"), LEFT + 8, doc.y + 6, { width: W - 16, lineGap: 1.5 });
  doc.y += h + 6;
  space(6);
}

function badge(txt, bg, fg = "#ffffff") {
  doc.font("Helvetica-Bold").fontSize(8);
  const tw = doc.widthOfString(txt);
  const x = LEFT, y = doc.y;
  doc.save().roundedRect(x, y - 1, tw + 12, 15, 3).fill(bg).restore();
  doc.fillColor(fg).text(txt, x + 6, y + 2, { lineBreak: false });
  space(20);
}

// ─── Cover ──────────────────────────────────────────────────────────────────
doc.save().rect(0, 0, doc.page.width, 150).fill(C.navy).restore();
doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff")
   .text("AI Expense Tracker", LEFT, 45, { width: W });
doc.font("Helvetica-Bold").fontSize(14).fillColor("#93c5fd")
   .text("Fourth Round Hackathon — Q&A Answer Key", LEFT, 78, { width: W });
doc.font("Helvetica").fontSize(10).fillColor("#cbd5e1")
   .text("React frontend  •  Python (FastAPI) backend  •  AI layer (auto-categorize + insights)", LEFT, 105, { width: W });
doc.font("Helvetica").fontSize(9).fillColor("#94a3b8")
   .text("For interviewer / evaluator use only", LEFT, 124, { width: W });

doc.y = 175;

// ─── Project brief ───────────────────────────────────────────────────────────
sectionTitle("Project Brief");
para("Candidates build a full-stack AI-powered Expense Tracker in 2 hours 30 minutes, then " +
     "record video answers to 5 technical questions. Below is the expected scope followed by " +
     "model answers and what to look for in each response.");

sectionTitle("Required Tech Stack");
bullet("Frontend: React.js (functional components + hooks).");
bullet("Backend: Python — FastAPI, with Pydantic schemas and a SQLAlchemy data layer.");
bullet("Database: SQLite (fastest) or PostgreSQL.");
bullet("AI layer: a scikit-learn classifier OR an LLM API call — either is acceptable.");

sectionTitle("Required Features");
bullet("CRUD: Add, View, Edit, Delete expenses (amount, category, description, date).");
bullet("Filter by category and/or date range.");
bullet("Dashboard summary: total spent + per-category breakdown.");
bullet("AI auto-categorize: POST /api/ai/categorize predicts a category from the description.");
bullet("AI insights: GET /api/ai/insights returns a natural-language spending summary + one tip.");

sectionTitle("Expected REST Endpoints");
code([
  "GET    /api/expenses            list (optional ?category= filter)",
  "POST   /api/expenses            create",
  "PUT    /api/expenses/{id}       update",
  "DELETE /api/expenses/{id}       delete",
  "GET    /api/expenses/summary    total + per-category totals",
  "POST   /api/ai/categorize       {description} -> {category, confidence}",
  "GET    /api/ai/insights         -> {summary, tip}",
]);

// ─── Q&A ─────────────────────────────────────────────────────────────────────
const QA = [
  {
    topic: "System Architecture", diff: "Medium", bg: C.blue,
    q: "1. Walk us through your AI Expense Tracker architecture. How does data flow from the React frontend to the FastAPI backend and back?",
    points: [
      "React component triggers an action (form submit / page load).",
      "A fetch/axios call hits a FastAPI route (e.g. POST /api/expenses).",
      "FastAPI validates the body with a Pydantic schema, then a service/CRUD function uses a SQLAlchemy Session to read/write SQLite.",
      "The ORM object is serialized back through a Pydantic response model to JSON.",
      "React updates state (useState) and re-renders the list / dashboard.",
    ],
    look: "Candidate clearly names each layer and where validation and the DB session live. Strong answers mention CORS config for the dev server and separation of routers vs. business logic.",
  },
  {
    topic: "Python & FastAPI", diff: "Medium", bg: C.orange,
    q: "2. Explain your FastAPI endpoints. How did you structure routers, Pydantic schemas, and the data-access layer, and why?",
    points: [
      "APIRouter groups routes (expenses router, ai router) included from main.py.",
      "Pydantic models: ExpenseIn (request) and ExpenseOut (response, from_attributes=True).",
      "SQLAlchemy model Expense + a get_db() dependency that yields/closes a Session.",
      "CRUD done via db.query / db.get / db.add / db.commit; 404 raised with HTTPException.",
      "Separation keeps routes thin and testable; schemas give automatic validation + docs.",
    ],
    look: "Look for correct dependency injection (Depends(get_db)), proper status codes (201 create, 204 delete), and understanding of why Pydantic is used instead of raw dicts.",
  },
  {
    topic: "React Frontend", diff: "Medium", bg: C.blue,
    q: "3. How did you manage state and API communication in React? Walk through your components and loading/error handling.",
    points: [
      "useState for expenses/form; useEffect to load on mount.",
      "A small api.js helper wraps fetch and centralizes the base URL and error checks.",
      "Component hierarchy: App -> ExpenseForm, ExpenseList, Insights/Dashboard.",
      "Loading and error flags drive conditional rendering (spinner / message).",
      "After create/update/delete, the list is re-fetched (or optimistically updated).",
    ],
    look: "Candidate handles the failure path (backend down / non-200), not just the happy path. Bonus: debouncing the AI category suggestion, controlled form inputs.",
  },
  {
    topic: "AI Feature", diff: "Hard", bg: C.purple,
    q: "4. Explain the AI feature end to end. What model or API did you use, what is the input, and what is the output?",
    points: [
      "Auto-categorize: description text in -> predicted category (+ confidence) out.",
      "scikit-learn path: TfidfVectorizer + MultinomialNB trained on labelled descriptions; model.predict on the incoming text.",
      "LLM path: prompt the model with the description and the allowed category list, parse the returned category.",
      "Insights: aggregate expenses by category, then generate a natural-language summary + one saving tip (rule-based, or LLM-summarized).",
      "React consumes it: on description blur, call /api/ai/categorize and pre-fill the category dropdown.",
    ],
    look: "The AI must actually run and change behavior — not a hardcoded string. Candidate should explain training data / prompt, and a fallback (default to 'Other') when confidence is low or the API fails.",
  },
  {
    topic: "Security & Authentication", diff: "Hard", bg: C.red,
    q: "5. How would you add JWT authentication to this app? What changes in FastAPI and in React?",
    points: [
      "FastAPI: a /auth/login endpoint that verifies credentials and returns a signed JWT (python-jose).",
      "Hash passwords (passlib/bcrypt); store users in the DB.",
      "OAuth2PasswordBearer + a get_current_user dependency that decodes the token and is added to protected routes.",
      "Scope expenses to the authenticated user (user_id foreign key).",
      "React: store the token (localStorage), send Authorization: Bearer <token> on every request, redirect to login on 401.",
    ],
    look: "Understands the token lifecycle end to end and that authorization (per-user data) matters, not just authentication. Bonus: token expiry/refresh, not trusting the client.",
  },
];

doc.addPage();
sectionTitle("Video Q&A — Model Answers");

QA.forEach((item) => {
  ensure(120);
  badge(`${item.topic}  •  ${item.diff}`, item.bg);
  para(item.q, { bold: true, size: 10.5, gap: 6 });
  para("Model answer — key points:", { bold: true, size: 9.5, color: C.gray, gap: 4 });
  item.points.forEach((p) => bullet(p));
  para("What to look for: " + item.look, { size: 9.5, color: C.green, gap: 12 });
});

// ─── Footer page numbers ──────────────────────────────────────────────────────
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  doc.font("Helvetica").fontSize(8).fillColor(C.gray)
     .text(`AI Expense Tracker — Hackathon Answer Key   |   Page ${i + 1} of ${range.count}`,
           LEFT, doc.page.height - 40, { width: W, align: "center" });
}

doc.end();
console.log("Generated:", OUTPUT);
