import { useState } from "react";
import api from "../api/axios";
import "./AIExpenseInput.css";

const EXAMPLES = [
  "spent 500 on Zomato yesterday",
  "paid 1200 electricity bill today",
  "movie tickets 800 last Sunday",
  "bought medicines for 350",
];

export default function AIExpenseInput({ onExpenseAdded }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setParsed(null);
    try {
      const { data } = await api.post("/ai/parse", { text });
      setParsed(data.data);
    } catch {
      setError("Could not parse. Try being more specific.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);
    try {
      await api.post("/expenses", { ...parsed, aiGenerated: true });
      onExpenseAdded();
      setText("");
      setParsed(null);
    } catch {
      setError("Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-input-card">
      <div className="ai-input-header">
        <span className="ai-icon">🤖</span>
        <div>
          <h3>AI Expense Entry</h3>
          <p>Just type naturally — AI will parse it for you</p>
        </div>
      </div>

      <div className="ai-input-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleParse()}
          placeholder='e.g. "spent 500 on Zomato yesterday"'
          className="ai-input"
        />
        <button className="ai-parse-btn" onClick={handleParse} disabled={loading}>
          {loading ? "Parsing..." : "✨ Parse"}
        </button>
      </div>

      {/* Example chips */}
      <div className="ai-examples">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="ai-example-chip" onClick={() => setText(ex)}>
            {ex}
          </button>
        ))}
      </div>

      {error && <p className="ai-error">{error}</p>}

      {/* Parsed Result */}
      {parsed && (
        <div className="ai-parsed-result">
          <p className="ai-parsed-label">✅ AI Parsed — confirm to save</p>
          <div className="ai-parsed-grid">
            <div><span className="ai-parsed-key">Title</span><p className="ai-parsed-value">{parsed.title}</p></div>
            <div><span className="ai-parsed-key">Amount</span><p className="ai-parsed-value">₹{parsed.amount}</p></div>
            <div><span className="ai-parsed-key">Category</span><p className="ai-parsed-value">{parsed.category}</p></div>
            <div><span className="ai-parsed-key">Date</span><p className="ai-parsed-value">{parsed.date}</p></div>
          </div>
          {parsed.note && <p className="ai-parsed-note">Note: {parsed.note}</p>}
          <div className="ai-parsed-actions">
            <button className="ai-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Expense"}
            </button>
            <button className="ai-discard-btn" onClick={() => setParsed(null)}>
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}