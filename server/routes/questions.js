const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const dataDir = path.join(__dirname, "..", "data");

const VALID_PASSWORD = "Uniquehire@2026";

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email && email.trim() && password === VALID_PASSWORD) {
    res.json({ success: true, user: { email: email.trim() } });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
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

module.exports = router;
