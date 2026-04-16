const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const dataDir = path.join(__dirname, "..", "data");

const VALID_USER = {
  email: "lalithaayyavaru21@gmail.com",
  password: "Uniquehire@2026",
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === VALID_USER.email && password === VALID_USER.password) {
    res.json({ success: true, user: { email } });
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

module.exports = router;
