const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { sendThankYouEmail } = require("../mailer");

const router = express.Router();

const dataDir = path.join(__dirname, "..", "data");

// Upload storage for resumes
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${ts}_${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Upload storage for hackathon code submissions (zips up to 100 MB)
const codeUploadsDir = path.join(__dirname, "..", "uploads", "hackathon-code");
if (!fs.existsSync(codeUploadsDir)) fs.mkdirSync(codeUploadsDir, { recursive: true });

const codeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, codeUploadsDir),
  filename: (req, file, cb) => {
    const ts   = Date.now();
    const email = (req.body?.email || "unknown").replace(/[^a-zA-Z0-9@._-]/g, "_");
    cb(null, `${email}_${ts}.zip`);
  },
});
const codeUpload = multer({ storage: codeStorage, limits: { fileSize: 100 * 1024 * 1024 } });

const VALID_PASSWORD = "Neutara@2026";

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email && email.trim() && password === VALID_PASSWORD) {
    res.json({ success: true, user: { email: email.trim() } });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
});

router.get("/coding", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "coding-questions.json"), "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: "Failed to load coding questions" });
  }
});

router.post("/coding-submit", (req, res) => {
  try {
    const { email, submissions } = req.body; // submissions: { "1": { code, language }, ... }
    const logFile = path.join(dataDir, "coding-submissions.json");
    let list = [];
    try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
    list.push({ email, submissions, submittedAt: new Date().toISOString() });
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save submission" });
  }
});

router.get("/vlsi", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "vlsi-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ answer, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load VLSI questions" });
  }
});

router.get("/scripting", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "scripting-questions.json"), "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: "Failed to load scripting questions" });
  }
});

router.get("/hr-questions", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "hr-questions.json"), "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(500).json({ error: "Failed to load HR questions" });
  }
});

router.get("/technical", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "technical-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ answer, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load technical questions" });
  }
});

router.get("/vlsi-final", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "vlsi-final-round-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ keyPoints, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load VLSI final round questions" });
  }
});

// ── Aptitude Round 1 submit (server-side scoring + thank-you email) ────────
router.post("/aptitude-submit", async (req, res) => {
  try {
    const { name, email, answers } = req.body;
    const raw = fs.readFileSync(path.join(dataDir, "aptitude-questions.json"), "utf-8");
    const questions = JSON.parse(raw);

    let score = 0;
    const results = questions.map(q => {
      const userAnswer = answers != null && answers[q.id] != null ? Number(answers[q.id]) : -1;
      const isCorrect  = userAnswer === q.answer;
      if (isCorrect) score++;
      return { id: q.id, category: q.category, userAnswer, correctAnswer: q.answer, isCorrect };
    });

    res.json({ score, total: questions.length, results });

    if (email) {
      sendThankYouEmail({ name: name || email, email }).catch(err =>
        console.error("Email send failed:", err.message)
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit" });
  }
});

// ── Java Technical MCQ Round 2 ─────────────────────────────────────────────
router.post("/java-mcq-register", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    if (!name || !email || !contact)
      return res.status(400).json({ success: false, error: "Name, email and contact are required." });

    const entry = {
      name:    name.trim(),
      email:   email.trim(),
      contact: contact.trim(),
      resume:  req.file ? req.file.filename : null,
      registeredAt: new Date().toISOString(),
    };

    const logFile = path.join(dataDir, "java-mcq-registrations.json");
    let list = [];
    try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
    list.push(entry);
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2));

    res.json({ success: true, user: { name: entry.name, email: entry.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Registration failed." });
  }
});

router.get("/java-mcq", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "java-mcq-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ answer, explanation, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load Java MCQ questions" });
  }
});

