const express = require("express");
const Expense = require("../models/Expense");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All routes protected
router.use(protect);

// GET /api/expenses - get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ expenses, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/expenses - add new expense
router.post("/", async (req, res) => {
  const { title, amount, category, date, note } = req.body;
  try {
    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category: category || "Other",
      date: date || Date.now(),
      note,
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/expenses/stats/summary - category-wise totals for charts
router.get("/stats/summary", async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/expenses/:id - update expense
router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const updated = await Expense.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/expenses/:id - delete expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await expense.deleteOne();
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;