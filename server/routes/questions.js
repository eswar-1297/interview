const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const dataDir = path.join(__dirname, "..", "data");

const VALID_PASSWORD = "Neutara@2026";

router.post("/login", (req, res) => {
  const { name, password } = req.body;
  if (name && name.trim() && password === VALID_PASSWORD) {
    res.json({ success: true, user: { name: name.trim() } });
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

module.exports = router;
