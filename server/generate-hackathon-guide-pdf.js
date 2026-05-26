/**
 * Hackathon Guide & Q&A Answer Key PDF Generator
 * Run: node generate-hackathon-guide-pdf.js
 */
const PDFDocument = require("pdfkit");
const fs          = require("fs");
const path        = require("path");

const OUTPUT = path.join(__dirname, "..", "Hackathon_Guide_and_QA_Answer_Key.pdf");

const C = {
  navy:    "#1a2e4a",
  blue:    "#2563eb",
  orange:  "#ea580c",
  green:   "#16a34a",
  red:     "#dc2626",
  purple:  "#7c3aed",
  gray:    "#6b7280",
  lgray:   "#9ca3af",
  xlight:  "#f8fafc",
  light:   "#f1f5f9",
  border:  "#e2e8f0",
  white:   "#ffffff",
  text:    "#1e293b",
};

const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
doc.pipe(fs.createWriteStream(OUTPUT));

// ─── helpers ──────────────────────────────────────────────────────────────
const W    = doc.page.width  - 100;   // usable width (margins 50 each side)
const MID  = doc.page.width  / 2;

function newPage() { doc.addPage(); }

function colorRect(x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore();
}

function badge(text, x, y, bg, fg) {
  const pad = 6, fSize = 8;
  doc.font("Helvetica-Bold").fontSize(fSize);
  const tw  = doc.widthOfString(text);
  colorRect(x, y - 1, tw + pad * 2, fSize + 6, bg);
  doc.fillColor(fg).text(text, x + pad, y, { lineBreak: false });
}

function hr(y, color = C.border) {
  doc.moveTo(50, y).lineTo(50 + W, y).strokeColor(color).lineWidth(1).stroke();
}

function sectionBox(title, y, color) {
  colorRect(50, y, W, 26, color);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.white)
     .text(title, 60, y + 7, { width: W - 20 });
  return y + 36;
}

function bullet(text, x, startY, indent = 0) {
  const bx = x + indent;
  doc.circle(bx + 4, startY + 5, 2).fill(C.lgray);
  doc.font("Helvetica").fontSize(9).fillColor(C.text)
     .text(text, bx + 12, startY, { width: W - (bx - 50) - 12 });
  return doc.y + 2;
}

function kv(key, val, y) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.gray).text(key, 50, y, { continued: true });
  doc.font("Helvetica").fillColor(C.text).text("  " + val);
  return doc.y + 3;
}

// ══════════════════════════════════════════════════════════════════════════
//  PAGE 1 — COVER
// ══════════════════════════════════════════════════════════════════════════
colorRect(0, 0, doc.page.width, doc.page.height, C.navy);

// top stripe
colorRect(0, 0, doc.page.width, 8, C.blue);

// main title block
doc.font("Helvetica-Bold").fontSize(28).fillColor(C.white)
   .text("Full Stack Hackathon", 50, 160, { align: "center", width: W });

doc.font("Helvetica").fontSize(14).fillColor("#94a3b8")
   .text("Expense Tracker — Final Round", 50, 200, { align: "center", width: W });

// divider line
doc.moveTo(MID - 60, 230).lineTo(MID + 60, 230).strokeColor(C.blue).lineWidth(2).stroke();

// subtitle
doc.font("Helvetica-Bold").fontSize(11).fillColor("#cbd5e1")
   .text("Interviewer Guide  ·  Process Documentation  ·  Q&A Answer Key", 50, 245, { align: "center", width: W });

// info cards
const cards = [
  ["Project",  "Expense Tracker"],
  ["Stack",    "React + Java Spring Boot"],
  ["Build",    "2 Hours 30 Minutes"],
  ["Q&A",      "5 Questions · 2–3 min each"],
  ["Password", "Neutara@2026"],
  ["Admin",    "Admin@Neutara2026"],
];
let cx = 50, cy = 320;
cards.forEach((c, i) => {
  colorRect(cx, cy, 150, 54, "#243147");
  doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(c[0].toUpperCase(), cx + 10, cy + 8);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white).text(c[1], cx + 10, cy + 22, { width: 130 });
  cx += 160;
  if (i === 2) { cx = 50; cy += 66; }
});

// footer
doc.font("Helvetica").fontSize(8).fillColor("#475569")
   .text("CONFIDENTIAL — FOR INTERVIEWER USE ONLY", 50, doc.page.height - 40, { align: "center", width: W });

