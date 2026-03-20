const express = require("express");
const router = express.Router();

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_VERSIONS = {
  java: "15.0.2",
  python: "3.10.0",
};

router.post("/execute", async (req, res) => {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "language and code are required" });
  }

  const version = LANGUAGE_VERSIONS[language];
  if (!version) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  try {
    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version,
        files: [{ name: language === "java" ? "Main.java" : "main.py", content: code }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: "Piston API error", details: text });
    }

    const data = await response.json();
    res.json({
      stdout: data.run?.stdout || "",
      stderr: data.run?.stderr || "",
      exitCode: data.run?.code ?? -1,
      compilationError: data.compile?.stderr || "",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to execute code", details: err.message });
  }
});

module.exports = router;
