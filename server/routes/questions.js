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

// Upload storage for HR interview answer videos (one webm per question)
const hrVideoDir = path.join(__dirname, "..", "uploads", "hr-videos");
if (!fs.existsSync(hrVideoDir)) fs.mkdirSync(hrVideoDir, { recursive: true });

const hrVideoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, hrVideoDir),
  // The text fields are not parsed yet at this point, so write to a temporary
  // name and rename in the handler once email / questionId are available.
  filename: (_req, _file, cb) =>
    cb(null, `pending_${Date.now()}_${Math.round(Math.random() * 1e6)}.webm`),
});
const hrVideoUpload = multer({ storage: hrVideoStorage, limits: { fileSize: 200 * 1024 * 1024 } });

// Each interview password maps to a candidate level. The level decides which
// HR question bank the candidate is served.
const PASSWORD_LEVELS = {
  "Neutara@2026":    "experienced", // 2-3 years, Java / Python bank
  "UniqueHire@2026": "fresher",     // fresher Python bank
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const level = PASSWORD_LEVELS[password];
  if (email && email.trim() && level) {
    res.json({ success: true, user: { email: email.trim(), level } });
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

// ── HR round: 10 random questions out of the 30-question bank ───────────────
const HR_BANKS = {
  fresher:     "hr-questions.json",
  experienced: "hr-questions-experienced.json",
};
const HR_QUESTION_COUNT = 10;
const HR_INTRO_ID = 1; // "Please introduce yourself" — always asked first

function pickRandom(list, count) {
  const intro = list.find(q => q.id === HR_INTRO_ID);
  const pool  = list.filter(q => q.id !== HR_INTRO_ID);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Shuffle to choose, then restore bank order so the interview still flows
  // HR -> Technical -> Project -> Study, with the intro question up front.
  const picked = pool
    .slice(0, intro ? count - 1 : count)
    .sort((a, b) => a.id - b.id);

  return intro ? [intro, ...picked] : picked;
}

// Level comes from the login password; ?level= is accepted for direct testing.
function resolveLevel(query = {}) {
  return PASSWORD_LEVELS[query.password]
    || (query.level === "experienced" ? "experienced" : "fresher");
}

router.get("/hr-questions", (req, res) => {
  const level = resolveLevel(req.query);
  try {
    const raw = fs.readFileSync(path.join(dataDir, HR_BANKS[level]), "utf-8");
    res.json(pickRandom(JSON.parse(raw), HR_QUESTION_COUNT));
  } catch (err) {
    res.status(500).json({ error: "Failed to load HR questions" });
  }
});

// ── HR round: store one answer video per question ───────────────────────────
router.post("/hr-video", hrVideoUpload.single("video"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No video received." });

    const { name, email, level, questionId, questionText } = req.body;

    // Rename off the temporary name now that the fields are parsed, so the
    // file is identifiable on disk: candidate_q<question>_<timestamp>.webm
    const safeEmail = (email || "unknown").trim().replace(/[^a-zA-Z0-9@._-]/g, "_");
    const qId       = Number(questionId) || 0;
    const finalName = `${safeEmail}_q${qId}_${Date.now()}.webm`;
    fs.renameSync(path.join(hrVideoDir, req.file.filename), path.join(hrVideoDir, finalName));

    const entry = {
      name:         (name  || "").trim() || null,
      email:        (email || "unknown").trim(),
      level:        level === "experienced" ? "experienced" : "fresher",
      questionId:   Number(questionId) || null,
      questionText: questionText || null,
      filename:     finalName,
      sizeMB:       (req.file.size / 1024 / 1024).toFixed(2),
      recordedAt:   new Date().toISOString(),
    };

    const logFile = path.join(dataDir, "hr-video-submissions.json");
    let list = [];
    try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}

    // A candidate can re-record a question — keep only the latest take and
    // delete the superseded file so the folder does not fill up.
    const idx = list.findIndex(e => e.email === entry.email && e.questionId === entry.questionId);
    if (idx >= 0) {
      const old = path.join(hrVideoDir, path.basename(list[idx].filename || ""));
      if (list[idx].filename && fs.existsSync(old)) {
        try { fs.unlinkSync(old); } catch {}
      }
      list[idx] = entry;
    } else {
      list.push(entry);
    }
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2));

    res.json({ success: true, filename: entry.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save video." });
  }
});

