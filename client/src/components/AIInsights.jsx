import { useState } from "react";
import api from "../api/axios";
import "./AIInsights.css";

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [budgetSuggest, setBudgetSuggest] = useState(null);
  const [activeTab, setActiveTab] = useState("insights");
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ai/insights");
      setInsights(data);
    } catch {
      setInsights({ insights: "Failed to load insights. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ai/budget-suggest");
      setBudgetSuggest(data);
    } catch {
      setBudgetSuggest({ suggestion: "Failed to load suggestions." });
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "insights" && !insights) fetchInsights();
    if (tab === "budget" && !budgetSuggest) fetchBudget();
  };

  return (
    <div className="ai-insights-card">
      <div className="ai-insights-header">
        <span className="ai-insights-icon">🧠</span>
        <h3>AI Insights</h3>
      </div>

      {/* Tabs */}
      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === "insights" ? "active" : ""}`}
          onClick={() => handleTabClick("insights")}
        >
          📊 Monthly Summary
        </button>
        <button
          className={`ai-tab ${activeTab === "budget" ? "active" : ""}`}
          onClick={() => handleTabClick("budget")}
        >
          💡 Budget Advice
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="ai-loading">
          <div className="ai-spinner" />
          <p>AI is analyzing your expenses...</p>
        </div>
      ) : activeTab === "insights" ? (
        insights ? (
          <div>
            <p className="ai-insights-text">{insights.insights}</p>
            {insights.categoryTotals && (
              <div className="ai-category-chips">
                {Object.entries(insights.categoryTotals).map(([cat, amt]) => (
                  <span key={cat} className="ai-category-chip">
                    {cat}: <strong>₹{amt}</strong>
                  </span>
                ))}
              </div>
            )}
            <button className="ai-refresh-btn" onClick={fetchInsights}>🔄 Refresh</button>
          </div>
        ) : (
          <button className="ai-generate-btn" onClick={fetchInsights}>✨ Generate Insights</button>
        )
      ) : budgetSuggest ? (
        <div>
          {budgetSuggest.suggestedBudget && (
            <div className="ai-budget-box">
              <p className="ai-budget-label">SUGGESTED MONTHLY BUDGET</p>
              <p className="ai-budget-amount">₹{budgetSuggest.suggestedBudget.toLocaleString()}</p>
              {budgetSuggest.avgMonthly && (
                <p className="ai-budget-avg">Your avg spend: ₹{budgetSuggest.avgMonthly.toLocaleString()}/month</p>
              )}
            </div>
          )}
          <p className="ai-insights-text">{budgetSuggest.suggestion}</p>
          <button className="ai-refresh-btn" onClick={fetchBudget}>🔄 Refresh</button>
        </div>
      ) : (
        <button className="ai-generate-btn" onClick={fetchBudget}>💡 Get Budget Advice</button>
      )}
    </div>
  );
}