// ══════════════════════════════════════════════════════════════════════════
//  PAGE 2 — PROCESS OVERVIEW
// ══════════════════════════════════════════════════════════════════════════
newPage();

doc.font("Helvetica-Bold").fontSize(18).fillColor(C.navy).text("Hackathon Process Overview", 50, 50);
hr(75);

// steps
const steps = [
  { num: "1", title: "Candidate Logs In", time: "< 2 min",
    color: C.blue,
    points: [
      "URL: http://yourserver:5000",
      "Enter any valid email address",
      "Password: Neutara@2026",
      "Lands directly on the Build Phase screen",
    ]},
  { num: "2", title: "Build Phase — Expense Tracker", time: "2 hrs 30 min",
    color: C.orange,
    points: [
      "Candidate sees full project spec: features, API endpoints, stack",
      "They build on their own machine (Spring Boot + React)",
      "Live countdown timer shown — camera is ON throughout",
      "Three tabs available: Features / API Endpoints / Tips & Evaluation",
      "Timer turns amber at 30 min remaining, red at 15 min",
    ]},
  { num: "3", title: "Code Submission (Required)", time: "5 min",
    color: C.green,
    points: [
      "Candidate zips their project (must exclude target/ and node_modules/)",
      "Uploads the .zip file directly in the app (max 100 MB)",
      "Cannot proceed to Q&A until upload is confirmed",
      "File saved to: server/uploads/hackathon-code/",
      "You can download from admin panel at any time",
    ]},
  { num: "4", title: "Video Q&A — 5 Questions", time: "~25 min",
    color: C.purple,
    points: [
      "Camera + microphone required — live video recording",
      "Each question displayed with topic badge and difficulty",
      "Up to 3 minutes per question (auto-stops at limit)",
      "Candidate can re-record before saving and moving on",
      "Must record a response before clicking Next",
    ]},
  { num: "5", title: "Submission & Results", time: "< 1 min",
    color: C.red,
    points: [
      "Candidate submits after recording all 5 answers",
      'Thank-you screen: "We will get back to you shortly"',
      "Interviewer reviews code via admin panel",
      "Admin URL: http://yourserver:5000/admin",
    ]},
];

let y = 90;
steps.forEach(s => {
  if (y > 680) { newPage(); y = 50; }
  colorRect(50, y, W, 26, s.color);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white)
     .text(`Phase ${s.num}  —  ${s.title}`, 60, y + 7, { continued: true, width: W - 100 });
  doc.font("Helvetica").fontSize(9).fillColor("rgba(255,255,255,0.7)")
     .text(`  [${s.time}]`, { lineBreak: false });
  y += 32;
  s.points.forEach(p => { y = bullet(p, 50, y); });
  y += 10;
});

// ══════════════════════════════════════════════════════════════════════════
//  PAGE 3 — PROJECT SPECIFICATION
// ══════════════════════════════════════════════════════════════════════════
newPage();

doc.font("Helvetica-Bold").fontSize(18).fillColor(C.navy).text("Project Specification", 50, 50);
doc.font("Helvetica").fontSize(10).fillColor(C.gray).text("Shown to candidate during build phase", 50, 72);
hr(88);

y = 100;
y = sectionBox("Tech Stack (Required)", y, C.navy);
const stack = [
  ["Frontend",   "React.js — functional components, hooks (useState, useEffect)"],
  ["Backend",    "Java — Spring Boot (REST API with Spring MVC)"],
  ["Database",   "H2 In-Memory  /  MySQL  /  PostgreSQL  (candidate's choice)"],
  ["Build Tool", "Maven or Gradle"],
];
stack.forEach(([k, v]) => { y = kv(k + ":", v, y); });
y += 10;

y = sectionBox("Features to Build", y, C.blue);
const features = [
  ["1", "Add Expense",       "Form: Amount, Category (Food/Travel/Shopping/Bills/Other), Description, Date"],
  ["2", "View Expenses",     "Table or list with category colour tags; total displayed at the bottom"],
  ["3", "Edit & Delete",     "Update expense via modal/inline form; delete with confirmation dialog"],
  ["4", "Filter Expenses",   "Filter by category and/or date range; results update dynamically"],
  ["5", "Dashboard Summary", "Total spent + category breakdown (text required; chart is bonus)"],
];
features.forEach(([n, t, d]) => {
  if (y > 700) { newPage(); y = 50; }
  doc.circle(62, y + 5, 8).fill(C.blue);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white).text(n, 59, y + 1, { lineBreak: false });
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.text).text("  " + t, 76, y, { continued: true });
  doc.font("Helvetica").fillColor(C.gray).text(" — " + d, { width: W - 30 });
  y = doc.y + 5;
});
y += 6;

