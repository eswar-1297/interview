const express = require("express");
const cors = require("cors");
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