router.post("/java-mcq-submit", async (req, res) => {
  try {
    const { name, email, answers } = req.body;
    const raw = fs.readFileSync(path.join(dataDir, "java-mcq-questions.json"), "utf-8");
    const questions = JSON.parse(raw);

    let score = 0;
    const results = questions.map(q => {
      const userAnswer = answers != null && answers[q.id] != null ? Number(answers[q.id]) : -1;
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) score++;
      return {
        id: q.id,
        category: q.category,
        question: q.question,
        code: q.code || null,
        options: q.options,
        userAnswer,
        correctAnswer: q.answer,
        explanation: q.explanation,
        isCorrect,
      };
    });

    res.json({ score, total: questions.length, results });

    // Send thank-you email after responding (non-blocking)
    if (email) {
      sendThankYouEmail({ name: name || email, email }).catch(err =>
        console.error("Email send failed:", err.message)
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit answers" });
  }
});

router.get("/technical-pdf", (_req, res) => {
  try {
    const { generatePDF } = require("../generate-technical-pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Technical_Interview_QnA.pdf"');
    generatePDF(res);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// ── Aptitude registration (email + contact + resume file) ──────────────────
router.post("/aptitude-register", upload.single("resume"), (req, res) => {
  try {
    const { name, email, contact } = req.body;
    if (!name || !email || !contact) {
      return res.status(400).json({ success: false, error: "Name, email and contact are required." });
    }

    const entry = {
      name: name.trim(),
      email: email.trim(),
      contact: contact.trim(),
      resume: req.file ? req.file.filename : null,
      registeredAt: new Date().toISOString(),
    };

    // Append to registrations log
    const logFile = path.join(dataDir, "aptitude-registrations.json");
    let list = [];
    try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
    list.push(entry);
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2));

    res.json({ success: true, user: { name: entry.name, email: entry.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Registration failed." });
  }
});

// ── Aptitude questions ──────────────────────────────────────────────────────
router.get("/aptitude", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "aptitude-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ answer, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load aptitude questions" });
  }
});

// ── Hackathon registration ──────────────────────────────────────────────────
router.post("/hackathon-register", (req, res) => {
  try {
    const { name, email, contact } = req.body;
    if (!name || !email || !contact) {
      return res.status(400).json({ success: false, error: "Name, email and contact are required." });
    }
    const entry = {
      name: name.trim(),
      email: email.trim(),
      contact: contact.trim(),
      registeredAt: new Date().toISOString(),
    };
    const logFile = path.join(dataDir, "hackathon-registrations.json");
    let list = [];
    try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
    list.push(entry);
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2));
    res.json({ success: true, user: { name: entry.name, email: entry.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Registration failed." });
  }
});

// ── Hackathon code submission (zip upload) ──────────────────────────────────
router.post("/hackathon-submit-code", codeUpload.single("code"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file received." });

    const entry = {
      email:       (req.body?.email || "unknown").trim(),
      filename:    req.file.filename,
      originalName: req.file.originalname,
      sizeMB:      (req.file.size / 1024 / 1024).toFixed(2),
      submittedAt: new Date().toISOString(),
    };

    const logFile = path.join(dataDir, "hackathon-submissions.json");
    let list = [];
    try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
    // Update existing entry for same email or push new
    const idx = list.findIndex(e => e.email === entry.email);
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Upload failed on server." });
  }
});

// ── Admin: list all submissions ─────────────────────────────────────────────
const ADMIN_PASSWORD = "Admin@Neutara2026";

router.get("/admin-submissions", (req, res) => {
  if (req.query.pass !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "Unauthorized" });

  const logFile = path.join(dataDir, "hackathon-submissions.json");
  let list = [];
  try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
  res.json(list);
});

// ── Admin: download a candidate's zip ──────────────────────────────────────
router.get("/admin-download/:filename", (req, res) => {
  if (req.query.pass !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "Unauthorized" });

  const safe = path.basename(req.params.filename);
  const filePath = path.join(codeUploadsDir, safe);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "File not found" });

  res.download(filePath, safe);
});

// ── Hackathon Q&A questions ─────────────────────────────────────────────────
router.get("/hackathon-qa", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "hackathon-qa-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ hint, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load hackathon Q&A questions" });
  }
});

module.exports = router;