y = sectionBox("Required REST API Endpoints", y, C.orange);
const endpoints = [
  ["GET",    "/api/expenses",         "Fetch all expenses (returns JSON array)"],
  ["POST",   "/api/expenses",         "Create a new expense (@RequestBody Expense)"],
  ["PUT",    "/api/expenses/{id}",    "Update an existing expense by ID"],
  ["DELETE", "/api/expenses/{id}",    "Delete an expense by ID"],
  ["GET",    "/api/expenses/summary", "Return category-wise total amounts"],
];
const methodColor = { GET: C.green, POST: C.blue, PUT: C.orange, DELETE: C.red };
endpoints.forEach(([m, p, d]) => {
  if (y > 730) { newPage(); y = 50; }
  badge(m, 50, y, methodColor[m], C.white);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.text).text(p, 110, y, { continued: true });
  doc.font("Helvetica").fillColor(C.gray).text("   " + d);
  y = doc.y + 5;
});
y += 6;

y = sectionBox("Evaluation Criteria", y, C.green);
const criteria = [
  ["Core",  "Working CRUD operations via REST API"],
  ["Core",  "Spring Boot layering: Controller → Service → Repository (@Entity, JPA)"],
  ["Core",  "React component structure and state management"],
  ["Core",  "Code readability, naming conventions, organisation"],
  ["Bonus", "Input validation (Bean Validation / React form validation)"],
  ["Bonus", "Error handling (try/catch, HTTP status codes, UI feedback)"],
  ["Bonus", "Responsive UI, category charts (Recharts / Chart.js)"],
];
criteria.forEach(([tag, text]) => {
  if (y > 740) { newPage(); y = 50; }
  const bg = tag === "Bonus" ? "#fef3c7" : "#dcfce7";
  const fg = tag === "Bonus" ? C.orange   : C.green;
  badge(tag, 50, y, bg, fg);
  doc.font("Helvetica").fontSize(9).fillColor(C.text).text(text, 110, y);
  y = doc.y + 4;
});

