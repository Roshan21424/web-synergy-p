import React, { useEffect, useState } from "react";
import { useMyContext } from "../context/ContextProvider";
import api from "../service/api";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { jwtToken, setJwtToken } = useMyContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      if (response.status === 200 && response.data.jwtToken) {
        const decodedToken = jwtDecode(response.data.jwtToken);
        const user = {
          username: decodedToken.sub,
          roles: decodedToken.roles ? decodedToken.roles.split(",") : [],
        };
        sessionStorage.setItem("USER", JSON.stringify(user));
        sessionStorage.setItem("JWT_TOKEN", response.data.jwtToken);
        setJwtToken(response.data.jwtToken);
        navigate("/home");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.response?.data || "Invalid credentials. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwtToken) navigate("/home");
  }, [jwtToken, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-3xl text-slate-900 mb-2"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                {error}
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
                  Signing in...
                </>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;