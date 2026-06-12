const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Local code runner. Executes candidate code on this machine using the
// installed Java (javac/java) and Python runtimes, feeding the provided
// stdin and capturing stdout/stderr. Each run is sandboxed to a throwaway
// temp directory and killed after RUN_TIMEOUT_MS.
const RUN_TIMEOUT_MS = 10000;
const MAX_OUTPUT = 64 * 1024; // cap captured output to 64 KB

// Resolve the python launcher once (Windows commonly exposes "py").
const PYTHON_CMD = process.platform === "win32" ? "py" : "python3";

function runProcess(cmd, args, { cwd, input }) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cmd, args, { cwd, windowsHide: true });
    } catch (err) {
      return resolve({ error: `${cmd} not available: ${err.message}` });
    }

    let stdout = "";
    let stderr = "";
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
    }, RUN_TIMEOUT_MS);

    child.stdout.on("data", (d) => {
      if (stdout.length < MAX_OUTPUT) stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      if (stderr.length < MAX_OUTPUT) stderr += d.toString();
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ error: `Failed to run ${cmd}: ${err.message}` });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (killed) {
        stderr += `\n[Execution timed out after ${RUN_TIMEOUT_MS / 1000}s]`;
      }
      resolve({ stdout, stderr, code });
    });

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

router.post("/execute", async (req, res) => {
  const { language, code, stdin } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "language and code are required" });
  }

  const input = typeof stdin === "string" ? stdin : "";
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "coderun-"));

  try {
    if (language === "python") {
      const file = path.join(tmpDir, "main.py");
      fs.writeFileSync(file, code);
      const run = await runProcess(PYTHON_CMD, [file], { cwd: tmpDir, input });
      if (run.error) return res.status(500).json({ error: run.error });
      return res.json({
        stdout: run.stdout || "",
        stderr: run.stderr || "",
        exitCode: run.code ?? -1,
        compilationError: "",
      });
    }

    if (language === "java") {
      const file = path.join(tmpDir, "Main.java");
      fs.writeFileSync(file, code);

      const compile = await runProcess("javac", ["Main.java"], { cwd: tmpDir, input: "" });
      if (compile.error) return res.status(500).json({ error: compile.error });
      if (compile.code !== 0) {
        return res.json({
          stdout: "",
          stderr: "",
          exitCode: compile.code ?? -1,
          compilationError: compile.stderr || "Compilation failed.",
        });
      }

      const run = await runProcess("java", ["Main"], { cwd: tmpDir, input });
      if (run.error) return res.status(500).json({ error: run.error });
      return res.json({
        stdout: run.stdout || "",
        stderr: run.stderr || "",
        exitCode: run.code ?? -1,
        compilationError: "",
      });
    }

    return res.status(400).json({ error: `Unsupported language: ${language}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to execute code", details: err.message });
  } finally {
    fs.rm(tmpDir, { recursive: true, force: true }, () => {});
  }
});

module.exports = router;
