import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ starterCode, initialCode, initialLanguage, onCodeChange, pythonOnly }) {
  const defaultLang = pythonOnly ? "python" : (initialLanguage || "java");
  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState(initialCode ?? (starterCode?.[defaultLang] || ""));
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const newCode = starterCode?.[lang] || "";
    setCode(newCode);
    onCodeChange?.(newCode, lang);
    setOutput("");
  };

  const handleCodeChange = (value) => {
    setCode(value || "");
    onCodeChange?.(value || "", language);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput("Running...");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (data.compilationError) {
        setOutput(`Compilation Error:\n${data.compilationError}`);
      } else if (data.stderr) {
        setOutput(`Error:\n${data.stderr}`);
      } else {
        setOutput(data.stdout || "(No output)");
      }
    } catch (err) {
      setOutput(`Failed to execute: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 h-9 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center gap-1">
          {!pythonOnly && (
            <button
              onClick={() => handleLanguageChange("java")}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                language === "java"
                  ? "bg-[#333] text-white font-medium"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Java
            </button>
          )}
          <button
            onClick={() => handleLanguageChange("python")}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              language === "python"
                ? "bg-[#333] text-white font-medium"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Python
          </button>
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#333] hover:bg-[#444] disabled:opacity-50 rounded transition-colors"
        >
          {running ? (
            <span className="text-gray-400">Running...</span>
          ) : (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Run
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            padding: { top: 8 },
            lineNumbersMinChars: 3,
            renderLineHighlight: "gutter",
          }}
        />
      </div>

      {/* Output */}
      <div className="border-t border-[#333] bg-[#1e1e1e]">
        <div className="px-3 h-7 flex items-center border-b border-[#333]">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Output</span>
        </div>
        <pre className="px-3 py-2 text-xs text-gray-400 font-mono whitespace-pre-wrap max-h-36 overflow-auto">
          {output || "Run your code to see output"}
        </pre>
      </div>
    </div>
  );
}
