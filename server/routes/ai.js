const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function askGemini(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// POST /api/ai/parse - Natural Language to structured expense
router.post("/parse", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });

  const today = new Date().toISOString().split("T")[0];

  const prompt = `
You are an expense parser. Extract expense details from this natural language text.
Today's date is ${today}.

Text: "${text}"

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "title": "short expense title",
  "amount": number,
  "category": one of ["Food","Transport","Shopping","Entertainment","Health","Education","Bills","Travel","Other"],
  "date": "YYYY-MM-DD",
  "note": "any extra info or empty string"
}

Rules:
- If amount is not mentioned, set amount to 0
- If date is not clear, use today's date (${today})
- title should be concise (max 5 words)
`;

  try {
    const raw = await askGemini(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ message: "AI parsing failed", error: error.message });
  }
});

module.exports = router;