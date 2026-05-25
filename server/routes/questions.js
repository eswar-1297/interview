const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

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

const VALID_PASSWORD = "UniqueHire@2026";

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

module.exports = router;
