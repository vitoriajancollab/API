import express from "express";
// Vercel Speed Insights - see src/speed-insights.ts for usage
// Note: Speed Insights is designed for frontend apps. This API returns JSON,
// so Speed Insights won't provide metrics unless you serve HTML pages.
// Uncomment the line below if you add HTML routes:
// import { speedInsightsMiddleware } from "./speed-insights";

const app = express();

app.use(express.json());

// Uncomment to enable Speed Insights for HTML responses:
// app.use(speedInsightsMiddleware);

app.get("/", (req, res) => {
  res.json({
    message: "API Pinturas do Lar funcionando"
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});