// ── HR round: mark the interview complete ───────────────────────────────────
router.post("/hr-submit", (req, res) => {
  try {
    const { name, email, level, attempted, total } = req.body;
    const logFile = path.join(dataDir, "hr-submissions.json");
    let list = [];
    try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
    list.push({
      name:  (name  || "").trim() || null,
      email: (email || "unknown").trim(),
      level: level === "experienced" ? "experienced" : "fresher",
      attempted: Number(attempted) || 0,
      total:     Number(total) || 0,
      submittedAt: new Date().toISOString(),
    });
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save submission." });
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

    // Persist the submission (score + answers) for later review.
    try {
      const logFile = path.join(dataDir, "aptitude-submissions.json");
      let list = [];
      try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
      list.push({
        name: name || null,
        email: email || null,
        score,
        total: questions.length,
        answers: answers || {},
        submittedAt: new Date().toISOString(),
      });
      fs.writeFileSync(logFile, JSON.stringify(list, null, 2));
    } catch (e) {
      console.error("Failed to save aptitude submission:", e.message);
    }

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

// ── Python Technical MCQ Round 2 ───────────────────────────────────────────
router.post("/python-mcq-register", upload.single("resume"), async (req, res) => {
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

    const logFile = path.join(dataDir, "python-mcq-registrations.json");
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

router.get("/python-mcq", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "python-mcq-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ answer, explanation, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load Python MCQ questions" });
  }
});

router.post("/python-mcq-submit", async (req, res) => {
  try {
    const { name, email, answers } = req.body;
    const raw = fs.readFileSync(path.join(dataDir, "python-mcq-questions.json"), "utf-8");
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

    // Persist the submission (score + answers) for later review.
    try {
      const logFile = path.join(dataDir, "python-mcq-submissions.json");
      let list = [];
      try { list = JSON.parse(fs.readFileSync(logFile, "utf-8")); } catch {}
      list.push({
        name: name || null,
        email: email || null,
        score,
        total: questions.length,
        answers: answers || {},
        submittedAt: new Date().toISOString(),
      });
      fs.writeFileSync(logFile, JSON.stringify(list, null, 2));
    } catch (e) {
      console.error("Failed to save Python MCQ submission:", e.message);
    }

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

// ── Admin: HR interview videos, grouped per candidate ───────────────────────
router.get("/admin-hr-videos", (req, res) => {
  if (req.query.pass !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "Unauthorized" });

  let videos = [];
  try { videos = JSON.parse(fs.readFileSync(path.join(dataDir, "hr-video-submissions.json"), "utf-8")); } catch {}

  let submissions = [];
  try { submissions = JSON.parse(fs.readFileSync(path.join(dataDir, "hr-submissions.json"), "utf-8")); } catch {}

  const byEmail = {};
  videos.forEach(v => {
    if (!byEmail[v.email]) {
      byEmail[v.email] = { email: v.email, name: v.name, level: v.level, answers: [] };
    }
    if (v.name && !byEmail[v.email].name) byEmail[v.email].name = v.name;
    byEmail[v.email].answers.push(v);
  });

  const candidates = Object.values(byEmail).map(c => {
    const finished = submissions.filter(s => s.email === c.email).pop() || null;
    return {
      ...c,
      answers: c.answers.sort((a, b) => (a.questionId || 0) - (b.questionId || 0)),
      completed:   !!finished,
      submittedAt: finished ? finished.submittedAt : null,
    };
  });

  res.json(candidates);
});

// ── Admin: stream or download one HR answer video ───────────────────────────
router.get("/admin-hr-video/:filename", (req, res) => {
  if (req.query.pass !== ADMIN_PASSWORD)
    return res.status(401).json({ error: "Unauthorized" });

  const safe = path.basename(req.params.filename);
  const filePath = path.join(hrVideoDir, safe);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "File not found" });

  if (req.query.download === "1") return res.download(filePath, safe);

  // sendFile honours Range requests, so the reviewer can seek inside the video.
  res.type("video/webm");
  res.sendFile(filePath);
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
