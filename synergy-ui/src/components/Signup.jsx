import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../service/api";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.length < 3) {
      setMessage({ text: "Username must be at least 3 characters", type: "error" });
      return;
    }
    if (formData.password.length < 8) {
      setMessage({ text: "Password must be at least 8 characters", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await api.post("/auth/signup", formData);
      if (response.status === 200 || response.status === 201) {
        setMessage({ text: "Account created! Redirecting to login...", type: "success" });
        setFormData({ name: "", password: "" });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.response?.data || "Failed to create account. Please try again.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-3xl text-slate-900 mb-2"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Create account
          </h1>
          <p className="text-sm text-slate-500">Sign up to get started</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your username"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 3 characters</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 8 characters</p>
            </div>

            {message.text && (
              <div className={`px-3 py-2.5 rounded-lg text-sm border ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : "Sign up"}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}