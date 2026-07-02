const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const protect = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");

const router = express.Router();
router.use(protect);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function askGemini(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// FEATURE 1: Natural Language → Structured Expense
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

// FEATURE 2: Auto Categorize
router.post("/categorize", async (req, res) => {
  const { title, note } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });

  const prompt = `
Categorize this expense into exactly one of these categories:
Food, Transport, Shopping, Entertainment, Health, Education, Bills, Travel, Other

Expense title: "${title}"
${note ? `Note: "${note}"` : ""}

Respond with ONLY the category name, nothing else.
`;
  try {
    const category = (await askGemini(prompt)).trim();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: "AI categorization failed", error: error.message });
  }
});

// FEATURE 3: Monthly AI Insights
router.get("/insights", async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    if (expenses.length === 0) {
      return res.json({
        success: true,
        insights: "No expenses recorded this month yet. Start adding expenses to get AI insights!",
      });
    }

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const breakdown = Object.entries(categoryTotals)
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(", ");

    const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

    const prompt = `
You are a personal finance advisor. Analyze this user's spending for ${monthName}:
Total Spent: ₹${total}
Number of Transactions: ${expenses.length}
Category Breakdown: ${breakdown}

Write a friendly, helpful 3-4 sentence spending insight. Include:
1. A brief summary of their spending pattern
2. Which category they spent the most on
3. One practical tip to save money
Keep it conversational. Do not use bullet points.
`;

    const insights = await askGemini(prompt);
    res.json({ success: true, insights, total, categoryTotals });
  } catch (error) {
    res.status(500).json({ message: "AI insights failed", error: error.message });
  }
});

// FEATURE 4: Smart Budget Suggestion
router.get("/budget-suggest", async (req, res) => {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await Expense.find({
      user: req.user._id,
      date: { $gte: threeMonthsAgo },
    });

    if (expenses.length === 0) {
      return res.json({
        success: true,
        suggestion: "Add at least a few expenses so I can analyze your spending and suggest a smart budget!",
        suggestedBudget: null,
      });
    }

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const avgMonthly = Math.round(total / 3);

    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const avgByCategory = Object.entries(categoryTotals)
      .map(([cat, amt]) => `${cat}: ₹${Math.round(amt / 3)}/month`)
      .join(", ");

    const prompt = `
You are a personal finance advisor. Based on this user's last 3 months of spending:
Average Monthly Spend: ₹${avgMonthly}
Category Averages: ${avgByCategory}

Give a smart budget recommendation in 2-3 sentences. Suggest a specific monthly budget amount in ₹ that is realistic but slightly lower to encourage saving. Be friendly and encouraging.
End with exactly: "Suggested Budget: ₹[amount]"
`;

    const suggestion = await askGemini(prompt);
    const match = suggestion.match(/Suggested Budget:\s*₹([\d,]+)/i);
    const suggestedBudget = match ? parseInt(match[1].replace(/,/g, "")) : avgMonthly;

    res.json({ success: true, suggestion, suggestedBudget, avgMonthly });
  } catch (error) {
    res.status(500).json({ message: "AI budget suggestion failed", error: error.message });
  }
});

module.exports = router;