import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Charts from "../components/Charts";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: "", note: "" });
  const [loading, setLoading] = useState(false);

  const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Health", "Education", "Bills", "Travel", "Other"];

  const fetchExpenses = async () => {
    try {
      const { data } = await api.get("/expenses");
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSummary = async () => {
    try {
      const { data } = await api.get("/expenses/stats/summary");
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/expenses", { ...form, amount: parseFloat(form.amount) });
      setForm({ title: "", amount: "", category: "Food", date: "", note: "" });
      setShowForm(false);
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
      fetchSummary();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const categoryEmoji = (cat) => {
    const map = { Food: "🍔", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬", Health: "💊", Education: "📚", Bills: "📄", Travel: "✈️", Other: "💼" };
    return map[cat] || "💼";
  };

  return (
    <div className="dashboard">

      {/* Navbar */}
      <nav className="navbar">
        <h1 className="nav-logo">💸 SpendSense</h1>
        <div className="nav-right">
          <span className="nav-user">👤 {user?.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Spent</p>
            <h2 className="stat-value">₹{total.toLocaleString()}</h2>
          </div>
          <div className="stat-card">
            <p className="stat-label">Transactions</p>
            <h2 className="stat-value">{expenses.length}</h2>
          </div>
          <div className="stat-card">
            <p className="stat-label">This Month</p>
            <h2 className="stat-value">
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </h2>
          </div>
        </div>

        {/* Charts */}
        <Charts summary={summary} />

        {/* Add Expense Button */}
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Add Expense"}
        </button>

        {/* Add Expense Form */}
        {showForm && (
          <div className="expense-form-card">
            <h3>Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="expense-form">
              <div className="form-row">
                <div>
                  <label>Title</label>
                  <input
                    placeholder="e.g. Lunch at Cafe"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label>Note (optional)</label>
                <input
                  placeholder="Any extra info..."
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>
        )}

        {/* Expense List */}
        <div className="expense-list">
          <h3>Recent Expenses</h3>
          {expenses.length === 0 ? (
            <div className="empty-state">
              <p>🧾 No expenses yet. Add one above!</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} className="expense-item">
                <div className="expense-left">
                  <span className="expense-emoji">{categoryEmoji(exp.category)}</span>
                  <div>
                    <p className="expense-title">{exp.title}</p>
                    <div className="expense-meta">
                      <span className={`badge badge-${exp.category}`}>{exp.category}</span>
                      <span className="expense-date">
                        {new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="expense-right">
                  <span className="expense-amount">₹{exp.amount.toLocaleString()}</span>
                  <button className="delete-btn" onClick={() => handleDelete(exp._id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}