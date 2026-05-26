"use strict";
const PDFDocument = require("pdfkit");
const fs   = require("fs");
const path = require("path");

const OUT = path.join(
  "C:\\Users\\SatyaPinniti\\OneDrive - CloudFuze, Inc\\Desktop",
  "Expense_Tracker_Candidate_Guide.pdf"
);

const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

const ML  = 50;          // margin left
const MR  = 50;          // margin right
const W   = 595 - ML - MR;  // usable width
const PH  = 842;         // page height

// ── Colour palette ───────────────────────────────────────────────────────────
const C = {
  dark:   "#1a1a2e",
  indigo: "#4f46e5",
  green:  "#059669",
  amber:  "#d97706",
  red:    "#dc2626",
  slate:  "#64748b",
  muted:  "#94a3b8",
  body:   "#374151",
  light:  "#f8fafc",
  border: "#e2e8f0",
  code:   "#0f172a",
  codeT:  "#7dd3fc",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function line(color = C.border, lw = 0.5) {
  const y = doc.y;
  doc.save().moveTo(ML, y).lineTo(ML + W, y)
     .strokeColor(color).lineWidth(lw).stroke().restore();
  doc.moveDown(0.4);
}

function sectionBar(label) {
  doc.moveDown(0.6);
  const y = doc.y;
  doc.save().rect(ML, y, W, 26).fill(C.dark).restore();
  // left accent stripe
  doc.save().rect(ML, y, 4, 26).fill(C.indigo).restore();
  doc.fillColor("#fff").fontSize(11).font("Helvetica-Bold")
     .text(label.toUpperCase(), ML + 14, y + 8, { lineBreak: false });
  doc.y = y + 34;
  doc.fillColor(C.body);
}

function h2(text) {
  doc.moveDown(0.35);
  doc.fillColor(C.indigo).fontSize(10.5).font("Helvetica-Bold").text(text, ML + 10);
  doc.moveDown(0.2);
}

function para(text, indent = ML + 10) {
  doc.fillColor(C.body).fontSize(10).font("Helvetica")
     .text(text, indent, doc.y, { width: W - (indent - ML) });
  doc.moveDown(0.35);
}

function dot(text, indent = ML + 20) {
  const y = doc.y;
  doc.save().rect(indent - 10, y + 4, 4, 4).fill(C.indigo).restore();
  doc.fillColor(C.body).fontSize(10).font("Helvetica")
     .text(text, indent, y, { width: W - (indent - ML) });
  doc.moveDown(0.3);
}

function code(lines) {
  const h   = lines.length * 14 + 16;
  const y   = doc.y;
  const lx  = ML + 10;
  const lw  = W - 20;
  doc.save().roundedRect(lx, y, lw, h, 4).fill(C.code).restore();
  lines.forEach((ln, i) => {
    doc.fillColor(C.codeT).fontSize(9).font("Courier")
       .text(ln, lx + 12, y + 8 + i * 14, { lineBreak: false, width: lw - 24 });
  });
  doc.y = y + h + 8;
  doc.moveDown(0.2);
}

function qBlock(num, qText) {
  doc.moveDown(0.5);
  const y  = doc.y;
  const lx = ML + 10;
  const lw = W - 20;
  // background card
  doc.save().roundedRect(lx, y, lw, 14, 3).fill("#eef2ff").restore();
  // number pill
  doc.save().roundedRect(lx, y, 24, 14, 3).fill(C.indigo).restore();
  doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold")
     .text("Q" + num, lx + 4, y + 3, { lineBreak: false });
  doc.fillColor(C.dark).fontSize(10).font("Helvetica-Bold")
     .text(qText, lx + 30, y + 2, { width: lw - 34, lineBreak: false });
  doc.y = y + 20;
  doc.moveDown(0.2);
}

function ansHead() {
  const y = doc.y;
  doc.save().rect(ML + 10, y, 3, 12).fill(C.green).restore();
  doc.fillColor(C.green).fontSize(10).font("Helvetica-Bold")
     .text("ANSWER", ML + 18, y + 1, { lineBreak: false });
  doc.moveDown(0.55);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PAGE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════
// Dark hero
doc.save().rect(0, 0, 595, 220).fill(C.dark).restore();
// Indigo accent bar at top
doc.save().rect(0, 0, 595, 5).fill(C.indigo).restore();

// Title block
doc.fillColor(C.indigo).fontSize(32).font("Helvetica-Bold")
   .text("Expense Tracker", ML, 60);
doc.fillColor("#fff").fontSize(14).font("Helvetica")
   .text("Full-Stack Hackathon  —  Candidate Study Guide", ML, 100);
doc.fillColor(C.muted).fontSize(10.5).font("Helvetica")
   .text("React 18   |   Java Spring Boot 3.2   |   H2 In-Memory Database   |   2.5 Hours Build", ML, 122);

// Tag pills
const tags = ["Hackathon Final Round", "Full-Stack Developer", "2.5 Hours"];
const tagColors = [C.indigo, "#0f766e", "#b45309"];
let tx = ML;
tags.forEach((tag, i) => {
  const tw = doc.widthOfString(tag, { size: 9 }) + 20;
  doc.save().roundedRect(tx, 152, tw, 20, 4).fill(tagColors[i]).restore();
  doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold")
     .text(tag, tx + 10, 158, { lineBreak: false });
  tx += tw + 8;
});

doc.y = 240;

// ── WHAT YOU NEED TO BUILD ────────────────────────────────────────────────────
sectionBar("What You Need to Build");

para("You are given a fully working Expense Tracker application (React + Spring Boot + H2 database). Your task during the 2.5-hour hackathon is:");
["Run the project — start the backend (port 8080) and frontend (port 3000) from the ZIP",
 "Read and understand the code — know every file and what it does",
 "Extend or improve it — add features, fix things, make it better",
 "Upload your final ZIP — submit through the interview platform before time is up",
 "Answer 5 video questions — explain your code on camera (3 minutes each)",
].forEach(t => dot(t));

doc.moveDown(0.2);
h2("The Application");
para("A full-stack web app where users track their daily expenses. Data is stored in a Java Spring Boot REST API backed by an H2 in-memory database, and displayed in a React 18 frontend.");

h2("Frontend Features");
["Add Expense — form with amount, category, date, and description",
 "Expense List — all expenses with colour-coded category icons, Edit and Delete buttons",
 "Edit Modal — click Edit to update any expense in a popup dialog",
 "Filter Bar — filter by category, date range, or both combined",
 "Dashboard — total spent, average, per-category bars, last 3 months breakdown",
].forEach(t => dot(t));

h2("Backend Features");
["REST API with 7 endpoints under /api/expenses",
 "Expense entity: id, amount (BigDecimal), category, description, date (LocalDate)",
 "JPA / Hibernate maps the Expense class to the H2 EXPENSES table automatically",
 "Validation with @Valid, @NotNull, @DecimalMin on the model",
 "CORS enabled — React on port 3000 can call Spring Boot on port 8080",
].forEach(t => dot(t));

doc.moveDown(0.3);
h2("How to Run");
code([
  "# Terminal 1 — Backend",
  "cd expense-tracker/backend",
  "mvn spring-boot:run          # starts at http://localhost:8080",
  "",
  "# Terminal 2 — Frontend",
  "cd expense-tracker/frontend",
  "npm install",
  "npm start                    # opens http://localhost:3000",
]);

// ═══════════════════════════════════════════════════════════════════════════
//  PAGE 2 — Q1 + Q2
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage({ margin: 0 });
doc.y = 30;

sectionBar("Video Q&A — 5 Questions with Exact Answers");
para("After uploading your project you will record answers to 5 questions on camera (up to 3 minutes each). Study the answers below — they are based on the exact code in the ZIP so you can explain every line confidently.");

// ── Q1 ────────────────────────────────────────────────────────────────────────
doc.moveDown(0.2);
qBlock(1, "Explain the overall architecture. How does data flow from React to Spring Boot and back?");
ansHead();

para("The app has three layers: React frontend on port 3000, Spring Boot backend on port 8080, and H2 in-memory database.");
para("The proxy field in package.json points to localhost:8080. So when Axios calls /api/expenses, the React dev server forwards it to Spring Boot — no browser CORS problem.");
para("In App.js, fetchExpenses() makes the call:");
code([
  "const res = await axios.get('/api/expenses', { params });",
  "setExpenses(res.data);",
]);
para("Spring Boot receives it in ExpenseController.java (annotated @RestController and @RequestMapping(\"/api/expenses\")). The controller calls ExpenseService, the service calls ExpenseRepository.");
para("ExpenseRepository extends JpaRepository<Expense, Long>. JPA + Hibernate automatically map the Expense entity to a table called EXPENSES in H2. Spring executes the SQL, fetches the rows, converts them to Expense Java objects.");
para("The service returns List<Expense> to the controller, which wraps it in ResponseEntity.ok(). Spring serializes it to JSON automatically. That JSON arrives at Axios, which resolves the promise, and setExpenses(res.data) updates React state and re-renders the list.");

line();

// ── Q2 ────────────────────────────────────────────────────────────────────────
qBlock(2, "Walk through the Spring Boot backend. What are the layers and how is the REST API designed?");
ansHead();

para("The backend uses a three-layer architecture: Controller -> Service -> Repository.");

h2("Controller — ExpenseController.java");
para("Annotated @RestController, @RequestMapping(\"/api/expenses\"), @CrossOrigin(origins=\"*\"). Seven handler methods:");
code([
  "GET    /api/expenses              getExpenses()   — optional ?category, ?startDate, ?endDate",
  "GET    /api/expenses/{id}         getExpenseById()",
  "POST   /api/expenses              createExpense() — returns 201 Created",
  "PUT    /api/expenses/{id}         updateExpense()",
  "DELETE /api/expenses/{id}         deleteExpense() — returns 200 with message",
  "GET    /api/expenses/summary      getSummary()",
  "GET    /api/expenses/categories   getCategories()",
]);
para("Each method returns a ResponseEntity. Missing IDs return 404 with an error JSON map.");

h2("Service — ExpenseService.java");
para("Annotated @Service. Contains business logic: sorting expenses by date descending using Comparator.comparing(Expense::getDate).reversed(), building the summary map with totals by category and monthly breakdown, throwing RuntimeException when an ID is not found.");

h2("Repository — ExpenseRepository.java");
para("Extends JpaRepository<Expense, Long>. Spring generates all SQL. Custom methods like findByCategoryIgnoreCase() and findByDateBetween() are derived from the method name automatically. @Query annotations are used for aggregates like getTotalByCategory() and getMonthlySummary().");

h2("Model — Expense.java");
para("Annotated @Entity @Table(name=\"expenses\"). Fields: id (@GeneratedValue IDENTITY), amount (BigDecimal, @DecimalMin(\"0.01\")), category (@NotBlank), description (optional), date (LocalDate, @JsonFormat(pattern=\"yyyy-MM-dd\")).");

// ═══════════════════════════════════════════════════════════════════════════
//  PAGE 3 — Q3 + Q4
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage({ margin: 0 });
doc.y = 30;

sectionBar("Questions 3 & 4");

// ── Q3 ────────────────────────────────────────────────────────────────────────
qBlock(3, "Describe the React frontend. How did you manage state and handle API communication?");
ansHead();

para("All top-level state is in App.js. I used useState for: expenses (array), summary (object), loading (boolean), error (string), editingExpense (object or null), and three filter states — filterCategory, filterStart, filterEnd.");
code([
  "const [expenses,       setExpenses]       = useState([]);",
  "const [summary,        setSummary]        = useState(null);",
  "const [loading,        setLoading]        = useState(true);",
  "const [editingExpense, setEditingExpense]  = useState(null);",
  "const [filterCategory, setFilterCategory] = useState('');",
  "const [filterStart,    setFilterStart]    = useState('');",
  "const [filterEnd,      setFilterEnd]      = useState('');",
]);
para("I used useCallback for fetchExpenses so the function only re-creates when filter values change. useEffect calls fetchExpenses whenever those dependencies update — so the list re-fetches automatically whenever the user changes a filter.");
code([
  "const fetchExpenses = useCallback(async () => {",
  "  const params = {};",
  "  if (filterCategory) params.category  = filterCategory;",
  "  if (filterStart)    params.startDate = filterStart;",
  "  if (filterEnd)      params.endDate   = filterEnd;",
  "  const res = await axios.get('/api/expenses', { params });",
  "  setExpenses(res.data);",
  "}, [filterCategory, filterStart, filterEnd]);",
  "",
  "useEffect(() => { fetchExpenses(); }, [fetchExpenses]);",
]);

h2("Components");
["AddExpenseForm.js — local form state (amount, category, date, description), validate() function, calls onAdd() prop which runs axios.post in App.js then refreshes the list",
 "EditExpenseModal.js — receives the expense as a prop, pre-fills the form fields, calls onSave(id, data) which runs axios.put, closes on overlay click or Cancel",
 "ExpenseList.js — CATEGORY_ICONS and CATEGORY_COLORS maps give each category an icon and coloured badge. formatDate() converts ISO string to readable format",
 "FilterBar.js — fully controlled; passes all changes up to App.js via onChange props",
 "Dashboard.js — shows total records, total amount, average per expense, percentage bars for each category, and the last 3 months from the summary object",
].forEach(t => dot(t));

line();

// ── Q4 ────────────────────────────────────────────────────────────────────────
qBlock(4, "What was the most challenging part? How did you debug it and what would you improve?");
ansHead();

h2("Challenge 1 — LocalDate serialization");
para("Spring Boot by default serializes LocalDate as an array like [2024, 5, 15]. Two things fix this:");
code([
  "# application.properties",
  "spring.jackson.serialization.write-dates-as-timestamps=false",
]);
para("And on the Expense model:");
code([
  "@JsonFormat(pattern = \"yyyy-MM-dd\")",
  "private LocalDate date;",
]);
para("The React date input binds to the ISO string format yyyy-MM-dd which matches what Spring expects.");

h2("Challenge 2 — CORS between port 3000 and 8080");
para("React runs on 3000 and Spring Boot on 8080. Two things solve this together: the proxy field in package.json (\"proxy\": \"http://localhost:8080\") routes API calls through the dev server, and @CrossOrigin(origins=\"*\") on the controller handles production.");

h2("Debugging");
["H2 Console at http://localhost:8080/h2-console — run SELECT * FROM EXPENSES directly to verify data is being saved",
 "Browser Network tab — inspect the exact JSON request body and response from each API call",
 "Set spring.jpa.show-sql=true in application.properties to print all Hibernate SQL to the console",
].forEach(t => dot(t));

h2("What I would improve with more time");
["Add JWT authentication — protect all /api/expenses routes behind a login",
 "Add budget limits per category with an alert when spending is close to the limit",
 "Add pagination — performance improvement for users with hundreds of expenses",
 "Write JUnit tests for ExpenseService — test createExpense, updateExpense, getSummary",
 "Add a bar or pie chart to the Dashboard using a charting library",
].forEach(t => dot(t));

// ═══════════════════════════════════════════════════════════════════════════
//  PAGE 4 — Q5 (full JWT walkthrough)
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage({ margin: 0 });
doc.y = 30;

sectionBar("Question 5 — Security & JWT Authentication");

qBlock(5, "This app has no authentication. How would you add JWT-based login using Spring Security?");
ansHead();

para("I would add Spring Security with a JWT filter. Here are the six exact steps:");

h2("Step 1 — Add dependencies to pom.xml");
code([
  "<dependency>",
  "  <groupId>org.springframework.boot</groupId>",
  "  <artifactId>spring-boot-starter-security</artifactId>",
  "</dependency>",
  "<dependency>",
  "  <groupId>io.jsonwebtoken</groupId>",
  "  <artifactId>jjwt-api</artifactId>",
  "  <version>0.11.5</version>",
  "</dependency>",
]);

h2("Step 2 — Create a User entity");
code([
  "@Entity",
  "public class User {",
  "    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)",
  "    private Long id;",
  "    private String email;",
  "    private String password;   // stored as BCrypt hash",
  "}",
]);

h2("Step 3 — JwtUtil class (token generator and validator)");
code([
  "public String generateToken(String email) {",
  "    return Jwts.builder()",
  "        .setSubject(email)",
  "        .setExpiration(new Date(System.currentTimeMillis() + 86400000))",
  "        .signWith(secretKey, SignatureAlgorithm.HS256)",
  "        .compact();",
  "}",
  "",
  "public String extractEmail(String token) {",
  "    return Jwts.parserBuilder().setSigningKey(secretKey)",
  "        .build().parseClaimsJws(token).getBody().getSubject();",
  "}",
]);

h2("Step 4 — JwtAuthenticationFilter (runs on every request)");
para("Extends OncePerRequestFilter. Reads the Authorization header, strips \"Bearer \", validates the token, and sets the authentication in Spring's SecurityContextHolder:");
code([
  "String header = request.getHeader(\"Authorization\");",
  "if (header != null && header.startsWith(\"Bearer \")) {",
  "    String token = header.substring(7);",
  "    String email = jwtUtil.extractEmail(token);",
  "    UsernamePasswordAuthenticationToken auth =",
  "        new UsernamePasswordAuthenticationToken(email, null, List.of());",
  "    SecurityContextHolder.getContext().setAuthentication(auth);",
  "}",
  "chain.doFilter(request, response);",
]);

h2("Step 5 — SecurityFilterChain configuration");
code([
  "@Bean",
  "public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {",
  "    http.csrf().disable()",
  "        .sessionManagement().sessionCreationPolicy(STATELESS)",
  "        .and()",
  "        .authorizeHttpRequests()",
  "        .requestMatchers(\"/api/auth/**\").permitAll()          // login is public",
  "        .requestMatchers(\"/api/expenses/**\").authenticated()  // protected",
  "        .and()",
  "        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);",
  "    return http.build();",
  "}",
]);

h2("Step 6 — Login endpoint returns the JWT");
code([
  "POST /api/auth/login",
  "Body: { \"email\": \"user@example.com\", \"password\": \"abc123\" }",
  "Response: { \"token\": \"eyJhbGciOiJIUzI1NiJ9...\" }",
]);

h2("React side — Axios interceptor attaches the token to every request");
code([
  "axios.interceptors.request.use(config => {",
  "    const token = localStorage.getItem('token');",
  "    if (token) config.headers.Authorization = `Bearer ${token}`;",
  "    return config;",
  "});",
]);
para("After login, the token is stored in localStorage. Every Axios request automatically includes it. Spring Security's JWT filter validates it and allows or rejects the request with 401 Unauthorized.");

// ═══════════════════════════════════════════════════════════════════════════
//  PAGE 5 — CHEAT SHEET
// ═══════════════════════════════════════════════════════════════════════════
doc.addPage({ margin: 0 });
doc.y = 30;

sectionBar("File Structure & API Cheat Sheet");

h2("Backend Files  (backend/src/main/java/com/expensetracker/)");
const beFiles = [
  ["ExpenseTrackerApplication.java",        "Entry point — @SpringBootApplication, main() method"],
  ["model/Expense.java",                    "@Entity — id, amount (BigDecimal), category, description, date (LocalDate)"],
  ["repository/ExpenseRepository.java",     "Extends JpaRepository<Expense,Long> — all database access, custom @Query methods"],
  ["service/ExpenseService.java",           "Business logic — CRUD, filtering by category/date, getSummary() analytics"],
  ["controller/ExpenseController.java",     "@RestController — all 7 REST endpoints, @CrossOrigin, ResponseEntity responses"],
  ["resources/application.properties",     "H2 datasource config, jackson date format, server port 8080"],
];

beFiles.forEach(([file, desc]) => {
  const y = doc.y;
  doc.font("Courier").fontSize(9).fillColor(C.indigo)
     .text(file, ML + 10, y, { continued: false, lineBreak: false });
  const fw = doc.widthOfString(file, { size: 9 });
  doc.font("Helvetica").fontSize(9).fillColor(C.slate)
     .text("  " + desc, ML + 10, y + 11, { width: W - 20 });
  doc.y += 4;
  doc.moveDown(0.2);
});

doc.moveDown(0.2);
h2("Frontend Files  (frontend/src/)");
const feFiles = [
  ["App.js",                        "All state (useState), Axios calls, fetchExpenses with useCallback, layout"],
  ["App.css",                       "All CSS — header, card, form, modal, list items, dashboard, filter bar"],
  ["components/AddExpenseForm.js",  "Controlled form, validate(), calls onAdd() prop, axios.post on submit"],
  ["components/EditExpenseModal.js","Modal overlay, pre-filled form from expense prop, calls onSave(id, data)"],
  ["components/ExpenseList.js",     "CATEGORY_ICONS map, CATEGORY_COLORS map, formatDate(), Edit/Delete buttons"],
  ["components/FilterBar.js",       "Category select + date inputs, fully controlled via props from App.js"],
  ["components/Dashboard.js",       "Stats grid (total, avg), category percentage bars, last 3 months list"],
];

feFiles.forEach(([file, desc]) => {
  const y = doc.y;
  doc.font("Courier").fontSize(9).fillColor(C.indigo)
     .text(file, ML + 10, y, { lineBreak: false });
  doc.font("Helvetica").fontSize(9).fillColor(C.slate)
     .text("  " + desc, ML + 10, y + 11, { width: W - 20 });
  doc.y += 4;
  doc.moveDown(0.2);
});

doc.moveDown(0.3);
h2("API Endpoints");

const apis = [
  ["GET",    "/api/expenses",                    "All expenses (optional ?category, ?startDate, ?endDate)"],
  ["GET",    "/api/expenses/{id}",               "Single expense by ID  (404 if not found)"],
  ["POST",   "/api/expenses",                    "Create expense  (returns 201 Created)"],
  ["PUT",    "/api/expenses/{id}",               "Update expense  (returns updated object)"],
  ["DELETE", "/api/expenses/{id}",               "Delete expense  (returns success message)"],
  ["GET",    "/api/expenses/summary",            "Analytics: totalAmount, totalExpenses, byCategory[], monthlySummary[]"],
  ["GET",    "/api/expenses/categories",         "List of distinct category strings"],
];
const mc = { GET: C.green, POST: C.indigo, PUT: C.amber, DELETE: C.red };

// header
const thY = doc.y;
doc.save().rect(ML + 10, thY, W - 20, 18).fill("#f1f5f9").restore();
doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.slate)
   .text("METHOD", ML + 16, thY + 5)
   .text("ENDPOINT", ML + 70, thY + 5)
   .text("DESCRIPTION", ML + 230, thY + 5);
doc.y = thY + 20;

apis.forEach((row, i) => {
  const rY = doc.y;
  if (i % 2 === 0) {
    doc.save().rect(ML + 10, rY - 1, W - 20, 15).fill("#fafafa").restore();
  }
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(mc[row[0]] || C.slate)
     .text(row[0], ML + 16, rY);
  doc.font("Courier").fontSize(8.5).fillColor(C.dark)
     .text(row[1], ML + 70, rY);
  doc.font("Helvetica").fontSize(8.5).fillColor(C.slate)
     .text(row[2], ML + 230, rY, { width: W - 200 });
  doc.y = rY + 16;
});

doc.moveDown(0.5);

// Key reminders box
const bY = doc.y;
const bH = 72;
doc.save().roundedRect(ML + 10, bY, W - 20, bH, 6)
   .fill("#fffbeb").stroke("#fde68a").restore();
doc.fillColor("#92400e").fontSize(10).font("Helvetica-Bold")
   .text("Key Points to Remember During Q&A", ML + 20, bY + 10);
[
  'The "proxy" in package.json is why Axios calls /api/expenses work without specifying port 8080',
  "@CrossOrigin(origins=\"*\") on ExpenseController allows cross-origin requests in production",
  "spring.jackson.serialization.write-dates-as-timestamps=false is why dates come back as strings",
].forEach((n, i) => {
  doc.fillColor("#78350f").fontSize(9).font("Helvetica")
     .text("• " + n, ML + 20, bY + 26 + i * 14, { width: W - 40 });
});
doc.y = bY + bH + 10;

// ── FOOTER on every page ─────────────────────────────────────────────────────
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  const fY = PH - 28;
  doc.save().rect(0, fY, 595, 28).fill(C.dark).restore();
  doc.save().rect(0, fY, 595, 2).fill(C.indigo).restore();
  doc.fillColor(C.muted).fontSize(8.5).font("Helvetica")
     .text(
       `Expense Tracker Hackathon  |  Candidate Study Guide  |  Page ${i - range.start + 1} of ${range.count}`,
       ML, fY + 10, { align: "center", width: W }
     );
}

doc.end();
stream.on("finish", () => console.log("PDF created:", OUT));
stream.on("error",  (e) => console.error("Error:", e.message));
