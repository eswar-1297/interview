const express = require("express");
const cors = require("cors");
const path = require("path");
const questionsRouter = require("./routes/questions");
const executeRouter = require("./routes/execute");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", questionsRouter);
app.use("/api", executeRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve React build in production
const clientBuild = path.join(__dirname, "..", "client", "build");
app.use(express.static(clientBuild));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
