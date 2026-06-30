import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import "./Charts.css";

const COLORS = ["#6c63ff", "#00d4aa", "#ff5c7c", "#ffb347", "#3ab8cb", "#6bcb3a", "#cb3a6b", "#cbcb3a", "#aaa"];

export default function Charts({ summary }) {
  if (!summary || summary.length === 0) {
    return (
      <div className="charts-empty">
        <p>📊 No data yet. Add expenses to see charts.</p>
      </div>
    );
  }

  const pieData = summary.map((s) => ({ name: s._id, value: s.total }));
  const barData = summary.map((s) => ({ name: s._id, amount: s.total }));

  return (
    <div className="charts-grid">

      <div className="chart-card">
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [`₹${v}`, "Amount"]} contentStyle={{ background: "#1a1d27", border: "1px solid #2e3250", borderRadius: 10 }} />
            <Legend formatter={(val) => <span style={{ fontSize: "0.78rem", color: "#8b90a7" }}>{val}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Amount by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8b90a7" }} />
            <YAxis tick={{ fontSize: 10, fill: "#8b90a7" }} />
            <Tooltip formatter={(v) => [`₹${v}`, "Amount"]} contentStyle={{ background: "#1a1d27", border: "1px solid #2e3250", borderRadius: 10 }} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}