// ══════════════════════════════════════════════════════════════════════════
//  PAGES 4-8 — THE 5 Q&A QUESTIONS WITH EXPECTED ANSWERS
// ══════════════════════════════════════════════════════════════════════════
const questions = [
  {
    num: 1, topic: "System Architecture", difficulty: "Medium", color: C.blue,
    question: "Walk us through your Expense Tracker project architecture. How does data flow from your React frontend all the way to your Java Spring Boot backend and back?",
    hint: "Cover: React component → API call → Spring Controller → Service → Repository → DB → response back to UI",
    expectedAnswer: [
      "FRONTEND SIDE",
      "• React component uses useState to store expenses array and loading/error state",
      "• useEffect triggers a fetch/axios GET call to /api/expenses on mount",
      "• HTTP request hits Spring Boot server (typically http://localhost:8080)",
      "• CORS must be configured: @CrossOrigin on controller or WebMvcConfigurer bean",
      "",
      "BACKEND SIDE (Spring MVC flow)",
      "• @RestController receives the HTTP request and routes it via @GetMapping",
      "• Controller delegates to @Service layer — no business logic in controller",
      "• Service calls @Repository (interface extending JpaRepository<Expense, Long>)",
      "• JPA/Hibernate translates the repository call to a SQL query on H2/MySQL",
      "• DB returns rows → Hibernate maps to List<Expense> Java objects",
      "",
      "RESPONSE FLOW",
      "• Service returns list to Controller → Jackson serialises to JSON automatically",
      "• JSON response received by fetch/axios in React",
      "• React setState updates the expenses array → component re-renders with new data",
      "",
      "WHAT TO LISTEN FOR",
      "✓ Mentions @RestController, @Service, @Repository annotations",
      "✓ Understands separation of concerns across layers",
      "✓ Knows CORS needs configuration for cross-origin calls",
      "✓ Understands Jackson auto-serialises Java objects to JSON",
      "✗ Red flag: Says logic lives directly in controller or doesn't mention layers",
    ],
  },
  {
    num: 2, topic: "Java Spring Boot & API Design", difficulty: "Medium", color: C.orange,
    question: "Explain the REST API endpoints you created in your Spring Boot backend. How did you structure your Controller, Service, and Repository layers, and why?",
    hint: "Cover: @RestController, @Service, @Repository, JPA/Hibernate, the 5 endpoints",
    expectedAnswer: [
      "ENTITY (Model Layer)",
      "• @Entity class Expense with: @Id @GeneratedValue Long id, String category,",
      "  Double amount, String description, LocalDate date",
      "• @Table(name='expenses') optional for custom naming",
      "",
      "REPOSITORY",
      "• interface ExpenseRepository extends JpaRepository<Expense, Long>",
      "• Gets CRUD for free: findAll(), save(), findById(), deleteById()",
      "• Custom: List<Expense> findByCategory(String cat) — Spring auto-implements",
      "",
      "SERVICE (@Service)",
      "• Injects repository via constructor injection (preferred) or @Autowired",
      "• Methods: getAllExpenses(), createExpense(), updateExpense(), deleteExpense()",
      "• getSummary(): groups by category and sums amounts",
      "• Business rules live here (e.g. amount must be positive)",
      "",
      "CONTROLLER (@RestController)",
      "• @RequestMapping('/api/expenses') on class",
      "• GET     /api/expenses        → @GetMapping    → getAllExpenses()",
      "• POST    /api/expenses        → @PostMapping   → createExpense(@RequestBody)",
      "• PUT     /api/expenses/{id}   → @PutMapping    → updateExpense(@PathVariable, @RequestBody)",
      "• DELETE  /api/expenses/{id}   → @DeleteMapping → deleteExpense(@PathVariable)",
      "• GET     /api/expenses/summary → @GetMapping   → getSummary()",
      "• Returns ResponseEntity<> for proper HTTP status codes (200, 201, 404)",
      "",
      "APPLICATION.PROPERTIES (H2 example)",
      "• spring.datasource.url=jdbc:h2:mem:expensedb",
      "• spring.h2.console.enabled=true",
      "• spring.jpa.hibernate.ddl-auto=create-drop",
      "",
      "WHAT TO LISTEN FOR",
      "✓ Correct annotation usage (@RestController, not @Controller)",
      "✓ Constructor injection preferred over field injection",
      "✓ Returns ResponseEntity with appropriate status codes",
      "✓ Knows JpaRepository eliminates boilerplate SQL",
      "✗ Red flag: All logic in controller, no service layer",
    ],
  },
  {
    num: 3, topic: "React Frontend", difficulty: "Medium", color: C.purple,
    question: "How did you manage state and handle API communication in your React frontend? Walk us through your component structure and how you handled loading and error states.",
    hint: "Cover: useState, useEffect, fetch/axios, component hierarchy, loading/error handling",
    expectedAnswer: [
      "STATE MANAGEMENT",
      "• const [expenses, setExpenses]   = useState([])          // list of all expenses",
      "• const [loading, setLoading]     = useState(false)       // loading indicator",
      "• const [error, setError]         = useState(null)        // error message",
      "• const [filter, setFilter]       = useState({category:'', dateFrom:'', dateTo:''})",
      "• const [editTarget, setEdit]     = useState(null)        // expense being edited",
      "• Form state: {amount:'', category:'', description:'', date:''}",
      "",
      "DATA FETCHING (useEffect)",
      "• useEffect(() => { fetchExpenses(); }, [])   // runs on mount",
      "• async fetchExpenses() { setLoading(true); try { ... } catch { setError(...) } finally { setLoading(false) } }",
      "• POST/PUT/DELETE: optimistic update or re-fetch after response",
      "",
      "COMPONENT HIERARCHY",
      "• App.jsx          — top-level state, passes down props/callbacks",
      "• ├─ FilterBar     — dropdowns for category & date range",
      "• ├─ Dashboard     — summary cards / chart",
      "• ├─ AddExpenseForm — controlled form with validation",
      "• ├─ ExpenseTable  — renders expenses array",
      "• │   └─ ExpenseRow — single row with Edit / Delete buttons",
      "• └─ EditModal     — modal/inline form for updating",
      "",
      "ERROR & LOADING HANDLING",
      "• if (loading) return <Spinner />",
      "• if (error)   return <ErrorMessage message={error} />",
      "• Empty state:  expenses.length === 0 → show 'No expenses yet'",
      "• Delete: window.confirm() before API call",
      "",
      "CORS",
      "• fetch('http://localhost:8080/api/expenses')  — direct call in development",
      "• Or proxy in package.json: { 'proxy': 'http://localhost:8080' } → fetch('/api/expenses')",
      "",
      "WHAT TO LISTEN FOR",
      "✓ Mentions useState and useEffect correctly",
      "✓ Separates concerns across components (not one giant App.jsx)",
      "✓ Handles loading and error states explicitly",
      "✓ Understands controlled inputs (value + onChange)",
      "✗ Red flag: Mutates state directly, no error handling, everything in one component",
    ],
  },
  {
    num: 4, topic: "Problem Solving", difficulty: "Medium", color: C.green,
    question: "What was the most challenging part of building this Expense Tracker within the time limit? How did you debug and solve it, and what would you improve with more time?",
    hint: "Looking for: specific problem, debugging approach, concrete future improvements",
    expectedAnswer: [
      "COMMON GENUINE CHALLENGES (any of these shows real experience)",
      "• CORS errors when React calls Spring Boot on a different port",
      "  → Fixed by @CrossOrigin or adding proxy in package.json",
      "• JPA entity not saving correctly (missing @Entity or wrong column type)",
      "  → Debugged via H2 console (http://localhost:8080/h2-console)",
      "• LocalDate serialisation issue (Jackson can't serialise by default)",
      "  → Added @JsonFormat or jackson-datatype-jsr310 dependency",
      "• React state not updating after delete (mutating array instead of filter)",
      "  → Fixed: setExpenses(prev => prev.filter(e => e.id !== id))",
      "• Date format mismatch between React input (string) and Java (LocalDate)",
      "  → Used @DateTimeFormat or parsed manually",
      "",
      "DEBUGGING APPROACH (what good candidates mention)",
      "• Spring Boot: checked console logs, used Postman to test API independently",
      "• React: browser DevTools (Network tab to inspect requests), console.log state",
      "• H2 console to verify data was actually being persisted",
      "• Isolated frontend vs backend to find where the issue originated",
      "",
      "IMPROVEMENTS WITH MORE TIME",
      "• JWT-based user authentication (each user sees only their expenses)",
      "• Pagination (large expense lists)",
      "• Charts (Recharts or Chart.js for category pie chart / monthly bar chart)",
      "• Input validation (Bean Validation @NotNull, @Min on backend; Formik on frontend)",
      "• Unit tests (JUnit + Mockito for service layer; React Testing Library)",
      "• Export to CSV / PDF",
      "• Recurring expense templates",
      "• Budget limits with alerts",
      "",
      "SCORING THIS ANSWER",
      "✓ Excellent: Names a specific real problem with root cause and exact fix",
      "✓ Good:      Describes debugging process (Postman, H2 console, DevTools)",
      "✓ Good:      Lists meaningful improvements, not just 'better UI'",
      "✗ Weak:      'Everything went smoothly' — suspicious for a 2.5-hr project",
      "✗ Weak:      Vague challenges with no technical detail",
    ],
  },
  {
    num: 5, topic: "Security & Authentication", difficulty: "Hard", color: C.red,
    question: "How would you add JWT-based user authentication to this Expense Tracker? Walk us through the exact changes needed in your Spring Boot backend using Spring Security, and the changes on the React side.",
    hint: "Cover: Spring Security config, JWT filter, /auth/login endpoint, React localStorage, Authorization header",
    expectedAnswer: [
      "BACKEND — pom.xml DEPENDENCIES",
      "• spring-boot-starter-security",
      "• io.jsonwebtoken:jjwt-api, jjwt-impl, jjwt-jackson (or java-jwt by Auth0)",
      "",
      "BACKEND — SECURITY CONFIG",
      "• @Configuration @EnableWebSecurity class SecurityConfig",
      "• SecurityFilterChain bean:",
      "  - csrf().disable()  (REST API, no form login)",
      "  - sessionManagement: STATELESS",
      "  - authorizeRequests: permitAll for /auth/**, authenticated for /api/**",
      "  - addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)",
      "",
      "BACKEND — JWT FILTER",
      "• class JwtFilter extends OncePerRequestFilter",
      "• doFilterInternal(): extract 'Authorization: Bearer <token>' header",
      "• Validate token with JwtUtil (secret key, expiry check)",
      "• Extract username, load UserDetails, set SecurityContextHolder",
      "",
      "BACKEND — AUTH ENDPOINTS",
      "• @RestController @RequestMapping('/auth')",
      "• POST /auth/register → save User (BCrypt hashed password)",
      "• POST /auth/login    → authenticate, return { token: '...', email: '...' }",
      "• User entity: id, email, password (BCrypt), role",
      "",
      "BACKEND — DATA CHANGE",
      "• Expense entity gets @ManyToOne User owner field",
      "• GET /api/expenses filters by logged-in user: repo.findByOwner(currentUser)",
      "• POST creates expense with owner = currentUser from SecurityContext",
      "",
      "REACT SIDE",
      "• After POST /auth/login: localStorage.setItem('token', data.token)",
      "• All API calls: headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }",
      "• Create PrivateRoute component: if no token → redirect to /login",
      "• Logout: localStorage.removeItem('token') → redirect to /login",
      "• Axios interceptor (optional): auto-attach token to every request",
      "",
      "SCORING THIS ANSWER",
      "✓ Excellent: Covers SecurityConfig, JwtFilter, filter chain order, React header",
      "✓ Good:      Knows STATELESS session, CSRF disabled for REST, BCrypt for passwords",
      "✓ Good:      Mentions extracting user from SecurityContext for data isolation",
      "✗ Weak:      Only mentions 'add Spring Security' without explaining configuration",
      "✗ Red flag:  Stores password in plain text or stores JWT in sessionStorage without awareness of XSS",
    ],
  },
];

