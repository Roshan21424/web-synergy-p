import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../service/api";

export default function Signup() {
  const [formData, setFormData] = useState({ 
    name: "", 
    password: "" 
  });
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
        setMessage({ 
          text: "Account created successfully! Redirecting to login...", 
          type: "success" 
        });
        setFormData({ name: "", password: "" });
        
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message 
        || err.response?.data 
        || "Failed to create account. Please try again.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>
          <p className="text-gray-600">Sign up to get started</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 3 characters
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          ) : (
            "Sign Up"
          )}
        </button>

        {message.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === "success" 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition"
          >
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}