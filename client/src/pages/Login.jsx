import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left Panel - Branding */}
      <div className="login-left">
        <div className="brand-logo">💸 SpendSense</div>
        <h1 className="brand-tagline">Track smarter. Spend wiser. Powered by AI.</h1>
        <p className="brand-desc">
          SpendSense helps you manage your money effortlessly — log expenses in plain English,
          get AI-powered insights, and stay on top of your budget every month.
        </p>
        <div className="brand-features">
          <div className="brand-feature">
            <span className="brand-feature-icon">🤖</span>
            Natural language expense entry
          </div>
          <div className="brand-feature">
            <span className="brand-feature-icon">📊</span>
            Visual spending breakdowns
          </div>
          <div className="brand-feature">
            <span className="brand-feature-icon">🧠</span>
            AI-generated monthly insights
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="login-right">
        <div className="login-box">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-sub">Sign in to your account to continue</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>

    </div>
  );
}