questions.forEach((q) => {
  newPage();

  // question header strip
  colorRect(0, 0, doc.page.width, 6, q.color);
  colorRect(50, 20, W, 60, "#f8fafc");
  doc.rect(50, 20, 4, 60).fill(q.color);

  // badges
  badge(`Q${q.num} of 5`, 62, 28, q.color, C.white);
  badge(q.difficulty, 62 + doc.widthOfString(`Q${q.num} of 5`) + 26, 28, "#e2e8f0", C.gray);
  badge(q.topic, 62 + doc.widthOfString(`Q${q.num} of 5`) + 26 + doc.widthOfString(q.difficulty) + 26, 28, q.color + "22", q.color);

  // question text
  doc.font("Helvetica-Bold").fontSize(12).fillColor(C.text)
     .text(q.question, 62, 44, { width: W - 20 });

  let qy = doc.y + 12;

  // hint box
  colorRect(50, qy, W, 24, "#fffbeb");
  doc.rect(50, qy, 3, 24).fill("#f59e0b");
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#92400e").text("HINT TO CANDIDATE:  ", 62, qy + 8, { continued: true });
  doc.font("Helvetica").fillColor("#78350f").text(q.hint, { lineBreak: false });
  qy += 32;

  // expected answer box
  colorRect(50, qy, W, 22, q.color);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white)
     .text("EXPECTED ANSWER — INTERVIEWER GUIDE", 60, qy + 6);
  qy += 28;

  q.expectedAnswer.forEach(line => {
    if (qy > 770) { newPage(); qy = 50; }

    if (line === "") { qy += 6; return; }

    if (line.startsWith("✓") || line.startsWith("✗")) {
      const isGood = line.startsWith("✓");
      doc.circle(60, qy + 5, 5).fill(isGood ? "#dcfce7" : "#fee2e2");
      doc.font("Helvetica-Bold").fontSize(8).fillColor(isGood ? C.green : C.red)
         .text(line[0], 57, qy + 1, { lineBreak: false });
      doc.font("Helvetica").fontSize(9).fillColor(C.text).text(line.slice(2), 74, qy, { width: W - 26 });
      qy = doc.y + 3;
    } else if (line.endsWith(")") || (!line.startsWith("•") && !line.startsWith(" ") && line.length < 50 && line.toUpperCase() === line)) {
      // Section heading inside answer
      doc.font("Helvetica-Bold").fontSize(9).fillColor(q.color).text(line, 50, qy, { width: W });
      qy = doc.y + 3;
    } else if (line.startsWith("•") || line.startsWith(" ")) {
      const indent = line.startsWith("  ") ? 20 : 0;
      doc.font("Helvetica").fontSize(9).fillColor(C.text)
         .text(line.startsWith("•") ? line : line.trimStart(), 60 + indent, qy, { width: W - 12 - indent });
      qy = doc.y + 3;
    } else {
      doc.font("Helvetica").fontSize(9).fillColor(C.text).text(line, 50, qy, { width: W });
      qy = doc.y + 3;
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  LAST PAGE — ADMIN GUIDE & QUICK REF
// ══════════════════════════════════════════════════════════════════════════
newPage();

doc.font("Helvetica-Bold").fontSize(18).fillColor(C.navy).text("Admin Review Guide", 50, 50);
hr(75);

y = 90;
y = sectionBox("Accessing the Admin Panel", y, C.navy);
const adminSteps = [
  "Open a browser and go to:  http://localhost:5000/admin   (or your server's IP/domain)",
  "Enter the admin password:  Admin@Neutara2026",
  "All candidate submissions appear — newest first",
  "Each row shows: email, submission time, file size, and original filename",
  'Click "Download Code" to get their project .zip file',
  "Extract the zip and open in IntelliJ IDEA or VS Code to review the code",
];
adminSteps.forEach(s => { y = bullet(s, 50, y); });
y += 10;

y = sectionBox("Code Review Checklist", y, C.blue);
const checklist = [
  "Spring Boot project structure: src/main/java with controller/, service/, repository/, model/ packages",
  "Entity class: correct @Entity, @Id, @GeneratedValue annotations; appropriate field types",
  "JpaRepository used (not raw SQL/JDBC unless explicitly chosen)",
  "Controller uses @RestController; endpoints match GET/POST/PUT/DELETE/summary spec",
  "Service layer handles business logic; controller is thin",
  "CORS configured (not just @CrossOrigin on controller — check if properly scoped)",
  "application.properties/yml: DB config present; H2 console enabled for in-memory",
  "React components separated (not a monolithic App.jsx)",
  "API calls use fetch or axios; async/await or .then() chains; error handling present",
  "Filter feature works client-side or via query params to backend",
  "Category summary calculated correctly",
  "Bonus: input validation, responsive CSS, chart library integrated",
];
checklist.forEach(c => { y = bullet(c, 50, y); });
y += 10;

y = sectionBox("Quick Reference — Passwords & URLs", y, C.orange);
const refs = [
  ["Candidate login URL",  "http://localhost:5000  (or your deployed domain)"],
  ["Candidate password",   "Neutara@2026"],
  ["Admin panel URL",      "http://localhost:5000/admin"],
  ["Admin password",       "Admin@Neutara2026"],
  ["Code upload folder",   "server/uploads/hackathon-code/  (on your server)"],
  ["Submissions log",      "server/data/hackathon-submissions.json"],
  ["Q&A questions file",   "server/data/hackathon-qa-questions.json"],
];
refs.forEach(([k, v]) => { y = kv(k + ":", v, y); });
y += 10;

y = sectionBox("Scoring Rubric (Suggested)", y, C.green);
const rubric = [
  ["Code Quality",      "25%  — Clean architecture, separation of concerns, readable code"],
  ["API Design",        "25%  — Correct REST endpoints, proper HTTP methods and status codes"],
  ["Feature Completeness", "20%  — All 5 features working: CRUD, filter, summary"],
  ["Q&A Depth",         "20%  — Technical accuracy and clarity in video answers"],
  ["Problem Solving",   "10%  — How they handled challenges, what they'd improve"],
];
rubric.forEach(([k, v]) => { y = kv(k + ":", v, y); });

// ─── page numbers ──────────────────────────────────────────────────────────
const totalPages = doc.bufferedPageRange().count;
for (let i = 1; i < totalPages; i++) {   // skip cover (page 0)
  doc.switchToPage(i);
  doc.font("Helvetica").fontSize(8).fillColor(C.lgray)
     .text(`Page ${i + 1} of ${totalPages}  ·  Hackathon Guide & Answer Key  ·  CONFIDENTIAL`,
           50, doc.page.height - 30, { align: "center", width: W });
}

doc.end();
console.log("✅ PDF generated:", OUTPUT);
