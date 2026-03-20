const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const dataDir = path.join(__dirname, "..", "data");

router.get("/aptitude", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "aptitude-questions.json"), "utf-8");
    const questions = JSON.parse(raw).map(({ answer, ...rest }) => rest);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load aptitude questions" });
  }
});

router.get("/aptitude/answers", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "aptitude-questions.json"), "utf-8");
    const questions = JSON.parse(raw);
    const answers = {};
    questions.forEach((q) => {
      answers[q.id] = q.answer;
    });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: "Failed to load answers" });
  }
});

router.get("/coding", (_req, res) => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, "coding-questions.json"), "utf-8");
    const questions = JSON.parse(raw);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load coding questions" });
  }
});

module.exports = router;
