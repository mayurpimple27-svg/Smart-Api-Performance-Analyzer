import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const envExamplePath = path.resolve(process.cwd(), ".env.example");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config({ path: envExamplePath });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const openaiBaseUrl =
  process.env.OPENAI_BASE_URL ||
  (model.toLowerCase().startsWith("gemini")
    ? "https://generativelanguage.googleapis.com/v1beta/openai/"
    : undefined);

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      ...(openaiBaseUrl ? { baseURL: openaiBaseUrl } : {})
    })
  : null;

function buildInsightPrompt(metrics) {
  return `You are an API performance assistant.\n\nAnalyze these metrics and return 4-6 concise bullet points.\nEach bullet should include at least one of these: observed pattern, likely cause, practical next step.\nKeep language beginner-friendly and specific to the provided numbers.\nDo not use markdown headings.\n\nMetrics:\n- URL: ${metrics.url}\n- Method: ${metrics.method}\n- Total requests: ${metrics.totalRequests}\n- Average response time (ms): ${metrics.averageResponseTimeMs}\n- Success count: ${metrics.successCount}\n- Failure count: ${metrics.failureCount}\n- Success rate (%): ${metrics.successRate}`;
}

function parseInsights(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines
    .filter(
      (line) => line.startsWith("-") || line.startsWith("*") || line.startsWith("•")
    )
    .map((line) => line.replace(/^[-*•]\s*/, ""));

  if (bullets.length > 0) {
    return bullets.slice(0, 6);
  }

  return lines.slice(0, 6);
}

async function getAIInsights(metrics) {
  if (!openai) {
    return [
      "Add OPENAI_API_KEY in backend/.env or backend/.env.example to get AI insights.",
      "Current metrics show your API behavior for this test run."
    ];
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Return only 4-6 bullet points with practical performance insights. No extra text."
        },
        {
          role: "user",
          content: buildInsightPrompt(metrics)
        }
      ],
      temperature: 0.3
    });

    const text = completion.choices?.[0]?.message?.content || "";
    const bullets = parseInsights(text);

    if (bullets.length > 0) {
      return bullets;
    }

    return ["AI could not format bullets. Please try again."];
  } catch (error) {
    return [
      "AI insight request failed.",
      `Reason: ${error.message}`
    ];
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/analyze", async (req, res) => {
  const { url, method, requestCount, postBody } = req.body;

  if (!url || !method || !requestCount) {
    return res.status(400).json({
      error: "url, method, and requestCount are required"
    });
  }

  if (!["GET", "POST"].includes(method)) {
    return res.status(400).json({ error: "method must be GET or POST" });
  }

  const parsedCount = Number(requestCount);
  if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 100) {
    return res
      .status(400)
      .json({ error: "requestCount must be an integer between 1 and 100" });
  }

  if (
    method === "POST" &&
    postBody !== undefined &&
    (typeof postBody !== "object" || postBody === null || Array.isArray(postBody))
  ) {
    return res.status(400).json({
      error: "postBody must be a JSON object when provided"
    });
  }

  let successCount = 0;
  let failureCount = 0;
  let totalResponseTime = 0;
  const bodyToSend = method === "POST" ? postBody || {} : undefined;

  for (let i = 0; i < parsedCount; i += 1) {
    const start = Date.now();

    try {
      if (method === "GET") {
        await axios.get(url, { timeout: 10000 });
      } else {
        await axios.post(url, bodyToSend, { timeout: 10000 });
      }

      successCount += 1;
    } catch (error) {
      failureCount += 1;
    } finally {
      totalResponseTime += Date.now() - start;
    }
  }

  const averageResponseTimeMs = Number((totalResponseTime / parsedCount).toFixed(2));
  const successRate = Number(((successCount / parsedCount) * 100).toFixed(2));

  const metrics = {
    url,
    method,
    totalRequests: parsedCount,
    averageResponseTimeMs,
    successCount,
    failureCount,
    successRate
  };

  const insights = await getAIInsights(metrics);

  return res.json({ metrics, insights });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
